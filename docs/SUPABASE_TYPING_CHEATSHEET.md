# 🚀 Supabase TypeScript - Quick Reference

## ⚡ TL;DR - Najważniejsze rzeczy

```bash
# 1. Zawsze po zmianie schematu bazy
npm run db:types
```

```typescript
// 2. Import typów
import type { Database } from "@/types/database.types";
import type { SupabaseClient } from "@/db/supabase.client";

// 3. Wyciągnij typy dla tabeli
type SessionRow = Database["public"]["Tables"]["discovery_sessions"]["Row"];
type SessionInsert = Database["public"]["Tables"]["discovery_sessions"]["Insert"];
type SessionUpdate = Database["public"]["Tables"]["discovery_sessions"]["Update"];

// 4. Użyj w klasie/funkcji
constructor(private supabase: SupabaseClient) {}
```

---

## 📋 Wzorce operacji

### INSERT (Utworzenie rekordu)

```typescript
async create(data: SessionInsert): Promise<SessionRow> {
  const { data: result, error } = await this.supabase
    .from("discovery_sessions")
    .insert(data)
    .select()      // ⚠️ MUSISZ dodać .select()
    .single();     // ⚠️ .single() dla 1 rekordu

  if (error) throw error;
  if (!result) throw new Error("No data returned");
  
  return result;
}
```

**⚠️ Częste błędy:**
- Brak `.select()` → `data` będzie `null`
- Podawanie pól z `DEFAULT` → TypeScript error

---

### SELECT (Pobieranie rekordów)

```typescript
// Pojedynczy rekord (musi istnieć)
async getById(id: string): Promise<SessionRow> {
  const { data, error } = await this.supabase
    .from("discovery_sessions")
    .select("*")
    .eq("id", id)
    .single();     // Rzuci błąd jeśli 0 lub >1 wyników

  if (error) throw error;
  return data!;
}

// Pojedynczy rekord (może nie istnieć)
async findById(id: string): Promise<SessionRow | null> {
  const { data, error } = await this.supabase
    .from("discovery_sessions")
    .select("*")
    .eq("id", id)
    .maybeSingle();  // null jeśli nie ma, error jeśli >1

  if (error) throw error;
  return data;
}

// Lista rekordów
async getAll(): Promise<SessionRow[]> {
  const { data, error } = await this.supabase
    .from("discovery_sessions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// Z filtrowaniem
async getByUserId(userId: string): Promise<SessionRow[]> {
  const { data, error } = await this.supabase
    .from("discovery_sessions")
    .select("*")
    .eq("user_id", userId)
    .in("status", ["in_progress", "completed"])
    .limit(10);

  if (error) throw error;
  return data ?? [];
}
```

---

### UPDATE (Aktualizacja)

```typescript
async update(id: string, updates: SessionUpdate): Promise<SessionRow> {
  const { data, error } = await this.supabase
    .from("discovery_sessions")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  if (!data) throw new Error("No data returned");
  
  return data;
}

// Przykład użycia
await service.update("123", {
  status: "completed",
  completeness_score: 85
});
```

---

### DELETE (Usuwanie)

```typescript
async delete(id: string): Promise<void> {
  const { error } = await this.supabase
    .from("discovery_sessions")
    .delete()
    .eq("id", id);

  if (error) throw error;
}
```

---

## 🔗 JOIN / Relations

```typescript
// SELECT z relacjami
async getWithQuestions(id: string) {
  const { data, error } = await this.supabase
    .from("discovery_sessions")
    .select(`
      *,
      discovery_questions (
        id,
        question_text,
        answer
      )
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  
  // data ma typ:
  // SessionRow & {
  //   discovery_questions: Array<{
  //     id: string;
  //     question_text: string;
  //     answer: string | null;
  //   }>
  // }
  
  return data;
}
```

---

## 🎯 Filtry i operatory

```typescript
// Równość
.eq("status", "completed")

// Nierówność
.neq("status", "abandoned")

// IN (jedna z wartości)
.in("status", ["in_progress", "completed"])

// NOT IN
.not("status", "in", ["abandoned"])

// Greater than / Less than
.gt("completeness_score", 50)
.gte("completeness_score", 50)
.lt("current_round", 3)
.lte("current_round", 3)

// LIKE (zawiera)
.like("initial_description", "%mobile%")
.ilike("initial_description", "%Mobile%")  // case-insensitive

// IS NULL / IS NOT NULL
.is("completed_at", null)
.not("completed_at", "is", null)

// Range
.gte("created_at", "2024-01-01")
.lte("created_at", "2024-12-31")

// Text search
.textSearch("initial_description", "mobile app")

// Sortowanie
.order("created_at", { ascending: false })
.order("completeness_score", { ascending: true, nullsFirst: true })

