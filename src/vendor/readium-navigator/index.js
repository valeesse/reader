const P = class P {
  constructor(t) {
    this.uri = t;
  }
  /**
   * Parses an [AccessibilityProfile] from its RWPM JSON representation.
   */
  static deserialize(t) {
    if (!(!t || typeof t != "string"))
      return new P(t);
  }
  /**
   * Serializes an [AccessibilityProfile] to its RWPM JSON representation.
   */
  serialize() {
    return this.uri;
  }
  /**
   * Returns true if the profile is a WCAG Level A profile.
   */
  get isWCAGLevelA() {
    return this === P.EPUB_A11Y_10_WCAG_20_A || this === P.EPUB_A11Y_11_WCAG_20_A || this === P.EPUB_A11Y_11_WCAG_21_A || this === P.EPUB_A11Y_11_WCAG_22_A;
  }
  /**
   * Returns true if the profile is a WCAG Level AA profile.
   */
  get isWCAGLevelAA() {
    return this === P.EPUB_A11Y_10_WCAG_20_AA || this === P.EPUB_A11Y_11_WCAG_20_AA || this === P.EPUB_A11Y_11_WCAG_21_AA || this === P.EPUB_A11Y_11_WCAG_22_AA;
  }
  /**
   * Returns true if the profile is a WCAG Level AAA profile.
   */
  get isWCAGLevelAAA() {
    return this === P.EPUB_A11Y_10_WCAG_20_AAA || this === P.EPUB_A11Y_11_WCAG_20_AAA || this === P.EPUB_A11Y_11_WCAG_21_AAA || this === P.EPUB_A11Y_11_WCAG_22_AAA;
  }
};
P.EPUB_A11Y_10_WCAG_20_A = new P("http://www.idpf.org/epub/a11y/accessibility-20170105.html#wcag-a"), P.EPUB_A11Y_10_WCAG_20_AA = new P("http://www.idpf.org/epub/a11y/accessibility-20170105.html#wcag-aa"), P.EPUB_A11Y_10_WCAG_20_AAA = new P("http://www.idpf.org/epub/a11y/accessibility-20170105.html#wcag-aaa"), P.EPUB_A11Y_11_WCAG_20_A = new P("https://www.w3.org/TR/epub-a11y-11#wcag-2.0-a"), P.EPUB_A11Y_11_WCAG_20_AA = new P("https://www.w3.org/TR/epub-a11y-11#wcag-2.0-aa"), P.EPUB_A11Y_11_WCAG_20_AAA = new P("https://www.w3.org/TR/epub-a11y-11#wcag-2.0-aaa"), P.EPUB_A11Y_11_WCAG_21_A = new P("https://www.w3.org/TR/epub-a11y-11#wcag-2.1-a"), P.EPUB_A11Y_11_WCAG_21_AA = new P("https://www.w3.org/TR/epub-a11y-11#wcag-2.1-aa"), P.EPUB_A11Y_11_WCAG_21_AAA = new P("https://www.w3.org/TR/epub-a11y-11#wcag-2.1-aaa"), P.EPUB_A11Y_11_WCAG_22_A = new P("https://www.w3.org/TR/epub-a11y-11#wcag-2.2-a"), P.EPUB_A11Y_11_WCAG_22_AA = new P("https://www.w3.org/TR/epub-a11y-11#wcag-2.2-aa"), P.EPUB_A11Y_11_WCAG_22_AAA = new P("https://www.w3.org/TR/epub-a11y-11#wcag-2.2-aaa");
let si = P;
const k = class k {
  constructor(t) {
    this.value = t;
  }
  /**
   * Parses an [AccessMode] from its RWPM JSON representation.
   */
  static deserialize(t) {
    if (!(!t || typeof t != "string"))
      return new k(t);
  }
  /**
   * Serializes an [AccessMode] to its RWPM JSON representation.
   */
  serialize() {
    return this.value;
  }
};
k.AUDITORY = new k("auditory"), k.CHART_ON_VISUAL = new k("chartOnVisual"), k.CHEM_ON_VISUAL = new k("chemOnVisual"), k.COLOR_DEPENDENT = new k("colorDependent"), k.DIAGRAM_ON_VISUAL = new k("diagramOnVisual"), k.MATH_ON_VISUAL = new k("mathOnVisual"), k.MUSIC_ON_VISUAL = new k("musicOnVisual"), k.TACTILE = new k("tactile"), k.TEXT_ON_VISUAL = new k("textOnVisual"), k.TEXTUAL = new k("textual"), k.VISUAL = new k("visual");
let ri = k;
const U = class U {
  constructor(t) {
    if (typeof t == "string") {
      if (!U.VALID_MODES.has(t.toLowerCase()))
        return;
      this.value = t.toLowerCase();
    } else {
      const e = t.filter(
        (i) => U.VALID_MODES.has(i.toLowerCase())
      );
      if (e.length === 0)
        return;
      this.value = Array.from(new Set(e));
    }
  }
  /**
   * Parses a [PrimaryAccessMode] from its RWPM JSON representation.
   */
  static deserialize(t) {
    if (!t) return;
    if (typeof t == "string")
      return new U(t);
    if (!Array.isArray(t)) return;
    const e = t.filter((i) => i ? U.VALID_MODES.has(i.toLowerCase()) : !1);
    if (e.length !== 0)
      return new U(e);
  }
  /**
   * Serializes a [PrimaryAccessMode] to its RWPM JSON representation.
   */
  serialize() {
    return this.value;
  }
};
U.VALID_MODES = /* @__PURE__ */ new Set(["auditory", "tactile", "textual", "visual"]), U.AUDITORY = new U("auditory"), U.TACTILE = new U("tactile"), U.TEXTUAL = new U("textual"), U.VISUAL = new U("visual");
let oi = U;
const y = class y {
  constructor(t) {
    this.value = t;
  }
  /**
   * Parses a [Feature] from its RWPM JSON representation.
   */
  static deserialize(t) {
    if (!(!t || typeof t != "string"))
      return new y(t);
  }
  /**
   * Serializes a [Feature] to its RWPM JSON representation.
   */
  serialize() {
    return this.value;
  }
};
y.NONE = new y("none"), y.ANNOTATIONS = new y("annotations"), y.ARIA = new y("ARIA"), y.INDEX = new y("index"), y.PAGE_BREAK_MARKERS = new y("pageBreakMarkers"), y.PAGE_NAVIGATION = new y("pageNavigation"), y.PRINT_PAGE_NUMBERS = new y("printPageNumbers"), y.READING_ORDER = new y("readingOrder"), y.STRUCTURAL_NAVIGATION = new y("structuralNavigation"), y.TABLE_OF_CONTENTS = new y("tableOfContents"), y.TAGGED_PDF = new y("taggedPDF"), y.ALTERNATIVE_TEXT = new y("alternativeText"), y.AUDIO_DESCRIPTION = new y("audioDescription"), y.CAPTIONS = new y("captions"), y.CLOSED_CAPTIONS = new y("closedCaptions"), y.DESCRIBED_MATH = new y("describedMath"), y.LONG_DESCRIPTION = new y("longDescription"), y.OPEN_CAPTIONS = new y("openCaptions"), y.SIGN_LANGUAGE = new y("signLanguage"), y.TRANSCRIPT = new y("transcript"), y.DISPLAY_TRANSFORMABILITY = new y("displayTransformability"), y.SYNCHRONIZED_AUDIO_TEXT = new y("synchronizedAudioText"), y.TIMING_CONTROL = new y("timingControl"), y.UNLOCKED = new y("unlocked"), y.CHEM_ML = new y("ChemML"), y.LATEX = new y("latex"), y.LATEX_CHEMISTRY = new y("latex-chemistry"), y.MATH_ML = new y("MathML"), y.MATH_ML_CHEMISTRY = new y("MathML-chemistry"), y.TTS_MARKUP = new y("ttsMarkup"), y.HIGH_CONTRAST_AUDIO = new y("highContrastAudio"), y.HIGH_CONTRAST_DISPLAY = new y("highContrastDisplay"), y.LARGE_PRINT = new y("largePrint"), y.BRAILLE = new y("braille"), y.TACTILE_GRAPHIC = new y("tactileGraphic"), y.TACTILE_OBJECT = new y("tactileObject"), y.FULL_RUBY_ANNOTATIONS = new y("fullRubyAnnotations"), y.HORIZONTAL_WRITING = new y("horizontalWriting"), y.RUBY_ANNOTATIONS = new y("rubyAnnotations"), y.VERTICAL_WRITING = new y("verticalWriting"), y.WITH_ADDITIONAL_WORD_SEGMENTATION = new y("withAdditionalWordSegmentation"), y.WITHOUT_ADDITIONAL_WORD_SEGMENTATION = new y("withoutAdditionalWordSegmentation");
let $t = y;
const O = class O {
  constructor(t) {
    this.value = t;
  }
  /**
   * Parses a [Hazard] from its RWPM JSON representation.
   */
  static deserialize(t) {
    if (!(!t || typeof t != "string"))
      return new O(t);
  }
  /**
   * Serializes a [Hazard] to its RWPM JSON representation.
   */
  serialize() {
    return this.value;
  }
};
O.FLASHING = new O("flashing"), O.NO_FLASHING_HAZARD = new O("noFlashingHazard"), O.UNKNOWN_FLASHING_HAZARD = new O("unknownFlashingHazard"), O.MOTION_SIMULATION = new O("motionSimulation"), O.NO_MOTION_SIMULATION_HAZARD = new O("noMotionSimulationHazard"), O.UNKNOWN_MOTION_SIMULATION_HAZARD = new O("unknownMotionSimulationHazard"), O.SOUND = new O("sound"), O.NO_SOUND_HAZARD = new O("noSoundHazard"), O.UNKNOWN_SOUND_HAZARD = new O("unknownSoundHazard"), O.UNKNOWN = new O("unknown"), O.NONE = new O("none");
let ai = O;
const A = class A {
  constructor(t) {
    this.value = t;
  }
  /**
   * Parses an [Exemption] from its RWPM JSON representation.
   */
  static deserialize(t) {
    if (!(!t || typeof t != "string"))
      return new A(t);
  }
  /**
   * Serializes an [Exemption] to its RWPM JSON representation.
   */
  serialize() {
    return this.value;
  }
};
A.NONE = new A("none"), A.DOCUMENTED = new A("documented"), A.LEGAL = new A("legal"), A.TEMPORARY = new A("temporary"), A.TECHNICAL = new A("technical"), A.EAA_DISPROPORTIONATE_BURDEN = new A("eaa-disproportionate-burden"), A.EAA_FUNDAMENTAL_ALTERATION = new A("eaa-fundamental-alteration"), A.EAA_MICROENTERPRISE = new A("eaa-microenterprise"), A.EAA_TECHNICAL_IMPOSSIBILITY = new A("eaa-technical-impossibility"), A.EAA_TEMPORARY = new A("eaa-temporary");
let li = A;
const hi = ["en", "ar", "da", "fr", "it", "pt_PT", "sv"], Un = /* @__PURE__ */ JSON.parse(`{"format":{"audiobook":"Audiobook","audiobookJSON":"Audiobook Manifest","cbz":"Comic Book Archive","divina":"Divina Publication","divinaJSON":"Divina Publication Manifest","epub":"EPUB","lcpa":"LCP Protected Audiobook","lcpdf":"LCP Protected PDF","lcpl":"LCP License Document","pdf":"PDF","rwp":"Readium Web Publication","rwpm":"Readium Web Publication Manifest","zab":"Audiobook Archive","zip":"ZIP Archive"},"kind":{"audiobook_one":"audiobook","audiobook_other":"audiobooks","book_one":"book","book_other":"books","comic_one":"comic","comic_other":"comics","document_one":"document","document_other":"documents"},"metadata":{"accessibility":{"display-guide":{"accessibility-summary":{"no-metadata":"No information is available","publisher-contact":"For more information about the accessibility of this product, please contact the publisher: ","title":"Accessibility summary"},"additional-accessibility-information":{"aria":{"compact":"ARIA roles included","descriptive":"Content is enhanced with ARIA roles to optimize organization and facilitate navigation"},"audio-descriptions":"Audio descriptions","braille":"Braille","color-not-sole-means-of-conveying-information":"Color is not the sole means of conveying information","dyslexia-readability":"Dyslexia readability","full-ruby-annotations":"Full ruby annotations","high-contrast-between-foreground-and-background-audio":"High contrast between foreground and background audio","high-contrast-between-text-and-background":"High contrast between foreground text and background","large-print":"Large print","page-breaks":{"compact":"Page breaks included","descriptive":"Page breaks included from the original print source"},"ruby-annotations":"Some Ruby annotations","sign-language":"Sign language","tactile-graphics":{"compact":"Tactile graphics included","descriptive":"Tactile graphics have been integrated to facilitate access to visual elements for blind people"},"tactile-objects":"Tactile 3D objects","text-to-speech-hinting":"Text-to-speech hinting provided","title":"Additional accessibility information","ultra-high-contrast-between-text-and-background":"Ultra high contrast between text and background","visible-page-numbering":"Visible page numbering","without-background-sounds":"Without background sounds"},"conformance":{"a":{"compact":"This publication meets minimum accessibility standards","descriptive":"The publication contains a conformance statement that it meets the EPUB Accessibility and WCAG 2 Level A standard"},"aa":{"compact":"This publication meets accepted accessibility standards","descriptive":"The publication contains a conformance statement that it meets the EPUB Accessibility and WCAG 2 Level AA standard"},"aaa":{"compact":"This publication exceeds accepted accessibility standards","descriptive":"The publication contains a conformance statement that it meets the EPUB Accessibility and WCAG 2 Level AAA standard"},"certifier":"The publication was certified by ","certifier-credentials":"The certifier's credential is ","details":{"certification-info":"The publication was certified on ","certifier-report":"For more information refer to the certifier's report","claim":"This publication claims to meet","epub-accessibility-1-0":"EPUB Accessibility 1.0","epub-accessibility-1-1":"EPUB Accessibility 1.1","level-a":"Level A","level-aa":"Level AA","level-aaa":"Level AAA","wcag-2-0":{"compact":"WCAG 2.0","descriptive":"Web Content Accessibility Guidelines (WCAG) 2.0"},"wcag-2-1":{"compact":"WCAG 2.1","descriptive":"Web Content Accessibility Guidelines (WCAG) 2.1"},"wcag-2-2":{"compact":"WCAG 2.2","descriptive":"Web Content Accessibility Guidelines (WCAG) 2.2"}},"details-title":"Detailed conformance information","no":"No information is available","title":"Conformance","unknown-standard":"Conformance to accepted standards for accessibility of this publication cannot be determined"},"hazards":{"flashing":{"compact":"Flashing content","descriptive":"The publication contains flashing content that can cause photosensitive seizures"},"flashing-none":{"compact":"No flashing hazards","descriptive":"The publication does not contain flashing content that can cause photosensitive seizures"},"flashing-unknown":{"compact":"Flashing hazards not known","descriptive":"The presence of flashing content that can cause photosensitive seizures could not be determined"},"motion":{"compact":"Motion simulation","descriptive":"The publication contains motion simulations that can cause motion sickness"},"motion-none":{"compact":"No motion simulation hazards","descriptive":"The publication does not contain motion simulations that can cause motion sickness"},"motion-unknown":{"compact":"Motion simulation hazards not known","descriptive":"The presence of motion simulations that can cause motion sickness could not be determined"},"no-metadata":"No information is available","none":{"compact":"No hazards","descriptive":"The publication contains no hazards"},"sound":{"compact":"Sounds","descriptive":"The publication contains sounds that can cause sensitivity issues"},"sound-none":{"compact":"No sound hazards","descriptive":"The publication does not contain sounds that can cause sensitivity issues"},"sound-unknown":{"compact":"Sound hazards not known","descriptive":"The presence of sounds that can cause sensitivity issues could not be determined"},"title":"Hazards","unknown":"The presence of hazards is unknown"},"legal-considerations":{"exempt":{"compact":"Claims an accessibility exemption in some jurisdictions","descriptive":"This publication claims an accessibility exemption in some jurisdictions"},"no-metadata":"No information is available","title":"Legal considerations"},"navigation":{"index":{"compact":"Index","descriptive":"Index with links to referenced entries"},"no-metadata":"No information is available","page-navigation":{"compact":"Go to page","descriptive":"Page list to go to pages from the print source version"},"structural":{"compact":"Headings","descriptive":"Elements such as headings, tables, etc for structured navigation"},"title":"Navigation","toc":{"compact":"Table of contents","descriptive":"Table of contents to all chapters of the text via links"}},"rich-content":{"accessible-chemistry-as-latex":{"compact":"Chemical formulas in LaTeX","descriptive":"Chemical formulas in accessible format (LaTeX)"},"accessible-chemistry-as-mathml":{"compact":"Chemical formulas in MathML","descriptive":"Chemical formulas in accessible format (MathML)"},"accessible-math-as-latex":{"compact":"Math as LaTeX","descriptive":"Math formulas in accessible format (LaTeX)"},"accessible-math-described":"Text descriptions of math are provided","closed-captions":{"compact":"Videos have closed captions","descriptive":"Videos included in publications have closed captions"},"extended-descriptions":"Information-rich images are described by extended descriptions","math-as-mathml":{"compact":"Math as MathML","descriptive":"Math formulas in accessible format (MathML)"},"open-captions":{"compact":"Videos have open captions","descriptive":"Videos included in publications have open captions"},"title":"Rich content","transcript":"Transcript(s) provided","unknown":"No information is available"},"ways-of-reading":{"nonvisual-reading":{"alt-text":{"compact":"Has alternative text","descriptive":"Has alternative text descriptions for images"},"no-metadata":"No information about nonvisual reading is available","none":{"compact":"Not readable in read aloud or dynamic braille","descriptive":"The content is not readable as read aloud speech or dynamic braille"},"not-fully":{"compact":"Not fully readable in read aloud or dynamic braille","descriptive":"Not all of the content will be readable as read aloud speech or dynamic braille"},"readable":{"compact":"Readable in read aloud or dynamic braille","descriptive":"All content can be read as read aloud speech or dynamic braille"}},"prerecorded-audio":{"complementary":{"compact":"Prerecorded audio clips","descriptive":"Prerecorded audio clips are embedded in the content"},"no-metadata":"No information about prerecorded audio is available","only":{"compact":"Prerecorded audio only","descriptive":"Audiobook with no text alternative"},"synchronized":{"compact":"Prerecorded audio synchronized with text","descriptive":"All the content is available as prerecorded audio synchronized with text"}},"title":"Ways of reading","visual-adjustments":{"modifiable":{"compact":"Appearance can be modified","descriptive":"Appearance of the text and page layout can be modified according to the capabilities of the reading system (font family and font size, spaces between paragraphs, sentences, words, and letters, as well as color of background and text)"},"unknown":"No information about appearance modifiability is available","unmodifiable":{"compact":"Appearance cannot be modified","descriptive":"Text and page layout cannot be modified as the reading experience is close to a print version, but reading systems can still provide zooming options"}}}}},"altIdentifier_one":"alternate identifier","altIdentifier_other":"alternate identifiers","artist_one":"artist","artist_other":"artists","author_one":"author","author_other":"authors","collection_one":"editorial collection","collection_other":"editorial collections","colorist_one":"colorist","colorist_other":"colorists","contributor_one":"contributor","contributor_other":"contributors","description":"description","duration":"duration","editor_one":"editor","editor_other":"editors","identifier_one":"identifier","identifier_other":"identifiers","illustrator_one":"illustrator","illustrator_other":"illustrators","imprint_one":"imprint","imprint_other":"imprints","inker_one":"inker","inker_other":"inkers","language_one":"language","language_other":"languages","letterer_one":"letterer","letterer_other":"letterers","modified":"modification date","narrator_one":"narrator","narrator_other":"narrators","numberOfPages":"print length","penciler_one":"penciler","penciler_other":"pencilers","published":"publication date","publisher_one":"publisher","publisher_other":"publishers","series_one":"series","series_other":"series","subject_one":"subject","subject_other":"subjects","subtitle":"subtitle","title":"title","translator_one":"translator","translator_other":"translators"}}`), Hn = {
  publication: Un
}, ci = {
  fr: () => import("./fr-C5HEel98.js"),
  ar: () => import("./ar-DyHX_uy2.js"),
  da: () => import("./da-Dct0PS3E.js"),
  //  'el': () => import('@edrlab/thorium-locales/publication-metadata/el.json'),
  //  'et': () => import('@edrlab/thorium-locales/publication-metadata/et.json'),
  it: () => import("./it-DFOBoXGy.js"),
  pt_PT: () => import("./pt_PT-Di3sVjze.js"),
  sv: () => import("./sv-BfzAFsVN.js")
  //  'tr': () => import('@edrlab/thorium-locales/publication-metadata/tr.json'),
  //  'uk': () => import('@edrlab/thorium-locales/publication-metadata/uk.json')
}, di = Hn?.publication?.metadata?.accessibility?.["display-guide"] || {};
class vt {
  constructor() {
    this.currentLocaleCode = "en", this.locale = di, this.loadedLocales = {}, this.loadedLocales.en = di;
  }
  static getInstance() {
    return vt.instance || (vt.instance = new vt()), vt.instance;
  }
  /**
   * Loads a locale dynamically
   * @param localeCode BCP 47 language code (e.g., 'en', 'fr')
   * @returns Promise indicating if the locale was loaded successfully
   */
  async loadLocale(t) {
    if (!hi.includes(t))
      return console.warn(`Locale '${t}' is not enabled`), !1;
    if (t in this.loadedLocales)
      return !0;
    try {
      if (!(t in ci))
        return console.warn(`Locale file not found for: ${t}`), !1;
      const n = (await ci[t]()).default?.publication?.metadata?.accessibility?.["display-guide"];
      return n ? (this.loadedLocales[t] = n, !0) : (console.warn(`No accessibility strings found in locale ${t}`), !1);
    } catch (e) {
      return console.warn(`Failed to load locale ${t}:`, e), !1;
    }
  }
  /**
   * Registers a new locale or updates an existing one
   * @param localeCode BCP 47 language code (e.g., 'en', 'fr-FR')
   * @param localeData The locale data to register
   */
  registerLocale(t, e) {
    if (!t || typeof t != "string")
      throw new Error("Locale code must be a non-empty string");
    this.loadedLocales[t] = e;
  }
  /**
   * Sets the current locale by language code, loading it dynamically if needed
   * @param localeCode BCP 47 language code (e.g., 'en', 'fr')
   * @returns Promise indicating if the locale was set successfully
   */
  async setLocale(t) {
    return t in this.loadedLocales || await this.loadLocale(t), t in this.loadedLocales ? (this.locale = this.loadedLocales[t], this.currentLocaleCode = t, !0) : (console.warn(`Locale '${t}' is not available`), !1);
  }
  /**
   * Gets the current locale code (BCP 47)
   */
  getCurrentLocale() {
    return this.currentLocaleCode;
  }
  /**
   * Gets a list of available locale codes
   */
  getAvailableLocales() {
    return hi;
  }
  getNestedValue(t, e) {
    const i = e.split(".");
    let n = t;
    for (const s of i) {
      if (n == null)
        return;
      n = n[s];
    }
    return n;
  }
  /**
   * Gets a localized string by key
   * @param key The key for the string to retrieve
   * @returns The localized string as a [L10nString], or an empty string if not found
   */
  getString(t) {
    let e = this.getNestedValue(this.locale, t);
    return e === void 0 && this.currentLocaleCode !== "en" && (e = this.getNestedValue(this.loadedLocales.en, t)), e !== void 0 ? typeof e == "string" ? { compact: e, descriptive: e } : e : (console.warn(`Missing localization for key: ${t}`), { compact: "", descriptive: "" });
  }
}
vt.getInstance();
var v = /* @__PURE__ */ ((r) => (r.reflowable = "reflowable", r.fixed = "fixed", r.scrolled = "scrolled", r))(v || {});
class He {
  /**
   * Creates a [Encryption].
   */
  constructor(t) {
    this.algorithm = t.algorithm, this.compression = t.compression, this.originalLength = t.originalLength, this.profile = t.profile, this.scheme = t.scheme;
  }
  /**
   * Parses a [Encryption] from its RWPM JSON representation.
   */
  static deserialize(t) {
    if (t && t.algorithm)
      return new He({
        algorithm: t.algorithm,
        compression: t.compression,
        originalLength: t.originalLength,
        profile: t.profile,
        scheme: t.scheme
      });
  }
  /**
   * Serializes a [Encryption] to its RWPM JSON representation.
   */
  serialize() {
    const t = { algorithm: this.algorithm };
    return this.compression !== void 0 && (t.compression = this.compression), this.originalLength !== void 0 && (t.originalLength = this.originalLength), this.profile !== void 0 && (t.profile = this.profile), this.scheme !== void 0 && (t.scheme = this.scheme), t;
  }
}
var K = /* @__PURE__ */ ((r) => (r.left = "left", r.right = "right", r.center = "center", r))(K || {});
let J = class Ce {
  constructor(t) {
    this.otherProperties = t;
  }
  get page() {
    return this.otherProperties.page;
  }
  /**
   * Creates a [Properties] from its RWPM JSON representation.
   */
  static deserialize(t) {
    if (t)
      return new Ce(t);
  }
  /**
   * Serializes a [Properties] to its RWPM JSON representation.
   */
  serialize() {
    return this.otherProperties;
  }
  /**
   * Makes a copy of this [Properties] after merging in the given additional other [properties].
   */
  add(t) {
    const e = Object.assign({}, this.otherProperties);
    for (const i in t)
      e[i] = t[i];
    return new Ce(e);
  }
};
Object.defineProperty(J.prototype, "encryption", {
  get: function() {
    return He.deserialize(this.otherProperties.encrypted);
  }
});
function Wn(r) {
  return r && Array.isArray(r) ? r : void 0;
}
function tn(r) {
  return r && typeof r == "string" ? [r] : Wn(r);
}
function ui(r) {
  return typeof r == "string" ? new Date(r) : void 0;
}
function jt(r) {
  return isNaN(r) ? void 0 : r;
}
function $(r) {
  return jt(r) !== void 0 && Math.sign(r) >= 0 ? r : void 0;
}
function Bn(r) {
  const t = new Array();
  return r.forEach((e) => t.push(e)), t;
}
class g {
  /** Creates a MediaType object. */
  constructor(t) {
    let e, i, n = t.mediaType.replace(/\s/g, "").split(";");
    const s = n[0].split("/");
    if (s.length === 2) {
      if (e = s[0].toLowerCase().trim(), i = s[1].toLowerCase().trim(), e.length === 0 || i.length === 0)
        throw new Error("Invalid media type");
    } else
      throw new Error("Invalid media type");
    const o = {};
    for (let u = 1; u < n.length; u++) {
      const m = n[u].split("=");
      if (m.length === 2) {
        const p = m[0].toLocaleLowerCase(), f = p === "charset" ? m[1].toUpperCase() : m[1];
        o[p] = f;
      }
    }
    const a = {}, l = Object.keys(o);
    l.sort((u, m) => u.localeCompare(m)), l.forEach((u) => a[u] = o[u]);
    let d = "";
    for (const u in a) {
      const m = a[u];
      d += `;${u}=${m}`;
    }
    const h = `${e}/${i}${d}`, c = a.encoding;
    this.string = h, this.type = e, this.subtype = i, this.parameters = a, this.encoding = c, this.name = t.name, this.fileExtension = t.fileExtension;
  }
  static parse(t) {
    return new g(t);
  }
  /** Structured syntax suffix, e.g. `+zip` in `application/epub+zip`.
   *  Gives a hint on the underlying structure of this media type.
   *  See. https://tools.ietf.org/html/rfc6838#section-4.2.8
   */
  get structuredSyntaxSuffix() {
    const t = this.subtype.split("+");
    return t.length > 1 ? `+${t[t.length - 1]}` : void 0;
  }
  /** Parameter values might or might not be case-sensitive, depending on the semantics of
   * the parameter name.
   * https://tools.ietf.org/html/rfc2616#section-3.7
   *
   * The character set names may be up to 40 characters taken from the printable characters
   * of US-ASCII.  However, no distinction is made between use of upper and lower case
   * letters.
   * https://www.iana.org/assignments/character-sets/character-sets.xhtml
   */
  get charset() {
    return this.parameters.charset;
  }
  /** Returns whether the given `other` media type is included in this media type.
   *  For example, `text/html` contains `text/html;charset=utf-8`.
   *  - `other` must match the parameters in the `parameters` property, but extra parameters
   *  are ignored.
   *  - Order of parameters is ignored.
   *  - Wildcards are supported, meaning that `image/*` contains `image/png`
   */
  contains(t) {
    const e = typeof t == "string" ? g.parse({ mediaType: t }) : t;
    if (!((this.type === "*" || this.type === e.type) && (this.subtype === "*" || this.subtype === e.subtype)))
      return !1;
    const i = new Set(
      Object.entries(this.parameters).map(([s, o]) => `${s}=${o}`)
    ), n = new Set(
      Object.entries(e.parameters).map(([s, o]) => `${s}=${o}`)
    );
    for (const s of Array.from(i.values()))
      if (!n.has(s))
        return !1;
    return !0;
  }
  /** Returns whether this media type and `other` are the same, ignoring parameters that
   *  are not in both media types.
   *  For example, `text/html` matches `text/html;charset=utf-8`, but `text/html;charset=ascii`
   *  doesn't. This is basically like `contains`, but working in both direction.
   */
  matches(t) {
    const e = typeof t == "string" ? g.parse({ mediaType: t }) : t;
    return this.contains(e) || e.contains(this);
  }
  /**
   * Returns whether this media type matches any of the [others] media types.
   */
  matchesAny(...t) {
    for (const e of t)
      if (this.matches(e))
        return !0;
    return !1;
  }
  /** Checks the MediaType equals another one (comparing their string) */
  equals(t) {
    return this.string === t.string;
  }
  /** Returns whether this media type is structured as a ZIP archive. */
  get isZIP() {
    return this.matchesAny(
      g.ZIP,
      g.LCP_PROTECTED_AUDIOBOOK,
      g.LCP_PROTECTED_PDF
    ) || this.structuredSyntaxSuffix === "+zip";
  }
  /** Returns whether this media type is structured as a JSON file. */
  get isJSON() {
    return this.matchesAny(g.JSON) || this.structuredSyntaxSuffix === "+json";
  }
  /** Returns whether this media type is of an OPDS feed. */
  get isOPDS() {
    return this.matchesAny(
      g.OPDS1,
      g.OPDS1_ENTRY,
      g.OPDS2,
      g.OPDS2_PUBLICATION,
      g.OPDS_AUTHENTICATION
    ) || this.structuredSyntaxSuffix === "+json";
  }
  /** Returns whether this media type is of an HTML document. */
  get isHTML() {
    return this.matchesAny(g.HTML, g.XHTML);
  }
  /** Returns whether this media type is of a bitmap image, so excluding vectorial formats. */
  get isBitmap() {
    return this.matchesAny(
      g.AVIF,
      g.BMP,
      g.GIF,
      g.JPEG,
      g.PNG,
      g.TIFF,
      g.WEBP
    );
  }
  /** Returns whether this media type is of an audio clip. */
  get isAudio() {
    return this.type === "audio";
  }
  /** Returns whether this media type is of a video clip. */
  get isVideo() {
    return this.type === "video";
  }
  /** Returns whether this media type is of a Readium Web Publication Manifest. */
  get isRWPM() {
    return this.matchesAny(
      g.READIUM_AUDIOBOOK_MANIFEST,
      g.DIVINA_MANIFEST,
      g.READIUM_WEBPUB_MANIFEST
    );
  }
  /** Returns whether this media type is of a publication file. */
  get isPublication() {
    return this.matchesAny(
      g.READIUM_AUDIOBOOK,
      g.READIUM_AUDIOBOOK_MANIFEST,
      g.CBZ,
      g.DIVINA,
      g.DIVINA_MANIFEST,
      g.EPUB,
      g.LCP_PROTECTED_AUDIOBOOK,
      g.LCP_PROTECTED_PDF,
      g.LPF,
      g.PDF,
      g.W3C_WPUB_MANIFEST,
      g.READIUM_WEBPUB,
      g.READIUM_WEBPUB_MANIFEST,
      g.ZAB
    );
  }
  // Known Media Types
  static get AAC() {
    return g.parse({ mediaType: "audio/aac", fileExtension: "aac" });
  }
  static get ACSM() {
    return g.parse({
      mediaType: "application/vnd.adobe.adept+xml",
      name: "Adobe Content Server Message",
      fileExtension: "acsm"
    });
  }
  static get AIFF() {
    return g.parse({ mediaType: "audio/aiff", fileExtension: "aiff" });
  }
  static get AVI() {
    return g.parse({
      mediaType: "video/x-msvideo",
      fileExtension: "avi"
    });
  }
  static get AVIF() {
    return g.parse({ mediaType: "image/avif", fileExtension: "avif" });
  }
  static get BINARY() {
    return g.parse({ mediaType: "application/octet-stream" });
  }
  static get BMP() {
    return g.parse({ mediaType: "image/bmp", fileExtension: "bmp" });
  }
  static get CBZ() {
    return g.parse({
      mediaType: "application/vnd.comicbook+zip",
      name: "Comic Book Archive",
      fileExtension: "cbz"
    });
  }
  static get CSS() {
    return g.parse({ mediaType: "text/css", fileExtension: "css" });
  }
  static get DIVINA() {
    return g.parse({
      mediaType: "application/divina+zip",
      name: "Digital Visual Narratives",
      fileExtension: "divina"
    });
  }
  static get DIVINA_MANIFEST() {
    return g.parse({
      mediaType: "application/divina+json",
      name: "Digital Visual Narratives",
      fileExtension: "json"
    });
  }
  static get EPUB() {
    return g.parse({
      mediaType: "application/epub+zip",
      name: "EPUB",
      fileExtension: "epub"
    });
  }
  static get GIF() {
    return g.parse({ mediaType: "image/gif", fileExtension: "gif" });
  }
  static get GZ() {
    return g.parse({
      mediaType: "application/gzip",
      fileExtension: "gz"
    });
  }
  static get HTML() {
    return g.parse({ mediaType: "text/html", fileExtension: "html" });
  }
  static get JAVASCRIPT() {
    return g.parse({
      mediaType: "text/javascript",
      fileExtension: "js"
    });
  }
  static get JPEG() {
    return g.parse({ mediaType: "image/jpeg", fileExtension: "jpeg" });
  }
  static get JSON() {
    return g.parse({ mediaType: "application/json" });
  }
  static get LCP_LICENSE_DOCUMENT() {
    return g.parse({
      mediaType: "application/vnd.readium.lcp.license.v1.0+json",
      name: "LCP License",
      fileExtension: "lcpl"
    });
  }
  static get LCP_PROTECTED_AUDIOBOOK() {
    return g.parse({
      mediaType: "application/audiobook+lcp",
      name: "LCP Protected Audiobook",
      fileExtension: "lcpa"
    });
  }
  static get LCP_PROTECTED_PDF() {
    return g.parse({
      mediaType: "application/pdf+lcp",
      name: "LCP Protected PDF",
      fileExtension: "lcpdf"
    });
  }
  static get LCP_STATUS_DOCUMENT() {
    return g.parse({
      mediaType: "application/vnd.readium.license.status.v1.0+json"
    });
  }
  static get LPF() {
    return g.parse({
      mediaType: "application/lpf+zip",
      fileExtension: "lpf"
    });
  }
  static get MP3() {
    return g.parse({ mediaType: "audio/mpeg", fileExtension: "mp3" });
  }
  static get MPEG() {
    return g.parse({ mediaType: "video/mpeg", fileExtension: "mpeg" });
  }
  static get NCX() {
    return g.parse({
      mediaType: "application/x-dtbncx+xml",
      fileExtension: "ncx"
    });
  }
  static get OGG() {
    return g.parse({ mediaType: "audio/ogg", fileExtension: "oga" });
  }
  static get OGV() {
    return g.parse({ mediaType: "video/ogg", fileExtension: "ogv" });
  }
  static get OPDS1() {
    return g.parse({
      mediaType: "application/atom+xml;profile=opds-catalog"
    });
  }
  static get OPDS1_ENTRY() {
    return g.parse({
      mediaType: "application/atom+xml;type=entry;profile=opds-catalog"
    });
  }
  static get OPDS2() {
    return g.parse({ mediaType: "application/opds+json" });
  }
  static get OPDS2_PUBLICATION() {
    return g.parse({ mediaType: "application/opds-publication+json" });
  }
  static get OPDS_AUTHENTICATION() {
    return g.parse({
      mediaType: "application/opds-authentication+json"
    });
  }
  static get OPUS() {
    return g.parse({ mediaType: "audio/opus", fileExtension: "opus" });
  }
  static get OTF() {
    return g.parse({ mediaType: "font/otf", fileExtension: "otf" });
  }
  static get PDF() {
    return g.parse({
      mediaType: "application/pdf",
      name: "PDF",
      fileExtension: "pdf"
    });
  }
  static get PNG() {
    return g.parse({ mediaType: "image/png", fileExtension: "png" });
  }
  static get READIUM_AUDIOBOOK() {
    return g.parse({
      mediaType: "application/audiobook+zip",
      name: "Readium Audiobook",
      fileExtension: "audiobook"
    });
  }
  static get READIUM_AUDIOBOOK_MANIFEST() {
    return g.parse({
      mediaType: "application/audiobook+json",
      name: "Readium Audiobook",
      fileExtension: "json"
    });
  }
  static get READIUM_CONTENT_DOCUMENT() {
    return g.parse({
      mediaType: "application/vnd.readium.content+json",
      name: "Readium Content Document",
      fileExtension: "json"
    });
  }
  static get READIUM_GUIDED_NAVIGATION_DOCUMENT() {
    return g.parse({
      mediaType: "application/guided-navigation+json",
      name: "Readium Guided Navigation Document",
      fileExtension: "json"
    });
  }
  static get READIUM_POSITION_LIST() {
    return g.parse({
      mediaType: "application/vnd.readium.position-list+json",
      name: "Readium Position List",
      fileExtension: "json"
    });
  }
  static get READIUM_WEBPUB() {
    return g.parse({
      mediaType: "application/webpub+zip",
      name: "Readium Web Publication",
      fileExtension: "webpub"
    });
  }
  static get READIUM_WEBPUB_MANIFEST() {
    return g.parse({
      mediaType: "application/webpub+json",
      name: "Readium Web Publication",
      fileExtension: "json"
    });
  }
  static get SMIL() {
    return g.parse({
      mediaType: "application/smil+xml",
      fileExtension: "smil"
    });
  }
  static get SVG() {
    return g.parse({
      mediaType: "image/svg+xml",
      fileExtension: "svg"
    });
  }
  static get TEXT() {
    return g.parse({ mediaType: "text/plain", fileExtension: "txt" });
  }
  static get TIFF() {
    return g.parse({ mediaType: "image/tiff", fileExtension: "tiff" });
  }
  static get TTF() {
    return g.parse({ mediaType: "font/ttf", fileExtension: "ttf" });
  }
  static get W3C_WPUB_MANIFEST() {
    return g.parse({
      mediaType: "application/x.readium.w3c.wpub+json",
      name: "Web Publication",
      fileExtension: "json"
    });
  }
  static get WAV() {
    return g.parse({ mediaType: "audio/wav", fileExtension: "wav" });
  }
  static get WEBM_AUDIO() {
    return g.parse({ mediaType: "audio/webm", fileExtension: "webm" });
  }
  static get WEBM_VIDEO() {
    return g.parse({ mediaType: "video/webm", fileExtension: "webm" });
  }
  static get WEBP() {
    return g.parse({ mediaType: "image/webp", fileExtension: "webp" });
  }
  static get WOFF() {
    return g.parse({ mediaType: "font/woff", fileExtension: "woff" });
  }
  static get WOFF2() {
    return g.parse({ mediaType: "font/woff2", fileExtension: "woff2" });
  }
  static get XHTML() {
    return g.parse({
      mediaType: "application/xhtml+xml",
      fileExtension: "xhtml"
    });
  }
  static get XML() {
    return g.parse({
      mediaType: "application/xml",
      fileExtension: "xml"
    });
  }
  static get ZAB() {
    return g.parse({
      mediaType: "application/x.readium.zab+zip",
      name: "Zipped Audio Book",
      fileExtension: "zab"
    });
  }
  static get ZIP() {
    return g.parse({
      mediaType: "application/zip",
      fileExtension: "zip"
    });
  }
}
class pi {
  constructor(t) {
    this.uri = t, this.parameters = this.getParameters(t);
  }
  /**
   * List of URI template parameter keys, if the [Link] is templated.
   */
  getParameters(t) {
    const e = /\{\??([^}]+)\}/g, i = t.match(e);
    return i ? new Set(
      i.join(",").replace(e, "$1").split(",").map((n) => n.trim())
    ) : /* @__PURE__ */ new Set();
  }
  /** Expands the URI by replacing the template variables by the given parameters.
   *  Any extra parameter is appended as query parameters.
   *  See RFC 6570 on URI template: https://tools.ietf.org/html/rfc6570
   */
  expand(t) {
    const e = (n) => n.split(",").map((s) => {
      const o = t[s];
      return o ? encodeURIComponent(o) : "";
    }).join(","), i = (n) => "?" + n.split(",").map((s) => {
      const o = s.split("=")[0], a = t[o];
      return a ? `${o}=${encodeURIComponent(a)}` : "";
    }).join("&");
    return this.uri.replace(/\{(\??)([^}]+)\}/g, (...n) => n[1] ? i(n[2]) : e(n[2]));
  }
}
class L {
  /**
   * Creates a [Locations].
   */
  constructor(t) {
    this.fragments = t.fragments ? t.fragments : new Array(), this.progression = t.progression, this.totalProgression = t.totalProgression, this.position = t.position, this.otherLocations = t.otherLocations;
  }
  /**
   * Parses a [Locations] from its RWPM JSON representation.
   */
  static deserialize(t) {
    if (!t) return;
    const e = jt(t.progression), i = jt(t.totalProgression), n = jt(t.position), s = /* @__PURE__ */ new Map(), o = /* @__PURE__ */ new Set([
      "fragment",
      "fragments",
      "progression",
      "totalProgression",
      "position"
    ]);
    return Object.entries(t).forEach(([a, l]) => {
      o.has(a) || s.set(a, l);
    }), new L({
      fragments: tn(t.fragments || t.fragment),
      progression: e !== void 0 && e >= 0 && e <= 1 ? e : void 0,
      totalProgression: i !== void 0 && i >= 0 && i <= 1 ? i : void 0,
      position: n !== void 0 && n > 0 ? n : void 0,
      otherLocations: s.size === 0 ? void 0 : s
    });
  }
  /**
   * Serializes a [Locations] to its RWPM JSON representation.
   */
  serialize() {
    const t = {};
    return this.fragments && (t.fragments = this.fragments), this.progression !== void 0 && (t.progression = this.progression), this.totalProgression !== void 0 && (t.totalProgression = this.totalProgression), this.position !== void 0 && (t.position = this.position), this.otherLocations && this.otherLocations.forEach((e, i) => t[i] = e), t;
  }
}
class tt {
  /**
   * Creates a [Text].
   */
  constructor(t) {
    this.after = t.after, this.before = t.before, this.highlight = t.highlight;
  }
  /**
   * Parses a [Locations] from its RWPM JSON representation.
   */
  static deserialize(t) {
    if (t)
      return new tt({
        after: t.after,
        before: t.before,
        highlight: t.highlight
      });
  }
  /**
   * Serializes a [Locations] to its RWPM JSON representation.
   */
  serialize() {
    const t = {};
    return this.after !== void 0 && (t.after = this.after), this.before !== void 0 && (t.before = this.before), this.highlight !== void 0 && (t.highlight = this.highlight), t;
  }
}
class F {
  /**
   * Creates a [Locator].
   */
  constructor(t) {
    this.href = t.href, this.type = t.type, this.title = t.title, this.locations = t.locations ? t.locations : new L({}), this.text = t.text;
  }
  /**
   * Parses a [Link] from its RWPM JSON representation.
   */
  static deserialize(t) {
    if (t && t.href && t.type)
      return new F({
        href: t.href,
        type: t.type,
        title: t.title,
        locations: L.deserialize(t.locations),
        text: tt.deserialize(t.text)
      });
  }
  /**
   * Serializes a [Link] to its RWPM JSON representation.
   */
  serialize() {
    const t = { href: this.href, type: this.type };
    return this.title !== void 0 && (t.title = this.title), this.locations && (t.locations = this.locations.serialize()), this.text && (t.text = this.text.serialize()), t;
  }
  /**
   * Shortcut to get a copy of the [Locator] with different [Locations] sub-properties.
   */
  copyWithLocations(t) {
    return new F({
      href: this.href,
      type: this.type,
      title: this.title,
      text: this.text,
      locations: new L({ ...this.locations, ...t })
    });
  }
}
class q {
  /**
   * Creates a [Link].
   */
  constructor(t) {
    this.href = t.href, this.templated = t.templated, this.type = t.type, this.title = t.title, this.rels = t.rels, this.properties = t.properties, this.height = t.height, this.width = t.width, this.size = t.size, this.duration = t.duration, this.bitrate = t.bitrate, this.languages = t.languages, this.alternates = t.alternates, this.children = t.children;
  }
  /**
   * Parses a [Link] from its RWPM JSON representation.
   */
  static deserialize(t) {
    if (!(!t || typeof t.href != "string"))
      return new q({
        href: t.href,
        templated: t.templated,
        type: t.type,
        title: t.title,
        rels: t.rel ? Array.isArray(t.rel) ? new Set(t.rel) : /* @__PURE__ */ new Set([t.rel]) : void 0,
        properties: J.deserialize(t.properties),
        height: $(t.height),
        width: $(t.width),
        size: $(t.size),
        duration: $(t.duration),
        bitrate: $(t.bitrate),
        languages: tn(t.language),
        alternates: Gt.deserialize(t.alternate),
        children: Gt.deserialize(t.children)
      });
  }
  /**
   * Serializes a [Link] to its RWPM JSON representation.
   */
  serialize() {
    const t = { href: this.href };
    return this.templated !== void 0 && (t.templated = this.templated), this.type !== void 0 && (t.type = this.type), this.title !== void 0 && (t.title = this.title), this.rels && (t.rel = Bn(this.rels)), this.properties && (t.properties = this.properties.serialize()), this.height !== void 0 && (t.height = this.height), this.width !== void 0 && (t.width = this.width), this.size !== void 0 && (t.size = this.size), this.duration !== void 0 && (t.duration = this.duration), this.bitrate !== void 0 && (t.bitrate = this.bitrate), this.languages && (t.language = this.languages), this.alternates && (t.alternate = this.alternates.serialize()), this.children && (t.children = this.children.serialize()), t;
  }
  /** MediaType of the linked resource. */
  get mediaType() {
    return this.type !== void 0 ? g.parse({ mediaType: this.type }) : g.BINARY;
  }
  /** Computes an absolute URL to the link, relative to the given `baseURL`.
   *  If the link's `href` is already absolute, the `baseURL` is ignored.
   */
  toURL(t) {
    const e = this.href.replace(/^(\/)/, "");
    if (e.length === 0) return;
    let i = t || "/";
    return i.startsWith("/") && (i = "file://" + i), new URL(e, i).href.replace(/^(file:\/\/)/, "");
  }
  /** List of URI template parameter keys, if the `Link` is templated. */
  get templateParameters() {
    return this.templated ? new pi(this.href).parameters : /* @__PURE__ */ new Set();
  }
  /** Expands the `Link`'s HREF by replacing URI template variables by the given parameters.
   *  See RFC 6570 on URI template: https://tools.ietf.org/html/rfc6570
   */
  expandTemplate(t) {
    return new q({
      href: new pi(this.href).expand(t),
      templated: !1
    });
  }
  /**
   * Makes a copy of this [Link] after merging in the given additional other [properties].
   */
  addProperties(t) {
    const e = q.deserialize(this.serialize());
    return e.properties = e.properties ? e.properties?.add(t) : new J(t), e;
  }
  /**
   * Creates a [Locator] from a reading order [Link].
   */
  get locator() {
    let t = this.href.split("#");
    return new F({
      href: t.length > 0 && t[0] !== void 0 ? t[0] : this.href,
      type: this.type ?? "",
      title: this.title,
      locations: new L({
        fragments: t.length > 1 && t[1] !== void 0 ? [t[1]] : []
      })
    });
  }
}
class Gt {
  /**
   * Creates a [Links].
   */
  constructor(t) {
    this.items = t;
  }
  /**
   * Creates a list of [Link] from its RWPM JSON representation.
   */
  static deserialize(t) {
    if (t && Array.isArray(t))
      return new Gt(
        t.map((e) => q.deserialize(e)).filter((e) => e !== void 0)
      );
  }
  /**
   * Serializes an array of [Link] to its RWPM JSON representation.
   */
  serialize() {
    return this.items.map((t) => t.serialize());
  }
  /** Finds the first link with the given relation. */
  findWithRel(t) {
    const e = (i) => i.rels && i.rels.has(t);
    return this.items.find(e);
  }
  /** Finds all the links with the given relation. */
  filterByRel(t) {
    const e = (i) => i.rels && i.rels.has(t);
    return this.items.filter(e);
  }
  /** Finds the first link matching the given HREF. */
  findWithHref(t) {
    const e = (i) => i.href === t;
    return this.items.find(e);
  }
  /** Finds the index of the first link matching the given HREF. */
  findIndexWithHref(t) {
    const e = (i) => i.href === t;
    return this.items.findIndex(e);
  }
  /** Finds the first link matching the given media type. */
  findWithMediaType(t) {
    const e = (i) => i.mediaType.matches(t);
    return this.items.find(e);
  }
  /** Finds all the links matching the given media type. */
  filterByMediaType(t) {
    const e = (i) => i.mediaType.matches(t);
    return this.items.filter(e);
  }
  /** Finds all the links matching any of the given media types. */
  filterByMediaTypes(t) {
    const e = (i) => {
      for (const n of t)
        if (i.mediaType.matches(n))
          return !0;
      return !1;
    };
    return this.items.filter(e);
  }
  /** Returns whether all the resources in the collection are audio clips. */
  everyIsAudio() {
    const t = (e) => e.mediaType.isAudio;
    return this.items.length > 0 && this.items.every(t);
  }
  /** Returns whether all the resources in the collection are bitmaps. */
  everyIsBitmap() {
    const t = (e) => e.mediaType.isBitmap;
    return this.items.length > 0 && this.items.every(t);
  }
  /** Returns whether all the resources in the collection are HTML documents. */
  everyIsHTML() {
    const t = (e) => e.mediaType.isHTML;
    return this.items.length > 0 && this.items.every(t);
  }
  /** Returns whether all the resources in the collection are video clips. */
  everyIsVideo() {
    const t = (e) => e.mediaType.isVideo;
    return this.items.length > 0 && this.items.every(t);
  }
  /** Returns whether all the resources in the collection are matching any of the given media types. */
  everyMatchesMediaType(t) {
    return Array.isArray(t) ? this.items.length > 0 && this.items.every((e) => {
      for (const i of t)
        return e.mediaType.matches(i);
      return !1;
    }) : this.items.length > 0 && this.items.every((e) => e.mediaType.matches(t));
  }
  filterLinksHasType() {
    return this.items.filter((t) => t.type);
  }
}
var en = /* @__PURE__ */ ((r) => (r.EPUB = "https://readium.org/webpub-manifest/profiles/epub", r.AUDIOBOOK = "https://readium.org/webpub-manifest/profiles/audiobook", r.DIVINA = "https://readium.org/webpub-manifest/profiles/divina", r.PDF = "https://readium.org/webpub-manifest/profiles/pdf", r))(en || {}), I = /* @__PURE__ */ ((r) => (r.ltr = "ltr", r.rtl = "rtl", r))(I || {});
J.prototype.getContains = function() {
  return new Set(this.otherProperties.contains || []);
};
function Vn(r) {
  const t = r.split(",")[0].trim(), n = (t.toLowerCase().startsWith("npt:") ? t.slice(4) : t).split(":");
  if (n.length === 1) {
    const s = parseFloat(n[0]);
    return isNaN(s) ? void 0 : s;
  }
  if (n.length === 2) {
    const s = parseInt(n[0], 10), o = parseFloat(n[1]);
    return isNaN(s) || isNaN(o) ? void 0 : s * 60 + o;
  }
  if (n.length === 3) {
    const s = parseInt(n[0], 10), o = parseInt(n[1], 10), a = parseFloat(n[2]);
    return isNaN(s) || isNaN(o) || isNaN(a) ? void 0 : s * 3600 + o * 60 + a;
  }
}
class Xt {
  /**
   * Creates a [DomRange].
   */
  constructor(t) {
    this.cssSelector = t.cssSelector, this.textNodeIndex = t.textNodeIndex, this.charOffset = t.charOffset;
  }
  /**
   * Parses a [DomRangePoint] from its RWPM JSON representation.
   */
  static deserialize(t) {
    if (!(t && t.cssSelector)) return;
    let e = $(t.textNodeIndex);
    if (e === void 0) return;
    let i = $(t.charOffset);
    return i === void 0 && (i = $(t.offset)), new Xt({
      cssSelector: t.cssSelector,
      textNodeIndex: e,
      charOffset: i
    });
  }
  /**
   * Serializes a [DomRangePoint] to its RWPM JSON representation.
   */
  serialize() {
    const t = {
      cssSelector: this.cssSelector,
      textNodeIndex: this.textNodeIndex
    };
    return this.charOffset !== void 0 && (t.charOffset = this.charOffset), t;
  }
}
class We {
  /**
   * Creates a [DomRange].
   */
  constructor(t) {
    this.start = t.start, this.end = t.end;
  }
  /**
   * Parses a [DomRange] from its RWPM JSON representation.
   */
  static deserialize(t) {
    if (!t) return;
    let e = Xt.deserialize(t.start);
    if (e)
      return new We({
        start: e,
        end: Xt.deserialize(t.end)
      });
  }
  /**
   * Serializes a [DomRange] to its RWPM JSON representation.
   */
  serialize() {
    const t = { start: this.start.serialize() };
    return this.end && (t.end = this.end.serialize()), t;
  }
}
L.prototype.getCssSelector = function() {
  return this.otherLocations?.get("cssSelector");
};
L.prototype.getPartialCfi = function() {
  return this.otherLocations?.get("partialCfi");
};
L.prototype.getDomRange = function() {
  return We.deserialize(this.otherLocations?.get("domRange"));
};
L.prototype.fragmentParameters = function() {
  return new Map(
    this.fragments.map((r) => r.startsWith("#") ? r.slice(1) : r).join("&").split("&").filter((r) => !r.startsWith("#")).map((r) => r.split("=")).filter((r) => r.length === 2).map((r) => [
      r[0].trim().toLowerCase(),
      r[1].trim()
    ])
  );
};
L.prototype.htmlId = function() {
  if (!this.fragments.length) return;
  let r = this.fragments.find((t) => t.length && !t.includes("="));
  if (!r) {
    const t = this.fragmentParameters();
    t.has("id") ? r = t.get("id") : t.has("name") && (r = t.get("name"));
  }
  return r?.startsWith("#") ? r.slice(1) : r;
};
L.prototype.page = function() {
  const r = parseInt(this.fragmentParameters().get("page"));
  if (!isNaN(r) && r >= 0) return r;
};
L.prototype.time = function() {
  const r = this.fragmentParameters().get("t");
  if (r)
    return Vn(r);
};
L.prototype.space = function() {
  const r = this.fragmentParameters();
  if (!r.has("xywh")) return;
  const t = r.get("xywh").split(",").map((e) => parseInt(e));
  if (t.length === 4 && !t.some(isNaN))
    return t;
};
class Be {
  /** Creates a [Price]. */
  constructor(t) {
    this.currency = t.currency, this.value = t.value;
  }
  /**
   * Parses a [Price] from its RWPM JSON representation.
   */
  static deserialize(t) {
    if (!t) return;
    let e = t.currency;
    if (!(e && typeof e == "string" && e.length > 0))
      return;
    let i = $(t.value);
    if (i !== void 0)
      return new Be({ currency: e, value: i });
  }
  /**
   * Serializes a [Price] to its RWPM JSON representation.
   */
  serialize() {
    return { currency: this.currency, value: this.value };
  }
}
class Tt {
  /** Creates a [Acquisition]. */
  constructor(t) {
    this.type = t.type, this.children = t.children;
  }
  /**
   * Parses a [Acquisition] from its RWPM JSON representation.
   */
  static deserialize(t) {
    if (t && t.type)
      return new Tt({
        type: t.type,
        children: Tt.deserializeArray(t.children)
      });
  }
  static deserializeArray(t) {
    if (Array.isArray(t))
      return t.map((e) => Tt.deserialize(e)).filter((e) => e !== void 0);
  }
  /**
   * Serializes a [Acquisition] to its RWPM JSON representation.
   */
  serialize() {
    const t = { type: this.type };
    return this.children && (t.children = this.children.map((e) => e.serialize())), t;
  }
}
class Ve {
  /** Creates a [Price]. */
  constructor(t) {
    this.total = t.total, this.position = t.position;
  }
  /**
   * Parses a [Holds] from its RWPM JSON representation.
   */
  static deserialize(t) {
    if (t)
      return new Ve({
        total: $(t.total),
        position: $(t.position)
      });
  }
  /**
   * Serializes a [Holds] to its RWPM JSON representation.
   */
  serialize() {
    const t = {};
    return this.total !== void 0 && (t.total = this.total), this.position !== void 0 && (t.position = this.position), t;
  }
}
class je {
  /** Creates a [Copies]. */
  constructor(t) {
    this.total = t.total, this.available = t.available;
  }
  /**
   * Parses a [Copies] from its RWPM JSON representation.
   */
  static deserialize(t) {
    if (t)
      return new je({
        total: $(t.total),
        available: $(t.available)
      });
  }
  /**
   * Serializes a [Copies] to its RWPM JSON representation.
   */
  serialize() {
    const t = {};
    return this.total !== void 0 && (t.total = this.total), this.available !== void 0 && (t.available = this.available), t;
  }
}
class $e {
  /** Creates a [Availability]. */
  constructor(t) {
    this.state = t.state, this.since = t.since, this.until = t.until;
  }
  /**
   * Parses a [Availability] from its RWPM JSON representation.
   */
  static deserialize(t) {
    if (t && t.state)
      return new $e({
        state: t.state,
        since: ui(t.since),
        until: ui(t.until)
      });
  }
  /**
   * Serializes a [Availability] to its RWPM JSON representation.
   */
  serialize() {
    const t = { state: this.state };
    return this.since !== void 0 && (t.since = this.since.toISOString()), this.until !== void 0 && (t.until = this.until.toISOString()), t;
  }
}
J.prototype.getNumberOfItems = function() {
  return $(this.otherProperties.numberOfItems);
};
J.prototype.getPrice = function() {
  return Be.deserialize(this.otherProperties.price);
};
J.prototype.getIndirectAcquisitions = function() {
  const r = this.otherProperties.indirectAcquisition;
  if (r && Array.isArray(r))
    return r.map((t) => Tt.deserialize(t)).filter((t) => t !== void 0);
};
J.prototype.getHolds = function() {
  return Ve.deserialize(this.otherProperties.holds);
};
J.prototype.getCopies = function() {
  return je.deserialize(this.otherProperties.copies);
};
J.prototype.getAvailability = function() {
  return $e.deserialize(this.otherProperties.availability);
};
J.prototype.getAuthenticate = function() {
  return q.deserialize(this.otherProperties.authenticate);
};
const jn = "CssSelectorGenerator";
function fi(r = "unknown problem", ...t) {
  console.warn(`${jn}: ${r}`, ...t);
}
function $n(r) {
  return r instanceof RegExp;
}
function Gn(r) {
  return r.replace(/[|\\{}()[\]^$+?.]/g, "\\$&").replace(/\*/g, ".+");
}
function Xn(r) {
  const t = r.map((e) => {
    if ($n(e))
      return (i) => e.test(i);
    if (typeof e == "function")
      return (i) => {
        const n = e(i);
        return typeof n != "boolean" ? (fi("pattern matcher function invalid", "Provided pattern matching function does not return boolean. It's result will be ignored.", e), !1) : n;
      };
    if (typeof e == "string") {
      const i = new RegExp("^" + Gn(e) + "$");
      return (n) => i.test(n);
    }
    return fi("pattern matcher invalid", "Pattern matching only accepts strings, regular expressions and/or functions. This item is invalid and will be ignored.", e), () => !1;
  });
  return (e) => t.some((i) => i(e));
}
Xn([
  "class",
  "id",
  // Angular attributes
  "ng-*"
]);
const Yn = Math.pow(2, 32), mi = () => Math.round(Math.random() * Yn).toString(36), _e = () => `${Math.round(performance.now())}-${mi()}-${mi()}`, yt = 1, READIUM_DIRECT_TURN_BRIDGE_V1 = "__readium_private_turn_bridge_v1__";
class qn {
  constructor(t) {
    this.destination = null, this.registrar = /* @__PURE__ */ new Map(), this.origin = "", this.channelId = "", this.receiver = this.receive.bind(this), this.preLog = [], this.directBridgeActive = !0, this.directBridge = (e, i, n) => {
      if (!this.directBridgeActive || !this.destination || e !== this.channelId || i !== "go_next" && i !== "go_prev") return;
      const s = this.registrar.get(i);
      if (!s || s.length !== 1) return;
      let o = !1, a;
      try {
        s[0].cb(n, (d) => {
          o || (o = !0, a = d);
        });
      } catch {
        return;
      }
      if (!o) return;
      const l = a !== null && typeof a == "object" ? { ...a, transport: "direct" } : a;
      return {
        _readium: yt,
        _channel: this.channelId,
        key: "_ack",
        data: l
      };
    }, this.wnd = t, t.addEventListener("message", this.receiver);
    try {
      Object.prototype.hasOwnProperty.call(t, READIUM_DIRECT_TURN_BRIDGE_V1) || Object.defineProperty(t, READIUM_DIRECT_TURN_BRIDGE_V1, {
        configurable: !0,
        enumerable: !1,
        value: this.directBridge,
        writable: !1
      });
    } catch {
    }
  }
  receive(t) {
    if (t.source === null) throw Error("Event source is null");
    if (typeof t.data != "object") return;
    const e = t.data;
    if (!(!("_readium" in e) || !e._readium || e._readium <= 0)) {
      if (e.key === "_ping") {
        if (!this.destination) {
          if (this.destination = t.source, this.origin = t.origin, this.channelId = e._channel, e._readium !== yt) {
            e._readium > yt ? this.send("error", `received comms version ${e._readium} higher than ${yt}`) : this.send("error", `received comms version ${e._readium} lower than ${yt}`), this.destination = null, this.origin = "", this.channelId = "";
            return;
          }
          this.send("_pong", void 0), this.preLog.forEach((i) => this.send("log", i)), this.preLog = [];
        }
        return;
      } else if (this.channelId) {
        if (e._channel !== this.channelId || t.origin !== this.origin) return;
      } else
        return;
      this.handle(e);
    }
  }
  handle(t) {
    const e = this.registrar.get(t.key);
    if (!e || e.length === 0) {
      t.strict && this.send("_unhandled", t);
      return;
    }
    e.forEach((i) => i.cb(t.data, (n) => {
      this.send("_ack", n, t.id);
    }));
  }
  register(t, e, i) {
    Array.isArray(t) || (t = [t]), t.forEach((n) => {
      const s = this.registrar.get(n);
      if (s && s.length >= 0) {
        if (s.find((a) => a.module === e)) throw new Error(`Trying to register another callback for combination of event ${n} and module ${e}`);
        s.push({
          cb: i,
          module: e
        }), this.registrar.set(n, s);
      } else
        this.registrar.set(n, [{
          cb: i,
          module: e
        }]);
    });
  }
  unregister(t, e) {
    Array.isArray(t) || (t = [t]), t.forEach((i) => {
      const n = this.registrar.get(i);
      !n || n.length === 0 || n.splice(n.findIndex((s) => s.module === e), 1);
    });
  }
  unregisterAll(t) {
    this.registrar.forEach((e, i) => this.registrar.set(i, e.filter((n) => n.module !== t)));
  }
  log(...t) {
    this.destination ? this.send("log", t) : this.preLog.push(t);
  }
  get ready() {
    return !!this.destination;
  }
  destroy() {
    this.directBridgeActive = !1;
    try {
      this.wnd[READIUM_DIRECT_TURN_BRIDGE_V1] === this.directBridge && delete this.wnd[READIUM_DIRECT_TURN_BRIDGE_V1];
    } catch {
    }
    this.destination = null, this.channelId = "", this.preLog = [], this.registrar.clear(), this.wnd.removeEventListener("message", this.receiver);
  }
  send(t, e, i = void 0, n = []) {
    // Pointer events can arrive between the iframe loader mounting and the
    // parent completing its _ping/_pong handshake. They are transient, so
    // dropping them is safer than crashing the navigator or replaying a stale
    // click after a different page has become active.
    if (!this.destination) return !1;
    const s = {
      _readium: yt,
      _channel: this.channelId,
      id: i ?? _e(),
      // scrict,
      key: t,
      data: e
    };
    try {
      this.destination.postMessage(s, {
        targetOrigin: this.origin,
        transfer: n
      });
    } catch (o) {
      if (n.length > 0) throw o;
      this.destination.postMessage(s, this.origin, n);
    }
    return !0;
  }
}
class kt {
}
function gi(r) {
  return r.split("").reverse().join("");
}
function Kn(r, t, e) {
  const i = gi(t);
  return e.map((n) => {
    const s = Math.max(0, n.end - t.length - n.errors), o = gi(r.slice(s, n.end));
    return {
      start: nn(o, i, n.errors).reduce((l, d) => n.end - d.end < l ? n.end - d.end : l, n.end),
      end: n.end,
      errors: n.errors
    };
  });
}
function ge(r) {
  return (r | -r) >> 31 & 1;
}
function yi(r, t, e, i) {
  let n = r.P[e], s = r.M[e];
  const o = i >>> 31, a = t[e] | o, l = a | s, d = (a & n) + n ^ n | a;
  let h = s | ~(d | n), c = n & d;
  const u = ge(h & r.lastRowMask[e]) - ge(c & r.lastRowMask[e]);
  return h <<= 1, c <<= 1, c |= o, h |= ge(i) - o, n = c | ~(l | h), s = h & l, r.P[e] = n, r.M[e] = s, u;
}
function nn(r, t, e) {
  if (t.length === 0)
    return [];
  e = Math.min(e, t.length);
  const i = [], n = 32, s = Math.ceil(t.length / n) - 1, o = {
    P: new Uint32Array(s + 1),
    M: new Uint32Array(s + 1),
    lastRowMask: new Uint32Array(s + 1)
  };
  o.lastRowMask.fill(1 << 31), o.lastRowMask[s] = 1 << (t.length - 1) % n;
  const a = new Uint32Array(s + 1), l = /* @__PURE__ */ new Map(), d = [];
  for (let u = 0; u < 256; u++)
    d.push(a);
  for (let u = 0; u < t.length; u += 1) {
    const m = t.charCodeAt(u);
    if (l.has(m))
      continue;
    const p = new Uint32Array(s + 1);
    l.set(m, p), m < d.length && (d[m] = p);
    for (let f = 0; f <= s; f += 1) {
      p[f] = 0;
      for (let b = 0; b < n; b += 1) {
        const S = f * n + b;
        if (S >= t.length)
          continue;
        t.charCodeAt(S) === m && (p[f] |= 1 << b);
      }
    }
  }
  let h = Math.max(0, Math.ceil(e / n) - 1);
  const c = new Uint32Array(s + 1);
  for (let u = 0; u <= h; u += 1)
    c[u] = (u + 1) * n;
  c[s] = t.length;
  for (let u = 0; u <= h; u += 1)
    o.P[u] = -1, o.M[u] = 0;
  for (let u = 0; u < r.length; u += 1) {
    const m = r.charCodeAt(u);
    let p;
    m < d.length ? p = d[m] : (p = l.get(m), typeof p > "u" && (p = a));
    let f = 0;
    for (let b = 0; b <= h; b += 1)
      f = yi(o, p, b, f), c[b] += f;
    if (c[h] - f <= e && h < s && (p[h + 1] & 1 || f < 0)) {
      h += 1, o.P[h] = -1, o.M[h] = 0;
      let b;
      if (h === s) {
        const S = t.length % n;
        b = S === 0 ? n : S;
      } else
        b = n;
      c[h] = c[h - 1] + b - f + yi(o, p, h, f);
    } else
      for (; h > 0 && c[h] >= e + n; )
        h -= 1;
    h === s && c[h] <= e && (c[h] < e && i.splice(0, i.length), i.push({
      start: -1,
      end: u + 1,
      errors: c[h]
    }), e = c[h]);
  }
  return i;
}
function Jn(r, t, e) {
  const i = nn(r, t, e);
  return Kn(r, t, i);
}
function sn(r, t, e) {
  let i = 0;
  const n = [];
  for (; i !== -1; )
    i = r.indexOf(t, i), i !== -1 && (n.push({
      start: i,
      end: i + t.length,
      errors: 0
    }), i += 1);
  return n.length > 0 ? n : Jn(r, t, e);
}
function bi(r, t) {
  return t.length === 0 || r.length === 0 ? 0 : 1 - sn(r, t, t.length)[0].errors / t.length;
}
function Zn(r, t, e = {}) {
  if (t.length === 0)
    return null;
  const i = Math.min(256, t.length / 2), n = sn(r, t, i);
  if (n.length === 0)
    return null;
  const s = (a) => {
    const u = 1 - a.errors / t.length, m = e.prefix ? bi(
      r.slice(
        Math.max(0, a.start - e.prefix.length),
        a.start
      ),
      e.prefix
    ) : 1, p = e.suffix ? bi(
      r.slice(a.end, a.end + e.suffix.length),
      e.suffix
    ) : 1;
    let f = 1;
    return typeof e.hint == "number" && (f = 1 - Math.abs(a.start - e.hint) / r.length), (50 * u + 20 * m + 20 * p + 2 * f) / 92;
  }, o = n.map((a) => ({
    start: a.start,
    end: a.end,
    score: s(a)
  }));
  return o.sort((a, l) => l.score - a.score), o[0];
}
function xe(r, t, e) {
  const i = e === 1 ? t : t - 1;
  if (r.charAt(i).trim() !== "")
    return t;
  let n, s;
  if (e === 2 ? (n = r.substring(0, t), s = n.trimEnd()) : (n = r.substring(t), s = n.trimStart()), !s.length)
    return -1;
  const o = n.length - s.length;
  return e === 2 ? t - o : t + o;
}
function vi(r, t) {
  const e = r.commonAncestorContainer.ownerDocument.createNodeIterator(
    r.commonAncestorContainer,
    NodeFilter.SHOW_TEXT
  ), i = t === 1 ? r.startContainer : r.endContainer, n = t === 1 ? r.endContainer : r.startContainer;
  let s = e.nextNode();
  for (; s && s !== i; )
    s = e.nextNode();
  t === 2 && (s = e.previousNode());
  let o = -1;
  const a = () => {
    if (s = t === 1 ? e.nextNode() : e.previousNode(), s) {
      const l = s.textContent, d = t === 1 ? 0 : l.length;
      o = xe(l, d, t);
    }
  };
  for (; s && o === -1 && s !== n; )
    a();
  if (s && o >= 0)
    return { node: s, offset: o };
  throw new RangeError("No text nodes with non-whitespace text found in range");
}
function Qn(r) {
  if (!r.toString().trim().length)
    throw new RangeError("Range contains no non-whitespace text");
  if (r.startContainer.nodeType !== Node.TEXT_NODE)
    throw new RangeError("Range startContainer is not a text node");
  if (r.endContainer.nodeType !== Node.TEXT_NODE)
    throw new RangeError("Range endContainer is not a text node");
  const t = r.cloneRange();
  let e = !1, i = !1;
  const n = {
    start: xe(
      r.startContainer.textContent,
      r.startOffset,
      1
      /* Forwards */
    ),
    end: xe(
      r.endContainer.textContent,
      r.endOffset,
      2
      /* Backwards */
    )
  };
  if (n.start >= 0 && (t.setStart(r.startContainer, n.start), e = !0), n.end > 0 && (t.setEnd(r.endContainer, n.end), i = !0), e && i)
    return t;
  if (!e) {
    const { node: s, offset: o } = vi(
      t,
      1
      /* Forwards */
    );
    s && o >= 0 && t.setStart(s, o);
  }
  if (!i) {
    const { node: s, offset: o } = vi(
      t,
      2
      /* Backwards */
    );
    s && o > 0 && t.setEnd(s, o);
  }
  return t;
}
function rn(r) {
  switch (r.nodeType) {
    case Node.ELEMENT_NODE:
    case Node.TEXT_NODE:
      return r.textContent?.length ?? 0;
    default:
      return 0;
  }
}
function Si(r) {
  let t = r.previousSibling, e = 0;
  for (; t; )
    e += rn(t), t = t.previousSibling;
  return e;
}
function on(r, ...t) {
  let e = t.shift();
  const i = r.ownerDocument.createNodeIterator(
    r,
    NodeFilter.SHOW_TEXT
  ), n = [];
  let s = i.nextNode(), o, a = 0;
  for (; e !== void 0 && s; )
    o = s, a + o.data.length > e ? (n.push({ node: o, offset: e - a }), e = t.shift()) : (s = i.nextNode(), a += o.data.length);
  for (; e !== void 0 && o && a === e; )
    n.push({ node: o, offset: o.data.length }), e = t.shift();
  if (e !== void 0)
    throw new RangeError("Offset exceeds text length");
  return n;
}
class Q {
  constructor(t, e) {
    if (e < 0)
      throw new Error("Offset is invalid");
    this.element = t, this.offset = e;
  }
  /**
   * Return a copy of this position with offset relative to a given ancestor
   * element.
   *
   * @param parent - Ancestor of `this.element`
   */
  relativeTo(t) {
    if (!t.contains(this.element))
      throw new Error("Parent is not an ancestor of current element");
    let e = this.element, i = this.offset;
    for (; e !== t; )
      i += Si(e), e = e.parentElement;
    return new Q(e, i);
  }
  /**
   * Resolve the position to a specific text node and offset within that node.
   *
   * Throws if `this.offset` exceeds the length of the element's text. In the
   * case where the element has no text and `this.offset` is 0, the `direction`
   * option determines what happens.
   *
   * Offsets at the boundary between two nodes are resolved to the start of the
   * node that begins at the boundary.
   *
   * @param options.direction - Specifies in which direction to search for the
   *                            nearest text node if `this.offset` is `0` and
   *                            `this.element` has no text. If not specified an
   *                            error is thrown.
   *
   * @throws {RangeError}
   */
  resolve(t = {}) {
    try {
      return on(this.element, this.offset)[0];
    } catch (e) {
      if (this.offset === 0 && t.direction !== void 0) {
        const i = document.createTreeWalker(
          this.element.getRootNode(),
          NodeFilter.SHOW_TEXT
        );
        i.currentNode = this.element;
        const n = t.direction === 1, s = n ? i.nextNode() : i.previousNode();
        if (!s)
          throw e;
        return { node: s, offset: n ? 0 : s.data.length };
      } else
        throw e;
    }
  }
  /**
   * Construct a `TextPosition` that refers to the `offset`th character within
   * `node`.
   */
  static fromCharOffset(t, e) {
    switch (t.nodeType) {
      case Node.TEXT_NODE:
        return Q.fromPoint(t, e);
      case Node.ELEMENT_NODE:
        return new Q(t, e);
      default:
        throw new Error("Node is not an element or text node");
    }
  }
  /**
   * Construct a `TextPosition` representing the range start or end point (node, offset).
   *
   * @param node
   * @param offset - Offset within the node
   */
  static fromPoint(t, e) {
    switch (t.nodeType) {
      case Node.TEXT_NODE: {
        if (e < 0 || e > t.data.length)
          throw new Error("Text node offset is out of range");
        if (!t.parentElement)
          throw new Error("Text node has no parent");
        const i = Si(t) + e;
        return new Q(t.parentElement, i);
      }
      case Node.ELEMENT_NODE: {
        if (e < 0 || e > t.childNodes.length)
          throw new Error("Child node offset is out of range");
        let i = 0;
        for (let n = 0; n < e; n++)
          i += rn(t.childNodes[n]);
        return new Q(t, i);
      }
      default:
        throw new Error("Point is not in an element or text node");
    }
  }
}
class st {
  constructor(t, e) {
    this.start = t, this.end = e;
  }
  /**
   * Create a new TextRange whose `start` and `end` are computed relative to
   * `element`. `element` must be an ancestor of both `start.element` and
   * `end.element`.
   */
  relativeTo(t) {
    return new st(
      this.start.relativeTo(t),
      this.end.relativeTo(t)
    );
  }
  /**
   * Resolve this TextRange to a (DOM) Range.
   *
   * The resulting DOM Range will always start and end in a `Text` node.
   * Hence `TextRange.fromRange(range).toRange()` can be used to "shrink" a
   * range to the text it contains.
   *
   * May throw if the `start` or `end` positions cannot be resolved to a range.
   */
  toRange() {
    let t, e;
    this.start.element === this.end.element && this.start.offset <= this.end.offset ? [t, e] = on(
      this.start.element,
      this.start.offset,
      this.end.offset
    ) : (t = this.start.resolve({
      direction: 1
      /* FORWARDS */
    }), e = this.end.resolve({
      direction: 2
      /* BACKWARDS */
    }));
    const i = new Range();
    return i.setStart(t.node, t.offset), i.setEnd(e.node, e.offset), i;
  }
  /**
   * Create a TextRange from a (DOM) Range
   */
  static fromRange(t) {
    const e = Q.fromPoint(
      t.startContainer,
      t.startOffset
    ), i = Q.fromPoint(t.endContainer, t.endOffset);
    return new st(e, i);
  }
  /**
   * Create a TextRange representing the `start`th to `end`th characters in
   * `root`
   */
  static fromOffsets(t, e, i) {
    return new st(
      new Q(t, e),
      new Q(t, i)
    );
  }
  /**
   * Return a new Range representing `range` trimmed of any leading or trailing
   * whitespace
   */
  static trimmedRange(t) {
    return Qn(st.fromRange(t).toRange());
  }
}
class Yt {
  constructor(t, e, i) {
    this.root = t, this.start = e, this.end = i;
  }
  static fromRange(t, e) {
    const i = st.fromRange(e).relativeTo(t);
    return new Yt(
      t,
      i.start.offset,
      i.end.offset
    );
  }
  static fromSelector(t, e) {
    return new Yt(t, e.start, e.end);
  }
  toSelector() {
    return {
      type: "TextPositionSelector",
      start: this.start,
      end: this.end
    };
  }
  toRange() {
    return st.fromOffsets(this.root, this.start, this.end).toRange();
  }
}
class qt {
  /**
   * @param root - A root element from which to anchor.
   */
  constructor(t, e, i = {}) {
    this.root = t, this.exact = e, this.context = i;
  }
  /**
   * Create a `TextQuoteAnchor` from a range.
   *
   * Will throw if `range` does not contain any text nodes.
   */
  static fromRange(t, e) {
    const i = t.textContent, n = st.fromRange(e).relativeTo(t), s = n.start.offset, o = n.end.offset, a = 32;
    return new qt(t, i.slice(s, o), {
      prefix: i.slice(Math.max(0, s - a), s),
      suffix: i.slice(o, Math.min(i.length, o + a))
    });
  }
  static fromSelector(t, e) {
    const { prefix: i, suffix: n } = e;
    return new qt(t, e.exact, { prefix: i, suffix: n });
  }
  toSelector() {
    return {
      type: "TextQuoteSelector",
      exact: this.exact,
      prefix: this.context.prefix,
      suffix: this.context.suffix
    };
  }
  toRange(t = {}) {
    return this.toPositionAnchor(t).toRange();
  }
  toPositionAnchor(t = {}) {
    const e = this.root.textContent, i = Zn(e, this.exact, {
      ...this.context,
      hint: t.hint
    });
    if (!i)
      throw new Error("Quote not found");
    return new Yt(this.root, i.start, i.end);
  }
}
function ts(r) {
  const t = r.tagName.toUpperCase();
  return t === "IMG" || t === "VIDEO" || t === "AUDIO" || t === "IFRAME" || t === "OBJECT" || t === "EMBED" || t === "CANVAS";
}
function Wt(r, t) {
  try {
    const e = t.locations, i = t.text;
    if (i && i.highlight) {
      let n;
      e && e.getCssSelector() && (n = r.querySelector(e.getCssSelector())), n || (n = r.body);
      const s = new qt(n, i.highlight, {
        prefix: i.before,
        suffix: i.after
      });
      try {
        return s.toRange();
      } catch {
        return console.warn("Quote not found:", s), null;
      }
    }
    if (e) {
      let n = null;
      if (!n && e.getCssSelector() && (n = r.querySelector(e.getCssSelector())), !n && e.fragments) {
        for (const s of e.fragments)
          if (n = r.getElementById(s), n)
            break;
      }
      if (n) {
        const s = r.createRange();
        return n.childNodes.length === 0 || ts(n) ? (s.selectNode(n), s) : (s.setStartBefore(n), s.setEndAfter(n), s);
      }
    }
  } catch (e) {
    console.error(e);
  }
  return null;
}
function es(r, t, e = !1) {
  let i = r.getClientRects();
  i.length || r.commonAncestorContainer.nodeType === Node.ELEMENT_NODE && (i = r.commonAncestorContainer.getClientRects());
  const n = 1, s = [];
  for (const h of i)
    s.push({
      bottom: h.bottom,
      height: h.height,
      left: h.left,
      right: h.right,
      top: h.top,
      width: h.width
    });
  const o = an(
    s,
    n,
    t,
    e
  ), a = ns(o, n), l = ln(a), d = 4;
  for (let h = l.length - 1; h >= 0; h--) {
    const c = l[h];
    if (!(c.width * c.height > d))
      if (l.length > 1)
        l.splice(h, 1);
      else
        break;
  }
  return l;
}
function an(r, t, e, i = !1) {
  for (let n = 0; n < r.length; n++)
    for (let s = n + 1; s < r.length; s++) {
      const o = r[n], a = r[s];
      if (o === a)
        continue;
      const l = Y(o.top, a.top, t) && Y(o.bottom, a.bottom, t), d = Y(o.left, a.left, t) && Y(o.right, a.right, t);
      if (l && !d && hn(o, a, t)) {
        const u = r.filter((p) => p !== o && p !== a), m = is(o, a);
        return u.push(m), an(
          u,
          t,
          e,
          i
        );
      }
    }
  return r;
}
function is(r, t) {
  const e = Math.min(r.left, t.left), i = Math.max(r.right, t.right), n = Math.min(r.top, t.top), s = Math.max(r.bottom, t.bottom);
  return {
    bottom: s,
    height: s - n,
    left: e,
    right: i,
    top: n,
    width: i - e
  };
}
function ns(r, t) {
  const e = new Set(r);
  for (const i of r) {
    if (!(i.width > 1 && i.height > 1)) {
      e.delete(i);
      continue;
    }
    for (const s of r)
      if (i !== s && e.has(s) && ss(s, i, t)) {
        e.delete(i);
        break;
      }
  }
  return Array.from(e);
}
function ss(r, t, e) {
  return St(r, t.left, t.top, e) && St(r, t.right, t.top, e) && St(r, t.left, t.bottom, e) && St(r, t.right, t.bottom, e);
}
function St(r, t, e, i) {
  return (r.left < t || Y(r.left, t, i)) && (r.right > t || Y(r.right, t, i)) && (r.top < e || Y(r.top, e, i)) && (r.bottom > e || Y(r.bottom, e, i));
}
function ln(r) {
  for (let t = 0; t < r.length; t++)
    for (let e = t + 1; e < r.length; e++) {
      const i = r[t], n = r[e];
      if (i !== n && hn(i, n, -1)) {
        let s = [], o;
        const a = wi(i, n);
        if (a.length === 1)
          s = a, o = i;
        else {
          const d = wi(n, i);
          a.length < d.length ? (s = a, o = i) : (s = d, o = n);
        }
        const l = r.filter((d) => d !== o);
        return Array.prototype.push.apply(l, s), ln(l);
      }
    }
  return r;
}
function wi(r, t) {
  const e = rs(t, r);
  if (e.height === 0 || e.width === 0)
    return [r];
  const i = [];
  {
    const n = {
      bottom: r.bottom,
      height: 0,
      left: r.left,
      right: e.left,
      top: r.top,
      width: 0
    };
    n.width = n.right - n.left, n.height = n.bottom - n.top, n.height !== 0 && n.width !== 0 && i.push(n);
  }
  {
    const n = {
      bottom: e.top,
      height: 0,
      left: e.left,
      right: e.right,
      top: r.top,
      width: 0
    };
    n.width = n.right - n.left, n.height = n.bottom - n.top, n.height !== 0 && n.width !== 0 && i.push(n);
  }
  {
    const n = {
      bottom: r.bottom,
      height: 0,
      left: e.left,
      right: e.right,
      top: e.bottom,
      width: 0
    };
    n.width = n.right - n.left, n.height = n.bottom - n.top, n.height !== 0 && n.width !== 0 && i.push(n);
  }
  {
    const n = {
      bottom: r.bottom,
      height: 0,
      left: e.right,
      right: r.right,
      top: r.top,
      width: 0
    };
    n.width = n.right - n.left, n.height = n.bottom - n.top, n.height !== 0 && n.width !== 0 && i.push(n);
  }
  return i;
}
function rs(r, t) {
  const e = Math.max(r.left, t.left), i = Math.min(r.right, t.right), n = Math.max(r.top, t.top), s = Math.min(r.bottom, t.bottom);
  return {
    bottom: s,
    height: Math.max(0, s - n),
    left: e,
    right: i,
    top: n,
    width: Math.max(0, i - e)
  };
}
function hn(r, t, e) {
  return (r.left < t.right || e >= 0 && Y(r.left, t.right, e)) && (t.left < r.right || e >= 0 && Y(t.left, r.right, e)) && (r.top < t.bottom || e >= 0 && Y(r.top, t.bottom, e)) && (t.top < r.bottom || e >= 0 && Y(t.top, r.bottom, e));
}
function Y(r, t, e) {
  return Math.abs(r - t) <= e;
}
const os = /* @__PURE__ */ new Set([
  "backgroundColor",
  "textColor",
  "linkColor",
  "visitedColor",
  "primaryColor",
  "secondaryColor",
  "selectionBackgroundColor",
  "selectionTextColor",
  "blendFilter",
  "darkenFilter",
  "invertFilter",
  "invertGaiji"
]), Pi = /--(?:USER|RS)__([\w-]+)/g;
function as(r, t) {
  const e = r ?? "", i = t ?? "", n = /* @__PURE__ */ new Set();
  for (const s of e.matchAll(Pi)) n.add(s[1]);
  for (const s of i.matchAll(Pi)) n.add(s[1]);
  for (const s of n)
    if (!os.has(s)) return !0;
  return !1;
}
function Ge(r) {
  const t = {}, e = r.document.documentElement.style;
  for (const i in r.document.documentElement.style)
    Object.hasOwn(e, i) && !Number.isNaN(Number.parseInt(i)) && (t[e[i]] = e.getPropertyValue(e[i]));
  return t;
}
function cn(r, t) {
  const e = Ge(r);
  Object.keys(e).forEach((i) => {
    t.hasOwnProperty(i) || ce(r, i);
  }), Object.entries(t).forEach(([i, n]) => {
    e[i] !== n && zt(r, i, n);
  });
}
function Ei(r, t) {
  return r.document.documentElement.style.getPropertyValue(t);
}
function zt(r, t, e) {
  r.document.documentElement.style.setProperty(t, e);
}
function ce(r, t) {
  r.document.documentElement.style.removeProperty(t);
}
let Bt = null, ye = null, Ot = 0;
const bt = { r: 255, g: 255, b: 255, a: 1 }, pt = /* @__PURE__ */ new Map(), ls = () => {
  if (!Bt)
    if (typeof OffscreenCanvas < "u")
      Bt = new OffscreenCanvas(5, 5), ye = Bt.getContext("2d", {
        willReadFrequently: !0,
        desynchronized: !0
      });
    else {
      const r = document.createElement("canvas");
      r.width = 5, r.height = 5, Bt = r, ye = r.getContext("2d", {
        willReadFrequently: !0,
        desynchronized: !0
      });
    }
  return ye;
}, hs = (r) => {
  if (!r) return !0;
  const t = r.trim().toLowerCase();
  return t.startsWith("var(") || [
    "transparent",
    "currentcolor",
    "inherit",
    "initial",
    "revert",
    "unset",
    "revert-layer"
  ].includes(t) ? !0 : [
    "linear-gradient",
    "radial-gradient",
    "conic-gradient",
    "repeating-linear-gradient",
    "repeating-radial-gradient",
    "repeating-conic-gradient"
  ].some((n) => t.includes(n));
}, Vt = (r, t) => {
  console.warn(
    `[Decorator] Could not parse color: "${r}". ${t} Falling back to ${JSON.stringify(bt)} to compute contrast. Please use a CSS color value that can be computed to RGB(A).`
  );
}, It = (r, t = null) => {
  const e = t ? `${r}|${t}` : r, i = pt.get(e);
  if (i !== void 0)
    return i ?? bt;
  if (hs(r))
    return Vt(r, "Unsupported color format or special value."), pt.set(e, null), bt;
  const n = ls();
  if (!n)
    return Vt(r, "Could not get canvas context."), pt.set(e, null), bt;
  try {
    Ot === 0 && n.clearRect(0, 0, 5, 5);
    const s = Ot % 5, o = Math.floor(Ot / 5);
    n.clearRect(s, o, 1, 1), t && (n.fillStyle = t, n.fillRect(s, o, 1, 1)), n.fillStyle = r, n.fillRect(s, o, 1, 1);
    const a = n.getImageData(s, o, 1, 1);
    Ot = (Ot + 1) % 25;
    const [l, d, h, c] = a.data;
    if (c === 0)
      return Vt(r, "Fully transparent color."), pt.set(e, null), bt;
    const u = { r: l, g: d, b: h, a: c / 255 };
    return pt.set(e, u), u;
  } catch (s) {
    return Vt(r, `Error: ${s instanceof Error ? s.message : String(s)}`), pt.set(e, null), bt;
  }
}, be = (r) => {
  const t = r / 255;
  return t <= 0.03928 ? t / 12.92 : Math.pow((t + 0.055) / 1.055, 2.4);
}, Le = (r) => {
  const t = be(r.r), e = be(r.g), i = be(r.b);
  return 0.2126 * t + 0.7152 * e + 0.0722 * i;
}, Kt = (r, t) => {
  const e = typeof r == "string" ? It(r) : r, i = typeof t == "string" ? It(t) : t, n = Le(e), s = Le(i), o = Math.max(n, s), a = Math.min(n, s);
  return (o + 0.05) / (a + 0.05);
}, dn = (r, t = null) => {
  const e = It(r, t), i = Kt(e, { r: 255, g: 255, b: 255, a: 1 }), n = Kt(e, { r: 0, g: 0, b: 0, a: 1 });
  return i > n;
}, cs = (r, t = null) => dn(r, t) ? "white" : "black", ds = (r) => {
  const t = r.a !== void 0 ? r.a : 1;
  return `rgba(${Math.round(r.r)}, ${Math.round(r.g)}, ${Math.round(r.b)}, ${t})`;
}, us = (r, t) => ({
  r: Math.min(255, r.r + (255 - r.r) * t),
  g: Math.min(255, r.g + (255 - r.g) * t),
  b: Math.min(255, r.b + (255 - r.b) * t),
  a: r.a ?? 1
}), ps = (r, t) => ({
  r: Math.max(0, r.r * (1 - t)),
  g: Math.max(0, r.g * (1 - t)),
  b: Math.max(0, r.b * (1 - t)),
  a: r.a ?? 1
}), lt = (r, t = null, e = 3) => {
  const i = It(r), n = t ? It(t) : { r: 255, g: 255, b: 255, a: 1 };
  let s = Kt(i, n);
  if (s >= e)
    return r;
  const a = Le(n) < 0.5;
  let l = { ...i, a: i.a ?? 1 };
  const d = 20, h = 0.1;
  for (let c = 0; c < d && (a ? l = us(l, h) : l = ps(l, h), s = Kt(l, n), !(s >= e)); c++)
    ;
  return ds(l);
};
function fs(r) {
  return (r.document.documentElement.dir || r.document.body.dir).toLowerCase() === "rtl";
}
function un(r) {
  return (r.getComputedStyle(r.document.documentElement).writingMode || r.getComputedStyle(r.document.body).writingMode) === "vertical-lr";
}
function ms(r) {
  const t = r.getComputedStyle(r.document.documentElement).writingMode || r.getComputedStyle(r.document.body).writingMode;
  return t === "vertical-rl" || t === "vertical-lr";
}
function ve(r) {
  const t = ms(r), e = t && un(r), i = r.innerWidth, n = r.innerHeight, s = r.document.scrollingElement, o = s.scrollLeft, a = s.scrollTop, l = parseInt(r.getComputedStyle(r.document.documentElement).getPropertyValue("column-count")), d = t && !e ? s.scrollWidth - i + o : o, h = a;
  return {
    isVertical: t,
    isVertLR: e,
    viewportInlineSize: t ? n : i,
    viewportBlockSize: t ? i : n,
    pageInlineSize: t ? n : i / (l || 1),
    xDocOffset: d,
    yDocOffset: h,
    inlineScrollOffset: t ? h : d,
    blockScrollOffset: t ? d : h,
    inlineStart: (c) => t ? c.top : c.left,
    blockStart: (c) => t ? c.left : c.top,
    inlineSize: (c) => t ? c.height : c.width,
    blockSize: (c) => t ? c.width : c.height,
    applyPosition(c, u, m, p, f, b) {
      c.style.position = "absolute", t ? (c.style.top = `${u * b}px`, c.style.left = `${m * b}px`, c.style.height = `${p * b}px`, c.style.width = `${f * b}px`) : (c.style.left = `${u * b}px`, c.style.top = `${m * b}px`, c.style.width = `${p * b}px`, c.style.height = `${f * b}px`);
    },
    toRect(c, u, m, p) {
      return t ? new DOMRect(u, c, p, m) : new DOMRect(c, u, m, p);
    }
  };
}
function pn(r) {
  return parseInt(
    r.getComputedStyle(
      r.document.documentElement
    ).getPropertyValue("column-count")
  );
}
function Ci(r) {
  const t = getComputedStyle(r), e = parseFloat(t.paddingTop || "0"), i = parseFloat(t.paddingBottom || "0");
  return r.clientHeight - e - i;
}
function _i(r) {
  const t = pn(r);
  if (!t)
    return !1;
  const e = r.document.querySelectorAll("div[id^='readium-virtual-page']");
  for (const d of e)
    d.remove();
  const i = e.length, n = r.document.scrollingElement.scrollWidth, s = r.visualViewport.width, a = Math.round(n / s * t) % t, l = t === 1 || a === 0 ? 0 : t - a;
  if (l > 0)
    for (let d = 0; d < l; d++) {
      const h = r.document.createElement("div");
      h.setAttribute("id", `readium-virtual-page-${d}`), h.dataset.readium = "true", CSS.supports("break-before", "column") ? h.style.breakBefore = "column" : (CSS.supports("break-inside", "avoid-column") && (h.style.breakInside = "avoid-column"), h.style.height = Ci(r.document.documentElement) + "px"), h.innerHTML = "&#8203;", r.document.body.appendChild(h);
    }
  return i !== l;
}
function Xe(r) {
  const t = r.document.createElement("style");
  t.appendChild(r.document.createTextNode("*{}")), r.document.body.appendChild(t), r.document.body.removeChild(t);
}
const fn = () => typeof navigator > "u" ? "" : navigator.userAgent || "", mn = () => typeof navigator > "u" ? void 0 : navigator.userAgentData || void 0;
class gn {
  constructor() {
    const t = mn(), e = fn(), i = (s) => (typeof s == "string" || typeof s == "number") && s ? String(s).replace(/_/g, ".").split(".").map((o) => parseInt(o) || 0) : [], n = (s = "") => {
      if (!s) return [];
      const o = new RegExp("^.*" + s + "[ :\\/]?(\\d+([\\._]\\d+)*).*$");
      return o.test(e) ? i(e.replace(o, "$1")) : [];
    };
    this.OS = ((s) => (/(macOS|Mac OS X)/.test(e) ? (/\(iP(hone|od touch);/.test(e) && (s.iOS = n("CPU (?:iPhone )?OS ")), /\(iPad;/.test(e) ? s.iOS = s.iPadOS = n("CPU (?:iPhone )?OS ") : /(macOS|Mac OS X) \d/.test(e) && (document.ontouchend !== void 0 ? s.iOS = s.iPadOS = n() : s.macOS = n("(?:macOS|Mac OS X) "))) : /Windows( NT)? \d/.test(e) ? s.Windows = ((o) => o[0] !== 6 || !o[1] ? o : o[1] === 1 ? [7] : o[1] === 2 ? [8] : [8, 1])(n("Windows(?: NT)?")) : /Android \d/.test(e) ? s.Android = n("Android") : /CrOS/.test(e) ? s.ChromeOS = n() : /X11;/.test(e) && (s.Linux = n()), s))({}), t && t.getHighEntropyValues(["architecture", "model", "platform", "platformVersion", "uaFullVersion"]).then((s) => ((o) => {
      const a = s.platform, l = s.platformVersion;
      if (!(!a || !l)) {
        if (/^i(OS|P(hone|od touch))$/.test(a)) o.iOS = i(l);
        else if (/^iPad(OS)?$/.test(a)) o.iOS = o.iPadOS = i(l);
        else if (/^(macOS|(Mac )?OS X|Mac(Intel)?)$/.test(a)) document.ontouchend !== void 0 ? o.iOS = o.iPadOS = i() : o.macOS = i(l);
        else if (/^(Microsoft )?Windows$/.test(a)) o.Windows = i(l);
        else if (/^(Google )?Android$/.test(a)) o.Android = i(l);
        else if (/^((Google )?Chrome OS|CrOS)$/.test(a)) o.ChromeOS = i(l);
        else if (/^(Linux|Ubuntu|X11)$/.test(a)) o.Linux = i(l);
        else return;
        Object.keys(this.OS).forEach((d) => delete this.OS[d]), Object.assign(this.OS, o);
      }
    })({})), this.UA = ((s) => {
      let o = !1;
      if (t && Array.isArray(t.brands)) {
        const a = t.brands.reduce((l, d) => (l[d.brand] = [d.version * 1], l), {});
        a["Google Chrome"] ? (o = !0, s.Blink = s.Chromium = a.Chromium || [], s.Chrome = a["Google Chrome"]) : a["Microsoft Edge"] ? (o = !0, s.Blink = s.Chromium = a.Chromium || [], s.Edge = a["Microsoft Edge"]) : a.Opera && (o = !0, s.Blink = s.Chromium = a.Chromium || [], s.Opera = a.Opera);
      }
      return o || (/ Gecko\/\d/.test(e) ? (s.Gecko = n("rv"), / Waterfox\/\d/.test(e) ? s.Waterfox = n("Waterfox") : / Firefox\/\d/.test(e) && (s.Firefox = n("Firefox"))) : / Edge\/\d/.test(e) ? (s.EdgeHTML = n("Edge"), s.Edge = s.EdgeHTML) : / Chrom(ium|e)\/\d/.test(e) ? (s.Blink = s.Chromium = ((a) => a[0] ? a : n("Chrome"))(n("Chromium")), / EdgA?\/\d/.test(e) ? s.Edge = ((a) => a[0] ? a : n("Edg"))(n("EdgA")) : / OPR\/\d/.test(e) ? s.Opera = n("OPR") : / Vivaldi\/\d/.test(e) ? s.Vivaldi = n("Vivaldi") : / Silk\/\d/.test(e) ? s.Silk = n("Silk") : / UCBrowser\/\d/.test(e) ? s.UCBrowser = n("UCBrowser") : / Phoebe\/\d/.test(e) ? s.Phoebe = n("Phoebe") : s.Chrome = ((a) => a[0] ? a : s.Chromium)(n("Chrome"))) : / AppleWebKit\/\d/.test(e) ? (s.WebKit = n("AppleWebKit"), / CriOS \d/.test(e) ? s.Chrome = n("CriOS") : / FxiOS \d/.test(e) ? s.Firefox = n("FxiOS") : / EdgiOS\/\d/.test(e) ? s.Edge = n("EdgiOS") : / Version\/\d/.test(e) && (s.Safari = n("Version"))) : / Trident\/\d/.test(e) && (s.Trident = n("Trident"), s.InternetExplorer = ((a) => a[0] ? a : n("MSIE"))(n("rv")))), /[\[; ]FB(AN|_IAB)\//.test(e) && (s.Facebook = n("FBAV")), / Line\/\d/.test(e) && (s.LINE = n("Line")), s;
    })({}), this.Env = { get: () => [this.OS, this.UA].reduce((s, o) => {
      for (const a in o) o[a] && s.push(a);
      return s;
    }, []) };
  }
}
class gs extends gn {
  get iOSRequest() {
    const t = mn(), e = fn();
    if (this.OS.iOS && !this.OS.iPadOS)
      return "mobile";
    if (this.OS.iPadOS)
      return /\(iPad;/.test(e) || t && /^iPad(OS)?$/.test(t.platform) ? "mobile" : "desktop";
  }
}
const X = new gn(), M = new gs(), xi = [
  // Structure / presentation
  "div",
  "span",
  "p",
  "br",
  "hr",
  "b",
  "i",
  "em",
  "strong",
  "s",
  "u",
  "mark",
  "small",
  "sub",
  "sup",
  "abbr",
  "cite",
  "code",
  "data",
  "dfn",
  "kbd",
  "q",
  "samp",
  "time",
  "var",
  "blockquote",
  "pre",
  // SVG — useful for icon-style decorations (e.g. sidemarks)
  "svg",
  "g",
  "path",
  "circle",
  "ellipse",
  "rect",
  "line",
  "polygon",
  "polyline",
  "text",
  "tspan",
  "defs",
  "use"
], ys = /^on/i, bs = /* @__PURE__ */ new Set(["href", "src", "action", "formaction", "xlink:href"]), vs = /^\s*(javascript|data):/i;
function Ss(r, t) {
  const e = r.document.createElement("div");
  if ("Sanitizer" in r && typeof e.setHTML == "function")
    try {
      const n = new r.Sanitizer({ allowElements: xi });
      return e.setHTML(t, { sanitizer: n }), e.firstElementChild;
    } catch {
    }
  const i = r.document.implementation.createHTMLDocument("");
  for (i.body.innerHTML = t, ws(i.body, new Set(xi)); i.body.firstChild; )
    e.appendChild(r.document.adoptNode(i.body.firstChild));
  return e.firstElementChild;
}
function ws(r, t) {
  const e = Array.from(r.querySelectorAll("*")).reverse();
  for (const i of e) {
    if (!t.has(i.localName)) {
      i.replaceWith(...Array.from(i.childNodes));
      continue;
    }
    for (const { name: n, value: s } of Array.from(i.attributes))
      (ys.test(n) || bs.has(n) && vs.test(s)) && i.removeAttribute(n);
  }
}
function Se(r) {
  switch (r) {
    case _.Mask:
      return "rgba(255, 255, 255, 0.5)";
    case _.Highlight:
      return "#FFFF00";
    default:
      return "#FF0000";
  }
}
const _ = {
  Highlight: "highlight",
  // Background color overlay.
  Underline: "underline",
  // Underline drawn beneath the text.
  Outline: "outline",
  // Border drawn around the text boxes.
  TextColor: "textColor",
  // Changes the text color directly.
  Mask: "mask",
  // Dims everything outside the selection rects. Use width: Page for block-level behaviour.
  Template: "template"
  // Custom HTML template (HTMLDecorationTemplate).
};
var Ps = /* @__PURE__ */ ((r) => (r.Wrap = "wrap", r.Viewport = "viewport", r.Bounds = "bounds", r.Page = "page", r))(Ps || {}), Es = /* @__PURE__ */ ((r) => (r.Boxes = "boxes", r.Bounds = "bounds", r))(Es || {});
const Cs = () => "Highlight" in window, Li = ["IMG", "IMAGE", "AUDIO", "VIDEO", "SVG"];
class _s {
  /**
   * Creates a DecorationGroup object
   * @param id Unique HTML ID-adhering name of the group
   * @param name Human-readable name of the group
   */
  constructor(t, e, i, n) {
    this.wnd = t, this.comms = e, this.id = i, this.name = n, this.items = [], this.lastItemId = 0, this.container = void 0, this._activatable = !1, this.experimentalHighlights = !1, this.maskSvg = void 0, this.shadowHost = void 0, this.shadowRoot = void 0, this.currentRender = 0, Cs() && (this.experimentalHighlights = !0, this.notTextFlag = /* @__PURE__ */ new Map()), this.activationHandler = this.handleActivation.bind(this), this.wnd.document.addEventListener("pointerup", this.activationHandler);
  }
  get activatable() {
    return this._activatable;
  }
  set activatable(t) {
    this._activatable = t;
  }
  /**
   * Adds a new decoration to the group.
   * @param decoration Decoration to add
   */
  add(t) {
    const e = `${this.id}-${this.lastItemId++}`, i = Wt(this.wnd.document, t.locator);
    if (!i) {
      this.comms.log("Can't locate DOM range for decoration", t);
      return;
    }
    const n = i.commonAncestorContainer;
    if (n.nodeType !== Node.TEXT_NODE && this.experimentalHighlights && (Li.includes(n.nodeName.toUpperCase()) && this.notTextFlag?.set(e, !0), i.cloneContents().querySelector(Li.join(", ").toLowerCase()) && this.notTextFlag?.set(e, !0), (n.textContent?.trim() || "").length === 0 && this.notTextFlag?.set(e, !0)), this.experimentalHighlights) {
      const { type: o } = t.style, { layout: a, width: l } = t.style;
      o !== _.TextColor && (o === _.Outline || o === _.Template || o === _.Mask || a !== void 0 && a !== "boxes" || l !== void 0 && l !== "wrap") && this.notTextFlag?.set(e, !0);
    }
    const s = {
      decoration: t,
      id: e,
      range: i
    };
    this.items.push(s), this.layout(s), this.renderLayout([s]);
  }
  /**
   * Removes the decoration with given ID from the group.
   * @param identifier ID of item to remove
   */
  remove(t) {
    const e = this.items.findIndex((s) => s.decoration.id === t);
    if (e < 0) return;
    const i = this.items[e], n = i.decoration.style?.type === _.Mask;
    this.items.splice(e, 1), i.clickableElements = void 0, i.container && (i.container.remove(), i.container = void 0), this.experimentalHighlights && !this.notTextFlag?.has(i.id) && this.wnd.CSS.highlights.get(this.id)?.delete(i.range), this.notTextFlag?.delete(i.id), n && this.updateSharedMask();
  }
  /**
   * Notifies that the given decoration was modified and needs to be updated.
   * @param decoration Decoration to update
   */
  update(t) {
    this.remove(t.id), this.add(t);
  }
  /**
   * Removes all decorations from this group.
   */
  clear() {
    this.clearContainer(), this.items.length = 0, this.notTextFlag?.clear(), this.maskSvg && (this.maskSvg.remove(), this.maskSvg = void 0), this.shadowHost && (this.shadowHost.remove(), this.shadowHost = void 0, this.shadowRoot = void 0);
  }
  /**
   * Removes all decorations and tears down event listeners.
   * Must be called when the group is permanently discarded.
   */
  destroy() {
    this.clear(), this.wnd.document.removeEventListener("pointerup", this.activationHandler);
  }
  handleActivation(t) {
    if (!this._activatable) return;
    const e = t.clientX, i = t.clientY, n = this.wnd.devicePixelRatio;
    for (const s of this.items) {
      if (!s.decoration.style?.isActive) continue;
      let o;
      if (s.decoration.style.type === _.Template)
        for (const a of s.clickableElements ?? []) {
          const l = a.getBoundingClientRect();
          if (St(l, e, i, 0)) {
            o = l;
            break;
          }
        }
      else {
        const a = s.range.getClientRects();
        for (const l of a)
          if (St(l, e, i, 0)) {
            o = s.range.getBoundingClientRect();
            break;
          }
      }
      if (o) {
        this.comms.send("decoration_activated", {
          decorationId: s.decoration.id,
          group: this.name,
          rect: {
            top: o.top * n,
            left: o.left * n,
            width: o.width * n,
            height: o.height * n
          },
          point: { x: e * n, y: i * n }
        });
        return;
      }
    }
  }
  /**
   * Recreates the decoration elements.
   * To be called after reflowing the resource, for example.
   */
  requestLayout() {
    this.wnd.cancelAnimationFrame(this.currentRender), this.clearContainer(), this.wnd.document.fonts.ready.then(() => {
      this.currentRender = this.wnd.requestAnimationFrame(() => {
        this.items.forEach((t) => this.layout(t)), this.renderLayout(this.items), this.updateSharedMask();
      });
    });
  }
  experimentalLayout(t) {
    const [e, i] = this.requireContainer(!0), n = t.decoration.style, s = n.type ?? _.Highlight, o = n.tint ?? Se(s), a = n.width, l = n.layout, d = (m, p) => this.wnd.document.caretPositionFromPoint?.(m, p) ?? null;
    if (s === _.TextColor && (l === "bounds" || a === "bounds" || a === "page")) {
      const m = ve(this.wnd);
      if (m.isVertical)
        console.warn("Vertical writing detected: caretPositionFromPoint has known bugs, falling back to original range"), i.add(t.range);
      else {
        const p = t.range.getBoundingClientRect();
        let f, b;
        a === "page" ? (f = Math.floor(m.inlineStart(p) / m.pageInlineSize) * m.pageInlineSize, b = m.pageInlineSize) : (f = m.inlineStart(p), b = m.inlineSize(p));
        const S = d(f, m.blockStart(p) + 1), C = d(f + b, m.blockStart(p) + m.blockSize(p) - 1);
        if (S && C) {
          const x = this.wnd.document.createRange();
          x.setStart(S.offsetNode, S.offset), x.setEnd(C.offsetNode, C.offset), i.add(x), t.range = x;
        } else
          i.add(t.range);
      }
    } else
      i.add(t.range);
    const h = this.getBackgroundColor(), c = n.enforceContrast !== !1;
    let u;
    switch (s) {
      case _.Underline:
        const m = c ? lt(o, h) : o;
        u = `::highlight(${this.id}) {
                    text-decoration: underline;
                    text-decoration-color: ${m};
                    text-decoration-thickness: 0.1em;
                }`;
        break;
      case _.Outline:
        const p = c ? lt(o, h) : o;
        u = `::highlight(${this.id}) {
                    outline: 2px solid ${p};
                    outline-offset: 1px;
                }`;
        break;
      case _.TextColor: {
        const f = c ? lt(o, h) : o;
        u = `::highlight(${this.id}) {
                    color: ${f};
                }`;
        break;
      }
      case _.Highlight:
      default: {
        const f = c ? lt(o, h) : o;
        u = `::highlight(${this.id}) {
                    color: ${cs(f, h)};
                    background-color: ${f};
                }`;
      }
    }
    e.innerHTML = u;
  }
  /**
   * Layouts a single DecorationItem.
   * @param item
   */
  layout(t) {
    if (this.experimentalHighlights && !this.notTextFlag?.has(t.id))
      return this.experimentalLayout(t);
    const e = this.wnd.document.createElement("div");
    e.setAttribute("id", t.id), e.dataset.highlightId = t.decoration.id, e.style.setProperty("pointer-events", "none");
    const i = ve(this.wnd);
    let n = 1;
    if (X.UA.Blink) {
      const h = parseFloat(this.wnd.getComputedStyle(this.wnd.document.documentElement).zoom), c = parseFloat(this.wnd.getComputedStyle(this.wnd.document.body).zoom), u = (h || 1) * (c || 1);
      u && (n = 1 / u);
    }
    const s = (h, c, u, m = 0) => {
      switch (t.decoration?.style?.width) {
        case "viewport": {
          const f = Math.floor(i.inlineStart(c) / i.viewportInlineSize) * i.viewportInlineSize;
          i.applyPosition(h, f + i.inlineScrollOffset + m, i.blockStart(c) + i.blockScrollOffset, i.viewportInlineSize - 2 * m, i.blockSize(c), n);
          break;
        }
        case "page": {
          const f = Math.floor(i.inlineStart(c) / i.pageInlineSize) * i.pageInlineSize;
          i.applyPosition(h, f + i.inlineScrollOffset + m, i.blockStart(c) + i.blockScrollOffset, i.pageInlineSize - 2 * m, i.blockSize(c), n);
          break;
        }
        case "bounds": {
          i.applyPosition(h, i.inlineStart(u) + i.inlineScrollOffset, i.blockStart(c) + i.blockScrollOffset, i.inlineSize(u), i.blockSize(c), n);
          break;
        }
        default:
          i.applyPosition(h, i.inlineStart(c) + i.inlineScrollOffset, i.blockStart(c) + i.blockScrollOffset, i.inlineSize(c), i.blockSize(c), n);
      }
    }, o = t.range.getBoundingClientRect(), a = t.decoration.style, l = (() => {
      if (a.type !== _.Outline) return 0;
      const h = a.width;
      return h === "page" || h === "viewport" ? 3 : 0;
    })();
    let d;
    if (a.type === _.Template) {
      a.stylesheet && this.injectCustomStylesheet(a.stylesheet);
      const h = Ss(this.wnd, a.element);
      if (!h) {
        t.container = e, t.clickableElements = [];
        return;
      }
      h.style.setProperty("pointer-events", "none"), d = h;
    } else {
      const h = a, c = h.type ?? _.Highlight, u = h.tint ?? Se(c);
      if (c === _.TextColor) {
        t.container = e, t.clickableElements = [];
        return;
      }
      if (c === _.Mask) {
        t.container = e, t.clickableElements = [], this.updateSharedMask();
        return;
      }
      const m = this.getCurrentDarkMode(), p = this.getBackgroundColor(), f = h.enforceContrast !== !1, b = (() => {
        switch (c) {
          case _.Underline: {
            const x = f ? lt(u, p) : u;
            return [
              h.layout === "bounds" ? `border-top: 0.1em solid ${x} !important` : null,
              `border-bottom: 0.1em solid ${x} !important`,
              "background-color: transparent !important",
              "box-sizing: border-box !important"
            ].filter(Boolean).join("; ");
          }
          case _.Outline:
            return [
              `outline: 2px solid ${f ? lt(u, p) : u} !important`,
              "outline-offset: 1px !important",
              "background-color: transparent !important",
              "box-sizing: border-box !important"
            ].join("; ");
          case _.Highlight:
          default:
            return [
              `background-color: ${f ? lt(u, p) : u} !important`,
              `mix-blend-mode: ${m ? "exclusion" : "multiply"} !important`,
              "opacity: 1 !important",
              "box-sizing: border-box !important"
            ].join("; ");
        }
      })(), S = this.wnd.document.createElement("template");
      S.innerHTML = `<div data-readium="true" class="readium-${c}" style="${b}"></div>`.trim(), d = S.content.firstElementChild;
    }
    if (t.decoration?.style?.layout === "bounds") {
      const h = d.cloneNode(!0);
      h.style.setProperty("pointer-events", "none"), s(h, o, o, l), e.append(h);
    } else {
      let h = es(
        t.range,
        !0,
        // doNotMergeHorizontallyAlignedRects
        i.isVertical
        // doNotMergeVerticallyAlignedRects
      );
      h = h.sort((c, u) => i.isVertical ? (i.isVertLR ? 1 : -1) * (c.left - u.left) : c.top - u.top);
      for (let c of h) {
        const u = d.cloneNode(!0);
        u.style.setProperty("pointer-events", "none"), s(u, c, o, l), e.append(u);
      }
    }
    t.container = e, t.clickableElements = Array.from(
      e.querySelectorAll("[data-activable='1']")
    ), t.clickableElements.length || (t.clickableElements = Array.from(e.children));
  }
  renderLayout(t) {
    this.wnd.cancelAnimationFrame(this.currentRender), this.currentRender = this.wnd.requestAnimationFrame(() => {
      if (t = t.filter((i) => !this.experimentalHighlights || !!this.notTextFlag?.has(i.id)), !t || t.length === 0) return;
      this.requireContainer().append(...t.map((i) => i.container).filter((i) => !!i));
    });
  }
  /**
   * Returns the group container element, after making sure it exists.
   * @returns Group's container
   */
  requireContainer(t = !1) {
    if (t) {
      let e;
      this.wnd.document.getElementById(`${this.id}-style`) ? e = this.wnd.document.getElementById(`${this.id}-style`) : (e = this.wnd.document.createElement("style"), e.dataset.readium = "true", e.id = `${this.id}-style`, this.wnd.document.head.appendChild(e));
      let i;
      return this.wnd.CSS.highlights.has(this.id) ? i = this.wnd.CSS.highlights.get(this.id) : (i = new this.wnd.Highlight(), this.wnd.CSS.highlights.set(this.id, i)), [e, i];
    }
    return this.container || (this.shadowRoot || (this.shadowHost = this.wnd.document.createElement("div"), this.shadowHost.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none", this.wnd.document.body.appendChild(this.shadowHost), this.shadowRoot = this.shadowHost.attachShadow({ mode: "open" })), this.container = this.wnd.document.createElement("div"), this.container.setAttribute("id", this.id), this.container.dataset.group = this.name, this.container.dataset.readium = "true", this.container.style.setProperty("pointer-events", "none"), this.container.style.display = "contents", this.shadowRoot.appendChild(this.container)), this.container;
  }
  getCurrentDarkMode() {
    return Ei(this.wnd, "--USER__appearance") === "readium-night-on" || dn(this.getBackgroundColor());
  }
  getBackgroundColor() {
    return Ei(this.wnd, "--USER__backgroundColor") || this.wnd.getComputedStyle(this.wnd.document.documentElement).getPropertyValue("background-color");
  }
  updateSharedMask() {
    const t = this.items.filter(
      (u) => u.decoration.style?.type === _.Mask
    );
    if (t.length === 0) {
      this.maskSvg && (this.maskSvg.remove(), this.maskSvg = void 0), this.shadowRoot && (this.shadowRoot.innerHTML = "");
      return;
    }
    const e = ve(this.wnd);
    let i = 1;
    if (X.UA.Blink) {
      const u = parseFloat(this.wnd.getComputedStyle(this.wnd.document.documentElement).zoom), m = parseFloat(this.wnd.getComputedStyle(this.wnd.document.body).zoom), p = (u || 1) * (m || 1);
      p && (i = 1 / p);
    }
    const n = this.wnd.document.documentElement, s = n.scrollWidth, o = n.scrollHeight, a = [];
    for (const u of t) {
      const m = u.decoration.style, p = m.layout ?? "boxes", f = m.width ?? "wrap", b = u.range.getBoundingClientRect(), S = p === "bounds" ? [b] : Array.from(u.range.getClientRects());
      for (const C of S) {
        let x;
        switch (f) {
          case "viewport": {
            const G = Math.floor(e.inlineStart(C) / e.viewportInlineSize) * e.viewportInlineSize;
            x = e.toRect(G, e.blockStart(C), e.viewportInlineSize, e.blockSize(C));
            break;
          }
          case "page": {
            const G = Math.floor(e.inlineStart(C) / e.pageInlineSize) * e.pageInlineSize;
            x = e.toRect(G, e.blockStart(C), e.pageInlineSize, e.blockSize(C));
            break;
          }
          case "bounds": {
            x = e.toRect(e.inlineStart(b), e.blockStart(C), e.inlineSize(b), e.blockSize(C));
            break;
          }
          default:
            x = C;
        }
        a.push(x);
      }
    }
    const l = [
      `M0 0 H${s} V${o} H0 Z`,
      ...a.map((u) => {
        const m = (u.left + e.xDocOffset) * i, p = (u.top + e.yDocOffset) * i, f = (u.right + e.xDocOffset) * i, b = (u.bottom + e.yDocOffset) * i;
        return `M${m} ${p} H${f} V${b} H${m} Z`;
      })
    ].join(" "), d = "http://www.w3.org/2000/svg";
    if (!this.maskSvg) {
      this.shadowRoot || (this.shadowHost = this.wnd.document.createElement("div"), this.shadowHost.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none", this.wnd.document.body.appendChild(this.shadowHost), this.shadowRoot = this.shadowHost.attachShadow({ mode: "open" })), this.maskSvg = this.wnd.document.createElementNS(d, "svg"), this.maskSvg.style.cssText = `position:absolute;top:0;left:0;width:${s}px;height:${o}px;pointer-events:none;z-index:9999`, this.maskSvg.dataset.readium = "true";
      const u = this.wnd.document.createElementNS(d, "defs"), m = this.wnd.document.createElementNS(d, "clipPath"), p = `${this.id}-mask-clip`;
      m.setAttribute("id", p), m.setAttribute("clipPathUnits", "userSpaceOnUse");
      const f = this.wnd.document.createElementNS(d, "path");
      f.setAttribute("clip-rule", "evenodd"), m.appendChild(f), u.appendChild(m), this.maskSvg.appendChild(u);
      const b = this.wnd.document.createElementNS(d, "rect");
      b.setAttribute("id", `${this.id}-mask-rect`), b.setAttribute("clip-path", `url(#${p})`), b.style.pointerEvents = "none", this.maskSvg.appendChild(b), this.shadowRoot.appendChild(this.maskSvg);
    }
    this.maskSvg.style.width = `${s}px`, this.maskSvg.style.height = `${o}px`;
    const h = this.maskSvg.querySelector("path");
    h && h.setAttribute("d", l);
    const c = this.maskSvg.querySelector("rect");
    if (c) {
      const m = t[0].decoration.style.tint, p = m ?? this.getBackgroundColor() ?? Se(_.Mask), f = m ? "1" : "0.5";
      c.setAttribute("x", "0"), c.setAttribute("y", "0"), c.setAttribute("width", String(s)), c.setAttribute("height", String(o)), c.setAttribute("fill", p), c.setAttribute("fill-opacity", f);
    }
  }
  injectCustomStylesheet(t) {
    const e = `${this.id}-custom-style`;
    let i = this.wnd.document.getElementById(e);
    i || (i = this.wnd.document.createElement("style"), i.id = e, i.dataset.readium = "true", this.wnd.document.head.appendChild(i)), i.innerHTML = t;
  }
  /**
   * Removes the group container.
   */
  clearContainer() {
    this.experimentalHighlights && this.wnd.CSS.highlights.delete(this.id), this.wnd.document.getElementById(`${this.id}-custom-style`)?.remove(), this.container && (this.container.remove(), this.container = void 0);
  }
}
const wt = class wt extends kt {
  constructor() {
    super(...arguments), this.resizeFrame = 0, this.lastGroupId = 0, this.groups = /* @__PURE__ */ new Map(), this.handleResizer = this.handleResize.bind(this);
  }
  cleanup() {
    this.groups.forEach((t) => t.destroy()), this.groups.clear();
  }
  updateHighlightStyles() {
    this.groups.forEach((t) => {
      t.requestLayout();
    });
  }
  handleResize() {
    this.wnd.clearTimeout(this.resizeFrame), this.resizeFrame = this.wnd.setTimeout(() => {
      this.groups.forEach((t) => {
        t.experimentalHighlights || t.requestLayout();
      });
    }, 50);
  }
  mount(t, e) {
    return this.wnd = t, e.register("decorate", wt.moduleName, (i, n) => {
      const s = i;
      (s.action === "add" || s.action === "update") && s.decoration.locator && (s.decoration.locator = F.deserialize(s.decoration.locator)), this.groups.has(s.group) || this.groups.set(s.group, new _s(
        t,
        e,
        `readium-decoration-${this.lastGroupId++}`,
        s.group
      ));
      const o = this.groups.get(s.group);
      switch (s.action) {
        case "add":
          o?.add(s.decoration);
          break;
        case "remove":
          o?.remove(s.decoration.id);
          break;
        case "clear":
          o?.clear();
          break;
        case "update":
          o?.update(s.decoration);
          break;
      }
      n(!0);
    }), e.register("decoration_activatable", wt.moduleName, (i, n) => {
      const s = i, o = this.groups.get(s.group);
      o && (o.activatable = s.activatable), n(!0);
    }), this.resizeObserver = { disconnect() {
    } }, t.addEventListener("orientationchange", this.handleResizer), t.addEventListener("resize", this.handleResizer), this.styleObserver = new MutationObserver((i) => {
      i.some(
        (s) => s.type === "attributes" && s.attributeName === "style" && s.oldValue !== s.target.getAttribute("style")
      ) && this.updateHighlightStyles();
    }), this.styleObserver.observe(t.document.documentElement, {
      attributes: !0,
      attributeFilter: ["style"],
      attributeOldValue: !0
    }), e.log("Decorator Mounted"), !0;
  }
  unmount(t, e) {
    return t.removeEventListener("orientationchange", this.handleResizer), t.removeEventListener("resize", this.handleResizer), e.unregisterAll(wt.moduleName), this.resizeObserver.disconnect(), this.styleObserver.disconnect(), this.cleanup(), e.log("Decorator Unmounted"), !0;
  }
};
wt.moduleName = "decorator";
let ke = wt;
const ki = "readium-snapper-style", Mt = class Mt extends kt {
  constructor() {
    super(...arguments), this.protected = !1;
  }
  buildStyles() {
    return `
        html, body {
            touch-action: manipulation;
            user-select: ${this.protected ? "none" : "auto"};
        }`;
  }
  mount(t, e) {
    const i = t.document.createElement("style");
    return i.dataset.readium = "true", i.id = ki, i.textContent = this.buildStyles(), t.document.head.appendChild(i), e.register("protect", Mt.moduleName, (n, s) => {
      this.protected = !0, i.textContent = this.buildStyles(), s(!0);
    }), e.register("unprotect", Mt.moduleName, (n, s) => {
      this.protected = !1, i.textContent = this.buildStyles(), s(!0);
    }), e.log("Snapper Mounted"), !0;
  }
  unmount(t, e) {
    return t.document.getElementById(ki)?.remove(), e.log("Snapper Unmounted"), !0;
  }
};
Mt.moduleName = "snapper";
let xt = Mt;
function xs(r) {
  return r < 0.5 ? 2 * r * r : -1 + (4 - 2 * r) * r;
}
function T(r) {
  const t = r.getSelection();
  t && t.removeAllRanges();
}
const Ls = [
  "a",
  "area",
  "audio",
  "button",
  "canvas",
  "details",
  "input",
  "label",
  "option",
  "select",
  "submit",
  "textarea",
  "video"
], ks = ["dialog", "radiogroup", "radio", "menu", "menuitem"];
function Ye(r) {
  return Os(r) ? null : yn(r) ? r : r.parentElement ? Ye(r.parentElement) : null;
}
function Os(r) {
  return r ? r.closest("[inert]") !== null || r.hasAttribute("disabled") : !0;
}
function yn(r) {
  return r ? r.role && ks.includes(r.role) ? !0 : r.tagName.toLowerCase() === "iframe" ? !1 : r.tabIndex >= 0 ? !0 : Ls.includes(r.nodeName.toLowerCase()) || r.hasAttribute("contenteditable") && r.getAttribute("contenteditable")?.toLowerCase() !== "false" : !1;
}
function de(r, t) {
  const e = bn(r, r.document.body, t), i = r._readium_cssSelectorGenerator.getCssSelector(e, {
    selectors: ["tag", "id", "class", "nthchild", "nthoftype", "attribute"]
  });
  return new F({
    href: "#",
    type: "application/xhtml+xml",
    locations: new L({
      otherLocations: /* @__PURE__ */ new Map([
        ["cssSelector", i]
      ])
    }),
    text: new tt({
      highlight: e.textContent || void 0
    })
  });
}
function bn(r, t, e) {
  for (var i = 0; i < t.children.length; i++) {
    const n = t.children[i];
    if (!Ts(n) && Rs(r, n, e))
      return As(r, n) ? n : bn(r, n, e);
  }
  return t;
}
function Rs(r, t, e) {
  if (t === document.body || t === document.documentElement)
    return !0;
  if (!document || !document.documentElement || !document.body)
    return !1;
  const i = t.getBoundingClientRect();
  return e ? i.bottom > 0 && i.top < r.innerHeight : i.right > 0 && i.left < r.innerWidth;
}
function As(r, t) {
  const e = t.getBoundingClientRect();
  return e.top >= 0 && e.left >= 0 && e.bottom <= r.innerHeight && e.right <= r.innerWidth;
}
function Ts(r) {
  const t = getComputedStyle(r);
  if (t) {
    const e = t.getPropertyValue("display");
    if (e != "block" && e != "list-item" || t.getPropertyValue("opacity") === "0")
      return !0;
  }
  return !1;
}
const Ns = {
  maxVelocity: 200,
  // Reasonable default for human-like scrolling (pixels/ms)
  minVariance: 0.01,
  // Default variance threshold
  historySize: 20,
  // Balanced history size for performance
  minDirectionChanges: 0.2,
  // Reasonable default for detecting patterns
  maxConsistentScrolls: 15
  // Balanced threshold for flagging
}, qe = {
  maxVelocity: 200,
  // Extremely fast scrolling (pixels/ms)
  minVariance: 1e-5,
  // Near-perfect consistency
  historySize: 100,
  // Large history window
  minDirectionChanges: 0.1,
  // Only trigger on near-perfect patterns
  maxConsistentScrolls: 20
  // Need many consistent scrolls
}, vn = {
  maxSelectionsPerSecond: 500,
  minVariance: 50,
  historySize: 20
}, Ms = {
  enabled: !0,
  maxSelectionPercent: 0.1,
  minThreshold: 100,
  absoluteMaxChars: 5e3,
  historySize: 20
};
class ue {
  constructor(t = {}) {
    this.history = [], this.consistentScrollCount = 0, this.options = { ...Ns, ...t };
  }
  analyze(t, e, i) {
    if (i <= 0) return !1;
    const n = Math.abs(e) / i, s = Date.now();
    if (this.history.push({
      timestamp: s,
      direction: t,
      velocity: n,
      distance: Math.abs(e)
    }), this.history = this.history.filter((f) => s - f.timestamp < 2e3).slice(-(this.options.historySize || 20)), this.history.length < 3) return !1;
    if (n > this.options.maxVelocity)
      return this.resetAfterDetection(), !0;
    const o = this.history.map((f) => f.velocity), a = this.history.map((f) => f.distance), l = o.reduce((f, b) => f + b, 0) / o.length, d = a.reduce((f, b) => f + b, 0) / a.length, h = o.reduce((f, b) => f + Math.pow(b - l, 2), 0) / o.length, c = a.reduce((f, b) => f + Math.pow(b - d, 2), 0) / a.length;
    if (h < this.options.minVariance && c < d * 0.1) {
      if (this.consistentScrollCount++, this.consistentScrollCount >= (this.options.maxConsistentScrolls || 10))
        return this.resetAfterDetection(), !0;
    } else
      this.consistentScrollCount = Math.max(0, this.consistentScrollCount - 1);
    let u = 0, m = this.history[0].direction;
    for (let f = 1; f < this.history.length; f++)
      this.history[f].direction !== m && (u++, m = this.history[f].direction);
    return u / this.history.length > (this.options.minDirectionChanges || 0.3) ? (this.resetAfterDetection(), !0) : !1;
  }
  resetAfterDetection() {
    this.history = this.history.slice(-3), this.consistentScrollCount = 0;
  }
  clear() {
    this.history = [], this.consistentScrollCount = 0;
  }
}
const Oi = "readium-column-snapper-style", Fs = 200, H = class H extends xt {
  constructor() {
    super(...arguments), this.isSnapProtectionEnabled = !1, this.patternAnalyzer = null, this.lastTurnTime = 0, this.rtl = !1, this.shakeTimeout = 0, this.snappingCancelled = !1, this.alreadyScrollLeft = 0, this.overscroll = 0, this.cachedScrollWidth = 0, this.touchState = 0, this.startingX = void 0, this.endingX = void 0, this.onTouchStarter = this.onTouchStart.bind(this), this.onTouchEnder = this.onTouchEnd.bind(this), this.onWidthChanger = this.onWidthChange.bind(this), this.onTouchMover = this.onTouchMove.bind(this);
  }
  doc() {
    return this.wnd.document.scrollingElement;
  }
  scrollOffset() {
    const t = this.doc().scrollLeft;
    return t !== 0 ? t : this.alreadyScrollLeft;
  }
  pageStride() {
    const t = this.wnd.getComputedStyle(this.wnd.document.documentElement), e = Number.parseInt(t.getPropertyValue("column-count"), 10) || 1, i = Number.parseFloat(t.getPropertyValue("column-gap")) || 0;
    return this.wnd.innerWidth + (e > 1 ? i : 0);
  }
  snapOffset(t) {
    const e = t + (this.rtl ? -1 : 1);
    const i = this.pageStride();
    return e - e % i;
  }
  /**
   * Snap a non-negative normalized offset (distance from document start) to
   * the nearest page boundary. Works identically regardless of reading direction.
   */
  snapNormOffset(t) {
    const e = t + 1;
    const i = this.pageStride();
    return e - e % i;
  }
  /**
   * Normalized scroll position: distance from document start, always in
   * [0, scrollWidth - innerWidth] regardless of reading direction.
   * scrollLeft may be negative depending on the browser — Math.abs() normalizes it.
   */
  normScroll() {
    const t = this.doc().scrollLeft;
    return this.rtl ? Math.abs(t) : Math.max(0, this.wnd.scrollX > 0 ? this.wnd.scrollX : t);
  }
  currentProgress() {
    const t = this.cachedScrollWidth, e = this.wnd.innerWidth, i = this.normScroll(), n = Math.max(1, t - e);
    return {
      start: Math.max(0, Math.min(1, i / n)),
      end: Math.max(0, Math.min(1, (i + e) / t))
    };
  }
  reportProgress() {
    this.comms.send("progress", this.currentProgress());
  }
  shake() {
    if (this.overscroll !== 0 || this.shakeTimeout !== 0) return;
    const t = this.doc(), e = this.normScroll() < 5, i = this.rtl ? e ? "readium-bounce-r" : "readium-bounce-l" : "readium-bounce-r";
    t.classList.add(i);
    const n = this.scrollOffset();
    this.shakeTimeout = this.wnd.setTimeout(() => {
      t.classList.remove(i), this.shakeTimeout = 0, this.doc().scrollLeft = n;
    }, 150);
  }
  // We have to cache this because during overscroll (transform, or left) the width is incorrect due to browser
  takeOverSnap() {
    this.snappingCancelled = !0, this.clearTouches();
    const t = this.doc();
    this.overscroll = t.style.transform?.length > 12 ? parseFloat(t.style.transform.slice(12).split("px")[0]) : 0;
  }
  // Snaps the current offset to the page width.
  snapCurrentOffset(t = !1, e = !1) {
    const i = this.doc(), n = pn(this.wnd), s = this.cachedScrollWidth - this.wnd.innerWidth, o = Math.min(Math.max(0, this.normScroll()), s), a = this.dragOffset(), l = this.rtl ? -a : a, d = this.pageStride() / 3 * (l > 0 ? 2 : 1), h = Math.min(s, Math.max(0, this.snapNormOffset(o + d))), c = this.rtl ? -h : h, u = this.rtl ? -o : o, m = c > u ? "right" : "left";
    if (this.checkSuspiciousSnap(m, Math.abs(c - u)), t && c !== u) {
      this.snappingCancelled = !1;
      const p = (C, x, G, ut) => G > ut ? x : C + (x - C) * xs(G / ut), f = Fs * n;
      let b;
      const S = (C) => {
        if (this.snappingCancelled) return;
        b || (b = C);
        const x = C - b, G = p(this.overscroll, 0, x, f), ut = p(u, c, x, f);
        i.scrollLeft = ut, this.overscroll !== 0 && (i.style.transform = `translate3d(${-G}px, 0px, 0px)`), x < f ? this.wnd.requestAnimationFrame(S) : (this.clearTouches(), i.style.removeProperty("transform"), i.scrollLeft = c, e || this.reportProgress());
      };
      this.wnd.requestAnimationFrame(S);
    } else
      i.style.removeProperty("transform"), this.wnd.requestAnimationFrame(() => {
        i.scrollLeft = c, this.clearTouches(), e || this.reportProgress();
      });
  }
  dragOffset() {
    return (this.startingX ?? 0) - (this.endingX ?? 0);
  }
  clearTouches() {
    this.startingX = void 0, this.endingX = void 0, this.overscroll = 0;
  }
  onTouchStart(t) {
    switch (t.stopPropagation(), this.takeOverSnap(), t.touches.length) {
      case 1:
        break;
      case 2:
        this.onTouchEnd(t);
        return;
      default: {
        this.onTouchEnd(t), this.comms.send("tap_more", t.touches.length);
        return;
      }
    }
    this.startingX = t.touches[0].clientX, this.alreadyScrollLeft = this.doc().scrollLeft, this.touchState = 1;
  }
  onTouchEnd(t) {
    if (this.touchState === 2) {
      const e = this.dragOffset(), i = this.normScroll(), n = this.cachedScrollWidth - this.wnd.innerWidth, s = this.rtl ? -e : e;
      this.cachedScrollWidth <= this.wnd.innerWidth ? (this.reportProgress(), s > 5 && this.comms.send("no_more", void 0), s < -5 && this.comms.send("no_less", void 0)) : i < 5 && s < 5 ? (this.alreadyScrollLeft = 0, this.comms.send("no_less", void 0)) : n - i < 5 && s > 5 && (this.alreadyScrollLeft = this.rtl ? -n : n, this.comms.send("no_more", void 0)), this.snapCurrentOffset(!0), this.comms.send("swipe", e);
    }
    this.touchState = 0;
  }
  onWidthChange() {
    this.cachedScrollWidth = this.doc().scrollWidth, this.comms.ready && this.snapCurrentOffset();
  }
  onTouchMove(t) {
    if (this.touchState === 0) return;
    this.touchState === 1 && (this.touchState = 2, T(this.wnd)), this.endingX = t.touches[0].clientX;
    const e = this.dragOffset(), i = this.alreadyScrollLeft + e, n = this.rtl ? -(this.cachedScrollWidth - this.wnd.innerWidth) : 0, s = this.rtl ? 0 : this.cachedScrollWidth - this.wnd.innerWidth;
    i < n ? (this.overscroll = i, this.doc().style.transform = `translate3d(${-this.overscroll}px, 0px, 0px)`) : i > s ? (this.overscroll = i, this.doc().style.transform = `translate3d(${-i}px, 0px, 0px)`) : (this.overscroll = 0, this.doc().style.removeProperty("transform"), this.doc().scrollLeft = i);
  }
  enableSnapProtection() {
    this.patternAnalyzer || (this.patternAnalyzer = new ue({
      maxVelocity: this.pageStride(),
      // page width
      minVariance: 0.1,
      // Allow for some variation in swipe speed
      historySize: 5,
      // Fewer samples needed for swipe detection
      maxConsistentScrolls: 3,
      // Lower threshold for consistent scrolling
      minDirectionChanges: 0.3
      // Require more direction changes
    }), this.isSnapProtectionEnabled = !0, this.comms?.log("Snap protection enabled"));
  }
  checkSuspiciousSnap(t, e) {
    if (!this.isSnapProtectionEnabled || !this.patternAnalyzer) return;
    const i = Date.now(), n = i - (this.lastTurnTime || i);
    this.lastTurnTime = i, this.patternAnalyzer.analyze(t, e, n) && this.comms?.send("content_protection", {
      type: "suspicious_snapping",
      timestamp: Date.now(),
      event: null
    });
  }
  mount(t, e) {
    if (this.wnd = t, this.comms = e, this.rtl = fs(t), !super.mount(t, e)) return !1;
    t.navigator.epubReadingSystem && (t.navigator.epubReadingSystem.layoutStyle = "paginated");
    const i = t.document.createElement("style");
    i.dataset.readium = "true", i.id = Oi, i.textContent = `
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
        `, t.document.head.appendChild(i);
    this.resizeObserver = { disconnect() {
    } }, this.mutationObserver = new MutationObserver((o) => {
      for (const a of o)
        if (a.target === this.wnd.document.documentElement) {
          const l = a.oldValue, d = a.target.getAttribute("style"), h = /transform\s*:\s*([^;]+)/, c = l?.match(h), u = d?.match(h);
          !c && !u && as(l, d) && (t.requestAnimationFrame(() => {
            t && _i(t);
          }), this.onWidthChange());
        } else
          t.requestAnimationFrame(() => this.cachedScrollWidth = this.doc().scrollWidth);
    }), t.frameElement && this.mutationObserver.observe(t.frameElement, { attributes: !0, attributeFilter: ["style"] }), this.mutationObserver.observe(t.document, { attributes: !0, attributeFilter: ["style"] }), this.mutationObserver.observe(t.document.documentElement, { attributes: !0, attributeFilter: ["style"] }), e.register("scroll_protection", H.moduleName, (o, a) => {
      this.enableSnapProtection(), a(!0);
    });
    const n = (o) => {
      const a = this.doc().scrollLeft, l = this.snapOffset(o);
      return this.doc().style.removeProperty("transform"), this.doc().scrollLeft = l, this.alreadyScrollLeft = this.doc().scrollLeft, a !== this.doc().scrollLeft;
    }, s = (o) => {
      const a = this.doc().scrollLeft, l = this.snapNormOffset(Math.max(0, Math.min(this.cachedScrollWidth - t.innerWidth, o)));
      return this.doc().scrollLeft = -l, a !== this.doc().scrollLeft;
    };
    return t.addEventListener("orientationchange", this.onWidthChanger), t.addEventListener("resize", this.onWidthChanger), t.requestAnimationFrame(() => this.cachedScrollWidth = this.doc().scrollWidth), e.register("go_progression", H.moduleName, (o, a) => {
      const l = o;
      if (l < 0 || l > 1) {
        e.send("error", {
          message: "go_progression must be given a position from 0.0 to 1.0"
        }), a(!1);
        return;
      }
      this.wnd.requestAnimationFrame(() => {
        this.cachedScrollWidth = this.doc().scrollWidth;
        const h = (this.cachedScrollWidth - t.innerWidth) * l;
        this.rtl ? this.doc().scrollLeft = -this.snapNormOffset(h) : this.doc().scrollLeft = this.snapOffset(h), this.reportProgress(), T(this.wnd), a(!0);
      });
    }), e.register("go_id", H.moduleName, (o, a) => {
      const l = t.document.getElementById(o);
      if (!l) {
        a(!1);
        return;
      }
      this.wnd.requestAnimationFrame(() => {
        this.rtl ? this.doc().scrollLeft = -this.snapNormOffset(l.getBoundingClientRect().left + t.scrollX) : this.doc().scrollLeft = this.snapOffset(l.getBoundingClientRect().left + t.scrollX), this.reportProgress(), T(this.wnd), a(!0);
      });
    }), e.register("go_text", H.moduleName, (o, a) => {
      let l;
      Array.isArray(o) && (o.length > 1 && (l = o[1]), o = o[0]);
      const d = tt.deserialize(o), h = Wt(this.wnd.document, new F({
        href: t.location.href,
        type: "text/html",
        text: d,
        locations: l ? new L({
          otherLocations: /* @__PURE__ */ new Map([
            ["cssSelector", l]
          ])
        }) : void 0
      }));
      if (!h) {
        a(!1);
        return;
      }
      this.wnd.requestAnimationFrame(() => {
        this.rtl ? this.doc().scrollLeft = -this.snapNormOffset(h.getBoundingClientRect().left + t.scrollX) : this.doc().scrollLeft = this.snapOffset(h.getBoundingClientRect().left + t.scrollX), this.reportProgress(), T(this.wnd), a(!0);
      });
    }), e.register("go_end", H.moduleName, (o, a) => {
      this.wnd.requestAnimationFrame(() => {
        this.cachedScrollWidth = this.doc().scrollWidth;
        let l;
        if (this.rtl ? l = -this.snapNormOffset(this.cachedScrollWidth - t.innerWidth) : l = this.snapOffset(this.cachedScrollWidth), this.doc().scrollLeft === l) return a(!1);
        this.doc().scrollLeft = l, this.reportProgress(), T(this.wnd), a(!0);
      });
    }), e.register("go_start", H.moduleName, (o, a) => {
      this.wnd.requestAnimationFrame(() => {
        if (this.doc().scrollLeft === 0) return a(!1);
        this.doc().scrollLeft = 0, this.reportProgress(), T(this.wnd), a(!0);
      });
    }), e.register("go_prev", H.moduleName, (o, a) => {
      const l = performance.now();
      this.cachedScrollWidth = this.doc().scrollWidth;
      let d;
      const h = this.pageStride();
      this.rtl ? d = s(this.normScroll() - h) : d = n(this.normScroll() - h), d && this.checkSuspiciousSnap("left", h), a({
        kind: "turn",
        ok: d,
        progress: this.currentProgress(),
        iframeElapsedMs: performance.now() - l
      });
    }), e.register("go_next", H.moduleName, (o, a) => {
      const l = performance.now();
      this.cachedScrollWidth = this.doc().scrollWidth;
      let d;
      const h = this.pageStride();
      this.rtl ? d = s(this.normScroll() + h) : d = n(this.normScroll() + h), d && this.checkSuspiciousSnap("right", h), a({
        kind: "turn",
        ok: d,
        progress: this.currentProgress(),
        iframeElapsedMs: performance.now() - l
      });
    }), e.register("unfocus", H.moduleName, (o, a) => {
      this.snappingCancelled = !0, T(this.wnd), a(!0);
    }), e.register("shake", H.moduleName, (o, a) => {
      this.shake(), a(!0);
    }), e.register("focus", H.moduleName, (o, a) => {
      this.wnd.requestAnimationFrame(() => {
        this.cachedScrollWidth = this.doc().scrollWidth, this.snapCurrentOffset(!1, !0), this.reportProgress(), a(!0);
      });
    }), e.register("focus_progression", H.moduleName, (o, a) => {
      const l = Number(o);
      if (!Number.isFinite(l) || l < 0 || l > 1) {
        a(!1);
        return;
      }
      this.cachedScrollWidth = this.doc().scrollWidth;
      const d = (this.cachedScrollWidth - t.innerWidth) * l;
      this.rtl ? this.doc().scrollLeft = -this.snapNormOffset(d) : this.doc().scrollLeft = this.snapOffset(d), this.reportProgress(), T(this.wnd), a(!0);
    }), e.register("first_visible_locator", H.moduleName, (o, a) => {
      const l = de(t, !1);
      this.comms.send("first_visible_locator", l.serialize()), a(!0);
    }), t.addEventListener("touchstart", this.onTouchStarter, { passive: !0 }), t.addEventListener("touchend", this.onTouchEnder, { passive: !0 }), t.addEventListener("touchmove", this.onTouchMover, { passive: !0 }), t.document.addEventListener("touchstart", () => {
    }), e.log("ColumnSnapper Mounted"), !0;
  }
  unmount(t, e) {
    return this.snappingCancelled = !0, e.unregisterAll(H.moduleName), this.resizeObserver.disconnect(), this.mutationObserver.disconnect(), this.patternAnalyzer && (this.patternAnalyzer.clear(), this.patternAnalyzer = null, this.isSnapProtectionEnabled = !1), t.removeEventListener("touchstart", this.onTouchStarter), t.removeEventListener("touchend", this.onTouchEnder), t.removeEventListener("touchmove", this.onTouchMover), t.removeEventListener("orientationchange", this.onWidthChanger), t.removeEventListener("resize", this.onWidthChanger), t.document.getElementById(Oi)?.remove(), e.log("ColumnSnapper Unmounted"), super.unmount(t, e);
  }
};
H.moduleName = "column_snapper";
let Oe = H;
const Ri = "readium-scroll-snapper-style", B = class B extends xt {
  constructor() {
    super(...arguments), this.patternAnalyzer = null, this.lastScrollTime = 0, this.isScrollProtectionEnabled = !1, this.initialScrollHandled = !1, this.isScrolling = !1, this.lastScrollTop = 0, this.isResizing = !1, this.resizeDebounce = null, this.handleScroll = (t) => {
      if (this.comms.ready && !this.isResizing) {
        if (!this.initialScrollHandled) {
          this.lastScrollTop = this.doc().scrollTop, this.initialScrollHandled = !0, this.reportProgress();
          return;
        }
        this.isScrolling || (this.isScrolling = !0, this.wnd.requestAnimationFrame(() => {
          this.reportProgress();
          const e = this.doc().scrollTop, i = e - this.lastScrollTop;
          if (this.lastScrollTop = e, this.isScrollProtectionEnabled && Math.abs(i) > 5) {
            const n = Date.now(), s = n - (this.lastScrollTime || n);
            if (this.patternAnalyzer && this.patternAnalyzer.analyze(
              i > 0 ? "down" : "up",
              Math.abs(i),
              s
            )) {
              const a = t.target && "tagName" in t.target ? { tagName: t.target.tagName } : null;
              this.comms?.send("content_protection", {
                type: "suspicious_scrolling",
                timestamp: Date.now(),
                scrollDelta: i,
                scrollDirection: i > 0 ? "down" : "up",
                targetElement: a
              });
            }
            this.lastScrollTime = n;
          }
          this.comms.send("scroll", i), this.isScrolling = !1;
        }));
      }
    };
  }
  doc() {
    return this.wnd.document.scrollingElement;
  }
  reportProgress() {
    if (!this.comms.ready) return;
    const t = Math.ceil(this.doc().scrollTop), e = this.doc().scrollHeight, i = this.wnd.innerHeight, n = Math.max(0, Math.min(1, t / e)), s = Math.max(0, Math.min(1, (t + i) / e));
    this.comms.send("progress", {
      start: n,
      end: s
    });
  }
  enableScrollProtection() {
    this.patternAnalyzer || (this.patternAnalyzer = new ue(qe), this.isScrollProtectionEnabled = !0, this.comms?.log("Scroll protection enabled"));
  }
  mount(t, e) {
    this.wnd = t, this.comms = e, this.initialScrollHandled = !1, this.lastScrollTop = 0, this.isResizing = !1, this.resizeDebounce && (this.wnd.clearTimeout(this.resizeDebounce), this.resizeDebounce = null), t.navigator.epubReadingSystem && (t.navigator.epubReadingSystem.layoutStyle = "scrolling");
    const i = t.document.createElement("style");
    return i.dataset.readium = "true", i.id = Ri, i.textContent = `
        * {
            scrollbar-width: none; /* for Firefox */
        }

        body::-webkit-scrollbar {
            display: none; /* for Chrome, Safari, and Opera */
        }
        `, t.document.head.appendChild(i), this.resizeObserver = new ResizeObserver(() => {
      this.resizeDebounce && this.wnd.clearTimeout(this.resizeDebounce), this.isResizing = !0, this.resizeDebounce = this.wnd.setTimeout(() => {
        this.isResizing = !1, this.resizeDebounce = null, this.reportProgress();
      }, 50);
    }), this.resizeObserver.observe(t.document.body), t.addEventListener("scroll", this.handleScroll, { passive: !0 }), e.register("force_webkit_recalc", B.moduleName, () => {
      Xe(this.wnd);
      const n = this.doc().scrollTop;
      n > 1 ? this.doc().scrollTop = n - 1 : this.doc().scrollTop = n + 1, this.doc().scrollTop = n;
    }), e.register("go_progression", B.moduleName, (n, s) => {
      const o = n;
      if (o < 0 || o > 1) {
        e.send("error", {
          message: "go_progression must be given a position from 0.0 to 1.0"
        }), s(!1);
        return;
      }
      this.wnd.requestAnimationFrame(() => {
        this.doc().scrollTop = this.doc().offsetHeight * o, this.reportProgress(), T(this.wnd), s(!0);
      });
    }), e.register("go_id", B.moduleName, (n, s) => {
      const o = t.document.getElementById(n);
      if (!o) {
        s(!1);
        return;
      }
      this.wnd.requestAnimationFrame(() => {
        this.doc().scrollTop = o.getBoundingClientRect().top + t.scrollY - t.innerHeight / 2, this.reportProgress(), T(this.wnd), s(!0);
      });
    }), e.register("go_text", B.moduleName, (n, s) => {
      let o;
      Array.isArray(n) && (n.length > 1 && (o = n[1]), n = n[0]);
      const a = tt.deserialize(n), l = Wt(this.wnd.document, new F({
        href: t.location.href,
        type: "text/html",
        text: a,
        locations: o ? new L({
          otherLocations: /* @__PURE__ */ new Map([
            ["cssSelector", o]
          ])
        }) : void 0
      }));
      if (!l) {
        s(!1);
        return;
      }
      this.wnd.requestAnimationFrame(() => {
        this.doc().scrollTop = l.getBoundingClientRect().top + t.scrollY - t.innerHeight / 2, this.reportProgress(), T(this.wnd), s(!0);
      });
    }), e.register("go_start", B.moduleName, (n, s) => {
      if (this.doc().scrollTop === 0) return s(!1);
      this.doc().scrollTop = 0, this.reportProgress(), s(!0);
    }), e.register("go_end", B.moduleName, (n, s) => {
      if (this.doc().scrollTop === this.doc().scrollHeight - this.doc().offsetHeight) return s(!1);
      this.doc().scrollTop = this.doc().scrollHeight - this.doc().offsetHeight, this.reportProgress(), s(!0);
    }), e.register("unfocus", B.moduleName, (n, s) => {
      T(this.wnd), s(!0);
    }), e.register("scroll_protection", B.moduleName, (n, s) => {
      this.enableScrollProtection(), s(!0);
    }), e.register([
      "go_next",
      "go_prev"
    ], B.moduleName, (n, s) => s(!1)), e.register("focus", B.moduleName, (n, s) => {
      this.reportProgress(), s(!0);
    }), e.register("first_visible_locator", B.moduleName, (n, s) => {
      const o = de(t, !0);
      this.comms.send("first_visible_locator", o.serialize()), s(!0);
    }), e.log("ScrollSnapper Mounted"), !0;
  }
  unmount(t, e) {
    return e.unregisterAll(B.moduleName), this.resizeObserver.disconnect(), this.handleScroll && t.removeEventListener("scroll", this.handleScroll), t.document.getElementById(Ri)?.remove(), this.patternAnalyzer && (this.patternAnalyzer.clear(), this.patternAnalyzer = null, this.isScrollProtectionEnabled = !1), e.log("ScrollSnapper Unmounted"), !0;
  }
};
B.moduleName = "scroll_snapper";
let Re = B;
const V = class V extends xt {
  constructor() {
    super(...arguments), this.patternAnalyzer = null, this.lastScrollTime = 0, this.isScrollProtectionEnabled = !1, this.initialScrollHandled = !1, this.isScrolling = !1, this.lastScrollTop = 0, this.isResizing = !1, this.resizeDebounce = null, this.handleScroll = (t) => {
      if (this.comms.ready && !this.isResizing) {
        if (!this.initialScrollHandled) {
          this.lastScrollTop = this.doc().scrollTop, this.initialScrollHandled = !0, this.reportProgress();
          return;
        }
        this.isScrolling || (this.isScrolling = !0, this.wnd.requestAnimationFrame(() => {
          this.reportProgress();
          const e = this.doc().scrollTop, i = e - this.lastScrollTop;
          if (this.lastScrollTop = e, this.isScrollProtectionEnabled && Math.abs(i) > 5) {
            const n = Date.now(), s = n - (this.lastScrollTime || n);
            if (this.patternAnalyzer && this.patternAnalyzer.analyze(
              i > 0 ? "down" : "up",
              Math.abs(i),
              s
            )) {
              const a = t.target && "tagName" in t.target ? { tagName: t.target.tagName } : null;
              this.comms?.send("content_protection", {
                type: "suspicious_scrolling",
                timestamp: Date.now(),
                scrollDelta: i,
                scrollDirection: i > 0 ? "down" : "up",
                targetElement: a
              });
            }
            this.lastScrollTime = n;
          }
          this.comms.send("scroll", i), this.isScrolling = !1;
        }));
      }
    };
  }
  doc() {
    return this.wnd.document.scrollingElement;
  }
  reportProgress() {
    if (!this.comms.ready) return;
    const t = Math.ceil(this.doc().scrollTop), e = this.doc().scrollHeight, i = this.wnd.innerHeight, n = Math.max(0, Math.min(1, t / e)), s = Math.max(0, Math.min(1, (t + i) / e));
    this.comms.send("progress", {
      start: n,
      end: s
    });
  }
  enableScrollProtection() {
    this.patternAnalyzer || (this.patternAnalyzer = new ue(qe), this.isScrollProtectionEnabled = !0, this.comms?.log("Scroll protection enabled"));
  }
  mount(t, e) {
    return this.wnd = t, this.comms = e, this.initialScrollHandled = !1, this.lastScrollTop = 0, this.isResizing = !1, this.resizeDebounce && (this.wnd.clearTimeout(this.resizeDebounce), this.resizeDebounce = null), this.resizeObserver = new ResizeObserver(() => {
      this.resizeDebounce && this.wnd.clearTimeout(this.resizeDebounce), this.isResizing = !0, this.resizeDebounce = this.wnd.setTimeout(() => {
        this.isResizing = !1, this.resizeDebounce = null, this.reportProgress();
      }, 50);
    }), this.resizeObserver.observe(t.document.body), t.addEventListener("scroll", this.handleScroll, { passive: !0 }), e.register("force_webkit_recalc", V.moduleName, () => {
      Xe(this.wnd);
      const i = this.doc().scrollTop;
      i > 1 ? this.doc().scrollTop = i - 1 : this.doc().scrollTop = i + 1, this.doc().scrollTop = i;
    }), e.register("go_progression", V.moduleName, (i, n) => {
      const s = i;
      if (s < 0 || s > 1) {
        e.send("error", {
          message: "go_progression must be given a position from 0.0 to 1.0"
        }), n(!1);
        return;
      }
      this.wnd.requestAnimationFrame(() => {
        this.doc().scrollTop = this.doc().offsetHeight * s, this.reportProgress(), T(this.wnd), n(!0);
      });
    }), e.register("go_id", V.moduleName, (i, n) => {
      const s = t.document.getElementById(i);
      if (!s) {
        n(!1);
        return;
      }
      this.wnd.requestAnimationFrame(() => {
        this.doc().scrollTop = s.getBoundingClientRect().top + t.scrollY - t.innerHeight / 2, this.reportProgress(), T(this.wnd), n(!0);
      });
    }), e.register("go_text", V.moduleName, (i, n) => {
      let s;
      Array.isArray(i) && (i.length > 1 && (s = i[1]), i = i[0]);
      const o = tt.deserialize(i), a = Wt(this.wnd.document, new F({
        href: t.location.href,
        type: "text/html",
        text: o,
        locations: s ? new L({
          otherLocations: /* @__PURE__ */ new Map([
            ["cssSelector", s]
          ])
        }) : void 0
      }));
      if (!a) {
        n(!1);
        return;
      }
      this.wnd.requestAnimationFrame(() => {
        this.doc().scrollTop = a.getBoundingClientRect().top + t.scrollY - t.innerHeight / 2, this.reportProgress(), T(this.wnd), n(!0);
      });
    }), e.register("go_start", V.moduleName, (i, n) => {
      if (this.doc().scrollTop === 0) return n(!1);
      this.doc().scrollTop = 0, this.reportProgress(), n(!0);
    }), e.register("go_end", V.moduleName, (i, n) => {
      if (this.doc().scrollTop === this.doc().scrollHeight - this.doc().offsetHeight) return n(!1);
      this.doc().scrollTop = this.doc().scrollHeight - this.doc().offsetHeight, this.reportProgress(), n(!0);
    }), e.register("unfocus", V.moduleName, (i, n) => {
      T(this.wnd), n(!0);
    }), e.register("scroll_protection", V.moduleName, (i, n) => {
      this.enableScrollProtection(), n(!0);
    }), e.register([
      "go_next",
      "go_prev"
    ], V.moduleName, (i, n) => n(!1)), e.register("focus", V.moduleName, (i, n) => {
      this.reportProgress(), n(!0);
    }), e.register("first_visible_locator", V.moduleName, (i, n) => {
      const s = de(t, !0);
      e.send("first_visible_locator", s.serialize()), n(!0);
    }), e.log("WebPubSnapper Mounted"), !0;
  }
  unmount(t, e) {
    return e.unregisterAll(V.moduleName), this.resizeObserver.disconnect(), this.handleScroll && t.removeEventListener("scroll", this.handleScroll), this.patternAnalyzer && (this.patternAnalyzer.clear(), this.patternAnalyzer = null, this.isScrollProtectionEnabled = !1), e.log("WebPubSnapper Unmounted"), !0;
  }
};
V.moduleName = "webpub_snapper";
let Ae = V;
class zs {
  constructor(t, e) {
    this.window = t, this.copyHistory = [], this.lastSelectionLength = 0, this.lastSelectionTime = 0, this.options = e;
  }
  cleanupOldHistory(t) {
    this.copyHistory = this.copyHistory.filter(
      (i) => t - i.timestamp < 1e4
    ), this.copyHistory.length > this.options.historySize && (this.copyHistory = this.copyHistory.slice(-this.options.historySize));
  }
  isSuspiciousPattern(t) {
    return this.copyHistory.length < 3 ? !1 : this.copyHistory.filter(
      (n) => t - n.timestamp < 2e3
      // Last 2 seconds
    ).length >= 3 ? !0 : this.copyHistory.slice().sort((n, s) => n.timestamp - s.timestamp).every((n, s, o) => s === 0 ? !0 : n.length > o[s - 1].length * 1.5);
  }
  shouldAllowCopy(t) {
    if (!this.options.enabled) return !0;
    const e = this.window.getSelection();
    if (!e) return !0;
    const n = e.toString().length, s = this.window.document.body.innerText.length, o = Date.now();
    if (this.cleanupOldHistory(o), n < this.options.minThreshold)
      return this.copyHistory.push({
        timestamp: o,
        length: n,
        wasBlocked: !1
      }), !0;
    const l = o - this.lastSelectionTime < 100 && n > this.lastSelectionLength * 1.5, d = Math.min(
      s * this.options.maxSelectionPercent,
      this.options.absoluteMaxChars
    ), h = this.isSuspiciousPattern(o), c = n > d || l || h;
    return this.copyHistory.push({
      timestamp: o,
      length: n,
      wasBlocked: c
    }), c ? (t?.preventDefault(), !1) : (this.lastSelectionLength = n, this.lastSelectionTime = o, !0);
  }
  destroy() {
    this.lastSelectionLength = 0, this.lastSelectionTime = 0, this.copyHistory = [], this.options.enabled = !1;
  }
}
class Is {
  constructor(t = vn) {
    this.options = t, this.events = [], this.selectionStartTime = 0, this.lastSelectionTime = 0, this.lastSelectionPosition = 0, this.selectionPatterns = [], this.lastSelectedText = "";
  }
  analyze(t) {
    if (!t)
      return this.clear(), !1;
    const e = t.toString();
    if (e.length === 0)
      return this.clear(), !1;
    if (t.type !== "Range" || !t.rangeCount)
      return !1;
    const i = Date.now();
    if (e.length <= 50 || e === this.lastSelectedText)
      return !1;
    if (this.selectionStartTime === 0)
      return this.selectionStartTime = i, this.lastSelectedText = e, !1;
    if (i - this.selectionStartTime < 500)
      return !1;
    i - this.lastSelectionTime > 1e3 && (this.lastSelectionTime = i), this.selectionStartTime === 0 && (this.selectionStartTime = i), this.lastSelectedText = e;
    const s = this.analyzeSelectionPattern(t, i);
    return this.cleanup(i), s;
  }
  analyzeSelectionPattern(t, e) {
    if (!t.rangeCount) return !1;
    const i = t.getRangeAt(0), n = i.toString(), s = (e - this.selectionStartTime) / 1e3;
    if (n.length / Math.max(1, s) > this.options.maxSelectionsPerSecond) return !0;
    const a = i.startOffset, l = Math.abs(a - this.lastSelectionPosition);
    return this.selectionPatterns.push(l), this.selectionPatterns.length > this.options.historySize && (this.selectionPatterns.shift(), this.calculateVariance(this.selectionPatterns) < this.options.minVariance) ? !0 : (this.lastSelectionPosition = a, !1);
  }
  calculateVariance(t) {
    if (t.length === 0) return 0;
    const e = t.reduce((i, n) => i + n, 0) / t.length;
    return t.reduce((i, n) => i + Math.pow(n - e, 2), 0) / t.length;
  }
  cleanup(t) {
    this.events = this.events.filter((e) => t - e.timestamp <= 1e3);
  }
  clear() {
    this.events = [], this.selectionStartTime = 0, this.lastSelectionTime = 0, this.lastSelectionPosition = 0, this.selectionPatterns = [], this.lastSelectedText = "";
  }
}
class Sn {
  /**
   * Checks if the given keyboard event matches any of the provided key combinations
   */
  match(t, e) {
    for (const i of e)
      if (this.matchesCombo(t, i))
        return !0;
    return !1;
  }
  matchesCombo(t, e) {
    return t.keyCode === e.keyCode && this.matchesModifier(t.ctrlKey, e.ctrl) && this.matchesModifier(t.shiftKey, e.shift) && this.matchesModifier(t.altKey, e.alt) && this.matchesModifier(t.metaKey, e.meta);
  }
  matchesModifier(t, e) {
    return e === void 0 ? !t : t === e;
  }
  /**
   * Creates an event handler that will call the provided handler when any of the key combinations match
   */
  createKeyHandler(t, e) {
    return (i) => {
      this.match(i, t) && (i.preventDefault(), i.stopPropagation(), e(i));
    };
  }
  /**
   * Creates a standardized activity event for keyboard shortcuts
   */
  createActivityEvent(t, e, i, n) {
    let s, o;
    if (n) {
      const a = n.getSelection(), l = a?.toString() || "", h = (l && a?.rangeCount ? a.getRangeAt(0)?.getClientRects() : null)?.[0];
      h && l && (s = {
        text: l,
        x: h.x,
        y: h.y,
        width: h.width,
        height: h.height
      });
      const c = n.document.activeElement;
      c && c !== n.document.body && (o = Ye(c)?.outerHTML);
    }
    return {
      type: e,
      timestamp: Date.now(),
      key: t.key,
      code: t.code,
      keyCode: t.keyCode,
      ctrlKey: t.ctrlKey,
      altKey: t.altKey,
      shiftKey: t.shiftKey,
      metaKey: t.metaKey,
      targetFrameSrc: i,
      selectedText: s,
      interactiveElement: o
    };
  }
  /**
   * Creates handlers for keyboard shortcuts with centralized activity event dispatch
   */
  createKeyboardHandlers(t, e, i, n) {
    const s = [];
    return e.forEach((o) => {
      s.push(...o.keyCombos.map((a) => ({
        ...a,
        handler: (l) => {
          const d = o.type, h = this.createActivityEvent(l, d, t, n);
          i(h);
        }
      })));
    }), s;
  }
  /**
   * Creates a unified keyboard event handler that processes all shortcuts
   */
  createUnifiedHandler(t, e, i, n) {
    const s = this.createKeyboardHandlers(t, e, i, n);
    return (o) => {
      if (o.isTrusted) {
        for (const a of s)
          if (this.match(o, [a])) {
            const l = a.suppressOnInteractiveElement;
            if (l) {
              const d = (n?.document ?? document).activeElement;
              if (Array.isArray(l) ? l.some((h) => d?.matches(h)) : yn(d)) return;
            }
            o.preventDefault(), o.stopPropagation(), a.handler(o);
            return;
          }
      }
    };
  }
}
const ht = class ht extends kt {
  constructor() {
    super(...arguments), this.configApplied = !1, this.cleanupCallbacks = [], this.pointerMoved = !1, this.isContextMenuEnabled = !1, this.isDragAndDropEnabled = !1, this.isSelectionMonitoringEnabled = !1, this.isBulkCopyProtectionEnabled = !1, this.selectionAnalyzer = null, this.currentSelection = null, this.bulkCopyProtector = null, this.keyManager = new Sn(), this.keyDownHandler = null, this.preventBulkCopy = (t) => {
      if (!this.isBulkCopyProtectionEnabled || !this.bulkCopyProtector)
        return !0;
      if (!this.bulkCopyProtector.shouldAllowCopy(t)) {
        t.preventDefault();
        const e = this.wnd.getSelection(), i = e?.toString() || "", s = (i ? e?.getRangeAt(0)?.getClientRects() : null)?.[0], o = {
          type: "bulk_copy",
          timestamp: Date.now(),
          clipboardTypes: t.clipboardData?.types ? [...t.clipboardData.types] : [],
          selectedText: s ? {
            text: i,
            x: s.x,
            y: s.y,
            width: s.width,
            height: s.height
          } : void 0,
          selectionLength: i.length,
          targetFrameSrc: this.wnd.location.href
        };
        return this.comms?.send("content_protection", o), !1;
      }
      return !0;
    }, this.handleSelection = (t) => {
      if (!this.isSelectionMonitoringEnabled || !this.wnd || !this.selectionAnalyzer)
        return;
      const e = this.wnd.getSelection();
      if (e) {
        if (this.currentSelection = e.toString(), this.selectionAnalyzer.analyze(e) && this.currentSelection) {
          const n = this.wnd.getSelection(), s = n?.toString() || "", a = (s && n?.rangeCount ? n.getRangeAt(0)?.getClientRects() : null)?.[0], l = {
            type: "suspicious_selection",
            timestamp: Date.now(),
            selectionLength: s.length,
            selectedText: {
              text: s,
              x: a?.x ?? 0,
              y: a?.y ?? 0,
              width: a?.width ?? 0,
              height: a?.height ?? 0
            },
            eventType: t?.type || "selectionchange",
            targetFrameSrc: this.wnd.location.href
          };
          this.comms?.send("content_protection", l);
        }
      } else
        this.currentSelection = null;
    }, this.onDragOver = (t) => {
      this.isDragAndDropEnabled && (t.preventDefault(), t.stopPropagation());
    }, this.onDragStart = (t) => {
      if (this.isDragAndDropEnabled) {
        t.preventDefault();
        const e = {
          type: "drag_detected",
          timestamp: Date.now(),
          dataTransferTypes: t.dataTransfer?.types ? [...t.dataTransfer.types] : [],
          targetFrameSrc: this.wnd.location.href
        };
        return this.comms?.send("content_protection", e), !1;
      } else
        return !0;
    }, this.onDrop = (t) => {
      if (this.isDragAndDropEnabled) {
        t.preventDefault();
        const e = t.dataTransfer, i = {
          type: "drop_detected",
          timestamp: Date.now(),
          dataTransferTypes: e?.types ? [...e.types] : [],
          fileCount: e?.files?.length || 0,
          targetFrameSrc: this.wnd.location.href
        };
        return this.comms?.send("content_protection", i), !1;
      } else
        return !0;
    }, this.onContext = (t) => {
      if (this.isContextMenuEnabled) {
        t.preventDefault();
        const e = this.wnd.getSelection(), i = e?.toString() || "", s = (i && e?.rangeCount ? e.getRangeAt(0)?.getClientRects() : null)?.[0], o = {
          timestamp: Date.now(),
          clientX: t.clientX,
          clientY: t.clientY,
          ...s && {
            selectedText: {
              text: i,
              x: s.x,
              y: s.y,
              width: s.width,
              height: s.height
            }
          },
          targetFrameSrc: this.wnd.location.href
        };
        this.comms?.send("context_menu", o);
      }
    }, this.onPointerUp = this.onPointUp.bind(this), this.onPointerMove = this.onPointMove.bind(this), this.onPointerDown = this.onPointDown.bind(this), this.onClicker = this.onClick.bind(this);
  }
  addContextMenuPrevention() {
    this.isContextMenuEnabled || !this.wnd || (this.wnd.document.addEventListener("contextmenu", this.onContext), this.isContextMenuEnabled = !0);
  }
  removeContextMenuPrevention() {
    !this.isContextMenuEnabled || !this.wnd || (this.wnd.document.removeEventListener("contextmenu", this.onContext), this.isContextMenuEnabled = !1);
  }
  addDragAndDropPrevention() {
    this.isDragAndDropEnabled || !this.wnd || (this.wnd.document.addEventListener("dragstart", this.onDragStart), this.wnd.document.addEventListener("dragover", this.onDragOver), this.wnd.document.addEventListener("drop", this.onDrop), this.isDragAndDropEnabled = !0);
  }
  removeDragAndDropPrevention() {
    !this.isDragAndDropEnabled || !this.wnd || (this.wnd.document.removeEventListener("dragstart", this.onDragStart), this.wnd.document.removeEventListener("dragover", this.onDragOver), this.wnd.document.removeEventListener("drop", this.onDrop), this.isDragAndDropEnabled = !1);
  }
  enableKeyboardPeripherals(t = []) {
    this.disableKeyboardPeripherals();
    const e = (i) => {
      this.comms?.send("keyboard_peripherals", i);
    };
    this.keyDownHandler = this.keyManager.createUnifiedHandler(this.wnd.location.href, t, e, this.wnd), this.wnd && this.wnd.document.addEventListener("keydown", this.keyDownHandler, {
      capture: !0
    });
  }
  disableKeyboardPeripherals() {
    this.wnd && this.keyDownHandler && (this.wnd.document.removeEventListener("keydown", this.keyDownHandler, {
      capture: !0
    }), this.keyDownHandler = null);
  }
  addBulkCopyProtection(t = {}) {
    if (this.isBulkCopyProtectionEnabled || !this.wnd) return;
    const e = Ms, i = t ? { ...e, ...t } : e;
    this.bulkCopyProtector = new zs(this.wnd, i), this.wnd.document.addEventListener("copy", this.preventBulkCopy, !0), this.wnd.document.addEventListener("cut", this.preventBulkCopy, !0), this.isBulkCopyProtectionEnabled = !0;
  }
  removeBulkCopyProtection() {
    !this.isBulkCopyProtectionEnabled || !this.wnd || (this.wnd.document.removeEventListener("copy", this.preventBulkCopy, !0), this.wnd.document.removeEventListener("cut", this.preventBulkCopy, !0), this.bulkCopyProtector?.destroy(), this.bulkCopyProtector = null, this.isBulkCopyProtectionEnabled = !1);
  }
  addSelectionMonitoring(t) {
    if (this.isSelectionMonitoringEnabled || !this.wnd) return;
    const e = t || vn;
    this.selectionAnalyzer = new Is(e), this.wnd.document.addEventListener("selectionchange", this.handleSelection), this.isSelectionMonitoringEnabled = !0;
  }
  removeSelectionMonitoring() {
    !this.isSelectionMonitoringEnabled || !this.wnd || (this.wnd.document.removeEventListener("selectionchange", this.handleSelection), this.selectionAnalyzer?.clear(), this.selectionAnalyzer = null, this.isSelectionMonitoringEnabled = !1);
  }
  onPointUp(t) {
    if (!this.comms.ready) return;
    const e = this.wnd.getSelection();
    if (e && e.toString()?.length > 0) {
      const n = e.getRangeAt(0)?.getClientRects();
      if (!n || n.length === 0)
        return;
      const s = n[0], o = {
        text: e.toString(),
        x: s.x,
        y: s.y,
        width: s.width,
        height: s.height,
        targetFrameSrc: this.wnd?.location?.href
      };
      this.comms.send("text_selected", o);
    }
    if (this.pointerMoved) {
      this.pointerMoved = !1;
      return;
    }
    if (!e?.isCollapsed || !t.isPrimary) return;
    const i = this.wnd.devicePixelRatio;
    t.preventDefault(), this.comms.send(t.pointerType === "touch" ? "tap" : "click", {
      defaultPrevented: t.defaultPrevented,
      x: t.clientX * i,
      y: t.clientY * i,
      targetFrameSrc: this.wnd.location.href,
      targetElement: t.target.outerHTML,
      interactiveElement: Ye(t.target)?.outerHTML,
      cssSelector: this.wnd._readium_cssSelectorGenerator.getCssSelector(t.target)
    }), this.pointerMoved = !1;
  }
  onPointMove(t) {
    if (t.movementY !== void 0 && t.movementX !== void 0) {
      (Math.abs(t.movementX) > 1 || Math.abs(t.movementY) > 1) && (this.pointerMoved = !0);
      return;
    }
    this.pointerMoved = !0;
  }
  onPointDown() {
    this.pointerMoved = !1;
  }
  onClick(t) {
    if (t.preventDefault(), !t.isTrusted) {
      const e = new PointerEvent("pointerup", {
        isPrimary: !0,
        pointerType: "mouse",
        // Not really a better choice than this
        clientX: t.clientX,
        clientY: t.clientY
      });
      Object.defineProperty(e, "target", { writable: !1, value: t.target }), Object.defineProperty(e, "defaultPrevented", { writable: !1, value: t.defaultPrevented }), this.onPointUp(e);
    }
  }
  registerProtectionHandlers() {
    this.comms?.register("peripherals_protection", ht.moduleName, (t, e) => {
      const i = t;
      if (!this.configApplied) {
        if (this.configApplied = !0, i.monitorSelection) {
          const n = typeof i.monitorSelection == "boolean" ? void 0 : i.monitorSelection;
          this.addSelectionMonitoring(n), this.comms?.log("Selection monitoring enabled");
        }
        typeof i.protectCopy == "object" ? (this.addBulkCopyProtection({
          enabled: !0,
          ...i.protectCopy
        }), this.comms?.log("Copy protection enabled (limited)")) : i.protectCopy === !0 && (this.addBulkCopyProtection({
          enabled: !0,
          maxSelectionPercent: 0,
          minThreshold: 0,
          absoluteMaxChars: 0
        }), this.comms?.log("Copy protection enabled")), i.disableContextMenu && (this.addContextMenuPrevention(), this.comms?.log("Context menu protection enabled")), i.disableDragAndDrop && (this.addDragAndDropPrevention(), this.comms?.log("Drag and drop protection enabled"));
      }
      e(!0);
    }), this.comms?.register("unfocus", ht.moduleName, (t, e) => {
      this.disableKeyboardPeripherals(), e(!0);
    }), this.comms?.register("keyboard_peripherals", ht.moduleName, (t, e) => {
      const i = t;
      i && i.length > 0 && (this.enableKeyboardPeripherals(i), this.comms?.log(`Keyboard peripherals enabled: ${i.map((n) => n.type).join(", ")}`)), e(!0);
    });
  }
  mount(t, e) {
    return this.wnd = t, this.comms = e, this.registerProtectionHandlers(), t.document.addEventListener("pointerdown", this.onPointerDown), t.document.addEventListener("pointerup", this.onPointerUp), t.document.addEventListener("pointermove", this.onPointerMove), t.document.addEventListener("click", this.onClicker), e.log("Peripherals Mounted"), !0;
  }
  unmount(t, e) {
    return this.removeBulkCopyProtection(), this.removeSelectionMonitoring(), this.removeContextMenuPrevention(), this.removeDragAndDropPrevention(), this.disableKeyboardPeripherals(), this.cleanupCallbacks.forEach((i) => i()), this.cleanupCallbacks = [], t.document.removeEventListener("pointerdown", this.onPointerDown), t.document.removeEventListener("pointerup", this.onPointerUp), t.document.removeEventListener("pointermove", this.onPointerMove), t.document.removeEventListener("click", this.onClicker), e.unregisterAll(ht.moduleName), this.configApplied = !1, e.log("Peripherals Unmounted"), !0;
  }
};
ht.moduleName = "peripherals";
let Te = ht;
const Ft = class Ft extends kt {
  constructor() {
    super(...arguments), this.mediaPlayingCount = 0, this.allAnimations = /* @__PURE__ */ new Set();
  }
  wndOnErr(t) {
    this.comms?.send("error", {
      message: t.message,
      filename: t.filename,
      lineno: t.lineno,
      colno: t.colno
    });
  }
  unblock(t) {
    for (t._readium_blockEvents = !1; t._readium_blockedEvents?.length > 0; ) {
      const e = t._readium_blockedEvents.shift();
      switch (e[0]) {
        case 0:
          Reflect.apply(e[1], e[2], e[3]);
          break;
        case 1:
          const i = e[1], n = e[2];
          t.removeEventListener(i.type, t._readium_eventBlocker, !0);
          const s = new Event(i.type, {
            bubbles: i.bubbles,
            cancelable: i.cancelable
          });
          n ? n.dispatchEvent(s) : t.dispatchEvent(s);
          break;
      }
    }
  }
  onMediaPlayEvent() {
    this.mediaPlayingCount++, this.comms?.send("media_play", this.mediaPlayingCount);
  }
  onMediaPauseEvent() {
    this.mediaPlayingCount > 0 && this.mediaPlayingCount--, this.comms?.send("media_pause", this.mediaPlayingCount);
  }
  pauseAllMedia(t) {
    const e = t.document.querySelectorAll("audio,video");
    for (let i = 0; i < e.length; i++)
      e[i].pause();
  }
  mount(t, e) {
    this.comms = e, t.addEventListener(
      "error",
      this.wndOnErr,
      !1
    ), Reflect.defineProperty(t.navigator, "epubReadingSystem", {
      value: {
        name: "readium-ts-toolkit",
        version: "2.6.1",
        hasFeature: (n, s = "") => {
          switch (n) {
            case "dom-manipulation":
              return !0;
            case "layout-changes":
              return !0;
            case "touch-events":
              return !0;
            case "mouse-events":
              return !0;
            case "keyboard-events":
              return !0;
            case "spine-scripting":
              return !0;
            case "embedded-web-content":
              return !0;
            default:
              return !1;
          }
        }
      },
      writable: !1
    }), "getAnimations" in t.document && t.document.getAnimations().forEach((n) => {
      n.cancel(), this.allAnimations.add(n);
    }), e.register("activate", Ft.moduleName, (n, s) => {
      this.allAnimations.forEach((o) => {
        o.cancel(), o.play();
      }), s(!0);
    }), e.register("unfocus", Ft.moduleName, (n, s) => {
      this.pauseAllMedia(t), this.allAnimations.forEach((o) => o.pause()), s(!0);
    });
    const i = t.document.querySelectorAll("audio,video");
    for (let n = 0; n < i.length; n++) {
      const s = i[n];
      s.addEventListener("play", this.onMediaPlayEvent, {
        passive: !0
      }), s.addEventListener("pause", this.onMediaPauseEvent, {
        passive: !0
      });
    }
    return e.log("Setup Mounted"), !0;
  }
  unmount(t, e) {
    return t.removeEventListener("error", this.wndOnErr), t.removeEventListener("play", this.onMediaPlayEvent), t.removeEventListener("pause", this.onMediaPauseEvent), this.allAnimations.forEach((i) => i.cancel()), this.allAnimations.clear(), e.log("Setup Unmounted"), !0;
  }
};
Ft.moduleName = "setup";
let Jt = Ft;
const Ai = "readium-viewport", et = class et extends Jt {
  onViewportWidthChanged(t) {
    const e = t.target;
    zt(e, "--RS__viewportWidth", `${e.innerWidth}px`);
  }
  mount(t, e) {
    if (!super.mount(t, e)) return !1;
    const i = t.document.createElement("meta");
    return i.dataset.readium = "true", i.setAttribute("name", "viewport"), i.setAttribute("id", Ai), i.setAttribute(
      "content",
      "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no"
    ), t.document.head.appendChild(i), t.addEventListener("orientationchange", this.onViewportWidthChanged), t.addEventListener("resize", this.onViewportWidthChanged), this.onViewportWidthChanged({
      target: t
    }), e.register("get_properties", et.moduleName, (n, s) => {
      Ge(t), s(!0);
    }), e.register("update_properties", et.moduleName, (n, s) => {
      n["--RS__viewportWidth"] = `${t.innerWidth}px`, cn(t, n), s(!0);
    }), e.register("set_property", et.moduleName, (n, s) => {
      const o = n;
      zt(t, o[0], o[1]), s(!0);
    }), e.register("remove_property", et.moduleName, (n, s) => {
      ce(t, n), s(!0);
    }), e.register("activate", et.moduleName, (n, s) => {
      this.unblock(t), s(!0);
    }), e.log("ReflowableSetup Mounted"), !0;
  }
  unmount(t, e) {
    return e.unregisterAll(et.moduleName), t.document.head.querySelector(`#${Ai}`)?.remove(), t.removeEventListener("orientationchange", this.onViewportWidthChanged), e.log("ReflowableSetup Unmounted"), super.unmount(t, e);
  }
};
et.moduleName = "reflowable_setup";
let Ne = et;
const Ti = "readium-fixed-style", Z = class Z extends Jt {
  mount(t, e) {
    if (!super.mount(t, e)) return !1;
    t.navigator.epubReadingSystem && (t.navigator.epubReadingSystem.layoutStyle = "paginated");
    const i = t.document.createElement("style");
    return i.id = Ti, i.dataset.readium = "true", i.textContent = `
        html, body {
            text-size-adjust: none;
            -ms-text-size-adjust: none;
            -webkit-text-size-adjust: none;
            -moz-text-size-adjust: none;

            /* Fight Safari pinches */
            touch-action: none !important;
            min-height: 100%;

            /*cursor: var() TODO*/
        }`, t.document.head.appendChild(i), e.register("set_property", Z.moduleName, (n, s) => {
      const o = n;
      zt(t, o[0], o[1]), s(!0);
    }), e.register("remove_property", Z.moduleName, (n, s) => {
      ce(t, n), s(!0);
    }), e.register("first_visible_locator", Z.moduleName, (n, s) => s(!1)), e.register("unfocus", Z.moduleName, (n, s) => {
      T(t), s(!0);
    }), e.register([
      "focus",
      "go_next",
      "go_prev",
      "go_id",
      "go_end",
      "go_start",
      "go_text",
      "go_progression"
    ], Z.moduleName, (n, s) => s(!0)), e.register("activate", Z.moduleName, (n, s) => {
      this.unblock(t), s(!0);
    }), e.log("FixedSetup Mounted"), !0;
  }
  unmount(t, e) {
    return e.unregisterAll(Z.moduleName), t.document.getElementById(Ti)?.remove(), e.log("FixedSetup Unmounted"), super.unmount(t, e);
  }
};
Z.moduleName = "fixed_setup";
let Me = Z;
const it = class it extends kt {
  wndOnErr(t) {
    this.comms?.send("error", {
      message: t.message,
      filename: t.filename,
      lineno: t.lineno,
      colno: t.colno
    });
  }
  mount(t, e) {
    return this.comms = e, t.addEventListener(
      "error",
      this.wndOnErr,
      !1
    ), e.register("get_properties", it.moduleName, (i, n) => {
      Ge(t), n(!0);
    }), e.register("update_properties", it.moduleName, (i, n) => {
      cn(t, i), n(!0);
    }), e.register("set_property", it.moduleName, (i, n) => {
      const s = i;
      zt(t, s[0], s[1]), n(!0);
    }), e.register("remove_property", it.moduleName, (i, n) => {
      ce(t, i), n(!0);
    }), e.register("activate", it.moduleName, (i, n) => {
      n(!0);
    }), e.log("WebPubSetup Mounted"), !0;
  }
  unmount(t, e) {
    return e.unregisterAll(it.moduleName), t.removeEventListener("error", this.wndOnErr), e.log("WebPubSetup Unmounted"), !0;
  }
};
it.moduleName = "webpub_setup";
let Fe = it;
var ot;
let Ds = (ot = class extends kt {
  constructor() {
    super(...arguments), this.styleElement = null, this.beforePrintHandler = null, this.configApplied = !1;
  }
  setupPrintProtection(t, e) {
    if (!e.disable) return;
    const i = t.document.createElement("style");
    i.textContent = `
            @media print {
                body * {
                    display: none !important;
                }
                body::after {
                    content: "${e.watermark || "Printing has been disabled"}";
                    font-size: 200%;
                    display: block;
                    text-align: center;
                    margin-top: 50vh;
                    transform: translateY(-50%);
                }
            }
        `, t.document.head.appendChild(i), this.styleElement = i, this.beforePrintHandler = (n) => (n.preventDefault(), !1), t.addEventListener("beforeprint", this.beforePrintHandler);
  }
  registerPrintHandlers() {
    this.comms?.register("print_protection", ot.moduleName, (t) => {
      const e = t;
      return this.configApplied || (this.configApplied = !0, this.setupPrintProtection(this.wnd, e), this.comms?.log("Print protection configuration applied")), !0;
    });
  }
  mount(t, e) {
    return this.wnd = t, this.comms = e, this.registerPrintHandlers(), !0;
  }
  unmount(t, e) {
    return this.beforePrintHandler && (t.removeEventListener("beforeprint", this.beforePrintHandler), this.beforePrintHandler = null), this.styleElement?.parentNode && (this.styleElement.parentNode.removeChild(this.styleElement), this.styleElement = null), this.comms?.unregisterAll(ot.moduleName), this.configApplied = !1, !0;
  }
}, ot.moduleName = "print_protection", ot);
const Ni = "readium-cjk-vertical-snapper-style", j = class j extends xt {
  constructor() {
    super(...arguments), this.patternAnalyzer = null, this.lastScrollTime = 0, this.isScrollProtectionEnabled = !1, this.initialScrollHandled = !1, this.isScrolling = !1, this.lastScrollLeft = 0, this.isResizing = !1, this.resizeDebounce = null, this.verticalLR = !1, this.handleScroll = (t) => {
      if (this.comms.ready && !this.isResizing) {
        if (!this.initialScrollHandled) {
          this.lastScrollLeft = Math.abs(this.doc().scrollLeft), this.initialScrollHandled = !0, this.reportProgress();
          return;
        }
        this.isScrolling || (this.isScrolling = !0, this.wnd.requestAnimationFrame(() => {
          this.reportProgress();
          const e = Math.abs(this.doc().scrollLeft), i = e - this.lastScrollLeft;
          if (this.lastScrollLeft = e, this.isScrollProtectionEnabled && Math.abs(i) > 5) {
            const n = Date.now(), s = n - (this.lastScrollTime || n);
            if (this.patternAnalyzer && this.patternAnalyzer.analyze(
              // In vertical-rl, norm increases when scrolling forward (toward left/end),
              // so deltaX > 0 = going forward.
              i > 0 ? "down" : "up",
              Math.abs(i),
              s
            )) {
              const a = t.target && "tagName" in t.target ? { tagName: t.target.tagName } : null;
              this.comms?.send("content_protection", {
                type: "suspicious_scrolling",
                timestamp: Date.now(),
                scrollDelta: i,
                scrollDirection: i > 0 ? "left" : "right",
                targetElement: a
              });
            }
            this.lastScrollTime = n;
          }
          this.comms.send("scroll", i), this.isScrolling = !1;
        }));
      }
    };
  }
  doc() {
    return this.wnd.document.scrollingElement;
  }
  /** Total horizontally scrollable distance (magnitude). */
  scrollable() {
    return Math.max(0, this.doc().scrollWidth - this.wnd.innerWidth);
  }
  reportProgress() {
    if (!this.comms.ready) return;
    const t = this.doc().scrollWidth, e = this.wnd.innerWidth, i = Math.max(1, t - e), n = Math.abs(this.doc().scrollLeft), s = Math.max(0, Math.min(1, n / i)), o = Math.max(0, Math.min(1, (n + e) / t));
    this.comms.send("progress", {
      start: s,
      end: o
    });
  }
  enableScrollProtection() {
    this.patternAnalyzer || (this.patternAnalyzer = new ue(qe), this.isScrollProtectionEnabled = !0, this.comms?.log("Scroll protection enabled"));
  }
  mount(t, e) {
    this.wnd = t, this.comms = e, this.initialScrollHandled = !1, this.lastScrollLeft = 0, this.isResizing = !1, this.verticalLR = un(t), this.resizeDebounce && (this.wnd.clearTimeout(this.resizeDebounce), this.resizeDebounce = null), t.navigator.epubReadingSystem && (t.navigator.epubReadingSystem.layoutStyle = "scrolling");
    const i = t.document.createElement("style");
    return i.dataset.readium = "true", i.id = Ni, i.textContent = `
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
        `, t.document.head.appendChild(i), this.resizeObserver = new ResizeObserver(() => {
      this.resizeDebounce && this.wnd.clearTimeout(this.resizeDebounce), this.isResizing = !0, this.resizeDebounce = this.wnd.setTimeout(() => {
        this.isResizing = !1, this.resizeDebounce = null, this.reportProgress();
      }, 50);
    }), this.resizeObserver.observe(t.document.body), t.addEventListener("scroll", this.handleScroll, { passive: !0 }), e.register("force_webkit_recalc", j.moduleName, () => {
      Xe(this.wnd);
      const n = this.doc().scrollLeft;
      this.verticalLR ? this.doc().scrollLeft = n > 1 ? n - 1 : n + 1 : this.doc().scrollLeft = n < -1 ? n + 1 : n - 1, this.doc().scrollLeft = n;
    }), e.register("go_progression", j.moduleName, (n, s) => {
      const o = n;
      if (o < 0 || o > 1) {
        e.send("error", {
          message: "go_progression must be given a position from 0.0 to 1.0"
        }), s(!1);
        return;
      }
      this.wnd.requestAnimationFrame(() => {
        const a = this.scrollable() * o;
        this.doc().scrollLeft = this.verticalLR ? a : -a, this.reportProgress(), T(this.wnd), s(!0);
      });
    }), e.register("go_id", j.moduleName, (n, s) => {
      const o = t.document.getElementById(n);
      if (!o) {
        s(!1);
        return;
      }
      this.wnd.requestAnimationFrame(() => {
        this.doc().scrollLeft += o.getBoundingClientRect().left - t.innerWidth / 2, this.reportProgress(), T(this.wnd), s(!0);
      });
    }), e.register("go_text", j.moduleName, (n, s) => {
      let o;
      Array.isArray(n) && (n.length > 1 && (o = n[1]), n = n[0]);
      const a = tt.deserialize(n), l = Wt(this.wnd.document, new F({
        href: t.location.href,
        type: "text/html",
        text: a,
        locations: o ? new L({
          otherLocations: /* @__PURE__ */ new Map([["cssSelector", o]])
        }) : void 0
      }));
      if (!l) {
        s(!1);
        return;
      }
      this.wnd.requestAnimationFrame(() => {
        this.doc().scrollLeft += l.getBoundingClientRect().left - t.innerWidth / 2, this.reportProgress(), T(this.wnd), s(!0);
      });
    }), e.register("go_start", j.moduleName, (n, s) => {
      if (this.doc().scrollLeft === 0) return s(!1);
      this.doc().scrollLeft = 0, this.reportProgress(), s(!0);
    }), e.register("go_end", j.moduleName, (n, s) => {
      if (Math.abs(this.doc().scrollLeft) === this.scrollable()) return s(!1);
      this.doc().scrollLeft = this.verticalLR ? this.scrollable() : -this.scrollable(), this.reportProgress(), s(!0);
    }), e.register([
      "go_next",
      "go_prev"
    ], j.moduleName, (n, s) => s(!1)), e.register("unfocus", j.moduleName, (n, s) => {
      T(this.wnd), s(!0);
    }), e.register("scroll_protection", j.moduleName, (n, s) => {
      this.enableScrollProtection(), s(!0);
    }), e.register("focus", j.moduleName, (n, s) => {
      this.reportProgress(), s(!0);
    }), e.register("first_visible_locator", j.moduleName, (n, s) => {
      const o = de(t, !0);
      this.comms.send("first_visible_locator", o.serialize()), s(!0);
    }), e.log("CJKVerticalSnapper Mounted"), !0;
  }
  unmount(t, e) {
    return e.unregisterAll(j.moduleName), this.resizeObserver.disconnect(), this.handleScroll && t.removeEventListener("scroll", this.handleScroll), t.document.getElementById(Ni)?.remove(), this.patternAnalyzer && (this.patternAnalyzer.clear(), this.patternAnalyzer = null, this.isScrollProtectionEnabled = !1), e.log("CJKVerticalSnapper Unmounted"), !0;
  }
};
j.moduleName = "cjk_vertical_snapper";
let ze = j;
const Us = [
  "fixed_setup",
  "decorator",
  "peripherals",
  "print_protection"
], Hs = [
  "reflowable_setup",
  "decorator",
  "peripherals",
  "column_snapper",
  "scroll_snapper",
  "cjk_vertical_snapper",
  "print_protection"
], Ws = [
  "webpub_setup",
  "webpub_snapper",
  "decorator",
  "peripherals",
  "print_protection"
], Ie = new Map([
  // All modules go here
  Me,
  Ne,
  Fe,
  Ae,
  Te,
  ke,
  Oe,
  Re,
  ze,
  Ds
].map((r) => [r.moduleName, r]));
class Lt {
  /**
   * @param wnd Window instance to operate on
   * @param initialModules List of initial modules to load
   */
  constructor(t = window, e = []) {
    this.loadedModules = [], this.wnd = t, this.comms = new qn(t);
    const i = [...new Set(e)];
    if (i.length) {
      if (typeof t > "u")
        throw Error("Loader is not in a web browser");
      t.parent !== t && this.comms.log("Loader is probably in a frame"), this.loadedModules = i.map((n) => {
        const s = this.loadModule(n);
        if (s)
          return s.mount(this.wnd, this.comms), s;
      }).filter((n) => n !== void 0);
    }
  }
  loadModule(t) {
    const e = Ie.get(t);
    return e === void 0 ? (this.comms.log(`Module "${name}" does not exist in the library`), e) : new e();
  }
  /**
   * Add a module by name
   * @param moduleName Module name
   * @returns Success
   */
  addModule(t) {
    const e = this.loadModule(t);
    return !e || !e.mount(this.wnd, this.comms) ? !1 : (this.loadedModules.push(e), !0);
  }
  /**
   * Remove a module by name
   * @param moduleName Module name
   * @returns Success
   */
  removeModule(t) {
    const e = Ie.get(t);
    if (e === void 0)
      return this.comms.log(`Module "${t}" does not exist in the library`), !1;
    const i = this.loadedModules.findIndex((n) => n instanceof e);
    return i < 0 ? !1 : (this.loadedModules[i].unmount(this.wnd, this.comms), this.loadedModules.splice(i, 1), !0);
  }
  /**
   * Unmount and remove all modules
   */
  destroy() {
    this.comms.destroy(), this.loadedModules.forEach((t) => t.unmount(this.wnd, this.comms)), this.loadedModules = [];
  }
}
const Bs = {
  type: "developer_tools",
  keyCombos: [
    { keyCode: 73, meta: !0, alt: !0 },
    // Cmd+Option+I
    { keyCode: 73, ctrl: !0, shift: !0 },
    // Ctrl+Shift+I
    { keyCode: 74, meta: !0, alt: !0 },
    // Cmd+Option+J
    { keyCode: 74, ctrl: !0, shift: !0 },
    // Ctrl+Shift+J
    { keyCode: 85, meta: !0, alt: !0 },
    // Cmd+Option+U
    { keyCode: 67, meta: !0, alt: !0 },
    // Cmd+Option+C
    { keyCode: 67, meta: !0, shift: !0 },
    // Cmd+Shift+C
    { keyCode: 67, ctrl: !0, shift: !0 },
    // Ctrl+Shift+C
    { keyCode: 65, meta: !0, alt: !0 },
    // Cmd+Option+A
    { keyCode: 84, meta: !0, shift: !0, alt: !0 },
    // Cmd+Shift+Option+T
    { keyCode: 67, shift: !0, alt: !0 },
    // Shift+Option+C
    { keyCode: 123 },
    // F12
    { keyCode: 123, shift: !0 },
    // Shift+F12
    { keyCode: 123, ctrl: !0, shift: !0 },
    // Ctrl+Shift+F12
    { keyCode: 123, meta: !0, alt: !0 }
    // Cmd+Option+F12
  ]
}, Vs = {
  type: "select_all",
  keyCombos: [
    { keyCode: 65, meta: !0 },
    // Cmd+A
    { keyCode: 65, ctrl: !0 }
    // Ctrl+A
  ]
}, js = {
  type: "print",
  keyCombos: [
    { keyCode: 80, meta: !0 },
    // Cmd+P
    { keyCode: 80, ctrl: !0 },
    // Ctrl+P
    { keyCode: 80, meta: !0, shift: !0 },
    // Cmd+Shift+P
    { keyCode: 80, ctrl: !0, shift: !0 },
    // Ctrl+Shift+P
    { keyCode: 80, meta: !0, alt: !0 },
    // Cmd+Alt+P
    { keyCode: 80, ctrl: !0, alt: !0 }
    // Ctrl+Alt+P
  ]
}, $s = {
  type: "save",
  keyCombos: [
    { keyCode: 83, meta: !0 },
    // Cmd+S
    { keyCode: 83, ctrl: !0 }
    // Ctrl+S
  ]
};
class wn {
  /**
   * Merges keyboard peripherals from content protection config with user-provided peripherals
   * Content protection peripherals are added first for priority, then user peripherals are added only if they don't conflict
   */
  mergeKeyboardPeripherals(t, e = []) {
    const i = [], n = e.filter(
      (s) => !["developer_tools", "select_all", "print", "save"].includes(s.type)
    );
    t.disableSelectAll && i.push(Vs), t.disableSave && i.push($s), t.monitorDevTools && i.push(Bs), t.protectPrinting?.disable && i.push(js);
    for (const s of n) {
      const o = s.keyCombos.filter(
        (a) => !i.some(
          (l) => l.keyCombos.some(
            (d) => a.keyCode === d.keyCode && a.ctrl === d.ctrl && a.shift === d.shift && a.alt === d.alt && a.meta === d.meta
          )
        )
      );
      o.length > 0 && i.push({
        ...s,
        keyCombos: o
      });
    }
    return i;
  }
}
class Pn extends wn {
  /**
   * Moves to the left content portion (eg. page) relative to the reading progression direction.
   */
  goLeft(t = !1, e) {
    this.readingProgression === I.ltr ? this.goBackward(t, e) : this.readingProgression === I.rtl && this.goForward(t, e);
  }
  /**
   * Moves to the right content portion (eg. page) relative to the reading progression direction.
   */
  goRight(t = !1, e) {
    this.readingProgression === I.ltr ? this.goForward(t, e) : this.readingProgression === I.rtl && this.goBackward(t, e);
  }
}
class Gs extends wn {
}
function Pt(r, t) {
  const { style: e } = r;
  if (e.type === _.Template) {
    const i = e;
    return { ...r, style: { ...i, element: i.element(r) } };
  }
  if (e.type && t?.[e.type]) {
    const i = t[e.type];
    return {
      ...r,
      style: {
        type: _.Template,
        layout: i.layout,
        width: i.width,
        stylesheet: i.stylesheet,
        isActive: e.isActive,
        element: i.element(r)
      }
    };
  }
  return r;
}
function Xs(r, t) {
  if (r.type !== t.type || (r.isActive ?? !1) !== (t.isActive ?? !1)) return !1;
  if (r.type === _.Template) {
    const n = r, s = t;
    return n.layout === s.layout && n.width === s.width && n.stylesheet === s.stylesheet;
  }
  const e = r, i = t;
  return e.tint === i.tint && e.layout === i.layout && e.width === i.width && (e.enforceContrast ?? !0) === (i.enforceContrast ?? !0);
}
function Mi(r) {
  return typeof r?.serialize == "function" ? r.serialize() : r;
}
function En(r, t) {
  return r.locator.href === t.locator.href && JSON.stringify(Mi(r.locator.locations)) === JSON.stringify(Mi(t.locator.locations)) && Xs(r.style, t.style) && JSON.stringify(r.extras ?? null) === JSON.stringify(t.extras ?? null);
}
const Cn = /* @__PURE__ */ new Set([
  _.Highlight,
  _.Underline,
  _.Outline,
  _.TextColor,
  _.Mask,
  _.Template
]);
class Ys {
  constructor(t, e, i, n) {
    this.injector = null, this.pub = t, this.item = i, this.burl = i.toURL(e) || "", this.cssProperties = n.cssProperties, this.injector = n.injector ?? null;
  }
  async build() {
    if (!this.item.mediaType.isHTML)
      throw new Error(`Unsupported media type for WebPub: ${this.item.mediaType.string}`);
    return await this.buildHtmlFrame();
  }
  async buildHtmlFrame() {
    const t = await this.pub.get(this.item).readAsString();
    if (!t) throw new Error(`Failed reading item ${this.item.href}`);
    const e = new DOMParser().parseFromString(
      t,
      this.item.mediaType.string
    ), i = e.querySelector("parsererror");
    if (i) {
      const n = i.querySelector("div");
      throw new Error(`Failed parsing item ${this.item.href}: ${n?.textContent || i.textContent}`);
    }
    return this.injector && await this.injector.injectForDocument(e, this.item), this.finalizeDOM(e, this.burl, this.item.mediaType, t, this.cssProperties);
  }
  setProperties(t, e) {
    for (const i in t) {
      const n = t[i];
      n && e.documentElement.style.setProperty(i, n);
    }
  }
  finalizeDOM(t, e, i, n, s) {
    if (!t) return "";
    if (s && this.setProperties(s, t), t.body.querySelectorAll("img").forEach((a) => {
      a.setAttribute("fetchpriority", "high");
    }), e !== void 0) {
      const a = t.createElement("base");
      a.href = e, a.dataset.readium = "true", t.head.firstChild.before(a);
    }
    let o;
    return i.string === "application/xhtml+xml" ? o = new XMLSerializer().serializeToString(t) : o = this.serializeAsHTML(t, n || ""), URL.createObjectURL(
      new Blob([o], {
        type: i.isHTML ? i.string : "application/xhtml+xml"
      })
    );
  }
  serializeAsHTML(t, e) {
    const i = e.match(/<!DOCTYPE[^>]*>/i), n = i ? i[0] + `
` : "";
    let o = t.documentElement.outerHTML;
    return n + o;
  }
}
const qs = 1e4;
class Dt {
  constructor(t, e) {
    this.registry = /* @__PURE__ */ new Map(), this._ready = !1, this.listenerBuffer = [], this.handler = this.handle.bind(this), this.wnd = t, this.origin = e;
    try {
      this.channelId = window.crypto.randomUUID();
    } catch {
      this.channelId = _e();
    }
    this.gc = setInterval(() => {
      this.registry.forEach((i, n) => {
        performance.now() - i.time > qs && (console.warn(n, "event for", i.key, "was never handled!"), this.registry.delete(n));
      });
    }, 5e3), window.addEventListener("message", this.handler), this.startHandshake();
  }
  startHandshake() {
    window.clearInterval(this.pingTimer), this._ready = !1, this.send("_ping", void 0), this.pingTimer = window.setInterval(() => {
      this._ready ? window.clearInterval(this.pingTimer) : this.send("_ping", void 0);
    }, 50);
  }
  set listener(t) {
    this.listenerBuffer.length > 0 && this.listenerBuffer.forEach((e) => t(e[0], e[1])), this.listenerBuffer = [], this._listener = t;
  }
  clearListener() {
    typeof this._listener == "function" && (this._listener = void 0);
  }
  forget(t) {
    this.registry.delete(t);
  }
  halt() {
    this._ready = !1, window.clearInterval(this.pingTimer), window.removeEventListener("message", this.handler), clearInterval(this.gc), this._listener = void 0, this.registry.clear();
  }
  resume() {
    window.addEventListener("message", this.handler), this._ready = !0;
  }
  handle(t) {
    const e = t.data;
    if (e === null || typeof e != "object" || !e._readium) {
      console.warn("Ignoring", e);
      return;
    }
    if (e._channel === this.channelId)
      switch (e.key) {
        case "_ack": {
          if (!e.id) return;
          const i = this.registry.get(e.id);
          if (!i) return;
          const n = i.key === "go_next" || i.key === "go_prev" ? e.data !== null && typeof e.data == "object" ? { ...e.data, transport: e.data.transport ?? "postMessage" } : e.data : e.data;
          this.registry.delete(e.id), i.cb(n, "postMessage");
          return;
        }
        // @ts-ignore
      case "_pong":
        this._ready = !0, window.clearInterval(this.pingTimer);
        default: {
          if (!this.ready) return;
          typeof this._listener == "function" ? this._listener(e.key, e.data) : this.listenerBuffer.push([e.key, e.data]);
        }
      }
  }
  get ready() {
    return this._ready;
  }
  /**
   * Send a message to the window using postMessage-based comms communication
   * @returns Identifier associated with the message
   */
  send(t, e, i, n = !1, s = []) {
    const o = _e();
    if (this.ready && typeof i == "function" && (t === "go_next" || t === "go_prev")) {
      let a;
      try {
        if (!this.wnd.frameElement?.isConnected) throw new Error("Direct turn target is detached");
        const l = this.wnd[READIUM_DIRECT_TURN_BRIDGE_V1];
        typeof l == "function" && (a = l(this.channelId, t, e));
      } catch {
      }
      if (a !== null && typeof a == "object" && a._readium === yt && a._channel === this.channelId && a.key === "_ack")
        return i?.(a.data, "direct"), o;
    }
    return i && this.registry.set(o, {
      // Add callback to the registry
      cb: i,
      time: performance.now(),
      key: t
    }), this.wnd.postMessage(
      {
        _readium: yt,
        _channel: this.channelId,
        id: o,
        data: e,
        key: t,
        strict: n
      },
      "/",
      // Same origin
      s
    ), o;
  }
}
class Ke {
  constructor(t, e) {
    this.config = t, this.onUpdate = e, this.unsubs = [], this.conditionValues = /* @__PURE__ */ new Map();
  }
  setup() {
    let t = !0;
    this.config.forEach(
      (e) => e.keyCombos.forEach((i) => {
        if (i.condition) {
          const n = i.condition.subscribe((s) => {
            this.conditionValues.set(i, s), t || this.onUpdate(this.buildSerializable());
          });
          this.unsubs.push(n);
        }
      })
    ), t = !1, this.onUpdate(this.buildSerializable());
  }
  buildSerializable() {
    return this.config.map((t) => ({
      ...t,
      keyCombos: t.keyCombos.filter((e) => !e.condition || this.conditionValues.get(e) === !0).map(({ condition: e, ...i }) => i)
    })).filter((t) => t.keyCombos.length > 0);
  }
  destroy() {
    this.unsubs.forEach((t) => t()), this.unsubs = [], this.conditionValues.clear();
  }
}
class Ks {
  constructor(t, e = {}, i = []) {
    this.hidden = !0, this.destroyed = !1, this.currModules = [], this.frame = document.createElement("iframe"), this.frame.classList.add("readium-navigator-iframe"), this.frame.style.visibility = "hidden", this.frame.style.setProperty("aria-hidden", "true"), this.frame.style.opacity = "0", this.frame.style.position = "absolute", this.frame.style.pointerEvents = "none", this.frame.style.transition = "visibility 0s, opacity 0.1s linear", this.frame.style.backgroundColor = "#FFFFFF", this.source = t, this.contentProtectionConfig = { ...e }, this.keyboardPeripheralsConfig = [...i];
  }
  async load(t = []) {
    return new Promise((e, i) => {
      if (this.loader) {
        const n = this.frame.contentWindow;
        if ([...this.currModules].sort().join("|") === [...t].sort().join("|")) {
          try {
            e(n);
          } catch {
          }
          return;
        }
        this.comms?.halt(), this.loader.destroy(), this.loader = new Lt(n, t), this.currModules = t, this.comms = void 0;
        try {
          e(n);
        } catch {
        }
        return;
      }
      this.frame.onload = () => {
        const n = this.frame.contentWindow;
        this.loader = new Lt(n, t), this.currModules = t;
        try {
          e(n);
        } catch {
        }
      }, this.frame.onerror = (n) => {
        try {
          i(n);
        } catch {
        }
      }, this.frame.contentWindow.location.replace(this.source);
    });
  }
  applyContentProtection() {
    this.comms || this.comms.resume(), this.comms.send("peripherals_protection", this.contentProtectionConfig), this.keyboardPeripheralsConfig && this.keyboardPeripheralsConfig.length > 0 && (this.conditionBridge?.destroy(), this.conditionBridge = new Ke(
      this.keyboardPeripheralsConfig,
      (t) => {
        t.length > 0 && this.comms.send("keyboard_peripherals", t);
      }
    ), this.conditionBridge.setup()), this.contentProtectionConfig.monitorScrollingExperimental && this.comms.send("scroll_protection", {}), this.contentProtectionConfig.protectPrinting?.disable && this.comms.send("print_protection", this.contentProtectionConfig.protectPrinting);
  }
  async destroy() {
    this.conditionBridge?.destroy(), await this.hide(), this.loader?.destroy(), this.frame.remove(), this.destroyed = !0;
  }
  async hide() {
    if (!this.destroyed) {
      if (this.frame.style.visibility = "hidden", this.frame.style.setProperty("aria-hidden", "true"), this.frame.style.opacity = "0", this.frame.style.pointerEvents = "none", this.hidden = !0, this.frame.parentElement)
        return this.comms === void 0 || !this.comms.ready ? void 0 : new Promise((t) => {
          const e = this.comms;
          let i = !1, n;
          const s = () => {
            i || (i = !0, window.clearTimeout(o), this.comms === e && this.hidden ? e?.halt() : n && e?.forget(n), t());
          }, o = window.setTimeout(s, 250);
          n = e?.send("unfocus", void 0, s);
        });
      this.comms?.halt();
    }
  }
  async show(t) {
    if (this.destroyed) throw Error("Trying to show frame when it doesn't exist");
    if (!this.frame.parentElement) throw Error("Trying to show frame that is not attached to the DOM");
    return this.comms ? this.comms.resume() : this.comms = new Dt(this.frame.contentWindow, this.source), new Promise((e, i) => {
      this.comms?.send("activate", void 0, () => {
        if (t !== void 0 && this.currModules.includes("column_snapper")) {
          this.comms?.send("focus_progression", t, () => {
            this.applyContentProtection();
            this.frame.style.removeProperty("visibility"), this.frame.style.removeProperty("aria-hidden"), this.frame.style.removeProperty("opacity"), this.frame.style.removeProperty("pointer-events"), this.hidden = !1, e();
          });
          return;
        }
        this.comms?.send("focus", void 0, () => {
          this.applyContentProtection();
          const n = () => {
            this.frame.style.removeProperty("visibility"), this.frame.style.removeProperty("aria-hidden"), this.frame.style.removeProperty("opacity"), this.frame.style.removeProperty("pointer-events"), this.hidden = !1, X.UA.WebKit && this.comms?.send("force_webkit_recalc", void 0), e();
          };
          t !== void 0 ? this.comms?.send("go_progression", t, n) : n();
        });
      });
    });
  }
  setCSSProperties(t) {
    this.destroyed || !this.frame.contentWindow || (this.hidden && (this.comms ? this.comms?.resume() : this.comms = new Dt(this.frame.contentWindow, this.source)), this.comms?.send("update_properties", t), this.hidden && this.comms?.halt());
  }
  get iframe() {
    if (this.destroyed) throw Error("Trying to use frame when it doesn't exist");
    return this.frame;
  }
  get realSize() {
    if (this.destroyed) throw Error("Trying to use frame client rect when it doesn't exist");
    return this.frame.getBoundingClientRect();
  }
  get window() {
    if (this.destroyed || !this.frame.contentWindow) throw Error("Trying to use frame window when it doesn't exist");
    return this.frame.contentWindow;
  }
  get msg() {
    return this.comms;
  }
  get ldr() {
    return this.loader;
  }
}
class Js {
  constructor(t, e, i, n = {}, s = []) {
    this.pool = /* @__PURE__ */ new Map(), this.blobs = /* @__PURE__ */ new Map(), this.inprogress = /* @__PURE__ */ new Map(), this.pendingUpdates = /* @__PURE__ */ new Map(), this.injector = null, this.container = t, this.currentCssProperties = e, this.injector = i, this.contentProtectionConfig = n, this.keyboardPeripheralsConfig = [...s];
  }
  async destroy() {
    let t = this.inprogress.values(), e = t.next();
    const i = [];
    for (; e.value; )
      i.push(e.value), e = t.next();
    i.length > 0 && await Promise.allSettled(i), this.inprogress.clear();
    let n = this.pool.values(), s = n.next();
    for (; s.value; )
      await s.value.destroy(), s = n.next();
    this.pool.clear(), this.blobs.forEach((o) => {
      this.injector?.releaseBlobUrl?.(o), URL.revokeObjectURL(o);
    }), this.blobs.clear(), this.injector?.dispose(), this.container.childNodes.forEach((o) => {
      (o.nodeType === Node.ELEMENT_NODE || o.nodeType === Node.TEXT_NODE) && o.remove();
    });
  }
  async update(t, e, i) {
    const n = t.readingOrder.items;
    let s = n.findIndex((l) => l.href === e.href);
    if (s < 0) throw Error(`Locator not found in reading order: ${e.href}`);
    const o = n[s].href;
    this.inprogress.has(o) && await this.inprogress.get(o);
    const a = new Promise(async (l, d) => {
      const h = [], c = [];
      t.readingOrder.items.forEach((p, f) => {
        f !== s && f !== s - 1 && f !== s + 1 && (h.includes(p.href) || h.push(p.href)), f === s && (c.includes(p.href) || c.push(p.href));
      }), h.forEach(async (p) => {
        c.includes(p) || this.pool.has(p) && (await this.pool.get(p)?.destroy(), this.pool.delete(p));
      }), this.currentBaseURL !== void 0 && t.baseURL !== this.currentBaseURL && (this.blobs.forEach((p) => {
        this.injector?.releaseBlobUrl?.(p), URL.revokeObjectURL(p);
      }), this.blobs.clear()), this.currentBaseURL = t.baseURL;
      const u = async (p) => {
        if (this.pendingUpdates.has(p) && this.pendingUpdates.get(p)?.inPool === !1) {
          const S = this.blobs.get(p);
          S && (this.injector?.releaseBlobUrl?.(S), URL.revokeObjectURL(S), this.blobs.delete(p), this.pendingUpdates.delete(p));
        }
        if (this.pool.has(p)) {
          const S = this.pool.get(p);
          if (!this.blobs.has(p))
            await S.destroy(), this.pool.delete(p), this.pendingUpdates.delete(p);
          else {
            await S.load(i);
            return;
          }
        }
        const f = t.readingOrder.findWithHref(p);
        if (!f) return;
        if (!this.blobs.has(p)) {
          const C = await new Ys(
            t,
            this.currentBaseURL || "",
            f,
            {
              cssProperties: this.currentCssProperties,
              injector: this.injector
            }
          ).build();
          this.blobs.set(p, C);
        }
        const b = new Ks(this.blobs.get(p), this.contentProtectionConfig, this.keyboardPeripheralsConfig);
        p !== o && await b.hide(), this.container.appendChild(b.iframe), await b.load(i), this.pool.set(p, b);
      };
      try {
        await Promise.all(c.map((p) => u(p)));
      } catch (p) {
        d(p);
      }
      const m = this.pool.get(o);
      if (m?.source !== this._currentFrame?.source && (await this._currentFrame?.hide(), m && await m.load(i), m && await m.show(e.locations.progression), this._currentFrame = m, m)) {
        const p = this.container.ownerDocument.activeElement;
        p && p.tagName === "IFRAME" && p !== m.iframe && m.iframe.focus({ preventScroll: !0 });
      }
      l();
    });
    this.inprogress.set(o, a), await a, this.inprogress.delete(o);
  }
  setCSSProperties(t) {
    if (!((i, n) => {
      const s = Object.keys(i), o = Object.keys(n);
      if (s.length !== o.length)
        return !1;
      for (const a of s)
        if (i[a] !== n[a])
          return !1;
      return !0;
    })(this.currentCssProperties || {}, t)) {
      this.currentCssProperties = t, this.pool.forEach((i) => {
        i.setCSSProperties(t);
      });
      for (const i of this.blobs.keys())
        this.pendingUpdates.set(i, { inPool: this.pool.has(i) });
    }
  }
  get currentFrames() {
    return [this._currentFrame];
  }
  get currentBounds() {
    const t = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      toJSON() {
        return this;
      }
    };
    return this.currentFrames.forEach((e) => {
      if (!e) return;
      const i = e.realSize;
      t.x = Math.min(t.x, i.x), t.y = Math.min(t.y, i.y), t.width += i.width, t.height = Math.max(t.height, i.height), t.top = Math.min(t.top, i.top), t.right = Math.min(t.right, i.right), t.bottom = Math.min(t.bottom, i.bottom), t.left = Math.min(t.left, i.left);
    }), t;
  }
}
var we, Fi;
function Zs() {
  if (Fi) return we;
  Fi = 1;
  function r(n) {
    if (typeof n != "string")
      throw new TypeError("Path must be a string. Received " + JSON.stringify(n));
  }
  function t(n, s) {
    for (var o = "", a = 0, l = -1, d = 0, h, c = 0; c <= n.length; ++c) {
      if (c < n.length)
        h = n.charCodeAt(c);
      else {
        if (h === 47)
          break;
        h = 47;
      }
      if (h === 47) {
        if (!(l === c - 1 || d === 1)) if (l !== c - 1 && d === 2) {
          if (o.length < 2 || a !== 2 || o.charCodeAt(o.length - 1) !== 46 || o.charCodeAt(o.length - 2) !== 46) {
            if (o.length > 2) {
              var u = o.lastIndexOf("/");
              if (u !== o.length - 1) {
                u === -1 ? (o = "", a = 0) : (o = o.slice(0, u), a = o.length - 1 - o.lastIndexOf("/")), l = c, d = 0;
                continue;
              }
            } else if (o.length === 2 || o.length === 1) {
              o = "", a = 0, l = c, d = 0;
              continue;
            }
          }
          s && (o.length > 0 ? o += "/.." : o = "..", a = 2);
        } else
          o.length > 0 ? o += "/" + n.slice(l + 1, c) : o = n.slice(l + 1, c), a = c - l - 1;
        l = c, d = 0;
      } else h === 46 && d !== -1 ? ++d : d = -1;
    }
    return o;
  }
  function e(n, s) {
    var o = s.dir || s.root, a = s.base || (s.name || "") + (s.ext || "");
    return o ? o === s.root ? o + a : o + n + a : a;
  }
  var i = {
    // path.resolve([from ...], to)
    resolve: function() {
      for (var s = "", o = !1, a, l = arguments.length - 1; l >= -1 && !o; l--) {
        var d;
        l >= 0 ? d = arguments[l] : (a === void 0 && (a = process.cwd()), d = a), r(d), d.length !== 0 && (s = d + "/" + s, o = d.charCodeAt(0) === 47);
      }
      return s = t(s, !o), o ? s.length > 0 ? "/" + s : "/" : s.length > 0 ? s : ".";
    },
    normalize: function(s) {
      if (r(s), s.length === 0) return ".";
      var o = s.charCodeAt(0) === 47, a = s.charCodeAt(s.length - 1) === 47;
      return s = t(s, !o), s.length === 0 && !o && (s = "."), s.length > 0 && a && (s += "/"), o ? "/" + s : s;
    },
    isAbsolute: function(s) {
      return r(s), s.length > 0 && s.charCodeAt(0) === 47;
    },
    join: function() {
      if (arguments.length === 0)
        return ".";
      for (var s, o = 0; o < arguments.length; ++o) {
        var a = arguments[o];
        r(a), a.length > 0 && (s === void 0 ? s = a : s += "/" + a);
      }
      return s === void 0 ? "." : i.normalize(s);
    },
    relative: function(s, o) {
      if (r(s), r(o), s === o || (s = i.resolve(s), o = i.resolve(o), s === o)) return "";
      for (var a = 1; a < s.length && s.charCodeAt(a) === 47; ++a)
        ;
      for (var l = s.length, d = l - a, h = 1; h < o.length && o.charCodeAt(h) === 47; ++h)
        ;
      for (var c = o.length, u = c - h, m = d < u ? d : u, p = -1, f = 0; f <= m; ++f) {
        if (f === m) {
          if (u > m) {
            if (o.charCodeAt(h + f) === 47)
              return o.slice(h + f + 1);
            if (f === 0)
              return o.slice(h + f);
          } else d > m && (s.charCodeAt(a + f) === 47 ? p = f : f === 0 && (p = 0));
          break;
        }
        var b = s.charCodeAt(a + f), S = o.charCodeAt(h + f);
        if (b !== S)
          break;
        b === 47 && (p = f);
      }
      var C = "";
      for (f = a + p + 1; f <= l; ++f)
        (f === l || s.charCodeAt(f) === 47) && (C.length === 0 ? C += ".." : C += "/..");
      return C.length > 0 ? C + o.slice(h + p) : (h += p, o.charCodeAt(h) === 47 && ++h, o.slice(h));
    },
    _makeLong: function(s) {
      return s;
    },
    dirname: function(s) {
      if (r(s), s.length === 0) return ".";
      for (var o = s.charCodeAt(0), a = o === 47, l = -1, d = !0, h = s.length - 1; h >= 1; --h)
        if (o = s.charCodeAt(h), o === 47) {
          if (!d) {
            l = h;
            break;
          }
        } else
          d = !1;
      return l === -1 ? a ? "/" : "." : a && l === 1 ? "//" : s.slice(0, l);
    },
    basename: function(s, o) {
      if (o !== void 0 && typeof o != "string") throw new TypeError('"ext" argument must be a string');
      r(s);
      var a = 0, l = -1, d = !0, h;
      if (o !== void 0 && o.length > 0 && o.length <= s.length) {
        if (o.length === s.length && o === s) return "";
        var c = o.length - 1, u = -1;
        for (h = s.length - 1; h >= 0; --h) {
          var m = s.charCodeAt(h);
          if (m === 47) {
            if (!d) {
              a = h + 1;
              break;
            }
          } else
            u === -1 && (d = !1, u = h + 1), c >= 0 && (m === o.charCodeAt(c) ? --c === -1 && (l = h) : (c = -1, l = u));
        }
        return a === l ? l = u : l === -1 && (l = s.length), s.slice(a, l);
      } else {
        for (h = s.length - 1; h >= 0; --h)
          if (s.charCodeAt(h) === 47) {
            if (!d) {
              a = h + 1;
              break;
            }
          } else l === -1 && (d = !1, l = h + 1);
        return l === -1 ? "" : s.slice(a, l);
      }
    },
    extname: function(s) {
      r(s);
      for (var o = -1, a = 0, l = -1, d = !0, h = 0, c = s.length - 1; c >= 0; --c) {
        var u = s.charCodeAt(c);
        if (u === 47) {
          if (!d) {
            a = c + 1;
            break;
          }
          continue;
        }
        l === -1 && (d = !1, l = c + 1), u === 46 ? o === -1 ? o = c : h !== 1 && (h = 1) : o !== -1 && (h = -1);
      }
      return o === -1 || l === -1 || // We saw a non-dot character immediately before the dot
      h === 0 || // The (right-most) trimmed path component is exactly '..'
      h === 1 && o === l - 1 && o === a + 1 ? "" : s.slice(o, l);
    },
    format: function(s) {
      if (s === null || typeof s != "object")
        throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof s);
      return e("/", s);
    },
    parse: function(s) {
      r(s);
      var o = { root: "", dir: "", base: "", ext: "", name: "" };
      if (s.length === 0) return o;
      var a = s.charCodeAt(0), l = a === 47, d;
      l ? (o.root = "/", d = 1) : d = 0;
      for (var h = -1, c = 0, u = -1, m = !0, p = s.length - 1, f = 0; p >= d; --p) {
        if (a = s.charCodeAt(p), a === 47) {
          if (!m) {
            c = p + 1;
            break;
          }
          continue;
        }
        u === -1 && (m = !1, u = p + 1), a === 46 ? h === -1 ? h = p : f !== 1 && (f = 1) : h !== -1 && (f = -1);
      }
      return h === -1 || u === -1 || // We saw a non-dot character immediately before the dot
      f === 0 || // The (right-most) trimmed path component is exactly '..'
      f === 1 && h === u - 1 && h === c + 1 ? u !== -1 && (c === 0 && l ? o.base = o.name = s.slice(1, u) : o.base = o.name = s.slice(c, u)) : (c === 0 && l ? (o.name = s.slice(1, h), o.base = s.slice(1, u)) : (o.name = s.slice(c, h), o.base = s.slice(c, u)), o.ext = s.slice(h, u)), c > 0 ? o.dir = s.slice(0, c - 1) : l && (o.dir = "/"), o;
    },
    sep: "/",
    delimiter: ":",
    win32: null,
    posix: null
  };
  return i.posix = i, we = i, we;
}
var Zt = Zs();
function Et(r) {
  const t = r.languages?.[0]?.toLowerCase(), e = r.readingProgression;
  if (t) {
    if (t.startsWith("zh") || t.startsWith("ja") || t.startsWith("ko"))
      return e === I.rtl ? "cjk-vertical" : "cjk-horizontal";
    if (t.startsWith("mn-mong")) return "mongolian-vertical";
    if (t.startsWith("ar") || t.startsWith("fa") || t.startsWith("he")) return "rtl";
  }
  return "ltr";
}
const Qs = { description: "Attempts to filter out paragraphs that are implicitly headings or part of headers", scope: "RS", value: "readium-experimentalHeaderFiltering-on" }, tr = { description: "Attempts to filter out elements that are sized using viewport units and should not be scaled directly e.g. tables, images, iframes, etc.", scope: "RS", value: "readium-experimentalZoom-on" }, er = {
  experimentalHeaderFiltering: Qs,
  experimentalZoom: tr
}, ir = { disabled: [], added: [] }, nr = { disabled: ["bodyHyphens", "a11yNormalize", "letterSpacing"], added: [] }, sr = {
  ltr: ir,
  rtl: nr,
  "cjk-horizontal": { disabled: ["textAlign", "bodyHyphens", "a11yNormalize", "ligatures", "paraIndent", "wordSpacing"], added: ["noRuby"] },
  "cjk-vertical": { disabled: ["colCount", "textAlign", "bodyHyphens", "a11yNormalize", "ligatures", "paraIndent", "wordSpacing"], added: ["noRuby"] }
}, rr = { baseFontFamily: "var(--RS__oldStyleTf)", lineHeightCompensation: 1 }, or = { baseFontFamily: "Kefa, Nyala, Roboto, Noto, 'Noto Sans Ethiopic', serif", lineHeightCompensation: 1.167 }, ar = { baseFontFamily: "'Geeza Pro', 'Arabic Typesetting', Roboto, Noto, 'Noto Naskh Arabic', 'Times New Roman', serif" }, lr = { baseFontFamily: "'Kohinoor Bangla', 'Bangla Sangam MN', Vrinda, Roboto, Noto, 'Noto Sans Bengali', sans-serif", lineHeightCompensation: 1.067 }, hr = { baseFontFamily: "Kailasa, 'Microsoft Himalaya', Roboto, Noto, 'Noto Sans Tibetan', sans-serif" }, cr = { baseFontFamily: "'Plantagenet Cherokee', Roboto, Noto, 'Noto Sans Cherokee'", lineHeightCompensation: 1.167 }, dr = { baseFontFamily: "'Geeza Pro', 'Arabic Typesetting', Roboto, Noto, 'Noto Naskh Arabic', 'Times New Roman', serif" }, ur = { baseFontFamily: "'Gujarati Sangam MN', 'Nirmala UI', Shruti, Roboto, Noto, 'Noto Sans Gujarati', sans-serif", lineHeightCompensation: 1.167 }, pr = { baseFontFamily: "'New Peninim MT', 'Arial Hebrew', Gisha, 'Times New Roman', Roboto, Noto, 'Noto Sans Hebrew', sans-serif", lineHeightCompensation: 1.1 }, fr = { baseFontFamily: "'Kohinoor Devanagari', 'Devanagari Sangam MN', Kokila, 'Nirmala UI', Roboto, Noto, 'Noto Sans Devanagari', sans-serif", lineHeightCompensation: 1.1 }, mr = { baseFontFamily: "Mshtakan, Sylfaen, Roboto, Noto, 'Noto Serif Armenian', serif" }, gr = { baseFontFamily: "'Euphemia UCAS', Euphemia, Roboto, Noto, 'Noto Sans Canadian Aboriginal', sans-serif" }, yr = { baseFontFamily: "YuGothic, 'Hiragino Maru Gothic ProN', 'Hiragino Sans', 'Yu Gothic UI', 'Meiryo UI', 'MS Gothic', Roboto, Noto, 'Noto Sans CJK JP', sans-serif", lineHeightCompensation: 1.167 }, br = { baseFontFamily: "'Khmer Sangam MN', 'Leelawadee UI', 'Khmer UI', Roboto, Noto, 'Noto Sans Khmer', sans-serif", lineHeightCompensation: 1.067 }, vr = { baseFontFamily: "'Kannada Sangam MN', 'Nirmala UI', Tunga, Roboto, Noto, 'Noto Sans Kannada', sans-serif", lineHeightCompensation: 1.1 }, Sr = { baseFontFamily: "'Nanum Gothic', 'Apple SD Gothic Neo', 'Malgun Gothic', Roboto, Noto, 'Noto Sans CJK KR', sans-serif", lineHeightCompensation: 1.167 }, wr = { baseFontFamily: "'Lao Sangam MN', 'Leelawadee UI', 'Lao UI', Roboto, Noto, 'Noto Sans Lao', sans-serif" }, Pr = { baseFontFamily: "'Malayalam Sangam MN', 'Nirmala UI', Kartika, Roboto, Noto, 'Noto Sans Malayalam', sans-serif", lineHeightCompensation: 1.067 }, Er = { baseFontFamily: "'Oriya Sangam MN', 'Nirmala UI', Kalinga, Roboto, Noto, 'Noto Sans Oriya', sans-serif", lineHeightCompensation: 1.167 }, Cr = { baseFontFamily: "'Gurmukhi MN', 'Nirmala UI', Kartika, Roboto, Noto, 'Noto Sans Gurmukhi', sans-serif", lineHeightCompensation: 1.1 }, _r = { baseFontFamily: "'Sinhala Sangam MN', 'Nirmala UI', 'Iskoola Pota', Roboto, Noto, 'Noto Sans Sinhala', sans-serif", lineHeightCompensation: 1.167 }, xr = { baseFontFamily: "'Tamil Sangam MN', 'Nirmala UI', Latha, Roboto, Noto, 'Noto Sans Tamil', sans-serif", lineHeightCompensation: 1.067 }, Lr = { baseFontFamily: "'Kohinoor Telugu', 'Telugu Sangam MN', 'Nirmala UI', Gautami, Roboto, Noto, 'Noto Sans Telugu', sans-serif" }, kr = { baseFontFamily: "Thonburi, 'Leelawadee UI', 'Cordia New', Roboto, Noto, 'Noto Sans Thai', sans-serif", lineHeightCompensation: 1.067 }, Or = { baseFontFamily: "'方体', 'PingFang SC', '黑体', 'Heiti SC', 'Microsoft JhengHei UI', 'Microsoft JhengHei', Roboto, Noto, 'Noto Sans CJK SC', sans-serif", lineHeightCompensation: 1.167 }, Rr = {
  latin: rr,
  am: or,
  ar,
  bn: lr,
  bo: hr,
  chr: cr,
  fa: dr,
  gu: ur,
  he: pr,
  hi: fr,
  hy: mr,
  iu: gr,
  ja: yr,
  km: br,
  kn: vr,
  ko: Sr,
  lo: wr,
  ml: Pr,
  or: Er,
  pa: Cr,
  si: _r,
  ta: xr,
  te: Lr,
  th: kr,
  zh: Or,
  "zh-Hant": { baseFontFamily: "'方體', 'PingFang TC', '黑體', 'Heiti TC', 'Microsoft JhengHei UI', 'Microsoft JhengHei', Roboto, Noto, 'Noto Sans CJK TC', sans-serif", lineHeightCompensation: 1.167 },
  "zh-TW": { baseFontFamily: "'方體', 'PingFang TC', '黑體', 'Heiti TC', 'Microsoft JhengHei UI', 'Microsoft JhengHei', Roboto, Noto, 'Noto Sans CJK TC', sans-serif", lineHeightCompensation: 1.167 },
  "zh-HK": { baseFontFamily: "'方體', 'PingFang HK', '方體', 'PingFang TC', '黑體', 'Heiti TC', 'Microsoft JhengHei UI', 'Microsoft JhengHei', Roboto, Noto, 'Noto Sans CJK TC', sans-serif", lineHeightCompensation: 1.167 }
}, Je = er, Uo = sr, Ho = Rr;
var nt = /* @__PURE__ */ ((r) => (r.start = "start", r.left = "left", r.right = "right", r.justify = "justify", r))(nt || {});
const ft = {
  range: [0, 100],
  step: 1
}, Qt = {
  range: [0.7, 4],
  step: 0.05
}, at = {
  range: [100, 1e3],
  step: 100
}, te = {
  range: [50, 250],
  step: 10
}, ee = {
  range: [0, 1],
  step: 0.125
}, ie = {
  range: [1, 2.5],
  step: 0.1
}, mt = {
  range: [20, 100],
  step: 1
}, ne = {
  range: [0, 3],
  step: 0.25
}, se = {
  range: [0, 3],
  step: 0.25
}, re = {
  range: [0, 2],
  step: 0.125
}, oe = {
  range: [0.7, 4],
  step: 0.05
}, ae = {
  range: [0, 1],
  step: 0.1
}, le = {
  range: [0.5, 4],
  step: 0.1
}, rt = {
  range: [5, 60],
  step: 5
};
class pe {
  constructor() {
  }
  toFlag(t) {
    return `readium-${t}-on`;
  }
  toUnitless(t) {
    return t.toString();
  }
  toPercentage(t, e = !1) {
    return e || t > 0 && t <= 1 ? `${Math.round(t * 100)}%` : `${t}%`;
  }
  toVw(t) {
    const e = Math.round(t * 100);
    return `${Math.min(e, 100)}vw`;
  }
  toVh(t) {
    const e = Math.round(t * 100);
    return `${Math.min(e, 100)}vh`;
  }
  toPx(t) {
    return `${t}px`;
  }
  toRem(t) {
    return `${t}rem`;
  }
}
class _n extends pe {
  constructor(t) {
    super(), this.a11yNormalize = t.a11yNormalize ?? null, this.bodyHyphens = t.bodyHyphens ?? null, this.fontFamily = t.fontFamily ?? null, this.fontWeight = t.fontWeight ?? null, this.iOSPatch = t.iOSPatch ?? null, this.iPadOSPatch = t.iPadOSPatch ?? null, this.letterSpacing = t.letterSpacing ?? null, this.ligatures = t.ligatures ?? null, this.lineHeight = t.lineHeight ?? null, this.noRuby = t.noRuby ?? null, this.paraIndent = t.paraIndent ?? null, this.paraSpacing = t.paraSpacing ?? null, this.textAlign = t.textAlign ?? null, this.wordSpacing = t.wordSpacing ?? null, this.zoom = t.zoom ?? null;
  }
  toCSSProperties() {
    const t = {};
    return this.a11yNormalize && (t["--USER__a11yNormalize"] = this.toFlag("a11y")), this.bodyHyphens && (t["--USER__bodyHyphens"] = this.bodyHyphens), this.fontFamily && (t["--USER__fontFamily"] = this.fontFamily), this.fontWeight != null && (t["--USER__fontWeight"] = this.toUnitless(this.fontWeight)), this.iOSPatch && (t["--USER__iOSPatch"] = this.toFlag("iOSPatch")), this.iPadOSPatch && (t["--USER__iPadOSPatch"] = this.toFlag("iPadOSPatch")), this.letterSpacing != null && (t["--USER__letterSpacing"] = this.toRem(this.letterSpacing)), this.ligatures && (t["--USER__ligatures"] = this.ligatures), this.lineHeight != null && (t["--USER__lineHeight"] = this.toUnitless(this.lineHeight)), this.noRuby && (t["--USER__noRuby"] = this.toFlag("noRuby")), this.paraIndent != null && (t["--USER__paraIndent"] = this.toRem(this.paraIndent)), this.paraSpacing != null && (t["--USER__paraSpacing"] = this.toRem(this.paraSpacing)), this.textAlign && (t["--USER__textAlign"] = this.textAlign), this.wordSpacing != null && (t["--USER__wordSpacing"] = this.toRem(this.wordSpacing)), this.zoom !== null && (t["--USER__zoom"] = this.toPercentage(this.zoom, !0)), t;
  }
}
class Ar extends pe {
  constructor(t) {
    super(), this.experiments = t.experiments ?? null;
  }
  toCSSProperties() {
    const t = {};
    return this.experiments && this.experiments.forEach((e) => {
      t["--RS__" + e] = Je[e].value;
    }), t;
  }
}
class Tr {
  constructor(t) {
    this.rsProperties = t.rsProperties, this.userProperties = t.userProperties;
  }
  update(t) {
    t.experiments && (this.rsProperties.experiments = t.experiments);
    const e = {
      a11yNormalize: t.textNormalization,
      bodyHyphens: typeof t.hyphens != "boolean" ? null : t.hyphens ? "auto" : "none",
      fontFamily: t.fontFamily,
      fontWeight: t.fontWeight,
      iOSPatch: t.iOSPatch,
      iPadOSPatch: t.iPadOSPatch,
      letterSpacing: t.letterSpacing,
      ligatures: typeof t.ligatures != "boolean" ? null : t.ligatures ? "common-ligatures" : "none",
      lineHeight: t.lineHeight,
      noRuby: t.noRuby,
      paraIndent: t.paragraphIndent,
      paraSpacing: t.paragraphSpacing,
      textAlign: t.textAlign,
      wordSpacing: t.wordSpacing,
      zoom: t.zoom
    };
    this.userProperties = new _n(e);
  }
}
function Nr(r, t) {
  return r == null || t == null || r <= t ? r : void 0;
}
function Mr(r, t) {
  return r == null || t == null || r >= t ? r : void 0;
}
function W(r) {
  return typeof r == "string" ? r : r === null ? null : void 0;
}
function E(r) {
  return typeof r == "boolean" || r == null ? r : void 0;
}
function fe(r, t) {
  if (r !== void 0)
    return r === null ? null : t[r] !== void 0 ? r : void 0;
}
function Ct(r) {
  return typeof r == "boolean" || typeof r == "number" && r >= 0 ? r : r === null ? null : void 0;
}
function w(r) {
  if (r !== void 0)
    return r === null ? null : r < 0 ? void 0 : r;
}
function D(r, t) {
  if (r === void 0)
    return;
  if (r === null)
    return null;
  const e = Math.min(...t), i = Math.max(...t);
  return r >= e && r <= i ? r : void 0;
}
function Pe(r, t) {
  return r === void 0 ? t : r;
}
function xn(r) {
  if (r !== void 0)
    return r === null ? null : r.filter((t) => t in Je);
}
class Ut {
  constructor(t = {}) {
    this.fontFamily = W(t.fontFamily), this.fontWeight = D(t.fontWeight, at.range), this.hyphens = E(t.hyphens), this.iOSPatch = E(t.iOSPatch), this.iPadOSPatch = E(t.iPadOSPatch), this.letterSpacing = w(t.letterSpacing), this.ligatures = E(t.ligatures), this.lineHeight = w(t.lineHeight), this.noRuby = E(t.noRuby), this.paragraphIndent = w(t.paragraphIndent), this.paragraphSpacing = w(t.paragraphSpacing), this.textAlign = fe(t.textAlign, nt), this.textNormalization = E(t.textNormalization), this.wordSpacing = w(t.wordSpacing), this.zoom = D(t.zoom, oe.range);
  }
  static serialize(t) {
    const { ...e } = t;
    return JSON.stringify(e);
  }
  static deserialize(t) {
    try {
      const e = JSON.parse(t);
      return new Ut(e);
    } catch (e) {
      return console.error("Failed to deserialize preferences:", e), null;
    }
  }
  merging(t) {
    const e = { ...this };
    for (const i of Object.keys(t))
      t[i] !== void 0 && (e[i] = t[i]);
    return new Ut(e);
  }
}
class Fr {
  constructor(t) {
    this.fontFamily = W(t.fontFamily) || null, this.fontWeight = D(t.fontWeight, at.range) || null, this.hyphens = E(t.hyphens) ?? null, this.iOSPatch = t.iOSPatch === !1 ? !1 : (M.OS.iOS || M.OS.iPadOS) && M.iOSRequest === "mobile", this.iPadOSPatch = t.iPadOSPatch === !1 ? !1 : M.OS.iPadOS && M.iOSRequest === "desktop", this.letterSpacing = w(t.letterSpacing) || null, this.ligatures = E(t.ligatures) ?? null, this.lineHeight = w(t.lineHeight) || null, this.noRuby = E(t.noRuby) ?? !1, this.paragraphIndent = w(t.paragraphIndent) ?? null, this.paragraphSpacing = w(t.paragraphSpacing) ?? null, this.textAlign = fe(t.textAlign, nt) || null, this.textNormalization = E(t.textNormalization) ?? !1, this.wordSpacing = w(t.wordSpacing) || null, this.zoom = D(t.zoom, oe.range) || 1, this.experiments = xn(t.experiments) ?? null;
  }
}
class zi {
  constructor(t, e, i) {
    this.fontFamily = null, this.fontWeight = null, this.hyphens = null, this.iOSPatch = null, this.iPadOSPatch = null, this.letterSpacing = null, this.ligatures = null, this.lineHeight = null, this.noRuby = null, this.paragraphIndent = null, this.paragraphSpacing = null, this.textAlign = null, this.textNormalization = null, this.wordSpacing = null, i && (this.fontFamily = t.fontFamily || e.fontFamily || null, this.fontWeight = t.fontWeight !== void 0 ? t.fontWeight : e.fontWeight !== void 0 ? e.fontWeight : null, this.hyphens = typeof t.hyphens == "boolean" ? t.hyphens : e.hyphens ?? null, this.iOSPatch = t.iOSPatch === !1 ? !1 : t.iOSPatch === !0 ? (M.OS.iOS || M.OS.iPadOS) && M.iOSRequest === "mobile" : e.iOSPatch, this.iPadOSPatch = t.iPadOSPatch === !1 ? !1 : t.iPadOSPatch === !0 ? M.OS.iPadOS && M.iOSRequest === "desktop" : e.iPadOSPatch, this.letterSpacing = t.letterSpacing !== void 0 ? t.letterSpacing : e.letterSpacing !== void 0 ? e.letterSpacing : null, this.ligatures = typeof t.ligatures == "boolean" ? t.ligatures : e.ligatures ?? null, this.lineHeight = t.lineHeight !== void 0 ? t.lineHeight : e.lineHeight !== void 0 ? e.lineHeight : null, this.noRuby = typeof t.noRuby == "boolean" ? t.noRuby : e.noRuby ?? null, this.paragraphIndent = t.paragraphIndent !== void 0 ? t.paragraphIndent : e.paragraphIndent !== void 0 ? e.paragraphIndent : null, this.paragraphSpacing = t.paragraphSpacing !== void 0 ? t.paragraphSpacing : e.paragraphSpacing !== void 0 ? e.paragraphSpacing : null, this.textAlign = t.textAlign || e.textAlign || null, this.textNormalization = typeof t.textNormalization == "boolean" ? t.textNormalization : e.textNormalization ?? null, this.wordSpacing = t.wordSpacing !== void 0 ? t.wordSpacing : e.wordSpacing !== void 0 ? e.wordSpacing : null), this.zoom = t.zoom !== void 0 ? t.zoom : e.zoom !== void 0 ? e.zoom : null, this.experiments = e.experiments || null;
  }
}
class z {
  constructor({
    initialValue: t = null,
    effectiveValue: e,
    isEffective: i,
    onChange: n
  }) {
    this._value = t, this._effectiveValue = e, this._isEffective = i, this._onChange = n;
  }
  set value(t) {
    this._value = t, this._onChange(this._value);
  }
  get value() {
    return this._value;
  }
  get effectiveValue() {
    return this._effectiveValue;
  }
  get isEffective() {
    return this._isEffective;
  }
  clear() {
    this._value = null;
  }
}
class N extends z {
  set value(t) {
    this._value = t, this._onChange(this._value);
  }
  get value() {
    return this._value;
  }
  get effectiveValue() {
    return this._effectiveValue;
  }
  get isEffective() {
    return this._isEffective;
  }
  clear() {
    this._value = null;
  }
  toggle() {
    this._value = !this._value, this._onChange(this._value);
  }
}
class Ln extends z {
  constructor({
    initialValue: t = null,
    effectiveValue: e,
    isEffective: i,
    onChange: n,
    supportedValues: s
  }) {
    super({ initialValue: t, effectiveValue: e, isEffective: i, onChange: n }), this._supportedValues = s;
  }
  set value(t) {
    if (t && !this._supportedValues.includes(t))
      throw new Error(`Value '${String(t)}' is not in the supported values for this preference.`);
    this._value = t, this._onChange(this._value);
  }
  get value() {
    return this._value;
  }
  get effectiveValue() {
    return this._effectiveValue;
  }
  get isEffective() {
    return this._isEffective;
  }
  get supportedValues() {
    return this._supportedValues;
  }
  clear() {
    this._value = null;
  }
}
class R extends z {
  constructor({
    initialValue: t = null,
    effectiveValue: e,
    isEffective: i,
    onChange: n,
    supportedRange: s,
    step: o
  }) {
    super({ initialValue: t, effectiveValue: e, isEffective: i, onChange: n }), this._supportedRange = s, this._step = o, this._decimals = this._step.toString().includes(".") ? this._step.toString().split(".")[1].length : 0;
  }
  set value(t) {
    if (t && (t < this._supportedRange[0] || t > this._supportedRange[1]))
      throw new Error(`Value '${String(t)}' is out of the supported range for this preference.`);
    this._value = t, this._onChange(this._value);
  }
  get value() {
    return this._value;
  }
  get effectiveValue() {
    return this._effectiveValue;
  }
  get isEffective() {
    return this._isEffective;
  }
  get supportedRange() {
    return this._supportedRange;
  }
  get step() {
    return this._step;
  }
  increment() {
    this._value && this._value < this._supportedRange[1] && (this._value = Math.min(
      Math.round((this._value + this._step) * 10 ** this._decimals) / 10 ** this._decimals,
      this._supportedRange[1]
    ), this._onChange(this._value));
  }
  decrement() {
    this._value && this._value > this._supportedRange[0] && (this._value = Math.max(
      Math.round((this._value - this._step) * 10 ** this._decimals) / 10 ** this._decimals,
      this._supportedRange[0]
    ), this._onChange(this._value));
  }
  format(t) {
    return t.toString();
  }
  clear() {
    this._value = null;
  }
}
class Ii {
  constructor(t, e, i) {
    this.preferences = t, this.settings = e, this.metadata = i;
  }
  clear() {
    this.preferences = new Ut({});
  }
  updatePreference(t, e) {
    this.preferences[t] = e;
  }
  get isDisplayTransformable() {
    return this.metadata?.accessibility?.feature?.some(
      (t) => t.value === $t.DISPLAY_TRANSFORMABILITY.value
    ) ?? !1;
  }
  get fontFamily() {
    return new z({
      initialValue: this.preferences.fontFamily,
      effectiveValue: this.settings.fontFamily || null,
      isEffective: this.isDisplayTransformable,
      onChange: (t) => {
        this.updatePreference("fontFamily", t ?? null);
      }
    });
  }
  get fontWeight() {
    return new R({
      initialValue: this.preferences.fontWeight,
      effectiveValue: this.settings.fontWeight || 400,
      isEffective: this.isDisplayTransformable,
      onChange: (t) => {
        this.updatePreference("fontWeight", t ?? null);
      },
      supportedRange: at.range,
      step: at.step
    });
  }
  get hyphens() {
    return new N({
      initialValue: this.preferences.hyphens,
      effectiveValue: this.settings.hyphens || !1,
      isEffective: this.isDisplayTransformable,
      onChange: (t) => {
        this.updatePreference("hyphens", t ?? null);
      }
    });
  }
  get iOSPatch() {
    return new N({
      initialValue: this.preferences.iOSPatch,
      effectiveValue: this.settings.iOSPatch || !1,
      isEffective: !0,
      onChange: (t) => {
        this.updatePreference("iOSPatch", t ?? null);
      }
    });
  }
  get iPadOSPatch() {
    return new N({
      initialValue: this.preferences.iPadOSPatch,
      effectiveValue: this.settings.iPadOSPatch || !1,
      isEffective: !0,
      onChange: (t) => {
        this.updatePreference("iPadOSPatch", t ?? null);
      }
    });
  }
  get letterSpacing() {
    return new R({
      initialValue: this.preferences.letterSpacing,
      effectiveValue: this.settings.letterSpacing || 0,
      isEffective: this.isDisplayTransformable,
      onChange: (t) => {
        this.updatePreference("letterSpacing", t ?? null);
      },
      supportedRange: ee.range,
      step: ee.step
    });
  }
  get ligatures() {
    return new N({
      initialValue: this.preferences.ligatures,
      effectiveValue: this.settings.ligatures || !0,
      isEffective: this.isDisplayTransformable,
      onChange: (t) => {
        this.updatePreference("ligatures", t ?? null);
      }
    });
  }
  get lineHeight() {
    return new R({
      initialValue: this.preferences.lineHeight,
      effectiveValue: this.settings.lineHeight,
      isEffective: this.isDisplayTransformable,
      onChange: (t) => {
        this.updatePreference("lineHeight", t ?? null);
      },
      supportedRange: ie.range,
      step: ie.step
    });
  }
  get noRuby() {
    return new N({
      initialValue: this.preferences.noRuby,
      effectiveValue: this.settings.noRuby || !1,
      isEffective: this.isDisplayTransformable,
      onChange: (t) => {
        this.updatePreference("noRuby", t ?? null);
      }
    });
  }
  get paragraphIndent() {
    return new R({
      initialValue: this.preferences.paragraphIndent,
      effectiveValue: this.settings.paragraphIndent || 0,
      isEffective: this.isDisplayTransformable,
      onChange: (t) => {
        this.updatePreference("paragraphIndent", t ?? null);
      },
      supportedRange: ne.range,
      step: ne.step
    });
  }
  get paragraphSpacing() {
    return new R({
      initialValue: this.preferences.paragraphSpacing,
      effectiveValue: this.settings.paragraphSpacing || 0,
      isEffective: this.isDisplayTransformable,
      onChange: (t) => {
        this.updatePreference("paragraphSpacing", t ?? null);
      },
      supportedRange: se.range,
      step: se.step
    });
  }
  get textAlign() {
    return new Ln({
      initialValue: this.preferences.textAlign,
      effectiveValue: this.settings.textAlign || nt.start,
      isEffective: this.isDisplayTransformable,
      onChange: (t) => {
        this.updatePreference("textAlign", t ?? null);
      },
      supportedValues: Object.values(nt)
    });
  }
  get textNormalization() {
    return new N({
      initialValue: this.preferences.textNormalization,
      effectiveValue: this.settings.textNormalization || !1,
      isEffective: this.isDisplayTransformable,
      onChange: (t) => {
        this.updatePreference("textNormalization", t ?? null);
      }
    });
  }
  get wordSpacing() {
    return new R({
      initialValue: this.preferences.wordSpacing,
      effectiveValue: this.settings.wordSpacing || 0,
      isEffective: this.isDisplayTransformable,
      onChange: (t) => {
        this.updatePreference("wordSpacing", t ?? null);
      },
      supportedRange: re.range,
      step: re.step
    });
  }
  get zoom() {
    return new R({
      initialValue: this.preferences.zoom,
      effectiveValue: this.settings.zoom || 1,
      isEffective: CSS.supports("zoom", "1") ?? !1,
      onChange: (t) => {
        this.updatePreference("zoom", t ?? null);
      },
      supportedRange: oe.range,
      step: oe.step
    });
  }
}
const kn = (r) => {
  if ("blob" in r && r.blob.type)
    return r.blob.type;
  if (r.as === "script")
    return "text/javascript";
  if (r.as === "link" && "url" in r) {
    const t = r.url.toLowerCase();
    if (t.endsWith(".css")) return "text/css";
    if ([".js", ".mjs", ".cjs"].some((e) => t.endsWith(e))) return "text/javascript";
  }
}, On = (r, t) => {
  t.attributes && Object.entries(t.attributes).forEach(([e, i]) => {
    e === "type" || e === "rel" || e === "href" || e === "src" || i != null && (typeof i == "boolean" ? i && r.setAttribute(e, "") : r.setAttribute(e, i));
  });
}, zr = (r, t, e) => {
  const i = r.createElement("script");
  i.dataset.readium = "true", t.id && (i.id = t.id);
  const n = t.type || kn(t);
  return n && (i.type = n), On(i, t), i.src = e, i;
}, Di = (r, t, e) => {
  const i = r.createElement("link");
  i.dataset.readium = "true", t.id && (i.id = t.id), t.rel && (i.rel = t.rel);
  const n = t.type || kn(t);
  return n && (i.type = n), On(i, t), i.href = e, i;
};
class Rn {
  constructor(t) {
    this.blobStore = /* @__PURE__ */ new Map(), this.createdBlobUrls = /* @__PURE__ */ new Set(), this.allowedDomains = [], this.injectableIdCounter = 0, this.allowedDomains = (t.allowedDomains || []).map((e) => {
      try {
        return new URL(e), e;
      } catch {
        throw new Error(`Invalid allowed domain: "${e}". Must be a valid URL (e.g., "https://fonts.googleapis.com").`);
      }
    }), this.rules = t.rules.map((e) => {
      const i = { ...e };
      return e.prepend && (i.prepend = e.prepend.map((n) => ({
        ...n,
        id: n.id || `injectable-${this.injectableIdCounter++}`
      })).reverse()), e.append && (i.append = e.append.map((n) => ({
        ...n,
        id: n.id || `injectable-${this.injectableIdCounter++}`
      }))), i;
    });
  }
  dispose() {
    for (const t of this.createdBlobUrls)
      try {
        URL.revokeObjectURL(t);
      } catch (e) {
        console.warn("Failed to revoke blob URL:", t, e);
      }
    this.createdBlobUrls.clear();
  }
  getAllowedDomains() {
    return [...this.allowedDomains];
  }
  async injectForDocument(t, e) {
    for (const i of this.rules)
      this.matchesRule(i, e) && await this.applyRule(t, i);
  }
  matchesRule(t, e) {
    const i = e.href;
    return t.resources.some((n) => n instanceof RegExp ? n.test(i) : i === n);
  }
  async getOrCreateBlobUrl(t) {
    const e = t.id;
    if (this.blobStore.has(e)) {
      const i = this.blobStore.get(e);
      return i.refCount++, i.url;
    }
    if ("blob" in t) {
      const i = URL.createObjectURL(t.blob);
      return this.blobStore.set(e, { url: i, refCount: 1 }), this.createdBlobUrls.add(i), i;
    }
    throw new Error("Resource must have a blob property");
  }
  async releaseBlobUrl(t) {
    if (!this.createdBlobUrls.has(t)) return;
    const e = Array.from(this.blobStore.values()).find((i) => i.url === t);
    if (e && (e.refCount--, e.refCount <= 0)) {
      URL.revokeObjectURL(t), this.createdBlobUrls.delete(t);
      for (const [i, n] of this.blobStore.entries())
        if (n.url === t) {
          this.blobStore.delete(i);
          break;
        }
    }
  }
  async getResourceUrl(t, e) {
    if ("url" in t) {
      const i = new URL(t.url, e.baseURI).toString();
      if (!this.isValidUrl(i, e))
        throw new Error(`Invalid URL: Only HTTPS, data:, blob:, or localhost HTTP URLs are allowed. Got: ${t.url}`);
      return i;
    } else
      return this.getOrCreateBlobUrl(t);
  }
  createPreloadLink(t, e, i) {
    if (e.as !== "link" || e.rel !== "preload") return;
    const n = {
      ...e,
      rel: "preload",
      attributes: {
        ...e.attributes,
        as: e.as
      }
    }, s = Di(t, n, i);
    t.head.appendChild(s);
  }
  createElement(t, e, i) {
    if (e.as === "script")
      return zr(t, e, i);
    if (e.as === "link")
      return Di(t, e, i);
    throw new Error(`Unsupported element type: ${e.as}`);
  }
  async applyRule(t, e) {
    const i = [], n = e.prepend ? e.prepend.filter(
      (o) => !o.condition || o.condition(t)
    ) : [], s = e.append ? e.append.filter(
      (o) => !o.condition || o.condition(t)
    ) : [];
    try {
      for (const o of n)
        await this.processInjectable(o, t, i, "prepend");
      for (const o of s)
        await this.processInjectable(o, t, i, "append");
    } catch (o) {
      for (const { element: a, url: l } of i)
        try {
          a.remove(), await this.releaseBlobUrl(l);
        } catch (d) {
          console.error("Error during cleanup:", d);
        }
      throw o;
    }
  }
  async processInjectable(t, e, i, n) {
    const s = t.target === "body" ? e.body : e.head;
    if (!s) return;
    let o = null;
    try {
      if (o = await this.getResourceUrl(t, e), t.rel === "preload" && "url" in t)
        this.createPreloadLink(e, t, o);
      else {
        const a = this.createElement(e, t, o);
        i.push({ element: a, url: o }), n === "prepend" ? s.prepend(a) : s.append(a);
      }
    } catch (a) {
      throw console.error("Failed to process resource:", a), o && "blob" in t && await this.releaseBlobUrl(o), a;
    }
  }
  isValidUrl(t, e) {
    try {
      const i = new URL(t, e.baseURI);
      if (i.protocol === "data:" || i.protocol === "blob:" && this.createdBlobUrls.has(t))
        return !0;
      if (this.allowedDomains.length > 0) {
        const n = i.origin;
        return this.allowedDomains.some((s) => {
          const o = new URL(s).origin;
          return n === o;
        });
      }
      return !1;
    } catch {
      return !1;
    }
  }
}
const _t = (r) => r.replace(/\/\/.*/g, "").replace(/\/\*[\s\S]*?\*\//g, "").replace(/\n/g, "").replace(/\s+/g, " "), Rt = (r) => r.replace(/\/\*(?:(?!\*\/)[\s\S])*\*\/|[\r\n\t]+/g, "").replace(/ {2,}/g, " "), Ir = `/*!
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
}`, An = '!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports._readium_cssSelectorGenerator=e():t._readium_cssSelectorGenerator=e()}(self,(()=>(()=>{"use strict";var t={d:(e,n)=>{for(var o in n)t.o(n,o)&&!t.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:n[o]})},o:(t,e)=>Object.prototype.hasOwnProperty.call(t,e),r:t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})}},e={};function n(t){return"object"==typeof t&&null!==t&&t.nodeType===Node.ELEMENT_NODE}t.r(e),t.d(e,{_readium_cssSelectorGenerator:()=>Z,default:()=>tt,getCssSelector:()=>X});const o={NONE:"",DESCENDANT:" ",CHILD:" > "},r={id:"id",class:"class",tag:"tag",attribute:"attribute",nthchild:"nthchild",nthoftype:"nthoftype"},i="_readium_cssSelectorGenerator";function c(t="unknown problem",...e){console.warn(`${i}: ${t}`,...e)}const s={selectors:[r.id,r.class,r.tag,r.attribute],includeTag:!1,whitelist:[],blacklist:[],combineWithinSelector:!0,combineBetweenSelectors:!0,root:null,maxCombinations:Number.POSITIVE_INFINITY,maxCandidates:Number.POSITIVE_INFINITY,useScope:!1};function u(t){return t instanceof RegExp}function l(t){return["string","function"].includes(typeof t)||u(t)}function a(t){return Array.isArray(t)?t.filter(l):[]}function f(t){const e=[Node.DOCUMENT_NODE,Node.DOCUMENT_FRAGMENT_NODE,Node.ELEMENT_NODE];return function(t){return t instanceof Node}(t)&&e.includes(t.nodeType)}function d(t,e){if(f(t))return t.contains(e)||c("element root mismatch","Provided root does not contain the element. This will most likely result in producing a fallback selector using element\'s real root node. If you plan to use the selector using provided root (e.g. `root.querySelector`), it will not work as intended."),t;const n=e.getRootNode({composed:!1});return f(n)?(n!==document&&c("shadow root inferred","You did not provide a root and the element is a child of Shadow DOM. This will produce a selector using ShadowRoot as a root. If you plan to use the selector using document as a root (e.g. `document.querySelector`), it will not work as intended."),n):S(e)}function m(t){return"number"==typeof t?t:Number.POSITIVE_INFINITY}function p(t=[]){const[e=[],...n]=t;return 0===n.length?e:n.reduce(((t,e)=>t.filter((t=>e.includes(t)))),e)}function g(t){const e=t.map((t=>{if(u(t))return e=>t.test(e);if("function"==typeof t)return e=>{const n=t(e);return"boolean"!=typeof n?(c("pattern matcher function invalid","Provided pattern matching function does not return boolean. It\'s result will be ignored.",t),!1):n};if("string"==typeof t){const e=new RegExp("^"+t.replace(/[|\\\\{}()[\\]^$+?.]/g,"\\\\$&").replace(/\\*/g,".+")+"$");return t=>e.test(t)}return c("pattern matcher invalid","Pattern matching only accepts strings, regular expressions and/or functions. This item is invalid and will be ignored.",t),()=>!1}));return t=>e.some((e=>e(t)))}function h(t,e,n){const o=Array.from(d(n,t[0]).querySelectorAll(e));return o.length===t.length&&t.every((t=>o.includes(t)))}function y(t,e){e=null!=e?e:S(t);const o=[];let r=t;for(;n(r)&&r!==e;)o.push(r),r=r.parentElement;return o}function b(t,e){return p(t.map((t=>y(t,e))))}function S(t){return t.ownerDocument.querySelector(":root")}const N=", ",v=new RegExp(["^$","\\\\s"].join("|")),E=new RegExp(["^$"].join("|")),x=[r.nthoftype,r.tag,r.id,r.class,r.attribute,r.nthchild],w=g(["class","id","ng-*"]);function I({name:t}){return`[${t}]`}function T({name:t,value:e}){return`[${t}=\'${e}\']`}function O({nodeName:t,nodeValue:e}){return{name:F(t),value:F(null!=e?e:void 0)}}function C(t){const e=Array.from(t.attributes).filter((e=>function({nodeName:t,nodeValue:e},n){const o=n.tagName.toLowerCase();return!(["input","option"].includes(o)&&"value"===t||"src"===t&&(null==e?void 0:e.startsWith("data:"))||w(t))}(e,t))).map(O);return[...e.map(I),...e.map(T)]}function j(t){var e;return(null!==(e=t.getAttribute("class"))&&void 0!==e?e:"").trim().split(/\\s+/).filter((t=>!E.test(t))).map((t=>`.${F(t)}`))}function A(t){var e;const n=null!==(e=t.getAttribute("id"))&&void 0!==e?e:"",o=`#${F(n)}`,r=t.getRootNode({composed:!1});return!v.test(n)&&h([t],o,r)?[o]:[]}function R(t){var e;const n=null===(e=t.parentElement)||void 0===e?void 0:e.children;if(n)for(let e=0;e<n.length;e++)if(n[e]===t)return[`:nth-child(${String(e+1)})`];return[]}function $(t){return[F(t.tagName.toLowerCase())]}function D(t){const e=[...new Set((n=t.map($),[].concat(...n)))];var n;return 0===e.length||e.length>1?[]:[e[0]]}function k(t){const e=D([t])[0],n=t.parentElement;if(n){const o=Array.from(n.children).filter((t=>t.tagName.toLowerCase()===e)),r=o.indexOf(t);if(r>-1)return[`${e}:nth-of-type(${String(r+1)})`]}return[]}function*P(t=[],{maxResults:e=Number.POSITIVE_INFINITY}={}){let n=0,o=L(1);for(;o.length<=t.length&&n<e;){n+=1;const e=o.map((e=>t[e]));yield e,o=_(o,t.length-1)}}function _(t=[],e=0){const n=t.length;if(0===n)return[];const o=[...t];o[n-1]+=1;for(let t=n-1;t>=0;t--)if(o[t]>e){if(0===t)return L(n+1);o[t-1]++,o[t]=o[t-1]+1}return o[n-1]>e?L(n+1):o}function L(t=1){return Array.from(Array(t).keys())}const M=":".charCodeAt(0).toString(16).toUpperCase(),V=/[ !"#$%&\'()\\[\\]{|}<>*+,./;=?@^`~\\\\]/;function F(t=""){return CSS?CSS.escape(t):function(t=""){return t.split("").map((t=>":"===t?`\\\\${M} `:V.test(t)?`\\\\${t}`:escape(t).replace(/%/g,"\\\\"))).join("")}(t)}const Y={tag:D,id:function(t){return 0===t.length||t.length>1?[]:A(t[0])},class:function(t){return p(t.map(j))},attribute:function(t){return p(t.map(C))},nthchild:function(t){return p(t.map(R))},nthoftype:function(t){return p(t.map(k))}},G={tag:$,id:A,class:j,attribute:C,nthchild:R,nthoftype:k};function W(t){return t.includes(r.tag)||t.includes(r.nthoftype)?[...t]:[...t,r.tag]}function*q(t,e){const n={};for(const o of t){const t=e[o];t&&t.length>0&&(n[o]=t)}for(const t of function*(t={}){const e=Object.entries(t);if(0===e.length)return;const n=[{index:e.length-1,partial:{}}];for(;n.length>0;){const t=n.pop();if(!t)break;const{index:o,partial:r}=t;if(o<0){yield r;continue}const[i,c]=e[o];for(let t=c.length-1;t>=0;t--)n.push({index:o-1,partial:Object.assign(Object.assign({},r),{[i]:c[t]})})}}(n))yield B(t)}function B(t={}){const e=[...x];return t[r.tag]&&t[r.nthoftype]&&e.splice(e.indexOf(r.tag),1),e.map((e=>{return(o=t)[n=e]?o[n].join(""):"";var n,o})).join("")}function H(t,e){return[...t.map((t=>e+o.DESCENDANT+t)),...t.map((t=>e+o.CHILD+t))]}function*U(t,e,n="",o){const r=function*(t,e){const n=new Set,o=function(t,e){const{blacklist:n,whitelist:o,combineWithinSelector:r,maxCombinations:i}=e,c=g(n),s=g(o);return function(t){const{selectors:e,includeTag:n}=t,o=[...e];return n&&!o.includes("tag")&&o.push("tag"),o}(e).reduce(((e,n)=>{const o=function(t,e){return(0,Y[e])(t)}(t,n),u=function(t=[],e,n){return t.filter((t=>n(t)||!e(t)))}(o,c,s),l=function(t=[],e){return t.sort(((t,n)=>{const o=e(t),r=e(n);return o&&!r?-1:!o&&r?1:0}))}(u,s);return e[n]=r?Array.from(P(l,{maxResults:i})):l.map((t=>[t])),e}),{})}(t,e);for(const t of function*(t,e){for(const n of function(t){const{selectors:e,combineBetweenSelectors:n,includeTag:o,maxCandidates:r}=t,i=n?function(t=[],{maxResults:e=Number.POSITIVE_INFINITY}={}){return Array.from(P(t,{maxResults:e}))}(e,{maxResults:r}):e.map((t=>[t]));return o?i.map(W):i}(e))yield*q(n,t)}(o,e))n.has(t)||(n.add(t),yield t)}(t,o);for(const o of function*(t,e){if(""===e)yield*t;else for(const n of t)yield*H([n],e)}(r,n))h(t,o,e)&&(yield o)}function*z(t,e,n="",o){if(0===t.length)return null;const r=[t.length>1?t:[],...b(t,e).map((t=>[t]))];for(const t of r)for(const r of U(t,e,n,o))yield{foundElements:t,selector:r}}function J(t){return{value:t,include:!1}}function K({selectors:t,operator:e}){let n=[...x];t[r.tag]&&t[r.nthoftype]&&(n=n.filter((t=>t!==r.tag)));let o="";return n.forEach((e=>{var n;(null!==(n=t[e])&&void 0!==n?n:[]).forEach((({value:t,include:e})=>{e&&(o+=t)}))})),e+o}function Q(t,e){return t.map((t=>function(t,e){return[e?":scope":":root",...y(t,e).reverse().map((t=>{var e;const n=function(t,e,n=o.NONE){const r={};return e.forEach((e=>{Reflect.set(r,e,function(t,e){return G[e](t)}(t,e).map(J))})),{element:t,operator:n,selectors:r}}(t,[r.nthchild],o.CHILD);return(null!==(e=n.selectors.nthchild)&&void 0!==e?e:[]).forEach((t=>{t.include=!0})),n})).map(K)].join("")}(t,e))).join(N)}function X(t,e={}){return Z(t,Object.assign(Object.assign({},e),{maxResults:1})).next().value}function*Z(t,e={}){var o;const i=function(t){(t instanceof NodeList||t instanceof HTMLCollection)&&(t=Array.from(t));const e=(Array.isArray(t)?t:[t]).filter(n);return[...new Set(e)]}(t),c=function(t,e={}){const n=Object.assign(Object.assign({},s),e);return{selectors:(o=n.selectors,Array.isArray(o)?o.filter((t=>{return e=r,n=t,Object.values(e).includes(n);var e,n})):[]),whitelist:a(n.whitelist),blacklist:a(n.blacklist),root:d(n.root,t),combineWithinSelector:!!n.combineWithinSelector,combineBetweenSelectors:!!n.combineBetweenSelectors,includeTag:!!n.includeTag,maxCombinations:m(n.maxCombinations),maxCandidates:m(n.maxCandidates),useScope:!!n.useScope,maxResults:m(n.maxResults)};var o}(i[0],e),u=null!==(o=c.root)&&void 0!==o?o:S(i[0]);let l=0;for(const t of function*({elements:t,root:e,rootSelector:n="",options:o}){let r=e,i=n,c=!0;for(;c;){let n=!1;for(const c of z(t,r,i,o)){const{foundElements:o,selector:s}=c;if(n=!0,!h(t,s,e)){r=o[0],i=s;break}yield s}n||(c=!1)}}({elements:i,options:c,root:u,rootSelector:""}))if(yield t,l++,l>=c.maxResults)return;i.length>1&&(yield i.map((t=>X(t,c))).join(N),l++,l>=c.maxResults)||(yield Q(i,c.useScope?u:void 0))}const tt=X;return e})()));', Dr = `// WebPub-specific setup - no execution blocking needed
window._readium_blockedEvents = [];
window._readium_blockEvents = false; // WebPub doesn't need event blocking
window._readium_eventBlocker = null;
`, Tn = `(function() {
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
`;
function Ur(r) {
  const t = r.filter((s) => s.mediaType.isHTML).map((s) => s.href), e = t.length > 0 ? t : [/\.html$/, /\.xhtml$/, /\/$/], i = [
    // CSS Selector Generator - always injected
    {
      id: "css-selector-generator",
      as: "script",
      target: "head",
      blob: new Blob([_t(An)], { type: "text/javascript" })
    },
    // WebPub Execution - always injected (sets up event blocking to false)
    {
      id: "webpub-execution",
      as: "script",
      target: "head",
      blob: new Blob([_t(Dr)], { type: "text/javascript" })
    }
  ], n = [
    // Onload Proxy - conditional (has executable scripts)
    {
      id: "onload-proxy",
      as: "script",
      target: "head",
      blob: new Blob([_t(Tn)], { type: "text/javascript" }),
      condition: (s) => !!(s.querySelector("script") || s.querySelector("body[onload]:not(body[onload=''])"))
    },
    // Readium CSS WebPub - always injected
    {
      id: "readium-css-webpub",
      as: "link",
      target: "head",
      blob: new Blob([Rt(Ir)], { type: "text/css" }),
      rel: "stylesheet"
    }
  ];
  return [
    {
      resources: e,
      prepend: i,
      append: n
    }
  ];
}
class Hr {
  constructor(t) {
    if (this.detectedTools = /* @__PURE__ */ new Set(), !t.onDetected)
      throw new Error("onDetected callback is required");
    this.options = t, this.setupDetection();
  }
  isAutomationToolPresent() {
    const t = window;
    return t.domAutomation || t.domAutomationController ? "Selenium" : navigator.webdriver === !0 ? "Puppeteer/Playwright" : t.__webdriver_evaluate || t.__selenium_evaluate ? "Chrome Automation" : t.callPhantom || t._phantom ? "PhantomJS" : t.__nightmare ? "Nightmare" : t.$testCafe ? "TestCafe" : null;
  }
  setupDetection() {
    const t = this.isAutomationToolPresent();
    if (t) {
      this.handleDetected(t);
      return;
    }
    this.observer = new MutationObserver(() => {
      const e = this.isAutomationToolPresent();
      e && !this.detectedTools.has(e) && this.handleDetected(e);
    }), this.observer.observe(document.documentElement, {
      childList: !0,
      subtree: !0,
      attributes: !0
    }), window.addEventListener("unload", () => this.destroy());
  }
  handleDetected(t) {
    this.detectedTools.add(t), this.options.onDetected?.(t);
  }
  destroy() {
    this.observer?.disconnect(), this.observer = void 0, this.detectedTools.clear();
  }
}
let Wr = 0;
function Br() {
  return ++Wr;
}
const Vr = `
onmessage = function(event) {
  var action = event.data;
  var startTime = performance.now()

  console[action.type](...action.payload);
  postMessage({
    id: action.id,
    time: performance.now() - startTime
  })
}
`, ii = class ii {
  constructor(t, e) {
    this.callbacks = /* @__PURE__ */ new Map(), this.worker = t, this.blobUrl = e, this.worker.onmessage = (i) => {
      const n = i.data, s = n.id, o = this.callbacks.get(n.id);
      o && (o({
        time: n.time
      }), this.callbacks.delete(s));
    }, this.log = (...i) => this.send("log", ...i), this.table = (...i) => this.send("table", ...i), this.clear = (...i) => this.send("clear", ...i);
  }
  async send(t, ...e) {
    const i = Br();
    return new Promise((n, s) => {
      this.callbacks.set(i, n), this.worker.postMessage({
        id: i,
        type: t,
        payload: e
      }), setTimeout(() => {
        s(new Error("timeout")), this.callbacks.delete(i);
      }, 2e3);
    });
  }
  destroy() {
    this.worker.terminate(), URL.revokeObjectURL(this.blobUrl);
  }
};
ii.workerScript = Vr;
let he = ii;
function Ze(r) {
  return typeof window < "u" && console ? console[r] : (...t) => {
  };
}
const jr = Ze("log"), Ui = Ze("table"), $r = Ze("clear");
async function Hi() {
  if (typeof navigator < "u" && navigator.brave && navigator.brave.isBrave)
    try {
      return await Promise.race([
        navigator.brave.isBrave(),
        new Promise((r) => setTimeout(() => r(!1), 1e3))
      ]);
    } catch {
      return !0;
    }
  return !1;
}
function Gr(r) {
  return r.excludes.some((t) => t()) ? !1 : r.includes.some((t) => t());
}
class Xr {
  constructor(t = {}) {
    if (this.isOpen = !1, this.checkCount = 0, this.maxChecks = 10, this.maxPrintTime = 0, this.largeObjectArray = null, this.options = {
      onDetected: t.onDetected || (() => {
      }),
      onClosed: t.onClosed || (() => {
      }),
      interval: t.interval || 1e3,
      enableDebuggerDetection: t.enableDebuggerDetection || !1
    }, !X.UA.Firefox)
      try {
        const e = new Blob([he.workerScript], { type: "application/javascript" }), i = URL.createObjectURL(e), n = new Worker(i);
        this.workerConsole = new he(n, i);
      } catch (e) {
        console.warn("Failed to create Web Worker for DevTools detection:", e);
      }
    this.startDetection();
  }
  /**
   * Create large object array for performance testing
   */
  createLargeObjectArray() {
    const t = {};
    for (let i = 0; i < 500; i++)
      t[`${i}`] = `${i}`;
    const e = [];
    for (let i = 0; i < 50; i++)
      e.push(t);
    return e;
  }
  /**
   * Get cached large object array
   */
  getLargeObjectArray() {
    return this.largeObjectArray === null && (this.largeObjectArray = this.createLargeObjectArray()), this.largeObjectArray;
  }
  /**
   * Performance-based detection using console.table timing
   */
  async calcTablePrintTime() {
    const t = this.getLargeObjectArray();
    if (this.workerConsole)
      try {
        return (await this.workerConsole.table(t)).time;
      } catch {
        const i = performance.now();
        return Ui(t), performance.now() - i;
      }
    else {
      const e = performance.now();
      return Ui(t), performance.now() - e;
    }
  }
  /**
   * Performance-based detection using console.log timing
   */
  async calcLogPrintTime() {
    const t = this.getLargeObjectArray();
    if (this.workerConsole)
      return (await this.workerConsole.log(t)).time;
    {
      const e = performance.now();
      return jr(t), performance.now() - e;
    }
  }
  /**
   * Check if performance-based detection is enabled for current browser
   */
  isPerformanceDetectionEnabled() {
    return Gr({
      includes: [
        () => !!X.UA.Chrome,
        () => !!X.UA.Chromium,
        () => !!X.UA.Safari,
        () => !!X.UA.Firefox
      ],
      excludes: []
    });
  }
  /**
   * Check if debugger detection is enabled for current browser
   */
  isDebuggerDetectionEnabled() {
    return this.options.enableDebuggerDetection;
  }
  /**
   * Performance-based detection using large object timing differences
   */
  async checkPerformanceBased() {
    if (!this.isPerformanceDetectionEnabled())
      return !1;
    const t = await this.calcTablePrintTime(), e = Math.max(await this.calcLogPrintTime(), await this.calcLogPrintTime());
    return this.maxPrintTime = Math.max(this.maxPrintTime, e), this.workerConsole ? await this.workerConsole.clear() : $r(), t === 0 ? !1 : this.maxPrintTime === 0 ? !!await Hi() : t > this.maxPrintTime * 10;
  }
  /**
   * Debugger-based detection (fallback method)
   * WARNING: This method impacts user experience
   */
  async checkDebuggerBased() {
    if (!this.isDebuggerDetectionEnabled() || await Hi())
      return !1;
    const t = performance.now();
    try {
      (() => {
      }).constructor("debugger")();
    } catch {
      debugger;
    }
    return performance.now() - t > 100;
  }
  /**
   * Main detection method combining multiple approaches
   * Prioritizes performance-based detection
   */
  async detectDevTools() {
    return await this.checkPerformanceBased() ? !0 : this.options.enableDebuggerDetection && this.checkCount >= this.maxChecks ? await this.checkDebuggerBased() : !1;
  }
  /**
   * Start continuous detection monitoring
   */
  startDetection() {
    this.intervalId = window.setInterval(async () => {
      this.checkCount++;
      const t = await this.detectDevTools();
      t !== this.isOpen && (this.isOpen = t, t ? this.options.onDetected() : this.options.onClosed()), this.checkCount > this.maxChecks * 2 && (this.checkCount = 0);
    }, this.options.interval), window.addEventListener("beforeunload", () => this.destroy());
  }
  /**
   * Get current DevTools state
   */
  isDevToolsOpen() {
    return this.isOpen;
  }
  /**
   * Force an immediate check
   */
  async checkNow() {
    const t = this.isOpen;
    return this.isOpen = await this.detectDevTools(), this.isOpen !== t && (this.isOpen ? this.options.onDetected() : this.options.onClosed()), this.isOpen;
  }
  /**
   * Stop detection and cleanup resources
   */
  destroy() {
    this.intervalId && (clearInterval(this.intervalId), this.intervalId = void 0), this.workerConsole && (this.workerConsole.destroy(), this.workerConsole = void 0), this.isOpen = !1, this.checkCount = 0;
  }
}
class Yr {
  constructor(t) {
    if (this.detected = !1, !t.onDetected)
      throw new Error("onDetected callback is required");
    this.options = t, this.setupDetection();
  }
  isIframed() {
    try {
      return window.self !== window.top ? { isEmbedded: !0, isCrossOrigin: !window.top.location.href } : { isEmbedded: !1, isCrossOrigin: !1 };
    } catch {
      return { isEmbedded: !0, isCrossOrigin: !0 };
    }
  }
  setupDetection() {
    const { isEmbedded: t, isCrossOrigin: e } = this.isIframed();
    if (t) {
      this.handleDetected(e);
      return;
    }
    this.observer = new MutationObserver(() => {
      const { isEmbedded: i, isCrossOrigin: n } = this.isIframed();
      i && !this.detected && (this.handleDetected(n), this.observer?.disconnect());
    }), this.observer.observe(document.documentElement, {
      childList: !0,
      subtree: !0,
      attributes: !0
    }), window.addEventListener("unload", () => this.destroy());
  }
  handleDetected(t) {
    this.detected = !0, this.options.onDetected?.(t);
  }
  destroy() {
    this.observer?.disconnect(), this.observer = void 0, this.detected = !1;
  }
}
class qr {
  constructor(t = {}) {
    this.styleElement = null, this.beforePrintHandler = null, this.onPrintAttempt = t.onPrintAttempt, t.disable && this.setupPrintProtection(t.watermark);
  }
  setupPrintProtection(t) {
    const e = document.createElement("style");
    e.textContent = `
            @media print {
                body * {
                    display: none !important;
                }
                body::after {
                    content: "${t || "Printing has been disabled"}";
                    font-size: 200%;
                    display: block;
                    text-align: center;
                    margin-top: 50vh;
                    transform: translateY(-50%);
                }
            }
        `, document.head.appendChild(e), this.styleElement = e, this.beforePrintHandler = (i) => (i.preventDefault(), this.onPrintAttempt?.(), !1), window.addEventListener("beforeprint", this.beforePrintHandler);
  }
  destroy() {
    this.beforePrintHandler && (window.removeEventListener("beforeprint", this.beforePrintHandler), this.beforePrintHandler = null), this.styleElement?.parentNode && (this.styleElement.parentNode.removeChild(this.styleElement), this.styleElement = null);
  }
}
class Kr {
  constructor(t = {}) {
    this.onContextMenuBlocked = t.onContextMenuBlocked, this.contextMenuHandler = this.handleContextMenu.bind(this), document.addEventListener("contextmenu", this.contextMenuHandler, !0), window.addEventListener("unload", () => this.destroy());
  }
  handleContextMenu(t) {
    t.preventDefault(), t.stopPropagation();
    const e = {
      type: "context_menu",
      timestamp: Date.now(),
      clientX: t.clientX,
      clientY: t.clientY,
      targetFrameSrc: ""
    };
    return this.onContextMenuBlocked && this.onContextMenuBlocked(e), !1;
  }
  destroy() {
    this.contextMenuHandler && (document.removeEventListener("contextmenu", this.contextMenuHandler, !0), this.contextMenuHandler = void 0);
  }
}
const ct = "readium:navigator:suspiciousActivity";
class Qe {
  dispatchSuspiciousActivity(t, e) {
    const i = new CustomEvent(ct, {
      detail: {
        type: t,
        timestamp: Date.now(),
        ...e
      }
    });
    window.dispatchEvent(i);
  }
  constructor(t = {}) {
    t.monitorDevTools && (this.devToolsDetector = new Xr({
      onDetected: () => {
        this.dispatchSuspiciousActivity("developer_tools", {
          targetFrameSrc: "",
          key: "",
          code: "",
          keyCode: -1,
          ctrlKey: !1,
          altKey: !1,
          shiftKey: !1,
          metaKey: !1
        });
      }
    })), t.checkAutomation && (this.automationDetector = new Hr({
      onDetected: (e) => {
        this.dispatchSuspiciousActivity("automation_detected", { tool: e });
      }
    })), t.checkIFrameEmbedding && (this.iframeEmbeddingDetector = new Yr({
      onDetected: (e) => {
        this.dispatchSuspiciousActivity("iframe_embedding_detected", { isCrossOrigin: e });
      }
    })), t.protectPrinting?.disable && (this.printProtector = new qr({
      ...t.protectPrinting,
      onPrintAttempt: () => {
        this.dispatchSuspiciousActivity("print", {});
      }
    })), t.disableContextMenu && (this.contextMenuProtector = new Kr({
      onContextMenuBlocked: (e) => {
        this.dispatchSuspiciousActivity("context_menu", e);
      }
    }));
  }
  destroy() {
    this.automationDetector?.destroy(), this.devToolsDetector?.destroy(), this.iframeEmbeddingDetector?.destroy(), this.printProtector?.destroy(), this.contextMenuProtector?.destroy();
  }
}
const dt = "readium:navigator:keyboardPeripheral";
class ti {
  constructor(t = {}) {
    this.keyManager = new Sn(), this.setupKeyboardPeripherals(t.keyboardPeripherals || []);
  }
  setupKeyboardPeripherals(t) {
    if (t.length > 0) {
      const e = (i) => {
        const n = new CustomEvent(dt, {
          detail: i
        });
        window.dispatchEvent(n);
      };
      this.keydownHandler = this.keyManager.createUnifiedHandler(
        "",
        // Empty string as target frame source for main window
        t,
        e
      ), this.keydownHandler && document.addEventListener("keydown", this.keydownHandler, !0);
    }
    window.addEventListener("unload", () => this.destroy());
  }
  destroy() {
    this.keydownHandler && (document.removeEventListener("keydown", this.keydownHandler, !0), this.keydownHandler = void 0);
  }
}
const Jr = (r) => ({
  frameLoaded: r.frameLoaded || (() => {
  }),
  positionChanged: r.positionChanged || (() => {
  }),
  tap: r.tap || (() => !1),
  click: r.click || (() => !1),
  zoom: r.zoom || (() => {
  }),
  scroll: r.scroll || (() => {
  }),
  customEvent: r.customEvent || (() => {
  }),
  handleLocator: r.handleLocator || (() => !1),
  textSelected: r.textSelected || (() => {
  }),
  contentProtection: r.contentProtection || (() => {
  }),
  contextMenu: r.contextMenu || (() => {
  }),
  peripheral: r.peripheral || (() => {
  })
});
class Zr extends Pn {
  constructor(t, e, i, n = void 0, s = { preferences: {}, defaults: {} }) {
    super(), this.currentIndex = 0, this._preferencesEditor = null, this._injector = null, this._isNavigating = !1, this._navigatorProtector = null, this._keyboardPeripheralsManager = null, this._suspiciousActivityListener = null, this._keyboardPeripheralListener = null, this._decorations = /* @__PURE__ */ new Map(), this._decorationObservers = /* @__PURE__ */ new Map(), this._decorationActivationState = /* @__PURE__ */ new Map(), this._decorationActivationConsumed = !1, this.webViewport = {
      readingOrder: [],
      progressions: /* @__PURE__ */ new Map(),
      positions: null
    }, this.pub = e, this.container = t, this.listeners = Jr(i), this._preferences = new Ut(s.preferences), this._defaults = new Fr(s.defaults), this._settings = new zi(this._preferences, this._defaults, this.hasDisplayTransformability), this._css = new Tr({
      rsProperties: new Ar({ experiments: this._settings.experiments || null }),
      userProperties: new _n({ zoom: this._settings.zoom })
    });
    const o = Ur(e.readingOrder.items), a = s.injectables || { rules: [], allowedDomains: [] };
    if (this._injector = new Rn({
      rules: [...o, ...a.rules],
      allowedDomains: a.allowedDomains
    }), this._contentProtection = s.contentProtection || {}, this._decoratorConfig = s.decoratorConfig || {}, this._keyboardPeripherals = this.mergeKeyboardPeripherals(
      this._contentProtection,
      s.keyboardPeripherals || []
    ), (this._contentProtection.disableContextMenu || this._contentProtection.checkAutomation || this._contentProtection.checkIFrameEmbedding || this._contentProtection.monitorDevTools || this._contentProtection.protectPrinting?.disable) && (this._navigatorProtector = new Qe(this._contentProtection), this._suspiciousActivityListener = (l) => {
      const { type: d, ...h } = l.detail;
      d === "context_menu" ? this.listeners.contextMenu(h) : this.listeners.contentProtection(d, h);
    }, window.addEventListener(ct, this._suspiciousActivityListener)), this._keyboardPeripherals.length > 0 && (this._keyboardPeripheralsManager = new ti({
      keyboardPeripherals: this._keyboardPeripherals
    }), this._keyboardPeripheralListener = (l) => {
      const d = l.detail;
      this.listeners.peripheral(d);
    }, window.addEventListener(dt, this._keyboardPeripheralListener)), n && typeof n.copyWithLocations == "function") {
      this.currentLocation = n;
      const l = this.pub.readingOrder.findIndexWithHref(n.href);
      l >= 0 && (this.currentIndex = l);
    } else
      this.currentLocation = this.createCurrentLocator();
  }
  async load() {
    await this.updateCSS(!1);
    const t = this.compileCSSProperties(this._css);
    this.framePool = new Js(
      this.container,
      t,
      this._injector,
      this._contentProtection,
      this._keyboardPeripherals
    ), await this.apply();
  }
  // Configurable interface implementation
  get settings() {
    return Object.freeze({ ...this._settings });
  }
  get preferencesEditor() {
    return this._preferencesEditor === null && (this._preferencesEditor = new Ii(this._preferences, this.settings, this.pub.metadata)), this._preferencesEditor;
  }
  async submitPreferences(t) {
    this._preferences = this._preferences.merging(t), await this.applyPreferences();
  }
  async applyPreferences() {
    this._settings = new zi(this._preferences, this._defaults, this.hasDisplayTransformability), this._preferencesEditor !== null && (this._preferencesEditor = new Ii(this._preferences, this.settings, this.pub.metadata)), await this.updateCSS(!0);
  }
  async updateCSS(t) {
    this._css.update(this._settings), t && await this.commitCSS(this._css);
  }
  compileCSSProperties(t) {
    const e = {};
    for (const [i, n] of Object.entries(t.rsProperties.toCSSProperties()))
      e[i] = n;
    for (const [i, n] of Object.entries(t.userProperties.toCSSProperties()))
      e[i] = n;
    return e;
  }
  async commitCSS(t) {
    const e = this.compileCSSProperties(t);
    this.framePool.setCSSProperties(e);
  }
  /**
   * Exposed to the public to compensate for lack of implemented readium conveniences
   * TODO remove when settings management is incorporated
   */
  get _cframes() {
    return this.framePool.currentFrames;
  }
  get hasDisplayTransformability() {
    return this.pub.metadata?.accessibility?.feature?.some(
      (t) => t.value === $t.DISPLAY_TRANSFORMABILITY.value
    ) ?? !1;
  }
  eventListener(t, e) {
    switch (t) {
      case "_pong":
        this.listeners.frameLoaded(this.framePool.currentFrames[0].iframe.contentWindow), this.listeners.positionChanged(this.currentLocation), this._reapplyDecorationsToCurrentFrame();
        break;
      case "first_visible_locator":
        const i = F.deserialize(e);
        if (!i) break;
        this.currentLocation = new F({
          href: this.currentLocation.href,
          type: this.currentLocation.type,
          title: this.currentLocation.title,
          locations: i?.locations,
          text: i?.text
        }), this.listeners.positionChanged(this.currentLocation);
        break;
      case "text_selected": {
        const l = e;
        l.locator = new F({ href: this.currentLocation.href, type: this.currentLocation.type, text: new tt({ highlight: l.text }) }), this.listeners.textSelected(l);
        break;
      }
      case "decoration_activated": {
        this._handleDecorationActivated(e) && (this._decorationActivationConsumed = !0);
        break;
      }
      case "click":
      case "tap":
        if (this._decorationActivationConsumed) {
          this._decorationActivationConsumed = !1;
          break;
        }
        const n = e;
        if (n.interactiveElement) {
          const l = new DOMParser().parseFromString(
            n.interactiveElement,
            "text/html"
          ).body.children[0];
          if (l.nodeType === l.ELEMENT_NODE && l.nodeName === "A" && l.hasAttribute("href")) {
            const d = l.attributes.getNamedItem("href")?.value;
            if (d.startsWith("#"))
              this.go(this.currentLocation.copyWithLocations({
                fragments: [d.substring(1)]
              }), !1, () => {
              });
            else if (d.startsWith("mailto:") || d.startsWith("tel:"))
              this.listeners.handleLocator(new q({
                href: d
              }).locator);
            else
              try {
                let h;
                if (d.startsWith("http://") || d.startsWith("https://"))
                  h = d;
                else if (this.currentLocation.href.startsWith("http://") || this.currentLocation.href.startsWith("https://")) {
                  const u = new URL(this.currentLocation.href);
                  h = new URL(d, u).href;
                } else
                  h = Zt.join(Zt.dirname(this.currentLocation.href), d);
                const c = this.pub.readingOrder.findWithHref(h);
                c ? this.goLink(c, !1, () => {
                }) : (console.warn(`Internal link not found in readingOrder: ${h}`), this.listeners.handleLocator(new q({
                  href: d
                }).locator));
              } catch (h) {
                console.warn(`Couldn't resolve internal link for ${d}: ${h}`), this.listeners.handleLocator(new q({
                  href: d
                }).locator);
              }
          } else console.log("Clicked on", l);
        } else if (t === "click" ? this.listeners.click(n) : this.listeners.tap(n)) break;
        break;
      case "scroll":
        this.listeners.scroll(e);
        break;
      case "zoom":
        this.listeners.zoom(e);
        break;
      case "progress":
        this.syncLocation(e);
        break;
      case "content_protection":
        const s = e;
        this.listeners.contentProtection(s.type, s);
        break;
      case "context_menu":
        this.listeners.contextMenu(e);
        break;
      case "keyboard_peripherals":
        const o = e, a = { ...o, interactiveElement: void 0 };
        o.interactiveElement && (a.interactiveElement = new DOMParser().parseFromString(
          o.interactiveElement,
          "text/html"
        ).body.children[0]), this.listeners.peripheral(a);
        break;
      case "log":
        console.log(this.framePool.currentFrames[0]?.source?.split("/")[3], ...e);
        break;
      default:
        this.listeners.customEvent(t, e);
        break;
    }
  }
  determineModules() {
    const t = Ws.slice(), e = Et(this.pub.metadata);
    return e === "cjk-vertical" || e === "mongolian-vertical" ? t.map((i) => i === "webpub_snapper" ? "cjk_vertical_snapper" : i) : t;
  }
  attachListener() {
    this.framePool.currentFrames[0]?.msg && (this.framePool.currentFrames[0].msg.listener = (t, e) => {
      this.eventListener(t, e);
    }), this._reapplyDecorationsToCurrentFrame();
  }
  async apply() {
    if (await this.framePool.update(this.pub, this.currentLocation, this.determineModules()), this.attachListener(), this.pub.readingOrder.findIndexWithHref(this.currentLocation.href) < 0)
      throw Error("Link for " + this.currentLocation.href + " not found!");
  }
  async destroy() {
    this._suspiciousActivityListener && window.removeEventListener(ct, this._suspiciousActivityListener), this._keyboardPeripheralListener && window.removeEventListener(dt, this._keyboardPeripheralListener), this._navigatorProtector?.destroy(), this._keyboardPeripheralsManager?.destroy(), await this.framePool?.destroy(), this._decorations.clear(), this._decorationObservers.clear(), this._decorationActivationState.clear();
  }
  // DecorableNavigator
  supportsDecorationStyle(t) {
    return Cn.has(t) || !!this._decoratorConfig.decorationTemplates?.[t];
  }
  registerDecorationObserver(t, e) {
    this._decorationObservers.has(t) || this._decorationObservers.set(t, /* @__PURE__ */ new Set()), this._decorationObservers.get(t).add(e), this._decorationActivationState.set(t, !0), this._sendDecorationActivatable(t, !0);
  }
  unregisterDecorationObserver(t) {
    this._decorationObservers.forEach((e, i) => {
      e.has(t) && (e.delete(t), e.size === 0 && (this._decorationActivationState.delete(i), this._sendDecorationActivatable(i, !1)));
    });
  }
  _sendDecorationActivatable(t, e) {
    const i = this.framePool?.currentFrames[0];
    i?.msg && i.msg.send("decoration_activatable", { group: t, activatable: e });
  }
  applyDecorations(t, e) {
    const i = this._decorations.get(e) ?? [], n = new Map(i.map((h) => [h.id, h])), s = new Map(t.map((h) => [h.id, h])), o = [], a = [], l = [];
    for (const [h, c] of n)
      s.has(h) ? En(c, s.get(h)) || l.push(s.get(h)) : o.push(h);
    for (const [h, c] of s)
      n.has(h) || a.push(c);
    this._decorations.set(e, t), this._sendDecorationOps(e, o, a, l, i);
    const d = this._decorationActivationState.get(e);
    d !== void 0 && this._sendDecorationActivatable(e, d);
  }
  _sendDecorationOps(t, e, i, n, s) {
    const o = this.framePool?.currentFrames[0];
    if (!o?.msg) return;
    const a = this.currentLocation.href, l = new Map(s.map((d) => [d.id, d]));
    for (const d of e) {
      const h = l.get(d);
      !h || h.locator.href !== a || o.msg.send("decorate", { group: t, action: "remove", decoration: { id: d } });
    }
    for (const d of i)
      d.locator.href === a && o.msg.send("decorate", { group: t, action: "add", decoration: Pt(d, this._decoratorConfig.decorationTemplates) });
    for (const d of n)
      d.locator.href === a && o.msg.send("decorate", { group: t, action: "update", decoration: Pt(d, this._decoratorConfig.decorationTemplates) });
  }
  _reapplyDecorationsToCurrentFrame() {
    const t = this.framePool?.currentFrames[0];
    if (!t?.msg) return;
    const e = this.currentLocation.href;
    for (const [i, n] of this._decorations) {
      const s = n.filter((o) => o.locator.href === e);
      if (s.length !== 0) {
        t.msg.send("decorate", { group: i, action: "clear" });
        for (const o of s)
          t.msg.send("decorate", { group: i, action: "add", decoration: Pt(o, this._decoratorConfig.decorationTemplates) });
      }
    }
    for (const [i, n] of this._decorationActivationState)
      t.msg.send("decoration_activatable", { group: i, activatable: n });
  }
  _handleDecorationActivated(t) {
    const e = this._decorationObservers.get(t.group);
    if (!e || e.size === 0) return !1;
    const i = (this._decorations.get(t.group) ?? []).find((o) => o.id === t.decorationId);
    if (!i) return !1;
    const n = { decoration: i, group: t.group, rect: t.rect, point: t.point };
    let s = !1;
    for (const o of e)
      o.onDecorationActivated(n) && (s = !0);
    return s;
  }
  // End of DecorableNavigator
  async changeResource(t) {
    if (t === 0) return !1;
    const e = this.pub.readingOrder.findIndexWithHref(this.currentLocation.href), i = Math.max(
      0,
      Math.min(this.pub.readingOrder.items.length - 1, e + t)
    );
    return i === e ? !1 : (this.currentIndex = i, this.currentLocation = this.createCurrentLocator(), await this.apply(), !0);
  }
  updateViewport(t) {
    this.webViewport.readingOrder = [], this.webViewport.progressions.clear(), this.webViewport.positions = null, this.currentLocation && (this.webViewport.readingOrder.push(this.currentLocation.href), this.webViewport.progressions.set(this.currentLocation.href, t), this.currentLocation.locations?.position !== void 0 && (this.webViewport.positions = [this.currentLocation.locations.position]));
  }
  async syncLocation(t) {
    const e = t;
    this.currentLocation && (this.currentLocation = this.currentLocation.copyWithLocations({
      progression: e.start
    })), this.updateViewport(e), this.listeners.positionChanged(this.currentLocation), await this.framePool.update(this.pub, this.currentLocation, this.determineModules());
  }
  goBackward(t, e) {
    if (this._isNavigating) {
      e(!1);
      return;
    }
    this._isNavigating = !0, this.changeResource(-1).then((i) => {
      this._isNavigating = !1, e(i);
    });
  }
  goForward(t, e) {
    if (this._isNavigating) {
      e(!1);
      return;
    }
    this._isNavigating = !0, this.changeResource(1).then((i) => {
      this._isNavigating = !1, e(i);
    });
  }
  get currentLocator() {
    return this.currentLocation;
  }
  get viewport() {
    return this.webViewport;
  }
  get isScrollStart() {
    const t = this.viewport.readingOrder[0];
    return this.viewport.progressions.get(t)?.start === 0;
  }
  get isScrollEnd() {
    const t = this.viewport.readingOrder[this.viewport.readingOrder.length - 1];
    return this.viewport.progressions.get(t)?.end === 1;
  }
  get canGoBackward() {
    const t = this.pub.readingOrder.items[0]?.href;
    return !(this.viewport.progressions.has(t) && this.viewport.progressions.get(t)?.start === 0);
  }
  get canGoForward() {
    const t = this.pub.readingOrder.items[this.pub.readingOrder.items.length - 1]?.href;
    return !(this.viewport.progressions.has(t) && this.viewport.progressions.get(t)?.end === 1);
  }
  get readingProgression() {
    return this.pub.metadata.effectiveReadingProgression;
  }
  get publication() {
    return this.pub;
  }
  async loadLocator(t, e) {
    let i = !1, n = typeof t.locations.getCssSelector == "function" && t.locations.getCssSelector();
    if (t.text?.highlight ? i = await new Promise((l, d) => {
      this.framePool.currentFrames[0].msg.send(
        "go_text",
        n ? [
          t.text?.serialize(),
          n
          // Include CSS selector if it exists
        ] : t.text?.serialize(),
        (h) => l(h)
      );
    }) : n && (i = await new Promise((l, d) => {
      this.framePool.currentFrames[0].msg.send(
        "go_text",
        [
          "",
          // No text!
          n
          // Just CSS selector
        ],
        (h) => l(h)
      );
    })), i) {
      e(i);
      return;
    }
    const s = typeof t.locations.htmlId == "function" && t.locations.htmlId();
    if (s && (i = await new Promise((l, d) => {
      this.framePool.currentFrames[0].msg.send("go_id", s, (h) => l(h));
    })), i) {
      e(i);
      return;
    }
    const o = t?.locations?.progression;
    o && o > 0 ? i = await new Promise((l, d) => {
      this.framePool.currentFrames[0].msg.send("go_progression", o, (h) => l(h));
    }) : i = !0, e(i);
  }
  go(t, e, i) {
    const n = t.href.split("#")[0];
    if (!this.pub.readingOrder.findWithHref(n))
      return i(this.listeners.handleLocator(t));
    const o = this.pub.readingOrder.findIndexWithHref(n);
    if (o >= 0 && (this.currentIndex = o), this._isNavigating) {
      i(!1);
      return;
    }
    this._isNavigating = !0, this.currentLocation = this.createCurrentLocator(), this.apply().then(() => this.loadLocator(t, (a) => {
      this._isNavigating = !1, i(a);
    })).then(() => {
      this.attachListener();
    });
  }
  goLink(t, e, i) {
    return this.go(t.locator, e, i);
  }
  // Specifics to WebPub
  // Util method
  createCurrentLocator() {
    const e = this.pub.readingOrder.items[this.currentIndex];
    if (!e)
      throw new Error("No current resource available");
    const n = this.currentLocation && this.currentLocation.href === e.href && this.currentLocation.locations.progression ? this.currentLocation.locations.progression : 0;
    return this.pub.manifest.locatorFromLink(e) || new F({
      href: e.href,
      type: e.type || "text/html",
      locations: new L({
        fragments: [],
        progression: n,
        position: this.currentIndex + 1
      })
    });
  }
}
const Wo = Zr, Qr = (r) => {
  const t = [...r, "http://asset.localhost", "https://asset.localhost", "asset:"].join(" ");
  return [
    // 'self' is useless because the document is loaded from a blob: URL
    "upgrade-insecure-requests",
    `default-src ${t} blob:`,
    "connect-src 'none'",
    // No fetches to anywhere. TODO: change?
    `script-src ${t} blob: 'unsafe-inline'`,
    // JS scripts
    `style-src ${t} blob: 'unsafe-inline'`,
    // CSS styles
    `img-src ${t} blob: data:`,
    // Images
    `font-src ${t} blob: data:`,
    // Fonts
    `object-src ${t} blob:`,
    // Despite not being recommended, still necessary in EPUBs for <object>
    `child-src ${t}`,
    // <iframe>, web workers
    "form-action 'none'"
    // No form submissions
    //`report-uri ?`,
  ].join("; ");
};
class Nn {
  constructor(t, e, i, n) {
    this.injector = null, this.pub = t, this.item = i, this.burl = i.toURL(e) || "", this.cssProperties = n.cssProperties, this.injector = n.injector ?? null;
  }
  async build(t = !1) {
    if (this.item.mediaType.isHTML)
      return await this.buildHtmlFrame(t);
    if (this.item.mediaType.isBitmap || this.item.mediaType.equals(g.SVG))
      return this.buildImageFrame();
    throw Error("Unsupported frame mediatype " + this.item.mediaType.string);
  }
  async buildHtmlFrame(t = !1) {
    const e = await this.pub.get(this.item).readAsString();
    if (!e) throw new Error(`Failed reading item ${this.item.href}`);
    const i = new DOMParser().parseFromString(
      e,
      this.item.mediaType.string
    ), n = i.querySelector("parsererror");
    if (n) {
      const s = n.querySelector("div");
      throw new Error(`Failed parsing item ${this.item.href}: ${s?.textContent || n.textContent}`);
    }
    return this.injector && await this.injector.injectForDocument(i, this.item), this.finalizeDOM(i, this.pub.baseURL, this.burl, this.item.mediaType, t, this.cssProperties);
  }
  buildImageFrame() {
    const t = document.implementation.createHTMLDocument(this.item.title || this.item.href), e = document.createElement("img");
    return e.src = this.burl || "", e.alt = this.item.title || "", e.decoding = "async", t.body.appendChild(e), this.finalizeDOM(t, this.pub.baseURL, this.burl, this.item.mediaType, !0);
  }
  setProperties(t, e) {
    for (const i in t) {
      const n = t[i];
      n && e.documentElement.style.setProperty(i, n);
    }
  }
  finalizeDOM(t, e, i, n, s = !1, o) {
    if (!t) return "";
    const a = this.injector?.getAllowedDomains?.() || [], l = [.../* @__PURE__ */ new Set([
      ...e ? [e] : [],
      ...a
    ])].filter(Boolean);
    if (o && !s && this.setProperties(o, t), t.body.querySelectorAll("img").forEach((c) => {
      c.setAttribute("fetchpriority", "high");
    }), n.isHTML && this.pub.metadata.languages?.[0]) {
      const c = this.pub.metadata.languages[0];
      if (n === g.XHTML) {
        const u = t.documentElement.lang || t.documentElement.getAttribute("xml:lang"), m = t.body.lang || t.body.getAttribute("xml:lang");
        m && !u ? (t.documentElement.lang = m, t.documentElement.setAttribute("xml:lang", m), t.body.removeAttribute("xml:lang"), t.body.removeAttribute("lang")) : u || (t.documentElement.lang = c, t.documentElement.setAttribute("xml:lang", c));
      } else n === g.HTML && !t.documentElement.lang && (t.documentElement.lang = c);
    }
    if (Et(this.pub.metadata) === "rtl" && !t.documentElement.dir && !t.body.dir && (t.documentElement.dir = I.rtl), i !== void 0) {
      const c = t.createElement("base");
      c.href = i, c.dataset.readium = "true", t.head.firstChild.before(c);
    }
    const h = t.createElement("meta");
    return h.httpEquiv = "Content-Security-Policy", h.content = Qr(l), h.dataset.readium = "true", t.head.firstChild.before(h), URL.createObjectURL(
      new Blob([new XMLSerializer().serializeToString(t)], {
        type: n.isHTML ? n.string : "application/xhtml+xml"
        // Fallback to XHTML
      })
    );
  }
}
class Mn {
  constructor(t, e = {}, i = []) {
    this.hidden = !0, this.destroyed = !1, this.currModules = [], this.preparedLayoutKey = void 0, this.frame = document.createElement("iframe"), this.frame.classList.add("readium-navigator-iframe"), this.frame.style.visibility = "hidden", this.frame.style.setProperty("aria-hidden", "true"), this.frame.style.opacity = "0", this.frame.style.position = "absolute", this.frame.style.pointerEvents = "none", this.frame.style.transition = "visibility 0s, opacity 0.1s linear", this.source = t, this.contentProtectionConfig = { ...e }, this.keyboardPeripheralsConfig = [...i];
  }
  async load(t) {
    return new Promise((e, i) => {
      if (this.loader) {
        const n = this.frame.contentWindow;
        if ([...this.currModules].sort().join("|") === [...t].sort().join("|")) {
          try {
            e(n);
          } catch {
          }
          return;
        }
        this.preparedLayoutKey = void 0, this.comms?.halt(), this.loader.destroy(), this.loader = new Lt(n, t), this.currModules = t, this.comms = void 0;
        try {
          e(n);
        } catch {
        }
        return;
      }
      this.frame.onload = () => {
        const n = this.frame.contentWindow;
        this.loader = new Lt(n, t), this.currModules = t;
        try {
          e(n);
        } catch {
        }
      }, this.frame.onerror = (n) => {
        try {
          i(n);
        } catch {
        }
      }, this.frame.contentWindow.location.replace(this.source);
    });
  }
  applyContentProtection() {
    this.comms || this.comms.resume(), this.comms.send("peripherals_protection", this.contentProtectionConfig), this.keyboardPeripheralsConfig && this.keyboardPeripheralsConfig.length > 0 && (this.conditionBridge?.destroy(), this.conditionBridge = new Ke(
      this.keyboardPeripheralsConfig,
      (t) => {
        t.length > 0 && this.comms.send("keyboard_peripherals", t);
      }
    ), this.conditionBridge.setup()), this.contentProtectionConfig.monitorScrollingExperimental && this.comms.send("scroll_protection", {}), this.contentProtectionConfig.protectPrinting?.disable && this.comms.send("print_protection", this.contentProtectionConfig.protectPrinting);
  }
  async destroy() {
    this.conditionBridge?.destroy(), await this.hide(), this.loader?.destroy(), this.frame.remove(), this.destroyed = !0;
  }
  async hide() {
    if (!this.destroyed) {
      if (this.frame.style.visibility = "hidden", this.frame.style.setProperty("aria-hidden", "true"), this.frame.style.opacity = "0", this.frame.style.pointerEvents = "none", this.hidden = !0, this.frame.blur(), this.frame.parentElement)
        return this.comms === void 0 || !this.comms.ready ? void 0 : new Promise((t) => {
          const e = this.comms;
          let i = !1, n;
          const s = () => {
            i || (i = !0, window.clearTimeout(o), this.comms === e && this.hidden ? e?.halt() : n && e?.forget(n), t());
          }, o = window.setTimeout(s, 250);
          n = e?.send("unfocus", void 0, s);
        });
      this.comms?.halt();
    }
  }
  async show(t) {
    if (this.destroyed) throw Error("Trying to show frame when it doesn't exist");
    if (!this.frame.parentElement) throw Error("Trying to show frame that is not attached to the DOM");
    return this.comms ? this.comms.resume() : this.comms = new Dt(this.frame.contentWindow, this.source), new Promise((e, i) => {
      this.comms?.send("activate", void 0, () => {
        if (t !== void 0 && this.currModules.includes("column_snapper")) {
          this.comms?.send("focus_progression", t, () => {
            this.applyContentProtection();
            this.frame.style.removeProperty("visibility"), this.frame.style.removeProperty("aria-hidden"), this.frame.style.removeProperty("opacity"), this.frame.style.removeProperty("pointer-events"), this.hidden = !1, e();
          });
          return;
        }
        this.comms?.send("focus", void 0, () => {
          this.applyContentProtection();
          const n = () => {
            this.frame.style.removeProperty("visibility"), this.frame.style.removeProperty("aria-hidden"), this.frame.style.removeProperty("opacity"), this.frame.style.removeProperty("pointer-events"), this.hidden = !1, X.UA.WebKit && this.comms?.send("force_webkit_recalc", void 0), e();
          };
          t !== void 0 ? this.comms?.send("go_progression", t, n) : n();
        });
      });
    });
  }
  setCSSProperties(t) {
    this.preparedLayoutKey = void 0, this.destroyed || !this.frame.contentWindow || (this.hidden && (this.comms ? this.comms?.resume() : this.comms = new Dt(this.frame.contentWindow, this.source)), this.comms?.send("update_properties", t), this.hidden && this.comms?.halt());
  }
  get iframe() {
    if (this.destroyed) throw Error("Trying to use frame when it doesn't exist");
    return this.frame;
  }
  get realSize() {
    if (this.destroyed) throw Error("Trying to use frame client rect when it doesn't exist");
    return this.frame.getBoundingClientRect();
  }
  get isDestroyed() {
    return this.destroyed;
  }
  get window() {
    if (this.destroyed || !this.frame.contentWindow) throw Error("Trying to use frame window when it doesn't exist");
    return this.frame.contentWindow;
  }
  get atLeft() {
    return this.window.scrollX < 5;
  }
  get atRight() {
    return this.window.scrollX > this.window.document.scrollingElement.scrollWidth - this.window.innerWidth - 5;
  }
  get msg() {
    return this.comms;
  }
  get ldr() {
    return this.loader;
  }
}
// Keep the current resource plus a symmetric three-resource L1 layout band.
// Scrolled mode uses the same seven-resource window in the host strip, while
// paginated modes retain these prepared frames for boundary turns/reversals.
const Wi = 7;
class to {
  constructor(t, e, i, n, s, o) {
    this.pool = /* @__PURE__ */ new Map(), this.blobs = /* @__PURE__ */ new Map(), this.inprogress = /* @__PURE__ */ new Map(), this.constructing = /* @__PURE__ */ new Map(), this.pendingUpdates = /* @__PURE__ */ new Map(), this.injector = null, this.reservedHref = void 0, this.reservationGeneration = 0, this.currentHref = void 0, this.container = t, this.positions = e, this.currentCssProperties = i, this.injector = n ?? null, this.contentProtectionConfig = s || {}, this.keyboardPeripheralsConfig = o || [];
  }
  releaseBlob(t) {
    if (t === this.currentHref || t === this.reservedHref || this.pool.has(t) || this.inprogress.has(t) || this.constructing.has(t))
      return;
    const e = this.blobs.get(t);
    e && (this.blobs.delete(t), this.pendingUpdates.delete(t), this.injector?.releaseBlobUrl?.(e), URL.revokeObjectURL(e));
  }
  pruneBlobs() {
    for (const t of Array.from(this.blobs.keys()))
      this.releaseBlob(t);
  }
  evict(t) {
    const e = this.pool.get(t);
    if (!e)
      return;
    this.pool.get(t) === e && this.pool.delete(t), this.pendingUpdates.has(t) && this.pendingUpdates.set(t, { inPool: !1 }), e.comms?.halt(), e.frame.remove(), this.releaseBlob(t), Promise.resolve(e.destroy()).catch(() => {
    });
  }
  enforceLimit(t = []) {
    const e = [this.currentHref, this.reservedHref, ...t].filter((i, n, s) => i && s.indexOf(i) === n), i = new Set(e.slice(0, Wi));
    for (const n of this.pool.keys()) {
      if (this.pool.size <= Wi)
        break;
      i.has(n) || this.evict(n);
    }
    for (const n of this.pool.keys()) {
      if (this.pool.size <= Wi)
        break;
      n !== this.currentHref && n !== this.reservedHref && this.evict(n);
    }
  }
  reserve(t) {
    const e = t === this.currentHref ? void 0 : t;
    this.reservedHref !== e && (this.reservedHref = e, this.reservationGeneration += 1);
    const i = new Set([this.currentHref, e]), n = e && !this.pool.has(e) ? 1 : 0;
    for (const s of Array.from(this.pool.keys())) {
      if (this.pool.size + n <= Wi)
        break;
      i.has(s) || this.evict(s);
    }
    this.enforceLimit(), this.pruneBlobs();
    return this.reservationGeneration;
  }
  release(t) {
    (t === void 0 || this.reservedHref === t) && this.reservedHref !== void 0 && (this.reservedHref = void 0, this.reservationGeneration += 1, this.enforceLimit(), this.pruneBlobs());
  }
  async claimConstructionSlot(t, e) {
    for (; e(); ) {
      if (this.pool.has(t))
        return;
      if (this.constructing.has(t)) {
        await new Promise((i) => window.setTimeout(i, 4));
        continue;
      }
      if (this.pool.size + this.constructing.size < Wi) {
        const i = {};
        this.constructing.set(t, i);
        return i;
      }
      this.enforceLimit();
      await new Promise((i) => window.setTimeout(i, 4));
    }
  }
  async constructFrame(t, e, i, n, s) {
    if (!s())
      return;
    const o = await this.claimConstructionSlot(e, s);
    if (!o)
      return this.pool.get(e);
    let a;
    try {
      if (!s()) return;
      let l = this.blobs.get(e);
      if (!l) {
        const d = t.readingOrder.findWithHref(e);
        if (!d) return;
        l = await new Nn(t, this.currentBaseURL || "", d, {
          cssProperties: this.currentCssProperties,
          injector: this.injector
        }).build(), this.blobs.set(e, l);
      }
      if (!s()) return;
      a = new Mn(l, this.contentProtectionConfig, this.keyboardPeripheralsConfig), n && await a.hide();
      if (!s()) return;
      this.container.appendChild(a.iframe), await a.load(i);
      if (!s()) return;
      const d = this.pool.get(e);
      d && d !== a && this.evict(e), this.pool.set(e, a), this.enforceLimit([e]);
      return a;
    } finally {
      if (a && this.pool.get(e) !== a)
        a.comms?.halt(), a.frame.remove(), await a.destroy().catch(() => {
        });
      this.constructing.get(e) === o && this.constructing.delete(e), this.pruneBlobs();
    }
  }
  async destroy() {
    this.release();
    let t = this.inprogress.values(), e = t.next();
    const i = [];
    for (; e.value; )
      i.push(e.value), e = t.next();
    i.length > 0 && await Promise.allSettled(i), this.inprogress.clear();
    let n = this.pool.values(), s = n.next();
    for (; s.value; )
      await s.value.destroy(), s = n.next();
    this.pool.clear(), this.blobs.forEach((o) => {
      this.injector?.releaseBlobUrl?.(o), URL.revokeObjectURL(o);
    }), this.injector?.dispose(), this.container.childNodes.forEach((o) => {
      (o.nodeType === Node.ELEMENT_NODE || o.nodeType === Node.TEXT_NODE) && o.remove();
    });
  }
  async update(t, e, i, n = !1) {
    let s = this.positions.findIndex((l) => l.locations.position === e.locations.position);
    if (s < 0) throw Error(`Locator not found in position list: ${e.locations.position} > ${this.positions.reduce((l, d) => d.locations.position || 0 > l ? d.locations.position || 0 : l, 0)}`);
    const o = this.positions[s].href;
    this.currentHref = o, n ? this.release() : this.release(o);
    const l = this.inprogress.get(o);
    l && await l;
    const a = (async () => {
      if (n) {
        // A layout-mode transition (paged <-> scrolled) changes the modules and
        // the CSS baked into every publication blob. Merely calling release()
        // keeps the current frame/blob alive, so update() reloads the same
        // paginated document while the navigator already reports `scrolled`.
        // Dispose the old generation completely before constructing the new
        // current frame and its bounded neighbours.
        const p = Array.from(this.pool.values());
        this.pool.clear(), this._currentFrame = void 0;
        await Promise.allSettled(p.map(async (f) => {
          f.comms?.halt(), f.frame.remove(), await f.destroy();
        }));
        this.blobs.forEach((f) => {
          this.injector?.releaseBlobUrl?.(f), URL.revokeObjectURL(f);
        }), this.blobs.clear(), this.pendingUpdates.clear();
      }
      const h = Array.from(this.pool.keys()).filter((p) => p !== o && p !== this.reservedHref), c = [o, this.reservedHref, ...h].filter((p, f, b) => p && b.indexOf(p) === f).slice(0, Wi);
      for (const p of Array.from(this.pool.keys()))
        c.includes(p) || this.evict(p);
      this.currentBaseURL !== void 0 && t.baseURL !== this.currentBaseURL && (this.blobs.forEach((p, f) => {
        this.pendingUpdates.set(f, { inPool: this.pool.has(f) });
      }), this.pruneBlobs()), this.currentBaseURL = t.baseURL;
      const u = async (p) => {
        p !== o && this.inprogress.has(p) && await this.inprogress.get(p);
        const S = this.reservationGeneration, f = () => p === this.currentHref || S === this.reservationGeneration && this.reservedHref === p;
        if (!f()) return;
        if (n && (this.blobs.forEach((C, b) => {
          this.pendingUpdates.set(b, { inPool: this.pool.has(b) });
        }), this.pruneBlobs()), this.pendingUpdates.has(p) && this.pendingUpdates.get(p)?.inPool === !1) {
          const C = this.blobs.get(p);
          C && (this.injector?.releaseBlobUrl?.(C), URL.revokeObjectURL(C), this.blobs.delete(p), this.pendingUpdates.delete(p));
        }
        if (this.pool.has(p)) {
          const C = this.pool.get(p);
          if (!this.blobs.has(p))
            this.pool.get(p) === C && this.pool.delete(p), this.pendingUpdates.delete(p), await C.destroy();
          else {
            await C.load(i);
            f() || this.evict(p);
            return;
          }
        }
        await this.constructFrame(t, p, i, p !== o, f);
      };
      await Promise.all(c.map((p) => u(p)));
      if (this.currentHref !== o) return;
      const m = this.pool.get(o);
      if ((m?.source !== this._currentFrame?.source || n) && (await this._currentFrame?.hide(), m && await m.load(i), m && await m.show(e.locations.progression), this._currentFrame = m, m)) {
        const p = this.container.ownerDocument.activeElement;
        p && p.tagName === "IFRAME" && p !== m.iframe && m.iframe.focus({ preventScroll: !0 });
      }
    })();
    this.inprogress.set(o, a);
    try {
      await a;
    } finally {
      this.inprogress.get(o) === a && this.inprogress.delete(o), this.pruneBlobs();
    }
  }
  async prepare(t, e, i, n = !1) {
    const s = this.reservationGeneration, l = () => this.currentHref === e || s === this.reservationGeneration && this.reservedHref === e;
    const o = t.readingOrder.findWithHref(e);
    if (!o || n && !l())
      return;
    const d = this.inprogress.get(e);
    if (d)
      return await d;
    const a = this.pool.get(e);
    if (a && this.blobs.has(e)) {
      if (n && !l()) return;
      await a.load(i);
      return;
    }
    const h = (async () => {
      const c = await this.constructFrame(t, e, i, !0, () => !n || l());
      if (c && n && !l()) this.evict(e);
    })();
    this.inprogress.set(e, h);
    try {
      await h;
    } finally {
      this.inprogress.get(e) === h && this.inprogress.delete(e), this.pruneBlobs();
    }
  }
  setCSSProperties(t) {
    if (!((i, n) => {
      const s = Object.keys(i), o = Object.keys(n);
      if (s.length !== o.length)
        return !1;
      for (const a of s)
        if (i[a] !== n[a])
          return !1;
      return !0;
    })(this.currentCssProperties || {}, t)) {
      this.release(), this.currentCssProperties = t, this.pool.forEach((i) => {
        i.setCSSProperties(t);
      });
      for (const i of this.blobs.keys())
        this.pendingUpdates.set(i, { inPool: this.pool.has(i) });
    }
  }
  get currentFrames() {
    return [this._currentFrame];
  }
  get currentBounds() {
    const t = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      toJSON() {
        return this;
      }
    };
    return this.currentFrames.forEach((e) => {
      if (!e) return;
      const i = e.realSize;
      t.x = Math.min(t.x, i.x), t.y = Math.min(t.y, i.y), t.width += i.width, t.height = Math.max(t.height, i.height), t.top = Math.min(t.top, i.top), t.right = Math.min(t.right, i.right), t.bottom = Math.min(t.bottom, i.bottom), t.left = Math.min(t.left, i.left);
    }), t;
  }
}
class eo {
  constructor(t, e, i, n = {}, s = []) {
    this.currModules = [], this.cachedPage = void 0, this.peripherals = t, this.debugHref = i, this.contentProtectionConfig = { ...n }, this.keyboardPeripheralsConfig = [...s], this.frame = document.createElement("iframe"), this.frame.classList.add("readium-navigator-iframe"), this.frame.classList.add("blank"), this.frame.scrolling = "no", this.frame.style.visibility = "hidden", this.frame.style.setProperty("aria-hidden", "true"), this.frame.style.display = "none", this.frame.style.position = "absolute", this.frame.style.pointerEvents = "none", this.frame.style.transformOrigin = "0 0", this.frame.style.transform = "scale(1)", this.frame.style.background = "#fff", this.frame.style.touchAction = "none", this.frame.dataset.originalHref = i, this.source = "about:blank", this.wrapper = document.createElement("div"), this.wrapper.style.position = "relative", this.wrapper.style.float = this.wrapper.style.cssFloat = e === I.rtl ? "right" : "left", this.wrapper.appendChild(this.frame);
  }
  async load(t, e) {
    return this.source === e && this.loadPromise && [...this.currModules].sort().join("|") === [...t].sort().join("|") ? this.loadPromise : (this.loaded && this.source !== e && this.window.stop(), this.source = e, this.loadPromise = new Promise((i, n) => {
      if (this.loader && this.loaded) {
        const s = this.frame.contentWindow;
        if ([...this.currModules].sort().join("|") === [...t].sort().join("|")) {
          try {
            i(s), this.loadPromise = void 0;
          } catch {
          }
          return;
        }
        this.comms?.halt(), this.loader.destroy(), this.loader = new Lt(s, t), this.currModules = t, this.comms = void 0;
        try {
          i(s), this.loadPromise = void 0;
        } catch {
        }
        return;
      }
      this.frame.addEventListener("load", () => {
        const s = this.frame.contentWindow;
        this.loader = new Lt(s, t), this.currModules = t, this.peripherals.observe(this.wrapper), this.peripherals.observe(s);
        try {
          i(s);
        } catch {
        }
      }, { once: !0 }), this.frame.addEventListener("error", (s) => {
        try {
          n(s.error), this.loadPromise = void 0;
        } catch {
        }
      }, { once: !0 }), this.frame.style.removeProperty("display"), this.frame.contentWindow.location.replace(this.source);
    }), this.loadPromise);
  }
  // Parses the page size from the viewport meta tag of the loaded resource.
  loadPageSize() {
    const t = this.frame.contentWindow, e = t.document.head.querySelector(
      "meta[name=viewport]"
    );
    if (e) {
      const i = /(\w+) *= *([^\s,]+)/g;
      let n, s = 0, o = 0;
      for (; n = i.exec(e.content); )
        n[1] === "width" ? s = Number.parseFloat(n[2]) : n[1] === "height" && (o = Number.parseFloat(n[2]));
      if (s > 0 && o > 0)
        return { width: s, height: o };
    }
    return {
      width: t.document.body.scrollWidth,
      height: t.document.body.scrollHeight
    };
  }
  update(t) {
    if (!this.loaded) return;
    const e = this.loadPageSize();
    this.frame.style.height = `${e.height}px`, this.frame.style.width = `${e.width}px`;
    const i = Math.min(this.wrapper.clientWidth / e.width, this.wrapper.clientHeight / e.height);
    this.frame.style.transform = `scale(${i})`;
    const n = this.frame.getBoundingClientRect(), s = this.wrapper.clientHeight - n.height;
    if (this.frame.style.top = `${s / 2}px`, t === K.left) {
      const o = this.wrapper.clientWidth - n.width;
      this.frame.style.left = `${o}px`;
    } else if (t === K.center) {
      const o = this.wrapper.clientWidth - n.width;
      this.frame.style.left = `${o / 2}px`;
    } else
      this.frame.style.left = "0px";
    this.frame.style.removeProperty("visibility"), this.frame.style.removeProperty("aria-hidden"), this.frame.style.removeProperty("pointer-events"), this.frame.classList.remove("blank"), this.frame.classList.add("loaded");
  }
  async destroy() {
    this.conditionBridge?.destroy(), await this.unfocus(), this.loader?.destroy(), this.wrapper.remove();
  }
  async unload() {
    if (this.loaded)
      return this.deselect(), this.frame.style.visibility = "hidden", this.frame.style.setProperty("aria-hidden", "true"), this.frame.style.pointerEvents = "none", this.frame.classList.add("blank"), this.frame.classList.remove("loaded"), this.comms?.halt(), this.loader?.destroy(), this.comms = void 0, this.frame.blur(), new Promise((t, e) => {
        this.frame.addEventListener("load", () => {
          try {
            this.showPromise = void 0, t();
          } catch {
          }
        }, { once: !0 }), this.frame.addEventListener("error", (i) => {
          try {
            this.showPromise = void 0, e(i.error);
          } catch {
          }
        }, { once: !0 }), this.source = "about:blank", this.frame.contentWindow.location.replace("about:blank"), this.frame.style.display = "none";
      });
  }
  deselect() {
    this.frame.contentWindow?.getSelection()?.removeAllRanges();
  }
  async unfocus() {
    if (this.frame.parentElement)
      return this.comms === void 0 ? void 0 : (this.frame.blur(), new Promise((t, e) => {
        this.comms?.send("unfocus", void 0, (i) => {
          this.comms?.halt(), this.showPromise = void 0, t();
        });
      }));
    this.comms?.halt();
  }
  applyContentProtection() {
    this.comms || this.comms.resume(), this.comms.send("peripherals_protection", this.contentProtectionConfig), this.keyboardPeripheralsConfig && this.keyboardPeripheralsConfig.length > 0 && (this.conditionBridge?.destroy(), this.conditionBridge = new Ke(
      this.keyboardPeripheralsConfig,
      (t) => {
        t.length > 0 && this.comms.send("keyboard_peripherals", t);
      }
    ), this.conditionBridge.setup()), this.contentProtectionConfig.protectPrinting?.disable && this.comms.send("print_protection", this.contentProtectionConfig.protectPrinting);
  }
  async show(t) {
    if (!this.frame.parentElement) {
      console.warn("Trying to show frame that is not attached to the DOM");
      return;
    }
    if (!this.loaded) {
      this.showPromise = void 0;
      return;
    }
    return this.showPromise ? (this.cachedPage !== t && (this.update(t), this.cachedPage = t), this.showPromise) : (this.cachedPage = t, this.comms ? this.comms.resume() : this.comms = new Dt(this.frame.contentWindow, this.source), this.showPromise = new Promise((e, i) => {
      this.comms.send("focus", void 0, (n) => {
        this.update(this.cachedPage), this.applyContentProtection(), e();
      });
    }), this.showPromise);
  }
  async activate() {
    return new Promise((t, e) => {
      if (!this.comms) return t();
      this.comms?.send("activate", void 0, () => {
        t();
      });
    });
  }
  get element() {
    return this.wrapper;
  }
  get iframe() {
    return this.frame;
  }
  get realSize() {
    return this.frame.getBoundingClientRect();
  }
  get loaded() {
    return this.frame.contentWindow && this.frame.contentWindow.location.href !== "about:blank";
  }
  set width(t) {
    const e = `${t}%`;
    this.wrapper.style.width !== e && (this.wrapper.style.width = e);
  }
  set height(t) {
    const e = `${t}px`;
    this.wrapper.style.height !== e && (this.wrapper.style.height = e);
  }
  get window() {
    if (!this.frame.contentWindow) throw Error("Trying to use frame window when it doesn't exist");
    return this.frame.contentWindow;
  }
  get atLeft() {
    return this.window.scrollX < 5;
  }
  get atRight() {
    return this.window.scrollX > this.window.document.scrollingElement.scrollWidth - this.window.innerWidth - 5;
  }
  get msg() {
    return this.comms;
  }
  get ldr() {
    return this.loader;
  }
}
var io = /* @__PURE__ */ ((r) => (r[r.Left = 0] = "Left", r[r.Center = 1] = "Center", r[r.Right = 2] = "Right", r))(io || {}), no = /* @__PURE__ */ ((r) => (r[r.Top = 0] = "Top", r[r.Middle = 1] = "Middle", r[r.Bottom = 2] = "Bottom", r))(no || {});
class so {
  constructor() {
    this.outerWidth = 0, this.outerHeight = 0, this.HTML = document.documentElement, this.Head = document.head, this.Body = document.body;
  }
  refreshOuterPixels(t) {
    X.OS.iOS || (this.outerHeight = window.outerHeight - window.innerHeight, X.OS.Android && X.UA.Chrome && window.screen.height > window.innerHeight && (this.outerHeight = (window.screen.height - window.innerHeight) / 1.5), this.outerWidth = window.outerWidth - window.innerWidth);
  }
  getBibiEventCoord(t, e = 0) {
    const i = { X: 0, Y: 0 };
    return /^touch/.test(t.type) ? (i.X = t.touches[e].screenX, i.Y = t.touches[e].screenY) : (i.X = t.screenX, i.Y = t.screenY), (t.target.ownerDocument?.documentElement || t.target.documentElement) === this.HTML && (i.X -= this.HTML.scrollLeft + this.Body.scrollLeft, i.Y -= this.HTML.scrollTop + this.Body.scrollTop), i.X -= this.outerWidth, i.Y -= this.outerHeight, i;
  }
  getTouchDistance(t) {
    if (t.touches.length !== 2) return 0;
    const e = t.touches[0].screenX - this.outerWidth, i = t.touches[0].screenY - this.outerHeight, n = t.touches[1].screenX - this.outerWidth, s = t.touches[1].screenY - this.outerHeight;
    return Math.sqrt(Math.pow(n - e, 2) + Math.pow(s - i, 2));
  }
  getTouchCenter(t) {
    if (t.touches.length !== 2) return null;
    const e = this.HTML.scrollLeft + this.Body.scrollLeft, i = this.HTML.scrollTop + this.Body.scrollTop, n = t.touches[0].screenX - this.outerWidth - e, s = t.touches[0].screenY - this.outerHeight - i, o = t.touches[1].screenX - this.outerWidth - e, a = t.touches[1].screenY - this.outerHeight - i;
    return { X: (n + o) / 2, Y: (s + a) / 2 };
  }
  getBibiEvent(t) {
    if (!t) return {
      Coord: null,
      Division: null,
      Ratio: null,
      Target: null
    };
    const e = this.getBibiEventCoord(t);
    let i = 0.3;
    const n = {
      X: e.X / window.innerWidth,
      Y: e.Y / window.innerHeight
    };
    let s, o, a, l;
    a = s = i, l = o = 1 - i;
    const d = {
      X: null,
      Y: null
    };
    return n.X < a ? d.X = 0 : l < n.X ? d.X = 2 : d.X = 1, n.Y < s ? d.Y = 0 : o < n.Y ? d.Y = 2 : d.Y = 1, {
      Target: t.target,
      Coord: e,
      Ratio: n,
      Division: d
    };
  }
}
class ro {
  constructor() {
    this._DOM = {
      show: !1,
      pinchTarget: document.createElement("div"),
      touch1: document.createElement("div"),
      touch2: document.createElement("div"),
      center: document.createElement("div"),
      stats: document.createElement("div")
    }, this._DOM.show = !0, this._DOM.pinchTarget.style.zIndex = this._DOM.stats.style.zIndex = this._DOM.center.style.zIndex = this._DOM.touch1.style.zIndex = this._DOM.touch2.style.zIndex = "100000", this._DOM.pinchTarget.style.position = this._DOM.stats.style.position = this._DOM.center.style.position = this._DOM.touch1.style.position = this._DOM.touch2.style.position = "absolute", this._DOM.pinchTarget.style.borderRadius = this._DOM.center.style.borderRadius = this._DOM.touch1.style.borderRadius = this._DOM.touch2.style.borderRadius = "50%", this._DOM.pinchTarget.style.pointerEvents = this._DOM.stats.style.pointerEvents = this._DOM.center.style.pointerEvents = this._DOM.touch1.style.pointerEvents = this._DOM.touch2.style.pointerEvents = "none", this._DOM.pinchTarget.style.display = this._DOM.center.style.display = this._DOM.touch1.style.display = this._DOM.touch2.style.display = "none", this._DOM.pinchTarget.style.paddingTop = this._DOM.center.style.paddingTop = "10px", this._DOM.pinchTarget.style.width = this._DOM.pinchTarget.style.height = this._DOM.center.style.width = this._DOM.center.style.height = "10px", this._DOM.pinchTarget.style.backgroundColor = "green", this._DOM.center.style.backgroundColor = "red", this._DOM.touch1.style.backgroundColor = this._DOM.touch2.style.backgroundColor = "blue", this._DOM.touch1.style.height = this._DOM.touch2.style.height = "20px", this._DOM.touch1.style.width = this._DOM.touch2.style.width = "20px", this._DOM.touch1.style.paddingTop = this._DOM.touch2.style.paddingTop = "20px", this._DOM.touch1.textContent = "1", this._DOM.touch2.textContent = "2", this._DOM.stats.style.padding = "20px", this._DOM.stats.style.backgroundColor = "rgba(0,0,0,0.5)", this._DOM.stats.style.color = "white", this._DOM.stats.textContent = "[stats]", document.body.appendChild(this._DOM.stats), document.body.appendChild(this._DOM.center), document.body.appendChild(this._DOM.touch1), document.body.appendChild(this._DOM.touch2), document.body.appendChild(this._DOM.pinchTarget);
  }
  get show() {
    return this.DOM.show;
  }
  get DOM() {
    return this._DOM;
  }
}
const Vi = 6, Ee = 1.02, ji = 50;
class oo {
  constructor(t, e = !1) {
    this.dragState = 0, this.minimumMoved = !1, this.pan = {
      startX: 0,
      endX: 0,
      startY: 0,
      overscrollX: 0,
      overscrollY: 0,
      letItGo: !1,
      preventClick: !1,
      translateX: 0,
      translateY: 0,
      touchID: 0
    }, this.pinch = {
      startDistance: 0,
      startScale: 0,
      target: { X: 0, Y: 0 },
      touchN: 0,
      startTranslate: { X: 0, Y: 0 }
    }, this._scale = 1, this.scaleDebouncer = 0, this.frameBounds = null, this.debugger = null, this.btouchstartHandler = this.touchstartHandler.bind(this), this.btouchendHandler = this.touchendHandler.bind(this), this.btouchmoveHandler = this.touchmoveHandler.bind(this), this.bdblclickHandler = this.dblclickHandler.bind(this), this.bmousedownHandler = this.mousedownHandler.bind(this), this.bmouseupHandler = this.mouseupHandler.bind(this), this.bmousemoveHandler = this.mousemoveHandler.bind(this), this.moveFrame = 0, this.manager = t, this.coordinator = new so(), this.attachEvents(), e && (this.debugger = new ro());
  }
  get scale() {
    return this._scale;
  }
  set scale(t) {
    isNaN(t) && (t = 1), window.clearTimeout(this.scaleDebouncer), this.scaleDebouncer = window.setTimeout(() => {
      this.dragState === 0 && this.scale < Ee && (this.pan.translateX = 0, this.pan.translateY = 0, this.clearPan(), this.manager.updateBookStyle()), this.manager.listener("zoom", t);
    }, 100), this._scale = t;
  }
  /**
   * Attaches listeners to required events.
   */
  attachEvents() {
    this.observe(this.manager.spineElement), this.pan = {
      startX: 0,
      startY: 0,
      endX: 0,
      overscrollX: 0,
      overscrollY: 0,
      letItGo: !1,
      preventClick: !1,
      translateX: 0,
      translateY: 0,
      touchID: 0
    }, this.pinch = {
      startDistance: 0,
      startScale: 0,
      target: { X: 0, Y: 0 },
      startTranslate: { X: 0, Y: 0 },
      touchN: 0
    };
  }
  /**
   * Clear drag after touchend and mouseup event
   */
  clearPan() {
    this.pan.letItGo = !1, this.pan.touchID = 0, this.pan.endX = 0, this.pan.overscrollX = 0, this.pan.overscrollY = 0;
  }
  clearPinch() {
    this.pinch = {
      startDistance: 0,
      startScale: this.pinch.startScale,
      target: { X: 0, Y: 0 },
      touchN: 0,
      startTranslate: { X: 0, Y: 0 }
    };
  }
  observe(t) {
    t.addEventListener("touchstart", this.btouchstartHandler), t.addEventListener("touchend", this.btouchendHandler), t.addEventListener("touchmove", this.btouchmoveHandler, {
      passive: !0
    }), t.addEventListener("dblclick", this.bdblclickHandler, {
      passive: !0
    }), t.addEventListener("mousedown", this.bmousedownHandler), t.addEventListener("mouseup", this.bmouseupHandler), t.addEventListener("mousemove", this.bmousemoveHandler);
  }
  clickHandler(t) {
  }
  /**
   * touchstart event handler
   */
  touchstartHandler(t) {
    if (["TEXTAREA", "OPTION", "INPUT", "SELECT"].indexOf(t.target.nodeName) !== -1)
      return;
    switch (t.stopPropagation(), this.frameBounds = this.manager.currentBounds, this.coordinator.refreshOuterPixels(this.frameBounds), t.touches.length) {
      case 3:
        return;
      case 2: {
        t.preventDefault(), this.pinch.startDistance = this.coordinator.getTouchDistance(t);
        const n = this.startTouch(t);
        this.pan.startX = n.X, this.pan.startY = n.Y, this.dragState = 2, this.manager.updateBookStyle(!0), this.isScaled ? (this.pinch.target.X -= this.pan.translateX * (this.pinch.startScale / this.scale), this.pinch.target.Y -= this.pan.translateY * (this.pinch.startScale / this.scale), this.pinch.target = { X: 0, Y: 0 }, this.pinch.startScale = 1 / this.scale) : (this.pinch.target = { X: 0, Y: 0 }, this.pinch.startScale = this.scale), this.pinch.startTranslate = { X: this.pan.translateX, Y: this.pan.translateY }, this.debugger?.show && (this.debugger.DOM.touch2.style.display = "", this.debugger.DOM.center.style.display = "", this.debugger.DOM.pinchTarget.style.display = "");
        return;
      }
      // @ts-ignore
      case 1:
        this.pan.touchID = t.touches[0].identifier, this.debugger?.show && (this.debugger.DOM.touch1.style.display = "");
      // Fallthrough on purpose
      default:
        this.dragState < 1 && (this.dragState = 1), this.manager.updateBookStyle(!0);
    }
    this.manager.updateSpineStyle(!1);
    const i = this.startTouch(t);
    this.pan.startX = i.X, this.pan.startY = i.Y;
  }
  startTouch(t) {
    const e = this.coordinator.getTouchCenter(t) || this.coordinator.getBibiEventCoord(t);
    return {
      // SX = CX - Z * SC + MW / 2
      X: e.X - this.manager.width / 2 - this.pan.translateX * this.scale + this.manager.width / 2,
      Y: e.Y - this.manager.height / 2 - this.pan.translateY * this.scale + this.manager.height / 2
    };
  }
  /**
   * touchend event handler
   */
  touchendHandler(t) {
    if (t.stopPropagation(), !t.touches || t.touches.length === 0)
      this.pan.endX && !this.isScaled ? (this.pinch.touchN && (this.pan.endX = this.pan.startX), this.updateAfterDrag()) : !this.pinch.touchN && Math.abs(this.pan.overscrollX) > ji && Math.abs(this.pan.overscrollY) < ji / 2 && (this.pan.startX = 0, this.pan.endX = -this.pan.overscrollX, this.updateAfterDrag()), this.dragState = 0, this.minimumMoved = !1, this.clearPinch(), this.debugger?.show && (this.debugger.DOM.center.style.display = "none", this.debugger.DOM.touch1.style.display = "none", this.debugger.DOM.touch2.style.display = "none");
    else if (t.touches.length === 1) {
      this.dragState = 1, t.touches[0].identifier !== this.pan.touchID && (this.pan.touchID = t.touches[0].identifier), this.debugger?.show && (this.debugger.DOM.center.style.display = "none", this.debugger.DOM.touch2.style.display = "none", this.debugger.DOM.pinchTarget.style.display = "none");
      const e = this.startTouch(t);
      this.pan.startX = e.X, this.pan.startY = e.Y;
    }
    window.setTimeout(() => {
      this.manager.updateBookStyle(!0), this.dragState === 0 && (this.scale < Ee && (this.pan.translateX = 0, this.pan.translateY = 0), this.clearPan()), this.manager.updateBookStyle(!0);
    }, 50);
  }
  /**
   * touchmove event handler
   */
  touchmoveHandler(t) {
    t.stopPropagation();
    const e = this.coordinator.getBibiEventCoord(t);
    Math.abs(this.pan.startY - e.Y) + Math.abs(this.pan.startX - e.X) > 5 && (this.minimumMoved || (this.manager.deselect(), this.minimumMoved = !0), this.dragState < 1 && (this.dragState = 1));
    const i = this.coordinator?.getTouchDistance(t);
    let n = !1;
    const s = this.scale;
    if (this.dragState === 2 && i) {
      if (this.pinch.touchN++, this.pinch.touchN < 4) return;
      let o = i / this.pinch.startDistance * this.scale;
      o >= Vi && (o = Vi), o <= Ee && (o = 1), this.scale = o, this.pinch.startDistance = i, n = !0;
    }
    if (this.pan.letItGo === !1 && (this.pan.letItGo = Math.abs(this.pan.startY - e.Y) < Math.abs(this.pan.startX - e.X)), this.debugger?.show && (this.debugger.DOM.touch1.style.top = `${e.Y - 10}px`, this.debugger.DOM.touch1.style.left = `${e.X - 10}px`, this.debugger.DOM.touch1.innerText = `${e.X.toFixed(2)},${e.Y.toFixed(2)}`), this.dragState > 0 && this.isScaled || this.dragState > 1) {
      if (this.dragState === 1) {
        const l = {
          X: e.X - this.manager.width / 2,
          Y: e.Y - this.manager.height / 2
        };
        this.pan.translateX = (l.X - (this.pan.startX - this.manager.width / 2)) * 1 / this.scale, this.pan.translateY = (l.Y - (this.pan.startY - this.manager.height / 2)) * 1 / this.scale;
      } else if (this.dragState === 2) {
        const l = this.coordinator.getTouchCenter(t);
        if (this.debugger?.show) {
          this.debugger.DOM.center.style.top = `${l.Y - 5}px`, this.debugger.DOM.center.style.left = `${l.X - 5}px`, this.debugger.DOM.center.innerText = `${l.X.toFixed(2)},${l.Y.toFixed(2)}`;
          const m = this.coordinator.getBibiEventCoord(t, 1);
          this.debugger.DOM.touch2.style.top = `${m.Y - 10}px`, this.debugger.DOM.touch2.style.left = `${m.X - 10}px`, this.debugger.DOM.touch2.innerText = `${m.X.toFixed(2)},${m.Y.toFixed(2)}`;
        }
        l.X -= this.manager.width / 2, l.Y -= this.manager.height / 2;
        let d = -l.X / s;
        d += l.X / this.scale, this.pinch.target.X += d, l.X += this.pinch.target.X * this.scale / this.pinch.startScale;
        let h = -l.Y / s;
        h += l.Y / this.scale, this.pinch.target.Y += h, l.Y += this.pinch.target.Y * this.scale / this.pinch.startScale;
        let c = (l.X - (this.pan.startX - this.manager.width / 2)) * 1 / this.scale, u = (l.Y - (this.pan.startY - this.manager.height / 2)) * 1 / this.scale;
        this.pan.translateX = c, this.pan.translateY = u, this.debugger?.show && (this.debugger.DOM.pinchTarget.style.left = `${this.pinch.target.X * this.scale / this.pinch.startScale - 5 + this.manager.width / 2}px`, this.debugger.DOM.pinchTarget.style.top = `${this.pinch.target.Y * this.scale / this.pinch.startScale - 5 + this.manager.height / 2}px`, this.debugger.DOM.pinchTarget.innerText = `${(this.pinch.target.X * this.scale / this.pinch.startScale).toFixed(2)},${(this.pinch.target.Y * this.scale / this.pinch.startScale).toFixed(2)}`);
      }
      const o = this.frameBounds.width / 6, a = this.frameBounds.height / 6;
      this.pan.translateX < -o && (this.pan.overscrollX = -(o + this.pan.translateX), this.pan.translateX = -o), this.pan.translateY < -a && (this.pan.overscrollY = -(a + this.pan.translateY), this.pan.translateY = -a), this.pan.translateX > o && (this.pan.overscrollX = o - this.pan.translateX, this.pan.translateX = o), this.pan.translateY > a && (this.pan.overscrollY = a - this.pan.translateY, this.pan.translateY = a), n = !0, this.debugger?.show && (this.debugger.DOM.stats.innerText = `TX: ${this.pan.translateX.toFixed(2)}
TY: ${this.pan.translateY.toFixed(2)}
Zoom: ${this.scale.toFixed(2)}
Overscroll: ${this.pan.overscrollX.toFixed(2)},${this.pan.overscrollY.toFixed(2)}`);
    }
    if (n) {
      this.manager.updateBookStyle();
      return;
    }
    if (this.dragState > 0 && this.pan.letItGo) {
      this.pan.endX = e.X;
      const a = this.manager.currentSlide * (this.manager.width / this.manager.perPage), l = this.pan.endX - this.pan.startX, d = this.manager.rtl ? a + l : a - l;
      cancelAnimationFrame(this.moveFrame), this.moveFrame = requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.manager.spineElement.style.transform = `translate3d(${(this.manager.rtl ? 1 : -1) * d}px, 0, 0)`;
        });
      });
    }
  }
  dblclickHandler(t) {
    clearTimeout(this.dtimer), this.pdblclick = !0, this.dtimer = window.setTimeout(() => this.pdblclick = !1, 200), !this.disableDblClick && this.isScaled && (this.scale = 1);
  }
  get isScaled() {
    return this.scale > 1;
  }
  addTouch(t) {
    t.touches = [{
      pageX: t.pageX,
      pageY: t.pageY
    }];
  }
  /**
   * mousedown event handler
   */
  mousedownHandler(t) {
    this.isScaled && (this.addTouch(t), this.touchstartHandler(t));
  }
  /**
   * mouseup event handler
   */
  mouseupHandler(t) {
    this.isScaled && this.touchendHandler(t);
  }
  /**
   * mousemove event handler
   */
  mousemoveHandler(t) {
    this.isScaled && t.buttons > 0 && (t.preventDefault(), this.addTouch(t), this.touchmoveHandler(t));
  }
  /**
   * Recalculate drag/swipe event and reposition the frame of a slider
   */
  updateAfterDrag() {
    const t = (this.manager.rtl ? -1 : 1) * (this.pan.endX - this.pan.startX), e = Math.abs(t);
    t > 0 && e > this.manager.threshold && this.manager.slength > this.manager.perPage ? this.manager.listener("no_less", void 0) : t < 0 && e > this.manager.threshold && this.manager.slength > this.manager.perPage && this.manager.listener("no_more", void 0), this.manager.slideToCurrent(!0, !0);
  }
}
var De = /* @__PURE__ */ ((r) => (r.auto = "auto", r.landscape = "landscape", r.portrait = "portrait", r))(De || {}), Ue = /* @__PURE__ */ ((r) => (r.auto = "auto", r.both = "both", r.none = "none", r.landscape = "landscape", r))(Ue || {});
class ao {
  // TODO getter
  constructor(t) {
    this.shift = !0, this.spreads = [], this.nLandscape = 0, this.index(t), this.testShift(t), console.log(`Indexed ${this.spreads.length} spreads for ${t.readingOrder.items.length} items`);
  }
  index(t, e = !1) {
    this.nLandscape = 0, t.readingOrder.items.forEach((i, n) => {
      e || (t.readingOrder.items[n] = i.addProperties({
        number: n + 1,
        isImage: i.type?.indexOf("image/") === 0
      }));
      const s = i.properties?.otherProperties.orientation === "landscape";
      (!i.properties?.page || e) && (i.properties = i.properties?.add({
        page: s ? (
          // If a landscape image
          "center"
        ) : (
          // Center it
          ((this.shift ? 0 : 1) + n - this.nLandscape) % 2 ? t.metadata.readingProgression === I.rtl ? "right" : "left" : t.metadata.readingProgression === I.rtl ? "left" : "right"
        )
      })), (s || i.properties?.otherProperties.addBlank) && this.nLandscape++;
    }), e && (this.spreads = []), this.buildSpreads(t.readingOrder);
  }
  testShift(t) {
    let e = !1;
    this.spreads.forEach((i, n) => {
      if (i.length > 1)
        return;
      const s = i[0], o = s.properties?.otherProperties.orientation;
      n === 0 && (o === "landscape" || o !== "portrait" && ((s.width || 0) > (s.height || 0) || s.properties?.otherProperties.spread === "both")) && (this.shift = !1), e && s.properties?.page === K.center && this.spreads[n - 1][0].addProperties({ addBlank: !0 }), o === "portrait" && s.properties?.page !== "center" && s.properties?.otherProperties.number > 1 ? e = !0 : e = !1;
    }), this.shift || this.index(t, !0);
  }
  buildSpreads(t) {
    let e = [];
    t.items.forEach((i, n) => {
      !n && this.shift ? this.spreads.push([i]) : i.properties?.page === K.center ? (e.length > 0 && this.spreads.push(e), this.spreads.push([i]), e = []) : e.length >= 2 ? (this.spreads.push(e), e = [i]) : e.push(i);
    }), e.length > 0 && this.spreads.push(e);
  }
  currentSpread(t, e) {
    return this.spreads[Math.min(Math.floor(t / e), this.spreads.length - 1)];
  }
  findByLink(t) {
    return this.spreads.find((e) => e.includes(t)) || void 0;
  }
}
const $i = 8, Gi = 5, lo = 300, ho = 15e3, co = 250, uo = 150, po = 500;
class fo {
  constructor(t, e, i, n, s, o) {
    if (this.pool = /* @__PURE__ */ new Map(), this.blobs = /* @__PURE__ */ new Map(), this.inprogress = /* @__PURE__ */ new Map(), this.delayedShow = /* @__PURE__ */ new Map(), this.delayedTimeout = /* @__PURE__ */ new Map(), this.previousFrames = [], this.injector = null, this.width = 0, this.height = 0, this.transform = "", this.currentSlide = 0, this.spread = !0, this.orientationInternal = -1, this.container = t, this.positions = e, this.pub = i, this.injector = n ?? null, this.contentProtectionConfig = s || {}, this.keyboardPeripheralsConfig = o || [], this.spreadPresentation = i.metadata.otherMetadata?.spread || Ue.auto, this.pub.metadata.effectiveReadingProgression !== I.rtl && this.pub.metadata.effectiveReadingProgression !== I.ltr)
      throw Error("Unsupported reading progression for EPUB");
    this.spreader = new ao(this.pub), this.containerHeightCached = t.clientHeight, this.bookElement = document.createElement("div"), this.bookElement.ariaLabel = "Book", this.bookElement.tabIndex = -1, this.updateBookStyle(!0), this.spineElement = document.createElement("div"), this.spineElement.ariaLabel = "Spine", this.bookElement.appendChild(this.spineElement), this.container.appendChild(this.bookElement), this.updateSpineStyle(!0), this.peripherals = new oo(this), this.pub.readingOrder.items.forEach((a) => {
      const l = new eo(this.peripherals, this.pub.metadata.effectiveReadingProgression, a.href, this.contentProtectionConfig, this.keyboardPeripheralsConfig);
      this.spineElement.appendChild(l.element), this.pool.set(a.href, l), l.width = 100 / this.length * (a.properties?.otherProperties.orientation === De.landscape || a.properties?.otherProperties.addBlank ? this.perPage : 1), l.height = this.height;
    });
  }
  set listener(t) {
    this._listener = t;
  }
  get listener() {
    return this._listener;
  }
  get doNotDisturb() {
    return this.peripherals.pan.touchID > 0;
  }
  /**
   * When window resizes, resize slider components as well
   */
  resizeHandler(t = !0, e = !0) {
    this.currentSlide + this.perPage > this.length && (this.currentSlide = this.length <= this.perPage ? 0 : this.length - 1), this.containerHeightCached = this.container.clientHeight, this.orientationInternal = -1, this.updateSpineStyle(!0), t && (this.currentSlide = this.reAlign(), this.slideToCurrent(!e, e)), clearTimeout(this.resizeTimeout), this.resizeTimeout = window.setTimeout(() => {
      this.pool.forEach((i, n) => {
        let s = this.pub.readingOrder.items.findIndex((l) => l.href === n);
        const o = this.pub.readingOrder.items[s];
        if (i.width = 100 / this.length * (o.properties?.otherProperties.orientation === De.landscape || o.properties?.otherProperties.addBlank ? this.perPage : 1), i.height = this.height, !i.loaded) return;
        const a = this.spreader.findByLink(o);
        i.update(this.spreadPosition(a, o));
      });
    }, co);
  }
  /**
   * It is important that these values be cached to avoid spamming them on redraws, they are expensive.
   */
  updateDimensions() {
    this.width = this.bookElement.clientWidth, this.height = this.bookElement.clientHeight;
  }
  get rtl() {
    return this.pub.metadata.effectiveReadingProgression === I.rtl;
  }
  get single() {
    return !this.spread || this.portrait;
  }
  get perPage() {
    return this.spread && !this.portrait ? 2 : 1;
  }
  get threshold() {
    return 50;
  }
  get portrait() {
    return this.spreadPresentation === Ue.none ? !0 : (this.orientationInternal === -1 && (this.orientationInternal = this.containerHeightCached > this.container.clientWidth ? 1 : 0), this.orientationInternal === 1);
  }
  updateSpineStyle(t, e = !0) {
    let i = "0";
    this.updateDimensions(), this.perPage > 1 && (i = `${this.width / 2}px`);
    const n = {
      transition: t ? `all ${e ? uo : po}ms ease-out` : "all 0ms ease-out",
      marginRight: this.rtl ? i : "0",
      marginLeft: this.rtl ? "0" : i,
      width: `${this.width / this.perPage * this.length}px`,
      transform: this.transform,
      // Static (should be moved to CSS)
      contain: "content"
    };
    Object.assign(this.spineElement.style, n);
  }
  updateBookStyle(t = !1) {
    if (t) {
      const e = {
        overflow: "hidden",
        direction: this.pub.metadata.effectiveReadingProgression,
        cursor: "",
        // Static (should be moved to CSS)
        // minHeight: 100%
        // maxHeight: "100%",
        height: "100%",
        width: "100%",
        position: "relative",
        outline: "none",
        transition: this.peripherals?.dragState ? "none" : "transform .15s ease-in-out",
        touchAction: "none"
      };
      Object.assign(this.bookElement.style, e);
    }
    this.bookElement.style.transform = `scale(${this.peripherals?.scale || 1})` + (this.peripherals ? ` translate3d(${this.peripherals.pan.translateX}px, ${this.peripherals.pan.translateY}px, 0px)` : "");
  }
  /**
   * Go to slide with particular index
   * @param {number} index - Item index to slide to.
   */
  goTo(t) {
    if (this.slength <= this.perPage)
      return;
    t = this.reAlign(t);
    const e = this.currentSlide;
    this.currentSlide = Math.min(Math.max(t, 0), this.length - 1), e !== this.currentSlide && this.slideToCurrent(!1);
  }
  onChange() {
    this.peripherals.scale = 1, this.updateBookStyle();
  }
  get offset() {
    return (this.rtl ? 1 : -1) * this.currentSlide * (this.width / this.perPage);
  }
  get length() {
    if (this.single)
      return this.slength;
    const t = this.slength + this.nLandscape;
    return this.shift && t % 2 === 0 ? t + 1 : t;
  }
  get slength() {
    return this.pub.readingOrder.items.length || 0;
  }
  get shift() {
    return this.spreader.shift;
  }
  get nLandscape() {
    return this.spreader.nLandscape;
  }
  setPerPage(t) {
    t === null ? this.spread = !0 : t === 1 ? this.spread = !1 : this.spread = !0, requestAnimationFrame(() => this.resizeHandler(!0));
  }
  /**
   * Moves sliders frame to position of currently active slide
   */
  slideToCurrent(t, e = !0) {
    if (this.updateDimensions(), t)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const i = `translate3d(${this.offset}px, 0, 0)`;
          this.spineElement.style.transform !== i && (this.transform = i, this.updateSpineStyle(!0, e), this.deselect());
        });
      });
    else {
      const i = `translate3d(${this.offset}px, 0, 0)`;
      if (this.spineElement.style.transform === i) return;
      this.transform = i, this.updateSpineStyle(!1), this.deselect();
    }
  }
  bounce(t = !1) {
    requestAnimationFrame(() => {
      this.transform = `translate3d(${this.offset + 50 * (t ? 1 : -1)}px, 0, 0)`, this.updateSpineStyle(!0, !0), setTimeout(() => {
        this.transform = `translate3d(${this.offset}px, 0, 0)`, this.updateSpineStyle(!0, !0);
      }, 100);
    });
  }
  /**
   * Go to next slide.
   * @param {number} [howManySlides=1] - How many items to slide forward.
   * @returns {boolean} Whether or not going to next was possible
   */
  next(t = 1) {
    if (this.slength <= this.perPage)
      return !1;
    const e = this.currentSlide;
    return this.currentSlide = Math.min(this.currentSlide + t, this.length - 1), this.perPage > 1 && this.currentSlide % 2 && this.currentSlide--, this.currentSlide === e && (this.currentSlide + 1, this.length), e !== this.currentSlide ? (this.slideToCurrent(!0), this.onChange(), !0) : (this.bounce(this.rtl), !1);
  }
  /**
   * Go to previous slide.
   * @param {number} [howManySlides=1] - How many items to slide backward.
   * @returns {boolean} Whether or not going to prev was possible
   */
  prev(t = 1) {
    if (this.slength <= this.perPage)
      return !1;
    const e = this.currentSlide;
    return this.currentSlide = Math.max(this.currentSlide - t, 0), this.perPage > 1 && this.currentSlide % 2 && this.currentSlide++, e !== this.currentSlide ? (this.slideToCurrent(!0), this.onChange(), !0) : (this.bounce(!this.rtl), !1);
  }
  get ownerWindow() {
    return this.container.ownerDocument.defaultView || window;
  }
  // OLD
  async destroy() {
    let t = this.inprogress.values(), e = t.next();
    const i = [];
    for (; e.value; )
      i.push(e.value), e = t.next();
    i.length > 0 && await Promise.allSettled(i), this.inprogress.clear();
    let n = this.pool.values(), s = n.next();
    for (; s.value; )
      await s.value.destroy(), s = n.next();
    this.pool.clear(), this.blobs.forEach((o) => URL.revokeObjectURL(o)), this.injector?.dispose(), this.container.childNodes.forEach((o) => {
      (o.nodeType === Node.ELEMENT_NODE || o.nodeType === Node.TEXT_NODE) && o.remove();
    });
  }
  makeSpread(t) {
    return this.perPage < 2 ? [this.pub.readingOrder.items[t]] : this.spreader.currentSpread(t, this.perPage);
  }
  reAlign(t = this.currentSlide) {
    return t % 2 && !this.single && t++, t;
  }
  spreadPosition(t, e) {
    return this.perPage < 2 || t.length < 2 ? K.center : e.href === t[0].href ? this.rtl ? K.right : K.left : this.rtl ? K.left : K.right;
  }
  async waitForItem(t) {
    if (this.inprogress.has(t) && await this.inprogress.get(t), this.delayedShow.has(t)) {
      const e = this.delayedTimeout.get(t);
      e > 0 ? clearTimeout(e) : await this.delayedShow.get(t), this.delayedTimeout.set(t, 0), this.delayedShow.delete(t);
    }
  }
  async cancelShowing(t) {
    if (this.delayedShow.has(t)) {
      const e = this.delayedTimeout.get(t);
      e > 0 && clearTimeout(e), this.delayedShow.delete(t);
    }
  }
  async update(t, e, i, n = !1) {
    let s = this.pub.readingOrder.items.findIndex((l) => l.href === e.href);
    if (s < 0) throw Error("Href not found in reading order");
    this.currentSlide !== s && (this.currentSlide = this.reAlign(s), this.slideToCurrent(!0));
    const o = this.makeSpread(this.currentSlide);
    this.perPage > 1 && s++;
    for (const l of o)
      await this.waitForItem(l.href);
    const a = new Promise(async (l, d) => {
      const h = [], c = [];
      this.positions.forEach((f, b) => {
        (b > s + $i || b < s - $i) && (h.includes(f.href) || h.push(f.href)), b < s + Gi && b > s - Gi && (c.includes(f.href) || c.push(f.href));
      }), h.forEach(async (f) => {
        c.includes(f) || this.pool.has(f) && (this.cancelShowing(f), await this.pool.get(f)?.unload());
      }), this.currentBaseURL !== void 0 && t.baseURL !== this.currentBaseURL && (this.blobs.forEach((f) => URL.revokeObjectURL(f)), this.blobs.clear()), this.currentBaseURL = t.baseURL;
      const u = async (f) => {
        const b = t.readingOrder.findIndexWithHref(f), S = t.readingOrder.items[b];
        if (S) {
          if (!this.blobs.has(f)) {
            const x = await new Nn(
              t,
              this.currentBaseURL || "",
              S,
              {
                injector: this.injector
              }
            ).build(!0);
            this.blobs.set(f, x);
          }
          this.delayedShow.has(f) || this.delayedShow.set(f, new Promise((C, x) => {
            let G = !1;
            const ut = window.setTimeout(async () => {
              this.delayedTimeout.set(f, 0);
              const In = this.makeSpread(this.reAlign(b)), Dn = this.spreadPosition(In, S), ni = this.pool.get(f);
              await ni.load(i, this.blobs.get(f)), this.peripherals.isScaled || await ni.show(Dn), this.delayedShow.delete(f), G = !0, C();
            }, lo);
            setTimeout(() => {
              !G && this.delayedShow.has(f) && x(`Offscreen load timeout: ${f}`);
            }, ho), this.delayedTimeout.set(f, ut);
          }));
        }
      };
      try {
        await Promise.all(c.map((f) => u(f)));
      } catch (f) {
        d(f);
      }
      const m = [];
      for (const f of o) {
        const b = this.pool.get(f.href), S = this.blobs.get(f.href);
        S && (this.cancelShowing(f.href), await b.load(i, S), await b.show(this.spreadPosition(o, f)), this.previousFrames.push(b), await b.activate(), m.push(b));
      }
      for (; this.previousFrames.length > 0; ) {
        const f = this.previousFrames.shift();
        f && !m.includes(f) && await f.unfocus();
      }
      this.previousFrames = m;
      const p = this.container.ownerDocument.activeElement;
      p && p.tagName === "IFRAME" && !m.some((f) => f.iframe === p) && m[0]?.iframe.focus({ preventScroll: !0 }), l();
    });
    for (const l of o)
      this.inprogress.set(l.href, a);
    await a;
    for (const l of o)
      this.inprogress.delete(l.href);
  }
  get currentFrames() {
    if (this.perPage < 2) {
      const e = this.pub.readingOrder.items[this.currentSlide];
      return [this.pool.get(e.href)];
    }
    return this.spreader.currentSpread(this.currentSlide, this.perPage).map((e) => this.pool.get(e.href));
  }
  get currentBounds() {
    const t = {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      toJSON() {
        return this;
      }
    };
    return this.currentFrames.forEach((e) => {
      if (!e) return;
      const i = e.realSize;
      t.x = Math.min(t.x, i.x), t.y = Math.min(t.y, i.y), t.width += i.width, t.height = Math.max(t.height, i.height), t.top = Math.min(t.top, i.top), t.right = Math.min(t.right, i.right), t.bottom = Math.min(t.bottom, i.bottom), t.left = Math.min(t.left, i.left);
    }), t;
  }
  get viewport() {
    const t = {
      readingOrder: [],
      progressions: /* @__PURE__ */ new Map(),
      positions: null
    };
    return (this.perPage < 2 ? [this.pub.readingOrder.items[this.currentSlide]] : this.spreader.currentSpread(this.currentSlide, this.perPage)).forEach((i) => {
      t.readingOrder.push(i.href), t.progressions.set(i.href, { start: 0, end: 1 });
    }), t.positions = this.getCurrentNumbers(), t;
  }
  getCurrentNumbers() {
    if (this.perPage < 2)
      return [this.pub.readingOrder.items[this.currentSlide].properties?.otherProperties.number];
    const t = this.spreader.currentSpread(this.currentSlide, this.perPage);
    return t.length > 1 ? [
      t[0].properties?.otherProperties.number,
      t[t.length - 1].properties?.otherProperties.number
    ] : [t[0].properties?.otherProperties.number];
  }
  deselect() {
    this.currentFrames?.forEach((t) => t?.deselect());
  }
}
class Ht {
  constructor(t = {}) {
    this.backgroundColor = W(t.backgroundColor), this.blendFilter = E(t.blendFilter), this.constraint = w(t.constraint), this.columnCount = w(t.columnCount), this.darkenFilter = Ct(t.darkenFilter), this.deprecatedFontSize = E(t.deprecatedFontSize), this.fontFamily = W(t.fontFamily), this.fontSize = D(t.fontSize, Qt.range), this.fontSizeNormalize = E(t.fontSizeNormalize), this.fontOpticalSizing = E(t.fontOpticalSizing), this.fontWeight = D(t.fontWeight, at.range), this.fontWidth = D(t.fontWidth, te.range), this.hyphens = E(t.hyphens), this.invertFilter = Ct(t.invertFilter), this.invertGaijiFilter = Ct(t.invertGaijiFilter), this.iOSPatch = E(t.iOSPatch), this.iPadOSPatch = E(t.iPadOSPatch), this.letterSpacing = w(t.letterSpacing), this.ligatures = E(t.ligatures), this.lineHeight = w(t.lineHeight), this.linkColor = W(t.linkColor), this.noRuby = E(t.noRuby), this.pageGutter = w(t.pageGutter), this.paragraphIndent = w(t.paragraphIndent), this.paragraphSpacing = w(t.paragraphSpacing), this.scroll = E(t.scroll), this.scrollPaddingTop = w(t.scrollPaddingTop), this.scrollPaddingBottom = w(t.scrollPaddingBottom), this.scrollPaddingLeft = w(t.scrollPaddingLeft), this.scrollPaddingRight = w(t.scrollPaddingRight), this.selectionBackgroundColor = W(t.selectionBackgroundColor), this.selectionTextColor = W(t.selectionTextColor), this.textAlign = fe(t.textAlign, nt), this.textColor = W(t.textColor), this.textNormalization = E(t.textNormalization), this.visitedColor = W(t.visitedColor), this.wordSpacing = w(t.wordSpacing), this.optimalLineLength = w(t.optimalLineLength), this.maximalLineLength = w(t.maximalLineLength), this.minimalLineLength = w(t.minimalLineLength);
  }
  static serialize(t) {
    const { ...e } = t;
    return JSON.stringify(e);
  }
  static deserialize(t) {
    try {
      const e = JSON.parse(t);
      return new Ht(e);
    } catch (e) {
      return console.error("Failed to deserialize preferences:", e), null;
    }
  }
  merging(t) {
    const e = { ...this };
    for (const i of Object.keys(t))
      t[i] !== void 0 && (i !== "maximalLineLength" || t[i] === null || t[i] >= (t.optimalLineLength ?? e.optimalLineLength ?? 65)) && (i !== "minimalLineLength" || t[i] === null || t[i] <= (t.optimalLineLength ?? e.optimalLineLength ?? 65)) && (e[i] = t[i]);
    return new Ht(e);
  }
}
class mo {
  constructor(t) {
    this.backgroundColor = W(t.backgroundColor) || null, this.blendFilter = E(t.blendFilter) ?? !1, this.constraint = w(t.constraint) || 0, this.columnCount = w(t.columnCount) || null, this.darkenFilter = Ct(t.darkenFilter) ?? !1, this.deprecatedFontSize = E(t.deprecatedFontSize), (this.deprecatedFontSize === !1 || this.deprecatedFontSize === null) && (this.deprecatedFontSize = !CSS.supports("zoom", "1")), this.fontFamily = W(t.fontFamily) || null, this.fontSize = D(t.fontSize, Qt.range) || 1, this.fontSizeNormalize = E(t.fontSizeNormalize) ?? !1, this.fontOpticalSizing = E(t.fontOpticalSizing) ?? null, this.fontWeight = D(t.fontWeight, at.range) || null, this.fontWidth = D(t.fontWidth, te.range) || null, this.hyphens = E(t.hyphens) ?? null, this.invertFilter = Ct(t.invertFilter) ?? !1, this.invertGaijiFilter = Ct(t.invertGaijiFilter) ?? !1, this.iOSPatch = t.iOSPatch === !1 ? !1 : (M.OS.iOS || M.OS.iPadOS) && M.iOSRequest === "mobile", this.iPadOSPatch = t.iPadOSPatch === !1 ? !1 : M.OS.iPadOS && M.iOSRequest === "desktop", this.letterSpacing = w(t.letterSpacing) || null, this.ligatures = E(t.ligatures) ?? null, this.lineHeight = w(t.lineHeight) || null, this.linkColor = W(t.linkColor) || null, this.noRuby = E(t.noRuby) ?? !1, this.pageGutter = Pe(w(t.pageGutter), 20), this.paragraphIndent = w(t.paragraphIndent) ?? null, this.paragraphSpacing = w(t.paragraphSpacing) ?? null, this.scroll = E(t.scroll) ?? !1, this.scrollPaddingTop = w(t.scrollPaddingTop) ?? null, this.scrollPaddingBottom = w(t.scrollPaddingBottom) ?? null, this.scrollPaddingLeft = w(t.scrollPaddingLeft) ?? null, this.scrollPaddingRight = w(t.scrollPaddingRight) ?? null, this.selectionBackgroundColor = W(t.selectionBackgroundColor) || null, this.selectionTextColor = W(t.selectionTextColor) || null, this.textAlign = fe(t.textAlign, nt) || null, this.textColor = W(t.textColor) || null, this.textNormalization = E(t.textNormalization) ?? !1, this.visitedColor = W(t.visitedColor) || null, this.wordSpacing = w(t.wordSpacing) || null, this.optimalLineLength = w(t.optimalLineLength) || 65, this.maximalLineLength = Pe(Mr(t.maximalLineLength, this.optimalLineLength), 80), this.minimalLineLength = Pe(Nr(t.minimalLineLength, this.optimalLineLength), 40), this.experiments = xn(t.experiments) || null;
  }
}
const go = "#FFFFFF", yo = "#121212", bo = "#0000EE", vo = "#551A8B", So = "#b4d8fe", wo = "inherit", gt = {
  backgroundColor: go,
  textColor: yo,
  linkColor: bo,
  visitedColor: vo,
  selectionBackgroundColor: So,
  selectionTextColor: wo
};
class Xi {
  constructor(t, e, i) {
    this.preferences = t, this.settings = e, this.metadata = i, this.layout = this.metadata?.effectiveLayout || v.reflowable;
  }
  clear() {
    this.preferences = new Ht({ optimalLineLength: 65 });
  }
  updatePreference(t, e) {
    this.preferences[t] = e;
  }
  get backgroundColor() {
    return new z({
      initialValue: this.preferences.backgroundColor,
      effectiveValue: this.settings.backgroundColor || gt.backgroundColor,
      isEffective: this.preferences.backgroundColor !== null,
      onChange: (t) => {
        this.updatePreference("backgroundColor", t ?? null);
      }
    });
  }
  get blendFilter() {
    return new N({
      initialValue: this.preferences.blendFilter,
      effectiveValue: this.settings.blendFilter || !1,
      isEffective: this.preferences.blendFilter !== null,
      onChange: (t) => {
        this.updatePreference("blendFilter", t ?? null);
      }
    });
  }
  get columnCount() {
    return new z({
      initialValue: this.preferences.columnCount,
      effectiveValue: this.settings.columnCount || null,
      isEffective: this.layout !== v.fixed && !this.settings.scroll,
      onChange: (t) => {
        this.updatePreference("columnCount", t ?? null);
      }
    });
  }
  get constraint() {
    return new z({
      initialValue: this.preferences.constraint,
      effectiveValue: this.preferences.constraint || 0,
      isEffective: !0,
      onChange: (t) => {
        this.updatePreference("constraint", t ?? null);
      }
    });
  }
  get darkenFilter() {
    return new R({
      initialValue: typeof this.preferences.darkenFilter == "boolean" ? 100 : this.preferences.darkenFilter,
      effectiveValue: typeof this.settings.darkenFilter == "boolean" ? 100 : this.settings.darkenFilter || 0,
      isEffective: this.settings.darkenFilter !== null,
      onChange: (t) => {
        this.updatePreference("darkenFilter", t ?? null);
      },
      supportedRange: ft.range,
      step: ft.step
    });
  }
  get deprecatedFontSize() {
    return new N({
      initialValue: this.preferences.deprecatedFontSize,
      effectiveValue: CSS.supports("zoom", "1") ? this.settings.deprecatedFontSize || !1 : !0,
      isEffective: this.layout !== v.fixed,
      onChange: (t) => {
        this.updatePreference("deprecatedFontSize", t ?? null);
      }
    });
  }
  get fontFamily() {
    return new z({
      initialValue: this.preferences.fontFamily,
      effectiveValue: this.settings.fontFamily || null,
      isEffective: this.layout !== v.fixed,
      onChange: (t) => {
        this.updatePreference("fontFamily", t ?? null);
      }
    });
  }
  get fontSize() {
    return new R({
      initialValue: this.preferences.fontSize,
      effectiveValue: this.settings.fontSize || 1,
      isEffective: this.layout !== v.fixed,
      onChange: (t) => {
        this.updatePreference("fontSize", t ?? null);
      },
      supportedRange: Qt.range,
      step: Qt.step
    });
  }
  get fontSizeNormalize() {
    return new N({
      initialValue: this.preferences.fontSizeNormalize,
      effectiveValue: this.settings.fontSizeNormalize || !1,
      isEffective: this.layout !== v.fixed && this.preferences.fontSizeNormalize !== null,
      onChange: (t) => {
        this.updatePreference("fontSizeNormalize", t ?? null);
      }
    });
  }
  get fontOpticalSizing() {
    return new N({
      initialValue: this.preferences.fontOpticalSizing,
      effectiveValue: this.settings.fontOpticalSizing || !0,
      isEffective: this.layout !== v.fixed && this.preferences.fontOpticalSizing !== null,
      onChange: (t) => {
        this.updatePreference("fontOpticalSizing", t ?? null);
      }
    });
  }
  get fontWeight() {
    return new R({
      initialValue: this.preferences.fontWeight,
      effectiveValue: this.settings.fontWeight || 400,
      isEffective: this.layout !== v.fixed && this.preferences.fontWeight !== null,
      onChange: (t) => {
        this.updatePreference("fontWeight", t ?? null);
      },
      supportedRange: at.range,
      step: at.step
    });
  }
  get fontWidth() {
    return new R({
      initialValue: this.preferences.fontWidth,
      effectiveValue: this.settings.fontWidth || 100,
      isEffective: this.layout !== v.fixed && this.preferences.fontWidth !== null,
      onChange: (t) => {
        this.updatePreference("fontWidth", t ?? null);
      },
      supportedRange: te.range,
      step: te.step
    });
  }
  get hyphens() {
    return new N({
      initialValue: this.preferences.hyphens,
      effectiveValue: this.settings.hyphens || !1,
      isEffective: this.layout !== v.fixed && this.metadata?.effectiveReadingProgression === I.ltr && this.preferences.hyphens !== null,
      onChange: (t) => {
        this.updatePreference("hyphens", t ?? null);
      }
    });
  }
  get invertFilter() {
    return new R({
      initialValue: typeof this.preferences.invertFilter == "boolean" ? 100 : this.preferences.invertFilter,
      effectiveValue: typeof this.settings.invertFilter == "boolean" ? 100 : this.settings.invertFilter || 0,
      isEffective: this.settings.invertFilter !== null,
      onChange: (t) => {
        this.updatePreference("invertFilter", t ?? null);
      },
      supportedRange: ft.range,
      step: ft.step
    });
  }
  get invertGaijiFilter() {
    return new R({
      initialValue: typeof this.preferences.invertGaijiFilter == "boolean" ? 100 : this.preferences.invertGaijiFilter,
      effectiveValue: typeof this.settings.invertGaijiFilter == "boolean" ? 100 : this.settings.invertGaijiFilter || 0,
      isEffective: this.preferences.invertGaijiFilter !== null,
      onChange: (t) => {
        this.updatePreference("invertGaijiFilter", t ?? null);
      },
      supportedRange: ft.range,
      step: ft.step
    });
  }
  get iOSPatch() {
    return new N({
      initialValue: this.preferences.iOSPatch,
      effectiveValue: this.settings.iOSPatch || !1,
      isEffective: this.layout !== v.fixed,
      onChange: (t) => {
        this.updatePreference("iOSPatch", t ?? null);
      }
    });
  }
  get iPadOSPatch() {
    return new N({
      initialValue: this.preferences.iPadOSPatch,
      effectiveValue: this.settings.iPadOSPatch || !1,
      isEffective: this.layout !== v.fixed,
      onChange: (t) => {
        this.updatePreference("iPadOSPatch", t ?? null);
      }
    });
  }
  get letterSpacing() {
    return new R({
      initialValue: this.preferences.letterSpacing,
      effectiveValue: this.settings.letterSpacing || 0,
      isEffective: this.layout !== v.fixed && this.preferences.letterSpacing !== null,
      onChange: (t) => {
        this.updatePreference("letterSpacing", t ?? null);
      },
      supportedRange: ee.range,
      step: ee.step
    });
  }
  get ligatures() {
    return new N({
      initialValue: this.preferences.ligatures,
      effectiveValue: this.settings.ligatures || !0,
      isEffective: (() => {
        if (this.preferences.ligatures === null || this.layout === v.fixed)
          return !1;
        const t = this.metadata?.languages?.[0]?.toLowerCase();
        return !(t && ["zh", "ja", "ko", "mn-mong"].some((e) => t.startsWith(e)));
      })(),
      onChange: (t) => {
        this.updatePreference("ligatures", t ?? null);
      }
    });
  }
  get lineHeight() {
    return new R({
      initialValue: this.preferences.lineHeight,
      effectiveValue: this.settings.lineHeight,
      isEffective: this.layout !== v.fixed && this.preferences.lineHeight !== null,
      onChange: (t) => {
        this.updatePreference("lineHeight", t ?? null);
      },
      supportedRange: ie.range,
      step: ie.step
    });
  }
  get linkColor() {
    return new z({
      initialValue: this.preferences.linkColor,
      effectiveValue: this.settings.linkColor || gt.linkColor,
      isEffective: this.layout !== v.fixed && this.preferences.linkColor !== null,
      onChange: (t) => {
        this.updatePreference("linkColor", t ?? null);
      }
    });
  }
  get maximalLineLength() {
    return new R({
      initialValue: this.preferences.maximalLineLength,
      effectiveValue: this.settings.maximalLineLength,
      isEffective: this.layout !== v.fixed,
      onChange: (t) => {
        this.updatePreference("maximalLineLength", t);
      },
      supportedRange: mt.range,
      step: mt.step
    });
  }
  get minimalLineLength() {
    return new R({
      initialValue: this.preferences.minimalLineLength,
      effectiveValue: this.settings.minimalLineLength,
      isEffective: this.layout !== v.fixed,
      onChange: (t) => {
        this.updatePreference("minimalLineLength", t);
      },
      supportedRange: mt.range,
      step: mt.step
    });
  }
  get noRuby() {
    return new N({
      initialValue: this.preferences.noRuby,
      effectiveValue: this.settings.noRuby || !1,
      isEffective: this.layout !== v.fixed && this.metadata?.languages?.includes("ja") || !1,
      onChange: (t) => {
        this.updatePreference("noRuby", t ?? null);
      }
    });
  }
  get optimalLineLength() {
    return new R({
      initialValue: this.preferences.optimalLineLength,
      effectiveValue: this.settings.optimalLineLength,
      isEffective: this.layout !== v.fixed,
      onChange: (t) => {
        this.updatePreference("optimalLineLength", t);
      },
      supportedRange: mt.range,
      step: mt.step
    });
  }
  get pageGutter() {
    return new z({
      initialValue: this.preferences.pageGutter,
      effectiveValue: this.settings.pageGutter,
      isEffective: this.layout !== v.fixed && !this.settings.scroll,
      onChange: (t) => {
        this.updatePreference("pageGutter", t ?? null);
      }
    });
  }
  get paragraphIndent() {
    return new R({
      initialValue: this.preferences.paragraphIndent,
      effectiveValue: this.settings.paragraphIndent || 0,
      isEffective: this.layout !== v.fixed && this.preferences.paragraphIndent !== null,
      onChange: (t) => {
        this.updatePreference("paragraphIndent", t ?? null);
      },
      supportedRange: ne.range,
      step: ne.step
    });
  }
  get paragraphSpacing() {
    return new R({
      initialValue: this.preferences.paragraphSpacing,
      effectiveValue: this.settings.paragraphSpacing || 0,
      isEffective: this.layout !== v.fixed && this.preferences.paragraphSpacing !== null,
      onChange: (t) => {
        this.updatePreference("paragraphSpacing", t ?? null);
      },
      supportedRange: se.range,
      step: se.step
    });
  }
  get scroll() {
    return new N({
      initialValue: this.preferences.scroll,
      effectiveValue: this.settings.scroll || !1,
      isEffective: this.layout !== v.fixed,
      onChange: (t) => {
        this.updatePreference("scroll", t ?? null);
      }
    });
  }
  get scrollPaddingTop() {
    return new z({
      initialValue: this.preferences.scrollPaddingTop,
      effectiveValue: this.settings.scrollPaddingTop || 0,
      isEffective: this.layout !== v.fixed && !!this.settings.scroll && this.preferences.scrollPaddingTop !== null,
      onChange: (t) => {
        this.updatePreference("scrollPaddingTop", t ?? null);
      }
    });
  }
  get scrollPaddingBottom() {
    return new z({
      initialValue: this.preferences.scrollPaddingBottom,
      effectiveValue: this.settings.scrollPaddingBottom || 0,
      isEffective: this.layout !== v.fixed && !!this.settings.scroll && this.preferences.scrollPaddingBottom !== null,
      onChange: (t) => {
        this.updatePreference("scrollPaddingBottom", t ?? null);
      }
    });
  }
  get scrollPaddingLeft() {
    return new z({
      initialValue: this.preferences.scrollPaddingLeft,
      effectiveValue: this.settings.scrollPaddingLeft || 0,
      isEffective: this.layout !== v.fixed && !!this.settings.scroll && this.preferences.scrollPaddingLeft !== null,
      onChange: (t) => {
        this.updatePreference("scrollPaddingLeft", t ?? null);
      }
    });
  }
  get scrollPaddingRight() {
    return new z({
      initialValue: this.preferences.scrollPaddingRight,
      effectiveValue: this.settings.scrollPaddingRight || 0,
      isEffective: this.layout !== v.fixed && !!this.settings.scroll && this.preferences.scrollPaddingRight !== null,
      onChange: (t) => {
        this.updatePreference("scrollPaddingRight", t ?? null);
      }
    });
  }
  get selectionBackgroundColor() {
    return new z({
      initialValue: this.preferences.selectionBackgroundColor,
      effectiveValue: this.settings.selectionBackgroundColor || gt.selectionBackgroundColor,
      isEffective: this.layout !== v.fixed && this.preferences.selectionBackgroundColor !== null,
      onChange: (t) => {
        this.updatePreference("selectionBackgroundColor", t ?? null);
      }
    });
  }
  get selectionTextColor() {
    return new z({
      initialValue: this.preferences.selectionTextColor,
      effectiveValue: this.settings.selectionTextColor || gt.selectionTextColor,
      isEffective: this.layout !== v.fixed && this.preferences.selectionTextColor !== null,
      onChange: (t) => {
        this.updatePreference("selectionTextColor", t ?? null);
      }
    });
  }
  get textAlign() {
    return new Ln({
      initialValue: this.preferences.textAlign,
      effectiveValue: this.settings.textAlign || nt.start,
      isEffective: this.layout !== v.fixed && this.preferences.textAlign !== null,
      onChange: (t) => {
        this.updatePreference("textAlign", t ?? null);
      },
      supportedValues: Object.values(nt)
    });
  }
  get textColor() {
    return new z({
      initialValue: this.preferences.textColor,
      effectiveValue: this.settings.textColor || gt.textColor,
      isEffective: this.layout !== v.fixed && this.preferences.textColor !== null,
      onChange: (t) => {
        this.updatePreference("textColor", t ?? null);
      }
    });
  }
  get textNormalization() {
    return new N({
      initialValue: this.preferences.textNormalization,
      effectiveValue: this.settings.textNormalization || !1,
      isEffective: this.layout !== v.fixed,
      onChange: (t) => {
        this.updatePreference("textNormalization", t ?? null);
      }
    });
  }
  get visitedColor() {
    return new z({
      initialValue: this.preferences.visitedColor,
      effectiveValue: this.settings.visitedColor || gt.visitedColor,
      isEffective: this.layout !== v.fixed && this.preferences.visitedColor !== null,
      onChange: (t) => {
        this.updatePreference("visitedColor", t ?? null);
      }
    });
  }
  get wordSpacing() {
    return new R({
      initialValue: this.preferences.wordSpacing,
      effectiveValue: this.settings.wordSpacing || 0,
      isEffective: this.layout !== v.fixed && this.preferences.wordSpacing !== null,
      onChange: (t) => {
        this.updatePreference("wordSpacing", t ?? null);
      },
      supportedRange: re.range,
      step: re.step
    });
  }
}
class Yi {
  constructor(t, e) {
    this.backgroundColor = t.backgroundColor || e.backgroundColor || null, this.blendFilter = typeof t.blendFilter == "boolean" ? t.blendFilter : e.blendFilter ?? null, this.columnCount = t.columnCount !== void 0 ? t.columnCount : e.columnCount !== void 0 ? e.columnCount : null, this.constraint = t.constraint || e.constraint, this.darkenFilter = typeof t.darkenFilter == "boolean" ? t.darkenFilter : e.darkenFilter ?? null, this.deprecatedFontSize = typeof t.deprecatedFontSize == "boolean" ? t.deprecatedFontSize : e.deprecatedFontSize ?? null, this.fontFamily = t.fontFamily || e.fontFamily || null, this.fontSize = t.fontSize !== void 0 ? t.fontSize : e.fontSize !== void 0 ? e.fontSize : null, this.fontSizeNormalize = typeof t.fontSizeNormalize == "boolean" ? t.fontSizeNormalize : e.fontSizeNormalize ?? null, this.fontOpticalSizing = typeof t.fontOpticalSizing == "boolean" ? t.fontOpticalSizing : e.fontOpticalSizing ?? null, this.fontWeight = t.fontWeight !== void 0 ? t.fontWeight : e.fontWeight !== void 0 ? e.fontWeight : null, this.fontWidth = t.fontWidth !== void 0 ? t.fontWidth : e.fontWidth !== void 0 ? e.fontWidth : null, this.hyphens = typeof t.hyphens == "boolean" ? t.hyphens : e.hyphens ?? null, this.invertFilter = typeof t.invertFilter == "boolean" ? t.invertFilter : e.invertFilter ?? null, this.invertGaijiFilter = typeof t.invertGaijiFilter == "boolean" ? t.invertGaijiFilter : e.invertGaijiFilter ?? null, this.iOSPatch = this.deprecatedFontSize || t.iOSPatch === !1 ? !1 : t.iOSPatch === !0 ? (M.OS.iOS || M.OS.iPadOS) && M.iOSRequest === "mobile" : e.iOSPatch, this.iPadOSPatch = this.deprecatedFontSize || t.iPadOSPatch === !1 ? !1 : t.iPadOSPatch === !0 ? M.OS.iPadOS && M.iOSRequest === "desktop" : e.iPadOSPatch, this.letterSpacing = t.letterSpacing !== void 0 ? t.letterSpacing : e.letterSpacing !== void 0 ? e.letterSpacing : null, this.ligatures = typeof t.ligatures == "boolean" ? t.ligatures : e.ligatures ?? null, this.lineHeight = t.lineHeight !== void 0 ? t.lineHeight : e.lineHeight !== void 0 ? e.lineHeight : null, this.linkColor = t.linkColor || e.linkColor || null, this.maximalLineLength = t.maximalLineLength === null ? null : t.maximalLineLength || e.maximalLineLength || null, this.minimalLineLength = t.minimalLineLength === null ? null : t.minimalLineLength || e.minimalLineLength || null, this.noRuby = typeof t.noRuby == "boolean" ? t.noRuby : e.noRuby ?? null, this.optimalLineLength = t.optimalLineLength || e.optimalLineLength, this.pageGutter = t.pageGutter !== void 0 ? t.pageGutter : e.pageGutter !== void 0 ? e.pageGutter : null, this.paragraphIndent = t.paragraphIndent !== void 0 ? t.paragraphIndent : e.paragraphIndent !== void 0 ? e.paragraphIndent : null, this.paragraphSpacing = t.paragraphSpacing !== void 0 ? t.paragraphSpacing : e.paragraphSpacing !== void 0 ? e.paragraphSpacing : null, this.scroll = typeof t.scroll == "boolean" ? t.scroll : e.scroll ?? null, this.scrollPaddingTop = t.scrollPaddingTop !== void 0 ? t.scrollPaddingTop : e.scrollPaddingTop !== void 0 ? e.scrollPaddingTop : null, this.scrollPaddingBottom = t.scrollPaddingBottom !== void 0 ? t.scrollPaddingBottom : e.scrollPaddingBottom !== void 0 ? e.scrollPaddingBottom : null, this.scrollPaddingLeft = t.scrollPaddingLeft !== void 0 ? t.scrollPaddingLeft : e.scrollPaddingLeft !== void 0 ? e.scrollPaddingLeft : null, this.scrollPaddingRight = t.scrollPaddingRight !== void 0 ? t.scrollPaddingRight : e.scrollPaddingRight !== void 0 ? e.scrollPaddingRight : null, this.selectionBackgroundColor = t.selectionBackgroundColor || e.selectionBackgroundColor || null, this.selectionTextColor = t.selectionTextColor || e.selectionTextColor || null, this.textAlign = t.textAlign || e.textAlign || null, this.textColor = t.textColor || e.textColor || null, this.textNormalization = typeof t.textNormalization == "boolean" ? t.textNormalization : e.textNormalization ?? null, this.visitedColor = t.visitedColor || e.visitedColor || null, this.wordSpacing = t.wordSpacing !== void 0 ? t.wordSpacing : e.wordSpacing !== void 0 ? e.wordSpacing : null, this.experiments = e.experiments || null;
  }
}
function At(r) {
  const t = getComputedStyle(r), e = parseFloat(t.paddingLeft || "0"), i = parseFloat(t.paddingRight || "0");
  return r.clientWidth - e - i;
}
function Po(r) {
  const t = getComputedStyle(r), e = parseFloat(t.paddingTop || "0"), i = parseFloat(t.paddingBottom || "0");
  return r.clientHeight - e - i;
}
class Fn extends pe {
  constructor(t) {
    super(), this.a11yNormalize = t.a11yNormalize ?? null, this.backgroundColor = t.backgroundColor ?? null, this.blendFilter = t.blendFilter ?? null, this.bodyHyphens = t.bodyHyphens ?? null, this.colCount = t.colCount ?? null, this.darkenFilter = t.darkenFilter ?? null, this.deprecatedFontSize = t.deprecatedFontSize ?? null, this.fontFamily = t.fontFamily ?? null, this.fontOpticalSizing = t.fontOpticalSizing ?? null, this.fontSize = t.fontSize ?? null, this.fontSizeNormalize = t.fontSizeNormalize ?? null, this.fontWeight = t.fontWeight ?? null, this.fontWidth = t.fontWidth ?? null, this.invertFilter = t.invertFilter ?? null, this.invertGaijiFilter = t.invertGaijiFilter ?? null, this.iOSPatch = t.iOSPatch ?? null, this.iPadOSPatch = t.iPadOSPatch ?? null, this.letterSpacing = t.letterSpacing ?? null, this.ligatures = t.ligatures ?? null, this.lineHeight = t.lineHeight ?? null, this.lineLength = t.lineLength ?? null, this.linkColor = t.linkColor ?? null, this.noRuby = t.noRuby ?? null, this.paraIndent = t.paraIndent ?? null, this.paraSpacing = t.paraSpacing ?? null, this.selectionBackgroundColor = t.selectionBackgroundColor ?? null, this.selectionTextColor = t.selectionTextColor ?? null, this.textAlign = t.textAlign ?? null, this.textColor = t.textColor ?? null, this.view = t.view ?? null, this.visitedColor = t.visitedColor ?? null, this.wordSpacing = t.wordSpacing ?? null;
  }
  toCSSProperties() {
    const t = {};
    return this.a11yNormalize && (t["--USER__a11yNormalize"] = this.toFlag("a11y")), this.backgroundColor && (t["--USER__backgroundColor"] = this.backgroundColor), this.blendFilter && (t["--USER__blendFilter"] = this.toFlag("blend")), this.bodyHyphens && (t["--USER__bodyHyphens"] = this.bodyHyphens), this.colCount && (t["--USER__colCount"] = this.toUnitless(this.colCount)), this.darkenFilter === !0 ? t["--USER__darkenFilter"] = this.toFlag("darken") : typeof this.darkenFilter == "number" && (t["--USER__darkenFilter"] = this.toPercentage(this.darkenFilter)), this.deprecatedFontSize && (t["--USER__fontSizeImplementation"] = this.toFlag("deprecatedFontSize")), this.fontFamily && (t["--USER__fontFamily"] = this.fontFamily), this.fontOpticalSizing != null && (t["--USER__fontOpticalSizing"] = this.fontOpticalSizing), this.fontSize != null && (t["--USER__fontSize"] = this.toPercentage(this.fontSize, !0)), this.fontSizeNormalize && (t["--USER__fontSizeNormalize"] = this.toFlag("normalize")), this.fontWeight != null && (t["--USER__fontWeight"] = this.toUnitless(this.fontWeight)), this.fontWidth != null && (t["--USER__fontWidth"] = typeof this.fontWidth == "string" ? this.fontWidth : this.toUnitless(this.fontWidth)), this.invertFilter === !0 ? t["--USER__invertFilter"] = this.toFlag("invert") : typeof this.invertFilter == "number" && (t["--USER__invertFilter"] = this.toPercentage(this.invertFilter)), this.invertGaijiFilter === !0 ? t["--USER__invertGaiji"] = this.toFlag("invertGaiji") : typeof this.invertGaijiFilter == "number" && (t["--USER__invertGaiji"] = this.toPercentage(this.invertGaijiFilter)), this.iOSPatch && (t["--USER__iOSPatch"] = this.toFlag("iOSPatch")), this.iPadOSPatch && (t["--USER__iPadOSPatch"] = this.toFlag("iPadOSPatch")), this.letterSpacing != null && (t["--USER__letterSpacing"] = this.toRem(this.letterSpacing)), this.ligatures && (t["--USER__ligatures"] = this.ligatures), this.lineHeight != null && (t["--USER__lineHeight"] = this.toUnitless(this.lineHeight)), this.lineLength != null && (t["--USER__lineLength"] = this.toPx(this.lineLength)), this.linkColor && (t["--USER__linkColor"] = this.linkColor), this.noRuby && (t["--USER__noRuby"] = this.toFlag("noRuby")), this.paraIndent != null && (t["--USER__paraIndent"] = this.toRem(this.paraIndent)), this.paraSpacing != null && (t["--USER__paraSpacing"] = this.toRem(this.paraSpacing)), this.selectionBackgroundColor && (t["--USER__selectionBackgroundColor"] = this.selectionBackgroundColor), this.selectionTextColor && (t["--USER__selectionTextColor"] = this.selectionTextColor), this.textAlign && (t["--USER__textAlign"] = this.textAlign), this.textColor && (t["--USER__textColor"] = this.textColor), this.view && (t["--USER__view"] = this.toFlag(this.view)), this.visitedColor && (t["--USER__visitedColor"] = this.visitedColor), this.wordSpacing != null && (t["--USER__wordSpacing"] = this.toRem(this.wordSpacing)), t;
  }
}
class Eo extends pe {
  constructor(t) {
    super(), this.backgroundColor = t.backgroundColor ?? null, this.baseFontFamily = t.baseFontFamily ?? null, this.baseFontSize = t.baseFontSize ?? null, this.baseLineHeight = t.baseLineHeight ?? null, this.boxSizingMedia = t.boxSizingMedia ?? null, this.boxSizingTable = t.boxSizingTable ?? null, this.colWidth = t.colWidth ?? null, this.colCount = t.colCount ?? null, this.colGap = t.colGap ?? null, this.codeFontFamily = t.codeFontFamily ?? null, this.compFontFamily = t.compFontFamily ?? null, this.defaultLineLength = t.defaultLineLength ?? null, this.flowSpacing = t.flowSpacing ?? null, this.humanistTf = t.humanistTf ?? null, this.linkColor = t.linkColor ?? null, this.maxMediaWidth = t.maxMediaWidth ?? null, this.maxMediaHeight = t.maxMediaHeight ?? null, this.modernTf = t.modernTf ?? null, this.monospaceTf = t.monospaceTf ?? null, this.noOverflow = t.noOverflow ?? null, this.noVerticalPagination = t.noVerticalPagination ?? null, this.oldStyleTf = t.oldStyleTf ?? null, this.pageGutter = t.pageGutter ?? null, this.paraIndent = t.paraIndent ?? null, this.paraSpacing = t.paraSpacing ?? null, this.primaryColor = t.primaryColor ?? null, this.scrollPaddingBottom = t.scrollPaddingBottom ?? null, this.scrollPaddingLeft = t.scrollPaddingLeft ?? null, this.scrollPaddingRight = t.scrollPaddingRight ?? null, this.scrollPaddingTop = t.scrollPaddingTop ?? null, this.sansSerifJa = t.sansSerifJa ?? null, this.sansSerifJaV = t.sansSerifJaV ?? null, this.sansTf = t.sansTf ?? null, this.secondaryColor = t.secondaryColor ?? null, this.selectionBackgroundColor = t.selectionBackgroundColor ?? null, this.selectionTextColor = t.selectionTextColor ?? null, this.serifJa = t.serifJa ?? null, this.serifJaV = t.serifJaV ?? null, this.textColor = t.textColor ?? null, this.typeScale = t.typeScale ?? null, this.visitedColor = t.visitedColor ?? null, this.experiments = t.experiments ?? null;
  }
  toCSSProperties() {
    const t = {};
    return this.backgroundColor && (t["--RS__backgroundColor"] = this.backgroundColor), this.baseFontFamily && (t["--RS__baseFontFamily"] = this.baseFontFamily), this.baseFontSize != null && (t["--RS__baseFontSize"] = this.toRem(this.baseFontSize)), this.baseLineHeight != null && (t["--RS__baseLineHeight"] = this.toUnitless(this.baseLineHeight)), this.boxSizingMedia && (t["--RS__boxSizingMedia"] = this.boxSizingMedia), this.boxSizingTable && (t["--RS__boxSizingTable"] = this.boxSizingTable), this.colWidth != null && (t["--RS__colWidth"] = this.colWidth), this.colCount != null && (t["--RS__colCount"] = this.toUnitless(this.colCount)), this.colGap != null && (t["--RS__colGap"] = this.toPx(this.colGap)), this.codeFontFamily && (t["--RS__codeFontFamily"] = this.codeFontFamily), this.compFontFamily && (t["--RS__compFontFamily"] = this.compFontFamily), this.defaultLineLength != null && (t["--RS__defaultLineLength"] = this.toPx(this.defaultLineLength)), this.flowSpacing != null && (t["--RS__flowSpacing"] = this.toRem(this.flowSpacing)), this.humanistTf && (t["--RS__humanistTf"] = this.humanistTf), this.linkColor && (t["--RS__linkColor"] = this.linkColor), this.maxMediaWidth && (t["--RS__maxMediaWidth"] = this.toVw(this.maxMediaWidth)), this.maxMediaHeight && (t["--RS__maxMediaHeight"] = this.toVh(this.maxMediaHeight)), this.modernTf && (t["--RS__modernTf"] = this.modernTf), this.monospaceTf && (t["--RS__monospaceTf"] = this.monospaceTf), this.noOverflow && (t["--RS__disableOverflow"] = this.toFlag("noOverflow")), this.noVerticalPagination && (t["--RS__disablePagination"] = this.toFlag("noVerticalPagination")), this.oldStyleTf && (t["--RS__oldStyleTf"] = this.oldStyleTf), this.pageGutter != null && (t["--RS__pageGutter"] = this.toPx(this.pageGutter)), this.paraIndent != null && (t["--RS__paraIndent"] = this.toRem(this.paraIndent)), this.paraSpacing != null && (t["--RS__paraSpacing"] = this.toRem(this.paraSpacing)), this.primaryColor && (t["--RS__primaryColor"] = this.primaryColor), this.sansSerifJa && (t["--RS__sans-serif-ja"] = this.sansSerifJa), this.sansSerifJaV && (t["--RS__sans-serif-ja-v"] = this.sansSerifJaV), this.sansTf && (t["--RS__sansTf"] = this.sansTf), this.scrollPaddingBottom != null && (t["--RS__scrollPaddingBottom"] = this.toPx(this.scrollPaddingBottom)), this.scrollPaddingLeft != null && (t["--RS__scrollPaddingLeft"] = this.toPx(this.scrollPaddingLeft)), this.scrollPaddingRight != null && (t["--RS__scrollPaddingRight"] = this.toPx(this.scrollPaddingRight)), this.scrollPaddingTop != null && (t["--RS__scrollPaddingTop"] = this.toPx(this.scrollPaddingTop)), this.secondaryColor && (t["--RS__secondaryColor"] = this.secondaryColor), this.selectionBackgroundColor && (t["--RS__selectionBackgroundColor"] = this.selectionBackgroundColor), this.selectionTextColor && (t["--RS__selectionTextColor"] = this.selectionTextColor), this.serifJa && (t["--RS__serif-ja"] = this.serifJa), this.serifJaV && (t["--RS__serif-ja-v"] = this.serifJaV), this.textColor && (t["--RS__textColor"] = this.textColor), this.typeScale && (t["--RS__typeScale"] = this.toUnitless(this.typeScale)), this.visitedColor && (t["--RS__visitedColor"] = this.visitedColor), this.experiments && this.experiments.forEach((e) => {
      t["--RS__" + e] = Je[e].value;
    }), t;
  }
}
class Co {
  constructor(t) {
    this.rsProperties = t.rsProperties, this.userProperties = t.userProperties, this.lineLengths = t.lineLengths, this.container = t.container, this.containerParent = t.container.parentElement || document.documentElement, this.constraint = t.constraint, this.isCJKVertical = t.isCJKVertical ?? !1, this.cachedColCount = t.userProperties.colCount, this.effectiveContainerWidth = At(this.containerParent);
  }
  update(t) {
    this.cachedColCount = t.columnCount, t.constraint !== this.constraint && (this.constraint = t.constraint), t.pageGutter !== this.rsProperties.pageGutter && (this.rsProperties.pageGutter = t.pageGutter), t.scrollPaddingBottom !== this.rsProperties.scrollPaddingBottom && (this.rsProperties.scrollPaddingBottom = t.scrollPaddingBottom), t.scrollPaddingLeft !== this.rsProperties.scrollPaddingLeft && (this.rsProperties.scrollPaddingLeft = t.scrollPaddingLeft), t.scrollPaddingRight !== this.rsProperties.scrollPaddingRight && (this.rsProperties.scrollPaddingRight = t.scrollPaddingRight), t.scrollPaddingTop !== this.rsProperties.scrollPaddingTop && (this.rsProperties.scrollPaddingTop = t.scrollPaddingTop), t.experiments !== this.rsProperties.experiments && (this.rsProperties.experiments = t.experiments), this.lineLengths.update({
      fontFace: t.fontFamily,
      letterSpacing: t.letterSpacing,
      padding: t.scroll ? (t.scrollPaddingLeft || 0) + (t.scrollPaddingRight || 0) : (t.pageGutter || 0) * 2,
      wordSpacing: t.wordSpacing,
      optimalChars: t.optimalLineLength,
      minChars: t.minimalLineLength,
      maxChars: t.maximalLineLength
    });
    const e = this.updateLayout(t.fontSize, t.deprecatedFontSize || t.iOSPatch, t.scroll, t.columnCount);
    e?.effectiveContainerWidth && (this.effectiveContainerWidth = e?.effectiveContainerWidth);
    const i = {
      a11yNormalize: t.textNormalization,
      backgroundColor: t.backgroundColor,
      blendFilter: t.blendFilter,
      bodyHyphens: typeof t.hyphens != "boolean" ? null : t.hyphens ? "auto" : "none",
      colCount: e?.colCount,
      darkenFilter: t.darkenFilter,
      deprecatedFontSize: t.deprecatedFontSize,
      fontFamily: t.fontFamily,
      fontOpticalSizing: typeof t.fontOpticalSizing != "boolean" ? null : t.fontOpticalSizing ? "auto" : "none",
      fontSize: t.fontSize,
      fontSizeNormalize: t.fontSizeNormalize,
      fontWeight: t.fontWeight,
      fontWidth: t.fontWidth,
      invertFilter: t.invertFilter,
      invertGaijiFilter: t.invertGaijiFilter,
      iOSPatch: t.iOSPatch,
      iPadOSPatch: t.iPadOSPatch,
      letterSpacing: t.letterSpacing,
      ligatures: typeof t.ligatures != "boolean" ? null : t.ligatures ? "common-ligatures" : "none",
      lineHeight: t.lineHeight,
      lineLength: e?.effectiveLineLength,
      linkColor: t.linkColor,
      noRuby: t.noRuby,
      paraIndent: t.paragraphIndent,
      paraSpacing: t.paragraphSpacing,
      selectionBackgroundColor: t.selectionBackgroundColor,
      selectionTextColor: t.selectionTextColor,
      textAlign: t.textAlign,
      textColor: t.textColor,
      view: typeof t.scroll != "boolean" ? null : t.scroll ? "scroll" : "paged",
      visitedColor: t.visitedColor,
      wordSpacing: t.wordSpacing
    };
    this.userProperties = new Fn(i);
  }
  updateLayout(t, e, i, n) {
    return this.isCJKVertical ? this.computeCJKVerticalLength(t, e) : i ?? this.userProperties.view === "scroll" ? this.computeScrollLength(t, e) : this.paginate(t, e, n);
  }
  getCompensatedMetrics(t, e) {
    const i = t || this.userProperties.fontSize || 1, n = i < 1 ? 1 / i : e ? i : 1;
    return {
      zoomFactor: i,
      zoomCompensation: n,
      optimal: Math.round(this.lineLengths.optimalLineLength) * i,
      minimal: this.lineLengths.minimalLineLength !== null ? Math.round(this.lineLengths.minimalLineLength * i) : null,
      maximal: this.lineLengths.maximalLineLength !== null ? Math.round(this.lineLengths.maximalLineLength * i) : null
    };
  }
  // Note: Kept intentionally verbose for debugging
  // TODO: As scroll shows, the effective line-length
  // should be the same as uncompensated when scale >= 1
  paginate(t, e, i) {
    const n = Math.round(At(this.containerParent) - this.constraint), s = this.getCompensatedMetrics(t, e), { zoomCompensation: o, optimal: a, minimal: l, maximal: d } = s, h = () => n >= a && d !== null ? Math.min(Math.round(d * o), n) : n;
    let c = 1, u = n;
    if (i === void 0)
      return {
        colCount: void 0,
        effectiveContainerWidth: u,
        effectiveLineLength: Math.round(u / c * o)
      };
    if (i === null)
      if (n >= a && d !== null) {
        c = Math.floor(n / a);
        const m = Math.round(c * (d * o));
        u = Math.min(m, n);
      } else
        u = h();
    else if (i > 1) {
      const m = Math.round(i * (l !== null ? l : a));
      if (n >= m)
        if (c = i, d === null)
          u = n;
        else {
          const p = Math.round(c * (d * o));
          u = Math.min(p, n);
        }
      else if (l !== null && n < Math.round(i * l))
        if (c = Math.floor(n / l), c <= 1)
          c = 1, u = h();
        else {
          const p = Math.round(c * (a * o));
          u = Math.min(p, n);
        }
      else {
        c = i;
        const p = Math.round(c * (a * o));
        u = Math.min(p, n);
      }
    } else
      c = 1, u = h();
    return {
      colCount: c,
      effectiveContainerWidth: u,
      effectiveLineLength: Math.round(u / c / (t && t >= 1 ? t : 1) * o)
    };
  }
  computeCJKVerticalLength(t, e) {
    const i = Math.round(At(this.containerParent) - this.constraint), n = Math.round(Po(this.containerParent)), s = this.getCompensatedMetrics(t, e), o = s.maximal !== null ? Math.min(Math.round(s.maximal * s.zoomCompensation), n) : n;
    return { colCount: void 0, effectiveContainerWidth: i, effectiveLineLength: o };
  }
  // This behaves as paginate where colCount = 1
  computeScrollLength(t, e) {
    const i = Math.round(At(this.containerParent) - this.constraint), n = this.getCompensatedMetrics(t && (t < 1 || e) ? t : 1, e), s = n.zoomCompensation, o = n.optimal, a = n.maximal;
    let l, d = i, h = Math.round(o * s);
    if (a === null)
      h = i;
    else {
      const c = Math.min(Math.round(a * s), i);
      h = e ? c : Math.round(c * s);
    }
    return {
      colCount: l,
      effectiveContainerWidth: d,
      effectiveLineLength: h
    };
  }
  setContainerWidth() {
    this.container.style.width = `${this.effectiveContainerWidth}px`;
  }
  resizeHandler() {
    const t = this.updateLayout(this.userProperties.fontSize, this.userProperties.deprecatedFontSize || this.userProperties.iOSPatch, this.userProperties.view === "scroll", this.cachedColCount);
    this.userProperties.colCount = t.colCount, this.userProperties.lineLength = t.effectiveLineLength, this.effectiveContainerWidth = t.effectiveContainerWidth, this.container.style.width = `${this.effectiveContainerWidth}px`;
  }
}
const _o = `// Note: we aren't blocking some of the events right now to try and be as nonintrusive as possible.
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
`;
async function xo(r, t) {
  const e = r.effectiveLayout === v.fixed, i = t.filter((a) => a.mediaType.isHTML).map((a) => a.href), n = i.length > 256 ? [/\.xhtml(?:$|[?#])/i, /\.html(?:$|[?#])/i] : i.length > 0 ? i : [/\.xhtml$/, /\.html$/], s = [
    // CSS Selector Generator - always injected
    {
      id: "css-selector-generator",
      as: "script",
      target: "head",
      blob: new Blob([_t(An)], { type: "text/javascript" })
    },
    // Execution Prevention - conditional (has executable scripts)
    {
      id: "execution-prevention",
      as: "script",
      target: "head",
      blob: new Blob([_t(_o)], { type: "text/javascript" }),
      condition: (a) => !!(a.querySelector("script") || a.querySelector("body[onload]:not(body[onload=''])"))
    }
  ], o = [
    // Onload Proxy - conditional (has executable scripts)
    {
      id: "onload-proxy",
      as: "script",
      target: "head",
      blob: new Blob([_t(Tn)], { type: "text/javascript" }),
      condition: (a) => !!(a.querySelector("script") || a.querySelector("body[onload]:not(body[onload=''])"))
    }
  ];
  if (!e) {
    const a = Et(r);
    let l, d, h;
    switch (a) {
      case "rtl": {
        const [c, u, m] = await Promise.all([
          import("./ReadiumCSS-before-DwBLxUVH.js"),
          import("./ReadiumCSS-default-BhdLiyWp.js"),
          import("./ReadiumCSS-after-d5mC4cme.js")
        ]);
        l = c.default, d = u.default, h = m.default;
        break;
      }
      case "cjk-horizontal": {
        const [c, u, m] = await Promise.all([
          import("./ReadiumCSS-before-CG-KmDa3.js"),
          import("./ReadiumCSS-default-N65xNiIp.js"),
          import("./ReadiumCSS-after-XUKPAxfT.js")
        ]);
        l = c.default, d = u.default, h = m.default;
        break;
      }
      case "cjk-vertical":
      // Traditional Mongolian (vertical-lr) uses the same Readium CSS
      // layout as CJK vertical-rl — it is an outlier handled by the
      // same stylesheet set per the Readium CSS spec.
      case "mongolian-vertical": {
        const [c, u, m] = await Promise.all([
          import("./ReadiumCSS-before-BNTwR8Qm.js"),
          import("./ReadiumCSS-default-BesyZHRU.js"),
          import("./ReadiumCSS-after-ClF4TBzj.js")
        ]);
        l = c.default, d = u.default, h = m.default;
        break;
      }
      default: {
        const [c, u, m] = await Promise.all([
          import("./ReadiumCSS-before-8FMq19-x.js"),
          import("./ReadiumCSS-default-AIAk8uwU.js"),
          import("./ReadiumCSS-after-D7unrNI9.js")
        ]);
        l = c.default, d = u.default, h = m.default;
        break;
      }
    }
    if (s.unshift({
      id: "readium-css-before",
      as: "link",
      target: "head",
      blob: new Blob([Rt(l)], { type: "text/css" }),
      rel: "stylesheet"
    }), o.unshift(
      // Readium CSS Default - only for reflowable AND no existing styles
      {
        id: "readium-css-default",
        as: "link",
        target: "head",
        blob: new Blob([Rt(d)], { type: "text/css" }),
        rel: "stylesheet",
        condition: (c) => !(c.querySelector("link[rel='stylesheet']") || c.querySelector("style") || c.querySelector("[style]:not([style=''])"))
      },
      // Readium CSS After - only for reflowable
      {
        id: "readium-css-after",
        as: "link",
        target: "head",
        blob: new Blob([Rt(h)], { type: "text/css" }),
        rel: "stylesheet"
      }
    ), (a === "cjk-horizontal" || a === "cjk-vertical") && (r.description === "ebpaj-guide-1.0" || r.otherMetadata?.["ebpaj:guide-version"] !== void 0)) {
      const { default: u } = await import("./ReadiumCSS-ebpaj_fonts_patch-Dt2XliTg.js");
      o.push({
        id: "readium-css-ebpaj",
        as: "link",
        target: "head",
        blob: new Blob([Rt(u)], { type: "text/css" }),
        rel: "stylesheet"
      });
    }
  }
  return [
    {
      resources: n,
      prepend: s,
      append: o
    }
  ];
}
const Lo = (r) => ({
  frameLoaded: r.frameLoaded || (() => {
  }),
  positionChanged: r.positionChanged || (() => {
  }),
  tap: r.tap || (() => !1),
  click: r.click || (() => !1),
  zoom: r.zoom || (() => {
  }),
  miscPointer: r.miscPointer || (() => {
  }),
  scroll: r.scroll || (() => {
  }),
  customEvent: r.customEvent || (() => {
  }),
  handleLocator: r.handleLocator || (() => !1),
  textSelected: r.textSelected || (() => {
  }),
  contentProtection: r.contentProtection || (() => {
  }),
  contextMenu: r.contextMenu || (() => {
  }),
  peripheral: r.peripheral || (() => {
  })
});
class zn extends Pn {
  constructor(t, e, i, n = [], s = void 0, o = { preferences: {}, defaults: {} }) {
    super(), this._preferencesEditor = null, this._injector = null, this._isNavigating = !1, this.turnRequestId = 0, this._navigatorProtector = null, this._keyboardPeripheralsManager = null, this._suspiciousActivityListener = null, this._keyboardPeripheralListener = null, this._decorations = /* @__PURE__ */ new Map(), this._decorationObservers = /* @__PURE__ */ new Map(), this._decorationActivationState = /* @__PURE__ */ new Map(), this._decorationActivationConsumed = !1, this.positionNotificationRevision = 0, this.positionNotificationTimers = /* @__PURE__ */ new Set(), this.scrollPositionTimer = void 0, this.destroyed = !1, this.reflowViewport = {
      readingOrder: [],
      progressions: /* @__PURE__ */ new Map(),
      positions: null
    }, this.pub = e, this.container = t, this.listeners = Lo(i), this.currentLocation = s, this.positionsByHref = /* @__PURE__ */ new Map(), n.length && (this.positions = n), this._preferences = new Ht(o.preferences), this._defaults = new mo(o.defaults), this._settings = new Yi(this._preferences, this._defaults), this.rebuildPositionsByHref();
    const a = Et(e.metadata), l = a === "cjk-horizontal", d = a === "cjk-vertical", c = d || a === "mongolian-vertical", u = l || d;
    this._css = new Co({
      rsProperties: new Eo({ noVerticalPagination: c || void 0 }),
      userProperties: new Fn({}),
      lineLengths: new Nt({
        optimalChars: this._settings.optimalLineLength,
        minChars: this._settings.minimalLineLength,
        maxChars: this._settings.maximalLineLength,
        padding: this._settings.scroll ? (this._settings.scrollPaddingLeft || 0) + (this._settings.scrollPaddingRight || 0) : (this._settings.pageGutter || 0) * 2,
        fontFace: this._settings.fontFamily,
        letterSpacing: this._settings.letterSpacing,
        wordSpacing: this._settings.wordSpacing,
        isCJK: u
        //    sample: this.pub.metadata.description
      }),
      container: t,
      constraint: this._settings.constraint,
      isCJKVertical: c
    }), this._layout = zn.determineLayout(e, !!this._settings.scroll), this.currentProgression = e.metadata.effectiveReadingProgression, this._injectablesConfig = o.injectables || { rules: [], allowedDomains: [] }, this._readiumRulesPromise = xo(e.metadata, e.readingOrder.items), this._contentProtection = o.contentProtection || {}, this._decoratorConfig = o.decoratorConfig || {}, this._keyboardPeripherals = this.mergeKeyboardPeripherals(
      this._contentProtection,
      o.keyboardPeripherals || []
    ), (this._contentProtection.disableContextMenu || this._contentProtection.checkAutomation || this._contentProtection.checkIFrameEmbedding || this._contentProtection.monitorDevTools || this._contentProtection.protectPrinting?.disable) && (this._navigatorProtector = new Qe(this._contentProtection), this._suspiciousActivityListener = (m) => {
      const { type: p, ...f } = m.detail;
      p === "context_menu" ? this.listeners.contextMenu(f) : this.listeners.contentProtection(p, f);
    }, window.addEventListener(ct, this._suspiciousActivityListener)), this._keyboardPeripherals.length > 0 && (this._keyboardPeripheralsManager = new ti({
      keyboardPeripherals: this._keyboardPeripherals
    }), this._keyboardPeripheralListener = (m) => {
      const p = m.detail;
      this.listeners.peripheral(p);
    }, window.addEventListener(dt, this._keyboardPeripheralListener));
    this.resizeObserver = { disconnect() {
    } };
  }
  static determineLayout(t, e) {
    const i = t.metadata.effectiveLayout;
    if (i === v.fixed || t.metadata.otherMetadata && "http://openmangaformat.org/schema/1.0#version" in t.metadata.otherMetadata || t.metadata?.conformsTo?.includes(en.DIVINA))
      return v.fixed;
    if (i === v.scrolled)
      return v.scrolled;
    const n = Et(t.metadata);
    return n === "cjk-vertical" || n === "mongolian-vertical" || i === v.reflowable && e ? v.scrolled : v.reflowable;
  }
  rebuildPositionsByHref() {
    this.positionsByHref.clear();
    for (const t of this.positions || []) {
      const e = this.positionsByHref.get(t.href);
      e ? e.push(t) : this.positionsByHref.set(t.href, [t]);
    }
    for (const t of this.positionsByHref.values())
      t.sort((e, i) => (e.locations?.progression ?? 0) - (i.locations?.progression ?? 0));
  }
  async load() {
    if (!this.positions?.length)
      this.positions = await this.pub.positionsFromManifest(), this.rebuildPositionsByHref();
    if (!this._injector) {
      const t = await this._readiumRulesPromise;
      this._injector = new Rn({
        rules: [...t, ...this._injectablesConfig.rules],
        allowedDomains: this._injectablesConfig.allowedDomains
      });
    }
    if (this._layout === v.fixed)
      this.framePool = new fo(
        this.container,
        this.positions,
        this.pub,
        this._injector,
        this._contentProtection,
        this._keyboardPeripherals
      ), this.framePool.listener = (t, e) => {
        this.eventListener(t, e);
      };
    else {
      await this.updateCSS(!1);
      const t = this.compileCSSProperties(this._css);
      this.framePool = new to(
        this.container,
        this.positions,
        t,
        this._injector,
        this._contentProtection,
        this._keyboardPeripherals
      );
    }
    this.currentLocation === void 0 && (this.currentLocation = this.positions[0]), await this.resizeHandler(), await this.apply();
  }
  get settings() {
    if (this._layout === v.fixed)
      return Object.freeze({ ...this._settings });
    {
      const t = this._css.userProperties.colCount || this._css.rsProperties.colCount || this._settings.columnCount;
      return Object.freeze({ ...this._settings, columnCount: t });
    }
  }
  get preferencesEditor() {
    return this._preferencesEditor === null && (this._preferencesEditor = new Xi(this._preferences, this.settings, this.pub.metadata)), this._preferencesEditor;
  }
  async submitPreferences(t) {
    this._preferences = this._preferences.merging(t), await this.applyPreferences();
  }
  async applyPreferences() {
    const t = this._settings;
    this._settings = new Yi(this._preferences, this._defaults), this._preferencesEditor !== null && (this._preferencesEditor = new Xi(this._preferences, this.settings, this.pub.metadata)), this._layout === v.fixed ? this.handleFXLPrefs(t, this._settings) : await this.updateCSS(!0);
  }
  // TODO: fit, etc.
  handleFXLPrefs(t, e) {
    t.columnCount !== e.columnCount && this.framePool.setPerPage(e.columnCount);
  }
  async updateCSS(t) {
    this._css.update(this._settings), t && await this.commitCSS(this._css);
  }
  compileCSSProperties(t) {
    const e = {};
    for (const [i, n] of Object.entries(t.rsProperties.toCSSProperties()))
      e[i] = n;
    for (const [i, n] of Object.entries(t.userProperties.toCSSProperties()))
      e[i] = n;
    return e;
  }
  async commitCSS(t) {
    if (!this.framePool) return;
    const e = this.compileCSSProperties(t);
    this.framePool.setCSSProperties(e), this._css.userProperties.view === "paged" && this._layout === v.scrolled ? await this.setLayout(v.reflowable) : this._css.userProperties.view === "scroll" && this._layout === v.reflowable && await this.setLayout(v.scrolled), this._css.setContainerWidth();
  }
  async resizeHandler() {
    this.invalidatePositionNotifications();
    this.clearPreparedReady();
    const t = this.container.parentElement || document.documentElement;
    if (this._layout === v.fixed) {
      if (this.container.style.width = `${At(t) - this._settings.constraint}px`, !this.framePool) return;
      this.framePool.resizeHandler();
    } else {
      this.framePool?.release();
      const e = this._css.userProperties.colCount, i = this._css.userProperties.lineLength;
      this._css.resizeHandler(), (this._css.userProperties.view !== "scroll" && e !== this._css.userProperties.colCount || i !== this._css.userProperties.lineLength) && await this.commitCSS(this._css);
    }
  }
  get layout() {
    return this._layout;
  }
  get ownerWindow() {
    return this.container.ownerDocument.defaultView || window;
  }
  /**
   * Exposed to the public to compensate for lack of implemented readium conveniences
   * TODO remove when settings management is incorporated
   */
  get _cframes() {
    return (this.framePool?.currentFrames ?? []).filter((t) => !(t instanceof Mn && t.isDestroyed));
  }
  /**
   * Exposed to the public to compensate for lack of implemented readium conveniences
   * TODO remove when settings management is incorporated
   */
  get pool() {
    return this.framePool;
  }
  /**
   * Left intentionally public so you can pass in your own events here
   * to trigger the navigator when user's mouse/keyboard focus is
   * outside the readium-controller navigator. Be careful!
   */
  eventListener(t, e, i) {
    switch (t) {
      case "_pong":
        if (this.listeners.frameLoaded(this._cframes[0].iframe.contentWindow), this.listeners.positionChanged(this.currentLocation), i) {
          const h = this._cframes.filter((u) => !!u).indexOf(i), c = h >= 0 ? this.viewport.readingOrder[h] : void 0;
          c && this._reapplyDecorationsToFrame(i, c);
        } else
          this._reapplyDecorationsToCurrentFrames();
        break;
      case "first_visible_locator":
        const n = F.deserialize(e);
        if (!n) break;
        this.currentLocation = new F({
          href: this.currentLocation.href,
          type: this.currentLocation.type,
          title: this.currentLocation.title,
          locations: n?.locations,
          text: n?.text
        }), this.listeners.positionChanged(this.currentLocation);
        break;
      case "text_selected": {
        const d = e;
        if (i) {
          const c = this._cframes.filter((m) => !!m).indexOf(i), u = c >= 0 ? this.viewport.readingOrder[c] : void 0;
          if (u) {
            const m = this.pub.readingOrder.findWithHref(u);
            d.locator = new F({ href: u, type: m.type || "application/xhtml+xml", text: new tt({ highlight: d.text }) });
          }
        }
        this.listeners.textSelected(d);
        break;
      }
      case "decoration_activated": {
        this._handleDecorationActivated(e) && (this._decorationActivationConsumed = !0);
        break;
      }
      case "click":
      case "tap":
        if (this._decorationActivationConsumed) {
          this._decorationActivationConsumed = !1;
          break;
        }
        const s = e;
        if (s.interactiveElement) {
          const d = new DOMParser().parseFromString(
            s.interactiveElement,
            "text/html"
          ).body.children[0];
          if (d.nodeType === d.ELEMENT_NODE && d.nodeName === "A" && d.hasAttribute("href")) {
            const h = d.attributes.getNamedItem("href")?.value;
            if (h.startsWith("#"))
              this.go(this.currentLocation.copyWithLocations({
                fragments: [h.substring(1)]
              }), !1, () => {
              });
            else if (h.startsWith("http://") || h.startsWith("https://") || h.startsWith("mailto:") || h.startsWith("tel:"))
              this.listeners.handleLocator(new q({
                href: h
              }).locator);
            else
              try {
                this.goLink(new q({
                  href: Zt.join(Zt.dirname(this.currentLocation.href), h)
                }), !1, () => {
                });
              } catch (c) {
                console.warn(`Couldn't go to link for ${h}: ${c}`), this.listeners.handleLocator(new q({
                  href: h
                }).locator);
              }
          } else if (d.nodeType === d.ELEMENT_NODE && (d.nodeName === "IMG" || d.nodeName === "IMAGE" || d.querySelector?.("img, image"))) {
            if (t === "click" ? this.listeners.click(s) : this.listeners.tap(s)) break;
          } else console.log("Clicked on", d);
        } else {
          if (this._layout === v.fixed && this.framePool.doNotDisturb && (s.doNotDisturb = !0), this._layout === v.fixed && (this.currentProgression === I.rtl || this.currentProgression === I.ltr) && this.framePool.currentFrames.length > 1) {
            const c = this.framePool.currentFrames;
            s.targetFrameSrc === c[this.currentProgression === I.rtl ? 0 : 1]?.source && (s.x += (c[this.currentProgression === I.rtl ? 1 : 0]?.iframe.contentWindow?.innerWidth ?? 0) * window.devicePixelRatio);
          }
          if (t === "click" ? this.listeners.click(s) : this.listeners.tap(s)) break;
          const h = (this._cframes.length === 2 ? this._cframes[0].window.innerWidth + this._cframes[1].window.innerWidth : this._cframes[0].window.innerWidth) * window.devicePixelRatio / 4;
          s.x >= h && s.x <= h * 3 && this.listeners.miscPointer(1), s.x < h ? this.goLeft(!1, () => {
          }) : s.x > h * 3 && this.goRight(!1, () => {
          });
        }
        break;
      case "tap_more":
        this.listeners.miscPointer(e);
        break;
      case "no_more":
        this.changeResource(1);
        break;
      case "no_less":
        this.changeResource(-1);
        break;
      case "swipe":
        break;
      case "scroll":
        this.listeners.scroll(e);
        break;
      case "zoom":
        this.listeners.zoom(e);
        break;
      case "progress":
        i === this._cframes[0] && this.syncLocation(e, "scroll");
        break;
      case "content_protection":
        const o = e;
        this.listeners.contentProtection(o.type, o);
        break;
      case "context_menu":
        this.listeners.contextMenu(e);
        break;
      case "keyboard_peripherals":
        const a = e, l = { ...a, interactiveElement: void 0 };
        a.interactiveElement && (l.interactiveElement = new DOMParser().parseFromString(
          a.interactiveElement,
          "text/html"
        ).body.children[0]), this.listeners.peripheral(l);
        break;
      case "log":
        console.log(this._cframes[0]?.source?.split("/")[3], ...e);
        break;
      default:
        this.listeners.customEvent(t, e);
        break;
    }
  }
  determineModules() {
    let t = Array.from(Ie.keys());
    if (this._layout === v.fixed)
      return t.filter((n) => Us.includes(n));
    t = t.filter((n) => Hs.includes(n));
    const e = Et(this.pub.metadata);
    if (e === "cjk-vertical" || e === "mongolian-vertical")
      return t.filter((n) => n !== "column_snapper" && n !== "scroll_snapper");
    const i = t;
    return this._layout === v.scrolled ? t = i.filter((n) => n !== "column_snapper" && n !== "cjk_vertical_snapper") : t = i.filter((n) => n !== "scroll_snapper" && n !== "cjk_vertical_snapper"), t;
  }
  // Start listening to messages from the current iframe
  attachListener() {
    const t = this._cframes.filter((e) => !!e);
    if (t.length === 0) throw Error("no cframe to attach listener to");
    t.forEach((e) => {
      e.msg && (e.msg.listener = (i, n) => {
        this.eventListener(i, n, e);
      });
    }), this._reapplyDecorationsToCurrentFrames();
  }
  async apply() {
    if (await this.framePool.update(this.pub, this.currentLocator, this.determineModules()), this.attachListener(), this.pub.readingOrder.findIndexWithHref(this.currentLocation.href) < 0)
      throw Error("Link for " + this.currentLocation.href + " not found!");
  }
  // DecorableNavigator
  supportsDecorationStyle(t) {
    return Cn.has(t) || !!this._decoratorConfig.decorationTemplates?.[t];
  }
  registerDecorationObserver(t, e) {
    this._decorationObservers.has(t) || this._decorationObservers.set(t, /* @__PURE__ */ new Set()), this._decorationObservers.get(t).add(e), this._decorationActivationState.set(t, !0), this._sendDecorationActivationToFrames(t, !0);
  }
  unregisterDecorationObserver(t) {
    this._decorationObservers.forEach((e, i) => {
      e.has(t) && (e.delete(t), e.size === 0 && (this._decorationActivationState.delete(i), this._sendDecorationActivationToFrames(i, !1)));
    });
  }
  _sendDecorationActivationToFrames(t, e) {
    this._cframes.filter((n) => !!n).forEach((n) => {
      n.msg && n.msg.send("decoration_activatable", { group: t, activatable: e });
    });
  }
  applyDecorations(t, e) {
    const i = this._decorations.get(e) ?? [], n = new Map(i.map((h) => [h.id, h])), s = new Map(t.map((h) => [h.id, h])), o = [], a = [], l = [];
    for (const [h, c] of n)
      s.has(h) ? En(c, s.get(h)) || l.push(s.get(h)) : o.push(h);
    for (const [h, c] of s)
      n.has(h) || a.push(c);
    this._decorations.set(e, t), this._sendDecorationOps(e, o, a, l, i);
    const d = this._decorationActivationState.get(e);
    d !== void 0 && this._sendDecorationActivationToFrames(e, d);
  }
  _sendDecorationOps(t, e, i, n, s) {
    const o = this._cframes.filter((d) => !!d), a = new Map(s.map((d) => [d.id, d])), l = this.viewport.readingOrder;
    o.forEach((d, h) => {
      if (!d.msg) return;
      const c = l[h];
      if (c) {
        for (const u of e) {
          const m = a.get(u);
          !m || m.locator.href !== c || d.msg.send("decorate", { group: t, action: "remove", decoration: { id: u } });
        }
        for (const u of i)
          u.locator.href === c && d.msg.send("decorate", { group: t, action: "add", decoration: Pt(u, this._decoratorConfig.decorationTemplates) });
        for (const u of n)
          u.locator.href === c && d.msg.send("decorate", { group: t, action: "update", decoration: Pt(u, this._decoratorConfig.decorationTemplates) });
      }
    });
  }
  _reapplyDecorationsToFrame(t, e) {
    if (t.msg) {
      for (const [i, n] of this._decorations) {
        const s = n.filter((o) => o.locator.href === e);
        if (s.length !== 0) {
          t.msg.send("decorate", { group: i, action: "clear" });
          for (const o of s)
            t.msg.send("decorate", { group: i, action: "add", decoration: Pt(o, this._decoratorConfig.decorationTemplates) });
        }
      }
      for (const [i, n] of this._decorationActivationState)
        t.msg.send("decoration_activatable", { group: i, activatable: n });
    }
  }
  _reapplyDecorationsToCurrentFrames() {
    const t = this._cframes.filter((i) => !!i), e = this.viewport.readingOrder;
    t.forEach((i, n) => {
      const s = e[n];
      s && this._reapplyDecorationsToFrame(i, s);
    });
  }
  _handleDecorationActivated(t) {
    const e = this._decorationObservers.get(t.group);
    if (!e || e.size === 0) return !1;
    const i = (this._decorations.get(t.group) ?? []).find((o) => o.id === t.decorationId);
    if (!i) return !1;
    const n = { decoration: i, group: t.group, rect: t.rect, point: t.point };
    let s = !1;
    for (const o of e)
      o.onDecorationActivated(n) && (s = !0);
    return s;
  }
  // End of Decoration
  async destroy() {
    this.destroyed = !0, this.invalidatePositionNotifications(), this._suspiciousActivityListener && window.removeEventListener(ct, this._suspiciousActivityListener), this._keyboardPeripheralListener && window.removeEventListener(dt, this._keyboardPeripheralListener), this._navigatorProtector?.destroy(), this._keyboardPeripheralsManager?.destroy(), await this.framePool?.destroy(), this._decorations.clear(), this._decorationObservers.clear(), this._decorationActivationState.clear();
  }
  async prepare(t) {
    if (this._layout === v.fixed || !this.framePool)
      return [];
    const e = this.pub.readingOrder.findWithHref(t.href);
    if (!e)
      return [];
    await this.framePool.prepare(this.pub, e.href, this.determineModules());
    const i = this.framePool.pool.get(e.href)?.iframe?.contentWindow;
    return i ? [i] : [];
  }
  async reservePrepared(t) {
    if (this._layout === v.fixed || !this.framePool)
      return [];
    const e = this.pub.readingOrder.findWithHref(t.href);
    if (!e)
      return [];
    this.framePool.reserve(e.href);
    await this.framePool.prepare(this.pub, e.href, this.determineModules(), !0);
    const i = this.framePool.pool.get(e.href)?.iframe?.contentWindow;
    return i ? [i] : [];
  }
  markPreparedReady(t, e, i) {
    if (this._layout === v.fixed || !this.framePool)
      return;
    const n = this.pub.readingOrder.findWithHref(t.href), s = n && this.framePool.pool.get(n.href);
    s && (!i || s.window === i) && (s.preparedLayoutKey = e);
  }
  isPreparedReady(t, e) {
    if (this._layout === v.fixed || !this.framePool)
      return !1;
    const i = this.pub.readingOrder.findWithHref(t.href), n = i && this.framePool.pool.get(i.href);
    return !!n && n.preparedLayoutKey === e;
  }
  clearPreparedReady(t) {
    if (this._layout === v.fixed || !this.framePool)
      return;
    const e = t && this.pub.readingOrder.findWithHref(t.href);
    if (t) {
      const i = e && this.framePool.pool.get(e.href);
      i && (i.preparedLayoutKey = void 0);
      return;
    }
    this.framePool.pool.forEach((i) => {
      i.preparedLayoutKey = void 0;
    });
  }
  releasePrepared(t) {
    if (this._layout === v.fixed || !this.framePool)
      return;
    const e = t && this.pub.readingOrder.findWithHref(t.href);
    this.framePool.release(e?.href);
  }
  async changeResource(t) {
    if (t === 0) return !1;
    this.invalidatePositionNotifications();
    if (this._layout === v.fixed) {
      const n = this.framePool, s = n.viewport.positions[0];
      if (t === 1) {
        if (!n.next(n.perPage)) return !1;
      } else if (t === -1) {
        if (!n.prev(n.perPage)) return !1;
      } else
        throw Error("Invalid relative value for FXL");
      const o = n.viewport.positions[0];
      if (s > o) {
        for (let a = this.positions.length - 1; a >= 0; a--)
          if (this.positions[a].href === this.pub.readingOrder.items[o - 1].href) {
            this.currentLocation = this.positions[a].copyWithLocations({
              progression: 0.999999999999
            });
            break;
          }
      } else if (s < o) {
        for (let a = 0; a < this.positions.length; a++)
          if (this.positions[a].href === this.pub.readingOrder.items[o - 1].href) {
            this.currentLocation = this.positions[a];
            break;
          }
      }
      return await this.apply(), this.listeners.positionChanged(this.currentLocation), !0;
    }
    const e = this.pub.readingOrder.findIndexWithHref(this.currentLocation.href), i = Math.max(
      0,
      Math.min(this.pub.readingOrder.items.length - 1, e + t)
    );
    if (i === e)
      return this._cframes[0]?.msg?.send("shake", void 0, async (n) => {
      }), !1;
    if (e > i) {
      for (let n = this.positions.length - 1; n >= 0; n--)
        if (this.positions[n].href === this.pub.readingOrder.items[i].href) {
          this.currentLocation = this.positions[n].copyWithLocations({
            progression: 0.999999999999
          });
          break;
        }
    } else
      for (let n = 0; n < this.positions.length; n++)
        if (this.positions[n].href === this.pub.readingOrder.items[i].href) {
          this.currentLocation = this.positions[n];
          break;
        }
    return await this.apply(), !0;
  }
  findNearestPositions(t) {
    const e = this.currentLocation?.href ? this.currentLocation : this.positions?.[0], i = e?.href || "", n = this.positionsByHref.get(i) || [];
    let s = 0, o = n.length;
    for (; s < o; ) {
      const h = s + o >> 1;
      (n[h].locations?.progression ?? 0) <= t.start ? s = h + 1 : o = h;
    }
    let a = e, l;
    const d = s - 1;
    if (d !== -1) {
      a = n[d], s = d + 1, o = n.length;
      for (; s < o; ) {
        const h = s + o >> 1;
        (n[h].locations?.progression ?? 0) <= t.end ? s = h + 1 : o = h;
      }
      const c = s - 1, u = c > d ? n[c] : void 0, m = u?.locations?.progression;
      m && m > t.start && m <= t.end && (l = u);
    }
    return { first: a, last: l };
  }
  updateViewport(t) {
    this.reflowViewport.readingOrder = [], this.reflowViewport.progressions.clear(), this.reflowViewport.positions = null, this.currentLocation && (this.reflowViewport.readingOrder.push(this.currentLocation.href), this.reflowViewport.progressions.set(this.currentLocation.href, t), this.currentLocation.locations?.position !== void 0 && (this.reflowViewport.positions = [this.currentLocation.locations.position], this.lastLocationInView?.locations?.position !== void 0 && this.reflowViewport.positions.push(this.lastLocationInView.locations.position)));
  }
  progressEquals(t) {
    const e = this.reflowViewport.progressions.get(this.currentLocation.href);
    return e?.start === t.start && e?.end === t.end;
  }
  commitProgress(t) {
    if (this.progressEquals(t)) return;
    const e = performance.now(), i = this.findNearestPositions(t), n = performance.now() - e;
    if (!i.first) return;
    return this.currentLocation = i.first.copyWithLocations({
      progression: t.start
    }), this.lastLocationInView = i.last, this.updateViewport(t), { locator: this.currentLocation, locatorLookupMs: n };
  }
  notifyPositionChanged(t, e) {
    const i = t.copyWithLocations({ ...t.locations }), n = Object.freeze({ ...e }), s = this.positionNotificationRevision, o = () => {
      this.positionNotificationTimers.delete(a), this.scrollPositionTimer === a && (this.scrollPositionTimer = void 0), !this.destroyed && s === this.positionNotificationRevision && this.currentLocation.href === i.href && this.listeners.positionChanged(i, n);
    };
    e.cause === "scroll" && this.scrollPositionTimer !== void 0 && (this.ownerWindow.clearTimeout(this.scrollPositionTimer), this.positionNotificationTimers.delete(this.scrollPositionTimer));
    const a = this.ownerWindow.setTimeout(o, 0);
    this.positionNotificationTimers.add(a), e.cause === "scroll" && (this.scrollPositionTimer = a);
  }
  invalidatePositionNotifications() {
    this.positionNotificationRevision += 1, this.positionNotificationTimers.forEach((t) => this.ownerWindow.clearTimeout(t)), this.positionNotificationTimers.clear(), this.scrollPositionTimer = void 0;
  }
  syncLocation(t, e = "scroll") {
    const i = this.commitProgress(t);
    i && this.notifyPositionChanged(i.locator, {
      cause: e,
      callbackReleased: !1
    });
  }
  goBackward(t, e) {
    const r = ++this.turnRequestId;
    if (this._isNavigating) {
      e(!1, void 0, r);
      return;
    }
    const i = this._cframes[0];
    if (this._layout !== v.fixed && !i?.msg) {
      e(!1, void 0, r);
      return;
    }
    this._isNavigating = !0;
    const n = (s) => {
      this._isNavigating = !1, console.error("Failed to go backward:", s), e(!1, void 0, r);
    };
    this._layout === v.fixed ? this.changeResource(-1).then((s) => {
      this._isNavigating = !1, e(s, void 0, r);
    }).catch(n) : i.msg.send("go_prev", void 0, async (s, o) => {
      const a = s?.kind === "turn", l = a ? !!s.ok : !!s, d = a ? this.commitProgress(s.progress) : void 0, h = s?.transport ?? o;
      if (l) {
        this._isNavigating = !1;
        try {
          e(!0, h, r);
        } finally {
          d && this.notifyPositionChanged(d.locator, {
            cause: "turn",
            callbackReleased: !0,
            turnRequestId: r,
            iframeElapsedMs: s.iframeElapsedMs,
            locatorLookupMs: d.locatorLookupMs,
            transport: h
          });
        }
      }
      else {
        try {
          const c = await this.changeResource(-1);
          this._isNavigating = !1, e(c, h, r);
        } catch (c) {
          n(c);
        }
      }
    });
  }
  goForward(t, e) {
    const r = ++this.turnRequestId;
    if (this._isNavigating) {
      e(!1, void 0, r);
      return;
    }
    const i = this._cframes[0];
    if (this._layout !== v.fixed && !i?.msg) {
      e(!1, void 0, r);
      return;
    }
    this._isNavigating = !0;
    const n = (s) => {
      this._isNavigating = !1, console.error("Failed to go forward:", s), e(!1, void 0, r);
    };
    this._layout === v.fixed ? this.changeResource(1).then((s) => {
      this._isNavigating = !1, e(s, void 0, r);
    }).catch(n) : i.msg.send("go_next", void 0, async (s, o) => {
      const a = s?.kind === "turn", l = a ? !!s.ok : !!s, d = a ? this.commitProgress(s.progress) : void 0, h = s?.transport ?? o;
      if (l) {
        this._isNavigating = !1;
        try {
          e(!0, h, r);
        } finally {
          d && this.notifyPositionChanged(d.locator, {
            cause: "turn",
            callbackReleased: !0,
            turnRequestId: r,
            iframeElapsedMs: s.iframeElapsedMs,
            locatorLookupMs: d.locatorLookupMs,
            transport: h
          });
        }
      }
      else {
        try {
          const c = await this.changeResource(1);
          this._isNavigating = !1, e(c, h, r);
        } catch (c) {
          n(c);
        }
      }
    });
  }
  get currentLocator() {
    return this.currentLocation;
  }
  get viewport() {
    return this._layout === v.fixed ? this.framePool ? this.framePool.viewport : { readingOrder: [], progressions: /* @__PURE__ */ new Map(), positions: null } : this.reflowViewport;
  }
  get isScrollStart() {
    const t = this.viewport.readingOrder[0];
    return this.viewport.progressions.get(t)?.start === 0;
  }
  get isScrollEnd() {
    const t = this.viewport.readingOrder[this.viewport.readingOrder.length - 1];
    return this.viewport.progressions.get(t)?.end === 1;
  }
  get canGoBackward() {
    const t = this.pub.readingOrder.items[0]?.href;
    return !(this.viewport.progressions.has(t) && this.viewport.progressions.get(t)?.start === 0);
  }
  get canGoForward() {
    const t = this.pub.readingOrder.items[this.pub.readingOrder.items.length - 1]?.href;
    return !(this.viewport.progressions.has(t) && this.viewport.progressions.get(t)?.end === 1);
  }
  // TODO: This is temporary until user settings are implemented.
  get readingProgression() {
    return this.currentProgression;
  }
  async setLayout(t, e = !1) {
    (this._layout !== t || e) && (this.invalidatePositionNotifications(), this.clearPreparedReady(), this.framePool.release(), this._layout = t, await this.framePool.update(this.pub, this.currentLocator, this.determineModules(), !0), this.attachListener());
  }
  get publication() {
    return this.pub;
  }
  async loadLocator(t, e) {
    let i = !1, n = typeof t.locations.getCssSelector == "function" && t.locations.getCssSelector();
    if (t.text?.highlight ? i = await new Promise((l, d) => {
      this._cframes[0].msg.send(
        "go_text",
        n ? [
          t.text?.serialize(),
          n
          // Include CSS selector if it exists
        ] : t.text?.serialize(),
        (h) => l(h)
      );
    }) : n && (i = await new Promise((l, d) => {
      this._cframes[0].msg.send(
        "go_text",
        [
          "",
          // No text!
          n
          // Just CSS selector
        ],
        (h) => l(h)
      );
    })), i) {
      e(i);
      return;
    }
    const s = typeof t.locations.htmlId == "function" && t.locations.htmlId();
    if (s && (i = await new Promise((l, d) => {
      this._cframes[0].msg.send("go_id", s, (h) => l(h));
    })), i) {
      e(i);
      return;
    }
    const o = t?.locations?.progression;
    o && o > 0 ? i = await new Promise((l, d) => {
      this._cframes[0].msg.send("go_progression", o, (h) => l(h));
    }) : i = !0, e(i);
  }
  go(t, e, i) {
    const n = t.href.split("#")[0];
    let s = this.pub.readingOrder.findWithHref(n);
    if (!s)
      return i(this.listeners.handleLocator(t));
    if (this._isNavigating) {
      i(!1);
      return;
    }
    this._isNavigating = !0, this.currentLocation = this.positions.find((o) => o.href === s.href), this.apply().then(() => this.loadLocator(t, (o) => {
      this._isNavigating = !1, i(o);
    })).then(() => {
      this.attachListener();
    }).catch((o) => {
      this._isNavigating = !1, console.error("Failed to go to locator:", o), i(!1);
    });
  }
  goLink(t, e, i) {
    return this.go(t.locator, e, i);
  }
}
const ko = `// PreservePitchProcessor.js
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
`;
class ei {
  constructor(t) {
    this.workletNode = null, this.url = null, this.ctx = t;
  }
  static async createWorklet(t) {
    const { ctx: e, pitchFactor: i, modulePath: n } = t, s = new ei(e);
    try {
      if (n)
        await e.audioWorklet.addModule(n);
      else {
        const o = new Blob([ko], { type: "text/javascript" });
        s.url = URL.createObjectURL(o), await e.audioWorklet.addModule(s.url);
      }
    } catch (o) {
      throw s.destroy(), new Error(`Error adding module: ${o}`);
    }
    try {
      s.workletNode = new AudioWorkletNode(e, "preserve-pitch-processor"), i && s.updatePitchFactor(i);
    } catch (o) {
      throw s.destroy(), new Error(`Error creating worklet node: ${o}`);
    }
    return s;
  }
  updatePitchFactor(t) {
    this.workletNode && this.workletNode.port.postMessage({ type: "setPitchFactor", factor: t });
  }
  destroy() {
    this.workletNode && (this.workletNode.disconnect(), this.workletNode = null), this.url && (URL.revokeObjectURL(this.url), this.url = null);
  }
}
class Oo {
  constructor(t) {
    this.audioContext = null, this.sourceNode = null, this.gainNode = null, this.listeners = {}, this.isMutedValue = !1, this.isPlayingValue = !1, this.isPausedValue = !1, this.isLoadingValue = !1, this.isLoadedValue = !1, this.isEndedValue = !1, this.isStoppedValue = !1, this.worklet = null, this.webAudioActive = !1, this.boundOnCanPlayThrough = this.onCanPlayThrough.bind(this), this.boundOnTimeUpdate = this.onTimeUpdate.bind(this), this.boundOnError = this.onError.bind(this), this.boundOnEnded = this.onEnded.bind(this), this.boundOnStalled = this.onStalled.bind(this), this.boundOnEmptied = this.onEmptied.bind(this), this.boundOnSuspend = this.onSuspend.bind(this), this.boundOnWaiting = this.onWaiting.bind(this), this.boundOnLoadedMetadata = this.onLoadedMetadata.bind(this), this.boundOnSeeking = this.onSeeking.bind(this), this.boundOnSeeked = this.onSeeked.bind(this), this.boundOnPlay = this.onPlay.bind(this), this.boundOnPlaying = this.onPlaying.bind(this), this.boundOnPause = this.onPause.bind(this), this.boundOnProgress = this.onProgress.bind(this), this.playback = t.playback, this.mediaElement = document.createElement("audio"), this.mediaElement.addEventListener("canplaythrough", this.boundOnCanPlayThrough), this.mediaElement.addEventListener("timeupdate", this.boundOnTimeUpdate), this.mediaElement.addEventListener("error", this.boundOnError), this.mediaElement.addEventListener("ended", this.boundOnEnded), this.mediaElement.addEventListener("stalled", this.boundOnStalled), this.mediaElement.addEventListener("emptied", this.boundOnEmptied), this.mediaElement.addEventListener("suspend", this.boundOnSuspend), this.mediaElement.addEventListener("waiting", this.boundOnWaiting), this.mediaElement.addEventListener("loadedmetadata", this.boundOnLoadedMetadata), this.mediaElement.addEventListener("seeking", this.boundOnSeeking), this.mediaElement.addEventListener("seeked", this.boundOnSeeked), this.mediaElement.addEventListener("play", this.boundOnPlay), this.mediaElement.addEventListener("playing", this.boundOnPlaying), this.mediaElement.addEventListener("pause", this.boundOnPause), this.mediaElement.addEventListener("progress", this.boundOnProgress), this.mediaElement.currentTime = this.playback.state.currentTime;
  }
  /**
   * Adds an event listener to the audio engine.
   * @param event - event name to be listened.
   * @param callback - callback function to be called when the event is triggered.
   */
  on(t, e) {
    this.listeners[t] || (this.listeners[t] = []), this.listeners[t].push(e);
  }
  /**
   * Removes an event listener from the audio engine.
   * @param event - event name to be removed from the listeners.
   * @param callback - callback function to be removed.
   */
  off(t, e) {
    this.listeners[t] && (this.listeners[t] = this.listeners[t].filter(
      (i) => i !== e
    ));
  }
  // Ensure AudioContext is running
  async ensureAudioContextRunning() {
    this.audioContext || (this.audioContext = new AudioContext()), this.audioContext.state === "suspended" && await this.audioContext.resume();
  }
  getOrCreateAudioContext() {
    return this.audioContext || (this.audioContext = new AudioContext()), this.audioContext;
  }
  // Event handler for timeupdate
  onTimeUpdate() {
    this.emit("timeupdate", this.mediaElement.currentTime);
  }
  // Event handler for canplaythrough
  onCanPlayThrough() {
    this.isLoadingValue = !1, this.isLoadedValue = !0, this.emit("canplaythrough", null);
  }
  // Event handler for error
  onError() {
    console.error("Error loading media element"), this.emit("error", this.mediaElement.error);
  }
  // Event handle for ended
  onEnded() {
    this.isPlayingValue = !1, this.isPausedValue = !1, this.isEndedValue = !0, this.emit("ended", null);
  }
  onStalled(t) {
    this.emit("stalled", t);
  }
  onEmptied(t) {
    this.emit("emptied", t);
  }
  onSuspend(t) {
    this.emit("suspend", t);
  }
  onWaiting(t) {
    this.emit("waiting", t);
  }
  onLoadedMetadata(t) {
    this.emit("loadedmetadata", t);
  }
  onSeeking(t) {
    this.emit("seeking", t);
  }
  onSeeked(t) {
    this.emit("seeked", t);
  }
  onPlay() {
    this.emit("play", null);
  }
  onPlaying() {
    this.emit("playing", null);
  }
  onPause() {
    this.emit("pause", null);
  }
  onProgress() {
    this.emit("progress", this.mediaElement.seekable);
  }
  // Used to emit some events like timeupdate or ended
  emit(t, e) {
    this.listeners[t] && this.listeners[t].forEach((i) => i(e));
  }
  /**
   * Plays the current audio resource.
   */
  async play() {
    if (!this.isPlayingValue)
      try {
        this.audioContext && await this.ensureAudioContextRunning(), await this.mediaElement.play(), this.isPlayingValue = !0, this.isPausedValue = !1, this.isStoppedValue = !1;
      } catch (t) {
        if (t?.name === "AbortError") return;
        console.error("error trying to play media element", t), this.emit("error", t);
      }
  }
  /**
   * Pauses the currently playing audio resource.
   */
  pause() {
    this.mediaElement.pause(), this.isPlayingValue = !1, this.isPausedValue = !0;
  }
  /**
   * Stops the currently playing audio resource.
   */
  stop() {
    this.mediaElement.pause(), this.mediaElement.currentTime = 0, this.isPlayingValue = !1, this.isPausedValue = !1, this.isStoppedValue = !0;
  }
  /**
   * Adjusts the [volume] of the audio resource.
   * @volume The volume to set, in the range [0, 1].
   */
  setVolume(t) {
    const e = Math.max(0, Math.min(1, t));
    this.gainNode ? (this.mediaElement.volume = 1, this.gainNode.gain.value = e) : this.mediaElement.volume = e, this.isMutedValue = e === 0;
  }
  /**
   * Skips [seconds] either forward or backward if [seconds] is negative.
   */
  skip(t) {
    const e = this.mediaElement.duration;
    if (!isFinite(e)) return;
    const i = this.mediaElement.currentTime + t;
    i < 0 ? this.mediaElement.currentTime = 0 : i > e ? this.mediaElement.currentTime = e : this.mediaElement.currentTime = i;
  }
  /**
   * Returns de current time in the audio resource.
   */
  currentTime() {
    return this.mediaElement.currentTime;
  }
  /**
   * Returns the duration in seconds of the current media element resource.
   */
  duration() {
    return this.mediaElement.duration;
  }
  /**
   * Returns whether the audio resource is currently playing.
   */
  isPlaying() {
    return this.isPlayingValue;
  }
  /**
   * Returns whether the audio resource is currently paused.
   */
  isPaused() {
    return this.isPausedValue;
  }
  /**
   * Returns whether the audio resource is currently stopped.
   */
  isStopped() {
    return this.isStoppedValue;
  }
  /**
   * Returns whether the audio resource is currently loading.
   */
  isLoading() {
    return this.isLoadingValue;
  }
  /**
   * Returns whether the audio resource is currently loaded.
   */
  isLoaded() {
    return this.isLoadedValue;
  }
  /**
   * Returns whether the audio resource is currently ended.
   */
  isEnded() {
    return this.isEndedValue;
  }
  /**
   * Returns whether the audio resource is currently muted.
   */
  isMuted() {
    return this.isMutedValue;
  }
  /**
   * Sets the playback rate of the audio resource with pitch preservation.
   */
  setPlaybackRate(t, e) {
    this.mediaElement.playbackRate = t, e ? "preservesPitch" in this.mediaElement ? this.mediaElement.preservesPitch = !0 : this.activateWebAudio().then(() => {
      this.worklet ? this.worklet.updatePitchFactor(1 / t) : ei.createWorklet({
        ctx: this.getOrCreateAudioContext(),
        pitchFactor: 1
      }).then((i) => {
        this.sourceNode && this.sourceNode.disconnect(), this.worklet = i, this.sourceNode?.connect(this.worklet.workletNode), this.worklet.workletNode.connect(this.gainNode), this.worklet.updatePitchFactor(1 / t);
      }).catch((i) => {
        console.warn("Failed to create preserve pitch worklet", i);
      });
    }).catch((i) => {
      console.warn("Web Audio unavailable, playing without pitch correction:", i);
    }) : ("preservesPitch" in this.mediaElement && (this.mediaElement.preservesPitch = !1), this.worklet && (this.worklet.destroy(), this.worklet = null, this.webAudioActive && this.sourceNode && (this.sourceNode.disconnect(), this.sourceNode.connect(this.gainNode))));
  }
  /**
   * Activates the Web Audio graph for the current media element.
   * Sets crossOrigin = "anonymous" and reloads so MediaElementAudioSourceNode can be used.
   * No-ops if Web Audio is already active.
   */
  async activateWebAudio() {
    if (this.webAudioActive) return;
    const t = this.mediaElement.src;
    if (!t) return;
    const e = this.mediaElement.currentTime, i = this.isPlayingValue;
    i && (this.mediaElement.pause(), this.isPlayingValue = !1), this.mediaElement.crossOrigin = "anonymous", this.mediaElement.src = t, this.mediaElement.load();
    try {
      await new Promise((s, o) => {
        const a = () => {
          this.mediaElement.removeEventListener("canplaythrough", a), this.mediaElement.removeEventListener("error", l), s();
        }, l = () => {
          this.mediaElement.removeEventListener("canplaythrough", a), this.mediaElement.removeEventListener("error", l), o(new Error("Audio reload with CORS failed — server may not send Access-Control-Allow-Origin"));
        };
        this.mediaElement.addEventListener("canplaythrough", a), this.mediaElement.addEventListener("error", l);
      });
    } catch (s) {
      throw this.mediaElement.removeAttribute("crossorigin"), this.mediaElement.src = t, this.mediaElement.load(), i ? (await new Promise((o) => {
        const a = () => {
          this.mediaElement.removeEventListener("canplaythrough", a), o();
        };
        this.mediaElement.addEventListener("canplaythrough", a);
      }), this.mediaElement.currentTime = e, await this.mediaElement.play(), this.isPlayingValue = !0, this.isPausedValue = !1) : this.mediaElement.currentTime = e, s;
    }
    this.mediaElement.currentTime = e, this.sourceNode = new MediaElementAudioSourceNode(this.getOrCreateAudioContext(), { mediaElement: this.mediaElement });
    const n = this.getOrCreateAudioContext();
    this.gainNode = n.createGain(), this.gainNode.gain.value = this.mediaElement.volume, this.mediaElement.volume = 1, this.sourceNode.connect(this.gainNode), this.gainNode.connect(n.destination), this.webAudioActive = !0, i && (await this.ensureAudioContextRunning(), await this.mediaElement.play(), this.isPlayingValue = !0, this.isPausedValue = !1);
  }
  get isWebAudioActive() {
    return this.webAudioActive;
  }
  /**
   * Tears down the Web Audio graph and restores the media element to standalone
   * playback. Safe to call even if Web Audio was never activated.
   */
  tearDownWebAudio() {
    this.worklet && (this.worklet.destroy(), this.worklet = null), this.sourceNode && (this.sourceNode.disconnect(), this.sourceNode = null), this.gainNode && (this.mediaElement.volume = this.gainNode.gain.value, this.gainNode.disconnect(), this.gainNode = null), this.webAudioActive = !1;
  }
  /**
   * Changes the src of the primary media element without swapping the element.
   * Preserves the RemotePlayback session and all attached event listeners.
   * When the Web Audio graph is active, the new src is loaded with
   * crossOrigin="anonymous". If the CORS request fails (server does not send
   * the required headers), the graph is torn down and the src is reloaded
   * without CORS so playback continues — just without pitch correction.
   */
  changeSrc(t) {
    if (this.mediaElement.src !== t)
      if (this.mediaElement.pause(), this.isPlayingValue = !1, this.isPausedValue = !1, this.isLoadedValue = !1, this.isLoadingValue = !0, this.isEndedValue = !1, this.webAudioActive) {
        this.mediaElement.crossOrigin = "anonymous", this.mediaElement.src = t, this.mediaElement.load();
        const e = () => {
          n();
        }, i = () => {
          n(), console.warn("CORS reload failed for new track — disabling Web Audio graph:", t), this.tearDownWebAudio(), this.mediaElement.removeAttribute("crossorigin"), this.mediaElement.src = t, this.mediaElement.load();
        }, n = () => {
          this.mediaElement.removeEventListener("canplaythrough", e), this.mediaElement.removeEventListener("error", i);
        };
        this.mediaElement.addEventListener("canplaythrough", e), this.mediaElement.addEventListener("error", i);
      } else
        this.mediaElement.src = t, this.mediaElement.load();
  }
  /**
   * Returns the HTML media element used for playback.
   */
  getMediaElement() {
    return this.mediaElement;
  }
}
class me {
  constructor(t = {}) {
    this.volume = D(t.volume, ae.range), this.playbackRate = D(t.playbackRate, le.range), this.preservePitch = E(t.preservePitch), this.skipBackwardInterval = D(t.skipBackwardInterval, rt.range), this.skipForwardInterval = D(t.skipForwardInterval, rt.range), this.pollInterval = w(t.pollInterval), this.autoPlay = E(t.autoPlay), this.enableMediaSession = E(t.enableMediaSession);
  }
  merging(t) {
    const e = { ...this };
    for (const i of Object.keys(t))
      t[i] !== void 0 && (e[i] = t[i]);
    return new me(e);
  }
}
class Ro {
  constructor(t = {}) {
    this.volume = D(t.volume, ae.range) ?? 1, this.playbackRate = D(t.playbackRate, le.range) ?? 1, this.preservePitch = E(t.preservePitch) ?? !0, this.skipBackwardInterval = D(t.skipBackwardInterval, rt.range) ?? 10, this.skipForwardInterval = D(t.skipForwardInterval, rt.range) ?? 10, this.pollInterval = w(t.pollInterval) ?? 1e3, this.autoPlay = E(t.autoPlay) ?? !0, this.enableMediaSession = E(t.enableMediaSession) ?? !0;
  }
}
class qi {
  constructor(t, e) {
    this.volume = t.volume ?? e.volume, this.playbackRate = t.playbackRate ?? e.playbackRate, this.preservePitch = t.preservePitch ?? e.preservePitch, this.skipBackwardInterval = t.skipBackwardInterval ?? e.skipBackwardInterval, this.skipForwardInterval = t.skipForwardInterval ?? e.skipForwardInterval, this.pollInterval = t.pollInterval ?? e.pollInterval, this.autoPlay = t.autoPlay ?? e.autoPlay, this.enableMediaSession = t.enableMediaSession ?? e.enableMediaSession;
  }
}
class Ki {
  constructor(t, e) {
    this.preferences = t, this.settings = e;
  }
  clear() {
    this.preferences = new me();
  }
  updatePreference(t, e) {
    this.preferences[t] = e;
  }
  get volume() {
    return new R({
      initialValue: this.preferences.volume,
      effectiveValue: this.settings.volume,
      isEffective: this.preferences.volume !== null,
      onChange: (t) => {
        this.updatePreference("volume", t ?? null);
      },
      supportedRange: ae.range,
      step: ae.step
    });
  }
  get playbackRate() {
    return new R({
      initialValue: this.preferences.playbackRate,
      effectiveValue: this.settings.playbackRate,
      isEffective: this.preferences.playbackRate !== null,
      onChange: (t) => {
        this.updatePreference("playbackRate", t ?? null);
      },
      supportedRange: le.range,
      step: le.step
    });
  }
  get preservePitch() {
    return new N({
      initialValue: this.preferences.preservePitch,
      effectiveValue: this.settings.preservePitch,
      isEffective: this.preferences.preservePitch !== null,
      onChange: (t) => {
        this.updatePreference("preservePitch", t ?? null);
      }
    });
  }
  get skipBackwardInterval() {
    return new R({
      initialValue: this.preferences.skipBackwardInterval,
      effectiveValue: this.settings.skipBackwardInterval,
      isEffective: this.preferences.skipBackwardInterval !== null,
      onChange: (t) => {
        this.updatePreference("skipBackwardInterval", t ?? null);
      },
      supportedRange: rt.range,
      step: rt.step
    });
  }
  get skipForwardInterval() {
    return new R({
      initialValue: this.preferences.skipForwardInterval,
      effectiveValue: this.settings.skipForwardInterval,
      isEffective: this.preferences.skipForwardInterval !== null,
      onChange: (t) => {
        this.updatePreference("skipForwardInterval", t ?? null);
      },
      supportedRange: rt.range,
      step: rt.step
    });
  }
  get pollInterval() {
    return new z({
      initialValue: this.preferences.pollInterval,
      effectiveValue: this.settings.pollInterval,
      isEffective: this.preferences.pollInterval !== null,
      onChange: (t) => {
        this.updatePreference("pollInterval", t ?? null);
      }
    });
  }
  get autoPlay() {
    return new N({
      initialValue: this.preferences.autoPlay,
      effectiveValue: this.settings.autoPlay,
      isEffective: this.preferences.autoPlay !== null,
      onChange: (t) => {
        this.updatePreference("autoPlay", t ?? null);
      }
    });
  }
  get enableMediaSession() {
    return new N({
      initialValue: this.preferences.enableMediaSession,
      effectiveValue: this.settings.enableMediaSession,
      isEffective: this.preferences.enableMediaSession !== null,
      onChange: (t) => {
        this.updatePreference("enableMediaSession", t ?? null);
      }
    });
  }
}
const Ji = 1, Zi = 1;
class Ao {
  constructor(t, e, i = {}) {
    this.pool = /* @__PURE__ */ new Map(), this._audioEngine = t, this._publication = e, this._supportedAudioTypes = this.detectSupportedAudioTypes(), i.disableRemotePlayback && (this._audioEngine.getMediaElement().disableRemotePlayback = !0);
  }
  detectSupportedAudioTypes() {
    const t = document.createElement("audio"), e = /* @__PURE__ */ new Set();
    for (const n of this._publication.readingOrder.items) {
      n.type && e.add(n.type);
      for (const s of n.alternates?.items ?? [])
        s.type && e.add(s.type);
    }
    const i = /* @__PURE__ */ new Map();
    for (const n of e) {
      const s = t.canPlayType(n);
      s !== "" && i.set(n, s);
    }
    return i;
  }
  pickPlayableHref(t) {
    const e = this._publication.baseURL, i = [t, ...t.alternates?.items ?? []];
    let n;
    for (const s of i) {
      if (!s.type) continue;
      const o = this._supportedAudioTypes.get(s.type);
      if (!o) continue;
      const a = s.toURL(e) ?? s.href;
      if (o === "probably") return a;
      n || (n = { href: a, confidence: o });
    }
    return n?.href ?? t.toURL(e) ?? t.href;
  }
  get audioEngine() {
    return this._audioEngine;
  }
  /**
   * Ensures an audio element exists in the pool for the given href.
   * If one already exists, it is left untouched (preserving its buffered data).
   */
  ensure(t) {
    let e = this.pool.get(t);
    return e || (e = document.createElement("audio"), e.preload = "auto", this._audioEngine.isWebAudioActive && (e.crossOrigin = "anonymous"), e.src = t, e.load(), this.pool.set(t, e)), e;
  }
  /**
   * Updates the pool around the given index: ensures elements exist within
   * the LOWER_BOUNDARY and disposes those beyond the UPPER_BOUNDARY.
   * The current track is excluded — the primary engine element represents it.
   */
  update(t) {
    const e = this._publication.readingOrder.items, i = /* @__PURE__ */ new Set();
    for (let n = 0; n < e.length; n++) {
      if (n === t) continue;
      const s = this.pickPlayableHref(e[n]);
      n >= t - Zi && n <= t + Zi ? (this.ensure(s), i.add(s)) : n >= t - Ji && n <= t + Ji && this.pool.has(s) && i.add(s);
    }
    for (const [n, s] of this.pool)
      i.has(n) || (s.removeAttribute("src"), s.load(), this.pool.delete(n));
  }
  /**
   * Sets the current audio for playback at the given track index by changing
   * the src on the persistent primary element. This preserves the RemotePlayback
   * session and any Web Audio graph connections across track changes.
   */
  setCurrentAudio(t, e) {
    const i = this.pickPlayableHref(this._publication.readingOrder.items[t]);
    if (this.audioEngine.changeSrc(i), this.pool.has(i)) {
      const n = this.pool.get(i);
      n.removeAttribute("src"), n.load(), this.pool.delete(i);
    }
    this.update(t);
  }
  destroy() {
    this.audioEngine.stop();
    for (const [, t] of this.pool)
      t.removeAttribute("src"), t.load();
    this.pool.clear();
  }
}
class To {
  constructor(t = {}) {
    this.dragstartHandler = (e) => {
      e.preventDefault(), e.stopPropagation(), t.onDragDetected?.(Array.from(e.dataTransfer?.types ?? []));
    }, this.dragoverHandler = (e) => {
      e.preventDefault(), e.stopPropagation();
    }, this.dropHandler = (e) => {
      e.preventDefault(), e.stopPropagation();
      const i = Array.from(e.dataTransfer?.types ?? []), n = e.dataTransfer?.files.length ?? 0;
      t.onDropDetected?.(i, n);
    }, this.unloadHandler = () => this.destroy(), document.addEventListener("dragstart", this.dragstartHandler, !0), document.addEventListener("dragover", this.dragoverHandler, !0), document.addEventListener("drop", this.dropHandler, !0), window.addEventListener("unload", this.unloadHandler);
  }
  destroy() {
    document.removeEventListener("dragstart", this.dragstartHandler, !0), document.removeEventListener("dragover", this.dragoverHandler, !0), document.removeEventListener("drop", this.dropHandler, !0), window.removeEventListener("unload", this.unloadHandler);
  }
}
class No {
  constructor(t = {}) {
    this.copyHandler = (e) => {
      e.preventDefault(), e.stopPropagation(), t.onCopyBlocked?.();
    }, this.unloadHandler = () => this.destroy(), document.addEventListener("copy", this.copyHandler, !0), window.addEventListener("unload", this.unloadHandler);
  }
  destroy() {
    document.removeEventListener("copy", this.copyHandler, !0), window.removeEventListener("unload", this.unloadHandler);
  }
}
class Mo extends Qe {
  constructor(t = {}) {
    super(t), t.disableDragAndDrop && (this.dragAndDropProtector = new To({
      onDragDetected: (e) => {
        this.dispatchSuspiciousActivity("drag_detected", { dataTransferTypes: e, targetFrameSrc: "" });
      },
      onDropDetected: (e, i) => {
        this.dispatchSuspiciousActivity("drop_detected", { dataTransferTypes: e, fileCount: i, targetFrameSrc: "" });
      }
    })), t.protectCopy && (this.copyProtector = new No({
      onCopyBlocked: () => {
        this.dispatchSuspiciousActivity("bulk_copy", { targetFrameSrc: "" });
      }
    }));
  }
  destroy() {
    super.destroy(), this.dragAndDropProtector?.destroy(), this.copyProtector?.destroy();
  }
}
const Fo = (r) => ({
  trackLoaded: r.trackLoaded ?? (() => {
  }),
  positionChanged: r.positionChanged ?? (() => {
  }),
  timelineItemChanged: r.timelineItemChanged ?? (() => {
  }),
  error: r.error ?? (() => {
  }),
  trackEnded: r.trackEnded ?? (() => {
  }),
  play: r.play ?? (() => {
  }),
  pause: r.pause ?? (() => {
  }),
  metadataLoaded: r.metadataLoaded ?? (() => {
  }),
  stalled: r.stalled ?? (() => {
  }),
  seeking: r.seeking ?? (() => {
  }),
  seekable: r.seekable ?? (() => {
  }),
  contentProtection: r.contentProtection ?? (() => {
  }),
  peripheral: r.peripheral ?? (() => {
  }),
  contextMenu: r.contextMenu ?? (() => {
  }),
  remotePlaybackStateChanged: r.remotePlaybackStateChanged ?? (() => {
  })
});
class Bo extends Gs {
  constructor(t, e, i, n = {
    preferences: {},
    defaults: {}
  }) {
    if (super(), this.positionPollInterval = null, this.navigationId = 0, this._playIntent = !1, this._preferencesEditor = null, this._mediaSessionEnabled = !1, this._navigatorProtector = null, this._keyboardPeripheralsManager = null, this._suspiciousActivityListener = null, this._keyboardPeripheralListener = null, this._isNavigating = !1, this._isStalled = !1, this._stalledWatchdog = null, this._stalledCheckTime = 0, this.pub = t, this.listeners = Fo(e), this._preferences = new me(n.preferences), this._defaults = new Ro(n.defaults), this._settings = new qi(this._preferences, this._defaults), t.readingOrder.items.length === 0)
      throw new Error("AudioNavigator: publication has an empty reading order");
    if (i)
      this.currentLocation = this.ensureLocatorLocations(i);
    else {
      const c = this.pub.readingOrder.items[0];
      this.currentLocation = new F({
        href: c.href,
        type: c.type || "audio/mpeg",
        title: c.title,
        locations: new L({
          position: 1,
          progression: 0,
          totalProgression: 0,
          fragments: ["t=0"]
        })
      });
    }
    const s = this.currentLocation.href.split("#")[0], o = this.hrefToTrackIndex(s);
    if (o === -1)
      throw new Error(`AudioNavigator: initial href "${s}" not found in reading order`);
    const a = this.currentLocation.locations?.time() || 0, l = new Oo({
      playback: {
        state: {
          currentTime: a,
          duration: 0
        },
        playWhenReady: !1,
        index: o
      }
    });
    this.pool = new Ao(l, t, n.contentProtection);
    const d = n.contentProtection || {};
    this._contentProtection = d;
    const h = this.mergeKeyboardPeripherals(
      d,
      n.keyboardPeripherals || []
    );
    (d.disableContextMenu || d.checkAutomation || d.checkIFrameEmbedding || d.monitorDevTools || d.protectPrinting?.disable || d.disableDragAndDrop || d.protectCopy) && (this._navigatorProtector = new Mo(d), this._suspiciousActivityListener = (c) => {
      const { type: u, ...m } = c.detail;
      u === "context_menu" ? this.listeners.contextMenu(m) : this.listeners.contentProtection(u, m);
    }, window.addEventListener(ct, this._suspiciousActivityListener)), h.length > 0 && (this._keyboardPeripheralsManager = new ti({ keyboardPeripherals: h }), this._keyboardPeripheralListener = (c) => {
      this.listeners.peripheral(c.detail);
    }, window.addEventListener(dt, this._keyboardPeripheralListener)), this.setupEventListeners(), this._isNavigating = !0, this.pool.setCurrentAudio(o, "forward"), this.applyPreferences(), this.waitForLoadedAndSeeked(a).then(() => {
      this._isNavigating = !1, this.listeners.trackLoaded(this.pool.audioEngine.getMediaElement()), this._notifyTimelineChange(this.currentLocator), this.listeners.positionChanged(this.currentLocator), this._setupRemotePlayback();
    }).catch(() => {
      this._isNavigating = !1;
    });
  }
  get settings() {
    return this._settings;
  }
  get preferencesEditor() {
    return this._preferencesEditor === null && (this._preferencesEditor = new Ki(this._preferences, this.settings)), this._preferencesEditor;
  }
  async submitPreferences(t) {
    this._preferences = this._preferences.merging(t), this.applyPreferences();
  }
  applyPreferences() {
    this._settings = new qi(this._preferences, this._defaults), this._preferencesEditor !== null && (this._preferencesEditor = new Ki(this._preferences, this.settings)), this.pool.audioEngine.setVolume(this._settings.volume), this.pool.audioEngine.setPlaybackRate(this._settings.playbackRate, this._settings.preservePitch), this.positionPollInterval !== null && this.startPositionPolling(), this._settings.enableMediaSession && !this._mediaSessionEnabled ? (this._mediaSessionEnabled = !0, this.setupMediaSession()) : !this._settings.enableMediaSession && this._mediaSessionEnabled && (this._mediaSessionEnabled = !1, this.destroyMediaSession());
  }
  get publication() {
    return this.pub;
  }
  get timeline() {
    return this.pub.timeline;
  }
  _notifyTimelineChange(t) {
    const e = this.pub.timeline.locate(t);
    e !== this._currentTimelineItem && (this._currentTimelineItem = e, this.listeners.timelineItemChanged(e), this._settings.enableMediaSession && this.updateMediaSessionMetadata());
  }
  ensureLocatorLocations(t) {
    return new F({
      ...t,
      locations: t.locations instanceof L ? t.locations : t.locations ? new L(t.locations) : void 0
    });
  }
  /** Resolves a bare href (no fragment) to its index in the reading order. Returns -1 if not found. */
  hrefToTrackIndex(t) {
    const e = t.split("#")[0];
    return this.pub.readingOrder.items.findIndex((i) => i.href === e);
  }
  /** Current track index derived from the current location's href. */
  currentTrackIndex() {
    return this.hrefToTrackIndex(this.currentLocation.href);
  }
  get currentLocator() {
    return this.currentLocation;
  }
  get isPlaying() {
    return this.pool.audioEngine.isPlaying();
  }
  get isPaused() {
    return this.pool.audioEngine.isPaused();
  }
  get duration() {
    return this.pool.audioEngine.duration();
  }
  get currentTime() {
    return this.pool.audioEngine.currentTime();
  }
  createLocator(t, e) {
    const i = this.pub.readingOrder.items[t];
    if (!i) throw new Error(`Invalid track index: ${t}`);
    const n = this.pool.audioEngine.duration();
    return new F({
      href: i.href,
      type: i.type || "audio/mpeg",
      title: i.title,
      locations: new L({
        progression: n > 0 ? e / n : 0,
        position: t + 1,
        fragments: [`t=${e}`]
      })
    });
  }
  /**
   * Waits for the current audio to be ready to play, then seeks to seekTime if > 0.
   * Rejects if an error event fires before the audio is ready.
   * When navId is provided, skips the seek if that navigation has been superseded.
   */
  waitForLoadedAndSeeked(t, e) {
    return new Promise((i, n) => {
      const s = () => {
        if (e !== void 0 && e !== this.navigationId) {
          i();
          return;
        }
        if (t <= 0) {
          i();
          return;
        }
        const l = () => {
          this.pool.audioEngine.off("seeked", l), i();
        };
        this.pool.audioEngine.on("seeked", l), this.seek(t);
      };
      if (this.pool.audioEngine.isLoaded()) {
        s();
        return;
      }
      const o = () => {
        this.pool.audioEngine.off("canplaythrough", o), this.pool.audioEngine.off("error", a), s();
      }, a = (l) => {
        this.pool.audioEngine.off("canplaythrough", o), this.pool.audioEngine.off("error", a), n(l);
      };
      this.pool.audioEngine.on("canplaythrough", o), this.pool.audioEngine.on("error", a);
    });
  }
  setupEventListeners() {
    this.pool.audioEngine.on("error", (t) => {
      this.listeners.error(t, this.currentLocator);
    }), this.pool.audioEngine.on("ended", async () => {
      this.stopPositionPolling(), this.currentLocation = this.currentLocation.copyWithLocations(new L({
        position: this.currentTrackIndex() + 1,
        progression: 1,
        fragments: [`t=${this.duration}`]
      })), this.listeners.trackEnded(this.currentLocator), this.canGoForward && (await this.nextTrack(), this._settings.autoPlay && this.play());
    }), this.pool.audioEngine.on("play", () => {
      this._isNavigating || (this.startPositionPolling(), this.listeners.play(this.currentLocator));
    }), this.pool.audioEngine.on("playing", () => {
      this._isNavigating || this._setStalled(!1);
    }), this.pool.audioEngine.on("pause", () => {
      this._isNavigating || (this.stopPositionPolling(), this.listeners.pause(this.currentLocator));
    }), this.pool.audioEngine.on("seeked", () => {
      if (this._isNavigating) return;
      this.listeners.seeking(!1);
      const t = this.currentTime, e = this.duration, i = e > 0 ? t / e : 0;
      this.currentLocation = this.currentLocation.copyWithLocations(new L({
        position: this.currentTrackIndex() + 1,
        progression: i,
        fragments: [`t=${t}`]
      })), this._notifyTimelineChange(this.currentLocation), this.listeners.positionChanged(this.currentLocation);
    }), this.pool.audioEngine.on("seeking", () => {
      this._isNavigating || this.listeners.seeking(!0);
    }), this.pool.audioEngine.on("waiting", () => {
      this._isNavigating || this.listeners.seeking(!0);
    }), this.pool.audioEngine.on("stalled", () => {
      this._isNavigating || this._setStalled(!0);
    }), this.pool.audioEngine.on("canplaythrough", () => {
      this._isNavigating || this._setStalled(!1);
    }), this.pool.audioEngine.on("progress", (t) => {
      this._isNavigating || this.listeners.seekable(t);
    }), this.pool.audioEngine.on("loadedmetadata", () => {
      const t = this.pool.audioEngine.getMediaElement(), e = {
        duration: this.pool.audioEngine.duration(),
        textTracks: t.textTracks,
        readyState: t.readyState,
        networkState: t.networkState
      };
      this.listeners.metadataLoaded(e);
    });
  }
  _setStalled(t) {
    this._isStalled !== t && (this._isStalled = t, this.listeners.stalled(t), t ? (this._stalledCheckTime = this.currentTime, this._startStalledWatchdog()) : this._stopStalledWatchdog());
  }
  _startStalledWatchdog() {
    this._stalledWatchdog = setInterval(() => {
      if (!this.isPlaying) {
        this._setStalled(!1);
        return;
      }
      const t = this.currentTime;
      t !== this._stalledCheckTime && this._setStalled(!1), this._stalledCheckTime = t;
    }, 500);
  }
  _stopStalledWatchdog() {
    this._stalledWatchdog !== null && (clearInterval(this._stalledWatchdog), this._stalledWatchdog = null);
  }
  setupMediaSession() {
    "mediaSession" in navigator && (navigator.mediaSession.setActionHandler("play", () => this.play()), navigator.mediaSession.setActionHandler("pause", () => this.pause()), navigator.mediaSession.setActionHandler("previoustrack", () => this.goBackward(!1, () => {
    })), navigator.mediaSession.setActionHandler("nexttrack", () => this.goForward(!1, () => {
    })), navigator.mediaSession.setActionHandler("seekbackward", (t) => this.jump(-(t.seekOffset || 10))), navigator.mediaSession.setActionHandler("seekforward", (t) => this.jump(t.seekOffset || 10)), this.updateMediaSessionMetadata());
  }
  updateMediaSessionMetadata() {
    if (!("mediaSession" in navigator)) return;
    const t = this.currentTrackIndex(), e = this.pub.readingOrder.items[t], i = this.pub.getCover();
    navigator.mediaSession.metadata = new MediaMetadata({
      title: e?.title || `Track ${t + 1}`,
      artist: this.pub.metadata.authors ? this.pub.metadata.authors.items.map((n) => n.name.getTranslation()).join(", ") : void 0,
      album: this.pub.metadata.title.getTranslation(),
      artwork: i ? [{ src: i.toURL(this.pub.baseURL) ?? i.href, type: i.type }] : void 0
    });
  }
  startPositionPolling() {
    this.stopPositionPolling(), this.positionPollInterval = setInterval(() => {
      const t = this.currentTime, e = this.duration, i = e > 0 ? t / e : 0;
      this.currentLocation = this.currentLocation.copyWithLocations(new L({
        position: this.currentTrackIndex() + 1,
        progression: i,
        fragments: [`t=${t}`]
      })), this._notifyTimelineChange(this.currentLocation), this.listeners.positionChanged(this.currentLocation);
    }, this._settings.pollInterval);
  }
  stopPositionPolling() {
    this.positionPollInterval !== null && (clearInterval(this.positionPollInterval), this.positionPollInterval = null);
  }
  async go(t, e, i) {
    try {
      t = this.ensureLocatorLocations(t);
      const n = t.href.split("#")[0], s = this.hrefToTrackIndex(n), o = t.locations?.time() || 0;
      if (s === -1) {
        i(!1);
        return;
      }
      const a = ++this.navigationId, l = this.currentTrackIndex(), d = s >= l ? "forward" : "backward", h = this.isPlaying || this._playIntent;
      if (this._playIntent = h, this._isNavigating = !0, this.stopPositionPolling(), this.pool.setCurrentAudio(s, d), this.currentLocation = t.copyWithLocations(t.locations), await this.waitForLoadedAndSeeked(o, a), this._isNavigating = !1, a !== this.navigationId) {
        i(!1);
        return;
      }
      s !== l && this.listeners.trackLoaded(this.pool.audioEngine.getMediaElement()), this._notifyTimelineChange(this.currentLocator), this.listeners.positionChanged(this.currentLocator), this._settings.enableMediaSession && this.updateMediaSessionMetadata(), h && this.play(), i(!0);
    } catch (n) {
      this._isNavigating = !1, console.error("Failed to go to locator:", n), i(!1);
    } finally {
      this._playIntent = !1;
    }
  }
  async goLink(t, e, i) {
    const n = this.hrefToTrackIndex(t.href);
    if (n === -1) {
      i(!1);
      return;
    }
    const s = t.locator.locations?.time() ?? 0, o = this.createLocator(n, s);
    await this.go(o, e, i);
  }
  async goForward(t, e) {
    if (!this.canGoForward) {
      e(!1);
      return;
    }
    await this.nextTrack(), e(!0);
  }
  async goBackward(t, e) {
    if (!this.canGoBackward) {
      e(!1);
      return;
    }
    await this.previousTrack(), e(!0);
  }
  play() {
    this.pool.audioEngine.play();
  }
  pause() {
    this.pool.audioEngine.pause();
  }
  stop() {
    this.pool.audioEngine.stop();
  }
  async nextTrack() {
    if (!this.canGoForward) return;
    const t = this.createLocator(this.currentTrackIndex() + 1, 0);
    await this.go(t, !1, () => {
    });
  }
  async previousTrack() {
    if (!this.canGoBackward) return;
    const t = this.createLocator(this.currentTrackIndex() - 1, 0);
    await this.go(t, !1, () => {
    });
  }
  seek(t) {
    this.pool.audioEngine.skip(t - this.pool.audioEngine.currentTime());
  }
  jump(t) {
    this.pool.audioEngine.skip(t);
  }
  skipForward() {
    this.pool.audioEngine.skip(this._settings.skipForwardInterval);
  }
  skipBackward() {
    this.pool.audioEngine.skip(-this._settings.skipBackwardInterval);
  }
  get isTrackStart() {
    return this.currentTrackIndex() === 0 && (this.currentLocation.locations?.time() || 0) === 0;
  }
  get isTrackEnd() {
    const t = this.currentTrackIndex();
    if (t !== this.pub.readingOrder.items.length - 1) return !1;
    const e = this.currentLocation.locations?.progression;
    if (e !== void 0) return e >= 1;
    const i = this.pub.readingOrder.items[t], n = this.duration || i?.duration || 0;
    return n > 0 && (this.currentLocation.locations?.time() ?? 0) >= n;
  }
  get canGoBackward() {
    return this.currentTrackIndex() > 0;
  }
  get canGoForward() {
    return this.currentTrackIndex() < this.pub.readingOrder.items.length - 1;
  }
  /**
   * The RemotePlayback object for the primary media element.
   * Because the element is never swapped, this reference is stable for the
   * lifetime of the navigator — host apps can store it and call `.prompt()`,
   * `.watchAvailability()`, etc. directly.
   */
  get remotePlayback() {
    const t = this.pool.audioEngine.getMediaElement();
    return "remote" in t ? t.remote : void 0;
  }
  /** Wires up the optional remotePlaybackStateChanged listener. Called once after initial load. */
  _setupRemotePlayback() {
    if (this._contentProtection.disableRemotePlayback)
      return;
    const t = this.remotePlayback;
    t && (t.onconnecting = () => this.listeners.remotePlaybackStateChanged("connecting"), t.onconnect = () => this.listeners.remotePlaybackStateChanged("connected"), t.ondisconnect = () => this.listeners.remotePlaybackStateChanged("disconnected"));
  }
  destroyMediaSession() {
    "mediaSession" in navigator && (navigator.mediaSession.metadata = null, navigator.mediaSession.setActionHandler("play", null), navigator.mediaSession.setActionHandler("pause", null), navigator.mediaSession.setActionHandler("previoustrack", null), navigator.mediaSession.setActionHandler("nexttrack", null), navigator.mediaSession.setActionHandler("seekbackward", null), navigator.mediaSession.setActionHandler("seekforward", null));
  }
  destroy() {
    this.stopPositionPolling(), this._stopStalledWatchdog(), this.destroyMediaSession(), this._suspiciousActivityListener && window.removeEventListener(ct, this._suspiciousActivityListener), this._keyboardPeripheralListener && window.removeEventListener(dt, this._keyboardPeripheralListener), this._navigatorProtector?.destroy(), this._keyboardPeripheralsManager?.destroy(), this.pool.destroy();
  }
}
const zo = "'Iowan Old Style', Sitka, 'Sitka Text', Palatino, 'Book Antiqua', 'URW Palladio L', P052, serif", Io = {
  oldStyleTf: zo
}, Do = 16, Qi = Io.oldStyleTf;
class Nt {
  constructor(t) {
    this._optimalLineLength = null, this._canvas = document.createElement("canvas"), this._optimalChars = t.optimalChars, this._minChars = t.minChars, this._maxChars = t.maxChars, this._baseFontSize = t.baseFontSize || Do, this._fontFace = t.fontFace || Qi, this._sample = t.sample || null, this._padding = t.padding ?? 0, this._letterSpacing = t.letterSpacing ? Math.round(t.letterSpacing * this._baseFontSize) : 0, this._wordSpacing = t.wordSpacing ? Math.round(t.wordSpacing * this._baseFontSize) : 0, this._isCJK = t.isCJK || !1, this._getRelative = t.getRelative || !1, this._minDivider = this._minChars && this._minChars < this._optimalChars ? this._optimalChars / this._minChars : this._minChars === null ? null : 1, this._maxMultiplier = this._maxChars && this._maxChars > this._optimalChars ? this._maxChars / this._optimalChars : this._maxChars === null ? null : 1, this._approximatedWordSpaces = Nt.approximateWordSpaces(this._optimalChars, this._sample);
  }
  updateMultipliers() {
    this._minDivider = this._minChars && this._minChars < this._optimalChars ? this._optimalChars / this._minChars : this._minChars === null ? null : 1, this._maxMultiplier = this._maxChars && this._maxChars > this._optimalChars ? this._maxChars / this._optimalChars : this._maxChars === null ? null : 1;
  }
  // Batch update to guarantee up-to-date values
  // Not filtering because pretty much everything can
  // trigger a recomputation anyway.
  update(t) {
    t.optimalChars && (this._optimalChars = t.optimalChars), t.minChars !== void 0 && (this._minChars = t.minChars), t.maxChars !== void 0 && (this._maxChars = t.maxChars), t.baseFontSize && (this._baseFontSize = t.baseFontSize), t.fontFace !== void 0 && (this._fontFace = t.fontFace || Qi), t.letterSpacing && (this._letterSpacing = t.letterSpacing), t.wordSpacing && (this._wordSpacing = t.wordSpacing), t.isCJK != null && (this._isCJK = t.isCJK), t.padding !== void 0 && (this._padding = t.padding ?? 0), t.getRelative && (this._getRelative = t.getRelative), t.sample && (this._sample = t.sample, this._approximatedWordSpaces = Nt.approximateWordSpaces(this._optimalChars, this._sample)), this.updateMultipliers(), this._optimalLineLength = this.getOptimalLineLength();
  }
  get baseFontSize() {
    return this._baseFontSize;
  }
  get minimalLineLength() {
    return this._optimalLineLength || (this._optimalLineLength = this.getOptimalLineLength()), this._minDivider !== null ? Math.round(this._optimalLineLength / this._minDivider + this._padding) / (this._getRelative ? this._baseFontSize : 1) : null;
  }
  get maximalLineLength() {
    return this._optimalLineLength || (this._optimalLineLength = this.getOptimalLineLength()), this._maxMultiplier !== null ? Math.round(this._optimalLineLength * this._maxMultiplier + this._padding) / (this._getRelative ? this._baseFontSize : 1) : null;
  }
  get optimalLineLength() {
    return this._optimalLineLength || (this._optimalLineLength = this.getOptimalLineLength()), Math.round(this._optimalLineLength + this._padding) / (this._getRelative ? this._baseFontSize : 1);
  }
  get all() {
    return this._optimalLineLength || (this._optimalLineLength = this.getOptimalLineLength()), {
      min: this.minimalLineLength,
      max: this.maximalLineLength,
      optimal: this.optimalLineLength,
      baseFontSize: this._baseFontSize
    };
  }
  static approximateWordSpaces(t, e) {
    let i = 0;
    if (e && e.length >= t) {
      const n = e.match(/([\s]+)/gi);
      i = (n ? n.length : 0) * (t / e.length);
    }
    return i;
  }
  getLineLengthFallback() {
    const t = this._letterSpacing * (this._optimalChars - 1), e = this._wordSpacing * this._approximatedWordSpaces;
    return this._optimalChars * (this._baseFontSize * 0.5) + t + e;
  }
  getOptimalLineLength() {
    if (this._fontFace) {
      if (typeof this._fontFace == "string")
        return this.measureText(this._fontFace);
      {
        const t = new FontFace(this._fontFace.name, `url(${this._fontFace.url})`);
        t.load().then(
          () => (document.fonts.add(t), this.measureText(t.family)),
          (e) => {
          }
        );
      }
    }
    return this.getLineLengthFallback();
  }
  measureText(t) {
    const e = this._canvas.getContext("2d");
    if (e && t) {
      let i = this._isCJK ? "水".repeat(this._optimalChars) : "0".repeat(this._optimalChars);
      if (e.font = `${this._baseFontSize}px ${t}`, this._sample && this._sample.length >= this._optimalChars && (i = this._sample.slice(0, this._optimalChars)), Object.hasOwn(e, "letterSpacing") && Object.hasOwn(e, "wordSpacing"))
        return e.letterSpacing = this._letterSpacing.toString() + "px", e.wordSpacing = this._wordSpacing.toString() + "px", e.measureText(i).width;
      {
        const n = this._letterSpacing * (this._optimalChars - 1), s = this._wordSpacing * Nt.approximateWordSpaces(this._optimalChars, this._sample);
        return e.measureText(i).width + n + s;
      }
    } else
      return this.getLineLengthFallback();
  }
}
export {
  Ro as AudioDefaults,
  Bo as AudioNavigator,
  me as AudioPreferences,
  Ki as AudioPreferencesEditor,
  qi as AudioSettings,
  Cn as BUILTIN_DECORATION_TYPES,
  N as BooleanPreference,
  Es as DecorationLayout,
  _ as DecorationStyleType,
  Ps as DecorationWidth,
  Ln as EnumPreference,
  mo as EpubDefaults,
  zn as EpubNavigator,
  Ht as EpubPreferences,
  Xi as EpubPreferencesEditor,
  Yi as EpubSettings,
  Wo as ExperimentalWebPubNavigator,
  so as FXLCoordinator,
  eo as FXLFrameManager,
  fo as FXLFramePoolManager,
  oo as FXLPeripherals,
  ao as FXLSpreader,
  Dt as FrameComms,
  Mn as FrameManager,
  to as FramePoolManager,
  io as HorizontalThird,
  Rn as Injector,
  Nt as LineLengths,
  Gs as MediaNavigator,
  wn as Navigator,
  De as Orientation,
  z as Preference,
  pe as Properties,
  Eo as RSProperties,
  R as RangePreference,
  Co as ReadiumCSS,
  Ue as Spread,
  nt as TextAlignment,
  Fn as UserProperties,
  no as VerticalThird,
  Pn as VisualNavigator,
  Oo as WebAudioEngine,
  Ys as WebPubBlobBuilder,
  Tr as WebPubCSS,
  Fr as WebPubDefaults,
  Ks as WebPubFrameManager,
  Js as WebPubFramePoolManager,
  Zr as WebPubNavigator,
  Ut as WebPubPreferences,
  Ii as WebPubPreferencesEditor,
  zi as WebPubSettings,
  Ar as WebRSProperties,
  _n as WebUserProperties,
  En as decorationsEqual,
  E as ensureBoolean,
  fe as ensureEnumValue,
  xn as ensureExperiment,
  Ct as ensureFilter,
  Nr as ensureLessThanOrEqual,
  Mr as ensureMoreThanOrEqual,
  w as ensureNonNegative,
  W as ensureString,
  D as ensureValueInRange,
  Je as experiments,
  ft as filterRangeConfig,
  Qt as fontSizeRangeConfig,
  at as fontWeightRangeConfig,
  te as fontWidthRangeConfig,
  Et as getScriptMode,
  Ho as i18n,
  ee as letterSpacingRangeConfig,
  ie as lineHeightRangeConfig,
  mt as lineLengthRangeConfig,
  ne as paragraphIndentRangeConfig,
  se as paragraphSpacingRangeConfig,
  le as playbackRateRangeConfig,
  Pt as resolveDecorationForWire,
  Uo as settings,
  rt as skipIntervalRangeConfig,
  ae as volumeRangeConfig,
  Pe as withFallback,
  re as wordSpacingRangeConfig,
  oe as zoomRangeConfig
};
