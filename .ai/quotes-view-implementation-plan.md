# Plan implementacji widoku Lista wycen użytkownika

## 1. Przegląd
Widok Lista wycen użytkownika umożliwia przeglądanie historii wygenerowanych wycen. Prezentowane informacje obejmują: datę utworzenia, liczbę man-days, typ wyceny, wartość bufora, a także ewentualną ocenę i komentarze. Celem widoku jest umożliwienie szybkiego i intuicyjnego dostępu do historii wycen poprzez sortowanie, filtrowanie i paginację.

## 2. Routing widoku
Widok będzie dostępny pod ścieżką: `/quotations`.

## 3. Struktura komponentów
- **QuotesListView** (główny komponent widoku)
  - **QuotesFilters** – umożliwia filtrowanie wycen według daty, platformy, typu wyceny i wyszukiwania tekstowego
  - **QuotesTable** – prezentuje dane w formie tabeli (kolumny: data utworzenia, man-days, typ wyceny, bufor, treści opisu projektu (do 100 znaków) itp.)
  - **Pagination** – kontrola paginacji, umożliwiająca zmianę stron
  - Opcjonalnie: **Loader** i **ErrorBanner** do obsługi stanów ładowania i błędów

## 4. Szczegóły komponentów
### QuotesListView
- **Opis**: Główny komponent zarządzający pobieraniem danych z API, utrzymaniem stanu widoku oraz koordynacją filtrów, sortowania i paginacji.
- **Główne elementy**: Nagłówek widoku, komponent filtrów, tabela wycen, komponent paginacji.
- **Obsługiwane interakcje**: 
  - Zmiana filtrów i sortowania
  - Zmiana aktualnej strony
  - Kliknięcie w wiersz tabeli powodujące przekierowanie do szczegółowego widoku wyceny (np. `/quotations/:id`)
- **Walidacja**: Weryfikacja poprawności danych pobranych z API (obecność kluczowych pól: `id`, `created_at`, `man_days`, `buffer`)
- **Typy**: Wykorzystuje typy `QuotationDTO` (dane z API) oraz transformowany model widoku `QuotationVM`.
- **Propsy**: Jeżeli komponent jest częścią szerszego layoutu, może otrzymywać np. `userId`.

### QuotesFilters
- **Opis**: Komponent umożliwiający użytkownikowi filtrowanie listy wycen.
- **Główne elementy**: 
  - Input tekstowy do wyszukiwania
  - Selektory (np. kalendarz do wyboru daty, select do wyboru platformy lub typu wyceny)
- **Obsługiwane interakcje**: Wprowadzanie i zmiana wartości filtrów, które przekazywane są przez callback do komponentu rodzica.
- **Walidacja**: Sprawdzenie formatu daty i poprawności wprowadzonego tekstu.
- **Typy**: Definicja modelu filtrów `FiltersVM` zawierającego: `page`, `limit`, `sort`, `filter`.
- **Propsy**: Callback `onFilterChange` do aktualizacji filtrów w komponencie rodzica.

### QuotesTable
- **Opis**: Komponent odpowiedzialny za prezentację danych wyceny w formie tabeli.
- **Główne elementy**: 
  - Nagłówki kolumn (Data utworzenia, Man-Days, Typ wyceny, Bufor, Opis)
  - Wiersze zawierające dane poszczególnych wycen
- **Obsługiwane interakcje**: 
  - Kliknięcie nagłówków w celu sortowania
  - Kliknięcie w wiersz, które prowadzi do szczegółowego widoku wyceny
- **Walidacja**: Weryfikacja obecności wszystkich wymaganych danych przed renderowaniem wiersza
- **Typy**: Wykorzystanie modelu widoku `QuotationVM`.
- **Propsy**: Lista obiektów `QuotationVM` przekazywana do komponentu oraz callback `onSortChange`.

### Pagination
- **Opis**: Komponent umożliwiający przełączanie stron w liście wycen.
- **Główne elementy**: Przycisk poprzednia/następna strona, wyświetlanie numerów stron.
- **Obsługiwane interakcje**: Zmiana bieżącej strony, co powoduje pobranie odpowiednich danych z API.
- **Walidacja**: Sprawdzenie poprawności numeru bieżącej strony (musi być dodatnia liczba całkowita).
- **Typy**: Model `PaginationVM` z polami: `page`, `limit`, `total`, `totalPages`.
- **Propsy**: Callback `onPageChange` oraz dane paginacyjne przekazywane z API.

