package domain

import (
	"fmt"
	"math"
	"strings"
)

type PanelTechnologyKey string

const (
	PanelTechMonoPerc PanelTechnologyKey = "MONO_PERC"
	PanelTechTopCon   PanelTechnologyKey = "TOPCON"
	PanelTechHJT      PanelTechnologyKey = "HJT"
	PanelTechNType    PanelTechnologyKey = "N_TYPE"
	PanelTechPoly     PanelTechnologyKey = "POLY"
	PanelTechThinFilm PanelTechnologyKey = "THIN_FILM"
	PanelTechUnknown  PanelTechnologyKey = "UNKNOWN"
)

type InverterTypeKey string

const (
	InverterTypeString  InverterTypeKey = "STRING"
	InverterTypeMicro   InverterTypeKey = "MICRO"
	InverterTypeHybrid  InverterTypeKey = "HYBRID"
	InverterTypeUnknown InverterTypeKey = "UNKNOWN"
)

type EquipmentTierKey string

const (
	TierBasic    EquipmentTierKey = "BASIC"
	TierStandard EquipmentTierKey = "STANDARD"
	TierPremium  EquipmentTierKey = "PREMIUM"
)

type FinancingTypeKey string

const (
	FinancingCash     FinancingTypeKey = "CASH"
	FinancingLoan     FinancingTypeKey = "LOAN"
	FinancingLeasePpa FinancingTypeKey = "LEASE_PPA"
)

type QuoteInput struct {
	InstallerName                 string             `json:"installerName"`
	SystemSizeKwp                 float64            `json:"systemSizeKwp"`
	TotalPrice                    float64            `json:"totalPrice"`
	PanelBrand                    string             `json:"panelBrand"`
	PanelTechnology               PanelTechnologyKey `json:"panelTechnology"`
	PanelWattage                  *float64           `json:"panelWattage"`
	PanelProductWarrantyYears     int                `json:"panelProductWarrantyYears"`
	PanelPerformanceWarrantyYears int                `json:"panelPerformanceWarrantyYears"`
	InverterBrand                 string             `json:"inverterBrand"`
	InverterType                  InverterTypeKey    `json:"inverterType"`
	InverterWarrantyYears         int                `json:"inverterWarrantyYears"`
	WorkmanshipWarrantyYears      int                `json:"workmanshipWarrantyYears"`
	IncludesNetMetering           bool               `json:"includesNetMetering"`
	IncludesStructure             bool               `json:"includesStructure"`
	IncludesAmcYears              int                `json:"includesAmcYears"`
	ExpectedAnnualGenerationKwh   *float64           `json:"expectedAnnualGenerationKwh"`
	FinancingType                 FinancingTypeKey   `json:"financingType"`
	InterestRatePct               *float64           `json:"interestRatePct"`
	TenureMonths                  *int               `json:"tenureMonths"`
	DownPayment                   *float64           `json:"downPayment"`
}

type ScoringContext struct {
	TariffPerKwh                float64  `json:"tariffPerKwh"`
	AnnualConsumptionKwh        float64  `json:"annualConsumptionKwh"`
	PlatformAnnualGenerationKwh *float64 `json:"platformAnnualGenerationKwh"`
}

type ScoreBreakdown struct {
	Price        float64            `json:"price"`
	Equipment    float64            `json:"equipment"`
	Warranty     float64            `json:"warranty"`
	Transparency float64            `json:"transparency"`
	Weights      map[string]float64 `json:"weights"`
}

type QuoteEvaluation struct {
	PricePerKwp                  float64          `json:"pricePerKwp"`
	EquipmentTier                EquipmentTierKey `json:"equipmentTier"`
	ValueScore                   float64          `json:"valueScore"`
	ScoreBreakdown               ScoreBreakdown   `json:"scoreBreakdown"`
	RedFlags                     []string         `json:"redFlags"`
	FinancedTotalCost            float64          `json:"financedTotalCost"`
	MonthlyPayment               *float64         `json:"monthlyPayment"`
	EstimatedAnnualGenerationKwh float64          `json:"estimatedAnnualGenerationKwh"`
	GenerationSource             string           `json:"generationSource"`
	EstimatedAnnualSavings       float64          `json:"estimatedAnnualSavings"`
	SubsidyEstimate              float64          `json:"subsidyEstimate"`
	PaybackYears                 *float64         `json:"paybackYears"`
	NetCostAfterSubsidy          float64          `json:"netCostAfterSubsidy"`
	CostOfCredit                 float64          `json:"costOfCredit"`
}

