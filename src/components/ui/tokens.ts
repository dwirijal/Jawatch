// ponytail: atom design scale. Single place to tune spacing/radius/tracking
// so atoms stop using one-off magic numbers like px-[13px] / rounded-[20px].
export const space = {
  xs: "4px",
  sm: "6px",
  md: "8px",
  lg: "13px",
  xl: "26px",
} as const;

export const radius = {
  pill: "20px",
  chip: "8px",
  card: "14px",
} as const;

export const tracking = {
  eyebrow: "0.2em",
  label: "0.1em",
  tag: "0.08em",
  micro: "0.06em",
} as const;

export const text = {
  eyebrow: "9px",
  tag: "10px",
  chip: "12.5px",
  body: "13.5px",
} as const;
