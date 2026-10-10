import { SearchEngine } from '../types/browser';

const SEARCH_ENGINE_URLS: Record<SearchEngine, string> = {
  duckduckgo: 'https://duckduckgo.com/?q=',
  google: 'https://www.google.com/search?q=',
  bing: 'https://www.bing.com/search?q=',
  ecosia: 'https://www.ecosia.org/search?q=',
  startpage: 'https://www.startpage.com/do/dsearch?query=',
};

// Known websites that explicitly send X-Frame-Options: SAMEORIGIN / DENY or CSP frame-ancestors
const KNOWN_BLOCKED_DOMAINS = [
  'duckduckgo.com',
  'discord.com',
  'discordapp.com',
  'discord.gg',
  'google.com',
  'youtube.com',
  'youtu.be',
  'github.com',
  'twitter.com',
  'x.com',
  'facebook.com',
  'instagram.com',
  'threads.net',
  'whatsapp.com',
  'messenger.com',
  'reddit.com',
  'linkedin.com',
  'nytimes.com',
  'amazon.com',
  'netflix.com',
  'apple.com',
  'microsoft.com',
  'docs.google.com',
  'drive.google.com',
  'bing.com',
  'yahoo.com',
  'spotify.com',
  'twitch.tv',
  'tiktok.com',
  'pinterest.com',
  'quora.com',
  'slack.com',
  'zoom.us',
  'notion.so',
  'figma.com',
  'cloudflare.com',
  'vercel.com',
  'dropbox.com',
  'paypal.com',
  'stripe.com',
  'bankofamerica.com',
  'chase.com',
  'wellsfargo.com',
];

// Curated embed-friendly or educational sites
export const CURATED_SITES = [
  {
    title: 'OpenStreetMap',
    url: 'https://www.openstreetmap.org/export/embed.html?bbox=-0.15%2C51.50%2C-0.10%2C51.52&layer=mapnik',
    description: 'Free, open collaborative geographic world map.',
    category: 'Reference' as const,
    icon: 'map',
    embedCompatibility: 'verified' as const,
    embedNote: 'Permits iframe embedding worldwide.',
  },
  {
    title: 'PhET Interactive Simulations',
    url: 'https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_all.html',
    description: 'University of Colorado interactive science and physics simulations.',
    category: 'Science & Math' as const,
    icon: 'atom',
    embedCompatibility: 'verified' as const,
    embedNote: 'Designed for school Chromebooks & iPads.',
  },
  {
    title: 'Wikipedia (English)',
    url: 'https://en.wikipedia.org/wiki/Portal:Contents',
    description: 'The free encyclopedia with millions of collaborative articles.',
    category: 'Reference' as const,
    icon: 'book',
    embedCompatibility: 'verified' as const,
    embedNote: 'Wikipedia articles permit standard web embedding.',
  },
  {
    title: 'Internet Archive Wayback',
    url: 'https://web.archive.org/',
    description: 'Non-profit digital library of millions of books, web pages, and films.',
    category: 'Reference' as const,
    icon: 'archive',
    embedCompatibility: 'likely' as const,
    embedNote: 'Embed-friendly archived historical pages.',
  },
  {
    title: 'Project Gutenberg',
    url: 'https://www.gutenberg.org/',
    description: 'Over 70,000 free classic public domain eBooks.',
    category: 'Educational' as const,
    icon: 'book-open',
    embedCompatibility: 'likely' as const,
    embedNote: 'Standard open public text archive.',
  },
  {
    title: 'W3Schools Interactive Editor',
    url: 'https://www.w3schools.com/html/tryit.asp?filename=tryhtml_default',
    description: 'Hands-on interactive web technology tutorials and editors.',
    category: 'Tools & News' as const,
    icon: 'code',
    embedCompatibility: 'verified' as const,
    embedNote: 'Permits interactive embedding.',
  },
  {
    title: 'NASA Astronomy Picture',
    url: 'https://apod.nasa.gov/apod/astropix.html',
    description: 'Discover the cosmos with NASA daily featured imagery.',
    category: 'Science & Math' as const,
    icon: 'telescope',
    embedCompatibility: 'verified' as const,
    embedNote: 'Public domain scientific service.',
  },
  {
    title: 'Hacker News (Algos)',
    url: 'https://news.ycombinator.com/',
    description: 'Technology, engineering, and startup discussions.',
    category: 'Tools & News' as const,
    icon: 'terminal',
    embedCompatibility: 'likely' as const,
    embedNote: 'Lightweight HTML interface.',
  },
];

/**
 * Validates, normalizes, and resolves user input into a navigable URL.
 * Automatically adds HTTPS when scheme is omitted.
 * Validates and allows only HTTP and HTTPS (plus internal portal://).
 * Rejects javascript:, file:, data:, and all unsafe/unsupported schemes.
 */
