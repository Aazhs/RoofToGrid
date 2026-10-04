package domain

import (
	"math"
)

// Round rounds a float to the given number of decimal places.
func Round(val float64, decimals int) float64 {
	pow := math.Pow(10, float64(decimals))
	return math.Round(val*pow) / pow
}

// RoundToHalf rounds a float to the nearest 0.5.
func RoundToHalf(val float64) float64 {
	return math.Round(val*2.0) / 2.0
}

// MonthlyEMI calculates the monthly loan installment given principal, annual interest rate %, and tenure in months.
func MonthlyEMI(principal float64, annualRatePct float64, tenureMonths int) float64 {
	if principal <= 0 || tenureMonths <= 0 {
		return 0
	}
	if annualRatePct <= 0 {
		return Round(principal/float64(tenureMonths), 2)
	}

	monthlyRate := (annualRatePct / 100.0) / 12.0
	factor := math.Pow(1.0+monthlyRate, float64(tenureMonths))
	emi := principal * monthlyRate * factor / (factor - 1.0)
	return Round(emi, 2)
}

// PaybackYears computes simple payback time in years, returning 0 if savings <= 0.
func PaybackYears(netCost float64, annualSavings float64) float64 {
	if annualSavings <= 0 || netCost <= 0 {
		return 0
	}
	return Round(netCost/annualSavings, 1)
}

// LinearScore maps a value linearly between atBest (100 pts) down to atWorst (0 pts), clamped to [0, 100].
func LinearScore(value, atBest, atWorst float64) float64 {
	if atWorst == atBest {
		if value <= atBest {
			return 100.0
		}
		return 0.0
	}
	raw := ((atWorst - value) / (atWorst - atBest)) * 100.0
	if raw < 0 {
		return 0.0
	}
	if raw > 100.0 {
		return 100.0
	}
	return Round(raw, 1)
}

