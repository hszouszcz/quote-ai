<plan_testów>
# Plan Testów dla Projektu "AI Estimation"

## 1. Wprowadzenie i Cele Testowania

### 1.1. Wprowadzenie
Niniejszy dokument określa strategię, zakres, podejście oraz zasoby wymagane do przeprowadzenia testów aplikacji "AI Estimation". Projekt ten ma na celu automatyzację procesu generowania wycen projektów IT z wykorzystaniem sztucznej inteligencji. Plan obejmuje różne poziomy i typy testów, aby zapewnić wysoką jakość, niezawodność i bezpieczeństwo dostarczanego oprogramowania.

### 1.2. Cele Testowania
Główne cele testowania projektu "AI Estimation" to:
*   Weryfikacja, czy wszystkie funkcjonalności opisane w dokumentacji (README.md, PRD) działają zgodnie z oczekiwaniami.
*   Zapewnienie, że system jest stabilny, wydajny i bezpieczny.
*   Identyfikacja i raportowanie defektów w celu ich naprawy przed wdrożeniem produkcyjnym.
*   Potwierdzenie, że integracja pomiędzy komponentami frontendowymi, backendowymi (API Astro), bazą danych Supabase oraz usługą OpenRouter.ai działa poprawnie.
*   Sprawdzenie użyteczności i dostępności interfejsu użytkownika.
*   Ocena dokładności i spójności generowanych wycen.
*   Zapewnienie, że system poprawnie obsługuje dane wejściowe i scenariusze brzegowe.

## 2. Zakres Testów

### 2.1. Funkcjonalności objęte testami:
*   **Moduł Autoryzacji:**
    *   Rejestracja użytkownika (email/hasło).
    *   Logowanie użytkownika.
    *   Wylogowywanie użytkownika.
    *   Mechanizm odzyskiwania hasła.
    *   Ochrona ścieżek i przekierowania dla użytkowników niezalogowanych/zalogowanych.
    *   Zarządzanie sesją użytkownika.
*   **Tworzenie Nowej Wyceny:**
    *   Wprowadzanie opisu projektu (walidacja limitu 10000 znaków).
    *   Wybór platform (min. 1 platforma).
    *   Wybór typu estymacji (Fixed Price / Time & Material).
    *   Automatyczne generowanie zakresu projektu przez AI (podział na zadania, kalkulacja man-dni).
    *   Automatyczne naliczanie bufora (min. 30%).
    *   Zapis wyceny w bazie danych.
*   **Zarządzanie Wycenami:**
    *   Wyświetlanie listy wycen użytkownika (paginacja, sortowanie, filtrowanie).
    *   Wyświetlanie szczegółów wyceny (informacje o projekcie, zadania, podsumowanie).
    *   Edycja zadań w istniejącej wycenie (zmiana man-dni).
    *   Usuwanie wyceny.
*   **Ocena Wyceny:**
    *   Możliwość dodania oceny (rating 1-5) i komentarza do wyceny.
    *   Wyświetlanie istniejącej oceny.
*   **Interfejs Użytkownika (UI):**
    *   Nawigacja.
    *   Wygląd i responsywność komponentów UI (Shadcn/ui).
    *   Komunikaty dla użytkownika (błędy, sukcesy, ostrzeżenia).
*   **Integracja z AI (OpenRouter.ai):**
    *   Poprawność wysyłania promptów.
    *   Obsługa i parsowanie odpowiedzi z AI.
    *   Obsługa błędów komunikacji z AI.

### 2.2. Funkcjonalności nieobjęte testami (lub testowane w ograniczonym zakresie):
*   Logowanie za pomocą kont społecznościowych (funkcjonalność wyłączona zgodnie z PRD).
*   Zaawansowane testy penetracyjne wykraczające poza podstawowe sprawdzenie bezpieczeństwa (ze względu na ograniczenia czasowe i zasobowe).
*   Testy wydajności pod bardzo dużym obciążeniem (projekt jest "part-time endeavor").
*   Dogłębne testowanie samego modelu AI (zakładamy, że OpenRouter.ai dostarcza działające modele). Testujemy integrację i sposób wykorzystania modelu.

## 3. Typy Testów do Przeprowadzenia

