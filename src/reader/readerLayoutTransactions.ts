export class ReaderLayoutTransactionQueue {
  private tail: Promise<void> = Promise.resolve();

  enqueue(operation: () => Promise<void>) {
    this.tail = this.tail
      .catch(() => {})
      .then(operation)
      .catch((error) => console.warn('Failed to update reader layout', error));
    return this.tail;
  }
}
