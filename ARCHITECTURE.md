# Organizacja kodu w projekcie Astro + React

## Struktura folderów

### Dlaczego `src/lib`?

Folder `lib` to konwencja z TypeScript/Node.js oznaczająca "library" - miejsce na kod pomocniczy:

- **`lib/services/`** - Logika biznesowa, komunikacja z API, operacje na danych
- **`lib/schemas/`** - Walidacja danych (Zod schemas)
- **`lib/utils.ts`** - Funkcje pomocnicze ogólnego użytku
- **`lib/supabase.ts`** - Konfiguracja zewnętrznych serwisów

## Separacja Backend vs Frontend Services

### Backend Services (dla Astro endpoints)
```typescript
// src/lib/services/auth.service.ts
export class AuthService {
  constructor(private readonly supabase: SupabaseClient) {}
  
  async signIn(email: string, password: string): Promise<{ user: User }> {
    // Logika biznesowa po stronie serwera
  }
}
```

### Frontend Services (dla React komponentów)
```typescript
// src/lib/services/auth.client.service.ts  
class AuthClientService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Komunikacja z API endpoints
    return fetch('/api/auth/login', { /* ... */ })
  }
}
```

## Przepływ danych

```
React Component → Frontend Service → API Endpoint → Backend Service → Database
     ↑                ↑                   ↑              ↑              ↑
LoginForm.tsx → auth.client.service → /api/auth/login → auth.service → Supabase
```

## Przykłady użycia

### 1. W Astro API endpoint
```typescript
// src/pages/api/auth/login.ts
import { createAuthService } from "@/lib/services/auth.service";

export const POST: APIRoute = async ({ request, locals }) => {
  const authService = createAuthService(locals.supabase);
  const { user } = await authService.signIn(email, password);
  
  return new Response(JSON.stringify({ user }));
};
```

### 2. W React komponencie
```typescript
// src/components/auth/LoginForm.tsx
import { authClientService } from "@/lib/services/auth.client.service";

export function LoginForm() {
  const handleSubmit = async () => {
    try {
      const result = await authClientService.login(formData);
      window.location.href = "/dashboard";
    } catch (error) {
      // Handle error
    }
  };
}
```

### 3. W Astro komponencie (server-side)
```astro
---
// src/pages/dashboard.astro
import { createAuthService } from "@/lib/services/auth.service";

const authService = createAuthService(Astro.locals.supabase);
const user = await authService.getCurrentUser();

if (!user) {
  return Astro.redirect('/auth/login');
}
---

<Layout>
  <h1>Witaj, {user.email}!</h1>
</Layout>
```

## Zalety tego podejścia

### 1. **Separacja odpowiedzialności**
- Backend services - logika biznesowa
- Frontend services - komunikacja z API
- Components - prezentacja i UX

### 2. **Reużywalność**
```typescript
// Jeden backend service używany w różnych endpoints
const authService = createAuthService(supabase);

// Jeden frontend service używany w różnych komponentach
authClientService.login(credentials);
```

### 3. **Łatwość testowania**
```typescript
// Mock dla testów frontend
jest.mock('@/lib/services/auth.client.service');

// Mock dla testów backend
jest.mock('@/lib/services/auth.service');
```

### 4. **Type Safety**
```typescript
// Współdzielone typy
interface LoginCredentials {
  email: string;
  password: string;
}

// Używane w backend i frontend
```

### 5. **Centralized Error Handling**
```typescript
// Backend
export class AuthError extends Error { /* */ }

// Frontend  
export class AuthClientError extends Error { /* */ }
```

## Best Practices

### 1. **Nazewnictwo plików**
- `*.service.ts` - backend services (używane w Astro endpoints)
- `*.client.service.ts` - frontend services (używane w React)
- `*.schema.ts` - validation schemas (Zod)

### 2. **Factory functions dla serwisów**
```typescript
export function createAuthService(supabase: SupabaseClient): AuthService {
  return new AuthService(supabase);
}
```

### 3. **Singleton dla frontend services**
```typescript
export const authClientService = new AuthClientService();
```

### 4. **Error handling na każdym poziomie**
- Service level - rzuca typed errors
- API level - łapie i mapuje na HTTP responses  
- Component level - łapie i pokazuje user-friendly messages

### 5. **Validation**
```typescript
// W API endpoint
const result = loginSchema.safeParse(body);

// W React component
const error = validateField(name, value);
```

Ten system zapewnia czysty, skalowalny i łatwy w utrzymaniu kod! 🚀