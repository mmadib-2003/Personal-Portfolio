/**
 * Canonical site facts that end up in metadata, the sitemap, robots.txt and the
 * résumé links.
 *
 * `NEXT_PUBLIC_SITE_URL` wins when set (production sets it to the primary
 * domain). The literal below is the fallback so a fork or a preview build still
 * emits absolute URLs instead of relative ones.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://muntasir-adib-portfolio.vercel.app";

/** The finalised CV, served straight from /public. */
export const CV_PATH = "/Muntasir_Adib_CV.pdf";

/** Plain-text one-pager kept alongside the PDF for ATS copies. */
export const CV_TEXT_PATH = "/resume/muntasir-adib-resume.txt";
