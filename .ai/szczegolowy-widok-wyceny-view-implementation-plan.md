# Plan implementacji widoku Szczegółowy widok wyceny

## 1. Przegląd
Widok ma na celu prezentację szczegółowych danych wyceny, w tym szczegółowego opisu projektu, listy generowanych zadań z wyliczeniem man-days (MD) oraz doliczonego bufora, a także umożliwienie oceny wyceny poprzez skalę oraz opcjonalny komentarz. Widok umożliwia użytkownikowi weryfikację, edycję (w trybie edycji) oraz ocenę wygenerowanej wyceny.

## 2. Routing widoku
Widok dostępny będzie pod ścieżką: `/quotations/:id`

## 3. Struktura komponentów
- **DetailedQuotationPage**: Strona główna widoku, odpowiedzialna za pobranie danych z API i zarządzanie stanem widoku.
  - **QuotationInfo**: Sekcja prezentująca ogólny opis i kluczowe szczegóły wyceny.
  - **TasksTable**: Tabela z listą zadań, gdzie każda pozycja zawiera numer zadania, opis oraz edytowalną wartość MD.
  - **SummarySection**: Sekcja podsumowująca – wyliczenie łącznej liczby man-days, obliczony bufor (min. 30%) oraz suma MD + bufor.
  - **RatingSection**: Komponent umożliwiający ocenę wyceny poprzez wybór skali (np. gwiazdki) oraz wpisanie opcjonalnego komentarza.
  - **ActionButtons**: Przycisk(y) do przełączenia trybu edycji oraz zapisu wprowadzonych zmian.

## 4. Szczegóły komponentów

### DetailedQuotationPage
- Opis: Kontener odpowiedzialny za pobieranie danych z endpointu GET `/api/quotations/{id}` oraz zarządzanie stanem widoku (w tym trybem edycji).
- Główne elementy: inicjalizacja wywołania API, przekazywanie danych do pod-komponentów.
- Obsługiwane interakcje: ładowanie danych, przełączanie trybu edycji, zapisywanie zmian (wywołanie API PUT `/api/quotations/{id}`).
- Walidacja: Sprawdzenie poprawności pobranych danych.
- Typy: Wykorzystuje `QuotationDTO`, `QuotationTaskDTO`, `ReviewDTO` oraz ewentualnie `DetailedQuotationViewModel`.
- Propsy: Brak (strona pobiera ID z parametrów routingu).

### QuotationInfo
- Opis: Prezentuje szczegółowy opis projektu (scope) oraz inne kluczowe informacje wyceny.
- Główne elementy: nagłówek z tytułem, paragraf z opisem projektu.
- Obsługiwane interakcje: brak specyficznych zdarzeń.
- Walidacja: Wyświetlanie danych zgodnie z modelem bez dodatkowej walidacji.
- Typy: Przyjmuje dane typu `QuotationDTO`.
- Propsy: `{ quotation: QuotationDTO }`

### TasksTable
- Opis: Wyświetla listę zadań z możliwością edycji pola MD (man-days).
- Główne elementy: tabela z nagłówkami (Lp., Opis zadania, MD) oraz wiersze z edytowalnymi polami liczbowymi.
- Obsługiwane interakcje:
  - Zmiana wartości MD przez użytkownika (zdarzenie onChange/onBlur).
- Walidacja:
  - Wartości MD muszą być liczbą dodatnią.
- Typy: Przyjmuje tablicę obiektów typu `QuotationTaskDTO`.
- Propsy: `{ tasks: QuotationTaskDTO[]; onTaskChange?: (updatedTasks: QuotationTaskDTO[]) => void }`

### SummarySection
- Opis: Sekcja podsumowująca, która dynamicznie kalkuluje łączną liczbę man-days, doliczony bufor oraz sumę.
- Główne elementy: tabela lub lista prezentująca wyniki kalkulacji.
- Obsługiwane interakcje: automatyczna aktualizacja wyników przy zmianie danych w `TasksTable`.
- Walidacja: Kalkulacja oparta na prawidłowych wartościach MD.
- Typy: Przyjmuje listę zadań do wyliczeń.
- Propsy: `{ tasks: QuotationTaskDTO[] }`

### RatingSection
- Opis: Umożliwia użytkownikowi ocenę wyceny – wybór ratingu (np. gwiazdek) oraz wpisanie opcjonalnego komentarza.
- Główne elementy: komponent wyboru ratingu (np. wizualne gwiazdki) oraz pole tekstowe dla komentarza.
- Obsługiwane interakcje:
  - Zmiana ratingu (kliknięcia na gwiazdki).
  - Wpisanie komentarza.
- Walidacja:
  - Rating powinien mieścić się w przedziale 1-5.
- Typy: Własny model `RatingViewModel` (np. `{ rating: number; comment?: string }`).
- Propsy: `{ initialRating?: number; initialComment?: string; onRatingChange?: (rating: number, comment: string) => void }`

