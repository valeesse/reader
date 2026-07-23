import assert from 'node:assert/strict';
import test from 'node:test';
import { build } from 'esbuild';

const result = await build({
  entryPoints: ['src/lib/metadataSeries.ts'],
  bundle: true,
  format: 'esm',
  platform: 'node',
  write: false,
});
const source = result.outputFiles[0].text;
const { createMetadataSeries, parseStrictFileSeries } = await import(
  `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
);

function book(id, relativePath) {
  const fileName = relativePath.split('/').at(-1);
  return {
    id,
    resourceId: id,
    contentId: `content-${id}`,
    title: fileName.replace(/\.(?:txt|epub)$/i, ''),
    author: '',
    type: fileName.toLowerCase().endsWith('.epub') ? 'epub' : 'txt',
    fileName,
    relativePath,
    addedAt: 1,
  };
}

test('strict parser requires series and numeric index while trailing title is optional', () => {
  assert.deepEqual(parseStrictFileSeries(book('one', 'folder/Long Series 01 First book.txt')), {
    directory: 'folder',
    name: 'Long Series',
    index: 1,
  });
  assert.deepEqual(parseStrictFileSeries(book('two', 'folder/Long Series 01.txt')), {
    directory: 'folder',
    name: 'Long Series',
    index: 1,
  });
  assert.deepEqual(parseStrictFileSeries(book('decimal', 'folder/Long Series 1.5.epub')), {
    directory: 'folder',
    name: 'Long Series',
    index: 1.5,
  });
  assert.deepEqual(parseStrictFileSeries(book('special', 'folder/Long Series 02 （特别篇） [修订] #1 !?.epub')), {
    directory: 'folder',
    name: 'Long Series',
    index: 2,
  });
  assert.equal(parseStrictFileSeries(book('three', 'folder/Long-Series-01-First.txt')), undefined);
  assert.equal(parseStrictFileSeries(book('joined', 'folder/Long Series01.txt')), undefined);
  assert.equal(parseStrictFileSeries({ ...book('four', 'Long Series 01 First.txt'), relativePath: undefined }), undefined);
});

test('automatic groups stay directory-local and sort by numeric series index', () => {
  const books = [
    book('a2', 'one/Saga 10 Ending.epub'),
    book('a1', 'one/Saga 2 Beginning.txt'),
    book('b1', 'two/Saga 1 Separate.txt'),
    book('ignored', 'one/Saga notes.txt'),
  ];
  const result = createMetadataSeries(books, []);
  assert.equal(result.stats.createdCount, 2);
  assert.equal(result.stats.eligibleGroups, 2);
  assert.deepEqual(result.series.map((series) => series.bookIds), [['a1', 'a2'], ['b1']]);
  assert.equal(result.series.some((series) => series.bookIds.includes('ignored')), false);
  assert.equal(result.books.find((item) => item.id === 'a2').seriesIndex, 10);
});

test('automatic creation expands an existing partial series with title-less volumes', () => {
  const books = Array.from({ length: 10 }, (_, offset) => {
    const index = offset + 1;
    const suffix = index === 9 ? ' 8.5' : index === 10 ? ' sss短片' : '';
    return book(`volume-${index}`, `light-novels/败犬女主太多了！/败犬女主太多了 ${String(index).padStart(2, '0')}${suffix}.epub`);
  });
  const existingSeries = [{
    id: 'existing-series',
    name: '败犬女主太多了',
    bookIds: ['volume-9', 'volume-10'],
  }];

  const result = createMetadataSeries(books, existingSeries);

  assert.equal(result.stats.createdCount, 0);
  assert.equal(result.stats.updatedCount, 1);
  assert.equal(result.stats.eligibleGroups, 1);
  assert.deepEqual(result.series, [{
    id: 'existing-series',
    name: '败犬女主太多了',
    bookIds: Array.from({ length: 10 }, (_, offset) => `volume-${offset + 1}`),
  }]);
});
