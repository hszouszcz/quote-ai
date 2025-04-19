# API Endpoint Implementation Plan: GET /api/quotations

## 1. Przegląd punktu końcowego
Endpoint służy do pobierania listy wycen (quotations) przypisanych do uwierzytelnionego użytkownika. Wyniki są paginowane oraz opcjonalnie sortowane i filtrowane przy użyciu parametrów zapytania. Endpoint zapewnia, że dostęp do danych ma tylko użytkownik uwierzytelniony oraz obsługuje wymagane operacje na danych.

## 2. Szczegóły żądania
- **Metoda HTTP:** GET
- **Struktura URL:** `/api/quotations`
- **Parametry zapytania:**
  - `page` (wymagany, liczba całkowita) – numer strony, domyślnie 1.
  - `limit` (wymagany, liczba całkowita) – liczba rekordów na stronę, np. 10.
  - `sort` (opcjonalny, string) – kryterium sortowania, np. "created_at:desc"
  - `filter` (opcjonalny, string) – filtr do wyszukiwania, np. fragment opisu lub innych atrybutów
- **Request Body:** Brak

## 3. Wykorzystywane typy
- **QuotationDTO:** Reprezentuje pełny rekord wyceny zawierający:
  - Pola tabeli `quotations` (id, user_id, estimation_type, scope, man_days, buffer, dynamic_attributes, created_at, updated_at)
  - `platforms`: Lista identyfikatorów platform
  - `tasks`: Lista tasków (typ: QuotationTaskDTO)
  - `review`: Opcjonalna recenzja (typ: ReviewDTO)
- Dodatkowo można zdefiniować typ dla metadanych paginacji, np. `PaginationMeta`.

## 4. Szczegóły odpowiedzi
- **Format odpowiedzi (JSON):**
  ```json
  {
    "data": [ /* Array of QuotationDTO */ ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
  ```
- **Kody statusu:**
  - 200 – Pomyślne pobranie danych.
  - 400 – Błędne parametry zapytania.
  - 401 – Brak autoryzacji (użytkownik nie jest zalogowany).
  - 500 – Błąd serwera.

## 5. Przepływ danych
1. Klient wysyła żądanie GET do `/api/quotations` z odpowiednimi parametrami zapytania.
2. Middleware weryfikuje, czy użytkownik jest uwierzytelniony, wykorzystując mechanizm np. `supabase` z `context.locals`.
3. Walidacja parametrów wejściowych odbywa się przy użyciu biblioteki zod.
4. Funkcja serwisowa w `src/lib/services` wykonuje zapytanie do bazy danych:
   - Filtrowanie rekordów na podstawie `user_id` odpowiadającego obecnie zalogowanemu użytkownikowi.
   - Zastosowanie paginacji (limit/offset) oraz ewentualne sortowanie i filtrowanie.
5. Wyniki są mapowane na format obiektów typu `QuotationDTO`.
6. Endpoint zwraca odpowiedź zawierającą listę wycen oraz informacje o paginacji.

## 6. Względy bezpieczeństwa
- **Autentykacja:** Endpoint dostępny wyłącznie dla zalogowanych użytkowników.
- **Walidacja wejścia:** Weryfikacja parametrów przy użyciu zod, aby zapobiec wstrzyknięciom i błędom walidacji.
- **Bezpieczeństwo bazy:** Używanie zapytań parametryzowanych, chroniących przed SQL Injection.
- **Autoryzacja:** Zapewnienie, że dane są dostępne tylko dla użytkownika, który jest właścicielem wycen.

## 7. Obsługa błędów
- **400 Bad Request:** Parametry zapytania mają nieprawidłowy format (np. niepoprawna wartość `page` lub `limit`).
- **401 Unauthorized:** Użytkownik nie jest uwierzytelniony.
- **500 Internal Server Error:** Wystąpienie nieoczekiwanych błędów, np. problem z połączeniem do bazy danych.
- **Logowanie błędów:** Krytyczne błędy są logowane za pomocą odpowiednich narzędzi monitorujących.

## 8. Rozważania dotyczące wydajności
- **Indeksowanie:** Aktualne indeksy na polach `user_id` i `created_at` są kluczowe dla szybkiego wykonania zapytań.
- **Optymalizacja zapytań:** Użycie paginacji (limit/offset) w celu minimalizacji obciążenia bazy.
- **Cache:** Rozważenie mechanizmu cache dla danych, które często się nie zmieniają.
- **Monitorowanie:** Ciągłe monitorowanie wydajności oraz optymalizacja zapytań SQL w razie potrzeby.

## 9. Etapy wdrożenia
1. Utworzenie pliku endpointu w lokalizacji `src/pages/api/quotations.ts` zgodnie z strukturą projektu Astro.
2. Implementacja middleware weryfikującego autentykację użytkownika przy użyciu `context.locals.supabase`.
3. Utworzenie funkcji serwisowej w `src/lib/services` odpowiedzialnej za:
   - Walidację i przetwarzanie parametrów zapytania.
   - Pobieranie wycen z bazy danych na podstawie `user_id`.
4. Implementacja walidacji parametrów zapytania przy użyciu biblioteki zod.
5. Wykonanie zapytań do bazy danych z uwzględnieniem paginacji, sortowania oraz filtrowania.
6. Mapowanie wyników bazy na obiekty typu `QuotationDTO`.
7. Obsługa błędów z przekazywaniem właściwych kodów statusu HTTP (400, 401, 500) oraz logowanie krytycznych błędów.
8. Testowanie endpointu poprzez testy jednostkowe oraz integracyjne.