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
      className={`font-sans cursor-pointer border transition-colors ${
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
