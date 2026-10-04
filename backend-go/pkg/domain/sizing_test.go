package domain

import (
	"testing"
)

func TestSubsidyForSize(t *testing.T) {
	tests := []struct {
		kwp      float64
		expected float64
	}{
		{0.5, 15000},
		{1.0, 30000},
		{2.0, 60000},
		{3.0, 78000},
		{5.0, 78000},
		{10.0, 78000},
	}

	for _, tt := range tests {
		got := SubsidyForSize(tt.kwp)
		if got != tt.expected {
			t.Errorf("SubsidyForSize(%.1f) = %.0f, expected %.0f", tt.kwp, got, tt.expected)
		}
	}
}

func TestEstimateSizing(t *testing.T) {
	input := SizingInput{
		AvgMonthlyUnits: 450,
		TariffPerKwh:    8.0,
		RoofType:        RoofTypeFlat,
		UsableAreaSqft:  500,
		Orientation:     OrientationS,
		ShadingLevel:    ShadingNone,
	}

	result := EstimateSizing(input)

	if result.Suitability != SuitabilityExcellent {
		t.Errorf("Expected EXCELLENT suitability, got %s", result.Suitability)
	}

	if len(result.Scenarios) != 3 {
		t.Fatalf("Expected 3 scenarios, got %d", len(result.Scenarios))
	}

	for _, s := range result.Scenarios {
		if s.SystemSizeKwp <= 0 {
			t.Errorf("Scenario %s has invalid system size %.1f", s.Key, s.SystemSizeKwp)
		}
		if s.NetCost > s.EstimatedCost {
			t.Errorf("Net cost %.0f cannot exceed gross cost %.0f", s.NetCost, s.EstimatedCost)
		}
		if s.AnnualSavings <= 0 {
			t.Errorf("Annual savings should be positive, got %.0f", s.AnnualSavings)
		}
	}
}