*   **Testy Jednostkowe (Unit Tests):**
    *   **Cel:** Weryfikacja poprawności działania izolowanych fragmentów kodu (funkcje, komponenty React, hooki, serwisy).
    *   **Zakres:**
        *   Logika biznesowa w serwisach (`src/lib/services/` np. `ai.service.ts`, `quotation.service.ts`, `openrouter/service.ts`).
        *   Komponenty React (`src/components/`) - renderowanie, obsługa zdarzeń, logika wewnętrzna.
        *   Hooki React (`src/hooks/`).
        *   Funkcje pomocnicze (`src/lib/utils.ts`).
        *   Schematy walidacji Zod (`src/lib/schemas/`).
    *   **Narzędzia:** Jest, Vitest, React Testing Library.
*   **Testy Integracyjne (Integration Tests):**
    *   **Cel:** Weryfikacja współpracy pomiędzy różnymi modułami i komponentami systemu.
    *   **Zakres:**
        *   Integracja komponentów React (np. `QuotationForm` z jego subkomponentami).
        *   Integracja Frontend <-> API Endpoints Astro (np. formularz tworzenia wyceny wysyłający dane do `/api/quotations`).
        *   Integracja API Endpoints Astro <-> Serwisy (`src/lib/services/`).
        *   Integracja Serwisy <-> Supabase (mockowanie Supabase lub użycie testowej instancji).
        *   Integracja Serwisy <-> OpenRouter.ai (mockowanie API AI).
    *   **Narzędzia:** Vitest/Jest z mockowaniem zależności, Supertest (dla API), ew. React Testing Library dla integracji komponentów.
*   **Testy End-to-End (E2E Tests):**
    *   **Cel:** Symulacja rzeczywistych scenariuszy użytkownika, testowanie przepływów w całej aplikacji z perspektywy użytkownika.
    *   **Zakres:** Główne przepływy użytkownika, np.:
        *   Rejestracja -> Logowanie -> Stworzenie nowej wyceny -> Przeglądanie listy wycen -> Przeglądanie szczegółów wyceny -> Wylogowanie.
        *   Proces odzyskiwania hasła.
    *   **Narzędzia:** Playwright lub Cypress.
*   **Testy API (API Tests):**
    *   **Cel:** Bezpośrednie testowanie endpointów API Astro (`src/pages/api/`).
    *   **Zakres:** Weryfikacja poprawności odpowiedzi, obsługi błędów, walidacji danych wejściowych, autoryzacji dla każdego endpointu.
    *   **Narzędzia:** Postman/Insomnia (manualne), Vitest/Jest z Supertest lub `fetch` (automatyczne).
*   **Testy Akceptacyjne Użytkownika (UAT - User Acceptance Tests):**
    *   **Cel:** Potwierdzenie przez użytkownika (lub jego reprezentanta), że system spełnia wymagania biznesowe.
    *   **Zakres:** Kluczowe scenariusze zdefiniowane w PRD i historyjkach użytkownika.
    *   **Narzędzia:** Manualne wykonanie scenariuszy na środowisku testowym/stagingowym.
*   **Testy Wydajności (Performance Tests - podstawowe):**
    *   **Cel:** Ocena czasu odpowiedzi kluczowych operacji (np. generowanie wyceny, ładowanie listy wycen).
    *   **Zakres:** Podstawowe pomiary czasu odpowiedzi, identyfikacja potencjalnych wąskich gardeł.
    *   **Narzędzia:** Narzędzia deweloperskie przeglądarki ( вкладка Network, Performance), Lighthouse.
*   **Testy Bezpieczeństwa (Security Tests - podstawowe):**
    *   **Cel:** Identyfikacja podstawowych podatności.
    *   **Zakres:** Sprawdzenie ochrony przed XSS, CSRF (jeśli dotyczy), poprawne zarządzanie sesjami, walidacja danych wejściowych po stronie serwera, zabezpieczenie endpointów API.
    *   **Narzędzia:** Manualna inspekcja, narzędzia deweloperskie przeglądarki, OWASP ZAP (podstawowe skanowanie).
