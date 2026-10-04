package domain

import (
	"math"
)

type SuitabilityRating string

const (
	SuitabilityExcellent  SuitabilityRating = "EXCELLENT"
	SuitabilityGood       SuitabilityRating = "GOOD"
	SuitabilityFair       SuitabilityRating = "FAIR"
	SuitabilityPoor       SuitabilityRating = "POOR"
	SuitabilityUnsuitable SuitabilityRating = "UNSUITABLE"
)

type SizingInput struct {
	AvgMonthlyUnits float64      `json:"avgMonthlyUnits"`
	TariffPerKwh    float64      `json:"tariffPerKwh"`
	RoofType        RoofType     `json:"roofType"`
	UsableAreaSqft  float64      `json:"usableAreaSqft"`
	Orientation     Orientation  `json:"orientation"`
	ShadingLevel    ShadingLevel `json:"shadingLevel"`
}

type ScenarioResult struct {
	Key                    string   `json:"key"`
	Label                  string   `json:"label"`
	SystemSizeKwp          float64  `json:"systemSizeKwp"`
	AnnualGenerationKwh    float64  `json:"annualGenerationKwh"`
	MonthlyGenerationKwh   float64  `json:"monthlyGenerationKwh"`
	EstimatedCost          float64  `json:"estimatedCost"`
	SubsidyAmount          float64  `json:"subsidyAmount"`
	NetCost                float64  `json:"netCost"`
	AnnualSavings          float64  `json:"annualSavings"`
	MonthlySavings         float64  `json:"monthlySavings"`
	PaybackYears           *float64 `json:"paybackYears"`
	LifetimeSavings25y     float64  `json:"lifetimeSavings25y"`
	Co2OffsetTonnesPerYear float64  `json:"co2OffsetTonnesPerYear"`
	RoofAreaRequiredSqft   float64  `json:"roofAreaRequiredSqft"`
	OffsetPercent          float64  `json:"offsetPercent"`
	Notes                  string   `json:"notes"`
}

type SizingResult struct {
	Suitability          SuitabilityRating `json:"suitability"`
	SuitabilityReasons   []string          `json:"suitabilityReasons"`
	RoofCapacityKwp      float64           `json:"roofCapacityKwp"`
	LoadBasedKwp         float64           `json:"loadBasedKwp"`
	AnnualConsumptionKwh float64           `json:"annualConsumptionKwh"`
	Scenarios            []ScenarioResult  `json:"scenarios"`
	YieldEngine          string            `json:"yieldEngine"`
}

