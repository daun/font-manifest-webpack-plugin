import postcss from "postcss";

import Plugin from "./cjs";
import { isStylesheet } from "./helpers";
import postCssFontManifestPlugin, { extractFontManifestResult } from "./postcss";

const processor = postcss([postCssFontManifestPlugin]);

const generateManifest = async (css) => {
  const result = await processor.process(css);
  const manifest = extractFontManifestResult(result);
  return manifest;
};

test("should set options property", () => {
  const opts = {
    test: "hello",
  };
  const plugin = new Plugin(opts);
  expect(plugin.options).toBe(opts);
});

test("should recognize css files by filename", () => {
  const stylesheets = [
    'stylesheet.css',
    '/some/stylesheet.css',
    '/some/stylesheet.CSS',
    '/some/stylesheet.css?param',
  ];
  const result = stylesheets.filter(isStylesheet);
  expect(result).toEqual(stylesheets);
});

test("should discard non-css files by filename", () => {
  const notStylesheets = [
    '/some/text.css.zip',
    '/some/text.cssx'
  ];
  const result = notStylesheets.filter(isStylesheet)
  expect(result).toEqual([]);
});

test("should parse font-face information", async () => {
  const css = `
    @font-face {
      font-family: 'Font A';
      src: url(/fonts/a.woff2) format('woff2');
    }
    body {
      font-family: 'Font A';
    }
  `;
  const manifest = await generateManifest(css);

  expect(manifest).toHaveProperty(['/fonts/a.woff2']);
  expect(manifest).toHaveProperty(['/fonts/a.woff2', 'family'], 'Font A');
  expect(manifest).toHaveProperty(['/fonts/a.woff2', 'format'], 'woff2');
  expect(manifest).toHaveProperty(['/fonts/a.woff2', 'url'], '/fonts/a.woff2');
});

test("should ignore un-used font-faces", async () => {
  const css = `
    @font-face {
      font-family: 'Font A';
      src: url(/fonts/a.woff2) format('woff2');
    }
    @font-face {
      font-family: 'Font A';
      src: url(/fonts/a.woff2) format('woff2');
    }
    body {
      font-family: 'Font B';
    }
    @media {
      font-family: 'Font A';
    }
    font-family: 'Font A';
  `;
  const manifest = await generateManifest(css);

  expect(manifest).not.toHaveProperty(['/fonts/a.woff2']);
});
