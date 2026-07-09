import { radius, space, text } from "./tokens";

export function Chip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`font-sans cursor-pointer border transition-[color,background-color,border-color,transform] motion-safe:active:scale-95 motion-reduce:active:scale-100 ${
        active
          ? 'bg-paper text-void border-paper'
          : 'border-border text-foreground hover:border-paper'
      }`}
      style={{ fontSize: text.chip, padding: `${space.sm} ${space.lg}`, borderRadius: radius.pill }}
    >
      {children}
    </button>
  );
}
