package domain

type RoofType string

const (
	RoofTypeFlat   RoofType = "FLAT"
	RoofTypeSloped RoofType = "SLOPED"
	RoofTypeMixed  RoofType = "MIXED"
)

type Orientation string

const (
	OrientationS  Orientation = "S"
	OrientationSE Orientation = "SE"
	OrientationSW Orientation = "SW"
	OrientationE  Orientation = "E"
	OrientationW  Orientation = "W"
	OrientationNE Orientation = "NE"
	OrientationNW Orientation = "NW"
	OrientationN  Orientation = "N"
)

type ShadingLevel string

const (
	ShadingNone     ShadingLevel = "NONE"
	ShadingLight    ShadingLevel = "LIGHT"
	ShadingModerate ShadingLevel = "MODERATE"
	ShadingHeavy    ShadingLevel = "HEAVY"
)

// AreaPerKwp returns required shade-free square feet per kWp.
func AreaPerKwp(r RoofType) float64 {
	switch r {
	case RoofTypeSloped:
		return 80.0
	case RoofTypeMixed:
		return 90.0
	case RoofTypeFlat:
		fallthrough
	default:
		return 100.0
	}
}

// ShadingDerate returns solar generation multiplier given shading.
func ShadingDerate(s ShadingLevel) float64 {
	switch s {
	case ShadingLight:
		return 0.85
	case ShadingModerate:
		return 0.65
	case ShadingHeavy:
		return 0.40
	case ShadingNone:
		fallthrough
	default:
		return 1.0
	}
}

// OrientationFactor returns derate factor based on roof azimuth heading in India.
func OrientationFactor(o Orientation) float64 {
	switch o {
	case OrientationSE, OrientationSW:
		return 0.95
	case OrientationE, OrientationW:
		return 0.85
	case OrientationNE, OrientationNW:
		return 0.70
	case OrientationN:
		return 0.60
	case OrientationS:
		fallthrough
	default:
		return 1.0
	}
}

// SubsidyForSize returns the central PM Surya Ghar: Muft Bijli Yojana direct bank transfer (DBT) subsidy in INR.
func SubsidyForSize(kwp float64) float64 {
	if kwp <= 0 {
		return 0
	}
	if kwp <= 1.0 {
		return Round(kwp*30000.0, 0)
	}
	if kwp <= 2.0 {
		return Round(30000.0+(kwp-1.0)*30000.0, 0)
	}
	if kwp <= 3.0 {
		return Round(60000.0+(kwp-2.0)*18000.0, 0)
	}
	// 3 kWp and above: capped at maximum Rs 78,000
	return 78000.0
}

// GrossCostForSize returns estimated turnkey installation cost before subsidies (~Rs 65,000/kWp benchmark).
func GrossCostForSize(kwp float64) float64 {
	// Slight economies of scale for larger systems
	ratePerKwp := 65000.0
	if kwp >= 5.0 {
		ratePerKwp = 58000.0
	} else if kwp >= 3.0 {
		ratePerKwp = 61000.0
	}
	return Round(kwp*ratePerKwp, 0)
}