## 5. Typy
- **QuotationVM**:
  - `id`: string
  - `created_at`: string (ISO)
  - `estimation_type`: "Fixed Price" | "Time & Material"
  - `scope`: string (skrót opisu, ewentualnie z ograniczeniem długości)
  - `man_days`: number
  - `buffer`: number
  - `platforms`: string[]
  - `review?`: obiekt z polami np. `rating` i `comment`
- **FiltersVM**:
  - `page`: number
  - `limit`: number
  - `sort`: string (np. "created_at:desc")
  - `filter`: string (tekst wyszukiwania)
- **PaginationVM**:
  - `page`: number
  - `limit`: number
  - `total`: number
  - `totalPages`: number

## 6. Zarządzanie stanem
- Główny komponent `QuotesListView` będzie używał hooków `useState` do kontroli:
  - Listy wycen (`quotes`)
  - Stanu ładowania (`isLoading`)
  - Stanu błędu (`error`)
  - Aktualnych filtrów (`filters` zgodnych z modelem `FiltersVM`)
- Użycie `useEffect` do pobierania danych z endpointu GET `/api/quotations` przy zmianie filtrów, sortowania lub aktualnej strony.
- Opcjonalnie: użycie bibliotek typu SWR lub React Query, aby zarządzać pobieraniem i cache'owaniem danych.

## 7. Integracja API
- **Endpoint**: GET `/api/quotations`
- **Parametry**: `page`, `limit`, `sort`, `filter` wysyłane jako query params
- **Odpowiedź**: Typ `ListQuotationsResult` zawierający listę wycen i metadane paginacji
- **Implementacja**: Wywołanie API w hooku `useEffect` w `QuotesListView`, przetworzenie danych na `QuotationVM` i przekazanie do `QuotesTable`.

## 8. Interakcje użytkownika
- Wprowadzenie tekstu lub wyboru filtrów w komponencie `QuotesFilters` powoduje aktualizację stanu filtrów i ponowne pobranie danych.
- Kliknięcie nagłówka tabeli w `QuotesTable` zmienia kryteria sortowania, co skutkuje re-pobranie danych.
- Użytkownik zmienia stronę przy użyciu komponentu `Pagination`, co prowadzi do pobrania danych dla nowej strony.
- Kliknięcie w wiersz tabeli przekierowuje użytkownika do szczegółowego widoku konkretnej wyceny (`/wyceny/:id`).

## 9. Warunki i walidacja
- **Walidacja danych API**: Sprawdzenie, czy kluczowe pola (np. `id`, `created_at`, `man_days`) są obecne i poprawne.
- **Walidacja filtrów**: Upewnienie się, że dane wejściowe (np. data, tekst) są w prawidłowym formacie.
- **Paginacja**: Numer strony musi być dodatnią liczbą całkowitą oraz limit nie może przekraczać ustalonego maksimum.

## 10. Obsługa błędów
- W przypadku błędu pobierania danych, wyświetlenie komunikatu przy użyciu komponentu `ErrorBanner`.
- Informacja o błędzie powinna zawierać możliwość ponownego załadowania danych (retry).
- Logowanie błędów dla celów debugowania.

## 11. Kroki implementacji
1. Utworzenie nowej strony/komponentu widoku w katalogu  `src/pages/quotations`.
2. Implementacja głównego komponentu `QuotesListView` z logiką pobierania danych oraz zarządzania stanem (filtrów, paginacji, sortowania).
3. Stworzenie komponentu `QuotesFilters` z polami wyszukiwania, selektorami dat i wyboru filtrów.
4. Implementacja komponentu `QuotesTable` do renderowania tabeli z danymi wycen, wraz z obsługą sortowania i kliknięcia w wiersze.
5. Utworzenie komponentu `Pagination` do kontrolowania zmiany stron.
6. Integracja wywołania API: GET `/api/quotations` w `QuotesListView` z parametrami pobieranymi ze stanu filtrów.
7. Implementacja walidacji danych wejściowych oraz sprawdzanie poprawności odpowiedzi API.
8. Dodanie obsługi błędów i stanów ładowania (komponenty typu `Loader`/`ErrorBanner`).
9. Stylizacja komponentów z użyciem Tailwind CSS i komponentów Shadcn/ui.

