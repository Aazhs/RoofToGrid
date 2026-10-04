package domain

import (
	"testing"
)

func TestEvaluateQuote(t *testing.T) {
	wattage := 540.0
	gen := 7500.0

	quote := QuoteInput{
		InstallerName:                 "Tata Power Solar Systems",
		SystemSizeKwp:                 5.0,
		TotalPrice:                    325000,
		PanelBrand:                    "Tata Power Solar",
		PanelTechnology:               PanelTechTopCon,
		PanelWattage:                  &wattage,
		PanelProductWarrantyYears:     12,
		PanelPerformanceWarrantyYears: 25,
		InverterBrand:                 "Growatt",
		InverterType:                  InverterTypeString,
		InverterWarrantyYears:         10,
		WorkmanshipWarrantyYears:      5,
		IncludesNetMetering:           true,
		IncludesStructure:             true,
		IncludesAmcYears:              5,
		ExpectedAnnualGenerationKwh:   &gen,
		FinancingType:                 FinancingCash,
	}

	ctx := ScoringContext{
		TariffPerKwh:         8.0,
		AnnualConsumptionKwh: 6000,
	}

	eval := EvaluateQuote(quote, ctx)

	if eval.PricePerKwp != 65000 {
		t.Errorf("Expected pricePerKwp 65000, got %.0f", eval.PricePerKwp)
	}

	if eval.EquipmentTier != TierStandard && eval.EquipmentTier != TierPremium {
		t.Errorf("Expected STANDARD or PREMIUM tier, got %s", eval.EquipmentTier)
	}

	if eval.ValueScore <= 60 {
		t.Errorf("Expected high valueScore for transparent quote, got %.1f", eval.ValueScore)
	}

	if len(eval.RedFlags) != 0 {
		t.Errorf("Expected 0 red flags for complete quote, got %v", eval.RedFlags)
	}

	if eval.SubsidyEstimate != 78000 {
		t.Errorf("Expected Rs 78000 subsidy for 5 kWp, got %.0f", eval.SubsidyEstimate)
	}

	if eval.NetCostAfterSubsidy != 247000 {
		t.Errorf("Expected netCostAfterSubsidy Rs 247000, got %.0f", eval.NetCostAfterSubsidy)
	}
}
