# Error Handling Best Practices - Quote AI

## Przegląd

Ten dokument opisuje najlepsze praktyki dla obsługi błędów w aplikacji Quote AI, zbudowanej w oparciu o Astro, React, TypeScript i Supabase.

## Architektura Error Handling

### 1. Hierarchia Błędów

```typescript
AppError (abstract)
├── ValidationError
├── AuthenticationError  
├── AuthorizationError
├── NotFoundError
├── ConflictError
├── RateLimitError
├── ExternalServiceError
├── DatabaseError
└── InternalServerError
```

### 2. Warstwy aplikacji

- **API Layer**: Używa `withErrorHandling` wrapper
- **Service Layer**: Używa `handleAsyncOperation` i `handleSyncOperation`
- **Component Layer**: Używa `ErrorBoundary` i `useErrorHandler`
- **Validation Layer**: Używa enhanced validation utilities

## Implementacja w różnych warstwach

### API Endpoints

```typescript
import { withErrorHandling, ValidationError } from "@/lib/errors";
import { validateRequestBody } from "@/lib/validation";

export const POST: APIRoute = withErrorHandling(async ({ request, locals }) => {
  // Walidacja
  const data = await validateRequestBody(request, mySchema);
  
  // Autoryzacja
  if (!locals.user) {
    throw new AuthorizationError("Authentication required");
  }
  
  // Logika biznesowa
  const result = await myService.doSomething(data);
  
  return new Response(JSON.stringify({ success: true, data: result }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
});
```

### Services

```typescript
import { handleAsyncOperation, DatabaseError } from "@/lib/errors";

export class MyService {
  async getData(id: string) {
    return handleAsyncOperation(
      async () => {
        const { data, error } = await this.supabase
          .from('table')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) {
          throw new DatabaseError("Failed to fetch data", "getData", { 
            originalError: error 
          });
        }
        
        return data;
      },
      { operation: "getData", id }
    );
  }
}
```

### React Components

```typescript
import { ErrorBoundary, useErrorHandler } from "@/lib/errors";

// Wrapper component z Error Boundary
function MyComponent() {
  return (
    <ErrorBoundary>
      <MyActualComponent />
    </ErrorBoundary>
  );
}

// Hook dla async operations
function MyActualComponent() {
  const { error, executeAsync, clearError } = useErrorHandler();
  
  const handleSubmit = async (data) => {
    await executeAsync(async () => {
      await submitData(data);
    });
  };
  
  if (error) {
    return <div>Error: {error.getUserMessage()}</div>;
  }
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Validation

```typescript
import { validateData, commonSchemas } from "@/lib/validation";

const userSchema = z.object({
  email: commonSchemas.email,
  password: commonSchemas.password,
  age: commonSchemas.positiveNumber
});

// Throws ValidationError on failure
const validatedUser = validateData(userSchema, userData);
```

## Zasady

### 1. Zawsze używaj właściwych typów błędów

```typescript
// ✅ Dobrze
throw new ValidationError("Invalid email format", "email");
throw new AuthenticationError("Invalid credentials");
throw new NotFoundError("User", userId);

// ❌ Źle  
throw new Error("Something went wrong");
throw new InternalServerError("User not found"); // to powinno być NotFoundError
```

### 2. Dodawaj kontekst do błędów

```typescript
// ✅ Dobrze
throw new DatabaseError("Failed to update user", "updateUser", {
  userId,
  operation: "updateProfile",
  timestamp: new Date().toISOString()
});

// ❌ Źle
throw new DatabaseError("Database error");
```

### 3. Używaj error handlers w odpowiednich warstwach

```typescript
// ✅ API Layer
export const POST = withErrorHandling(async (context) => { ... });

// ✅ Service Layer  
return handleAsyncOperation(async () => { ... }, { context });

// ✅ React Components
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>
```

### 4. Waliduj dane na granicy systemu

```typescript
// ✅ W API endpoints
const data = await validateRequestBody(request, schema);

