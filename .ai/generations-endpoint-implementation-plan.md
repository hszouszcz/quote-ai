# API Endpoint Implementation Plan: POST /api/quotations

## 1. Przegląd punktu końcowego
Celem tego punktu końcowego jest umożliwienie klientom stworzenia nowej wyceny (quotation) w systemie. Endpoint przyjmuje dane dotyczące wyceny, weryfikuje je oraz przetwarza logikę biznesową, w tym kalkulację roboczogodzin (man_days) oraz minimalny bufor (30%).

## 2. Szczegóły żądania
- **Metoda HTTP:** POST
- **URL:** /api/quotations
- **Parametry:**
  - **Wymagane:**
    - `estimation_type`: "Fixed Price" lub "Time & Material"
    - `scope`: Opis projektu, ciąg znaków nie przekraczający 10000 znaków
    - `platforms`: Tablica identyfikatorów platform (co najmniej jedna wymagana)
  - **Opcjonalne:**
    - `dynamic_attributes`: Obiekt JSON lub wartość null, zawierający dodatkowe dane
- **Request Body:**
  Body powinien być zgodny ze strukturą typu `CreateQuotationCommand` zdefiniowanego w `src/types.ts`.

## 3. Wykorzystywane typy
- **Command Model:** `CreateQuotationCommand`
- **DTO:** `QuotationDTO`

## 4. Szczegóły odpowiedzi
- **Sukces:**
  - **Kod:** 201 Created
  - **Treść:** Obiekt wyceny, zawierający wszystkie dane wyceny wraz z wyliczonymi polami `man_days` i `buffer`.
- **Błędy:**
  - **400 Bad Request:** Dane wejściowe są nieprawidłowe (np. pole `scope` przekracza 10000 znaków, brak wymaganego pola, niepoprawny format danych).
  - **401 Unauthorized:** Brak lub nieważny token uwierzytelniający.
  - **500 Internal Server Error:** Błąd po stronie serwera, np. problem z bazą danych.

## 5. Przepływ danych
1. **Autoryzacja:** Middleware sprawdza, czy użytkownik jest uwierzytelniony (np. przez OAuth Bearer token) i ustawia kontekst użytkownika, zgodnie z RLS.
2. **Walidacja danych:** Użycie biblioteki Zod do walidacji wejściowego obiektu zgodnie z typem `CreateQuotationCommand`.
  - Weryfikacja długości pola `scope` (<= 10000 znaków).
  - Sprawdzenie, czy tablica `platforms` zawiera co najmniej jeden element.
3. **Logika biznesowa:**
  - Kalkulacja `man_days` na podstawie specyfikacji projektu.
  - Aplikacja minimalnego buforu 30%.
  - Obligatoryjna generacja powiązanych zadań (quotation_tasks) w oparciu o opis projektu.
4. **Operacja na bazie danych:** Wstawienie nowego rekordu do tabeli `quotations` wykorzystując Supabase, z uwzględnieniem RLS.
5. **Odpowiedź:** Zwrócenie utworzonej wyceny jako obiektu `QuotationDTO`.

## 6. Względy bezpieczeństwa
- **Uwierzytelnianie:** Endpoint musi być dostępny jedynie dla uwierzytelnionych użytkowników. Uwierzytelnianie odbywa się przy użyciu mechanizmu OAuth i Bearer tokenów.
- **Autoryzacja:** Stosowanie RLS (Row-Level Security) w bazie danych, aby użytkownik mógł modyfikować jedynie swoje dane.
- **Walidacja danych:** Użycie Zod do weryfikacji struktury i poprawności danych wejściowych, co zapobiega atakom typu injection.
- **Bezpieczeństwo baz danych:** Używanie zapytań parametryzowanych i prawidłowych indekserów (np. na `user_id`) w celu optymalizacji i ochrony danych.

## 7. Obsługa błędów
- **Błędy walidacji (400):** Detekcja i zgłaszanie nieprawidłowych danych wejściowych.
- **Błędy autoryzacji (401):** Zwrot informacji o braku lub nieważności tokena.
- **Błędy operacyjne (500):** Logowanie błędów, komunikacja niesprecyzowanych problemów z bazą danych lub logiką biznesową.
- Każdy błąd powinien być odpowiednio logowany, a komunikaty błędów powinny być przyjazne użytkownikowi, jednocześnie nie ujawniając szczegółowych informacji o wewnętrznej strukturze systemu.

## 8. Rozważania dotyczące wydajności
- **Optymalizacja zapytań:** Wykorzystanie indeksów na krytycznych kolumnach (np. `quotations.user_id`).
- **Asynchroniczność:** Rozważenie asynchronicznych operacji przy wysyłaniu zapytań do bazy danych.
- **Caching:** Ewentualne cachowanie danych statycznych, takich jak lista platform.
- **Batch Processing:** Jeśli generowanie zadań jest kosztowne, rozważyć ich grupowanie lub wykonywanie poza głównym przepływem żądania.

## 9. Etapy wdrożenia
1. **Przygotowanie middleware:** Upewnienie się, że autoryzacja i uwierzytelnianie działają poprawnie.
2. **Definicja walidacji:** Utworzenie lub rozszerzenie schematu Zod dla `CreateQuotationCommand`.
3. **Implementacja logiki biznesowej:** Dodanie funkcji obliczających `man_days` oraz `buffer`, z możliwością generowania zadań (quotation_tasks).
4. **Integracja z bazą danych:** Implementacja zapytań do Supabase przy tworzeniu rekordu w tabeli `quotations` oraz ewentualnie w `quotation_tasks`.
5. **Testowanie:** Utworzenie testów jednostkowych i integracyjnych dla tego endpointu, sprawdzających zarówno poprawność logiki, jak i obsługę błędów.
6. **Monitoring i logowanie:** Dodanie mechanizmów monitoringu oraz logowania błędów, aby ułatwić diagnozowanie problemów.
7. **Review i dokumentacja:** Dokonanie przeglądu kodu, aktualizacja dokumentacji API oraz przygotowanie deploymentu. 