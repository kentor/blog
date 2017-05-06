const colors = require('colors');
const del = require('del');
const fsp = require('fs-promise');
const Immutable = require('immutable');
const path = require('path');

function outputInfoFromUrl(url, dest) {
  let dir;
  let filename;

  if (path.extname(url)) {
    const temp = url.split(path.sep);
    filename = temp.pop();
    dir = temp.join(path.sep);
  } else {
    dir = url;
    filename = 'index.html';
  }

  const outDir = path.join(dest, dir);
  const outFile = path.join(outDir, filename);

  return { outDir, outFile };
}

class SSG {
  constructor(opts = {}) {
    this.buildCache = [];
    this.dest = opts.dest || path.join(process.cwd(), 'public');
    this.genManifest = null;
    this.prevManifest = null;
  }

  manifest(cb) {
    this.genManifest = () => Immutable.Map(
      cb().map(row => [
        row.url,
        {
          ...row,
          ...outputInfoFromUrl(row.url, this.dest),
        },
      ])
    );
  }

  debug() {
    console.log(this.genManifest());
  }

  build() {
    const manifest = this.genManifest();

    manifest.forEach(row => {
      if (!row.handler) {
        console.warn(
          colors.yellow('warn'),
          'route handler not found for',
          row.url,
        );
        return;
      }

      (async () => {
        const raw = await row.handler(row.meta, row);

        if (this.buildCache[row.url] !== raw) {
          await fsp.mkdirs(row.outDir);
          await fsp.writeFile(row.outFile, raw);
          console.log(colors.green('wrote'), row.url, raw.length);
        }

        this.buildCache[row.url] = raw;
      })();
    });

    if (this.prevManifest) {
      this.prevManifest.forEach((row, key) => {
        if (!manifest.has(key)) {
          (async () => {
            await del(row.outFile);
            delete this.buildCache[row.url];
            console.log(colors.red('deleted'), row.url);
          })();
        }
      });
    }

    this.prevManifest = manifest;
  }
}

module.exports = SSG;