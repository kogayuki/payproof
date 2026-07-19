import { cn } from "@/lib/utils";

// Sansan風: グレーの見出しバー付き白パネル（「基本・住所（1）」のスタイル）
export function SectionPanel({
  title,
  count,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title: string;
  count?: number;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-md border border-border bg-card",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-border bg-muted/70 px-4 py-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <span
            aria-hidden
            className="inline-block h-2 w-2 bg-foreground/50"
          />
          {title}
          {count !== undefined && (
            <span className="font-normal text-muted-foreground">（{count}）</span>
          )}
        </h2>
        {actions}
      </div>
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}