export function resolveInputToUrl(
  input: string,
  searchEngine: SearchEngine = 'duckduckgo'
): { url: string; error?: string; isInternal: boolean } {
  const trimmed = input.trim();

  if (!trimmed) {
    return { url: 'portal://welcome', isInternal: true };
  }

  // Internal Portal schemes
  if (trimmed.startsWith('portal://')) {
    return { url: trimmed, isInternal: true };
  }

  const lower = trimmed.toLowerCase();

  // Reject dangerous or prohibited pseudo-schemes
  const dangerousSchemes = [
    'javascript:',
    'data:',
    'file:',
    'vbscript:',
    'blob:',
    'about:',
    'chrome:',
    'firefox:',
    'edge:',
  ];

  for (const scheme of dangerousSchemes) {
    if (lower.startsWith(scheme)) {
      return {
        url: '',
        error: `Security Alert: The "${scheme}" protocol is blocked for security reasons to protect your device and data. Only HTTP and HTTPS are permitted.`,
        isInternal: false,
      };
    }
  }

  // Check if scheme contains a colon and is NOT http/https/portal
  const schemeMatch = lower.match(/^([a-z0-9+.-]+):/);
  if (schemeMatch) {
    const scheme = schemeMatch[1];
    if (scheme !== 'http' && scheme !== 'https') {
      return {
        url: '',
        error: `Unsupported Protocol: "${scheme}:" is not supported. Portal only allows HTTP and HTTPS web addresses.`,
        isInternal: false,
      };
    }
  }

  // Explicit HTTP/HTTPS URL
  if (lower.startsWith('http://') || lower.startsWith('https://')) {
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return {
          url: '',
          error: 'Only HTTP and HTTPS protocols are permitted.',
          isInternal: false,
        };
      }
      return { url: parsed.href, isInternal: false };
    } catch {
      return {
        url: '',
        error: 'Invalid address format. Please enter a valid HTTP or HTTPS address.',
        isInternal: false,
      };
    }
  }

  // Domain pattern with or without path/port (e.g. "duckduckgo.com", "discord.com", "sub.domain.org/path", "localhost:3000")
  const domainPattern = /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/;
  const localhostPattern = /^localhost(:\d+)?(\/.*)?$/;
  const ipAddressPattern = /^(\d{1,3}\.){3}\d{1,3}(:\d+)?(\/.*)?$/;

  if (domainPattern.test(trimmed) || localhostPattern.test(trimmed) || ipAddressPattern.test(trimmed)) {
    // Automatically prepend https:// (or http:// for localhost)
    const protocol = localhostPattern.test(trimmed) ? 'http://' : 'https://';
    try {
      const fullUrl = `${protocol}${trimmed}`;
      const parsed = new URL(fullUrl);
      return { url: parsed.href, isInternal: false };
    } catch {
      // Fall through to search query
    }
  }

  // Otherwise, treat as search query using the configured search engine
  const searchBase = SEARCH_ENGINE_URLS[searchEngine] || SEARCH_ENGINE_URLS.duckduckgo;
  const searchUrl = `${searchBase}${encodeURIComponent(trimmed)}`;
  return { url: searchUrl, isInternal: false };
}

/**
 * Extracts a readable domain or title label from a URL
 */
export function extractDomain(url: string): string {
  if (!url || url.startsWith('portal://')) {
    if (url === 'portal://welcome') return 'Portal Home';
    if (url === 'portal://history') return 'History';
    if (url === 'portal://bookmarks') return 'Bookmarks';
    if (url === 'portal://settings') return 'Settings';
    if (url === 'portal://test-blocked') return 'Embedding Denial Test';
    if (url === 'portal://test-embeddable') return 'Embeddable Site Test';
    return 'Portal';
  }

  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

/**
 * Generates a favicon URL using a high-reliability Google favicon service
 */
export function getFaviconUrl(url: string): string {
  if (!url || url.startsWith('portal://')) {
    return '';
  }

  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch {
    return '';
  }
}

/**
 * Evaluates whether a domain is known to block iframes via CSP or X-Frame-Options
 */
export function checkKnownEmbedRestrictions(url: string): {
  isLikelyBlocked: boolean;
  reason?: string;
  domain?: string;
} {
  if (!url || url.startsWith('portal://')) {
    return { isLikelyBlocked: false };
  }

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();

    // Specific messages for high-profile sites
    if (hostname === 'duckduckgo.com' || hostname.endsWith('.duckduckgo.com')) {
      return {
        isLikelyBlocked: true,
        domain: hostname,
        reason: 'DuckDuckGo specifies "X-Frame-Options: SAMEORIGIN" and CSP frame-ancestors \'self\'. Browsers display "refused to connect" when loaded in an embedded frame.',
      };
    }

    if (hostname === 'discord.com' || hostname.endsWith('.discord.com') || hostname === 'discordapp.com' || hostname === 'discord.gg') {
      return {
        isLikelyBlocked: true,
        domain: hostname,
        reason: 'Discord specifies "X-Frame-Options: DENY" and strict Content Security Policies to protect user sessions and prevent clickjacking. In-page embedding is prohibited by Discord.',
      };
    }

    if (hostname.includes('google.') || hostname.includes('youtube.') || hostname === 'youtu.be') {
      return {
        isLikelyBlocked: true,
        domain: hostname,
        reason: 'Google and YouTube services enforce strict "X-Frame-Options: SAMEORIGIN" headers prohibiting in-page framing of their search and app interfaces.',
      };
    }

    // Check against general list
    for (const blocked of KNOWN_BLOCKED_DOMAINS) {
      if (hostname === blocked || hostname.endsWith(`.${blocked}`)) {
        return {
          isLikelyBlocked: true,
          domain: hostname,
          reason: `The host "${hostname}" enforces strict HTTP security headers (X-Frame-Options or Content-Security-Policy: frame-ancestors) prohibiting in-page embedding.`,
        };
      }
    }

    return { isLikelyBlocked: false, domain: hostname };
  } catch {
    return { isLikelyBlocked: false };
  }
}
