package db

import (
	"context"
	"testing"
)

func TestMemoryRepository(t *testing.T) {
	repo := NewMemoryRepository()
	ctx := context.Background()

	// Test Bills
	bills, err := repo.ListBills(ctx, "demo_user")
	if err != nil {
		t.Fatalf("unexpected error listing bills: %v", err)
	}
	if len(bills) == 0 {
		t.Fatalf("expected seeded demo bills, got 0")
	}

	newBill, err := repo.SaveBill(ctx, ElectricityBill{
		UserID:       "demo_user",
		BillMonth:    "2026-09",
		UnitsKwh:     550,
		TariffPerKwh: 7.5,
		Source:       "MANUAL",
	})
	if err != nil {
		t.Fatalf("failed to save bill: %v", err)
	}
	if newBill.ID == "" {
		t.Fatalf("expected generated ID for bill")
	}

	billsAfter, _ := repo.ListBills(ctx, "demo_user")
	if len(billsAfter) != len(bills)+1 {
		t.Fatalf("expected %d bills, got %d", len(bills)+1, len(billsAfter))
	}

	// Test Roofs
	roofs, err := repo.ListRoofs(ctx, "demo_user")
	if err != nil {
		t.Fatalf("unexpected error listing roofs: %v", err)
	}
	if len(roofs) == 0 {
		t.Fatalf("expected seeded demo roofs, got 0")
	}

	// Test Quotes
	quotes, err := repo.ListQuotes(ctx, "demo_user")
	if err != nil {
		t.Fatalf("unexpected error listing quotes: %v", err)
	}
	if len(quotes) == 0 {
		t.Fatalf("expected seeded demo quotes, got 0")
	}

	// Health check
	ok, detail := repo.Health(ctx)
	if !ok {
		t.Fatalf("expected health ok, got false: %s", detail)
	}
}
