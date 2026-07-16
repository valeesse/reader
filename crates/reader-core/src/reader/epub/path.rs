use percent_encoding::percent_decode_str;

pub(super) fn normalize(v: &str) -> String {
    v.replace('\\', "/")
        .split('/')
        .fold(Vec::new(), |mut p, v| {
            if v == ".." {
                p.pop();
            } else if !v.is_empty() && v != "." {
                p.push(v)
            }
            p
        })
        .join("/")
}

pub(super) fn strip_fragment(v: &str) -> String {
    v.split(['#', '?']).next().unwrap_or(v).into()
}

pub(super) fn dirname(v: &str) -> String {
    let v = normalize(v);
    v.rfind('/').map(|i| v[..i].into()).unwrap_or_default()
}

pub(super) fn resolve(base: &str, href: &str) -> String {
    if href.starts_with('#')
        || href.contains("://")
        || href.starts_with("data:")
        || href.starts_with("blob:")
    {
        href.into()
    } else {
        let href = percent_decode_str(href).decode_utf8_lossy();
        normalize(&if base.is_empty() {
            href.into_owned()
        } else {
            format!("{base}/{href}")
        })
    }
}

pub(super) fn mime(v: &str) -> String {
    match strip_fragment(v)
        .rsplit('.')
        .next()
        .unwrap_or_default()
        .to_ascii_lowercase()
        .as_str()
    {
        "xhtml" | "xml" => "application/xhtml+xml",
        "html" | "htm" => "text/html",
        "css" => "text/css",
        "jpg" | "jpeg" => "image/jpeg",
        "png" => "image/png",
        "gif" => "image/gif",
        "webp" => "image/webp",
        "svg" => "image/svg+xml",
        "otf" => "font/otf",
        "ttf" => "font/ttf",
        "woff" => "font/woff",
        "woff2" => "font/woff2",
        "ncx" => "application/x-dtbncx+xml",
        "js" => "application/javascript",
        "json" => "application/json",
        _ => "application/octet-stream",
    }
    .into()
}

pub(super) fn is_text(v: &str) -> bool {
    v.starts_with("text/")
        || matches!(
            v,
            "application/xhtml+xml"
                | "application/xml"
                | "application/x-dtbncx+xml"
                | "application/javascript"
                | "application/json"
                | "image/svg+xml"
        )
}
