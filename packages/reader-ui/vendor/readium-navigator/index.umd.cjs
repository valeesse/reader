(function(y,Se){typeof exports=="object"&&typeof module<"u"?Se(exports):typeof define=="function"&&define.amd?define(["exports"],Se):(y=typeof globalThis<"u"?globalThis:y||self,Se(y.navigator={}))})(this,(function(y){"use strict";var le;const R=class R{constructor(e){this.uri=e}static deserialize(e){if(!(!e||typeof e!="string"))return new R(e)}serialize(){return this.uri}get isWCAGLevelA(){return this===R.EPUB_A11Y_10_WCAG_20_A||this===R.EPUB_A11Y_11_WCAG_20_A||this===R.EPUB_A11Y_11_WCAG_21_A||this===R.EPUB_A11Y_11_WCAG_22_A}get isWCAGLevelAA(){return this===R.EPUB_A11Y_10_WCAG_20_AA||this===R.EPUB_A11Y_11_WCAG_20_AA||this===R.EPUB_A11Y_11_WCAG_21_AA||this===R.EPUB_A11Y_11_WCAG_22_AA}get isWCAGLevelAAA(){return this===R.EPUB_A11Y_10_WCAG_20_AAA||this===R.EPUB_A11Y_11_WCAG_20_AAA||this===R.EPUB_A11Y_11_WCAG_21_AAA||this===R.EPUB_A11Y_11_WCAG_22_AAA}};R.EPUB_A11Y_10_WCAG_20_A=new R("http://www.idpf.org/epub/a11y/accessibility-20170105.html#wcag-a"),R.EPUB_A11Y_10_WCAG_20_AA=new R("http://www.idpf.org/epub/a11y/accessibility-20170105.html#wcag-aa"),R.EPUB_A11Y_10_WCAG_20_AAA=new R("http://www.idpf.org/epub/a11y/accessibility-20170105.html#wcag-aaa"),R.EPUB_A11Y_11_WCAG_20_A=new R("https://www.w3.org/TR/epub-a11y-11#wcag-2.0-a"),R.EPUB_A11Y_11_WCAG_20_AA=new R("https://www.w3.org/TR/epub-a11y-11#wcag-2.0-aa"),R.EPUB_A11Y_11_WCAG_20_AAA=new R("https://www.w3.org/TR/epub-a11y-11#wcag-2.0-aaa"),R.EPUB_A11Y_11_WCAG_21_A=new R("https://www.w3.org/TR/epub-a11y-11#wcag-2.1-a"),R.EPUB_A11Y_11_WCAG_21_AA=new R("https://www.w3.org/TR/epub-a11y-11#wcag-2.1-aa"),R.EPUB_A11Y_11_WCAG_21_AAA=new R("https://www.w3.org/TR/epub-a11y-11#wcag-2.1-aaa"),R.EPUB_A11Y_11_WCAG_22_A=new R("https://www.w3.org/TR/epub-a11y-11#wcag-2.2-a"),R.EPUB_A11Y_11_WCAG_22_AA=new R("https://www.w3.org/TR/epub-a11y-11#wcag-2.2-aa"),R.EPUB_A11Y_11_WCAG_22_AAA=new R("https://www.w3.org/TR/epub-a11y-11#wcag-2.2-aaa");let Se=R;const z=class z{constructor(e){this.value=e}static deserialize(e){if(!(!e||typeof e!="string"))return new z(e)}serialize(){return this.value}};z.AUDITORY=new z("auditory"),z.CHART_ON_VISUAL=new z("chartOnVisual"),z.CHEM_ON_VISUAL=new z("chemOnVisual"),z.COLOR_DEPENDENT=new z("colorDependent"),z.DIAGRAM_ON_VISUAL=new z("diagramOnVisual"),z.MATH_ON_VISUAL=new z("mathOnVisual"),z.MUSIC_ON_VISUAL=new z("musicOnVisual"),z.TACTILE=new z("tactile"),z.TEXT_ON_VISUAL=new z("textOnVisual"),z.TEXTUAL=new z("textual"),z.VISUAL=new z("visual");let Rn=z;const W=class W{constructor(e){if(typeof e=="string"){if(!W.VALID_MODES.has(e.toLowerCase()))return;this.value=e.toLowerCase()}else{const t=e.filter(n=>W.VALID_MODES.has(n.toLowerCase()));if(t.length===0)return;this.value=Array.from(new Set(t))}}static deserialize(e){if(!e)return;if(typeof e=="string")return new W(e);if(!Array.isArray(e))return;const t=e.filter(n=>n?W.VALID_MODES.has(n.toLowerCase()):!1);if(t.length!==0)return new W(t)}serialize(){return this.value}};W.VALID_MODES=new Set(["auditory","tactile","textual","visual"]),W.AUDITORY=new W("auditory"),W.TACTILE=new W("tactile"),W.TEXTUAL=new W("textual"),W.VISUAL=new W("visual");let Pn=W;const S=class S{constructor(e){this.value=e}static deserialize(e){if(!(!e||typeof e!="string"))return new S(e)}serialize(){return this.value}};S.NONE=new S("none"),S.ANNOTATIONS=new S("annotations"),S.ARIA=new S("ARIA"),S.INDEX=new S("index"),S.PAGE_BREAK_MARKERS=new S("pageBreakMarkers"),S.PAGE_NAVIGATION=new S("pageNavigation"),S.PRINT_PAGE_NUMBERS=new S("printPageNumbers"),S.READING_ORDER=new S("readingOrder"),S.STRUCTURAL_NAVIGATION=new S("structuralNavigation"),S.TABLE_OF_CONTENTS=new S("tableOfContents"),S.TAGGED_PDF=new S("taggedPDF"),S.ALTERNATIVE_TEXT=new S("alternativeText"),S.AUDIO_DESCRIPTION=new S("audioDescription"),S.CAPTIONS=new S("captions"),S.CLOSED_CAPTIONS=new S("closedCaptions"),S.DESCRIBED_MATH=new S("describedMath"),S.LONG_DESCRIPTION=new S("longDescription"),S.OPEN_CAPTIONS=new S("openCaptions"),S.SIGN_LANGUAGE=new S("signLanguage"),S.TRANSCRIPT=new S("transcript"),S.DISPLAY_TRANSFORMABILITY=new S("displayTransformability"),S.SYNCHRONIZED_AUDIO_TEXT=new S("synchronizedAudioText"),S.TIMING_CONTROL=new S("timingControl"),S.UNLOCKED=new S("unlocked"),S.CHEM_ML=new S("ChemML"),S.LATEX=new S("latex"),S.LATEX_CHEMISTRY=new S("latex-chemistry"),S.MATH_ML=new S("MathML"),S.MATH_ML_CHEMISTRY=new S("MathML-chemistry"),S.TTS_MARKUP=new S("ttsMarkup"),S.HIGH_CONTRAST_AUDIO=new S("highContrastAudio"),S.HIGH_CONTRAST_DISPLAY=new S("highContrastDisplay"),S.LARGE_PRINT=new S("largePrint"),S.BRAILLE=new S("braille"),S.TACTILE_GRAPHIC=new S("tactileGraphic"),S.TACTILE_OBJECT=new S("tactileObject"),S.FULL_RUBY_ANNOTATIONS=new S("fullRubyAnnotations"),S.HORIZONTAL_WRITING=new S("horizontalWriting"),S.RUBY_ANNOTATIONS=new S("rubyAnnotations"),S.VERTICAL_WRITING=new S("verticalWriting"),S.WITH_ADDITIONAL_WORD_SEGMENTATION=new S("withAdditionalWordSegmentation"),S.WITHOUT_ADDITIONAL_WORD_SEGMENTATION=new S("withoutAdditionalWordSegmentation");let it=S;const L=class L{constructor(e){this.value=e}static deserialize(e){if(!(!e||typeof e!="string"))return new L(e)}serialize(){return this.value}};L.FLASHING=new L("flashing"),L.NO_FLASHING_HAZARD=new L("noFlashingHazard"),L.UNKNOWN_FLASHING_HAZARD=new L("unknownFlashingHazard"),L.MOTION_SIMULATION=new L("motionSimulation"),L.NO_MOTION_SIMULATION_HAZARD=new L("noMotionSimulationHazard"),L.UNKNOWN_MOTION_SIMULATION_HAZARD=new L("unknownMotionSimulationHazard"),L.SOUND=new L("sound"),L.NO_SOUND_HAZARD=new L("noSoundHazard"),L.UNKNOWN_SOUND_HAZARD=new L("unknownSoundHazard"),L.UNKNOWN=new L("unknown"),L.NONE=new L("none");let Cn=L;const O=class O{constructor(e){this.value=e}static deserialize(e){if(!(!e||typeof e!="string"))return new O(e)}serialize(){return this.value}};O.NONE=new O("none"),O.DOCUMENTED=new O("documented"),O.LEGAL=new O("legal"),O.TEMPORARY=new O("temporary"),O.TECHNICAL=new O("technical"),O.EAA_DISPROPORTIONATE_BURDEN=new O("eaa-disproportionate-burden"),O.EAA_FUNDAMENTAL_ALTERATION=new O("eaa-fundamental-alteration"),O.EAA_MICROENTERPRISE=new O("eaa-microenterprise"),O.EAA_TECHNICAL_IMPOSSIBILITY=new O("eaa-technical-impossibility"),O.EAA_TEMPORARY=new O("eaa-temporary");let kn=O;const En=["en","ar","da","fr","it","pt_PT","sv"],fo={publication:JSON.parse(`{"format":{"audiobook":"Audiobook","audiobookJSON":"Audiobook Manifest","cbz":"Comic Book Archive","divina":"Divina Publication","divinaJSON":"Divina Publication Manifest","epub":"EPUB","lcpa":"LCP Protected Audiobook","lcpdf":"LCP Protected PDF","lcpl":"LCP License Document","pdf":"PDF","rwp":"Readium Web Publication","rwpm":"Readium Web Publication Manifest","zab":"Audiobook Archive","zip":"ZIP Archive"},"kind":{"audiobook_one":"audiobook","audiobook_other":"audiobooks","book_one":"book","book_other":"books","comic_one":"comic","comic_other":"comics","document_one":"document","document_other":"documents"},"metadata":{"accessibility":{"display-guide":{"accessibility-summary":{"no-metadata":"No information is available","publisher-contact":"For more information about the accessibility of this product, please contact the publisher: ","title":"Accessibility summary"},"additional-accessibility-information":{"aria":{"compact":"ARIA roles included","descriptive":"Content is enhanced with ARIA roles to optimize organization and facilitate navigation"},"audio-descriptions":"Audio descriptions","braille":"Braille","color-not-sole-means-of-conveying-information":"Color is not the sole means of conveying information","dyslexia-readability":"Dyslexia readability","full-ruby-annotations":"Full ruby annotations","high-contrast-between-foreground-and-background-audio":"High contrast between foreground and background audio","high-contrast-between-text-and-background":"High contrast between foreground text and background","large-print":"Large print","page-breaks":{"compact":"Page breaks included","descriptive":"Page breaks included from the original print source"},"ruby-annotations":"Some Ruby annotations","sign-language":"Sign language","tactile-graphics":{"compact":"Tactile graphics included","descriptive":"Tactile graphics have been integrated to facilitate access to visual elements for blind people"},"tactile-objects":"Tactile 3D objects","text-to-speech-hinting":"Text-to-speech hinting provided","title":"Additional accessibility information","ultra-high-contrast-between-text-and-background":"Ultra high contrast between text and background","visible-page-numbering":"Visible page numbering","without-background-sounds":"Without background sounds"},"conformance":{"a":{"compact":"This publication meets minimum accessibility standards","descriptive":"The publication contains a conformance statement that it meets the EPUB Accessibility and WCAG 2 Level A standard"},"aa":{"compact":"This publication meets accepted accessibility standards","descriptive":"The publication contains a conformance statement that it meets the EPUB Accessibility and WCAG 2 Level AA standard"},"aaa":{"compact":"This publication exceeds accepted accessibility standards","descriptive":"The publication contains a conformance statement that it meets the EPUB Accessibility and WCAG 2 Level AAA standard"},"certifier":"The publication was certified by ","certifier-credentials":"The certifier's credential is ","details":{"certification-info":"The publication was certified on ","certifier-report":"For more information refer to the certifier's report","claim":"This publication claims to meet","epub-accessibility-1-0":"EPUB Accessibility 1.0","epub-accessibility-1-1":"EPUB Accessibility 1.1","level-a":"Level A","level-aa":"Level AA","level-aaa":"Level AAA","wcag-2-0":{"compact":"WCAG 2.0","descriptive":"Web Content Accessibility Guidelines (WCAG) 2.0"},"wcag-2-1":{"compact":"WCAG 2.1","descriptive":"Web Content Accessibility Guidelines (WCAG) 2.1"},"wcag-2-2":{"compact":"WCAG 2.2","descriptive":"Web Content Accessibility Guidelines (WCAG) 2.2"}},"details-title":"Detailed conformance information","no":"No information is available","title":"Conformance","unknown-standard":"Conformance to accepted standards for accessibility of this publication cannot be determined"},"hazards":{"flashing":{"compact":"Flashing content","descriptive":"The publication contains flashing content that can cause photosensitive seizures"},"flashing-none":{"compact":"No flashing hazards","descriptive":"The publication does not contain flashing content that can cause photosensitive seizures"},"flashing-unknown":{"compact":"Flashing hazards not known","descriptive":"The presence of flashing content that can cause photosensitive seizures could not be determined"},"motion":{"compact":"Motion simulation","descriptive":"The publication contains motion simulations that can cause motion sickness"},"motion-none":{"compact":"No motion simulation hazards","descriptive":"The publication does not contain motion simulations that can cause motion sickness"},"motion-unknown":{"compact":"Motion simulation hazards not known","descriptive":"The presence of motion simulations that can cause motion sickness could not be determined"},"no-metadata":"No information is available","none":{"compact":"No hazards","descriptive":"The publication contains no hazards"},"sound":{"compact":"Sounds","descriptive":"The publication contains sounds that can cause sensitivity issues"},"sound-none":{"compact":"No sound hazards","descriptive":"The publication does not contain sounds that can cause sensitivity issues"},"sound-unknown":{"compact":"Sound hazards not known","descriptive":"The presence of sounds that can cause sensitivity issues could not be determined"},"title":"Hazards","unknown":"The presence of hazards is unknown"},"legal-considerations":{"exempt":{"compact":"Claims an accessibility exemption in some jurisdictions","descriptive":"This publication claims an accessibility exemption in some jurisdictions"},"no-metadata":"No information is available","title":"Legal considerations"},"navigation":{"index":{"compact":"Index","descriptive":"Index with links to referenced entries"},"no-metadata":"No information is available","page-navigation":{"compact":"Go to page","descriptive":"Page list to go to pages from the print source version"},"structural":{"compact":"Headings","descriptive":"Elements such as headings, tables, etc for structured navigation"},"title":"Navigation","toc":{"compact":"Table of contents","descriptive":"Table of contents to all chapters of the text via links"}},"rich-content":{"accessible-chemistry-as-latex":{"compact":"Chemical formulas in LaTeX","descriptive":"Chemical formulas in accessible format (LaTeX)"},"accessible-chemistry-as-mathml":{"compact":"Chemical formulas in MathML","descriptive":"Chemical formulas in accessible format (MathML)"},"accessible-math-as-latex":{"compact":"Math as LaTeX","descriptive":"Math formulas in accessible format (LaTeX)"},"accessible-math-described":"Text descriptions of math are provided","closed-captions":{"compact":"Videos have closed captions","descriptive":"Videos included in publications have closed captions"},"extended-descriptions":"Information-rich images are described by extended descriptions","math-as-mathml":{"compact":"Math as MathML","descriptive":"Math formulas in accessible format (MathML)"},"open-captions":{"compact":"Videos have open captions","descriptive":"Videos included in publications have open captions"},"title":"Rich content","transcript":"Transcript(s) provided","unknown":"No information is available"},"ways-of-reading":{"nonvisual-reading":{"alt-text":{"compact":"Has alternative text","descriptive":"Has alternative text descriptions for images"},"no-metadata":"No information about nonvisual reading is available","none":{"compact":"Not readable in read aloud or dynamic braille","descriptive":"The content is not readable as read aloud speech or dynamic braille"},"not-fully":{"compact":"Not fully readable in read aloud or dynamic braille","descriptive":"Not all of the content will be readable as read aloud speech or dynamic braille"},"readable":{"compact":"Readable in read aloud or dynamic braille","descriptive":"All content can be read as read aloud speech or dynamic braille"}},"prerecorded-audio":{"complementary":{"compact":"Prerecorded audio clips","descriptive":"Prerecorded audio clips are embedded in the content"},"no-metadata":"No information about prerecorded audio is available","only":{"compact":"Prerecorded audio only","descriptive":"Audiobook with no text alternative"},"synchronized":{"compact":"Prerecorded audio synchronized with text","descriptive":"All the content is available as prerecorded audio synchronized with text"}},"title":"Ways of reading","visual-adjustments":{"modifiable":{"compact":"Appearance can be modified","descriptive":"Appearance of the text and page layout can be modified according to the capabilities of the reading system (font family and font size, spaces between paragraphs, sentences, words, and letters, as well as color of background and text)"},"unknown":"No information about appearance modifiability is available","unmodifiable":{"compact":"Appearance cannot be modified","descriptive":"Text and page layout cannot be modified as the reading experience is close to a print version, but reading systems can still provide zooming options"}}}}},"altIdentifier_one":"alternate identifier","altIdentifier_other":"alternate identifiers","artist_one":"artist","artist_other":"artists","author_one":"author","author_other":"authors","collection_one":"editorial collection","collection_other":"editorial collections","colorist_one":"colorist","colorist_other":"colorists","contributor_one":"contributor","contributor_other":"contributors","description":"description","duration":"duration","editor_one":"editor","editor_other":"editors","identifier_one":"identifier","identifier_other":"identifiers","illustrator_one":"illustrator","illustrator_other":"illustrators","imprint_one":"imprint","imprint_other":"imprints","inker_one":"inker","inker_other":"inkers","language_one":"language","language_other":"languages","letterer_one":"letterer","letterer_other":"letterers","modified":"modification date","narrator_one":"narrator","narrator_other":"narrators","numberOfPages":"print length","penciler_one":"penciler","penciler_other":"pencilers","published":"publication date","publisher_one":"publisher","publisher_other":"publishers","series_one":"series","series_other":"series","subject_one":"subject","subject_other":"subjects","subtitle":"subtitle","title":"title","translator_one":"translator","translator_other":"translators"}}`)},xn={fr:()=>Promise.resolve().then(()=>da),ar:()=>Promise.resolve().then(()=>ua),da:()=>Promise.resolve().then(()=>ma),it:()=>Promise.resolve().then(()=>pa),pt_PT:()=>Promise.resolve().then(()=>ga),sv:()=>Promise.resolve().then(()=>fa)},Fn=fo?.publication?.metadata?.accessibility?.["display-guide"]||{};class _e{constructor(){this.currentLocaleCode="en",this.locale=Fn,this.loadedLocales={},this.loadedLocales.en=Fn}static getInstance(){return _e.instance||(_e.instance=new _e),_e.instance}async loadLocale(e){if(!En.includes(e))return console.warn(`Locale '${e}' is not enabled`),!1;if(e in this.loadedLocales)return!0;try{if(!(e in xn))return console.warn(`Locale file not found for: ${e}`),!1;const i=(await xn[e]()).default?.publication?.metadata?.accessibility?.["display-guide"];return i?(this.loadedLocales[e]=i,!0):(console.warn(`No accessibility strings found in locale ${e}`),!1)}catch(t){return console.warn(`Failed to load locale ${e}:`,t),!1}}registerLocale(e,t){if(!e||typeof e!="string")throw new Error("Locale code must be a non-empty string");this.loadedLocales[e]=t}async setLocale(e){return e in this.loadedLocales||await this.loadLocale(e),e in this.loadedLocales?(this.locale=this.loadedLocales[e],this.currentLocaleCode=e,!0):(console.warn(`Locale '${e}' is not available`),!1)}getCurrentLocale(){return this.currentLocaleCode}getAvailableLocales(){return En}getNestedValue(e,t){const n=t.split(".");let i=e;for(const o of n){if(i==null)return;i=i[o]}return i}getString(e){let t=this.getNestedValue(this.locale,e);return t===void 0&&this.currentLocaleCode!=="en"&&(t=this.getNestedValue(this.loadedLocales.en,e)),t!==void 0?typeof t=="string"?{compact:t,descriptive:t}:t:(console.warn(`Missing localization for key: ${e}`),{compact:"",descriptive:""})}}_e.getInstance();var b=(r=>(r.reflowable="reflowable",r.fixed="fixed",r.scrolled="scrolled",r))(b||{});class wt{constructor(e){this.algorithm=e.algorithm,this.compression=e.compression,this.originalLength=e.originalLength,this.profile=e.profile,this.scheme=e.scheme}static deserialize(e){if(e&&e.algorithm)return new wt({algorithm:e.algorithm,compression:e.compression,originalLength:e.originalLength,profile:e.profile,scheme:e.scheme})}serialize(){const e={algorithm:this.algorithm};return this.compression!==void 0&&(e.compression=this.compression),this.originalLength!==void 0&&(e.originalLength=this.originalLength),this.profile!==void 0&&(e.profile=this.profile),this.scheme!==void 0&&(e.scheme=this.scheme),e}}var J=(r=>(r.left="left",r.right="right",r.center="center",r))(J||{});let Z=class wn{constructor(e){this.otherProperties=e}get page(){return this.otherProperties.page}static deserialize(e){if(e)return new wn(e)}serialize(){return this.otherProperties}add(e){const t=Object.assign({},this.otherProperties);for(const n in e)t[n]=e[n];return new wn(t)}};Object.defineProperty(Z.prototype,"encryption",{get:function(){return wt.deserialize(this.otherProperties.encrypted)}});function yo(r){return r&&Array.isArray(r)?r:void 0}function zn(r){return r&&typeof r=="string"?[r]:yo(r)}function Ln(r){return typeof r=="string"?new Date(r):void 0}function ot(r){return isNaN(r)?void 0:r}function $(r){return ot(r)!==void 0&&Math.sign(r)>=0?r:void 0}function So(r){const e=new Array;return r.forEach(t=>e.push(t)),e}class f{constructor(e){let t,n,i=e.mediaType.replace(/\s/g,"").split(";");const o=i[0].split("/");if(o.length===2){if(t=o[0].toLowerCase().trim(),n=o[1].toLowerCase().trim(),t.length===0||n.length===0)throw new Error("Invalid media type")}else throw new Error("Invalid media type");const a={};for(let u=1;u<i.length;u++){const g=i[u].split("=");if(g.length===2){const m=g[0].toLocaleLowerCase(),p=m==="charset"?g[1].toUpperCase():g[1];a[m]=p}}const s={},l=Object.keys(a);l.sort((u,g)=>u.localeCompare(g)),l.forEach(u=>s[u]=a[u]);let d="";for(const u in s){const g=s[u];d+=`;${u}=${g}`}const c=`${t}/${n}${d}`,h=s.encoding;this.string=c,this.type=t,this.subtype=n,this.parameters=s,this.encoding=h,this.name=e.name,this.fileExtension=e.fileExtension}static parse(e){return new f(e)}get structuredSyntaxSuffix(){const e=this.subtype.split("+");return e.length>1?`+${e[e.length-1]}`:void 0}get charset(){return this.parameters.charset}contains(e){const t=typeof e=="string"?f.parse({mediaType:e}):e;if(!((this.type==="*"||this.type===t.type)&&(this.subtype==="*"||this.subtype===t.subtype)))return!1;const n=new Set(Object.entries(this.parameters).map(([o,a])=>`${o}=${a}`)),i=new Set(Object.entries(t.parameters).map(([o,a])=>`${o}=${a}`));for(const o of Array.from(n.values()))if(!i.has(o))return!1;return!0}matches(e){const t=typeof e=="string"?f.parse({mediaType:e}):e;return this.contains(t)||t.contains(this)}matchesAny(...e){for(const t of e)if(this.matches(t))return!0;return!1}equals(e){return this.string===e.string}get isZIP(){return this.matchesAny(f.ZIP,f.LCP_PROTECTED_AUDIOBOOK,f.LCP_PROTECTED_PDF)||this.structuredSyntaxSuffix==="+zip"}get isJSON(){return this.matchesAny(f.JSON)||this.structuredSyntaxSuffix==="+json"}get isOPDS(){return this.matchesAny(f.OPDS1,f.OPDS1_ENTRY,f.OPDS2,f.OPDS2_PUBLICATION,f.OPDS_AUTHENTICATION)||this.structuredSyntaxSuffix==="+json"}get isHTML(){return this.matchesAny(f.HTML,f.XHTML)}get isBitmap(){return this.matchesAny(f.AVIF,f.BMP,f.GIF,f.JPEG,f.PNG,f.TIFF,f.WEBP)}get isAudio(){return this.type==="audio"}get isVideo(){return this.type==="video"}get isRWPM(){return this.matchesAny(f.READIUM_AUDIOBOOK_MANIFEST,f.DIVINA_MANIFEST,f.READIUM_WEBPUB_MANIFEST)}get isPublication(){return this.matchesAny(f.READIUM_AUDIOBOOK,f.READIUM_AUDIOBOOK_MANIFEST,f.CBZ,f.DIVINA,f.DIVINA_MANIFEST,f.EPUB,f.LCP_PROTECTED_AUDIOBOOK,f.LCP_PROTECTED_PDF,f.LPF,f.PDF,f.W3C_WPUB_MANIFEST,f.READIUM_WEBPUB,f.READIUM_WEBPUB_MANIFEST,f.ZAB)}static get AAC(){return f.parse({mediaType:"audio/aac",fileExtension:"aac"})}static get ACSM(){return f.parse({mediaType:"application/vnd.adobe.adept+xml",name:"Adobe Content Server Message",fileExtension:"acsm"})}static get AIFF(){return f.parse({mediaType:"audio/aiff",fileExtension:"aiff"})}static get AVI(){return f.parse({mediaType:"video/x-msvideo",fileExtension:"avi"})}static get AVIF(){return f.parse({mediaType:"image/avif",fileExtension:"avif"})}static get BINARY(){return f.parse({mediaType:"application/octet-stream"})}static get BMP(){return f.parse({mediaType:"image/bmp",fileExtension:"bmp"})}static get CBZ(){return f.parse({mediaType:"application/vnd.comicbook+zip",name:"Comic Book Archive",fileExtension:"cbz"})}static get CSS(){return f.parse({mediaType:"text/css",fileExtension:"css"})}static get DIVINA(){return f.parse({mediaType:"application/divina+zip",name:"Digital Visual Narratives",fileExtension:"divina"})}static get DIVINA_MANIFEST(){return f.parse({mediaType:"application/divina+json",name:"Digital Visual Narratives",fileExtension:"json"})}static get EPUB(){return f.parse({mediaType:"application/epub+zip",name:"EPUB",fileExtension:"epub"})}static get GIF(){return f.parse({mediaType:"image/gif",fileExtension:"gif"})}static get GZ(){return f.parse({mediaType:"application/gzip",fileExtension:"gz"})}static get HTML(){return f.parse({mediaType:"text/html",fileExtension:"html"})}static get JAVASCRIPT(){return f.parse({mediaType:"text/javascript",fileExtension:"js"})}static get JPEG(){return f.parse({mediaType:"image/jpeg",fileExtension:"jpeg"})}static get JSON(){return f.parse({mediaType:"application/json"})}static get LCP_LICENSE_DOCUMENT(){return f.parse({mediaType:"application/vnd.readium.lcp.license.v1.0+json",name:"LCP License",fileExtension:"lcpl"})}static get LCP_PROTECTED_AUDIOBOOK(){return f.parse({mediaType:"application/audiobook+lcp",name:"LCP Protected Audiobook",fileExtension:"lcpa"})}static get LCP_PROTECTED_PDF(){return f.parse({mediaType:"application/pdf+lcp",name:"LCP Protected PDF",fileExtension:"lcpdf"})}static get LCP_STATUS_DOCUMENT(){return f.parse({mediaType:"application/vnd.readium.license.status.v1.0+json"})}static get LPF(){return f.parse({mediaType:"application/lpf+zip",fileExtension:"lpf"})}static get MP3(){return f.parse({mediaType:"audio/mpeg",fileExtension:"mp3"})}static get MPEG(){return f.parse({mediaType:"video/mpeg",fileExtension:"mpeg"})}static get NCX(){return f.parse({mediaType:"application/x-dtbncx+xml",fileExtension:"ncx"})}static get OGG(){return f.parse({mediaType:"audio/ogg",fileExtension:"oga"})}static get OGV(){return f.parse({mediaType:"video/ogg",fileExtension:"ogv"})}static get OPDS1(){return f.parse({mediaType:"application/atom+xml;profile=opds-catalog"})}static get OPDS1_ENTRY(){return f.parse({mediaType:"application/atom+xml;type=entry;profile=opds-catalog"})}static get OPDS2(){return f.parse({mediaType:"application/opds+json"})}static get OPDS2_PUBLICATION(){return f.parse({mediaType:"application/opds-publication+json"})}static get OPDS_AUTHENTICATION(){return f.parse({mediaType:"application/opds-authentication+json"})}static get OPUS(){return f.parse({mediaType:"audio/opus",fileExtension:"opus"})}static get OTF(){return f.parse({mediaType:"font/otf",fileExtension:"otf"})}static get PDF(){return f.parse({mediaType:"application/pdf",name:"PDF",fileExtension:"pdf"})}static get PNG(){return f.parse({mediaType:"image/png",fileExtension:"png"})}static get READIUM_AUDIOBOOK(){return f.parse({mediaType:"application/audiobook+zip",name:"Readium Audiobook",fileExtension:"audiobook"})}static get READIUM_AUDIOBOOK_MANIFEST(){return f.parse({mediaType:"application/audiobook+json",name:"Readium Audiobook",fileExtension:"json"})}static get READIUM_CONTENT_DOCUMENT(){return f.parse({mediaType:"application/vnd.readium.content+json",name:"Readium Content Document",fileExtension:"json"})}static get READIUM_GUIDED_NAVIGATION_DOCUMENT(){return f.parse({mediaType:"application/guided-navigation+json",name:"Readium Guided Navigation Document",fileExtension:"json"})}static get READIUM_POSITION_LIST(){return f.parse({mediaType:"application/vnd.readium.position-list+json",name:"Readium Position List",fileExtension:"json"})}static get READIUM_WEBPUB(){return f.parse({mediaType:"application/webpub+zip",name:"Readium Web Publication",fileExtension:"webpub"})}static get READIUM_WEBPUB_MANIFEST(){return f.parse({mediaType:"application/webpub+json",name:"Readium Web Publication",fileExtension:"json"})}static get SMIL(){return f.parse({mediaType:"application/smil+xml",fileExtension:"smil"})}static get SVG(){return f.parse({mediaType:"image/svg+xml",fileExtension:"svg"})}static get TEXT(){return f.parse({mediaType:"text/plain",fileExtension:"txt"})}static get TIFF(){return f.parse({mediaType:"image/tiff",fileExtension:"tiff"})}static get TTF(){return f.parse({mediaType:"font/ttf",fileExtension:"ttf"})}static get W3C_WPUB_MANIFEST(){return f.parse({mediaType:"application/x.readium.w3c.wpub+json",name:"Web Publication",fileExtension:"json"})}static get WAV(){return f.parse({mediaType:"audio/wav",fileExtension:"wav"})}static get WEBM_AUDIO(){return f.parse({mediaType:"audio/webm",fileExtension:"webm"})}static get WEBM_VIDEO(){return f.parse({mediaType:"video/webm",fileExtension:"webm"})}static get WEBP(){return f.parse({mediaType:"image/webp",fileExtension:"webp"})}static get WOFF(){return f.parse({mediaType:"font/woff",fileExtension:"woff"})}static get WOFF2(){return f.parse({mediaType:"font/woff2",fileExtension:"woff2"})}static get XHTML(){return f.parse({mediaType:"application/xhtml+xml",fileExtension:"xhtml"})}static get XML(){return f.parse({mediaType:"application/xml",fileExtension:"xml"})}static get ZAB(){return f.parse({mediaType:"application/x.readium.zab+zip",name:"Zipped Audio Book",fileExtension:"zab"})}static get ZIP(){return f.parse({mediaType:"application/zip",fileExtension:"zip"})}}class On{constructor(e){this.uri=e,this.parameters=this.getParameters(e)}getParameters(e){const t=/\{\??([^}]+)\}/g,n=e.match(t);return n?new Set(n.join(",").replace(t,"$1").split(",").map(i=>i.trim())):new Set}expand(e){const t=i=>i.split(",").map(o=>{const a=e[o];return a?encodeURIComponent(a):""}).join(","),n=i=>"?"+i.split(",").map(o=>{const a=o.split("=")[0],s=e[a];return s?`${a}=${encodeURIComponent(s)}`:""}).join("&");return this.uri.replace(/\{(\??)([^}]+)\}/g,(...i)=>i[1]?n(i[2]):t(i[2]))}}class E{constructor(e){this.fragments=e.fragments?e.fragments:new Array,this.progression=e.progression,this.totalProgression=e.totalProgression,this.position=e.position,this.otherLocations=e.otherLocations}static deserialize(e){if(!e)return;const t=ot(e.progression),n=ot(e.totalProgression),i=ot(e.position),o=new Map,a=new Set(["fragment","fragments","progression","totalProgression","position"]);return Object.entries(e).forEach(([s,l])=>{a.has(s)||o.set(s,l)}),new E({fragments:zn(e.fragments||e.fragment),progression:t!==void 0&&t>=0&&t<=1?t:void 0,totalProgression:n!==void 0&&n>=0&&n<=1?n:void 0,position:i!==void 0&&i>0?i:void 0,otherLocations:o.size===0?void 0:o})}serialize(){const e={};return this.fragments&&(e.fragments=this.fragments),this.progression!==void 0&&(e.progression=this.progression),this.totalProgression!==void 0&&(e.totalProgression=this.totalProgression),this.position!==void 0&&(e.position=this.position),this.otherLocations&&this.otherLocations.forEach((t,n)=>e[n]=t),e}}class Q{constructor(e){this.after=e.after,this.before=e.before,this.highlight=e.highlight}static deserialize(e){if(e)return new Q({after:e.after,before:e.before,highlight:e.highlight})}serialize(){const e={};return this.after!==void 0&&(e.after=this.after),this.before!==void 0&&(e.before=this.before),this.highlight!==void 0&&(e.highlight=this.highlight),e}}class N{constructor(e){this.href=e.href,this.type=e.type,this.title=e.title,this.locations=e.locations?e.locations:new E({}),this.text=e.text}static deserialize(e){if(e&&e.href&&e.type)return new N({href:e.href,type:e.type,title:e.title,locations:E.deserialize(e.locations),text:Q.deserialize(e.text)})}serialize(){const e={href:this.href,type:this.type};return this.title!==void 0&&(e.title=this.title),this.locations&&(e.locations=this.locations.serialize()),this.text&&(e.text=this.text.serialize()),e}copyWithLocations(e){return new N({href:this.href,type:this.type,title:this.title,text:this.text,locations:new E({...this.locations,...e})})}}class K{constructor(e){this.href=e.href,this.templated=e.templated,this.type=e.type,this.title=e.title,this.rels=e.rels,this.properties=e.properties,this.height=e.height,this.width=e.width,this.size=e.size,this.duration=e.duration,this.bitrate=e.bitrate,this.languages=e.languages,this.alternates=e.alternates,this.children=e.children}static deserialize(e){if(!(!e||typeof e.href!="string"))return new K({href:e.href,templated:e.templated,type:e.type,title:e.title,rels:e.rel?Array.isArray(e.rel)?new Set(e.rel):new Set([e.rel]):void 0,properties:Z.deserialize(e.properties),height:$(e.height),width:$(e.width),size:$(e.size),duration:$(e.duration),bitrate:$(e.bitrate),languages:zn(e.language),alternates:rt.deserialize(e.alternate),children:rt.deserialize(e.children)})}serialize(){const e={href:this.href};return this.templated!==void 0&&(e.templated=this.templated),this.type!==void 0&&(e.type=this.type),this.title!==void 0&&(e.title=this.title),this.rels&&(e.rel=So(this.rels)),this.properties&&(e.properties=this.properties.serialize()),this.height!==void 0&&(e.height=this.height),this.width!==void 0&&(e.width=this.width),this.size!==void 0&&(e.size=this.size),this.duration!==void 0&&(e.duration=this.duration),this.bitrate!==void 0&&(e.bitrate=this.bitrate),this.languages&&(e.language=this.languages),this.alternates&&(e.alternate=this.alternates.serialize()),this.children&&(e.children=this.children.serialize()),e}get mediaType(){return this.type!==void 0?f.parse({mediaType:this.type}):f.BINARY}toURL(e){const t=this.href.replace(/^(\/)/,"");if(t.length===0)return;let n=e||"/";return n.startsWith("/")&&(n="file://"+n),new URL(t,n).href.replace(/^(file:\/\/)/,"")}get templateParameters(){return this.templated?new On(this.href).parameters:new Set}expandTemplate(e){return new K({href:new On(this.href).expand(e),templated:!1})}addProperties(e){const t=K.deserialize(this.serialize());return t.properties=t.properties?t.properties?.add(e):new Z(e),t}get locator(){let e=this.href.split("#");return new N({href:e.length>0&&e[0]!==void 0?e[0]:this.href,type:this.type??"",title:this.title,locations:new E({fragments:e.length>1&&e[1]!==void 0?[e[1]]:[]})})}}class rt{constructor(e){this.items=e}static deserialize(e){if(e&&Array.isArray(e))return new rt(e.map(t=>K.deserialize(t)).filter(t=>t!==void 0))}serialize(){return this.items.map(e=>e.serialize())}findWithRel(e){const t=n=>n.rels&&n.rels.has(e);return this.items.find(t)}filterByRel(e){const t=n=>n.rels&&n.rels.has(e);return this.items.filter(t)}findWithHref(e){const t=n=>n.href===e;return this.items.find(t)}findIndexWithHref(e){const t=n=>n.href===e;return this.items.findIndex(t)}findWithMediaType(e){const t=n=>n.mediaType.matches(e);return this.items.find(t)}filterByMediaType(e){const t=n=>n.mediaType.matches(e);return this.items.filter(t)}filterByMediaTypes(e){const t=n=>{for(const i of e)if(n.mediaType.matches(i))return!0;return!1};return this.items.filter(t)}everyIsAudio(){const e=t=>t.mediaType.isAudio;return this.items.length>0&&this.items.every(e)}everyIsBitmap(){const e=t=>t.mediaType.isBitmap;return this.items.length>0&&this.items.every(e)}everyIsHTML(){const e=t=>t.mediaType.isHTML;return this.items.length>0&&this.items.every(e)}everyIsVideo(){const e=t=>t.mediaType.isVideo;return this.items.length>0&&this.items.every(e)}everyMatchesMediaType(e){return Array.isArray(e)?this.items.length>0&&this.items.every(t=>{for(const n of e)return t.mediaType.matches(n);return!1}):this.items.length>0&&this.items.every(t=>t.mediaType.matches(e))}filterLinksHasType(){return this.items.filter(e=>e.type)}}var An=(r=>(r.EPUB="https://readium.org/webpub-manifest/profiles/epub",r.AUDIOBOOK="https://readium.org/webpub-manifest/profiles/audiobook",r.DIVINA="https://readium.org/webpub-manifest/profiles/divina",r.PDF="https://readium.org/webpub-manifest/profiles/pdf",r))(An||{}),H=(r=>(r.ltr="ltr",r.rtl="rtl",r))(H||{});Z.prototype.getContains=function(){return new Set(this.otherProperties.contains||[])};function _o(r){const e=r.split(",")[0].trim(),i=(e.toLowerCase().startsWith("npt:")?e.slice(4):e).split(":");if(i.length===1){const o=parseFloat(i[0]);return isNaN(o)?void 0:o}if(i.length===2){const o=parseInt(i[0],10),a=parseFloat(i[1]);return isNaN(o)||isNaN(a)?void 0:o*60+a}if(i.length===3){const o=parseInt(i[0],10),a=parseInt(i[1],10),s=parseFloat(i[2]);return isNaN(o)||isNaN(a)||isNaN(s)?void 0:o*3600+a*60+s}}class at{constructor(e){this.cssSelector=e.cssSelector,this.textNodeIndex=e.textNodeIndex,this.charOffset=e.charOffset}static deserialize(e){if(!(e&&e.cssSelector))return;let t=$(e.textNodeIndex);if(t===void 0)return;let n=$(e.charOffset);return n===void 0&&(n=$(e.offset)),new at({cssSelector:e.cssSelector,textNodeIndex:t,charOffset:n})}serialize(){const e={cssSelector:this.cssSelector,textNodeIndex:this.textNodeIndex};return this.charOffset!==void 0&&(e.charOffset=this.charOffset),e}}class Rt{constructor(e){this.start=e.start,this.end=e.end}static deserialize(e){if(!e)return;let t=at.deserialize(e.start);if(t)return new Rt({start:t,end:at.deserialize(e.end)})}serialize(){const e={start:this.start.serialize()};return this.end&&(e.end=this.end.serialize()),e}}E.prototype.getCssSelector=function(){return this.otherLocations?.get("cssSelector")},E.prototype.getPartialCfi=function(){return this.otherLocations?.get("partialCfi")},E.prototype.getDomRange=function(){return Rt.deserialize(this.otherLocations?.get("domRange"))},E.prototype.fragmentParameters=function(){return new Map(this.fragments.map(r=>r.startsWith("#")?r.slice(1):r).join("&").split("&").filter(r=>!r.startsWith("#")).map(r=>r.split("=")).filter(r=>r.length===2).map(r=>[r[0].trim().toLowerCase(),r[1].trim()]))},E.prototype.htmlId=function(){if(!this.fragments.length)return;let r=this.fragments.find(e=>e.length&&!e.includes("="));if(!r){const e=this.fragmentParameters();e.has("id")?r=e.get("id"):e.has("name")&&(r=e.get("name"))}return r?.startsWith("#")?r.slice(1):r},E.prototype.page=function(){const r=parseInt(this.fragmentParameters().get("page"));if(!isNaN(r)&&r>=0)return r},E.prototype.time=function(){const r=this.fragmentParameters().get("t");if(r)return _o(r)},E.prototype.space=function(){const r=this.fragmentParameters();if(!r.has("xywh"))return;const e=r.get("xywh").split(",").map(t=>parseInt(t));if(e.length===4&&!e.some(isNaN))return e};class Pt{constructor(e){this.currency=e.currency,this.value=e.value}static deserialize(e){if(!e)return;let t=e.currency;if(!(t&&typeof t=="string"&&t.length>0))return;let n=$(e.value);if(n!==void 0)return new Pt({currency:t,value:n})}serialize(){return{currency:this.currency,value:this.value}}}class Ne{constructor(e){this.type=e.type,this.children=e.children}static deserialize(e){if(e&&e.type)return new Ne({type:e.type,children:Ne.deserializeArray(e.children)})}static deserializeArray(e){if(Array.isArray(e))return e.map(t=>Ne.deserialize(t)).filter(t=>t!==void 0)}serialize(){const e={type:this.type};return this.children&&(e.children=this.children.map(t=>t.serialize())),e}}class Ct{constructor(e){this.total=e.total,this.position=e.position}static deserialize(e){if(e)return new Ct({total:$(e.total),position:$(e.position)})}serialize(){const e={};return this.total!==void 0&&(e.total=this.total),this.position!==void 0&&(e.position=this.position),e}}class kt{constructor(e){this.total=e.total,this.available=e.available}static deserialize(e){if(e)return new kt({total:$(e.total),available:$(e.available)})}serialize(){const e={};return this.total!==void 0&&(e.total=this.total),this.available!==void 0&&(e.available=this.available),e}}class Et{constructor(e){this.state=e.state,this.since=e.since,this.until=e.until}static deserialize(e){if(e&&e.state)return new Et({state:e.state,since:Ln(e.since),until:Ln(e.until)})}serialize(){const e={state:this.state};return this.since!==void 0&&(e.since=this.since.toISOString()),this.until!==void 0&&(e.until=this.until.toISOString()),e}}Z.prototype.getNumberOfItems=function(){return $(this.otherProperties.numberOfItems)},Z.prototype.getPrice=function(){return Pt.deserialize(this.otherProperties.price)},Z.prototype.getIndirectAcquisitions=function(){const r=this.otherProperties.indirectAcquisition;if(r&&Array.isArray(r))return r.map(e=>Ne.deserialize(e)).filter(e=>e!==void 0)},Z.prototype.getHolds=function(){return Ct.deserialize(this.otherProperties.holds)},Z.prototype.getCopies=function(){return kt.deserialize(this.otherProperties.copies)},Z.prototype.getAvailability=function(){return Et.deserialize(this.otherProperties.availability)},Z.prototype.getAuthenticate=function(){return K.deserialize(this.otherProperties.authenticate)};const bo="CssSelectorGenerator";function Tn(r="unknown problem",...e){console.warn(`${bo}: ${r}`,...e)}function vo(r){return r instanceof RegExp}function wo(r){return r.replace(/[|\\{}()[\]^$+?.]/g,"\\$&").replace(/\*/g,".+")}function Ro(r){const e=r.map(t=>{if(vo(t))return n=>t.test(n);if(typeof t=="function")return n=>{const i=t(n);return typeof i!="boolean"?(Tn("pattern matcher function invalid","Provided pattern matching function does not return boolean. It's result will be ignored.",t),!1):i};if(typeof t=="string"){const n=new RegExp("^"+wo(t)+"$");return i=>n.test(i)}return Tn("pattern matcher invalid","Pattern matching only accepts strings, regular expressions and/or functions. This item is invalid and will be ignored.",t),()=>!1});return t=>e.some(n=>n(t))}Ro(["class","id","ng-*"]);const Po=Math.pow(2,32),Nn=()=>Math.round(Math.random()*Po).toString(36),xt=()=>`${Math.round(performance.now())}-${Nn()}-${Nn()}`,be=1;class Co{constructor(e){this.destination=null,this.registrar=new Map,this.origin="",this.channelId="",this.receiver=this.receive.bind(this),this.preLog=[],this.wnd=e,e.addEventListener("message",this.receiver)}receive(e){if(e.source===null)throw Error("Event source is null");if(typeof e.data!="object")return;const t=e.data;if(!(!("_readium"in t)||!t._readium||t._readium<=0)){if(t.key==="_ping"){if(!this.destination){if(this.destination=e.source,this.origin=e.origin,this.channelId=t._channel,t._readium!==be){t._readium>be?this.send("error",`received comms version ${t._readium} higher than ${be}`):this.send("error",`received comms version ${t._readium} lower than ${be}`),this.destination=null,this.origin="",this.channelId="";return}this.send("_pong",void 0),this.preLog.forEach(n=>this.send("log",n)),this.preLog=[]}return}else if(this.channelId){if(t._channel!==this.channelId||e.origin!==this.origin)return}else return;this.handle(t)}}handle(e){const t=this.registrar.get(e.key);if(!t||t.length===0){e.strict&&this.send("_unhandled",e);return}t.forEach(n=>n.cb(e.data,i=>{this.send("_ack",i,e.id)}))}register(e,t,n){Array.isArray(e)||(e=[e]),e.forEach(i=>{const o=this.registrar.get(i);if(o&&o.length>=0){if(o.find(s=>s.module===t))throw new Error(`Trying to register another callback for combination of event ${i} and module ${t}`);o.push({cb:n,module:t}),this.registrar.set(i,o)}else this.registrar.set(i,[{cb:n,module:t}])})}unregister(e,t){Array.isArray(e)||(e=[e]),e.forEach(n=>{const i=this.registrar.get(n);!i||i.length===0||i.splice(i.findIndex(o=>o.module===t),1)})}unregisterAll(e){this.registrar.forEach((t,n)=>this.registrar.set(n,t.filter(i=>i.module!==e)))}log(...e){this.destination?this.send("log",e):this.preLog.push(e)}get ready(){return!!this.destination}destroy(){this.destination=null,this.channelId="",this.preLog=[],this.registrar.clear(),this.wnd.removeEventListener("message",this.receiver)}send(e,t,n=void 0,i=[]){if(!this.destination)throw Error("Attempted to send comms message before destination has been initialized");const o={_readium:be,_channel:this.channelId,id:n??xt(),key:e,data:t};try{this.destination.postMessage(o,{targetOrigin:this.origin,transfer:i})}catch(a){if(i.length>0)throw a;this.destination.postMessage(o,this.origin,i)}}}class ve{}function Mn(r){return r.split("").reverse().join("")}function ko(r,e,t){const n=Mn(e);return t.map(i=>{const o=Math.max(0,i.end-e.length-i.errors),a=Mn(r.slice(o,i.end));return{start:In(a,n,i.errors).reduce((l,d)=>i.end-d.end<l?i.end-d.end:l,i.end),end:i.end,errors:i.errors}})}function Ft(r){return(r|-r)>>31&1}function Un(r,e,t,n){let i=r.P[t],o=r.M[t];const a=n>>>31,s=e[t]|a,l=s|o,d=(s&i)+i^i|s;let c=o|~(d|i),h=i&d;const u=Ft(c&r.lastRowMask[t])-Ft(h&r.lastRowMask[t]);return c<<=1,h<<=1,h|=a,c|=Ft(n)-a,i=h|~(l|c),o=c&l,r.P[t]=i,r.M[t]=o,u}function In(r,e,t){if(e.length===0)return[];t=Math.min(t,e.length);const n=[],i=32,o=Math.ceil(e.length/i)-1,a={P:new Uint32Array(o+1),M:new Uint32Array(o+1),lastRowMask:new Uint32Array(o+1)};a.lastRowMask.fill(1<<31),a.lastRowMask[o]=1<<(e.length-1)%i;const s=new Uint32Array(o+1),l=new Map,d=[];for(let u=0;u<256;u++)d.push(s);for(let u=0;u<e.length;u+=1){const g=e.charCodeAt(u);if(l.has(g))continue;const m=new Uint32Array(o+1);l.set(g,m),g<d.length&&(d[g]=m);for(let p=0;p<=o;p+=1){m[p]=0;for(let _=0;_<i;_+=1){const v=p*i+_;if(v>=e.length)continue;e.charCodeAt(v)===g&&(m[p]|=1<<_)}}}let c=Math.max(0,Math.ceil(t/i)-1);const h=new Uint32Array(o+1);for(let u=0;u<=c;u+=1)h[u]=(u+1)*i;h[o]=e.length;for(let u=0;u<=c;u+=1)a.P[u]=-1,a.M[u]=0;for(let u=0;u<r.length;u+=1){const g=r.charCodeAt(u);let m;g<d.length?m=d[g]:(m=l.get(g),typeof m>"u"&&(m=s));let p=0;for(let _=0;_<=c;_+=1)p=Un(a,m,_,p),h[_]+=p;if(h[c]-p<=t&&c<o&&(m[c+1]&1||p<0)){c+=1,a.P[c]=-1,a.M[c]=0;let _;if(c===o){const v=e.length%i;_=v===0?i:v}else _=i;h[c]=h[c-1]+_-p+Un(a,m,c,p)}else for(;c>0&&h[c]>=t+i;)c-=1;c===o&&h[c]<=t&&(h[c]<t&&n.splice(0,n.length),n.push({start:-1,end:u+1,errors:h[c]}),t=h[c])}return n}function Eo(r,e,t){const n=In(r,e,t);return ko(r,e,n)}function Hn(r,e,t){let n=0;const i=[];for(;n!==-1;)n=r.indexOf(e,n),n!==-1&&(i.push({start:n,end:n+e.length,errors:0}),n+=1);return i.length>0?i:Eo(r,e,t)}function Dn(r,e){return e.length===0||r.length===0?0:1-Hn(r,e,e.length)[0].errors/e.length}function xo(r,e,t={}){if(e.length===0)return null;const n=Math.min(256,e.length/2),i=Hn(r,e,n);if(i.length===0)return null;const o=s=>{const u=1-s.errors/e.length,g=t.prefix?Dn(r.slice(Math.max(0,s.start-t.prefix.length),s.start),t.prefix):1,m=t.suffix?Dn(r.slice(s.end,s.end+t.suffix.length),t.suffix):1;let p=1;return typeof t.hint=="number"&&(p=1-Math.abs(s.start-t.hint)/r.length),(50*u+20*g+20*m+2*p)/92},a=i.map(s=>({start:s.start,end:s.end,score:o(s)}));return a.sort((s,l)=>l.score-s.score),a[0]}function zt(r,e,t){const n=t===1?e:e-1;if(r.charAt(n).trim()!=="")return e;let i,o;if(t===2?(i=r.substring(0,e),o=i.trimEnd()):(i=r.substring(e),o=i.trimStart()),!o.length)return-1;const a=i.length-o.length;return t===2?e-a:e+a}function Wn(r,e){const t=r.commonAncestorContainer.ownerDocument.createNodeIterator(r.commonAncestorContainer,NodeFilter.SHOW_TEXT),n=e===1?r.startContainer:r.endContainer,i=e===1?r.endContainer:r.startContainer;let o=t.nextNode();for(;o&&o!==n;)o=t.nextNode();e===2&&(o=t.previousNode());let a=-1;const s=()=>{if(o=e===1?t.nextNode():t.previousNode(),o){const l=o.textContent,d=e===1?0:l.length;a=zt(l,d,e)}};for(;o&&a===-1&&o!==i;)s();if(o&&a>=0)return{node:o,offset:a};throw new RangeError("No text nodes with non-whitespace text found in range")}function Fo(r){if(!r.toString().trim().length)throw new RangeError("Range contains no non-whitespace text");if(r.startContainer.nodeType!==Node.TEXT_NODE)throw new RangeError("Range startContainer is not a text node");if(r.endContainer.nodeType!==Node.TEXT_NODE)throw new RangeError("Range endContainer is not a text node");const e=r.cloneRange();let t=!1,n=!1;const i={start:zt(r.startContainer.textContent,r.startOffset,1),end:zt(r.endContainer.textContent,r.endOffset,2)};if(i.start>=0&&(e.setStart(r.startContainer,i.start),t=!0),i.end>0&&(e.setEnd(r.endContainer,i.end),n=!0),t&&n)return e;if(!t){const{node:o,offset:a}=Wn(e,1);o&&a>=0&&e.setStart(o,a)}if(!n){const{node:o,offset:a}=Wn(e,2);o&&a>0&&e.setEnd(o,a)}return e}function Bn(r){switch(r.nodeType){case Node.ELEMENT_NODE:case Node.TEXT_NODE:return r.textContent?.length??0;default:return 0}}function jn(r){let e=r.previousSibling,t=0;for(;e;)t+=Bn(e),e=e.previousSibling;return t}function Gn(r,...e){let t=e.shift();const n=r.ownerDocument.createNodeIterator(r,NodeFilter.SHOW_TEXT),i=[];let o=n.nextNode(),a,s=0;for(;t!==void 0&&o;)a=o,s+a.data.length>t?(i.push({node:a,offset:t-s}),t=e.shift()):(o=n.nextNode(),s+=a.data.length);for(;t!==void 0&&a&&s===t;)i.push({node:a,offset:a.data.length}),t=e.shift();if(t!==void 0)throw new RangeError("Offset exceeds text length");return i}class ee{constructor(e,t){if(t<0)throw new Error("Offset is invalid");this.element=e,this.offset=t}relativeTo(e){if(!e.contains(this.element))throw new Error("Parent is not an ancestor of current element");let t=this.element,n=this.offset;for(;t!==e;)n+=jn(t),t=t.parentElement;return new ee(t,n)}resolve(e={}){try{return Gn(this.element,this.offset)[0]}catch(t){if(this.offset===0&&e.direction!==void 0){const n=document.createTreeWalker(this.element.getRootNode(),NodeFilter.SHOW_TEXT);n.currentNode=this.element;const i=e.direction===1,o=i?n.nextNode():n.previousNode();if(!o)throw t;return{node:o,offset:i?0:o.data.length}}else throw t}}static fromCharOffset(e,t){switch(e.nodeType){case Node.TEXT_NODE:return ee.fromPoint(e,t);case Node.ELEMENT_NODE:return new ee(e,t);default:throw new Error("Node is not an element or text node")}}static fromPoint(e,t){switch(e.nodeType){case Node.TEXT_NODE:{if(t<0||t>e.data.length)throw new Error("Text node offset is out of range");if(!e.parentElement)throw new Error("Text node has no parent");const n=jn(e)+t;return new ee(e.parentElement,n)}case Node.ELEMENT_NODE:{if(t<0||t>e.childNodes.length)throw new Error("Child node offset is out of range");let n=0;for(let i=0;i<t;i++)n+=Bn(e.childNodes[i]);return new ee(e,n)}default:throw new Error("Point is not in an element or text node")}}}class se{constructor(e,t){this.start=e,this.end=t}relativeTo(e){return new se(this.start.relativeTo(e),this.end.relativeTo(e))}toRange(){let e,t;this.start.element===this.end.element&&this.start.offset<=this.end.offset?[e,t]=Gn(this.start.element,this.start.offset,this.end.offset):(e=this.start.resolve({direction:1}),t=this.end.resolve({direction:2}));const n=new Range;return n.setStart(e.node,e.offset),n.setEnd(t.node,t.offset),n}static fromRange(e){const t=ee.fromPoint(e.startContainer,e.startOffset),n=ee.fromPoint(e.endContainer,e.endOffset);return new se(t,n)}static fromOffsets(e,t,n){return new se(new ee(e,t),new ee(e,n))}static trimmedRange(e){return Fo(se.fromRange(e).toRange())}}class st{constructor(e,t,n){this.root=e,this.start=t,this.end=n}static fromRange(e,t){const n=se.fromRange(t).relativeTo(e);return new st(e,n.start.offset,n.end.offset)}static fromSelector(e,t){return new st(e,t.start,t.end)}toSelector(){return{type:"TextPositionSelector",start:this.start,end:this.end}}toRange(){return se.fromOffsets(this.root,this.start,this.end).toRange()}}class lt{constructor(e,t,n={}){this.root=e,this.exact=t,this.context=n}static fromRange(e,t){const n=e.textContent,i=se.fromRange(t).relativeTo(e),o=i.start.offset,a=i.end.offset,s=32;return new lt(e,n.slice(o,a),{prefix:n.slice(Math.max(0,o-s),o),suffix:n.slice(a,Math.min(n.length,a+s))})}static fromSelector(e,t){const{prefix:n,suffix:i}=t;return new lt(e,t.exact,{prefix:n,suffix:i})}toSelector(){return{type:"TextQuoteSelector",exact:this.exact,prefix:this.context.prefix,suffix:this.context.suffix}}toRange(e={}){return this.toPositionAnchor(e).toRange()}toPositionAnchor(e={}){const t=this.root.textContent,n=xo(t,this.exact,{...this.context,hint:e.hint});if(!n)throw new Error("Quote not found");return new st(this.root,n.start,n.end)}}function zo(r){const e=r.tagName.toUpperCase();return e==="IMG"||e==="VIDEO"||e==="AUDIO"||e==="IFRAME"||e==="OBJECT"||e==="EMBED"||e==="CANVAS"}function Me(r,e){try{const t=e.locations,n=e.text;if(n&&n.highlight){let i;t&&t.getCssSelector()&&(i=r.querySelector(t.getCssSelector())),i||(i=r.body);const o=new lt(i,n.highlight,{prefix:n.before,suffix:n.after});try{return o.toRange()}catch{return console.warn("Quote not found:",o),null}}if(t){let i=null;if(!i&&t.getCssSelector()&&(i=r.querySelector(t.getCssSelector())),!i&&t.fragments){for(const o of t.fragments)if(i=r.getElementById(o),i)break}if(i){const o=r.createRange();return i.childNodes.length===0||zo(i)?(o.selectNode(i),o):(o.setStartBefore(i),o.setEndAfter(i),o)}}}catch(t){console.error(t)}return null}function Lo(r,e,t=!1){let n=r.getClientRects();n.length||r.commonAncestorContainer.nodeType===Node.ELEMENT_NODE&&(n=r.commonAncestorContainer.getClientRects());const i=1,o=[];for(const c of n)o.push({bottom:c.bottom,height:c.height,left:c.left,right:c.right,top:c.top,width:c.width});const a=Vn(o,i,e,t),s=Ao(a,i),l=$n(s),d=4;for(let c=l.length-1;c>=0;c--){const h=l[c];if(!(h.width*h.height>d))if(l.length>1)l.splice(c,1);else break}return l}function Vn(r,e,t,n=!1){for(let i=0;i<r.length;i++)for(let o=i+1;o<r.length;o++){const a=r[i],s=r[o];if(a===s)continue;const l=X(a.top,s.top,e)&&X(a.bottom,s.bottom,e),d=X(a.left,s.left,e)&&X(a.right,s.right,e);if(l&&!d&&Xn(a,s,e)){const u=r.filter(m=>m!==a&&m!==s),g=Oo(a,s);return u.push(g),Vn(u,e,t,n)}}return r}function Oo(r,e){const t=Math.min(r.left,e.left),n=Math.max(r.right,e.right),i=Math.min(r.top,e.top),o=Math.max(r.bottom,e.bottom);return{bottom:o,height:o-i,left:t,right:n,top:i,width:n-t}}function Ao(r,e){const t=new Set(r);for(const n of r){if(!(n.width>1&&n.height>1)){t.delete(n);continue}for(const o of r)if(n!==o&&t.has(o)&&To(o,n,e)){t.delete(n);break}}return Array.from(t)}function To(r,e,t){return we(r,e.left,e.top,t)&&we(r,e.right,e.top,t)&&we(r,e.left,e.bottom,t)&&we(r,e.right,e.bottom,t)}function we(r,e,t,n){return(r.left<e||X(r.left,e,n))&&(r.right>e||X(r.right,e,n))&&(r.top<t||X(r.top,t,n))&&(r.bottom>t||X(r.bottom,t,n))}function $n(r){for(let e=0;e<r.length;e++)for(let t=e+1;t<r.length;t++){const n=r[e],i=r[t];if(n!==i&&Xn(n,i,-1)){let o=[],a;const s=Kn(n,i);if(s.length===1)o=s,a=n;else{const d=Kn(i,n);s.length<d.length?(o=s,a=n):(o=d,a=i)}const l=r.filter(d=>d!==a);return Array.prototype.push.apply(l,o),$n(l)}}return r}function Kn(r,e){const t=No(e,r);if(t.height===0||t.width===0)return[r];const n=[];{const i={bottom:r.bottom,height:0,left:r.left,right:t.left,top:r.top,width:0};i.width=i.right-i.left,i.height=i.bottom-i.top,i.height!==0&&i.width!==0&&n.push(i)}{const i={bottom:t.top,height:0,left:t.left,right:t.right,top:r.top,width:0};i.width=i.right-i.left,i.height=i.bottom-i.top,i.height!==0&&i.width!==0&&n.push(i)}{const i={bottom:r.bottom,height:0,left:t.left,right:t.right,top:t.bottom,width:0};i.width=i.right-i.left,i.height=i.bottom-i.top,i.height!==0&&i.width!==0&&n.push(i)}{const i={bottom:r.bottom,height:0,left:t.right,right:r.right,top:r.top,width:0};i.width=i.right-i.left,i.height=i.bottom-i.top,i.height!==0&&i.width!==0&&n.push(i)}return n}function No(r,e){const t=Math.max(r.left,e.left),n=Math.min(r.right,e.right),i=Math.max(r.top,e.top),o=Math.min(r.bottom,e.bottom);return{bottom:o,height:Math.max(0,o-i),left:t,right:n,top:i,width:Math.max(0,n-t)}}function Xn(r,e,t){return(r.left<e.right||t>=0&&X(r.left,e.right,t))&&(e.left<r.right||t>=0&&X(e.left,r.right,t))&&(r.top<e.bottom||t>=0&&X(r.top,e.bottom,t))&&(e.top<r.bottom||t>=0&&X(e.top,r.bottom,t))}function X(r,e,t){return Math.abs(r-e)<=t}const Mo=new Set(["backgroundColor","textColor","linkColor","visitedColor","primaryColor","secondaryColor","selectionBackgroundColor","selectionTextColor","blendFilter","darkenFilter","invertFilter","invertGaiji"]),Yn=/--(?:USER|RS)__([\w-]+)/g;function Uo(r,e){const t=r??"",n=e??"",i=new Set;for(const o of t.matchAll(Yn))i.add(o[1]);for(const o of n.matchAll(Yn))i.add(o[1]);for(const o of i)if(!Mo.has(o))return!0;return!1}function Lt(r){const e={},t=r.document.documentElement.style;for(const n in r.document.documentElement.style)Object.hasOwn(t,n)&&!Number.isNaN(Number.parseInt(n))&&(e[t[n]]=t.getPropertyValue(t[n]));return e}function qn(r,e){const t=Lt(r);Object.keys(t).forEach(n=>{e.hasOwnProperty(n)||ct(r,n)}),Object.entries(e).forEach(([n,i])=>{t[n]!==i&&Ue(r,n,i)})}function Jn(r,e){return r.document.documentElement.style.getPropertyValue(e)}function Ue(r,e,t){r.document.documentElement.style.setProperty(e,t)}function ct(r,e){r.document.documentElement.style.removeProperty(e)}let ht=null,Ot=null,Ie=0;const Re={r:255,g:255,b:255,a:1},Pe=new Map,Io=()=>{if(!ht)if(typeof OffscreenCanvas<"u")ht=new OffscreenCanvas(5,5),Ot=ht.getContext("2d",{willReadFrequently:!0,desynchronized:!0});else{const r=document.createElement("canvas");r.width=5,r.height=5,ht=r,Ot=r.getContext("2d",{willReadFrequently:!0,desynchronized:!0})}return Ot},Ho=r=>{if(!r)return!0;const e=r.trim().toLowerCase();return e.startsWith("var(")||["transparent","currentcolor","inherit","initial","revert","unset","revert-layer"].includes(e)?!0:["linear-gradient","radial-gradient","conic-gradient","repeating-linear-gradient","repeating-radial-gradient","repeating-conic-gradient"].some(i=>e.includes(i))},dt=(r,e)=>{console.warn(`[Decorator] Could not parse color: "${r}". ${e} Falling back to ${JSON.stringify(Re)} to compute contrast. Please use a CSS color value that can be computed to RGB(A).`)},He=(r,e=null)=>{const t=e?`${r}|${e}`:r,n=Pe.get(t);if(n!==void 0)return n??Re;if(Ho(r))return dt(r,"Unsupported color format or special value."),Pe.set(t,null),Re;const i=Io();if(!i)return dt(r,"Could not get canvas context."),Pe.set(t,null),Re;try{Ie===0&&i.clearRect(0,0,5,5);const o=Ie%5,a=Math.floor(Ie/5);i.clearRect(o,a,1,1),e&&(i.fillStyle=e,i.fillRect(o,a,1,1)),i.fillStyle=r,i.fillRect(o,a,1,1);const s=i.getImageData(o,a,1,1);Ie=(Ie+1)%25;const[l,d,c,h]=s.data;if(h===0)return dt(r,"Fully transparent color."),Pe.set(t,null),Re;const u={r:l,g:d,b:c,a:h/255};return Pe.set(t,u),u}catch(o){return dt(r,`Error: ${o instanceof Error?o.message:String(o)}`),Pe.set(t,null),Re}},At=r=>{const e=r/255;return e<=.03928?e/12.92:Math.pow((e+.055)/1.055,2.4)},Tt=r=>{const e=At(r.r),t=At(r.g),n=At(r.b);return .2126*e+.7152*t+.0722*n},ut=(r,e)=>{const t=typeof r=="string"?He(r):r,n=typeof e=="string"?He(e):e,i=Tt(t),o=Tt(n),a=Math.max(i,o),s=Math.min(i,o);return(a+.05)/(s+.05)},Zn=(r,e=null)=>{const t=He(r,e),n=ut(t,{r:255,g:255,b:255,a:1}),i=ut(t,{r:0,g:0,b:0,a:1});return n>i},Do=(r,e=null)=>Zn(r,e)?"white":"black",Wo=r=>{const e=r.a!==void 0?r.a:1;return`rgba(${Math.round(r.r)}, ${Math.round(r.g)}, ${Math.round(r.b)}, ${e})`},Bo=(r,e)=>({r:Math.min(255,r.r+(255-r.r)*e),g:Math.min(255,r.g+(255-r.g)*e),b:Math.min(255,r.b+(255-r.b)*e),a:r.a??1}),jo=(r,e)=>({r:Math.max(0,r.r*(1-e)),g:Math.max(0,r.g*(1-e)),b:Math.max(0,r.b*(1-e)),a:r.a??1}),ce=(r,e=null,t=3)=>{const n=He(r),i=e?He(e):{r:255,g:255,b:255,a:1};let o=ut(n,i);if(o>=t)return r;const s=Tt(i)<.5;let l={...n,a:n.a??1};const d=20,c=.1;for(let h=0;h<d&&(s?l=Bo(l,c):l=jo(l,c),o=ut(l,i),!(o>=t));h++);return Wo(l)};function Go(r){return(r.document.documentElement.dir||r.document.body.dir).toLowerCase()==="rtl"}function Qn(r){return(r.getComputedStyle(r.document.documentElement).writingMode||r.getComputedStyle(r.document.body).writingMode)==="vertical-lr"}function Vo(r){const e=r.getComputedStyle(r.document.documentElement).writingMode||r.getComputedStyle(r.document.body).writingMode;return e==="vertical-rl"||e==="vertical-lr"}function Nt(r){const e=Vo(r),t=e&&Qn(r),n=r.innerWidth,i=r.innerHeight,o=r.document.scrollingElement,a=o.scrollLeft,s=o.scrollTop,l=parseInt(r.getComputedStyle(r.document.documentElement).getPropertyValue("column-count")),d=e&&!t?o.scrollWidth-n+a:a,c=s;return{isVertical:e,isVertLR:t,viewportInlineSize:e?i:n,viewportBlockSize:e?n:i,pageInlineSize:e?i:n/(l||1),xDocOffset:d,yDocOffset:c,inlineScrollOffset:e?c:d,blockScrollOffset:e?d:c,inlineStart:h=>e?h.top:h.left,blockStart:h=>e?h.left:h.top,inlineSize:h=>e?h.height:h.width,blockSize:h=>e?h.width:h.height,applyPosition(h,u,g,m,p,_){h.style.position="absolute",e?(h.style.top=`${u*_}px`,h.style.left=`${g*_}px`,h.style.height=`${m*_}px`,h.style.width=`${p*_}px`):(h.style.left=`${u*_}px`,h.style.top=`${g*_}px`,h.style.width=`${m*_}px`,h.style.height=`${p*_}px`)},toRect(h,u,g,m){return e?new DOMRect(u,h,m,g):new DOMRect(h,u,g,m)}}}function ei(r){return parseInt(r.getComputedStyle(r.document.documentElement).getPropertyValue("column-count"))}function ti(r){const e=getComputedStyle(r),t=parseFloat(e.paddingTop||"0"),n=parseFloat(e.paddingBottom||"0");return r.clientHeight-t-n}function ni(r){const e=ei(r);if(!e)return!1;const t=r.document.querySelectorAll("div[id^='readium-virtual-page']");for(const d of t)d.remove();const n=t.length,i=r.document.scrollingElement.scrollWidth,o=r.visualViewport.width,s=Math.round(i/o*e)%e,l=e===1||s===0?0:e-s;if(l>0)for(let d=0;d<l;d++){const c=r.document.createElement("div");c.setAttribute("id",`readium-virtual-page-${d}`),c.dataset.readium="true",CSS.supports("break-before","column")?c.style.breakBefore="column":(CSS.supports("break-inside","avoid-column")&&(c.style.breakInside="avoid-column"),c.style.height=ti(r.document.documentElement)+"px"),c.innerHTML="&#8203;",r.document.body.appendChild(c)}return n!==l}function Mt(r){const e=r.document.createElement("style");e.appendChild(r.document.createTextNode("*{}")),r.document.body.appendChild(e),r.document.body.removeChild(e)}const ii=()=>typeof navigator>"u"?"":navigator.userAgent||"",oi=()=>typeof navigator>"u"?void 0:navigator.userAgentData||void 0;class ri{constructor(){const e=oi(),t=ii(),n=o=>(typeof o=="string"||typeof o=="number")&&o?String(o).replace(/_/g,".").split(".").map(a=>parseInt(a)||0):[],i=(o="")=>{if(!o)return[];const a=new RegExp("^.*"+o+"[ :\\/]?(\\d+([\\._]\\d+)*).*$");return a.test(t)?n(t.replace(a,"$1")):[]};this.OS=(o=>(/(macOS|Mac OS X)/.test(t)?(/\(iP(hone|od touch);/.test(t)&&(o.iOS=i("CPU (?:iPhone )?OS ")),/\(iPad;/.test(t)?o.iOS=o.iPadOS=i("CPU (?:iPhone )?OS "):/(macOS|Mac OS X) \d/.test(t)&&(document.ontouchend!==void 0?o.iOS=o.iPadOS=i():o.macOS=i("(?:macOS|Mac OS X) "))):/Windows( NT)? \d/.test(t)?o.Windows=(a=>a[0]!==6||!a[1]?a:a[1]===1?[7]:a[1]===2?[8]:[8,1])(i("Windows(?: NT)?")):/Android \d/.test(t)?o.Android=i("Android"):/CrOS/.test(t)?o.ChromeOS=i():/X11;/.test(t)&&(o.Linux=i()),o))({}),e&&e.getHighEntropyValues(["architecture","model","platform","platformVersion","uaFullVersion"]).then(o=>(a=>{const s=o.platform,l=o.platformVersion;if(!(!s||!l)){if(/^i(OS|P(hone|od touch))$/.test(s))a.iOS=n(l);else if(/^iPad(OS)?$/.test(s))a.iOS=a.iPadOS=n(l);else if(/^(macOS|(Mac )?OS X|Mac(Intel)?)$/.test(s))document.ontouchend!==void 0?a.iOS=a.iPadOS=n():a.macOS=n(l);else if(/^(Microsoft )?Windows$/.test(s))a.Windows=n(l);else if(/^(Google )?Android$/.test(s))a.Android=n(l);else if(/^((Google )?Chrome OS|CrOS)$/.test(s))a.ChromeOS=n(l);else if(/^(Linux|Ubuntu|X11)$/.test(s))a.Linux=n(l);else return;Object.keys(this.OS).forEach(d=>delete this.OS[d]),Object.assign(this.OS,a)}})({})),this.UA=(o=>{let a=!1;if(e&&Array.isArray(e.brands)){const s=e.brands.reduce((l,d)=>(l[d.brand]=[d.version*1],l),{});s["Google Chrome"]?(a=!0,o.Blink=o.Chromium=s.Chromium||[],o.Chrome=s["Google Chrome"]):s["Microsoft Edge"]?(a=!0,o.Blink=o.Chromium=s.Chromium||[],o.Edge=s["Microsoft Edge"]):s.Opera&&(a=!0,o.Blink=o.Chromium=s.Chromium||[],o.Opera=s.Opera)}return a||(/ Gecko\/\d/.test(t)?(o.Gecko=i("rv"),/ Waterfox\/\d/.test(t)?o.Waterfox=i("Waterfox"):/ Firefox\/\d/.test(t)&&(o.Firefox=i("Firefox"))):/ Edge\/\d/.test(t)?(o.EdgeHTML=i("Edge"),o.Edge=o.EdgeHTML):/ Chrom(ium|e)\/\d/.test(t)?(o.Blink=o.Chromium=(s=>s[0]?s:i("Chrome"))(i("Chromium")),/ EdgA?\/\d/.test(t)?o.Edge=(s=>s[0]?s:i("Edg"))(i("EdgA")):/ OPR\/\d/.test(t)?o.Opera=i("OPR"):/ Vivaldi\/\d/.test(t)?o.Vivaldi=i("Vivaldi"):/ Silk\/\d/.test(t)?o.Silk=i("Silk"):/ UCBrowser\/\d/.test(t)?o.UCBrowser=i("UCBrowser"):/ Phoebe\/\d/.test(t)?o.Phoebe=i("Phoebe"):o.Chrome=(s=>s[0]?s:o.Chromium)(i("Chrome"))):/ AppleWebKit\/\d/.test(t)?(o.WebKit=i("AppleWebKit"),/ CriOS \d/.test(t)?o.Chrome=i("CriOS"):/ FxiOS \d/.test(t)?o.Firefox=i("FxiOS"):/ EdgiOS\/\d/.test(t)?o.Edge=i("EdgiOS"):/ Version\/\d/.test(t)&&(o.Safari=i("Version"))):/ Trident\/\d/.test(t)&&(o.Trident=i("Trident"),o.InternetExplorer=(s=>s[0]?s:i("MSIE"))(i("rv")))),/[\[; ]FB(AN|_IAB)\//.test(t)&&(o.Facebook=i("FBAV")),/ Line\/\d/.test(t)&&(o.LINE=i("Line")),o})({}),this.Env={get:()=>[this.OS,this.UA].reduce((o,a)=>{for(const s in a)a[s]&&o.push(s);return o},[])}}}class $o extends ri{get iOSRequest(){const e=oi(),t=ii();if(this.OS.iOS&&!this.OS.iPadOS)return"mobile";if(this.OS.iPadOS)return/\(iPad;/.test(t)||e&&/^iPad(OS)?$/.test(e.platform)?"mobile":"desktop"}}const Y=new ri,M=new $o,ai=["div","span","p","br","hr","b","i","em","strong","s","u","mark","small","sub","sup","abbr","cite","code","data","dfn","kbd","q","samp","time","var","blockquote","pre","svg","g","path","circle","ellipse","rect","line","polygon","polyline","text","tspan","defs","use"],Ko=/^on/i,Xo=new Set(["href","src","action","formaction","xlink:href"]),Yo=/^\s*(javascript|data):/i;function qo(r,e){const t=r.document.createElement("div");if("Sanitizer"in r&&typeof t.setHTML=="function")try{const i=new r.Sanitizer({allowElements:ai});return t.setHTML(e,{sanitizer:i}),t.firstElementChild}catch{}const n=r.document.implementation.createHTMLDocument("");for(n.body.innerHTML=e,Jo(n.body,new Set(ai));n.body.firstChild;)t.appendChild(r.document.adoptNode(n.body.firstChild));return t.firstElementChild}function Jo(r,e){const t=Array.from(r.querySelectorAll("*")).reverse();for(const n of t){if(!e.has(n.localName)){n.replaceWith(...Array.from(n.childNodes));continue}for(const{name:i,value:o}of Array.from(n.attributes))(Ko.test(i)||Xo.has(i)&&Yo.test(o))&&n.removeAttribute(i)}}function Ut(r){switch(r){case k.Mask:return"rgba(255, 255, 255, 0.5)";case k.Highlight:return"#FFFF00";default:return"#FF0000"}}const k={Highlight:"highlight",Underline:"underline",Outline:"outline",TextColor:"textColor",Mask:"mask",Template:"template"};var si=(r=>(r.Wrap="wrap",r.Viewport="viewport",r.Bounds="bounds",r.Page="page",r))(si||{}),li=(r=>(r.Boxes="boxes",r.Bounds="bounds",r))(li||{});const Zo=()=>"Highlight"in window,ci=["IMG","IMAGE","AUDIO","VIDEO","SVG"];class Qo{constructor(e,t,n,i){this.wnd=e,this.comms=t,this.id=n,this.name=i,this.items=[],this.lastItemId=0,this.container=void 0,this._activatable=!1,this.experimentalHighlights=!1,this.maskSvg=void 0,this.shadowHost=void 0,this.shadowRoot=void 0,this.currentRender=0,Zo()&&(this.experimentalHighlights=!0,this.notTextFlag=new Map),this.activationHandler=this.handleActivation.bind(this),this.wnd.document.addEventListener("pointerup",this.activationHandler)}get activatable(){return this._activatable}set activatable(e){this._activatable=e}add(e){const t=`${this.id}-${this.lastItemId++}`,n=Me(this.wnd.document,e.locator);if(!n){this.comms.log("Can't locate DOM range for decoration",e);return}const i=n.commonAncestorContainer;if(i.nodeType!==Node.TEXT_NODE&&this.experimentalHighlights&&(ci.includes(i.nodeName.toUpperCase())&&this.notTextFlag?.set(t,!0),n.cloneContents().querySelector(ci.join(", ").toLowerCase())&&this.notTextFlag?.set(t,!0),(i.textContent?.trim()||"").length===0&&this.notTextFlag?.set(t,!0)),this.experimentalHighlights){const{type:a}=e.style,{layout:s,width:l}=e.style;a!==k.TextColor&&(a===k.Outline||a===k.Template||a===k.Mask||s!==void 0&&s!=="boxes"||l!==void 0&&l!=="wrap")&&this.notTextFlag?.set(t,!0)}const o={decoration:e,id:t,range:n};this.items.push(o),this.layout(o),this.renderLayout([o])}remove(e){const t=this.items.findIndex(o=>o.decoration.id===e);if(t<0)return;const n=this.items[t],i=n.decoration.style?.type===k.Mask;this.items.splice(t,1),n.clickableElements=void 0,n.container&&(n.container.remove(),n.container=void 0),this.experimentalHighlights&&!this.notTextFlag?.has(n.id)&&this.wnd.CSS.highlights.get(this.id)?.delete(n.range),this.notTextFlag?.delete(n.id),i&&this.updateSharedMask()}update(e){this.remove(e.id),this.add(e)}clear(){this.clearContainer(),this.items.length=0,this.notTextFlag?.clear(),this.maskSvg&&(this.maskSvg.remove(),this.maskSvg=void 0),this.shadowHost&&(this.shadowHost.remove(),this.shadowHost=void 0,this.shadowRoot=void 0)}destroy(){this.clear(),this.wnd.document.removeEventListener("pointerup",this.activationHandler)}handleActivation(e){if(!this._activatable)return;const t=e.clientX,n=e.clientY,i=this.wnd.devicePixelRatio;for(const o of this.items){if(!o.decoration.style?.isActive)continue;let a;if(o.decoration.style.type===k.Template)for(const s of o.clickableElements??[]){const l=s.getBoundingClientRect();if(we(l,t,n,0)){a=l;break}}else{const s=o.range.getClientRects();for(const l of s)if(we(l,t,n,0)){a=o.range.getBoundingClientRect();break}}if(a){this.comms.send("decoration_activated",{decorationId:o.decoration.id,group:this.name,rect:{top:a.top*i,left:a.left*i,width:a.width*i,height:a.height*i},point:{x:t*i,y:n*i}});return}}}requestLayout(){this.wnd.cancelAnimationFrame(this.currentRender),this.clearContainer(),this.wnd.document.fonts.ready.then(()=>{this.currentRender=this.wnd.requestAnimationFrame(()=>{this.items.forEach(e=>this.layout(e)),this.renderLayout(this.items),this.updateSharedMask()})})}experimentalLayout(e){const[t,n]=this.requireContainer(!0),i=e.decoration.style,o=i.type??k.Highlight,a=i.tint??Ut(o),s=i.width,l=i.layout,d=(g,m)=>this.wnd.document.caretPositionFromPoint?.(g,m)??null;if(o===k.TextColor&&(l==="bounds"||s==="bounds"||s==="page")){const g=Nt(this.wnd);if(g.isVertical)console.warn("Vertical writing detected: caretPositionFromPoint has known bugs, falling back to original range"),n.add(e.range);else{const m=e.range.getBoundingClientRect();let p,_;s==="page"?(p=Math.floor(g.inlineStart(m)/g.pageInlineSize)*g.pageInlineSize,_=g.pageInlineSize):(p=g.inlineStart(m),_=g.inlineSize(m));const v=d(p,g.blockStart(m)+1),C=d(p+_,g.blockStart(m)+g.blockSize(m)-1);if(v&&C){const x=this.wnd.document.createRange();x.setStart(v.offsetNode,v.offset),x.setEnd(C.offsetNode,C.offset),n.add(x),e.range=x}else n.add(e.range)}}else n.add(e.range);const c=this.getBackgroundColor(),h=i.enforceContrast!==!1;let u;switch(o){case k.Underline:const g=h?ce(a,c):a;u=`::highlight(${this.id}) {
                    text-decoration: underline;
                    text-decoration-color: ${g};
                    text-decoration-thickness: 0.1em;
                }`;break;case k.Outline:const m=h?ce(a,c):a;u=`::highlight(${this.id}) {
                    outline: 2px solid ${m};
                    outline-offset: 1px;
                }`;break;case k.TextColor:{const p=h?ce(a,c):a;u=`::highlight(${this.id}) {
                    color: ${p};
                }`;break}case k.Highlight:default:{const p=h?ce(a,c):a;u=`::highlight(${this.id}) {
                    color: ${Do(p,c)};
                    background-color: ${p};
                }`}}t.innerHTML=u}layout(e){if(this.experimentalHighlights&&!this.notTextFlag?.has(e.id))return this.experimentalLayout(e);const t=this.wnd.document.createElement("div");t.setAttribute("id",e.id),t.dataset.highlightId=e.decoration.id,t.style.setProperty("pointer-events","none");const n=Nt(this.wnd);let i=1;if(Y.UA.Blink){const c=parseFloat(this.wnd.getComputedStyle(this.wnd.document.documentElement).zoom),h=parseFloat(this.wnd.getComputedStyle(this.wnd.document.body).zoom),u=(c||1)*(h||1);u&&(i=1/u)}const o=(c,h,u,g=0)=>{switch(e.decoration?.style?.width){case"viewport":{const p=Math.floor(n.inlineStart(h)/n.viewportInlineSize)*n.viewportInlineSize;n.applyPosition(c,p+n.inlineScrollOffset+g,n.blockStart(h)+n.blockScrollOffset,n.viewportInlineSize-2*g,n.blockSize(h),i);break}case"page":{const p=Math.floor(n.inlineStart(h)/n.pageInlineSize)*n.pageInlineSize;n.applyPosition(c,p+n.inlineScrollOffset+g,n.blockStart(h)+n.blockScrollOffset,n.pageInlineSize-2*g,n.blockSize(h),i);break}case"bounds":{n.applyPosition(c,n.inlineStart(u)+n.inlineScrollOffset,n.blockStart(h)+n.blockScrollOffset,n.inlineSize(u),n.blockSize(h),i);break}default:n.applyPosition(c,n.inlineStart(h)+n.inlineScrollOffset,n.blockStart(h)+n.blockScrollOffset,n.inlineSize(h),n.blockSize(h),i)}},a=e.range.getBoundingClientRect(),s=e.decoration.style,l=(()=>{if(s.type!==k.Outline)return 0;const c=s.width;return c==="page"||c==="viewport"?3:0})();let d;if(s.type===k.Template){s.stylesheet&&this.injectCustomStylesheet(s.stylesheet);const c=qo(this.wnd,s.element);if(!c){e.container=t,e.clickableElements=[];return}c.style.setProperty("pointer-events","none"),d=c}else{const c=s,h=c.type??k.Highlight,u=c.tint??Ut(h);if(h===k.TextColor){e.container=t,e.clickableElements=[];return}if(h===k.Mask){e.container=t,e.clickableElements=[],this.updateSharedMask();return}const g=this.getCurrentDarkMode(),m=this.getBackgroundColor(),p=c.enforceContrast!==!1,_=(()=>{switch(h){case k.Underline:{const x=p?ce(u,m):u;return[c.layout==="bounds"?`border-top: 0.1em solid ${x} !important`:null,`border-bottom: 0.1em solid ${x} !important`,"background-color: transparent !important","box-sizing: border-box !important"].filter(Boolean).join("; ")}case k.Outline:return[`outline: 2px solid ${p?ce(u,m):u} !important`,"outline-offset: 1px !important","background-color: transparent !important","box-sizing: border-box !important"].join("; ");case k.Highlight:default:return[`background-color: ${p?ce(u,m):u} !important`,`mix-blend-mode: ${g?"exclusion":"multiply"} !important`,"opacity: 1 !important","box-sizing: border-box !important"].join("; ")}})(),v=this.wnd.document.createElement("template");v.innerHTML=`<div data-readium="true" class="readium-${h}" style="${_}"></div>`.trim(),d=v.content.firstElementChild}if(e.decoration?.style?.layout==="bounds"){const c=d.cloneNode(!0);c.style.setProperty("pointer-events","none"),o(c,a,a,l),t.append(c)}else{let c=Lo(e.range,!0,n.isVertical);c=c.sort((h,u)=>n.isVertical?(n.isVertLR?1:-1)*(h.left-u.left):h.top-u.top);for(let h of c){const u=d.cloneNode(!0);u.style.setProperty("pointer-events","none"),o(u,h,a,l),t.append(u)}}e.container=t,e.clickableElements=Array.from(t.querySelectorAll("[data-activable='1']")),e.clickableElements.length||(e.clickableElements=Array.from(t.children))}renderLayout(e){this.wnd.cancelAnimationFrame(this.currentRender),this.currentRender=this.wnd.requestAnimationFrame(()=>{if(e=e.filter(n=>!this.experimentalHighlights||!!this.notTextFlag?.has(n.id)),!e||e.length===0)return;this.requireContainer().append(...e.map(n=>n.container).filter(n=>!!n))})}requireContainer(e=!1){if(e){let t;this.wnd.document.getElementById(`${this.id}-style`)?t=this.wnd.document.getElementById(`${this.id}-style`):(t=this.wnd.document.createElement("style"),t.dataset.readium="true",t.id=`${this.id}-style`,this.wnd.document.head.appendChild(t));let n;return this.wnd.CSS.highlights.has(this.id)?n=this.wnd.CSS.highlights.get(this.id):(n=new this.wnd.Highlight,this.wnd.CSS.highlights.set(this.id,n)),[t,n]}return this.container||(this.shadowRoot||(this.shadowHost=this.wnd.document.createElement("div"),this.shadowHost.style.cssText="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none",this.wnd.document.body.appendChild(this.shadowHost),this.shadowRoot=this.shadowHost.attachShadow({mode:"open"})),this.container=this.wnd.document.createElement("div"),this.container.setAttribute("id",this.id),this.container.dataset.group=this.name,this.container.dataset.readium="true",this.container.style.setProperty("pointer-events","none"),this.container.style.display="contents",this.shadowRoot.appendChild(this.container)),this.container}getCurrentDarkMode(){return Jn(this.wnd,"--USER__appearance")==="readium-night-on"||Zn(this.getBackgroundColor())}getBackgroundColor(){return Jn(this.wnd,"--USER__backgroundColor")||this.wnd.getComputedStyle(this.wnd.document.documentElement).getPropertyValue("background-color")}updateSharedMask(){const e=this.items.filter(u=>u.decoration.style?.type===k.Mask);if(e.length===0){this.maskSvg&&(this.maskSvg.remove(),this.maskSvg=void 0),this.shadowRoot&&(this.shadowRoot.innerHTML="");return}const t=Nt(this.wnd);let n=1;if(Y.UA.Blink){const u=parseFloat(this.wnd.getComputedStyle(this.wnd.document.documentElement).zoom),g=parseFloat(this.wnd.getComputedStyle(this.wnd.document.body).zoom),m=(u||1)*(g||1);m&&(n=1/m)}const i=this.wnd.document.documentElement,o=i.scrollWidth,a=i.scrollHeight,s=[];for(const u of e){const g=u.decoration.style,m=g.layout??"boxes",p=g.width??"wrap",_=u.range.getBoundingClientRect(),v=m==="bounds"?[_]:Array.from(u.range.getClientRects());for(const C of v){let x;switch(p){case"viewport":{const q=Math.floor(t.inlineStart(C)/t.viewportInlineSize)*t.viewportInlineSize;x=t.toRect(q,t.blockStart(C),t.viewportInlineSize,t.blockSize(C));break}case"page":{const q=Math.floor(t.inlineStart(C)/t.pageInlineSize)*t.pageInlineSize;x=t.toRect(q,t.blockStart(C),t.pageInlineSize,t.blockSize(C));break}case"bounds":{x=t.toRect(t.inlineStart(_),t.blockStart(C),t.inlineSize(_),t.blockSize(C));break}default:x=C}s.push(x)}}const l=[`M0 0 H${o} V${a} H0 Z`,...s.map(u=>{const g=(u.left+t.xDocOffset)*n,m=(u.top+t.yDocOffset)*n,p=(u.right+t.xDocOffset)*n,_=(u.bottom+t.yDocOffset)*n;return`M${g} ${m} H${p} V${_} H${g} Z`})].join(" "),d="http://www.w3.org/2000/svg";if(!this.maskSvg){this.shadowRoot||(this.shadowHost=this.wnd.document.createElement("div"),this.shadowHost.style.cssText="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none",this.wnd.document.body.appendChild(this.shadowHost),this.shadowRoot=this.shadowHost.attachShadow({mode:"open"})),this.maskSvg=this.wnd.document.createElementNS(d,"svg"),this.maskSvg.style.cssText=`position:absolute;top:0;left:0;width:${o}px;height:${a}px;pointer-events:none;z-index:9999`,this.maskSvg.dataset.readium="true";const u=this.wnd.document.createElementNS(d,"defs"),g=this.wnd.document.createElementNS(d,"clipPath"),m=`${this.id}-mask-clip`;g.setAttribute("id",m),g.setAttribute("clipPathUnits","userSpaceOnUse");const p=this.wnd.document.createElementNS(d,"path");p.setAttribute("clip-rule","evenodd"),g.appendChild(p),u.appendChild(g),this.maskSvg.appendChild(u);const _=this.wnd.document.createElementNS(d,"rect");_.setAttribute("id",`${this.id}-mask-rect`),_.setAttribute("clip-path",`url(#${m})`),_.style.pointerEvents="none",this.maskSvg.appendChild(_),this.shadowRoot.appendChild(this.maskSvg)}this.maskSvg.style.width=`${o}px`,this.maskSvg.style.height=`${a}px`;const c=this.maskSvg.querySelector("path");c&&c.setAttribute("d",l);const h=this.maskSvg.querySelector("rect");if(h){const g=e[0].decoration.style.tint,m=g??this.getBackgroundColor()??Ut(k.Mask),p=g?"1":"0.5";h.setAttribute("x","0"),h.setAttribute("y","0"),h.setAttribute("width",String(o)),h.setAttribute("height",String(a)),h.setAttribute("fill",m),h.setAttribute("fill-opacity",p)}}injectCustomStylesheet(e){const t=`${this.id}-custom-style`;let n=this.wnd.document.getElementById(t);n||(n=this.wnd.document.createElement("style"),n.id=t,n.dataset.readium="true",this.wnd.document.head.appendChild(n)),n.innerHTML=e}clearContainer(){this.experimentalHighlights&&this.wnd.CSS.highlights.delete(this.id),this.wnd.document.getElementById(`${this.id}-custom-style`)?.remove(),this.container&&(this.container.remove(),this.container=void 0)}}const Ae=class Ae extends ve{constructor(){super(...arguments),this.resizeFrame=0,this.lastGroupId=0,this.groups=new Map,this.handleResizer=this.handleResize.bind(this)}cleanup(){this.groups.forEach(e=>e.destroy()),this.groups.clear()}updateHighlightStyles(){this.groups.forEach(e=>{e.requestLayout()})}handleResize(){this.wnd.clearTimeout(this.resizeFrame),this.resizeFrame=this.wnd.setTimeout(()=>{this.groups.forEach(e=>{e.experimentalHighlights||e.requestLayout()})},50)}mount(e,t){return this.wnd=e,t.register("decorate",Ae.moduleName,(n,i)=>{const o=n;(o.action==="add"||o.action==="update")&&o.decoration.locator&&(o.decoration.locator=N.deserialize(o.decoration.locator)),this.groups.has(o.group)||this.groups.set(o.group,new Qo(e,t,`readium-decoration-${this.lastGroupId++}`,o.group));const a=this.groups.get(o.group);switch(o.action){case"add":a?.add(o.decoration);break;case"remove":a?.remove(o.decoration.id);break;case"clear":a?.clear();break;case"update":a?.update(o.decoration);break}i(!0)}),t.register("decoration_activatable",Ae.moduleName,(n,i)=>{const o=n,a=this.groups.get(o.group);a&&(a.activatable=o.activatable),i(!0)}),this.resizeObserver=new ResizeObserver(()=>e.requestAnimationFrame(()=>this.handleResize())),this.resizeObserver.observe(e.document.documentElement),e.addEventListener("orientationchange",this.handleResizer),e.addEventListener("resize",this.handleResizer),this.styleObserver=new MutationObserver(n=>{n.some(o=>o.type==="attributes"&&o.attributeName==="style"&&o.oldValue!==o.target.getAttribute("style"))&&this.updateHighlightStyles()}),this.styleObserver.observe(e.document.documentElement,{attributes:!0,attributeFilter:["style"],attributeOldValue:!0}),t.log("Decorator Mounted"),!0}unmount(e,t){return e.removeEventListener("orientationchange",this.handleResizer),e.removeEventListener("resize",this.handleResizer),t.unregisterAll(Ae.moduleName),this.resizeObserver.disconnect(),this.styleObserver.disconnect(),this.cleanup(),t.log("Decorator Unmounted"),!0}};Ae.moduleName="decorator";let It=Ae;const hi="readium-snapper-style",tt=class tt extends ve{constructor(){super(...arguments),this.protected=!1}buildStyles(){return`
        html, body {
            touch-action: manipulation;
            user-select: ${this.protected?"none":"auto"};
        }`}mount(e,t){const n=e.document.createElement("style");return n.dataset.readium="true",n.id=hi,n.textContent=this.buildStyles(),e.document.head.appendChild(n),t.register("protect",tt.moduleName,(i,o)=>{this.protected=!0,n.textContent=this.buildStyles(),o(!0)}),t.register("unprotect",tt.moduleName,(i,o)=>{this.protected=!1,n.textContent=this.buildStyles(),o(!0)}),t.log("Snapper Mounted"),!0}unmount(e,t){return e.document.getElementById(hi)?.remove(),t.log("Snapper Unmounted"),!0}};tt.moduleName="snapper";let Ce=tt;function er(r){return r<.5?2*r*r:-1+(4-2*r)*r}function A(r){const e=r.getSelection();e&&e.removeAllRanges()}const tr=["a","area","audio","button","canvas","details","input","label","option","select","submit","textarea","video"],nr=["dialog","radiogroup","radio","menu","menuitem"];function Ht(r){return ir(r)?null:di(r)?r:r.parentElement?Ht(r.parentElement):null}function ir(r){return r?r.closest("[inert]")!==null||r.hasAttribute("disabled"):!0}function di(r){return r?r.role&&nr.includes(r.role)?!0:r.tagName.toLowerCase()==="iframe"?!1:r.tabIndex>=0?!0:tr.includes(r.nodeName.toLowerCase())||r.hasAttribute("contenteditable")&&r.getAttribute("contenteditable")?.toLowerCase()!=="false":!1}function mt(r,e){const t=ui(r,r.document.body,e),n=r._readium_cssSelectorGenerator.getCssSelector(t,{selectors:["tag","id","class","nthchild","nthoftype","attribute"]});return new N({href:"#",type:"application/xhtml+xml",locations:new E({otherLocations:new Map([["cssSelector",n]])}),text:new Q({highlight:t.textContent||void 0})})}function ui(r,e,t){for(var n=0;n<e.children.length;n++){const i=e.children[n];if(!ar(i)&&or(r,i,t))return rr(r,i)?i:ui(r,i,t)}return e}function or(r,e,t){if(e===document.body||e===document.documentElement)return!0;if(!document||!document.documentElement||!document.body)return!1;const n=e.getBoundingClientRect();return t?n.bottom>0&&n.top<r.innerHeight:n.right>0&&n.left<r.innerWidth}function rr(r,e){const t=e.getBoundingClientRect();return t.top>=0&&t.left>=0&&t.bottom<=r.innerHeight&&t.right<=r.innerWidth}function ar(r){const e=getComputedStyle(r);if(e){const t=e.getPropertyValue("display");if(t!="block"&&t!="list-item"||e.getPropertyValue("opacity")==="0")return!0}return!1}const sr={maxVelocity:200,minVariance:.01,historySize:20,minDirectionChanges:.2,maxConsistentScrolls:15},Dt={maxVelocity:200,minVariance:1e-5,historySize:100,minDirectionChanges:.1,maxConsistentScrolls:20},mi={maxSelectionsPerSecond:500,minVariance:50,historySize:20},lr={enabled:!0,maxSelectionPercent:.1,minThreshold:100,absoluteMaxChars:5e3,historySize:20};class pt{constructor(e={}){this.history=[],this.consistentScrollCount=0,this.options={...sr,...e}}analyze(e,t,n){if(n<=0)return!1;const i=Math.abs(t)/n,o=Date.now();if(this.history.push({timestamp:o,direction:e,velocity:i,distance:Math.abs(t)}),this.history=this.history.filter(p=>o-p.timestamp<2e3).slice(-(this.options.historySize||20)),this.history.length<3)return!1;if(i>this.options.maxVelocity)return this.resetAfterDetection(),!0;const a=this.history.map(p=>p.velocity),s=this.history.map(p=>p.distance),l=a.reduce((p,_)=>p+_,0)/a.length,d=s.reduce((p,_)=>p+_,0)/s.length,c=a.reduce((p,_)=>p+Math.pow(_-l,2),0)/a.length,h=s.reduce((p,_)=>p+Math.pow(_-d,2),0)/s.length;if(c<this.options.minVariance&&h<d*.1){if(this.consistentScrollCount++,this.consistentScrollCount>=(this.options.maxConsistentScrolls||10))return this.resetAfterDetection(),!0}else this.consistentScrollCount=Math.max(0,this.consistentScrollCount-1);let u=0,g=this.history[0].direction;for(let p=1;p<this.history.length;p++)this.history[p].direction!==g&&(u++,g=this.history[p].direction);return u/this.history.length>(this.options.minDirectionChanges||.3)?(this.resetAfterDetection(),!0):!1}resetAfterDetection(){this.history=this.history.slice(-3),this.consistentScrollCount=0}clear(){this.history=[],this.consistentScrollCount=0}}const pi="readium-column-snapper-style",cr=200,B=class B extends Ce{constructor(){super(...arguments),this.isSnapProtectionEnabled=!1,this.patternAnalyzer=null,this.lastTurnTime=0,this.rtl=!1,this.shakeTimeout=0,this.snappingCancelled=!1,this.alreadyScrollLeft=0,this.overscroll=0,this.cachedScrollWidth=0,this.touchState=0,this.startingX=void 0,this.endingX=void 0,this.onTouchStarter=this.onTouchStart.bind(this),this.onTouchEnder=this.onTouchEnd.bind(this),this.onWidthChanger=this.onWidthChange.bind(this),this.onTouchMover=this.onTouchMove.bind(this)}doc(){return this.wnd.document.scrollingElement}scrollOffset(){const e=this.doc().scrollLeft;return e!==0?e:this.alreadyScrollLeft}snapOffset(e){const t=e+(this.rtl?-1:1);return t-t%this.wnd.innerWidth}snapNormOffset(e){const t=e+1;return t-t%this.wnd.innerWidth}normScroll(){const e=this.doc().scrollLeft||this.alreadyScrollLeft;return this.rtl?Math.abs(e):Math.max(0,this.wnd.scrollX>0?this.wnd.scrollX:e)}reportProgress(){const e=this.cachedScrollWidth,t=this.wnd.innerWidth,n=this.normScroll(),i=Math.max(1,e-t),o=Math.max(0,Math.min(1,n/i)),a=Math.max(0,Math.min(1,(n+t)/e));this.comms.send("progress",{start:o,end:a})}shake(){if(this.overscroll!==0||this.shakeTimeout!==0)return;const e=this.doc(),t=this.normScroll()<5,n=this.rtl?t?"readium-bounce-r":"readium-bounce-l":"readium-bounce-r";e.classList.add(n);const i=this.scrollOffset();this.shakeTimeout=this.wnd.setTimeout(()=>{e.classList.remove(n),this.shakeTimeout=0,this.doc().scrollLeft=i},150)}takeOverSnap(){this.snappingCancelled=!0,this.clearTouches();const e=this.doc();this.overscroll=e.style.transform?.length>12?parseFloat(e.style.transform.slice(12).split("px")[0]):0}snapCurrentOffset(e=!1,t=!1){const n=this.doc(),i=ei(this.wnd),o=this.cachedScrollWidth-this.wnd.innerWidth,a=Math.min(Math.max(0,this.normScroll()),o),s=this.dragOffset(),l=this.rtl?-s:s,d=this.wnd.innerWidth/3*(l>0?2:1),c=Math.min(o,Math.max(0,this.snapNormOffset(a+d))),h=this.rtl?-c:c,u=this.rtl?-a:a,g=h>u?"right":"left";if(this.checkSuspiciousSnap(g,Math.abs(h-u)),e&&h!==u){this.snappingCancelled=!1;const m=(C,x,q,Te)=>q>Te?x:C+(x-C)*er(q/Te),p=cr*i;let _;const v=C=>{if(this.snappingCancelled)return;_||(_=C);const x=C-_,q=m(this.overscroll,0,x,p),Te=m(u,h,x,p);n.scrollLeft=Te,this.overscroll!==0&&(n.style.transform=`translate3d(${-q}px, 0px, 0px)`),x<p?this.wnd.requestAnimationFrame(v):(this.clearTouches(),n.style.removeProperty("transform"),n.scrollLeft=h,t||this.reportProgress())};this.wnd.requestAnimationFrame(v)}else n.style.removeProperty("transform"),this.wnd.requestAnimationFrame(()=>{n.scrollLeft=h,this.clearTouches(),t||this.reportProgress()})}dragOffset(){return(this.startingX??0)-(this.endingX??0)}clearTouches(){this.startingX=void 0,this.endingX=void 0,this.overscroll=0}onTouchStart(e){switch(e.stopPropagation(),this.takeOverSnap(),e.touches.length){case 1:break;case 2:this.onTouchEnd(e);return;default:{this.onTouchEnd(e),this.comms.send("tap_more",e.touches.length);return}}this.startingX=e.touches[0].clientX,this.alreadyScrollLeft=this.doc().scrollLeft,this.touchState=1}onTouchEnd(e){if(this.touchState===2){const t=this.dragOffset(),n=this.normScroll(),i=this.cachedScrollWidth-this.wnd.innerWidth,o=this.rtl?-t:t;this.cachedScrollWidth<=this.wnd.innerWidth?(this.reportProgress(),o>5&&this.comms.send("no_more",void 0),o<-5&&this.comms.send("no_less",void 0)):n<5&&o<5?(this.alreadyScrollLeft=0,this.comms.send("no_less",void 0)):i-n<5&&o>5&&(this.alreadyScrollLeft=this.rtl?-i:i,this.comms.send("no_more",void 0)),this.snapCurrentOffset(!0),this.comms.send("swipe",t)}this.touchState=0}onWidthChange(){this.cachedScrollWidth=this.doc().scrollWidth,this.comms.ready&&this.snapCurrentOffset()}onTouchMove(e){if(this.touchState===0)return;this.touchState===1&&(this.touchState=2,A(this.wnd)),this.endingX=e.touches[0].clientX;const t=this.dragOffset(),n=this.alreadyScrollLeft+t,i=this.rtl?-(this.cachedScrollWidth-this.wnd.innerWidth):0,o=this.rtl?0:this.cachedScrollWidth-this.wnd.innerWidth;n<i?(this.overscroll=n,this.doc().style.transform=`translate3d(${-this.overscroll}px, 0px, 0px)`):n>o?(this.overscroll=n,this.doc().style.transform=`translate3d(${-n}px, 0px, 0px)`):(this.overscroll=0,this.doc().style.removeProperty("transform"),this.doc().scrollLeft=n)}enableSnapProtection(){this.patternAnalyzer||(this.patternAnalyzer=new pt({maxVelocity:this.wnd.innerWidth,minVariance:.1,historySize:5,maxConsistentScrolls:3,minDirectionChanges:.3}),this.isSnapProtectionEnabled=!0,this.comms?.log("Snap protection enabled"))}checkSuspiciousSnap(e,t){if(!this.isSnapProtectionEnabled||!this.patternAnalyzer)return;const n=Date.now(),i=n-(this.lastTurnTime||n);this.lastTurnTime=n,this.patternAnalyzer.analyze(e,t,i)&&this.comms?.send("content_protection",{type:"suspicious_snapping",timestamp:Date.now(),event:null})}mount(e,t){if(this.wnd=e,this.comms=t,this.rtl=Go(e),!super.mount(e,t))return!1;e.navigator.epubReadingSystem&&(e.navigator.epubReadingSystem.layoutStyle="paginated");const n=e.document.createElement("style");n.dataset.readium="true",n.id=pi,n.textContent=`
        @keyframes readium-bounce-l-animation {
            0%, 100% {transform: translate3d(0, 0, 0);}
            50% {transform: translate3d(-50px, 0, 0);}
        }

        @keyframes readium-bounce-r-animation {
            0%, 100% {transform: translate3d(0, 0, 0);}
            50% {transform: translate3d(50px, 0, 0);}
        }

        .readium-bounce-l {
            animation: readium-bounce-l-animation 150ms ease-out 1;
        }

        .readium-bounce-r {
            animation: readium-bounce-r-animation 150ms ease-out 1;
        }

        html {
            overflow: hidden;
        }

        body {
            -ms-overflow-style: none; /* for Internet Explorer, Edge */
        }

        * {
            scrollbar-width: none; /* for Firefox */
        }

        body::-webkit-scrollbar {
            display: none; /* for Chrome, Safari, and Opera */
        }
        `,e.document.head.appendChild(n),this.resizeObserver=new ResizeObserver(()=>{e.requestAnimationFrame(()=>{e&&ni(e)}),this.onWidthChange()}),this.resizeObserver.observe(e.document.body),this.mutationObserver=new MutationObserver(a=>{for(const s of a)if(s.target===this.wnd.document.documentElement){const l=s.oldValue,d=s.target.getAttribute("style"),c=/transform\s*:\s*([^;]+)/,h=l?.match(c),u=d?.match(c);(!h&&!u&&Uo(l,d)||h&&!u||h&&u&&h[1]!==u[1])&&(e.requestAnimationFrame(()=>{e&&ni(e)}),this.onWidthChange())}else e.requestAnimationFrame(()=>this.cachedScrollWidth=this.doc().scrollWidth)}),e.frameElement&&this.mutationObserver.observe(e.frameElement,{attributes:!0,attributeFilter:["style"]}),this.mutationObserver.observe(e.document,{attributes:!0,attributeFilter:["style"]}),this.mutationObserver.observe(e.document.documentElement,{attributes:!0,attributeFilter:["style"]}),t.register("scroll_protection",B.moduleName,(a,s)=>{this.enableSnapProtection(),s(!0)});const i=a=>{const s=this.doc().scrollLeft;return this.doc().scrollLeft=this.snapOffset(a),s!==this.doc().scrollLeft},o=a=>{const s=this.doc().scrollLeft,l=this.snapNormOffset(Math.max(0,Math.min(this.cachedScrollWidth-e.innerWidth,a)));return this.doc().scrollLeft=-l,s!==this.doc().scrollLeft};return e.addEventListener("orientationchange",this.onWidthChanger),e.addEventListener("resize",this.onWidthChanger),e.requestAnimationFrame(()=>this.cachedScrollWidth=this.doc().scrollWidth),t.register("go_progression",B.moduleName,(a,s)=>{const l=a;if(l<0||l>1){t.send("error",{message:"go_progression must be given a position from 0.0 to 1.0"}),s(!1);return}this.wnd.requestAnimationFrame(()=>{this.cachedScrollWidth=this.doc().scrollWidth;const c=(this.cachedScrollWidth-e.innerWidth)*l;this.rtl?this.doc().scrollLeft=-this.snapNormOffset(c):this.doc().scrollLeft=this.snapOffset(c),this.reportProgress(),A(this.wnd),s(!0)})}),t.register("go_id",B.moduleName,(a,s)=>{const l=e.document.getElementById(a);if(!l){s(!1);return}this.wnd.requestAnimationFrame(()=>{this.rtl?this.doc().scrollLeft=-this.snapNormOffset(l.getBoundingClientRect().left+e.scrollX):this.doc().scrollLeft=this.snapOffset(l.getBoundingClientRect().left+e.scrollX),this.reportProgress(),A(this.wnd),s(!0)})}),t.register("go_text",B.moduleName,(a,s)=>{let l;Array.isArray(a)&&(a.length>1&&(l=a[1]),a=a[0]);const d=Q.deserialize(a),c=Me(this.wnd.document,new N({href:e.location.href,type:"text/html",text:d,locations:l?new E({otherLocations:new Map([["cssSelector",l]])}):void 0}));if(!c){s(!1);return}this.wnd.requestAnimationFrame(()=>{this.rtl?this.doc().scrollLeft=-this.snapNormOffset(c.getBoundingClientRect().left+e.scrollX):this.doc().scrollLeft=this.snapOffset(c.getBoundingClientRect().left+e.scrollX),this.reportProgress(),A(this.wnd),s(!0)})}),t.register("go_end",B.moduleName,(a,s)=>{this.wnd.requestAnimationFrame(()=>{this.cachedScrollWidth=this.doc().scrollWidth;let l;if(this.rtl?l=-this.snapNormOffset(this.cachedScrollWidth-e.innerWidth):l=this.snapOffset(this.cachedScrollWidth),this.doc().scrollLeft===l)return s(!1);this.doc().scrollLeft=l,this.reportProgress(),A(this.wnd),s(!0)})}),t.register("go_start",B.moduleName,(a,s)=>{this.wnd.requestAnimationFrame(()=>{if(this.doc().scrollLeft===0)return s(!1);this.doc().scrollLeft=0,this.reportProgress(),A(this.wnd),s(!0)})}),t.register("go_prev",B.moduleName,(a,s)=>{this.wnd.requestAnimationFrame(()=>{this.cachedScrollWidth=this.doc().scrollWidth;let l;this.rtl?l=o(this.normScroll()-e.innerWidth):l=i(e.scrollX-e.innerWidth),this.reportProgress(),l&&(A(this.wnd),this.checkSuspiciousSnap("left",this.wnd.innerWidth)),s(l)})}),t.register("go_next",B.moduleName,(a,s)=>{this.wnd.requestAnimationFrame(()=>{this.cachedScrollWidth=this.doc().scrollWidth;let l;this.rtl?l=o(this.normScroll()+e.innerWidth):l=i(e.scrollX+e.innerWidth),this.reportProgress(),l&&(A(this.wnd),this.checkSuspiciousSnap("right",this.wnd.innerWidth)),s(l)})}),t.register("unfocus",B.moduleName,(a,s)=>{this.snappingCancelled=!0,A(this.wnd),s(!0)}),t.register("shake",B.moduleName,(a,s)=>{this.shake(),s(!0)}),t.register("focus",B.moduleName,(a,s)=>{this.wnd.requestAnimationFrame(()=>{this.cachedScrollWidth=this.doc().scrollWidth,this.snapCurrentOffset(!1,!0),this.reportProgress(),s(!0)})}),t.register("first_visible_locator",B.moduleName,(a,s)=>{const l=mt(e,!1);this.comms.send("first_visible_locator",l.serialize()),s(!0)}),e.addEventListener("touchstart",this.onTouchStarter,{passive:!0}),e.addEventListener("touchend",this.onTouchEnder,{passive:!0}),e.addEventListener("touchmove",this.onTouchMover,{passive:!0}),e.document.addEventListener("touchstart",()=>{}),t.log("ColumnSnapper Mounted"),!0}unmount(e,t){return this.snappingCancelled=!0,t.unregisterAll(B.moduleName),this.resizeObserver.disconnect(),this.mutationObserver.disconnect(),this.patternAnalyzer&&(this.patternAnalyzer.clear(),this.patternAnalyzer=null,this.isSnapProtectionEnabled=!1),e.removeEventListener("touchstart",this.onTouchStarter),e.removeEventListener("touchend",this.onTouchEnder),e.removeEventListener("touchmove",this.onTouchMover),e.removeEventListener("orientationchange",this.onWidthChanger),e.removeEventListener("resize",this.onWidthChanger),e.document.getElementById(pi)?.remove(),t.log("ColumnSnapper Unmounted"),super.unmount(e,t)}};B.moduleName="column_snapper";let Wt=B;const gi="readium-scroll-snapper-style",j=class j extends Ce{constructor(){super(...arguments),this.patternAnalyzer=null,this.lastScrollTime=0,this.isScrollProtectionEnabled=!1,this.initialScrollHandled=!1,this.isScrolling=!1,this.lastScrollTop=0,this.isResizing=!1,this.resizeDebounce=null,this.handleScroll=e=>{if(this.comms.ready&&!this.isResizing){if(!this.initialScrollHandled){this.lastScrollTop=this.doc().scrollTop,this.initialScrollHandled=!0,this.reportProgress();return}this.isScrolling||(this.isScrolling=!0,this.wnd.requestAnimationFrame(()=>{this.reportProgress();const t=this.doc().scrollTop,n=t-this.lastScrollTop;if(this.lastScrollTop=t,this.isScrollProtectionEnabled&&Math.abs(n)>5){const i=Date.now(),o=i-(this.lastScrollTime||i);if(this.patternAnalyzer&&this.patternAnalyzer.analyze(n>0?"down":"up",Math.abs(n),o)){const s=e.target&&"tagName"in e.target?{tagName:e.target.tagName}:null;this.comms?.send("content_protection",{type:"suspicious_scrolling",timestamp:Date.now(),scrollDelta:n,scrollDirection:n>0?"down":"up",targetElement:s})}this.lastScrollTime=i}this.comms.send("scroll",n),this.isScrolling=!1}))}}}doc(){return this.wnd.document.scrollingElement}reportProgress(){if(!this.comms.ready)return;const e=Math.ceil(this.doc().scrollTop),t=this.doc().scrollHeight,n=this.wnd.innerHeight,i=Math.max(0,Math.min(1,e/t)),o=Math.max(0,Math.min(1,(e+n)/t));this.comms.send("progress",{start:i,end:o})}enableScrollProtection(){this.patternAnalyzer||(this.patternAnalyzer=new pt(Dt),this.isScrollProtectionEnabled=!0,this.comms?.log("Scroll protection enabled"))}mount(e,t){this.wnd=e,this.comms=t,this.initialScrollHandled=!1,this.lastScrollTop=0,this.isResizing=!1,this.resizeDebounce&&(this.wnd.clearTimeout(this.resizeDebounce),this.resizeDebounce=null),e.navigator.epubReadingSystem&&(e.navigator.epubReadingSystem.layoutStyle="scrolling");const n=e.document.createElement("style");return n.dataset.readium="true",n.id=gi,n.textContent=`
        * {
            scrollbar-width: none; /* for Firefox */
        }

        body::-webkit-scrollbar {
            display: none; /* for Chrome, Safari, and Opera */
        }
        `,e.document.head.appendChild(n),this.resizeObserver=new ResizeObserver(()=>{this.resizeDebounce&&this.wnd.clearTimeout(this.resizeDebounce),this.isResizing=!0,this.resizeDebounce=this.wnd.setTimeout(()=>{this.isResizing=!1,this.resizeDebounce=null,this.reportProgress()},50)}),this.resizeObserver.observe(e.document.body),e.addEventListener("scroll",this.handleScroll,{passive:!0}),t.register("force_webkit_recalc",j.moduleName,()=>{Mt(this.wnd);const i=this.doc().scrollTop;i>1?this.doc().scrollTop=i-1:this.doc().scrollTop=i+1,this.doc().scrollTop=i}),t.register("go_progression",j.moduleName,(i,o)=>{const a=i;if(a<0||a>1){t.send("error",{message:"go_progression must be given a position from 0.0 to 1.0"}),o(!1);return}this.wnd.requestAnimationFrame(()=>{this.doc().scrollTop=this.doc().offsetHeight*a,this.reportProgress(),A(this.wnd),o(!0)})}),t.register("go_id",j.moduleName,(i,o)=>{const a=e.document.getElementById(i);if(!a){o(!1);return}this.wnd.requestAnimationFrame(()=>{this.doc().scrollTop=a.getBoundingClientRect().top+e.scrollY-e.innerHeight/2,this.reportProgress(),A(this.wnd),o(!0)})}),t.register("go_text",j.moduleName,(i,o)=>{let a;Array.isArray(i)&&(i.length>1&&(a=i[1]),i=i[0]);const s=Q.deserialize(i),l=Me(this.wnd.document,new N({href:e.location.href,type:"text/html",text:s,locations:a?new E({otherLocations:new Map([["cssSelector",a]])}):void 0}));if(!l){o(!1);return}this.wnd.requestAnimationFrame(()=>{this.doc().scrollTop=l.getBoundingClientRect().top+e.scrollY-e.innerHeight/2,this.reportProgress(),A(this.wnd),o(!0)})}),t.register("go_start",j.moduleName,(i,o)=>{if(this.doc().scrollTop===0)return o(!1);this.doc().scrollTop=0,this.reportProgress(),o(!0)}),t.register("go_end",j.moduleName,(i,o)=>{if(this.doc().scrollTop===this.doc().scrollHeight-this.doc().offsetHeight)return o(!1);this.doc().scrollTop=this.doc().scrollHeight-this.doc().offsetHeight,this.reportProgress(),o(!0)}),t.register("unfocus",j.moduleName,(i,o)=>{A(this.wnd),o(!0)}),t.register("scroll_protection",j.moduleName,(i,o)=>{this.enableScrollProtection(),o(!0)}),t.register(["go_next","go_prev"],j.moduleName,(i,o)=>o(!1)),t.register("focus",j.moduleName,(i,o)=>{this.reportProgress(),o(!0)}),t.register("first_visible_locator",j.moduleName,(i,o)=>{const a=mt(e,!0);this.comms.send("first_visible_locator",a.serialize()),o(!0)}),t.log("ScrollSnapper Mounted"),!0}unmount(e,t){return t.unregisterAll(j.moduleName),this.resizeObserver.disconnect(),this.handleScroll&&e.removeEventListener("scroll",this.handleScroll),e.document.getElementById(gi)?.remove(),this.patternAnalyzer&&(this.patternAnalyzer.clear(),this.patternAnalyzer=null,this.isScrollProtectionEnabled=!1),t.log("ScrollSnapper Unmounted"),!0}};j.moduleName="scroll_snapper";let Bt=j;const G=class G extends Ce{constructor(){super(...arguments),this.patternAnalyzer=null,this.lastScrollTime=0,this.isScrollProtectionEnabled=!1,this.initialScrollHandled=!1,this.isScrolling=!1,this.lastScrollTop=0,this.isResizing=!1,this.resizeDebounce=null,this.handleScroll=e=>{if(this.comms.ready&&!this.isResizing){if(!this.initialScrollHandled){this.lastScrollTop=this.doc().scrollTop,this.initialScrollHandled=!0,this.reportProgress();return}this.isScrolling||(this.isScrolling=!0,this.wnd.requestAnimationFrame(()=>{this.reportProgress();const t=this.doc().scrollTop,n=t-this.lastScrollTop;if(this.lastScrollTop=t,this.isScrollProtectionEnabled&&Math.abs(n)>5){const i=Date.now(),o=i-(this.lastScrollTime||i);if(this.patternAnalyzer&&this.patternAnalyzer.analyze(n>0?"down":"up",Math.abs(n),o)){const s=e.target&&"tagName"in e.target?{tagName:e.target.tagName}:null;this.comms?.send("content_protection",{type:"suspicious_scrolling",timestamp:Date.now(),scrollDelta:n,scrollDirection:n>0?"down":"up",targetElement:s})}this.lastScrollTime=i}this.comms.send("scroll",n),this.isScrolling=!1}))}}}doc(){return this.wnd.document.scrollingElement}reportProgress(){if(!this.comms.ready)return;const e=Math.ceil(this.doc().scrollTop),t=this.doc().scrollHeight,n=this.wnd.innerHeight,i=Math.max(0,Math.min(1,e/t)),o=Math.max(0,Math.min(1,(e+n)/t));this.comms.send("progress",{start:i,end:o})}enableScrollProtection(){this.patternAnalyzer||(this.patternAnalyzer=new pt(Dt),this.isScrollProtectionEnabled=!0,this.comms?.log("Scroll protection enabled"))}mount(e,t){return this.wnd=e,this.comms=t,this.initialScrollHandled=!1,this.lastScrollTop=0,this.isResizing=!1,this.resizeDebounce&&(this.wnd.clearTimeout(this.resizeDebounce),this.resizeDebounce=null),this.resizeObserver=new ResizeObserver(()=>{this.resizeDebounce&&this.wnd.clearTimeout(this.resizeDebounce),this.isResizing=!0,this.resizeDebounce=this.wnd.setTimeout(()=>{this.isResizing=!1,this.resizeDebounce=null,this.reportProgress()},50)}),this.resizeObserver.observe(e.document.body),e.addEventListener("scroll",this.handleScroll,{passive:!0}),t.register("force_webkit_recalc",G.moduleName,()=>{Mt(this.wnd);const n=this.doc().scrollTop;n>1?this.doc().scrollTop=n-1:this.doc().scrollTop=n+1,this.doc().scrollTop=n}),t.register("go_progression",G.moduleName,(n,i)=>{const o=n;if(o<0||o>1){t.send("error",{message:"go_progression must be given a position from 0.0 to 1.0"}),i(!1);return}this.wnd.requestAnimationFrame(()=>{this.doc().scrollTop=this.doc().offsetHeight*o,this.reportProgress(),A(this.wnd),i(!0)})}),t.register("go_id",G.moduleName,(n,i)=>{const o=e.document.getElementById(n);if(!o){i(!1);return}this.wnd.requestAnimationFrame(()=>{this.doc().scrollTop=o.getBoundingClientRect().top+e.scrollY-e.innerHeight/2,this.reportProgress(),A(this.wnd),i(!0)})}),t.register("go_text",G.moduleName,(n,i)=>{let o;Array.isArray(n)&&(n.length>1&&(o=n[1]),n=n[0]);const a=Q.deserialize(n),s=Me(this.wnd.document,new N({href:e.location.href,type:"text/html",text:a,locations:o?new E({otherLocations:new Map([["cssSelector",o]])}):void 0}));if(!s){i(!1);return}this.wnd.requestAnimationFrame(()=>{this.doc().scrollTop=s.getBoundingClientRect().top+e.scrollY-e.innerHeight/2,this.reportProgress(),A(this.wnd),i(!0)})}),t.register("go_start",G.moduleName,(n,i)=>{if(this.doc().scrollTop===0)return i(!1);this.doc().scrollTop=0,this.reportProgress(),i(!0)}),t.register("go_end",G.moduleName,(n,i)=>{if(this.doc().scrollTop===this.doc().scrollHeight-this.doc().offsetHeight)return i(!1);this.doc().scrollTop=this.doc().scrollHeight-this.doc().offsetHeight,this.reportProgress(),i(!0)}),t.register("unfocus",G.moduleName,(n,i)=>{A(this.wnd),i(!0)}),t.register("scroll_protection",G.moduleName,(n,i)=>{this.enableScrollProtection(),i(!0)}),t.register(["go_next","go_prev"],G.moduleName,(n,i)=>i(!1)),t.register("focus",G.moduleName,(n,i)=>{this.reportProgress(),i(!0)}),t.register("first_visible_locator",G.moduleName,(n,i)=>{const o=mt(e,!0);t.send("first_visible_locator",o.serialize()),i(!0)}),t.log("WebPubSnapper Mounted"),!0}unmount(e,t){return t.unregisterAll(G.moduleName),this.resizeObserver.disconnect(),this.handleScroll&&e.removeEventListener("scroll",this.handleScroll),this.patternAnalyzer&&(this.patternAnalyzer.clear(),this.patternAnalyzer=null,this.isScrollProtectionEnabled=!1),t.log("WebPubSnapper Unmounted"),!0}};G.moduleName="webpub_snapper";let jt=G;class hr{constructor(e,t){this.window=e,this.copyHistory=[],this.lastSelectionLength=0,this.lastSelectionTime=0,this.options=t}cleanupOldHistory(e){this.copyHistory=this.copyHistory.filter(n=>e-n.timestamp<1e4),this.copyHistory.length>this.options.historySize&&(this.copyHistory=this.copyHistory.slice(-this.options.historySize))}isSuspiciousPattern(e){return this.copyHistory.length<3?!1:this.copyHistory.filter(i=>e-i.timestamp<2e3).length>=3?!0:this.copyHistory.slice().sort((i,o)=>i.timestamp-o.timestamp).every((i,o,a)=>o===0?!0:i.length>a[o-1].length*1.5)}shouldAllowCopy(e){if(!this.options.enabled)return!0;const t=this.window.getSelection();if(!t)return!0;const i=t.toString().length,o=this.window.document.body.innerText.length,a=Date.now();if(this.cleanupOldHistory(a),i<this.options.minThreshold)return this.copyHistory.push({timestamp:a,length:i,wasBlocked:!1}),!0;const l=a-this.lastSelectionTime<100&&i>this.lastSelectionLength*1.5,d=Math.min(o*this.options.maxSelectionPercent,this.options.absoluteMaxChars),c=this.isSuspiciousPattern(a),h=i>d||l||c;return this.copyHistory.push({timestamp:a,length:i,wasBlocked:h}),h?(e?.preventDefault(),!1):(this.lastSelectionLength=i,this.lastSelectionTime=a,!0)}destroy(){this.lastSelectionLength=0,this.lastSelectionTime=0,this.copyHistory=[],this.options.enabled=!1}}class dr{constructor(e=mi){this.options=e,this.events=[],this.selectionStartTime=0,this.lastSelectionTime=0,this.lastSelectionPosition=0,this.selectionPatterns=[],this.lastSelectedText=""}analyze(e){if(!e)return this.clear(),!1;const t=e.toString();if(t.length===0)return this.clear(),!1;if(e.type!=="Range"||!e.rangeCount)return!1;const n=Date.now();if(t.length<=50||t===this.lastSelectedText)return!1;if(this.selectionStartTime===0)return this.selectionStartTime=n,this.lastSelectedText=t,!1;if(n-this.selectionStartTime<500)return!1;n-this.lastSelectionTime>1e3&&(this.lastSelectionTime=n),this.selectionStartTime===0&&(this.selectionStartTime=n),this.lastSelectedText=t;const o=this.analyzeSelectionPattern(e,n);return this.cleanup(n),o}analyzeSelectionPattern(e,t){if(!e.rangeCount)return!1;const n=e.getRangeAt(0),i=n.toString(),o=(t-this.selectionStartTime)/1e3;if(i.length/Math.max(1,o)>this.options.maxSelectionsPerSecond)return!0;const s=n.startOffset,l=Math.abs(s-this.lastSelectionPosition);return this.selectionPatterns.push(l),this.selectionPatterns.length>this.options.historySize&&(this.selectionPatterns.shift(),this.calculateVariance(this.selectionPatterns)<this.options.minVariance)?!0:(this.lastSelectionPosition=s,!1)}calculateVariance(e){if(e.length===0)return 0;const t=e.reduce((n,i)=>n+i,0)/e.length;return e.reduce((n,i)=>n+Math.pow(i-t,2),0)/e.length}cleanup(e){this.events=this.events.filter(t=>e-t.timestamp<=1e3)}clear(){this.events=[],this.selectionStartTime=0,this.lastSelectionTime=0,this.lastSelectionPosition=0,this.selectionPatterns=[],this.lastSelectedText=""}}class fi{match(e,t){for(const n of t)if(this.matchesCombo(e,n))return!0;return!1}matchesCombo(e,t){return e.keyCode===t.keyCode&&this.matchesModifier(e.ctrlKey,t.ctrl)&&this.matchesModifier(e.shiftKey,t.shift)&&this.matchesModifier(e.altKey,t.alt)&&this.matchesModifier(e.metaKey,t.meta)}matchesModifier(e,t){return t===void 0?!e:e===t}createKeyHandler(e,t){return n=>{this.match(n,e)&&(n.preventDefault(),n.stopPropagation(),t(n))}}createActivityEvent(e,t,n,i){let o,a;if(i){const s=i.getSelection(),l=s?.toString()||"",c=(l&&s?.rangeCount?s.getRangeAt(0)?.getClientRects():null)?.[0];c&&l&&(o={text:l,x:c.x,y:c.y,width:c.width,height:c.height});const h=i.document.activeElement;h&&h!==i.document.body&&(a=Ht(h)?.outerHTML)}return{type:t,timestamp:Date.now(),key:e.key,code:e.code,keyCode:e.keyCode,ctrlKey:e.ctrlKey,altKey:e.altKey,shiftKey:e.shiftKey,metaKey:e.metaKey,targetFrameSrc:n,selectedText:o,interactiveElement:a}}createKeyboardHandlers(e,t,n,i){const o=[];return t.forEach(a=>{o.push(...a.keyCombos.map(s=>({...s,handler:l=>{const d=a.type,c=this.createActivityEvent(l,d,e,i);n(c)}})))}),o}createUnifiedHandler(e,t,n,i){const o=this.createKeyboardHandlers(e,t,n,i);return a=>{if(a.isTrusted){for(const s of o)if(this.match(a,[s])){const l=s.suppressOnInteractiveElement;if(l){const d=(i?.document??document).activeElement;if(Array.isArray(l)?l.some(c=>d?.matches(c)):di(d))return}a.preventDefault(),a.stopPropagation(),s.handler(a);return}}}}}const ye=class ye extends ve{constructor(){super(...arguments),this.configApplied=!1,this.cleanupCallbacks=[],this.pointerMoved=!1,this.isContextMenuEnabled=!1,this.isDragAndDropEnabled=!1,this.isSelectionMonitoringEnabled=!1,this.isBulkCopyProtectionEnabled=!1,this.selectionAnalyzer=null,this.currentSelection=null,this.bulkCopyProtector=null,this.keyManager=new fi,this.keyDownHandler=null,this.preventBulkCopy=e=>{if(!this.isBulkCopyProtectionEnabled||!this.bulkCopyProtector)return!0;if(!this.bulkCopyProtector.shouldAllowCopy(e)){e.preventDefault();const t=this.wnd.getSelection(),n=t?.toString()||"",o=(n?t?.getRangeAt(0)?.getClientRects():null)?.[0],a={type:"bulk_copy",timestamp:Date.now(),clipboardTypes:e.clipboardData?.types?[...e.clipboardData.types]:[],selectedText:o?{text:n,x:o.x,y:o.y,width:o.width,height:o.height}:void 0,selectionLength:n.length,targetFrameSrc:this.wnd.location.href};return this.comms?.send("content_protection",a),!1}return!0},this.handleSelection=e=>{if(!this.isSelectionMonitoringEnabled||!this.wnd||!this.selectionAnalyzer)return;const t=this.wnd.getSelection();if(t){if(this.currentSelection=t.toString(),this.selectionAnalyzer.analyze(t)&&this.currentSelection){const i=this.wnd.getSelection(),o=i?.toString()||"",s=(o&&i?.rangeCount?i.getRangeAt(0)?.getClientRects():null)?.[0],l={type:"suspicious_selection",timestamp:Date.now(),selectionLength:o.length,selectedText:{text:o,x:s?.x??0,y:s?.y??0,width:s?.width??0,height:s?.height??0},eventType:e?.type||"selectionchange",targetFrameSrc:this.wnd.location.href};this.comms?.send("content_protection",l)}}else this.currentSelection=null},this.onDragOver=e=>{this.isDragAndDropEnabled&&(e.preventDefault(),e.stopPropagation())},this.onDragStart=e=>{if(this.isDragAndDropEnabled){e.preventDefault();const t={type:"drag_detected",timestamp:Date.now(),dataTransferTypes:e.dataTransfer?.types?[...e.dataTransfer.types]:[],targetFrameSrc:this.wnd.location.href};return this.comms?.send("content_protection",t),!1}else return!0},this.onDrop=e=>{if(this.isDragAndDropEnabled){e.preventDefault();const t=e.dataTransfer,n={type:"drop_detected",timestamp:Date.now(),dataTransferTypes:t?.types?[...t.types]:[],fileCount:t?.files?.length||0,targetFrameSrc:this.wnd.location.href};return this.comms?.send("content_protection",n),!1}else return!0},this.onContext=e=>{if(this.isContextMenuEnabled){e.preventDefault();const t=this.wnd.getSelection(),n=t?.toString()||"",o=(n&&t?.rangeCount?t.getRangeAt(0)?.getClientRects():null)?.[0],a={timestamp:Date.now(),clientX:e.clientX,clientY:e.clientY,...o&&{selectedText:{text:n,x:o.x,y:o.y,width:o.width,height:o.height}},targetFrameSrc:this.wnd.location.href};this.comms?.send("context_menu",a)}},this.onPointerUp=this.onPointUp.bind(this),this.onPointerMove=this.onPointMove.bind(this),this.onPointerDown=this.onPointDown.bind(this),this.onClicker=this.onClick.bind(this)}addContextMenuPrevention(){this.isContextMenuEnabled||!this.wnd||(this.wnd.document.addEventListener("contextmenu",this.onContext),this.isContextMenuEnabled=!0)}removeContextMenuPrevention(){!this.isContextMenuEnabled||!this.wnd||(this.wnd.document.removeEventListener("contextmenu",this.onContext),this.isContextMenuEnabled=!1)}addDragAndDropPrevention(){this.isDragAndDropEnabled||!this.wnd||(this.wnd.document.addEventListener("dragstart",this.onDragStart),this.wnd.document.addEventListener("dragover",this.onDragOver),this.wnd.document.addEventListener("drop",this.onDrop),this.isDragAndDropEnabled=!0)}removeDragAndDropPrevention(){!this.isDragAndDropEnabled||!this.wnd||(this.wnd.document.removeEventListener("dragstart",this.onDragStart),this.wnd.document.removeEventListener("dragover",this.onDragOver),this.wnd.document.removeEventListener("drop",this.onDrop),this.isDragAndDropEnabled=!1)}enableKeyboardPeripherals(e=[]){this.disableKeyboardPeripherals();const t=n=>{this.comms?.send("keyboard_peripherals",n)};this.keyDownHandler=this.keyManager.createUnifiedHandler(this.wnd.location.href,e,t,this.wnd),this.wnd&&this.wnd.document.addEventListener("keydown",this.keyDownHandler,{capture:!0})}disableKeyboardPeripherals(){this.wnd&&this.keyDownHandler&&(this.wnd.document.removeEventListener("keydown",this.keyDownHandler,{capture:!0}),this.keyDownHandler=null)}addBulkCopyProtection(e={}){if(this.isBulkCopyProtectionEnabled||!this.wnd)return;const t=lr,n=e?{...t,...e}:t;this.bulkCopyProtector=new hr(this.wnd,n),this.wnd.document.addEventListener("copy",this.preventBulkCopy,!0),this.wnd.document.addEventListener("cut",this.preventBulkCopy,!0),this.isBulkCopyProtectionEnabled=!0}removeBulkCopyProtection(){!this.isBulkCopyProtectionEnabled||!this.wnd||(this.wnd.document.removeEventListener("copy",this.preventBulkCopy,!0),this.wnd.document.removeEventListener("cut",this.preventBulkCopy,!0),this.bulkCopyProtector?.destroy(),this.bulkCopyProtector=null,this.isBulkCopyProtectionEnabled=!1)}addSelectionMonitoring(e){if(this.isSelectionMonitoringEnabled||!this.wnd)return;const t=e||mi;this.selectionAnalyzer=new dr(t),this.wnd.document.addEventListener("selectionchange",this.handleSelection),this.isSelectionMonitoringEnabled=!0}removeSelectionMonitoring(){!this.isSelectionMonitoringEnabled||!this.wnd||(this.wnd.document.removeEventListener("selectionchange",this.handleSelection),this.selectionAnalyzer?.clear(),this.selectionAnalyzer=null,this.isSelectionMonitoringEnabled=!1)}onPointUp(e){const t=this.wnd.getSelection();if(t&&t.toString()?.length>0){const i=t.getRangeAt(0)?.getClientRects();if(!i||i.length===0)return;const o=i[0],a={text:t.toString(),x:o.x,y:o.y,width:o.width,height:o.height,targetFrameSrc:this.wnd?.location?.href};this.comms.send("text_selected",a)}if(this.pointerMoved){this.pointerMoved=!1;return}if(!t?.isCollapsed||!e.isPrimary)return;const n=this.wnd.devicePixelRatio;e.preventDefault(),this.comms.send(e.pointerType==="touch"?"tap":"click",{defaultPrevented:e.defaultPrevented,x:e.clientX*n,y:e.clientY*n,targetFrameSrc:this.wnd.location.href,targetElement:e.target.outerHTML,interactiveElement:Ht(e.target)?.outerHTML,cssSelector:this.wnd._readium_cssSelectorGenerator.getCssSelector(e.target)}),this.pointerMoved=!1}onPointMove(e){if(e.movementY!==void 0&&e.movementX!==void 0){(Math.abs(e.movementX)>1||Math.abs(e.movementY)>1)&&(this.pointerMoved=!0);return}this.pointerMoved=!0}onPointDown(){this.pointerMoved=!1}onClick(e){if(e.preventDefault(),!e.isTrusted){const t=new PointerEvent("pointerup",{isPrimary:!0,pointerType:"mouse",clientX:e.clientX,clientY:e.clientY});Object.defineProperty(t,"target",{writable:!1,value:e.target}),Object.defineProperty(t,"defaultPrevented",{writable:!1,value:e.defaultPrevented}),this.onPointUp(t)}}registerProtectionHandlers(){this.comms?.register("peripherals_protection",ye.moduleName,(e,t)=>{const n=e;if(!this.configApplied){if(this.configApplied=!0,n.monitorSelection){const i=typeof n.monitorSelection=="boolean"?void 0:n.monitorSelection;this.addSelectionMonitoring(i),this.comms?.log("Selection monitoring enabled")}typeof n.protectCopy=="object"?(this.addBulkCopyProtection({enabled:!0,...n.protectCopy}),this.comms?.log("Copy protection enabled (limited)")):n.protectCopy===!0&&(this.addBulkCopyProtection({enabled:!0,maxSelectionPercent:0,minThreshold:0,absoluteMaxChars:0}),this.comms?.log("Copy protection enabled")),n.disableContextMenu&&(this.addContextMenuPrevention(),this.comms?.log("Context menu protection enabled")),n.disableDragAndDrop&&(this.addDragAndDropPrevention(),this.comms?.log("Drag and drop protection enabled"))}t(!0)}),this.comms?.register("unfocus",ye.moduleName,(e,t)=>{this.disableKeyboardPeripherals(),t(!0)}),this.comms?.register("keyboard_peripherals",ye.moduleName,(e,t)=>{const n=e;n&&n.length>0&&(this.enableKeyboardPeripherals(n),this.comms?.log(`Keyboard peripherals enabled: ${n.map(i=>i.type).join(", ")}`)),t(!0)})}mount(e,t){return this.wnd=e,this.comms=t,this.registerProtectionHandlers(),e.document.addEventListener("pointerdown",this.onPointerDown),e.document.addEventListener("pointerup",this.onPointerUp),e.document.addEventListener("pointermove",this.onPointerMove),e.document.addEventListener("click",this.onClicker),t.log("Peripherals Mounted"),!0}unmount(e,t){return this.removeBulkCopyProtection(),this.removeSelectionMonitoring(),this.removeContextMenuPrevention(),this.removeDragAndDropPrevention(),this.disableKeyboardPeripherals(),this.cleanupCallbacks.forEach(n=>n()),this.cleanupCallbacks=[],e.document.removeEventListener("pointerdown",this.onPointerDown),e.document.removeEventListener("pointerup",this.onPointerUp),e.document.removeEventListener("pointermove",this.onPointerMove),e.document.removeEventListener("click",this.onClicker),t.unregisterAll(ye.moduleName),this.configApplied=!1,t.log("Peripherals Unmounted"),!0}};ye.moduleName="peripherals";let Gt=ye;const nt=class nt extends ve{constructor(){super(...arguments),this.mediaPlayingCount=0,this.allAnimations=new Set}wndOnErr(e){this.comms?.send("error",{message:e.message,filename:e.filename,lineno:e.lineno,colno:e.colno})}unblock(e){for(e._readium_blockEvents=!1;e._readium_blockedEvents?.length>0;){const t=e._readium_blockedEvents.shift();switch(t[0]){case 0:Reflect.apply(t[1],t[2],t[3]);break;case 1:const n=t[1],i=t[2];e.removeEventListener(n.type,e._readium_eventBlocker,!0);const o=new Event(n.type,{bubbles:n.bubbles,cancelable:n.cancelable});i?i.dispatchEvent(o):e.dispatchEvent(o);break}}}onMediaPlayEvent(){this.mediaPlayingCount++,this.comms?.send("media_play",this.mediaPlayingCount)}onMediaPauseEvent(){this.mediaPlayingCount>0&&this.mediaPlayingCount--,this.comms?.send("media_pause",this.mediaPlayingCount)}pauseAllMedia(e){const t=e.document.querySelectorAll("audio,video");for(let n=0;n<t.length;n++)t[n].pause()}mount(e,t){this.comms=t,e.addEventListener("error",this.wndOnErr,!1),Reflect.defineProperty(e.navigator,"epubReadingSystem",{value:{name:"readium-ts-toolkit",version:"2.6.1",hasFeature:(i,o="")=>{switch(i){case"dom-manipulation":return!0;case"layout-changes":return!0;case"touch-events":return!0;case"mouse-events":return!0;case"keyboard-events":return!0;case"spine-scripting":return!0;case"embedded-web-content":return!0;default:return!1}}},writable:!1}),"getAnimations"in e.document&&e.document.getAnimations().forEach(i=>{i.cancel(),this.allAnimations.add(i)}),t.register("activate",nt.moduleName,(i,o)=>{this.allAnimations.forEach(a=>{a.cancel(),a.play()}),o(!0)}),t.register("unfocus",nt.moduleName,(i,o)=>{this.pauseAllMedia(e),this.allAnimations.forEach(a=>a.pause()),o(!0)});const n=e.document.querySelectorAll("audio,video");for(let i=0;i<n.length;i++){const o=n[i];o.addEventListener("play",this.onMediaPlayEvent,{passive:!0}),o.addEventListener("pause",this.onMediaPauseEvent,{passive:!0})}return t.log("Setup Mounted"),!0}unmount(e,t){return e.removeEventListener("error",this.wndOnErr),e.removeEventListener("play",this.onMediaPlayEvent),e.removeEventListener("pause",this.onMediaPauseEvent),this.allAnimations.forEach(n=>n.cancel()),this.allAnimations.clear(),t.log("Setup Unmounted"),!0}};nt.moduleName="setup";let gt=nt;const yi="readium-viewport",re=class re extends gt{onViewportWidthChanged(e){const t=e.target;Ue(t,"--RS__viewportWidth",`${t.innerWidth}px`)}mount(e,t){if(!super.mount(e,t))return!1;const n=e.document.createElement("meta");return n.dataset.readium="true",n.setAttribute("name","viewport"),n.setAttribute("id",yi),n.setAttribute("content","width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no"),e.document.head.appendChild(n),e.addEventListener("orientationchange",this.onViewportWidthChanged),e.addEventListener("resize",this.onViewportWidthChanged),this.onViewportWidthChanged({target:e}),t.register("get_properties",re.moduleName,(i,o)=>{Lt(e),o(!0)}),t.register("update_properties",re.moduleName,(i,o)=>{i["--RS__viewportWidth"]=`${e.innerWidth}px`,qn(e,i),o(!0)}),t.register("set_property",re.moduleName,(i,o)=>{const a=i;Ue(e,a[0],a[1]),o(!0)}),t.register("remove_property",re.moduleName,(i,o)=>{ct(e,i),o(!0)}),t.register("activate",re.moduleName,(i,o)=>{this.unblock(e),o(!0)}),t.log("ReflowableSetup Mounted"),!0}unmount(e,t){return t.unregisterAll(re.moduleName),e.document.head.querySelector(`#${yi}`)?.remove(),e.removeEventListener("orientationchange",this.onViewportWidthChanged),t.log("ReflowableSetup Unmounted"),super.unmount(e,t)}};re.moduleName="reflowable_setup";let Vt=re;const Si="readium-fixed-style",ne=class ne extends gt{mount(e,t){if(!super.mount(e,t))return!1;e.navigator.epubReadingSystem&&(e.navigator.epubReadingSystem.layoutStyle="paginated");const n=e.document.createElement("style");return n.id=Si,n.dataset.readium="true",n.textContent=`
        html, body {
            text-size-adjust: none;
            -ms-text-size-adjust: none;
            -webkit-text-size-adjust: none;
            -moz-text-size-adjust: none;

            /* Fight Safari pinches */
            touch-action: none !important;
            min-height: 100%;

            /*cursor: var() TODO*/
        }`,e.document.head.appendChild(n),t.register("set_property",ne.moduleName,(i,o)=>{const a=i;Ue(e,a[0],a[1]),o(!0)}),t.register("remove_property",ne.moduleName,(i,o)=>{ct(e,i),o(!0)}),t.register("first_visible_locator",ne.moduleName,(i,o)=>o(!1)),t.register("unfocus",ne.moduleName,(i,o)=>{A(e),o(!0)}),t.register(["focus","go_next","go_prev","go_id","go_end","go_start","go_text","go_progression"],ne.moduleName,(i,o)=>o(!0)),t.register("activate",ne.moduleName,(i,o)=>{this.unblock(e),o(!0)}),t.log("FixedSetup Mounted"),!0}unmount(e,t){return t.unregisterAll(ne.moduleName),e.document.getElementById(Si)?.remove(),t.log("FixedSetup Unmounted"),super.unmount(e,t)}};ne.moduleName="fixed_setup";let $t=ne;const ae=class ae extends ve{wndOnErr(e){this.comms?.send("error",{message:e.message,filename:e.filename,lineno:e.lineno,colno:e.colno})}mount(e,t){return this.comms=t,e.addEventListener("error",this.wndOnErr,!1),t.register("get_properties",ae.moduleName,(n,i)=>{Lt(e),i(!0)}),t.register("update_properties",ae.moduleName,(n,i)=>{qn(e,n),i(!0)}),t.register("set_property",ae.moduleName,(n,i)=>{const o=n;Ue(e,o[0],o[1]),i(!0)}),t.register("remove_property",ae.moduleName,(n,i)=>{ct(e,n),i(!0)}),t.register("activate",ae.moduleName,(n,i)=>{i(!0)}),t.log("WebPubSetup Mounted"),!0}unmount(e,t){return t.unregisterAll(ae.moduleName),e.removeEventListener("error",this.wndOnErr),t.log("WebPubSetup Unmounted"),!0}};ae.moduleName="webpub_setup";let Kt=ae,ur=(le=class extends ve{constructor(){super(...arguments),this.styleElement=null,this.beforePrintHandler=null,this.configApplied=!1}setupPrintProtection(e,t){if(!t.disable)return;const n=e.document.createElement("style");n.textContent=`
            @media print {
                body * {
                    display: none !important;
                }
                body::after {
                    content: "${t.watermark||"Printing has been disabled"}";
                    font-size: 200%;
                    display: block;
                    text-align: center;
                    margin-top: 50vh;
                    transform: translateY(-50%);
                }
            }
        `,e.document.head.appendChild(n),this.styleElement=n,this.beforePrintHandler=i=>(i.preventDefault(),!1),e.addEventListener("beforeprint",this.beforePrintHandler)}registerPrintHandlers(){this.comms?.register("print_protection",le.moduleName,e=>{const t=e;return this.configApplied||(this.configApplied=!0,this.setupPrintProtection(this.wnd,t),this.comms?.log("Print protection configuration applied")),!0})}mount(e,t){return this.wnd=e,this.comms=t,this.registerPrintHandlers(),!0}unmount(e,t){return this.beforePrintHandler&&(e.removeEventListener("beforeprint",this.beforePrintHandler),this.beforePrintHandler=null),this.styleElement?.parentNode&&(this.styleElement.parentNode.removeChild(this.styleElement),this.styleElement=null),this.comms?.unregisterAll(le.moduleName),this.configApplied=!1,!0}},le.moduleName="print_protection",le);const _i="readium-cjk-vertical-snapper-style",V=class V extends Ce{constructor(){super(...arguments),this.patternAnalyzer=null,this.lastScrollTime=0,this.isScrollProtectionEnabled=!1,this.initialScrollHandled=!1,this.isScrolling=!1,this.lastScrollLeft=0,this.isResizing=!1,this.resizeDebounce=null,this.verticalLR=!1,this.handleScroll=e=>{if(this.comms.ready&&!this.isResizing){if(!this.initialScrollHandled){this.lastScrollLeft=Math.abs(this.doc().scrollLeft),this.initialScrollHandled=!0,this.reportProgress();return}this.isScrolling||(this.isScrolling=!0,this.wnd.requestAnimationFrame(()=>{this.reportProgress();const t=Math.abs(this.doc().scrollLeft),n=t-this.lastScrollLeft;if(this.lastScrollLeft=t,this.isScrollProtectionEnabled&&Math.abs(n)>5){const i=Date.now(),o=i-(this.lastScrollTime||i);if(this.patternAnalyzer&&this.patternAnalyzer.analyze(n>0?"down":"up",Math.abs(n),o)){const s=e.target&&"tagName"in e.target?{tagName:e.target.tagName}:null;this.comms?.send("content_protection",{type:"suspicious_scrolling",timestamp:Date.now(),scrollDelta:n,scrollDirection:n>0?"left":"right",targetElement:s})}this.lastScrollTime=i}this.comms.send("scroll",n),this.isScrolling=!1}))}}}doc(){return this.wnd.document.scrollingElement}scrollable(){return Math.max(0,this.doc().scrollWidth-this.wnd.innerWidth)}reportProgress(){if(!this.comms.ready)return;const e=this.doc().scrollWidth,t=this.wnd.innerWidth,n=Math.max(1,e-t),i=Math.abs(this.doc().scrollLeft),o=Math.max(0,Math.min(1,i/n)),a=Math.max(0,Math.min(1,(i+t)/e));this.comms.send("progress",{start:o,end:a})}enableScrollProtection(){this.patternAnalyzer||(this.patternAnalyzer=new pt(Dt),this.isScrollProtectionEnabled=!0,this.comms?.log("Scroll protection enabled"))}mount(e,t){this.wnd=e,this.comms=t,this.initialScrollHandled=!1,this.lastScrollLeft=0,this.isResizing=!1,this.verticalLR=Qn(e),this.resizeDebounce&&(this.wnd.clearTimeout(this.resizeDebounce),this.resizeDebounce=null),e.navigator.epubReadingSystem&&(e.navigator.epubReadingSystem.layoutStyle="scrolling");const n=e.document.createElement("style");return n.dataset.readium="true",n.id=_i,n.textContent=`
        * {
            scrollbar-width: none;
        }
        body::-webkit-scrollbar {
            display: none;
        }
        html {
            overflow-x: auto !important;
            overflow-y: hidden !important;
        }
        `,e.document.head.appendChild(n),this.resizeObserver=new ResizeObserver(()=>{this.resizeDebounce&&this.wnd.clearTimeout(this.resizeDebounce),this.isResizing=!0,this.resizeDebounce=this.wnd.setTimeout(()=>{this.isResizing=!1,this.resizeDebounce=null,this.reportProgress()},50)}),this.resizeObserver.observe(e.document.body),e.addEventListener("scroll",this.handleScroll,{passive:!0}),t.register("force_webkit_recalc",V.moduleName,()=>{Mt(this.wnd);const i=this.doc().scrollLeft;this.verticalLR?this.doc().scrollLeft=i>1?i-1:i+1:this.doc().scrollLeft=i<-1?i+1:i-1,this.doc().scrollLeft=i}),t.register("go_progression",V.moduleName,(i,o)=>{const a=i;if(a<0||a>1){t.send("error",{message:"go_progression must be given a position from 0.0 to 1.0"}),o(!1);return}this.wnd.requestAnimationFrame(()=>{const s=this.scrollable()*a;this.doc().scrollLeft=this.verticalLR?s:-s,this.reportProgress(),A(this.wnd),o(!0)})}),t.register("go_id",V.moduleName,(i,o)=>{const a=e.document.getElementById(i);if(!a){o(!1);return}this.wnd.requestAnimationFrame(()=>{this.doc().scrollLeft+=a.getBoundingClientRect().left-e.innerWidth/2,this.reportProgress(),A(this.wnd),o(!0)})}),t.register("go_text",V.moduleName,(i,o)=>{let a;Array.isArray(i)&&(i.length>1&&(a=i[1]),i=i[0]);const s=Q.deserialize(i),l=Me(this.wnd.document,new N({href:e.location.href,type:"text/html",text:s,locations:a?new E({otherLocations:new Map([["cssSelector",a]])}):void 0}));if(!l){o(!1);return}this.wnd.requestAnimationFrame(()=>{this.doc().scrollLeft+=l.getBoundingClientRect().left-e.innerWidth/2,this.reportProgress(),A(this.wnd),o(!0)})}),t.register("go_start",V.moduleName,(i,o)=>{if(this.doc().scrollLeft===0)return o(!1);this.doc().scrollLeft=0,this.reportProgress(),o(!0)}),t.register("go_end",V.moduleName,(i,o)=>{if(Math.abs(this.doc().scrollLeft)===this.scrollable())return o(!1);this.doc().scrollLeft=this.verticalLR?this.scrollable():-this.scrollable(),this.reportProgress(),o(!0)}),t.register(["go_next","go_prev"],V.moduleName,(i,o)=>o(!1)),t.register("unfocus",V.moduleName,(i,o)=>{A(this.wnd),o(!0)}),t.register("scroll_protection",V.moduleName,(i,o)=>{this.enableScrollProtection(),o(!0)}),t.register("focus",V.moduleName,(i,o)=>{this.reportProgress(),o(!0)}),t.register("first_visible_locator",V.moduleName,(i,o)=>{const a=mt(e,!0);this.comms.send("first_visible_locator",a.serialize()),o(!0)}),t.log("CJKVerticalSnapper Mounted"),!0}unmount(e,t){return t.unregisterAll(V.moduleName),this.resizeObserver.disconnect(),this.handleScroll&&e.removeEventListener("scroll",this.handleScroll),e.document.getElementById(_i)?.remove(),this.patternAnalyzer&&(this.patternAnalyzer.clear(),this.patternAnalyzer=null,this.isScrollProtectionEnabled=!1),t.log("CJKVerticalSnapper Unmounted"),!0}};V.moduleName="cjk_vertical_snapper";let Xt=V;const mr=["fixed_setup","decorator","peripherals","print_protection"],pr=["reflowable_setup","decorator","peripherals","column_snapper","scroll_snapper","cjk_vertical_snapper","print_protection"],gr=["webpub_setup","webpub_snapper","decorator","peripherals","print_protection"],Yt=new Map([$t,Vt,Kt,jt,Gt,It,Wt,Bt,Xt,ur].map(r=>[r.moduleName,r]));class ke{constructor(e=window,t=[]){this.loadedModules=[],this.wnd=e,this.comms=new Co(e);const n=[...new Set(t)];if(n.length){if(typeof e>"u")throw Error("Loader is not in a web browser");e.parent!==e&&this.comms.log("Loader is probably in a frame"),this.loadedModules=n.map(i=>{const o=this.loadModule(i);if(o)return o.mount(this.wnd,this.comms),o}).filter(i=>i!==void 0)}}loadModule(e){const t=Yt.get(e);return t===void 0?(this.comms.log(`Module "${name}" does not exist in the library`),t):new t}addModule(e){const t=this.loadModule(e);return!t||!t.mount(this.wnd,this.comms)?!1:(this.loadedModules.push(t),!0)}removeModule(e){const t=Yt.get(e);if(t===void 0)return this.comms.log(`Module "${e}" does not exist in the library`),!1;const n=this.loadedModules.findIndex(i=>i instanceof t);return n<0?!1:(this.loadedModules[n].unmount(this.wnd,this.comms),this.loadedModules.splice(n,1),!0)}destroy(){this.comms.destroy(),this.loadedModules.forEach(e=>e.unmount(this.wnd,this.comms)),this.loadedModules=[]}}const fr={type:"developer_tools",keyCombos:[{keyCode:73,meta:!0,alt:!0},{keyCode:73,ctrl:!0,shift:!0},{keyCode:74,meta:!0,alt:!0},{keyCode:74,ctrl:!0,shift:!0},{keyCode:85,meta:!0,alt:!0},{keyCode:67,meta:!0,alt:!0},{keyCode:67,meta:!0,shift:!0},{keyCode:67,ctrl:!0,shift:!0},{keyCode:65,meta:!0,alt:!0},{keyCode:84,meta:!0,shift:!0,alt:!0},{keyCode:67,shift:!0,alt:!0},{keyCode:123},{keyCode:123,shift:!0},{keyCode:123,ctrl:!0,shift:!0},{keyCode:123,meta:!0,alt:!0}]},yr={type:"select_all",keyCombos:[{keyCode:65,meta:!0},{keyCode:65,ctrl:!0}]},Sr={type:"print",keyCombos:[{keyCode:80,meta:!0},{keyCode:80,ctrl:!0},{keyCode:80,meta:!0,shift:!0},{keyCode:80,ctrl:!0,shift:!0},{keyCode:80,meta:!0,alt:!0},{keyCode:80,ctrl:!0,alt:!0}]},_r={type:"save",keyCombos:[{keyCode:83,meta:!0},{keyCode:83,ctrl:!0}]};class qt{mergeKeyboardPeripherals(e,t=[]){const n=[],i=t.filter(o=>!["developer_tools","select_all","print","save"].includes(o.type));e.disableSelectAll&&n.push(yr),e.disableSave&&n.push(_r),e.monitorDevTools&&n.push(fr),e.protectPrinting?.disable&&n.push(Sr);for(const o of i){const a=o.keyCombos.filter(s=>!n.some(l=>l.keyCombos.some(d=>s.keyCode===d.keyCode&&s.ctrl===d.ctrl&&s.shift===d.shift&&s.alt===d.alt&&s.meta===d.meta)));a.length>0&&n.push({...o,keyCombos:a})}return n}}class Jt extends qt{goLeft(e=!1,t){this.readingProgression===H.ltr?this.goBackward(e,t):this.readingProgression===H.rtl&&this.goForward(e,t)}goRight(e=!1,t){this.readingProgression===H.ltr?this.goForward(e,t):this.readingProgression===H.rtl&&this.goBackward(e,t)}}class bi extends qt{}function he(r,e){const{style:t}=r;if(t.type===k.Template){const n=t;return{...r,style:{...n,element:n.element(r)}}}if(t.type&&e?.[t.type]){const n=e[t.type];return{...r,style:{type:k.Template,layout:n.layout,width:n.width,stylesheet:n.stylesheet,isActive:t.isActive,element:n.element(r)}}}return r}function br(r,e){if(r.type!==e.type||(r.isActive??!1)!==(e.isActive??!1))return!1;if(r.type===k.Template){const i=r,o=e;return i.layout===o.layout&&i.width===o.width&&i.stylesheet===o.stylesheet}const t=r,n=e;return t.tint===n.tint&&t.layout===n.layout&&t.width===n.width&&(t.enforceContrast??!0)===(n.enforceContrast??!0)}function vi(r){return typeof r?.serialize=="function"?r.serialize():r}function Zt(r,e){return r.locator.href===e.locator.href&&JSON.stringify(vi(r.locator.locations))===JSON.stringify(vi(e.locator.locations))&&br(r.style,e.style)&&JSON.stringify(r.extras??null)===JSON.stringify(e.extras??null)}const Qt=new Set([k.Highlight,k.Underline,k.Outline,k.TextColor,k.Mask,k.Template]);class wi{constructor(e,t,n,i){this.injector=null,this.pub=e,this.item=n,this.burl=n.toURL(t)||"",this.cssProperties=i.cssProperties,this.injector=i.injector??null}async build(){if(!this.item.mediaType.isHTML)throw new Error(`Unsupported media type for WebPub: ${this.item.mediaType.string}`);return await this.buildHtmlFrame()}async buildHtmlFrame(){const e=await this.pub.get(this.item).readAsString();if(!e)throw new Error(`Failed reading item ${this.item.href}`);const t=new DOMParser().parseFromString(e,this.item.mediaType.string),n=t.querySelector("parsererror");if(n){const i=n.querySelector("div");throw new Error(`Failed parsing item ${this.item.href}: ${i?.textContent||n.textContent}`)}return this.injector&&await this.injector.injectForDocument(t,this.item),this.finalizeDOM(t,this.burl,this.item.mediaType,e,this.cssProperties)}setProperties(e,t){for(const n in e){const i=e[n];i&&t.documentElement.style.setProperty(n,i)}}finalizeDOM(e,t,n,i,o){if(!e)return"";if(o&&this.setProperties(o,e),e.body.querySelectorAll("img").forEach(s=>{s.setAttribute("fetchpriority","high")}),t!==void 0){const s=e.createElement("base");s.href=t,s.dataset.readium="true",e.head.firstChild.before(s)}let a;return n.string==="application/xhtml+xml"?a=new XMLSerializer().serializeToString(e):a=this.serializeAsHTML(e,i||""),URL.createObjectURL(new Blob([a],{type:n.isHTML?n.string:"application/xhtml+xml"}))}serializeAsHTML(e,t){const n=t.match(/<!DOCTYPE[^>]*>/i),i=n?n[0]+`
`:"";let a=e.documentElement.outerHTML;return i+a}}const vr=1e4;class Ee{constructor(e,t){this.registry=new Map,this._ready=!1,this.listenerBuffer=[],this.handler=this.handle.bind(this),this.wnd=e,this.origin=t;try{this.channelId=window.crypto.randomUUID()}catch{this.channelId=xt()}this.gc=setInterval(()=>{this.registry.forEach((n,i)=>{performance.now()-n.time>vr&&(console.warn(i,"event for",n.key,"was never handled!"),this.registry.delete(i))})},5e3),window.addEventListener("message",this.handler),this.send("_ping",void 0)}set listener(e){this.listenerBuffer.length>0&&this.listenerBuffer.forEach(t=>e(t[0],t[1])),this.listenerBuffer=[],this._listener=e}clearListener(){typeof this._listener=="function"&&(this._listener=void 0)}halt(){this._ready=!1,window.removeEventListener("message",this.handler),clearInterval(this.gc),this._listener=void 0,this.registry.clear()}resume(){window.addEventListener("message",this.handler),this._ready=!0}handle(e){const t=e.data;if(!t._readium){console.warn("Ignoring",t);return}if(t._channel===this.channelId)switch(t.key){case"_ack":{if(!t.id)return;const n=this.registry.get(t.id);if(!n)return;this.registry.delete(t.id),n.cb(!!t.data);return}case"_pong":this._ready=!0;default:{if(!this.ready)return;typeof this._listener=="function"?this._listener(t.key,t.data):this.listenerBuffer.push([t.key,t.data])}}}get ready(){return this._ready}send(e,t,n,i=!1,o=[]){const a=xt();return n&&this.registry.set(a,{cb:n,time:performance.now(),key:e}),this.wnd.postMessage({_readium:be,_channel:this.channelId,id:a,data:t,key:e,strict:i},"/",o),a}}class en{constructor(e,t){this.config=e,this.onUpdate=t,this.unsubs=[],this.conditionValues=new Map}setup(){let e=!0;this.config.forEach(t=>t.keyCombos.forEach(n=>{if(n.condition){const i=n.condition.subscribe(o=>{this.conditionValues.set(n,o),e||this.onUpdate(this.buildSerializable())});this.unsubs.push(i)}})),e=!1,this.onUpdate(this.buildSerializable())}buildSerializable(){return this.config.map(e=>({...e,keyCombos:e.keyCombos.filter(t=>!t.condition||this.conditionValues.get(t)===!0).map(({condition:t,...n})=>n)})).filter(e=>e.keyCombos.length>0)}destroy(){this.unsubs.forEach(e=>e()),this.unsubs=[],this.conditionValues.clear()}}class Ri{constructor(e,t={},n=[]){this.hidden=!0,this.destroyed=!1,this.currModules=[],this.frame=document.createElement("iframe"),this.frame.classList.add("readium-navigator-iframe"),this.frame.style.visibility="hidden",this.frame.style.setProperty("aria-hidden","true"),this.frame.style.opacity="0",this.frame.style.position="absolute",this.frame.style.pointerEvents="none",this.frame.style.transition="visibility 0s, opacity 0.1s linear",this.frame.style.backgroundColor="#FFFFFF",this.source=e,this.contentProtectionConfig={...t},this.keyboardPeripheralsConfig=[...n]}async load(e=[]){return new Promise((t,n)=>{if(this.loader){const i=this.frame.contentWindow;if([...this.currModules].sort().join("|")===[...e].sort().join("|")){try{t(i)}catch{}return}this.comms?.halt(),this.loader.destroy(),this.loader=new ke(i,e),this.currModules=e,this.comms=void 0;try{t(i)}catch{}return}this.frame.onload=()=>{const i=this.frame.contentWindow;this.loader=new ke(i,e),this.currModules=e;try{t(i)}catch{}},this.frame.onerror=i=>{try{n(i)}catch{}},this.frame.contentWindow.location.replace(this.source)})}applyContentProtection(){this.comms||this.comms.resume(),this.comms.send("peripherals_protection",this.contentProtectionConfig),this.keyboardPeripheralsConfig&&this.keyboardPeripheralsConfig.length>0&&(this.conditionBridge?.destroy(),this.conditionBridge=new en(this.keyboardPeripheralsConfig,e=>{e.length>0&&this.comms.send("keyboard_peripherals",e)}),this.conditionBridge.setup()),this.contentProtectionConfig.monitorScrollingExperimental&&this.comms.send("scroll_protection",{}),this.contentProtectionConfig.protectPrinting?.disable&&this.comms.send("print_protection",this.contentProtectionConfig.protectPrinting)}async destroy(){this.conditionBridge?.destroy(),await this.hide(),this.loader?.destroy(),this.frame.remove(),this.destroyed=!0}async hide(){if(!this.destroyed){if(this.frame.style.visibility="hidden",this.frame.style.setProperty("aria-hidden","true"),this.frame.style.opacity="0",this.frame.style.pointerEvents="none",this.hidden=!0,this.frame.parentElement)return this.comms===void 0||!this.comms.ready?void 0:new Promise((e,t)=>{this.comms?.send("unfocus",void 0,n=>{this.comms?.halt(),e()})});this.comms?.halt()}}async show(e){if(this.destroyed)throw Error("Trying to show frame when it doesn't exist");if(!this.frame.parentElement)throw Error("Trying to show frame that is not attached to the DOM");return this.comms?this.comms.resume():this.comms=new Ee(this.frame.contentWindow,this.source),new Promise((t,n)=>{this.comms?.send("activate",void 0,()=>{this.comms?.send("focus",void 0,()=>{this.applyContentProtection();const i=()=>{this.frame.style.removeProperty("visibility"),this.frame.style.removeProperty("aria-hidden"),this.frame.style.removeProperty("opacity"),this.frame.style.removeProperty("pointer-events"),this.hidden=!1,Y.UA.WebKit&&this.comms?.send("force_webkit_recalc",void 0),t()};e!==void 0?this.comms?.send("go_progression",e,i):i()})})})}setCSSProperties(e){this.destroyed||!this.frame.contentWindow||(this.hidden&&(this.comms?this.comms?.resume():this.comms=new Ee(this.frame.contentWindow,this.source)),this.comms?.send("update_properties",e),this.hidden&&this.comms?.halt())}get iframe(){if(this.destroyed)throw Error("Trying to use frame when it doesn't exist");return this.frame}get realSize(){if(this.destroyed)throw Error("Trying to use frame client rect when it doesn't exist");return this.frame.getBoundingClientRect()}get window(){if(this.destroyed||!this.frame.contentWindow)throw Error("Trying to use frame window when it doesn't exist");return this.frame.contentWindow}get msg(){return this.comms}get ldr(){return this.loader}}class Pi{constructor(e,t,n,i={},o=[]){this.pool=new Map,this.blobs=new Map,this.inprogress=new Map,this.pendingUpdates=new Map,this.injector=null,this.container=e,this.currentCssProperties=t,this.injector=n,this.contentProtectionConfig=i,this.keyboardPeripheralsConfig=[...o]}async destroy(){let e=this.inprogress.values(),t=e.next();const n=[];for(;t.value;)n.push(t.value),t=e.next();n.length>0&&await Promise.allSettled(n),this.inprogress.clear();let i=this.pool.values(),o=i.next();for(;o.value;)await o.value.destroy(),o=i.next();this.pool.clear(),this.blobs.forEach(a=>{this.injector?.releaseBlobUrl?.(a),URL.revokeObjectURL(a)}),this.blobs.clear(),this.injector?.dispose(),this.container.childNodes.forEach(a=>{(a.nodeType===Node.ELEMENT_NODE||a.nodeType===Node.TEXT_NODE)&&a.remove()})}async update(e,t,n){const i=e.readingOrder.items;let o=i.findIndex(l=>l.href===t.href);if(o<0)throw Error(`Locator not found in reading order: ${t.href}`);const a=i[o].href;this.inprogress.has(a)&&await this.inprogress.get(a);const s=new Promise(async(l,d)=>{const c=[],h=[];e.readingOrder.items.forEach((m,p)=>{p!==o&&p!==o-1&&p!==o+1&&(c.includes(m.href)||c.push(m.href)),p===o&&(h.includes(m.href)||h.push(m.href))}),c.forEach(async m=>{h.includes(m)||this.pool.has(m)&&(await this.pool.get(m)?.destroy(),this.pool.delete(m))}),this.currentBaseURL!==void 0&&e.baseURL!==this.currentBaseURL&&(this.blobs.forEach(m=>{this.injector?.releaseBlobUrl?.(m),URL.revokeObjectURL(m)}),this.blobs.clear()),this.currentBaseURL=e.baseURL;const u=async m=>{if(this.pendingUpdates.has(m)&&this.pendingUpdates.get(m)?.inPool===!1){const v=this.blobs.get(m);v&&(this.injector?.releaseBlobUrl?.(v),URL.revokeObjectURL(v),this.blobs.delete(m),this.pendingUpdates.delete(m))}if(this.pool.has(m)){const v=this.pool.get(m);if(!this.blobs.has(m))await v.destroy(),this.pool.delete(m),this.pendingUpdates.delete(m);else{await v.load(n);return}}const p=e.readingOrder.findWithHref(m);if(!p)return;if(!this.blobs.has(m)){const C=await new wi(e,this.currentBaseURL||"",p,{cssProperties:this.currentCssProperties,injector:this.injector}).build();this.blobs.set(m,C)}const _=new Ri(this.blobs.get(m),this.contentProtectionConfig,this.keyboardPeripheralsConfig);m!==a&&await _.hide(),this.container.appendChild(_.iframe),await _.load(n),this.pool.set(m,_)};try{await Promise.all(h.map(m=>u(m)))}catch(m){d(m)}const g=this.pool.get(a);if(g?.source!==this._currentFrame?.source&&(await this._currentFrame?.hide(),g&&await g.load(n),g&&await g.show(t.locations.progression),this._currentFrame=g,g)){const m=this.container.ownerDocument.activeElement;m&&m.tagName==="IFRAME"&&m!==g.iframe&&g.iframe.focus({preventScroll:!0})}l()});this.inprogress.set(a,s),await s,this.inprogress.delete(a)}setCSSProperties(e){if(!((n,i)=>{const o=Object.keys(n),a=Object.keys(i);if(o.length!==a.length)return!1;for(const s of o)if(n[s]!==i[s])return!1;return!0})(this.currentCssProperties||{},e)){this.currentCssProperties=e,this.pool.forEach(n=>{n.setCSSProperties(e)});for(const n of this.blobs.keys())this.pendingUpdates.set(n,{inPool:this.pool.has(n)})}}get currentFrames(){return[this._currentFrame]}get currentBounds(){const e={x:0,y:0,width:0,height:0,top:0,right:0,bottom:0,left:0,toJSON(){return this}};return this.currentFrames.forEach(t=>{if(!t)return;const n=t.realSize;e.x=Math.min(e.x,n.x),e.y=Math.min(e.y,n.y),e.width+=n.width,e.height=Math.max(e.height,n.height),e.top=Math.min(e.top,n.top),e.right=Math.min(e.right,n.right),e.bottom=Math.min(e.bottom,n.bottom),e.left=Math.min(e.left,n.left)}),e}}var tn,Ci;function wr(){if(Ci)return tn;Ci=1;function r(i){if(typeof i!="string")throw new TypeError("Path must be a string. Received "+JSON.stringify(i))}function e(i,o){for(var a="",s=0,l=-1,d=0,c,h=0;h<=i.length;++h){if(h<i.length)c=i.charCodeAt(h);else{if(c===47)break;c=47}if(c===47){if(!(l===h-1||d===1))if(l!==h-1&&d===2){if(a.length<2||s!==2||a.charCodeAt(a.length-1)!==46||a.charCodeAt(a.length-2)!==46){if(a.length>2){var u=a.lastIndexOf("/");if(u!==a.length-1){u===-1?(a="",s=0):(a=a.slice(0,u),s=a.length-1-a.lastIndexOf("/")),l=h,d=0;continue}}else if(a.length===2||a.length===1){a="",s=0,l=h,d=0;continue}}o&&(a.length>0?a+="/..":a="..",s=2)}else a.length>0?a+="/"+i.slice(l+1,h):a=i.slice(l+1,h),s=h-l-1;l=h,d=0}else c===46&&d!==-1?++d:d=-1}return a}function t(i,o){var a=o.dir||o.root,s=o.base||(o.name||"")+(o.ext||"");return a?a===o.root?a+s:a+i+s:s}var n={resolve:function(){for(var o="",a=!1,s,l=arguments.length-1;l>=-1&&!a;l--){var d;l>=0?d=arguments[l]:(s===void 0&&(s=process.cwd()),d=s),r(d),d.length!==0&&(o=d+"/"+o,a=d.charCodeAt(0)===47)}return o=e(o,!a),a?o.length>0?"/"+o:"/":o.length>0?o:"."},normalize:function(o){if(r(o),o.length===0)return".";var a=o.charCodeAt(0)===47,s=o.charCodeAt(o.length-1)===47;return o=e(o,!a),o.length===0&&!a&&(o="."),o.length>0&&s&&(o+="/"),a?"/"+o:o},isAbsolute:function(o){return r(o),o.length>0&&o.charCodeAt(0)===47},join:function(){if(arguments.length===0)return".";for(var o,a=0;a<arguments.length;++a){var s=arguments[a];r(s),s.length>0&&(o===void 0?o=s:o+="/"+s)}return o===void 0?".":n.normalize(o)},relative:function(o,a){if(r(o),r(a),o===a||(o=n.resolve(o),a=n.resolve(a),o===a))return"";for(var s=1;s<o.length&&o.charCodeAt(s)===47;++s);for(var l=o.length,d=l-s,c=1;c<a.length&&a.charCodeAt(c)===47;++c);for(var h=a.length,u=h-c,g=d<u?d:u,m=-1,p=0;p<=g;++p){if(p===g){if(u>g){if(a.charCodeAt(c+p)===47)return a.slice(c+p+1);if(p===0)return a.slice(c+p)}else d>g&&(o.charCodeAt(s+p)===47?m=p:p===0&&(m=0));break}var _=o.charCodeAt(s+p),v=a.charCodeAt(c+p);if(_!==v)break;_===47&&(m=p)}var C="";for(p=s+m+1;p<=l;++p)(p===l||o.charCodeAt(p)===47)&&(C.length===0?C+="..":C+="/..");return C.length>0?C+a.slice(c+m):(c+=m,a.charCodeAt(c)===47&&++c,a.slice(c))},_makeLong:function(o){return o},dirname:function(o){if(r(o),o.length===0)return".";for(var a=o.charCodeAt(0),s=a===47,l=-1,d=!0,c=o.length-1;c>=1;--c)if(a=o.charCodeAt(c),a===47){if(!d){l=c;break}}else d=!1;return l===-1?s?"/":".":s&&l===1?"//":o.slice(0,l)},basename:function(o,a){if(a!==void 0&&typeof a!="string")throw new TypeError('"ext" argument must be a string');r(o);var s=0,l=-1,d=!0,c;if(a!==void 0&&a.length>0&&a.length<=o.length){if(a.length===o.length&&a===o)return"";var h=a.length-1,u=-1;for(c=o.length-1;c>=0;--c){var g=o.charCodeAt(c);if(g===47){if(!d){s=c+1;break}}else u===-1&&(d=!1,u=c+1),h>=0&&(g===a.charCodeAt(h)?--h===-1&&(l=c):(h=-1,l=u))}return s===l?l=u:l===-1&&(l=o.length),o.slice(s,l)}else{for(c=o.length-1;c>=0;--c)if(o.charCodeAt(c)===47){if(!d){s=c+1;break}}else l===-1&&(d=!1,l=c+1);return l===-1?"":o.slice(s,l)}},extname:function(o){r(o);for(var a=-1,s=0,l=-1,d=!0,c=0,h=o.length-1;h>=0;--h){var u=o.charCodeAt(h);if(u===47){if(!d){s=h+1;break}continue}l===-1&&(d=!1,l=h+1),u===46?a===-1?a=h:c!==1&&(c=1):a!==-1&&(c=-1)}return a===-1||l===-1||c===0||c===1&&a===l-1&&a===s+1?"":o.slice(a,l)},format:function(o){if(o===null||typeof o!="object")throw new TypeError('The "pathObject" argument must be of type Object. Received type '+typeof o);return t("/",o)},parse:function(o){r(o);var a={root:"",dir:"",base:"",ext:"",name:""};if(o.length===0)return a;var s=o.charCodeAt(0),l=s===47,d;l?(a.root="/",d=1):d=0;for(var c=-1,h=0,u=-1,g=!0,m=o.length-1,p=0;m>=d;--m){if(s=o.charCodeAt(m),s===47){if(!g){h=m+1;break}continue}u===-1&&(g=!1,u=m+1),s===46?c===-1?c=m:p!==1&&(p=1):c!==-1&&(p=-1)}return c===-1||u===-1||p===0||p===1&&c===u-1&&c===h+1?u!==-1&&(h===0&&l?a.base=a.name=o.slice(1,u):a.base=a.name=o.slice(h,u)):(h===0&&l?(a.name=o.slice(1,c),a.base=o.slice(1,u)):(a.name=o.slice(h,c),a.base=o.slice(h,u)),a.ext=o.slice(c,u)),h>0?a.dir=o.slice(0,h-1):l&&(a.dir="/"),a},sep:"/",delimiter:":",win32:null,posix:null};return n.posix=n,tn=n,tn}var ft=wr();function de(r){const e=r.languages?.[0]?.toLowerCase(),t=r.readingProgression;if(e){if(e.startsWith("zh")||e.startsWith("ja")||e.startsWith("ko"))return t===H.rtl?"cjk-vertical":"cjk-horizontal";if(e.startsWith("mn-mong"))return"mongolian-vertical";if(e.startsWith("ar")||e.startsWith("fa")||e.startsWith("he"))return"rtl"}return"ltr"}const Rr={experimentalHeaderFiltering:{description:"Attempts to filter out paragraphs that are implicitly headings or part of headers",scope:"RS",value:"readium-experimentalHeaderFiltering-on"},experimentalZoom:{description:"Attempts to filter out elements that are sized using viewport units and should not be scaled directly e.g. tables, images, iframes, etc.",scope:"RS",value:"readium-experimentalZoom-on"}},Pr={ltr:{disabled:[],added:[]},rtl:{disabled:["bodyHyphens","a11yNormalize","letterSpacing"],added:[]},"cjk-horizontal":{disabled:["textAlign","bodyHyphens","a11yNormalize","ligatures","paraIndent","wordSpacing"],added:["noRuby"]},"cjk-vertical":{disabled:["colCount","textAlign","bodyHyphens","a11yNormalize","ligatures","paraIndent","wordSpacing"],added:["noRuby"]}},Cr={latin:{baseFontFamily:"var(--RS__oldStyleTf)",lineHeightCompensation:1},am:{baseFontFamily:"Kefa, Nyala, Roboto, Noto, 'Noto Sans Ethiopic', serif",lineHeightCompensation:1.167},ar:{baseFontFamily:"'Geeza Pro', 'Arabic Typesetting', Roboto, Noto, 'Noto Naskh Arabic', 'Times New Roman', serif"},bn:{baseFontFamily:"'Kohinoor Bangla', 'Bangla Sangam MN', Vrinda, Roboto, Noto, 'Noto Sans Bengali', sans-serif",lineHeightCompensation:1.067},bo:{baseFontFamily:"Kailasa, 'Microsoft Himalaya', Roboto, Noto, 'Noto Sans Tibetan', sans-serif"},chr:{baseFontFamily:"'Plantagenet Cherokee', Roboto, Noto, 'Noto Sans Cherokee'",lineHeightCompensation:1.167},fa:{baseFontFamily:"'Geeza Pro', 'Arabic Typesetting', Roboto, Noto, 'Noto Naskh Arabic', 'Times New Roman', serif"},gu:{baseFontFamily:"'Gujarati Sangam MN', 'Nirmala UI', Shruti, Roboto, Noto, 'Noto Sans Gujarati', sans-serif",lineHeightCompensation:1.167},he:{baseFontFamily:"'New Peninim MT', 'Arial Hebrew', Gisha, 'Times New Roman', Roboto, Noto, 'Noto Sans Hebrew', sans-serif",lineHeightCompensation:1.1},hi:{baseFontFamily:"'Kohinoor Devanagari', 'Devanagari Sangam MN', Kokila, 'Nirmala UI', Roboto, Noto, 'Noto Sans Devanagari', sans-serif",lineHeightCompensation:1.1},hy:{baseFontFamily:"Mshtakan, Sylfaen, Roboto, Noto, 'Noto Serif Armenian', serif"},iu:{baseFontFamily:"'Euphemia UCAS', Euphemia, Roboto, Noto, 'Noto Sans Canadian Aboriginal', sans-serif"},ja:{baseFontFamily:"YuGothic, 'Hiragino Maru Gothic ProN', 'Hiragino Sans', 'Yu Gothic UI', 'Meiryo UI', 'MS Gothic', Roboto, Noto, 'Noto Sans CJK JP', sans-serif",lineHeightCompensation:1.167},km:{baseFontFamily:"'Khmer Sangam MN', 'Leelawadee UI', 'Khmer UI', Roboto, Noto, 'Noto Sans Khmer', sans-serif",lineHeightCompensation:1.067},kn:{baseFontFamily:"'Kannada Sangam MN', 'Nirmala UI', Tunga, Roboto, Noto, 'Noto Sans Kannada', sans-serif",lineHeightCompensation:1.1},ko:{baseFontFamily:"'Nanum Gothic', 'Apple SD Gothic Neo', 'Malgun Gothic', Roboto, Noto, 'Noto Sans CJK KR', sans-serif",lineHeightCompensation:1.167},lo:{baseFontFamily:"'Lao Sangam MN', 'Leelawadee UI', 'Lao UI', Roboto, Noto, 'Noto Sans Lao', sans-serif"},ml:{baseFontFamily:"'Malayalam Sangam MN', 'Nirmala UI', Kartika, Roboto, Noto, 'Noto Sans Malayalam', sans-serif",lineHeightCompensation:1.067},or:{baseFontFamily:"'Oriya Sangam MN', 'Nirmala UI', Kalinga, Roboto, Noto, 'Noto Sans Oriya', sans-serif",lineHeightCompensation:1.167},pa:{baseFontFamily:"'Gurmukhi MN', 'Nirmala UI', Kartika, Roboto, Noto, 'Noto Sans Gurmukhi', sans-serif",lineHeightCompensation:1.1},si:{baseFontFamily:"'Sinhala Sangam MN', 'Nirmala UI', 'Iskoola Pota', Roboto, Noto, 'Noto Sans Sinhala', sans-serif",lineHeightCompensation:1.167},ta:{baseFontFamily:"'Tamil Sangam MN', 'Nirmala UI', Latha, Roboto, Noto, 'Noto Sans Tamil', sans-serif",lineHeightCompensation:1.067},te:{baseFontFamily:"'Kohinoor Telugu', 'Telugu Sangam MN', 'Nirmala UI', Gautami, Roboto, Noto, 'Noto Sans Telugu', sans-serif"},th:{baseFontFamily:"Thonburi, 'Leelawadee UI', 'Cordia New', Roboto, Noto, 'Noto Sans Thai', sans-serif",lineHeightCompensation:1.067},zh:{baseFontFamily:"'方体', 'PingFang SC', '黑体', 'Heiti SC', 'Microsoft JhengHei UI', 'Microsoft JhengHei', Roboto, Noto, 'Noto Sans CJK SC', sans-serif",lineHeightCompensation:1.167},"zh-Hant":{baseFontFamily:"'方體', 'PingFang TC', '黑體', 'Heiti TC', 'Microsoft JhengHei UI', 'Microsoft JhengHei', Roboto, Noto, 'Noto Sans CJK TC', sans-serif",lineHeightCompensation:1.167},"zh-TW":{baseFontFamily:"'方體', 'PingFang TC', '黑體', 'Heiti TC', 'Microsoft JhengHei UI', 'Microsoft JhengHei', Roboto, Noto, 'Noto Sans CJK TC', sans-serif",lineHeightCompensation:1.167},"zh-HK":{baseFontFamily:"'方體', 'PingFang HK', '方體', 'PingFang TC', '黑體', 'Heiti TC', 'Microsoft JhengHei UI', 'Microsoft JhengHei', Roboto, Noto, 'Noto Sans CJK TC', sans-serif",lineHeightCompensation:1.167}},yt=Rr,kr=Pr,Er=Cr;var te=(r=>(r.start="start",r.left="left",r.right="right",r.justify="justify",r))(te||{});const ue={range:[0,100],step:1},De={range:[.7,4],step:.05},ie={range:[100,1e3],step:100},We={range:[50,250],step:10},Be={range:[0,1],step:.125},je={range:[1,2.5],step:.1},me={range:[20,100],step:1},Ge={range:[0,3],step:.25},Ve={range:[0,3],step:.25},$e={range:[0,2],step:.125},Ke={range:[.7,4],step:.05},Xe={range:[0,1],step:.1},Ye={range:[.5,4],step:.1},oe={range:[5,60],step:5};class qe{constructor(){}toFlag(e){return`readium-${e}-on`}toUnitless(e){return e.toString()}toPercentage(e,t=!1){return t||e>0&&e<=1?`${Math.round(e*100)}%`:`${e}%`}toVw(e){const t=Math.round(e*100);return`${Math.min(t,100)}vw`}toVh(e){const t=Math.round(e*100);return`${Math.min(t,100)}vh`}toPx(e){return`${e}px`}toRem(e){return`${e}rem`}}class nn extends qe{constructor(e){super(),this.a11yNormalize=e.a11yNormalize??null,this.bodyHyphens=e.bodyHyphens??null,this.fontFamily=e.fontFamily??null,this.fontWeight=e.fontWeight??null,this.iOSPatch=e.iOSPatch??null,this.iPadOSPatch=e.iPadOSPatch??null,this.letterSpacing=e.letterSpacing??null,this.ligatures=e.ligatures??null,this.lineHeight=e.lineHeight??null,this.noRuby=e.noRuby??null,this.paraIndent=e.paraIndent??null,this.paraSpacing=e.paraSpacing??null,this.textAlign=e.textAlign??null,this.wordSpacing=e.wordSpacing??null,this.zoom=e.zoom??null}toCSSProperties(){const e={};return this.a11yNormalize&&(e["--USER__a11yNormalize"]=this.toFlag("a11y")),this.bodyHyphens&&(e["--USER__bodyHyphens"]=this.bodyHyphens),this.fontFamily&&(e["--USER__fontFamily"]=this.fontFamily),this.fontWeight!=null&&(e["--USER__fontWeight"]=this.toUnitless(this.fontWeight)),this.iOSPatch&&(e["--USER__iOSPatch"]=this.toFlag("iOSPatch")),this.iPadOSPatch&&(e["--USER__iPadOSPatch"]=this.toFlag("iPadOSPatch")),this.letterSpacing!=null&&(e["--USER__letterSpacing"]=this.toRem(this.letterSpacing)),this.ligatures&&(e["--USER__ligatures"]=this.ligatures),this.lineHeight!=null&&(e["--USER__lineHeight"]=this.toUnitless(this.lineHeight)),this.noRuby&&(e["--USER__noRuby"]=this.toFlag("noRuby")),this.paraIndent!=null&&(e["--USER__paraIndent"]=this.toRem(this.paraIndent)),this.paraSpacing!=null&&(e["--USER__paraSpacing"]=this.toRem(this.paraSpacing)),this.textAlign&&(e["--USER__textAlign"]=this.textAlign),this.wordSpacing!=null&&(e["--USER__wordSpacing"]=this.toRem(this.wordSpacing)),this.zoom!==null&&(e["--USER__zoom"]=this.toPercentage(this.zoom,!0)),e}}class ki extends qe{constructor(e){super(),this.experiments=e.experiments??null}toCSSProperties(){const e={};return this.experiments&&this.experiments.forEach(t=>{e["--RS__"+t]=yt[t].value}),e}}class Ei{constructor(e){this.rsProperties=e.rsProperties,this.userProperties=e.userProperties}update(e){e.experiments&&(this.rsProperties.experiments=e.experiments);const t={a11yNormalize:e.textNormalization,bodyHyphens:typeof e.hyphens!="boolean"?null:e.hyphens?"auto":"none",fontFamily:e.fontFamily,fontWeight:e.fontWeight,iOSPatch:e.iOSPatch,iPadOSPatch:e.iPadOSPatch,letterSpacing:e.letterSpacing,ligatures:typeof e.ligatures!="boolean"?null:e.ligatures?"common-ligatures":"none",lineHeight:e.lineHeight,noRuby:e.noRuby,paraIndent:e.paragraphIndent,paraSpacing:e.paragraphSpacing,textAlign:e.textAlign,wordSpacing:e.wordSpacing,zoom:e.zoom};this.userProperties=new nn(t)}}function xi(r,e){return r==null||e==null||r<=e?r:void 0}function Fi(r,e){return r==null||e==null||r>=e?r:void 0}function D(r){return typeof r=="string"?r:r===null?null:void 0}function P(r){return typeof r=="boolean"||r==null?r:void 0}function Je(r,e){if(r!==void 0)return r===null?null:e[r]!==void 0?r:void 0}function pe(r){return typeof r=="boolean"||typeof r=="number"&&r>=0?r:r===null?null:void 0}function w(r){if(r!==void 0)return r===null?null:r<0?void 0:r}function I(r,e){if(r===void 0)return;if(r===null)return null;const t=Math.min(...e),n=Math.max(...e);return r>=t&&r<=n?r:void 0}function St(r,e){return r===void 0?e:r}function on(r){if(r!==void 0)return r===null?null:r.filter(e=>e in yt)}class xe{constructor(e={}){this.fontFamily=D(e.fontFamily),this.fontWeight=I(e.fontWeight,ie.range),this.hyphens=P(e.hyphens),this.iOSPatch=P(e.iOSPatch),this.iPadOSPatch=P(e.iPadOSPatch),this.letterSpacing=w(e.letterSpacing),this.ligatures=P(e.ligatures),this.lineHeight=w(e.lineHeight),this.noRuby=P(e.noRuby),this.paragraphIndent=w(e.paragraphIndent),this.paragraphSpacing=w(e.paragraphSpacing),this.textAlign=Je(e.textAlign,te),this.textNormalization=P(e.textNormalization),this.wordSpacing=w(e.wordSpacing),this.zoom=I(e.zoom,Ke.range)}static serialize(e){const{...t}=e;return JSON.stringify(t)}static deserialize(e){try{const t=JSON.parse(e);return new xe(t)}catch(t){return console.error("Failed to deserialize preferences:",t),null}}merging(e){const t={...this};for(const n of Object.keys(e))e[n]!==void 0&&(t[n]=e[n]);return new xe(t)}}class zi{constructor(e){this.fontFamily=D(e.fontFamily)||null,this.fontWeight=I(e.fontWeight,ie.range)||null,this.hyphens=P(e.hyphens)??null,this.iOSPatch=e.iOSPatch===!1?!1:(M.OS.iOS||M.OS.iPadOS)&&M.iOSRequest==="mobile",this.iPadOSPatch=e.iPadOSPatch===!1?!1:M.OS.iPadOS&&M.iOSRequest==="desktop",this.letterSpacing=w(e.letterSpacing)||null,this.ligatures=P(e.ligatures)??null,this.lineHeight=w(e.lineHeight)||null,this.noRuby=P(e.noRuby)??!1,this.paragraphIndent=w(e.paragraphIndent)??null,this.paragraphSpacing=w(e.paragraphSpacing)??null,this.textAlign=Je(e.textAlign,te)||null,this.textNormalization=P(e.textNormalization)??!1,this.wordSpacing=w(e.wordSpacing)||null,this.zoom=I(e.zoom,Ke.range)||1,this.experiments=on(e.experiments)??null}}class rn{constructor(e,t,n){this.fontFamily=null,this.fontWeight=null,this.hyphens=null,this.iOSPatch=null,this.iPadOSPatch=null,this.letterSpacing=null,this.ligatures=null,this.lineHeight=null,this.noRuby=null,this.paragraphIndent=null,this.paragraphSpacing=null,this.textAlign=null,this.textNormalization=null,this.wordSpacing=null,n&&(this.fontFamily=e.fontFamily||t.fontFamily||null,this.fontWeight=e.fontWeight!==void 0?e.fontWeight:t.fontWeight!==void 0?t.fontWeight:null,this.hyphens=typeof e.hyphens=="boolean"?e.hyphens:t.hyphens??null,this.iOSPatch=e.iOSPatch===!1?!1:e.iOSPatch===!0?(M.OS.iOS||M.OS.iPadOS)&&M.iOSRequest==="mobile":t.iOSPatch,this.iPadOSPatch=e.iPadOSPatch===!1?!1:e.iPadOSPatch===!0?M.OS.iPadOS&&M.iOSRequest==="desktop":t.iPadOSPatch,this.letterSpacing=e.letterSpacing!==void 0?e.letterSpacing:t.letterSpacing!==void 0?t.letterSpacing:null,this.ligatures=typeof e.ligatures=="boolean"?e.ligatures:t.ligatures??null,this.lineHeight=e.lineHeight!==void 0?e.lineHeight:t.lineHeight!==void 0?t.lineHeight:null,this.noRuby=typeof e.noRuby=="boolean"?e.noRuby:t.noRuby??null,this.paragraphIndent=e.paragraphIndent!==void 0?e.paragraphIndent:t.paragraphIndent!==void 0?t.paragraphIndent:null,this.paragraphSpacing=e.paragraphSpacing!==void 0?e.paragraphSpacing:t.paragraphSpacing!==void 0?t.paragraphSpacing:null,this.textAlign=e.textAlign||t.textAlign||null,this.textNormalization=typeof e.textNormalization=="boolean"?e.textNormalization:t.textNormalization??null,this.wordSpacing=e.wordSpacing!==void 0?e.wordSpacing:t.wordSpacing!==void 0?t.wordSpacing:null),this.zoom=e.zoom!==void 0?e.zoom:t.zoom!==void 0?t.zoom:null,this.experiments=t.experiments||null}}class U{constructor({initialValue:e=null,effectiveValue:t,isEffective:n,onChange:i}){this._value=e,this._effectiveValue=t,this._isEffective=n,this._onChange=i}set value(e){this._value=e,this._onChange(this._value)}get value(){return this._value}get effectiveValue(){return this._effectiveValue}get isEffective(){return this._isEffective}clear(){this._value=null}}class T extends U{set value(e){this._value=e,this._onChange(this._value)}get value(){return this._value}get effectiveValue(){return this._effectiveValue}get isEffective(){return this._isEffective}clear(){this._value=null}toggle(){this._value=!this._value,this._onChange(this._value)}}class an extends U{constructor({initialValue:e=null,effectiveValue:t,isEffective:n,onChange:i,supportedValues:o}){super({initialValue:e,effectiveValue:t,isEffective:n,onChange:i}),this._supportedValues=o}set value(e){if(e&&!this._supportedValues.includes(e))throw new Error(`Value '${String(e)}' is not in the supported values for this preference.`);this._value=e,this._onChange(this._value)}get value(){return this._value}get effectiveValue(){return this._effectiveValue}get isEffective(){return this._isEffective}get supportedValues(){return this._supportedValues}clear(){this._value=null}}class F extends U{constructor({initialValue:e=null,effectiveValue:t,isEffective:n,onChange:i,supportedRange:o,step:a}){super({initialValue:e,effectiveValue:t,isEffective:n,onChange:i}),this._supportedRange=o,this._step=a,this._decimals=this._step.toString().includes(".")?this._step.toString().split(".")[1].length:0}set value(e){if(e&&(e<this._supportedRange[0]||e>this._supportedRange[1]))throw new Error(`Value '${String(e)}' is out of the supported range for this preference.`);this._value=e,this._onChange(this._value)}get value(){return this._value}get effectiveValue(){return this._effectiveValue}get isEffective(){return this._isEffective}get supportedRange(){return this._supportedRange}get step(){return this._step}increment(){this._value&&this._value<this._supportedRange[1]&&(this._value=Math.min(Math.round((this._value+this._step)*10**this._decimals)/10**this._decimals,this._supportedRange[1]),this._onChange(this._value))}decrement(){this._value&&this._value>this._supportedRange[0]&&(this._value=Math.max(Math.round((this._value-this._step)*10**this._decimals)/10**this._decimals,this._supportedRange[0]),this._onChange(this._value))}format(e){return e.toString()}clear(){this._value=null}}class sn{constructor(e,t,n){this.preferences=e,this.settings=t,this.metadata=n}clear(){this.preferences=new xe({})}updatePreference(e,t){this.preferences[e]=t}get isDisplayTransformable(){return this.metadata?.accessibility?.feature?.some(e=>e.value===it.DISPLAY_TRANSFORMABILITY.value)??!1}get fontFamily(){return new U({initialValue:this.preferences.fontFamily,effectiveValue:this.settings.fontFamily||null,isEffective:this.isDisplayTransformable,onChange:e=>{this.updatePreference("fontFamily",e??null)}})}get fontWeight(){return new F({initialValue:this.preferences.fontWeight,effectiveValue:this.settings.fontWeight||400,isEffective:this.isDisplayTransformable,onChange:e=>{this.updatePreference("fontWeight",e??null)},supportedRange:ie.range,step:ie.step})}get hyphens(){return new T({initialValue:this.preferences.hyphens,effectiveValue:this.settings.hyphens||!1,isEffective:this.isDisplayTransformable,onChange:e=>{this.updatePreference("hyphens",e??null)}})}get iOSPatch(){return new T({initialValue:this.preferences.iOSPatch,effectiveValue:this.settings.iOSPatch||!1,isEffective:!0,onChange:e=>{this.updatePreference("iOSPatch",e??null)}})}get iPadOSPatch(){return new T({initialValue:this.preferences.iPadOSPatch,effectiveValue:this.settings.iPadOSPatch||!1,isEffective:!0,onChange:e=>{this.updatePreference("iPadOSPatch",e??null)}})}get letterSpacing(){return new F({initialValue:this.preferences.letterSpacing,effectiveValue:this.settings.letterSpacing||0,isEffective:this.isDisplayTransformable,onChange:e=>{this.updatePreference("letterSpacing",e??null)},supportedRange:Be.range,step:Be.step})}get ligatures(){return new T({initialValue:this.preferences.ligatures,effectiveValue:this.settings.ligatures||!0,isEffective:this.isDisplayTransformable,onChange:e=>{this.updatePreference("ligatures",e??null)}})}get lineHeight(){return new F({initialValue:this.preferences.lineHeight,effectiveValue:this.settings.lineHeight,isEffective:this.isDisplayTransformable,onChange:e=>{this.updatePreference("lineHeight",e??null)},supportedRange:je.range,step:je.step})}get noRuby(){return new T({initialValue:this.preferences.noRuby,effectiveValue:this.settings.noRuby||!1,isEffective:this.isDisplayTransformable,onChange:e=>{this.updatePreference("noRuby",e??null)}})}get paragraphIndent(){return new F({initialValue:this.preferences.paragraphIndent,effectiveValue:this.settings.paragraphIndent||0,isEffective:this.isDisplayTransformable,onChange:e=>{this.updatePreference("paragraphIndent",e??null)},supportedRange:Ge.range,step:Ge.step})}get paragraphSpacing(){return new F({initialValue:this.preferences.paragraphSpacing,effectiveValue:this.settings.paragraphSpacing||0,isEffective:this.isDisplayTransformable,onChange:e=>{this.updatePreference("paragraphSpacing",e??null)},supportedRange:Ve.range,step:Ve.step})}get textAlign(){return new an({initialValue:this.preferences.textAlign,effectiveValue:this.settings.textAlign||te.start,isEffective:this.isDisplayTransformable,onChange:e=>{this.updatePreference("textAlign",e??null)},supportedValues:Object.values(te)})}get textNormalization(){return new T({initialValue:this.preferences.textNormalization,effectiveValue:this.settings.textNormalization||!1,isEffective:this.isDisplayTransformable,onChange:e=>{this.updatePreference("textNormalization",e??null)}})}get wordSpacing(){return new F({initialValue:this.preferences.wordSpacing,effectiveValue:this.settings.wordSpacing||0,isEffective:this.isDisplayTransformable,onChange:e=>{this.updatePreference("wordSpacing",e??null)},supportedRange:$e.range,step:$e.step})}get zoom(){return new F({initialValue:this.preferences.zoom,effectiveValue:this.settings.zoom||1,isEffective:CSS.supports("zoom","1")??!1,onChange:e=>{this.updatePreference("zoom",e??null)},supportedRange:Ke.range,step:Ke.step})}}const Li=r=>{if("blob"in r&&r.blob.type)return r.blob.type;if(r.as==="script")return"text/javascript";if(r.as==="link"&&"url"in r){const e=r.url.toLowerCase();if(e.endsWith(".css"))return"text/css";if([".js",".mjs",".cjs"].some(t=>e.endsWith(t)))return"text/javascript"}},Oi=(r,e)=>{e.attributes&&Object.entries(e.attributes).forEach(([t,n])=>{t==="type"||t==="rel"||t==="href"||t==="src"||n!=null&&(typeof n=="boolean"?n&&r.setAttribute(t,""):r.setAttribute(t,n))})},xr=(r,e,t)=>{const n=r.createElement("script");n.dataset.readium="true",e.id&&(n.id=e.id);const i=e.type||Li(e);return i&&(n.type=i),Oi(n,e),n.src=t,n},Ai=(r,e,t)=>{const n=r.createElement("link");n.dataset.readium="true",e.id&&(n.id=e.id),e.rel&&(n.rel=e.rel);const i=e.type||Li(e);return i&&(n.type=i),Oi(n,e),n.href=t,n};class ln{constructor(e){this.blobStore=new Map,this.createdBlobUrls=new Set,this.allowedDomains=[],this.injectableIdCounter=0,this.allowedDomains=(e.allowedDomains||[]).map(t=>{try{return new URL(t),t}catch{throw new Error(`Invalid allowed domain: "${t}". Must be a valid URL (e.g., "https://fonts.googleapis.com").`)}}),this.rules=e.rules.map(t=>{const n={...t};return t.prepend&&(n.prepend=t.prepend.map(i=>({...i,id:i.id||`injectable-${this.injectableIdCounter++}`})).reverse()),t.append&&(n.append=t.append.map(i=>({...i,id:i.id||`injectable-${this.injectableIdCounter++}`}))),n})}dispose(){for(const e of this.createdBlobUrls)try{URL.revokeObjectURL(e)}catch(t){console.warn("Failed to revoke blob URL:",e,t)}this.createdBlobUrls.clear()}getAllowedDomains(){return[...this.allowedDomains]}async injectForDocument(e,t){for(const n of this.rules)this.matchesRule(n,t)&&await this.applyRule(e,n)}matchesRule(e,t){const n=t.href;return e.resources.some(i=>i instanceof RegExp?i.test(n):n===i)}async getOrCreateBlobUrl(e){const t=e.id;if(this.blobStore.has(t)){const n=this.blobStore.get(t);return n.refCount++,n.url}if("blob"in e){const n=URL.createObjectURL(e.blob);return this.blobStore.set(t,{url:n,refCount:1}),this.createdBlobUrls.add(n),n}throw new Error("Resource must have a blob property")}async releaseBlobUrl(e){if(!this.createdBlobUrls.has(e))return;const t=Array.from(this.blobStore.values()).find(n=>n.url===e);if(t&&(t.refCount--,t.refCount<=0)){URL.revokeObjectURL(e),this.createdBlobUrls.delete(e);for(const[n,i]of this.blobStore.entries())if(i.url===e){this.blobStore.delete(n);break}}}async getResourceUrl(e,t){if("url"in e){const n=new URL(e.url,t.baseURI).toString();if(!this.isValidUrl(n,t))throw new Error(`Invalid URL: Only HTTPS, data:, blob:, or localhost HTTP URLs are allowed. Got: ${e.url}`);return n}else return this.getOrCreateBlobUrl(e)}createPreloadLink(e,t,n){if(t.as!=="link"||t.rel!=="preload")return;const i={...t,rel:"preload",attributes:{...t.attributes,as:t.as}},o=Ai(e,i,n);e.head.appendChild(o)}createElement(e,t,n){if(t.as==="script")return xr(e,t,n);if(t.as==="link")return Ai(e,t,n);throw new Error(`Unsupported element type: ${t.as}`)}async applyRule(e,t){const n=[],i=t.prepend?t.prepend.filter(a=>!a.condition||a.condition(e)):[],o=t.append?t.append.filter(a=>!a.condition||a.condition(e)):[];try{for(const a of i)await this.processInjectable(a,e,n,"prepend");for(const a of o)await this.processInjectable(a,e,n,"append")}catch(a){for(const{element:s,url:l}of n)try{s.remove(),await this.releaseBlobUrl(l)}catch(d){console.error("Error during cleanup:",d)}throw a}}async processInjectable(e,t,n,i){const o=e.target==="body"?t.body:t.head;if(!o)return;let a=null;try{if(a=await this.getResourceUrl(e,t),e.rel==="preload"&&"url"in e)this.createPreloadLink(t,e,a);else{const s=this.createElement(t,e,a);n.push({element:s,url:a}),i==="prepend"?o.prepend(s):o.append(s)}}catch(s){throw console.error("Failed to process resource:",s),a&&"blob"in e&&await this.releaseBlobUrl(a),s}}isValidUrl(e,t){try{const n=new URL(e,t.baseURI);if(n.protocol==="data:"||n.protocol==="blob:"&&this.createdBlobUrls.has(e))return!0;if(this.allowedDomains.length>0){const i=n.origin;return this.allowedDomains.some(o=>{const a=new URL(o).origin;return i===a})}return!1}catch{return!1}}}const Fe=r=>r.replace(/\/\/.*/g,"").replace(/\/\*[\s\S]*?\*\//g,"").replace(/\n/g,"").replace(/\s+/g," "),Ze=r=>r.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g,"").replace(/ {2,}/g," "),Fr=`/*!
 * Readium CSS v.2.0.5
 * Copyright (c) 2017–2026. Readium Foundation. All rights reserved.
 * Use of this source code is governed by a BSD-style license which is detailed in the
 * LICENSE file present in the project repository where this source code is maintained.
 * Core maintainer: Jiminy Panoz <jiminy.panoz@edrlab.org> 
 * Contributors: 
 * Daniel Weck
 * Hadrien Gardeur
 * Innovimax
 * L. Le Meur
 * Mickaël Menu
 * k_taka
 */

:root[style*="--USER__textAlign"]{
  text-align:var(--USER__textAlign);
}

:root[style*="--USER__textAlign"] body,
:root[style*="--USER__textAlign"] p:not(
  blockquote p,
  figcaption p,
  header p,
  hgroup p,
  :root[style*="readium-experimentalHeaderFiltering-on"] p[class*="title"],
  :root[style*="readium-experimentalHeaderFiltering-on"] div:has(+ *) > h1 + p,
  :root[style*="readium-experimentalHeaderFiltering-on"] div:has(+ *) > p:has(+ h1)
),
:root[style*="--USER__textAlign"] li,
:root[style*="--USER__textAlign"] dd{
  text-align:var(--USER__textAlign) !important;
  -moz-text-align-last:auto !important;
  -epub-text-align-last:auto !important;
  text-align-last:auto !important;
}

:root[style*="--USER__bodyHyphens"]{
  -webkit-hyphens:var(--USER__bodyHyphens) !important;
  -moz-hyphens:var(--USER__bodyHyphens) !important;
  -ms-hyphens:var(--USER__bodyHyphens) !important;
  -epub-hyphens:var(--USER__bodyHyphens) !important;
  hyphens:var(--USER__bodyHyphens) !important;
}

:root[style*="--USER__bodyHyphens"] body,
:root[style*="--USER__bodyHyphens"] p,
:root[style*="--USER__bodyHyphens"] li,
:root[style*="--USER__bodyHyphens"] div,
:root[style*="--USER__bodyHyphens"] dd{
  -webkit-hyphens:var(--USER__bodyHyphens) !important;
  -moz-hyphens:var(--USER__bodyHyphens) !important;
  -ms-hyphens:var(--USER__bodyHyphens) !important;
  -epub-hyphens:var(--USER__bodyHyphens) !important;
  hyphens:var(--USER__bodyHyphens) !important;
}

:root[style*="--USER__fontFamily"]{
  font-family:var(--USER__fontFamily) !important;
}

:root[style*="--USER__fontFamily"] *{
  font-family:revert !important;
}

:root[style*="readium-a11y-on"]{
  font-style:normal !important;
  font-weight:normal !important;
}

:root[style*="readium-a11y-on"] body *:not(code):not(var):not(kbd):not(samp){
  font-family:inherit !important;
  font-style:inherit !important;
  font-weight:inherit !important;
}

:root[style*="readium-a11y-on"] body *:not(a){
  text-decoration:none !important;
}

:root[style*="readium-a11y-on"] body *{
  font-variant-caps:normal !important;
  font-variant-numeric:normal !important;
  font-variant-position:normal !important;
}

:root[style*="readium-a11y-on"] sup,
:root[style*="readium-a11y-on"] sub{
  font-size:1rem !important;
  vertical-align:baseline !important;
}

:root:not([style*="readium-iOSPatch-on"])[style*="--USER__zoom"] body{
  zoom:var(--USER__zoom) !important;
}

:root[style*="readium-iOSPatch-on"][style*="--USER__zoom"] body{
  -webkit-text-size-adjust:var(--USER__zoom) !important;
}

@supports selector(figure:has(> img)){

  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-iOSPatch-on"])[style*="--USER__zoom"] figure:has(> img),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-iOSPatch-on"])[style*="--USER__zoom"] figure:has(> video),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-iOSPatch-on"])[style*="--USER__zoom"] figure:has(> svg),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-iOSPatch-on"])[style*="--USER__zoom"] figure:has(> canvas),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-iOSPatch-on"])[style*="--USER__zoom"] figure:has(> iframe),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-iOSPatch-on"])[style*="--USER__zoom"] figure:has(> audio),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-iOSPatch-on"])[style*="--USER__zoom"] div:has(> img:only-child),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-iOSPatch-on"])[style*="--USER__zoom"] div:has(> video:only-child),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-iOSPatch-on"])[style*="--USER__zoom"] div:has(> svg:only-child),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-iOSPatch-on"])[style*="--USER__zoom"] div:has(> canvas:only-child),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-iOSPatch-on"])[style*="--USER__zoom"] div:has(> iframe:only-child),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-iOSPatch-on"])[style*="--USER__zoom"] div:has(> audio:only-child),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-iOSPatch-on"])[style*="--USER__zoom"] table{
    zoom:calc(100% / var(--USER__zoom)) !important;
  }

  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-iOSPatch-on"])[style*="--USER__zoom"] figcaption,
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-iOSPatch-on"])[style*="--USER__zoom"] caption,
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-iOSPatch-on"])[style*="--USER__zoom"] td,
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-iOSPatch-on"])[style*="--USER__zoom"] th{
    zoom:var(--USER__zoom) !important;
  }
}

:root[style*="--USER__lineHeight"]{
  line-height:var(--USER__lineHeight) !important;
}

:root[style*="--USER__lineHeight"] body,
:root[style*="--USER__lineHeight"] p,
:root[style*="--USER__lineHeight"] li,
:root[style*="--USER__lineHeight"] div{
  line-height:var(--USER__lineHeight) !important;
}

:root[style*="--USER__paraSpacing"] p{
  margin-top:var(--USER__paraSpacing) !important;
  margin-bottom:var(--USER__paraSpacing) !important;
}

:root[style*="--USER__paraIndent"] p:not(
  blockquote p,
  figcaption p,
  header p,
  hgroup p,
  :root[style*="readium-experimentalHeaderFiltering-on"] p[class*="title"],
  :root[style*="readium-experimentalHeaderFiltering-on"] div:has(+ *) > h1 + p,
  :root[style*="readium-experimentalHeaderFiltering-on"] div:has(+ *) > p:has(+ h1)
){
  text-indent:var(--USER__paraIndent) !important;
}

:root[style*="--USER__paraIndent"] p *{
  text-indent:0 !important;
}

:root[style*="--USER__wordSpacing"] h1,
:root[style*="--USER__wordSpacing"] h2,
:root[style*="--USER__wordSpacing"] h3,
:root[style*="--USER__wordSpacing"] h4,
:root[style*="--USER__wordSpacing"] h5,
:root[style*="--USER__wordSpacing"] h6,
:root[style*="--USER__wordSpacing"] p,
:root[style*="--USER__wordSpacing"] li,
:root[style*="--USER__wordSpacing"] div,
:root[style*="--USER__wordSpacing"] dt,
:root[style*="--USER__wordSpacing"] dd{
  word-spacing:var(--USER__wordSpacing) !important;
}

:root[style*="--USER__letterSpacing"] h1,
:root[style*="--USER__letterSpacing"] h2,
:root[style*="--USER__letterSpacing"] h3,
:root[style*="--USER__letterSpacing"] h4,
:root[style*="--USER__letterSpacing"] h5,
:root[style*="--USER__letterSpacing"] h6,
:root[style*="--USER__letterSpacing"] p,
:root[style*="--USER__letterSpacing"] li,
:root[style*="--USER__letterSpacing"] div,
:root[style*="--USER__letterSpacing"] dt,
:root[style*="--USER__letterSpacing"] dd{
  letter-spacing:var(--USER__letterSpacing) !important;
  font-variant:none !important;
}

:root[style*="--USER__fontWeight"] body{
  font-weight:var(--USER__fontWeight) !important;
}

:root[style*="--USER__fontWeight"] b,
:root[style*="--USER__fontWeight"] strong{
  font-weight:bolder;
}

:root[style*="--USER__fontWidth"] body{
  font-stretch:var(--USER__fontWidth) !important;
}

:root[style*="--USER__fontOpticalSizing"] body{
  font-optical-sizing:var(--USER__fontOpticalSizing) !important;
}

:root[style*="readium-noRuby-on"] body rt,
:root[style*="readium-noRuby-on"] body rp{
  display:none;
}

:root[style*="--USER__ligatures"]{
  font-variant-ligatures:var(--USER__ligatures) !important;
}

:root[style*="--USER__ligatures"] *{
  font-variant-ligatures:inherit !important;
}

:root[style*="readium-iPadOSPatch-on"] body{
  -webkit-text-size-adjust:none;
}

:root[style*="readium-iPadOSPatch-on"] p, 
:root[style*="readium-iPadOSPatch-on"] h1, 
:root[style*="readium-iPadOSPatch-on"] h2, 
:root[style*="readium-iPadOSPatch-on"] h3, 
:root[style*="readium-iPadOSPatch-on"] h4, 
:root[style*="readium-iPadOSPatch-on"] h5, 
:root[style*="readium-iPadOSPatch-on"] h6, 
:root[style*="readium-iPadOSPatch-on"] li, 
:root[style*="readium-iPadOSPatch-on"] th, 
:root[style*="readium-iPadOSPatch-on"] td, 
:root[style*="readium-iPadOSPatch-on"] dt, 
:root[style*="readium-iPadOSPatch-on"] dd, 
:root[style*="readium-iPadOSPatch-on"] pre, 
:root[style*="readium-iPadOSPatch-on"] address, 
:root[style*="readium-iPadOSPatch-on"] details, 
:root[style*="readium-iPadOSPatch-on"] summary,
:root[style*="readium-iPadOSPatch-on"] figcaption,
:root[style*="readium-iPadOSPatch-on"] div:not(:has(p, h1, h2, h3, h4, h5, h6, li, th, td, dt, dd, pre, address, aside, details, figcaption, summary)),
:root[style*="readium-iPadOSPatch-on"] aside:not(:has(p, h1, h2, h3, h4, h5, h6, li, th, td, dt, dd, pre, address, aside, details, figcaption, summary)){
  -webkit-text-zoom:reset;
}

:root[style*="readium-iPadOSPatch-on"] abbr, 
:root[style*="readium-iPadOSPatch-on"] b, 
:root[style*="readium-iPadOSPatch-on"] bdi, 
:root[style*="readium-iPadOSPatch-on"] bdo, 
:root[style*="readium-iPadOSPatch-on"] cite, 
:root[style*="readium-iPadOSPatch-on"] code, 
:root[style*="readium-iPadOSPatch-on"] dfn, 
:root[style*="readium-iPadOSPatch-on"] em, 
:root[style*="readium-iPadOSPatch-on"] i, 
:root[style*="readium-iPadOSPatch-on"] kbd, 
:root[style*="readium-iPadOSPatch-on"] mark, 
:root[style*="readium-iPadOSPatch-on"] q, 
:root[style*="readium-iPadOSPatch-on"] rp, 
:root[style*="readium-iPadOSPatch-on"] rt, 
:root[style*="readium-iPadOSPatch-on"] ruby, 
:root[style*="readium-iPadOSPatch-on"] s, 
:root[style*="readium-iPadOSPatch-on"] samp, 
:root[style*="readium-iPadOSPatch-on"] small, 
:root[style*="readium-iPadOSPatch-on"] span, 
:root[style*="readium-iPadOSPatch-on"] strong, 
:root[style*="readium-iPadOSPatch-on"] sub, 
:root[style*="readium-iPadOSPatch-on"] sup, 
:root[style*="readium-iPadOSPatch-on"] time, 
:root[style*="readium-iPadOSPatch-on"] u, 
:root[style*="readium-iPadOSPatch-on"] var{
  -webkit-text-zoom:normal;
}

:root[style*="readium-iPadOSPatch-on"] p:not(:has(b, cite, em, i, q, s, small, span, strong)):first-line{
  -webkit-text-zoom:normal;
}`,Ti='!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports._readium_cssSelectorGenerator=e():t._readium_cssSelectorGenerator=e()}(self,(()=>(()=>{"use strict";var t={d:(e,n)=>{for(var o in n)t.o(n,o)&&!t.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:n[o]})},o:(t,e)=>Object.prototype.hasOwnProperty.call(t,e),r:t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})}},e={};function n(t){return"object"==typeof t&&null!==t&&t.nodeType===Node.ELEMENT_NODE}t.r(e),t.d(e,{_readium_cssSelectorGenerator:()=>Z,default:()=>tt,getCssSelector:()=>X});const o={NONE:"",DESCENDANT:" ",CHILD:" > "},r={id:"id",class:"class",tag:"tag",attribute:"attribute",nthchild:"nthchild",nthoftype:"nthoftype"},i="_readium_cssSelectorGenerator";function c(t="unknown problem",...e){console.warn(`${i}: ${t}`,...e)}const s={selectors:[r.id,r.class,r.tag,r.attribute],includeTag:!1,whitelist:[],blacklist:[],combineWithinSelector:!0,combineBetweenSelectors:!0,root:null,maxCombinations:Number.POSITIVE_INFINITY,maxCandidates:Number.POSITIVE_INFINITY,useScope:!1};function u(t){return t instanceof RegExp}function l(t){return["string","function"].includes(typeof t)||u(t)}function a(t){return Array.isArray(t)?t.filter(l):[]}function f(t){const e=[Node.DOCUMENT_NODE,Node.DOCUMENT_FRAGMENT_NODE,Node.ELEMENT_NODE];return function(t){return t instanceof Node}(t)&&e.includes(t.nodeType)}function d(t,e){if(f(t))return t.contains(e)||c("element root mismatch","Provided root does not contain the element. This will most likely result in producing a fallback selector using element\'s real root node. If you plan to use the selector using provided root (e.g. `root.querySelector`), it will not work as intended."),t;const n=e.getRootNode({composed:!1});return f(n)?(n!==document&&c("shadow root inferred","You did not provide a root and the element is a child of Shadow DOM. This will produce a selector using ShadowRoot as a root. If you plan to use the selector using document as a root (e.g. `document.querySelector`), it will not work as intended."),n):S(e)}function m(t){return"number"==typeof t?t:Number.POSITIVE_INFINITY}function p(t=[]){const[e=[],...n]=t;return 0===n.length?e:n.reduce(((t,e)=>t.filter((t=>e.includes(t)))),e)}function g(t){const e=t.map((t=>{if(u(t))return e=>t.test(e);if("function"==typeof t)return e=>{const n=t(e);return"boolean"!=typeof n?(c("pattern matcher function invalid","Provided pattern matching function does not return boolean. It\'s result will be ignored.",t),!1):n};if("string"==typeof t){const e=new RegExp("^"+t.replace(/[|\\\\{}()[\\]^$+?.]/g,"\\\\$&").replace(/\\*/g,".+")+"$");return t=>e.test(t)}return c("pattern matcher invalid","Pattern matching only accepts strings, regular expressions and/or functions. This item is invalid and will be ignored.",t),()=>!1}));return t=>e.some((e=>e(t)))}function h(t,e,n){const o=Array.from(d(n,t[0]).querySelectorAll(e));return o.length===t.length&&t.every((t=>o.includes(t)))}function y(t,e){e=null!=e?e:S(t);const o=[];let r=t;for(;n(r)&&r!==e;)o.push(r),r=r.parentElement;return o}function b(t,e){return p(t.map((t=>y(t,e))))}function S(t){return t.ownerDocument.querySelector(":root")}const N=", ",v=new RegExp(["^$","\\\\s"].join("|")),E=new RegExp(["^$"].join("|")),x=[r.nthoftype,r.tag,r.id,r.class,r.attribute,r.nthchild],w=g(["class","id","ng-*"]);function I({name:t}){return`[${t}]`}function T({name:t,value:e}){return`[${t}=\'${e}\']`}function O({nodeName:t,nodeValue:e}){return{name:F(t),value:F(null!=e?e:void 0)}}function C(t){const e=Array.from(t.attributes).filter((e=>function({nodeName:t,nodeValue:e},n){const o=n.tagName.toLowerCase();return!(["input","option"].includes(o)&&"value"===t||"src"===t&&(null==e?void 0:e.startsWith("data:"))||w(t))}(e,t))).map(O);return[...e.map(I),...e.map(T)]}function j(t){var e;return(null!==(e=t.getAttribute("class"))&&void 0!==e?e:"").trim().split(/\\s+/).filter((t=>!E.test(t))).map((t=>`.${F(t)}`))}function A(t){var e;const n=null!==(e=t.getAttribute("id"))&&void 0!==e?e:"",o=`#${F(n)}`,r=t.getRootNode({composed:!1});return!v.test(n)&&h([t],o,r)?[o]:[]}function R(t){var e;const n=null===(e=t.parentElement)||void 0===e?void 0:e.children;if(n)for(let e=0;e<n.length;e++)if(n[e]===t)return[`:nth-child(${String(e+1)})`];return[]}function $(t){return[F(t.tagName.toLowerCase())]}function D(t){const e=[...new Set((n=t.map($),[].concat(...n)))];var n;return 0===e.length||e.length>1?[]:[e[0]]}function k(t){const e=D([t])[0],n=t.parentElement;if(n){const o=Array.from(n.children).filter((t=>t.tagName.toLowerCase()===e)),r=o.indexOf(t);if(r>-1)return[`${e}:nth-of-type(${String(r+1)})`]}return[]}function*P(t=[],{maxResults:e=Number.POSITIVE_INFINITY}={}){let n=0,o=L(1);for(;o.length<=t.length&&n<e;){n+=1;const e=o.map((e=>t[e]));yield e,o=_(o,t.length-1)}}function _(t=[],e=0){const n=t.length;if(0===n)return[];const o=[...t];o[n-1]+=1;for(let t=n-1;t>=0;t--)if(o[t]>e){if(0===t)return L(n+1);o[t-1]++,o[t]=o[t-1]+1}return o[n-1]>e?L(n+1):o}function L(t=1){return Array.from(Array(t).keys())}const M=":".charCodeAt(0).toString(16).toUpperCase(),V=/[ !"#$%&\'()\\[\\]{|}<>*+,./;=?@^`~\\\\]/;function F(t=""){return CSS?CSS.escape(t):function(t=""){return t.split("").map((t=>":"===t?`\\\\${M} `:V.test(t)?`\\\\${t}`:escape(t).replace(/%/g,"\\\\"))).join("")}(t)}const Y={tag:D,id:function(t){return 0===t.length||t.length>1?[]:A(t[0])},class:function(t){return p(t.map(j))},attribute:function(t){return p(t.map(C))},nthchild:function(t){return p(t.map(R))},nthoftype:function(t){return p(t.map(k))}},G={tag:$,id:A,class:j,attribute:C,nthchild:R,nthoftype:k};function W(t){return t.includes(r.tag)||t.includes(r.nthoftype)?[...t]:[...t,r.tag]}function*q(t,e){const n={};for(const o of t){const t=e[o];t&&t.length>0&&(n[o]=t)}for(const t of function*(t={}){const e=Object.entries(t);if(0===e.length)return;const n=[{index:e.length-1,partial:{}}];for(;n.length>0;){const t=n.pop();if(!t)break;const{index:o,partial:r}=t;if(o<0){yield r;continue}const[i,c]=e[o];for(let t=c.length-1;t>=0;t--)n.push({index:o-1,partial:Object.assign(Object.assign({},r),{[i]:c[t]})})}}(n))yield B(t)}function B(t={}){const e=[...x];return t[r.tag]&&t[r.nthoftype]&&e.splice(e.indexOf(r.tag),1),e.map((e=>{return(o=t)[n=e]?o[n].join(""):"";var n,o})).join("")}function H(t,e){return[...t.map((t=>e+o.DESCENDANT+t)),...t.map((t=>e+o.CHILD+t))]}function*U(t,e,n="",o){const r=function*(t,e){const n=new Set,o=function(t,e){const{blacklist:n,whitelist:o,combineWithinSelector:r,maxCombinations:i}=e,c=g(n),s=g(o);return function(t){const{selectors:e,includeTag:n}=t,o=[...e];return n&&!o.includes("tag")&&o.push("tag"),o}(e).reduce(((e,n)=>{const o=function(t,e){return(0,Y[e])(t)}(t,n),u=function(t=[],e,n){return t.filter((t=>n(t)||!e(t)))}(o,c,s),l=function(t=[],e){return t.sort(((t,n)=>{const o=e(t),r=e(n);return o&&!r?-1:!o&&r?1:0}))}(u,s);return e[n]=r?Array.from(P(l,{maxResults:i})):l.map((t=>[t])),e}),{})}(t,e);for(const t of function*(t,e){for(const n of function(t){const{selectors:e,combineBetweenSelectors:n,includeTag:o,maxCandidates:r}=t,i=n?function(t=[],{maxResults:e=Number.POSITIVE_INFINITY}={}){return Array.from(P(t,{maxResults:e}))}(e,{maxResults:r}):e.map((t=>[t]));return o?i.map(W):i}(e))yield*q(n,t)}(o,e))n.has(t)||(n.add(t),yield t)}(t,o);for(const o of function*(t,e){if(""===e)yield*t;else for(const n of t)yield*H([n],e)}(r,n))h(t,o,e)&&(yield o)}function*z(t,e,n="",o){if(0===t.length)return null;const r=[t.length>1?t:[],...b(t,e).map((t=>[t]))];for(const t of r)for(const r of U(t,e,n,o))yield{foundElements:t,selector:r}}function J(t){return{value:t,include:!1}}function K({selectors:t,operator:e}){let n=[...x];t[r.tag]&&t[r.nthoftype]&&(n=n.filter((t=>t!==r.tag)));let o="";return n.forEach((e=>{var n;(null!==(n=t[e])&&void 0!==n?n:[]).forEach((({value:t,include:e})=>{e&&(o+=t)}))})),e+o}function Q(t,e){return t.map((t=>function(t,e){return[e?":scope":":root",...y(t,e).reverse().map((t=>{var e;const n=function(t,e,n=o.NONE){const r={};return e.forEach((e=>{Reflect.set(r,e,function(t,e){return G[e](t)}(t,e).map(J))})),{element:t,operator:n,selectors:r}}(t,[r.nthchild],o.CHILD);return(null!==(e=n.selectors.nthchild)&&void 0!==e?e:[]).forEach((t=>{t.include=!0})),n})).map(K)].join("")}(t,e))).join(N)}function X(t,e={}){return Z(t,Object.assign(Object.assign({},e),{maxResults:1})).next().value}function*Z(t,e={}){var o;const i=function(t){(t instanceof NodeList||t instanceof HTMLCollection)&&(t=Array.from(t));const e=(Array.isArray(t)?t:[t]).filter(n);return[...new Set(e)]}(t),c=function(t,e={}){const n=Object.assign(Object.assign({},s),e);return{selectors:(o=n.selectors,Array.isArray(o)?o.filter((t=>{return e=r,n=t,Object.values(e).includes(n);var e,n})):[]),whitelist:a(n.whitelist),blacklist:a(n.blacklist),root:d(n.root,t),combineWithinSelector:!!n.combineWithinSelector,combineBetweenSelectors:!!n.combineBetweenSelectors,includeTag:!!n.includeTag,maxCombinations:m(n.maxCombinations),maxCandidates:m(n.maxCandidates),useScope:!!n.useScope,maxResults:m(n.maxResults)};var o}(i[0],e),u=null!==(o=c.root)&&void 0!==o?o:S(i[0]);let l=0;for(const t of function*({elements:t,root:e,rootSelector:n="",options:o}){let r=e,i=n,c=!0;for(;c;){let n=!1;for(const c of z(t,r,i,o)){const{foundElements:o,selector:s}=c;if(n=!0,!h(t,s,e)){r=o[0],i=s;break}yield s}n||(c=!1)}}({elements:i,options:c,root:u,rootSelector:""}))if(yield t,l++,l>=c.maxResults)return;i.length>1&&(yield i.map((t=>X(t,c))).join(N),l++,l>=c.maxResults)||(yield Q(i,c.useScope?u:void 0))}const tt=X;return e})()));',zr=`// WebPub-specific setup - no execution blocking needed
window._readium_blockedEvents = [];
window._readium_blockEvents = false; // WebPub doesn't need event blocking
window._readium_eventBlocker = null;
`,Ni=`(function() {
    if(window.onload) window.onload = new Proxy(window.onload, {
        apply: function(target, receiver, args) {
            if(!window._readium_blockEvents) {
                Reflect.apply(target, receiver, args);
                return;
            }
            _readium_blockedEvents.push([
                0, target, receiver, args
            ]);
        }
    });
})();
`;function Lr(r){const e=r.filter(o=>o.mediaType.isHTML).map(o=>o.href),t=e.length>0?e:[/\.html$/,/\.xhtml$/,/\/$/],n=[{id:"css-selector-generator",as:"script",target:"head",blob:new Blob([Fe(Ti)],{type:"text/javascript"})},{id:"webpub-execution",as:"script",target:"head",blob:new Blob([Fe(zr)],{type:"text/javascript"})}],i=[{id:"onload-proxy",as:"script",target:"head",blob:new Blob([Fe(Ni)],{type:"text/javascript"}),condition:o=>!!(o.querySelector("script")||o.querySelector("body[onload]:not(body[onload=''])"))},{id:"readium-css-webpub",as:"link",target:"head",blob:new Blob([Ze(Fr)],{type:"text/css"}),rel:"stylesheet"}];return[{resources:t,prepend:n,append:i}]}class Or{constructor(e){if(this.detectedTools=new Set,!e.onDetected)throw new Error("onDetected callback is required");this.options=e,this.setupDetection()}isAutomationToolPresent(){const e=window;return e.domAutomation||e.domAutomationController?"Selenium":navigator.webdriver===!0?"Puppeteer/Playwright":e.__webdriver_evaluate||e.__selenium_evaluate?"Chrome Automation":e.callPhantom||e._phantom?"PhantomJS":e.__nightmare?"Nightmare":e.$testCafe?"TestCafe":null}setupDetection(){const e=this.isAutomationToolPresent();if(e){this.handleDetected(e);return}this.observer=new MutationObserver(()=>{const t=this.isAutomationToolPresent();t&&!this.detectedTools.has(t)&&this.handleDetected(t)}),this.observer.observe(document.documentElement,{childList:!0,subtree:!0,attributes:!0}),window.addEventListener("unload",()=>this.destroy())}handleDetected(e){this.detectedTools.add(e),this.options.onDetected?.(e)}destroy(){this.observer?.disconnect(),this.observer=void 0,this.detectedTools.clear()}}let Ar=0;function Tr(){return++Ar}const Nr=`
onmessage = function(event) {
  var action = event.data;
  var startTime = performance.now()

  console[action.type](...action.payload);
  postMessage({
    id: action.id,
    time: performance.now() - startTime
  })
}
`,vn=class vn{constructor(e,t){this.callbacks=new Map,this.worker=e,this.blobUrl=t,this.worker.onmessage=n=>{const i=n.data,o=i.id,a=this.callbacks.get(i.id);a&&(a({time:i.time}),this.callbacks.delete(o))},this.log=(...n)=>this.send("log",...n),this.table=(...n)=>this.send("table",...n),this.clear=(...n)=>this.send("clear",...n)}async send(e,...t){const n=Tr();return new Promise((i,o)=>{this.callbacks.set(n,i),this.worker.postMessage({id:n,type:e,payload:t}),setTimeout(()=>{o(new Error("timeout")),this.callbacks.delete(n)},2e3)})}destroy(){this.worker.terminate(),URL.revokeObjectURL(this.blobUrl)}};vn.workerScript=Nr;let _t=vn;function cn(r){return typeof window<"u"&&console?console[r]:(...e)=>{}}const Mr=cn("log"),Mi=cn("table"),Ur=cn("clear");async function Ui(){if(typeof navigator<"u"&&navigator.brave&&navigator.brave.isBrave)try{return await Promise.race([navigator.brave.isBrave(),new Promise(r=>setTimeout(()=>r(!1),1e3))])}catch{return!0}return!1}function Ir(r){return r.excludes.some(e=>e())?!1:r.includes.some(e=>e())}class Hr{constructor(e={}){if(this.isOpen=!1,this.checkCount=0,this.maxChecks=10,this.maxPrintTime=0,this.largeObjectArray=null,this.options={onDetected:e.onDetected||(()=>{}),onClosed:e.onClosed||(()=>{}),interval:e.interval||1e3,enableDebuggerDetection:e.enableDebuggerDetection||!1},!Y.UA.Firefox)try{const t=new Blob([_t.workerScript],{type:"application/javascript"}),n=URL.createObjectURL(t),i=new Worker(n);this.workerConsole=new _t(i,n)}catch(t){console.warn("Failed to create Web Worker for DevTools detection:",t)}this.startDetection()}createLargeObjectArray(){const e={};for(let n=0;n<500;n++)e[`${n}`]=`${n}`;const t=[];for(let n=0;n<50;n++)t.push(e);return t}getLargeObjectArray(){return this.largeObjectArray===null&&(this.largeObjectArray=this.createLargeObjectArray()),this.largeObjectArray}async calcTablePrintTime(){const e=this.getLargeObjectArray();if(this.workerConsole)try{return(await this.workerConsole.table(e)).time}catch{const n=performance.now();return Mi(e),performance.now()-n}else{const t=performance.now();return Mi(e),performance.now()-t}}async calcLogPrintTime(){const e=this.getLargeObjectArray();if(this.workerConsole)return(await this.workerConsole.log(e)).time;{const t=performance.now();return Mr(e),performance.now()-t}}isPerformanceDetectionEnabled(){return Ir({includes:[()=>!!Y.UA.Chrome,()=>!!Y.UA.Chromium,()=>!!Y.UA.Safari,()=>!!Y.UA.Firefox],excludes:[]})}isDebuggerDetectionEnabled(){return this.options.enableDebuggerDetection}async checkPerformanceBased(){if(!this.isPerformanceDetectionEnabled())return!1;const e=await this.calcTablePrintTime(),t=Math.max(await this.calcLogPrintTime(),await this.calcLogPrintTime());return this.maxPrintTime=Math.max(this.maxPrintTime,t),this.workerConsole?await this.workerConsole.clear():Ur(),e===0?!1:this.maxPrintTime===0?!!await Ui():e>this.maxPrintTime*10}async checkDebuggerBased(){if(!this.isDebuggerDetectionEnabled()||await Ui())return!1;const e=performance.now();try{(()=>{}).constructor("debugger")()}catch{debugger}return performance.now()-e>100}async detectDevTools(){return await this.checkPerformanceBased()?!0:this.options.enableDebuggerDetection&&this.checkCount>=this.maxChecks?await this.checkDebuggerBased():!1}startDetection(){this.intervalId=window.setInterval(async()=>{this.checkCount++;const e=await this.detectDevTools();e!==this.isOpen&&(this.isOpen=e,e?this.options.onDetected():this.options.onClosed()),this.checkCount>this.maxChecks*2&&(this.checkCount=0)},this.options.interval),window.addEventListener("beforeunload",()=>this.destroy())}isDevToolsOpen(){return this.isOpen}async checkNow(){const e=this.isOpen;return this.isOpen=await this.detectDevTools(),this.isOpen!==e&&(this.isOpen?this.options.onDetected():this.options.onClosed()),this.isOpen}destroy(){this.intervalId&&(clearInterval(this.intervalId),this.intervalId=void 0),this.workerConsole&&(this.workerConsole.destroy(),this.workerConsole=void 0),this.isOpen=!1,this.checkCount=0}}class Dr{constructor(e){if(this.detected=!1,!e.onDetected)throw new Error("onDetected callback is required");this.options=e,this.setupDetection()}isIframed(){try{return window.self!==window.top?{isEmbedded:!0,isCrossOrigin:!window.top.location.href}:{isEmbedded:!1,isCrossOrigin:!1}}catch{return{isEmbedded:!0,isCrossOrigin:!0}}}setupDetection(){const{isEmbedded:e,isCrossOrigin:t}=this.isIframed();if(e){this.handleDetected(t);return}this.observer=new MutationObserver(()=>{const{isEmbedded:n,isCrossOrigin:i}=this.isIframed();n&&!this.detected&&(this.handleDetected(i),this.observer?.disconnect())}),this.observer.observe(document.documentElement,{childList:!0,subtree:!0,attributes:!0}),window.addEventListener("unload",()=>this.destroy())}handleDetected(e){this.detected=!0,this.options.onDetected?.(e)}destroy(){this.observer?.disconnect(),this.observer=void 0,this.detected=!1}}class Wr{constructor(e={}){this.styleElement=null,this.beforePrintHandler=null,this.onPrintAttempt=e.onPrintAttempt,e.disable&&this.setupPrintProtection(e.watermark)}setupPrintProtection(e){const t=document.createElement("style");t.textContent=`
            @media print {
                body * {
                    display: none !important;
                }
                body::after {
                    content: "${e||"Printing has been disabled"}";
                    font-size: 200%;
                    display: block;
                    text-align: center;
                    margin-top: 50vh;
                    transform: translateY(-50%);
                }
            }
        `,document.head.appendChild(t),this.styleElement=t,this.beforePrintHandler=n=>(n.preventDefault(),this.onPrintAttempt?.(),!1),window.addEventListener("beforeprint",this.beforePrintHandler)}destroy(){this.beforePrintHandler&&(window.removeEventListener("beforeprint",this.beforePrintHandler),this.beforePrintHandler=null),this.styleElement?.parentNode&&(this.styleElement.parentNode.removeChild(this.styleElement),this.styleElement=null)}}class Br{constructor(e={}){this.onContextMenuBlocked=e.onContextMenuBlocked,this.contextMenuHandler=this.handleContextMenu.bind(this),document.addEventListener("contextmenu",this.contextMenuHandler,!0),window.addEventListener("unload",()=>this.destroy())}handleContextMenu(e){e.preventDefault(),e.stopPropagation();const t={type:"context_menu",timestamp:Date.now(),clientX:e.clientX,clientY:e.clientY,targetFrameSrc:""};return this.onContextMenuBlocked&&this.onContextMenuBlocked(t),!1}destroy(){this.contextMenuHandler&&(document.removeEventListener("contextmenu",this.contextMenuHandler,!0),this.contextMenuHandler=void 0)}}const ge="readium:navigator:suspiciousActivity";class hn{dispatchSuspiciousActivity(e,t){const n=new CustomEvent(ge,{detail:{type:e,timestamp:Date.now(),...t}});window.dispatchEvent(n)}constructor(e={}){e.monitorDevTools&&(this.devToolsDetector=new Hr({onDetected:()=>{this.dispatchSuspiciousActivity("developer_tools",{targetFrameSrc:"",key:"",code:"",keyCode:-1,ctrlKey:!1,altKey:!1,shiftKey:!1,metaKey:!1})}})),e.checkAutomation&&(this.automationDetector=new Or({onDetected:t=>{this.dispatchSuspiciousActivity("automation_detected",{tool:t})}})),e.checkIFrameEmbedding&&(this.iframeEmbeddingDetector=new Dr({onDetected:t=>{this.dispatchSuspiciousActivity("iframe_embedding_detected",{isCrossOrigin:t})}})),e.protectPrinting?.disable&&(this.printProtector=new Wr({...e.protectPrinting,onPrintAttempt:()=>{this.dispatchSuspiciousActivity("print",{})}})),e.disableContextMenu&&(this.contextMenuProtector=new Br({onContextMenuBlocked:t=>{this.dispatchSuspiciousActivity("context_menu",t)}}))}destroy(){this.automationDetector?.destroy(),this.devToolsDetector?.destroy(),this.iframeEmbeddingDetector?.destroy(),this.printProtector?.destroy(),this.contextMenuProtector?.destroy()}}const fe="readium:navigator:keyboardPeripheral";class dn{constructor(e={}){this.keyManager=new fi,this.setupKeyboardPeripherals(e.keyboardPeripherals||[])}setupKeyboardPeripherals(e){if(e.length>0){const t=n=>{const i=new CustomEvent(fe,{detail:n});window.dispatchEvent(i)};this.keydownHandler=this.keyManager.createUnifiedHandler("",e,t),this.keydownHandler&&document.addEventListener("keydown",this.keydownHandler,!0)}window.addEventListener("unload",()=>this.destroy())}destroy(){this.keydownHandler&&(document.removeEventListener("keydown",this.keydownHandler,!0),this.keydownHandler=void 0)}}const jr=r=>({frameLoaded:r.frameLoaded||(()=>{}),positionChanged:r.positionChanged||(()=>{}),tap:r.tap||(()=>!1),click:r.click||(()=>!1),zoom:r.zoom||(()=>{}),scroll:r.scroll||(()=>{}),customEvent:r.customEvent||(()=>{}),handleLocator:r.handleLocator||(()=>!1),textSelected:r.textSelected||(()=>{}),contentProtection:r.contentProtection||(()=>{}),contextMenu:r.contextMenu||(()=>{}),peripheral:r.peripheral||(()=>{})});class Ii extends Jt{constructor(e,t,n,i=void 0,o={preferences:{},defaults:{}}){super(),this.currentIndex=0,this._preferencesEditor=null,this._injector=null,this._isNavigating=!1,this._navigatorProtector=null,this._keyboardPeripheralsManager=null,this._suspiciousActivityListener=null,this._keyboardPeripheralListener=null,this._decorations=new Map,this._decorationObservers=new Map,this._decorationActivationState=new Map,this._decorationActivationConsumed=!1,this.webViewport={readingOrder:[],progressions:new Map,positions:null},this.pub=t,this.container=e,this.listeners=jr(n),this._preferences=new xe(o.preferences),this._defaults=new zi(o.defaults),this._settings=new rn(this._preferences,this._defaults,this.hasDisplayTransformability),this._css=new Ei({rsProperties:new ki({experiments:this._settings.experiments||null}),userProperties:new nn({zoom:this._settings.zoom})});const a=Lr(t.readingOrder.items),s=o.injectables||{rules:[],allowedDomains:[]};if(this._injector=new ln({rules:[...a,...s.rules],allowedDomains:s.allowedDomains}),this._contentProtection=o.contentProtection||{},this._decoratorConfig=o.decoratorConfig||{},this._keyboardPeripherals=this.mergeKeyboardPeripherals(this._contentProtection,o.keyboardPeripherals||[]),(this._contentProtection.disableContextMenu||this._contentProtection.checkAutomation||this._contentProtection.checkIFrameEmbedding||this._contentProtection.monitorDevTools||this._contentProtection.protectPrinting?.disable)&&(this._navigatorProtector=new hn(this._contentProtection),this._suspiciousActivityListener=l=>{const{type:d,...c}=l.detail;d==="context_menu"?this.listeners.contextMenu(c):this.listeners.contentProtection(d,c)},window.addEventListener(ge,this._suspiciousActivityListener)),this._keyboardPeripherals.length>0&&(this._keyboardPeripheralsManager=new dn({keyboardPeripherals:this._keyboardPeripherals}),this._keyboardPeripheralListener=l=>{const d=l.detail;this.listeners.peripheral(d)},window.addEventListener(fe,this._keyboardPeripheralListener)),i&&typeof i.copyWithLocations=="function"){this.currentLocation=i;const l=this.pub.readingOrder.findIndexWithHref(i.href);l>=0&&(this.currentIndex=l)}else this.currentLocation=this.createCurrentLocator()}async load(){await this.updateCSS(!1);const e=this.compileCSSProperties(this._css);this.framePool=new Pi(this.container,e,this._injector,this._contentProtection,this._keyboardPeripherals),await this.apply()}get settings(){return Object.freeze({...this._settings})}get preferencesEditor(){return this._preferencesEditor===null&&(this._preferencesEditor=new sn(this._preferences,this.settings,this.pub.metadata)),this._preferencesEditor}async submitPreferences(e){this._preferences=this._preferences.merging(e),await this.applyPreferences()}async applyPreferences(){this._settings=new rn(this._preferences,this._defaults,this.hasDisplayTransformability),this._preferencesEditor!==null&&(this._preferencesEditor=new sn(this._preferences,this.settings,this.pub.metadata)),await this.updateCSS(!0)}async updateCSS(e){this._css.update(this._settings),e&&await this.commitCSS(this._css)}compileCSSProperties(e){const t={};for(const[n,i]of Object.entries(e.rsProperties.toCSSProperties()))t[n]=i;for(const[n,i]of Object.entries(e.userProperties.toCSSProperties()))t[n]=i;return t}async commitCSS(e){const t=this.compileCSSProperties(e);this.framePool.setCSSProperties(t)}get _cframes(){return this.framePool.currentFrames}get hasDisplayTransformability(){return this.pub.metadata?.accessibility?.feature?.some(e=>e.value===it.DISPLAY_TRANSFORMABILITY.value)??!1}eventListener(e,t){switch(e){case"_pong":this.listeners.frameLoaded(this.framePool.currentFrames[0].iframe.contentWindow),this.listeners.positionChanged(this.currentLocation),this._reapplyDecorationsToCurrentFrame();break;case"first_visible_locator":const n=N.deserialize(t);if(!n)break;this.currentLocation=new N({href:this.currentLocation.href,type:this.currentLocation.type,title:this.currentLocation.title,locations:n?.locations,text:n?.text}),this.listeners.positionChanged(this.currentLocation);break;case"text_selected":{const l=t;l.locator=new N({href:this.currentLocation.href,type:this.currentLocation.type,text:new Q({highlight:l.text})}),this.listeners.textSelected(l);break}case"decoration_activated":{this._handleDecorationActivated(t)&&(this._decorationActivationConsumed=!0);break}case"click":case"tap":if(this._decorationActivationConsumed){this._decorationActivationConsumed=!1;break}const i=t;if(i.interactiveElement){const l=new DOMParser().parseFromString(i.interactiveElement,"text/html").body.children[0];if(l.nodeType===l.ELEMENT_NODE&&l.nodeName==="A"&&l.hasAttribute("href")){const d=l.attributes.getNamedItem("href")?.value;if(d.startsWith("#"))this.go(this.currentLocation.copyWithLocations({fragments:[d.substring(1)]}),!1,()=>{});else if(d.startsWith("mailto:")||d.startsWith("tel:"))this.listeners.handleLocator(new K({href:d}).locator);else try{let c;if(d.startsWith("http://")||d.startsWith("https://"))c=d;else if(this.currentLocation.href.startsWith("http://")||this.currentLocation.href.startsWith("https://")){const u=new URL(this.currentLocation.href);c=new URL(d,u).href}else c=ft.join(ft.dirname(this.currentLocation.href),d);const h=this.pub.readingOrder.findWithHref(c);h?this.goLink(h,!1,()=>{}):(console.warn(`Internal link not found in readingOrder: ${c}`),this.listeners.handleLocator(new K({href:d}).locator))}catch(c){console.warn(`Couldn't resolve internal link for ${d}: ${c}`),this.listeners.handleLocator(new K({href:d}).locator)}}else console.log("Clicked on",l)}else if(e==="click"?this.listeners.click(i):this.listeners.tap(i))break;break;case"scroll":this.listeners.scroll(t);break;case"zoom":this.listeners.zoom(t);break;case"progress":this.syncLocation(t);break;case"content_protection":const o=t;this.listeners.contentProtection(o.type,o);break;case"context_menu":this.listeners.contextMenu(t);break;case"keyboard_peripherals":const a=t,s={...a,interactiveElement:void 0};a.interactiveElement&&(s.interactiveElement=new DOMParser().parseFromString(a.interactiveElement,"text/html").body.children[0]),this.listeners.peripheral(s);break;case"log":console.log(this.framePool.currentFrames[0]?.source?.split("/")[3],...t);break;default:this.listeners.customEvent(e,t);break}}determineModules(){const e=gr.slice(),t=de(this.pub.metadata);return t==="cjk-vertical"||t==="mongolian-vertical"?e.map(n=>n==="webpub_snapper"?"cjk_vertical_snapper":n):e}attachListener(){this.framePool.currentFrames[0]?.msg&&(this.framePool.currentFrames[0].msg.listener=(e,t)=>{this.eventListener(e,t)}),this._reapplyDecorationsToCurrentFrame()}async apply(){if(await this.framePool.update(this.pub,this.currentLocation,this.determineModules()),this.attachListener(),this.pub.readingOrder.findIndexWithHref(this.currentLocation.href)<0)throw Error("Link for "+this.currentLocation.href+" not found!")}async destroy(){this._suspiciousActivityListener&&window.removeEventListener(ge,this._suspiciousActivityListener),this._keyboardPeripheralListener&&window.removeEventListener(fe,this._keyboardPeripheralListener),this._navigatorProtector?.destroy(),this._keyboardPeripheralsManager?.destroy(),await this.framePool?.destroy(),this._decorations.clear(),this._decorationObservers.clear(),this._decorationActivationState.clear()}supportsDecorationStyle(e){return Qt.has(e)||!!this._decoratorConfig.decorationTemplates?.[e]}registerDecorationObserver(e,t){this._decorationObservers.has(e)||this._decorationObservers.set(e,new Set),this._decorationObservers.get(e).add(t),this._decorationActivationState.set(e,!0),this._sendDecorationActivatable(e,!0)}unregisterDecorationObserver(e){this._decorationObservers.forEach((t,n)=>{t.has(e)&&(t.delete(e),t.size===0&&(this._decorationActivationState.delete(n),this._sendDecorationActivatable(n,!1)))})}_sendDecorationActivatable(e,t){const n=this.framePool?.currentFrames[0];n?.msg&&n.msg.send("decoration_activatable",{group:e,activatable:t})}applyDecorations(e,t){const n=this._decorations.get(t)??[],i=new Map(n.map(c=>[c.id,c])),o=new Map(e.map(c=>[c.id,c])),a=[],s=[],l=[];for(const[c,h]of i)o.has(c)?Zt(h,o.get(c))||l.push(o.get(c)):a.push(c);for(const[c,h]of o)i.has(c)||s.push(h);this._decorations.set(t,e),this._sendDecorationOps(t,a,s,l,n);const d=this._decorationActivationState.get(t);d!==void 0&&this._sendDecorationActivatable(t,d)}_sendDecorationOps(e,t,n,i,o){const a=this.framePool?.currentFrames[0];if(!a?.msg)return;const s=this.currentLocation.href,l=new Map(o.map(d=>[d.id,d]));for(const d of t){const c=l.get(d);!c||c.locator.href!==s||a.msg.send("decorate",{group:e,action:"remove",decoration:{id:d}})}for(const d of n)d.locator.href===s&&a.msg.send("decorate",{group:e,action:"add",decoration:he(d,this._decoratorConfig.decorationTemplates)});for(const d of i)d.locator.href===s&&a.msg.send("decorate",{group:e,action:"update",decoration:he(d,this._decoratorConfig.decorationTemplates)})}_reapplyDecorationsToCurrentFrame(){const e=this.framePool?.currentFrames[0];if(!e?.msg)return;const t=this.currentLocation.href;for(const[n,i]of this._decorations){const o=i.filter(a=>a.locator.href===t);if(o.length!==0){e.msg.send("decorate",{group:n,action:"clear"});for(const a of o)e.msg.send("decorate",{group:n,action:"add",decoration:he(a,this._decoratorConfig.decorationTemplates)})}}for(const[n,i]of this._decorationActivationState)e.msg.send("decoration_activatable",{group:n,activatable:i})}_handleDecorationActivated(e){const t=this._decorationObservers.get(e.group);if(!t||t.size===0)return!1;const n=(this._decorations.get(e.group)??[]).find(a=>a.id===e.decorationId);if(!n)return!1;const i={decoration:n,group:e.group,rect:e.rect,point:e.point};let o=!1;for(const a of t)a.onDecorationActivated(i)&&(o=!0);return o}async changeResource(e){if(e===0)return!1;const t=this.pub.readingOrder.findIndexWithHref(this.currentLocation.href),n=Math.max(0,Math.min(this.pub.readingOrder.items.length-1,t+e));return n===t?!1:(this.currentIndex=n,this.currentLocation=this.createCurrentLocator(),await this.apply(),!0)}updateViewport(e){this.webViewport.readingOrder=[],this.webViewport.progressions.clear(),this.webViewport.positions=null,this.currentLocation&&(this.webViewport.readingOrder.push(this.currentLocation.href),this.webViewport.progressions.set(this.currentLocation.href,e),this.currentLocation.locations?.position!==void 0&&(this.webViewport.positions=[this.currentLocation.locations.position]))}async syncLocation(e){const t=e;this.currentLocation&&(this.currentLocation=this.currentLocation.copyWithLocations({progression:t.start})),this.updateViewport(t),this.listeners.positionChanged(this.currentLocation),await this.framePool.update(this.pub,this.currentLocation,this.determineModules())}goBackward(e,t){if(this._isNavigating){t(!1);return}this._isNavigating=!0,this.changeResource(-1).then(n=>{this._isNavigating=!1,t(n)})}goForward(e,t){if(this._isNavigating){t(!1);return}this._isNavigating=!0,this.changeResource(1).then(n=>{this._isNavigating=!1,t(n)})}get currentLocator(){return this.currentLocation}get viewport(){return this.webViewport}get isScrollStart(){const e=this.viewport.readingOrder[0];return this.viewport.progressions.get(e)?.start===0}get isScrollEnd(){const e=this.viewport.readingOrder[this.viewport.readingOrder.length-1];return this.viewport.progressions.get(e)?.end===1}get canGoBackward(){const e=this.pub.readingOrder.items[0]?.href;return!(this.viewport.progressions.has(e)&&this.viewport.progressions.get(e)?.start===0)}get canGoForward(){const e=this.pub.readingOrder.items[this.pub.readingOrder.items.length-1]?.href;return!(this.viewport.progressions.has(e)&&this.viewport.progressions.get(e)?.end===1)}get readingProgression(){return this.pub.metadata.effectiveReadingProgression}get publication(){return this.pub}async loadLocator(e,t){let n=!1,i=typeof e.locations.getCssSelector=="function"&&e.locations.getCssSelector();if(e.text?.highlight?n=await new Promise((l,d)=>{this.framePool.currentFrames[0].msg.send("go_text",i?[e.text?.serialize(),i]:e.text?.serialize(),c=>l(c))}):i&&(n=await new Promise((l,d)=>{this.framePool.currentFrames[0].msg.send("go_text",["",i],c=>l(c))})),n){t(n);return}const o=typeof e.locations.htmlId=="function"&&e.locations.htmlId();if(o&&(n=await new Promise((l,d)=>{this.framePool.currentFrames[0].msg.send("go_id",o,c=>l(c))})),n){t(n);return}const a=e?.locations?.progression;a&&a>0?n=await new Promise((l,d)=>{this.framePool.currentFrames[0].msg.send("go_progression",a,c=>l(c))}):n=!0,t(n)}go(e,t,n){const i=e.href.split("#")[0];if(!this.pub.readingOrder.findWithHref(i))return n(this.listeners.handleLocator(e));const a=this.pub.readingOrder.findIndexWithHref(i);if(a>=0&&(this.currentIndex=a),this._isNavigating){n(!1);return}this._isNavigating=!0,this.currentLocation=this.createCurrentLocator(),this.apply().then(()=>this.loadLocator(e,s=>{this._isNavigating=!1,n(s)})).then(()=>{this.attachListener()})}goLink(e,t,n){return this.go(e.locator,t,n)}createCurrentLocator(){const t=this.pub.readingOrder.items[this.currentIndex];if(!t)throw new Error("No current resource available");const i=this.currentLocation&&this.currentLocation.href===t.href&&this.currentLocation.locations.progression?this.currentLocation.locations.progression:0;return this.pub.manifest.locatorFromLink(t)||new N({href:t.href,type:t.type||"text/html",locations:new E({fragments:[],progression:i,position:this.currentIndex+1})})}}const Gr=Ii,Vr=r=>{const e=r.join(" ");return["upgrade-insecure-requests",`default-src ${e} blob:`,"connect-src 'none'",`script-src ${e} blob: 'unsafe-inline'`,`style-src ${e} blob: 'unsafe-inline'`,`img-src ${e} blob: data:`,`font-src ${e} blob: data:`,`object-src ${e} blob:`,`child-src ${e}`,"form-action 'none'"].join("; ")};class Hi{constructor(e,t,n,i){this.injector=null,this.pub=e,this.item=n,this.burl=n.toURL(t)||"",this.cssProperties=i.cssProperties,this.injector=i.injector??null}async build(e=!1){if(this.item.mediaType.isHTML)return await this.buildHtmlFrame(e);if(this.item.mediaType.isBitmap||this.item.mediaType.equals(f.SVG))return this.buildImageFrame();throw Error("Unsupported frame mediatype "+this.item.mediaType.string)}async buildHtmlFrame(e=!1){const t=await this.pub.get(this.item).readAsString();if(!t)throw new Error(`Failed reading item ${this.item.href}`);const n=new DOMParser().parseFromString(t,this.item.mediaType.string),i=n.querySelector("parsererror");if(i){const o=i.querySelector("div");throw new Error(`Failed parsing item ${this.item.href}: ${o?.textContent||i.textContent}`)}return this.injector&&await this.injector.injectForDocument(n,this.item),this.finalizeDOM(n,this.pub.baseURL,this.burl,this.item.mediaType,e,this.cssProperties)}buildImageFrame(){const e=document.implementation.createHTMLDocument(this.item.title||this.item.href),t=document.createElement("img");return t.src=this.burl||"",t.alt=this.item.title||"",t.decoding="async",e.body.appendChild(t),this.finalizeDOM(e,this.pub.baseURL,this.burl,this.item.mediaType,!0)}setProperties(e,t){for(const n in e){const i=e[n];i&&t.documentElement.style.setProperty(n,i)}}finalizeDOM(e,t,n,i,o=!1,a){if(!e)return"";const s=this.injector?.getAllowedDomains?.()||[],l=[...new Set([...t?[t]:[],...s])].filter(Boolean);if(a&&!o&&this.setProperties(a,e),e.body.querySelectorAll("img").forEach(h=>{h.setAttribute("fetchpriority","high")}),i.isHTML&&this.pub.metadata.languages?.[0]){const h=this.pub.metadata.languages[0];if(i===f.XHTML){const u=e.documentElement.lang||e.documentElement.getAttribute("xml:lang"),g=e.body.lang||e.body.getAttribute("xml:lang");g&&!u?(e.documentElement.lang=g,e.documentElement.setAttribute("xml:lang",g),e.body.removeAttribute("xml:lang"),e.body.removeAttribute("lang")):u||(e.documentElement.lang=h,e.documentElement.setAttribute("xml:lang",h))}else i===f.HTML&&!e.documentElement.lang&&(e.documentElement.lang=h)}if(de(this.pub.metadata)==="rtl"&&!e.documentElement.dir&&!e.body.dir&&(e.documentElement.dir=H.rtl),n!==void 0){const h=e.createElement("base");h.href=n,h.dataset.readium="true",e.head.firstChild.before(h)}const c=e.createElement("meta");return c.httpEquiv="Content-Security-Policy",c.content=Vr(l),c.dataset.readium="true",e.head.firstChild.before(c),URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(e)],{type:i.isHTML?i.string:"application/xhtml+xml"}))}}class un{constructor(e,t={},n=[]){this.hidden=!0,this.destroyed=!1,this.currModules=[],this.frame=document.createElement("iframe"),this.frame.sandbox.value="allow-same-origin allow-scripts",this.frame.classList.add("readium-navigator-iframe"),this.frame.style.visibility="hidden",this.frame.style.setProperty("aria-hidden","true"),this.frame.style.opacity="0",this.frame.style.position="absolute",this.frame.style.pointerEvents="none",this.frame.style.transition="visibility 0s, opacity 0.1s linear",this.source=e,this.contentProtectionConfig={...t},this.keyboardPeripheralsConfig=[...n]}async load(e){return new Promise((t,n)=>{if(this.loader){const i=this.frame.contentWindow;if([...this.currModules].sort().join("|")===[...e].sort().join("|")){try{t(i)}catch{}return}this.comms?.halt(),this.loader.destroy(),this.loader=new ke(i,e),this.currModules=e,this.comms=void 0;try{t(i)}catch{}return}this.frame.onload=()=>{const i=this.frame.contentWindow;this.loader=new ke(i,e),this.currModules=e;try{t(i)}catch{}},this.frame.onerror=i=>{try{n(i)}catch{}},this.frame.contentWindow.location.replace(this.source)})}applyContentProtection(){this.comms||this.comms.resume(),this.comms.send("peripherals_protection",this.contentProtectionConfig),this.keyboardPeripheralsConfig&&this.keyboardPeripheralsConfig.length>0&&(this.conditionBridge?.destroy(),this.conditionBridge=new en(this.keyboardPeripheralsConfig,e=>{e.length>0&&this.comms.send("keyboard_peripherals",e)}),this.conditionBridge.setup()),this.contentProtectionConfig.monitorScrollingExperimental&&this.comms.send("scroll_protection",{}),this.contentProtectionConfig.protectPrinting?.disable&&this.comms.send("print_protection",this.contentProtectionConfig.protectPrinting)}async destroy(){this.conditionBridge?.destroy(),await this.hide(),this.loader?.destroy(),this.frame.remove(),this.destroyed=!0}async hide(){if(!this.destroyed){if(this.frame.style.visibility="hidden",this.frame.style.setProperty("aria-hidden","true"),this.frame.style.opacity="0",this.frame.style.pointerEvents="none",this.hidden=!0,this.frame.blur(),this.frame.parentElement)return this.comms===void 0||!this.comms.ready?void 0:new Promise((e,t)=>{this.comms?.send("unfocus",void 0,n=>{this.comms?.halt(),e()})});this.comms?.halt()}}async show(e){if(this.destroyed)throw Error("Trying to show frame when it doesn't exist");if(!this.frame.parentElement)throw Error("Trying to show frame that is not attached to the DOM");return this.comms?this.comms.resume():this.comms=new Ee(this.frame.contentWindow,this.source),new Promise((t,n)=>{this.comms?.send("activate",void 0,()=>{this.comms?.send("focus",void 0,()=>{this.applyContentProtection();const i=()=>{this.frame.style.removeProperty("visibility"),this.frame.style.removeProperty("aria-hidden"),this.frame.style.removeProperty("opacity"),this.frame.style.removeProperty("pointer-events"),this.hidden=!1,Y.UA.WebKit&&this.comms?.send("force_webkit_recalc",void 0),t()};e!==void 0?this.comms?.send("go_progression",e,i):i()})})})}setCSSProperties(e){this.destroyed||!this.frame.contentWindow||(this.hidden&&(this.comms?this.comms?.resume():this.comms=new Ee(this.frame.contentWindow,this.source)),this.comms?.send("update_properties",e),this.hidden&&this.comms?.halt())}get iframe(){if(this.destroyed)throw Error("Trying to use frame when it doesn't exist");return this.frame}get realSize(){if(this.destroyed)throw Error("Trying to use frame client rect when it doesn't exist");return this.frame.getBoundingClientRect()}get isDestroyed(){return this.destroyed}get window(){if(this.destroyed||!this.frame.contentWindow)throw Error("Trying to use frame window when it doesn't exist");return this.frame.contentWindow}get atLeft(){return this.window.scrollX<5}get atRight(){return this.window.scrollX>this.window.document.scrollingElement.scrollWidth-this.window.innerWidth-5}get msg(){return this.comms}get ldr(){return this.loader}}const Di=5,Wi=3;class Bi{constructor(e,t,n,i,o,a){this.pool=new Map,this.blobs=new Map,this.inprogress=new Map,this.pendingUpdates=new Map,this.injector=null,this.container=e,this.positions=t,this.currentCssProperties=n,this.injector=i??null,this.contentProtectionConfig=o||{},this.keyboardPeripheralsConfig=a||[]}async destroy(){let e=this.inprogress.values(),t=e.next();const n=[];for(;t.value;)n.push(t.value),t=e.next();n.length>0&&await Promise.allSettled(n),this.inprogress.clear();let i=this.pool.values(),o=i.next();for(;o.value;)await o.value.destroy(),o=i.next();this.pool.clear(),this.blobs.forEach(a=>{this.injector?.releaseBlobUrl?.(a),URL.revokeObjectURL(a)}),this.injector?.dispose(),this.container.childNodes.forEach(a=>{(a.nodeType===Node.ELEMENT_NODE||a.nodeType===Node.TEXT_NODE)&&a.remove()})}async update(e,t,n,i=!1){let o=this.positions.findIndex(l=>l.locations.position===t.locations.position);if(o<0)throw Error(`Locator not found in position list: ${t.locations.position} > ${this.positions.reduce((l,d)=>d.locations.position||0>l?d.locations.position||0:l,0)}`);const a=this.positions[o].href;this.inprogress.has(a)&&await this.inprogress.get(a);const s=new Promise(async(l,d)=>{const c=[],h=[];this.positions.forEach((m,p)=>{(p>o+Di||p<o-Di)&&(c.includes(m.href)||c.push(m.href)),p<o+Wi&&p>o-Wi&&(h.includes(m.href)||h.push(m.href))}),c.forEach(async m=>{h.includes(m)||this.pool.has(m)&&(await this.pool.get(m)?.destroy(),this.pool.delete(m),this.pendingUpdates.has(m)&&this.pendingUpdates.set(m,{inPool:!1}))}),this.currentBaseURL!==void 0&&e.baseURL!==this.currentBaseURL&&(this.blobs.forEach(m=>{this.injector?.releaseBlobUrl?.(m),URL.revokeObjectURL(m)}),this.blobs.clear()),this.currentBaseURL=e.baseURL;const u=async m=>{if(i&&(this.blobs.forEach(v=>{this.injector?.releaseBlobUrl?.(v),URL.revokeObjectURL(v)}),this.blobs.clear(),this.pendingUpdates.clear()),this.pendingUpdates.has(m)&&this.pendingUpdates.get(m)?.inPool===!1){const v=this.blobs.get(m);v&&(this.injector?.releaseBlobUrl?.(v),URL.revokeObjectURL(v),this.blobs.delete(m),this.pendingUpdates.delete(m))}if(this.pool.has(m)){const v=this.pool.get(m);if(!this.blobs.has(m))await v.destroy(),this.pool.delete(m),this.pendingUpdates.delete(m);else{await v.load(n);return}}const p=e.readingOrder.findWithHref(m);if(!p)return;if(!this.blobs.has(m)){const C=await new Hi(e,this.currentBaseURL||"",p,{cssProperties:this.currentCssProperties,injector:this.injector}).build();this.blobs.set(m,C)}const _=new un(this.blobs.get(m),this.contentProtectionConfig,this.keyboardPeripheralsConfig);m!==a&&await _.hide(),this.container.appendChild(_.iframe),await _.load(n),this.pool.set(m,_)};try{await Promise.all(h.map(m=>u(m)))}catch(m){d(m)}const g=this.pool.get(a);if((g?.source!==this._currentFrame?.source||i)&&(await this._currentFrame?.hide(),g&&await g.load(n),g&&await g.show(t.locations.progression),this._currentFrame=g,g)){const m=this.container.ownerDocument.activeElement;m&&m.tagName==="IFRAME"&&m!==g.iframe&&g.iframe.focus({preventScroll:!0})}l()});this.inprogress.set(a,s),await s,this.inprogress.delete(a)}setCSSProperties(e){if(!((n,i)=>{const o=Object.keys(n),a=Object.keys(i);if(o.length!==a.length)return!1;for(const s of o)if(n[s]!==i[s])return!1;return!0})(this.currentCssProperties||{},e)){this.currentCssProperties=e,this.pool.forEach(n=>{n.setCSSProperties(e)});for(const n of this.blobs.keys())this.pendingUpdates.set(n,{inPool:this.pool.has(n)})}}get currentFrames(){return[this._currentFrame]}get currentBounds(){const e={x:0,y:0,width:0,height:0,top:0,right:0,bottom:0,left:0,toJSON(){return this}};return this.currentFrames.forEach(t=>{if(!t)return;const n=t.realSize;e.x=Math.min(e.x,n.x),e.y=Math.min(e.y,n.y),e.width+=n.width,e.height=Math.max(e.height,n.height),e.top=Math.min(e.top,n.top),e.right=Math.min(e.right,n.right),e.bottom=Math.min(e.bottom,n.bottom),e.left=Math.min(e.left,n.left)}),e}}class ji{constructor(e,t,n,i={},o=[]){this.currModules=[],this.cachedPage=void 0,this.peripherals=e,this.debugHref=n,this.contentProtectionConfig={...i},this.keyboardPeripheralsConfig=[...o],this.frame=document.createElement("iframe"),this.frame.sandbox.value="allow-same-origin allow-scripts",this.frame.classList.add("readium-navigator-iframe"),this.frame.classList.add("blank"),this.frame.scrolling="no",this.frame.style.visibility="hidden",this.frame.style.setProperty("aria-hidden","true"),this.frame.style.display="none",this.frame.style.position="absolute",this.frame.style.pointerEvents="none",this.frame.style.transformOrigin="0 0",this.frame.style.transform="scale(1)",this.frame.style.background="#fff",this.frame.style.touchAction="none",this.frame.dataset.originalHref=n,this.source="about:blank",this.wrapper=document.createElement("div"),this.wrapper.style.position="relative",this.wrapper.style.float=this.wrapper.style.cssFloat=t===H.rtl?"right":"left",this.wrapper.appendChild(this.frame)}async load(e,t){return this.source===t&&this.loadPromise&&[...this.currModules].sort().join("|")===[...e].sort().join("|")?this.loadPromise:(this.loaded&&this.source!==t&&this.window.stop(),this.source=t,this.loadPromise=new Promise((n,i)=>{if(this.loader&&this.loaded){const o=this.frame.contentWindow;if([...this.currModules].sort().join("|")===[...e].sort().join("|")){try{n(o),this.loadPromise=void 0}catch{}return}this.comms?.halt(),this.loader.destroy(),this.loader=new ke(o,e),this.currModules=e,this.comms=void 0;try{n(o),this.loadPromise=void 0}catch{}return}this.frame.addEventListener("load",()=>{const o=this.frame.contentWindow;this.loader=new ke(o,e),this.currModules=e,this.peripherals.observe(this.wrapper),this.peripherals.observe(o);try{n(o)}catch{}},{once:!0}),this.frame.addEventListener("error",o=>{try{i(o.error),this.loadPromise=void 0}catch{}},{once:!0}),this.frame.style.removeProperty("display"),this.frame.contentWindow.location.replace(this.source)}),this.loadPromise)}loadPageSize(){const e=this.frame.contentWindow,t=e.document.head.querySelector("meta[name=viewport]");if(t){const n=/(\w+) *= *([^\s,]+)/g;let i,o=0,a=0;for(;i=n.exec(t.content);)i[1]==="width"?o=Number.parseFloat(i[2]):i[1]==="height"&&(a=Number.parseFloat(i[2]));if(o>0&&a>0)return{width:o,height:a}}return{width:e.document.body.scrollWidth,height:e.document.body.scrollHeight}}update(e){if(!this.loaded)return;const t=this.loadPageSize();this.frame.style.height=`${t.height}px`,this.frame.style.width=`${t.width}px`;const n=Math.min(this.wrapper.clientWidth/t.width,this.wrapper.clientHeight/t.height);this.frame.style.transform=`scale(${n})`;const i=this.frame.getBoundingClientRect(),o=this.wrapper.clientHeight-i.height;if(this.frame.style.top=`${o/2}px`,e===J.left){const a=this.wrapper.clientWidth-i.width;this.frame.style.left=`${a}px`}else if(e===J.center){const a=this.wrapper.clientWidth-i.width;this.frame.style.left=`${a/2}px`}else this.frame.style.left="0px";this.frame.style.removeProperty("visibility"),this.frame.style.removeProperty("aria-hidden"),this.frame.style.removeProperty("pointer-events"),this.frame.classList.remove("blank"),this.frame.classList.add("loaded")}async destroy(){this.conditionBridge?.destroy(),await this.unfocus(),this.loader?.destroy(),this.wrapper.remove()}async unload(){if(this.loaded)return this.deselect(),this.frame.style.visibility="hidden",this.frame.style.setProperty("aria-hidden","true"),this.frame.style.pointerEvents="none",this.frame.classList.add("blank"),this.frame.classList.remove("loaded"),this.comms?.halt(),this.loader?.destroy(),this.comms=void 0,this.frame.blur(),new Promise((e,t)=>{this.frame.addEventListener("load",()=>{try{this.showPromise=void 0,e()}catch{}},{once:!0}),this.frame.addEventListener("error",n=>{try{this.showPromise=void 0,t(n.error)}catch{}},{once:!0}),this.source="about:blank",this.frame.contentWindow.location.replace("about:blank"),this.frame.style.display="none"})}deselect(){this.frame.contentWindow?.getSelection()?.removeAllRanges()}async unfocus(){if(this.frame.parentElement)return this.comms===void 0?void 0:(this.frame.blur(),new Promise((e,t)=>{this.comms?.send("unfocus",void 0,n=>{this.comms?.halt(),this.showPromise=void 0,e()})}));this.comms?.halt()}applyContentProtection(){this.comms||this.comms.resume(),this.comms.send("peripherals_protection",this.contentProtectionConfig),this.keyboardPeripheralsConfig&&this.keyboardPeripheralsConfig.length>0&&(this.conditionBridge?.destroy(),this.conditionBridge=new en(this.keyboardPeripheralsConfig,e=>{e.length>0&&this.comms.send("keyboard_peripherals",e)}),this.conditionBridge.setup()),this.contentProtectionConfig.protectPrinting?.disable&&this.comms.send("print_protection",this.contentProtectionConfig.protectPrinting)}async show(e){if(!this.frame.parentElement){console.warn("Trying to show frame that is not attached to the DOM");return}if(!this.loaded){this.showPromise=void 0;return}return this.showPromise?(this.cachedPage!==e&&(this.update(e),this.cachedPage=e),this.showPromise):(this.cachedPage=e,this.comms?this.comms.resume():this.comms=new Ee(this.frame.contentWindow,this.source),this.showPromise=new Promise((t,n)=>{this.comms.send("focus",void 0,i=>{this.update(this.cachedPage),this.applyContentProtection(),t()})}),this.showPromise)}async activate(){return new Promise((e,t)=>{if(!this.comms)return e();this.comms?.send("activate",void 0,()=>{e()})})}get element(){return this.wrapper}get iframe(){return this.frame}get realSize(){return this.frame.getBoundingClientRect()}get loaded(){return this.frame.contentWindow&&this.frame.contentWindow.location.href!=="about:blank"}set width(e){const t=`${e}%`;this.wrapper.style.width!==t&&(this.wrapper.style.width=t)}set height(e){const t=`${e}px`;this.wrapper.style.height!==t&&(this.wrapper.style.height=t)}get window(){if(!this.frame.contentWindow)throw Error("Trying to use frame window when it doesn't exist");return this.frame.contentWindow}get atLeft(){return this.window.scrollX<5}get atRight(){return this.window.scrollX>this.window.document.scrollingElement.scrollWidth-this.window.innerWidth-5}get msg(){return this.comms}get ldr(){return this.loader}}var Gi=(r=>(r[r.Left=0]="Left",r[r.Center=1]="Center",r[r.Right=2]="Right",r))(Gi||{}),Vi=(r=>(r[r.Top=0]="Top",r[r.Middle=1]="Middle",r[r.Bottom=2]="Bottom",r))(Vi||{});class $i{constructor(){this.outerWidth=0,this.outerHeight=0,this.HTML=document.documentElement,this.Head=document.head,this.Body=document.body}refreshOuterPixels(e){Y.OS.iOS||(this.outerHeight=window.outerHeight-window.innerHeight,Y.OS.Android&&Y.UA.Chrome&&window.screen.height>window.innerHeight&&(this.outerHeight=(window.screen.height-window.innerHeight)/1.5),this.outerWidth=window.outerWidth-window.innerWidth)}getBibiEventCoord(e,t=0){const n={X:0,Y:0};return/^touch/.test(e.type)?(n.X=e.touches[t].screenX,n.Y=e.touches[t].screenY):(n.X=e.screenX,n.Y=e.screenY),(e.target.ownerDocument?.documentElement||e.target.documentElement)===this.HTML&&(n.X-=this.HTML.scrollLeft+this.Body.scrollLeft,n.Y-=this.HTML.scrollTop+this.Body.scrollTop),n.X-=this.outerWidth,n.Y-=this.outerHeight,n}getTouchDistance(e){if(e.touches.length!==2)return 0;const t=e.touches[0].screenX-this.outerWidth,n=e.touches[0].screenY-this.outerHeight,i=e.touches[1].screenX-this.outerWidth,o=e.touches[1].screenY-this.outerHeight;return Math.sqrt(Math.pow(i-t,2)+Math.pow(o-n,2))}getTouchCenter(e){if(e.touches.length!==2)return null;const t=this.HTML.scrollLeft+this.Body.scrollLeft,n=this.HTML.scrollTop+this.Body.scrollTop,i=e.touches[0].screenX-this.outerWidth-t,o=e.touches[0].screenY-this.outerHeight-n,a=e.touches[1].screenX-this.outerWidth-t,s=e.touches[1].screenY-this.outerHeight-n;return{X:(i+a)/2,Y:(o+s)/2}}getBibiEvent(e){if(!e)return{Coord:null,Division:null,Ratio:null,Target:null};const t=this.getBibiEventCoord(e);let n=.3;const i={X:t.X/window.innerWidth,Y:t.Y/window.innerHeight};let o,a,s,l;s=o=n,l=a=1-n;const d={X:null,Y:null};return i.X<s?d.X=0:l<i.X?d.X=2:d.X=1,i.Y<o?d.Y=0:a<i.Y?d.Y=2:d.Y=1,{Target:e.target,Coord:t,Ratio:i,Division:d}}}class $r{constructor(){this._DOM={show:!1,pinchTarget:document.createElement("div"),touch1:document.createElement("div"),touch2:document.createElement("div"),center:document.createElement("div"),stats:document.createElement("div")},this._DOM.show=!0,this._DOM.pinchTarget.style.zIndex=this._DOM.stats.style.zIndex=this._DOM.center.style.zIndex=this._DOM.touch1.style.zIndex=this._DOM.touch2.style.zIndex="100000",this._DOM.pinchTarget.style.position=this._DOM.stats.style.position=this._DOM.center.style.position=this._DOM.touch1.style.position=this._DOM.touch2.style.position="absolute",this._DOM.pinchTarget.style.borderRadius=this._DOM.center.style.borderRadius=this._DOM.touch1.style.borderRadius=this._DOM.touch2.style.borderRadius="50%",this._DOM.pinchTarget.style.pointerEvents=this._DOM.stats.style.pointerEvents=this._DOM.center.style.pointerEvents=this._DOM.touch1.style.pointerEvents=this._DOM.touch2.style.pointerEvents="none",this._DOM.pinchTarget.style.display=this._DOM.center.style.display=this._DOM.touch1.style.display=this._DOM.touch2.style.display="none",this._DOM.pinchTarget.style.paddingTop=this._DOM.center.style.paddingTop="10px",this._DOM.pinchTarget.style.width=this._DOM.pinchTarget.style.height=this._DOM.center.style.width=this._DOM.center.style.height="10px",this._DOM.pinchTarget.style.backgroundColor="green",this._DOM.center.style.backgroundColor="red",this._DOM.touch1.style.backgroundColor=this._DOM.touch2.style.backgroundColor="blue",this._DOM.touch1.style.height=this._DOM.touch2.style.height="20px",this._DOM.touch1.style.width=this._DOM.touch2.style.width="20px",this._DOM.touch1.style.paddingTop=this._DOM.touch2.style.paddingTop="20px",this._DOM.touch1.textContent="1",this._DOM.touch2.textContent="2",this._DOM.stats.style.padding="20px",this._DOM.stats.style.backgroundColor="rgba(0,0,0,0.5)",this._DOM.stats.style.color="white",this._DOM.stats.textContent="[stats]",document.body.appendChild(this._DOM.stats),document.body.appendChild(this._DOM.center),document.body.appendChild(this._DOM.touch1),document.body.appendChild(this._DOM.touch2),document.body.appendChild(this._DOM.pinchTarget)}get show(){return this.DOM.show}get DOM(){return this._DOM}}const Ki=6,mn=1.02,Xi=50;class Yi{constructor(e,t=!1){this.dragState=0,this.minimumMoved=!1,this.pan={startX:0,endX:0,startY:0,overscrollX:0,overscrollY:0,letItGo:!1,preventClick:!1,translateX:0,translateY:0,touchID:0},this.pinch={startDistance:0,startScale:0,target:{X:0,Y:0},touchN:0,startTranslate:{X:0,Y:0}},this._scale=1,this.scaleDebouncer=0,this.frameBounds=null,this.debugger=null,this.btouchstartHandler=this.touchstartHandler.bind(this),this.btouchendHandler=this.touchendHandler.bind(this),this.btouchmoveHandler=this.touchmoveHandler.bind(this),this.bdblclickHandler=this.dblclickHandler.bind(this),this.bmousedownHandler=this.mousedownHandler.bind(this),this.bmouseupHandler=this.mouseupHandler.bind(this),this.bmousemoveHandler=this.mousemoveHandler.bind(this),this.moveFrame=0,this.manager=e,this.coordinator=new $i,this.attachEvents(),t&&(this.debugger=new $r)}get scale(){return this._scale}set scale(e){isNaN(e)&&(e=1),window.clearTimeout(this.scaleDebouncer),this.scaleDebouncer=window.setTimeout(()=>{this.dragState===0&&this.scale<mn&&(this.pan.translateX=0,this.pan.translateY=0,this.clearPan(),this.manager.updateBookStyle()),this.manager.listener("zoom",e)},100),this._scale=e}attachEvents(){this.observe(this.manager.spineElement),this.pan={startX:0,startY:0,endX:0,overscrollX:0,overscrollY:0,letItGo:!1,preventClick:!1,translateX:0,translateY:0,touchID:0},this.pinch={startDistance:0,startScale:0,target:{X:0,Y:0},startTranslate:{X:0,Y:0},touchN:0}}clearPan(){this.pan.letItGo=!1,this.pan.touchID=0,this.pan.endX=0,this.pan.overscrollX=0,this.pan.overscrollY=0}clearPinch(){this.pinch={startDistance:0,startScale:this.pinch.startScale,target:{X:0,Y:0},touchN:0,startTranslate:{X:0,Y:0}}}observe(e){e.addEventListener("touchstart",this.btouchstartHandler),e.addEventListener("touchend",this.btouchendHandler),e.addEventListener("touchmove",this.btouchmoveHandler,{passive:!0}),e.addEventListener("dblclick",this.bdblclickHandler,{passive:!0}),e.addEventListener("mousedown",this.bmousedownHandler),e.addEventListener("mouseup",this.bmouseupHandler),e.addEventListener("mousemove",this.bmousemoveHandler)}clickHandler(e){}touchstartHandler(e){if(["TEXTAREA","OPTION","INPUT","SELECT"].indexOf(e.target.nodeName)!==-1)return;switch(e.stopPropagation(),this.frameBounds=this.manager.currentBounds,this.coordinator.refreshOuterPixels(this.frameBounds),e.touches.length){case 3:return;case 2:{e.preventDefault(),this.pinch.startDistance=this.coordinator.getTouchDistance(e);const i=this.startTouch(e);this.pan.startX=i.X,this.pan.startY=i.Y,this.dragState=2,this.manager.updateBookStyle(!0),this.isScaled?(this.pinch.target.X-=this.pan.translateX*(this.pinch.startScale/this.scale),this.pinch.target.Y-=this.pan.translateY*(this.pinch.startScale/this.scale),this.pinch.target={X:0,Y:0},this.pinch.startScale=1/this.scale):(this.pinch.target={X:0,Y:0},this.pinch.startScale=this.scale),this.pinch.startTranslate={X:this.pan.translateX,Y:this.pan.translateY},this.debugger?.show&&(this.debugger.DOM.touch2.style.display="",this.debugger.DOM.center.style.display="",this.debugger.DOM.pinchTarget.style.display="");return}case 1:this.pan.touchID=e.touches[0].identifier,this.debugger?.show&&(this.debugger.DOM.touch1.style.display="");default:this.dragState<1&&(this.dragState=1),this.manager.updateBookStyle(!0)}this.manager.updateSpineStyle(!1);const n=this.startTouch(e);this.pan.startX=n.X,this.pan.startY=n.Y}startTouch(e){const t=this.coordinator.getTouchCenter(e)||this.coordinator.getBibiEventCoord(e);return{X:t.X-this.manager.width/2-this.pan.translateX*this.scale+this.manager.width/2,Y:t.Y-this.manager.height/2-this.pan.translateY*this.scale+this.manager.height/2}}touchendHandler(e){if(e.stopPropagation(),!e.touches||e.touches.length===0)this.pan.endX&&!this.isScaled?(this.pinch.touchN&&(this.pan.endX=this.pan.startX),this.updateAfterDrag()):!this.pinch.touchN&&Math.abs(this.pan.overscrollX)>Xi&&Math.abs(this.pan.overscrollY)<Xi/2&&(this.pan.startX=0,this.pan.endX=-this.pan.overscrollX,this.updateAfterDrag()),this.dragState=0,this.minimumMoved=!1,this.clearPinch(),this.debugger?.show&&(this.debugger.DOM.center.style.display="none",this.debugger.DOM.touch1.style.display="none",this.debugger.DOM.touch2.style.display="none");else if(e.touches.length===1){this.dragState=1,e.touches[0].identifier!==this.pan.touchID&&(this.pan.touchID=e.touches[0].identifier),this.debugger?.show&&(this.debugger.DOM.center.style.display="none",this.debugger.DOM.touch2.style.display="none",this.debugger.DOM.pinchTarget.style.display="none");const t=this.startTouch(e);this.pan.startX=t.X,this.pan.startY=t.Y}window.setTimeout(()=>{this.manager.updateBookStyle(!0),this.dragState===0&&(this.scale<mn&&(this.pan.translateX=0,this.pan.translateY=0),this.clearPan()),this.manager.updateBookStyle(!0)},50)}touchmoveHandler(e){e.stopPropagation();const t=this.coordinator.getBibiEventCoord(e);Math.abs(this.pan.startY-t.Y)+Math.abs(this.pan.startX-t.X)>5&&(this.minimumMoved||(this.manager.deselect(),this.minimumMoved=!0),this.dragState<1&&(this.dragState=1));const n=this.coordinator?.getTouchDistance(e);let i=!1;const o=this.scale;if(this.dragState===2&&n){if(this.pinch.touchN++,this.pinch.touchN<4)return;let a=n/this.pinch.startDistance*this.scale;a>=Ki&&(a=Ki),a<=mn&&(a=1),this.scale=a,this.pinch.startDistance=n,i=!0}if(this.pan.letItGo===!1&&(this.pan.letItGo=Math.abs(this.pan.startY-t.Y)<Math.abs(this.pan.startX-t.X)),this.debugger?.show&&(this.debugger.DOM.touch1.style.top=`${t.Y-10}px`,this.debugger.DOM.touch1.style.left=`${t.X-10}px`,this.debugger.DOM.touch1.innerText=`${t.X.toFixed(2)},${t.Y.toFixed(2)}`),this.dragState>0&&this.isScaled||this.dragState>1){if(this.dragState===1){const l={X:t.X-this.manager.width/2,Y:t.Y-this.manager.height/2};this.pan.translateX=(l.X-(this.pan.startX-this.manager.width/2))*1/this.scale,this.pan.translateY=(l.Y-(this.pan.startY-this.manager.height/2))*1/this.scale}else if(this.dragState===2){const l=this.coordinator.getTouchCenter(e);if(this.debugger?.show){this.debugger.DOM.center.style.top=`${l.Y-5}px`,this.debugger.DOM.center.style.left=`${l.X-5}px`,this.debugger.DOM.center.innerText=`${l.X.toFixed(2)},${l.Y.toFixed(2)}`;const g=this.coordinator.getBibiEventCoord(e,1);this.debugger.DOM.touch2.style.top=`${g.Y-10}px`,this.debugger.DOM.touch2.style.left=`${g.X-10}px`,this.debugger.DOM.touch2.innerText=`${g.X.toFixed(2)},${g.Y.toFixed(2)}`}l.X-=this.manager.width/2,l.Y-=this.manager.height/2;let d=-l.X/o;d+=l.X/this.scale,this.pinch.target.X+=d,l.X+=this.pinch.target.X*this.scale/this.pinch.startScale;let c=-l.Y/o;c+=l.Y/this.scale,this.pinch.target.Y+=c,l.Y+=this.pinch.target.Y*this.scale/this.pinch.startScale;let h=(l.X-(this.pan.startX-this.manager.width/2))*1/this.scale,u=(l.Y-(this.pan.startY-this.manager.height/2))*1/this.scale;this.pan.translateX=h,this.pan.translateY=u,this.debugger?.show&&(this.debugger.DOM.pinchTarget.style.left=`${this.pinch.target.X*this.scale/this.pinch.startScale-5+this.manager.width/2}px`,this.debugger.DOM.pinchTarget.style.top=`${this.pinch.target.Y*this.scale/this.pinch.startScale-5+this.manager.height/2}px`,this.debugger.DOM.pinchTarget.innerText=`${(this.pinch.target.X*this.scale/this.pinch.startScale).toFixed(2)},${(this.pinch.target.Y*this.scale/this.pinch.startScale).toFixed(2)}`)}const a=this.frameBounds.width/6,s=this.frameBounds.height/6;this.pan.translateX<-a&&(this.pan.overscrollX=-(a+this.pan.translateX),this.pan.translateX=-a),this.pan.translateY<-s&&(this.pan.overscrollY=-(s+this.pan.translateY),this.pan.translateY=-s),this.pan.translateX>a&&(this.pan.overscrollX=a-this.pan.translateX,this.pan.translateX=a),this.pan.translateY>s&&(this.pan.overscrollY=s-this.pan.translateY,this.pan.translateY=s),i=!0,this.debugger?.show&&(this.debugger.DOM.stats.innerText=`TX: ${this.pan.translateX.toFixed(2)}
TY: ${this.pan.translateY.toFixed(2)}
Zoom: ${this.scale.toFixed(2)}
Overscroll: ${this.pan.overscrollX.toFixed(2)},${this.pan.overscrollY.toFixed(2)}`)}if(i){this.manager.updateBookStyle();return}if(this.dragState>0&&this.pan.letItGo){this.pan.endX=t.X;const s=this.manager.currentSlide*(this.manager.width/this.manager.perPage),l=this.pan.endX-this.pan.startX,d=this.manager.rtl?s+l:s-l;cancelAnimationFrame(this.moveFrame),this.moveFrame=requestAnimationFrame(()=>{requestAnimationFrame(()=>{this.manager.spineElement.style.transform=`translate3d(${(this.manager.rtl?1:-1)*d}px, 0, 0)`})})}}dblclickHandler(e){clearTimeout(this.dtimer),this.pdblclick=!0,this.dtimer=window.setTimeout(()=>this.pdblclick=!1,200),!this.disableDblClick&&this.isScaled&&(this.scale=1)}get isScaled(){return this.scale>1}addTouch(e){e.touches=[{pageX:e.pageX,pageY:e.pageY}]}mousedownHandler(e){this.isScaled&&(this.addTouch(e),this.touchstartHandler(e))}mouseupHandler(e){this.isScaled&&this.touchendHandler(e)}mousemoveHandler(e){this.isScaled&&e.buttons>0&&(e.preventDefault(),this.addTouch(e),this.touchmoveHandler(e))}updateAfterDrag(){const e=(this.manager.rtl?-1:1)*(this.pan.endX-this.pan.startX),t=Math.abs(e);e>0&&t>this.manager.threshold&&this.manager.slength>this.manager.perPage?this.manager.listener("no_less",void 0):e<0&&t>this.manager.threshold&&this.manager.slength>this.manager.perPage&&this.manager.listener("no_more",void 0),this.manager.slideToCurrent(!0,!0)}}var bt=(r=>(r.auto="auto",r.landscape="landscape",r.portrait="portrait",r))(bt||{}),vt=(r=>(r.auto="auto",r.both="both",r.none="none",r.landscape="landscape",r))(vt||{});class qi{constructor(e){this.shift=!0,this.spreads=[],this.nLandscape=0,this.index(e),this.testShift(e),console.log(`Indexed ${this.spreads.length} spreads for ${e.readingOrder.items.length} items`)}index(e,t=!1){this.nLandscape=0,e.readingOrder.items.forEach((n,i)=>{t||(e.readingOrder.items[i]=n.addProperties({number:i+1,isImage:n.type?.indexOf("image/")===0}));const o=n.properties?.otherProperties.orientation==="landscape";(!n.properties?.page||t)&&(n.properties=n.properties?.add({page:o?"center":((this.shift?0:1)+i-this.nLandscape)%2?e.metadata.readingProgression===H.rtl?"right":"left":e.metadata.readingProgression===H.rtl?"left":"right"})),(o||n.properties?.otherProperties.addBlank)&&this.nLandscape++}),t&&(this.spreads=[]),this.buildSpreads(e.readingOrder)}testShift(e){let t=!1;this.spreads.forEach((n,i)=>{if(n.length>1)return;const o=n[0],a=o.properties?.otherProperties.orientation;i===0&&(a==="landscape"||a!=="portrait"&&((o.width||0)>(o.height||0)||o.properties?.otherProperties.spread==="both"))&&(this.shift=!1),t&&o.properties?.page===J.center&&this.spreads[i-1][0].addProperties({addBlank:!0}),a==="portrait"&&o.properties?.page!=="center"&&o.properties?.otherProperties.number>1?t=!0:t=!1}),this.shift||this.index(e,!0)}buildSpreads(e){let t=[];e.items.forEach((n,i)=>{!i&&this.shift?this.spreads.push([n]):n.properties?.page===J.center?(t.length>0&&this.spreads.push(t),this.spreads.push([n]),t=[]):t.length>=2?(this.spreads.push(t),t=[n]):t.push(n)}),t.length>0&&this.spreads.push(t)}currentSpread(e,t){return this.spreads[Math.min(Math.floor(e/t),this.spreads.length-1)]}findByLink(e){return this.spreads.find(t=>t.includes(e))||void 0}}const Ji=8,Zi=5,Kr=300,Xr=15e3,Yr=250,qr=150,Jr=500;class Qi{constructor(e,t,n,i,o,a){if(this.pool=new Map,this.blobs=new Map,this.inprogress=new Map,this.delayedShow=new Map,this.delayedTimeout=new Map,this.previousFrames=[],this.injector=null,this.width=0,this.height=0,this.transform="",this.currentSlide=0,this.spread=!0,this.orientationInternal=-1,this.container=e,this.positions=t,this.pub=n,this.injector=i??null,this.contentProtectionConfig=o||{},this.keyboardPeripheralsConfig=a||[],this.spreadPresentation=n.metadata.otherMetadata?.spread||vt.auto,this.pub.metadata.effectiveReadingProgression!==H.rtl&&this.pub.metadata.effectiveReadingProgression!==H.ltr)throw Error("Unsupported reading progression for EPUB");this.spreader=new qi(this.pub),this.containerHeightCached=e.clientHeight,this.bookElement=document.createElement("div"),this.bookElement.ariaLabel="Book",this.bookElement.tabIndex=-1,this.updateBookStyle(!0),this.spineElement=document.createElement("div"),this.spineElement.ariaLabel="Spine",this.bookElement.appendChild(this.spineElement),this.container.appendChild(this.bookElement),this.updateSpineStyle(!0),this.peripherals=new Yi(this),this.pub.readingOrder.items.forEach(s=>{const l=new ji(this.peripherals,this.pub.metadata.effectiveReadingProgression,s.href,this.contentProtectionConfig,this.keyboardPeripheralsConfig);this.spineElement.appendChild(l.element),this.pool.set(s.href,l),l.width=100/this.length*(s.properties?.otherProperties.orientation===bt.landscape||s.properties?.otherProperties.addBlank?this.perPage:1),l.height=this.height})}set listener(e){this._listener=e}get listener(){return this._listener}get doNotDisturb(){return this.peripherals.pan.touchID>0}resizeHandler(e=!0,t=!0){this.currentSlide+this.perPage>this.length&&(this.currentSlide=this.length<=this.perPage?0:this.length-1),this.containerHeightCached=this.container.clientHeight,this.orientationInternal=-1,this.updateSpineStyle(!0),e&&(this.currentSlide=this.reAlign(),this.slideToCurrent(!t,t)),clearTimeout(this.resizeTimeout),this.resizeTimeout=window.setTimeout(()=>{this.pool.forEach((n,i)=>{let o=this.pub.readingOrder.items.findIndex(l=>l.href===i);const a=this.pub.readingOrder.items[o];if(n.width=100/this.length*(a.properties?.otherProperties.orientation===bt.landscape||a.properties?.otherProperties.addBlank?this.perPage:1),n.height=this.height,!n.loaded)return;const s=this.spreader.findByLink(a);n.update(this.spreadPosition(s,a))})},Yr)}updateDimensions(){this.width=this.bookElement.clientWidth,this.height=this.bookElement.clientHeight}get rtl(){return this.pub.metadata.effectiveReadingProgression===H.rtl}get single(){return!this.spread||this.portrait}get perPage(){return this.spread&&!this.portrait?2:1}get threshold(){return 50}get portrait(){return this.spreadPresentation===vt.none?!0:(this.orientationInternal===-1&&(this.orientationInternal=this.containerHeightCached>this.container.clientWidth?1:0),this.orientationInternal===1)}updateSpineStyle(e,t=!0){let n="0";this.updateDimensions(),this.perPage>1&&(n=`${this.width/2}px`);const i={transition:e?`all ${t?qr:Jr}ms ease-out`:"all 0ms ease-out",marginRight:this.rtl?n:"0",marginLeft:this.rtl?"0":n,width:`${this.width/this.perPage*this.length}px`,transform:this.transform,contain:"content"};Object.assign(this.spineElement.style,i)}updateBookStyle(e=!1){if(e){const t={overflow:"hidden",direction:this.pub.metadata.effectiveReadingProgression,cursor:"",height:"100%",width:"100%",position:"relative",outline:"none",transition:this.peripherals?.dragState?"none":"transform .15s ease-in-out",touchAction:"none"};Object.assign(this.bookElement.style,t)}this.bookElement.style.transform=`scale(${this.peripherals?.scale||1})`+(this.peripherals?` translate3d(${this.peripherals.pan.translateX}px, ${this.peripherals.pan.translateY}px, 0px)`:"")}goTo(e){if(this.slength<=this.perPage)return;e=this.reAlign(e);const t=this.currentSlide;this.currentSlide=Math.min(Math.max(e,0),this.length-1),t!==this.currentSlide&&this.slideToCurrent(!1)}onChange(){this.peripherals.scale=1,this.updateBookStyle()}get offset(){return(this.rtl?1:-1)*this.currentSlide*(this.width/this.perPage)}get length(){if(this.single)return this.slength;const e=this.slength+this.nLandscape;return this.shift&&e%2===0?e+1:e}get slength(){return this.pub.readingOrder.items.length||0}get shift(){return this.spreader.shift}get nLandscape(){return this.spreader.nLandscape}setPerPage(e){e===null?this.spread=!0:e===1?this.spread=!1:this.spread=!0,requestAnimationFrame(()=>this.resizeHandler(!0))}slideToCurrent(e,t=!0){if(this.updateDimensions(),e)requestAnimationFrame(()=>{requestAnimationFrame(()=>{const n=`translate3d(${this.offset}px, 0, 0)`;this.spineElement.style.transform!==n&&(this.transform=n,this.updateSpineStyle(!0,t),this.deselect())})});else{const n=`translate3d(${this.offset}px, 0, 0)`;if(this.spineElement.style.transform===n)return;this.transform=n,this.updateSpineStyle(!1),this.deselect()}}bounce(e=!1){requestAnimationFrame(()=>{this.transform=`translate3d(${this.offset+50*(e?1:-1)}px, 0, 0)`,this.updateSpineStyle(!0,!0),setTimeout(()=>{this.transform=`translate3d(${this.offset}px, 0, 0)`,this.updateSpineStyle(!0,!0)},100)})}next(e=1){if(this.slength<=this.perPage)return!1;const t=this.currentSlide;return this.currentSlide=Math.min(this.currentSlide+e,this.length-1),this.perPage>1&&this.currentSlide%2&&this.currentSlide--,this.currentSlide===t&&(this.currentSlide+1,this.length),t!==this.currentSlide?(this.slideToCurrent(!0),this.onChange(),!0):(this.bounce(this.rtl),!1)}prev(e=1){if(this.slength<=this.perPage)return!1;const t=this.currentSlide;return this.currentSlide=Math.max(this.currentSlide-e,0),this.perPage>1&&this.currentSlide%2&&this.currentSlide++,t!==this.currentSlide?(this.slideToCurrent(!0),this.onChange(),!0):(this.bounce(!this.rtl),!1)}get ownerWindow(){return this.container.ownerDocument.defaultView||window}async destroy(){let e=this.inprogress.values(),t=e.next();const n=[];for(;t.value;)n.push(t.value),t=e.next();n.length>0&&await Promise.allSettled(n),this.inprogress.clear();let i=this.pool.values(),o=i.next();for(;o.value;)await o.value.destroy(),o=i.next();this.pool.clear(),this.blobs.forEach(a=>URL.revokeObjectURL(a)),this.injector?.dispose(),this.container.childNodes.forEach(a=>{(a.nodeType===Node.ELEMENT_NODE||a.nodeType===Node.TEXT_NODE)&&a.remove()})}makeSpread(e){return this.perPage<2?[this.pub.readingOrder.items[e]]:this.spreader.currentSpread(e,this.perPage)}reAlign(e=this.currentSlide){return e%2&&!this.single&&e++,e}spreadPosition(e,t){return this.perPage<2||e.length<2?J.center:t.href===e[0].href?this.rtl?J.right:J.left:this.rtl?J.left:J.right}async waitForItem(e){if(this.inprogress.has(e)&&await this.inprogress.get(e),this.delayedShow.has(e)){const t=this.delayedTimeout.get(e);t>0?clearTimeout(t):await this.delayedShow.get(e),this.delayedTimeout.set(e,0),this.delayedShow.delete(e)}}async cancelShowing(e){if(this.delayedShow.has(e)){const t=this.delayedTimeout.get(e);t>0&&clearTimeout(t),this.delayedShow.delete(e)}}async update(e,t,n,i=!1){let o=this.pub.readingOrder.items.findIndex(l=>l.href===t.href);if(o<0)throw Error("Href not found in reading order");this.currentSlide!==o&&(this.currentSlide=this.reAlign(o),this.slideToCurrent(!0));const a=this.makeSpread(this.currentSlide);this.perPage>1&&o++;for(const l of a)await this.waitForItem(l.href);const s=new Promise(async(l,d)=>{const c=[],h=[];this.positions.forEach((p,_)=>{(_>o+Ji||_<o-Ji)&&(c.includes(p.href)||c.push(p.href)),_<o+Zi&&_>o-Zi&&(h.includes(p.href)||h.push(p.href))}),c.forEach(async p=>{h.includes(p)||this.pool.has(p)&&(this.cancelShowing(p),await this.pool.get(p)?.unload())}),this.currentBaseURL!==void 0&&e.baseURL!==this.currentBaseURL&&(this.blobs.forEach(p=>URL.revokeObjectURL(p)),this.blobs.clear()),this.currentBaseURL=e.baseURL;const u=async p=>{const _=e.readingOrder.findIndexWithHref(p),v=e.readingOrder.items[_];if(v){if(!this.blobs.has(p)){const x=await new Hi(e,this.currentBaseURL||"",v,{injector:this.injector}).build(!0);this.blobs.set(p,x)}this.delayedShow.has(p)||this.delayedShow.set(p,new Promise((C,x)=>{let q=!1;const Te=window.setTimeout(async()=>{this.delayedTimeout.set(p,0);const za=this.makeSpread(this.reAlign(_)),La=this.spreadPosition(za,v),go=this.pool.get(p);await go.load(n,this.blobs.get(p)),this.peripherals.isScaled||await go.show(La),this.delayedShow.delete(p),q=!0,C()},Kr);setTimeout(()=>{!q&&this.delayedShow.has(p)&&x(`Offscreen load timeout: ${p}`)},Xr),this.delayedTimeout.set(p,Te)}))}};try{await Promise.all(h.map(p=>u(p)))}catch(p){d(p)}const g=[];for(const p of a){const _=this.pool.get(p.href),v=this.blobs.get(p.href);v&&(this.cancelShowing(p.href),await _.load(n,v),await _.show(this.spreadPosition(a,p)),this.previousFrames.push(_),await _.activate(),g.push(_))}for(;this.previousFrames.length>0;){const p=this.previousFrames.shift();p&&!g.includes(p)&&await p.unfocus()}this.previousFrames=g;const m=this.container.ownerDocument.activeElement;m&&m.tagName==="IFRAME"&&!g.some(p=>p.iframe===m)&&g[0]?.iframe.focus({preventScroll:!0}),l()});for(const l of a)this.inprogress.set(l.href,s);await s;for(const l of a)this.inprogress.delete(l.href)}get currentFrames(){if(this.perPage<2){const t=this.pub.readingOrder.items[this.currentSlide];return[this.pool.get(t.href)]}return this.spreader.currentSpread(this.currentSlide,this.perPage).map(t=>this.pool.get(t.href))}get currentBounds(){const e={x:0,y:0,width:0,height:0,top:0,right:0,bottom:0,left:0,toJSON(){return this}};return this.currentFrames.forEach(t=>{if(!t)return;const n=t.realSize;e.x=Math.min(e.x,n.x),e.y=Math.min(e.y,n.y),e.width+=n.width,e.height=Math.max(e.height,n.height),e.top=Math.min(e.top,n.top),e.right=Math.min(e.right,n.right),e.bottom=Math.min(e.bottom,n.bottom),e.left=Math.min(e.left,n.left)}),e}get viewport(){const e={readingOrder:[],progressions:new Map,positions:null};return(this.perPage<2?[this.pub.readingOrder.items[this.currentSlide]]:this.spreader.currentSpread(this.currentSlide,this.perPage)).forEach(n=>{e.readingOrder.push(n.href),e.progressions.set(n.href,{start:0,end:1})}),e.positions=this.getCurrentNumbers(),e}getCurrentNumbers(){if(this.perPage<2)return[this.pub.readingOrder.items[this.currentSlide].properties?.otherProperties.number];const e=this.spreader.currentSpread(this.currentSlide,this.perPage);return e.length>1?[e[0].properties?.otherProperties.number,e[e.length-1].properties?.otherProperties.number]:[e[0].properties?.otherProperties.number]}deselect(){this.currentFrames?.forEach(e=>e?.deselect())}}class ze{constructor(e={}){this.backgroundColor=D(e.backgroundColor),this.blendFilter=P(e.blendFilter),this.constraint=w(e.constraint),this.columnCount=w(e.columnCount),this.darkenFilter=pe(e.darkenFilter),this.deprecatedFontSize=P(e.deprecatedFontSize),this.fontFamily=D(e.fontFamily),this.fontSize=I(e.fontSize,De.range),this.fontSizeNormalize=P(e.fontSizeNormalize),this.fontOpticalSizing=P(e.fontOpticalSizing),this.fontWeight=I(e.fontWeight,ie.range),this.fontWidth=I(e.fontWidth,We.range),this.hyphens=P(e.hyphens),this.invertFilter=pe(e.invertFilter),this.invertGaijiFilter=pe(e.invertGaijiFilter),this.iOSPatch=P(e.iOSPatch),this.iPadOSPatch=P(e.iPadOSPatch),this.letterSpacing=w(e.letterSpacing),this.ligatures=P(e.ligatures),this.lineHeight=w(e.lineHeight),this.linkColor=D(e.linkColor),this.noRuby=P(e.noRuby),this.pageGutter=w(e.pageGutter),this.paragraphIndent=w(e.paragraphIndent),this.paragraphSpacing=w(e.paragraphSpacing),this.scroll=P(e.scroll),this.scrollPaddingTop=w(e.scrollPaddingTop),this.scrollPaddingBottom=w(e.scrollPaddingBottom),this.scrollPaddingLeft=w(e.scrollPaddingLeft),this.scrollPaddingRight=w(e.scrollPaddingRight),this.selectionBackgroundColor=D(e.selectionBackgroundColor),this.selectionTextColor=D(e.selectionTextColor),this.textAlign=Je(e.textAlign,te),this.textColor=D(e.textColor),this.textNormalization=P(e.textNormalization),this.visitedColor=D(e.visitedColor),this.wordSpacing=w(e.wordSpacing),this.optimalLineLength=w(e.optimalLineLength),this.maximalLineLength=w(e.maximalLineLength),this.minimalLineLength=w(e.minimalLineLength)}static serialize(e){const{...t}=e;return JSON.stringify(t)}static deserialize(e){try{const t=JSON.parse(e);return new ze(t)}catch(t){return console.error("Failed to deserialize preferences:",t),null}}merging(e){const t={...this};for(const n of Object.keys(e))e[n]!==void 0&&(n!=="maximalLineLength"||e[n]===null||e[n]>=(e.optimalLineLength??t.optimalLineLength??65))&&(n!=="minimalLineLength"||e[n]===null||e[n]<=(e.optimalLineLength??t.optimalLineLength??65))&&(t[n]=e[n]);return new ze(t)}}class eo{constructor(e){this.backgroundColor=D(e.backgroundColor)||null,this.blendFilter=P(e.blendFilter)??!1,this.constraint=w(e.constraint)||0,this.columnCount=w(e.columnCount)||null,this.darkenFilter=pe(e.darkenFilter)??!1,this.deprecatedFontSize=P(e.deprecatedFontSize),(this.deprecatedFontSize===!1||this.deprecatedFontSize===null)&&(this.deprecatedFontSize=!CSS.supports("zoom","1")),this.fontFamily=D(e.fontFamily)||null,this.fontSize=I(e.fontSize,De.range)||1,this.fontSizeNormalize=P(e.fontSizeNormalize)??!1,this.fontOpticalSizing=P(e.fontOpticalSizing)??null,this.fontWeight=I(e.fontWeight,ie.range)||null,this.fontWidth=I(e.fontWidth,We.range)||null,this.hyphens=P(e.hyphens)??null,this.invertFilter=pe(e.invertFilter)??!1,this.invertGaijiFilter=pe(e.invertGaijiFilter)??!1,this.iOSPatch=e.iOSPatch===!1?!1:(M.OS.iOS||M.OS.iPadOS)&&M.iOSRequest==="mobile",this.iPadOSPatch=e.iPadOSPatch===!1?!1:M.OS.iPadOS&&M.iOSRequest==="desktop",this.letterSpacing=w(e.letterSpacing)||null,this.ligatures=P(e.ligatures)??null,this.lineHeight=w(e.lineHeight)||null,this.linkColor=D(e.linkColor)||null,this.noRuby=P(e.noRuby)??!1,this.pageGutter=St(w(e.pageGutter),20),this.paragraphIndent=w(e.paragraphIndent)??null,this.paragraphSpacing=w(e.paragraphSpacing)??null,this.scroll=P(e.scroll)??!1,this.scrollPaddingTop=w(e.scrollPaddingTop)??null,this.scrollPaddingBottom=w(e.scrollPaddingBottom)??null,this.scrollPaddingLeft=w(e.scrollPaddingLeft)??null,this.scrollPaddingRight=w(e.scrollPaddingRight)??null,this.selectionBackgroundColor=D(e.selectionBackgroundColor)||null,this.selectionTextColor=D(e.selectionTextColor)||null,this.textAlign=Je(e.textAlign,te)||null,this.textColor=D(e.textColor)||null,this.textNormalization=P(e.textNormalization)??!1,this.visitedColor=D(e.visitedColor)||null,this.wordSpacing=w(e.wordSpacing)||null,this.optimalLineLength=w(e.optimalLineLength)||65,this.maximalLineLength=St(Fi(e.maximalLineLength,this.optimalLineLength),80),this.minimalLineLength=St(xi(e.minimalLineLength,this.optimalLineLength),40),this.experiments=on(e.experiments)||null}}const Le={backgroundColor:"#FFFFFF",textColor:"#121212",linkColor:"#0000EE",visitedColor:"#551A8B",selectionBackgroundColor:"#b4d8fe",selectionTextColor:"inherit"};class pn{constructor(e,t,n){this.preferences=e,this.settings=t,this.metadata=n,this.layout=this.metadata?.effectiveLayout||b.reflowable}clear(){this.preferences=new ze({optimalLineLength:65})}updatePreference(e,t){this.preferences[e]=t}get backgroundColor(){return new U({initialValue:this.preferences.backgroundColor,effectiveValue:this.settings.backgroundColor||Le.backgroundColor,isEffective:this.preferences.backgroundColor!==null,onChange:e=>{this.updatePreference("backgroundColor",e??null)}})}get blendFilter(){return new T({initialValue:this.preferences.blendFilter,effectiveValue:this.settings.blendFilter||!1,isEffective:this.preferences.blendFilter!==null,onChange:e=>{this.updatePreference("blendFilter",e??null)}})}get columnCount(){return new U({initialValue:this.preferences.columnCount,effectiveValue:this.settings.columnCount||null,isEffective:this.layout!==b.fixed&&!this.settings.scroll,onChange:e=>{this.updatePreference("columnCount",e??null)}})}get constraint(){return new U({initialValue:this.preferences.constraint,effectiveValue:this.preferences.constraint||0,isEffective:!0,onChange:e=>{this.updatePreference("constraint",e??null)}})}get darkenFilter(){return new F({initialValue:typeof this.preferences.darkenFilter=="boolean"?100:this.preferences.darkenFilter,effectiveValue:typeof this.settings.darkenFilter=="boolean"?100:this.settings.darkenFilter||0,isEffective:this.settings.darkenFilter!==null,onChange:e=>{this.updatePreference("darkenFilter",e??null)},supportedRange:ue.range,step:ue.step})}get deprecatedFontSize(){return new T({initialValue:this.preferences.deprecatedFontSize,effectiveValue:CSS.supports("zoom","1")?this.settings.deprecatedFontSize||!1:!0,isEffective:this.layout!==b.fixed,onChange:e=>{this.updatePreference("deprecatedFontSize",e??null)}})}get fontFamily(){return new U({initialValue:this.preferences.fontFamily,effectiveValue:this.settings.fontFamily||null,isEffective:this.layout!==b.fixed,onChange:e=>{this.updatePreference("fontFamily",e??null)}})}get fontSize(){return new F({initialValue:this.preferences.fontSize,effectiveValue:this.settings.fontSize||1,isEffective:this.layout!==b.fixed,onChange:e=>{this.updatePreference("fontSize",e??null)},supportedRange:De.range,step:De.step})}get fontSizeNormalize(){return new T({initialValue:this.preferences.fontSizeNormalize,effectiveValue:this.settings.fontSizeNormalize||!1,isEffective:this.layout!==b.fixed&&this.preferences.fontSizeNormalize!==null,onChange:e=>{this.updatePreference("fontSizeNormalize",e??null)}})}get fontOpticalSizing(){return new T({initialValue:this.preferences.fontOpticalSizing,effectiveValue:this.settings.fontOpticalSizing||!0,isEffective:this.layout!==b.fixed&&this.preferences.fontOpticalSizing!==null,onChange:e=>{this.updatePreference("fontOpticalSizing",e??null)}})}get fontWeight(){return new F({initialValue:this.preferences.fontWeight,effectiveValue:this.settings.fontWeight||400,isEffective:this.layout!==b.fixed&&this.preferences.fontWeight!==null,onChange:e=>{this.updatePreference("fontWeight",e??null)},supportedRange:ie.range,step:ie.step})}get fontWidth(){return new F({initialValue:this.preferences.fontWidth,effectiveValue:this.settings.fontWidth||100,isEffective:this.layout!==b.fixed&&this.preferences.fontWidth!==null,onChange:e=>{this.updatePreference("fontWidth",e??null)},supportedRange:We.range,step:We.step})}get hyphens(){return new T({initialValue:this.preferences.hyphens,effectiveValue:this.settings.hyphens||!1,isEffective:this.layout!==b.fixed&&this.metadata?.effectiveReadingProgression===H.ltr&&this.preferences.hyphens!==null,onChange:e=>{this.updatePreference("hyphens",e??null)}})}get invertFilter(){return new F({initialValue:typeof this.preferences.invertFilter=="boolean"?100:this.preferences.invertFilter,effectiveValue:typeof this.settings.invertFilter=="boolean"?100:this.settings.invertFilter||0,isEffective:this.settings.invertFilter!==null,onChange:e=>{this.updatePreference("invertFilter",e??null)},supportedRange:ue.range,step:ue.step})}get invertGaijiFilter(){return new F({initialValue:typeof this.preferences.invertGaijiFilter=="boolean"?100:this.preferences.invertGaijiFilter,effectiveValue:typeof this.settings.invertGaijiFilter=="boolean"?100:this.settings.invertGaijiFilter||0,isEffective:this.preferences.invertGaijiFilter!==null,onChange:e=>{this.updatePreference("invertGaijiFilter",e??null)},supportedRange:ue.range,step:ue.step})}get iOSPatch(){return new T({initialValue:this.preferences.iOSPatch,effectiveValue:this.settings.iOSPatch||!1,isEffective:this.layout!==b.fixed,onChange:e=>{this.updatePreference("iOSPatch",e??null)}})}get iPadOSPatch(){return new T({initialValue:this.preferences.iPadOSPatch,effectiveValue:this.settings.iPadOSPatch||!1,isEffective:this.layout!==b.fixed,onChange:e=>{this.updatePreference("iPadOSPatch",e??null)}})}get letterSpacing(){return new F({initialValue:this.preferences.letterSpacing,effectiveValue:this.settings.letterSpacing||0,isEffective:this.layout!==b.fixed&&this.preferences.letterSpacing!==null,onChange:e=>{this.updatePreference("letterSpacing",e??null)},supportedRange:Be.range,step:Be.step})}get ligatures(){return new T({initialValue:this.preferences.ligatures,effectiveValue:this.settings.ligatures||!0,isEffective:(()=>{if(this.preferences.ligatures===null||this.layout===b.fixed)return!1;const e=this.metadata?.languages?.[0]?.toLowerCase();return!(e&&["zh","ja","ko","mn-mong"].some(t=>e.startsWith(t)))})(),onChange:e=>{this.updatePreference("ligatures",e??null)}})}get lineHeight(){return new F({initialValue:this.preferences.lineHeight,effectiveValue:this.settings.lineHeight,isEffective:this.layout!==b.fixed&&this.preferences.lineHeight!==null,onChange:e=>{this.updatePreference("lineHeight",e??null)},supportedRange:je.range,step:je.step})}get linkColor(){return new U({initialValue:this.preferences.linkColor,effectiveValue:this.settings.linkColor||Le.linkColor,isEffective:this.layout!==b.fixed&&this.preferences.linkColor!==null,onChange:e=>{this.updatePreference("linkColor",e??null)}})}get maximalLineLength(){return new F({initialValue:this.preferences.maximalLineLength,effectiveValue:this.settings.maximalLineLength,isEffective:this.layout!==b.fixed,onChange:e=>{this.updatePreference("maximalLineLength",e)},supportedRange:me.range,step:me.step})}get minimalLineLength(){return new F({initialValue:this.preferences.minimalLineLength,effectiveValue:this.settings.minimalLineLength,isEffective:this.layout!==b.fixed,onChange:e=>{this.updatePreference("minimalLineLength",e)},supportedRange:me.range,step:me.step})}get noRuby(){return new T({initialValue:this.preferences.noRuby,effectiveValue:this.settings.noRuby||!1,isEffective:this.layout!==b.fixed&&this.metadata?.languages?.includes("ja")||!1,onChange:e=>{this.updatePreference("noRuby",e??null)}})}get optimalLineLength(){return new F({initialValue:this.preferences.optimalLineLength,effectiveValue:this.settings.optimalLineLength,isEffective:this.layout!==b.fixed,onChange:e=>{this.updatePreference("optimalLineLength",e)},supportedRange:me.range,step:me.step})}get pageGutter(){return new U({initialValue:this.preferences.pageGutter,effectiveValue:this.settings.pageGutter,isEffective:this.layout!==b.fixed&&!this.settings.scroll,onChange:e=>{this.updatePreference("pageGutter",e??null)}})}get paragraphIndent(){return new F({initialValue:this.preferences.paragraphIndent,effectiveValue:this.settings.paragraphIndent||0,isEffective:this.layout!==b.fixed&&this.preferences.paragraphIndent!==null,onChange:e=>{this.updatePreference("paragraphIndent",e??null)},supportedRange:Ge.range,step:Ge.step})}get paragraphSpacing(){return new F({initialValue:this.preferences.paragraphSpacing,effectiveValue:this.settings.paragraphSpacing||0,isEffective:this.layout!==b.fixed&&this.preferences.paragraphSpacing!==null,onChange:e=>{this.updatePreference("paragraphSpacing",e??null)},supportedRange:Ve.range,step:Ve.step})}get scroll(){return new T({initialValue:this.preferences.scroll,effectiveValue:this.settings.scroll||!1,isEffective:this.layout!==b.fixed,onChange:e=>{this.updatePreference("scroll",e??null)}})}get scrollPaddingTop(){return new U({initialValue:this.preferences.scrollPaddingTop,effectiveValue:this.settings.scrollPaddingTop||0,isEffective:this.layout!==b.fixed&&!!this.settings.scroll&&this.preferences.scrollPaddingTop!==null,onChange:e=>{this.updatePreference("scrollPaddingTop",e??null)}})}get scrollPaddingBottom(){return new U({initialValue:this.preferences.scrollPaddingBottom,effectiveValue:this.settings.scrollPaddingBottom||0,isEffective:this.layout!==b.fixed&&!!this.settings.scroll&&this.preferences.scrollPaddingBottom!==null,onChange:e=>{this.updatePreference("scrollPaddingBottom",e??null)}})}get scrollPaddingLeft(){return new U({initialValue:this.preferences.scrollPaddingLeft,effectiveValue:this.settings.scrollPaddingLeft||0,isEffective:this.layout!==b.fixed&&!!this.settings.scroll&&this.preferences.scrollPaddingLeft!==null,onChange:e=>{this.updatePreference("scrollPaddingLeft",e??null)}})}get scrollPaddingRight(){return new U({initialValue:this.preferences.scrollPaddingRight,effectiveValue:this.settings.scrollPaddingRight||0,isEffective:this.layout!==b.fixed&&!!this.settings.scroll&&this.preferences.scrollPaddingRight!==null,onChange:e=>{this.updatePreference("scrollPaddingRight",e??null)}})}get selectionBackgroundColor(){return new U({initialValue:this.preferences.selectionBackgroundColor,effectiveValue:this.settings.selectionBackgroundColor||Le.selectionBackgroundColor,isEffective:this.layout!==b.fixed&&this.preferences.selectionBackgroundColor!==null,onChange:e=>{this.updatePreference("selectionBackgroundColor",e??null)}})}get selectionTextColor(){return new U({initialValue:this.preferences.selectionTextColor,effectiveValue:this.settings.selectionTextColor||Le.selectionTextColor,isEffective:this.layout!==b.fixed&&this.preferences.selectionTextColor!==null,onChange:e=>{this.updatePreference("selectionTextColor",e??null)}})}get textAlign(){return new an({initialValue:this.preferences.textAlign,effectiveValue:this.settings.textAlign||te.start,isEffective:this.layout!==b.fixed&&this.preferences.textAlign!==null,onChange:e=>{this.updatePreference("textAlign",e??null)},supportedValues:Object.values(te)})}get textColor(){return new U({initialValue:this.preferences.textColor,effectiveValue:this.settings.textColor||Le.textColor,isEffective:this.layout!==b.fixed&&this.preferences.textColor!==null,onChange:e=>{this.updatePreference("textColor",e??null)}})}get textNormalization(){return new T({initialValue:this.preferences.textNormalization,effectiveValue:this.settings.textNormalization||!1,isEffective:this.layout!==b.fixed,onChange:e=>{this.updatePreference("textNormalization",e??null)}})}get visitedColor(){return new U({initialValue:this.preferences.visitedColor,effectiveValue:this.settings.visitedColor||Le.visitedColor,isEffective:this.layout!==b.fixed&&this.preferences.visitedColor!==null,onChange:e=>{this.updatePreference("visitedColor",e??null)}})}get wordSpacing(){return new F({initialValue:this.preferences.wordSpacing,effectiveValue:this.settings.wordSpacing||0,isEffective:this.layout!==b.fixed&&this.preferences.wordSpacing!==null,onChange:e=>{this.updatePreference("wordSpacing",e??null)},supportedRange:$e.range,step:$e.step})}}class gn{constructor(e,t){this.backgroundColor=e.backgroundColor||t.backgroundColor||null,this.blendFilter=typeof e.blendFilter=="boolean"?e.blendFilter:t.blendFilter??null,this.columnCount=e.columnCount!==void 0?e.columnCount:t.columnCount!==void 0?t.columnCount:null,this.constraint=e.constraint||t.constraint,this.darkenFilter=typeof e.darkenFilter=="boolean"?e.darkenFilter:t.darkenFilter??null,this.deprecatedFontSize=typeof e.deprecatedFontSize=="boolean"?e.deprecatedFontSize:t.deprecatedFontSize??null,this.fontFamily=e.fontFamily||t.fontFamily||null,this.fontSize=e.fontSize!==void 0?e.fontSize:t.fontSize!==void 0?t.fontSize:null,this.fontSizeNormalize=typeof e.fontSizeNormalize=="boolean"?e.fontSizeNormalize:t.fontSizeNormalize??null,this.fontOpticalSizing=typeof e.fontOpticalSizing=="boolean"?e.fontOpticalSizing:t.fontOpticalSizing??null,this.fontWeight=e.fontWeight!==void 0?e.fontWeight:t.fontWeight!==void 0?t.fontWeight:null,this.fontWidth=e.fontWidth!==void 0?e.fontWidth:t.fontWidth!==void 0?t.fontWidth:null,this.hyphens=typeof e.hyphens=="boolean"?e.hyphens:t.hyphens??null,this.invertFilter=typeof e.invertFilter=="boolean"?e.invertFilter:t.invertFilter??null,this.invertGaijiFilter=typeof e.invertGaijiFilter=="boolean"?e.invertGaijiFilter:t.invertGaijiFilter??null,this.iOSPatch=this.deprecatedFontSize||e.iOSPatch===!1?!1:e.iOSPatch===!0?(M.OS.iOS||M.OS.iPadOS)&&M.iOSRequest==="mobile":t.iOSPatch,this.iPadOSPatch=this.deprecatedFontSize||e.iPadOSPatch===!1?!1:e.iPadOSPatch===!0?M.OS.iPadOS&&M.iOSRequest==="desktop":t.iPadOSPatch,this.letterSpacing=e.letterSpacing!==void 0?e.letterSpacing:t.letterSpacing!==void 0?t.letterSpacing:null,this.ligatures=typeof e.ligatures=="boolean"?e.ligatures:t.ligatures??null,this.lineHeight=e.lineHeight!==void 0?e.lineHeight:t.lineHeight!==void 0?t.lineHeight:null,this.linkColor=e.linkColor||t.linkColor||null,this.maximalLineLength=e.maximalLineLength===null?null:e.maximalLineLength||t.maximalLineLength||null,this.minimalLineLength=e.minimalLineLength===null?null:e.minimalLineLength||t.minimalLineLength||null,this.noRuby=typeof e.noRuby=="boolean"?e.noRuby:t.noRuby??null,this.optimalLineLength=e.optimalLineLength||t.optimalLineLength,this.pageGutter=e.pageGutter!==void 0?e.pageGutter:t.pageGutter!==void 0?t.pageGutter:null,this.paragraphIndent=e.paragraphIndent!==void 0?e.paragraphIndent:t.paragraphIndent!==void 0?t.paragraphIndent:null,this.paragraphSpacing=e.paragraphSpacing!==void 0?e.paragraphSpacing:t.paragraphSpacing!==void 0?t.paragraphSpacing:null,this.scroll=typeof e.scroll=="boolean"?e.scroll:t.scroll??null,this.scrollPaddingTop=e.scrollPaddingTop!==void 0?e.scrollPaddingTop:t.scrollPaddingTop!==void 0?t.scrollPaddingTop:null,this.scrollPaddingBottom=e.scrollPaddingBottom!==void 0?e.scrollPaddingBottom:t.scrollPaddingBottom!==void 0?t.scrollPaddingBottom:null,this.scrollPaddingLeft=e.scrollPaddingLeft!==void 0?e.scrollPaddingLeft:t.scrollPaddingLeft!==void 0?t.scrollPaddingLeft:null,this.scrollPaddingRight=e.scrollPaddingRight!==void 0?e.scrollPaddingRight:t.scrollPaddingRight!==void 0?t.scrollPaddingRight:null,this.selectionBackgroundColor=e.selectionBackgroundColor||t.selectionBackgroundColor||null,this.selectionTextColor=e.selectionTextColor||t.selectionTextColor||null,this.textAlign=e.textAlign||t.textAlign||null,this.textColor=e.textColor||t.textColor||null,this.textNormalization=typeof e.textNormalization=="boolean"?e.textNormalization:t.textNormalization??null,this.visitedColor=e.visitedColor||t.visitedColor||null,this.wordSpacing=e.wordSpacing!==void 0?e.wordSpacing:t.wordSpacing!==void 0?t.wordSpacing:null,this.experiments=t.experiments||null}}function Qe(r){const e=getComputedStyle(r),t=parseFloat(e.paddingLeft||"0"),n=parseFloat(e.paddingRight||"0");return r.clientWidth-t-n}function Zr(r){const e=getComputedStyle(r),t=parseFloat(e.paddingTop||"0"),n=parseFloat(e.paddingBottom||"0");return r.clientHeight-t-n}class fn extends qe{constructor(e){super(),this.a11yNormalize=e.a11yNormalize??null,this.backgroundColor=e.backgroundColor??null,this.blendFilter=e.blendFilter??null,this.bodyHyphens=e.bodyHyphens??null,this.colCount=e.colCount??null,this.darkenFilter=e.darkenFilter??null,this.deprecatedFontSize=e.deprecatedFontSize??null,this.fontFamily=e.fontFamily??null,this.fontOpticalSizing=e.fontOpticalSizing??null,this.fontSize=e.fontSize??null,this.fontSizeNormalize=e.fontSizeNormalize??null,this.fontWeight=e.fontWeight??null,this.fontWidth=e.fontWidth??null,this.invertFilter=e.invertFilter??null,this.invertGaijiFilter=e.invertGaijiFilter??null,this.iOSPatch=e.iOSPatch??null,this.iPadOSPatch=e.iPadOSPatch??null,this.letterSpacing=e.letterSpacing??null,this.ligatures=e.ligatures??null,this.lineHeight=e.lineHeight??null,this.lineLength=e.lineLength??null,this.linkColor=e.linkColor??null,this.noRuby=e.noRuby??null,this.paraIndent=e.paraIndent??null,this.paraSpacing=e.paraSpacing??null,this.selectionBackgroundColor=e.selectionBackgroundColor??null,this.selectionTextColor=e.selectionTextColor??null,this.textAlign=e.textAlign??null,this.textColor=e.textColor??null,this.view=e.view??null,this.visitedColor=e.visitedColor??null,this.wordSpacing=e.wordSpacing??null}toCSSProperties(){const e={};return this.a11yNormalize&&(e["--USER__a11yNormalize"]=this.toFlag("a11y")),this.backgroundColor&&(e["--USER__backgroundColor"]=this.backgroundColor),this.blendFilter&&(e["--USER__blendFilter"]=this.toFlag("blend")),this.bodyHyphens&&(e["--USER__bodyHyphens"]=this.bodyHyphens),this.colCount&&(e["--USER__colCount"]=this.toUnitless(this.colCount)),this.darkenFilter===!0?e["--USER__darkenFilter"]=this.toFlag("darken"):typeof this.darkenFilter=="number"&&(e["--USER__darkenFilter"]=this.toPercentage(this.darkenFilter)),this.deprecatedFontSize&&(e["--USER__fontSizeImplementation"]=this.toFlag("deprecatedFontSize")),this.fontFamily&&(e["--USER__fontFamily"]=this.fontFamily),this.fontOpticalSizing!=null&&(e["--USER__fontOpticalSizing"]=this.fontOpticalSizing),this.fontSize!=null&&(e["--USER__fontSize"]=this.toPercentage(this.fontSize,!0)),this.fontSizeNormalize&&(e["--USER__fontSizeNormalize"]=this.toFlag("normalize")),this.fontWeight!=null&&(e["--USER__fontWeight"]=this.toUnitless(this.fontWeight)),this.fontWidth!=null&&(e["--USER__fontWidth"]=typeof this.fontWidth=="string"?this.fontWidth:this.toUnitless(this.fontWidth)),this.invertFilter===!0?e["--USER__invertFilter"]=this.toFlag("invert"):typeof this.invertFilter=="number"&&(e["--USER__invertFilter"]=this.toPercentage(this.invertFilter)),this.invertGaijiFilter===!0?e["--USER__invertGaiji"]=this.toFlag("invertGaiji"):typeof this.invertGaijiFilter=="number"&&(e["--USER__invertGaiji"]=this.toPercentage(this.invertGaijiFilter)),this.iOSPatch&&(e["--USER__iOSPatch"]=this.toFlag("iOSPatch")),this.iPadOSPatch&&(e["--USER__iPadOSPatch"]=this.toFlag("iPadOSPatch")),this.letterSpacing!=null&&(e["--USER__letterSpacing"]=this.toRem(this.letterSpacing)),this.ligatures&&(e["--USER__ligatures"]=this.ligatures),this.lineHeight!=null&&(e["--USER__lineHeight"]=this.toUnitless(this.lineHeight)),this.lineLength!=null&&(e["--USER__lineLength"]=this.toPx(this.lineLength)),this.linkColor&&(e["--USER__linkColor"]=this.linkColor),this.noRuby&&(e["--USER__noRuby"]=this.toFlag("noRuby")),this.paraIndent!=null&&(e["--USER__paraIndent"]=this.toRem(this.paraIndent)),this.paraSpacing!=null&&(e["--USER__paraSpacing"]=this.toRem(this.paraSpacing)),this.selectionBackgroundColor&&(e["--USER__selectionBackgroundColor"]=this.selectionBackgroundColor),this.selectionTextColor&&(e["--USER__selectionTextColor"]=this.selectionTextColor),this.textAlign&&(e["--USER__textAlign"]=this.textAlign),this.textColor&&(e["--USER__textColor"]=this.textColor),this.view&&(e["--USER__view"]=this.toFlag(this.view)),this.visitedColor&&(e["--USER__visitedColor"]=this.visitedColor),this.wordSpacing!=null&&(e["--USER__wordSpacing"]=this.toRem(this.wordSpacing)),e}}class to extends qe{constructor(e){super(),this.backgroundColor=e.backgroundColor??null,this.baseFontFamily=e.baseFontFamily??null,this.baseFontSize=e.baseFontSize??null,this.baseLineHeight=e.baseLineHeight??null,this.boxSizingMedia=e.boxSizingMedia??null,this.boxSizingTable=e.boxSizingTable??null,this.colWidth=e.colWidth??null,this.colCount=e.colCount??null,this.colGap=e.colGap??null,this.codeFontFamily=e.codeFontFamily??null,this.compFontFamily=e.compFontFamily??null,this.defaultLineLength=e.defaultLineLength??null,this.flowSpacing=e.flowSpacing??null,this.humanistTf=e.humanistTf??null,this.linkColor=e.linkColor??null,this.maxMediaWidth=e.maxMediaWidth??null,this.maxMediaHeight=e.maxMediaHeight??null,this.modernTf=e.modernTf??null,this.monospaceTf=e.monospaceTf??null,this.noOverflow=e.noOverflow??null,this.noVerticalPagination=e.noVerticalPagination??null,this.oldStyleTf=e.oldStyleTf??null,this.pageGutter=e.pageGutter??null,this.paraIndent=e.paraIndent??null,this.paraSpacing=e.paraSpacing??null,this.primaryColor=e.primaryColor??null,this.scrollPaddingBottom=e.scrollPaddingBottom??null,this.scrollPaddingLeft=e.scrollPaddingLeft??null,this.scrollPaddingRight=e.scrollPaddingRight??null,this.scrollPaddingTop=e.scrollPaddingTop??null,this.sansSerifJa=e.sansSerifJa??null,this.sansSerifJaV=e.sansSerifJaV??null,this.sansTf=e.sansTf??null,this.secondaryColor=e.secondaryColor??null,this.selectionBackgroundColor=e.selectionBackgroundColor??null,this.selectionTextColor=e.selectionTextColor??null,this.serifJa=e.serifJa??null,this.serifJaV=e.serifJaV??null,this.textColor=e.textColor??null,this.typeScale=e.typeScale??null,this.visitedColor=e.visitedColor??null,this.experiments=e.experiments??null}toCSSProperties(){const e={};return this.backgroundColor&&(e["--RS__backgroundColor"]=this.backgroundColor),this.baseFontFamily&&(e["--RS__baseFontFamily"]=this.baseFontFamily),this.baseFontSize!=null&&(e["--RS__baseFontSize"]=this.toRem(this.baseFontSize)),this.baseLineHeight!=null&&(e["--RS__baseLineHeight"]=this.toUnitless(this.baseLineHeight)),this.boxSizingMedia&&(e["--RS__boxSizingMedia"]=this.boxSizingMedia),this.boxSizingTable&&(e["--RS__boxSizingTable"]=this.boxSizingTable),this.colWidth!=null&&(e["--RS__colWidth"]=this.colWidth),this.colCount!=null&&(e["--RS__colCount"]=this.toUnitless(this.colCount)),this.colGap!=null&&(e["--RS__colGap"]=this.toPx(this.colGap)),this.codeFontFamily&&(e["--RS__codeFontFamily"]=this.codeFontFamily),this.compFontFamily&&(e["--RS__compFontFamily"]=this.compFontFamily),this.defaultLineLength!=null&&(e["--RS__defaultLineLength"]=this.toPx(this.defaultLineLength)),this.flowSpacing!=null&&(e["--RS__flowSpacing"]=this.toRem(this.flowSpacing)),this.humanistTf&&(e["--RS__humanistTf"]=this.humanistTf),this.linkColor&&(e["--RS__linkColor"]=this.linkColor),this.maxMediaWidth&&(e["--RS__maxMediaWidth"]=this.toVw(this.maxMediaWidth)),this.maxMediaHeight&&(e["--RS__maxMediaHeight"]=this.toVh(this.maxMediaHeight)),this.modernTf&&(e["--RS__modernTf"]=this.modernTf),this.monospaceTf&&(e["--RS__monospaceTf"]=this.monospaceTf),this.noOverflow&&(e["--RS__disableOverflow"]=this.toFlag("noOverflow")),this.noVerticalPagination&&(e["--RS__disablePagination"]=this.toFlag("noVerticalPagination")),this.oldStyleTf&&(e["--RS__oldStyleTf"]=this.oldStyleTf),this.pageGutter!=null&&(e["--RS__pageGutter"]=this.toPx(this.pageGutter)),this.paraIndent!=null&&(e["--RS__paraIndent"]=this.toRem(this.paraIndent)),this.paraSpacing!=null&&(e["--RS__paraSpacing"]=this.toRem(this.paraSpacing)),this.primaryColor&&(e["--RS__primaryColor"]=this.primaryColor),this.sansSerifJa&&(e["--RS__sans-serif-ja"]=this.sansSerifJa),this.sansSerifJaV&&(e["--RS__sans-serif-ja-v"]=this.sansSerifJaV),this.sansTf&&(e["--RS__sansTf"]=this.sansTf),this.scrollPaddingBottom!=null&&(e["--RS__scrollPaddingBottom"]=this.toPx(this.scrollPaddingBottom)),this.scrollPaddingLeft!=null&&(e["--RS__scrollPaddingLeft"]=this.toPx(this.scrollPaddingLeft)),this.scrollPaddingRight!=null&&(e["--RS__scrollPaddingRight"]=this.toPx(this.scrollPaddingRight)),this.scrollPaddingTop!=null&&(e["--RS__scrollPaddingTop"]=this.toPx(this.scrollPaddingTop)),this.secondaryColor&&(e["--RS__secondaryColor"]=this.secondaryColor),this.selectionBackgroundColor&&(e["--RS__selectionBackgroundColor"]=this.selectionBackgroundColor),this.selectionTextColor&&(e["--RS__selectionTextColor"]=this.selectionTextColor),this.serifJa&&(e["--RS__serif-ja"]=this.serifJa),this.serifJaV&&(e["--RS__serif-ja-v"]=this.serifJaV),this.textColor&&(e["--RS__textColor"]=this.textColor),this.typeScale&&(e["--RS__typeScale"]=this.toUnitless(this.typeScale)),this.visitedColor&&(e["--RS__visitedColor"]=this.visitedColor),this.experiments&&this.experiments.forEach(t=>{e["--RS__"+t]=yt[t].value}),e}}class no{constructor(e){this.rsProperties=e.rsProperties,this.userProperties=e.userProperties,this.lineLengths=e.lineLengths,this.container=e.container,this.containerParent=e.container.parentElement||document.documentElement,this.constraint=e.constraint,this.isCJKVertical=e.isCJKVertical??!1,this.cachedColCount=e.userProperties.colCount,this.effectiveContainerWidth=Qe(this.containerParent)}update(e){this.cachedColCount=e.columnCount,e.constraint!==this.constraint&&(this.constraint=e.constraint),e.pageGutter!==this.rsProperties.pageGutter&&(this.rsProperties.pageGutter=e.pageGutter),e.scrollPaddingBottom!==this.rsProperties.scrollPaddingBottom&&(this.rsProperties.scrollPaddingBottom=e.scrollPaddingBottom),e.scrollPaddingLeft!==this.rsProperties.scrollPaddingLeft&&(this.rsProperties.scrollPaddingLeft=e.scrollPaddingLeft),e.scrollPaddingRight!==this.rsProperties.scrollPaddingRight&&(this.rsProperties.scrollPaddingRight=e.scrollPaddingRight),e.scrollPaddingTop!==this.rsProperties.scrollPaddingTop&&(this.rsProperties.scrollPaddingTop=e.scrollPaddingTop),e.experiments!==this.rsProperties.experiments&&(this.rsProperties.experiments=e.experiments),this.lineLengths.update({fontFace:e.fontFamily,letterSpacing:e.letterSpacing,padding:e.scroll?(e.scrollPaddingLeft||0)+(e.scrollPaddingRight||0):(e.pageGutter||0)*2,wordSpacing:e.wordSpacing,optimalChars:e.optimalLineLength,minChars:e.minimalLineLength,maxChars:e.maximalLineLength});const t=this.updateLayout(e.fontSize,e.deprecatedFontSize||e.iOSPatch,e.scroll,e.columnCount);t?.effectiveContainerWidth&&(this.effectiveContainerWidth=t?.effectiveContainerWidth);const n={a11yNormalize:e.textNormalization,backgroundColor:e.backgroundColor,blendFilter:e.blendFilter,bodyHyphens:typeof e.hyphens!="boolean"?null:e.hyphens?"auto":"none",colCount:t?.colCount,darkenFilter:e.darkenFilter,deprecatedFontSize:e.deprecatedFontSize,fontFamily:e.fontFamily,fontOpticalSizing:typeof e.fontOpticalSizing!="boolean"?null:e.fontOpticalSizing?"auto":"none",fontSize:e.fontSize,fontSizeNormalize:e.fontSizeNormalize,fontWeight:e.fontWeight,fontWidth:e.fontWidth,invertFilter:e.invertFilter,invertGaijiFilter:e.invertGaijiFilter,iOSPatch:e.iOSPatch,iPadOSPatch:e.iPadOSPatch,letterSpacing:e.letterSpacing,ligatures:typeof e.ligatures!="boolean"?null:e.ligatures?"common-ligatures":"none",lineHeight:e.lineHeight,lineLength:t?.effectiveLineLength,linkColor:e.linkColor,noRuby:e.noRuby,paraIndent:e.paragraphIndent,paraSpacing:e.paragraphSpacing,selectionBackgroundColor:e.selectionBackgroundColor,selectionTextColor:e.selectionTextColor,textAlign:e.textAlign,textColor:e.textColor,view:typeof e.scroll!="boolean"?null:e.scroll?"scroll":"paged",visitedColor:e.visitedColor,wordSpacing:e.wordSpacing};this.userProperties=new fn(n)}updateLayout(e,t,n,i){return this.isCJKVertical?this.computeCJKVerticalLength(e,t):n??this.userProperties.view==="scroll"?this.computeScrollLength(e,t):this.paginate(e,t,i)}getCompensatedMetrics(e,t){const n=e||this.userProperties.fontSize||1,i=n<1?1/n:t?n:1;return{zoomFactor:n,zoomCompensation:i,optimal:Math.round(this.lineLengths.optimalLineLength)*n,minimal:this.lineLengths.minimalLineLength!==null?Math.round(this.lineLengths.minimalLineLength*n):null,maximal:this.lineLengths.maximalLineLength!==null?Math.round(this.lineLengths.maximalLineLength*n):null}}paginate(e,t,n){const i=Math.round(Qe(this.containerParent)-this.constraint),o=this.getCompensatedMetrics(e,t),{zoomCompensation:a,optimal:s,minimal:l,maximal:d}=o,c=()=>i>=s&&d!==null?Math.min(Math.round(d*a),i):i;let h=1,u=i;if(n===void 0)return{colCount:void 0,effectiveContainerWidth:u,effectiveLineLength:Math.round(u/h*a)};if(n===null)if(i>=s&&d!==null){h=Math.floor(i/s);const g=Math.round(h*(d*a));u=Math.min(g,i)}else u=c();else if(n>1){const g=Math.round(n*(l!==null?l:s));if(i>=g)if(h=n,d===null)u=i;else{const m=Math.round(h*(d*a));u=Math.min(m,i)}else if(l!==null&&i<Math.round(n*l))if(h=Math.floor(i/l),h<=1)h=1,u=c();else{const m=Math.round(h*(s*a));u=Math.min(m,i)}else{h=n;const m=Math.round(h*(s*a));u=Math.min(m,i)}}else h=1,u=c();return{colCount:h,effectiveContainerWidth:u,effectiveLineLength:Math.round(u/h/(e&&e>=1?e:1)*a)}}computeCJKVerticalLength(e,t){const n=Math.round(Qe(this.containerParent)-this.constraint),i=Math.round(Zr(this.containerParent)),o=this.getCompensatedMetrics(e,t),a=o.maximal!==null?Math.min(Math.round(o.maximal*o.zoomCompensation),i):i;return{colCount:void 0,effectiveContainerWidth:n,effectiveLineLength:a}}computeScrollLength(e,t){const n=Math.round(Qe(this.containerParent)-this.constraint),i=this.getCompensatedMetrics(e&&(e<1||t)?e:1,t),o=i.zoomCompensation,a=i.optimal,s=i.maximal;let l,d=n,c=Math.round(a*o);if(s===null)c=n;else{const h=Math.min(Math.round(s*o),n);c=t?h:Math.round(h*o)}return{colCount:l,effectiveContainerWidth:d,effectiveLineLength:c}}setContainerWidth(){this.container.style.width=`${this.effectiveContainerWidth}px`}resizeHandler(){const e=this.updateLayout(this.userProperties.fontSize,this.userProperties.deprecatedFontSize||this.userProperties.iOSPatch,this.userProperties.view==="scroll",this.cachedColCount);this.userProperties.colCount=e.colCount,this.userProperties.lineLength=e.effectiveLineLength,this.effectiveContainerWidth=e.effectiveContainerWidth,this.container.style.width=`${this.effectiveContainerWidth}px`}}const Qr=`// Note: we aren't blocking some of the events right now to try and be as nonintrusive as possible.
// For a more comprehensive implementation, see https://github.com/hackademix/noscript/blob/3a83c0e4a506f175e38b0342dad50cdca3eae836/src/content/syncFetchPolicy.js#L142
// The snippet of code at the beginning of this source is an attempt at defence against JS using persistent storage
(function() {
    const noop = () => {}, emptyObj = {}, emptyPromise = () => Promise.resolve(void 0), fakeStorage = {
        getItem: noop, 
        setItem: noop, 
        removeItem: noop, 
        clear: noop, 
        key: noop, 
        length: 0
    };
    
    ["localStorage", "sessionStorage"].forEach((e) => Object.defineProperty(window, e, {
        get: () => fakeStorage,
        configurable: !0
    }));
    
    Object.defineProperty(document, "cookie", {
        get: () => "",
        set: noop,
        configurable: !0
    });
    
    Object.defineProperty(window, "indexedDB", {
        get: () => {},
        configurable: !0
    });
    
    Object.defineProperty(window, "caches", {
        get: () => emptyObj,
        configurable: !0
    });
    
    Object.defineProperty(navigator, "storage", {
        get: () => ({
            persist: emptyPromise,
            persisted: emptyPromise,
            estimate: () => Promise.resolve({quota: 0, usage: 0})
        }),
        configurable: !0
    });
    
    Object.defineProperty(navigator, "serviceWorker", {
        get: () => ({
            register: emptyPromise,
            getRegistration: emptyPromise,
            ready: emptyPromise()
        }),
        configurable: !0
    });

    window._readium_blockedEvents = [];
    window._readium_blockEvents = true;
    window._readium_eventBlocker = (e) => {
        if(!window._readium_blockEvents) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        _readium_blockedEvents.push([
            1, e, e.currentTarget || e.target
        ]);
    };
    window.addEventListener("DOMContentLoaded", window._readium_eventBlocker, true);
    window.addEventListener("load", window._readium_eventBlocker, true);
})();
`;async function ea(r,e){const t=r.effectiveLayout===b.fixed,n=e.filter(s=>s.mediaType.isHTML).map(s=>s.href),i=n.length>0?n:[/\.xhtml$/,/\.html$/],o=[{id:"css-selector-generator",as:"script",target:"head",blob:new Blob([Fe(Ti)],{type:"text/javascript"})},{id:"execution-prevention",as:"script",target:"head",blob:new Blob([Fe(Qr)],{type:"text/javascript"}),condition:s=>!!(s.querySelector("script")||s.querySelector("body[onload]:not(body[onload=''])"))}],a=[{id:"onload-proxy",as:"script",target:"head",blob:new Blob([Fe(Ni)],{type:"text/javascript"}),condition:s=>!!(s.querySelector("script")||s.querySelector("body[onload]:not(body[onload=''])"))}];if(!t){const s=de(r);let l,d,c;switch(s){case"rtl":{const[h,u,g]=await Promise.all([Promise.resolve().then(()=>ya),Promise.resolve().then(()=>Sa),Promise.resolve().then(()=>_a)]);l=h.default,d=u.default,c=g.default;break}case"cjk-horizontal":{const[h,u,g]=await Promise.all([Promise.resolve().then(()=>ba),Promise.resolve().then(()=>va),Promise.resolve().then(()=>wa)]);l=h.default,d=u.default,c=g.default;break}case"cjk-vertical":case"mongolian-vertical":{const[h,u,g]=await Promise.all([Promise.resolve().then(()=>Ra),Promise.resolve().then(()=>Pa),Promise.resolve().then(()=>Ca)]);l=h.default,d=u.default,c=g.default;break}default:{const[h,u,g]=await Promise.all([Promise.resolve().then(()=>ka),Promise.resolve().then(()=>Ea),Promise.resolve().then(()=>xa)]);l=h.default,d=u.default,c=g.default;break}}if(o.unshift({id:"readium-css-before",as:"link",target:"head",blob:new Blob([Ze(l)],{type:"text/css"}),rel:"stylesheet"}),a.unshift({id:"readium-css-default",as:"link",target:"head",blob:new Blob([Ze(d)],{type:"text/css"}),rel:"stylesheet",condition:h=>!(h.querySelector("link[rel='stylesheet']")||h.querySelector("style")||h.querySelector("[style]:not([style=''])"))},{id:"readium-css-after",as:"link",target:"head",blob:new Blob([Ze(c)],{type:"text/css"}),rel:"stylesheet"}),(s==="cjk-horizontal"||s==="cjk-vertical")&&(r.description==="ebpaj-guide-1.0"||r.otherMetadata?.["ebpaj:guide-version"]!==void 0)){const{default:u}=await Promise.resolve().then(()=>Fa);a.push({id:"readium-css-ebpaj",as:"link",target:"head",blob:new Blob([Ze(u)],{type:"text/css"}),rel:"stylesheet"})}}return[{resources:i,prepend:o,append:a}]}const ta=r=>({frameLoaded:r.frameLoaded||(()=>{}),positionChanged:r.positionChanged||(()=>{}),tap:r.tap||(()=>!1),click:r.click||(()=>!1),zoom:r.zoom||(()=>{}),miscPointer:r.miscPointer||(()=>{}),scroll:r.scroll||(()=>{}),customEvent:r.customEvent||(()=>{}),handleLocator:r.handleLocator||(()=>!1),textSelected:r.textSelected||(()=>{}),contentProtection:r.contentProtection||(()=>{}),contextMenu:r.contextMenu||(()=>{}),peripheral:r.peripheral||(()=>{})});class yn extends Jt{constructor(e,t,n,i=[],o=void 0,a={preferences:{},defaults:{}}){super(),this._preferencesEditor=null,this._injector=null,this._isNavigating=!1,this._navigatorProtector=null,this._keyboardPeripheralsManager=null,this._suspiciousActivityListener=null,this._keyboardPeripheralListener=null,this._decorations=new Map,this._decorationObservers=new Map,this._decorationActivationState=new Map,this._decorationActivationConsumed=!1,this.reflowViewport={readingOrder:[],progressions:new Map,positions:null},this.pub=t,this.container=e,this.listeners=ta(n),this.currentLocation=o,i.length&&(this.positions=i),this._preferences=new ze(a.preferences),this._defaults=new eo(a.defaults),this._settings=new gn(this._preferences,this._defaults);const s=de(t.metadata),l=s==="cjk-horizontal",d=s==="cjk-vertical",h=d||s==="mongolian-vertical",u=l||d;this._css=new no({rsProperties:new to({noVerticalPagination:h||void 0}),userProperties:new fn({}),lineLengths:new Oe({optimalChars:this._settings.optimalLineLength,minChars:this._settings.minimalLineLength,maxChars:this._settings.maximalLineLength,padding:this._settings.scroll?(this._settings.scrollPaddingLeft||0)+(this._settings.scrollPaddingRight||0):(this._settings.pageGutter||0)*2,fontFace:this._settings.fontFamily,letterSpacing:this._settings.letterSpacing,wordSpacing:this._settings.wordSpacing,isCJK:u}),container:e,constraint:this._settings.constraint,isCJKVertical:h}),this._layout=yn.determineLayout(t,!!this._settings.scroll),this.currentProgression=t.metadata.effectiveReadingProgression,this._injectablesConfig=a.injectables||{rules:[],allowedDomains:[]},this._readiumRulesPromise=ea(t.metadata,t.readingOrder.items),this._contentProtection=a.contentProtection||{},this._decoratorConfig=a.decoratorConfig||{},this._keyboardPeripherals=this.mergeKeyboardPeripherals(this._contentProtection,a.keyboardPeripherals||[]),(this._contentProtection.disableContextMenu||this._contentProtection.checkAutomation||this._contentProtection.checkIFrameEmbedding||this._contentProtection.monitorDevTools||this._contentProtection.protectPrinting?.disable)&&(this._navigatorProtector=new hn(this._contentProtection),this._suspiciousActivityListener=g=>{const{type:m,...p}=g.detail;m==="context_menu"?this.listeners.contextMenu(p):this.listeners.contentProtection(m,p)},window.addEventListener(ge,this._suspiciousActivityListener)),this._keyboardPeripherals.length>0&&(this._keyboardPeripheralsManager=new dn({keyboardPeripherals:this._keyboardPeripherals}),this._keyboardPeripheralListener=g=>{const m=g.detail;this.listeners.peripheral(m)},window.addEventListener(fe,this._keyboardPeripheralListener)),this.resizeObserver=new ResizeObserver(()=>this.ownerWindow.requestAnimationFrame(async()=>await this.resizeHandler())),this.resizeObserver.observe(this.container.parentElement||document.documentElement)}static determineLayout(e,t){const n=e.metadata.effectiveLayout;if(n===b.fixed||e.metadata.otherMetadata&&"http://openmangaformat.org/schema/1.0#version"in e.metadata.otherMetadata||e.metadata?.conformsTo?.includes(An.DIVINA))return b.fixed;if(n===b.scrolled)return b.scrolled;const i=de(e.metadata);return i==="cjk-vertical"||i==="mongolian-vertical"||n===b.reflowable&&t?b.scrolled:b.reflowable}async load(){if(this.positions?.length||(this.positions=await this.pub.positionsFromManifest()),!this._injector){const e=await this._readiumRulesPromise;this._injector=new ln({rules:[...e,...this._injectablesConfig.rules],allowedDomains:this._injectablesConfig.allowedDomains})}if(this._layout===b.fixed)this.framePool=new Qi(this.container,this.positions,this.pub,this._injector,this._contentProtection,this._keyboardPeripherals),this.framePool.listener=(e,t)=>{this.eventListener(e,t)};else{await this.updateCSS(!1);const e=this.compileCSSProperties(this._css);this.framePool=new Bi(this.container,this.positions,e,this._injector,this._contentProtection,this._keyboardPeripherals)}this.currentLocation===void 0&&(this.currentLocation=this.positions[0]),await this.resizeHandler(),await this.apply()}get settings(){if(this._layout===b.fixed)return Object.freeze({...this._settings});{const e=this._css.userProperties.colCount||this._css.rsProperties.colCount||this._settings.columnCount;return Object.freeze({...this._settings,columnCount:e})}}get preferencesEditor(){return this._preferencesEditor===null&&(this._preferencesEditor=new pn(this._preferences,this.settings,this.pub.metadata)),this._preferencesEditor}async submitPreferences(e){this._preferences=this._preferences.merging(e),await this.applyPreferences()}async applyPreferences(){const e=this._settings;this._settings=new gn(this._preferences,this._defaults),this._preferencesEditor!==null&&(this._preferencesEditor=new pn(this._preferences,this.settings,this.pub.metadata)),this._layout===b.fixed?this.handleFXLPrefs(e,this._settings):await this.updateCSS(!0)}handleFXLPrefs(e,t){e.columnCount!==t.columnCount&&this.framePool.setPerPage(t.columnCount)}async updateCSS(e){this._css.update(this._settings),e&&await this.commitCSS(this._css)}compileCSSProperties(e){const t={};for(const[n,i]of Object.entries(e.rsProperties.toCSSProperties()))t[n]=i;for(const[n,i]of Object.entries(e.userProperties.toCSSProperties()))t[n]=i;return t}async commitCSS(e){if(!this.framePool)return;const t=this.compileCSSProperties(e);this.framePool.setCSSProperties(t),this._css.userProperties.view==="paged"&&this._layout===b.scrolled?await this.setLayout(b.reflowable):this._css.userProperties.view==="scroll"&&this._layout===b.reflowable&&await this.setLayout(b.scrolled),this._css.setContainerWidth()}async resizeHandler(){const e=this.container.parentElement||document.documentElement;if(this._layout===b.fixed){if(this.container.style.width=`${Qe(e)-this._settings.constraint}px`,!this.framePool)return;this.framePool.resizeHandler()}else{const t=this._css.userProperties.colCount,n=this._css.userProperties.lineLength;this._css.resizeHandler(),(this._css.userProperties.view!=="scroll"&&t!==this._css.userProperties.colCount||n!==this._css.userProperties.lineLength)&&await this.commitCSS(this._css)}}get layout(){return this._layout}get ownerWindow(){return this.container.ownerDocument.defaultView||window}get _cframes(){return(this.framePool?.currentFrames??[]).filter(e=>!(e instanceof un&&e.isDestroyed))}get pool(){return this.framePool}eventListener(e,t,n){switch(e){case"_pong":if(this.listeners.frameLoaded(this._cframes[0].iframe.contentWindow),this.listeners.positionChanged(this.currentLocation),n){const c=this._cframes.filter(u=>!!u).indexOf(n),h=c>=0?this.viewport.readingOrder[c]:void 0;h&&this._reapplyDecorationsToFrame(n,h)}else this._reapplyDecorationsToCurrentFrames();break;case"first_visible_locator":const i=N.deserialize(t);if(!i)break;this.currentLocation=new N({href:this.currentLocation.href,type:this.currentLocation.type,title:this.currentLocation.title,locations:i?.locations,text:i?.text}),this.listeners.positionChanged(this.currentLocation);break;case"text_selected":{const d=t;if(n){const h=this._cframes.filter(g=>!!g).indexOf(n),u=h>=0?this.viewport.readingOrder[h]:void 0;if(u){const g=this.pub.readingOrder.findWithHref(u);d.locator=new N({href:u,type:g.type||"application/xhtml+xml",text:new Q({highlight:d.text})})}}this.listeners.textSelected(d);break}case"decoration_activated":{this._handleDecorationActivated(t)&&(this._decorationActivationConsumed=!0);break}case"click":case"tap":if(this._decorationActivationConsumed){this._decorationActivationConsumed=!1;break}const o=t;if(o.interactiveElement){const d=new DOMParser().parseFromString(o.interactiveElement,"text/html").body.children[0];if(d.nodeType===d.ELEMENT_NODE&&d.nodeName==="A"&&d.hasAttribute("href")){const c=d.attributes.getNamedItem("href")?.value;if(c.startsWith("#"))this.go(this.currentLocation.copyWithLocations({fragments:[c.substring(1)]}),!1,()=>{});else if(c.startsWith("http://")||c.startsWith("https://")||c.startsWith("mailto:")||c.startsWith("tel:"))this.listeners.handleLocator(new K({href:c}).locator);else try{this.goLink(new K({href:ft.join(ft.dirname(this.currentLocation.href),c)}),!1,()=>{})}catch(h){console.warn(`Couldn't go to link for ${c}: ${h}`),this.listeners.handleLocator(new K({href:c}).locator)}}else console.log("Clicked on",d)}else{if(this._layout===b.fixed&&this.framePool.doNotDisturb&&(o.doNotDisturb=!0),this._layout===b.fixed&&(this.currentProgression===H.rtl||this.currentProgression===H.ltr)&&this.framePool.currentFrames.length>1){const h=this.framePool.currentFrames;o.targetFrameSrc===h[this.currentProgression===H.rtl?0:1]?.source&&(o.x+=(h[this.currentProgression===H.rtl?1:0]?.iframe.contentWindow?.innerWidth??0)*window.devicePixelRatio)}if(e==="click"?this.listeners.click(o):this.listeners.tap(o))break;const c=(this._cframes.length===2?this._cframes[0].window.innerWidth+this._cframes[1].window.innerWidth:this._cframes[0].window.innerWidth)*window.devicePixelRatio/4;o.x>=c&&o.x<=c*3&&this.listeners.miscPointer(1),o.x<c?this.goLeft(!1,()=>{}):o.x>c*3&&this.goRight(!1,()=>{})}break;case"tap_more":this.listeners.miscPointer(t);break;case"no_more":this.changeResource(1);break;case"no_less":this.changeResource(-1);break;case"swipe":break;case"scroll":this.listeners.scroll(t);break;case"zoom":this.listeners.zoom(t);break;case"progress":this.syncLocation(t);break;case"content_protection":const a=t;this.listeners.contentProtection(a.type,a);break;case"context_menu":this.listeners.contextMenu(t);break;case"keyboard_peripherals":const s=t,l={...s,interactiveElement:void 0};s.interactiveElement&&(l.interactiveElement=new DOMParser().parseFromString(s.interactiveElement,"text/html").body.children[0]),this.listeners.peripheral(l);break;case"log":console.log(this._cframes[0]?.source?.split("/")[3],...t);break;default:this.listeners.customEvent(e,t);break}}determineModules(){let e=Array.from(Yt.keys());if(this._layout===b.fixed)return e.filter(i=>mr.includes(i));e=e.filter(i=>pr.includes(i));const t=de(this.pub.metadata);if(t==="cjk-vertical"||t==="mongolian-vertical")return e.filter(i=>i!=="column_snapper"&&i!=="scroll_snapper");const n=e;return this._layout===b.scrolled?e=n.filter(i=>i!=="column_snapper"&&i!=="cjk_vertical_snapper"):e=n.filter(i=>i!=="scroll_snapper"&&i!=="cjk_vertical_snapper"),e}attachListener(){const e=this._cframes.filter(t=>!!t);if(e.length===0)throw Error("no cframe to attach listener to");e.forEach(t=>{t.msg&&(t.msg.listener=(n,i)=>{this.eventListener(n,i,t)})}),this._reapplyDecorationsToCurrentFrames()}async apply(){if(await this.framePool.update(this.pub,this.currentLocator,this.determineModules()),this.attachListener(),this.pub.readingOrder.findIndexWithHref(this.currentLocation.href)<0)throw Error("Link for "+this.currentLocation.href+" not found!")}supportsDecorationStyle(e){return Qt.has(e)||!!this._decoratorConfig.decorationTemplates?.[e]}registerDecorationObserver(e,t){this._decorationObservers.has(e)||this._decorationObservers.set(e,new Set),this._decorationObservers.get(e).add(t),this._decorationActivationState.set(e,!0),this._sendDecorationActivationToFrames(e,!0)}unregisterDecorationObserver(e){this._decorationObservers.forEach((t,n)=>{t.has(e)&&(t.delete(e),t.size===0&&(this._decorationActivationState.delete(n),this._sendDecorationActivationToFrames(n,!1)))})}_sendDecorationActivationToFrames(e,t){this._cframes.filter(i=>!!i).forEach(i=>{i.msg&&i.msg.send("decoration_activatable",{group:e,activatable:t})})}applyDecorations(e,t){const n=this._decorations.get(t)??[],i=new Map(n.map(c=>[c.id,c])),o=new Map(e.map(c=>[c.id,c])),a=[],s=[],l=[];for(const[c,h]of i)o.has(c)?Zt(h,o.get(c))||l.push(o.get(c)):a.push(c);for(const[c,h]of o)i.has(c)||s.push(h);this._decorations.set(t,e),this._sendDecorationOps(t,a,s,l,n);const d=this._decorationActivationState.get(t);d!==void 0&&this._sendDecorationActivationToFrames(t,d)}_sendDecorationOps(e,t,n,i,o){const a=this._cframes.filter(d=>!!d),s=new Map(o.map(d=>[d.id,d])),l=this.viewport.readingOrder;a.forEach((d,c)=>{if(!d.msg)return;const h=l[c];if(h){for(const u of t){const g=s.get(u);!g||g.locator.href!==h||d.msg.send("decorate",{group:e,action:"remove",decoration:{id:u}})}for(const u of n)u.locator.href===h&&d.msg.send("decorate",{group:e,action:"add",decoration:he(u,this._decoratorConfig.decorationTemplates)});for(const u of i)u.locator.href===h&&d.msg.send("decorate",{group:e,action:"update",decoration:he(u,this._decoratorConfig.decorationTemplates)})}})}_reapplyDecorationsToFrame(e,t){if(e.msg){for(const[n,i]of this._decorations){const o=i.filter(a=>a.locator.href===t);if(o.length!==0){e.msg.send("decorate",{group:n,action:"clear"});for(const a of o)e.msg.send("decorate",{group:n,action:"add",decoration:he(a,this._decoratorConfig.decorationTemplates)})}}for(const[n,i]of this._decorationActivationState)e.msg.send("decoration_activatable",{group:n,activatable:i})}}_reapplyDecorationsToCurrentFrames(){const e=this._cframes.filter(n=>!!n),t=this.viewport.readingOrder;e.forEach((n,i)=>{const o=t[i];o&&this._reapplyDecorationsToFrame(n,o)})}_handleDecorationActivated(e){const t=this._decorationObservers.get(e.group);if(!t||t.size===0)return!1;const n=(this._decorations.get(e.group)??[]).find(a=>a.id===e.decorationId);if(!n)return!1;const i={decoration:n,group:e.group,rect:e.rect,point:e.point};let o=!1;for(const a of t)a.onDecorationActivated(i)&&(o=!0);return o}async destroy(){this._suspiciousActivityListener&&window.removeEventListener(ge,this._suspiciousActivityListener),this._keyboardPeripheralListener&&window.removeEventListener(fe,this._keyboardPeripheralListener),this._navigatorProtector?.destroy(),this._keyboardPeripheralsManager?.destroy(),await this.framePool?.destroy(),this._decorations.clear(),this._decorationObservers.clear(),this._decorationActivationState.clear()}async changeResource(e){if(e===0)return!1;if(this._layout===b.fixed){const i=this.framePool,o=i.viewport.positions[0];if(e===1){if(!i.next(i.perPage))return!1}else if(e===-1){if(!i.prev(i.perPage))return!1}else throw Error("Invalid relative value for FXL");const a=i.viewport.positions[0];if(o>a){for(let s=this.positions.length-1;s>=0;s--)if(this.positions[s].href===this.pub.readingOrder.items[a-1].href){this.currentLocation=this.positions[s].copyWithLocations({progression:.999999999999});break}}else if(o<a){for(let s=0;s<this.positions.length;s++)if(this.positions[s].href===this.pub.readingOrder.items[a-1].href){this.currentLocation=this.positions[s];break}}return await this.apply(),this.listeners.positionChanged(this.currentLocation),!0}const t=this.pub.readingOrder.findIndexWithHref(this.currentLocation.href),n=Math.max(0,Math.min(this.pub.readingOrder.items.length-1,t+e));if(n===t)return this._cframes[0]?.msg?.send("shake",void 0,async i=>{}),!1;if(t>n){for(let i=this.positions.length-1;i>=0;i--)if(this.positions[i].href===this.pub.readingOrder.items[n].href){this.currentLocation=this.positions[i].copyWithLocations({progression:.999999999999});break}}else for(let i=0;i<this.positions.length;i++)if(this.positions[i].href===this.pub.readingOrder.items[n].href){this.currentLocation=this.positions[i];break}return await this.apply(),!0}findLastPositionInProgressionRange(e,t){const n=e.findLastIndex(i=>{const o=i.locations.progression;return!!(o&&o>t.start&&o<=t.end)});return n!==-1?e[n]:void 0}findNearestPositions(e){const t=this.positions.filter(a=>a.href===this.currentLocation.href);let n=this.currentLocation,i;const o=t.findLastIndex(a=>(a.locations.progression??0)<=e.start);if(o!==-1){n=t[o];const a=t.slice(o+1);i=this.findLastPositionInProgressionRange(a,e)}return{first:n,last:i}}updateViewport(e){this.reflowViewport.readingOrder=[],this.reflowViewport.progressions.clear(),this.reflowViewport.positions=null,this.currentLocation&&(this.reflowViewport.readingOrder.push(this.currentLocation.href),this.reflowViewport.progressions.set(this.currentLocation.href,e),this.currentLocation.locations?.position!==void 0&&(this.reflowViewport.positions=[this.currentLocation.locations.position],this.lastLocationInView?.locations?.position!==void 0&&this.reflowViewport.positions.push(this.lastLocationInView.locations.position)))}async syncLocation(e){const t=e,n=this.findNearestPositions(t);this.currentLocation=n.first.copyWithLocations({progression:t.start}),this.lastLocationInView=n.last,this.updateViewport(t),this.listeners.positionChanged(this.currentLocation),await this.framePool.update(this.pub,this.currentLocation,this.determineModules())}goBackward(e,t){if(this._isNavigating){t(!1);return}this._isNavigating=!0,this._layout===b.fixed?this.changeResource(-1).then(n=>{this._isNavigating=!1,t(n)}):this._cframes[0]?.msg?.send("go_prev",void 0,async n=>{if(n)this._isNavigating=!1,t(!0);else{const i=await this.changeResource(-1);this._isNavigating=!1,t(i)}})}goForward(e,t){if(this._isNavigating){t(!1);return}this._isNavigating=!0,this._layout===b.fixed?this.changeResource(1).then(n=>{this._isNavigating=!1,t(n)}):this._cframes[0]?.msg?.send("go_next",void 0,async n=>{if(n)this._isNavigating=!1,t(!0);else{const i=await this.changeResource(1);this._isNavigating=!1,t(i)}})}get currentLocator(){return this.currentLocation}get viewport(){return this._layout===b.fixed?this.framePool?this.framePool.viewport:{readingOrder:[],progressions:new Map,positions:null}:this.reflowViewport}get isScrollStart(){const e=this.viewport.readingOrder[0];return this.viewport.progressions.get(e)?.start===0}get isScrollEnd(){const e=this.viewport.readingOrder[this.viewport.readingOrder.length-1];return this.viewport.progressions.get(e)?.end===1}get canGoBackward(){const e=this.pub.readingOrder.items[0]?.href;return!(this.viewport.progressions.has(e)&&this.viewport.progressions.get(e)?.start===0)}get canGoForward(){const e=this.pub.readingOrder.items[this.pub.readingOrder.items.length-1]?.href;return!(this.viewport.progressions.has(e)&&this.viewport.progressions.get(e)?.end===1)}get readingProgression(){return this.currentProgression}async setLayout(e){this._layout!==e&&(this._layout=e,await this.framePool.update(this.pub,this.currentLocator,this.determineModules(),!0),this.attachListener())}get publication(){return this.pub}async loadLocator(e,t){let n=!1,i=typeof e.locations.getCssSelector=="function"&&e.locations.getCssSelector();if(e.text?.highlight?n=await new Promise((l,d)=>{this._cframes[0].msg.send("go_text",i?[e.text?.serialize(),i]:e.text?.serialize(),c=>l(c))}):i&&(n=await new Promise((l,d)=>{this._cframes[0].msg.send("go_text",["",i],c=>l(c))})),n){t(n);return}const o=typeof e.locations.htmlId=="function"&&e.locations.htmlId();if(o&&(n=await new Promise((l,d)=>{this._cframes[0].msg.send("go_id",o,c=>l(c))})),n){t(n);return}const a=e?.locations?.progression;a&&a>0?n=await new Promise((l,d)=>{this._cframes[0].msg.send("go_progression",a,c=>l(c))}):n=!0,t(n)}go(e,t,n){const i=e.href.split("#")[0];let o=this.pub.readingOrder.findWithHref(i);if(!o)return n(this.listeners.handleLocator(e));if(this._isNavigating){n(!1);return}this._isNavigating=!0,this.currentLocation=this.positions.find(a=>a.href===o.href),this.apply().then(()=>this.loadLocator(e,a=>{this._isNavigating=!1,n(a)})).then(()=>{this.attachListener()})}goLink(e,t,n){return this.go(e.locator,t,n)}}const na=`// PreservePitchProcessor.js
// AudioWorklet processor for pitch preservation via pitch shifting.
//
// Architecture:
//   - Overlap-add (OLA) phase vocoder with an iterative in-place Cooley-Tukey FFT/IFFT.
//   - All intermediate buffers are pre-allocated in the constructor; the hot path
//     (process → _processBuffer → _fft) is allocation-free and GC-safe.
//   - An output ring buffer decouples OLA processing (fires every hopSize input
//     samples) from the Web Audio render quantum (128 frames), so process() always
//     fills outputChannel completely.

class PreservePitchProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize  = 1024;
    this.hopSize     = 256;
    this.overlap     = this.bufferSize - this.hopSize;
    this.pitchFactor = 1.0;

    // Sliding input window (always holds the last bufferSize samples)
    this.inputBuffer = new Float32Array(this.bufferSize);
    this.inputFill   = 0;   // samples loaded during startup (saturates at bufferSize)
    this.hopAccum    = 0;   // new samples since last OLA step; triggers a step at hopSize

    // OLA output accumulator: overlap-add results accumulate here; hopSize samples
    // are drained to the ring buffer and the remainder shifts down each OLA step.
    this.olaBuffer = new Float32Array(this.bufferSize);

    // Output FIFO ring buffer — power-of-2 size for allocation-free modulo wrapping.
    this._ringSize  = 4096;
    this._ring      = new Float32Array(this._ringSize);
    this._ringMask  = this._ringSize - 1;
    this._ringWrite = 0;
    this._ringRead  = 0;
    this._ringAvail = 0;

    // Hann window (pre-computed, never mutated)
    this.window = new Float32Array(this.bufferSize);
    for (let i = 0; i < this.bufferSize; i++) {
      this.window[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / this.bufferSize));
    }

    // Pre-allocated FFT work buffers — never re-created in the hot path
    this._re        = new Float64Array(this.bufferSize);
    this._im        = new Float64Array(this.bufferSize);
    this._shiftedRe = new Float64Array(this.bufferSize);
    this._shiftedIm = new Float64Array(this.bufferSize);

    this.port.onmessage = (event) => {
      if (event.data.type === 'setPitchFactor') {
        this.pitchFactor = event.data.factor;
      }
    };
  }

  process(inputs, outputs) {
    const input  = inputs[0];
    const output = outputs[0];
    if (!input || !output) return true;
    const inCh  = input[0];
    const outCh = output[0];
    if (!inCh || !outCh) return true;

    const newCount = inCh.length; // always 128 under normal Web Audio conditions

    // --- 1. Push new samples into the sliding input window ---
    if (this.inputFill < this.bufferSize) {
      // Startup: fill the window until we have a full bufferSize frame.
      // Since bufferSize (1024) is an exact multiple of the render quantum (128)
      // this branch always copies exactly newCount samples.
      this.inputBuffer.set(inCh, this.inputFill);
      this.inputFill += newCount;
    } else {
      // Steady state: slide left by newCount, append the new quantum at the end.
      this.inputBuffer.copyWithin(0, newCount);
      this.inputBuffer.set(inCh, this.bufferSize - newCount);
    }
    this.hopAccum += newCount;

    // --- 2. Run OLA step(s) whenever hopAccum reaches hopSize ---
    // During startup we skip processing until a full window is available.
    while (this.inputFill >= this.bufferSize && this.hopAccum >= this.hopSize) {
      this.hopAccum -= this.hopSize;
      this._processBuffer(); // drains hopSize samples into _ring
    }

    // --- 3. Drain output ring into outputChannel ---
    // Output silence during the initial buffering latency (bufferSize samples ≈ 23 ms
    // at 44100 Hz).  Once the ring has data it stays ahead of demand.
    if (this._ringAvail >= newCount) {
      for (let i = 0; i < newCount; i++) {
        outCh[i] = this._ring[this._ringRead];
        this._ringRead = (this._ringRead + 1) & this._ringMask;
      }
      this._ringAvail -= newCount;
    } else {
      outCh.fill(0);
    }

    return true;
  }

  _processBuffer() {
    const N         = this.bufferSize;
    const re        = this._re;
    const im        = this._im;
    const shiftedRe = this._shiftedRe;
    const shiftedIm = this._shiftedIm;
    const win       = this.window;

    // Load windowed input into real part; zero imaginary part
    for (let i = 0; i < N; i++) {
      re[i] = this.inputBuffer[i] * win[i];
      im[i] = 0;
    }

    this._fft(re, im, false);

    // Spectral pitch shift: map bin k → round(k * factor)
    shiftedRe.fill(0);
    shiftedIm.fill(0);
    const half   = N >> 1;
    const factor = this.pitchFactor;
    for (let k = 0; k <= half; k++) {
      const newK = Math.round(k * factor);
      if (newK <= half) {
        shiftedRe[newK] += re[k];
        shiftedIm[newK] += im[k];
        // Restore conjugate symmetry so the IFFT yields a real-valued signal
        if (newK > 0 && newK < half) {
          shiftedRe[N - newK] =  shiftedRe[newK];
          shiftedIm[N - newK] = -shiftedIm[newK];
        }
      }
    }

    this._fft(shiftedRe, shiftedIm, true); // in-place IFFT

    // Overlap-add into olaBuffer
    for (let i = 0; i < N; i++) {
      this.olaBuffer[i] += shiftedRe[i] * win[i];
    }

    // Push hopSize output samples to the ring buffer
    for (let i = 0; i < this.hopSize; i++) {
      this._ring[this._ringWrite] = this.olaBuffer[i];
      this._ringWrite = (this._ringWrite + 1) & this._ringMask;
    }
    this._ringAvail += this.hopSize;

    // Shift the OLA accumulator left by hopSize; clear the vacated tail
    this.olaBuffer.copyWithin(0, this.hopSize);
    this.olaBuffer.fill(0, this.bufferSize - this.hopSize);
  }

  /**
   * In-place iterative Cooley-Tukey FFT / IFFT.
   * Operates entirely on the caller-supplied Float64Arrays — no allocation.
   *
   * @param {Float64Array} re      Real parts (mutated in place)
   * @param {Float64Array} im      Imaginary parts (mutated in place)
   * @param {boolean}      inverse true → IFFT (divides by N), false → FFT
   */
  _fft(re, im, inverse) {
    const N = re.length;

    // Bit-reversal permutation
    let j = 0;
    for (let i = 1; i < N; i++) {
      let bit = N >> 1;
      for (; j & bit; bit >>= 1) j ^= bit;
      j ^= bit;
      if (i < j) {
        let tmp;
        tmp = re[i]; re[i] = re[j]; re[j] = tmp;
        tmp = im[i]; im[i] = im[j]; im[j] = tmp;
      }
    }

    // Butterfly stages — O(N log N), no allocation
    const sign = inverse ? 1 : -1;
    for (let len = 2; len <= N; len <<= 1) {
      const halfLen = len >> 1;
      const ang     = sign * Math.PI / halfLen;
      const wBaseRe = Math.cos(ang);
      const wBaseIm = Math.sin(ang);
      for (let i = 0; i < N; i += len) {
        let wRe = 1, wIm = 0;
        for (let k = 0; k < halfLen; k++) {
          const uRe = re[i + k];
          const uIm = im[i + k];
          const vRe = re[i + k + halfLen] * wRe - im[i + k + halfLen] * wIm;
          const vIm = re[i + k + halfLen] * wIm + im[i + k + halfLen] * wRe;
          re[i + k]           = uRe + vRe;
          im[i + k]           = uIm + vIm;
          re[i + k + halfLen] = uRe - vRe;
          im[i + k + halfLen] = uIm - vIm;
          const newWRe = wRe * wBaseRe - wIm * wBaseIm;
          wIm = wRe * wBaseIm + wIm * wBaseRe;
          wRe = newWRe;
        }
      }
    }

    if (inverse) {
      for (let i = 0; i < N; i++) {
        re[i] /= N;
        im[i] /= N;
      }
    }
  }
}

registerProcessor('preserve-pitch-processor', PreservePitchProcessor);
`;class Sn{constructor(e){this.workletNode=null,this.url=null,this.ctx=e}static async createWorklet(e){const{ctx:t,pitchFactor:n,modulePath:i}=e,o=new Sn(t);try{if(i)await t.audioWorklet.addModule(i);else{const a=new Blob([na],{type:"text/javascript"});o.url=URL.createObjectURL(a),await t.audioWorklet.addModule(o.url)}}catch(a){throw o.destroy(),new Error(`Error adding module: ${a}`)}try{o.workletNode=new AudioWorkletNode(t,"preserve-pitch-processor"),n&&o.updatePitchFactor(n)}catch(a){throw o.destroy(),new Error(`Error creating worklet node: ${a}`)}return o}updatePitchFactor(e){this.workletNode&&this.workletNode.port.postMessage({type:"setPitchFactor",factor:e})}destroy(){this.workletNode&&(this.workletNode.disconnect(),this.workletNode=null),this.url&&(URL.revokeObjectURL(this.url),this.url=null)}}class io{constructor(e){this.audioContext=null,this.sourceNode=null,this.gainNode=null,this.listeners={},this.isMutedValue=!1,this.isPlayingValue=!1,this.isPausedValue=!1,this.isLoadingValue=!1,this.isLoadedValue=!1,this.isEndedValue=!1,this.isStoppedValue=!1,this.worklet=null,this.webAudioActive=!1,this.boundOnCanPlayThrough=this.onCanPlayThrough.bind(this),this.boundOnTimeUpdate=this.onTimeUpdate.bind(this),this.boundOnError=this.onError.bind(this),this.boundOnEnded=this.onEnded.bind(this),this.boundOnStalled=this.onStalled.bind(this),this.boundOnEmptied=this.onEmptied.bind(this),this.boundOnSuspend=this.onSuspend.bind(this),this.boundOnWaiting=this.onWaiting.bind(this),this.boundOnLoadedMetadata=this.onLoadedMetadata.bind(this),this.boundOnSeeking=this.onSeeking.bind(this),this.boundOnSeeked=this.onSeeked.bind(this),this.boundOnPlay=this.onPlay.bind(this),this.boundOnPlaying=this.onPlaying.bind(this),this.boundOnPause=this.onPause.bind(this),this.boundOnProgress=this.onProgress.bind(this),this.playback=e.playback,this.mediaElement=document.createElement("audio"),this.mediaElement.addEventListener("canplaythrough",this.boundOnCanPlayThrough),this.mediaElement.addEventListener("timeupdate",this.boundOnTimeUpdate),this.mediaElement.addEventListener("error",this.boundOnError),this.mediaElement.addEventListener("ended",this.boundOnEnded),this.mediaElement.addEventListener("stalled",this.boundOnStalled),this.mediaElement.addEventListener("emptied",this.boundOnEmptied),this.mediaElement.addEventListener("suspend",this.boundOnSuspend),this.mediaElement.addEventListener("waiting",this.boundOnWaiting),this.mediaElement.addEventListener("loadedmetadata",this.boundOnLoadedMetadata),this.mediaElement.addEventListener("seeking",this.boundOnSeeking),this.mediaElement.addEventListener("seeked",this.boundOnSeeked),this.mediaElement.addEventListener("play",this.boundOnPlay),this.mediaElement.addEventListener("playing",this.boundOnPlaying),this.mediaElement.addEventListener("pause",this.boundOnPause),this.mediaElement.addEventListener("progress",this.boundOnProgress),this.mediaElement.currentTime=this.playback.state.currentTime}on(e,t){this.listeners[e]||(this.listeners[e]=[]),this.listeners[e].push(t)}off(e,t){this.listeners[e]&&(this.listeners[e]=this.listeners[e].filter(n=>n!==t))}async ensureAudioContextRunning(){this.audioContext||(this.audioContext=new AudioContext),this.audioContext.state==="suspended"&&await this.audioContext.resume()}getOrCreateAudioContext(){return this.audioContext||(this.audioContext=new AudioContext),this.audioContext}onTimeUpdate(){this.emit("timeupdate",this.mediaElement.currentTime)}onCanPlayThrough(){this.isLoadingValue=!1,this.isLoadedValue=!0,this.emit("canplaythrough",null)}onError(){console.error("Error loading media element"),this.emit("error",this.mediaElement.error)}onEnded(){this.isPlayingValue=!1,this.isPausedValue=!1,this.isEndedValue=!0,this.emit("ended",null)}onStalled(e){this.emit("stalled",e)}onEmptied(e){this.emit("emptied",e)}onSuspend(e){this.emit("suspend",e)}onWaiting(e){this.emit("waiting",e)}onLoadedMetadata(e){this.emit("loadedmetadata",e)}onSeeking(e){this.emit("seeking",e)}onSeeked(e){this.emit("seeked",e)}onPlay(){this.emit("play",null)}onPlaying(){this.emit("playing",null)}onPause(){this.emit("pause",null)}onProgress(){this.emit("progress",this.mediaElement.seekable)}emit(e,t){this.listeners[e]&&this.listeners[e].forEach(n=>n(t))}async play(){if(!this.isPlayingValue)try{this.audioContext&&await this.ensureAudioContextRunning(),await this.mediaElement.play(),this.isPlayingValue=!0,this.isPausedValue=!1,this.isStoppedValue=!1}catch(e){if(e?.name==="AbortError")return;console.error("error trying to play media element",e),this.emit("error",e)}}pause(){this.mediaElement.pause(),this.isPlayingValue=!1,this.isPausedValue=!0}stop(){this.mediaElement.pause(),this.mediaElement.currentTime=0,this.isPlayingValue=!1,this.isPausedValue=!1,this.isStoppedValue=!0}setVolume(e){const t=Math.max(0,Math.min(1,e));this.gainNode?(this.mediaElement.volume=1,this.gainNode.gain.value=t):this.mediaElement.volume=t,this.isMutedValue=t===0}skip(e){const t=this.mediaElement.duration;if(!isFinite(t))return;const n=this.mediaElement.currentTime+e;n<0?this.mediaElement.currentTime=0:n>t?this.mediaElement.currentTime=t:this.mediaElement.currentTime=n}currentTime(){return this.mediaElement.currentTime}duration(){return this.mediaElement.duration}isPlaying(){return this.isPlayingValue}isPaused(){return this.isPausedValue}isStopped(){return this.isStoppedValue}isLoading(){return this.isLoadingValue}isLoaded(){return this.isLoadedValue}isEnded(){return this.isEndedValue}isMuted(){return this.isMutedValue}setPlaybackRate(e,t){this.mediaElement.playbackRate=e,t?"preservesPitch"in this.mediaElement?this.mediaElement.preservesPitch=!0:this.activateWebAudio().then(()=>{this.worklet?this.worklet.updatePitchFactor(1/e):Sn.createWorklet({ctx:this.getOrCreateAudioContext(),pitchFactor:1}).then(n=>{this.sourceNode&&this.sourceNode.disconnect(),this.worklet=n,this.sourceNode?.connect(this.worklet.workletNode),this.worklet.workletNode.connect(this.gainNode),this.worklet.updatePitchFactor(1/e)}).catch(n=>{console.warn("Failed to create preserve pitch worklet",n)})}).catch(n=>{console.warn("Web Audio unavailable, playing without pitch correction:",n)}):("preservesPitch"in this.mediaElement&&(this.mediaElement.preservesPitch=!1),this.worklet&&(this.worklet.destroy(),this.worklet=null,this.webAudioActive&&this.sourceNode&&(this.sourceNode.disconnect(),this.sourceNode.connect(this.gainNode))))}async activateWebAudio(){if(this.webAudioActive)return;const e=this.mediaElement.src;if(!e)return;const t=this.mediaElement.currentTime,n=this.isPlayingValue;n&&(this.mediaElement.pause(),this.isPlayingValue=!1),this.mediaElement.crossOrigin="anonymous",this.mediaElement.src=e,this.mediaElement.load();try{await new Promise((o,a)=>{const s=()=>{this.mediaElement.removeEventListener("canplaythrough",s),this.mediaElement.removeEventListener("error",l),o()},l=()=>{this.mediaElement.removeEventListener("canplaythrough",s),this.mediaElement.removeEventListener("error",l),a(new Error("Audio reload with CORS failed — server may not send Access-Control-Allow-Origin"))};this.mediaElement.addEventListener("canplaythrough",s),this.mediaElement.addEventListener("error",l)})}catch(o){throw this.mediaElement.removeAttribute("crossorigin"),this.mediaElement.src=e,this.mediaElement.load(),n?(await new Promise(a=>{const s=()=>{this.mediaElement.removeEventListener("canplaythrough",s),a()};this.mediaElement.addEventListener("canplaythrough",s)}),this.mediaElement.currentTime=t,await this.mediaElement.play(),this.isPlayingValue=!0,this.isPausedValue=!1):this.mediaElement.currentTime=t,o}this.mediaElement.currentTime=t,this.sourceNode=new MediaElementAudioSourceNode(this.getOrCreateAudioContext(),{mediaElement:this.mediaElement});const i=this.getOrCreateAudioContext();this.gainNode=i.createGain(),this.gainNode.gain.value=this.mediaElement.volume,this.mediaElement.volume=1,this.sourceNode.connect(this.gainNode),this.gainNode.connect(i.destination),this.webAudioActive=!0,n&&(await this.ensureAudioContextRunning(),await this.mediaElement.play(),this.isPlayingValue=!0,this.isPausedValue=!1)}get isWebAudioActive(){return this.webAudioActive}tearDownWebAudio(){this.worklet&&(this.worklet.destroy(),this.worklet=null),this.sourceNode&&(this.sourceNode.disconnect(),this.sourceNode=null),this.gainNode&&(this.mediaElement.volume=this.gainNode.gain.value,this.gainNode.disconnect(),this.gainNode=null),this.webAudioActive=!1}changeSrc(e){if(this.mediaElement.src!==e)if(this.mediaElement.pause(),this.isPlayingValue=!1,this.isPausedValue=!1,this.isLoadedValue=!1,this.isLoadingValue=!0,this.isEndedValue=!1,this.webAudioActive){this.mediaElement.crossOrigin="anonymous",this.mediaElement.src=e,this.mediaElement.load();const t=()=>{i()},n=()=>{i(),console.warn("CORS reload failed for new track — disabling Web Audio graph:",e),this.tearDownWebAudio(),this.mediaElement.removeAttribute("crossorigin"),this.mediaElement.src=e,this.mediaElement.load()},i=()=>{this.mediaElement.removeEventListener("canplaythrough",t),this.mediaElement.removeEventListener("error",n)};this.mediaElement.addEventListener("canplaythrough",t),this.mediaElement.addEventListener("error",n)}else this.mediaElement.src=e,this.mediaElement.load()}getMediaElement(){return this.mediaElement}}class et{constructor(e={}){this.volume=I(e.volume,Xe.range),this.playbackRate=I(e.playbackRate,Ye.range),this.preservePitch=P(e.preservePitch),this.skipBackwardInterval=I(e.skipBackwardInterval,oe.range),this.skipForwardInterval=I(e.skipForwardInterval,oe.range),this.pollInterval=w(e.pollInterval),this.autoPlay=P(e.autoPlay),this.enableMediaSession=P(e.enableMediaSession)}merging(e){const t={...this};for(const n of Object.keys(e))e[n]!==void 0&&(t[n]=e[n]);return new et(t)}}class oo{constructor(e={}){this.volume=I(e.volume,Xe.range)??1,this.playbackRate=I(e.playbackRate,Ye.range)??1,this.preservePitch=P(e.preservePitch)??!0,this.skipBackwardInterval=I(e.skipBackwardInterval,oe.range)??10,this.skipForwardInterval=I(e.skipForwardInterval,oe.range)??10,this.pollInterval=w(e.pollInterval)??1e3,this.autoPlay=P(e.autoPlay)??!0,this.enableMediaSession=P(e.enableMediaSession)??!0}}class _n{constructor(e,t){this.volume=e.volume??t.volume,this.playbackRate=e.playbackRate??t.playbackRate,this.preservePitch=e.preservePitch??t.preservePitch,this.skipBackwardInterval=e.skipBackwardInterval??t.skipBackwardInterval,this.skipForwardInterval=e.skipForwardInterval??t.skipForwardInterval,this.pollInterval=e.pollInterval??t.pollInterval,this.autoPlay=e.autoPlay??t.autoPlay,this.enableMediaSession=e.enableMediaSession??t.enableMediaSession}}class bn{constructor(e,t){this.preferences=e,this.settings=t}clear(){this.preferences=new et}updatePreference(e,t){this.preferences[e]=t}get volume(){return new F({initialValue:this.preferences.volume,effectiveValue:this.settings.volume,isEffective:this.preferences.volume!==null,onChange:e=>{this.updatePreference("volume",e??null)},supportedRange:Xe.range,step:Xe.step})}get playbackRate(){return new F({initialValue:this.preferences.playbackRate,effectiveValue:this.settings.playbackRate,isEffective:this.preferences.playbackRate!==null,onChange:e=>{this.updatePreference("playbackRate",e??null)},supportedRange:Ye.range,step:Ye.step})}get preservePitch(){return new T({initialValue:this.preferences.preservePitch,effectiveValue:this.settings.preservePitch,isEffective:this.preferences.preservePitch!==null,onChange:e=>{this.updatePreference("preservePitch",e??null)}})}get skipBackwardInterval(){return new F({initialValue:this.preferences.skipBackwardInterval,effectiveValue:this.settings.skipBackwardInterval,isEffective:this.preferences.skipBackwardInterval!==null,onChange:e=>{this.updatePreference("skipBackwardInterval",e??null)},supportedRange:oe.range,step:oe.step})}get skipForwardInterval(){return new F({initialValue:this.preferences.skipForwardInterval,effectiveValue:this.settings.skipForwardInterval,isEffective:this.preferences.skipForwardInterval!==null,onChange:e=>{this.updatePreference("skipForwardInterval",e??null)},supportedRange:oe.range,step:oe.step})}get pollInterval(){return new U({initialValue:this.preferences.pollInterval,effectiveValue:this.settings.pollInterval,isEffective:this.preferences.pollInterval!==null,onChange:e=>{this.updatePreference("pollInterval",e??null)}})}get autoPlay(){return new T({initialValue:this.preferences.autoPlay,effectiveValue:this.settings.autoPlay,isEffective:this.preferences.autoPlay!==null,onChange:e=>{this.updatePreference("autoPlay",e??null)}})}get enableMediaSession(){return new T({initialValue:this.preferences.enableMediaSession,effectiveValue:this.settings.enableMediaSession,isEffective:this.preferences.enableMediaSession!==null,onChange:e=>{this.updatePreference("enableMediaSession",e??null)}})}}const ro=1,ao=1;class ia{constructor(e,t,n={}){this.pool=new Map,this._audioEngine=e,this._publication=t,this._supportedAudioTypes=this.detectSupportedAudioTypes(),n.disableRemotePlayback&&(this._audioEngine.getMediaElement().disableRemotePlayback=!0)}detectSupportedAudioTypes(){const e=document.createElement("audio"),t=new Set;for(const i of this._publication.readingOrder.items){i.type&&t.add(i.type);for(const o of i.alternates?.items??[])o.type&&t.add(o.type)}const n=new Map;for(const i of t){const o=e.canPlayType(i);o!==""&&n.set(i,o)}return n}pickPlayableHref(e){const t=this._publication.baseURL,n=[e,...e.alternates?.items??[]];let i;for(const o of n){if(!o.type)continue;const a=this._supportedAudioTypes.get(o.type);if(!a)continue;const s=o.toURL(t)??o.href;if(a==="probably")return s;i||(i={href:s,confidence:a})}return i?.href??e.toURL(t)??e.href}get audioEngine(){return this._audioEngine}ensure(e){let t=this.pool.get(e);return t||(t=document.createElement("audio"),t.preload="auto",this._audioEngine.isWebAudioActive&&(t.crossOrigin="anonymous"),t.src=e,t.load(),this.pool.set(e,t)),t}update(e){const t=this._publication.readingOrder.items,n=new Set;for(let i=0;i<t.length;i++){if(i===e)continue;const o=this.pickPlayableHref(t[i]);i>=e-ao&&i<=e+ao?(this.ensure(o),n.add(o)):i>=e-ro&&i<=e+ro&&this.pool.has(o)&&n.add(o)}for(const[i,o]of this.pool)n.has(i)||(o.removeAttribute("src"),o.load(),this.pool.delete(i))}setCurrentAudio(e,t){const n=this.pickPlayableHref(this._publication.readingOrder.items[e]);if(this.audioEngine.changeSrc(n),this.pool.has(n)){const i=this.pool.get(n);i.removeAttribute("src"),i.load(),this.pool.delete(n)}this.update(e)}destroy(){this.audioEngine.stop();for(const[,e]of this.pool)e.removeAttribute("src"),e.load();this.pool.clear()}}class oa{constructor(e={}){this.dragstartHandler=t=>{t.preventDefault(),t.stopPropagation(),e.onDragDetected?.(Array.from(t.dataTransfer?.types??[]))},this.dragoverHandler=t=>{t.preventDefault(),t.stopPropagation()},this.dropHandler=t=>{t.preventDefault(),t.stopPropagation();const n=Array.from(t.dataTransfer?.types??[]),i=t.dataTransfer?.files.length??0;e.onDropDetected?.(n,i)},this.unloadHandler=()=>this.destroy(),document.addEventListener("dragstart",this.dragstartHandler,!0),document.addEventListener("dragover",this.dragoverHandler,!0),document.addEventListener("drop",this.dropHandler,!0),window.addEventListener("unload",this.unloadHandler)}destroy(){document.removeEventListener("dragstart",this.dragstartHandler,!0),document.removeEventListener("dragover",this.dragoverHandler,!0),document.removeEventListener("drop",this.dropHandler,!0),window.removeEventListener("unload",this.unloadHandler)}}class ra{constructor(e={}){this.copyHandler=t=>{t.preventDefault(),t.stopPropagation(),e.onCopyBlocked?.()},this.unloadHandler=()=>this.destroy(),document.addEventListener("copy",this.copyHandler,!0),window.addEventListener("unload",this.unloadHandler)}destroy(){document.removeEventListener("copy",this.copyHandler,!0),window.removeEventListener("unload",this.unloadHandler)}}class aa extends hn{constructor(e={}){super(e),e.disableDragAndDrop&&(this.dragAndDropProtector=new oa({onDragDetected:t=>{this.dispatchSuspiciousActivity("drag_detected",{dataTransferTypes:t,targetFrameSrc:""})},onDropDetected:(t,n)=>{this.dispatchSuspiciousActivity("drop_detected",{dataTransferTypes:t,fileCount:n,targetFrameSrc:""})}})),e.protectCopy&&(this.copyProtector=new ra({onCopyBlocked:()=>{this.dispatchSuspiciousActivity("bulk_copy",{targetFrameSrc:""})}}))}destroy(){super.destroy(),this.dragAndDropProtector?.destroy(),this.copyProtector?.destroy()}}const sa=r=>({trackLoaded:r.trackLoaded??(()=>{}),positionChanged:r.positionChanged??(()=>{}),timelineItemChanged:r.timelineItemChanged??(()=>{}),error:r.error??(()=>{}),trackEnded:r.trackEnded??(()=>{}),play:r.play??(()=>{}),pause:r.pause??(()=>{}),metadataLoaded:r.metadataLoaded??(()=>{}),stalled:r.stalled??(()=>{}),seeking:r.seeking??(()=>{}),seekable:r.seekable??(()=>{}),contentProtection:r.contentProtection??(()=>{}),peripheral:r.peripheral??(()=>{}),contextMenu:r.contextMenu??(()=>{}),remotePlaybackStateChanged:r.remotePlaybackStateChanged??(()=>{})});class la extends bi{constructor(e,t,n,i={preferences:{},defaults:{}}){if(super(),this.positionPollInterval=null,this.navigationId=0,this._playIntent=!1,this._preferencesEditor=null,this._mediaSessionEnabled=!1,this._navigatorProtector=null,this._keyboardPeripheralsManager=null,this._suspiciousActivityListener=null,this._keyboardPeripheralListener=null,this._isNavigating=!1,this._isStalled=!1,this._stalledWatchdog=null,this._stalledCheckTime=0,this.pub=e,this.listeners=sa(t),this._preferences=new et(i.preferences),this._defaults=new oo(i.defaults),this._settings=new _n(this._preferences,this._defaults),e.readingOrder.items.length===0)throw new Error("AudioNavigator: publication has an empty reading order");if(n)this.currentLocation=this.ensureLocatorLocations(n);else{const h=this.pub.readingOrder.items[0];this.currentLocation=new N({href:h.href,type:h.type||"audio/mpeg",title:h.title,locations:new E({position:1,progression:0,totalProgression:0,fragments:["t=0"]})})}const o=this.currentLocation.href.split("#")[0],a=this.hrefToTrackIndex(o);if(a===-1)throw new Error(`AudioNavigator: initial href "${o}" not found in reading order`);const s=this.currentLocation.locations?.time()||0,l=new io({playback:{state:{currentTime:s,duration:0},playWhenReady:!1,index:a}});this.pool=new ia(l,e,i.contentProtection);const d=i.contentProtection||{};this._contentProtection=d;const c=this.mergeKeyboardPeripherals(d,i.keyboardPeripherals||[]);(d.disableContextMenu||d.checkAutomation||d.checkIFrameEmbedding||d.monitorDevTools||d.protectPrinting?.disable||d.disableDragAndDrop||d.protectCopy)&&(this._navigatorProtector=new aa(d),this._suspiciousActivityListener=h=>{const{type:u,...g}=h.detail;u==="context_menu"?this.listeners.contextMenu(g):this.listeners.contentProtection(u,g)},window.addEventListener(ge,this._suspiciousActivityListener)),c.length>0&&(this._keyboardPeripheralsManager=new dn({keyboardPeripherals:c}),this._keyboardPeripheralListener=h=>{this.listeners.peripheral(h.detail)},window.addEventListener(fe,this._keyboardPeripheralListener)),this.setupEventListeners(),this._isNavigating=!0,this.pool.setCurrentAudio(a,"forward"),this.applyPreferences(),this.waitForLoadedAndSeeked(s).then(()=>{this._isNavigating=!1,this.listeners.trackLoaded(this.pool.audioEngine.getMediaElement()),this._notifyTimelineChange(this.currentLocator),this.listeners.positionChanged(this.currentLocator),this._setupRemotePlayback()}).catch(()=>{this._isNavigating=!1})}get settings(){return this._settings}get preferencesEditor(){return this._preferencesEditor===null&&(this._preferencesEditor=new bn(this._preferences,this.settings)),this._preferencesEditor}async submitPreferences(e){this._preferences=this._preferences.merging(e),this.applyPreferences()}applyPreferences(){this._settings=new _n(this._preferences,this._defaults),this._preferencesEditor!==null&&(this._preferencesEditor=new bn(this._preferences,this.settings)),this.pool.audioEngine.setVolume(this._settings.volume),this.pool.audioEngine.setPlaybackRate(this._settings.playbackRate,this._settings.preservePitch),this.positionPollInterval!==null&&this.startPositionPolling(),this._settings.enableMediaSession&&!this._mediaSessionEnabled?(this._mediaSessionEnabled=!0,this.setupMediaSession()):!this._settings.enableMediaSession&&this._mediaSessionEnabled&&(this._mediaSessionEnabled=!1,this.destroyMediaSession())}get publication(){return this.pub}get timeline(){return this.pub.timeline}_notifyTimelineChange(e){const t=this.pub.timeline.locate(e);t!==this._currentTimelineItem&&(this._currentTimelineItem=t,this.listeners.timelineItemChanged(t),this._settings.enableMediaSession&&this.updateMediaSessionMetadata())}ensureLocatorLocations(e){return new N({...e,locations:e.locations instanceof E?e.locations:e.locations?new E(e.locations):void 0})}hrefToTrackIndex(e){const t=e.split("#")[0];return this.pub.readingOrder.items.findIndex(n=>n.href===t)}currentTrackIndex(){return this.hrefToTrackIndex(this.currentLocation.href)}get currentLocator(){return this.currentLocation}get isPlaying(){return this.pool.audioEngine.isPlaying()}get isPaused(){return this.pool.audioEngine.isPaused()}get duration(){return this.pool.audioEngine.duration()}get currentTime(){return this.pool.audioEngine.currentTime()}createLocator(e,t){const n=this.pub.readingOrder.items[e];if(!n)throw new Error(`Invalid track index: ${e}`);const i=this.pool.audioEngine.duration();return new N({href:n.href,type:n.type||"audio/mpeg",title:n.title,locations:new E({progression:i>0?t/i:0,position:e+1,fragments:[`t=${t}`]})})}waitForLoadedAndSeeked(e,t){return new Promise((n,i)=>{const o=()=>{if(t!==void 0&&t!==this.navigationId){n();return}if(e<=0){n();return}const l=()=>{this.pool.audioEngine.off("seeked",l),n()};this.pool.audioEngine.on("seeked",l),this.seek(e)};if(this.pool.audioEngine.isLoaded()){o();return}const a=()=>{this.pool.audioEngine.off("canplaythrough",a),this.pool.audioEngine.off("error",s),o()},s=l=>{this.pool.audioEngine.off("canplaythrough",a),this.pool.audioEngine.off("error",s),i(l)};this.pool.audioEngine.on("canplaythrough",a),this.pool.audioEngine.on("error",s)})}setupEventListeners(){this.pool.audioEngine.on("error",e=>{this.listeners.error(e,this.currentLocator)}),this.pool.audioEngine.on("ended",async()=>{this.stopPositionPolling(),this.currentLocation=this.currentLocation.copyWithLocations(new E({position:this.currentTrackIndex()+1,progression:1,fragments:[`t=${this.duration}`]})),this.listeners.trackEnded(this.currentLocator),this.canGoForward&&(await this.nextTrack(),this._settings.autoPlay&&this.play())}),this.pool.audioEngine.on("play",()=>{this._isNavigating||(this.startPositionPolling(),this.listeners.play(this.currentLocator))}),this.pool.audioEngine.on("playing",()=>{this._isNavigating||this._setStalled(!1)}),this.pool.audioEngine.on("pause",()=>{this._isNavigating||(this.stopPositionPolling(),this.listeners.pause(this.currentLocator))}),this.pool.audioEngine.on("seeked",()=>{if(this._isNavigating)return;this.listeners.seeking(!1);const e=this.currentTime,t=this.duration,n=t>0?e/t:0;this.currentLocation=this.currentLocation.copyWithLocations(new E({position:this.currentTrackIndex()+1,progression:n,fragments:[`t=${e}`]})),this._notifyTimelineChange(this.currentLocation),this.listeners.positionChanged(this.currentLocation)}),this.pool.audioEngine.on("seeking",()=>{this._isNavigating||this.listeners.seeking(!0)}),this.pool.audioEngine.on("waiting",()=>{this._isNavigating||this.listeners.seeking(!0)}),this.pool.audioEngine.on("stalled",()=>{this._isNavigating||this._setStalled(!0)}),this.pool.audioEngine.on("canplaythrough",()=>{this._isNavigating||this._setStalled(!1)}),this.pool.audioEngine.on("progress",e=>{this._isNavigating||this.listeners.seekable(e)}),this.pool.audioEngine.on("loadedmetadata",()=>{const e=this.pool.audioEngine.getMediaElement(),t={duration:this.pool.audioEngine.duration(),textTracks:e.textTracks,readyState:e.readyState,networkState:e.networkState};this.listeners.metadataLoaded(t)})}_setStalled(e){this._isStalled!==e&&(this._isStalled=e,this.listeners.stalled(e),e?(this._stalledCheckTime=this.currentTime,this._startStalledWatchdog()):this._stopStalledWatchdog())}_startStalledWatchdog(){this._stalledWatchdog=setInterval(()=>{if(!this.isPlaying){this._setStalled(!1);return}const e=this.currentTime;e!==this._stalledCheckTime&&this._setStalled(!1),this._stalledCheckTime=e},500)}_stopStalledWatchdog(){this._stalledWatchdog!==null&&(clearInterval(this._stalledWatchdog),this._stalledWatchdog=null)}setupMediaSession(){"mediaSession"in navigator&&(navigator.mediaSession.setActionHandler("play",()=>this.play()),navigator.mediaSession.setActionHandler("pause",()=>this.pause()),navigator.mediaSession.setActionHandler("previoustrack",()=>this.goBackward(!1,()=>{})),navigator.mediaSession.setActionHandler("nexttrack",()=>this.goForward(!1,()=>{})),navigator.mediaSession.setActionHandler("seekbackward",e=>this.jump(-(e.seekOffset||10))),navigator.mediaSession.setActionHandler("seekforward",e=>this.jump(e.seekOffset||10)),this.updateMediaSessionMetadata())}updateMediaSessionMetadata(){if(!("mediaSession"in navigator))return;const e=this.currentTrackIndex(),t=this.pub.readingOrder.items[e],n=this.pub.getCover();navigator.mediaSession.metadata=new MediaMetadata({title:t?.title||`Track ${e+1}`,artist:this.pub.metadata.authors?this.pub.metadata.authors.items.map(i=>i.name.getTranslation()).join(", "):void 0,album:this.pub.metadata.title.getTranslation(),artwork:n?[{src:n.toURL(this.pub.baseURL)??n.href,type:n.type}]:void 0})}startPositionPolling(){this.stopPositionPolling(),this.positionPollInterval=setInterval(()=>{const e=this.currentTime,t=this.duration,n=t>0?e/t:0;this.currentLocation=this.currentLocation.copyWithLocations(new E({position:this.currentTrackIndex()+1,progression:n,fragments:[`t=${e}`]})),this._notifyTimelineChange(this.currentLocation),this.listeners.positionChanged(this.currentLocation)},this._settings.pollInterval)}stopPositionPolling(){this.positionPollInterval!==null&&(clearInterval(this.positionPollInterval),this.positionPollInterval=null)}async go(e,t,n){try{e=this.ensureLocatorLocations(e);const i=e.href.split("#")[0],o=this.hrefToTrackIndex(i),a=e.locations?.time()||0;if(o===-1){n(!1);return}const s=++this.navigationId,l=this.currentTrackIndex(),d=o>=l?"forward":"backward",c=this.isPlaying||this._playIntent;if(this._playIntent=c,this._isNavigating=!0,this.stopPositionPolling(),this.pool.setCurrentAudio(o,d),this.currentLocation=e.copyWithLocations(e.locations),await this.waitForLoadedAndSeeked(a,s),this._isNavigating=!1,s!==this.navigationId){n(!1);return}o!==l&&this.listeners.trackLoaded(this.pool.audioEngine.getMediaElement()),this._notifyTimelineChange(this.currentLocator),this.listeners.positionChanged(this.currentLocator),this._settings.enableMediaSession&&this.updateMediaSessionMetadata(),c&&this.play(),n(!0)}catch(i){this._isNavigating=!1,console.error("Failed to go to locator:",i),n(!1)}finally{this._playIntent=!1}}async goLink(e,t,n){const i=this.hrefToTrackIndex(e.href);if(i===-1){n(!1);return}const o=e.locator.locations?.time()??0,a=this.createLocator(i,o);await this.go(a,t,n)}async goForward(e,t){if(!this.canGoForward){t(!1);return}await this.nextTrack(),t(!0)}async goBackward(e,t){if(!this.canGoBackward){t(!1);return}await this.previousTrack(),t(!0)}play(){this.pool.audioEngine.play()}pause(){this.pool.audioEngine.pause()}stop(){this.pool.audioEngine.stop()}async nextTrack(){if(!this.canGoForward)return;const e=this.createLocator(this.currentTrackIndex()+1,0);await this.go(e,!1,()=>{})}async previousTrack(){if(!this.canGoBackward)return;const e=this.createLocator(this.currentTrackIndex()-1,0);await this.go(e,!1,()=>{})}seek(e){this.pool.audioEngine.skip(e-this.pool.audioEngine.currentTime())}jump(e){this.pool.audioEngine.skip(e)}skipForward(){this.pool.audioEngine.skip(this._settings.skipForwardInterval)}skipBackward(){this.pool.audioEngine.skip(-this._settings.skipBackwardInterval)}get isTrackStart(){return this.currentTrackIndex()===0&&(this.currentLocation.locations?.time()||0)===0}get isTrackEnd(){const e=this.currentTrackIndex();if(e!==this.pub.readingOrder.items.length-1)return!1;const t=this.currentLocation.locations?.progression;if(t!==void 0)return t>=1;const n=this.pub.readingOrder.items[e],i=this.duration||n?.duration||0;return i>0&&(this.currentLocation.locations?.time()??0)>=i}get canGoBackward(){return this.currentTrackIndex()>0}get canGoForward(){return this.currentTrackIndex()<this.pub.readingOrder.items.length-1}get remotePlayback(){const e=this.pool.audioEngine.getMediaElement();return"remote"in e?e.remote:void 0}_setupRemotePlayback(){if(this._contentProtection.disableRemotePlayback)return;const e=this.remotePlayback;e&&(e.onconnecting=()=>this.listeners.remotePlaybackStateChanged("connecting"),e.onconnect=()=>this.listeners.remotePlaybackStateChanged("connected"),e.ondisconnect=()=>this.listeners.remotePlaybackStateChanged("disconnected"))}destroyMediaSession(){"mediaSession"in navigator&&(navigator.mediaSession.metadata=null,navigator.mediaSession.setActionHandler("play",null),navigator.mediaSession.setActionHandler("pause",null),navigator.mediaSession.setActionHandler("previoustrack",null),navigator.mediaSession.setActionHandler("nexttrack",null),navigator.mediaSession.setActionHandler("seekbackward",null),navigator.mediaSession.setActionHandler("seekforward",null))}destroy(){this.stopPositionPolling(),this._stopStalledWatchdog(),this.destroyMediaSession(),this._suspiciousActivityListener&&window.removeEventListener(ge,this._suspiciousActivityListener),this._keyboardPeripheralListener&&window.removeEventListener(fe,this._keyboardPeripheralListener),this._navigatorProtector?.destroy(),this._keyboardPeripheralsManager?.destroy(),this.pool.destroy()}}const ca={oldStyleTf:"'Iowan Old Style', Sitka, 'Sitka Text', Palatino, 'Book Antiqua', 'URW Palladio L', P052, serif"},ha=16,so=ca.oldStyleTf;class Oe{constructor(e){this._optimalLineLength=null,this._canvas=document.createElement("canvas"),this._optimalChars=e.optimalChars,this._minChars=e.minChars,this._maxChars=e.maxChars,this._baseFontSize=e.baseFontSize||ha,this._fontFace=e.fontFace||so,this._sample=e.sample||null,this._padding=e.padding??0,this._letterSpacing=e.letterSpacing?Math.round(e.letterSpacing*this._baseFontSize):0,this._wordSpacing=e.wordSpacing?Math.round(e.wordSpacing*this._baseFontSize):0,this._isCJK=e.isCJK||!1,this._getRelative=e.getRelative||!1,this._minDivider=this._minChars&&this._minChars<this._optimalChars?this._optimalChars/this._minChars:this._minChars===null?null:1,this._maxMultiplier=this._maxChars&&this._maxChars>this._optimalChars?this._maxChars/this._optimalChars:this._maxChars===null?null:1,this._approximatedWordSpaces=Oe.approximateWordSpaces(this._optimalChars,this._sample)}updateMultipliers(){this._minDivider=this._minChars&&this._minChars<this._optimalChars?this._optimalChars/this._minChars:this._minChars===null?null:1,this._maxMultiplier=this._maxChars&&this._maxChars>this._optimalChars?this._maxChars/this._optimalChars:this._maxChars===null?null:1}update(e){e.optimalChars&&(this._optimalChars=e.optimalChars),e.minChars!==void 0&&(this._minChars=e.minChars),e.maxChars!==void 0&&(this._maxChars=e.maxChars),e.baseFontSize&&(this._baseFontSize=e.baseFontSize),e.fontFace!==void 0&&(this._fontFace=e.fontFace||so),e.letterSpacing&&(this._letterSpacing=e.letterSpacing),e.wordSpacing&&(this._wordSpacing=e.wordSpacing),e.isCJK!=null&&(this._isCJK=e.isCJK),e.padding!==void 0&&(this._padding=e.padding??0),e.getRelative&&(this._getRelative=e.getRelative),e.sample&&(this._sample=e.sample,this._approximatedWordSpaces=Oe.approximateWordSpaces(this._optimalChars,this._sample)),this.updateMultipliers(),this._optimalLineLength=this.getOptimalLineLength()}get baseFontSize(){return this._baseFontSize}get minimalLineLength(){return this._optimalLineLength||(this._optimalLineLength=this.getOptimalLineLength()),this._minDivider!==null?Math.round(this._optimalLineLength/this._minDivider+this._padding)/(this._getRelative?this._baseFontSize:1):null}get maximalLineLength(){return this._optimalLineLength||(this._optimalLineLength=this.getOptimalLineLength()),this._maxMultiplier!==null?Math.round(this._optimalLineLength*this._maxMultiplier+this._padding)/(this._getRelative?this._baseFontSize:1):null}get optimalLineLength(){return this._optimalLineLength||(this._optimalLineLength=this.getOptimalLineLength()),Math.round(this._optimalLineLength+this._padding)/(this._getRelative?this._baseFontSize:1)}get all(){return this._optimalLineLength||(this._optimalLineLength=this.getOptimalLineLength()),{min:this.minimalLineLength,max:this.maximalLineLength,optimal:this.optimalLineLength,baseFontSize:this._baseFontSize}}static approximateWordSpaces(e,t){let n=0;if(t&&t.length>=e){const i=t.match(/([\s]+)/gi);n=(i?i.length:0)*(e/t.length)}return n}getLineLengthFallback(){const e=this._letterSpacing*(this._optimalChars-1),t=this._wordSpacing*this._approximatedWordSpaces;return this._optimalChars*(this._baseFontSize*.5)+e+t}getOptimalLineLength(){if(this._fontFace){if(typeof this._fontFace=="string")return this.measureText(this._fontFace);{const e=new FontFace(this._fontFace.name,`url(${this._fontFace.url})`);e.load().then(()=>(document.fonts.add(e),this.measureText(e.family)),t=>{})}}return this.getLineLengthFallback()}measureText(e){const t=this._canvas.getContext("2d");if(t&&e){let n=this._isCJK?"水".repeat(this._optimalChars):"0".repeat(this._optimalChars);if(t.font=`${this._baseFontSize}px ${e}`,this._sample&&this._sample.length>=this._optimalChars&&(n=this._sample.slice(0,this._optimalChars)),Object.hasOwn(t,"letterSpacing")&&Object.hasOwn(t,"wordSpacing"))return t.letterSpacing=this._letterSpacing.toString()+"px",t.wordSpacing=this._wordSpacing.toString()+"px",t.measureText(n).width;{const i=this._letterSpacing*(this._optimalChars-1),o=this._wordSpacing*Oe.approximateWordSpaces(this._optimalChars,this._sample);return t.measureText(n).width+i+o}}else return this.getLineLengthFallback()}}const lo=JSON.parse(`{"format":{"audiobook":"Livre audio","audiobookJSON":"Manifeste de livre audio","cbz":"Bande dessinée","divina":"Bande dessinée Divina","divinaJSON":"Manifeste de bande dessinée Divina","epub":"EPUB","lcpa":"Livre audio protégé par LCP","lcpdf":"PDF protégé par LCP","lcpl":"Licence LCP","pdf":"PDF","rwp":"Publication web Readium","rwpm":"Manifeste de publication web Readium","zab":"Livre audio","zip":"Archive ZIP"},"kind":{"audiobook_many":"livres audio","audiobook_one":"livre audio","audiobook_other":"livres audio","book_many":"livres","book_one":"livre","book_other":"livres","comic_many":"bandes dessinées","comic_one":"bande dessinée","comic_other":"bandes dessinées","document_many":"documents","document_one":"document","document_other":"documents"},"metadata":{"accessibility":{"display-guide":{"accessibility-summary":{"no-metadata":"Aucune information disponible","publisher-contact":"Pour plus d'information à propos de l'accessibilité de cette publication, veuillez contacter l'éditeur : ","title":"Informations d'accessibilité supplémentaires fournies par l'éditeur"},"additional-accessibility-information":{"aria":{"compact":"Information enrichie pour les technologies d'assistances","descriptive":"La structure est enrichi de rôles ARIA afin d'optimiser l'organisation et de faciliter la navigation via les technologies d'assistances"},"audio-descriptions":"Description audio","braille":"Braille","color-not-sole-means-of-conveying-information":"La couleur n'est pas la seule manière de communiquer de l'information","dyslexia-readability":"Lisibilité adapté aux publics dys","full-ruby-annotations":"Annotations complètes au format ruby (langues asiatiques)","high-contrast-between-foreground-and-background-audio":"Contraste sonore amélioré entre les différents plans","high-contrast-between-text-and-background":"Contraste élevé entre le texte et l'arrière-plan","large-print":"Grands caractères","page-breaks":{"compact":"Pagination identique à l'imprimé","descriptive":"Contient une pagination identique à la version imprimée"},"ruby-annotations":"Annotations partielles au format ruby (langues asiatiques)","sign-language":"Langue des signes","tactile-graphics":{"compact":"Graphiques tactiles","descriptive":"Des graphiques tactiles ont été intégrés pour faciliter l'accès des personnes aveugles aux éléments visuels"},"tactile-objects":"Objets 3D ou tactiles","text-to-speech-hinting":"Prononciation améliorée pour la synthèse vocale","title":"Informations complémentaires sur l'accessibilité","ultra-high-contrast-between-text-and-background":"Contraste très élevé entre le texte et l'arrière-plan","visible-page-numbering":"Numérotation de page visible","without-background-sounds":"Aucun bruit de fond"},"conformance":{"a":{"compact":"Cette publication répond aux règles minimales d'accessibilité","descriptive":"La publication indique qu'elle respecte les règles d'accessibilité EPUB et WCAG 2 niveau A"},"aa":{"compact":"Cette publication répond aux règles d'accessibilité reconnues","descriptive":"La publication indique qu'elle respecte les règles d'accessibilité EPUB et WCAG 2 niveau AA"},"aaa":{"compact":"Cette publication dépasse les règles d'accessibilité reconnues","descriptive":"La publication indique qu'elle respecte les règles d'accessibilité EPUB et WCAG 2 niveau AAA"},"certifier":"Accessibilité évaluée par ","certifier-credentials":"L'évaluateur est accrédité par ","details":{"certification-info":"Cette publication a été certifié le","certifier-report":"Pour plus d'information, veuillez consulter le rapport de certification","claim":"Cette publication indique respecter","epub-accessibility-1-0":"EPUB Accessibilité 1.0","epub-accessibility-1-1":"EPUB Accessibilité 1.1","level-a":"Niveau A","level-aa":"Niveau AA","level-aaa":"Niveau AAA","wcag-2-0":{"compact":"WCAG 2.0","descriptive":"Règles pour l’accessibilité des contenus Web (WCAG) 2.0"},"wcag-2-1":{"compact":"WCAG 2.1","descriptive":"Règles pour l’accessibilité des contenus Web (WCAG) 2.1"},"wcag-2-2":{"compact":"WCAG 2.2","descriptive":"Règles pour l’accessibilité des contenus Web (WCAG) 2.2"}},"details-title":"Information détaillée","no":"Aucune information disponible","title":"Règles d'accessibilité","unknown-standard":"Aucune indication concernant les normes d'accessibilité"},"hazards":{"flashing":{"compact":"Flashs lumineux","descriptive":"La publication contient des flashs lumineux qui peuvent provoquer des crises d’épilepsie"},"flashing-none":{"compact":"Pas de flashs lumineux","descriptive":"La publication ne contient pas de flashs lumineux susceptibles de provoquer des crises d’épilepsie"},"flashing-unknown":{"compact":"Pas d'information concernant la présence de flashs lumineux","descriptive":"La présence de flashs lumineux susceptibles de provoquer des crises d’épilepsie n'a pas pu être déterminée"},"motion":{"compact":"Sensations de mouvement","descriptive":"La publication contient des images en mouvement qui peuvent provoquer des nausées, des vertiges et des maux de tête"},"motion-none":{"compact":"Pas de sensations de mouvement","descriptive":"La publication ne contient pas d'images en mouvement qui pourraient provoquer des nausées, des vertiges et des maux de tête"},"motion-unknown":{"compact":"Pas d'information concernant la présence d'images en mouvement","descriptive":"La présence d'images en mouvement susceptibles de provoquer des nausées, des vertiges et des maux de tête n'a pas pu être déterminée"},"no-metadata":"Aucune information disponible","none":{"compact":"Aucun points d'attention","descriptive":"La publication ne présente aucun risque lié à la présence de flashs lumineux, de sensations de mouvement ou de sons"},"sound":{"compact":"Sons","descriptive":"La publication contient des sons qui peuvent causer des troubles de la sensibilité"},"sound-none":{"compact":"Pas de risques sonores","descriptive":"La publication ne contient pas de sons susceptibles de provoquer des troubles de la sensibilité"},"sound-unknown":{"compact":"Pas d'information concernant la présence de sons","descriptive":"La présence de sons susceptibles de causer des troubles de sensibilité n'a pas pu être déterminée"},"title":"Points d'attention","unknown":"La présence de risques est inconnue"},"legal-considerations":{"exempt":{"compact":"Déclare être sous le coup d'une exemption dans certaines juridictions","descriptive":"Cette publication dééclare être sous le coup d'une exemption dans certaines juridictions"},"no-metadata":"Aucune information disponible","title":"Considérations légales"},"navigation":{"index":{"compact":"Index","descriptive":"Index comportant des liens vers les entrées référencées"},"no-metadata":"Aucune information disponible","page-navigation":{"compact":"Aller à la page","descriptive":"Permet d'accéder aux pages de la version source imprimée"},"structural":{"compact":"Titres","descriptive":"Contient des titres pour une navigation structurée"},"title":"Points de repère","toc":{"compact":"Table des matières","descriptive":"Table des matières"}},"rich-content":{"accessible-chemistry-as-latex":{"compact":"Formules chimiques en LaTeX","descriptive":"Formules chimiques en format accessible (LaTeX)"},"accessible-chemistry-as-mathml":{"compact":"Formules chimiques en MathML","descriptive":"Formules chimiques en format accessible (MathML)"},"accessible-math-as-latex":{"compact":"Mathématiques en LaTeX","descriptive":"Formules mathématiques en format accessible (LaTeX)"},"accessible-math-described":"Des descriptions textuelles des formules mathématiques sont fournies","closed-captions":{"compact":"Sous-titres disponibles pour les vidéos","descriptive":"Des sous titres sont disponibles pour les vidéos"},"extended-descriptions":"Les images porteuses d'informations complexes sont décrites par des descriptions longues","math-as-mathml":{"compact":"Mathématiques en MathML","descriptive":"Formules mathématiques en format accessible (MathML)"},"open-captions":{"compact":"Sous-titres incrustés","descriptive":"Des sous titres sont incrustés pour les vidéos"},"title":"Contenus spécifiques","transcript":"Transcriptions fournies","unknown":"Aucune information disponible"},"ways-of-reading":{"nonvisual-reading":{"alt-text":{"compact":"Images décrites","descriptive":"Les images sont décrites par un texte"},"no-metadata":"Aucune information pour la lecture en voix de synthèse ou en braille","none":{"compact":"Non lisible en voix de synthèse ou en braille","descriptive":"Le contenu n'est pas lisible en voix de synthèse ou en braille"},"not-fully":{"compact":"Pas entièrement lisible en voix de synthèse ou en braille","descriptive":"Tous les contenus ne pourront pas être lus à haute voix ou en braille"},"readable":{"compact":"Entièrement lisible en voix de synthèse ou en braille","descriptive":"Tous les contenus peuvent être lus en voix de synthèse ou en braille"}},"prerecorded-audio":{"complementary":{"compact":"Clips audio préenregistrés","descriptive":"Des clips audio préenregistrés sont intégrés au contenu"},"no-metadata":"Aucune information sur les enregistrements audio","only":{"compact":"Audio préenregistré uniquement","descriptive":"Livre audio sans texte alternatif"},"synchronized":{"compact":"Audio préenregistré synchronisé avec du texte","descriptive":"Tous les contenus sont disponibles comme audio préenregistrés synchronisés avec le texte"}},"title":"Lisibilité","visual-adjustments":{"modifiable":{"compact":"L'affichage peut être adapté","descriptive":"L'apparence du texte et la mise en page peuvent être modifiées en fonction des capacités du système de lecture (famille et taille des polices, espaces entre les paragraphes, les phrases, les mots et les lettres, ainsi que la couleur de l'arrière-plan et du texte)"},"unknown":"Aucune information sur les possibilités d'adaptation de l'affichage","unmodifiable":{"compact":"L'affichage ne peut pas être adapté","descriptive":"Le texte et la mise en page ne peuvent pas être adaptés étant donné que l'expérience de lecture est proche de celle de la version imprimée, mais l'application de lecture peut tout de même proposer la capacité de zoomer"}}}}},"altIdentifier_many":"","altIdentifier_one":"identifiant alternatif","altIdentifier_other":"identifiants alternatifs","artist_many":"","artist_one":"artiste","artist_other":"artiste","author_many":"","author_one":"auteur","author_other":"auteurs","collection_many":"","collection_one":"collection éditoriale","collection_other":"collections éditoriales","colorist_many":"","colorist_one":"coloriste","colorist_other":"coloristes","contributor_many":"","contributor_one":"contributeur","contributor_other":"contributeurs","description":"description","duration":"durée","editor_many":"","editor_one":"éditeur","editor_other":"éditeurs","identifier_many":"","identifier_one":"identifiant","identifier_other":"identifiants","illustrator_many":"","illustrator_one":"illustrateur","illustrator_other":"illustrateurs","imprint_many":"","imprint_one":"marque éditoriale","imprint_other":"marques éditoriales","inker_many":"","inker_one":"encreur","inker_other":"encreurs","language_many":"","language_one":"langue","language_other":"langues","letterer_many":"","letterer_one":"lettreur","letterer_other":"lettreurs","modified":"date de modification","narrator_many":"","narrator_one":"narrateur","narrator_other":"narrateurs","numberOfPages":"pagination papier","penciler_many":"","penciler_one":"dessinateur","penciler_other":"dessinateurs","published":"date de publication","publisher_many":"","publisher_one":"éditeur","publisher_other":"éditeurs","series_many":"","series_one":"série","series_other":"séries","subject_many":"","subject_one":"catégorie","subject_other":"catégories","subtitle":"sous-titre","title":"titre","translator_many":"","translator_one":"traducteur","translator_other":"traducteurs"}}`),da=Object.freeze(Object.defineProperty({__proto__:null,default:{publication:lo},publication:lo},Symbol.toStringTag,{value:"Module"})),co={metadata:{accessibility:{"display-guide":{"accessibility-summary":{"no-metadata":"لا تتوفر أي معلومات","publisher-contact":"لمزيد من المعلومات حول إمكانية الوصول إلى هذا المنتج، يُرجى التواصل مع الناشر: ",title:"ملخص إمكانية الوصول"},"additional-accessibility-information":{aria:{compact:"أدوار ARIA مدرَجة",descriptive:"يتم تعزيز المحتوى باستخدام أدوار ARIA لتحسين التنظيم وتيسير التنقّل"},"audio-descriptions":"الوصف الصوتي",braille:"برايل","color-not-sole-means-of-conveying-information":"اللون ليس الوسيلة الوحيدة لنقل المعلومات","dyslexia-readability":"سهولة القراءة لذوي عُسر القراءة","full-ruby-annotations":"شروح روبي كاملة","high-contrast-between-foreground-and-background-audio":"تباين عالٍ بين الصوت الرئيسي وصوت الخلفية","high-contrast-between-text-and-background":"تباين عالٍ بين النص والخلفية","large-print":"خط كبير","page-breaks":{compact:"فواصل الصفحات متضمَّنة",descriptive:"فواصل الصفحات متضمَّنة من المصدر المطبوع الأصلي"},"ruby-annotations":"بعض شروح الروبي","sign-language":"لغة الإشارة","tactile-graphics":{compact:"الرسوم اللمسية مدرجة",descriptive:"تم دمج الرسوم اللمسية لتيسير الوصول إلى العناصر البصرية للأشخاص المكفوفين"},"tactile-objects":"مجسمات لمسية ثلاثية الأبعاد","text-to-speech-hinting":"إرشادات تحويل النص إلى كلام (TTS)متوفرة",title:"معلومات إضافية عن إمكانية الوصول","ultra-high-contrast-between-text-and-background":"تباين عالٍ جدًا بين النص والخلفية","visible-page-numbering":"ترقيم صفحات مرئي","without-background-sounds":"من دون أصوات في خلفية"},conformance:{a:{compact:"هذا المنشور يفي بالمعايير الدنيا لإمكانية الوصول",descriptive:"يحتوي هذا المنشور على بيان مطابقة يفيد بأنه يفي بمعيار إمكانية الوصول في EPUB وبمستوى A من معيار WCAG 2"},aa:{compact:"هذا المنشور يفي بالمعايير المعتمدة لإمكانية الوصول",descriptive:"يحتوي هذا المنشور على بيان مطابقة يفيد بأنه يفي بمعيار إمكانية الوصول في EPUB وبمستوى AA من معيار WCAG 2"},aaa:{compact:"هذا المنشور يفوق المعايير المقبولة لإمكانية الوصول",descriptive:"يحتوي هذا المنشور على بيان مطابقة يفيد بأنه يفي بمعيار إمكانية الوصول في EPUB وبمستوى AAA من معيار WCAG 2"},certifier:"تم اعتماد هذا المنشور من قبل ","certifier-credentials":"بيانات اعتماد جهة التصديق ",details:{"certification-info":"تم اعتماد هذا المنشور في تاريخ ","certifier-report":"لمزيد من المعلومات، يرجى الرجوع إلى تقرير جهة التصديق",claim:"يدّعي هذا المنشور أنه يستوفي","epub-accessibility-1-0":"معيار إمكانية الوصول لـ EPUB إصدار 1.0","epub-accessibility-1-1":"معيار إمكانية الوصول لـ EPUB إصدار 1.1","level-a":"المستوى A","level-aa":"المستوى AA","level-aaa":"المستوى AAA","wcag-2-0":{compact:"WCAG 2.0",descriptive:"مبادئ النفاذ إلى محتوى الويب (WCAG) 2.0"},"wcag-2-1":{compact:"WCAG 2.1",descriptive:"مبادئ النفاذ إلى محتوى الويب (WCAG) 2.1"},"wcag-2-2":{compact:"WCAG 2.2",descriptive:"مبادئ النفاذ إلى محتوى الويب (WCAG) 2.2"}},"details-title":"معلومات تفصيلية عن مدى المطابقة",no:"لا تتوفر أي معلومات",title:"المطابقة","unknown-standard":"لا يمكن التأكد من مدى مطابقة هذا المنشور للمعايير المقبولة لإمكانية الوصول"},hazards:{flashing:{compact:"محتوى وامض",descriptive:"يحتوي هذا المنشور على محتوى وامض قد يسبب نوبات حساسة للضوء"},"flashing-none":{compact:"لا توجد مخاطر وميض",descriptive:"لا يحتوي هذا المنشور على محتوى وامض قد يسبب نوبات حساسة للضوء"},"flashing-unknown":{compact:"مخاطر الوميض غير معروفة",descriptive:"لم يُمكن التأكد من وجود محتوى وامض قد يسبب نوبات حساسية للضوء"},motion:{compact:"محاكاة الحركة",descriptive:"يحتوي المنشور على محاكاة حركة قد تسبّب دوار الحركة"},"motion-none":{compact:"لا توجد مخاطر محاكاة الحركة",descriptive:"لا يحتوي المنشور على محاكاة حركة قد تسبّب دوار الحركة"},"motion-unknown":{compact:"مخاطر محاكاة الحركة غير معروفة",descriptive:"تعذّر تحديد ما إذا كانت هناك محاكاة للحركة قد تُسبب دوار الحركة"},"no-metadata":"لا تتوفر أي معلومات",none:{compact:"لا توجد مخاطر",descriptive:"لا يحتوي المنشور على أي مخاطر"},sound:{compact:"أصوات",descriptive:"يحتوي المنشور على أصوات قد تؤدي إلى مشاكل حساسية صوتية"},"sound-none":{compact:"لا توجد مخاطر صوتية",descriptive:"لا يحتوي المنشور على أصوات قد تؤدي إلى مشاكل حساسية صوتية"},"sound-unknown":{compact:"مخاطر الصوت غير معروفة",descriptive:"تعذّر تحديد ما إذا كانت هناك أصوات قد تُسبب مشكلات في الحساسية"},title:"مخاطر",unknown:"وجود المخاطر غير معروف"},"legal-considerations":{exempt:{compact:"يُعلن عن استثناء من متطلبات إمكانية الوصول من بعض السلطات القضائية",descriptive:"يُصرّح هذا المنشور بوجود استثناء من متطلبات إمكانية الوصول من بعض السلطات القضائية"},"no-metadata":"لا تتوفر أي معلومات",title:"اعتبارات قانونية"},navigation:{index:{compact:"كشاف",descriptive:"كشاف يحتوي على روابط إلى الإدخالات المشار إليها"},"no-metadata":"لا تتوفر أي معلومات","page-navigation":{compact:"الانتقال إلى صفحة",descriptive:"قائمة الصفحات للانتقال إلى صفحات من النسخة المطبوعة الأصلية"},structural:{compact:"العناوين",descriptive:"عناصر مثل العناوين والجداول وغيرها للتنقل المنظّم"},title:"التنقل",toc:{compact:"جدول المحتويات",descriptive:"جدول المحتويات لكل فصول النص عبر روابط"}},"rich-content":{"accessible-chemistry-as-latex":{compact:"الصيغ الكيميائية بصيغة LaTeX",descriptive:"الصيغ الكيميائية بشكل ميسر (LaTeX)"},"accessible-chemistry-as-mathml":{compact:"الصيغ الكيميائية بصيغة MathML",descriptive:"الصيغ الكيميائية بشكل ميسر (MathML)"},"accessible-math-as-latex":{compact:"الرياضيات بصيغة LaTeX",descriptive:"الصيغ الرياضية بشكل ميسر (LaTeX)"},"accessible-math-described":"تتوفر أوصاف نصية للصيغ الرياضية","closed-captions":{compact:"تحتوي الفيديوهات على شروح مغلقة",descriptive:"الفيديوهات الموجودة في المنشورات تحتوي على شروح مغلقة"},"extended-descriptions":"يتم وصف الصور الغنية بالمعلومات بأوصاف مفصّلة","math-as-mathml":{compact:"الرياضيات بصيغة MathML",descriptive:"الصيغ الرياضية بشكل ميسر(MathML)"},"open-captions":{compact:"تحتوي الفيديوهات على شروح مدمجة",descriptive:"الفيديوهات الموجودة في المنشورات تحتوي على شروح مدمجة"},title:"محتوى غني",transcript:"يتوفر نص(نصوص)",unknown:"لا تتوفر أي معلومات"},"ways-of-reading":{"nonvisual-reading":{"alt-text":{compact:"يحتوي على نص بديل",descriptive:"يحتوي على أوصاف نصية بديلة للصور"},"no-metadata":"لا تتوفر معلومات عن القراءة غير البصرية",none:{compact:"غير قابل للقراءة بصوتٍ عالٍ أو بطريقة برايل الديناميكية",descriptive:"المحتوى غير قابل للقراءة بصوتٍ عالٍ أو بطريقة برايل الديناميكية"},"not-fully":{compact:"غير قابل للقراءة بالكامل بصوتٍ عالٍ أو بطريقة برايل الديناميكية",descriptive:"لن يكون كل المحتوى قابلًا للقراءة بصوتٍ عالٍ أو بطريقة برايل الديناميكية"},readable:{compact:"قابل للقراءة بصوتٍ عالٍ أو بطريقة برايل الديناميكية",descriptive:"يمكن قراءة كل المحتوى بصوتٍ عالٍ أو بطريقة برايل الديناميكية"}},"prerecorded-audio":{complementary:{compact:"مقاطع الصوت المسجّلة مسبقًا",descriptive:"مقاطع الصوت المسجّلة مسبقًا مدمجة في المحتوى"},"no-metadata":"لا توجد معلومات عن الصوت المسجّل مسبقًا",only:{compact:"الصوت المسجّل مسبقًا فقط",descriptive:"كتاب صوتي بدون بديل نصي"},synchronized:{compact:"صوت مسجّل مسبقًا متزامن مع النص",descriptive:"كل المحتوى متوفر كصوت مسجّل مسبقًا متزامن مع النص"}},title:"طرق القراءة","visual-adjustments":{modifiable:{compact:"يمكن تعديل المظهر",descriptive:"يمكن تعديل مظهر النص وتخطيط الصفحة وفقاً لإمكانات نظام القراءة (اسم الخط وحجمه، والمسافات بين الفقرات والجمل والكلمات والأحرف، بالإضافة إلى لون الخلفية والنص)"},unknown:"لا توجد معلومات عن إمكانية تعديل المظهر",unmodifiable:{compact:"لا يمكن تعديل المظهر",descriptive:"لا يمكن تعديل مظهر النص وتخطيط الصفحات لأن تجربة القراءة قريبة من النسخة المطبوعة، ولكن تطبيقات القراءة ما زالت تتيح خيارات التكبير"}}}}},altIdentifier_one:"رمز تعريفي بديل",altIdentifier_other:"رموز تعريفية بديلة",artist_one:"فنان",artist_other:"فنانون",author_one:"مؤلف",author_other:"مؤلفون",collection_one:"سلسلة تحريرية",collection_other:"سلاسل تحريرية",colorist_one:"ملوّن الألوان",colorist_other:"ملوّنو الألوان",contributor_one:"مساهم",contributor_other:"مساهمون",description:"وصف",duration:"مدة",editor_one:"محرر",editor_other:"محررون",identifier_one:"رمز تعريفي",identifier_other:"رموز تعريفية",illustrator_one:"رسًام",illustrator_other:"رسامون",imprint_one:"العلامة التجارية للنشر",imprint_other:"العلامات التجارية للنشر",inker_one:"مُحَبِّر",inker_other:"مُحَبِّرون",language_one:"اللغة",language_other:"اللغات",letterer_one:"خطّاط",letterer_other:"خطّاطون",modified:"تاريخ التعديل",narrator_one:"قارئ صوتي",narrator_other:"قرّاء صوتيون",numberOfPages:"عدد الصفحات في النسخة المطبوعة",penciler_one:"رسّام أولي",penciler_other:"رسّامون أوّليون",published:"تاريخ النشر",publisher_one:"ناشر",publisher_other:"ناشرون",series_one:"سلسلة",series_other:"سلاسل",subject_one:"موضوع",subject_other:"مواضيع",subtitle:"عنوان فرعي",title:"العنوان",translator_one:"مترجم",translator_other:"مترجمون"}},ua=Object.freeze(Object.defineProperty({__proto__:null,default:{publication:co},publication:co},Symbol.toStringTag,{value:"Module"})),ho={metadata:{accessibility:{"display-guide":{"accessibility-summary":{"no-metadata":"Ingen information tilgængelig","publisher-contact":"For mere information om tilgængeligheden af denne bog, kontakt venligst udgiveren: ",title:"Tilgængeligheds-oversigt"},"additional-accessibility-information":{aria:{compact:"Indeholder ARIA roller",descriptive:"Indhold forbedres med ARIA-roller for at optimere organisering og gøre navigation lettere"},"audio-descriptions":"Lydbeskrivelser",braille:"Punktskrift (braille)","color-not-sole-means-of-conveying-information":"Information gives ikke udelukkende via farver","dyslexia-readability":"Læsbarhed for ordblinde","full-ruby-annotations":'Indeholder såkalde "ruby" notationer (til asiatiske sprog)',"high-contrast-between-foreground-and-background-audio":"Høj kontrast imellem forgrunds- og baggrunds-lyd","high-contrast-between-text-and-background":"Høj kontrast imellem tekst og baggrunden","large-print":"Forstørret tekst","page-breaks":{compact:"Indeholder sideskift",descriptive:"Indeholder sideskift fra den trykte version af bogen"},"ruby-annotations":'Nogle "ruby" annotationer (til asiatiske sprog)',"sign-language":"Tegnsprog","tactile-graphics":{compact:"Indeholder taktil grafik",descriptive:"Indeholder taktil grafik for at muliggøre adgang til visuel information for blinde"},"tactile-objects":"Taktile 3D objekter","text-to-speech-hinting":"Udtaleforbedringer til syntetisk tale",title:"Yderligere information om tilgængelighed","ultra-high-contrast-between-text-and-background":"Ultra høj kontrast imellem tekst og baggrund","visible-page-numbering":"Synlige sidenumre","without-background-sounds":"Uden baggrundslyd"},conformance:{a:{compact:"Denne bog overholder minimum-tilgængelighedskravene",descriptive:"Denne bog en overensstemmelseserklæring om, at den opfylder EPUB Tilgængelighedskrav og WCAG 2 standarden på niveau A"},aa:{compact:"Denne bog lever op til de accepterede tilgængelighedskrav",descriptive:"Denne bog en overensstemmelseserklæring om, at den opfylder EPUB Tilgængelighedskrav og WCAG 2 standarden på niveau AA"},aaa:{compact:"Denne bog mere end opfylder de accepterede tilgængelighedskrav",descriptive:"Denne bog en overensstemmelseserklæring om, at den opfylder EPUB Tilgængelighedskrav og WCAG 2 standarden på niveau AAA"},certifier:"Denne bog blev certificeret af ","certifier-credentials":"Certificeringsorganets legitimationsoplysninger er ",details:{"certification-info":"Bogen blev certificeret den ","certifier-report":"Se certificeringsorganets rapport for mere information",claim:"Denne bog hævder at opfylde","epub-accessibility-1-0":"EPUB Tilgængelighed 1.0","epub-accessibility-1-1":"EPUB Tilgængelighed 1.1","level-a":"Niveau A","level-aa":"Niveau AA","level-aaa":"Niveau AAA","wcag-2-0":{compact:"WCAG 2.0",descriptive:"Retningslinjer for tilgængeligt webindhold (WCAG) 2.0"},"wcag-2-1":{compact:"WCAG 2.1",descriptive:"Retningslinjer for tilgængeligt webindhold (WCAG) 2.1"},"wcag-2-2":{compact:"WCAG 2.2",descriptive:"Retningslinjer for tilgængeligt webindhold (WCAG) 2.2"}},"details-title":"Detaljeret overholdelses-information",no:"Ingen information tilgængelig",title:"Overholdelse","unknown-standard":"Overholdelse af de accepterede tilgængelighedskrav kan ikke vurderes for denne bog"},hazards:{flashing:{compact:"Blinkende indhold",descriptive:"Bogen indeholder blinkende indhold der kan forårsage epileptiske anfald"},"flashing-none":{compact:"Ingen blinkende indhold",descriptive:"Bogen indeholder ikke noget blinkende indhold, der kunne forårsage epileptiske anfald"},"flashing-unknown":{compact:"Ingen information om bogen har blinkende indhold",descriptive:"Det kunne ikke afgøres om bogen indeholder blinkende indhold der kan lede til epileptiske anfald"},motion:{compact:"Simuleret bevægelse",descriptive:"Bogen indeholder simuleret bevægelse, der kan forårsage en følelse af køresyge"},"motion-none":{compact:"Indeholder ikke simuleret bevægelse",descriptive:"Denne bog indeholder ikke noget indhold med simuleret bevægelse, der kunne lede til en følelse af køresyge"},"motion-unknown":{compact:"Ingen information om simuleret bevægelse",descriptive:"Det kunne ikke vurderes om bogen indeholder simuleret bevægelse, der kan lede til en følelse af køresyge"},"no-metadata":"Ingen information tilgængelig",none:{compact:"Ingen farer",descriptive:"Bogen indeholder ikke noget indhold der kategoriseres som farligt"},sound:{compact:"Lyde",descriptive:"Bogen indeholder lyde der kan være ubehagelige hvis man er sensitiv overfor lyde"},"sound-none":{compact:"Ingen ubehagelige lyde",descriptive:"Bogen indeholder ikke lyde der kunne opleves som ubehagelige hvis man er sensitiv overfor lyde"},"sound-unknown":{compact:"Ingen information om ubehagelige lyde",descriptive:"Det kunne ikke afgøres om bogen indeholder ubehagelige lyde"},title:"Farer",unknown:"Ingen information om farligt indhold"},"legal-considerations":{exempt:{compact:"Gør krav på undtagelser fra tilgængelighedskrav",descriptive:"Denne bog gør krav på en tilgængelighedsundtagelse i en eller flere jurisdiktioner"},"no-metadata":"Ingen information tilgængelig",title:"Juridiske overvejelser"},navigation:{index:{compact:"Indholdsfortegnelse",descriptive:"Indholdsfortegnelse med links til referencer"},"no-metadata":"Ingen information tilgængelig","page-navigation":{compact:"Gå til side",descriptive:"Sideliste for at gå til sider fra den trykte kildeversion"},structural:{compact:"Overskrifter",descriptive:"Elementer så som overskrifter og tabeller til struktureret navigation"},title:"Navigation",toc:{compact:"Indholdsfortegnelse",descriptive:"Indholdsfortegnelse med links til alle kapitler"}},"rich-content":{"accessible-chemistry-as-latex":{compact:"Kemiske formularer i LaTeX",descriptive:"Kemiske formularer i tilgængeligt format (LaTeX)"},"accessible-chemistry-as-mathml":{compact:"Kemiske formularer i MathML notation",descriptive:"Kemiske formularer i tilgængeligt format (MathML)"},"accessible-math-as-latex":{compact:"Matematik som LaTeX",descriptive:"Matematikformler i tilgængeligt format (LaTeX)"},"accessible-math-described":"Tekstbeskrivelser til matematiske formler","closed-captions":{compact:"Videoer har undertekster",descriptive:"Videoer der optræder i bogen har undertekster"},"extended-descriptions":"Informationsrige billeder beskrives med udvidede beskrivelser","math-as-mathml":{compact:"Matematik som MathML",descriptive:"Matematiske formler i tilgængeligt format (MathML)"},"open-captions":{compact:"Videoer har indlejrede undertekster",descriptive:"Videoer der optræder i bogen har indlejrede undertekster"},title:"Komplekst indhold",transcript:"Indeholder transskription(er)",unknown:"Ingen information tilgængelig"},"ways-of-reading":{"nonvisual-reading":{"alt-text":{compact:"Har alternativ tekst",descriptive:"Har billedbeskrivelser"},"no-metadata":"Ingen information omkring ikke-visuel læsning",none:{compact:"Ikke læsbar med oplæsning eller dynamisk punktskrift",descriptive:"Dette indhold er ikke læsbart med oplæsning eller dynamisk punktskrift"},"not-fully":{compact:"Ikke fuldt læsbar med oplæsning eller dynamisk punktskrift",descriptive:"Alt indholdet er ikke fuldt læsbart med oplæsning eller dynamisk punktskrift"},readable:{compact:"Læsbar med oplæsning eller dynamisk punktskrift",descriptive:"Alt indholdet er læsbart med oplæsning eller dynamisk punktskrift"}},"prerecorded-audio":{complementary:{compact:"Indlæste lydklip",descriptive:"Indlæste lydklip er indlejret i indholdet"},"no-metadata":"Ingen information om indlæst lyd",only:{compact:"Kun indlæst lyd",descriptive:"Lydbog uden tekst alternativer"},synchronized:{compact:"Indlæst lyd med synkroniseret tekst",descriptive:"Alt indholdet er tilgængeligt med indlæst lyd og synkroniseret tekst"}},title:"Læseformer","visual-adjustments":{modifiable:{compact:"Udseende kan ændres",descriptive:"Udseende af tekst og sidelayout kan ændres, så vidt muligt i læsesystemet (skrifttype, skriftstørrelse, afstand mellem afsnit, sætninger, ord og bogstaver, samt farven på tekst og baggrund)"},unknown:"Ingen information om mulighed for ændring af udseende",unmodifiable:{compact:"Udseende kan ikke ændres",descriptive:"Tekst og sidelayout kan ikke ændres, da læseoplevelsen afspejler den trykte version af materialet. Læsesystemet kan dog stadig give mulighed for zoom"}}}}},altIdentifier_one:"alternativt ID",altIdentifier_other:"alternative ID'er",artist_one:"kunstner",artist_other:"kunstnere",author_one:"forfatter",author_other:"forfattere",collection_one:"redaktionel samling",collection_other:"redaktionelle samlinger",colorist_one:"farvelægger",colorist_other:"farvelæggere",contributor_one:"bidragsyder",contributor_other:"bidragsydere",description:"beskrivelse",duration:"varighed",editor_one:"redaktør",editor_other:"redaktører",identifier_one:"ID",identifier_other:"ID'er",illustrator_one:"illustrator",illustrator_other:"illustratorer",imprint_one:"trykkeri",imprint_other:"trykkerier",inker_one:"tegner",inker_other:"tegnere",language_one:"sprog",language_other:"sprog",letterer_one:"taleboble-forfatter",letterer_other:"taleboble-forfattere",modified:"rettet dato",narrator_one:"indlæser",narrator_other:"indlæsere",numberOfPages:"printbare sider",penciler_one:"tegneseriekunstner",penciler_other:"tegneseriekunstnere",published:"udgivelsesdato",publisher_one:"udgiver",publisher_other:"udgivere",series_one:"serie",series_other:"serier",subject_one:"emne",subject_other:"emner",subtitle:"undertitel",title:"titel",translator_one:"oversætter",translator_other:"oversættere"}},ma=Object.freeze(Object.defineProperty({__proto__:null,default:{publication:ho},publication:ho},Symbol.toStringTag,{value:"Module"})),uo=JSON.parse(`{"format":{"audiobook":"Audiolibro","audiobookJSON":"Audiobook Manifest","cbz":"Comic book archive","divina":"Divina Publication","divinaJSON":"Divina Publication Manifest","epub":"EPUB","lcpa":"Audiolibro protetto con LCP","lcpdf":"PDF protetto con LCP","lcpl":"Licenza LCP","pdf":"PDF","rwp":"Readium Web Publication","rwpm":"Readium Web Publication Manifest","zab":"Audiobook Archive","zip":"ZIP Archive"},"kind":{"audiobook_many":"audiolibri","audiobook_one":"audiolibro","audiobook_other":"audiolibri","book_many":"libri","book_one":"libro","book_other":"libri","comic_many":"fumetti","comic_one":"fumetto","comic_other":"fumetti","document_many":"documenti","document_one":"documento","document_other":"documenti"},"metadata":{"accessibility":{"display-guide":{"accessibility-summary":{"no-metadata":"Nessuna informazione disponibile","publisher-contact":"Per ulteriori informazioni sull'accessibilità di questa risorsa, contattare l'editore: ","title":"Informazioni aggiuntive sull'accessibilità fornite dall'editore"},"additional-accessibility-information":{"aria":{"compact":"Ruoli ARIA inclusi","descriptive":"Il contenuto è semanticamente arricchito con ruoli ARIA per ottimizzare l'organizzazione e facilitare la navigazione"},"audio-descriptions":"Descrizioni audio","braille":"Braille","color-not-sole-means-of-conveying-information":"Il colore non è l'unico mezzo per trasmettere informazioni","dyslexia-readability":"Leggibilità adatta alla dislessia","full-ruby-annotations":"Annotazioni complete in Ruby","high-contrast-between-foreground-and-background-audio":"Elevato contrasto tra audio principale e sottofondo","high-contrast-between-text-and-background":"Contrasto elevato tra testo in primo piano e sfondo","large-print":"Stampa a caratteri ingranditi","page-breaks":{"compact":"Interruzioni di pagina incluse","descriptive":"Interruzioni di pagina identiche alla versione originale a stampa"},"ruby-annotations":"Alcune annotazioni in Ruby","sign-language":"Lingua dei segni","tactile-graphics":{"compact":"Grafica tattile inclusa","descriptive":"La grafica tattile è stata integrata per facilitare l'accesso agli elementi visivi alle persone non vedenti"},"tactile-objects":"Oggetti 3D tattili","text-to-speech-hinting":"Pronuncia migliorata per la sintesi vocale","title":"Ulteriori informazioni sull'accessibilità","ultra-high-contrast-between-text-and-background":"Contrasto molto elevato tra testo e sfondo","visible-page-numbering":"Numerazione delle pagine visibile","without-background-sounds":"Nessun suono in sottofondo"},"conformance":{"a":{"compact":"Questa pubblicazione soddisfa gli standard minimi di accessibilità","descriptive":"La pubblicazione contiene una dichiarazione di conformità che attesta il rispetto degli standard EPUB Accessibility e WCAG 2 Livello A"},"aa":{"compact":"Questa pubblicazione soddisfa gli standard di accessibilità accettati","descriptive":"La pubblicazione contiene una dichiarazione di conformità che attesta il rispetto degli standard EPUB Accessibility e WCAG 2 Livello AAA"},"aaa":{"compact":"Questa pubblicazione supera gli standard di accessibilità","descriptive":"La pubblicazione contiene una dichiarazione di conformità che attesta il rispetto degli standard EPUB Accessibility e WCAG 2 Livello AAA"},"certifier":"La pubblicazione è stata certificata da ","certifier-credentials":"Le credenziali del certificatore sono ","details":{"certification-info":"La pubblicazione è stata certificata il ","certifier-report":"Per ulteriori informazioni, consultare il report di accessibilità del certificatore","claim":"Questa pubblicazione è conforme ai requisiti di","epub-accessibility-1-0":"EPUB Accessibility 1.0","epub-accessibility-1-1":"EPUB Accessibility 1.1","level-a":"Livello A","level-aa":"Livello AA","level-aaa":"Livello AAA","wcag-2-0":{"compact":"WCAG 2.0","descriptive":"Linee guida per l'accessibilità dei contenuti web (WCAG) 2.0"},"wcag-2-1":{"compact":"WCAG 2.1","descriptive":"Linee guida per l'accessibilità dei contenuti web (WCAG) 2.1"},"wcag-2-2":{"compact":"WCAG 2.2","descriptive":"Linee guida per l'accessibilità dei contenuti web (WCAG) 2.2"}},"details-title":"Informazioni dettagliate sulla conformità","no":"Nessuna informazione disponibile","title":"Conformità","unknown-standard":"Nessuna indicazione sugli standard d'accessibilità"},"hazards":{"flashing":{"compact":"Contenuto lampeggiante","descriptive":"La pubblicazione contiene contenuti lampeggianti che possono causare crisi d'epilessia fotosensibile"},"flashing-none":{"compact":"Nessun contenuto lampeggiante","descriptive":"La pubblicazione non presenta contenuti lampeggianti che possono causare crisi d'epilessia fotosensibile"},"flashing-unknown":{"compact":"Nessuna informazione sulla presenza di contenuti lampeggianti","descriptive":"Non è stato possibile determinare la presenza di contenuti lampeggianti che possono causare crisi d'epilessia fotosensibile"},"motion":{"compact":"Simulazione del movimento","descriptive":"La pubblicazione contiene simulazioni di movimento che possono provocare cinetosi"},"motion-none":{"compact":"Nessun rischio di simulazione del movimento","descriptive":"La pubblicazione non contiene simulazioni di movimento che possono causare la malattia di movimento"},"motion-unknown":{"compact":"Nessuna informazione relativa alla presenza di simulazioni di movimento","descriptive":"Non è stato possibile determinare la presenza di contenuti che possono provocare cinetosi"},"no-metadata":"Nessuna informazione disponibile","none":{"compact":"Nessuna problematica","descriptive":"La pubblicazione non presenta contenuti a rischio di simulazione di movimento, di suoni, o di contenuti lampeggianti"},"sound":{"compact":"Suoni","descriptive":"La pubblicazione contiene suoni che possono causare problemi di sensibilità"},"sound-none":{"compact":"Nessun rischio acustico","descriptive":"La pubblicazione non contiene suoni che possono causare problemi di sensibilità"},"sound-unknown":{"compact":"Nessuna informazione sulla presenza di suoni","descriptive":"Non è stato possibile determinare la presenza di suoni che potrebbero causare problemi di sensibilità"},"title":"Problematiche","unknown":"La presenza di rischi è sconosciuta"},"legal-considerations":{"exempt":{"compact":"Dichiara di godere dell'esenzione d'accessibilità in alcune giurisdizioni","descriptive":"Questa risorsa gode dell'esenzione d'accessibilità in alcune giurisdizioni"},"no-metadata":"Nessuna informazione disponibile","title":"Note legali"},"navigation":{"index":{"compact":"Indice analitico interattivo","descriptive":"Indice analitico con link alle voci di riferimento"},"no-metadata":"Nessuna informazione disponibile","page-navigation":{"compact":"Vai alla pagina","descriptive":"Sono presenti i riferimenti ai numeri di pagina della versione a stampa corrispondente"},"structural":{"compact":"Intestazioni","descriptive":"Contiene elementi come titoli, elenchi e tabelle per permettere una navigazione strutturata"},"title":"Navigazione","toc":{"compact":"Indice interattivo","descriptive":"L’indice permette l’accesso diretto a tutti i capitoli tramite link"}},"rich-content":{"accessible-chemistry-as-latex":{"compact":"Formule chimiche in LaTeX","descriptive":"Formule chimiche in formato accessibile (LaTeX)"},"accessible-chemistry-as-mathml":{"compact":"Formule chimiche in MathML","descriptive":"Formule chimiche in formato accessibile (MathML)"},"accessible-math-as-latex":{"compact":"Matematica in LaTeX","descriptive":"Formule matematiche in formato accessibile (LaTeX)"},"accessible-math-described":"Sono disponibili descrizioni testuali per le formule matematiche","closed-captions":{"compact":"Sottotitoli disponibili per i video","descriptive":"Per i video sono disponibili dei sottotitoli"},"extended-descriptions":"Le immagini complesse presentano descrizioni estese","math-as-mathml":{"compact":"Matematica in MathML","descriptive":"Formule matematiche in formato accessibile (MathML)"},"open-captions":{"compact":"I video hanno i sottotitoli","descriptive":"I video inclusi nella pubblicazione hanno i sottotitoli"},"title":"Contenuti arricchiti","transcript":"Trascrizioni fornite","unknown":"Nessuna informazione disponibile"},"ways-of-reading":{"nonvisual-reading":{"alt-text":{"compact":"Immagini descritte","descriptive":"Le immagini sono descritte da un testo"},"no-metadata":"Nessuna informazione sulla lettura non visiva","none":{"compact":"Non leggibile con lettura ad alta voce o in braille","descriptive":"Il contenuto non è leggibile con la lettura ad alta voce o in braille"},"not-fully":{"compact":"Non è interamente leggibile con lettura ad alta voce o in braille","descriptive":"Non tutti i contenuti potranno essere letti con lettura ad alta voce o in braille"},"readable":{"compact":"Interamente leggibile con lettura ad alta voce o in braille","descriptive":"Tutti i contenuti possono essere letti con la lettura ad alta voce o con il display braille"}},"prerecorded-audio":{"complementary":{"compact":"Clip audio preregistrate","descriptive":"Le clip audio preregistrate sono integrate nel contenuto"},"no-metadata":"Non sono disponibili informazioni sull'audio preregistrato","only":{"compact":"Solo audio preregistrato","descriptive":"Audiolibro senza testi alternativi"},"synchronized":{"compact":"Audio preregistrato sincronizzato con il testo","descriptive":"Tutti i contenuti sono disponibili come audio preregistrato sincronizzato con il testo"}},"title":"Leggibilità","visual-adjustments":{"modifiable":{"compact":"La formattazione del testo e il layout della pagina possono essere modificati","descriptive":"La formattazione del testo e il layout della pagina possono essere modificati in base alle funzionalità presenti nella soluzione di lettura (ingrandimento dei caratteri del testo, modifica dei colori e dei contrasti per il testo e lo sfondo, modifica degli spazi tra lettere, parole, frasi e paragrafi)"},"unknown":"Non sono disponibili informazioni sulla possibilità di formattare il testo","unmodifiable":{"compact":"La formattazione del testo e il display della pagina non possono essere modificati","descriptive":"Il layout di testo e pagina non può essere modificato poiché l'esperienza di lettura è vicina a una versione di stampa, ma i sistemi di lettura possono ancora fornire opzioni di zoom"}}}}},"altIdentifier_many":"identificatori alternativi","altIdentifier_one":"identificatore alternativo","altIdentifier_other":"identificatori alternativi","artist_many":"","artist_one":"artista","artist_other":"artisti","author_many":"","author_one":"autore","author_other":"autori","collection_many":"","collection_one":"collana","collection_other":"collane","colorist_many":"","colorist_one":"colorista","colorist_other":"coloristi","contributor_many":"","contributor_one":"contributore","contributor_other":"contributori","description":"descrizione","duration":"durata","editor_many":"","editor_one":"editor","editor_other":"editori","identifier_many":"identificatori","identifier_one":"identificatore","identifier_other":"identificatori","illustrator_many":"","illustrator_one":"illustratore","illustrator_other":"illustratori","imprint_many":"","imprint_one":"marca editoriale","imprint_other":"marche editoriali","inker_many":"","inker_one":"inchiostratore","inker_other":"inchiostratori","language_many":"","language_one":"lingua","language_other":"lingue","letterer_many":"letteristi","letterer_one":"letterista","letterer_other":"letteristi","modified":"Data di modifica","narrator_many":"","narrator_one":"narratore","narrator_other":"narratori","numberOfPages":"impaginazione versione cartacea","penciler_many":"","penciler_one":"disegnatore","penciler_other":"disegnatori","published":"Data di pubblicazione","publisher_many":"","publisher_one":"editore","publisher_other":"editori","series_many":"","series_one":"serie","series_other":"serie","subject_many":"","subject_one":"categoria","subject_other":"categorie","subtitle":"sottotitolo","title":"titolo","translator_many":"","translator_one":"traduttore","translator_other":"traduttori"}}`),pa=Object.freeze(Object.defineProperty({__proto__:null,default:{publication:uo},publication:uo},Symbol.toStringTag,{value:"Module"})),mo={metadata:{accessibility:{"display-guide":{"accessibility-summary":{"no-metadata":"Sem informação disponível","publisher-contact":"Para mais informações sobre a acessibilidade deste produto, contacte a editora: ",title:"Resumo de acessibilidade"},"additional-accessibility-information":{aria:{compact:"Inclui funções ARIA",descriptive:"O conteúdo foi otimizado com funções ARIA para melhorar a organização e facilitar a navegação"},"audio-descriptions":"Descrições em áudio",braille:"Braille","color-not-sole-means-of-conveying-information":"A cor não é o único meio de transmitir informação","dyslexia-readability":"Otimizado para dislexia","full-ruby-annotations":"Anotações Ruby completas","high-contrast-between-foreground-and-background-audio":"Alto contraste entre som principal e fundo","high-contrast-between-text-and-background":"Alto contraste entre texto e fundo","large-print":"Impressão ampliada","page-breaks":{compact:"Inclui quebras de página",descriptive:"Inclui quebras de página da fonte impressa original"},"ruby-annotations":"Algumas anotações Ruby","sign-language":"Língua gestual","tactile-graphics":{compact:"Inclui gráficos táteis",descriptive:"Inclui gráficos táteis que facilitam o acesso a elementos visuais para pessoas cegas"},"tactile-objects":"Objetos táteis 3D","text-to-speech-hinting":"Sugestões para leitura em voz alta",title:"Informação adicional de acessibilidade","ultra-high-contrast-between-text-and-background":"Contraste muito elevado entre texto e fundo","visible-page-numbering":"Numeração de páginas visível","without-background-sounds":"Sem sons de fundo"},conformance:{a:{compact:"Cumpre as normas mínimas de acessibilidade",descriptive:"A publicação contém uma declaração de conformidade que indica que cumpre o padrão EPUB Accessibility e WCAG 2 nível A"},aa:{compact:"Cumpre as normas aceites de acessibilidade",descriptive:"A publicação contém uma declaração de conformidade que indica que cumpre o padrão EPUB Accessibility e WCAG 2 nível AA"},aaa:{compact:"Excede as normas aceites de acessibilidade",descriptive:"A publicação contém uma declaração de conformidade que indica que cumpre o padrão EPUB Accessibility e WCAG 2 nível AAA"},certifier:"A publicação foi certificada por ","certifier-credentials":"As credenciais do certificador são ",details:{"certification-info":"A publicação foi certificada em ","certifier-report":"Para mais informações, consulte o relatório do certificador",claim:"Esta publicação declara conformidade com","epub-accessibility-1-0":"EPUB Accessibility 1.0","epub-accessibility-1-1":"EPUB Accessibility 1.1","level-a":"Nível A","level-aa":"Nível AA","level-aaa":"Nível AAA","wcag-2-0":{compact:"WCAG 2.0",descriptive:"Diretrizes de Acessibilidade para Conteúdo Web (WCAG) 2.0"},"wcag-2-1":{compact:"WCAG 2.1",descriptive:"Diretrizes de Acessibilidade para Conteúdo Web (WCAG) 2.1"},"wcag-2-2":{compact:"WCAG 2.2",descriptive:"Diretrizes de Acessibilidade para Conteúdo Web (WCAG) 2.2"}},"details-title":"Detalhes de conformidade",no:"Sem informação disponível",title:"Conformidade","unknown-standard":"Não foi possível determinar a conformidade com as normas de acessibilidade aceites para esta publicação"},hazards:{flashing:{compact:"Conteúdo intermitente",descriptive:"A publicação contém conteúdo intermitente que pode causar crises fotossensíveis"},"flashing-none":{compact:"Sem perigos de intermitência",descriptive:"A publicação não contém conteúdo intermitente que possa causar crises fotossensíveis"},"flashing-unknown":{compact:"Risco de intermitência desconhecido",descriptive:"Não foi possível determinar se existe conteúdo intermitente que possa causar crises fotossensíveis"},motion:{compact:"Simulação de movimento",descriptive:"A publicação contém simulações de movimento que podem causar enjoo"},"motion-none":{compact:"Sem simulação de movimento",descriptive:"A publicação não contém simulações de movimento que possam causar enjoo"},"motion-unknown":{compact:"Risco de movimento desconhecido",descriptive:"Não foi possível determinar se existem simulações de movimento que possam causar enjoo"},"no-metadata":"Sem informação disponível",none:{compact:"Sem perigos",descriptive:"A publicação não contém perigos conhecidos"},sound:{compact:"Sons sensíveis",descriptive:"A publicação contém sons que podem causar sensibilidade auditiva"},"sound-none":{compact:"Sem perigos sonoros",descriptive:"A publicação não contém sons que possam causar sensibilidade auditiva"},"sound-unknown":{compact:"Risco sonoro desconhecido",descriptive:"Não foi possível determinar se a publicação contém sons que possam causar sensibilidade auditiva"},title:"Perigos",unknown:"Presença de perigos não determinada"},"legal-considerations":{exempt:{compact:"Declara isenção de conformidade em algumas jurisdições",descriptive:"Esta publicação declara isenção de conformidade em algumas jurisdições"},"no-metadata":"Sem informação disponível",title:"Considerações legais"},navigation:{index:{compact:"Índice remissivo",descriptive:"Índice com ligações para entradas referenciadas"},"no-metadata":"Sem informação disponível","page-navigation":{compact:"Ir para página",descriptive:"Lista de páginas que permite aceder às páginas da versão impressa original"},structural:{compact:"Títulos e estrutura",descriptive:"Elementos como títulos, tabelas, etc., para navegação estruturada"},title:"Navegação",toc:{compact:"Índice",descriptive:"Índice de conteúdos com ligações para todos os capítulos do texto"}},"rich-content":{"accessible-chemistry-as-latex":{compact:"Fórmulas químicas em LaTeX",descriptive:"Fórmulas químicas em formato acessível (LaTeX)"},"accessible-chemistry-as-mathml":{compact:"Fórmulas químicas em MathML",descriptive:"Fórmulas químicas em formato acessível (MathML)"},"accessible-math-as-latex":{compact:"Matemática em LaTeX",descriptive:"Fórmulas matemáticas em formato acessível (LaTeX)"},"accessible-math-described":"Descrição textual das fórmulas matemáticas","closed-captions":{compact:"Vídeos com legendas ocultas",descriptive:"Os vídeos incluídos na publicação têm legendas ocultas"},"extended-descriptions":"Imagens complexas com descrições detalhadas","math-as-mathml":{compact:"Matemática em MathML",descriptive:"Fórmulas matemáticas em formato acessível (MathML)"},"open-captions":{compact:"Vídeos com legendas abertas",descriptive:"Os vídeos incluídos na publicação têm legendas abertas"},title:"Conteúdo rico",transcript:"Transcrição fornecida",unknown:"Sem informação disponível"},"ways-of-reading":{"nonvisual-reading":{"alt-text":{compact:"Contém texto alternativo",descriptive:"Inclui descrições alternativas de texto para imagens"},"no-metadata":"Sem informação sobre leitura não visual",none:{compact:"Não legível em leitura em voz alta ou braille dinâmico",descriptive:"O conteúdo não é legível em voz alta ou através de braille dinâmico"},"not-fully":{compact:"Parcialmente legível em leitura em voz alta ou braille dinâmico",descriptive:"Nem todo o conteúdo é legível em voz alta ou através de braille dinâmico"},readable:{compact:"Totalmente legível em leitura em voz alta ou braille dinâmico",descriptive:"Todo o conteúdo pode ser lido em voz alta ou através de braille dinâmico"}},"prerecorded-audio":{complementary:{compact:"Contém clipes de áudio pré-gravados",descriptive:"O conteúdo contém clipes de áudio pré-gravados incorporados"},"no-metadata":"Sem informação sobre áudio pré-gravado",only:{compact:"Apenas áudio pré-gravado",descriptive:"A publicação é apenas áudio e não possui alternativa em texto"},synchronized:{compact:"Áudio pré-gravado sincronizado com texto",descriptive:"Todo o conteúdo está disponível como áudio pré-gravado sincronizado com texto"}},title:"Formas de leitura","visual-adjustments":{modifiable:{compact:"Aspeto personalizável",descriptive:"O aspeto do texto e o layout da página podem ser modificados de acordo com as capacidades do sistema de leitura (tipo e tamanho de letra, espaçamento entre parágrafos, frases, palavras e letras, bem como a cor de fundo e do texto)"},unknown:"Sem informação sobre personalização do aspeto",unmodifiable:{compact:"Aspeto não ajustável",descriptive:"O texto e o layout da página não podem ser modificados, uma vez que a experiência de leitura é semelhante à versão impressa, mas os sistemas de leitura ainda podem oferecer opções de ampliação"}}}}},altIdentifier_one:"identificador alternativo",altIdentifier_other:"identificadores alternativos",artist_one:"artista",artist_other:"artistas",author_one:"autor",author_other:"autores",collection_one:"coleção",collection_other:"coleções",colorist_one:"colorista",colorist_other:"coloristas",contributor_one:"colaborador",contributor_other:"colaboradores",description:"descrição",duration:"duração",editor_one:"editor",editor_other:"editores",identifier_one:"identificador",identifier_other:"identificadores",illustrator_one:"ilustrador",illustrator_other:"ilustradores",imprint_one:"selo editorial",imprint_other:"selos editoriais",inker_one:"arte-finalista",inker_other:"arte-finalistas",language_one:"idioma",language_other:"idiomas",letterer_one:"letrista",letterer_other:"letristas",modified:"data de modificação",narrator_one:"narrador",narrator_other:"narradores",numberOfPages:"número de páginas",penciler_one:"desenhador",penciler_other:"desenhadores",published:"data de publicação",publisher_one:"editora",publisher_other:"editoras",series_one:"série",series_other:"séries",subject_one:"tema",subject_other:"temas",subtitle:"subtítulo",title:"título",translator_one:"tradutor",translator_other:"tradutores"}},ga=Object.freeze(Object.defineProperty({__proto__:null,default:{publication:mo},publication:mo},Symbol.toStringTag,{value:"Module"})),po={metadata:{accessibility:{"display-guide":{"accessibility-summary":{"no-metadata":"Information saknas","publisher-contact":"För mer information om den här publikationens tillgänglighet, kontakta utgivaren: ",title:"Kompletterande information om tillgänglighet"},"additional-accessibility-information":{aria:{compact:"Innehåller ARIA-roller",descriptive:"Innehållet har försetts med ARIA-roller för att tydliggöra strukturen och underlätta navigering"},"audio-descriptions":"Syntolkning",braille:"Punktskrift","color-not-sole-means-of-conveying-information":"Betydelse uttrycks aldrig enbart med färg","dyslexia-readability":"Förbättrad läsbarhet för personer med dyslexi","full-ruby-annotations":"Fullständig ruby-annotering","high-contrast-between-foreground-and-background-audio":"Hög kontrast mellan förgrundsljud och bakgrundsljud","high-contrast-between-text-and-background":"Hög kontrast mellan text och bakgrund","large-print":"Storstil","page-breaks":{compact:"Innehåller sidnummer",descriptive:"Innehåller sidnummer från tryckt förlaga"},"ruby-annotations":"Viss ruby-annotering","sign-language":"Teckenspråk","tactile-graphics":{compact:"Innehåller taktila bilder",descriptive:"Taktila bilder har lagts till för att tillgängliggöra visuella element för personer med synnedsättning"},"tactile-objects":"Taktila 3D-objekt","text-to-speech-hinting":"Innehåller uttalsinstruktioner för talsyntes",title:"Ytterligare tillgänglighetsinformation","ultra-high-contrast-between-text-and-background":"Extra hög kontrast mellan text och bakgrund","visible-page-numbering":"Synlig sidnumrering","without-background-sounds":"Utan bakgrundsljud"},conformance:{a:{compact:"Publikationen uppfyller tillgänglighetskrav på en grundläggande nivå",descriptive:"Publikationen anger att den uppfyller standarderna EPUB Accessibility och WCAG 2 nivå A"},aa:{compact:"Publikationen uppfyller tillgänglighetskrav på en vedertagen nivå",descriptive:"Publikationen anger att den uppfyller standarderna EPUB Accessibility och WCAG 2 nivå AA"},aaa:{compact:"Publikationen uppfyller tillgänglighetskrav utöver en vedertagen nivå",descriptive:"Publikationen anger att den uppfyller standarderna EPUB Accessibility och WCAG 2 nivå AAA"},certifier:"Publikationen är certifierad av ","certifier-credentials":"Certifierarens märkning är ",details:{"certification-info":"Publikationen certifierades ","certifier-report":"Se certifieringsrapporten för mer information",claim:"Publikationen anger att den uppfyller kraven enligt","epub-accessibility-1-0":"EPUB Accessibility 1.0","epub-accessibility-1-1":"EPUB Accessibility 1.1","level-a":"nivå A","level-aa":"nivå AA","level-aaa":"nivå AAA","wcag-2-0":{compact:"WCAG 2.0",descriptive:"Web Content Accessibility Guidelines (WCAG) 2.0"},"wcag-2-1":{compact:"WCAG 2.1",descriptive:"Web Content Accessibility Guidelines (WCAG) 2.1"},"wcag-2-2":{compact:"WCAG 2.2",descriptive:"Web Content Accessibility Guidelines (WCAG) 2.2"}},"details-title":"Detaljerad information om tillgänglighetskrav",no:"Information saknas",title:"Tillgänglighetskrav","unknown-standard":"Det går inte att avgöra om publikationen uppfyller vedertagna tillgänglighetskrav"},hazards:{flashing:{compact:"Blinkande innehåll",descriptive:"Publikationen har blinkande innehåll som kan vara skadligt för ljuskänsliga personer"},"flashing-none":{compact:"Inget blinkande innehåll",descriptive:"Publikationen har inget blinkande innehåll"},"flashing-unknown":{compact:"Förekomst av blinkande innehåll är okänd",descriptive:"Förekomst av blinkande innehåll är okänd"},motion:{compact:"Rörelsesimulering",descriptive:"Publikationen innehåller rörelsesimulering som skulle kunna orsaka illamående"},"motion-none":{compact:"Ingen rörelsesimulering",descriptive:"Publikationen innehåller ingen rörelsesimulering"},"motion-unknown":{compact:"Förekomst av rörelsesimulering är okänd",descriptive:"Förekomst av rörelsesimulering är okänd"},"no-metadata":"Information saknas",none:{compact:"Inga risker",descriptive:"Publikationen innehåller inga risker"},sound:{compact:"Ljud",descriptive:"Publikationen innehåller ljud som kan orsaka obehag"},"sound-none":{compact:"Inget ljud som kan orsaka obehag",descriptive:"Publikationen innehåller inget ljud som kan orsaka obehag"},"sound-unknown":{compact:"Förekomst av ljud som kan orsaka obehag är okänd",descriptive:"Förekomst av ljud som kan orsaka obehag är okänd"},title:"Risker",unknown:"Förekomst av risker är okänd"},"legal-considerations":{exempt:{compact:"Åberopar ett undantag från vissa lagstadgade tillgänglighetskrav",descriptive:"Publikationen åberopar ett undantag från vissa lagstadgade tillgänglighetskrav"},"no-metadata":"Information saknas",title:"Juridiska aspekter"},navigation:{index:{compact:"Register",descriptive:"Register med länkar till innehållet"},"no-metadata":"Information saknas","page-navigation":{compact:"Gå till sida",descriptive:"Sidindelning för navigering enligt sidnummer i tryckt förlaga"},structural:{compact:"Rubriker",descriptive:"Navigerbara element såsom rubriker eller tabeller"},title:"Navigering",toc:{compact:"Innehållsförteckning",descriptive:"Innehållsförteckning med länkar till alla kapitel"}},"rich-content":{"accessible-chemistry-as-latex":{compact:"Kemiska formler i LaTeX",descriptive:"Kemiska formler i tillgängligt format (LaTeX)"},"accessible-chemistry-as-mathml":{compact:"Kemiska formler i MathML",descriptive:"Kemiska formler i tillgängligt format (MathML)"},"accessible-math-as-latex":{compact:"Matematik som LaTeX",descriptive:"Matematiska formler i tillgängligt format (LaTeX)"},"accessible-math-described":"Innehåller textbeskrivningar av matematik","closed-captions":{compact:"Videoklipp har undertext som kan sättas på/stängas av",descriptive:"Videoklipp som ingår i publikationen har undertext som kan sättas på och stängas av (stängda undertexter)"},"extended-descriptions":"Informationsrika bilder har utökade bildbeskrivningar","math-as-mathml":{compact:"Matematik som MathML",descriptive:"Matematiska formler i tillgängligt format (MathML)"},"open-captions":{compact:"Videoklipp har undertext som inte kan stängas av",descriptive:"Videoklipp som ingår i publikationen har undertext som inte kan stängas av (öppna undertexter)"},title:"Berikat innehåll",transcript:"Innehåller transkriptioner",unknown:"Information saknas"},"ways-of-reading":{"nonvisual-reading":{"alt-text":{compact:"Har textalternativ (alt-texter)",descriptive:"Har textalternativ (alt-texter) till bilder"},"no-metadata":"Information om icke-visuell läsbarhet saknas",none:{compact:"Kan inte läsas med uppläsningsfunktion eller punktskriftsskärm",descriptive:"Innehållet går inte att läsa med uppläsningsfunktion eller punktskriftsskärm"},"not-fully":{compact:"Inte läsbart i sin helhet med uppläsningsfunktion eller punktskriftsskärm",descriptive:"Allt innehåll går inte att läsa med uppläsningsfunktion eller punktskriftsskärm"},readable:{compact:"Kan läsas med uppläsningsfunktion eller punktskriftsskärm",descriptive:"Hela innehållet går att läsa med uppläsningsfunktion eller punktskriftsskärm"}},"prerecorded-audio":{complementary:{compact:"Förinspelade ljudklipp",descriptive:"Innehåller förinspelade ljudklipp"},"no-metadata":"Information om förinspelat ljud saknas",only:{compact:"Endast förinspelat ljud",descriptive:"Bok med ljud utan textalternativ"},synchronized:{compact:"Förinspelat ljud synkroniserat med texten",descriptive:"Hela innehållet finns tillgängligt som förinspelat ljud synkroniserat med texten"}},title:"Olika sätt att läsa","visual-adjustments":{modifiable:{compact:"Utseendet kan justeras",descriptive:"Det går att justera text och layout i den utsträckning som läsprogrammet tillåter, till exempel typsnitt, storlek på text, avstånd mellan rader och stycken samt färg på text och bakgrund"},unknown:"Information om möjlighet att justera utseende saknas",unmodifiable:{compact:"Utseendet kan inte justeras",descriptive:"Text- och sidlayout kan inte justeras eftersom presentationen liknar en tryckt version, men läsprogram kan ha funktioner för att zooma in"}}}}},altIdentifier_one:"alternativ identifierare",altIdentifier_other:"alternativa identifierare",artist_one:"konstnär",artist_other:"konstnärer",author_one:"författare",author_other:"författare",collection_one:"samling",collection_other:"samlingar",colorist_one:"kolorist",colorist_other:"kolorister",contributor_one:"medverkande",contributor_other:"medverkande",description:"beskrivning",duration:"speltid",editor_one:"redaktör",editor_other:"redaktörer",identifier_one:"identifierare",identifier_other:"identifierare",illustrator_one:"illustratör",illustrator_other:"illustratörer",imprint_one:"imprint",imprint_other:"imprint",inker_one:"tuschare",inker_other:"tuschare",language_one:"språk",language_other:"språk",letterer_one:"textare",letterer_other:"textare",modified:"ändringsdatum",narrator_one:"berättarröst",narrator_other:"berättarröster",numberOfPages:"sidantal",penciler_one:"tecknare",penciler_other:"tecknare",published:"publikationsdatum",publisher_one:"förlag",publisher_other:"förlag",series_one:"serie",series_other:"serier",subject_one:"ämne",subject_other:"ämnen",subtitle:"undertitel",title:"titel",translator_one:"översättare",translator_other:"översättare"}},fa=Object.freeze(Object.defineProperty({__proto__:null,default:{publication:po},publication:po},Symbol.toStringTag,{value:"Module"})),ya=Object.freeze(Object.defineProperty({__proto__:null,default:`/*!
 * Readium CSS v.2.0.5
 * Copyright (c) 2017–2026. Readium Foundation. All rights reserved.
 * Use of this source code is governed by a BSD-style license which is detailed in the
 * LICENSE file present in the project repository where this source code is maintained.
 * Core maintainer: Jiminy Panoz <jiminy.panoz@edrlab.org> 
 * Contributors: 
 * Daniel Weck
 * Hadrien Gardeur
 * Innovimax
 * L. Le Meur
 * Mickaël Menu
 * k_taka
 */

@namespace url("http://www.w3.org/1999/xhtml");

@namespace epub url("http://www.idpf.org/2007/ops");

@namespace m url("http://www.w3.org/1998/Math/MathML");

@namespace svg url("http://www.w3.org/2000/svg");

@-ms-viewport{
  width:device-width;
}

@viewport{
  width:device-width;
  zoom:1;
}

:root{

  --RS__sans-serif-ja-v:'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Hiragino Kaku Gothic Pro', 'ヒラギノ角ゴ W3', 'YuGothic', 'Yu Gothic Medium', 'BIZ UDGothic', 'Yu Gothic', 'ＭＳゴシック', 'MS Gothic', sans-serif;

  --RS__serif-ja-v:'Hiragino Mincho ProN', 'Hiragino Mincho Pro', 'YuMincho', 'BIZ UDMincho', 'Yu Mincho', 'ＭＳ明朝', 'MS Mincho', serif;

  --RS__sans-serif-ja:'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Hiragino Kaku Gothic Pro', 'ヒラギノ角ゴ W3', 'YuGothic', 'Yu Gothic Medium', 'BIZ UDPGothic', 'Yu Gothic', 'ＭＳ Ｐゴシック', 'MS PGothic', sans-serif;

  --RS__serif-ja:'Hiragino Mincho ProN', 'Hiragino Mincho Pro', 'YuMincho', 'BIZ UDPMincho', 'Yu Mincho', 'ＭＳ Ｐ明朝', 'MS PMincho', serif;

  --RS__monospaceTf:ui-monospace, 'Andale Mono', 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace;

  --RS__humanistTf:Seravek, Calibri, 'Gill Sans Nova', Roboto, Ubuntu, 'DejaVu Sans', source-sans-pro, sans-serif;

  --RS__sansTf:-ui-sans-serif, -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI Variable', 'Segoe UI', Inter, Roboto, 'Helvetica Neue', 'Arial Nova', 'Liberation Sans', Arial, sans-serif;

  --RS__modernTf:Athelas, Constantia, Charter, 'Bitstream Charter', Cambria, 'Georgia Pro', Georgia, serif;

  --RS__oldStyleTf:'Iowan Old Style', Sitka, 'Sitka Text', Palatino, 'Book Antiqua', 'URW Palladio L', P052, serif;

  --RS__zh-HK-lineHeightCompensation:1.167;

  --RS__zh-HK-baseFontFamily:'方體', 'PingFang HK', '方體', 'PingFang TC', '黑體', 'Heiti TC', 'Microsoft JhengHei UI', 'Microsoft JhengHei', Roboto, Noto, 'Noto Sans CJK TC', sans-serif;

  --RS__zh-TW-lineHeightCompensation:1.167;

  --RS__zh-TW-baseFontFamily:'方體', 'PingFang TC', '黑體', 'Heiti TC', 'Microsoft JhengHei UI', 'Microsoft JhengHei', Roboto, Noto, 'Noto Sans CJK TC', sans-serif;

  --RS__zh-Hant-lineHeightCompensation:1.167;

  --RS__zh-Hant-baseFontFamily:'方體', 'PingFang TC', '黑體', 'Heiti TC', 'Microsoft JhengHei UI', 'Microsoft JhengHei', Roboto, Noto, 'Noto Sans CJK TC', sans-serif;

  --RS__zh-lineHeightCompensation:1.167;

  --RS__zh-baseFontFamily:'方体', 'PingFang SC', '黑体', 'Heiti SC', 'Microsoft JhengHei UI', 'Microsoft JhengHei', Roboto, Noto, 'Noto Sans CJK SC', sans-serif;

  --RS__th-lineHeightCompensation:1.067;

  --RS__th-baseFontFamily:Thonburi, 'Leelawadee UI', 'Cordia New', Roboto, Noto, 'Noto Sans Thai', sans-serif;

  --RS__te-baseFontFamily:'Kohinoor Telugu', 'Telugu Sangam MN', 'Nirmala UI', Gautami, Roboto, Noto, 'Noto Sans Telugu', sans-serif;

  --RS__ta-lineHeightCompensation:1.067;

  --RS__ta-baseFontFamily:'Tamil Sangam MN', 'Nirmala UI', Latha, Roboto, Noto, 'Noto Sans Tamil', sans-serif;

  --RS__si-lineHeightCompensation:1.167;

  --RS__si-baseFontFamily:'Sinhala Sangam MN', 'Nirmala UI', 'Iskoola Pota', Roboto, Noto, 'Noto Sans Sinhala', sans-serif;

  --RS__pa-lineHeightCompensation:1.1;

  --RS__pa-baseFontFamily:'Gurmukhi MN', 'Nirmala UI', Kartika, Roboto, Noto, 'Noto Sans Gurmukhi', sans-serif;

  --RS__or-lineHeightCompensation:1.167;

  --RS__or-baseFontFamily:'Oriya Sangam MN', 'Nirmala UI', Kalinga, Roboto, Noto, 'Noto Sans Oriya', sans-serif;

  --RS__ml-lineHeightCompensation:1.067;

  --RS__ml-baseFontFamily:'Malayalam Sangam MN', 'Nirmala UI', Kartika, Roboto, Noto, 'Noto Sans Malayalam', sans-serif;

  --RS__lo-baseFontFamily:'Lao Sangam MN', 'Leelawadee UI', 'Lao UI', Roboto, Noto, 'Noto Sans Lao', sans-serif;

  --RS__ko-lineHeightCompensation:1.167;

  --RS__ko-baseFontFamily:'Nanum Gothic', 'Apple SD Gothic Neo', 'Malgun Gothic', Roboto, Noto, 'Noto Sans CJK KR', sans-serif;

  --RS__kn-lineHeightCompensation:1.1;

  --RS__kn-baseFontFamily:'Kannada Sangam MN', 'Nirmala UI', Tunga, Roboto, Noto, 'Noto Sans Kannada', sans-serif;

  --RS__km-lineHeightCompensation:1.067;

  --RS__km-baseFontFamily:'Khmer Sangam MN', 'Leelawadee UI', 'Khmer UI', Roboto, Noto, 'Noto Sans Khmer', sans-serif;

  --RS__ja-lineHeightCompensation:1.167;

  --RS__ja-baseFontFamily:YuGothic, 'Hiragino Maru Gothic ProN', 'Hiragino Sans', 'Yu Gothic UI', 'Meiryo UI', 'MS Gothic', Roboto, Noto, 'Noto Sans CJK JP', sans-serif;

  --RS__iu-baseFontFamily:'Euphemia UCAS', Euphemia, Roboto, Noto, 'Noto Sans Canadian Aboriginal', sans-serif;

  --RS__hy-baseFontFamily:Mshtakan, Sylfaen, Roboto, Noto, 'Noto Serif Armenian', serif;

  --RS__hi-lineHeightCompensation:1.1;

  --RS__hi-baseFontFamily:'Kohinoor Devanagari', 'Devanagari Sangam MN', Kokila, 'Nirmala UI', Roboto, Noto, 'Noto Sans Devanagari', sans-serif;

  --RS__he-lineHeightCompensation:1.1;

  --RS__he-baseFontFamily:'New Peninim MT', 'Arial Hebrew', Gisha, 'Times New Roman', Roboto, Noto, 'Noto Sans Hebrew', sans-serif;

  --RS__gu-lineHeightCompensation:1.167;

  --RS__gu-baseFontFamily:'Gujarati Sangam MN', 'Nirmala UI', Shruti, Roboto, Noto, 'Noto Sans Gujarati', sans-serif;

  --RS__fa-baseFontFamily:'Geeza Pro', 'Arabic Typesetting', Roboto, Noto, 'Noto Naskh Arabic', 'Times New Roman', serif;

  --RS__chr-lineHeightCompensation:1.167;

  --RS__chr-baseFontFamily:'Plantagenet Cherokee', Roboto, Noto, 'Noto Sans Cherokee';

  --RS__bo-baseFontFamily:Kailasa, 'Microsoft Himalaya', Roboto, Noto, 'Noto Sans Tibetan', sans-serif;

  --RS__bn-lineHeightCompensation:1.067;

  --RS__bn-baseFontFamily:'Kohinoor Bangla', 'Bangla Sangam MN', Vrinda, Roboto, Noto, 'Noto Sans Bengali', sans-serif;

  --RS__ar-baseFontFamily:'Geeza Pro', 'Arabic Typesetting', Roboto, Noto, 'Noto Naskh Arabic', 'Times New Roman', serif;

  --RS__am-lineHeightCompensation:1.167;

  --RS__am-baseFontFamily:Kefa, Nyala, Roboto, Noto, 'Noto Sans Ethiopic', serif;

  --RS__latin-lineHeightCompensation:1;

  --RS__latin-baseFontFamily:var(--RS__oldStyleTf);
  --RS__baseFontFamily:var(--RS__latin-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__latin-lineHeightCompensation);
  --RS__baseLineHeight:calc(1.5 * var(--RS__lineHeightCompensation));

  --RS__selectionTextColor:inherit;

  --RS__selectionBackgroundColor:#b4d8fe;

  --RS__visitedColor:#551A8B;

  --RS__linkColor:#0000EE;

  --RS__textColor:#121212;

  --RS__backgroundColor:#FFFFFF;
  color:var(--RS__textColor) !important;

  background-color:var(--RS__backgroundColor) !important;
}

::-moz-selection{
  color:var(--RS__selectionTextColor);
  background-color:var(--RS__selectionBackgroundColor);
}

::selection{
  color:var(--RS__selectionTextColor);
  background-color:var(--RS__selectionBackgroundColor);
}

html{
  font-family:var(--RS__baseFontFamily);
  line-height:1.6;
  line-height:var(--RS__baseLineHeight);
  text-rendering:optimizelegibility;
}

h1, h2, h3{
  line-height:normal;
}

:lang(ja),
:lang(zh),
:lang(ko){
  word-wrap:break-word;
  -webkit-line-break:strict;
  -epub-line-break:strict;
  line-break:strict;
}

math{
  font-family:"Latin Modern Math", "STIX Two Math", "XITS Math", "STIX Math", "Libertinus Math", "TeX Gyre Termes Math", "TeX Gyre Bonum Math", "TeX Gyre Schola", "DejaVu Math TeX Gyre", "TeX Gyre Pagella Math", "Asana Math", "Cambria Math", "Lucida Bright Math", "Minion Math", STIXGeneral, STIXSizeOneSym, Symbol, "Times New Roman", serif;
}

:lang(am){
  --RS__baseFontFamily:var(--RS__am-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__am-lineHeightCompensation);
}

:lang(ar){
  --RS__baseFontFamily:var(--RS__ar-baseFontFamily);
}

:lang(bn){
  --RS__baseFontFamily:var(--RS__bn-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__bn-lineHeightCompensation);
}

:lang(bo){
  --RS__baseFontFamily:var(--RS__bo-baseFontFamily);
}

:lang(chr){
  --RS__baseFontFamily:var(--RS__chr-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__chr-lineHeightCompensation);
}

:lang(fa){
  --RS__baseFontFamily:var(--RS__fa-baseFontFamily);
}

:lang(gu){
  --RS__baseFontFamily:var(--RS__gu-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__gu-lineHeightCompensation);
}

:lang(he){
  --RS__baseFontFamily:var(--RS__he-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__he-lineHeightCompensation);
}

:lang(hi){
  --RS__baseFontFamily:var(--RS__hi-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__hi-lineHeightCompensation);
}

:lang(hy){
  --RS__baseFontFamily:var(--RS__hy-baseFontFamily);
}

:lang(iu){
  --RS__baseFontFamily:var(--RS__iu-baseFontFamily);
}

:lang(ja){
  --RS__baseFontFamily:var(--RS__ja-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__ja-lineHeightCompensation);
}

:lang(km){
  --RS__baseFontFamily:var(--RS__km-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__km-lineHeightCompensation);
}

:lang(kn){
  --RS__baseFontFamily:var(--RS__kn-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__kn-lineHeightCompensation);
}

:lang(ko){
  --RS__baseFontFamily:var(--RS__ko-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__ko-lineHeightCompensation);
}

:lang(lo){
  --RS__baseFontFamily:var(--RS__lo-baseFontFamily);
}

:lang(ml){
  --RS__baseFontFamily:var(--RS__ml-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__ml-lineHeightCompensation);
}

:lang(or){
  --RS__baseFontFamily:var(--RS__or-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__or-lineHeightCompensation);
}

:lang(pa){
  --RS__baseFontFamily:var(--RS__pa-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__pa-lineHeightCompensation);
}

:lang(si){
  --RS__baseFontFamily:var(--RS__si-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__si-lineHeightCompensation);
}

:lang(ta){
  --RS__baseFontFamily:var(--RS__ta-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__ta-lineHeightCompensation);
}

:lang(te){
  --RS__baseFontFamily:var(--RS__te-baseFontFamily);
}

:lang(th){
  --RS__baseFontFamily:var(--RS__th-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__th-lineHeightCompensation);
}

:lang(zh){
  --RS__baseFontFamily:var(--RS__zh-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__zh-lineHeightCompensation);
}

:lang(zh-Hant){
  --RS__baseFontFamily:var(--RS__zh-Hant-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__zh-Hant-lineHeightCompensation);
}

:lang(zh-TW){
  --RS__baseFontFamily:var(--RS__zh-TW-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__zh-TW-lineHeightCompensation);
}

:lang(zh-HK){
  --RS__baseFontFamily:var(--RS__zh-HK-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__zh-HK-lineHeightCompensation);
}

body{
  widows:2;
  orphans:2;
}

figcaption, th, td{
  widows:1;
  orphans:1;
}

h2, h3, h4, h5, h6, dt,
hr, caption{
  -webkit-column-break-after:avoid;
  page-break-after:avoid;
  break-after:avoid;
}

h1, h2, h3, h4, h5, h6, dt,
figure, tr{
  -webkit-column-break-inside:avoid;
  page-break-inside:avoid;
  break-inside:avoid;
}

body{
  -webkit-hyphenate-character:"\\002D";
  -moz-hyphenate-character:"\\002D";
  -ms-hyphenate-character:"\\002D";
  hyphenate-character:"\\002D";
  -webkit-hyphenate-limit-lines:3;
  -ms-hyphenate-limit-lines:3;
  hyphenate-limit-lines:3;
}

h1, h2, h3, h4, h5, h6, dt,
figcaption, pre, caption, address,
center, code, var{
  -ms-hyphens:none;
  -moz-hyphens:none;
  -webkit-hyphens:none;
  -epub-hyphens:none;
  hyphens:none;
}

body{
  font-variant-numeric:oldstyle-nums proportional-nums;
}

:lang(ja) body,
:lang(zh) body,
:lang(ko) body{
  font-variant-numeric:lining-nums proportional-nums;
}

h1, h2, h3, h4, h5, h6, dt{
  font-variant-numeric:lining-nums proportional-nums;
}

table{
  font-variant-numeric:lining-nums tabular-nums;
}

code, var{
  font-variant-ligatures:none;
  font-variant-numeric:lining-nums tabular-nums slashed-zero;
}

rt{
  font-variant-east-asian:ruby;
}

:lang(ar){
  font-variant-ligatures:common-ligatures;
}

:lang(ko){
  font-kerning:normal;
}

hr{
  color:inherit;
  border-color:currentcolor;
}

table, th, td{
  border-color:currentcolor;
}

figure, blockquote{
  margin:1em 5%;
}

ul, ol{
  padding-left:5%;
}

dd{
  margin-left:5%;
}

pre{
  white-space:pre-wrap;
  -ms-tab-size:2;
  -moz-tab-size:2;
  -webkit-tab-size:2;
  tab-size:2;
}

abbr[title], acronym[title]{
  text-decoration:dotted underline;
}

nobr wbr{
  white-space:normal;
}

ruby > rt, ruby > rp{
  -webkit-user-select:none;
  -moz-user-select:none;
  -ms-user-select:none;
  user-select:none;
}

*:lang(ja):not(:lang(ja-Latn)):not(:lang(ja-Cyrl)),
*:lang(zh):not(:lang(zh-Latn)):not(:lang(zh-Cyrl)),
*:lang(ko):not(:lang(ko-Latn)):not(:lang(ko-Cyrl)),
:lang(ja):not(:lang(ja-Latn)):not(:lang(ja-Cyrl)) cite, 
:lang(ja):not(:lang(ja-Latn)):not(:lang(ja-Cyrl)) dfn, 
:lang(ja):not(:lang(ja-Latn)):not(:lang(ja-Cyrl)) em, 
:lang(ja):not(:lang(ja-Latn)):not(:lang(ja-Cyrl)) i,
:lang(zh):not(:lang(zh-Latn)):not(:lang(zh-Cyrl)) cite, 
:lang(zh):not(:lang(zh-Latn)):not(:lang(zh-Cyrl)) dfn, 
:lang(zh):not(:lang(zh-Latn)):not(:lang(zh-Cyrl)) em, 
:lang(zh):not(:lang(zh-Latn)):not(:lang(zh-Cyrl)) i,
:lang(ko):not(:lang(ko-Latn)):not(:lang(ko-Cyrl)) cite, 
:lang(ko):not(:lang(ko-Latn)):not(:lang(ko-Cyrl)) dfn, 
:lang(ko):not(:lang(ko-Latn)):not(:lang(ko-Cyrl)) em, 
:lang(ko):not(:lang(ko-Latn)):not(:lang(ko-Cyrl)) i{
  font-style:normal;
}

:lang(ja) a,
:lang(zh) a,
:lang(ko) a{
  text-decoration:none;
}

:root{
  --RS__maxMediaWidth:100%;
  --RS__maxMediaHeight:95vh;
  --RS__boxSizingMedia:border-box;
  --RS__boxSizingTable:border-box;
}

a, a span, span a, h1, h2, h3, h4, h5, h6{
  word-wrap:break-word;
}

div{
  max-width:var(--RS__maxMediaWidth);
}

img, svg|svg, video{
  object-fit:contain;

  width:auto;
  height:auto;
  max-width:var(--RS__maxMediaWidth);
  max-height:var(--RS__maxMediaHeight) !important;
  box-sizing:var(--RS__boxSizingMedia);
  -webkit-column-break-inside:avoid;
  page-break-inside:avoid;
  break-inside:avoid;
}

@supports (zoom: 1) and (not ((-webkit-column-axis: horizontal) and (-webkit-column-progression: normal))){

  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] img,
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] svg|svg,
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] video{
    zoom:calc(100% / var(--USER__fontSize));
  }
}

audio{
    max-width:100%;
    -webkit-column-break-inside:avoid;
    page-break-inside:avoid;
    break-inside:avoid;
  }

table{
  max-width:var(--RS__maxMediaWidth);
  box-sizing:var(--RS__boxSizingTable);
}`},Symbol.toStringTag,{value:"Module"})),Sa=Object.freeze(Object.defineProperty({__proto__:null,default:`/*!
 * Readium CSS v.2.0.5
 * Copyright (c) 2017–2026. Readium Foundation. All rights reserved.
 * Use of this source code is governed by a BSD-style license which is detailed in the
 * LICENSE file present in the project repository where this source code is maintained.
 * Core maintainer: Jiminy Panoz <jiminy.panoz@edrlab.org> 
 * Contributors: 
 * Daniel Weck
 * Hadrien Gardeur
 * Innovimax
 * L. Le Meur
 * Mickaël Menu
 * k_taka
 */

@namespace url("http://www.w3.org/1999/xhtml");

@namespace epub url("http://www.idpf.org/2007/ops");

@namespace m url("http://www.w3.org/1998/Math/MathML");

@namespace svg url("http://www.w3.org/2000/svg");

:root{
  --RS__compFontFamily:var(--RS__baseFontFamily);
  --RS__codeFontFamily:var(--RS__monospaceTf);

  --RS__typeScale:1.125;
  --RS__baseFontSize:100%;

  --RS__flowSpacing:1.5rem;
  --RS__paraSpacing:0;
  --RS__paraIndent:1em;

  --RS__linkColor:#0000EE;
  --RS__visitedColor:#551A8B;

  --RS__primaryColor:;
  --RS__secondaryColor:;
}

body{
  font-size:var(--RS__baseFontSize);
  text-align:justify;
}

h1, h2, h3, h4, h5, h6{
  font-family:var(--RS__compFontFamily);
  text-align:right;
}

blockquote, figure, p, pre,
aside, footer, form, hr{
  margin-top:var(--RS__flowSpacing);
  margin-bottom:var(--RS__flowSpacing);
}

p{
  margin-top:var(--RS__paraSpacing);
  margin-bottom:var(--RS__paraSpacing);
  text-indent:var(--RS__paraIndent);
}

h1 + p, h2 + p, h3 + p, h4 + p, h5 + p, h6 + p,
hr + p{
  text-indent:0;
}

pre{
  font-family:var(--RS__codeFontFamily);
}

code, kbd, samp, tt{
  font-family:var(--RS__codeFontFamily);
}

sub, sup{
  position:relative;
  font-size:67.5%;
  line-height:1;
}

sub{
  bottom:-0.2ex;
}

sup{
  bottom:0;
}

:link{
  color:var(--RS__linkColor);
}

:visited{
  color:var(--RS__visitedColor);
}

h1{
  margin-top:calc(var(--RS__flowSpacing) * 2);
  margin-bottom:calc(var(--RS__flowSpacing) * 2);
  font-size:calc(((1em * var(--RS__typeScale)) * var(--RS__typeScale)) * var(--RS__typeScale));
}

h2{
  margin-top:calc(var(--RS__flowSpacing) * 2);
  margin-bottom:var(--RS__flowSpacing);
  font-size:calc((1em * var(--RS__typeScale)) * var(--RS__typeScale));
}

h3{
  margin-top:var(--RS__flowSpacing);
  margin-bottom:var(--RS__flowSpacing);
  font-size:calc(1em * var(--RS__typeScale));
}

h4{
  margin-top:var(--RS__flowSpacing);
  margin-bottom:var(--RS__flowSpacing);
  font-size:1em;
}

h5{
  margin-top:var(--RS__flowSpacing);
  margin-bottom:var(--RS__flowSpacing);
  font-size:smaller;
}

h6{
  margin-top:var(--RS__flowSpacing);
  margin-bottom:0;
  font-size:smaller;
  font-weight:normal;
}

dl, ol, ul{
  margin-top:var(--RS__flowSpacing);
  margin-bottom:var(--RS__flowSpacing);
}

table{
  margin:var(--RS__flowSpacing) 0;
  border:1px solid currentcolor;
  border-collapse:collapse;
  empty-cells:show;
}

thead, tbody, tfoot, table > tr{
  vertical-align:top;
}

th{
  text-align:initial;
}

th, td{
  padding:4px;
  border:1px solid currentcolor;
}`},Symbol.toStringTag,{value:"Module"})),_a=Object.freeze(Object.defineProperty({__proto__:null,default:`/*!
 * Readium CSS v.2.0.5
 * Copyright (c) 2017–2026. Readium Foundation. All rights reserved.
 * Use of this source code is governed by a BSD-style license which is detailed in the
 * LICENSE file present in the project repository where this source code is maintained.
 * Core maintainer: Jiminy Panoz <jiminy.panoz@edrlab.org> 
 * Contributors: 
 * Daniel Weck
 * Hadrien Gardeur
 * Innovimax
 * L. Le Meur
 * Mickaël Menu
 * k_taka
 */

@namespace url("http://www.w3.org/1999/xhtml");

@namespace epub url("http://www.idpf.org/2007/ops");

@namespace m url("http://www.w3.org/1998/Math/MathML");

@namespace svg url("http://www.w3.org/2000/svg");

:root{

  --RS__viewportWidth:100%;

  --RS__pageGutter:0;

  --RS__defaultLineLength:100%;

  --RS__colGap:0;

  --RS__colCount:1;

  --RS__colWidth:100vw;
}

@page{
  margin:0 !important;
}

:root{
  position:relative;

  -webkit-column-width:var(--RS__colWidth);
  -moz-column-width:var(--RS__colWidth);
  column-width:var(--RS__colWidth);
  -webkit-column-count:var(--RS__colCount);
  -moz-column-count:var(--RS__colCount);
  column-count:var(--RS__colCount);

  -webkit-column-gap:var(--RS__colGap);
  -moz-column-gap:var(--RS__colGap);
  column-gap:var(--RS__colGap);
  -moz-column-fill:auto;
  column-fill:auto;
  width:var(--RS__viewportWidth);
  height:100vh;
  max-width:var(--RS__viewportWidth);
  max-height:100vh;
  min-width:var(--RS__viewportWidth);
  min-height:100vh;
  padding:0 !important;
  margin:0 !important;
  font-size:1rem !important;
  box-sizing:border-box;
  -webkit-touch-callout:none;
}

body{
  width:100%;
  max-width:var(--RS__defaultLineLength) !important;
  margin:0 auto !important;
  box-sizing:border-box;
}

:root:not([style*="readium-scroll-on"]) body{
  padding:0 var(--RS__pageGutter) !important;
}

:root:not([style*="readium-noOverflow-on"]) body{
  overflow:hidden;
}

@supports (overflow: clip){

   :root:not([style*="readium-noOverflow-on"]){
      overflow:clip;
   }

   :root:not([style*="readium-noOverflow-on"]) body{
      overflow:clip;
      overflow-clip-margin:content-box;
   }
}

:root[style*="readium-scroll-on"]{
  -webkit-columns:auto auto !important;
  -moz-columns:auto auto !important;
  columns:auto auto !important;
  width:auto !important;
  height:auto !important;
  max-width:none !important;
  max-height:none !important;
  min-width:0 !important;
  min-height:0 !important;
}

:root[style*="readium-scroll-on"] body{
  max-width:var(--RS__defaultLineLength) !important;
  box-sizing:border-box !important;
}

:root[style*="readium-scroll-on"]:not([style*="readium-noOverflow-on"]) body{
  overflow:auto;
}

@supports (overflow: clip){

  :root[style*="readium-scroll-on"]:not([style*="readium-noOverflow-on"]){
     overflow:auto;
  }

  :root[style*="readium-scroll-on"]:not([style*="readium-noOverflow-on"]) body{
     overflow:clip;
  }
}

:root[style*="readium-scroll-on"][style*="--RS__scrollPaddingTop"] body{
  padding-top:var(--RS__scrollPaddingTop) !important;
}

:root[style*="readium-scroll-on"][style*="--RS__scrollPaddingBottom"] body{
  padding-bottom:var(--RS__scrollPaddingBottom) !important;
}

:root[style*="readium-scroll-on"][style*="--RS__scrollPaddingLeft"] body{
  padding-left:var(--RS__scrollPaddingLeft) !important;
}

:root[style*="readium-scroll-on"][style*="--RS__scrollPaddingRight"] body{
  padding-right:var(--RS__scrollPaddingRight) !important;
}

:root[style*="--USER__backgroundColor"]{
  background-color:var(--USER__backgroundColor) !important;
}

:root[style*="--USER__backgroundColor"] *{
  background-color:transparent !important;
}

:root[style*="--USER__textColor"]{
  color:var(--USER__textColor) !important;
}

:root[style*="--USER__textColor"] *:not(a){
  color:inherit !important;
  background-color:transparent !important;
  border-color:currentcolor !important;
}

:root[style*="--USER__textColor"] svg text{
  fill:currentcolor !important;
  stroke:none !important;
}

:root[style*="--USER__linkColor"] a:link,
:root[style*="--USER__linkColor"] a:link *{
  color:var(--USER__linkColor) !important;
}

:root[style*="--USER__visitedColor"] a:visited,
:root[style*="--USER__visitedColor"] a:visited *{
  color:var(--USER__visitedColor) !important;
}

:root[style*="--USER__selectionBackgroundColor"][style*="--USER__selectionTextColor"] ::-moz-selection{
  color:var(--USER__selectionTextColor) !important;
  background-color:var(--USER__selectionBackgroundColor) !important;
}

:root[style*="--USER__selectionBackgroundColor"][style*="--USER__selectionTextColor"] ::selection{
  color:var(--USER__selectionTextColor) !important;
  background-color:var(--USER__selectionBackgroundColor) !important;
}

:root[style*="--USER__colCount"]{
  -webkit-column-count:var(--USER__colCount);
  -moz-column-count:var(--USER__colCount);
  column-count:var(--USER__colCount);

  --RS__colWidth:auto;
}

:root[style*="--USER__colCount: 0"],
:root[style*="--USER__colCount:0"]{
  -webkit-column-count:1;
  -moz-column-count:1;
  column-count:1;
}

:root[style*="--USER__colCount: 0"],
:root[style*="--USER__colCount:0"],
:root[style*="--USER__colCount: 1"],
:root[style*="--USER__colCount:1"]{
  --RS__colWidth:100vw;
}

:root[style*="--USER__lineLength"] body{
    max-width:var(--USER__lineLength) !important;
  }

:root[style*="--USER__textAlign"]{
  text-align:var(--USER__textAlign);
}

:root[style*="--USER__textAlign"] body,
:root[style*="--USER__textAlign"] p:not(
  blockquote p,
  figcaption p,
  header p,
  hgroup p,
  :root[style*="readium-experimentalHeaderFiltering-on"] p[class*="title"],
  :root[style*="readium-experimentalHeaderFiltering-on"] div:has(+ *) > h1 + p,
  :root[style*="readium-experimentalHeaderFiltering-on"] div:has(+ *) > p:has(+ h1)
),
:root[style*="--USER__textAlign"] li,
:root[style*="--USER__textAlign"] dd{
  text-align:var(--USER__textAlign) !important;
  -moz-text-align-last:auto !important;
  -epub-text-align-last:auto !important;
  text-align-last:auto !important;
}

:root[style*="--USER__fontFamily"]{
  font-family:var(--USER__fontFamily) !important;
}

:root[style*="--USER__fontFamily"] *{
  font-family:revert !important;
}

:root:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] body{
  zoom:var(--USER__fontSize) !important;
}

:root:not([style*="readium-deprecatedFontSize-on"])[style*="readium-iOSPatch-on"][style*="--USER__fontSize"] body{
  -webkit-text-size-adjust:var(--USER__fontSize) !important;
}

@supports selector(figure:has(> img)){

  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] figure:has(> img),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] figure:has(> video),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] figure:has(> svg),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] figure:has(> canvas),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] figure:has(> iframe),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] figure:has(> audio),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] div:has(> img:only-child),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] div:has(> video:only-child),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] div:has(> svg:only-child),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] div:has(> canvas:only-child),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] div:has(> iframe:only-child),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] div:has(> audio:only-child),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] table{
    zoom:calc(100% / var(--USER__fontSize)) !important;
  }

  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] figcaption,
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] caption,
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] td,
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] th{
    zoom:var(--USER__fontSize) !important;
  }
}

@supports not (zoom: 1){

  :root[style*="--USER__fontSize"]{
    font-size:var(--USER__fontSize) !important;
  }
}

:root[style*="readium-deprecatedFontSize-on"][style*="--USER__fontSize"]{
  font-size:var(--USER__fontSize) !important;
}

:root[style*="--USER__lineHeight"]{
  line-height:var(--USER__lineHeight) !important;
}

:root[style*="--USER__lineHeight"] body,
:root[style*="--USER__lineHeight"] p,
:root[style*="--USER__lineHeight"] li,
:root[style*="--USER__lineHeight"] div{
  line-height:var(--USER__lineHeight) !important;
}

:root[style*="--USER__paraSpacing"] p{
  margin-top:var(--USER__paraSpacing) !important;
  margin-bottom:var(--USER__paraSpacing) !important;
}

:root[style*="--USER__paraIndent"] p:not(
  blockquote p,
  figcaption p,
  header p,
  hgroup p,
  :root[style*="readium-experimentalHeaderFiltering-on"] p[class*="title"],
  :root[style*="readium-experimentalHeaderFiltering-on"] div:has(+ *) > h1 + p,
  :root[style*="readium-experimentalHeaderFiltering-on"] div:has(+ *) > p:has(+ h1)
){
  text-indent:var(--USER__paraIndent) !important;
}

:root[style*="--USER__paraIndent"] p *{
  text-indent:0 !important;
}

:root[style*="--USER__wordSpacing"] h1,
:root[style*="--USER__wordSpacing"] h2,
:root[style*="--USER__wordSpacing"] h3,
:root[style*="--USER__wordSpacing"] h4,
:root[style*="--USER__wordSpacing"] h5,
:root[style*="--USER__wordSpacing"] h6,
:root[style*="--USER__wordSpacing"] p,
:root[style*="--USER__wordSpacing"] li,
:root[style*="--USER__wordSpacing"] div,
:root[style*="--USER__wordSpacing"] dt,
:root[style*="--USER__wordSpacing"] dd{
  word-spacing:var(--USER__wordSpacing) !important;
}

:root[style*="--USER__ligatures"]{
  font-variant-ligatures:var(--USER__ligatures) !important;
}

:root[style*="--USER__ligatures"] *{
  font-variant-ligatures:inherit !important;
}

:root[style*="--USER__fontWeight"] body{
  font-weight:var(--USER__fontWeight) !important;
}

:root[style*="--USER__fontWeight"] b,
:root[style*="--USER__fontWeight"] strong{
  font-weight:bolder;
}

:root[style*="--USER__fontWidth"] body{
  font-stretch:var(--USER__fontWidth) !important;
}

:root[style*="--USER__fontOpticalSizing"] body{
  font-optical-sizing:var(--USER__fontOpticalSizing) !important;
}

:root[style*="readium-blend-on"] svg,
:root[style*="readium-blend-on"] img{
  background-color:transparent !important;
  mix-blend-mode:multiply !important;
}

:root[style*="--USER__darkenImages"] img{
  -webkit-filter:brightness(var(--USER__darkenImages)) !important;
  filter:brightness(var(--USER__darkenImages)) !important;
}

:root[style*="readium-darken-on"] img{
  -webkit-filter:brightness(80%) !important;
  filter:brightness(80%) !important;
}

:root[style*="--USER__invertImages"] img{
  -webkit-filter:invert(var(--USER__invertImages)) !important;
  filter:invert(var(--USER__invertImages)) !important;
}

:root[style*="readium-invert-on"] img{
  -webkit-filter:invert(100%) !important;
  filter:invert(100%) !important;
}

:root[style*="--USER__darkenImages"][style*="--USER__invertImages"] img{
  -webkit-filter:brightness(var(--USER__darkenImages)) invert(var(--USER__invertImages)) !important;
  filter:brightness(var(--USER__darkenImages)) invert(var(--USER__invertImages)) !important;
}

:root[style*="readium-darken-on"][style*="--USER__invertImages"] img{
  -webkit-filter:brightness(80%) invert(var(--USER__invertImages)) !important;
  filter:brightness(80%) invert(var(--USER__invertImages)) !important;
}

:root[style*="--USER__darkenImages"][style*="readium-invert-on"] img{
  -webkit-filter:brightness(var(--USER__darkenImages)) invert(100%) !important;
  filter:brightness(var(--USER__darkenImages)) invert(100%) !important;
}

:root[style*="readium-darken-on"][style*="readium-invert-on"] img{
  -webkit-filter:brightness(80%) invert(100%) !important;
  filter:brightness(80%) invert(100%) !important;
}

:root[style*="--USER__invertGaiji"] img[class*="gaiji"]{
  -webkit-filter:invert(var(--USER__invertGaiji)) !important;
  filter:invert(var(--USER__invertGaiji)) !important;
}

:root[style*="readium-invertGaiji-on"] img[class*="gaiji"]{
  -webkit-filter:invert(100%) !important;
  filter:invert(100%) !important;
}

:root[style*="readium-normalize-on"]{
  --USER__typeScale:1.2;
}

:root[style*="readium-normalize-on"] p,
:root[style*="readium-normalize-on"] li,
:root[style*="readium-normalize-on"] div,
:root[style*="readium-normalize-on"] pre,
:root[style*="readium-normalize-on"] dd{
  font-size:1rem !important;
}

:root[style*="readium-normalize-on"] h1{
  font-size:1.75rem !important;
  font-size:calc(((1rem * var(--USER__typeScale)) * var(--USER__typeScale)) * var(--USER__typeScale)) !important;
}

:root[style*="readium-normalize-on"] h2{
  font-size:1.5rem !important;
  font-size:calc((1rem * var(--USER__typeScale)) * var(--USER__typeScale)) !important;
}

:root[style*="readium-normalize-on"] h3{
  font-size:1.25rem !important;
  font-size:calc(1rem * var(--USER__typeScale)) !important;
}

:root[style*="readium-normalize-on"] h4,
:root[style*="readium-normalize-on"] h5,
:root[style*="readium-normalize-on"] h6{
  font-size:1rem !important;
}

:root[style*="readium-normalize-on"] small{
  font-size:smaller !important;
}

:root[style*="readium-normalize-on"] sub,
:root[style*="readium-normalize-on"] sup{
  font-size:67.5% !important;
}

:root[style*="readium-normalize-on"][style*="--USER__typeScale"] h1{
  font-size:calc(((1rem * var(--USER__typeScale)) * var(--USER__typeScale)) * var(--USER__typeScale)) !important;
}

:root[style*="readium-normalize-on"][style*="--USER__typeScale"] h2{
  font-size:calc((1rem * var(--USER__typeScale)) * var(--USER__typeScale)) !important;
}

:root[style*="readium-normalize-on"][style*="--USER__typeScale"] h3{
  font-size:calc(1rem * var(--USER__typeScale)) !important;
}

:root[style*="readium-iPadOSPatch-on"] body{
  -webkit-text-size-adjust:none;
}

:root[style*="readium-iPadOSPatch-on"] p, 
:root[style*="readium-iPadOSPatch-on"] h1, 
:root[style*="readium-iPadOSPatch-on"] h2, 
:root[style*="readium-iPadOSPatch-on"] h3, 
:root[style*="readium-iPadOSPatch-on"] h4, 
:root[style*="readium-iPadOSPatch-on"] h5, 
:root[style*="readium-iPadOSPatch-on"] h6, 
:root[style*="readium-iPadOSPatch-on"] li, 
:root[style*="readium-iPadOSPatch-on"] th, 
:root[style*="readium-iPadOSPatch-on"] td, 
:root[style*="readium-iPadOSPatch-on"] dt, 
:root[style*="readium-iPadOSPatch-on"] dd, 
:root[style*="readium-iPadOSPatch-on"] pre, 
:root[style*="readium-iPadOSPatch-on"] address, 
:root[style*="readium-iPadOSPatch-on"] details, 
:root[style*="readium-iPadOSPatch-on"] summary,
:root[style*="readium-iPadOSPatch-on"] figcaption,
:root[style*="readium-iPadOSPatch-on"] div:not(:has(p, h1, h2, h3, h4, h5, h6, li, th, td, dt, dd, pre, address, aside, details, figcaption, summary)),
:root[style*="readium-iPadOSPatch-on"] aside:not(:has(p, h1, h2, h3, h4, h5, h6, li, th, td, dt, dd, pre, address, aside, details, figcaption, summary)){
  -webkit-text-zoom:reset;
}

:root[style*="readium-iPadOSPatch-on"] abbr, 
:root[style*="readium-iPadOSPatch-on"] b, 
:root[style*="readium-iPadOSPatch-on"] bdi, 
:root[style*="readium-iPadOSPatch-on"] bdo, 
:root[style*="readium-iPadOSPatch-on"] cite, 
:root[style*="readium-iPadOSPatch-on"] code, 
:root[style*="readium-iPadOSPatch-on"] dfn, 
:root[style*="readium-iPadOSPatch-on"] em, 
:root[style*="readium-iPadOSPatch-on"] i, 
:root[style*="readium-iPadOSPatch-on"] kbd, 
:root[style*="readium-iPadOSPatch-on"] mark, 
:root[style*="readium-iPadOSPatch-on"] q, 
:root[style*="readium-iPadOSPatch-on"] rp, 
:root[style*="readium-iPadOSPatch-on"] rt, 
:root[style*="readium-iPadOSPatch-on"] ruby, 
:root[style*="readium-iPadOSPatch-on"] s, 
:root[style*="readium-iPadOSPatch-on"] samp, 
:root[style*="readium-iPadOSPatch-on"] small, 
:root[style*="readium-iPadOSPatch-on"] span, 
:root[style*="readium-iPadOSPatch-on"] strong, 
:root[style*="readium-iPadOSPatch-on"] sub, 
:root[style*="readium-iPadOSPatch-on"] sup, 
:root[style*="readium-iPadOSPatch-on"] time, 
:root[style*="readium-iPadOSPatch-on"] u, 
:root[style*="readium-iPadOSPatch-on"] var{
  -webkit-text-zoom:normal;
}

:root[style*="readium-iPadOSPatch-on"] p:not(:has(b, cite, em, i, q, s, small, span, strong)):first-line{
  -webkit-text-zoom:normal;
}`},Symbol.toStringTag,{value:"Module"})),ba=Object.freeze(Object.defineProperty({__proto__:null,default:`/*!
 * Readium CSS v.2.0.5
 * Copyright (c) 2017–2026. Readium Foundation. All rights reserved.
 * Use of this source code is governed by a BSD-style license which is detailed in the
 * LICENSE file present in the project repository where this source code is maintained.
 * Core maintainer: Jiminy Panoz <jiminy.panoz@edrlab.org> 
 * Contributors: 
 * Daniel Weck
 * Hadrien Gardeur
 * Innovimax
 * L. Le Meur
 * Mickaël Menu
 * k_taka
 */

@namespace url("http://www.w3.org/1999/xhtml");

@namespace epub url("http://www.idpf.org/2007/ops");

@namespace m url("http://www.w3.org/1998/Math/MathML");

@namespace svg url("http://www.w3.org/2000/svg");

@-ms-viewport{
  width:device-width;
}

@viewport{
  width:device-width;
  zoom:1;
}

:root{

  --RS__sans-serif-ja-v:'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Hiragino Kaku Gothic Pro', 'ヒラギノ角ゴ W3', 'YuGothic', 'Yu Gothic Medium', 'BIZ UDGothic', 'Yu Gothic', 'ＭＳゴシック', 'MS Gothic', sans-serif;

  --RS__serif-ja-v:'Hiragino Mincho ProN', 'Hiragino Mincho Pro', 'YuMincho', 'BIZ UDMincho', 'Yu Mincho', 'ＭＳ明朝', 'MS Mincho', serif;

  --RS__sans-serif-ja:'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Hiragino Kaku Gothic Pro', 'ヒラギノ角ゴ W3', 'YuGothic', 'Yu Gothic Medium', 'BIZ UDPGothic', 'Yu Gothic', 'ＭＳ Ｐゴシック', 'MS PGothic', sans-serif;

  --RS__serif-ja:'Hiragino Mincho ProN', 'Hiragino Mincho Pro', 'YuMincho', 'BIZ UDPMincho', 'Yu Mincho', 'ＭＳ Ｐ明朝', 'MS PMincho', serif;

  --RS__monospaceTf:ui-monospace, 'Andale Mono', 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace;

  --RS__humanistTf:Seravek, Calibri, 'Gill Sans Nova', Roboto, Ubuntu, 'DejaVu Sans', source-sans-pro, sans-serif;

  --RS__sansTf:-ui-sans-serif, -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI Variable', 'Segoe UI', Inter, Roboto, 'Helvetica Neue', 'Arial Nova', 'Liberation Sans', Arial, sans-serif;

  --RS__modernTf:Athelas, Constantia, Charter, 'Bitstream Charter', Cambria, 'Georgia Pro', Georgia, serif;

  --RS__oldStyleTf:'Iowan Old Style', Sitka, 'Sitka Text', Palatino, 'Book Antiqua', 'URW Palladio L', P052, serif;

  --RS__zh-HK-lineHeightCompensation:1.167;

  --RS__zh-HK-baseFontFamily:'方體', 'PingFang HK', '方體', 'PingFang TC', '黑體', 'Heiti TC', 'Microsoft JhengHei UI', 'Microsoft JhengHei', Roboto, Noto, 'Noto Sans CJK TC', sans-serif;

  --RS__zh-TW-lineHeightCompensation:1.167;

  --RS__zh-TW-baseFontFamily:'方體', 'PingFang TC', '黑體', 'Heiti TC', 'Microsoft JhengHei UI', 'Microsoft JhengHei', Roboto, Noto, 'Noto Sans CJK TC', sans-serif;

  --RS__zh-Hant-lineHeightCompensation:1.167;

  --RS__zh-Hant-baseFontFamily:'方體', 'PingFang TC', '黑體', 'Heiti TC', 'Microsoft JhengHei UI', 'Microsoft JhengHei', Roboto, Noto, 'Noto Sans CJK TC', sans-serif;

  --RS__zh-lineHeightCompensation:1.167;

  --RS__zh-baseFontFamily:'方体', 'PingFang SC', '黑体', 'Heiti SC', 'Microsoft JhengHei UI', 'Microsoft JhengHei', Roboto, Noto, 'Noto Sans CJK SC', sans-serif;

  --RS__th-lineHeightCompensation:1.067;

  --RS__th-baseFontFamily:Thonburi, 'Leelawadee UI', 'Cordia New', Roboto, Noto, 'Noto Sans Thai', sans-serif;

  --RS__te-baseFontFamily:'Kohinoor Telugu', 'Telugu Sangam MN', 'Nirmala UI', Gautami, Roboto, Noto, 'Noto Sans Telugu', sans-serif;

  --RS__ta-lineHeightCompensation:1.067;

  --RS__ta-baseFontFamily:'Tamil Sangam MN', 'Nirmala UI', Latha, Roboto, Noto, 'Noto Sans Tamil', sans-serif;

  --RS__si-lineHeightCompensation:1.167;

  --RS__si-baseFontFamily:'Sinhala Sangam MN', 'Nirmala UI', 'Iskoola Pota', Roboto, Noto, 'Noto Sans Sinhala', sans-serif;

  --RS__pa-lineHeightCompensation:1.1;

  --RS__pa-baseFontFamily:'Gurmukhi MN', 'Nirmala UI', Kartika, Roboto, Noto, 'Noto Sans Gurmukhi', sans-serif;

  --RS__or-lineHeightCompensation:1.167;

  --RS__or-baseFontFamily:'Oriya Sangam MN', 'Nirmala UI', Kalinga, Roboto, Noto, 'Noto Sans Oriya', sans-serif;

  --RS__ml-lineHeightCompensation:1.067;

  --RS__ml-baseFontFamily:'Malayalam Sangam MN', 'Nirmala UI', Kartika, Roboto, Noto, 'Noto Sans Malayalam', sans-serif;

  --RS__lo-baseFontFamily:'Lao Sangam MN', 'Leelawadee UI', 'Lao UI', Roboto, Noto, 'Noto Sans Lao', sans-serif;

  --RS__ko-lineHeightCompensation:1.167;

  --RS__ko-baseFontFamily:'Nanum Gothic', 'Apple SD Gothic Neo', 'Malgun Gothic', Roboto, Noto, 'Noto Sans CJK KR', sans-serif;

  --RS__kn-lineHeightCompensation:1.1;

  --RS__kn-baseFontFamily:'Kannada Sangam MN', 'Nirmala UI', Tunga, Roboto, Noto, 'Noto Sans Kannada', sans-serif;

  --RS__km-lineHeightCompensation:1.067;

  --RS__km-baseFontFamily:'Khmer Sangam MN', 'Leelawadee UI', 'Khmer UI', Roboto, Noto, 'Noto Sans Khmer', sans-serif;

  --RS__ja-lineHeightCompensation:1.167;

  --RS__ja-baseFontFamily:YuGothic, 'Hiragino Maru Gothic ProN', 'Hiragino Sans', 'Yu Gothic UI', 'Meiryo UI', 'MS Gothic', Roboto, Noto, 'Noto Sans CJK JP', sans-serif;

  --RS__iu-baseFontFamily:'Euphemia UCAS', Euphemia, Roboto, Noto, 'Noto Sans Canadian Aboriginal', sans-serif;

  --RS__hy-baseFontFamily:Mshtakan, Sylfaen, Roboto, Noto, 'Noto Serif Armenian', serif;

  --RS__hi-lineHeightCompensation:1.1;

  --RS__hi-baseFontFamily:'Kohinoor Devanagari', 'Devanagari Sangam MN', Kokila, 'Nirmala UI', Roboto, Noto, 'Noto Sans Devanagari', sans-serif;

  --RS__he-lineHeightCompensation:1.1;

  --RS__he-baseFontFamily:'New Peninim MT', 'Arial Hebrew', Gisha, 'Times New Roman', Roboto, Noto, 'Noto Sans Hebrew', sans-serif;

  --RS__gu-lineHeightCompensation:1.167;

  --RS__gu-baseFontFamily:'Gujarati Sangam MN', 'Nirmala UI', Shruti, Roboto, Noto, 'Noto Sans Gujarati', sans-serif;

  --RS__fa-baseFontFamily:'Geeza Pro', 'Arabic Typesetting', Roboto, Noto, 'Noto Naskh Arabic', 'Times New Roman', serif;

  --RS__chr-lineHeightCompensation:1.167;

  --RS__chr-baseFontFamily:'Plantagenet Cherokee', Roboto, Noto, 'Noto Sans Cherokee';

  --RS__bo-baseFontFamily:Kailasa, 'Microsoft Himalaya', Roboto, Noto, 'Noto Sans Tibetan', sans-serif;

  --RS__bn-lineHeightCompensation:1.067;

  --RS__bn-baseFontFamily:'Kohinoor Bangla', 'Bangla Sangam MN', Vrinda, Roboto, Noto, 'Noto Sans Bengali', sans-serif;

  --RS__ar-baseFontFamily:'Geeza Pro', 'Arabic Typesetting', Roboto, Noto, 'Noto Naskh Arabic', 'Times New Roman', serif;

  --RS__am-lineHeightCompensation:1.167;

  --RS__am-baseFontFamily:Kefa, Nyala, Roboto, Noto, 'Noto Sans Ethiopic', serif;

  --RS__latin-lineHeightCompensation:1;

  --RS__latin-baseFontFamily:var(--RS__oldStyleTf);
  --RS__baseFontFamily:var(--RS__latin-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__latin-lineHeightCompensation);
  --RS__baseLineHeight:calc(1.5 * var(--RS__lineHeightCompensation));

  --RS__selectionTextColor:inherit;

  --RS__selectionBackgroundColor:#b4d8fe;

  --RS__visitedColor:#551A8B;

  --RS__linkColor:#0000EE;

  --RS__textColor:#121212;

  --RS__backgroundColor:#FFFFFF;
  color:var(--RS__textColor) !important;

  background-color:var(--RS__backgroundColor) !important;
}

::-moz-selection{
  color:var(--RS__selectionTextColor);
  background-color:var(--RS__selectionBackgroundColor);
}

::selection{
  color:var(--RS__selectionTextColor);
  background-color:var(--RS__selectionBackgroundColor);
}

html{
  font-family:var(--RS__baseFontFamily);
  line-height:1.6;
  line-height:var(--RS__baseLineHeight);
  text-rendering:optimizelegibility;
}

h1, h2, h3{
  line-height:normal;
}

:lang(ja),
:lang(zh),
:lang(ko){
  word-wrap:break-word;
  -webkit-line-break:strict;
  -epub-line-break:strict;
  line-break:strict;
}

math{
  font-family:"Latin Modern Math", "STIX Two Math", "XITS Math", "STIX Math", "Libertinus Math", "TeX Gyre Termes Math", "TeX Gyre Bonum Math", "TeX Gyre Schola", "DejaVu Math TeX Gyre", "TeX Gyre Pagella Math", "Asana Math", "Cambria Math", "Lucida Bright Math", "Minion Math", STIXGeneral, STIXSizeOneSym, Symbol, "Times New Roman", serif;
}

:lang(am){
  --RS__baseFontFamily:var(--RS__am-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__am-lineHeightCompensation);
}

:lang(ar){
  --RS__baseFontFamily:var(--RS__ar-baseFontFamily);
}

:lang(bn){
  --RS__baseFontFamily:var(--RS__bn-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__bn-lineHeightCompensation);
}

:lang(bo){
  --RS__baseFontFamily:var(--RS__bo-baseFontFamily);
}

:lang(chr){
  --RS__baseFontFamily:var(--RS__chr-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__chr-lineHeightCompensation);
}

:lang(fa){
  --RS__baseFontFamily:var(--RS__fa-baseFontFamily);
}

:lang(gu){
  --RS__baseFontFamily:var(--RS__gu-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__gu-lineHeightCompensation);
}

:lang(he){
  --RS__baseFontFamily:var(--RS__he-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__he-lineHeightCompensation);
}

:lang(hi){
  --RS__baseFontFamily:var(--RS__hi-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__hi-lineHeightCompensation);
}

:lang(hy){
  --RS__baseFontFamily:var(--RS__hy-baseFontFamily);
}

:lang(iu){
  --RS__baseFontFamily:var(--RS__iu-baseFontFamily);
}

:lang(ja){
  --RS__baseFontFamily:var(--RS__ja-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__ja-lineHeightCompensation);
}

:lang(km){
  --RS__baseFontFamily:var(--RS__km-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__km-lineHeightCompensation);
}

:lang(kn){
  --RS__baseFontFamily:var(--RS__kn-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__kn-lineHeightCompensation);
}

:lang(ko){
  --RS__baseFontFamily:var(--RS__ko-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__ko-lineHeightCompensation);
}

:lang(lo){
  --RS__baseFontFamily:var(--RS__lo-baseFontFamily);
}

:lang(ml){
  --RS__baseFontFamily:var(--RS__ml-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__ml-lineHeightCompensation);
}

:lang(or){
  --RS__baseFontFamily:var(--RS__or-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__or-lineHeightCompensation);
}

:lang(pa){
  --RS__baseFontFamily:var(--RS__pa-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__pa-lineHeightCompensation);
}

:lang(si){
  --RS__baseFontFamily:var(--RS__si-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__si-lineHeightCompensation);
}

:lang(ta){
  --RS__baseFontFamily:var(--RS__ta-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__ta-lineHeightCompensation);
}

:lang(te){
  --RS__baseFontFamily:var(--RS__te-baseFontFamily);
}

:lang(th){
  --RS__baseFontFamily:var(--RS__th-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__th-lineHeightCompensation);
}

:lang(zh){
  --RS__baseFontFamily:var(--RS__zh-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__zh-lineHeightCompensation);
}

:lang(zh-Hant){
  --RS__baseFontFamily:var(--RS__zh-Hant-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__zh-Hant-lineHeightCompensation);
}

:lang(zh-TW){
  --RS__baseFontFamily:var(--RS__zh-TW-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__zh-TW-lineHeightCompensation);
}

:lang(zh-HK){
  --RS__baseFontFamily:var(--RS__zh-HK-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__zh-HK-lineHeightCompensation);
}

body{
  widows:2;
  orphans:2;
}

figcaption, th, td{
  widows:1;
  orphans:1;
}

h2, h3, h4, h5, h6, dt,
hr, caption{
  -webkit-column-break-after:avoid;
  page-break-after:avoid;
  break-after:avoid;
}

h1, h2, h3, h4, h5, h6, dt,
figure, tr{
  -webkit-column-break-inside:avoid;
  page-break-inside:avoid;
  break-inside:avoid;
}

body{
  -webkit-hyphenate-character:"\\002D";
  -moz-hyphenate-character:"\\002D";
  -ms-hyphenate-character:"\\002D";
  hyphenate-character:"\\002D";
  -webkit-hyphenate-limit-lines:3;
  -ms-hyphenate-limit-lines:3;
  hyphenate-limit-lines:3;
}

h1, h2, h3, h4, h5, h6, dt,
figcaption, pre, caption, address,
center, code, var{
  -ms-hyphens:none;
  -moz-hyphens:none;
  -webkit-hyphens:none;
  -epub-hyphens:none;
  hyphens:none;
}

body{
  font-variant-numeric:oldstyle-nums proportional-nums;
}

:lang(ja) body,
:lang(zh) body,
:lang(ko) body{
  font-variant-numeric:lining-nums proportional-nums;
}

h1, h2, h3, h4, h5, h6, dt{
  font-variant-numeric:lining-nums proportional-nums;
}

table{
  font-variant-numeric:lining-nums tabular-nums;
}

code, var{
  font-variant-ligatures:none;
  font-variant-numeric:lining-nums tabular-nums slashed-zero;
}

rt{
  font-variant-east-asian:ruby;
}

:lang(ar){
  font-variant-ligatures:common-ligatures;
}

:lang(ko){
  font-kerning:normal;
}

hr{
  color:inherit;
  border-color:currentcolor;
}

table, th, td{
  border-color:currentcolor;
}

figure, blockquote{
  margin:1em 5%;
}

ul, ol{
  padding-left:5%;
}

dd{
  margin-left:5%;
}

pre{
  white-space:pre-wrap;
  -ms-tab-size:2;
  -moz-tab-size:2;
  -webkit-tab-size:2;
  tab-size:2;
}

abbr[title], acronym[title]{
  text-decoration:dotted underline;
}

nobr wbr{
  white-space:normal;
}

ruby > rt, ruby > rp{
  -webkit-user-select:none;
  -moz-user-select:none;
  -ms-user-select:none;
  user-select:none;
}

*:lang(ja):not(:lang(ja-Latn)):not(:lang(ja-Cyrl)),
*:lang(zh):not(:lang(zh-Latn)):not(:lang(zh-Cyrl)),
*:lang(ko):not(:lang(ko-Latn)):not(:lang(ko-Cyrl)),
:lang(ja):not(:lang(ja-Latn)):not(:lang(ja-Cyrl)) cite, 
:lang(ja):not(:lang(ja-Latn)):not(:lang(ja-Cyrl)) dfn, 
:lang(ja):not(:lang(ja-Latn)):not(:lang(ja-Cyrl)) em, 
:lang(ja):not(:lang(ja-Latn)):not(:lang(ja-Cyrl)) i,
:lang(zh):not(:lang(zh-Latn)):not(:lang(zh-Cyrl)) cite, 
:lang(zh):not(:lang(zh-Latn)):not(:lang(zh-Cyrl)) dfn, 
:lang(zh):not(:lang(zh-Latn)):not(:lang(zh-Cyrl)) em, 
:lang(zh):not(:lang(zh-Latn)):not(:lang(zh-Cyrl)) i,
:lang(ko):not(:lang(ko-Latn)):not(:lang(ko-Cyrl)) cite, 
:lang(ko):not(:lang(ko-Latn)):not(:lang(ko-Cyrl)) dfn, 
:lang(ko):not(:lang(ko-Latn)):not(:lang(ko-Cyrl)) em, 
:lang(ko):not(:lang(ko-Latn)):not(:lang(ko-Cyrl)) i{
  font-style:normal;
}

:lang(ja) a,
:lang(zh) a,
:lang(ko) a{
  text-decoration:none;
}

:root{
  --RS__maxMediaWidth:100%;
  --RS__maxMediaHeight:95vh;
  --RS__boxSizingMedia:border-box;
  --RS__boxSizingTable:border-box;
}

a, a span, span a, h1, h2, h3, h4, h5, h6{
  word-wrap:break-word;
}

div{
  max-width:var(--RS__maxMediaWidth);
}

img, svg|svg, video{
  object-fit:contain;

  width:auto;
  height:auto;
  max-width:var(--RS__maxMediaWidth);
  max-height:var(--RS__maxMediaHeight) !important;
  box-sizing:var(--RS__boxSizingMedia);
  -webkit-column-break-inside:avoid;
  page-break-inside:avoid;
  break-inside:avoid;
}

@supports (zoom: 1) and (not ((-webkit-column-axis: horizontal) and (-webkit-column-progression: normal))){

  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] img,
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] svg|svg,
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] video{
    zoom:calc(100% / var(--USER__fontSize));
  }
}

audio{
    max-width:100%;
    -webkit-column-break-inside:avoid;
    page-break-inside:avoid;
    break-inside:avoid;
  }

table{
  max-width:var(--RS__maxMediaWidth);
  box-sizing:var(--RS__boxSizingTable);
}`},Symbol.toStringTag,{value:"Module"})),va=Object.freeze(Object.defineProperty({__proto__:null,default:`/*!
 * Readium CSS v.2.0.5
 * Copyright (c) 2017–2026. Readium Foundation. All rights reserved.
 * Use of this source code is governed by a BSD-style license which is detailed in the
 * LICENSE file present in the project repository where this source code is maintained.
 * Core maintainer: Jiminy Panoz <jiminy.panoz@edrlab.org> 
 * Contributors: 
 * Daniel Weck
 * Hadrien Gardeur
 * Innovimax
 * L. Le Meur
 * Mickaël Menu
 * k_taka
 */

@namespace url("http://www.w3.org/1999/xhtml");

@namespace epub url("http://www.idpf.org/2007/ops");

@namespace m url("http://www.w3.org/1998/Math/MathML");

@namespace svg url("http://www.w3.org/2000/svg");

:root{

  --RS__compFontFamily:var(--RS__baseFontFamily);
  --RS__codeFontFamily:var(--RS__monospaceTf);

  --RS__typeScale:1.125;
  --RS__baseFontSize:87.5%;

  --RS__flowSpacing:1.5rem;
  --RS__paraSpacing:0;
  --RS__paraIndent:1em;

  --RS__linkColor:#0000EE;
  --RS__visitedColor:#551A8B;

  --RS__primaryColor:;
  --RS__secondaryColor:;
}

:root:lang(zh){
  --RS__paraIndent:2em;
}

:root{
  quotes:"\\201c" "\\201d" "\\2018" "\\2019";
}

body{
  font-size:var(--RS__baseFontSize);
  text-align:justify;
  text-justify:inter-character;
}

h1, h2, h3, h4, h5, h6{
  font-family:var(--RS__baseFontFamily);
  text-align:left;
  text-align:start;
}

blockquote, figure, p, pre,
aside, footer, form, hr{
  margin-top:var(--RS__flowSpacing);
  margin-bottom:var(--RS__flowSpacing);
}

p{
  margin-top:var(--RS__paraSpacing);
  margin-bottom:var(--RS__paraSpacing);
  text-indent:var(--RS__paraIndent);
}

pre{
  font-family:var(--RS__codeFontFamily);
}

code, kbd, samp, tt{
  font-family:var(--RS__codeFontFamily);
}

sub, sup{
  position:relative;
  font-size:67.5%;
  line-height:1;
}

sub{
  bottom:-0.2ex;
}

sup{
  bottom:0;
}

em{
  -webkit-text-emphasis:dot;
  -epub-text-emphasis:dot;
  text-emphasis:dot;
}

:link{
  color:var(--RS__linkColor);
}

:visited{
  color:var(--RS__visitedColor);
}

h1{
  margin-top:calc(var(--RS__flowSpacing) * 2);
  margin-bottom:calc(var(--RS__flowSpacing) * 2);
  font-size:calc(((1em * var(--RS__typeScale)) * var(--RS__typeScale)) * var(--RS__typeScale));
  text-align:center;
}

h2{
  margin-top:calc(var(--RS__flowSpacing) * 2);
  margin-bottom:var(--RS__flowSpacing);
  font-size:calc((1em * var(--RS__typeScale)) * var(--RS__typeScale));
  text-align:center;
}

h3{
  margin-top:var(--RS__flowSpacing);
  margin-bottom:var(--RS__flowSpacing);
  font-size:calc(1em * var(--RS__typeScale));
  text-align:center;
}

h4{
  margin-top:var(--RS__flowSpacing);
  margin-bottom:var(--RS__flowSpacing);
  font-family:var(--RS__compFontFamily);
  font-size:1em;
}

h5{
  margin-top:var(--RS__flowSpacing);
  margin-bottom:var(--RS__flowSpacing);
  font-family:var(--RS__compFontFamily);
  font-size:smaller;
}

h6{
  margin-top:var(--RS__flowSpacing);
  margin-bottom:0;
  font-family:var(--RS__compFontFamily);
  font-size:smaller;
  font-weight:normal;
}

dl, ol, ul{
  margin-top:var(--RS__flowSpacing);
  margin-bottom:var(--RS__flowSpacing);
}

table{
  margin:var(--RS__flowSpacing) 0;
  border:1px solid currentcolor;
  border-collapse:collapse;
  empty-cells:show;
}

thead, tbody, tfoot, table > tr{
  vertical-align:top;
}

th{
  text-align:left;
}

th, td{
  padding:4px;
  border:1px solid currentcolor;
}`},Symbol.toStringTag,{value:"Module"})),wa=Object.freeze(Object.defineProperty({__proto__:null,default:`/*!
 * Readium CSS v.2.0.5
 * Copyright (c) 2017–2026. Readium Foundation. All rights reserved.
 * Use of this source code is governed by a BSD-style license which is detailed in the
 * LICENSE file present in the project repository where this source code is maintained.
 * Core maintainer: Jiminy Panoz <jiminy.panoz@edrlab.org> 
 * Contributors: 
 * Daniel Weck
 * Hadrien Gardeur
 * Innovimax
 * L. Le Meur
 * Mickaël Menu
 * k_taka
 */

@namespace url("http://www.w3.org/1999/xhtml");

@namespace epub url("http://www.idpf.org/2007/ops");

@namespace m url("http://www.w3.org/1998/Math/MathML");

@namespace svg url("http://www.w3.org/2000/svg");

:root{

  --RS__viewportWidth:100%;

  --RS__pageGutter:0;

  --RS__defaultLineLength:100%;

  --RS__colGap:0;

  --RS__colCount:1;

  --RS__colWidth:100vw;
}

@page{
  margin:0 !important;
}

:root{
  position:relative;

  -webkit-column-width:var(--RS__colWidth);
  -moz-column-width:var(--RS__colWidth);
  column-width:var(--RS__colWidth);
  -webkit-column-count:var(--RS__colCount);
  -moz-column-count:var(--RS__colCount);
  column-count:var(--RS__colCount);

  -webkit-column-gap:var(--RS__colGap);
  -moz-column-gap:var(--RS__colGap);
  column-gap:var(--RS__colGap);
  -moz-column-fill:auto;
  column-fill:auto;
  width:var(--RS__viewportWidth);
  height:100vh;
  max-width:var(--RS__viewportWidth);
  max-height:100vh;
  min-width:var(--RS__viewportWidth);
  min-height:100vh;
  padding:0 !important;
  margin:0 !important;
  font-size:1rem !important;
  box-sizing:border-box;
  -webkit-touch-callout:none;
}

body{
  width:100%;
  max-width:var(--RS__defaultLineLength) !important;
  margin:0 auto !important;
  box-sizing:border-box;
}

:root:not([style*="readium-scroll-on"]) body{
  padding:0 var(--RS__pageGutter) !important;
}

:root:not([style*="readium-noOverflow-on"]) body{
  overflow:hidden;
}

@supports (overflow: clip){

   :root:not([style*="readium-noOverflow-on"]){
      overflow:clip;
   }

   :root:not([style*="readium-noOverflow-on"]) body{
      overflow:clip;
      overflow-clip-margin:content-box;
   }
}

:root[style*="readium-scroll-on"]{
  -webkit-columns:auto auto !important;
  -moz-columns:auto auto !important;
  columns:auto auto !important;
  width:auto !important;
  height:auto !important;
  max-width:none !important;
  max-height:none !important;
  min-width:0 !important;
  min-height:0 !important;
}

:root[style*="readium-scroll-on"] body{
  max-width:var(--RS__defaultLineLength) !important;
  box-sizing:border-box !important;
}

:root[style*="readium-scroll-on"]:not([style*="readium-noOverflow-on"]) body{
  overflow:auto;
}

@supports (overflow: clip){

  :root[style*="readium-scroll-on"]:not([style*="readium-noOverflow-on"]){
     overflow:auto;
  }

  :root[style*="readium-scroll-on"]:not([style*="readium-noOverflow-on"]) body{
     overflow:clip;
  }
}

:root[style*="readium-scroll-on"][style*="--RS__scrollPaddingTop"] body{
  padding-top:var(--RS__scrollPaddingTop) !important;
}

:root[style*="readium-scroll-on"][style*="--RS__scrollPaddingBottom"] body{
  padding-bottom:var(--RS__scrollPaddingBottom) !important;
}

:root[style*="readium-scroll-on"][style*="--RS__scrollPaddingLeft"] body{
  padding-left:var(--RS__scrollPaddingLeft) !important;
}

:root[style*="readium-scroll-on"][style*="--RS__scrollPaddingRight"] body{
  padding-right:var(--RS__scrollPaddingRight) !important;
}

:root[style*="--USER__backgroundColor"]{
  background-color:var(--USER__backgroundColor) !important;
}

:root[style*="--USER__backgroundColor"] *{
  background-color:transparent !important;
}

:root[style*="--USER__textColor"]{
  color:var(--USER__textColor) !important;
}

:root[style*="--USER__textColor"] *:not(a){
  color:inherit !important;
  background-color:transparent !important;
  border-color:currentcolor !important;
}

:root[style*="--USER__textColor"] svg text{
  fill:currentcolor !important;
  stroke:none !important;
}

:root[style*="--USER__linkColor"] a:link,
:root[style*="--USER__linkColor"] a:link *{
  color:var(--USER__linkColor) !important;
}

:root[style*="--USER__visitedColor"] a:visited,
:root[style*="--USER__visitedColor"] a:visited *{
  color:var(--USER__visitedColor) !important;
}

:root[style*="--USER__selectionBackgroundColor"][style*="--USER__selectionTextColor"] ::-moz-selection{
  color:var(--USER__selectionTextColor) !important;
  background-color:var(--USER__selectionBackgroundColor) !important;
}

:root[style*="--USER__selectionBackgroundColor"][style*="--USER__selectionTextColor"] ::selection{
  color:var(--USER__selectionTextColor) !important;
  background-color:var(--USER__selectionBackgroundColor) !important;
}

:root[style*="--USER__colCount"]{
  -webkit-column-count:var(--USER__colCount);
  -moz-column-count:var(--USER__colCount);
  column-count:var(--USER__colCount);

  --RS__colWidth:auto;
}

:root[style*="--USER__colCount: 0"],
:root[style*="--USER__colCount:0"]{
  -webkit-column-count:1;
  -moz-column-count:1;
  column-count:1;
}

:root[style*="--USER__colCount: 0"],
:root[style*="--USER__colCount:0"],
:root[style*="--USER__colCount: 1"],
:root[style*="--USER__colCount:1"]{
  --RS__colWidth:100vw;
}

:root[style*="--USER__lineLength"] body{
    max-width:var(--USER__lineLength) !important;
  }

:root[style*="--USER__fontFamily"]{
  font-family:var(--USER__fontFamily) !important;
}

:root[style*="--USER__fontFamily"] *{
  font-family:revert !important;
}

:root:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] body{
  zoom:var(--USER__fontSize) !important;
}

:root:not([style*="readium-deprecatedFontSize-on"])[style*="readium-iOSPatch-on"][style*="--USER__fontSize"] body{
  -webkit-text-size-adjust:var(--USER__fontSize) !important;
}

@supports selector(figure:has(> img)){

  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] figure:has(> img),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] figure:has(> video),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] figure:has(> svg),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] figure:has(> canvas),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] figure:has(> iframe),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] figure:has(> audio),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] div:has(> img:only-child),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] div:has(> video:only-child),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] div:has(> svg:only-child),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] div:has(> canvas:only-child),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] div:has(> iframe:only-child),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] div:has(> audio:only-child),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] table{
    zoom:calc(100% / var(--USER__fontSize)) !important;
  }

  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] figcaption,
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] caption,
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] td,
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] th{
    zoom:var(--USER__fontSize) !important;
  }
}

@supports not (zoom: 1){

  :root[style*="--USER__fontSize"]{
    font-size:var(--USER__fontSize) !important;
  }
}

:root[style*="readium-deprecatedFontSize-on"][style*="--USER__fontSize"]{
  font-size:var(--USER__fontSize) !important;
}

:root[style*="--USER__lineHeight"]{
  line-height:var(--USER__lineHeight) !important;
}

:root[style*="--USER__lineHeight"] body,
:root[style*="--USER__lineHeight"] p,
:root[style*="--USER__lineHeight"] li,
:root[style*="--USER__lineHeight"] div{
  line-height:var(--USER__lineHeight) !important;
}

:root[style*="--USER__paraSpacing"] p{
  margin-top:var(--USER__paraSpacing) !important;
  margin-bottom:var(--USER__paraSpacing) !important;
}

:root[style*="--USER__fontWeight"] body{
  font-weight:var(--USER__fontWeight) !important;
}

:root[style*="--USER__fontWeight"] b,
:root[style*="--USER__fontWeight"] strong{
  font-weight:bolder;
}

:root[style*="--USER__fontWidth"] body{
  font-stretch:var(--USER__fontWidth) !important;
}

:root[style*="--USER__fontOpticalSizing"] body{
  font-optical-sizing:var(--USER__fontOpticalSizing) !important;
}

:root[style*="--USER__letterSpacing"] h1,
:root[style*="--USER__letterSpacing"] h2,
:root[style*="--USER__letterSpacing"] h3,
:root[style*="--USER__letterSpacing"] h4,
:root[style*="--USER__letterSpacing"] h5,
:root[style*="--USER__letterSpacing"] h6,
:root[style*="--USER__letterSpacing"] p,
:root[style*="--USER__letterSpacing"] li,
:root[style*="--USER__letterSpacing"] div,
:root[style*="--USER__letterSpacing"] dt,
:root[style*="--USER__letterSpacing"] dd{
  letter-spacing:var(--USER__letterSpacing) !important;
  font-variant:none !important;
}

:root[style*="readium-noRuby-on"] body rt,
:root[style*="readium-noRuby-on"] body rp{
  display:none;
}

:root[style*="readium-blend-on"] svg,
:root[style*="readium-blend-on"] img{
  background-color:transparent !important;
  mix-blend-mode:multiply !important;
}

:root[style*="--USER__darkenImages"] img{
  -webkit-filter:brightness(var(--USER__darkenImages)) !important;
  filter:brightness(var(--USER__darkenImages)) !important;
}

:root[style*="readium-darken-on"] img{
  -webkit-filter:brightness(80%) !important;
  filter:brightness(80%) !important;
}

:root[style*="--USER__invertImages"] img{
  -webkit-filter:invert(var(--USER__invertImages)) !important;
  filter:invert(var(--USER__invertImages)) !important;
}

:root[style*="readium-invert-on"] img{
  -webkit-filter:invert(100%) !important;
  filter:invert(100%) !important;
}

:root[style*="--USER__darkenImages"][style*="--USER__invertImages"] img{
  -webkit-filter:brightness(var(--USER__darkenImages)) invert(var(--USER__invertImages)) !important;
  filter:brightness(var(--USER__darkenImages)) invert(var(--USER__invertImages)) !important;
}

:root[style*="readium-darken-on"][style*="--USER__invertImages"] img{
  -webkit-filter:brightness(80%) invert(var(--USER__invertImages)) !important;
  filter:brightness(80%) invert(var(--USER__invertImages)) !important;
}

:root[style*="--USER__darkenImages"][style*="readium-invert-on"] img{
  -webkit-filter:brightness(var(--USER__darkenImages)) invert(100%) !important;
  filter:brightness(var(--USER__darkenImages)) invert(100%) !important;
}

:root[style*="readium-darken-on"][style*="readium-invert-on"] img{
  -webkit-filter:brightness(80%) invert(100%) !important;
  filter:brightness(80%) invert(100%) !important;
}

:root[style*="--USER__invertGaiji"] img[class*="gaiji"]{
  -webkit-filter:invert(var(--USER__invertGaiji)) !important;
  filter:invert(var(--USER__invertGaiji)) !important;
}

:root[style*="readium-invertGaiji-on"] img[class*="gaiji"]{
  -webkit-filter:invert(100%) !important;
  filter:invert(100%) !important;
}

:root[style*="readium-normalize-on"]{
  --USER__typeScale:1.2;
}

:root[style*="readium-normalize-on"] p,
:root[style*="readium-normalize-on"] li,
:root[style*="readium-normalize-on"] div,
:root[style*="readium-normalize-on"] pre,
:root[style*="readium-normalize-on"] dd{
  font-size:1rem !important;
}

:root[style*="readium-normalize-on"] h1{
  font-size:1.75rem !important;
  font-size:calc(((1rem * var(--USER__typeScale)) * var(--USER__typeScale)) * var(--USER__typeScale)) !important;
}

:root[style*="readium-normalize-on"] h2{
  font-size:1.5rem !important;
  font-size:calc((1rem * var(--USER__typeScale)) * var(--USER__typeScale)) !important;
}

:root[style*="readium-normalize-on"] h3{
  font-size:1.25rem !important;
  font-size:calc(1rem * var(--USER__typeScale)) !important;
}

:root[style*="readium-normalize-on"] h4,
:root[style*="readium-normalize-on"] h5,
:root[style*="readium-normalize-on"] h6{
  font-size:1rem !important;
}

:root[style*="readium-normalize-on"] small{
  font-size:smaller !important;
}

:root[style*="readium-normalize-on"] sub,
:root[style*="readium-normalize-on"] sup{
  font-size:67.5% !important;
}

:root[style*="readium-normalize-on"][style*="--USER__typeScale"] h1{
  font-size:calc(((1rem * var(--USER__typeScale)) * var(--USER__typeScale)) * var(--USER__typeScale)) !important;
}

:root[style*="readium-normalize-on"][style*="--USER__typeScale"] h2{
  font-size:calc((1rem * var(--USER__typeScale)) * var(--USER__typeScale)) !important;
}

:root[style*="readium-normalize-on"][style*="--USER__typeScale"] h3{
  font-size:calc(1rem * var(--USER__typeScale)) !important;
}

:root[style*="readium-iPadOSPatch-on"] body{
  -webkit-text-size-adjust:none;
}

:root[style*="readium-iPadOSPatch-on"] p, 
:root[style*="readium-iPadOSPatch-on"] h1, 
:root[style*="readium-iPadOSPatch-on"] h2, 
:root[style*="readium-iPadOSPatch-on"] h3, 
:root[style*="readium-iPadOSPatch-on"] h4, 
:root[style*="readium-iPadOSPatch-on"] h5, 
:root[style*="readium-iPadOSPatch-on"] h6, 
:root[style*="readium-iPadOSPatch-on"] li, 
:root[style*="readium-iPadOSPatch-on"] th, 
:root[style*="readium-iPadOSPatch-on"] td, 
:root[style*="readium-iPadOSPatch-on"] dt, 
:root[style*="readium-iPadOSPatch-on"] dd, 
:root[style*="readium-iPadOSPatch-on"] pre, 
:root[style*="readium-iPadOSPatch-on"] address, 
:root[style*="readium-iPadOSPatch-on"] details, 
:root[style*="readium-iPadOSPatch-on"] summary,
:root[style*="readium-iPadOSPatch-on"] figcaption,
:root[style*="readium-iPadOSPatch-on"] div:not(:has(p, h1, h2, h3, h4, h5, h6, li, th, td, dt, dd, pre, address, aside, details, figcaption, summary)),
:root[style*="readium-iPadOSPatch-on"] aside:not(:has(p, h1, h2, h3, h4, h5, h6, li, th, td, dt, dd, pre, address, aside, details, figcaption, summary)){
  -webkit-text-zoom:reset;
}

:root[style*="readium-iPadOSPatch-on"] abbr, 
:root[style*="readium-iPadOSPatch-on"] b, 
:root[style*="readium-iPadOSPatch-on"] bdi, 
:root[style*="readium-iPadOSPatch-on"] bdo, 
:root[style*="readium-iPadOSPatch-on"] cite, 
:root[style*="readium-iPadOSPatch-on"] code, 
:root[style*="readium-iPadOSPatch-on"] dfn, 
:root[style*="readium-iPadOSPatch-on"] em, 
:root[style*="readium-iPadOSPatch-on"] i, 
:root[style*="readium-iPadOSPatch-on"] kbd, 
:root[style*="readium-iPadOSPatch-on"] mark, 
:root[style*="readium-iPadOSPatch-on"] q, 
:root[style*="readium-iPadOSPatch-on"] rp, 
:root[style*="readium-iPadOSPatch-on"] rt, 
:root[style*="readium-iPadOSPatch-on"] ruby, 
:root[style*="readium-iPadOSPatch-on"] s, 
:root[style*="readium-iPadOSPatch-on"] samp, 
:root[style*="readium-iPadOSPatch-on"] small, 
:root[style*="readium-iPadOSPatch-on"] span, 
:root[style*="readium-iPadOSPatch-on"] strong, 
:root[style*="readium-iPadOSPatch-on"] sub, 
:root[style*="readium-iPadOSPatch-on"] sup, 
:root[style*="readium-iPadOSPatch-on"] time, 
:root[style*="readium-iPadOSPatch-on"] u, 
:root[style*="readium-iPadOSPatch-on"] var{
  -webkit-text-zoom:normal;
}

:root[style*="readium-iPadOSPatch-on"] p:not(:has(b, cite, em, i, q, s, small, span, strong)):first-line{
  -webkit-text-zoom:normal;
}`},Symbol.toStringTag,{value:"Module"})),Ra=Object.freeze(Object.defineProperty({__proto__:null,default:`/*!
 * Readium CSS v.2.0.5
 * Copyright (c) 2017–2026. Readium Foundation. All rights reserved.
 * Use of this source code is governed by a BSD-style license which is detailed in the
 * LICENSE file present in the project repository where this source code is maintained.
 * Core maintainer: Jiminy Panoz <jiminy.panoz@edrlab.org> 
 * Contributors: 
 * Daniel Weck
 * Hadrien Gardeur
 * Innovimax
 * L. Le Meur
 * Mickaël Menu
 * k_taka
 */

@namespace url("http://www.w3.org/1999/xhtml");

@namespace epub url("http://www.idpf.org/2007/ops");

@namespace m url("http://www.w3.org/1998/Math/MathML");

@namespace svg url("http://www.w3.org/2000/svg");

@-ms-viewport{
  width:device-width;
}

@viewport{
  width:device-width;
  zoom:1;
}

:root{

  --RS__sans-serif-ja-v:'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Hiragino Kaku Gothic Pro', 'ヒラギノ角ゴ W3', 'YuGothic', 'Yu Gothic Medium', 'BIZ UDGothic', 'Yu Gothic', 'ＭＳゴシック', 'MS Gothic', sans-serif;

  --RS__serif-ja-v:'Hiragino Mincho ProN', 'Hiragino Mincho Pro', 'YuMincho', 'BIZ UDMincho', 'Yu Mincho', 'ＭＳ明朝', 'MS Mincho', serif;

  --RS__sans-serif-ja:'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Hiragino Kaku Gothic Pro', 'ヒラギノ角ゴ W3', 'YuGothic', 'Yu Gothic Medium', 'BIZ UDPGothic', 'Yu Gothic', 'ＭＳ Ｐゴシック', 'MS PGothic', sans-serif;

  --RS__serif-ja:'Hiragino Mincho ProN', 'Hiragino Mincho Pro', 'YuMincho', 'BIZ UDPMincho', 'Yu Mincho', 'ＭＳ Ｐ明朝', 'MS PMincho', serif;

  --RS__monospaceTf:ui-monospace, 'Andale Mono', 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace;

  --RS__humanistTf:Seravek, Calibri, 'Gill Sans Nova', Roboto, Ubuntu, 'DejaVu Sans', source-sans-pro, sans-serif;

  --RS__sansTf:-ui-sans-serif, -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI Variable', 'Segoe UI', Inter, Roboto, 'Helvetica Neue', 'Arial Nova', 'Liberation Sans', Arial, sans-serif;

  --RS__modernTf:Athelas, Constantia, Charter, 'Bitstream Charter', Cambria, 'Georgia Pro', Georgia, serif;

  --RS__oldStyleTf:'Iowan Old Style', Sitka, 'Sitka Text', Palatino, 'Book Antiqua', 'URW Palladio L', P052, serif;

  --RS__zh-HK-lineHeightCompensation:1.167;

  --RS__zh-HK-baseFontFamily:'方體', 'PingFang HK', '方體', 'PingFang TC', '黑體', 'Heiti TC', 'Microsoft JhengHei UI', 'Microsoft JhengHei', Roboto, Noto, 'Noto Sans CJK TC', sans-serif;

  --RS__zh-TW-lineHeightCompensation:1.167;

  --RS__zh-TW-baseFontFamily:'方體', 'PingFang TC', '黑體', 'Heiti TC', 'Microsoft JhengHei UI', 'Microsoft JhengHei', Roboto, Noto, 'Noto Sans CJK TC', sans-serif;

  --RS__zh-Hant-lineHeightCompensation:1.167;

  --RS__zh-Hant-baseFontFamily:'方體', 'PingFang TC', '黑體', 'Heiti TC', 'Microsoft JhengHei UI', 'Microsoft JhengHei', Roboto, Noto, 'Noto Sans CJK TC', sans-serif;

  --RS__zh-lineHeightCompensation:1.167;

  --RS__zh-baseFontFamily:'方体', 'PingFang SC', '黑体', 'Heiti SC', 'Microsoft JhengHei UI', 'Microsoft JhengHei', Roboto, Noto, 'Noto Sans CJK SC', sans-serif;

  --RS__th-lineHeightCompensation:1.067;

  --RS__th-baseFontFamily:Thonburi, 'Leelawadee UI', 'Cordia New', Roboto, Noto, 'Noto Sans Thai', sans-serif;

  --RS__te-baseFontFamily:'Kohinoor Telugu', 'Telugu Sangam MN', 'Nirmala UI', Gautami, Roboto, Noto, 'Noto Sans Telugu', sans-serif;

  --RS__ta-lineHeightCompensation:1.067;

  --RS__ta-baseFontFamily:'Tamil Sangam MN', 'Nirmala UI', Latha, Roboto, Noto, 'Noto Sans Tamil', sans-serif;

  --RS__si-lineHeightCompensation:1.167;

  --RS__si-baseFontFamily:'Sinhala Sangam MN', 'Nirmala UI', 'Iskoola Pota', Roboto, Noto, 'Noto Sans Sinhala', sans-serif;

  --RS__pa-lineHeightCompensation:1.1;

  --RS__pa-baseFontFamily:'Gurmukhi MN', 'Nirmala UI', Kartika, Roboto, Noto, 'Noto Sans Gurmukhi', sans-serif;

  --RS__or-lineHeightCompensation:1.167;

  --RS__or-baseFontFamily:'Oriya Sangam MN', 'Nirmala UI', Kalinga, Roboto, Noto, 'Noto Sans Oriya', sans-serif;

  --RS__ml-lineHeightCompensation:1.067;

  --RS__ml-baseFontFamily:'Malayalam Sangam MN', 'Nirmala UI', Kartika, Roboto, Noto, 'Noto Sans Malayalam', sans-serif;

  --RS__lo-baseFontFamily:'Lao Sangam MN', 'Leelawadee UI', 'Lao UI', Roboto, Noto, 'Noto Sans Lao', sans-serif;

  --RS__ko-lineHeightCompensation:1.167;

  --RS__ko-baseFontFamily:'Nanum Gothic', 'Apple SD Gothic Neo', 'Malgun Gothic', Roboto, Noto, 'Noto Sans CJK KR', sans-serif;

  --RS__kn-lineHeightCompensation:1.1;

  --RS__kn-baseFontFamily:'Kannada Sangam MN', 'Nirmala UI', Tunga, Roboto, Noto, 'Noto Sans Kannada', sans-serif;

  --RS__km-lineHeightCompensation:1.067;

  --RS__km-baseFontFamily:'Khmer Sangam MN', 'Leelawadee UI', 'Khmer UI', Roboto, Noto, 'Noto Sans Khmer', sans-serif;

  --RS__ja-lineHeightCompensation:1.167;

  --RS__ja-baseFontFamily:YuGothic, 'Hiragino Maru Gothic ProN', 'Hiragino Sans', 'Yu Gothic UI', 'Meiryo UI', 'MS Gothic', Roboto, Noto, 'Noto Sans CJK JP', sans-serif;

  --RS__iu-baseFontFamily:'Euphemia UCAS', Euphemia, Roboto, Noto, 'Noto Sans Canadian Aboriginal', sans-serif;

  --RS__hy-baseFontFamily:Mshtakan, Sylfaen, Roboto, Noto, 'Noto Serif Armenian', serif;

  --RS__hi-lineHeightCompensation:1.1;

  --RS__hi-baseFontFamily:'Kohinoor Devanagari', 'Devanagari Sangam MN', Kokila, 'Nirmala UI', Roboto, Noto, 'Noto Sans Devanagari', sans-serif;

  --RS__he-lineHeightCompensation:1.1;

  --RS__he-baseFontFamily:'New Peninim MT', 'Arial Hebrew', Gisha, 'Times New Roman', Roboto, Noto, 'Noto Sans Hebrew', sans-serif;

  --RS__gu-lineHeightCompensation:1.167;

  --RS__gu-baseFontFamily:'Gujarati Sangam MN', 'Nirmala UI', Shruti, Roboto, Noto, 'Noto Sans Gujarati', sans-serif;

  --RS__fa-baseFontFamily:'Geeza Pro', 'Arabic Typesetting', Roboto, Noto, 'Noto Naskh Arabic', 'Times New Roman', serif;

  --RS__chr-lineHeightCompensation:1.167;

  --RS__chr-baseFontFamily:'Plantagenet Cherokee', Roboto, Noto, 'Noto Sans Cherokee';

  --RS__bo-baseFontFamily:Kailasa, 'Microsoft Himalaya', Roboto, Noto, 'Noto Sans Tibetan', sans-serif;

  --RS__bn-lineHeightCompensation:1.067;

  --RS__bn-baseFontFamily:'Kohinoor Bangla', 'Bangla Sangam MN', Vrinda, Roboto, Noto, 'Noto Sans Bengali', sans-serif;

  --RS__ar-baseFontFamily:'Geeza Pro', 'Arabic Typesetting', Roboto, Noto, 'Noto Naskh Arabic', 'Times New Roman', serif;

  --RS__am-lineHeightCompensation:1.167;

  --RS__am-baseFontFamily:Kefa, Nyala, Roboto, Noto, 'Noto Sans Ethiopic', serif;

  --RS__latin-lineHeightCompensation:1;

  --RS__latin-baseFontFamily:var(--RS__oldStyleTf);
  --RS__baseFontFamily:var(--RS__latin-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__latin-lineHeightCompensation);
  --RS__baseLineHeight:calc(1.5 * var(--RS__lineHeightCompensation));

  --RS__selectionTextColor:inherit;

  --RS__selectionBackgroundColor:#b4d8fe;

  --RS__visitedColor:#551A8B;

  --RS__linkColor:#0000EE;

  --RS__textColor:#121212;

  --RS__backgroundColor:#FFFFFF;
  color:var(--RS__textColor) !important;

  background-color:var(--RS__backgroundColor) !important;
}

::-moz-selection{
  color:var(--RS__selectionTextColor);
  background-color:var(--RS__selectionBackgroundColor);
}

::selection{
  color:var(--RS__selectionTextColor);
  background-color:var(--RS__selectionBackgroundColor);
}

html{
  font-family:var(--RS__baseFontFamily);
  line-height:1.6;
  line-height:var(--RS__baseLineHeight);
  text-rendering:optimizelegibility;
}

h1, h2, h3{
  line-height:normal;
}

:lang(ja),
:lang(zh),
:lang(ko){
  word-wrap:break-word;
  -webkit-line-break:strict;
  -epub-line-break:strict;
  line-break:strict;
}

math{
  font-family:"Latin Modern Math", "STIX Two Math", "XITS Math", "STIX Math", "Libertinus Math", "TeX Gyre Termes Math", "TeX Gyre Bonum Math", "TeX Gyre Schola", "DejaVu Math TeX Gyre", "TeX Gyre Pagella Math", "Asana Math", "Cambria Math", "Lucida Bright Math", "Minion Math", STIXGeneral, STIXSizeOneSym, Symbol, "Times New Roman", serif;
}

:lang(am){
  --RS__baseFontFamily:var(--RS__am-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__am-lineHeightCompensation);
}

:lang(ar){
  --RS__baseFontFamily:var(--RS__ar-baseFontFamily);
}

:lang(bn){
  --RS__baseFontFamily:var(--RS__bn-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__bn-lineHeightCompensation);
}

:lang(bo){
  --RS__baseFontFamily:var(--RS__bo-baseFontFamily);
}

:lang(chr){
  --RS__baseFontFamily:var(--RS__chr-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__chr-lineHeightCompensation);
}

:lang(fa){
  --RS__baseFontFamily:var(--RS__fa-baseFontFamily);
}

:lang(gu){
  --RS__baseFontFamily:var(--RS__gu-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__gu-lineHeightCompensation);
}

:lang(he){
  --RS__baseFontFamily:var(--RS__he-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__he-lineHeightCompensation);
}

:lang(hi){
  --RS__baseFontFamily:var(--RS__hi-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__hi-lineHeightCompensation);
}

:lang(hy){
  --RS__baseFontFamily:var(--RS__hy-baseFontFamily);
}

:lang(iu){
  --RS__baseFontFamily:var(--RS__iu-baseFontFamily);
}

:lang(ja){
  --RS__baseFontFamily:var(--RS__ja-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__ja-lineHeightCompensation);
}

:lang(km){
  --RS__baseFontFamily:var(--RS__km-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__km-lineHeightCompensation);
}

:lang(kn){
  --RS__baseFontFamily:var(--RS__kn-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__kn-lineHeightCompensation);
}

:lang(ko){
  --RS__baseFontFamily:var(--RS__ko-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__ko-lineHeightCompensation);
}

:lang(lo){
  --RS__baseFontFamily:var(--RS__lo-baseFontFamily);
}

:lang(ml){
  --RS__baseFontFamily:var(--RS__ml-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__ml-lineHeightCompensation);
}

:lang(or){
  --RS__baseFontFamily:var(--RS__or-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__or-lineHeightCompensation);
}

:lang(pa){
  --RS__baseFontFamily:var(--RS__pa-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__pa-lineHeightCompensation);
}

:lang(si){
  --RS__baseFontFamily:var(--RS__si-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__si-lineHeightCompensation);
}

:lang(ta){
  --RS__baseFontFamily:var(--RS__ta-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__ta-lineHeightCompensation);
}

:lang(te){
  --RS__baseFontFamily:var(--RS__te-baseFontFamily);
}

:lang(th){
  --RS__baseFontFamily:var(--RS__th-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__th-lineHeightCompensation);
}

:lang(zh){
  --RS__baseFontFamily:var(--RS__zh-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__zh-lineHeightCompensation);
}

:lang(zh-Hant){
  --RS__baseFontFamily:var(--RS__zh-Hant-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__zh-Hant-lineHeightCompensation);
}

:lang(zh-TW){
  --RS__baseFontFamily:var(--RS__zh-TW-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__zh-TW-lineHeightCompensation);
}

:lang(zh-HK){
  --RS__baseFontFamily:var(--RS__zh-HK-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__zh-HK-lineHeightCompensation);
}

body{
  widows:2;
  orphans:2;
}

figcaption, th, td{
  widows:1;
  orphans:1;
}

h2, h3, h4, h5, h6, dt,
hr, caption{
  -webkit-column-break-after:avoid;
  page-break-after:avoid;
  break-after:avoid;
}

h1, h2, h3, h4, h5, h6, dt,
figure, tr{
  -webkit-column-break-inside:avoid;
  page-break-inside:avoid;
  break-inside:avoid;
}

body{
  -webkit-hyphenate-character:"\\002D";
  -moz-hyphenate-character:"\\002D";
  -ms-hyphenate-character:"\\002D";
  hyphenate-character:"\\002D";
  -webkit-hyphenate-limit-lines:3;
  -ms-hyphenate-limit-lines:3;
  hyphenate-limit-lines:3;
}

h1, h2, h3, h4, h5, h6, dt,
figcaption, pre, caption, address,
center, code, var{
  -ms-hyphens:none;
  -moz-hyphens:none;
  -webkit-hyphens:none;
  -epub-hyphens:none;
  hyphens:none;
}

body{
  font-variant-numeric:oldstyle-nums proportional-nums;
}

:lang(ja) body,
:lang(zh) body,
:lang(ko) body{
  font-variant-numeric:lining-nums proportional-nums;
}

h1, h2, h3, h4, h5, h6, dt{
  font-variant-numeric:lining-nums proportional-nums;
}

table{
  font-variant-numeric:lining-nums tabular-nums;
}

code, var{
  font-variant-ligatures:none;
  font-variant-numeric:lining-nums tabular-nums slashed-zero;
}

rt{
  font-variant-east-asian:ruby;
}

:lang(ar){
  font-variant-ligatures:common-ligatures;
}

:lang(ko){
  font-kerning:normal;
}

hr{
  color:inherit;
  border-color:currentcolor;
}

table, th, td{
  border-color:currentcolor;
}

figure, blockquote{
  margin:1em 5%;
}

ul, ol{
  padding-left:5%;
}

dd{
  margin-left:5%;
}

pre{
  white-space:pre-wrap;
  -ms-tab-size:2;
  -moz-tab-size:2;
  -webkit-tab-size:2;
  tab-size:2;
}

abbr[title], acronym[title]{
  text-decoration:dotted underline;
}

nobr wbr{
  white-space:normal;
}

ruby > rt, ruby > rp{
  -webkit-user-select:none;
  -moz-user-select:none;
  -ms-user-select:none;
  user-select:none;
}

*:lang(ja):not(:lang(ja-Latn)):not(:lang(ja-Cyrl)),
*:lang(zh):not(:lang(zh-Latn)):not(:lang(zh-Cyrl)),
*:lang(ko):not(:lang(ko-Latn)):not(:lang(ko-Cyrl)),
:lang(ja):not(:lang(ja-Latn)):not(:lang(ja-Cyrl)) cite, 
:lang(ja):not(:lang(ja-Latn)):not(:lang(ja-Cyrl)) dfn, 
:lang(ja):not(:lang(ja-Latn)):not(:lang(ja-Cyrl)) em, 
:lang(ja):not(:lang(ja-Latn)):not(:lang(ja-Cyrl)) i,
:lang(zh):not(:lang(zh-Latn)):not(:lang(zh-Cyrl)) cite, 
:lang(zh):not(:lang(zh-Latn)):not(:lang(zh-Cyrl)) dfn, 
:lang(zh):not(:lang(zh-Latn)):not(:lang(zh-Cyrl)) em, 
:lang(zh):not(:lang(zh-Latn)):not(:lang(zh-Cyrl)) i,
:lang(ko):not(:lang(ko-Latn)):not(:lang(ko-Cyrl)) cite, 
:lang(ko):not(:lang(ko-Latn)):not(:lang(ko-Cyrl)) dfn, 
:lang(ko):not(:lang(ko-Latn)):not(:lang(ko-Cyrl)) em, 
:lang(ko):not(:lang(ko-Latn)):not(:lang(ko-Cyrl)) i{
  font-style:normal;
}

:lang(ja) a,
:lang(zh) a,
:lang(ko) a{
  text-decoration:none;
}

:root{
  --RS__maxMediaWidth:100%;
  --RS__maxMediaHeight:100vw;
  --RS__boxSizingMedia:border-box;
  --RS__boxSizingTable:border-box;
}

a, a span, span a, h1, h2, h3, h4, h5, h6{
  word-wrap:break-word;
}

div{
  max-width:var(--RS__maxMediaHeight);
}

img, svg|svg, video{
  object-fit:contain;

  width:auto;
  height:auto;
  max-width:var(--RS__maxMediaHeight);
  max-height:var(--RS__maxMediaWidth) !important;
  box-sizing:var(--RS__boxSizingMedia);
  -webkit-column-break-inside:avoid;
  page-break-inside:avoid;
  break-inside:avoid;
}

@supports (zoom: 1) and (not ((-webkit-column-axis: horizontal) and (-webkit-column-progression: normal))){

  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] img,
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] svg|svg,
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] video,
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] div{
    zoom:calc(100% / var(--USER__fontSize));
  }
}

audio{
  max-width:100%;
  -webkit-column-break-inside:avoid;
  page-break-inside:avoid;
  break-inside:avoid;
}

table{
  max-height:var(--RS__maxMediaWidth);
  box-sizing:var(--RS__boxSizingTable);
}`},Symbol.toStringTag,{value:"Module"})),Pa=Object.freeze(Object.defineProperty({__proto__:null,default:`/*!
 * Readium CSS v.2.0.5
 * Copyright (c) 2017–2026. Readium Foundation. All rights reserved.
 * Use of this source code is governed by a BSD-style license which is detailed in the
 * LICENSE file present in the project repository where this source code is maintained.
 * Core maintainer: Jiminy Panoz <jiminy.panoz@edrlab.org> 
 * Contributors: 
 * Daniel Weck
 * Hadrien Gardeur
 * Innovimax
 * L. Le Meur
 * Mickaël Menu
 * k_taka
 */

@namespace url("http://www.w3.org/1999/xhtml");

@namespace epub url("http://www.idpf.org/2007/ops");

@namespace m url("http://www.w3.org/1998/Math/MathML");

@namespace svg url("http://www.w3.org/2000/svg");

:root{

  --RS__compFontFamily:var(--RS__baseFontFamily);
  --RS__codeFontFamily:var(--RS__monospaceTf);

  --RS__typeScale:1.125;
  --RS__baseFontSize:87.5%;

  --RS__flowSpacing:1.5rem;
  --RS__paraSpacing:0;
  --RS__paraIndent:1em;

  --RS__linkColor:#0000EE;
  --RS__visitedColor:#551A8B;

  --RS__primaryColor:;
  --RS__secondaryColor:;
}

:root:lang(zh){
  --RS__paraIndent:2em;
}

:lang("mn-Mong"){
  --RS__baseFontSize:100%;
}

body{
  font-size:var(--RS__baseFontSize);
  text-align:justify;
  text-justify:inter-character;
}

h1, h2, h3, h4, h5, h6{
  font-family:var(--RS__baseFontFamily);
  text-align:left;
  text-align:start;
}

blockquote, figure, p, pre,
aside, footer, form, hr{
  margin-right:var(--RS__flowSpacing);
  margin-left:var(--RS__flowSpacing);
}

p{
  margin-right:var(--RS__paraSpacing);
  margin-left:var(--RS__paraSpacing);
  text-indent:var(--RS__paraIndent);
}

pre{
  font-family:var(--RS__codeFontFamily);
}

code, kbd, samp, tt{
  font-family:var(--RS__codeFontFamily);
}

sub, sup{
  position:relative;
  font-size:67.5%;
  line-height:1;
}

sub{
  left:-0.2ex;
}

sup{
  right:0;
}

em{
  -webkit-text-emphasis:sesame;
  -epub-text-emphasis:sesame;
  text-emphasis:sesame;
}

:link{
  color:var(--RS__linkColor);
}

:visited{
  color:var(--RS__visitedColor);
}

h1{
  margin-right:calc(var(--RS__flowSpacing) * 2);
  margin-left:calc(var(--RS__flowSpacing) * 2);
  font-size:calc(((1em * var(--RS__typeScale)) * var(--RS__typeScale)) * var(--RS__typeScale));
  text-indent:2rem;
}

h2{
  margin-right:calc(var(--RS__flowSpacing) * 2);
  margin-left:var(--RS__flowSpacing);
  font-size:calc((1em * var(--RS__typeScale)) * var(--RS__typeScale));
  text-indent:3rem;
}

h3{
  margin-right:var(--RS__flowSpacing);
  margin-left:var(--RS__flowSpacing);
  font-size:calc(1em * var(--RS__typeScale));
  text-indent:4rem;
}

h4{
  margin-right:var(--RS__flowSpacing);
  margin-left:var(--RS__flowSpacing);
  font-family:var(--RS__compFontFamily);
  font-size:1em;
  text-indent:4rem;
}

h5{
  margin-right:var(--RS__flowSpacing);
  margin-left:var(--RS__flowSpacing);
  font-family:var(--RS__compFontFamily);
  font-size:smaller;
  text-indent:4rem;
}

h6{
  margin-right:var(--RS__flowSpacing);
  margin-left:0;
  font-family:var(--RS__compFontFamily);
  font-size:smaller;
  font-weight:normal;
  text-indent:4rem;
}

dl, ol, ul{
  margin-right:var(--RS__flowSpacing);
  margin-left:var(--RS__flowSpacing);
}

table{
  margin:0 var(--RS__flowSpacing);
  border:1px solid currentcolor;
  border-collapse:collapse;
  empty-cells:show;
}

thead, tbody, tfoot, table > tr{
  vertical-align:top;
}

th{
  text-align:left;
}

th, td{
  padding:4px;
  border:1px solid currentcolor;
}`},Symbol.toStringTag,{value:"Module"})),Ca=Object.freeze(Object.defineProperty({__proto__:null,default:`/*!
 * Readium CSS v.2.0.5
 * Copyright (c) 2017–2026. Readium Foundation. All rights reserved.
 * Use of this source code is governed by a BSD-style license which is detailed in the
 * LICENSE file present in the project repository where this source code is maintained.
 * Core maintainer: Jiminy Panoz <jiminy.panoz@edrlab.org> 
 * Contributors: 
 * Daniel Weck
 * Hadrien Gardeur
 * Innovimax
 * L. Le Meur
 * Mickaël Menu
 * k_taka
 */

@namespace url("http://www.w3.org/1999/xhtml");

@namespace epub url("http://www.idpf.org/2007/ops");

@namespace m url("http://www.w3.org/1998/Math/MathML");

@namespace svg url("http://www.w3.org/2000/svg");

:root{

   --RS__viewportWidth:100%;

   --RS__pageGutter:0;

   --RS__defaultLineLength:100%;

   --RS__colGap:0;

   --RS__colCount:1;

   --RS__colWidth:100vw;
}

@page{
  margin:0 !important;
}

:root{
  position:relative;

  -webkit-column-width:var(--RS__colWidth);
  -moz-column-width:var(--RS__colWidth);
  column-width:var(--RS__colWidth);
  -webkit-column-count:var(--RS__colCount);
  -moz-column-count:var(--RS__colCount);
  column-count:var(--RS__colCount);

  -webkit-column-gap:var(--RS__colGap);
  -moz-column-gap:var(--RS__colGap);
  column-gap:var(--RS__colGap);
  -moz-column-fill:auto;
  column-fill:auto;
  width:100%;
  height:100vh;
  max-width:100%;
  max-height:100vh;
  min-width:100%;
  min-height:100vh;
  padding:0 !important;
  margin:0 !important;
  font-size:1rem !important;
  box-sizing:border-box;

  hanging-punctuation:last allow-end;
  -webkit-touch-callout:none;
  -ms-writing-mode:tb-rl;
  -webkit-writing-mode:vertical-rl;
  writing-mode:vertical-rl;
}

:root:lang(mn-Mong){
  -ms-writing-mode:tb;
  -webkit-writing-mode:vertical-lr;
  writing-mode:vertical-lr;
}

body{
  width:100%;
  max-height:var(--RS__defaultLineLength) !important;
  margin:auto 0 !important;
  box-sizing:border-box;
}

:root:not([style*="readium-scroll-on"]) body{
  padding:var(--RS__pageGutter) 0 !important;
}

:root:not([style*="readium-noOverflow-on"]) body{
  overflow:hidden;
}

@supports (overflow: clip){

  :root:not([style*="readium-noOverflow-on"]){
     overflow:clip;
  }

  :root:not([style*="readium-noOverflow-on"]) body{
     overflow:clip;
     overflow-clip-margin:content-box;
  }
}

:root[style*="readium-scroll-on"],
:root[style*="readium-noVerticalPagination-on"]{
  -webkit-columns:auto auto !important;
  -moz-columns:auto auto !important;
  columns:auto auto !important;
  width:auto !important;
  max-width:none !important;
  max-height:100vh !important;
  min-width:0 !important;
}

:root[style*="readium-scroll-on"] body,
:root[style*="readium-noVerticalPagination-on"] body{
  max-width:var(--RS__defaultLineLength) !important;
  box-sizing:border-box !important;
}

@supports (overflow: clip){

  :root[style*="readium-scroll-on"]:not([style*="readium-noOverflow-on"]){
     overflow:auto;
  }

  :root[style*="readium-scroll-on"]:not([style*="readium-noOverflow-on"]) body{
     overflow:clip;
  }
}

:root[style*="readium-scroll-on"][style*="--RS__scrollPaddingTop"] body{
  padding-top:var(--RS__scrollPaddingTop) !important;
}

:root[style*="readium-scroll-on"][style*="--RS__scrollPaddingBottom"] body{
  padding-bottom:var(--RS__scrollPaddingBottom) !important;
}

:root[style*="readium-scroll-on"][style*="--RS__scrollPaddingLeft"] body{
  padding-left:var(--RS__scrollPaddingLeft) !important;
}

:root[style*="readium-scroll-on"][style*="--RS__scrollPaddingRight"] body{
  padding-right:var(--RS__scrollPaddingRight) !important;
}

:root[style*="--USER__backgroundColor"]{
  background-color:var(--USER__backgroundColor) !important;
}

:root[style*="--USER__backgroundColor"] *{
  background-color:transparent !important;
}

:root[style*="--USER__textColor"]{
  color:var(--USER__textColor) !important;
}

:root[style*="--USER__textColor"] *:not(a){
  color:inherit !important;
  background-color:transparent !important;
  border-color:currentcolor !important;
}

:root[style*="--USER__textColor"] svg text{
  fill:currentcolor !important;
  stroke:none !important;
}

:root[style*="--USER__linkColor"] a:link,
:root[style*="--USER__linkColor"] a:link *{
  color:var(--USER__linkColor) !important;
}

:root[style*="--USER__visitedColor"] a:visited,
:root[style*="--USER__visitedColor"] a:visited *{
  color:var(--USER__visitedColor) !important;
}

:root[style*="--USER__selectionBackgroundColor"][style*="--USER__selectionTextColor"] ::-moz-selection{
  color:var(--USER__selectionTextColor) !important;
  background-color:var(--USER__selectionBackgroundColor) !important;
}

:root[style*="--USER__selectionBackgroundColor"][style*="--USER__selectionTextColor"] ::selection{
  color:var(--USER__selectionTextColor) !important;
  background-color:var(--USER__selectionBackgroundColor) !important;
}

:root[style*="--USER__lineLength"] body{
    max-height:var(--USER__lineLength) !important;
  }

:root[style*="--USER__fontFamily"]{
  font-family:var(--USER__fontFamily) !important;
}

:root[style*="--USER__fontFamily"] *{
  font-family:revert !important;
}

:root:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] body{
  zoom:var(--USER__fontSize) !important;
}

:root:not([style*="readium-deprecatedFontSize-on"])[style*="readium-iOSPatch-on"][style*="--USER__fontSize"] body{
  -webkit-text-size-adjust:var(--USER__fontSize) !important;
}

@supports selector(figure:has(> img)){

  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] figure:has(> img),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] figure:has(> video),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] figure:has(> svg),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] figure:has(> canvas),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] figure:has(> iframe),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] figure:has(> audio),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] div:has(> img:only-child),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] div:has(> video:only-child),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] div:has(> svg:only-child),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] div:has(> canvas:only-child),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] div:has(> iframe:only-child),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] div:has(> audio:only-child),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] table{
    zoom:calc(100% / var(--USER__fontSize)) !important;
  }

  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] figcaption,
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] caption,
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] td,
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] th{
    zoom:var(--USER__fontSize) !important;
  }
}

@supports not (zoom: 1){

  :root[style*="--USER__fontSize"]{
    font-size:var(--USER__fontSize) !important;
  }
}

:root[style*="readium-deprecatedFontSize-on"][style*="--USER__fontSize"]{
  font-size:var(--USER__fontSize) !important;
}

:root[style*="--USER__lineHeight"]{
  line-height:var(--USER__lineHeight) !important;
}

:root[style*="--USER__lineHeight"] body,
:root[style*="--USER__lineHeight"] p,
:root[style*="--USER__lineHeight"] li,
:root[style*="--USER__lineHeight"] div{
  line-height:var(--USER__lineHeight) !important;
}

:root[style*="--USER__paraSpacing"] p{
  margin-right:var(--USER__paraSpacing) !important;
  margin-left:var(--USER__paraSpacing) !important;
}

:root[style*="--USER__fontWeight"] body{
  font-weight:var(--USER__fontWeight) !important;
}

:root[style*="--USER__fontWeight"] b,
:root[style*="--USER__fontWeight"] strong{
  font-weight:bolder;
}

:root[style*="--USER__fontWidth"] body{
  font-stretch:var(--USER__fontWidth) !important;
}

:root[style*="--USER__fontOpticalSizing"] body{
  font-optical-sizing:var(--USER__fontOpticalSizing) !important;
}

:root[style*="--USER__letterSpacing"] h1,
:root[style*="--USER__letterSpacing"] h2,
:root[style*="--USER__letterSpacing"] h3,
:root[style*="--USER__letterSpacing"] h4,
:root[style*="--USER__letterSpacing"] h5,
:root[style*="--USER__letterSpacing"] h6,
:root[style*="--USER__letterSpacing"] p,
:root[style*="--USER__letterSpacing"] li,
:root[style*="--USER__letterSpacing"] div,
:root[style*="--USER__letterSpacing"] dt,
:root[style*="--USER__letterSpacing"] dd{
  letter-spacing:var(--USER__letterSpacing) !important;
  font-variant:none !important;
}

:root[style*="readium-noRuby-on"] body rt,
:root[style*="readium-noRuby-on"] body rp{
  display:none;
}

:root[style*="readium-blend-on"] svg,
:root[style*="readium-blend-on"] img{
  background-color:transparent !important;
  mix-blend-mode:multiply !important;
}

:root[style*="--USER__darkenImages"] img{
  -webkit-filter:brightness(var(--USER__darkenImages)) !important;
  filter:brightness(var(--USER__darkenImages)) !important;
}

:root[style*="readium-darken-on"] img{
  -webkit-filter:brightness(80%) !important;
  filter:brightness(80%) !important;
}

:root[style*="--USER__invertImages"] img{
  -webkit-filter:invert(var(--USER__invertImages)) !important;
  filter:invert(var(--USER__invertImages)) !important;
}

:root[style*="readium-invert-on"] img{
  -webkit-filter:invert(100%) !important;
  filter:invert(100%) !important;
}

:root[style*="--USER__darkenImages"][style*="--USER__invertImages"] img{
  -webkit-filter:brightness(var(--USER__darkenImages)) invert(var(--USER__invertImages)) !important;
  filter:brightness(var(--USER__darkenImages)) invert(var(--USER__invertImages)) !important;
}

:root[style*="readium-darken-on"][style*="--USER__invertImages"] img{
  -webkit-filter:brightness(80%) invert(var(--USER__invertImages)) !important;
  filter:brightness(80%) invert(var(--USER__invertImages)) !important;
}

:root[style*="--USER__darkenImages"][style*="readium-invert-on"] img{
  -webkit-filter:brightness(var(--USER__darkenImages)) invert(100%) !important;
  filter:brightness(var(--USER__darkenImages)) invert(100%) !important;
}

:root[style*="readium-darken-on"][style*="readium-invert-on"] img{
  -webkit-filter:brightness(80%) invert(100%) !important;
  filter:brightness(80%) invert(100%) !important;
}

:root[style*="--USER__invertGaiji"] img[class*="gaiji"]{
  -webkit-filter:invert(var(--USER__invertGaiji)) !important;
  filter:invert(var(--USER__invertGaiji)) !important;
}

:root[style*="readium-invertGaiji-on"] img[class*="gaiji"]{
  -webkit-filter:invert(100%) !important;
  filter:invert(100%) !important;
}

:root[style*="readium-normalize-on"]{
  --USER__typeScale:1.2;
}

:root[style*="readium-normalize-on"] p,
:root[style*="readium-normalize-on"] li,
:root[style*="readium-normalize-on"] div,
:root[style*="readium-normalize-on"] pre,
:root[style*="readium-normalize-on"] dd{
  font-size:1rem !important;
}

:root[style*="readium-normalize-on"] h1{
  font-size:1.75rem !important;
  font-size:calc(((1rem * var(--USER__typeScale)) * var(--USER__typeScale)) * var(--USER__typeScale)) !important;
}

:root[style*="readium-normalize-on"] h2{
  font-size:1.5rem !important;
  font-size:calc((1rem * var(--USER__typeScale)) * var(--USER__typeScale)) !important;
}

:root[style*="readium-normalize-on"] h3{
  font-size:1.25rem !important;
  font-size:calc(1rem * var(--USER__typeScale)) !important;
}

:root[style*="readium-normalize-on"] h4,
:root[style*="readium-normalize-on"] h5,
:root[style*="readium-normalize-on"] h6{
  font-size:1rem !important;
}

:root[style*="readium-normalize-on"] small{
  font-size:smaller !important;
}

:root[style*="readium-normalize-on"] sub,
:root[style*="readium-normalize-on"] sup{
  font-size:67.5% !important;
}

:root[style*="readium-normalize-on"][style*="--USER__typeScale"] h1{
  font-size:calc(((1rem * var(--USER__typeScale)) * var(--USER__typeScale)) * var(--USER__typeScale)) !important;
}

:root[style*="readium-normalize-on"][style*="--USER__typeScale"] h2{
  font-size:calc((1rem * var(--USER__typeScale)) * var(--USER__typeScale)) !important;
}

:root[style*="readium-normalize-on"][style*="--USER__typeScale"] h3{
  font-size:calc(1rem * var(--USER__typeScale)) !important;
}

:root[style*="readium-iPadOSPatch-on"] body{
  -webkit-text-size-adjust:none;
}

:root[style*="readium-iPadOSPatch-on"] p, 
:root[style*="readium-iPadOSPatch-on"] h1, 
:root[style*="readium-iPadOSPatch-on"] h2, 
:root[style*="readium-iPadOSPatch-on"] h3, 
:root[style*="readium-iPadOSPatch-on"] h4, 
:root[style*="readium-iPadOSPatch-on"] h5, 
:root[style*="readium-iPadOSPatch-on"] h6, 
:root[style*="readium-iPadOSPatch-on"] li, 
:root[style*="readium-iPadOSPatch-on"] th, 
:root[style*="readium-iPadOSPatch-on"] td, 
:root[style*="readium-iPadOSPatch-on"] dt, 
:root[style*="readium-iPadOSPatch-on"] dd, 
:root[style*="readium-iPadOSPatch-on"] pre, 
:root[style*="readium-iPadOSPatch-on"] address, 
:root[style*="readium-iPadOSPatch-on"] details, 
:root[style*="readium-iPadOSPatch-on"] summary,
:root[style*="readium-iPadOSPatch-on"] figcaption,
:root[style*="readium-iPadOSPatch-on"] div:not(:has(p, h1, h2, h3, h4, h5, h6, li, th, td, dt, dd, pre, address, aside, details, figcaption, summary)),
:root[style*="readium-iPadOSPatch-on"] aside:not(:has(p, h1, h2, h3, h4, h5, h6, li, th, td, dt, dd, pre, address, aside, details, figcaption, summary)){
  -webkit-text-zoom:reset;
}

:root[style*="readium-iPadOSPatch-on"] abbr, 
:root[style*="readium-iPadOSPatch-on"] b, 
:root[style*="readium-iPadOSPatch-on"] bdi, 
:root[style*="readium-iPadOSPatch-on"] bdo, 
:root[style*="readium-iPadOSPatch-on"] cite, 
:root[style*="readium-iPadOSPatch-on"] code, 
:root[style*="readium-iPadOSPatch-on"] dfn, 
:root[style*="readium-iPadOSPatch-on"] em, 
:root[style*="readium-iPadOSPatch-on"] i, 
:root[style*="readium-iPadOSPatch-on"] kbd, 
:root[style*="readium-iPadOSPatch-on"] mark, 
:root[style*="readium-iPadOSPatch-on"] q, 
:root[style*="readium-iPadOSPatch-on"] rp, 
:root[style*="readium-iPadOSPatch-on"] rt, 
:root[style*="readium-iPadOSPatch-on"] ruby, 
:root[style*="readium-iPadOSPatch-on"] s, 
:root[style*="readium-iPadOSPatch-on"] samp, 
:root[style*="readium-iPadOSPatch-on"] small, 
:root[style*="readium-iPadOSPatch-on"] span, 
:root[style*="readium-iPadOSPatch-on"] strong, 
:root[style*="readium-iPadOSPatch-on"] sub, 
:root[style*="readium-iPadOSPatch-on"] sup, 
:root[style*="readium-iPadOSPatch-on"] time, 
:root[style*="readium-iPadOSPatch-on"] u, 
:root[style*="readium-iPadOSPatch-on"] var{
  -webkit-text-zoom:normal;
}

:root[style*="readium-iPadOSPatch-on"] p:not(:has(b, cite, em, i, q, s, small, span, strong)):first-line{
  -webkit-text-zoom:normal;
}`},Symbol.toStringTag,{value:"Module"})),ka=Object.freeze(Object.defineProperty({__proto__:null,default:`/*!
 * Readium CSS v.2.0.5
 * Copyright (c) 2017–2026. Readium Foundation. All rights reserved.
 * Use of this source code is governed by a BSD-style license which is detailed in the
 * LICENSE file present in the project repository where this source code is maintained.
 * Core maintainer: Jiminy Panoz <jiminy.panoz@edrlab.org> 
 * Contributors: 
 * Daniel Weck
 * Hadrien Gardeur
 * Innovimax
 * L. Le Meur
 * Mickaël Menu
 * k_taka
 */

@namespace url("http://www.w3.org/1999/xhtml");

@namespace epub url("http://www.idpf.org/2007/ops");

@namespace m url("http://www.w3.org/1998/Math/MathML");

@namespace svg url("http://www.w3.org/2000/svg");

@-ms-viewport{
  width:device-width;
}

@viewport{
  width:device-width;
  zoom:1;
}

:root{

  --RS__sans-serif-ja-v:'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Hiragino Kaku Gothic Pro', 'ヒラギノ角ゴ W3', 'YuGothic', 'Yu Gothic Medium', 'BIZ UDGothic', 'Yu Gothic', 'ＭＳゴシック', 'MS Gothic', sans-serif;

  --RS__serif-ja-v:'Hiragino Mincho ProN', 'Hiragino Mincho Pro', 'YuMincho', 'BIZ UDMincho', 'Yu Mincho', 'ＭＳ明朝', 'MS Mincho', serif;

  --RS__sans-serif-ja:'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Hiragino Kaku Gothic Pro', 'ヒラギノ角ゴ W3', 'YuGothic', 'Yu Gothic Medium', 'BIZ UDPGothic', 'Yu Gothic', 'ＭＳ Ｐゴシック', 'MS PGothic', sans-serif;

  --RS__serif-ja:'Hiragino Mincho ProN', 'Hiragino Mincho Pro', 'YuMincho', 'BIZ UDPMincho', 'Yu Mincho', 'ＭＳ Ｐ明朝', 'MS PMincho', serif;

  --RS__monospaceTf:ui-monospace, 'Andale Mono', 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace;

  --RS__humanistTf:Seravek, Calibri, 'Gill Sans Nova', Roboto, Ubuntu, 'DejaVu Sans', source-sans-pro, sans-serif;

  --RS__sansTf:-ui-sans-serif, -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI Variable', 'Segoe UI', Inter, Roboto, 'Helvetica Neue', 'Arial Nova', 'Liberation Sans', Arial, sans-serif;

  --RS__modernTf:Athelas, Constantia, Charter, 'Bitstream Charter', Cambria, 'Georgia Pro', Georgia, serif;

  --RS__oldStyleTf:'Iowan Old Style', Sitka, 'Sitka Text', Palatino, 'Book Antiqua', 'URW Palladio L', P052, serif;

  --RS__zh-HK-lineHeightCompensation:1.167;

  --RS__zh-HK-baseFontFamily:'方體', 'PingFang HK', '方體', 'PingFang TC', '黑體', 'Heiti TC', 'Microsoft JhengHei UI', 'Microsoft JhengHei', Roboto, Noto, 'Noto Sans CJK TC', sans-serif;

  --RS__zh-TW-lineHeightCompensation:1.167;

  --RS__zh-TW-baseFontFamily:'方體', 'PingFang TC', '黑體', 'Heiti TC', 'Microsoft JhengHei UI', 'Microsoft JhengHei', Roboto, Noto, 'Noto Sans CJK TC', sans-serif;

  --RS__zh-Hant-lineHeightCompensation:1.167;

  --RS__zh-Hant-baseFontFamily:'方體', 'PingFang TC', '黑體', 'Heiti TC', 'Microsoft JhengHei UI', 'Microsoft JhengHei', Roboto, Noto, 'Noto Sans CJK TC', sans-serif;

  --RS__zh-lineHeightCompensation:1.167;

  --RS__zh-baseFontFamily:'方体', 'PingFang SC', '黑体', 'Heiti SC', 'Microsoft JhengHei UI', 'Microsoft JhengHei', Roboto, Noto, 'Noto Sans CJK SC', sans-serif;

  --RS__th-lineHeightCompensation:1.067;

  --RS__th-baseFontFamily:Thonburi, 'Leelawadee UI', 'Cordia New', Roboto, Noto, 'Noto Sans Thai', sans-serif;

  --RS__te-baseFontFamily:'Kohinoor Telugu', 'Telugu Sangam MN', 'Nirmala UI', Gautami, Roboto, Noto, 'Noto Sans Telugu', sans-serif;

  --RS__ta-lineHeightCompensation:1.067;

  --RS__ta-baseFontFamily:'Tamil Sangam MN', 'Nirmala UI', Latha, Roboto, Noto, 'Noto Sans Tamil', sans-serif;

  --RS__si-lineHeightCompensation:1.167;

  --RS__si-baseFontFamily:'Sinhala Sangam MN', 'Nirmala UI', 'Iskoola Pota', Roboto, Noto, 'Noto Sans Sinhala', sans-serif;

  --RS__pa-lineHeightCompensation:1.1;

  --RS__pa-baseFontFamily:'Gurmukhi MN', 'Nirmala UI', Kartika, Roboto, Noto, 'Noto Sans Gurmukhi', sans-serif;

  --RS__or-lineHeightCompensation:1.167;

  --RS__or-baseFontFamily:'Oriya Sangam MN', 'Nirmala UI', Kalinga, Roboto, Noto, 'Noto Sans Oriya', sans-serif;

  --RS__ml-lineHeightCompensation:1.067;

  --RS__ml-baseFontFamily:'Malayalam Sangam MN', 'Nirmala UI', Kartika, Roboto, Noto, 'Noto Sans Malayalam', sans-serif;

  --RS__lo-baseFontFamily:'Lao Sangam MN', 'Leelawadee UI', 'Lao UI', Roboto, Noto, 'Noto Sans Lao', sans-serif;

  --RS__ko-lineHeightCompensation:1.167;

  --RS__ko-baseFontFamily:'Nanum Gothic', 'Apple SD Gothic Neo', 'Malgun Gothic', Roboto, Noto, 'Noto Sans CJK KR', sans-serif;

  --RS__kn-lineHeightCompensation:1.1;

  --RS__kn-baseFontFamily:'Kannada Sangam MN', 'Nirmala UI', Tunga, Roboto, Noto, 'Noto Sans Kannada', sans-serif;

  --RS__km-lineHeightCompensation:1.067;

  --RS__km-baseFontFamily:'Khmer Sangam MN', 'Leelawadee UI', 'Khmer UI', Roboto, Noto, 'Noto Sans Khmer', sans-serif;

  --RS__ja-lineHeightCompensation:1.167;

  --RS__ja-baseFontFamily:YuGothic, 'Hiragino Maru Gothic ProN', 'Hiragino Sans', 'Yu Gothic UI', 'Meiryo UI', 'MS Gothic', Roboto, Noto, 'Noto Sans CJK JP', sans-serif;

  --RS__iu-baseFontFamily:'Euphemia UCAS', Euphemia, Roboto, Noto, 'Noto Sans Canadian Aboriginal', sans-serif;

  --RS__hy-baseFontFamily:Mshtakan, Sylfaen, Roboto, Noto, 'Noto Serif Armenian', serif;

  --RS__hi-lineHeightCompensation:1.1;

  --RS__hi-baseFontFamily:'Kohinoor Devanagari', 'Devanagari Sangam MN', Kokila, 'Nirmala UI', Roboto, Noto, 'Noto Sans Devanagari', sans-serif;

  --RS__he-lineHeightCompensation:1.1;

  --RS__he-baseFontFamily:'New Peninim MT', 'Arial Hebrew', Gisha, 'Times New Roman', Roboto, Noto, 'Noto Sans Hebrew', sans-serif;

  --RS__gu-lineHeightCompensation:1.167;

  --RS__gu-baseFontFamily:'Gujarati Sangam MN', 'Nirmala UI', Shruti, Roboto, Noto, 'Noto Sans Gujarati', sans-serif;

  --RS__fa-baseFontFamily:'Geeza Pro', 'Arabic Typesetting', Roboto, Noto, 'Noto Naskh Arabic', 'Times New Roman', serif;

  --RS__chr-lineHeightCompensation:1.167;

  --RS__chr-baseFontFamily:'Plantagenet Cherokee', Roboto, Noto, 'Noto Sans Cherokee';

  --RS__bo-baseFontFamily:Kailasa, 'Microsoft Himalaya', Roboto, Noto, 'Noto Sans Tibetan', sans-serif;

  --RS__bn-lineHeightCompensation:1.067;

  --RS__bn-baseFontFamily:'Kohinoor Bangla', 'Bangla Sangam MN', Vrinda, Roboto, Noto, 'Noto Sans Bengali', sans-serif;

  --RS__ar-baseFontFamily:'Geeza Pro', 'Arabic Typesetting', Roboto, Noto, 'Noto Naskh Arabic', 'Times New Roman', serif;

  --RS__am-lineHeightCompensation:1.167;

  --RS__am-baseFontFamily:Kefa, Nyala, Roboto, Noto, 'Noto Sans Ethiopic', serif;

  --RS__latin-lineHeightCompensation:1;

  --RS__latin-baseFontFamily:var(--RS__oldStyleTf);
  --RS__baseFontFamily:var(--RS__latin-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__latin-lineHeightCompensation);
  --RS__baseLineHeight:calc(1.5 * var(--RS__lineHeightCompensation));

  --RS__selectionTextColor:inherit;

  --RS__selectionBackgroundColor:#b4d8fe;

  --RS__visitedColor:#551A8B;

  --RS__linkColor:#0000EE;

  --RS__textColor:#121212;

  --RS__backgroundColor:#FFFFFF;
  color:var(--RS__textColor) !important;

  background-color:var(--RS__backgroundColor) !important;
}

::-moz-selection{
  color:var(--RS__selectionTextColor);
  background-color:var(--RS__selectionBackgroundColor);
}

::selection{
  color:var(--RS__selectionTextColor);
  background-color:var(--RS__selectionBackgroundColor);
}

html{
  font-family:var(--RS__baseFontFamily);
  line-height:1.6;
  line-height:var(--RS__baseLineHeight);
  text-rendering:optimizelegibility;
}

h1, h2, h3{
  line-height:normal;
}

:lang(ja),
:lang(zh),
:lang(ko){
  word-wrap:break-word;
  -webkit-line-break:strict;
  -epub-line-break:strict;
  line-break:strict;
}

math{
  font-family:"Latin Modern Math", "STIX Two Math", "XITS Math", "STIX Math", "Libertinus Math", "TeX Gyre Termes Math", "TeX Gyre Bonum Math", "TeX Gyre Schola", "DejaVu Math TeX Gyre", "TeX Gyre Pagella Math", "Asana Math", "Cambria Math", "Lucida Bright Math", "Minion Math", STIXGeneral, STIXSizeOneSym, Symbol, "Times New Roman", serif;
}

:lang(am){
  --RS__baseFontFamily:var(--RS__am-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__am-lineHeightCompensation);
}

:lang(ar){
  --RS__baseFontFamily:var(--RS__ar-baseFontFamily);
}

:lang(bn){
  --RS__baseFontFamily:var(--RS__bn-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__bn-lineHeightCompensation);
}

:lang(bo){
  --RS__baseFontFamily:var(--RS__bo-baseFontFamily);
}

:lang(chr){
  --RS__baseFontFamily:var(--RS__chr-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__chr-lineHeightCompensation);
}

:lang(fa){
  --RS__baseFontFamily:var(--RS__fa-baseFontFamily);
}

:lang(gu){
  --RS__baseFontFamily:var(--RS__gu-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__gu-lineHeightCompensation);
}

:lang(he){
  --RS__baseFontFamily:var(--RS__he-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__he-lineHeightCompensation);
}

:lang(hi){
  --RS__baseFontFamily:var(--RS__hi-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__hi-lineHeightCompensation);
}

:lang(hy){
  --RS__baseFontFamily:var(--RS__hy-baseFontFamily);
}

:lang(iu){
  --RS__baseFontFamily:var(--RS__iu-baseFontFamily);
}

:lang(ja){
  --RS__baseFontFamily:var(--RS__ja-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__ja-lineHeightCompensation);
}

:lang(km){
  --RS__baseFontFamily:var(--RS__km-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__km-lineHeightCompensation);
}

:lang(kn){
  --RS__baseFontFamily:var(--RS__kn-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__kn-lineHeightCompensation);
}

:lang(ko){
  --RS__baseFontFamily:var(--RS__ko-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__ko-lineHeightCompensation);
}

:lang(lo){
  --RS__baseFontFamily:var(--RS__lo-baseFontFamily);
}

:lang(ml){
  --RS__baseFontFamily:var(--RS__ml-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__ml-lineHeightCompensation);
}

:lang(or){
  --RS__baseFontFamily:var(--RS__or-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__or-lineHeightCompensation);
}

:lang(pa){
  --RS__baseFontFamily:var(--RS__pa-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__pa-lineHeightCompensation);
}

:lang(si){
  --RS__baseFontFamily:var(--RS__si-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__si-lineHeightCompensation);
}

:lang(ta){
  --RS__baseFontFamily:var(--RS__ta-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__ta-lineHeightCompensation);
}

:lang(te){
  --RS__baseFontFamily:var(--RS__te-baseFontFamily);
}

:lang(th){
  --RS__baseFontFamily:var(--RS__th-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__th-lineHeightCompensation);
}

:lang(zh){
  --RS__baseFontFamily:var(--RS__zh-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__zh-lineHeightCompensation);
}

:lang(zh-Hant){
  --RS__baseFontFamily:var(--RS__zh-Hant-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__zh-Hant-lineHeightCompensation);
}

:lang(zh-TW){
  --RS__baseFontFamily:var(--RS__zh-TW-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__zh-TW-lineHeightCompensation);
}

:lang(zh-HK){
  --RS__baseFontFamily:var(--RS__zh-HK-baseFontFamily);
  --RS__lineHeightCompensation:var(--RS__zh-HK-lineHeightCompensation);
}

body{
  widows:2;
  orphans:2;
}

figcaption, th, td{
  widows:1;
  orphans:1;
}

h2, h3, h4, h5, h6, dt,
hr, caption{
  -webkit-column-break-after:avoid;
  page-break-after:avoid;
  break-after:avoid;
}

h1, h2, h3, h4, h5, h6, dt,
figure, tr{
  -webkit-column-break-inside:avoid;
  page-break-inside:avoid;
  break-inside:avoid;
}

body{
  -webkit-hyphenate-character:"\\002D";
  -moz-hyphenate-character:"\\002D";
  -ms-hyphenate-character:"\\002D";
  hyphenate-character:"\\002D";
  -webkit-hyphenate-limit-lines:3;
  -ms-hyphenate-limit-lines:3;
  hyphenate-limit-lines:3;
}

h1, h2, h3, h4, h5, h6, dt,
figcaption, pre, caption, address,
center, code, var{
  -ms-hyphens:none;
  -moz-hyphens:none;
  -webkit-hyphens:none;
  -epub-hyphens:none;
  hyphens:none;
}

body{
  font-variant-numeric:oldstyle-nums proportional-nums;
}

:lang(ja) body,
:lang(zh) body,
:lang(ko) body{
  font-variant-numeric:lining-nums proportional-nums;
}

h1, h2, h3, h4, h5, h6, dt{
  font-variant-numeric:lining-nums proportional-nums;
}

table{
  font-variant-numeric:lining-nums tabular-nums;
}

code, var{
  font-variant-ligatures:none;
  font-variant-numeric:lining-nums tabular-nums slashed-zero;
}

rt{
  font-variant-east-asian:ruby;
}

:lang(ar){
  font-variant-ligatures:common-ligatures;
}

:lang(ko){
  font-kerning:normal;
}

hr{
  color:inherit;
  border-color:currentcolor;
}

table, th, td{
  border-color:currentcolor;
}

figure, blockquote{
  margin:1em 5%;
}

ul, ol{
  padding-left:5%;
}

dd{
  margin-left:5%;
}

pre{
  white-space:pre-wrap;
  -ms-tab-size:2;
  -moz-tab-size:2;
  -webkit-tab-size:2;
  tab-size:2;
}

abbr[title], acronym[title]{
  text-decoration:dotted underline;
}

nobr wbr{
  white-space:normal;
}

ruby > rt, ruby > rp{
  -webkit-user-select:none;
  -moz-user-select:none;
  -ms-user-select:none;
  user-select:none;
}

*:lang(ja):not(:lang(ja-Latn)):not(:lang(ja-Cyrl)),
*:lang(zh):not(:lang(zh-Latn)):not(:lang(zh-Cyrl)),
*:lang(ko):not(:lang(ko-Latn)):not(:lang(ko-Cyrl)),
:lang(ja):not(:lang(ja-Latn)):not(:lang(ja-Cyrl)) cite, 
:lang(ja):not(:lang(ja-Latn)):not(:lang(ja-Cyrl)) dfn, 
:lang(ja):not(:lang(ja-Latn)):not(:lang(ja-Cyrl)) em, 
:lang(ja):not(:lang(ja-Latn)):not(:lang(ja-Cyrl)) i,
:lang(zh):not(:lang(zh-Latn)):not(:lang(zh-Cyrl)) cite, 
:lang(zh):not(:lang(zh-Latn)):not(:lang(zh-Cyrl)) dfn, 
:lang(zh):not(:lang(zh-Latn)):not(:lang(zh-Cyrl)) em, 
:lang(zh):not(:lang(zh-Latn)):not(:lang(zh-Cyrl)) i,
:lang(ko):not(:lang(ko-Latn)):not(:lang(ko-Cyrl)) cite, 
:lang(ko):not(:lang(ko-Latn)):not(:lang(ko-Cyrl)) dfn, 
:lang(ko):not(:lang(ko-Latn)):not(:lang(ko-Cyrl)) em, 
:lang(ko):not(:lang(ko-Latn)):not(:lang(ko-Cyrl)) i{
  font-style:normal;
}

:lang(ja) a,
:lang(zh) a,
:lang(ko) a{
  text-decoration:none;
}

:root{
  --RS__maxMediaWidth:100%;
  --RS__maxMediaHeight:95vh;
  --RS__boxSizingMedia:border-box;
  --RS__boxSizingTable:border-box;
}

a, a span, span a, h1, h2, h3, h4, h5, h6{
  word-wrap:break-word;
}

div{
  max-width:var(--RS__maxMediaWidth);
}

img, svg|svg, video{
  object-fit:contain;

  width:auto;
  height:auto;
  max-width:var(--RS__maxMediaWidth);
  max-height:var(--RS__maxMediaHeight) !important;
  box-sizing:var(--RS__boxSizingMedia);
  -webkit-column-break-inside:avoid;
  page-break-inside:avoid;
  break-inside:avoid;
}

@supports (zoom: 1) and (not ((-webkit-column-axis: horizontal) and (-webkit-column-progression: normal))){

  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] img,
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] svg|svg,
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] video{
    zoom:calc(100% / var(--USER__fontSize));
  }
}

audio{
    max-width:100%;
    -webkit-column-break-inside:avoid;
    page-break-inside:avoid;
    break-inside:avoid;
  }

table{
  max-width:var(--RS__maxMediaWidth);
  box-sizing:var(--RS__boxSizingTable);
}`},Symbol.toStringTag,{value:"Module"})),Ea=Object.freeze(Object.defineProperty({__proto__:null,default:`/*!
 * Readium CSS v.2.0.5
 * Copyright (c) 2017–2026. Readium Foundation. All rights reserved.
 * Use of this source code is governed by a BSD-style license which is detailed in the
 * LICENSE file present in the project repository where this source code is maintained.
 * Core maintainer: Jiminy Panoz <jiminy.panoz@edrlab.org> 
 * Contributors: 
 * Daniel Weck
 * Hadrien Gardeur
 * Innovimax
 * L. Le Meur
 * Mickaël Menu
 * k_taka
 */

@namespace url("http://www.w3.org/1999/xhtml");

@namespace epub url("http://www.idpf.org/2007/ops");

@namespace m url("http://www.w3.org/1998/Math/MathML");

@namespace svg url("http://www.w3.org/2000/svg");

:root{
  --RS__compFontFamily:var(--RS__baseFontFamily);
  --RS__codeFontFamily:var(--RS__monospaceTf);

  --RS__typeScale:1.125;
  --RS__baseFontSize:100%;

  --RS__flowSpacing:1.5rem;
  --RS__paraSpacing:0;
  --RS__paraIndent:1em;

  --RS__linkColor:#0000EE;
  --RS__visitedColor:#551A8B;

  --RS__primaryColor:;
  --RS__secondaryColor:;
}

body{
  font-size:var(--RS__baseFontSize);
}

h1, h2, h3, h4, h5, h6{
  font-family:var(--RS__compFontFamily);
}

blockquote, figure, p, pre,
aside, footer, form, hr{
  margin-top:var(--RS__flowSpacing);
  margin-bottom:var(--RS__flowSpacing);
}

p{
  margin-top:var(--RS__paraSpacing);
  margin-bottom:var(--RS__paraSpacing);
  text-indent:var(--RS__paraIndent);
}

h1 + p, h2 + p, h3 + p, h4 + p, h5 + p, h6 + p,
hr + p{
  text-indent:0;
}

pre{
  font-family:var(--RS__codeFontFamily);
}

code, kbd, samp, tt{
  font-family:var(--RS__codeFontFamily);
}

sub, sup{
  position:relative;
  font-size:67.5%;
  line-height:1;
}

sub{
  bottom:-0.2ex;
}

sup{
  bottom:0;
}

:link{
  color:var(--RS__linkColor);
}

:visited{
  color:var(--RS__visitedColor);
}

h1{
  margin-top:calc(var(--RS__flowSpacing) * 2);
  margin-bottom:calc(var(--RS__flowSpacing) * 2);
  font-size:calc(((1em * var(--RS__typeScale)) * var(--RS__typeScale)) * var(--RS__typeScale));
}

h2{
  margin-top:calc(var(--RS__flowSpacing) * 2);
  margin-bottom:var(--RS__flowSpacing);
  font-size:calc((1em * var(--RS__typeScale)) * var(--RS__typeScale));
}

h3{
  margin-top:var(--RS__flowSpacing);
  margin-bottom:var(--RS__flowSpacing);
  font-size:calc(1em * var(--RS__typeScale));
}

h4{
  margin-top:var(--RS__flowSpacing);
  margin-bottom:var(--RS__flowSpacing);
  font-size:1em;
}

h5{
  margin-top:var(--RS__flowSpacing);
  margin-bottom:var(--RS__flowSpacing);
  font-size:1em;
  font-variant:small-caps;
}

h6{
  margin-top:var(--RS__flowSpacing);
  margin-bottom:0;
  font-size:1em;
  text-transform:lowercase;
  font-variant:small-caps;
}

dl, ol, ul{
  margin-top:var(--RS__flowSpacing);
  margin-bottom:var(--RS__flowSpacing);
}

table{
  margin:var(--RS__flowSpacing) 0;
  border:1px solid currentcolor;
  border-collapse:collapse;
  empty-cells:show;
}

thead, tbody, tfoot, table > tr{
  vertical-align:top;
}

th{
  text-align:left;
}

th, td{
  padding:4px;
  border:1px solid currentcolor;
}`},Symbol.toStringTag,{value:"Module"})),xa=Object.freeze(Object.defineProperty({__proto__:null,default:`/*!
 * Readium CSS v.2.0.5
 * Copyright (c) 2017–2026. Readium Foundation. All rights reserved.
 * Use of this source code is governed by a BSD-style license which is detailed in the
 * LICENSE file present in the project repository where this source code is maintained.
 * Core maintainer: Jiminy Panoz <jiminy.panoz@edrlab.org> 
 * Contributors: 
 * Daniel Weck
 * Hadrien Gardeur
 * Innovimax
 * L. Le Meur
 * Mickaël Menu
 * k_taka
 */

@namespace url("http://www.w3.org/1999/xhtml");

@namespace epub url("http://www.idpf.org/2007/ops");

@namespace m url("http://www.w3.org/1998/Math/MathML");

@namespace svg url("http://www.w3.org/2000/svg");

:root{

  --RS__viewportWidth:100%;

  --RS__pageGutter:0;

  --RS__defaultLineLength:100%;

  --RS__colGap:0;

  --RS__colCount:1;

  --RS__colWidth:100vw;
}

@page{
  margin:0 !important;
}

:root{
  position:relative;

  -webkit-column-width:var(--RS__colWidth);
  -moz-column-width:var(--RS__colWidth);
  column-width:var(--RS__colWidth);
  -webkit-column-count:var(--RS__colCount);
  -moz-column-count:var(--RS__colCount);
  column-count:var(--RS__colCount);

  -webkit-column-gap:var(--RS__colGap);
  -moz-column-gap:var(--RS__colGap);
  column-gap:var(--RS__colGap);
  -moz-column-fill:auto;
  column-fill:auto;
  width:var(--RS__viewportWidth);
  height:100vh;
  max-width:var(--RS__viewportWidth);
  max-height:100vh;
  min-width:var(--RS__viewportWidth);
  min-height:100vh;
  padding:0 !important;
  margin:0 !important;
  font-size:1rem !important;
  box-sizing:border-box;
  -webkit-touch-callout:none;
}

body{
  width:100%;
  max-width:var(--RS__defaultLineLength) !important;
  margin:0 auto !important;
  box-sizing:border-box;
}

:root:not([style*="readium-scroll-on"]) body{
  padding:0 var(--RS__pageGutter) !important;
}

:root:not([style*="readium-noOverflow-on"]) body{
  overflow:hidden;
}

@supports (overflow: clip){

   :root:not([style*="readium-noOverflow-on"]){
      overflow:clip;
   }

   :root:not([style*="readium-noOverflow-on"]) body{
      overflow:clip;
      overflow-clip-margin:content-box;
   }
}

:root[style*="readium-scroll-on"]{
  -webkit-columns:auto auto !important;
  -moz-columns:auto auto !important;
  columns:auto auto !important;
  width:auto !important;
  height:auto !important;
  max-width:none !important;
  max-height:none !important;
  min-width:0 !important;
  min-height:0 !important;
}

:root[style*="readium-scroll-on"] body{
  max-width:var(--RS__defaultLineLength) !important;
  box-sizing:border-box !important;
}

:root[style*="readium-scroll-on"]:not([style*="readium-noOverflow-on"]) body{
  overflow:auto;
}

@supports (overflow: clip){

  :root[style*="readium-scroll-on"]:not([style*="readium-noOverflow-on"]){
     overflow:auto;
  }

  :root[style*="readium-scroll-on"]:not([style*="readium-noOverflow-on"]) body{
     overflow:clip;
  }
}

:root[style*="readium-scroll-on"][style*="--RS__scrollPaddingTop"] body{
  padding-top:var(--RS__scrollPaddingTop) !important;
}

:root[style*="readium-scroll-on"][style*="--RS__scrollPaddingBottom"] body{
  padding-bottom:var(--RS__scrollPaddingBottom) !important;
}

:root[style*="readium-scroll-on"][style*="--RS__scrollPaddingLeft"] body{
  padding-left:var(--RS__scrollPaddingLeft) !important;
}

:root[style*="readium-scroll-on"][style*="--RS__scrollPaddingRight"] body{
  padding-right:var(--RS__scrollPaddingRight) !important;
}

:root[style*="--USER__backgroundColor"]{
  background-color:var(--USER__backgroundColor) !important;
}

:root[style*="--USER__backgroundColor"] *{
  background-color:transparent !important;
}

:root[style*="--USER__textColor"]{
  color:var(--USER__textColor) !important;
}

:root[style*="--USER__textColor"] *:not(a){
  color:inherit !important;
  background-color:transparent !important;
  border-color:currentcolor !important;
}

:root[style*="--USER__textColor"] svg text{
  fill:currentcolor !important;
  stroke:none !important;
}

:root[style*="--USER__linkColor"] a:link,
:root[style*="--USER__linkColor"] a:link *{
  color:var(--USER__linkColor) !important;
}

:root[style*="--USER__visitedColor"] a:visited,
:root[style*="--USER__visitedColor"] a:visited *{
  color:var(--USER__visitedColor) !important;
}

:root[style*="--USER__selectionBackgroundColor"][style*="--USER__selectionTextColor"] ::-moz-selection{
  color:var(--USER__selectionTextColor) !important;
  background-color:var(--USER__selectionBackgroundColor) !important;
}

:root[style*="--USER__selectionBackgroundColor"][style*="--USER__selectionTextColor"] ::selection{
  color:var(--USER__selectionTextColor) !important;
  background-color:var(--USER__selectionBackgroundColor) !important;
}

:root[style*="--USER__colCount"]{
  -webkit-column-count:var(--USER__colCount);
  -moz-column-count:var(--USER__colCount);
  column-count:var(--USER__colCount);

  --RS__colWidth:auto;
}

:root[style*="--USER__colCount: 0"],
:root[style*="--USER__colCount:0"]{
  -webkit-column-count:1;
  -moz-column-count:1;
  column-count:1;
}

:root[style*="--USER__colCount: 0"],
:root[style*="--USER__colCount:0"],
:root[style*="--USER__colCount: 1"],
:root[style*="--USER__colCount:1"]{
  --RS__colWidth:100vw;
}

:root[style*="--USER__lineLength"] body{
    max-width:var(--USER__lineLength) !important;
  }

:root[style*="--USER__textAlign"]{
  text-align:var(--USER__textAlign);
}

:root[style*="--USER__textAlign"] body,
:root[style*="--USER__textAlign"] p:not(
  blockquote p,
  figcaption p,
  header p,
  hgroup p,
  :root[style*="readium-experimentalHeaderFiltering-on"] p[class*="title"],
  :root[style*="readium-experimentalHeaderFiltering-on"] div:has(+ *) > h1 + p,
  :root[style*="readium-experimentalHeaderFiltering-on"] div:has(+ *) > p:has(+ h1)
),
:root[style*="--USER__textAlign"] li,
:root[style*="--USER__textAlign"] dd{
  text-align:var(--USER__textAlign) !important;
  -moz-text-align-last:auto !important;
  -epub-text-align-last:auto !important;
  text-align-last:auto !important;
}

:root[style*="--USER__bodyHyphens"]{
  -webkit-hyphens:var(--USER__bodyHyphens) !important;
  -moz-hyphens:var(--USER__bodyHyphens) !important;
  -ms-hyphens:var(--USER__bodyHyphens) !important;
  -epub-hyphens:var(--USER__bodyHyphens) !important;
  hyphens:var(--USER__bodyHyphens) !important;
}

:root[style*="--USER__bodyHyphens"] body,
:root[style*="--USER__bodyHyphens"] p,
:root[style*="--USER__bodyHyphens"] li,
:root[style*="--USER__bodyHyphens"] div,
:root[style*="--USER__bodyHyphens"] dd{
  -webkit-hyphens:var(--USER__bodyHyphens) !important;
  -moz-hyphens:var(--USER__bodyHyphens) !important;
  -ms-hyphens:var(--USER__bodyHyphens) !important;
  -epub-hyphens:var(--USER__bodyHyphens) !important;
  hyphens:var(--USER__bodyHyphens) !important;
}

:root[style*="--USER__fontFamily"]{
  font-family:var(--USER__fontFamily) !important;
}

:root[style*="--USER__fontFamily"] *{
  font-family:revert !important;
}

:root[style*="readium-a11y-on"]{
  font-style:normal !important;
  font-weight:normal !important;
}

:root[style*="readium-a11y-on"] body *:not(code):not(var):not(kbd):not(samp){
  font-family:inherit !important;
  font-style:inherit !important;
  font-weight:inherit !important;
}

:root[style*="readium-a11y-on"] body *:not(a){
  text-decoration:none !important;
}

:root[style*="readium-a11y-on"] body *{
  font-variant-caps:normal !important;
  font-variant-numeric:normal !important;
  font-variant-position:normal !important;
}

:root[style*="readium-a11y-on"] sup,
:root[style*="readium-a11y-on"] sub{
  font-size:1rem !important;
  vertical-align:baseline !important;
}

:root:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] body{
  zoom:var(--USER__fontSize) !important;
}

:root:not([style*="readium-deprecatedFontSize-on"])[style*="readium-iOSPatch-on"][style*="--USER__fontSize"] body{
  -webkit-text-size-adjust:var(--USER__fontSize) !important;
}

@supports selector(figure:has(> img)){

  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] figure:has(> img),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] figure:has(> video),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] figure:has(> svg),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] figure:has(> canvas),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] figure:has(> iframe),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] figure:has(> audio),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] div:has(> img:only-child),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] div:has(> video:only-child),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] div:has(> svg:only-child),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] div:has(> canvas:only-child),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] div:has(> iframe:only-child),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] div:has(> audio:only-child),
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] table{
    zoom:calc(100% / var(--USER__fontSize)) !important;
  }

  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] figcaption,
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] caption,
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] td,
  :root[style*="readium-experimentalZoom-on"]:not([style*="readium-deprecatedFontSize-on"]):not([style*="readium-iOSPatch-on"])[style*="--USER__fontSize"] th{
    zoom:var(--USER__fontSize) !important;
  }
}

@supports not (zoom: 1){

  :root[style*="--USER__fontSize"]{
    font-size:var(--USER__fontSize) !important;
  }
}

:root[style*="readium-deprecatedFontSize-on"][style*="--USER__fontSize"]{
  font-size:var(--USER__fontSize) !important;
}

:root[style*="--USER__lineHeight"]{
  line-height:var(--USER__lineHeight) !important;
}

:root[style*="--USER__lineHeight"] body,
:root[style*="--USER__lineHeight"] p,
:root[style*="--USER__lineHeight"] li,
:root[style*="--USER__lineHeight"] div{
  line-height:var(--USER__lineHeight) !important;
}

:root[style*="--USER__paraSpacing"] p{
  margin-top:var(--USER__paraSpacing) !important;
  margin-bottom:var(--USER__paraSpacing) !important;
}

:root[style*="--USER__paraIndent"] p:not(
  blockquote p,
  figcaption p,
  header p,
  hgroup p,
  :root[style*="readium-experimentalHeaderFiltering-on"] p[class*="title"],
  :root[style*="readium-experimentalHeaderFiltering-on"] div:has(+ *) > h1 + p,
  :root[style*="readium-experimentalHeaderFiltering-on"] div:has(+ *) > p:has(+ h1)
){
  text-indent:var(--USER__paraIndent) !important;
}

:root[style*="--USER__paraIndent"] p *{
  text-indent:0 !important;
}

:root[style*="--USER__wordSpacing"] h1,
:root[style*="--USER__wordSpacing"] h2,
:root[style*="--USER__wordSpacing"] h3,
:root[style*="--USER__wordSpacing"] h4,
:root[style*="--USER__wordSpacing"] h5,
:root[style*="--USER__wordSpacing"] h6,
:root[style*="--USER__wordSpacing"] p,
:root[style*="--USER__wordSpacing"] li,
:root[style*="--USER__wordSpacing"] div,
:root[style*="--USER__wordSpacing"] dt,
:root[style*="--USER__wordSpacing"] dd{
  word-spacing:var(--USER__wordSpacing) !important;
}

:root[style*="--USER__letterSpacing"] h1,
:root[style*="--USER__letterSpacing"] h2,
:root[style*="--USER__letterSpacing"] h3,
:root[style*="--USER__letterSpacing"] h4,
:root[style*="--USER__letterSpacing"] h5,
:root[style*="--USER__letterSpacing"] h6,
:root[style*="--USER__letterSpacing"] p,
:root[style*="--USER__letterSpacing"] li,
:root[style*="--USER__letterSpacing"] div,
:root[style*="--USER__letterSpacing"] dt,
:root[style*="--USER__letterSpacing"] dd{
  letter-spacing:var(--USER__letterSpacing) !important;
  font-variant:none !important;
}

:root[style*="--USER__ligatures"]{
  font-variant-ligatures:var(--USER__ligatures) !important;
}

:root[style*="--USER__ligatures"] *{
  font-variant-ligatures:inherit !important;
}

:root[style*="--USER__fontWeight"] body{
  font-weight:var(--USER__fontWeight) !important;
}

:root[style*="--USER__fontWeight"] b,
:root[style*="--USER__fontWeight"] strong{
  font-weight:bolder;
}

:root[style*="--USER__fontWidth"] body{
  font-stretch:var(--USER__fontWidth) !important;
}

:root[style*="--USER__fontOpticalSizing"] body{
  font-optical-sizing:var(--USER__fontOpticalSizing) !important;
}

:root[style*="readium-blend-on"] svg,
:root[style*="readium-blend-on"] img{
  background-color:transparent !important;
  mix-blend-mode:multiply !important;
}

:root[style*="--USER__darkenImages"] img{
  -webkit-filter:brightness(var(--USER__darkenImages)) !important;
  filter:brightness(var(--USER__darkenImages)) !important;
}

:root[style*="readium-darken-on"] img{
  -webkit-filter:brightness(80%) !important;
  filter:brightness(80%) !important;
}

:root[style*="--USER__invertImages"] img{
  -webkit-filter:invert(var(--USER__invertImages)) !important;
  filter:invert(var(--USER__invertImages)) !important;
}

:root[style*="readium-invert-on"] img{
  -webkit-filter:invert(100%) !important;
  filter:invert(100%) !important;
}

:root[style*="--USER__darkenImages"][style*="--USER__invertImages"] img{
  -webkit-filter:brightness(var(--USER__darkenImages)) invert(var(--USER__invertImages)) !important;
  filter:brightness(var(--USER__darkenImages)) invert(var(--USER__invertImages)) !important;
}

:root[style*="readium-darken-on"][style*="--USER__invertImages"] img{
  -webkit-filter:brightness(80%) invert(var(--USER__invertImages)) !important;
  filter:brightness(80%) invert(var(--USER__invertImages)) !important;
}

:root[style*="--USER__darkenImages"][style*="readium-invert-on"] img{
  -webkit-filter:brightness(var(--USER__darkenImages)) invert(100%) !important;
  filter:brightness(var(--USER__darkenImages)) invert(100%) !important;
}

:root[style*="readium-darken-on"][style*="readium-invert-on"] img{
  -webkit-filter:brightness(80%) invert(100%) !important;
  filter:brightness(80%) invert(100%) !important;
}

:root[style*="--USER__invertGaiji"] img[class*="gaiji"]{
  -webkit-filter:invert(var(--USER__invertGaiji)) !important;
  filter:invert(var(--USER__invertGaiji)) !important;
}

:root[style*="readium-invertGaiji-on"] img[class*="gaiji"]{
  -webkit-filter:invert(100%) !important;
  filter:invert(100%) !important;
}

:root[style*="readium-normalize-on"]{
  --USER__typeScale:1.2;
}

:root[style*="readium-normalize-on"] p,
:root[style*="readium-normalize-on"] li,
:root[style*="readium-normalize-on"] div,
:root[style*="readium-normalize-on"] pre,
:root[style*="readium-normalize-on"] dd{
  font-size:1rem !important;
}

:root[style*="readium-normalize-on"] h1{
  font-size:1.75rem !important;
  font-size:calc(((1rem * var(--USER__typeScale)) * var(--USER__typeScale)) * var(--USER__typeScale)) !important;
}

:root[style*="readium-normalize-on"] h2{
  font-size:1.5rem !important;
  font-size:calc((1rem * var(--USER__typeScale)) * var(--USER__typeScale)) !important;
}

:root[style*="readium-normalize-on"] h3{
  font-size:1.25rem !important;
  font-size:calc(1rem * var(--USER__typeScale)) !important;
}

:root[style*="readium-normalize-on"] h4,
:root[style*="readium-normalize-on"] h5,
:root[style*="readium-normalize-on"] h6{
  font-size:1rem !important;
}

:root[style*="readium-normalize-on"] small{
  font-size:smaller !important;
}

:root[style*="readium-normalize-on"] sub,
:root[style*="readium-normalize-on"] sup{
  font-size:67.5% !important;
}

:root[style*="readium-normalize-on"][style*="--USER__typeScale"] h1{
  font-size:calc(((1rem * var(--USER__typeScale)) * var(--USER__typeScale)) * var(--USER__typeScale)) !important;
}

:root[style*="readium-normalize-on"][style*="--USER__typeScale"] h2{
  font-size:calc((1rem * var(--USER__typeScale)) * var(--USER__typeScale)) !important;
}

:root[style*="readium-normalize-on"][style*="--USER__typeScale"] h3{
  font-size:calc(1rem * var(--USER__typeScale)) !important;
}

:root[style*="readium-iPadOSPatch-on"] body{
  -webkit-text-size-adjust:none;
}

:root[style*="readium-iPadOSPatch-on"] p, 
:root[style*="readium-iPadOSPatch-on"] h1, 
:root[style*="readium-iPadOSPatch-on"] h2, 
:root[style*="readium-iPadOSPatch-on"] h3, 
:root[style*="readium-iPadOSPatch-on"] h4, 
:root[style*="readium-iPadOSPatch-on"] h5, 
:root[style*="readium-iPadOSPatch-on"] h6, 
:root[style*="readium-iPadOSPatch-on"] li, 
:root[style*="readium-iPadOSPatch-on"] th, 
:root[style*="readium-iPadOSPatch-on"] td, 
:root[style*="readium-iPadOSPatch-on"] dt, 
:root[style*="readium-iPadOSPatch-on"] dd, 
:root[style*="readium-iPadOSPatch-on"] pre, 
:root[style*="readium-iPadOSPatch-on"] address, 
:root[style*="readium-iPadOSPatch-on"] details, 
:root[style*="readium-iPadOSPatch-on"] summary,
:root[style*="readium-iPadOSPatch-on"] figcaption,
:root[style*="readium-iPadOSPatch-on"] div:not(:has(p, h1, h2, h3, h4, h5, h6, li, th, td, dt, dd, pre, address, aside, details, figcaption, summary)),
:root[style*="readium-iPadOSPatch-on"] aside:not(:has(p, h1, h2, h3, h4, h5, h6, li, th, td, dt, dd, pre, address, aside, details, figcaption, summary)){
  -webkit-text-zoom:reset;
}

:root[style*="readium-iPadOSPatch-on"] abbr, 
:root[style*="readium-iPadOSPatch-on"] b, 
:root[style*="readium-iPadOSPatch-on"] bdi, 
:root[style*="readium-iPadOSPatch-on"] bdo, 
:root[style*="readium-iPadOSPatch-on"] cite, 
:root[style*="readium-iPadOSPatch-on"] code, 
:root[style*="readium-iPadOSPatch-on"] dfn, 
:root[style*="readium-iPadOSPatch-on"] em, 
:root[style*="readium-iPadOSPatch-on"] i, 
:root[style*="readium-iPadOSPatch-on"] kbd, 
:root[style*="readium-iPadOSPatch-on"] mark, 
:root[style*="readium-iPadOSPatch-on"] q, 
:root[style*="readium-iPadOSPatch-on"] rp, 
:root[style*="readium-iPadOSPatch-on"] rt, 
:root[style*="readium-iPadOSPatch-on"] ruby, 
:root[style*="readium-iPadOSPatch-on"] s, 
:root[style*="readium-iPadOSPatch-on"] samp, 
:root[style*="readium-iPadOSPatch-on"] small, 
:root[style*="readium-iPadOSPatch-on"] span, 
:root[style*="readium-iPadOSPatch-on"] strong, 
:root[style*="readium-iPadOSPatch-on"] sub, 
:root[style*="readium-iPadOSPatch-on"] sup, 
:root[style*="readium-iPadOSPatch-on"] time, 
:root[style*="readium-iPadOSPatch-on"] u, 
:root[style*="readium-iPadOSPatch-on"] var{
  -webkit-text-zoom:normal;
}

:root[style*="readium-iPadOSPatch-on"] p:not(:has(b, cite, em, i, q, s, small, span, strong)):first-line{
  -webkit-text-zoom:normal;
}`},Symbol.toStringTag,{value:"Module"})),Fa=Object.freeze(Object.defineProperty({__proto__:null,default:`/* Readium CSS
   EBPAJ Fonts Patch module

   A stylesheet improving EBPAJ @font-face declarations to cover all platforms

   Repo: https://github.com/readium/css */

/* EBPAJ template only references fonts from MS Windows…
   so we must reference fonts from other platforms
   and override authors’ stylesheets.
   What we do there is keeping their default value and providing fallbacks.

   /!\\ /!\\ /!\\ /!\\ /!\\
   FYI, you might want to load this polyfill only if you find
   one of the following metadata items in the OPF package:
   - version 1:
     <dc:description id="ebpaj-guide">ebpaj-guide-1.0</dc:description>
   - version 1.1:
     <meta property="ebpaj:guide-version">1.1</meta>
*/

/* 
   Hiragino PostScript Font name lists:
   https://www.screen.co.jp/ga_product/sento/support/QA/ss_psname.html
*/

/* 横組み用 (horizontal writing) */

@font-face {
  font-family: "serif-ja";
  src: local("ＭＳ Ｐ明朝"), /* for IE */
      local("MS PMincho"), /* ＭＳ Ｐ明朝 */
      local("HiraMinProN-W3"), local("Hiragino Mincho ProN"), /* ヒラギノ明朝 ProN W3 */
      local("HiraMinPro-W3"), local("Hiragino Mincho Pro"), /* ヒラギノ明朝 Pro W3 */
      local("YuMin-Medium"), local("YuMincho"), /* 游明朝体(macOS) */
      local("Yu Mincho"), /* 游明朝(Windows) */
      local("BIZ UDPMincho"); /* BIZ UDP明朝 */
}

@font-face {
  font-family: "sans-serif-ja";
  src: local("ＭＳ Ｐゴシック"), /* for IE */
       local("MS PGothic"), /* ＭＳ Ｐゴシック */
       local("HiraginoSans-W3"), local("Hiragino Sans"), /* ヒラギノ角ゴシック */
       local("HiraKakuProN-W3"), local("Hiragino Kaku Gothic ProN"), /* ヒラギノ角ゴ ProN W3 */
       local("HiraKakuPro-W3"), local("Hiragino Kaku Gothic Pro"), /* ヒラギノ角ゴ Pro W3 */
       local("ヒラギノ角ゴ W3"), /* for old  Safari */
       local("HiraginoKaku-W3-90msp-RKSJ-H"), /* ヒラギノ角ゴ W3(TrueType) */
       local("YuGothic-Medium"), local("YuGothic"), /* 游ゴシック体(macOS) */
       local("Yu Gothic Medium"), local("Yu Gothic"), /* 游ゴシック(Windows) "Yu Gothic" is a fallback. */
       local("BIZ UDPGothic"); /* BIZ UDPゴシック */
}

/* 縦組み用 (vertical writing) */

@font-face {
  font-family: "serif-ja-v";
  src: local("ＭＳ 明朝"), /* for IE */
       local("MS Mincho"), /* ＭＳ 明朝 */
       local("HiraMinProN-W3"), local("Hiragino Mincho ProN"), /* ヒラギノ明朝 ProN W3 */
       local("HiraMinPro-W3"), local("Hiragino Mincho Pro"), /* ヒラギノ明朝 Pro W3 */
       local("YuMin-Medium"), local("YuMincho"), /* 游明朝体(macOS) */
       local("Yu Mincho"), /* 游明朝(Windows) */
       local("BIZ UDMincho"); /*  BIZ UD明朝 */
}

@font-face {
  font-family: "sans-serif-ja-v";
  src: local("ＭＳ ゴシック"), /* for IE */
       local("MS Gothic"), /* ＭＳ ゴシック */
       local("HiraginoSans-W3"), local("Hiragino Sans"), /* ヒラギノ角ゴシック */
       local("HiraKakuProN-W3"), local("Hiragino Kaku Gothic ProN"), /* ヒラギノ角ゴ ProN W3 */
       local("HiraKakuPro-W3"), local("Hiragino Kaku Gothic Pro"), /* ヒラギノ角ゴ Pro W3 */
       local("ヒラギノ角ゴ W3"), /* for old Safari */
       local("HiraKakuDS-W3-83pv-RKSJ-H"), /* ヒラギノ角ゴ W3(TrueType) */
       local("YuGothic-Medium"), local("YuGothic"), /* 游ゴシック体(macOS) */
       local("Yu Gothic Medium"), local("Yu Gothic"), /* 游ゴシック(Windows)  "Yu Gothic" is a fallback. */
       local("BIZ UDGothic"); /* BIZ UDゴシック */
}`},Symbol.toStringTag,{value:"Module"}));y.AudioDefaults=oo,y.AudioNavigator=la,y.AudioPreferences=et,y.AudioPreferencesEditor=bn,y.AudioSettings=_n,y.BUILTIN_DECORATION_TYPES=Qt,y.BooleanPreference=T,y.DecorationLayout=li,y.DecorationStyleType=k,y.DecorationWidth=si,y.EnumPreference=an,y.EpubDefaults=eo,y.EpubNavigator=yn,y.EpubPreferences=ze,y.EpubPreferencesEditor=pn,y.EpubSettings=gn,y.ExperimentalWebPubNavigator=Gr,y.FXLCoordinator=$i,y.FXLFrameManager=ji,y.FXLFramePoolManager=Qi,y.FXLPeripherals=Yi,y.FXLSpreader=qi,y.FrameComms=Ee,y.FrameManager=un,y.FramePoolManager=Bi,y.HorizontalThird=Gi,y.Injector=ln,y.LineLengths=Oe,y.MediaNavigator=bi,y.Navigator=qt,y.Orientation=bt,y.Preference=U,y.Properties=qe,y.RSProperties=to,y.RangePreference=F,y.ReadiumCSS=no,y.Spread=vt,y.TextAlignment=te,y.UserProperties=fn,y.VerticalThird=Vi,y.VisualNavigator=Jt,y.WebAudioEngine=io,y.WebPubBlobBuilder=wi,y.WebPubCSS=Ei,y.WebPubDefaults=zi,y.WebPubFrameManager=Ri,y.WebPubFramePoolManager=Pi,y.WebPubNavigator=Ii,y.WebPubPreferences=xe,y.WebPubPreferencesEditor=sn,y.WebPubSettings=rn,y.WebRSProperties=ki,y.WebUserProperties=nn,y.decorationsEqual=Zt,y.ensureBoolean=P,y.ensureEnumValue=Je,y.ensureExperiment=on,y.ensureFilter=pe,y.ensureLessThanOrEqual=xi,y.ensureMoreThanOrEqual=Fi,y.ensureNonNegative=w,y.ensureString=D,y.ensureValueInRange=I,y.experiments=yt,y.filterRangeConfig=ue,y.fontSizeRangeConfig=De,y.fontWeightRangeConfig=ie,y.fontWidthRangeConfig=We,y.getScriptMode=de,y.i18n=Er,y.letterSpacingRangeConfig=Be,y.lineHeightRangeConfig=je,y.lineLengthRangeConfig=me,y.paragraphIndentRangeConfig=Ge,y.paragraphSpacingRangeConfig=Ve,y.playbackRateRangeConfig=Ye,y.resolveDecorationForWire=he,y.settings=kr,y.skipIntervalRangeConfig=oe,y.volumeRangeConfig=Xe,y.withFallback=St,y.wordSpacingRangeConfig=$e,y.zoomRangeConfig=Ke,Object.defineProperty(y,Symbol.toStringTag,{value:"Module"})}));
