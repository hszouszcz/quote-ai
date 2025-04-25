# Specyfikacja Techniczna Modułu Autentykacji

## 1. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### Frontend (Astro + React)
- Utworzenie dedykowanych stron autoryzacyjnych umieszczonych w katalogu `src/pages/auth/`, m.in.:
  - `login.astro` – strona logowania
  - `register.astro` – strona rejestracji
  - `recover-password.astro` – strona odzyskiwania hasła
- Strony te korzystają z komponentów React, umieszczonych w katalogu `src/components/auth/`, z dyrektywą `client:load`, które obsługują interaktywne formularze:
  - `LoginForm.tsx`
  - `RegisterForm.tsx`
  - `PasswordRecoveryForm.tsx`
- Wykorzystanie komponentów z Shadcn/ui oraz Tailwind CSS do:
  - Stylowania formularzy, przycisków oraz komunikatów walidacyjnych
  - Wyświetlania czytelnych komunikatów błędów w przypadku nieprawidłowych danych (np. błędny format email, zbyt krótkie hasło, brak wymaganych pól)
- Integracja z systemem nawigacji:
  - Header (nagłówek) uaktualniany dynamicznie – gdy użytkownik jest zalogowany, wyświetlany jest przycisk wylogowania oraz informacje o użytkowniku
  - Ochrona tras: Middleware w Astro (w `src/middleware/index.ts`) monitoruje sesję i przekierowuje niezalogowanych użytkowników na stronę logowania
- Scenariusze użycia:
  - Nieudane logowanie lub rejestracja – użytkownik otrzymuje komunikat o błędzie
  - Pomyślna rejestracja lub logowanie – następuje przekierowanie do widoku listy wycen
  - Proces odzyskiwania hasła – użytkownik inicjuje proces, otrzymuje odpowiednią instrukcję na email, a następnie ustawia nowe hasło
  - Interfejs w wersji niezalogowanej zawiera widoczne przyciski/linki umożliwiające przejście do stron logowania i rejestracji, m.in. w headerze oraz na stronie głównej (landing page)

### Integracja Frontend - Backend
- Formularze na stronach autoryzacyjnych komunikują się z API za pomocą zapytań (fetch/AJAX) do dedykowanych endpointów w `/api/auth/`.
- Przekazywanie sesyjnych tokenów i operacje na ciasteczkach zapewniają utrzymanie stanu autentykacji.

## 2. LOGIKA BACKENDOWA

### Struktura API
- Utworzenie zestawu endpointów w katalogu `src/pages/api/auth/`:
  - `/api/auth/login` – obsługa logowania
  - `/api/auth/register` – obsługa rejestracji
  - `/api/auth/logout` – wylogowanie użytkownika
  - `/api/auth/recover-password` – inicjalizacja i obsługa procesu odzyskiwania hasła
- Endpointy przyjmują dane w formacie JSON i operują na nich zgodnie z zasadami walidacji oraz odpowiednim zwrotem statusu (200 OK, 400/500 w razie błędów)

### Walidacja danych wejściowych
- Implementacja walidacji danych przy użyciu bibliotek typu Zod lub innej podobnej metody:
  - Weryfikacja poprawności formatu adresu email
  - Sprawdzenie bezpieczeństwa i minimalnej długości hasła
  - Walidacja obecności wszystkich wymaganych pól
- W przypadku nieprawidłowych danych, endpointy zwracają przejrzyste komunikaty błędów, które są przekazywane do interfejsu użytkownika

### Obsługa wyjątków i logowanie błędów
- Każdy endpoint posiada blok try/catch do przechwytywania wyjątków
- Błędy są logowane (np. przez `console.error` lub dedykowany mechanizm logowania) z uwzględnieniem bezpieczeństwa danych
- Odpowiedzi błędów zawierają czytelne komunikaty, nie ujawniając jednocześnie szczegółowych informacji wewnętrznych

### Middleware i renderowanie stron
- Middleware (w `src/middleware/index.ts`) monitoruje stan autentykacji przed renderowaniem stron serwerowych:
  - W przypadku braku ważnej sesji, użytkownik jest przekierowywany na stronę logowania
  - W przypadku autoryzacji, użytkownik uzyskuje dostęp do chronionych zasobów
- Strony server-side (Astro) są renderowane z uwzględnieniem danych sesyjnych, korzystając z konfiguracji określonej w `astro.config.mjs`

## 3. SYSTEM AUTENTYKACJI

### Integracja z Supabase Auth
- Wykorzystanie Supabase Auth jako centralnego systemu autentykacji, obejmującego:
  - Rejestrację użytkownika – metoda `supabase.auth.signUp` z dodatkową walidacją danych
  - Logowanie – metoda `supabase.auth.signInWithPassword` dla użytkowników korzystających z email i hasła
  - Wylogowanie – metoda `supabase.auth.signOut`, która usuwa tokeny sesyjne i czyści ciasteczka
  - Odzyskiwanie hasła – metoda `supabase.auth.resetPasswordForEmail`, która inicjuje proces resetowania hasła
  - Uwaga: W tej implementacji nie przewidujemy opcji logowania z wykorzystaniem zewnętrznych dostawców OAuth (logowanie społecznościowe), co jest zgodne z wymaganiami US-001.
- Inicjalizacja klienta Supabase odbywa się w module, np. `src/lib/supabaseClient.ts`, gdzie konfigurowane są połączenia i parametry autentykacji
- Zarządzanie sesją:
  - Tokeny sesji i odświeżania są przetwarzane automatycznie przez klienta Supabase
  - Stan sesji jest przekazywany do middleware Astro celem odpowiedniego renderowania stron

### Kontrakty i modele danych
- Definicja typu `User` i powiązanych interfejsów w `src/types.ts`, obejmujących dane zwracane przez Supabase (np. id, email, status weryfikacji)
- Definicja kontraktów API związanych z autentykacją, które określają strukturę żądań i odpowiedzi

### Bezpieczeństwo systemu
- Wszystkie operacje autentykacyjne chronione są mechanizmami zabezpieczeń:
  - Ochrona przed atakami CSRF
  - Użycie HTTPS do bezpiecznej transmisji danych
  - Bezpieczne zarządzanie ciasteczkami i tokenami sesji
  - Mechanizmy rate limiting oraz dodatkowe walidacje po stronie serwera

## Podsumowanie
Moduł autentykacji integruje spójnie interfejs frontendowy (Astro + React) z logiką backendową oraz systemem autentykacji opartym na Supabase. Główne komponenty to:
- Strony autoryzacyjne i formularze (login, rejestracja, odzyskiwanie hasła) – odpowiedzialne za interakcję z użytkownikiem
- Endpointy API z pełną walidacją danych i obsługą wyjątków
- Middleware (Astro) monitorujący stan sesji i redirekcje
- Usługa autentykacji obsługująca logikę rejestracji, logowania, wylogowania oraz resetu hasła, wykorzystująca Supabase Auth

Ta architektura zapewnia spójność, bezpieczeństwo oraz łatwość rozwoju modułu autentykacji, zgodnie z wymaganiami projektu oraz przyjętym stackiem technologicznym. 