package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/Aazhs/RoofToGrid/backend-go/pkg/auth"
	"github.com/Aazhs/RoofToGrid/backend-go/pkg/db"
	"github.com/Aazhs/RoofToGrid/backend-go/pkg/domain"
)

type Server struct {
	repo db.SupabaseRepository
}

type HealthResponse struct {
	Status         string    `json:"status"`
	Service        string    `json:"service"`
	Version        string    `json:"version"`
	Runtime        string    `json:"runtime"`
	Database       string    `json:"database"`
	DatabaseHealth bool      `json:"databaseHealth"`
	Timestamp      time.Time `json:"timestamp"`
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("%s %s in %v", r.Method, r.URL.Path, time.Since(start))
	})
}

func (s *Server) healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	dbOk, dbDetail := s.repo.Health(r.Context())
	json.NewEncoder(w).Encode(HealthResponse{
		Status:         "healthy",
		Service:        "rooftogrid-api-go",
		Version:        "1.1.0",
		Runtime:        "Go 1.22+ (Native Static Binary)",
		Database:       dbDetail,
		DatabaseHealth: dbOk,
		Timestamp:      time.Now().UTC(),
	})
}

func (s *Server) estimateHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var input domain.SizingInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"Invalid request payload: %s"}`, err.Error()), http.StatusBadRequest)
		return
	}

	// Validate inputs with safe defaults
	if input.AvgMonthlyUnits <= 0 {
		input.AvgMonthlyUnits = 300
	}
	if input.TariffPerKwh <= 0 {
		input.TariffPerKwh = 7.5
	}
	if input.UsableAreaSqft <= 0 {
		input.UsableAreaSqft = 350
	}

	result := domain.EstimateSizing(input)
	json.NewEncoder(w).Encode(result)
}

type ScoreQuoteRequest struct {
	Quote   domain.QuoteInput     `json:"quote"`
	Context domain.ScoringContext `json:"context"`
}

func (s *Server) scoreQuoteHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req ScoreQuoteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"Invalid request payload: %s"}`, err.Error()), http.StatusBadRequest)
		return
	}

	eval := domain.EvaluateQuote(req.Quote, req.Context)
	json.NewEncoder(w).Encode(eval)
}

func (s *Server) billsHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	userID := auth.UserIDFromContext(r.Context())
	if userID == "" {
		userID = r.URL.Query().Get("userId")
	}
	if userID == "" {
		userID = "demo_user"
	}

	switch r.Method {
	case http.MethodGet:
		bills, err := s.repo.ListBills(r.Context(), userID)
		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(bills)

	case http.MethodPost:
		var bill db.ElectricityBill
		if err := json.NewDecoder(r.Body).Decode(&bill); err != nil {
			http.Error(w, `{"error":"Invalid bill JSON"}`, http.StatusBadRequest)
			return
		}
		if bill.UserID == "" {
			bill.UserID = userID
		}
		saved, err := s.repo.SaveBill(r.Context(), bill)
		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(saved)

	default:
		http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
	}
}

func (s *Server) roofHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	userID := auth.UserIDFromContext(r.Context())
	if userID == "" {
		userID = r.URL.Query().Get("userId")
	}
	if userID == "" {
		userID = "demo_user"
	}

	switch r.Method {
	case http.MethodGet:
		roofs, err := s.repo.ListRoofs(r.Context(), userID)
		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(roofs)

	case http.MethodPost:
		var roof db.RoofProfile
		if err := json.NewDecoder(r.Body).Decode(&roof); err != nil {
			http.Error(w, `{"error":"Invalid roof JSON"}`, http.StatusBadRequest)
			return
		}
		if roof.UserID == "" {
			roof.UserID = userID
		}
		saved, err := s.repo.SaveRoof(r.Context(), roof)
		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(saved)

	default:
		http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
	}
}

func (s *Server) quotesHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	userID := auth.UserIDFromContext(r.Context())
	if userID == "" {
		userID = r.URL.Query().Get("userId")
	}
	if userID == "" {
		userID = "demo_user"
	}

	switch r.Method {
	case http.MethodGet:
		quotes, err := s.repo.ListQuotes(r.Context(), userID)
		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(quotes)

	case http.MethodPost:
		var quote db.SavedQuote
		if err := json.NewDecoder(r.Body).Decode(&quote); err != nil {
			http.Error(w, `{"error":"Invalid quote JSON"}`, http.StatusBadRequest)
			return
		}
		if quote.UserID == "" {
			quote.UserID = userID
		}
		saved, err := s.repo.SaveQuote(r.Context(), quote)
		if err != nil {
			http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(saved)

	default:
		http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
	}
}

