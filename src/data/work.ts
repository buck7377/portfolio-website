/**
 * Portfolio work is published into public/work/.
 * Each item has a local PDF plus rendered page images for the in-site reader
 * (regenerate with `node scripts/portfolio-assets.mjs render <id>`).
 */

export interface WorkProject {
  id: string;
  number: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  audience: string;
  formats: string[];
  pageCount: number;
  originalUrl: string;
  /** landscape pages (e.g. slide decks) get a wider reader column */
  wide?: boolean;
}

const pdfProject = (
  id: string,
  number: string,
  title: string,
  category: string,
  description: string,
  tags: string[],
  audience: string,
  formats: string[],
  pageCount: number,
  extra: Partial<WorkProject> = {},
): WorkProject => ({
  id,
  number,
  title,
  category,
  description,
  tags,
  audience,
  formats,
  pageCount,
  originalUrl: `/work/${id}.pdf`,
  ...extra,
});

export const WORK: WorkProject[] = [
  pdfProject("captive-insurance", "01", "Union Risk Services: Common Types of Captive Insurance", "Blog Articles", "A financial and risk-management blog article that explains how single-parent, group, and other captive structures work, and which kinds of businesses each one suits.", ["blog", "insurance", "risk-management", "b2b"], "Business leaders comparing risk-financing structures", ["Blog article", "B2B explainer"], 3),
  pdfProject("brain-fog-head-injury", "02", "Neurodiagnostics Medical: Why Brain Fog Happens After a Head Injury", "Blog Articles", "Patient-facing medical content that uses published research to validate brain fog as a measurable symptom, then walks readers through symptoms and treatment.", ["blog", "healthcare", "patient-content", "research"], "Patients and families dealing with symptoms after a head injury", ["Blog article", "Patient education"], 3),
  pdfProject("minimally-invasive-orthopedic-surgery", "03", "Metro Healthcare Partners: Minimally Invasive Orthopedic Surgery", "Blog Articles", "A patient-facing article for a Brooklyn orthopedic practice that covers the injuries minimally invasive surgery treats, the common procedures, and the recovery benefits, backed by cited research.", ["blog", "healthcare", "patient-content", "local-seo"], "Patients weighing orthopedic surgery options", ["Blog article", "Patient education"], 3),
  pdfProject("ups-power-factor", "04", "Nite and Day Power: What Is the Power Factor in a UPS System?", "Blog Articles", "A technical explainer that makes kW, kVA, and power factor make sense to non-engineers, then shows readers how to size a UPS for their actual load.", ["blog", "technical", "electrical", "b2b"], "Business owners and facility managers buying a UPS", ["Blog article", "Technical explainer"], 2),
  pdfProject("autosoft-dealer-management-software", "05", "Autosoft: Auto Dealer Management Software That Won't Break the Bank", "Blog Articles", "A B2B software article that shows smaller dealerships what patchwork tools and enterprise pricing really cost, with a feature checklist that leads to a demo.", ["blog", "b2b", "saas", "automotive"], "Owners and managers of small auto dealerships", ["Blog article", "B2B software content"], 2),
  pdfProject("mc-number", "06", "FMCA Filings: When Do You Need an MC Number?", "Blog Articles", "A transportation compliance article that separates USDOT numbers from MC operating authority and explains which carriers, brokers, and forwarders need to register.", ["blog", "compliance", "transportation", "regulatory"], "Trucking companies and carriers working out FMCSA requirements", ["Blog article", "Compliance explainer"], 2),
  pdfProject("healthcare-amplified-homepage", "07", "Healthcare Amplified: Homepage", "Website & Brand Copy", "Full homepage copy for a community and membership platform for healthcare podcasters and content creators, from hero through summit, learning, and membership sections.", ["website", "healthcare", "homepage", "community"], "Healthcare professionals who create podcasts and content", ["Homepage", "Web copy"], 4),
  pdfProject("pulsepoint-path-results-pages", "08", "PulsePoint Path: Assessment Results Pages", "Website & Brand Copy", "Results pages for a healthtech founder assessment. Each score tier gets its own landing page with messaging and next steps matched to the company's stage.", ["website", "funnel", "segmentation", "healthtech"], "Healthtech founders who completed the assessment", ["Segmented funnel pages", "Web copy"], 3),
  pdfProject("rapid-surplus-refund-brand-guide", "09", "Rapid Surplus Refund: Brand Guide", "Website & Brand Copy", "Brand guide copy for a family-run company that helps homeowners recover surplus funds left over after foreclosures and trustee sales.", ["brand", "voice", "messaging", "finance"], "Internal teams and partners applying the brand", ["Brand guide copy", "Brand voice"], 3),
  pdfProject("plastikgas-pitch-deck", "10", "PlastikGas: Investor Pitch Deck", "Website & Brand Copy", "A 15-slide investor deck written to raise $500,000 to commission a plastic-to-fuel plant, structured around the problem, the technology, proof, and the ask.", ["pitch-deck", "investor", "cleantech", "technical"], "Investors evaluating a $500K raise", ["Investor pitch deck", "Presentation"], 14, { wide: true }),
  pdfProject("aptica-cybersecurity-script", "11", "Aptica: Cybersecurity Awareness Infomercial Script", "Scripts & Speeches", "A slide-by-slide script in the voice of Aptica's founder that busts common small-business security myths and frames protection as layered and company-wide.", ["script", "cybersecurity", "executive-voice", "b2b"], "Small business owners", ["Video script", "Executive voice"], 3),
  pdfProject("radd-video-scripts", "12", "RADD: 30-Second Video Scripts", "Scripts & Speeches", "Four 30-second scripts for a credit union audit and compliance firm, each written to stay under 100 words for on-camera delivery.", ["script", "video", "compliance", "short-form"], "Credit union leaders and compliance teams", ["30-second video scripts"], 1),
  pdfProject("providers-edge-speech", "13", "Providers Edge: Short Pitch Speech", "Scripts & Speeches", "A short keynote pitch written in the voice of a healthcare media founder, built around client stories and a four-part partnership framework.", ["speech", "pitch", "healthcare", "executive-voice"], "Healthcare startup founders in a live audience", ["Speech", "Executive voice"], 2),
  pdfProject("healthcare-amplified-vsl-script", "14", "Healthcare Amplified: VSL Script", "Scripts & Speeches", "A video sales letter for a podcast growth program aimed at healthcare professionals, with scene directions for the production team.", ["script", "vsl", "healthcare", "sales"], "Healthcare professionals with or considering a podcast", ["Video sales letter script"], 2),
];

