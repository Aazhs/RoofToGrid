package auth

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"time"
)

type contextKey string

const (
	UserContextKey contextKey = "rooftogrid_user_id"
	RoleContextKey contextKey = "rooftogrid_user_role"
)

// SupabaseClaims represents the payload in a Supabase JWT token.
type SupabaseClaims struct {
	Sub   string `json:"sub"`
	Email string `json:"email"`
	Role  string `json:"role"`
	Aud   string `json:"aud"`
	Exp   int64  `json:"exp"`
	Iat   int64  `json:"iat"`
}

var (
	ErrInvalidFormat    = errors.New("invalid token format")
	ErrInvalidSignature = errors.New("invalid token signature")
	ErrTokenExpired     = errors.New("token has expired")
	ErrMissingSecret    = errors.New("supabase jwt secret not configured")
)

// DecodeBase64URL decodes base64 raw URL encoded strings.
func DecodeBase64URL(s string) ([]byte, error) {
	return base64.RawURLEncoding.DecodeString(s)
}

// EncodeBase64URL encodes bytes to base64 raw URL string.
func EncodeBase64URL(data []byte) string {
	return base64.RawURLEncoding.EncodeToString(data)
}

// ValidateSupabaseToken validates an HS256 Supabase JWT token.
func ValidateSupabaseToken(tokenString string, secret string) (*SupabaseClaims, error) {
	if secret == "" {
		return nil, ErrMissingSecret
	}

	parts := strings.Split(tokenString, ".")
	if len(parts) != 3 {
		return nil, ErrInvalidFormat
	}

	headerB64 := parts[0]
	payloadB64 := parts[1]
	sigB64 := parts[2]

	// Verify HMAC-SHA256 signature
	dataToSign := headerB64 + "." + payloadB64
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(dataToSign))
	expectedSig := mac.Sum(nil)

	actualSig, err := DecodeBase64URL(sigB64)
	if err != nil {
		return nil, ErrInvalidSignature
	}

	if !hmac.Equal(actualSig, expectedSig) {
		return nil, ErrInvalidSignature
	}

	// Decode payload
	payloadBytes, err := DecodeBase64URL(payloadB64)
	if err != nil {
		return nil, ErrInvalidFormat
	}

	var claims SupabaseClaims
	if err := json.Unmarshal(payloadBytes, &claims); err != nil {
		return nil, ErrInvalidFormat
	}

	// Validate expiry
	if claims.Exp > 0 && time.Now().Unix() > claims.Exp {
		return nil, ErrTokenExpired
	}

	return &claims, nil
}

// CreateTestToken generates a signed Supabase HS256 JWT for unit testing.
func CreateTestToken(sub, email, role string, expSeconds int64, secret string) string {
	header := `{"alg":"HS256","typ":"JWT"}`
	headerB64 := EncodeBase64URL([]byte(header))

	now := time.Now().Unix()
	claims := SupabaseClaims{
		Sub:   sub,
		Email: email,
		Role:  role,
		Aud:   "authenticated",
		Iat:   now,
		Exp:   now + expSeconds,
	}
	payloadBytes, _ := json.Marshal(claims)
	payloadB64 := EncodeBase64URL(payloadBytes)

	data := headerB64 + "." + payloadB64
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(data))
	sigB64 := EncodeBase64URL(mac.Sum(nil))

	return data + "." + sigB64
}

// Middleware creates an HTTP middleware that extracts and validates the Supabase JWT.
func Middleware(secret string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			var userID string
			var userRole string

			if authHeader != "" && strings.HasPrefix(authHeader, "Bearer ") {
				token := strings.TrimPrefix(authHeader, "Bearer ")
				claims, err := ValidateSupabaseToken(token, secret)
				if err == nil && claims != nil {
					userID = claims.Sub
					userRole = claims.Role
				}
			}

			// Support fallback demo header in local development mode
			if userID == "" {
				demoHeader := r.Header.Get("X-Demo-User")
				if demoHeader != "" {
					userID = demoHeader
					userRole = "authenticated"
				}
			}

			// If user is authenticated, attach to context
			if userID != "" {
				ctx := context.WithValue(r.Context(), UserContextKey, userID)
				ctx = context.WithValue(ctx, RoleContextKey, userRole)
				next.ServeHTTP(w, r.WithContext(ctx))
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

// UserIDFromContext returns the authenticated user ID from the request context, if present.
func UserIDFromContext(ctx context.Context) string {
	if val, ok := ctx.Value(UserContextKey).(string); ok {
		return val
	}
	return ""
}