*   **Testy Użyteczności (Usability Tests):**
    *   **Cel:** Ocena łatwości obsługi i intuicyjności interfejsu.
    *   **Zakres:** Nawigacja, zrozumiałość komunikatów, przepływ pracy użytkownika.
    *   **Narzędzia:** Manualna ocena, zbieranie feedbacku od testerów.
*   **Testy Dostępności (Accessibility Tests - a11y):**
    *   **Cel:** Zapewnienie, że aplikacja jest dostępna dla osób z niepełnosprawnościami.
    *   **Zakres:** Zgodność z WCAG (np. kontrast, nawigacja klawiaturą, atrybuty ARIA).
    *   **Narzędzia:** axe-core, Lighthouse, manualne testy z czytnikami ekranu.
*   **Testy Kompatybilności (Compatibility Tests):**
    *   **Cel:** Sprawdzenie działania aplikacji na różnych przeglądarkach i urządzeniach.
    *   **Zakres:** Główne przeglądarki (Chrome, Firefox, Safari, Edge) i responsywność na różnych rozmiarach ekranu.
    *   **Narzędzia:** Manualne testy, narzędzia deweloperskie przeglądarki, ew. usługi typu BrowserStack (jeśli budżet pozwoli).

## 4. Scenariusze Testowe dla Kluczowych Funkcjonalności

Przykładowe scenariusze testowe (szczegółowe przypadki testowe będą opracowywane osobno):

### 4.1. Autoryzacja
*   **SCN-AUTH-001:** Pomyślna rejestracja nowego użytkownika.
*   **SCN-AUTH-002:** Próba rejestracji z istniejącym adresem email.
*   **SCN-AUTH-003:** Próba rejestracji z niepoprawnym formatem email/hasła.
*   **SCN-AUTH-004:** Pomyślne logowanie zarejestrowanego użytkownika.
*   **SCN-AUTH-005:** Próba logowania z niepoprawnym hasłem.
*   **SCN-AUTH-006:** Próba logowania z nieistniejącym użytkownikiem.
*   **SCN-AUTH-007:** Pomyślne wylogowanie.
*   **SCN-AUTH-008:** Pomyślny proces odzyskiwania hasła.
*   **SCN-AUTH-009:** Próba dostępu do chronionej strony przez niezalogowanego użytkownika (przekierowanie na logowanie).
*   **SCN-AUTH-010:** Dostęp do publicznych stron przez niezalogowanego użytkownika.

### 4.2. Tworzenie Nowej Wyceny
*   **SCN-QUOTE-CREATE-001:** Pomyślne stworzenie wyceny z poprawnymi danymi (opis, min. 1 platforma, typ).
*   **SCN-QUOTE-CREATE-002:** Próba stworzenia wyceny z opisem > 10000 znaków.
*   **SCN-QUOTE-CREATE-003:** Próba stworzenia wyceny bez wybranej platformy.
*   **SCN-QUOTE-CREATE-004:** Weryfikacja automatycznego generowania zadań i man-dni przez AI.
*   **SCN-QUOTE-CREATE-005:** Weryfikacja naliczenia bufora min. 30%.
*   **SCN-QUOTE-CREATE-006:** Weryfikacja zapisu wyceny i powiązanych danych (platformy, zadania) w bazie.

### 4.3. Zarządzanie Wycenami (Lista i Szczegóły)
*   **SCN-QUOTE-LIST-001:** Wyświetlenie listy wycen dla zalogowanego użytkownika.
*   **SCN-QUOTE-LIST-002:** Poprawne działanie paginacji na liście wycen.
*   **SCN-QUOTE-LIST-003:** Poprawne działanie sortowania (np. po dacie, man-dniach).
*   **SCN-QUOTE-LIST-004:** Poprawne działanie filtrowania (np. po słowie kluczowym w opisie).
*   **SCN-QUOTE-DETAIL-001:** Wyświetlenie szczegółów wybranej wyceny.
*   **SCN-QUOTE-DETAIL-002:** Poprawna edycja man-dni dla zadania w szczegółach wyceny.
*   **SCN-QUOTE-DETAIL-003:** Poprawne przeliczenie podsumowania (suma MD, bufor) po edycji zadania.
*   **SCN-QUOTE-DELETE-001:** Pomyślne usunięcie wyceny.
*   **SCN-QUOTE-DELETE-002:** Próba usunięcia wyceny przez nieautoryzowanego użytkownika (innego niż właściciel - w tym przypadku nie dotyczy, bo RLS wyłączone, ale logika aplikacji powinna to sprawdzać).

