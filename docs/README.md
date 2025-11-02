# mReader Documentation

This folder contains research, design documents, and technical specifications for the mReader project.

## Documents

### [research.md](./research.md)
Initial research on cognitive-paced reading and prosody concepts. Covers:
- Core concepts of implicit prosody in reading
- Cognitive load theory for RSVP
- Research terminology and search phrases
- Baseline concepts and roadmap

### [llm-prosody-investigation.md](./llm-prosody-investigation.md)
**Comprehensive research spike on LLM-based prosody prediction for RSVP readers.**

This 1,750+ line technical research document provides:

#### Executive Summary
- Evaluation of 7+ prosody prediction approaches
- Cost analysis: $0.001-0.15 per 100K-word book
- Processing time: 4 seconds (rule-based) to 7 minutes (ML)
- **Recommendation**: Start with rule-based system, upgrade to ML for premium features

#### Key Sections

1. **Models & Tools** (Detailed comparison of):
   - ProsodyLM: Word-level prosody tokens (⭐⭐⭐⭐⭐)
   - MIT-Prosody-LLM: Practical implementation (⭐⭐⭐⭐)
   - Coqui TTS, Piper TTS, ESPnet: Duration predictors (⭐⭐⭐)
   - Rule-based baseline: Fast & effective (⭐⭐⭐)

2. **Cloud Architecture**:
   - Serverless (AWS Lambda + SageMaker)
   - Containerized (Google Cloud Run)
   - **Hybrid (Recommended)**: Multi-tier processing with caching

3. **API Design**:
   - RESTful JSON API specification
   - Word-level prosody data format
   - Compression strategies (70% size reduction)
   - Caching with IndexedDB

4. **Implementation Guide**:
   - Working Python code samples
   - Lambda/Cloud Function handlers
   - Phased rollout plan (3 phases, 6 months)

5. **Cost Analysis**:
   - Per-book processing costs
   - Monthly operating costs (3 scenarios)
   - Storage and CDN costs
   - Optimization strategies

#### Quick Start

**For Developers:**
See Section 5: [Proposed Implementation](#proposed-implementation) for working code samples.

**For Product Managers:**
See Section 4: [Technical Recommendations](#technical-recommendations) for phased rollout plan.

**For Researchers:**
See Section 3: [Research Findings](#research-findings) for model comparisons.

#### Success Criteria (from original spike)

✅ Documented 2-3 viable technical approaches with pros/cons  
✅ Identified existing models/tools for duration prediction  
✅ Designed API contract (input/output format)  
✅ Estimated processing time & cost for ~100K-word novel  
✅ Created proof-of-concept code samples

**Status:** Complete and ready for implementation

### [curated-library-research.md](./curated-library-research.md)
**Comprehensive research spike on offering a curated library of books.**

This 1,424-line research document provides:

#### Executive Summary
- Evaluation of public domain book sources (Project Gutenberg, Standard Ebooks, Internet Archive)
- Legal framework for copyright-free books and AI/LLM processing
- Technical infrastructure design (AWS S3 + CloudFront)
- Cost analysis: $40-50/month for MVP (potentially free with AWS Free Tier)
- **Recommendation**: Start with Standard Ebooks + Project Gutenberg, process with LLM for prosody

#### Key Sections

1. **Copyright-Free Book Sources**:
   - Project Gutenberg: 70,000+ books (⭐⭐⭐⭐)
   - Standard Ebooks: 700 high-quality classics (⭐⭐⭐⭐⭐)
   - Internet Archive: 20M+ items (⭐⭐⭐)
   - Feedbooks, Wikisource alternatives

2. **Legal and Licensing Framework**:
   - US public domain law (pre-1923 works)
   - Trademark compliance requirements
   - AI/LLM processing legality
   - International copyright considerations

3. **Technical Infrastructure**:
   - AWS S3 for storage, CloudFront for CDN
   - Cost breakdown and optimization strategies
   - File formats and compression (EPUB, TXT, JSON)
   - Metadata management and authentication

4. **Transition to Paid Content**:
   - Licensing models (purchase, subscription, lending)
   - Major distributors (Smashwords, Draft2Digital)
   - DRM options (Readium LCP recommended)
   - Royalty structures (30-70% splits)

5. **Implementation Roadmap**:
   - 4-phase plan (MVP to paid content)
   - Budget: $50-100/month initially
   - Timeline: 6-12 months

#### Success Criteria (from original spike)

✅ Identified 2-3 viable public domain book sources with comparison  
✅ Documented legal requirements for redistribution and AI processing  
✅ Designed technical infrastructure with cost estimates  
✅ Outlined transition path to paid/licensed content  
✅ Created actionable implementation roadmap

**Status:** Complete and ready for implementation planning

---

## Contributing

When adding new research or documentation:

1. Use clear, descriptive filenames
2. Include table of contents for long documents
3. Add references/citations
4. Update this README with a brief description

## Questions?

For technical questions about the prosody research, refer to:
- [llm-prosody-investigation.md](./llm-prosody-investigation.md) - Comprehensive technical guide
- GitHub Issues - For discussion and questions
