# 📘 Supabase TypeScript Typing Guide

## 🎯 Cel tego dokumentu

Ten przewodnik nauczy Cię jak **poprawnie typować zapytania do Supabase** w TypeScript, aby:
- Mieć pełną autocomplete w IDE
- Unikać błędów w runtime
- Wiedzieć dokładnie jakie pola są wymagane/opcjonalne
- Mieć pewność co do typów zwracanych danych

---

## 🔧 Krok 1: Generowanie typów z bazy danych

### Komenda

```bash
npm run db:types
```

To uruchomi:
```bash
supabase gen types typescript --local > src/types/database.types.ts
```

### Co to robi?

- Łączy się z lokalną bazą Supabase
- Skanuje wszystkie tabele, kolumny, constraints
- Generuje TypeScript types w `src/types/database.types.ts`

### Kiedy to uruchamiać?

**Zawsze po:**
- Dodaniu nowej migracji
- Modyfikacji struktury tabel
- Dodaniu/usunięciu kolumn
- Zmianie typów w bazie

---

## 📦 Krok 2: Zrozumienie wygenerowanych typów

### Struktura `Database` type

```typescript
export type Database = {
  public: {
    Tables: {
      discovery_sessions: {
        Row: {
          id: string
          user_id: string
          initial_description: string
          status: string
          // ... wszystkie kolumny
        }
        Insert: {
          id?: string              // opcjonalne (ma default)
          user_id: string          // wymagane
          initial_description: string
          status?: string          // opcjonalne (ma default)
          // ...
        }
        Update: {
          id?: string              // wszystko opcjonalne
          user_id?: string
          initial_description?: string
          // ...
        }
        Relationships: []
      }
    }
  }
}
```

### 3 kluczowe typy dla każdej tabeli:

1. **`Row`** - typ danych **zwracanych** z SELECT
   - Wszystkie pola non-nullable
   - To co dostajesz z `.select()`

2. **`Insert`** - typ danych do **INSERT**
   - Pola z DEFAULT są opcjonalne
   - Pola NOT NULL bez DEFAULT są wymagane

3. **`Update`** - typ danych do **UPDATE**
   - Wszystkie pola opcjonalne
   - Możesz zaktualizować tylko wybrane kolumny

---

## 🎨 Krok 3: Wyciąganie typów dla konkretnej tabeli

### Metoda 1: Bezpośrednie odwołanie (zalecana)

```typescript
import type { Database } from "@/types/database.types";

type DiscoverySessionRow = Database["public"]["Tables"]["discovery_sessions"]["Row"];
type DiscoverySessionInsert = Database["public"]["Tables"]["discovery_sessions"]["Insert"];
type DiscoverySessionUpdate = Database["public"]["Tables"]["discovery_sessions"]["Update"];
```

### Metoda 2: Helper types (jeśli istnieją)

```typescript
import type { Tables, TablesInsert, TablesUpdate } from "@/types/database.types";

type DiscoverySessionRow = Tables<"discovery_sessions">;
type DiscoverySessionInsert = TablesInsert<"discovery_sessions">;
type DiscoverySessionUpdate = TablesUpdate<"discovery_sessions">;
```

---

## 🔌 Krok 4: Typowanie SupabaseClient

### Problem: Domyślny client nie zna twojej bazy

```typescript
import type { SupabaseClient } from "@supabase/supabase-js";

// ❌ Ten typ nie wie nic o twoich tabelach
constructor(private supabase: SupabaseClient) {}
```

### Rozwiązanie: Generyczny typ z Database schema

```typescript
import type { Database } from "@/types/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

// ✅ Ten typ zna wszystkie twoje tabele i kolumny
type TypedSupabaseClient = SupabaseClient<Database>;

constructor(private supabase: TypedSupabaseClient) {}
```

Teraz TypeScript wie:
- Jakie tabele istnieją (autocomplete w `.from()`)
- Jakie kolumny ma każda tabela (autocomplete w `.select()`)
- Jakie typy przyjmują `.insert()`, `.update()` etc.

---

## 📝 Krok 5: Typowanie operacji CRUD

### INSERT - Zwracanie danych po wstawieniu

