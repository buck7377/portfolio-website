import type { GridLine, Section, StoryPage } from "./types";
import { CHAPTERS } from "./work";

const h = (
  y: string,
  x: string,
  length: string,
  origin: GridLine["origin"] = "left",
  delay = 0,
): GridLine => ({ orientation: "horizontal", x, y, length, origin, delay });

const v = (
  x: string,
  y: string,
  length: string,
  origin: GridLine["origin"] = "top",
  delay = 0,
): GridLine => ({ orientation: "vertical", x, y, length, origin, delay });

export const SECTIONS: Section[] = [
  {
    id: "portfolio",
    num: "01",
    label: "Portfolio",
    tabColor: "var(--c-surface-portfolio)",
    theme: "light",
    pages: [
      {
        id: "work-toc",
        background: "var(--c-surface-portfolio)",
        theme: "light",
        gridLines: [],
        content: {
          layout: "work-toc",
          heading: "Work index",
          intro:
            "Selected work from the portfolio folder, organized by format: SEO articles, website and brand copy, email outreach, social campaigns, ads, and scripts.",
        },
      },
      ...CHAPTERS.map(
        (ch): StoryPage => ({
          id: `work-${ch.id}`,
          background: "var(--c-surface-portfolio)",
          theme: "light",
          gridLines: [],
          content: {
            layout: "work-chapter",
            headingLines: ch.titleLines,
            groups: ch.groups,
            extras: ch.extras,
          },
        }),
      ),
    ],
  },

  {
    id: "about",
    num: "02",
    label: "About",
    tabColor: "var(--c-surface-about)",
    theme: "light",
    pages: [
      {
        id: "about-bio",
        background: "var(--c-surface-about)",
        theme: "light",
        gridLines: [
          v("70%", "36%", "44%", "top", 0.32),
          h("88%", "24%", "76%", "right", 0.44),
        ],
        content: {
          layout: "bio",
          heading: "A little about me",
          paragraphs: [
            "I'm Zachary Clark, a marketing copywriter based in Michigan. I earned a bachelor's degree in Professional and Digital Writing at Oakland University and spent the last five years gaining experience in branding, web copy, SEO, agency content, technical writing and client-facing communications.",
            "Over those five years, I've learned how much curiosity affects the quality of the work. I genuinely enjoy learning about new audiences, industries, and ways to write for different goals.",
            "I'd love to put my curiosity and research to work for your business by writing copy that speaks directly to the people you want to reach.",
          ],
          art: { left: "/clipart/detroit-d.svg", right: "/clipart/oakland-u.png" },
        },
      },
      {
        id: "about-experience",
        background: "var(--c-surface-about)",
        theme: "light",
        gridLines: [],
        content: {
          layout: "timeline",
          heading: "Experience",
          entries: [
            {
              dates: "2021 — Present",
              role: "Senior Copywriter",
              org: "The Alchemists",
              orgNote: "Branding + web development agency",
              notes: "Discovery · positioning · messaging · web copy · client collaboration",
            },
            {
              dates: "2023 — 2026",
              role: "Content Creator",
              org: "RPM Services Group LLC",
              orgNote: "Digital marketing agency",
              notes:
                "B2B case studies · long-form · healthcare / software / enterprise risk · technical translation · research / proof · high-volume production",
            },
            {
              dates: "2021 — 2023",
              role: "SEO Specialist",
              org: "My Marketing Pass",
              orgNote: "Subscription marketing agency",
              notes:
                "Landing pages · email · thought leadership · ads · scripts · PR · SEO · CMS · multi-account delivery",
            },
          ],
        },
      },
    ],
  },

  {
    id: "contact",
    num: "03",
    label: "Contact",
    tabColor: "var(--c-surface-contact)",
    theme: "dark",
    pages: [
      {
        id: "contact-main",
        background: "var(--c-surface-contact)",
        theme: "dark",
        gridLines: [],
        content: {
          layout: "contact",
          heading: "Have something complicated to explain?",
          secondary: "Let's make the value obvious.",
          body: "For positioning, website copy, case studies, thought leadership, technical B2B content, or a messaging problem that needs untangling:",
          email: "clarkzac1997@gmail.com",
          location: "Goodrich, Michigan",
          cta: "Email Zachary",
          availability:
            "Available for freelance, contract, agency, and in-house conversations.",
          expertiseLine:
            "Positioning / Web / Case studies / Thought leadership / Technical B2B",
          art: { src: "clipart/keyboard-light.png", alt: "" },
        },
      },
    ],
  },
];

export const SECTION_INDEX: Record<string, number> = Object.fromEntries(
  SECTIONS.map((s, i) => [s.id, i]),
);