// Limit i offset (paginacja)
.limit(10)
.range(0, 9)  // pierwsza strona (0-9)
.range(10, 19)  // druga strona (10-19)
```

---

## 🛡️ Error Handling

```typescript
// ✅ Dobry pattern
async create(data: SessionInsert): Promise<SessionRow> {
  const { data: result, error } = await this.supabase
    .from("discovery_sessions")
    .insert(data)
    .select()
    .single();

  // 1. Sprawdź error
  if (error) {
    throw new Error(`Failed to create session: ${error.message}`);
  }

  // 2. Sprawdź null (nie powinno się zdarzyć z .select())
  if (!result) {
    throw new Error("No data returned from insert");
  }

  return result;
}
```

```typescript
// ❌ Zły pattern - brak sprawdzania
async create(data: SessionInsert): Promise<SessionRow> {
  const { data } = await this.supabase
    .from("discovery_sessions")
    .insert(data)
    .select()
    .single();

  return data!;  // ❌ Może być null, może mieć error!
}
```

---

## 🎨 Użycie w Astro API Routes

```typescript
// src/pages/api/discovery/start.ts
import type { APIRoute } from "astro";
import { DiscoveryService } from "@/lib/services/langchain/discovery.service";
import type { Database } from "@/types/database.types";

type SessionRow = Database["public"]["Tables"]["discovery_sessions"]["Row"];

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const body = await request.json();
    
    const service = new DiscoveryService(locals.supabase);
    const session: SessionRow = await service.startDiscovery(body);
    
    return new Response(
      JSON.stringify({ success: true, data: session }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
```

---

## 📦 Eksport i re-eksport typów

```typescript
// src/db/types.ts (opcjonalnie)
import type { Database } from "@/types/database.types";

// Eksportuj często używane typy
export type DiscoverySession = Database["public"]["Tables"]["discovery_sessions"]["Row"];
export type DiscoverySessionInput = Database["public"]["Tables"]["discovery_sessions"]["Insert"];
export type DiscoverySessionUpdate = Database["public"]["Tables"]["discovery_sessions"]["Update"];

export type DiscoveryQuestion = Database["public"]["Tables"]["discovery_questions"]["Row"];
export type DiscoveryQuestionInput = Database["public"]["Tables"]["discovery_questions"]["Insert"];

// W innych plikach
import type { DiscoverySession } from "@/db/types";
```

---

## 🔍 Debugging

```typescript
// Włącz logging w development
const { data, error } = await this.supabase
  .from("discovery_sessions")
  .select("*")
  .eq("id", id);

console.log("Query result:", { data, error });
```

```typescript
// Sprawdź wygenerowane SQL (tylko w development)
// Dodaj do .env
SUPABASE_DEBUG=true
```

---

## 📚 Najczęstsze pytania

### Q: Dlaczego `.insert()` zwraca `null`?

**A:** Musisz dodać `.select()` żeby dostać dane:

```typescript
// ❌ data będzie null
const { data } = await supabase.from("table").insert({...});

// ✅ data będzie Array<Row>
const { data } = await supabase.from("table").insert({...}).select();

// ✅ data będzie Row
const { data } = await supabase.from("table").insert({...}).select().single();
```

---

### Q: Kiedy używać `.single()` vs `.maybeSingle()`?

**A:**
- `.single()` - gdy **wiesz** że rekord istnieje (rzuci error jeśli 0 lub >1)
- `.maybeSingle()` - gdy rekord **może nie istnieć** (zwróci null jeśli 0)

```typescript
// Użyj .single() dla getById (musi istnieć)
const session = await supabase
  .from("sessions")
  .select("*")
  .eq("id", id)
  .single();  // Error jeśli nie ma

// Użyj .maybeSingle() dla findBy (może nie istnieć)
const session = await supabase
  .from("sessions")
  .select("*")
  .eq("email", email)
  .maybeSingle();  // null jeśli nie ma
```

---

### Q: Jak typować response z JOIN?

**A:** TypeScript automatycznie wywnioskuje typ:

```typescript
const { data } = await supabase
  .from("sessions")
  .select(`
    *,
    questions (id, text)
  `)
  .single();

// typeof data =
// SessionRow & {
//   questions: Array<{ id: string; text: string }>
// }
```

---

### Q: Jak obsłużyć pole `Json` z bazy?

**A:** `Json` to type alias:

```typescript
export type Json = 
  | string 
  | number 
  | boolean 
  | null 
  | { [key: string]: Json | undefined } 
  | Json[];

// Możesz zrobić własny type guard:
type FinalAnalysis = {
  confidence: number;
  summary: string;
};

function isFinalAnalysis(json: Json): json is FinalAnalysis {
  return (
    typeof json === "object" &&
    json !== null &&
    "confidence" in json &&
    "summary" in json
  );
}

// Użycie:
if (isFinalAnalysis(session.final_analysis)) {
  console.log(session.final_analysis.confidence);
}
```

---

## ✅ Checklist przed commitowaniem

- [ ] Uruchomiłem `npm run db:types` po zmianach w schemacie
- [ ] Używam `SupabaseClient` z `@/db/supabase.client`, nie `@supabase/supabase-js`
- [ ] Dodałem `.select()` po `.insert()` jeśli potrzebuję danych
- [ ] Sprawdzam `error` w każdym query
- [ ] Sprawdzam `null` przed zwróceniem danych
- [ ] Typy metod są jawnie zdefiniowane (Promise<Row>, Promise<Row[]>, etc.)
- [ ] Używam `.single()` lub `.maybeSingle()` dla pojedynczych rekordów

---

## 🔗 Zobacz też

- [Pełny guide](./SUPABASE_TYPING_GUIDE.md)
- [Przykładowy serwis](../src/lib/services/langchain/discovery.service.ts)