export const WORK_BY_ID: Record<string, WorkProject> = Object.fromEntries(
  WORK.map((p) => [p.id, p]),
);

export function pdfPath(p: WorkProject): string {
  return `work/${p.id}.pdf`;
}

export function previewPath(p: WorkProject): string {
  return `work/previews/${p.id}.png`;
}

/** pdftoppm pads page numbers to the digit count of the last page */
export function pagePath(p: WorkProject, page: number): string {
  const pad = String(p.pageCount).length;
  return `work/pages/${p.id}/p-${String(page).padStart(pad, "0")}.png`;
}

export function hasLocalPages(p: WorkProject): boolean {
  return p.pageCount > 0;
}

export interface WorkChapter {
  id: string;
  titleLines: string[];
  /** one-line descriptor shown on the index face */
  toc: string;
  groups: { label?: string; ids: string[] }[];
  extras?: { label: string; items: string[] };
}

export const CHAPTERS: WorkChapter[] = [
  {
    id: "articles",
    titleLines: ["Blog", "Articles"],
    toc: "Long-form explainers for B2B, technical, compliance, and patient-facing healthcare audiences",
    groups: [{ ids: ["captive-insurance", "brain-fog-head-injury", "minimally-invasive-orthopedic-surgery", "ups-power-factor", "autosoft-dealer-management-software", "mc-number"] }],
  },
  {
    id: "website-brand",
    titleLines: ["Website", "+ Brand Copy"],
    toc: "Homepages, segmented funnel pages, brand guides, and investor pitch decks",
    groups: [{ ids: ["healthcare-amplified-homepage", "pulsepoint-path-results-pages", "rapid-surplus-refund-brand-guide", "plastikgas-pitch-deck"] }],
  },
  {
    id: "scripts-speeches",
    titleLines: ["Scripts", "+ Speeches"],
    toc: "Video scripts, VSLs, and keynote pitches written in an executive's voice",
    groups: [{ ids: ["aptica-cybersecurity-script", "radd-video-scripts", "providers-edge-speech", "healthcare-amplified-vsl-script"] }],
  },
];

/** ?work= deep links land on a chapter face (face 0 is the index) */
export const CHAPTER_ROUTES: Record<string, number> = {
  articles: 1,
  blog: 1,
  seo: 1,
  web: 2,
  website: 2,
  brand: 2,
  scripts: 3,
  speeches: 3,
  video: 3,
  social: 3,
};

export function chapterProjectCount(ch: WorkChapter): number {
  return new Set(ch.groups.flatMap((g) => g.ids)).size;
}
