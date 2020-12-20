import postcss from "postcss";
import CleanCSS from "clean-css";

const pluginName = "postcss-font-manifest";

const defaults = {
  include: (path) => true,
  format: "woff2",
};

const clean = new CleanCSS();

/**
 * fontManifest function
 * @param  {Object} opts
 * @param  {Root} root
 * @return {Root}
 */
async function fontManifest(opts = {}, root, result) {
  const options = { ...defaults, ...opts };

  const cssFile = root.source.input.file;

  // Let user filter by stylesheet
  if (options.include && !options.include(cssFile)) {
    return;
  }

  const families = {};
  const faces = {};

  // Find font families in use
  root.walkDecls(/^font(-family)?$/, (decl) => {
    const family = getFirstFontFamily(decl);
    families[family] = true;
  });

  // Find font face definitions
  root.walkAtRules(/font-face/, (rule) => {
    const { format } = options;

    const family = getDeclarationValue(rule, "font-family");
    const weight = getDeclarationValue(rule, "font-weight") || "normal";
    const style = getDeclarationValue(rule, "font-style") || "normal";
    const src = getDeclarationValue(rule, "src");
    const url = getFontUrlByFormat(src, format);
    const css = clean.minify(rule.toString()).styles

    if (url) {
      // prettier-ignore
      faces[url] = { family, weight, style, format, url, src, css };
    } else {
      console.warn(`No ${format} source found for ${family}`, "\n");
    }
  });

  // Remove unused font faces
  const usedFaces = Object.entries(faces).reduce((acc, [key, face]) => {
    if (face.family && families[face.family]) {
      acc[key] = face;
    }
    return acc;
  }, {});

  // Add info to result object
  result.messages.push({
    type: "font-manifest",
    plugin: pluginName,
    fonts: usedFaces,
  });
}

export const extractFontManifestResult = (result) => {
  const message = result.messages.find((m) => m.type === "font-manifest");
  return message ? message.fonts : null
}

const getQuoteless = (str) => str.replace(/^(['"])(.+)\1$/g, "$2");

const getDeclarationValue = (rule, property) => {
  let result = "";
  for (const declaration of rule.nodes) {
    if (declaration.prop === property) {
      result = getQuoteless(declaration.value);
    }
  }
  return result;
};

const getFirstFontFamily = (decl) =>
  getQuoteless(
    postcss.list.space(postcss.list.comma(decl.value)[0]).slice(-1)[0]
  );

const getFontUrlByFormat = (srcString, format) => {
  const sources = postcss.list.comma(srcString).map(getFontUrlAndFormat);
  const source = sources.find((src) => src.format === format);
  return source ? source.url : null;
};

const getFontUrlAndFormat = (fontSrc) => {
  const match = /url\(["']?([\w\W]+?)["']?\)\s+format\(["']?([\w]+)["']?\)/i.exec(
    fontSrc
  );
  if (match) {
    const [, url, format] = match;
    return { url, format };
  }
  return {};
};

const getPluginWithIntialParams = (options) => fontManifest.bind(null, options);

export default postcss.plugin(pluginName, (options = {}) =>
  getPluginWithIntialParams(options)
);
