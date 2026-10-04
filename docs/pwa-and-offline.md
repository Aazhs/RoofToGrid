# Progressive Web App (PWA) & Offline Architecture

## Overview

RoofToGrid is architected as an installable Progressive Web App (PWA) compliant with modern W3C standards, delivering app-like performance on Android and iOS devices without requiring an app store download.

---

## 1. Web App Manifest (`app/manifest.ts`)
- Configured dynamically via Next.js metadata route:
  - **Name**: RoofToGrid — India's Rooftop Solar Platform
  - **Short Name**: RoofToGrid
  - **Start URL**: `/dashboard`
  - **Display**: `standalone` (removes browser navigation chrome)
  - **Theme Color**: `#0F172A` (Slate 900)
  - **Background Color**: `#FFFFFF`
  - **Icons**: Standard 192x192, 512x512, and maskable application icons.

---

## 2. Service Worker (`public/sw.js`)

### Caching Strategy
- **Static Core Assets & Shell**: Cache-first strategy for app shell assets, fonts, icons, and CSS bundles.
- **Dynamic API Routes**: Network-first strategy with fallback to cached responses for critical screens (e.g. latest sizing report, bill summaries).
- **Offline Fallback Page**: If network is entirely unavailable and asset is not yet cached, serves a branded offline fallback screen advising user to reconnect.

### Lifecycle Management (`ServiceWorkerRegister.tsx`)
- Registers on initial client hydration after browser idle.
- Listens for background updates and smoothly transitions to new service worker builds without jarring UI reloads.

---

## 3. Mobile Ergonomics (`MobileBottomNav.tsx`)
- Sticky bottom navigation bar optimized for 1-thumb mobile navigation:
  - **Dashboard** (`/dashboard`)
  - **Bills** (`/bills`)
  - **Sizing** (`/sizing`)
  - **Quotes** (`/quotes`)
  - **Profile** (`/profile`)
- Automatically hidden on desktop viewports (`hidden md:flex`).