### 4.4. Ocena Wyceny
*   **SCN-REVIEW-001:** Pomyślne dodanie oceny (rating) i komentarza do wyceny.
*   **SCN-REVIEW-002:** Próba dodania oceny z niepoprawnym ratingiem (np. 0 lub 6).
*   **SCN-REVIEW-003:** Wyświetlenie istniejącej oceny i komentarza.

### 4.5. Integracja z AI
*   **SCN-AI-001:** Poprawne wysłanie danych projektu do AI i otrzymanie struktury zadań.
*   **SCN-AI-002:** Obsługa błędu, gdy API AI jest niedostępne lub zwraca błąd.
*   **SCN-AI-003:** Weryfikacja, czy odpowiedź AI jest poprawnie sparsowana i wykorzystana do stworzenia zadań.

## 5. Środowisko Testowe

*   **Środowisko Deweloperskie (Lokalne):**
    *   Node.js (wersja z `.nvmrc` - 22.14.0)
    *   npm
    *   Lokalna instancja Supabase (CLI) z bazą danych PostgreSQL.
    *   Dostęp do API OpenRouter.ai (klucz deweloperski z ew. limitami).
*   **Środowisko CI (GitHub Actions):**
    *   Konfiguracja do budowania aplikacji i uruchamiania testów automatycznych.
    *   Możliwość mockowania usług zewnętrznych lub użycia dedykowanych kluczy API dla testów.
*   **Środowisko Staging (jeśli dostępne, np. na DigitalOcean):**
    *   Konfiguracja zbliżona do produkcyjnej.
    *   Używane do testów E2E, UAT i testów eksploracyjnych przed wdrożeniem.
*   **Przeglądarki:** Najnowsze wersje Chrome, Firefox, Safari, Edge.
*   **Urządzenia:** Desktop, ew. symulacja urządzeń mobilnych w narzędziach deweloperskich.

## 6. Narzędzia do Testowania

*   **Frameworki do testów jednostkowych/integracyjnych:**
    *   Vitest (preferowany dla spójności z ekosystemem Vite/Astro)
    *   Jest (już używany w projekcie)
    *   React Testing Library (dla komponentów React)
*   **Frameworki do testów E2E:**
    *   Playwright lub Cypress
*   **Narzędzia do testów API:**
    *   Postman / Insomnia (manualne)
    *   Supertest (automatyczne w ramach testów integracyjnych)
*   **Narzędzia do testów dostępności:**
    *   axe-core (integracja z RTL lub E2E)
    *   Lighthouse
*   **Narzędzia do testów wydajności:**
    *   Narzędzia deweloperskie przeglądarki
    *   Lighthouse
*   **System Kontroli Wersji:** Git, GitHub
*   **CI/CD:** GitHub Actions
*   **Zarządzanie Zadaniami/Błędami:** Dowolne narzędzie typu Jira, Trello, GitHub Issues (w tym projekcie prawdopodobnie GitHub Issues).

## 7. Harmonogram Testów

Projekt jest realizowany jako "part-time endeavor" z planowanym czasem 4 tygodni. Testowanie powinno być procesem ciągłym, zintegrowanym z developmentem.
*   **Tydzień 1-2:**
    *   Development kluczowych funkcjonalności (autoryzacja, formularz wyceny, podstawowa integracja z AI).
    *   Równoległe pisanie testów jednostkowych i integracyjnych dla tworzonych modułów.
    *   Konfiguracja CI do uruchamiania testów.
*   **Tydzień 3:**
    *   Development pozostałych funkcjonalności (lista wycen, szczegóły, oceny, edycja).
    *   Kontynuacja pisania testów jednostkowych i integracyjnych.
    *   Rozpoczęcie pisania testów E2E dla głównych przepływów.
    *   Testy API.
