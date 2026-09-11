/**
 * Portfolio work is sourced from pdfs/ and published into public/work/.
 * Each item has a local PDF plus rendered page images for the in-site reader.
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
});

export const WORK: WorkProject[] = [
  pdfProject("seo-orthopedic-surgery", "001", "Minimally Invasive Orthopedic Surgery: Benefits and Recovery Time", "SEO Blogs & Articles", "A patient-facing medical article that explains surgical options, benefits, and recovery expectations without overpromising.", ["seo", "healthcare", "patient-content", "medical"], "Patients weighing orthopedic surgery options", ["SEO article", "Patient education"], 4),
  pdfProject("seo-hvac-refrigerant-changes", "002", "2025 HVAC Refrigerant Changes for Homeowners", "SEO Blogs & Articles", "Consumer SEO content translating a regulatory and product change into practical repair and replacement decisions.", ["seo", "home-services", "consumer", "regulatory"], "Homeowners researching HVAC repair or replacement", ["SEO article", "Consumer explainer"], 3),
  pdfProject("seo-scac-code-verification", "003", "Why SCAC Code Verification Is Important for Carriers", "SEO Blogs & Articles", "A compliance explainer for motor carriers covering what the code does, when teams need one, and what breaks when registration is wrong.", ["seo", "transportation", "compliance", "b2b"], "Motor carriers handling operational compliance", ["SEO article", "Regulatory explainer"], 3),
  pdfProject("seo-westmoreland-home-debt-case-study", "004", "How Kaye Wilkins Sold Her Westmoreland Home To Escape Debt and Rebuild Her Life", "SEO Blogs & Articles", "Narrative real-estate content that turns a financial-pressure scenario into a concrete customer story.", ["seo", "real-estate", "case-study", "consumer"], "Homeowners considering a fast sale under debt pressure", ["SEO article", "Customer story"], 2),
  pdfProject("seo-brain-fog-head-injury", "005", "Why Brain Fog Happens After a Head Injury and How To Treat It", "SEO Blogs & Articles", "Post-concussion symptoms explained in plain language for readers trying to understand cognitive changes after an injury.", ["seo", "healthcare", "patient-content", "research"], "Patients and families after a head injury", ["SEO article", "Research translation"], 3),
  pdfProject("seo-medical-malpractice-cases", "006", "Common Types of Medical Malpractice Cases", "SEO Blogs & Articles", "A legal-healthcare explainer that organizes a sensitive topic into clear case types and reader-friendly decision context.", ["seo", "legal", "healthcare", "explainer"], "Readers trying to understand potential malpractice claims", ["SEO article", "Legal explainer"], 2),
  pdfProject("seo-tree-risk-assessment", "007", "What a Tree Risk Assessment Is and Why Homeowners Need One", "SEO Blogs & Articles", "Local-service SEO copy that explains a professional assessment in plain language and connects it to homeowner risk.", ["seo", "home-services", "local", "explainer"], "Homeowners comparing tree service options", ["SEO article", "Service explainer"], 2),
  pdfProject("seo-captive-insurance", "008", "Common Types of Captive Insurance", "SEO Blogs & Articles", "A consultative B2B explainer covering insurance structures for business leaders comparing options.", ["seo", "insurance", "financial", "b2b"], "Business leaders comparing insurance structures", ["SEO article", "B2B explainer"], 4),
  pdfProject("seo-chapter-7-vs-11", "009", "The Difference Between Chapter 7 and Chapter 11 Bankruptcy", "SEO Blogs & Articles", "Two legal processes explained side by side for readers facing a high-stakes financial decision.", ["seo", "legal", "financial", "comparison"], "Readers comparing bankruptcy options", ["SEO article", "Comparison explainer"], 2),
  pdfProject("seo-spine-alignment-car-accident", "010", "Restoring Spine Alignment After a Car Accident Through Targeted Physical Therapy", "SEO Blogs & Articles", "Treatment-pathway content for patients deciding whether to seek care after a collision-related injury.", ["seo", "healthcare", "physical-therapy", "patient-content"], "Patients deciding whether to seek care after an accident", ["SEO article", "Patient education"], 3),
  pdfProject("seo-top-cybersecurity-companies", "011", "Top 10 Cybersecurity Companies", "SEO Blogs & Articles", "Comparison-style search content helping buyers understand security vendors and the categories they occupy.", ["seo", "cybersecurity", "comparison", "b2b"], "Business buyers researching cybersecurity vendors", ["SEO article", "Listicle"], 7),
  pdfProject("seo-enterprise-risk-metrics", "012", "Six Metrics To Measure Enterprise Risk Management Performance", "SEO Blogs & Articles", "Leadership-facing content on proving the value of a risk program with measurable outcomes instead of assumptions.", ["seo", "enterprise-risk", "thought-leadership", "b2b"], "Leadership and organizational decision-makers", ["SEO article", "Thought leadership"], 3),
  pdfProject("web-climate-web-business-description", "013", "The Climate Web: Business Description", "Website & Brand Copy", "A concise positioning statement for a knowledge platform, built on scale and expertise as credibility signals.", ["brand", "positioning", "b2b", "messaging"], "Prospective users and partners of a knowledge platform", ["Business description", "Positioning copy"], 1),
  pdfProject("web-healthcare-amplified-sales-page", "014", "Healthcare Amplified: Premium Membership Sales Page", "Website & Brand Copy", "A long-form sales page for healthcare professionals evaluating a premium service investment.", ["website", "healthcare", "sales-page", "conversion"], "Healthcare professionals evaluating a service investment", ["Sales page", "Web copy"], 5),
  pdfProject("web-healthcare-amplified-homepage", "015", "Healthcare Amplified: Homepage", "Website & Brand Copy", "Brand-level homepage messaging that establishes audience, positioning, and credibility for a healthcare thought-leadership offer.", ["website", "healthcare", "homepage", "positioning"], "Healthcare professionals meeting the brand for the first time", ["Homepage", "Web copy"], 6),
  pdfProject("web-mountaineer-inn-webpages", "016", "Mountaineer Inn Webpages", "Website & Brand Copy", "Hospitality web copy that turns amenities, location, and booking intent into a clearer visitor path.", ["website", "hospitality", "local", "booking"], "Travelers comparing local lodging options", ["Webpages", "Hospitality copy"], 3),
  pdfProject("web-perfect-rhythm-homepage", "017", "Perfect Rhythm Medical Consultants Homepage", "Website & Brand Copy", "Healthcare homepage copy that makes a consulting offer legible to busy professional readers.", ["website", "healthcare", "homepage", "consulting"], "Healthcare professionals and organizational buyers", ["Homepage", "Web copy"], 1),
  pdfProject("web-plastikgas-investor-pitch-deck", "018", "PlastikGas: Investor Pitch Deck", "Website & Brand Copy", "A full investment deck for a plastic-to-fuel technology company, structured around problem, proof, revenue, and ask.", ["pitch-deck", "investor", "technical", "strategy"], "Investors evaluating a $500k ask", ["Pitch deck", "Presentation"], 16),
  pdfProject("web-pulsepoint-path-quiz-results", "019", "PulsePoint Path Quiz Results Pages", "Website & Brand Copy", "Segmented quiz-result copy designed to make each outcome feel specific, useful, and connected to a next step.", ["website", "quiz", "segmentation", "conversion"], "Quiz takers receiving personalized next steps", ["Quiz results pages", "Web copy"], 12),
  pdfProject("web-rapid-surplus-refund-brand-guide", "020", "Rapid Surplus Refund Brand Guide Copy", "Website & Brand Copy", "Brand-guide language for a finance-adjacent service, clarifying voice, promise, and message consistency.", ["brand", "messaging", "finance", "voice"], "Internal teams and partners applying the brand", ["Brand guide copy"], 4),
  pdfProject("web-red-ronin-defense-webpage", "021", "Red Ronin Defense Webpage", "Website & Brand Copy", "Brand-forward webpage copy for a defense and security offer, written to communicate credibility quickly.", ["website", "security", "brand", "conversion"], "Prospects evaluating a defense or security provider", ["Webpage", "Brand copy"], 4),
  pdfProject("web-sales-call-follow-up-funnel", "022", "Sales Call Follow-Up Automation Funnel Landing Page", "Website & Brand Copy", "Landing page copy for an automation funnel, written around missed follow-up, sales leakage, and operational relief.", ["landing-page", "automation", "funnel", "sales"], "Service businesses improving post-call follow-up", ["Landing page", "Funnel copy"], 11),
  pdfProject("web-velocity-pitch-decks-offer", "023", "Velocity Pitch Decks Top Tier Offer", "Website & Brand Copy", "Offer copy for a premium pitch-deck service, balancing authority, urgency, and founder-facing clarity.", ["website", "offer", "founders", "sales-page"], "Founders and teams buying pitch-deck support", ["Offer page", "Sales copy"], 3),
  pdfProject("email-radd-hiring-auditor", "024", "5 Steps to Hiring an Auditor: RADD", "Email & Outreach", "Educational outreach content that turns a complex hiring decision into a short step-by-step path.", ["email", "audit", "education", "b2b"], "Organizations considering audit support", ["Email", "Educational sequence"], 6),
  pdfProject("email-block-time-financial-campaign", "025", "Block Time Financial Email Campaign", "Email & Outreach", "Financial-services email campaign focused on clarity, trust, and a manageable next step.", ["email", "financial", "campaign"], "Prospects for a financial-service offer", ["Email campaign"], 2),
  pdfProject("email-burnout-banter-blast", "026", "Burnout Banter S3E1 Email Blast", "Email & Outreach", "Promotional email blast for an episode release, written to earn a click without burying the premise.", ["email", "podcast", "promotion"], "Subscribers and episode-aware followers", ["Email blast"], 2),
  pdfProject("email-ctc-nurture-campaign", "027", "CTC 16-Email Nurture Campaign", "Email & Outreach", "Long nurture sequence built to keep a prospect moving from awareness through trust and response.", ["email", "nurture", "campaign", "sequence"], "Prospects moving through a multi-touch sales journey", ["Email nurture campaign"], 14),
  pdfProject("email-colonial-life-benefits-sequence", "028", "Colonial Life Benefits Email Sequence", "Email & Outreach", "Benefits-focused email sequence translating insurance and employee value into reader-centered messages.", ["email", "benefits", "insurance", "b2b"], "Employers or employees evaluating benefits information", ["Email sequence"], 5),
  pdfProject("email-mojo-global-reactivation", "029", "Mojo Global Lead Reactivation Funnel", "Email & Outreach", "Reactivation funnel copy that gives cold or quiet leads a practical reason to re-engage.", ["email", "reactivation", "funnel", "lead-gen"], "Dormant or under-engaged leads", ["Reactivation funnel"], 6),
  pdfProject("email-mymarketingpass-upsell-sequence", "030", "MyMarketingPass Upsell Email Sequence", "Email & Outreach", "Upsell sequence that frames additional service value around what the customer is already trying to accomplish.", ["email", "upsell", "subscription", "sequence"], "Existing customers eligible for an upgrade or add-on", ["Upsell email sequence"], 8),
  pdfProject("email-scott-jennings-book-2-launch", "031", "Scott Jennings Book 2 Launch Email Sequence", "Email & Outreach", "Launch emails for an author campaign, balancing announcement energy with reasons to buy.", ["email", "book-launch", "author", "campaign"], "Readers and followers during a book launch", ["Launch email sequence"], 3),
  pdfProject("email-scott-jennings-book-3-press-release", "032", "Scott Jennings Book 3 Press Release", "Email & Outreach", "Press-release copy for a book launch, packaging the story for media and announcement channels.", ["press-release", "book-launch", "pr"], "Media contacts, readers, and launch partners", ["Press release"], 2),
  pdfProject("email-visionary-advantages-referral", "033", "Visionary Advantages Referral Partner Email Sequence", "Email & Outreach", "Referral-partner sequence written to make the ask feel clear, mutual, and easy to act on.", ["email", "referral", "partnership", "sequence"], "Referral partners and warm professional contacts", ["Referral email sequence"], 4),
  pdfProject("social-american-stair-parts-campaign", "034", "American Stair Parts Social Campaign", "Social, Ads & Scripts", "Social campaign copy for a product category with visual appeal, written to support repeated audience touches.", ["social", "campaign", "home", "product"], "Homeowners, builders, and renovation-minded buyers", ["Social campaign"], 5),
  pdfProject("social-aptica-cybersecurity-awareness", "035", "Aptica Cybersecurity Awareness Infomercial Script", "Social, Ads & Scripts", "A myth-busting presentation script that frames cybersecurity as an organizational responsibility rather than an IT-only problem.", ["script", "cybersecurity", "presentation", "b2b"], "Business owners and teams hearing a live presentation", ["Infomercial script", "Presentation script"], 4),
  pdfProject("social-aptica-good-vs-great", "036", "Aptica Good vs Great Presentation Script", "Social, Ads & Scripts", "Presentation script contrasting baseline cybersecurity practice with stronger organizational habits.", ["script", "cybersecurity", "presentation", "b2b"], "Business owners and teams hearing a live presentation", ["Presentation script"], 5),
  pdfProject("social-better-you-4-u-campaign", "037", "Better You 4 U Audio Course Social Campaign", "Social, Ads & Scripts", "Social campaign for an audio course, shaped around benefits, curiosity, and repeated entry points.", ["social", "campaign", "course", "wellness"], "Potential learners encountering the course on social channels", ["Social campaign"], 5),
  pdfProject("social-healthcare-amplified-vsl", "038", "Healthcare Amplified VSL Script", "Social, Ads & Scripts", "Video sales letter script for a healthcare professional audience, built around problem recognition and offer momentum.", ["script", "vsl", "healthcare", "sales"], "Healthcare professionals watching a sales video", ["VSL script"], 2),
  pdfProject("social-midwest-small-business-campaign", "039", "Midwest Small Business Digital Success Initiative Social Campaign", "Social, Ads & Scripts", "Community and economic-development social campaign aimed at making a digital success initiative feel practical and local.", ["social", "campaign", "small-business", "local"], "Midwest small business owners", ["Social campaign"], 5),
  pdfProject("social-platinum-savings-homepage-video", "040", "Platinum Savings Group Homepage Video Script", "Social, Ads & Scripts", "Homepage video script that compresses brand promise and service clarity into a front-door message.", ["script", "homepage", "video", "financial"], "Website visitors meeting the brand for the first time", ["Homepage video script"], 1),
  pdfProject("social-providers-edge-short-pitch", "041", "Providers Edge Speech: Short Pitch", "Social, Ads & Scripts", "Short spoken pitch structured to make a healthcare-adjacent offer crisp and memorable.", ["script", "pitch", "healthcare", "spoken"], "Listeners hearing a brief live or recorded pitch", ["Short pitch", "Speech"], 2),
  pdfProject("social-radd-video-scripts", "042", "RADD 30-Second Video Scripts", "Social, Ads & Scripts", "Short video scripts built for quick comprehension, a single message, and a clean call to action.", ["script", "video", "ads", "short-form"], "Short-form viewers and paid or social traffic", ["30-second video scripts"], 2),
  pdfProject("social-rolling-hills-recovery-campaign", "043", "Rolling Hills Recovery Center Social Campaign", "Social, Ads & Scripts", "Sensitive healthcare and recovery social campaign written to be direct, supportive, and careful with trust.", ["social", "campaign", "healthcare", "recovery"], "People seeking recovery support and their families", ["Social campaign"], 6),
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
    id: "seo-articles",
    titleLines: ["SEO Blogs", "+ Articles"],
    toc: "Search content, explainers, comparisons, patient education, and research translation",
    groups: [{ ids: ["seo-orthopedic-surgery", "seo-hvac-refrigerant-changes", "seo-scac-code-verification", "seo-westmoreland-home-debt-case-study", "seo-brain-fog-head-injury", "seo-medical-malpractice-cases", "seo-tree-risk-assessment", "seo-captive-insurance", "seo-chapter-7-vs-11", "seo-spine-alignment-car-accident", "seo-top-cybersecurity-companies", "seo-enterprise-risk-metrics"] }],
  },
  {
    id: "website-brand",
    titleLines: ["Website", "+ Brand Copy"],
    toc: "Homepages, sales pages, pitch decks, landing pages, brand guides, and positioning",
    groups: [{ ids: ["web-climate-web-business-description", "web-healthcare-amplified-sales-page", "web-healthcare-amplified-homepage", "web-mountaineer-inn-webpages", "web-perfect-rhythm-homepage", "web-plastikgas-investor-pitch-deck", "web-pulsepoint-path-quiz-results", "web-rapid-surplus-refund-brand-guide", "web-red-ronin-defense-webpage", "web-sales-call-follow-up-funnel", "web-velocity-pitch-decks-offer"] }],
  },
  {
    id: "email-outreach",
    titleLines: ["Email", "+ Outreach"],
    toc: "Nurture campaigns, launch sequences, reactivation funnels, referral asks, and PR",
    groups: [{ ids: ["email-radd-hiring-auditor", "email-block-time-financial-campaign", "email-burnout-banter-blast", "email-ctc-nurture-campaign", "email-colonial-life-benefits-sequence", "email-mojo-global-reactivation", "email-mymarketingpass-upsell-sequence", "email-scott-jennings-book-2-launch", "email-scott-jennings-book-3-press-release", "email-visionary-advantages-referral"] }],
  },
  {
    id: "social-ads-scripts",
    titleLines: ["Social, Ads", "+ Scripts"],
    toc: "Social campaigns, short-form ads, video scripts, VSLs, speeches, and presentations",
    groups: [{ ids: ["social-american-stair-parts-campaign", "social-aptica-cybersecurity-awareness", "social-aptica-good-vs-great", "social-better-you-4-u-campaign", "social-healthcare-amplified-vsl", "social-midwest-small-business-campaign", "social-platinum-savings-homepage-video", "social-providers-edge-short-pitch", "social-radd-video-scripts", "social-rolling-hills-recovery-campaign"] }],
  },
];

/** ?work= deep links land on a chapter face (face 0 is the index) */
export const CHAPTER_ROUTES: Record<string, number> = {
  seo: 1,
  articles: 1,
  web: 2,
  website: 2,
  brand: 2,
  email: 3,
  outreach: 3,
  social: 4,
  ads: 4,
  scripts: 4,
};

export function chapterProjectCount(ch: WorkChapter): number {
  return new Set(ch.groups.flatMap((g) => g.ids)).size;
}
