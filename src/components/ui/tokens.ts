// ponytail: atom design scale. Single place to tune spacing/radius/tracking/size
// so atoms stop using one-off magic numbers (px-[13px], rounded-[2px], text-[9px]).
export const space = {
  xs: "4px",
  sm: "6px",
  md: "8px",
  lg: "13px",
  xl: "26px",
} as const;

export const radius = {
  sm: "2px",
  chip: "8px",
  card: "14px",
  pill: "20px",
} as const;

export const tracking = {
  eyebrow: "0.2em",
  label: "0.1em",
  tag: "0.08em",
  micro: "0.07em",
  xs: "0.06em",
  wide: "0.12em",
  wide2: "0.14em",
  wide3: "0.18em",
} as const;

export const text = {
  eyebrow: "9px",
  tag: "10px",
  micro: "11px",
  chip: "12.5px",
  body: "13.5px",
  title: "26px",
} as const;

// reusable paddings: `${yAxis} ${xAxis}`
export const pad = {
  badge: `${space.xs} ${space.sm}`,
  control: `${space.md} ${space.lg}`,
  button: `${space.lg} ${space.xl}`,
  strip: "16px 20px",
} as const;

// reusable fixed control sizes
export const size = {
  control: "48px", // ponytail: 48px tap target satisfies WCAG 2.5.8 + Lighthouse target-size
  num: "60px",
} as const;

// ponytail: shared page width. Kills the repeated max-w-[1160px] px-4 py-12
// magic literal; tune once here.
export const container = {
  maxWidth: "1160px",
  pageX: "16px",
  pageXSm: "32px",
  pageY: "48px",
} as const;

export const radiusPage = "4px";
export const textEyebrow = "9px";
