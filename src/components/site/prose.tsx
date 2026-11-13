export function Prose({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-3xl space-y-5 px-4 py-12 leading-relaxed [&_h2]:mt-10 [&_h2]:text-3xl [&_li]:ml-5 [&_li]:list-disc [&_p]:text-muted-foreground [&_ul]:space-y-2 [&_ul]:text-muted-foreground">{children}</div>;
}