// ✅ W component props
const props = validateData(propsSchema, receivedProps);
```

### 5. Loguj błędy z odpowiednim kontekstem

```typescript
// ✅ Automatyczne przez error handlers
errorReporter.reportError(error, {
  url: request.url,
  method: request.method,
  userAgent: request.headers.get("user-agent")
});
```

## Konfiguracja środowisk

### Development
- Szczegółowe błędy w konsoli
- Stack traces
- Dodatkowe debug informacje

### Production  
- Bezpieczne komunikaty dla użytkownika
- Strukturowane logi w JSON
- Integracja z external monitoring (Sentry, DataDog)

## Monitorowanie

### Metryki do śledzenia
- Częstość różnych typów błędów
- Performance impact error handling
- User experience podczas błędów
- Error recovery rates

### Alerting
- Spike w 5xx errors
- Wysokie częstotliwości ValidationErrors (możliwe ataki)
- Database connection errors
- External service failures

## Migration Guide

### Refaktoryzacja istniejących endpoints

1. **Owinąć handler w `withErrorHandling`**
```typescript
// Przed
export const POST: APIRoute = async ({ request }) => {
  try {
    // logika
  } catch (error) {
    return new Response(JSON.stringify({ error: "Error" }), { status: 500 });
  }
};

// Po
export const POST: APIRoute = withErrorHandling(async ({ request }) => {
  // logika - błędy automatycznie obsłużone
});
```

2. **Zamienić try/catch na proper error throwing**
```typescript
// Przed
try {
  const result = await someOperation();
} catch (error) {
  console.error(error);
  throw new Error("Operation failed");
}

// Po
const result = await handleAsyncOperation(
  () => someOperation(),
  { operation: "someOperation" }
);
```

3. **Dodać proper validation**
```typescript
// Przed
const body = await request.json();
if (!body.email) {
  return new Response(JSON.stringify({ error: "Email required" }), { status: 400 });
}

// Po  
const { email } = await validateRequestBody(request, emailSchema);
```

## Testowanie

### Unit Tests
```typescript
test('should throw ValidationError for invalid data', () => {
  expect(() => validateData(schema, invalidData))
    .toThrow(ValidationError);
});
```

### Integration Tests
```typescript
test('API should return proper error response', async () => {
  const response = await POST({ request: invalidRequest });
  expect(response.status).toBe(400);
  
  const body = await response.json();
  expect(body.error.code).toBe('VALIDATION_ERROR');
});
```

## TODO dla implementacji

1. [ ] Refaktoryzacja wszystkich API endpoints
2. [ ] Refaktoryzacja wszystkich services  
3. [ ] Dodanie Error Boundaries do kluczowych komponentów React
4. [ ] Konfiguracja external error monitoring
5. [ ] Dodanie error handling do middleware
6. [ ] Pisanie testów dla error scenarios
7. [ ] Dokumentacja dla team

## Przykłady z życia

### Obsługa błędów Supabase Auth
```typescript
// Przed - niejasne komunikaty
if (error.message === "Invalid login credentials") {
  throw new Error("Auth error");
}

// Po - jasne, zlokalizowane komunikaty
if (error.message === "Invalid login credentials") {
  throw new AuthenticationError("Nieprawidłowy email lub hasło");
}
```

### Obsługa błędów zewnętrznych API
```typescript
// Przed
try {
  const response = await fetch(externalApi);
  const data = await response.json();
} catch (error) {
  throw new Error("API call failed");
}

// Po
return handleAsyncOperation(
  async () => {
    const response = await fetch(externalApi);
    if (!response.ok) {
      throw new ExternalServiceError("OpenRouter", "API request failed", response.status);
    }
    return await response.json();
  },
  { service: "OpenRouter", endpoint: externalApi }
);
```

Ten system zapewnia:
- **Spójność** - wszystkie błędy mają ten sam format
- **Debugowalność** - bogate informacje kontekstowe  
- **User Experience** - przyjazne komunikaty dla użytkownika
- **Monitoring** - centralne logowanie i reporting
- **Type Safety** - pełna typizacja błędów w TypeScript
- **Maintainability** - łatwe dodawanie nowych typów błędów