import React from 'react';
import { ReadiumReaderView } from './components/reader/ReadiumReaderView';
import { ReaderViewerProps } from './components/reader/ReaderShared';
import { useReadiumReader } from './lib/useReadiumReader';

export function ReadiumReaderViewer(props: ReaderViewerProps & { chromeVisible: boolean }) {
  return <ReadiumReaderView {...useReadiumReader(props)} />;
}
