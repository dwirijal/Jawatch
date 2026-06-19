type Tone = "default" | "green" | "blue" | "yellow" | "red" | "purple";

const toneStyles: Record<Tone, string> = {
  default: "bg-white/10 text-[var(--ja-text-secondary)]",
  green: "bg-[var(--ja-green)/0.15] text-[var(--ja-green)]",
  blue: "bg-[var(--ja-blue)/0.15] text-[var(--ja-blue)]",
  yellow: "bg-[var(--ja-yellow)/0.15] text-[var(--ja-gold)]",
  red: "bg-[var(--ja-red)/0.15] text-[var(--ja-red)]",
  purple: "bg-[var(--ja-purple)/0.15] text-[var(--ja-purple)]",
};

export function Badge({ tone = "default", children, className = "" }: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${toneStyles[tone]} ${className}`}>
      {children}
    </span>
  );
}

export function statusBadge(status?: string): Tone {
  switch (status) {
    case "ongoing": return "green";
    case "completed": return "blue";
    case "upcoming": return "yellow";
    default: return "default";
  }
}
