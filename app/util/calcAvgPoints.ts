export const avgPoints = (arr: number[]) => {
  const sum = arr.reduce((a, b) => a + b, 0);
  const avg = sum / arr.length || 0;
  return avg.toFixed(0);
};
