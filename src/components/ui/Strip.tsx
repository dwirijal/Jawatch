import Link from 'next/link';

export function Strip({
  items,
}: {
  items: { number: string; name: string; date?: string; href?: string }[];
}) {
  return (
    <div className="border border-border">
      {items.map((item, i) => {
        const inner = (
          <div className={`flex justify-between items-center px-5 py-4 ${i < items.length - 1 ? 'border-b border-border' : ''} hover:bg-card transition-colors cursor-pointer`}>
            <span className="font-mono text-primary text-xs w-16 shrink-0">{item.number}</span>
            <span className="font-serif text-base flex-1 text-foreground">{item.name}</span>
            {item.date && <span className="font-mono text-micro text-muted-foreground">{item.date}</span>}
          </div>
        );
        return item.href ? (
          <Link key={i} href={item.href}>{inner}</Link>
        ) : (
          <div key={i}>{inner}</div>
        );
      })}
    </div>
  );
}
