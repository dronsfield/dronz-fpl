function isEmpty(value: any) {
  return Boolean(!value && value !== false && value !== 0);
}

type Prop<T> = keyof T | ((input: T) => any);

function compareFactory<T>(opts: {
  prop?: Prop<T> | Array<Prop<T>>;
  desc?: boolean;
  valueTransform: (x: any) => any;
}): (left: T, right: T) => number {
  const { prop: _prop, desc, valueTransform } = opts;

  const isPropArray = Array.isArray(_prop);
  const prop = isPropArray ? _prop[0] : _prop;

  const directionTransform = (n: number) => (desc ? -1 : 1) * n;
  const secondaryCompare =
    isPropArray && _prop.length > 1
      ? compareFactory({ prop: _prop.slice(1), valueTransform, desc: false })
      : () => 0;

  return (left: T, right: T) => {
    const leftProp = prop
      ? typeof prop === "function"
        ? prop(left)
        : left[prop]
      : left;
    const rightProp = prop
      ? typeof prop === "function"
        ? prop(right)
        : right[prop]
      : right;
    let order = 0;
    if (isEmpty(leftProp) && isEmpty(rightProp)) {
      order = secondaryCompare(left, right);
    } else if (isEmpty(leftProp)) {
      order = 1;
    } else if (isEmpty(rightProp)) {
      order = -1;
    } else {
      const l = valueTransform(leftProp);
      const r = valueTransform(rightProp);
      if (l > r) {
        order = directionTransform(1);
      } else if (l < r) {
        order = directionTransform(-1);
      } else if (l === r) {
        order = secondaryCompare(left, right);
      }
    }
    return order;
  };
}

export function sortBy<T>(
  input: T[],
  prop?: Prop<T> | Array<Prop<T>>,
  desc?: boolean,
  opts?: {
    castLower?: boolean;
    valueTransform?: (x: any) => any;
  }
) {
  const { castLower, valueTransform: valueTransformProp } = opts || {};
  const valueTransform =
    valueTransformProp ||
    (castLower
      ? (x: T[keyof T]) => (typeof x === "string" ? x.toLowerCase() : x)
      : (x: T[keyof T]) => x);

  const compare = compareFactory({ prop, desc, valueTransform });

  return [...input].sort(compare);
}
