# Schemat bazy danych PostgreSQL - AI Wycena

## 1. Tabele

### users
- `id`: UUID, PRIMARY KEY, domyślnie generowany za pomocą gen_random_uuid()
- `email`: VARCHAR(255), NOT NULL, UNIQUE
- `role`: VARCHAR(50), NOT NULL
- `hashed_password`: TEXT, NOT NULL
- `created_at`: TIMESTAMPTZ, domyślnie ustawiony na now(),
- `updated_at`: TIMESTAMPTZ, domyślnie ustawiony na now()

### quotations
- `id`: UUID, PRIMARY KEY, domyślnie generowany za pomocą gen_random_uuid()
- `user_id`: UUID, NOT NULL, REFERENCES users(id)
- `estimation_type`: VARCHAR(50), NOT NULL
- `scope`: TEXT, NOT NULL, CHECK (char_length(scope) <= 10000)
- `man_days`: NUMERIC, NOT NULL
- `buffer`: NUMERIC, NOT NULL
- `dynamic_attributes`: JSONB, opcjonalne
- `created_at`: TIMESTAMPTZ, domyślnie ustawiony na now()
- `updated_at`: TIMESTAMPTZ, domyślnie ustawiony na now()

### platforms
- `id`: UUID, PRIMARY KEY, domyślnie generowany za pomocą gen_random_uuid()
- `name`: VARCHAR(100), NOT NULL, UNIQUE

### quotation_platforms (relacja many-to-many)
- `quotation_id`: UUID, NOT NULL, REFERENCES quotations(id) ON DELETE CASCADE
- `platform_id`: UUID, NOT NULL, REFERENCES platforms(id) ON DELETE CASCADE
- PRIMARY KEY (quotation_id, platform_id)

### quotation_tasks
- `id`: UUID, PRIMARY KEY, domyślnie generowany za pomocą gen_random_uuid()
- `quotation_id`: UUID, NOT NULL, REFERENCES quotations(id) ON DELETE CASCADE
- `task_description`: TEXT, NOT NULL
- `created_at`: TIMESTAMPTZ, domyślnie ustawiony na now()

### reviews
- `id`: UUID, PRIMARY KEY, domyślnie generowany za pomocą gen_random_uuid()
- `quotation_id`: UUID, NOT NULL, REFERENCES quotations(id) ON DELETE CASCADE
- `rating`: INTEGER, NOT NULL, CHECK (rating BETWEEN 1 AND 5)
- `comment`: TEXT, opcjonalne
- `created_at`: TIMESTAMPTZ, domyślnie ustawiony na now()

### sessions
- `id`: UUID, PRIMARY KEY, domyślnie generowany za pomocą gen_random_uuid()
- `user_id`: UUID, NOT NULL, REFERENCES users(id) ON DELETE CASCADE
- `session_id`: VARCHAR(255), NOT NULL, UNIQUE
- `user_agent`: TEXT
- `errors`: TEXT
- `created_at`: TIMESTAMPTZ, domyślnie ustawiony na now()

## 2. Relacje między tabelami

- users 1 ── * quotations (każda wycena należy do jednego użytkownika)
- quotations 1 ── * quotation_tasks (każda wycena może mieć wiele zadań scope)
- quotations 1 ── * reviews (każda wycena może mieć wiele ocen/reviews)
- quotations * ── * platforms poprzez tabelę quotation_platforms
- users 1 ── * sessions (każdy użytkownik może mieć wiele sesji)

## 3. Indeksy

- Unikalny indeks na users.email
- Indeks na quotations.user_id
- Indeks na quotation_tasks.quotation_id
- Indeks na reviews.quotation_id
- Indeks na sessions.user_id oraz sessions.created_at dla optymalizacji zapytań

## 4. Zasady PostgreSQL (RLS)

Wdrażane polityki RLS umożliwiają dostęp do danych wyłącznie właścicielowi konta. Przykładowa polityka dla tabeli quotations:

```sql
ALTER TABLE quotations ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_owns_quotation ON quotations
    USING (user_id = current_setting('app.current_user_id')::uuid);
```

Podobne polityki RLS należy zaimplementować dla tabel: quotation_tasks, reviews i sessions.

## 5. Dodatkowe uwagi

- Dynamiczne atrybuty w kolumnie dynamic_attributes umożliwiają elastyczne rozszerzanie danych bez zmiany schematu.
- Pola z datami (created_at, updated_at) ułatwiają śledzenie zmian oraz planowanie backupów.
- Ograniczenie długości pola scope zapewnia integralność danych.
- Implementacja indeksów na krytycznych kolumnach wspiera wydajność i skalowalność systemu. 