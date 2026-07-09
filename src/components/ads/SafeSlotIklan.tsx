import { SlotIklan } from './SlotIklan';
import { canRenderAd } from './gambling-blocklist';
import type { SlotIklanProps } from './SlotIklan';

type SafeSlotIklanProps = SlotIklanProps & { label?: string; src?: string; alt?: string };

export function SafeSlotIklan(props: SafeSlotIklanProps) {
  const { label, src, alt, ...rest } = props;
  // If a gambling ad is requested, render NOTHING (do not fall back to a gambling slot).
  if (!canRenderAd({ label, slot: rest.slot, src, alt })) {
    return null;
  }
  return <SlotIklan {...rest}>{props.children}</SlotIklan>;
}
