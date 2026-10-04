package db

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"log"
	"os"
	"sync"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type ElectricityBill struct {
	ID               string    `json:"id"`
	UserID           string    `json:"userId"`
	BillMonth        string    `json:"billMonth"` // YYYY-MM
	UnitsKwh         float64   `json:"unitsKwh"`
	BillAmount       *float64  `json:"billAmount,omitempty"`
	TariffPerKwh     float64   `json:"tariffPerKwh"`
	SanctionedLoadKw *float64  `json:"sanctionedLoadKw,omitempty"`
	Source           string    `json:"source"`
	Notes            string    `json:"notes,omitempty"`
	CreatedAt        time.Time `json:"createdAt"`
}

type RoofProfile struct {
	ID             string    `json:"id"`
	UserID         string    `json:"userId"`
	Label          string    `json:"label"`
	RoofType       string    `json:"roofType"`
	UsableAreaSqft float64   `json:"usableAreaSqft"`
	Orientation    string    `json:"orientation"`
	TiltDegrees    *float64  `json:"tiltDegrees,omitempty"`
	ShadingLevel   string    `json:"shadingLevel"`
	IsPrimary      bool      `json:"isPrimary"`
	CreatedAt      time.Time `json:"createdAt"`
}

type SavedQuote struct {
	ID            string    `json:"id"`
	UserID        string    `json:"userId"`
	InstallerName string    `json:"installerName"`
	SystemSizeKwp float64   `json:"systemSizeKwp"`
	TotalPrice    float64   `json:"totalPrice"`
	PanelBrand    string    `json:"panelBrand"`
	PanelTech     string    `json:"panelTech"`
	InverterBrand string    `json:"inverterBrand"`
	OverallScore  float64   `json:"overallScore"`
	CreatedAt     time.Time `json:"createdAt"`
}

type SupabaseRepository interface {
	SaveBill(ctx context.Context, bill ElectricityBill) (ElectricityBill, error)
	ListBills(ctx context.Context, userID string) ([]ElectricityBill, error)
	SaveRoof(ctx context.Context, roof RoofProfile) (RoofProfile, error)
	ListRoofs(ctx context.Context, userID string) ([]RoofProfile, error)
	SaveQuote(ctx context.Context, quote SavedQuote) (SavedQuote, error)
	ListQuotes(ctx context.Context, userID string) ([]SavedQuote, error)
	Health(ctx context.Context) (bool, string)
	Close()
}

// PostgresRepository communicates with Supabase PostgreSQL via connection pooling
type PostgresRepository struct {
	pool *pgxpool.Pool
}

// MemoryRepository acts as an in-memory fallback for local demo and test runs
type MemoryRepository struct {
	mu     sync.RWMutex
	bills  map[string][]ElectricityBill
	roofs  map[string][]RoofProfile
	quotes map[string][]SavedQuote
}

func generateID(prefix string) string {
	b := make([]byte, 8)
	_, _ = rand.Read(b)
	return fmt.Sprintf("%s_%s", prefix, hex.EncodeToString(b))
}

func NewMemoryRepository() *MemoryRepository {
	repo := &MemoryRepository{
		bills:  make(map[string][]ElectricityBill),
		roofs:  make(map[string][]RoofProfile),
		quotes: make(map[string][]SavedQuote),
	}

	// Seed sample Bangalore prototype data for demo mode
	demoUser := "demo_user"
	now := time.Now().UTC()

	amount1 := 4650.0
	load1 := 5.0
	repo.bills[demoUser] = []ElectricityBill{
		{
			ID:               generateID("bill"),
			UserID:           demoUser,
			BillMonth:        "2026-08",
			UnitsKwh:         620,
			BillAmount:       &amount1,
			TariffPerKwh:     7.5,
			SanctionedLoadKw: &load1,
			Source:           "MANUAL",
			Notes:            "Monsoon month with moderate AC usage",
			CreatedAt:        now,
		},
	}

	repo.roofs[demoUser] = []RoofProfile{
		{
			ID:             generateID("roof"),
			UserID:         demoUser,
			Label:          "RCC Flat Rooftop",
			RoofType:       "FLAT",
			UsableAreaSqft: 450,
			Orientation:    "S",
			ShadingLevel:   "NONE",
			IsPrimary:      true,
			CreatedAt:      now,
		},
	}

	repo.quotes[demoUser] = []SavedQuote{
		{
			ID:            generateID("quote"),
			UserID:        demoUser,
			InstallerName: "Tata Power Solar Systems",
			SystemSizeKwp: 5.0,
			TotalPrice:    340000,
			PanelBrand:    "Tata Power Solar 545W",
			PanelTech:     "TOPCON",
			InverterBrand: "Growatt 5000TL3-S",
			OverallScore:  9.4,
			CreatedAt:     now,
		},
	}

	return repo
}

