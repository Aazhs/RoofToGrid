# Proposed: Smart Bill OCR & Quote Parser

## Overview

This document describes planned intelligent document processing for the Indian residential solar market. It is **not implemented in the current product**:
1. **Smart Bill OCR Extractor**: Ingests monthly electricity bills from any Indian DISCOM to extract energy consumption (kWh), net payable amounts, billing cycles, and effective tariffs.
2. **AI Quote Parser with Human Confirmation**: Ingests installer proposals (PDFs, images, or raw text) to normalize hardware specifications, pricing, warranties, and hidden clauses.

---

## 1. Smart Bill OCR Extractor (`BillOcrExtractor.tsx`)

### Problem
Indian homeowners often find electricity bills confusing, with variable slabs, fuel adjustment charges (FAC/FPPCA), fixed charges, and electricity duty obscuring their actual cost per unit.

### Architecture & Pipeline
- **Document Ingestion**: Accepts PDF, PNG, JPG, or WebP bill scans.
- **Pre-configured DISCOM Templates**: Includes instant recognition models for major Indian distribution companies:
  - **BESCOM** (Bangalore Electricity Supply Company — LT-2 Urban)
  - **Tata Power / Adani** (Mumbai Suburban — Residential LT-1)
  - **UGVCL / DGVCL** (Gujarat — RGP Residential)
  - **BSES Rajdhani / Yamuna** (Delhi NCR — Domestic Light & Power)
  - **MSEDCL, TANGEDCO, TSSPDCL, UPPCL**
- **Confidence Scoring**: Each extraction provides a confidence score (%) computed from pattern matching on consumer IDs, meter reading tables, and tariff cross-checks.
- **Workflow Integration**:
  - **Pre-fill Form**: Transfers extracted month, units, amount, and tariff into the bill entry form for homeowner review.
  - **Direct Save**: 1-click persistence to `/bills` database with immediate recalculation of the 12-month sizing average.

---

## 2. AI Quote Parser (`AiQuoteParser.tsx`)

### Problem
Solar installer quotations in India are notoriously fragmented. Installers frequently use differing terminology (Mono PERC vs. TopCon N-Type, microinverter vs. string), bury DISCOM net-metering fees in fine print, or omit workmanship guarantees.

### Extraction Pipeline
1. **Layout & Ingestion**: Processes unstructured quote documents or WhatsApp text proposals.
2. **Named Entity Recognition & Solar Normalization**:
   - **Installer Details**: Company name, authorized channel tier.
   - **System Size**: Direct kWp capacity extraction.
   - **Total Quoted Price**: Gross inclusive price (₹).
   - **Panel Specifications**: Brand (Tata Power, Waaree, Adani, Vikram), Technology (`MONO_PERC`, `TOPCON`, `HJT`, `BIFACIAL`), Module Wattage (e.g. 540Wp), Product Warranty (years), and Performance Warranty (years).
   - **Inverter Specifications**: Brand (Growatt, SolarEdge, Sungrow, Enphase), Topology (`STRING`, `MICRO`, `HYBRID`), and Warranty.
   - **Turnkey Scope**: Verification of mounting structure (GI / Aluminium / Elevated) and DISCOM net metering liaisoning.
   - **O&M / AMC**: Free maintenance period (years).
3. **Transparency & Red Flag Analysis**: Automatically highlights omissions such as unstated workmanship warranties or separate DISCOM statutory fee clauses.

### Human-in-the-Loop Verification
RoofToGrid enforces a **Human Confirmation Step**:
- Before any quote is committed to the database, extracted fields are presented in an editable verification grid.
- Homeowners can adjust or override any value.
- Clicking **"✓ Confirm & Populate Quote Form"** transfers the validated parameters directly to the scoring engine.
