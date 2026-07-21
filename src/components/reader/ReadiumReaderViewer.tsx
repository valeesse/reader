import React from 'react';
import { ReadiumReaderView } from './ReadiumReaderView';
import { ReaderViewerProps } from './ReaderShared';
import { useReadiumReader } from '../../reader/useReadiumReader';

export function ReadiumReaderViewer(props: ReaderViewerProps & { chromeVisible: boolean }) {
  return <ReadiumReaderView {...useReadiumReader(props)} />;
}