func (m *MemoryRepository) SaveBill(_ context.Context, bill ElectricityBill) (ElectricityBill, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	if bill.ID == "" {
		bill.ID = generateID("bill")
	}
	bill.CreatedAt = time.Now().UTC()
	m.bills[bill.UserID] = append(m.bills[bill.UserID], bill)
	return bill, nil
}

func (m *MemoryRepository) ListBills(_ context.Context, userID string) ([]ElectricityBill, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	list, exists := m.bills[userID]
	if !exists {
		return []ElectricityBill{}, nil
	}
	return list, nil
}

func (m *MemoryRepository) SaveRoof(_ context.Context, roof RoofProfile) (RoofProfile, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	if roof.ID == "" {
		roof.ID = generateID("roof")
	}
	roof.CreatedAt = time.Now().UTC()
	m.roofs[roof.UserID] = append(m.roofs[roof.UserID], roof)
	return roof, nil
}

func (m *MemoryRepository) ListRoofs(_ context.Context, userID string) ([]RoofProfile, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	list, exists := m.roofs[userID]
	if !exists {
		return []RoofProfile{}, nil
	}
	return list, nil
}

func (m *MemoryRepository) SaveQuote(_ context.Context, quote SavedQuote) (SavedQuote, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	if quote.ID == "" {
		quote.ID = generateID("quote")
	}
	quote.CreatedAt = time.Now().UTC()
	m.quotes[quote.UserID] = append(m.quotes[quote.UserID], quote)
	return quote, nil
}

func (m *MemoryRepository) ListQuotes(_ context.Context, userID string) ([]SavedQuote, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()
	list, exists := m.quotes[userID]
	if !exists {
		return []SavedQuote{}, nil
	}
	return list, nil
}

func (m *MemoryRepository) Health(_ context.Context) (bool, string) {
	return true, "in-memory (standalone demo repository)"
}

func (m *MemoryRepository) Close() {}

// ConnectRepository initializes either a Supabase PostgreSQL pgxpool or falls back gracefully to in-memory
func ConnectRepository(ctx context.Context) SupabaseRepository {
	dbURL := os.Getenv("SUPABASE_DATABASE_URL")
	if dbURL == "" {
		dbURL = os.Getenv("DATABASE_URL")
	}

	if dbURL == "" {
		log.Println("ℹ️  No DATABASE_URL or SUPABASE_DATABASE_URL provided. Running with in-memory Supabase repository.")
		return NewMemoryRepository()
	}

	config, err := pgxpool.ParseConfig(dbURL)
	if err != nil {
		log.Printf("⚠️  Failed to parse database connection string: %v. Using in-memory fallback.", err)
		return NewMemoryRepository()
	}

	config.MaxConns = 10
	config.MinConns = 1
	config.MaxConnLifetime = 30 * time.Minute
	config.MaxConnIdleTime = 5 * time.Minute

	connectCtx, cancel := context.WithTimeout(ctx, 3*time.Second)
	defer cancel()

	pool, err := pgxpool.NewWithConfig(connectCtx, config)
	if err != nil {
		log.Printf("⚠️  Unable to connect to Supabase PostgreSQL: %v. Falling back to in-memory repository.", err)
		return NewMemoryRepository()
	}

	if err := pool.Ping(connectCtx); err != nil {
		log.Printf("⚠️  Supabase PostgreSQL ping failed: %v. Falling back to in-memory repository.", err)
		pool.Close()
		return NewMemoryRepository()
	}

	log.Println("✅ Successfully connected to Supabase PostgreSQL database pool.")
	return &PostgresRepository{pool: pool}
}

func (p *PostgresRepository) SaveBill(ctx context.Context, bill ElectricityBill) (ElectricityBill, error) {
	if bill.ID == "" {
		bill.ID = generateID("bill")
	}
	bill.CreatedAt = time.Now().UTC()

	query := `
		INSERT INTO electricity_bill_summaries (id, "userId", "billMonth", "unitsKwh", "billAmount", "tariffPerKwh", "sanctionedLoadKw", source, notes, "createdAt", "updatedAt")
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		RETURNING id, "createdAt"
	`
	err := p.pool.QueryRow(ctx, query,
		bill.ID, bill.UserID, bill.BillMonth, bill.UnitsKwh, bill.BillAmount,
		bill.TariffPerKwh, bill.SanctionedLoadKw, bill.Source, bill.Notes,
		bill.CreatedAt, bill.CreatedAt,
	).Scan(&bill.ID, &bill.CreatedAt)

	if err != nil {
		return bill, fmt.Errorf("failed to save electricity bill: %w", err)
	}
	return bill, nil
}

