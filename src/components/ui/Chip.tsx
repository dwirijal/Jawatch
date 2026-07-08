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
      className={`font-sans text-[12.5px] px-[13px] py-[6px] border rounded-[20px] cursor-pointer transition-colors ${
        active
          ? 'bg-paper text-void border-paper'
          : 'border-border text-foreground hover:border-paper'
      }`}
    >
      {children}
    </button>
  );
}