```typescript
async startDiscovery(initialData: DiscoveryInitialData): Promise<DiscoverySessionRow> {
  // 1️⃣ Przygotuj dane zgodnie z Insert type
  const insertData: DiscoverySessionInsert = {
    user_id: initialData.userId,
    initial_description: initialData.initialDescription,
    status: "in_progress",  // wartość domyślna
    current_round: 1,
    // created_at i updated_at mają DEFAULT, więc nie podajemy
  };

  // 2️⃣ Insert + select() aby dostać zwrócone dane
  const { data, error } = await this.supabase
    .from("discovery_sessions")
    .insert(insertData)
    .select()      // 👈 BEZ TEGO dostajesz null!
    .single();     // 👈 Zwraca obiekt zamiast array

  if (error) throw new Error(`Insert failed: ${error.message}`);
  if (!data) throw new Error("No data returned");

  // 3️⃣ data jest typu DiscoverySessionRow
  return data;
}
```

**⚠️ WAŻNE:**
- Domyślnie `.insert()` zwraca `null` w `data`
- Musisz dodać `.select()` aby dostać wstawiony rekord
- `.single()` zamienia `Array<Row>` na `Row`

---

### SELECT - Pobieranie danych

```typescript
async getSession(sessionId: string): Promise<DiscoverySessionRow | null> {
  const { data, error } = await this.supabase
    .from("discovery_sessions")
    .select("*")              // lub wybrane kolumny
    .eq("id", sessionId)
    .single();                // lub .maybeSingle() jeśli może nie istnieć

  if (error) throw new Error(`Select failed: ${error.message}`);
  
  // data jest typu DiscoverySessionRow | null
  return data;
}
```

**Różnica między `.single()` a `.maybeSingle()`:**
- `.single()` - rzuca błąd jeśli 0 lub >1 wyników
- `.maybeSingle()` - zwraca `null` jeśli 0 wyników, błąd jeśli >1

---

### UPDATE - Aktualizacja danych

```typescript
async updateSession(
  sessionId: string,
  updates: DiscoverySessionUpdate  // 👈 Wszystkie pola opcjonalne
): Promise<DiscoverySessionRow> {
  const { data, error } = await this.supabase
    .from("discovery_sessions")
    .update(updates)          // TypeScript sprawdzi czy klucze są poprawne
    .eq("id", sessionId)
    .select()                 // Zwróć zaktualizowane dane
    .single();

  if (error) throw new Error(`Update failed: ${error.message}`);
  if (!data) throw new Error("No data returned");

  return data;
}
```

**Przykład użycia:**

```typescript
// ✅ Poprawne - tylko wybrane pola
await service.updateSession("123", {
  status: "completed",
  completeness_score: 85
});

// ❌ Błąd kompilacji - nieistniejące pole
await service.updateSession("123", {
  invalid_field: "value"  // TypeScript error!
});
```

---

### DELETE - Usuwanie danych

```typescript
async deleteSession(sessionId: string): Promise<void> {
  const { error } = await this.supabase
    .from("discovery_sessions")
    .delete()
    .eq("id", sessionId);

  if (error) throw new Error(`Delete failed: ${error.message}`);
}
```

---

## 🔍 Krok 6: Typowanie złożonych zapytań

### SELECT z JOIN (relationships)

```typescript
async getSessionWithQuestions(sessionId: string) {
  const { data, error } = await this.supabase
    .from("discovery_sessions")
    .select(`
      *,
      discovery_questions (
        id,
        question_text,
        category,
        answer
      )
    `)
    .eq("id", sessionId)
    .single();

  if (error) throw new Error(`Query failed: ${error.message}`);
  
  // data ma typ:
  // DiscoverySessionRow & {
  //   discovery_questions: Array<{
  //     id: string;
  //     question_text: string;
  //     category: string;
  //     answer: string | null;
  //   }>
  // }
  
  return data;
}
```

### SELECT z filtrami i sortowaniem

```typescript
async getUserSessions(userId: string): Promise<DiscoverySessionRow[]> {
  const { data, error } = await this.supabase
    .from("discovery_sessions")
    .select("*")
    .eq("user_id", userId)
    .in("status", ["in_progress", "completed"])
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) throw new Error(`Query failed: ${error.message}`);
  
  // data jest typu DiscoverySessionRow[] | null
  return data ?? [];
}
```

---

## 🚀 Krok 7: Best Practices

### 1. Zawsze używaj typowanego klienta

```typescript
// ❌ Źle
constructor(private supabase: SupabaseClient) {}

// ✅ Dobrze
constructor(private supabase: SupabaseClient<Database>) {}
```

### 2. Twórz aliasy typów

```typescript
// Na początku pliku
type DiscoverySession = Database["public"]["Tables"]["discovery_sessions"]["Row"];
type DiscoverySessionInput = Database["public"]["Tables"]["discovery_sessions"]["Insert"];

// Używaj w kodzie
async create(input: DiscoverySessionInput): Promise<DiscoverySession> {
  // ...
}
```