### ActionButtons
- Opis: Przycisk(y) umożliwiające przełączenie trybu edycji oraz zapisanie wprowadzonych zmian.
- Główne elementy: przycisk „Edytuj” oraz przycisk „Zapisz”.
- Obsługiwane interakcje: kliknięcia inicjujące modyfikację danych i wywołanie API PUT dla zapisu zmian.
- Walidacja: Sprawdzenie poprawności danych przed wysłaniem.
- Typy: Callbacki do działań edycji i zapisu.
- Propsy: `{ onEdit: () => void; onSave: () => void }`

## 5. Typy
Nowe lub rozbudowane typy dla widoku:
- `DetailedQuotationViewModel`:
  - `quotation: QuotationDTO`
  - `tasks: QuotationTaskDTO[]`
  - `reviews: ReviewDTO[]`
  - `rating?: RatingViewModel`
- `RatingViewModel`:
  - `rating: number` (zakres 1-5)
  - `comment?: string`

## 6. Zarządzanie stanem
- Użycie hooków `useState` i `useEffect` do zarządzania stanem pobranych danych wyceny.
- Implementacja custom hooka `useQuotation` do pobrania danych z endpointu GET `/api/quotations/{id}`.
- Stan lokalny dla modyfikowanych wartości w `TasksTable` oraz stanu ratingu.
- Flaga `isEditing` do przełączania między trybem podglądu a edycji.

## 7. Integracja API
- Wywołanie GET `/api/quotations/{id}` przy inicjalizacji widoku w celu pobrania szczegółowych danych.
- Po edycji, wywołanie PUT `/api/quotations/{id}` z wykorzystaniem payload'u zgodnego z `UpdateQuotationCommand` (częściowa aktualizacja danych).
- Wysyłanie tokenu autoryzacyjnego w nagłówkach.

## 8. Interakcje użytkownika
- Na wejściu użytkownik trafia na stronę `/wyceny/:id`, gdzie widok automatycznie pobiera i wyświetla dane wyceny.
- Użytkownik może:
  - Przeglądać szczegółowy opis wyceny oraz listę zadań.
  - Edytować wartości MD bezpośrednio w tabeli (TasksTable), co automatycznie aktualizuje podsumowanie (SummarySection).
  - Wybrać ocenę w RatingSection i opcjonalnie wpisać komentarz.
  - Kliknąć przycisk „Zapisz”, co powoduje walidację danych oraz wysłanie zaktualizowanej wyceny do backendu.
- Oczekiwane rezultaty: aktualizacja danych, zapisanie oceny i komentarza, oraz wyświetlenie odpowiednich komunikatów o powodzeniu lub błędzie operacji.

## 9. Warunki i walidacja
- Walidacja pól:
  - MD: Wartość musi być liczbą dodatnią.
  - Rating: Wartość musi wynosić od 1 do 5.
  - Opis projektu nie przekracza 10000 znaków (wcześniejsza walidacja na formularzu tworzenia wyceny).
- Przed wysłaniem danych, system musi potwierdzić poprawność wszystkich pól.
- Błędy są wyświetlane inline lub poprzez komponent alert.

## 10. Obsługa błędów
- W przypadku błędu podczas pobierania danych (GET) – wyświetlenie komunikatu o niepowodzeniu pobrania wyceny.
- Walidacja danych przed wysłaniem (PUT): jeżeli dane są niepoprawne, wyświetlenie komunikatów błędów przy odpowiednich polach.
- W przypadku nieudanego zapisu zmian – wyświetlenie alertu lub modala z informacją o błędzie.

## 11. Kroki implementacji
1. Utworzenie nowej strony: `src/pages/wyceny/[id].tsx` jako punktu wejścia widoku.
2. Implementacja głównego komponentu `DetailedQuotationPage`:
   - Pobranie danych z API za pomocą custom hooka `useQuotation`.
   - Zarządzanie stanem widoku (tryb edycji, dane wyceny).
3. Stworzenie komponentu `QuotationInfo` do prezentacji opisu wyceny i kluczowych informacji.
4. Budowa `TasksTable`:
   - Wyświetlenie zadań z możliwością edycji MD.
   - Zaimplementowanie walidacji pól liczbowych.
5. Implementacja `SummarySection`:
   - Dynamiczne obliczanie sumy MD, bufora i łącznej wartości.
6. Opracowanie `RatingSection`:
   - Komponent wyboru ratingu oraz pola tekstowego na komentarz.
7. Dodanie `ActionButtons` umożliwiających przełączenie trybu edycji i zapis zmian (wywołanie PUT).
8. Integracja z API:
   - Implementacja mechanizmów GET i PUT, w tym obsługa nagłówków autoryzacji.
9. Testowanie interakcji, walidacji oraz responsywności (Tailwind CSS, dostępność ARIA).
10. Finalne testy integracyjne oraz poprawki zgłoszonych błędów. 