import * as fs from "fs";
import postcss from "postcss";

import { isFileOfTypes } from "./helpers";
import postCssFontManifestPlugin from "./postcss";

const pluginName = "FontManifest";

export default class FontManifestPlugin {
  constructor(options = {}) {
    this.purgedStats = {};
    this.options = options;
  }

  apply(compiler) {
    compiler.hooks.compilation.tap(
      pluginName,
      this.initializePlugin.bind(this)
    );
  }

  initializePlugin(compilation) {
    compilation.hooks.additionalAssets.tapPromise(pluginName, () => {
      const entryPaths =
        typeof this.options.paths === "function"
          ? this.options.paths()
          : this.options.paths;
      entryPaths.forEach((p) => {
        if (!fs.existsSync(p)) throw new Error(`Path ${p} does not exist.`);
      });
      return this.runPluginHook(compilation, entryPaths);
    });
  }

  async runPluginHook(compilation) {
    const processor = postcss([postCssFontManifestPlugin]);
    const processingPromises = [];

    const assetsFromCompilation = Object.entries(compilation.assets).filter(
      ([name]) => {
        return isFileOfTypes(name, [".css"]);
      }
    );
    for (const chunk of compilation.chunks) {
      const assetsToProcess = assetsFromCompilation.filter(([name]) => {
        if (this.options.only) {
          return this.options.only.some((only) => name.includes(only));
        }
        return Array.isArray(chunk.files)
          ? chunk.files.includes(name)
          : chunk.files.has(name);
      });

      for (const [name, asset] of assetsToProcess) {
        const css = asset.source().toString();
        processingPromises.push(processor.process(css, { from: name }));
      }
    }

    const results = await Promise.all(processingPromises);

    const manifest = results.reduce((acc, result) => {
      const message = result.messages.find((m) => m.type === "font-manifest");
      if (message) {
        acc = { ...acc, ...message.fonts };
      }
      return acc;
    }, {});

    const manifestJson = JSON.stringify(manifest);

    compilation.assets["font-manifest.json"] = {
      source: () => manifestJson,
      size: () => manifestJson.length,
    };
  }
}