type InstallerBenchmark struct {
	ID                string  `json:"id"`
	Name              string  `json:"name"`
	Tier              string  `json:"tier"`
	BaseRatePerKwp    float64 `json:"baseRatePerKwp"`
	PanelTech         string  `json:"panelTech"`
	PanelBrand        string  `json:"panelBrand"`
	InverterBrand     string  `json:"inverterBrand"`
	TransparencyScore float64 `json:"transparencyScore"`
	BestForBadge      string  `json:"bestForBadge"`
	Notes             string  `json:"notes"`
}

func (s *Server) installersHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	benchmarks := []InstallerBenchmark{
		{
			ID:                "tata-solar",
			Name:              "Tata Power Solar Systems",
			Tier:              "Tier 1 National Brand",
			BaseRatePerKwp:    68000,
			PanelTech:         "TopCon N-Type (22.8% Eff)",
			PanelBrand:        "Tata Power Solar 545W",
			InverterBrand:     "Growatt / SolarEdge 10y Warranty",
			TransparencyScore: 9.6,
			BestForBadge:      "Best Tech & National Reliability",
			Notes:             "Includes full DISCOM net-metering liaisoning and bidirectional meter paperwork.",
		},
		{
			ID:                "waaree-solar",
			Name:              "Waaree Energies Direct Partner",
			Tier:              "Tier 1 Module Manufacturer",
			BaseRatePerKwp:    58000,
			PanelTech:         "Mono PERC Bi-facial",
			PanelBrand:        "Waaree 550W Panels",
			InverterBrand:     "Waaree / Solis 5y Warranty",
			TransparencyScore: 9.0,
			BestForBadge:      "Best Value & Fastest Payback (3.6 yrs)",
			Notes:             "Largest Indian panel manufacturer with direct distributor dispatch.",
		},
		{
			ID:                "solarsquare",
			Name:              "SolarSquare Energy",
			Tier:              "Tech-Enabled D2C EPC",
			BaseRatePerKwp:    64000,
			PanelTech:         "Mono PERC Half-Cut",
			PanelBrand:        "RenewSys / Waaree 540W",
			InverterBrand:     "Deye Cloud Hybrid-Ready",
			TransparencyScore: 9.2,
			BestForBadge:      "Best Customer Service & App Tracking",
			Notes:             "Proprietary wind-resilient HDG elevated structure with 5-year AMC.",
		},
		{
			ID:                "loom-solar",
			Name:              "Loom Solar Microinverter Package",
			Tier:              "Premium Microinverter Specialist",
			BaseRatePerKwp:    79000,
			PanelTech:         "Shark Bi-facial TopCon",
			PanelBrand:        "Loom Solar 575W",
			InverterBrand:     "Enphase / Hoymiles Microinverter",
			TransparencyScore: 9.4,
			BestForBadge:      "Maximum Safety (Low Voltage AC Roof)",
			Notes:             "Panel-level MPPT tracking; immune to partial shading from water tanks or chimneys.",
		},
	}
	json.NewEncoder(w).Encode(benchmarks)
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "4000"
	}

	ctx := context.Background()
	repo := db.ConnectRepository(ctx)
	defer repo.Close()

	srv := &Server{repo: repo}

	mux := http.NewServeMux()
	mux.HandleFunc("/health", srv.healthHandler)
	mux.HandleFunc("/api/v1/health", srv.healthHandler)
	mux.HandleFunc("/api/v1/sizing/estimate", srv.estimateHandler)
	mux.HandleFunc("/api/v1/quotes/score", srv.scoreQuoteHandler)
	mux.HandleFunc("/api/v1/bills", srv.billsHandler)
	mux.HandleFunc("/api/v1/roof", srv.roofHandler)
	mux.HandleFunc("/api/v1/quotes", srv.quotesHandler)
	mux.HandleFunc("/api/v1/installers", srv.installersHandler)

	jwtSecret := os.Getenv("SUPABASE_JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = os.Getenv("JWT_SECRET")
	}
	if jwtSecret == "" {
		jwtSecret = "rooftogrid_dev_jwt_secret_insecure_demo"
		log.Println("⚠️  SUPABASE_JWT_SECRET not provided, using dev fallback")
	}

	handler := loggingMiddleware(corsMiddleware(auth.Middleware(jwtSecret)(mux)))

	httpServer := &http.Server{
		Addr:         ":" + port,
		Handler:      handler,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	go func() {
		log.Printf("🚀 RoofToGrid Go API listening on port %s (Zero Node/Python overhead, Supabase Storage & DB)", port)
		if err := httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server error: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down RoofToGrid Go server gracefully...")
}