func (p *PostgresRepository) ListBills(ctx context.Context, userID string) ([]ElectricityBill, error) {
	query := `
		SELECT id, "userId", "billMonth", "unitsKwh", "billAmount", "tariffPerKwh", "sanctionedLoadKw", source, notes, "createdAt"
		FROM electricity_bill_summaries
		WHERE "userId" = $1
		ORDER BY "billMonth" DESC
	`
	rows, err := p.pool.Query(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to list electricity bills: %w", err)
	}
	defer rows.Close()

	var bills []ElectricityBill
	for rows.Next() {
		var b ElectricityBill
		if err := rows.Scan(
			&b.ID, &b.UserID, &b.BillMonth, &b.UnitsKwh, &b.BillAmount,
			&b.TariffPerKwh, &b.SanctionedLoadKw, &b.Source, &b.Notes, &b.CreatedAt,
		); err != nil {
			return nil, err
		}
		bills = append(bills, b)
	}
	return bills, nil
}

func (p *PostgresRepository) SaveRoof(ctx context.Context, roof RoofProfile) (RoofProfile, error) {
	if roof.ID == "" {
		roof.ID = generateID("roof")
	}
	roof.CreatedAt = time.Now().UTC()

	query := `
		INSERT INTO roof_profiles (id, "userId", label, "roofType", "usableAreaSqft", orientation, "tiltDegrees", "shadingLevel", "isPrimary", "createdAt", "updatedAt")
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		RETURNING id, "createdAt"
	`
	err := p.pool.QueryRow(ctx, query,
		roof.ID, roof.UserID, roof.Label, roof.RoofType, roof.UsableAreaSqft,
		roof.Orientation, roof.TiltDegrees, roof.ShadingLevel, roof.IsPrimary,
		roof.CreatedAt, roof.CreatedAt,
	).Scan(&roof.ID, &roof.CreatedAt)

	if err != nil {
		return roof, fmt.Errorf("failed to save roof profile: %w", err)
	}
	return roof, nil
}

func (p *PostgresRepository) ListRoofs(ctx context.Context, userID string) ([]RoofProfile, error) {
	query := `
		SELECT id, "userId", label, "roofType", "usableAreaSqft", orientation, "tiltDegrees", "shadingLevel", "isPrimary", "createdAt"
		FROM roof_profiles
		WHERE "userId" = $1
		ORDER BY "createdAt" DESC
	`
	rows, err := p.pool.Query(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to query roof profiles: %w", err)
	}
	defer rows.Close()

	var roofs []RoofProfile
	for rows.Next() {
		var r RoofProfile
		if err := rows.Scan(
			&r.ID, &r.UserID, &r.Label, &r.RoofType, &r.UsableAreaSqft,
			&r.Orientation, &r.TiltDegrees, &r.ShadingLevel, &r.IsPrimary, &r.CreatedAt,
		); err != nil {
			return nil, err
		}
		roofs = append(roofs, r)
	}
	return roofs, nil
}

func (p *PostgresRepository) SaveQuote(ctx context.Context, quote SavedQuote) (SavedQuote, error) {
	if quote.ID == "" {
		quote.ID = generateID("quote")
	}
	quote.CreatedAt = time.Now().UTC()

	query := `
		INSERT INTO quotes (id, "userId", "installerName", "systemSizeKwp", "totalPrice", "panelBrand", "panelTechnology", "inverterBrand", "overallScore", "createdAt", "updatedAt")
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		RETURNING id, "createdAt"
	`
	err := p.pool.QueryRow(ctx, query,
		quote.ID, quote.UserID, quote.InstallerName, quote.SystemSizeKwp,
		quote.TotalPrice, quote.PanelBrand, quote.PanelTech, quote.InverterBrand,
		quote.OverallScore, quote.CreatedAt, quote.CreatedAt,
	).Scan(&quote.ID, &quote.CreatedAt)

	if err != nil {
		return quote, fmt.Errorf("failed to save quote: %w", err)
	}
	return quote, nil
}

func (p *PostgresRepository) ListQuotes(ctx context.Context, userID string) ([]SavedQuote, error) {
	query := `
		SELECT id, "userId", "installerName", "systemSizeKwp", "totalPrice", "panelBrand", "panelTechnology", "inverterBrand", "overallScore", "createdAt"
		FROM quotes
		WHERE "userId" = $1
		ORDER BY "createdAt" DESC
	`
	rows, err := p.pool.Query(ctx, query, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to list quotes: %w", err)
	}
	defer rows.Close()

	var quotes []SavedQuote
	for rows.Next() {
		var q SavedQuote
		if err := rows.Scan(
			&q.ID, &q.UserID, &q.InstallerName, &q.SystemSizeKwp,
			&q.TotalPrice, &q.PanelBrand, &q.PanelTech, &q.InverterBrand,
			&q.OverallScore, &q.CreatedAt,
		); err != nil {
			return nil, err
		}
		quotes = append(quotes, q)
	}
	return quotes, nil
}

func (p *PostgresRepository) Health(ctx context.Context) (bool, string) {
	if err := p.pool.Ping(ctx); err != nil {
		return false, fmt.Sprintf("Supabase PostgreSQL ping failed: %v", err)
	}
	return true, "connected to Supabase PostgreSQL pool"
}

func (p *PostgresRepository) Close() {
	if p.pool != nil {
		p.pool.Close()
	}
}