const (
	SuspiciouslyLowPricePerKwp = 35000.0
	OverpricedPerKwp           = 85000.0
)

var ScoreWeights = map[string]float64{
	"price":        0.40,
	"equipment":    0.25,
	"warranty":     0.25,
	"transparency": 0.10,
}

func PricePerKwp(totalPrice, systemSizeKwp float64) float64 {
	if systemSizeKwp <= 0 {
		return 0
	}
	return math.Round(totalPrice / systemSizeKwp)
}

func DetermineEquipmentTier(input QuoteInput) EquipmentTierKey {
	isPremiumTech := input.PanelTechnology == PanelTechTopCon || input.PanelTechnology == PanelTechHJT || input.PanelTechnology == PanelTechNType

	if isPremiumTech && input.PanelProductWarrantyYears >= 15 && input.InverterWarrantyYears >= 10 {
		return TierPremium
	}
	if (input.PanelTechnology == PanelTechMonoPerc || isPremiumTech) && input.PanelProductWarrantyYears >= 12 && input.InverterWarrantyYears >= 7 {
		return TierStandard
	}
	return TierBasic
}

func PriceScore(perKwp float64) float64 {
	if perKwp <= 0 {
		return 0
	}
	if perKwp < SuspiciouslyLowPricePerKwp {
		return 45.0
	}
	return Round(LinearScore(perKwp, 40000.0, OverpricedPerKwp), 1)
}

func EquipmentScore(input QuoteInput) float64 {
	tier := DetermineEquipmentTier(input)
	base := 35.0
	if tier == TierPremium {
		base = 90.0
	} else if tier == TierStandard {
		base = 65.0
	}

	bonus := 0.0
	if input.InverterType == InverterTypeMicro || input.InverterType == InverterTypeHybrid {
		bonus += 6.0
	}
	if len(strings.TrimSpace(input.PanelBrand)) > 1 {
		bonus += 2.0
	}
	if len(strings.TrimSpace(input.InverterBrand)) > 1 {
		bonus += 2.0
	}
	if input.PanelWattage != nil && *input.PanelWattage >= 540 {
		bonus += 2.0
	}
	return Round(math.Min(100.0, base+bonus), 1)
}

func WarrantyScore(input QuoteInput) float64 {
	pProd := LinearScore(float64(input.PanelProductWarrantyYears), 15.0, 5.0)
	pPerf := LinearScore(float64(input.PanelPerformanceWarrantyYears), 27.0, 20.0)
	inv := LinearScore(float64(input.InverterWarrantyYears), 12.0, 5.0)
	work := LinearScore(float64(input.WorkmanshipWarrantyYears), 5.0, 1.0)
	return Round(pProd*0.30+pPerf*0.20+inv*0.30+work*0.20, 1)
}

func TransparencyScore(input QuoteInput) float64 {
	score := 0.0
	if input.IncludesNetMetering {
		score += 30.0
	}
	if input.IncludesStructure {
		score += 25.0
	}
	if input.ExpectedAnnualGenerationKwh != nil && *input.ExpectedAnnualGenerationKwh > 0 {
		score += 15.0
	}
	if input.IncludesAmcYears > 0 {
		score += 15.0
	}
	financingDisclosed := input.FinancingType == FinancingCash || (input.InterestRatePct != nil && input.TenureMonths != nil && *input.TenureMonths > 0)
	if financingDisclosed {
		score += 15.0
	}
	return Round(math.Min(100.0, score), 1)
}

func DetectRedFlags(input QuoteInput, perKwp float64) []string {
	flags := make([]string, 0)
	if perKwp > 0 && perKwp < SuspiciouslyLowPricePerKwp {
		flags = append(flags, fmt.Sprintf("Price of ₹%.0f/kWp is suspiciously low. Verify if mounting structure, earthing, or net-metering are excluded.", perKwp))
	}
	if perKwp > OverpricedPerKwp {
		flags = append(flags, fmt.Sprintf("Price of ₹%.0f/kWp is above typical Indian residential benchmarks. Request a line-item quotation.", perKwp))
	}
	if input.PanelProductWarrantyYears < 10 {
		flags = append(flags, fmt.Sprintf("Panel product warranty of %d years is short; 10–12 years is the Indian standard.", input.PanelProductWarrantyYears))
	}
	if input.InverterWarrantyYears < 5 {
		flags = append(flags, fmt.Sprintf("Inverter warranty of %d years is short; inverters face high thermal stress.", input.InverterWarrantyYears))
	}
	if input.WorkmanshipWarrantyYears < 2 {
		flags = append(flags, "Workmanship warranty under 2 years leaves you exposed to roof mounting leaks.")
	}
	if !input.IncludesNetMetering {
		flags = append(flags, "Net metering DISCOM liaisoning is not included — DISCOM bi-directional meter procurement may be billed at actuals.")
	}
	if !input.IncludesStructure {
		flags = append(flags, "Mounting structure is excluded; structure fabrication typically adds ₹8,000–₹15,000/kWp.")
	}
	return flags
}

