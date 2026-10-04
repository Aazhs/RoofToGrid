package auth

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestValidateSupabaseToken(t *testing.T) {
	secret := "test-supabase-jwt-secret-xyz-1234567890"

	// Valid token test
	validToken := CreateTestToken("usr_bangalore_123", "homeowner@rooftogrid.in", "authenticated", 3600, secret)
	claims, err := ValidateSupabaseToken(validToken, secret)
	if err != nil {
		t.Fatalf("expected valid token, got err: %v", err)
	}
	if claims.Sub != "usr_bangalore_123" {
		t.Errorf("expected sub usr_bangalore_123, got: %s", claims.Sub)
	}
	if claims.Role != "authenticated" {
		t.Errorf("expected role authenticated, got: %s", claims.Role)
	}

	// Tampered signature test
	badSigToken := validToken[:len(validToken)-4] + "AAAA"
	_, err = ValidateSupabaseToken(badSigToken, secret)
	if err == nil {
		t.Errorf("expected signature error for tampered token")
	}

	// Expired token test
	expiredToken := CreateTestToken("usr_expired_456", "expired@rooftogrid.in", "authenticated", -10, secret)
	_, err = ValidateSupabaseToken(expiredToken, secret)
	if err != ErrTokenExpired {
		t.Errorf("expected ErrTokenExpired, got: %v", err)
	}

	// Wrong secret test
	_, err = ValidateSupabaseToken(validToken, "wrong-secret-key-abcdef")
	if err != ErrInvalidSignature {
		t.Errorf("expected ErrInvalidSignature for wrong secret, got: %v", err)
	}
}

func TestAuthMiddleware(t *testing.T) {
	secret := "my-secret-key-123"
	middleware := Middleware(secret)

	var capturedUser string
	handler := middleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		capturedUser = UserIDFromContext(r.Context())
		w.WriteHeader(http.StatusOK)
	}))

	// Case 1: Valid Bearer Token
	token := CreateTestToken("user_789", "u@r.in", "authenticated", 3600, secret)
	req := httptest.NewRequest("GET", "/api/v1/bills", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, req)

	if capturedUser != "user_789" {
		t.Errorf("expected user_789, got %s", capturedUser)
	}

	// Case 2: X-Demo-User fallback
	capturedUser = ""
	reqDemo := httptest.NewRequest("GET", "/api/v1/bills", nil)
	reqDemo.Header.Set("X-Demo-User", "demo_reviewer")
	wDemo := httptest.NewRecorder()
	handler.ServeHTTP(wDemo, reqDemo)

	if capturedUser != "demo_reviewer" {
		t.Errorf("expected demo_reviewer, got %s", capturedUser)
	}
}
