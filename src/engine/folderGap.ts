/**
 * The active tab and its folder share one continuous outline, so the folder's
 * top edge has to stop either side of that tab. These CSS variables carry the
 * gap, measured from the live tab rect so it stays correct through resizes,
 * font loading, and horizontal tab scrolling on small screens.
 */
export interface FolderGap {
  start: number;
  end: number;
}

export function measureFolderGap(tab: HTMLElement, host: HTMLElement): FolderGap {
  const tabRect = tab.getBoundingClientRect();
  const hostRect = host.getBoundingClientRect();
  const clamp = (v: number) => Math.max(0, Math.min(v, hostRect.width));
  // the outline meets the tab just inside its chamfered corners
  return {
    start: clamp(tabRect.left - hostRect.left + 1),
    end: clamp(tabRect.right - hostRect.left - 1),
  };
}

export function applyFolderGap(target: HTMLElement, gap: FolderGap): void {
  target.style.setProperty("--tab-gap-start", `${gap.start}px`);
  target.style.setProperty("--tab-gap-end", `${gap.end}px`);
}