// EvaluateQuote executes end-to-end normalization, red flag detection, and transparent value scoring.
func EvaluateQuote(input QuoteInput, ctx ScoringContext) QuoteEvaluation {
	perKwp := PricePerKwp(input.TotalPrice, input.SystemSizeKwp)
	tier := DetermineEquipmentTier(input)

	breakdown := ScoreBreakdown{
		Price:        PriceScore(perKwp),
		Equipment:    EquipmentScore(input),
		Warranty:     WarrantyScore(input),
		Transparency: TransparencyScore(input),
		Weights:      ScoreWeights,
	}

	valueScore := Round(
		breakdown.Price*ScoreWeights["price"]+
			breakdown.Equipment*ScoreWeights["equipment"]+
			breakdown.Warranty*ScoreWeights["warranty"]+
			breakdown.Transparency*ScoreWeights["transparency"],
		1,
	)

	// Generation resolution
	annualGen := 0.0
	genSource := "PLATFORM"
	if input.ExpectedAnnualGenerationKwh != nil && *input.ExpectedAnnualGenerationKwh > 0 {
		annualGen = *input.ExpectedAnnualGenerationKwh
		genSource = "INSTALLER"
	} else if ctx.PlatformAnnualGenerationKwh != nil && *ctx.PlatformAnnualGenerationKwh > 0 {
		annualGen = *ctx.PlatformAnnualGenerationKwh
	} else {
		annualGen = Round(input.SystemSizeKwp*1500.0, 0)
	}

	// Financing totals
	financedTotalCost := input.TotalPrice
	var monthlyEmiVal *float64
	costOfCredit := 0.0

	if (input.FinancingType == FinancingLoan || input.FinancingType == FinancingLeasePpa) && input.TenureMonths != nil && *input.TenureMonths > 0 {
		down := 0.0
		if input.DownPayment != nil {
			down = math.Max(0, math.Min(*input.DownPayment, input.TotalPrice))
		}
		principal := input.TotalPrice - down
		rate := 0.0
		if input.InterestRatePct != nil {
			rate = *input.InterestRatePct
		}
		emi := MonthlyEMI(principal, rate, *input.TenureMonths)
		monthlyEmiVal = &emi
		financedTotalCost = Round(down+emi*float64(*input.TenureMonths), 0)
		costOfCredit = Round(financedTotalCost-input.TotalPrice, 0)
	}

	// Subsidy & savings
	subsidy := SubsidyForSize(input.SystemSizeKwp)
	netCost := math.Max(0, financedTotalCost-subsidy)

	usableUnits := math.Min(annualGen*0.80, ctx.AnnualConsumptionKwh)
	if ctx.AnnualConsumptionKwh <= 0 {
		usableUnits = annualGen * 0.80
	}
	tariff := ctx.TariffPerKwh
	if tariff <= 0 {
		tariff = 7.5
	}
	annualSavings := Round(usableUnits*tariff, 0)

	var payback *float64
	if annualSavings > 0 {
		pb := PaybackYears(netCost, annualSavings)
		payback = &pb
	}

	return QuoteEvaluation{
		PricePerKwp:                  perKwp,
		EquipmentTier:                tier,
		ValueScore:                   valueScore,
		ScoreBreakdown:               breakdown,
		RedFlags:                     DetectRedFlags(input, perKwp),
		FinancedTotalCost:            financedTotalCost,
		MonthlyPayment:               monthlyEmiVal,
		EstimatedAnnualGenerationKwh: annualGen,
		GenerationSource:             genSource,
		EstimatedAnnualSavings:       annualSavings,
		SubsidyEstimate:              subsidy,
		PaybackYears:                 payback,
		NetCostAfterSubsidy:          netCost,
		CostOfCredit:                 costOfCredit,
	}
}
