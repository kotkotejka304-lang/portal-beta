import { SearchEngine } from '../types/browser';

const SEARCH_ENGINE_URLS: Record<SearchEngine, string> = {
  duckduckgo: 'https://duckduckgo.com/?q=',
  google: 'https://www.google.com/search?q=',
  bing: 'https://www.bing.com/search?q=',
  ecosia: 'https://www.ecosia.org/search?q=',
  startpage: 'https://www.startpage.com/do/dsearch?query=',
};

// Known websites that explicitly send X-Frame-Options: SAMEORIGIN or CSP frame-ancestors 'none'/'self'
const KNOWN_BLOCKED_DOMAINS = [
  'google.com',
  'www.google.com',
  'youtube.com',
  'www.youtube.com',
  'github.com',
  'twitter.com',
  'x.com',
  'facebook.com',
  'instagram.com',
  'reddit.com',
  'nytimes.com',
  'linkedin.com',
  'amazon.com',
  'netflix.com',
  'apple.com',
  'microsoft.com',
  'docs.google.com',
  'drive.google.com',
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
    embedCompatibility: 'likely' as const,
    embedNote: 'Note: Certain modern Wikipedia domains restrict frame embedding; fallback is provided.',
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
 * Validates, normalizes, and resolves a user input into a navigable URL.
 * Automatically prepends https://, rejects dangerous schemes, or converts queries into a search engine URL.
 */
export function resolveInputToUrl(
  input: string,
  searchEngine: SearchEngine = 'duckduckgo'
): { url: string; error?: string; isInternal: boolean } {
  const trimmed = input.trim();

  if (!trimmed) {
    return { url: 'portal://welcome', isInternal: true };
  }

  // Internal schemes
  if (trimmed.startsWith('portal://')) {
    return { url: trimmed, isInternal: true };
  }

  // Reject dangerous or prohibited URL schemes
  const lower = trimmed.toLowerCase();
  const dangerousSchemes = [
    'javascript:',
    'data:',
    'file:',
    'vbscript:',
    'blob:',
    'about:',
  ];

  for (const scheme of dangerousSchemes) {
    if (lower.startsWith(scheme)) {
      return {
        url: '',
        error: `Security Alert: The "${scheme}" protocol is blocked for security reasons to protect your device and data.`,
        isInternal: false,
      };
    }
  }

  // Check if input is an explicit HTTP/HTTPS URL
  if (lower.startsWith('http://') || lower.startsWith('https://')) {
    try {
      const parsed = new URL(trimmed);
      return { url: parsed.href, isInternal: false };
    } catch {
      return {
        url: '',
        error: 'Invalid URL format. Please check the address and try again.',
        isInternal: false,
      };
    }
  }

  // Check if input looks like a domain name (e.g., "example.com", "sub.domain.org/path", "localhost:3000")
  const domainPattern = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/.*)?$/;
  const localhostPattern = /^localhost(:\d+)?(\/.*)?$/;

  if (domainPattern.test(trimmed) || localhostPattern.test(trimmed)) {
    // Automatically prepend https:// (or http:// for localhost)
    const protocol = localhostPattern.test(trimmed) ? 'http://' : 'https://';
    try {
      const fullUrl = `${protocol}${trimmed}`;
      const parsed = new URL(fullUrl);
      return { url: parsed.href, isInternal: false };
    } catch {
      // Fallback to search if parsing fails
    }
  }

  // Otherwise, treat as a search query
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

    for (const blocked of KNOWN_BLOCKED_DOMAINS) {
      if (hostname === blocked || hostname.endsWith(`.${blocked}`)) {
        return {
          isLikelyBlocked: true,
          domain: hostname,
          reason: `The host "${hostname}" enforces strict HTTP security headers (X-Frame-Options: SAMEORIGIN or Content-Security-Policy: frame-ancestors) prohibiting in-page embedding.`,
        };
      }
    }

    return { isLikelyBlocked: false, domain: hostname };
  } catch {
    return { isLikelyBlocked: false };
  }
}
