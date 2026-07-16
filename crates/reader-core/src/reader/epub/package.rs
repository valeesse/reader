use super::{archive::*, path::*, *};
use encoding_rs::UTF_8;
use roxmltree::Document;
use std::{collections::HashMap, collections::HashSet, path::Path};
use zip::ZipArchive;

pub(super) type LoadedEpubBook = (Vec<EpubManifestItem>, EpubBookInfo, Vec<EpubPositionCount>);

pub(crate) fn load_book(path: &Path, fallback: &str) -> Result<LoadedEpubBook, ReaderError> {
    let mut archive = open_archive(path)?;
    let (opf_dir, opf_text, _) = read_opf(&mut archive)?;
    let doc = Document::parse(&opf_text).map_err(|e| ReaderError::InvalidEpub(e.to_string()))?;
    let manifest = manifest_items(&doc, &opf_dir);
    let by_id: HashMap<_, _> = manifest.iter().map(|x| (x.id.as_str(), x)).collect();
    let spine = doc
        .descendants()
        .filter(|n| n.tag_name().name() == "itemref")
        .filter_map(|n| n.attribute("idref").and_then(|id| by_id.get(id)).copied())
        .cloned()
        .collect::<Vec<_>>();
    let reading_order = spine
        .iter()
        .enumerate()
        .map(|(i, x)| {
            link(
                x,
                Some(if x.id.is_empty() {
                    format!("Chapter {}", i + 1)
                } else {
                    x.id.clone()
                }),
                vec![],
            )
        })
        .collect::<Vec<_>>();
    let reading: HashSet<_> = reading_order.iter().map(|x| x.href.clone()).collect();
    let resources = manifest
        .iter()
        .filter(|x| !reading.contains(&x.absolute_href))
        .map(|x| {
            link(
                x,
                Some(x.id.clone()),
                if x.properties.iter().any(|v| v == "cover-image") {
                    vec!["cover".into()]
                } else {
                    vec![]
                },
            )
        })
        .collect();
    let toc = toc_links(&mut archive, &manifest, &opf_dir)?;
    let metadata = EpubMetadataInfo {
        title: first_text(&doc, "title").unwrap_or_else(|| fallback.into()),
        author: first_text(&doc, "creator"),
        language: first_text(&doc, "language").unwrap_or_else(|| "zh".into()),
        layout: if doc.descendants().any(|n| {
            n.tag_name().name() == "meta"
                && n.attribute("property") == Some("rendition:layout")
                && n.text().is_some_and(|v| v.trim() == "pre-paginated")
        }) {
            "fixed".into()
        } else {
            "reflowable".into()
        },
        reading_progression: if doc.descendants().any(|n| {
            n.tag_name().name() == "spine"
                && n.attribute("page-progression-direction") == Some("rtl")
        }) {
            "rtl".into()
        } else {
            "ltr".into()
        },
    };
    Ok((
        manifest,
        EpubBookInfo {
            metadata,
            reading_order,
            resources,
            toc,
        },
        Vec::new(),
    ))
}

pub(super) fn count_position_units(bytes: &[u8]) -> usize {
    let text = UTF_8.decode(bytes).0;
    let mut count = 0usize;
    let mut in_tag = false;
    let mut in_entity = false;
    for character in text.chars() {
        match character {
            '<' => in_tag = true,
            '>' => in_tag = false,
            '&' if !in_tag => in_entity = true,
            ';' if in_entity => {
                in_entity = false;
                count += 1;
            }
            _ if !in_tag && !in_entity && !character.is_whitespace() => count += 1,
            _ => {}
        }
    }
    count.div_ceil(1024).max(1)
}

fn manifest_items(d: &Document, base: &str) -> Vec<EpubManifestItem> {
    d.descendants()
        .filter(|n| n.tag_name().name() == "item")
        .map(|n| {
            let href = n.attribute("href").unwrap_or_default();
            EpubManifestItem {
                id: n.attribute("id").unwrap_or(href).into(),
                absolute_href: resolve(base, href),
                media_type: n
                    .attribute("media-type")
                    .map(str::to_string)
                    .unwrap_or_else(|| mime(href)),
                properties: n
                    .attribute("properties")
                    .unwrap_or_default()
                    .split_whitespace()
                    .map(str::to_string)
                    .collect(),
            }
        })
        .collect()
}

fn link(x: &EpubManifestItem, title: Option<String>, rels: Vec<String>) -> EpubLinkInfo {
    EpubLinkInfo {
        href: x.absolute_href.clone(),
        media_type: x.media_type.clone(),
        title,
        rels,
        properties: x.properties.clone(),
    }
}

fn toc_links(
    a: &mut ZipArchive<std::fs::File>,
    m: &[EpubManifestItem],
    base: &str,
) -> Result<Vec<EpubLinkInfo>, ReaderError> {
    if let Some(nav) = m.iter().find(|x| x.properties.iter().any(|v| v == "nav"))
        && let Ok(text) = read_text(a, &nav.absolute_href)
        && let Ok(doc) = Document::parse(&text)
        && let Some(node) = doc.descendants().find(|n| {
            n.tag_name().name() == "nav"
                && (n.attribute("type") == Some("toc")
                    || n.attribute(("http://www.idpf.org/2007/ops", "type")) == Some("toc"))
        })
    {
        return Ok(node
            .descendants()
            .filter(|n| n.tag_name().name() == "a")
            .filter_map(|n| {
                let href = n.attribute("href")?;
                Some(EpubLinkInfo {
                    href: resolve(&dirname(&nav.absolute_href), href),
                    media_type: mime(href),
                    title: n.text().map(|v| v.trim().into()),
                    rels: vec![],
                    properties: vec![],
                })
            })
            .collect());
    }
    if let Some(ncx) = m
        .iter()
        .find(|x| x.media_type == "application/x-dtbncx+xml")
        && let Ok(text) = read_text(a, &ncx.absolute_href)
        && let Ok(doc) = Document::parse(&text)
    {
        return Ok(doc
            .descendants()
            .filter(|n| n.tag_name().name() == "navPoint")
            .filter_map(|p| {
                let href = p
                    .descendants()
                    .find(|n| n.tag_name().name() == "content")?
                    .attribute("src")?;
                Some(EpubLinkInfo {
                    href: resolve(base, href),
                    media_type: mime(href),
                    title: p
                        .descendants()
                        .find(|n| n.tag_name().name() == "text")
                        .and_then(|n| n.text())
                        .map(|v| v.trim().into()),
                    rels: vec![],
                    properties: vec![],
                })
            })
            .collect());
    }
    Ok(vec![])
}

pub(super) fn first_text(d: &Document, tag: &str) -> Option<String> {
    d.descendants()
        .find(|n| n.tag_name().name() == tag)
        .and_then(|n| n.text())
        .map(|v| v.trim().into())
        .filter(|v: &String| !v.is_empty())
}
