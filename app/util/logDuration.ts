export function logDuration(label: string) {
  let t0 = new Date().getTime();
  let t1 = 0;
  const end = () => {
    t1 = new Date().getTime();
    console.log(`DURATION [${label}]: ${t1 - t0}ms`);
  };
  return { end };
}
