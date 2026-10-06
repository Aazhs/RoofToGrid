# Feature: Public Solar Starting-Point Calculator

Status: Implemented in `frontend/components/landing/QuickCalculator.tsx`
Model: `frontend/lib/solar-model.ts` (`IN_2026_07`)

## Purpose

Give a homeowner a useful first-pass range without asking for contact details. The result is a planning aid,
not a lead form or site survey.

## Inputs

- Average monthly electricity bill
- Effective tariff assumption
- Usable, shade-free roof area

The landing-page version assumes a flat, south-facing, shade-free roof to remain quick. The linked `/demo`
adds roof type, orientation and shading controls.

## Outputs

- Recommended system size, capped by roof capacity
- Estimated central PM Surya Ghar subsidy
- Gross and net planning cost
- Annual savings and simple payback
- Estimated annual generation and consumption offset

## Calculation contract

The browser model mirrors the documented backend assumptions: 1,450 kWh/kWp/year, roof-type area factors,
orientation and shading derates, size-based cost bands, 85% self-consumption cap and the static central subsidy
rule. Every result states that a physical survey and current programme checks are still required.

The calculator links into the four-stage guided demo with the entered bill, tariff and area carried forward in
the URL. No personal data is collected or stored by the public flow.