// EstimateSizing computes solar suitability and generates Conservative, Optimal, and Max Roof scenarios.
func EstimateSizing(input SizingInput) SizingResult {
	areaFactor := AreaPerKwp(input.RoofType)
	shadingFactor := ShadingDerate(input.ShadingLevel)
	orientationFactor := OrientationFactor(input.Orientation)

	// Roof max capacity
	rawRoofCapacity := (input.UsableAreaSqft / areaFactor) * shadingFactor
	roofCapacity := RoundToHalf(math.Max(0.5, rawRoofCapacity))

	// Annual load
	annualConsumption := input.AvgMonthlyUnits * 12.0

	// Specific yield per kWp per year (~1,500 kWh baseline in India)
	specificYield := 1500.0 * orientationFactor * shadingFactor
	if specificYield <= 0 {
		specificYield = 1000.0
	}

	rawLoadBased := annualConsumption / specificYield
	loadBased := RoundToHalf(math.Max(0.5, rawLoadBased))

	// Determine suitability
	rating := SuitabilityGood
	reasons := []string{}

	if input.UsableAreaSqft < 60 {
		rating = SuitabilityUnsuitable
		reasons = append(reasons, "Usable roof area is under the 60 sq ft minimum threshold for safe mounting.")
	} else if input.ShadingLevel == ShadingHeavy {
		rating = SuitabilityPoor
		reasons = append(reasons, "Heavy shading significantly reduces annual solar yield and extends payback.")
	} else if orientationFactor >= 0.95 && shadingFactor >= 0.85 && input.UsableAreaSqft >= 200 {
		rating = SuitabilityExcellent
		reasons = append(reasons, "Optimal south-facing sun exposure with minimal shading and abundant roof area.")
	} else {
		reasons = append(reasons, "Viable roof with good sunlight generation potential.")
	}

	// Build 3 scenarios
	scenarios := make([]ScenarioResult, 0, 3)

	// 1. Conservative (smaller upfront investment)
	conservativeSize := RoundToHalf(math.Max(0.5, math.Min(roofCapacity, loadBased*0.7)))
	scenarios = append(scenarios, buildScenario("CONSERVATIVE", "Conservative — lower upfront cost", conservativeSize, input, specificYield, annualConsumption, "Covers essential daytime base load with minimal capital outlay."))

	// 2. Optimal (matches household consumption)
	optimalSize := RoundToHalf(math.Max(0.5, math.Min(roofCapacity, loadBased)))
	scenarios = append(scenarios, buildScenario("OPTIMAL", "Optimal — matches your usage", optimalSize, input, specificYield, annualConsumption, "Balanced sizing to offset ~100% of your annual electricity bill."))

	// 3. Max Roof (utilizes available roof space)
	maxRoofSize := RoundToHalf(math.Max(0.5, roofCapacity))
	scenarios = append(scenarios, buildScenario("MAX_ROOF", "Maximum — uses your full roof", maxRoofSize, input, specificYield, annualConsumption, "Maximizes clean energy generation; ideal if planning EV charging or additional ACs."))

	return SizingResult{
		Suitability:          rating,
		SuitabilityReasons:   reasons,
		RoofCapacityKwp:      roofCapacity,
		LoadBasedKwp:         loadBased,
		AnnualConsumptionKwh: Round(annualConsumption, 0),
		Scenarios:            scenarios,
		YieldEngine:          "RoofToGrid-Go-v1.0",
	}
}

func buildScenario(key, label string, kwp float64, input SizingInput, specificYield, annualConsumption float64, notes string) ScenarioResult {
	annualGen := Round(kwp*specificYield, 0)
	monthlyGen := Round(annualGen/12.0, 0)
	grossCost := GrossCostForSize(kwp)
	subsidy := SubsidyForSize(kwp)
	netCost := math.Max(0, grossCost-subsidy)

	// Annual savings capped by consumption
	effectiveUnitsSaved := math.Min(annualGen, annualConsumption)
	annualSavings := Round(effectiveUnitsSaved*input.TariffPerKwh, 0)
	monthlySavings := Round(annualSavings/12.0, 0)

	var payback *float64
	if annualSavings > 0 {
		pb := PaybackYears(netCost, annualSavings)
		payback = &pb
	}

	// 25-year cumulative savings assuming 0.5% module degradation and 3% tariff inflation
	lifetimeSavings := Round(annualSavings*21.5, 0)
	co2Tonnes := Round((annualGen*0.82)/1000.0, 1) // ~0.82 kg CO2 per kWh grid emission factor India
	areaRequired := Round(kwp*AreaPerKwp(input.RoofType), 0)
	offsetPct := Round((annualGen/math.Max(1, annualConsumption))*100.0, 0)

	return ScenarioResult{
		Key:                    key,
		Label:                  label,
		SystemSizeKwp:          kwp,
		AnnualGenerationKwh:    annualGen,
		MonthlyGenerationKwh:   monthlyGen,
		EstimatedCost:          grossCost,
		SubsidyAmount:          subsidy,
		NetCost:                netCost,
		AnnualSavings:          annualSavings,
		MonthlySavings:         monthlySavings,
		PaybackYears:           payback,
		LifetimeSavings25y:     lifetimeSavings,
		Co2OffsetTonnesPerYear: co2Tonnes,
		RoofAreaRequiredSqft:   areaRequired,
		OffsetPercent:          offsetPct,
		Notes:                  notes,
	}
}
