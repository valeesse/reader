import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const target = process.argv[2];
assert.ok(target === 'web' || target === 'desktop', 'Usage: verify-font-build.mjs <web|desktop>');

const dist = path.resolve('target/dist');
const files = await walk(dist);
const fontFiles = files.filter((file) => file.endsWith('.woff2'));
const sourceFiles = files.filter((file) => /\.(?:css|js)$/.test(file));
const source = (await Promise.all(sourceFiles.map((file) => readFile(file, 'utf8')))).join('\n');

if (target === 'desktop') {
  assert.equal(fontFiles.length, 0, 'Desktop frontend must not contain bundled WOFF2 files');
  assert.doesNotMatch(source, /LXGW WenKai Screen R|LXGW 975 Yuan SC/, 'Desktop frontend must use optional downloaded font packs');
  console.log('Verified desktop font build: no bundled webfonts.');
} else {
  const yuanFaces = countWeights(source, /font-family:["']?LXGW 975 Yuan SC["']?;font-style:normal;font-weight:(400|500|700)/g);
  const wenkaiFaces = [...source.matchAll(/font-family:["']?LXGW WenKai Screen R["']?;font-style:normal;font-weight:400/g)].length;
  assert.deepEqual(yuanFaces, { 400: 207, 500: 207, 700: 207 }, 'Web build must retain every Yuan face and weight');
  assert.equal(wenkaiFaces, 97, 'Web build must retain every WenKai face');
  assert.ok(fontFiles.length > 0, 'Web build must emit local WOFF2 assets');
  console.log(`Verified web font build: WenKai ${wenkaiFaces} faces; Yuan 400/500/700 each 207 faces; ${fontFiles.length} emitted WOFF2 files.`);
}

function countWeights(source, pattern) {
  const counts = { 400: 0, 500: 0, 700: 0 };
  for (const match of source.matchAll(pattern)) counts[match[1]] += 1;
  return counts;
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(entryPath) : [entryPath];
  }))).flat();
}
