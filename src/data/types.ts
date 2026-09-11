export type Theme = "light" | "dark";

export interface GridLine {
  orientation: "horizontal" | "vertical";
  /** percent offsets within the face, e.g. "0%" */
  x: string;
  y: string;
  /** percent length along the line's axis */
  length: string;
  origin: "left" | "right" | "top" | "bottom" | "center";
  delay?: number;
}

export type PageContent =
  | {
      layout: "hero";
      eyebrow: string;
      title: string[];
      subhead: string;
      support: string;
      primaryCta: { label: string; section: string };
      secondaryCta: { label: string; section: string };
    }
  | {
      layout: "statement";
      heading: string;
      body: string;
      columns: { title: string; text: string }[];
    }
  | {
      layout: "stats";
      heading: string;
      stats: { value: string; label: string }[];
    }
  | {
      layout: "index";
      heading: string;
      intro: string;
      rows: { num: string; title: string; desc: string }[];
      /** when set, clicking row i navigates to section + faceOffset + i */
      rowLink?: { section: string; faceOffset: number };
    }
  | {
      layout: "diary";
      date: string;
      title: string;
      paragraphs: string[];
      tags?: string[];
    }
  | {
      /** chapter menu: clicking an entry rotates the box to that face */
      layout: "work-toc";
      heading: string;
      intro: string;
    }
  | {
      /** a curated chapter view into the work dataset */
      layout: "work-chapter";
      headingLines: string[];
      groups: { label?: string; ids: string[] }[];
      /** resume-supported formats with no viewable sample — not clickable */
      extras?: { label: string; items: string[] };
    }
  | {
      layout: "feature";
      heading: string;
      body: string;
      strip?: string[];
      callouts?: string[];
      fact?: { lede: string; note?: string };
    }
  | {
      layout: "biglist";
      heading: string;
      body: string;
      items: string[];
      note?: string;
    }
  | {
      layout: "sequence";
      heading: string;
      body: string;
      words: string[];
      side: string;
    }
  | {
      layout: "matrix";
      heading: string;
      columns: { title: string; items: string[] }[];
    }
  | {
      layout: "keywords";
      heading: string;
      body: string;
      words: string[];
    }
  | {
      layout: "step";
      number: string;
      heading: string;
      body: string;
      labels?: string[];
      diagram?: string[];
      proof?: string[];
    }
  | {
      layout: "bio";
      heading: string;
      paragraphs: string[];
      /** paths to two decorative marks that flank the face's vertical rule */
      art?: { left: string; right: string };
    }
  | {
      layout: "timeline";
      heading: string;
      entries: {
        dates: string;
        role: string;
        org: string;
        orgNote: string;
        notes: string;
      }[];
    }
  | {
      layout: "contact";
      heading: string;
      secondary: string;
      body: string;
      email: string;
      location: string;
      cta: string;
      availability?: string;
      expertiseLine?: string;
      art?: { src: string; alt: string };
    };

export interface StoryPage {
  id: string;
  /** CSS color for this face's own opaque background */
  background: string;
  theme: Theme;
  gridLines: GridLine[];
  content: PageContent;
}

export interface Section {
  id: string;
  num: string;
  label: string;
  tabColor: string;
  theme: Theme;
  pages: StoryPage[];
}
