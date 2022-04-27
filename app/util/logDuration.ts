const history: { [key: string]: { average: number; count: number } } = {};

function formatDuration(ms: number) {
  return ("      " + Math.round(ms) + "ms").slice(-6);
}

export function logDuration(label: string) {
  let t0 = new Date().getTime();
  let t1 = 0;
  const end = () => {
    t1 = new Date().getTime();
    const duration = t1 - t0;

    history[label] = history[label]
      ? {
          count: history[label].count + 1,
          average:
            (history[label].average * history[label].count + duration) /
            (history[label].count + 1),
        }
      : {
          count: 1,
          average: duration,
        };

    console.log(
      `DUR | ${formatDuration(duration)} / ${formatDuration(
        history[label].average
      )} | ${label}`
    );
  };
  return { end };
}
