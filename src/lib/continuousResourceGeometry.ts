export class ContinuousResourceGeometry {
  private heights: number[];
  private prefixes: number[];

  constructor(count: number, estimate: number) {
    this.heights = Array.from({ length: count }, () => Math.max(1, estimate));
    this.prefixes = new Array(count + 1).fill(0);
    this.rebuild(0);
  }

  height(index: number) { return this.heights[index] || 1; }
  top(index: number) { return this.prefixes[Math.max(0, Math.min(index, this.heights.length))] || 0; }
  total() { return this.prefixes[this.heights.length] || 1; }

  setHeight(index: number, height: number) {
    const next = Math.max(1, Math.ceil(height));
    const previous = this.height(index);
    if (Math.abs(next - previous) < 1) return 0;
    this.heights[index] = next;
    this.rebuild(index);
    return next - previous;
  }

  indexAt(offset: number) {
    const target = Math.max(0, Math.min(offset, this.total() - 1));
    let low = 0;
    let high = this.heights.length - 1;
    while (low <= high) {
      const middle = (low + high) >>> 1;
      if (target < this.prefixes[middle]) high = middle - 1;
      else if (target >= this.prefixes[middle + 1]) low = middle + 1;
      else return middle;
    }
    return Math.max(0, Math.min(this.heights.length - 1, low));
  }

  private rebuild(start: number) {
    for (let index = Math.max(0, start); index < this.heights.length; index++) {
      this.prefixes[index + 1] = this.prefixes[index] + this.heights[index];
    }
  }
}
