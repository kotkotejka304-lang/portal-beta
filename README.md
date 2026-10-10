# Portal — Web Browser Web App

**Portal** is a sleek, modern web browser interface built with React, TypeScript, and Tailwind CSS. It is engineered to run inside standard web browsers on desktop and school-issued iPads without requiring external API keys, paid proxies, or unauthorized filter bypasses.

---

## 1. Project Overview & Features

### Core Capabilities
- **Omnibox Navigation**: Accepts HTTP and HTTPS URLs, automatically prepends `https://` when schemes are omitted, and routes keywords/queries to the user's preferred search engine (DuckDuckGo, Google, Bing, Ecosia, Startpage).
- **Security Validation**: Validates all addresses and strictly rejects dangerous or unsafe pseudo-schemes (`javascript:`, `file:`, `data:`, `vbscript:`, etc.).
- **Multi-Tab Engine**: Open, switch, and close unlimited tabs with keyboard shortcuts (`Cmd/Ctrl+T`, `Cmd/Ctrl+W`). Maintains per-tab history stacks, loading spinners, and favicons.
- **Navigation Controls**: Back, Forward, Reload (`Cmd/Ctrl+R`), and Home buttons with reactive disabled states.
- **Bookmarks Manager & Bar**: Star/unstar pages from the address bar, toggleable quick-access bookmarks bar (`Cmd/Ctrl+B`), and full bookmarks manager with search, custom creation, editing, and deletion.
- **Browsing History Drawer**: Automatically logs visited sites, categorized into "Today", "Yesterday", and "Earlier", with real-time search, entry deletion, and "Clear All History" confirmation.
- **Welcome Start Page**: High-impact start screen with customizable search engine picker, curated embed-friendly educational resources (PhET Physics simulations, OpenStreetMap, NASA Astronomy, Project Gutenberg, Wikipedia portal, W3Schools), bookmarks, and recent history.
- **Honest Embed Diagnostics**: Proactively detects when popular platforms (e.g., Google, YouTube, GitHub, Twitter) enforce `X-Frame-Options` or CSP `frame-ancestors` headers, providing an immediate one-click external tab launcher rather than an endless spinner or broken white screen.
- **Settings & Sandbox Config**: Configure default search engine, auto-HTTPS, sandbox directives (`allow-scripts`, `allow-same-origin`, etc.), and an iPad Shell emulation toggle.
- **100% Local Storage**: Persists bookmarks, history, active tabs, and settings in browser `localStorage`. No tracking, no backend database required.

---

## 2. File Structure

```text
├── index.html                      # HTML entry with Plus Jakarta Sans & JetBrains Mono
├── metadata.json                   # Applet metadata configuration
├── package.json                    # Project dependencies and npm scripts
├── tsconfig.json                   # TypeScript compiler configuration
├── vite.config.ts                  # Vite build tooling with React & Tailwind plugins
├── src/
│   ├── main.tsx                    # React application bootstrap
│   ├── App.tsx                     # Main browser shell & state coordination
│   ├── index.css                   # Tailwind CSS layers, theme vars, custom scrollbars
│   ├── types/
│   │   └── browser.ts              # Tab, Bookmark, History, Settings TypeScript interfaces
│   ├── utils/
│   │   ├── url.ts                  # URL sanitation, scheme injection, embed restrictions
│   │   └── storage.ts              # LocalStorage persistence, seed bookmarks, tabs state
│   └── components/
│       ├── TabBar.tsx              # Tab strip with tabs, favicons, loading state & new tab (+)
│       ├── NavigationToolbar.tsx   # Back, forward, reload, home, Omnibox, bookmark star
│       ├── BookmarksBar.tsx        # Horizontal quick-access bookmarks toolbar
│       ├── WelcomePage.tsx         # Start screen with search, shortcuts & recent history
│       ├── WebView.tsx             # Sandboxed iframe viewer & unsupported site diagnostics
│       ├── HistoryDrawer.tsx       # Slide-over browsing history viewer with search & clear
│       ├── BookmarksModal.tsx      # Comprehensive bookmarks manager modal
│       ├── SettingsModal.tsx       # Browser preferences & sandbox permission controls
│       └── SecurityInfoModal.tsx   # Architectural disclosure on iframe security & CSP
└── README.md                       # Documentation, testing checklist & deployment
```

---

## 3. Installation and Running Locally

### Prerequisites
- Node.js (v18.0.0 or later recommended)
- npm or yarn

### Commands
```bash
# 1. Install dependencies
npm install

# 2. Start the local development server (port 3000)
npm run dev

# 3. Build for production
npm run build

# 4. Preview the production build
npm run preview
```

---

## 4. Deployment Instructions (Vercel)

Portal is completely client-side and requires zero server-side environment variables or external database keys.

### Deploying via Vercel CLI
```bash
# Install Vercel CLI globally (if not already installed)
npm install -g vercel

# Deploy from the project root
vercel

# Deploy directly to production
vercel --prod
```

