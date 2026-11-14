/**
 * Subtle page entrance: the new page rises a few pixels as it fades in. Pure CSS, so the content is visible even
 * before (or without) JavaScript; nothing ever waits on hydration to appear.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
