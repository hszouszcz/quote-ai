# Architektura UI dla AI Wycena

## 1. Przegląd struktury UI

Projekt „AI Wycena” ma spójną i intuicyjną strukturę interfejsu użytkownika, która prowadzi użytkownika przez kolejne etapy: logowanie/rejestrację, tworzenie wyceny, przegląd historii wycen oraz szczegółowy widok pojedynczej wyceny. Całość uzupełnia responsywna nawigacja oparta o boczne menu, nagłówek i stopkę, z zachowaniem wytycznych dostępności (WCAG AA) oraz wysokich standardów bezpieczeństwa.

## 2. Lista widoków

- **Ekran logowania/rejestracji**
  - **Ścieżka widoku:** `/auth` lub `/login`
  - **Główny cel:** Umożliwienie użytkownikom bezpiecznego logowania i rejestracji za pomocą mechanizmu OAuth.
  - **Kluczowe informacje do wyświetlenia:** Formularz logowania, komunikaty błędów, wskazówki dotyczące bezpieczeństwa.
  - **Kluczowe komponenty widoku:** Formularz logowania, przyciski do rejestracji, informacje o autoryzacji.
  - **UX, dostępność i względy bezpieczeństwa:** Prostota i przejrzystość interfejsu, wsparcie ARIA, wysoki kontrast oraz obsługa klawiatury.

- **Formularz tworzenia wyceny**
  - **Ścieżka widoku:** `/wyceny/nowa` lub `/quotes/new`
  - **Główny cel:** Umożliwienie użytkownikowi wprowadzenia szczegółowego opisu projektu, wyboru platform oraz typu wyceny.
  - **Kluczowe informacje do wyświetlenia:** Pole tekstowe do opisu projektu, checkboxy dla platform, przyciski wyboru typu wyceny, komunikaty walidacyjne.
  - **Kluczowe komponenty widoku:** Formularz z dynamiczną walidacją, inputy tekstowe, checkboxy, radio buttony, przyciski przesyłania formularza.
  - **UX, dostępność i względy bezpieczeństwa:** Walidacja w czasie rzeczywistym, czytelne komunikaty błędów, dostępność za pomocą atrybutów ARIA, zapewnienie integralności danych.

- **Lista wycen użytkownika**
  - **Ścieżka widoku:** `/wyceny` lub `/quotes`
  - **Główny cel:** Przegląd wycen utworzonych przez użytkownika z możliwością sortowania i paginacji.
  - **Kluczowe informacje do wyświetlenia:** Data utworzenia, liczba man-days, status wyceny, opcjonalnie podsumowanie buforu.
  - **Kluczowe komponenty widoku:** Tabela wycen, mechanizm sortowania, paginacja, filtry.
  - **UX, dostępność i względy bezpieczeństwa:** Czytelna prezentacja danych, łatwa nawigacja między stronami, potwierdzenie autentyczności wyświetlanych danych.

- **Szczegółowy widok wyceny**
  - **Ścieżka widoku:** `/wyceny/:id` lub `/quotes/:id`
  - **Główny cel:** Prezentacja szczegółowych danych wyceny, w tym listy zadań i podsumowania wyliczeń (man-days, bufor, suma MD + bufor).
  - **Kluczowe informacje do wyświetlenia:** Szczegółowy scope projektu, lista zadań z numeracją, nazwa zadania i wartością MD, tabela podsumowująca łączną liczbę man-days i doliczony bufor.
  - **Kluczowe komponenty widoku:** Tabela z zadaniami (z edytowalnymi polami MD), sekcja podsumowania, przyciski zapisu i edycji.
  - **UX, dostępność i względy bezpieczeństwa:** Możliwość edycji wartości MD, intuicyjne komunikaty przy zapisie, przestrzeganie standardów dostępności (np. nawigacja klawiaturą, odpowiednia struktura tabeli).

## 3. Mapa podróży użytkownika

1. **Logowanie/Rejestracja:** Użytkownik rozpoczyna podróż od logowania lub rejestracji na ekranie `/auth`. Po pomyślnym zalogowaniu następuje przekierowanie do głównego panelu wycen.
2. **Tworzenie wyceny:** Z menu bocznego użytkownik wybiera opcję „Nowa wycena”, trafia do formularza tworzenia wyceny (`/wyceny/nowa`), uzupełnia wszystkie wymagane pola i przesyła formularz. System waliduje dane w czasie rzeczywistym.
3. **Przegląd listy wycen:** Po przesłaniu formularza użytkownik jest przenoszony do widoku listy wycen (`/wyceny`), gdzie może sortować i przeglądać swoje dotychczasowe wyceny.
4. **Szczegółowy widok wyceny:** Kliknięcie na konkretną wycenę w tabeli przenosi użytkownika do szczegółowego widoku (`/wyceny/:id`), gdzie wyświetlane są wszystkie szczegóły, w tym lista zadań z możliwością edycji.
5. **Interakcje dodatkowe:** W przypadku wystąpienia błędów (np. niepoprawna walidacja formularza czy błąd autoryzacji), system wyświetla odpowiednie komunikaty i przekierowuje użytkownika do dedykowanych widoków błędów lub formularzy korekcyjnych.

## 4. Układ i struktura nawigacji

- **Menu boczne:** Szybki dostęp do głównych widoków, tj. logowanie/rejestracja, nowa wycena, lista wycen.
- **Header:** Wyświetla informacje o użytkowniku, status logowania i opcje wylogowania.
- **Stopka:** Zawiera informacje o produkcie, polityce prywatności i opcjonalne linki do pomocy.
- **Responsywność:** Nawigacja jest projektowana z myślą o podejściu mobile-first (przy użyciu Tailwind CSS), ale główny nacisk na projekt desktopowy.
- **Dostępność:** Elementy nawigacyjne mają odpowiednie atrybuty ARIA, kontrast kolorów oraz wsparcie dla nawigacji klawiaturą.

## 5. Kluczowe komponenty

- **Formularz logowania/rejestracji:** Komponent odpowiedzialny za bezpieczne logowanie i rejestrację.
- **Formularz wyceny:** Złożony formularz zawierający pola tekstowe, checkboxy, radio buttony z dynamiczną walidacją oraz komunikatami błędów.
- **Tabela wycen:** Komponent do wyświetlania listy wycen z funkcjami sortowania i paginacji.
- **Tabela zadań:** Widok edytowalnej tabeli do prezentacji i modyfikacji szczegółowych danych zadań wyceny.
- **Nawigacja (menu boczne, header, stopka):** Spójne elementy nawigacyjne zapewniające łatwy dostęp do głównych sekcji aplikacji.
- **Komponenty walidacji:** Zestaw komponentów odpowiedzialnych za natychmiastową walidację danych oraz wyświetlanie komunikatów błędów.
- **Zarządzanie stanem:** Mechanizmy oparte o hooki i React Context dla dynamicznej synchronizacji danych między widokami. 