### 3. Waliduj dane wejściowe Zod + TypeScript

```typescript
import { z } from "zod";

// Zod schema dla walidacji runtime
const CreateSessionSchema = z.object({
  userId: z.string().uuid(),
  initialDescription: z.string().min(10).max(10000),
});

type CreateSessionInput = z.infer<typeof CreateSessionSchema>;

async create(input: CreateSessionInput): Promise<DiscoverySession> {
  // 1. Walidacja runtime
  const validated = CreateSessionSchema.parse(input);
  
  // 2. Mapowanie na Insert type
  const insertData: DiscoverySessionInsert = {
    user_id: validated.userId,
    initial_description: validated.initialDescription,
  };
  
  // 3. Insert do bazy
  const { data, error } = await this.supabase
    .from("discovery_sessions")
    .insert(insertData)
    .select()
    .single();
    
  if (error) throw error;
  if (!data) throw new Error("No data returned");
  
  return data;
}
```

### 4. Obsługuj null/undefined właściwie

```typescript
// ❌ Może spowodować runtime error
const session = await getSession(id);
console.log(session.status); // Co jeśli session = null?

// ✅ Sprawdzaj null
const session = await getSession(id);
if (!session) throw new Error("Session not found");
console.log(session.status);

// ✅ Lub użyj optional chaining
const status = session?.status ?? "unknown";
```

### 5. Typy dla response w API endpoints

```typescript
// src/pages/api/discovery/start.ts
import type { APIRoute } from "astro";
import type { Database } from "@/types/database.types";

type DiscoverySession = Database["public"]["Tables"]["discovery_sessions"]["Row"];

export const POST: APIRoute = async ({ request, locals }) => {
  const supabase = locals.supabase;
  
  // ... tworzenie sesji
  
  // Zwracamy typowany response
  return new Response(
    JSON.stringify({
      success: true,
      data: sessionData as DiscoverySession
    }),
    { status: 201 }
  );
};
```

---

## 🐛 Debugowanie problemów

### Problem 1: TypeScript nie widzi nowych tabel

**Rozwiązanie:**
```bash
# 1. Sprawdź czy migracja jest zastosowana
supabase migration list

# 2. Zresetuj bazę i zastosuj migracje
supabase db reset

# 3. Wygeneruj typy ponownie
npm run db:types

# 4. Zrestartuj TypeScript server w VS Code
Cmd+Shift+P -> "TypeScript: Restart TS Server"
```

### Problem 2: `.insert()` zwraca null w data

**Rozwiązanie:**
```typescript
// ❌ Bez .select()
const { data } = await supabase
  .from("table")
  .insert({ ... });
console.log(data); // null

// ✅ Z .select()
const { data } = await supabase
  .from("table")
  .insert({ ... })
  .select();
console.log(data); // [{ id: "...", ... }]
```

### Problem 3: TypeScript narzeka na Insert type

**Przykład błędu:**
```
Type '{ created_at: string }' is not assignable to type 'Insert'.
  'created_at' is defined in the constraint but not provided.
```

**Rozwiązanie:**
```typescript
// created_at ma DEFAULT w bazie, więc NIE podawaj go
const insertData: Insert = {
  user_id: "...",
  // created_at: new Date().toISOString(), // ❌ Usuń to
};
```

### Problem 4: Typy są any

**Sprawdź czy:**
1. `database.types.ts` jest aktualny
2. Importujesz z `@/types/database.types` nie `@/db/database.types`
3. Używasz generycznego `SupabaseClient<Database>`

---

## 📚 Podsumowanie - Checklist

Przy każdym nowym serwisie:

- [ ] Wygeneruj typy: `npm run db:types`
- [ ] Zaimportuj `Database` type
- [ ] Stwórz aliasy dla Row/Insert/Update
- [ ] Typuj SupabaseClient z `<Database>`
- [ ] Używaj `.select()` po `.insert()`
- [ ] Używaj `.single()` dla pojedynczych rekordów
- [ ] Sprawdzaj `error` i `null` w response
- [ ] Waliduj input Zodem
- [ ] Typuj return values metod

---

## 🎓 Przykładowy serwis z pełnym typowaniem

Zobacz: `src/lib/services/langchain/discovery.service.ts`

To jest wzorcowy przykład jak typować wszystkie operacje CRUD w Supabase.

---

## 🔗 Przydatne linki

- [Supabase TypeScript Support](https://supabase.com/docs/guides/api/rest/generating-types)
- [Supabase Client Library](https://supabase.com/docs/reference/javascript/introduction)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
