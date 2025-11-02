# Comprehensive Research: Curated Book Library for mReader RSVP Speed-Reading PWA

**Research Date:** November 2025  
**Project:** mReader - RSVP Speed-Reading Progressive Web App  
**Objective:** Investigate offering a curated library of pre-processed books with LLM-generated prosody information

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Introduction](#introduction)
3. [Copyright-Free Book Sources](#copyright-free-book-sources)
4. [Legal and Licensing Framework](#legal-and-licensing-framework)
5. [Technical Infrastructure](#technical-infrastructure)
6. [Transition to Paid/Licensed Content](#transition-to-paidlicensed-content)
7. [Best Practices](#best-practices)
8. [Conclusions and Recommendations](#conclusions-and-recommendations)
9. [References](#references)
10. [Appendices](#appendices)

---

## Executive Summary

This comprehensive research report addresses the feasibility and implementation strategy for offering a curated library of books within mReader, an RSVP speed-reading Progressive Web App (PWA). The research covers public domain book sources, legal considerations, technical architecture, and pathways to paid content.


### Key Findings

1. **Public Domain Sources:** Project Gutenberg, Standard Ebooks, and Internet Archive are the three recommended primary sources, offering over 100,000 free books with different strengths in format quality, selection, and ease of use.

2. **Legal Clarity:** Public domain books in the US (pre-1923 publications) can be freely used, modified, redistributed, and processed with AI/LLM without restriction. However, trademark requirements (stripping "Project Gutenberg" branding for commercial use) and international copyright variations must be considered.

3. **AI Processing:** Using public domain books for LLM-based prosody analysis is legally sound. The processed output (prosody metadata) does not inherit copyright restrictions from source material.

4. **Infrastructure Recommendation:** Use AWS S3 for storage with CloudFront CDN for global delivery. Expected costs for an MVP: ~$40-50/month for moderate traffic (500GB/month), potentially free within AWS Free Tier limits.

5. **Paid Content Path:** Multiple licensing models exist (per-book purchase, subscription, library lending). Major distributors include aggregators like Smashwords and Draft2Digital. Expect 30-70% royalty splits and potential DRM requirements.

### Primary Recommendations

- **Start with Standard Ebooks** (100-200 curated classics) for highest quality formatting
- **Supplement with Project Gutenberg** for breadth (20,000+ titles)
- **Use S3 + CloudFront** for hosting with gzip compression
- **Process public domain books with LLM** for prosody without legal concerns
- **Plan for Readium LCP DRM** when transitioning to paid content (open, user-friendly)
- **Budget $50-100/month initially** for infrastructure, scaling with usage

---

## Introduction

### Background and Context

mReader is an innovative RSVP (Rapid Serial Visual Presentation) speed-reading Progressive Web App that displays words sequentially with prosody-enriched timing. Currently, users can only upload their own books in txt, epub, or pdf formats. To enhance user value and facilitate faster adoption, offering a curated library of pre-processed books with AI-generated prosody information is under consideration.

### Research Objectives

This research addresses five critical question areas:

1. What sources exist for copyright-free books, and which are best for text processing?
2. What legal and licensing restrictions apply to hosting, redistributing, and AI-processing public domain books?
3. What technical infrastructure is optimal for hosting and delivering a book library?
4. How can the platform transition to offering paid/licensed content in the future?
5. What best practices should guide library structure, metadata, and user experience?

### Methodology Overview

Research was conducted through:
- Analysis of major public domain book repositories (Project Gutenberg, Internet Archive, Standard Ebooks, Feedbooks, Wikisource)
- Review of copyright law, public domain status, and Creative Commons licensing
- Investigation of recent legal precedents regarding LLM/AI processing of copyrighted and public domain works
- Technical architecture analysis of ebook distribution platforms (Kindle, Kobo)
- Review of industry standards (ONIX, EPUB metadata)
- Cost analysis of cloud infrastructure (AWS S3, CloudFront)
- Examination of licensing models and DRM technologies

### Scope and Limitations

This research focuses on:
- US-based legal framework (primary market)
- English-language books (initial MVP scope)
- Text-based formats (txt, epub, pdf)
- Indie developer constraints (budget, technical resources)

Future research may be needed for:
- International copyright variations
- Audiobook considerations
- Specialized academic or technical content licensing
- Large-scale enterprise distribution

---

## Copyright-Free Book Sources

### Overview of Public Domain Book Repositories

Public domain books are works whose copyright has expired or never existed, making them freely available for use without permission or payment. Several major repositories provide access to these works.


### 1. Project Gutenberg

**Website:** [www.gutenberg.org](https://www.gutenberg.org)  
**Collection Size:** 70,000+ free ebooks

**Strengths:**
- Largest and most established public domain library
- Simple, reliable plain text and EPUB formats
- Free API access via Gutendex ([gutendex.com](https://gutendex.com))
- Stable URLs and worldwide mirror network

**Weaknesses:**
- Basic formatting (not typographically polished)
- Trademark restrictions require stripping "Project Gutenberg" headers for commercial use

**File Formats:** Plain text, EPUB, HTML, Kindle/MOBI  
**Legal Status:** US public domain; must remove PG branding for commercial use

**Best For:** Large-scale text corpus, maximum breadth

---

### 2. Standard Ebooks

**Website:** [standardebooks.org](https://standardebooks.org)  
**Collection Size:** 700+ curated ebooks

**Strengths:**
- **Highest quality formatting** of any public domain source
- Professional typography and custom covers
- Completely dedicated to public domain (no restrictions)
- Excellent metadata (EPUB 3 standard)

**Weaknesses:**
- Small, highly selective collection
- No API (manual download)

**File Formats:** EPUB 3 (primary)  
**Legal Status:** Completely public domain - NO attribution or restrictions required

**Best For:** Curated "premium" collection, user experience showcase

---

### 3. Internet Archive / Open Library

**Website:** [archive.org](https://archive.org) / [openlibrary.org](https://openlibrary.org)  
**Collection Size:** 2+ million books

**Strengths:**
- Largest collection by far
- Full REST API access (JSON)
- Comprehensive metadata
- Multiple editions available

**Weaknesses:**
- Variable OCR quality
- Must verify true public domain status per book
- Some books only available as controlled lending

**File Formats:** PDF, EPUB, MOBI, plain text, DAISY  
**Legal Status:** Mixed - verify each book

**Best For:** Rare works, bulk metadata, supplementary content

---

### 4. Feedbooks Public Domain

**Website:** [www.feedbooks.com/publicdomain](https://www.feedbooks.com/publicdomain)  
**Collection Size:** 5,000+ curated books

**Strengths:**
- Modern formatting with attractive covers
- Good mobile reading experience
- Multilingual (5 languages)

**Weaknesses:**
- No API access
- Smaller curated selection

**Best For:** Genre-specific collections with good aesthetics

---

### Comparison Matrix

| Source | Size | Quality | API | Legal | MVP Use |
|--------|------|---------|-----|-------|---------|
| **Project Gutenberg** | 70K+ | Medium | Yes | High* | ✅ Primary (breadth) |
| **Standard Ebooks** | 700+ | Excellent | No | Highest | ✅ Primary (quality) |
| **Internet Archive** | 2M+ | Variable | Yes | Medium | ⚠️ Supplementary |
| **Feedbooks** | 5K+ | Good | No | High | ⚠️ Supplementary |

*Requires trademark compliance (remove branding)

### Recommended Initial Collection

**For MVP launch:**

1. **Standard Ebooks** - Complete collection (700 books) for quality showcase
2. **Project Gutenberg** - Top 1,000 most popular via Gutendex
3. **Curated additions** - 200-300 books filling genre gaps

**Total Initial Library:** ~2,000 high-quality books

---

## Legal and Licensing Framework

### US Public Domain Overview

**Works in Public Domain:**
- Published before 1923 in the US
- US Government works (federal employees)
- Copyright expired works
- CC0 dedicated works

### What You CAN Do With Public Domain Books

✅ Copy and distribute without permission  
✅ Modify and create derivative works  
✅ Use commercially (sell, include in paid products)  
✅ Digitize and reformat  
✅ Translate to other languages  
✅ Host in web applications  
✅ **Process with AI/LLM**  
✅ Combine with other works

### Trademark Restrictions

⚠️ **Project Gutenberg:** MUST remove all "Project Gutenberg" branding for commercial use  
✅ **Standard Ebooks:** No restrictions whatsoever  
✅ **Internet Archive:** No trademark restrictions for public domain works

### AI/LLM Processing - Legal Clarity

**For Public Domain Books:**
✅ Completely legal to use in LLM training  
✅ No restrictions on processing or analysis  
✅ Derivative outputs (prosody metadata) have no copyright restrictions  
✅ Can freely distribute processed results  
✅ Can commercialize AI-enhanced versions

**Your Prosody Metadata:**
- Does NOT inherit copyright from source books
- May be copyrightable if contains human creativity
- Can be kept proprietary or released under any license
- No attribution required to source books

**Recent Legal Precedent (2025):**
Recent US court decisions confirmed that using copyrighted books for transformative LLM training constitutes fair use. For public domain works, there are zero restrictions.

### International Copyright Considerations

**Public Domain Varies by Country:**
- **US:** Pre-1923 publications
- **Canada:** Life + 50 years  
- **EU:** Life + 70 years  
- **Australia:** Life + 70 years

**Safe Strategy:** Use pre-1923 works for global compatibility

### License Compliance Checklist

- [ ] Verify each book is public domain in target markets
- [ ] Remove Project Gutenberg branding from Gutenberg-sourced books
- [ ] Document source and verification date for each book
- [ ] Include public domain notice in book metadata
- [ ] Ensure ToS clarifies public domain status

### Legal Risk Assessment

**Very Low Risk (Recommended):**
- Pre-1923 US publications
- US Government works
- CC0 works
- Standard Ebooks collection

**Avoid:**
- Post-1977 books without explicit licensing
- Works with unclear copyright status

---

## Technical Infrastructure

### Architecture Overview

**Recommended Stack:** AWS S3 (Storage) + CloudFront (CDN) + DynamoDB (Metadata)

### Storage: Amazon S3

**Why S3:**
- Industry standard, extremely durable (99.999999999%)
- Scales from zero to petabytes
- Cost-effective for static files
- Seamless CloudFront integration

**S3 Bucket Structure:**
```
mreader-books/
├── public-domain/
│   ├── gutenberg/
│   │   ├── pg1234.epub
│   │   ├── pg1234.json (metadata)
│   │   └── pg1234-cover.jpg
│   ├── standard-ebooks/
│   │   ├── pride-and-prejudice/
│   │   │   ├── book.epub
│   │   │   ├── metadata.json
│   │   │   ├── cover.jpg
│   │   │   └── prosody.json
└── catalog/
    ├── books-catalog.json
    └── authors.json
```

**Alternative:** Cloudflare R2 (S3-compatible, zero egress fees)

### CDN: Amazon CloudFront

**Why CloudFront:**
- 450+ global edge locations
- Free tier: 1TB/month bandwidth, 10M requests
- Automatic compression (gzip, brotli)
- Low latency worldwide

**Caching Strategy:**

| Content | Cache TTL | Rationale |
|---------|-----------|-----------|
| EPUB files | 1 year | Immutable (versioned) |
| Cover images | 1 year | Rarely change |
| Prosody data | 1 month | May be refined |
| Catalog | 1 hour | Updated frequently |

### File Formats & Compression

**Primary Format:** EPUB
- Industry standard
- Well-structured (ZIP + XML/HTML)
- Perfect for prosody metadata injection
- Reflowable, device-adaptive

**Compression:**
- EPUBs already internally compressed (minimal benefit from additional compression)
- TXT files: gzip (70-80% reduction)
- JSON metadata: gzip (84% reduction)

### Metadata Database

**Recommended: DynamoDB (MVP)**

**Pros:**
- Serverless, no management
- Scales automatically
- Pay per request
- Generous free tier

**Schema Example:**
```javascript
Table: Books
Partition Key: bookId

{
  bookId: "pg1234",
  title: "Pride and Prejudice",
  author: "Jane Austen",
  publicationYear: 1813,
  source: "project-gutenberg",
  formats: {
    epub: "https://cdn.mreader.app/books/pg1234.epub",
    prosody: "https://cdn.mreader.app/prosody/pg1234.json"
  },
  coverImage: "https://cdn.mreader.app/covers/pg1234.jpg",
  wordCount: 122189,
  genres: ["Classic", "Romance"],
  language: "en",
  publicDomain: true
}
```

**Alternative:** PostgreSQL (when complex queries needed)

### Search & Discovery

**For MVP:** Client-side search
- Download catalog.json (~2-5MB gzipped)
- Filter/search in Vue app
- Fast, no backend cost
- Good for <10,000 books

**For Growth:** Algolia or AWS OpenSearch
- Full-text search
- Typo tolerance
- Faceted filtering

### Authentication & User Data

**Recommended:** Supabase Auth (or Firebase)
- Social login (Google, GitHub)
- Email/password
- JWT-based
- Free tier: 50,000 users

**User Data Storage:**
- Reading progress: IndexedDB (client-side)
- Sync: Supabase Realtime or Firebase
- Bookmarks/highlights: Store in Supabase/Firebase with userId

### Cost Estimation

**Monthly Costs (MVP with moderate traffic):**

```
Scenario: 2,000 books, 20GB storage, 500GB/month transfer, 100K requests

S3 Storage: 20GB × $0.023 = $0.46
S3 Requests: 100K × $0.0004/1K = $0.04
CloudFront Transfer: 500GB × $0.085 = $42.50
CloudFront Requests: 100K × $0.0075/10K = $0.08
DynamoDB: Pay-per-request ~$1-5
Supabase: Free tier

Total: ~$44/month
```

**With AWS Free Tier:** Potentially $0-5/month for first year

**Cost Optimization Tips:**
- Use compression aggressively
- Implement aggressive caching
- Monitor and set spending alerts
- Consider CloudFlare R2 for zero egress fees if >1TB/month

### Security Best Practices

**Authentication:**
- Use OAuth 2.0 / OpenID Connect
- Implement MFA for sensitive accounts
- Short-lived JWT tokens with refresh tokens
- HTTPS only

**Storage:**
- Encrypt sensitive data at rest
- Use platform-native secure storage (iOS Keychain, Android Keystore)
- Implement proper access controls
- Regular security audits

### Backup & Disaster Recovery

- Enable S3 versioning
- Cross-region replication for critical data
- Regular metadata backups to separate location
- Document recovery procedures

---

## Transition to Paid/Licensed Content

### Ebook Licensing Models

When ready to offer copyrighted/paid content, several licensing models are available:

#### 1. Per-Book Purchase (Traditional Ownership)

**How it works:** Users purchase individual ebooks, similar to physical books

**Pricing:** Typically $2.99-$14.99 per book  
**Royalties:** 35-70% to publisher/author (platform takes 30-65%)  
**User Rights:** Permanent access (with DRM limitations)

**Pros:**
- Familiar to users
- Higher margins per sale
- Builds user library value

**Cons:**
- Higher barrier to entry
- More complex payment processing
- User hesitation for unknown titles

#### 2. Subscription Model

**How it works:** Monthly/annual fee for unlimited access to catalog

**Pricing:** $9.99-$14.99/month typical  
**Revenue Share:** Usually pay-per-page-read to publishers  
**Examples:** Kindle Unlimited, Scribd

**Pros:**
- Predictable recurring revenue
- Encourages discovery
- Lower user commitment

**Cons:**
- Complex publisher negotiations
- Revenue uncertainty for publishers
- Catalog management challenges

#### 3. Library Lending Model

**How it works:** Partner with libraries for controlled lending

**Models:**
- One Copy/One User (OC/OU)
- Metered Access (limited checkouts or time)
- Cost Per Circ (pay-per-loan)
- Subscription License (time-limited catalog access)

**Best For:** Educational/academic market

#### 4. Hybrid Model (Recommended for mReader)

**Phase 1:** Public domain free library  
**Phase 2:** Add paid classics ($0.99-$2.99) with enhanced prosody  
**Phase 3:** Subscription tier ($4.99/month) for curated content  
**Phase 4:** Premium titles ($9.99-$14.99) per-book purchase

### Major Ebook Distributors & Aggregators

#### Direct Platforms

**Amazon KDP (Kindle Direct Publishing)**
- Royalties: 70% ($2.99-$9.99), 35% outside range
- Delivery fee: $0.15/MB
- Exclusive: KDP Select for 90 days (required for Kindle Unlimited)

**Apple Books**
- Royalties: 70%
- No delivery fees
- Global distribution

**Google Play Books**
- Royalties: 52-70%
- Global reach
- Good for Android users

#### Aggregators (Distribute to Multiple Platforms)

**Smashwords / Draft2Digital**
- Distribute to 20+ retailers
- Royalties: 60-85% (after platform cut)
- Setup: Free
- Best for: Wide distribution with less admin

**PublishDrive**
- AI-powered distribution
- 400+ stores/libraries globally
- Royalties: 90% of net
- Monthly fee: $99-$299

**StreetLib**
- European focus
- 60+ countries
- Good for international expansion

### Licensing Fees & Royalty Structure

**Typical Economics:**

```
Book selling for $9.99:
├── Platform fee (30%): $3.00
├── Publisher/Distributor (10-30%): $1.00-$3.00
└── Author/Rights holder: $4.00-$6.99
```

For mReader as a platform:
- Take 25-30% platform fee
- Pass 70-75% to rights holders
- Competitive with major platforms

### DRM (Digital Rights Management)

#### DRM Options

**1. Adobe DRM (ADEPT)**
- Industry standard
- Library and institution compatible
- Device limits: typically 6 devices
- **Cost:** $3,000-$10,000 setup + per-book fees

**2. Amazon Kindle DRM**
- Only if selling through Amazon
- Ecosystem lock-in
- **Cost:** Included in KDP

**3. Readium LCP (Lightweight Content Protection)** ⭐ **Recommended**
- Open-source DRM
- User-friendly, privacy-respecting
- Interoperable across readers
- **Cost:** Free (open-source), or $500-$2,000 for hosted service

**4. Social DRM (Watermarking)**
- No technical restrictions
- Invisible watermarks track distribution
- Best user experience
- **Cost:** $100-$500/month for service

**5. No DRM**
- Best user experience
- Some indie publishers prefer this
- Relies on honor system + legal remedies

**Recommendation for mReader:**
- Start DRM-free for public domain
- Use Readium LCP when adding paid content (balance of protection and UX)
- Offer DRM-free option for participating publishers (increasingly popular)

### Content Licensing Process

**Steps to add paid content:**

1. **Identify Content Partners**
   - Small/indie publishers willing to experiment
   - Self-published authors
   - Public domain enhanced editions

2. **Negotiate Terms**
   - Revenue split (70/30 recommended)
   - Territory rights
   - Exclusivity (avoid if possible)
   - DRM requirements

3. **Legal Documentation**
   - Standard licensing agreement template
   - Copyright verification
   - Indemnification clauses

4. **Technical Integration**
   - Content ingestion pipeline
   - DRM wrapping (if applicable)
   - Metadata management
   - Payment processing (Stripe Connect recommended)

5. **Revenue Distribution**
   - Monthly or quarterly payouts
   - Automated reporting
   - Tax documentation (1099, international)

---

## Best Practices

### Metadata Standards

#### ONIX (Online Information Exchange)

**Purpose:** Industry standard for book metadata exchange

**Current Version:** ONIX 3.0 (mandatory in US/Canada)

**Key Fields:**
- Title, subtitle, contributors (author, editor, translator)
- ISBN, formats available
- Publication date, publisher
- Genre/subject codes (BISAC)
- Description, reviews
- Pricing, territories
- **Accessibility metadata** (increasingly important for compliance)

**Best Practices:**
- Use ONIX 3.0 exclusively
- Each format (EPUB, PDF, etc.) gets unique ISBN and ONIX record
- Include comprehensive accessibility metadata
- Update regularly as features finalized

#### EPUB Metadata

**Embedded in OPF (Open Packaging Format):**

```xml
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
  <dc:title>Pride and Prejudice</dc:title>
  <dc:creator>Jane Austen</dc:creator>
  <dc:identifier>pg1234</dc:identifier>
  <dc:language>en</dc:language>
  <dc:subject>Classic Fiction</dc:subject>
  <dc:date>1813</dc:date>
  
  <!-- Prosody metadata (custom) -->
  <meta property="mreader:prosody" content="v1.0" />
  <meta property="mreader:prosody-url" content="https://cdn.mreader.app/prosody/pg1234.json" />
  
  <!-- Accessibility -->
  <meta property="schema:accessMode">textual</meta>
  <meta property="schema:accessibilityFeature">structuralNavigation</meta>
</metadata>
```

**Best Practices:**
- Complete all Dublin Core fields
- Add accessibility metadata (Schema.org properties)
- Include custom properties for prosody data
- Validate with EPUBCheck

### Cover Image Management

**Specifications:**

| Purpose | Dimensions | Format | Max Size |
|---------|-----------|--------|----------|
| Thumbnail | 300×450px | JPG | 100KB |
| Display | 800×1200px | JPG/WebP | 500KB |
| High-Res | 1600×2400px | JPG | 2MB |
| Marketing | 2560×4096px | JPG/PNG | 5MB |

**Storage Strategy:**
- Store original high-res on S3
- Generate multiple sizes via Lambda or Imgix
- Serve WebP with JPG fallback via CloudFront
- Embed lower-res version in EPUB

**Metadata:**
- Store cover image URL in book metadata
- Include alt text for accessibility
- Match cover text exactly to title/author metadata

### Library Organization & Discovery

#### Essential Features (MVP)

**Browse:**
- By genre/category
- By author (A-Z)
- Recently added
- Most popular
- Editor's picks

**Search:**
- Title, author, keyword
- Fuzzy matching
- Search-as-you-type
- Filters: genre, year, length

**Book Detail Page:**
- Cover image
- Title, author, publication year
- Description/synopsis
- Word count, estimated reading time (at various WPMs)
- Genre tags
- Public domain notice
- Download formats
- "Start Reading" CTA

#### Advanced Features (Future)

**Personalization:**
- Reading history
- Recommendations based on reading patterns
- Custom collections/shelves
- Reading goals and progress

**Social:**
- Reading challenges
- Share progress/quotes
- Book clubs
- Reviews and ratings (for community engagement)

**Discovery Algorithms:**
- "Readers who liked X also enjoyed Y"
- Genre-based suggestions
- Reading level matching
- Prosody difficulty matching (unique to mReader!)

### User Experience Best Practices

#### Progressive Enhancement

**Core Experience (Works for Everyone):**
- Browse and search books
- Read RSVP mode
- Basic WPM control

**Enhanced (PWA Features):**
- Offline reading
- Install to home screen
- Background sync of reading progress

**Premium (Logged-In Users):**
- Cloud sync across devices
- Reading history
- Custom collections
- Advanced prosody controls

#### Performance Optimization

**Initial Load:**
- Critical CSS inline
- Lazy load book catalog
- Prefetch popular books
- Service worker for offline

**Reading Experience:**
- Preload next chapter
- Buffer prosody data
- Smooth RSVP transitions (60fps)
- Efficient memory management for large books

#### Accessibility

**WCAG 2.1 AA Compliance:**
- Keyboard navigation
- Screen reader support
- High contrast mode
- Adjustable font sizes
- Prosody visual indicators for deaf users
- Text alternatives for all images

### Handling Different Editions & Translations

**Problem:** Same work may have multiple editions/translations

**Solution: Work-Edition Model**

```javascript
Work: {
  workId: "pride-prejudice",
  title: "Pride and Prejudice",
  author: "Jane Austen",
  originalYear: 1813,
  editions: [
    {
      editionId: "pg1234",
      source: "Project Gutenberg",
      editor: null,
      year: 1813,
      language: "en"
    },
    {
      editionId: "se-pride-prejudice",
      source: "Standard Ebooks",
      editor: "Standard Ebooks",
      year: 2020,
      language: "en",
      quality: "enhanced"
    }
  ],
  translations: [
    {
      editionId: "pg5678-fr",
      language: "fr",
      translator: "V. Leconte",
      year: 1822
    }
  ]
}
```

**User Experience:**
- Show all editions on work page
- Highlight "recommended edition" (Standard Ebooks if available)
- Allow users to switch editions
- Preserve reading progress across editions (percentage-based)

---

## Conclusions and Recommendations

### Summary of Key Insights

1. **Public Domain is a Rich Resource:** Over 70,000 books available from Project Gutenberg alone, with excellent quality options from Standard Ebooks.

2. **Legal Framework is Clear:** Public domain works (pre-1923 in US) can be freely used, modified, and processed with AI. Only trademark compliance (removing Project Gutenberg branding) is required for commercial use.

3. **AI Processing is Legal and Valuable:** LLM-generated prosody metadata does not inherit copyright restrictions and can be your proprietary value-add.

4. **Infrastructure is Affordable:** AWS S3 + CloudFront provides enterprise-grade infrastructure for $40-50/month at moderate scale, potentially free within AWS Free Tier.

5. **Paid Content Path Exists:** Multiple proven licensing models and aggregators available when ready to expand beyond public domain.

### Direct Answers to Research Questions

**1. Best Sources for Copyright-Free Books:**

**Primary Recommendation:**
- **Standard Ebooks** (700 books): Highest quality, best formatting, completely unrestricted
- **Project Gutenberg** (70,000 books): Maximum breadth, good API access (Gutendex)

**Supplementary:**
- Internet Archive for rare works
- Feedbooks for genre-specific additions

**File Formats:** EPUB (primary), with TXT as fallback

**2. Legal/Licensing Framework:**

**What You Can Do:**
- ✅ Host and redistribute public domain books freely
- ✅ Process with AI/LLM without restrictions
- ✅ Serve processed versions commercially
- ✅ No attribution required (though appreciated)

**Requirements:**
- ⚠️ Remove Project Gutenberg branding for commercial use
- ✅ Standard Ebooks has NO restrictions
- ✅ Document source for transparency

**AI Processing:**
- ✅ Completely legal for public domain books
- ✅ Prosody metadata is your proprietary output
- ✅ No copyright inherited from source books

**International:**
- Pre-1923 works safe globally
- Consider geo-restrictions for post-1923 if needed

**3. Technical Infrastructure:**

**Recommended Architecture:**
```
Storage: AWS S3 ($0.50/month for 20GB)
CDN: CloudFront ($40/month for 500GB transfer)
Database: DynamoDB (free tier sufficient for MVP)
Auth: Supabase (free tier: 50K users)
Search: Client-side initially, Algolia later

Total: ~$40-50/month, potentially free with AWS Free Tier
```

**Alternatives:**
- Cloudflare R2 for zero egress fees (if >1TB/month)
- PostgreSQL if complex queries needed
- Firebase for simpler stack

**4. Transition to Paid/Licensed Content:**

**Licensing Models:**
- Per-book purchase ($2.99-$14.99)
- Subscription ($9.99/month unlimited)
- Hybrid (recommended): Free public domain + paid premium

**Distributors:**
- **Aggregators:** Smashwords, Draft2Digital (60-85% royalty to creator)
- **Direct:** Amazon KDP, Apple Books, Google Play (70% royalty typically)

**Royalty Structure:**
- mReader takes 25-30%
- Pass 70-75% to rights holders

**DRM:**
- **Recommended:** Readium LCP (open, user-friendly, $500-$2K)
- **Alternative:** Social DRM / watermarking (best UX)
- Start DRM-free for public domain

**5. Best Practices:**

**Metadata:**
- Use ONIX 3.0 for distribution
- Embed complete metadata in EPUB OPF
- Include accessibility information
- Add custom prosody metadata

**Library Structure:**
- Work-Edition model for multiple versions
- Genre-based browsing
- Author pages
- Search with fuzzy matching

**Discovery:**
- Editor's picks
- Recently added
- Most popular
- Genre recommendations
- Eventually: personalized based on reading patterns

### Actionable Implementation Roadmap

#### Phase 1: MVP (Months 1-2)

**Goals:** Launch with curated public domain library

**Tasks:**
1. Download Standard Ebooks complete collection (700 books)
2. Download Project Gutenberg top 1,000 via Gutendex API
3. Process 50-100 high-priority books with LLM for prosody
4. Set up S3 bucket + CloudFront distribution
5. Create DynamoDB table for book metadata
6. Build catalog.json for client-side search
7. Implement library browsing UI in Vue
8. Add book detail pages
9. Integrate with existing RSVP reader

**Budget:** $0-50/month (likely free with AWS Free Tier)

**Success Metrics:**
- 1,500+ books available
- 50+ with prosody data
- <2s page load time
- Works offline

#### Phase 2: Enhanced Library (Months 3-4)

**Goals:** Improve discovery and processing coverage

**Tasks:**
1. Process additional 200-400 books for prosody
2. Add Algolia search for better discovery
3. Implement genre filtering
4. Create author pages
5. Add "Editor's Picks" curated lists
6. Build recommendation algorithm (simple: genre-based)
7. Add reading time estimates
8. Improve cover image quality (standardize sizes)

**Budget:** $50-100/month (Algolia + increased bandwidth)

**Success Metrics:**
- 500+ books with prosody
- Search response <100ms
- 3+ discovery pathways (genre, author, search)

#### Phase 3: User Accounts & Sync (Months 5-6)

**Goals:** Add user features and engagement

**Tasks:**
1. Integrate Supabase Auth
2. Implement reading progress sync
3. Add bookmarks and highlights
4. Create user library/collections
5. Build reading history
6. Add reading goals feature
7. Implement social sharing

**Budget:** $50-150/month (still mostly free tier)

**Success Metrics:**
- 20%+ user account creation rate
- 60%+ cross-device sync usage
- 40%+ users create custom collections

#### Phase 4: Paid Content (Months 7-12)

**Goals:** Introduce revenue stream

**Tasks:**
1. Implement Readium LCP DRM
2. Integrate Stripe Connect for payments
3. Partner with 10-20 indie publishers/authors
4. Add per-book purchase flow
5. Create "premium" section
6. Build revenue reporting dashboard
7. Implement payout automation
8. Consider subscription tier ($4.99/month)

**Budget:** $200-500/month (DRM service, increased bandwidth, payment processing)

**Success Metrics:**
- 100+ paid titles available
- 2-5% conversion rate on paid titles
- $500-$2,000 MRR from book sales

### Technical Recommendations Summary

**Storage & CDN:**
- ✅ AWS S3 + CloudFront (proven, scalable)
- ⚠️ Consider Cloudflare R2 if bandwidth exceeds 1TB/month

**File Format:**
- ✅ EPUB primary format
- ✅ Add prosody metadata to EPUB OPF
- ✅ Generate multiple cover image sizes

**Database:**
- ✅ DynamoDB for MVP (serverless, free tier)
- ⚠️ Migrate to PostgreSQL when complex queries needed

**Search:**
- ✅ Client-side (catalog.json) for MVP
- ✅ Algolia when library exceeds 5,000 books

**Authentication:**
- ✅ Supabase (or Firebase) for simplicity
- ✅ OAuth 2.0 / Social login

**DRM (Future):**
- ✅ Readium LCP when adding paid content
- ✅ Consider DRM-free option

### Budget Summary

**MVP (First Year):**
- Infrastructure: $0-50/month (AWS Free Tier)
- LLM Processing: $100-300 one-time (OpenAI API for prosody)
- Total Year 1: $500-$1,000

**Growth (Year 2):**
- Infrastructure: $100-200/month (beyond free tier)
- Search (Algolia): $50-100/month
- DRM Service: $500-2,000 one-time + $50/month
- Total Year 2: $3,000-$6,000

**Revenue Potential (Year 2):**
- Subscription ($4.99/month): 200 users = $1,000/month
- Book sales (30% cut): 500 sales/month @ $5 = $750/month
- Total potential: $21,000/year

**Profitability:** Achievable by month 18-24 with modest growth

### Risk Mitigation

**Legal Risks:**
- ✅ Stick to pre-1923 public domain for MVP (zero risk)
- ✅ Remove Project Gutenberg branding
- ✅ Document all source verification
- ✅ Consult IP lawyer before adding paid content

**Technical Risks:**
- ✅ Start with proven technologies (AWS, Vue)
- ✅ Implement aggressive caching to control costs
- ✅ Set up spending alerts
- ✅ Have backup plan (Cloudflare R2) if AWS costs spike

**Business Risks:**
- ✅ Validate user interest with public domain first
- ✅ Build audience before investing in paid content licensing
- ✅ Start with small indie publishers (lower risk)
- ✅ Keep fixed costs low (serverless architecture)

### Final Recommendations

**For Immediate Implementation:**

1. **Download and process Standard Ebooks collection** (700 books, highest quality, no restrictions)

2. **Set up AWS S3 + CloudFront** with proper caching configuration

3. **Process 50-100 high-priority classics with LLM** for prosody (Pride & Prejudice, Great Gatsby, etc.)

4. **Build simple catalog browsing** with client-side search initially

5. **Ensure proper metadata** (embed prosody info in EPUB OPF files)

6. **Launch MVP with 1,500-2,000 curated books**, 50+ with prosody

**For Next 6 Months:**

7. **Expand prosody coverage** to 500+ books (based on user engagement data)

8. **Add user accounts and sync** (Supabase) for cross-device experience

9. **Improve discovery** (Algolia search, recommendations)

10. **Test market interest** in premium features before committing to paid content

**For Year 2:**

11. **Partner with indie publishers** for exclusive enhanced editions

12. **Implement Readium LCP DRM** for paid content

13. **Launch subscription tier** ($4.99/month) with exclusive prosody-enhanced books

14. **Build community features** (book clubs, reading challenges) to increase engagement and retention

---

## References

### Copyright & Legal

1. Project Gutenberg License & Permission: https://www.gutenberg.org/policy/permission.html
2. Standard Ebooks and the Public Domain: https://standardebooks.org/about/standard-ebooks-and-the-public-domain
3. Creative Commons Public Domain Tools: https://creativecommons.org/public-domain/
4. Copyright Duration Rules (US): https://www.copyright.gov/circs/circ15a.pdf
5. Fair Use and AI/LLM Training: Recent US court decisions (2025)
6. Open Licenses | resources.data.gov: https://resources.data.gov/open-licenses/

### Book Sources

7. Project Gutenberg: https://www.gutenberg.org
8. Gutendex API: https://gutendex.com
9. Standard Ebooks: https://standardebooks.org
10. Internet Archive: https://archive.org
11. Open Library API: https://openlibrary.org/developers/api
12. Feedbooks Public Domain: https://www.feedbooks.com/publicdomain

### Technical Infrastructure

13. AWS S3 Pricing: https://aws.amazon.com/s3/pricing/
14. AWS CloudFront Pricing: https://aws.amazon.com/cloudfront/pricing/
15. AWS DynamoDB: https://aws.amazon.com/dynamodb/
16. Cloudflare R2: https://www.cloudflare.com/products/r2/
17. Supabase: https://supabase.com
18. Algolia: https://www.algolia.com

### Ebook Standards & Metadata

19. ONIX for Books - EDItEUR: https://www.editeur.org/83/Overview/
20. BISG Metadata Best Practices: https://www.bisg.org/metadata-best-practices
21. EPUB Accessibility 1.1 Specification: https://www.w3.org/Submission/epub-a11y/
22. Display Techniques for ONIX Accessibility Metadata: https://w3c.github.io/publ-a11y/a11y-meta-display-guide/

### Licensing & Distribution

23. Ebook Distribution Guide - Reedsy: https://blog.reedsy.com/guide/ebook/ebook-distribution/
24. Amazon KDP: https://kdp.amazon.com
25. Smashwords: https://www.smashwords.com
26. Draft2Digital: https://www.draft2digital.com
27. PublishDrive: https://www.publishdrive.com

### DRM Technologies

28. Readium LCP: https://www.edrlab.org/readium-lcp/
29. Adobe DRM (ADEPT): https://www.adobe.com/solutions/ebook/digital-editions.html
30. EditionGuard (Social DRM): https://www.editionguard.com

### Reading App Best Practices

31. Library Journal - Discovery Tech: https://www.libraryjournal.com/story/highly-recommended-latest-advances-in-discovery-at-libraries
32. WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
33. PWA Best Practices: https://web.dev/progressive-web-apps/

---

## Appendices

### Appendix A: Sample Gutendex API Queries

**Get top 100 most popular books:**
```
GET https://gutendex.com/books?sort=popular&page=1
```

**Search by author:**
```
GET https://gutendex.com/books?search=Jane%20Austen
```

**Filter by language:**
```
GET https://gutendex.com/books?languages=en
```

**Get specific book:**
```
GET https://gutendex.com/books/1342
```

**Response format:**
```json
{
  "count": 70000,
  "results": [
    {
      "id": 1342,
      "title": "Pride and Prejudice",
      "authors": [
        {
          "name": "Austen, Jane",
          "birth_year": 1775,
          "death_year": 1817
        }
      ],
      "subjects": ["England -- Fiction", "Romance -- Fiction"],
      "languages": ["en"],
      "download_count": 50000,
      "formats": {
        "text/html": "https://www.gutenberg.org/files/1342/1342-h/1342-h.htm",
        "application/epub+zip": "https://www.gutenberg.org/ebooks/1342.epub.images",
        "text/plain": "https://www.gutenberg.org/files/1342/1342-0.txt"
      }
    }
  ]
}
```

### Appendix B: Sample Prosody Metadata Format

**Embedded in EPUB OPF:**
```xml
<metadata>
  <meta property="mreader:prosody-version" content="1.0"/>
  <meta property="mreader:prosody-model" content="gpt-4"/>
  <meta property="mreader:prosody-date" content="2025-11-02"/>
</metadata>
```

**External JSON file (prosody.json):**
```json
{
  "bookId": "pg1342",
  "version": "1.0",
  "model": "gpt-4",
  "generated": "2025-11-02T00:00:00Z",
  "chapters": [
    {
      "chapterId": 1,
      "title": "Chapter 1",
      "words": [
        {
          "word": "It",
          "pivotIndex": 0,
          "baseDelayMs": 240,
          "prosody": {
            "pause": 1.0,
            "emphasis": "low",
            "tone": "neutral"
          }
        },
        {
          "word": "is",
          "pivotIndex": 1,
          "baseDelayMs": 240,
          "prosody": {
            "pause": 1.0,
            "emphasis": "low",
            "tone": "neutral"
          }
        },
        {
          "word": "truth",
          "pivotIndex": 2,
          "baseDelayMs": 300,
          "prosody": {
            "pause": 1.2,
            "emphasis": "medium",
            "tone": "rising"
          }
        }
      ]
    }
  ],
  "statistics": {
    "totalWords": 122189,
    "averagePauseMultiplier": 1.15,
    "emphasisDistribution": {
      "low": 0.70,
      "medium": 0.25,
      "high": 0.05
    }
  }
}
```

### Appendix C: AWS S3 Bucket Policy Example

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipalReadOnly",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::mreader-books/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::ACCOUNT-ID:distribution/DISTRIBUTION-ID"
        }
      }
    }
  ]
}
```

### Appendix D: Cost Optimization Checklist

**Pre-Launch:**
- [ ] Enable S3 Intelligent-Tiering
- [ ] Set up CloudFront compression
- [ ] Configure aggressive caching (1-year TTL for immutable content)
- [ ] Use versioned filenames to avoid cache invalidation costs
- [ ] Implement lazy loading of book covers
- [ ] Compress JSON metadata files
- [ ] Set up AWS Cost Explorer alerts

**Post-Launch:**
- [ ] Monitor S3 request patterns (optimize hot/cold data)
- [ ] Review CloudFront edge location usage (adjust price class if needed)
- [ ] Analyze DynamoDB usage (switch to on-demand if spiky)
- [ ] Identify and remove unused/duplicate files
- [ ] Consider Cloudflare R2 if transfer exceeds 1TB/month
- [ ] Implement CDN cache warming for popular books
- [ ] Review and optimize database queries

**Ongoing:**
- [ ] Monthly cost review
- [ ] Quarterly architecture optimization
- [ ] Annual pricing comparison (AWS vs. alternatives)

### Appendix E: Reading App Feature Comparison

| Feature | Kindle | Kobo | Libby | mReader (Proposed) |
|---------|--------|------|-------|-------------------|
| Public domain library | ❌ | ❌ | ✅ (via libraries) | ✅ |
| RSVP reading | ❌ | ❌ | ❌ | ✅ |
| Prosody-enhanced | ❌ | ❌ | ❌ | ✅ |
| Offline reading | ✅ | ✅ | ✅ | ✅ |
| Cross-device sync | ✅ | ⚠️ | ✅ | ✅ (planned) |
| Custom library | ✅ | ✅ | ❌ | ✅ (sideload) |
| Speed reading focus | ❌ | ❌ | ❌ | ✅ |
| Free books | Some | Some | ✅ | ✅ |
| Paid books | ✅ | ✅ | ✅ (library) | Phase 2 |
| Open formats | ❌ | ✅ (EPUB) | ✅ | ✅ |

**mReader's Unique Value Proposition:**
- ✅ RSVP speed-reading with prosody
- ✅ Large curated public domain library
- ✅ LLM-enhanced reading experience
- ✅ Offline-first PWA architecture
- ✅ No ecosystem lock-in

---

## Document Metadata

**Version:** 1.0  
**Last Updated:** November 2, 2025  
**Author:** Research conducted for mReader project  
**Status:** Complete - Ready for Implementation  
**Next Review:** Q2 2026 (or upon completion of Phase 1 MVP)

---

**End of Research Document**

