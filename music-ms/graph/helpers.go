package graph

// strPtr es un helper para convertir un string a *string, devolviendo nil si está vacío.
func strPtr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}