*   **Tydzień 4:**
    *   Finalizacja developmentu.
    *   Intensywne testy E2E i testy akceptacyjne użytkownika.
    *   Testy kompatybilności, użyteczności, dostępności (podstawowe).
    *   Poprawki błędów.
    *   Przygotowanie do wdrożenia.

## 8. Kryteria Akceptacji Testów

### 8.1. Kryteria Wejścia (Rozpoczęcia Testów)
*   Kod źródłowy jest dostępny w repozytorium.
*   Środowisko testowe jest skonfigurowane i dostępne.
*   Wymagania funkcjonalne są zdefiniowane (PRD, README).
*   Kluczowe moduły są zaimplementowane.

### 8.2. Kryteria Wyjścia (Zakończenia Testów)
*   **Poziom Krytyczny/Blokujący:** 100% zidentyfikowanych i naprawionych błędów.
*   **Poziom Wysoki:** 95% zidentyfikowanych i naprawionych błędów, pozostałe 5% z akceptowalnym planem obejścia lub odłożone na kolejną iterację.
*   **Poziom Średni/Niski:** Większość zidentyfikowanych błędów naprawiona, pozostałe udokumentowane.
*   Pokrycie kodu testami jednostkowymi na poziomie min. 70% dla kluczowych modułów.
*   Wszystkie kluczowe scenariusze testowe E2E przechodzą pomyślnie.
*   Testy akceptacyjne użytkownika zakończone z pozytywnym wynikiem.
*   Dokumentacja testowa (wyniki, raporty błędów) jest kompletna.

## 9. Role i Odpowiedzialności w Procesie Testowania

Biorąc pod uwagę, że jest to "part-time endeavor with a planned timeline of 4 weeks" prawdopodobnie realizowany przez jedną osobę (dewelopera), ta osoba będzie pełniła większość ról:
*   **Deweloper:**
    *   Pisanie testów jednostkowych i integracyjnych.
    *   Naprawa zgłoszonych błędów.
    *   Wsparcie w konfiguracji środowisk testowych.
*   **Tester (QA Engineer - w tym przypadku deweloper):**
    *   Projektowanie i wykonywanie scenariuszy testowych (E2E, API, manualne).
    *   Raportowanie błędów.
    *   Weryfikacja poprawek.
    *   Przygotowanie raportów z testów.
    *   Przeprowadzanie testów eksploracyjnych.
*   **Product Owner (jeśli istnieje formalnie, w przeciwnym razie deweloper w tej roli):**
    *   Definiowanie kryteriów akceptacji.
    *   Udział w testach akceptacyjnych użytkownika.
    *   Priorytetyzacja naprawy błędów.

## 10. Procedury Raportowania Błędów

*   **Narzędzie:** GitHub Issues.
*   **Szablon Zgłoszenia Błędu:**
    *   **Tytuł:** Krótki, zwięzły opis problemu.
    *   **ID Błędu:** (Automatycznie nadawane przez GitHub Issues).
    *   **Środowisko:** (np. Lokalny dev, Staging, Przeglądarka + wersja).
    *   **Kroki do Reprodukcji:** Szczegółowy opis kroków prowadzących do wystąpienia błędu.
    *   **Obserwowany Rezultat:** Co się stało.
    *   **Oczekiwany Rezultat:** Co powinno się stać.
    *   **Priorytet:** (Krytyczny, Wysoki, Średni, Niski).
    *   **Stopień Pilności:** (np. Blocker, Major, Minor).
    *   **Załączniki:** (np. Zrzuty ekranu, logi, wideo).
    *   **Zgłaszający:** (Osoba, która znalazła błąd).
    *   **Przypisany do:** (Osoba odpowiedzialna za naprawę).
    *   **Status:** (np. Nowy, W toku, Do weryfikacji, Naprawiony, Zamknięty, Odrzucony).
*   **Cykl Życia Błędu:**
    1.  Zgłoszenie błędu.
    2.  Analiza i priorytetyzacja.
    3.  Przypisanie do dewelopera.
    4.  Naprawa błędu.
    5.  Weryfikacja poprawki przez testera.
    6.  Zamknięcie błędu (jeśli naprawiony) lub ponowne otwarcie (jeśli problem nadal występuje).

</plan_testów>