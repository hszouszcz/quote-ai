# API Endpoint Implementation Plan: Quotation Details View (GET/PUT/DELETE)

## 1. Przegląd punktu końcowego
Cel: Umożliwić klientowi pobieranie szczegółowych informacji o konkretnej wycenie, aktualizację oraz usunięcie wyceny zgodnie z zasadami dostępu i walidacji.

Funkcjonalności:
- **GET**: Pobieranie szczegółów wyceny wraz z powiązanymi zadaniami i ocenami.
- **PUT**: Aktualizacja wyceny (tylko do momentu finalizacji).
- **DELETE**: Usunięcie wyceny z zachowaniem polityki dostępu użytkownika.

## 2. Szczegóły żądania
### Metody HTTP i URL:
- GET    `/api/quotations/{id}`
- PUT    `/api/quotations/{id}`
- DELETE `/api/quotations/{id}`

### Parametry:
- Parametr ścieżki:
  - `id` (UUID) – identyfikator wyceny (wymagany)

### Request Body (dla PUT):
- Struktura JSON:
  - `estimation_type` (opcjonalny, string)
  - `scope` (opcjonalny, string, max. 10000 znaków)
  - `platforms` (opcjonalna tablica identyfikatorów platform)
  - `dynamic_attributes` (opcjonalny, obiekt, elastyczne pola)

Walidacja: Przeprowadzana przy użyciu schematów Zod.

## 3. Wykorzystywane typy
### DTO i Command Modele:
- `QuotationDTO`: reprezentuje wycenę z polami:
  - `id`, `user_id`, `estimation_type`, `scope`, `man_days`, `buffer`, `dynamic_attributes`, `created_at`, `updated_at`
  - Zagnieżdżone właściwości: `tasks` (lista `QuotationTaskDTO`): reprezentuje pojedyncze zadanie wyceny:
  - `id`, `quotation_id`, `task_description`, `created_at`
- `UpdateQuotationCommand`: model dla aktualizacji wyceny (częściowe uaktualnienie pól)

## 4. Szczegóły odpowiedzi
### GET `/api/quotations/{id}`
- Odpowiedź: Obiekt `QuotationDTO` z zagnieżdżonymi `tasks`
- Status: 200 OK

### PUT `/api/quotations/{id}`
- Odpowiedź: Zaktualizowany obiekt `QuotationDTO`
- Status: 200 OK

### DELETE `/api/quotations/{id}`
- Odpowiedź: Komunikat potwierdzający usunięcie wyceny
- Status: 200 OK (lub 204 No Content, w zależności od implementacji)

## 5. Przepływ danych
1. Klient wysyła żądanie HTTP do endpointu.
2. Middleware autoryzacyjne sprawdza token użytkownika i weryfikuje uprawnienia.
3. Parametr `id` jest wyciągany z URL.
4. Dla PUT: treść żądania jest walidowana przy użyciu Zod.
5. Logika biznesowa jest wyodrębniona do serwisu (np. `QuotationService` z metodami: `getQuotationById`, `updateQuotation`, `deleteQuotation`).
6. Serwis komunikuje się z bazą danych PostgreSQL przez Supabase, zgodnie z zasadami RLS.
7. Wynik operacji jest zwracany do klienta w odpowiednim formacie JSON.
8. Błędy (np. brak wyceny, błędne dane) są obsługiwane i zwracane jako kody 400, 401, 404 lub 500.

## 6. Względy bezpieczeństwa
- **Autoryzacja**: Endpointy wymagają ważnego tokena dostępu (OAuth Bearer token).
- **Weryfikacja własności zasobu**: Upewnienie się, że `user_id` w wycenie odpowiada aktualnie zalogowanemu użytkownikowi (RLS na poziomie bazy danych).
- **Walidacja danych wejściowych**: Przy użyciu Zod.
- **Komunikacja**: Użycie HTTPS do przesyłania danych.

## 7. Obsługa błędów
- **400 Bad Request**: Błąd walidacji danych wejściowych (np. przekroczenie limitu znaków dla `scope`).
- **401 Unauthorized**: Brak lub nieważny token autoryzacyjny.
- **404 Not Found**: Wycena o podanym `id` nie istnieje.
- **500 Internal Server Error**: Błędy serwera, problemy z bazą danych.

Logowanie błędów: Błędy mogą być rejestrowane w dedykowanych systemach logowania lub w tabelach (np. `sessions.errors`).

## 8. Rozważania dotyczące wydajności
- **Optymalizacja zapytań**: Wykorzystanie indeksów (np. `quotations.user_id`, `quotation_tasks.quotation_id`, `reviews.quotation_id`).
- **Minimalizacja liczby zapytań**: Zagnieżdżenie danych (JOIN) dla pobierania `tasks`
- **Caching**: Rozważenie wdrożenia mechanizmów cache, jeśli to konieczne.

## 9. Etapy wdrożenia
1. Utworzenie/rozszerzenie schematów walidacji Zod dla metody PUT.
2. Implementacja serwisu `QuotationService` w `src/lib/services/quotationService.ts`:
   - Metody: `getQuotationById`, `updateQuotation`, `deleteQuotation`.
3. Implementacja endpointu w `src/pages/api/quotations/[id].ts`:
   - Obsługa metod GET, PUT i DELETE.
   - Integracja z Supabase wykorzystując `context.locals.supabase`.
4. Implementacja middleware autoryzacyjnego (jeśli nie istnieje) do weryfikacji tokena i uprawnień użytkownika.
5. Testy jednostkowe i integracyjne dla endpointu.
6. Weryfikacja zgodności z zasadami bezpieczeństwa oraz RLS.
7. Code review i testy end-to-end.
8. Deployment do środowiska staging, a następnie produkcyjnego. 