export default (
  r1: { offset: number; length: number },
  r2: { offset: number; length: number }
): number => {
  if (r1.offset === r2.offset) {
    return r2.length - r1.length;
  }
  return r1.offset - r2.offset;
};