### Deploying via Vercel Web Dashboard (Git Integration)
1. Push this repository to GitHub or GitLab.
2. In the [Vercel Dashboard](https://vercel.com), click **Add New Project**.
3. Select and import the repository.
4. Keep the default build settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Click **Deploy**. Vercel will build and deploy the applet instantly.

---

## 5. Manual Testing Checklist

### Desktop (Google Chrome, Firefox, Safari)
- [x] **Omnibox Address Navigation**:
  - Enter `en.wikipedia.org` without `https://` → verify it prepends `https://` and navigates.
  - Enter a query like `photosynthesis definition` → verify it redirects to DuckDuckGo/Google search.
  - Enter `javascript:alert(1)` or `data:text/html,...` → verify navigation is blocked with a security alert.
- [x] **Multi-Tab Navigation**:
  - Click `+` or press `Cmd/Ctrl+T` → verify a new tab opens to Portal Home.
  - Switch tabs → verify each tab retains its own URL, history stack, and state.
  - Press `Cmd/Ctrl+W` → verify active tab closes and focus shifts to the adjacent tab.
  - Close the last remaining tab → verify it gracefully resets to Portal Home.
- [x] **History Stack & Navigation Buttons**:
  - Navigate to Site A, then Site B → verify "Back" button is enabled.
  - Click "Back" → verify it navigates to Site A and "Forward" button becomes enabled.
  - Click "Reload" (`Cmd/Ctrl+R`) → verify reload spinner animates and page reloads.
- [x] **Bookmarks**:
  - Star an active page from the address bar → verify star turns mint green.
  - Toggle Bookmarks Bar (`Cmd/Ctrl+B`) → verify page is visible in the bar.
  - Open Bookmarks Manager → verify editing and deleting works.
- [x] **Browsing History**:
  - Open History Drawer (`Cmd/Ctrl+H`) → verify visited sites are listed with timestamps.
  - Use search filter → verify instant filtering.
  - Click "Clear All History" and confirm → verify history resets cleanly.
- [x] **Embed Diagnostics & CSP Handling**:
  - Navigate to `https://duckduckgo.com` or `https://discord.com` → verify the Unsupported-Site screen explains that `X-Frame-Options` and CSP prohibit in-page embedding (preventing `refused to connect` browser errors).
  - Click "Open in New Tab (outside Portal)" → verify site opens in native browser tab where restrictions do not apply.
  - Navigate to `portal://test-blocked` → verify the controlled embedding denial test page with simulated HTTP headers.
  - Navigate to `portal://test-embeddable`, `OpenStreetMap`, or `PhET Simulations` → verify interactive site loads smoothly inside the sandboxed iframe.

### iPad Safari & iOS Touch Testing
- [x] **Touch Target Sizes**: All navigation buttons, tabs, close icons, and omnibox controls meet or exceed 44×44px touch ergonomics.
- [x] **No Tap Lag**: `-webkit-tap-highlight-color: transparent` configured, responsive active states.
- [x] **iPad Shell Emulation Mode**: Can be toggled in Settings to simulate iPad tablet dimensions (4:3 aspect ratio).
- [x] **Safe Area & Viewport**: Viewport meta tag configured with `viewport-fit=cover` and disabled pinch-zoom bounce on UI chrome.
- [x] **Touch Scrolling**: Tabs bar and bookmarks bar support horizontal touch swipe without scrollbar clunkiness.

---

## 6. Known Limitations & Roadmap for Version 2

### Known Limitations (Web Standards)
1. **Cross-Origin Iframe Restrictions (Same-Origin Policy)**:
   - A client-side web application cannot inspect the internal DOM or monitor link clicks inside a cross-origin iframe. If a user clicks a link inside an embedded Wikipedia page, the outer address bar cannot detect the internal path change without browser extension or browser engine privileges.
2. **CSP and X-Frame-Options**:
   - Modern websites (e.g. Google, YouTube, Reddit, Facebook, GitHub, banking portals) deliberately send `X-Frame-Options: SAMEORIGIN` or CSP `frame-ancestors 'self'` to prevent clickjacking. A pure web application cannot override these headers without an external proxy (which is prohibited for school network policy reasons). Portal handles this honestly with explicit explanations and an external tab fallback.

### Suggested Improvements for Version 2
1. **PWA Offline Mode & Service Worker**:
   - Cache curated educational pages and offline reference materials via CacheStorage and service workers for environments with intermittent school Wi-Fi.
2. **Reader Mode for Text Articles**:
   - Add a client-side reader mode that parses public article feeds and renders clean typography.
3. **Tab Grouping and Workspaces**:
   - Organize tabs into color-coded school subject folders (e.g., "Physics Lab", "History Essay", "Math Homework").
4. **Custom Start Screen Widgets**:
   - Allow students to customize the start page with quick notes, study timers, and calculator widgets.
