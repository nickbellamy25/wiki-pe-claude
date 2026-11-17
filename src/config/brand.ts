// Brand values read by Header, Footer, BaseLayout and llms.txt.ts.
// Tracked files hold placeholders only. scripts/apply-brand.mjs overwrites this file
// from a local config (see REBRAND.md); never commit the result.

export interface BrandConfig {
  firmName: string;
  teamName: string;
  functionName: string;
  /** Logo paths relative to the site root (files live in public/). An empty path renders "[Logo]". */
  logo: { light: string; dark: string; alt: string; width: number; height: number };
  /** Favicon links; hrefs are relative to the site root. Empty by default. */
  favicons: { rel: string; sizes: string; href: string }[];
  /** Social share image path relative to the site root; empty means no og:image tag. */
  socialImage: string;
  /** Browser UI color. A meta tag cannot read a CSS variable, so keep it in step with --chrome-bg. */
  themeColor: string;
  copyrightNotice: string;
  copyrightLink: { text: string; href: string } | null;
}

export const brand: BrandConfig = {
  firmName: '[Firm Name]',
  teamName: '[Team Name]',
  functionName: '[Function Name]',
  logo: { light: '', dark: '', alt: '[Firm Name]', width: 70, height: 28 },
  favicons: [],
  socialImage: '',
  themeColor: '#1f2933',
  copyrightNotice: '[Firm Name]. All rights reserved.',
  copyrightLink: null,
};
