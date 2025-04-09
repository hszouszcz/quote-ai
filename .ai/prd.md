# Dokument wymagań produktu (PRD) - AI Wycena

## 1. Przegląd produktu
Projekt "AI Wycena" to system automatyzujący generowanie wycen projektów IT przy użyciu modelu AI. Aplikacja umożliwia użytkownikom wprowadzenie szczegółowego opisu projektu (do 100000 znaków), wybór platform (np. frontend, backend, iOS, Android) przy pomocy checkboxów oraz określenie typu wyceny (Fixed Price lub Time & Material). System automatycznie generuje scope projektu wraz z podziałem zadań, wyliczeniem man-days bazującym na stałych 5-6 godzinach pracy dziennie oraz dodanym buforem minimum 30%. Dodatkowo, aplikacja oferuje mechanizmy autoryzacji oparte na OAuth, ocenę wygenerowanej wyceny oraz zapewnia standardowe zabezpieczenia danych.

## 2. Problem użytkownika
Softwarehouse i inne firmy technologiczne borykają się z problemem czasochłonnych i kosztownych wycen projektów IT, które wymagają angażowania deweloperów, opóźniając tym samym proces odpowiedzi do klienta. Brak automatyzacji w tym obszarze prowadzi do nieefektywnego wykorzystania zasobów oraz ryzyka błędnych wyliczeń, co może negatywnie wpływać na satysfakcję klienta i konkurencyjność firmy.

## 3. Wymagania funkcjonalne
- Formularz umożliwiający wprowadzenie opisu projektu do 100000 znaków z zaawansowaną walidacją tekstu.
- Checkboxy umożliwiające wybór platform (np. frontend, backend, iOS, Android) oraz typu wyceny (Fixed Price lub Time & Material), przy czym wybór przynajmniej jednej platformy jest obowiązkowy.
- Automatyczne generowanie szczegółowego scope'u projektu, z wyliczeniem man-days opartym na stałych 5-6 godzinach pracy dziennie oraz dodanym buforem minimum 30% (z możliwością zwiększenia dla bardziej złożonych projektów).
- Mechanizm autoryzacji użytkowników oparty na OAuth (bez opcji logowania społecznościowego).
- Funkcjonalność umożliwiająca ocenę wygenerowanej wyceny poprzez system ocen (skala ocen oraz opcjonalny komentarz).
- Zastosowanie standardowych zabezpieczeń danych, zgodnych z metodami ochrony danych wrażliwych.
- Kolekcja promptów do generowania wycen jest statyczna.
- Prosty, intuicyjny i responsywny interfejs użytkownika.

## 4. Granice produktu
- Produkt koncentruje się wyłącznie na automatyzacji procesu wyceny projektów IT i nie obejmuje funkcji zarządzania projektami po etapie wyceny.
- Brak integracji z systemami zewnętrznymi poza mechanizmem OAuth, co wyklucza m.in. social login oraz zewnętrzne systemy płatności czy zarządzania projektami.
- Mechanizm wyceny opiera się na stałych parametrach (5-6 godzin pracy dziennie i minimum 30% bufor), a szczegółowe progi zwiększenia bufora pozostają do ustalenia.
- Produkt jest rozwijany w trybie part-time przez jednoosobowy zespół, z założonym terminem 4 tygodni, co wpływa na wybór rozwiązań technologicznych oraz zakres funkcjonalności.

## 5. Historyjki użytkowników

### US-001: Rejestracja i logowanie użytkowników
- ID: US-001
- Tytuł: Rejestracja i logowanie użytkowników
- Opis: Jako nowy lub powracający użytkownik chcę móc zalogować się lub zarejestrować za pomocą mechanizmu OAuth, aby mieć bezpieczny dostęp do systemu.
- Kryteria akceptacji:
  - Możliwość rejestracji i logowania z użyciem OAuth.
  - System potwierdza tożsamość użytkownika przed udostępnieniem funkcji.
  - Brak opcji autoryzacji społecznościowej.
  - Użytkownik ma możliwość wylogowania się z systemu.

### US-002: Wprowadzanie długiego opisu projektu
- ID: US-002
- Tytuł: Wprowadzanie długiego opisu projektu
- Opis: Jako użytkownik chcę wprowadzić szczegółowy opis projektu (do 100000 znaków) z walidacją tekstu, aby upewnić się, że dane są kompletne i poprawne.
- Kryteria akceptacji:
  - Formularz przyjmuje opis do 100000 znaków.
  - Walidacja tekstu wykrywa błędy, np. przekroczenie limitu znaków.
  - System wyświetla jasne komunikaty walidacyjne.

### US-003: Wybór platform i typu wyceny
- ID: US-003
- Tytuł: Wybór platform i typu wyceny
- Opis: Jako użytkownik chcę wybrać przynajmniej jedną platformę (np. frontend, backend, iOS, Android) oraz określić typ wyceny (Fixed Price lub Time & Material) za pomocą checkboxów, aby system mógł precyzyjnie wygenerować wycenę.
- Kryteria akceptacji:
  - Formularz wymusza wybór co najmniej jednej platformy.
  - Checkboxy są opisane w sposób intuicyjny.
  - Wybrany typ wyceny jest jednoznacznie przekazywany do systemu generującego wycenę.

### US-004: Generowanie automatycznej wyceny projektu
- ID: US-004
- Tytuł: Generowanie automatycznej wyceny projektu
- Opis: Jako użytkownik chcę, aby system automatycznie generował szczegółowy scope projektu na podstawie wprowadzonego opisu, wybranych platform, ustalonej liczby godzin pracy (5-6 godzin dziennie) oraz dodanego bufora (minimum 30%), aby uzyskać przejrzystą i dokładną wycenę.
- Kryteria akceptacji:
  - System przetwarza dane wejściowe i generuje scope projektu.
  - Obliczenia man-days uwzględniają stałą liczbę godzin pracy dziennie.
  - Do wyceny dodawany jest bufor minimum 30%, z możliwością zwiększenia w przypadku większej złożoności.
  - Wynik wyceny jest prezentowany użytkownikowi w czytelnej formie.

### US-005: Prezentacja i ocena wygenerowanej wyceny
- ID: US-005
- Tytuł: Prezentacja i ocena wygenerowanej wyceny
- Opis: Jako użytkownik chcę zobaczyć wygenerowaną wycenę wraz z możliwością jej oceny przy użyciu skali oraz opcjonalnie dodania komentarza, aby móc wyrazić swoją opinię na temat dokładności wyceny.
- Kryteria akceptacji:
  - Wygenerowana wycena jest wyświetlana w przejrzysty sposób.
  - Użytkownik może ocenić wycenę przy użyciu zdefiniowanej skali.
  - Opcjonalna możliwość dodania komentarza jest dostępna.
  - Ocena i komentarz są zapisywane w historii wycen.

### US-006: Przegląd historii wycen
- ID: US-006
- Tytuł: Przegląd historii wycen
- Opis: Jako użytkownik chcę mieć możliwość przeglądania historii wygenerowanych wycen, aby móc śledzić zmiany i ponownie ocenić wcześniejsze wyceny.
- Kryteria akceptacji:
  - System zapisuje historię wycen, uwzględniając opis projektu, datę generacji, ocenę i ewentualne komentarze.
  - Historia wycen jest dostępna w intuicyjnym interfejsie z możliwością filtrowania według dat, platform lub typu wyceny.
  - Użytkownik może szybko przeglądać poprzednie wyceny.

## 6. Metryki sukcesu
- Precyzyjność i kompletność wygenerowanej wyceny, mierzone np. procentem błędów w obliczeniach.
- Dokładność wyliczenia man-days poprzez porównanie z ręcznymi wyliczeniami.
- Wysoki poziom satysfakcji użytkowników, mierzony średnią oceną i opiniami w komentarzach.
- Skuteczność walidacji danych, monitorowana przez testy jednostkowe i integracyjne.
- Zapewnienie bezpieczeństwa danych zgodnie z obowiązującymi standardami ochrony danych wrażliwych.
- Efektywność kosztowa infrastruktury, analizowana pod kątem wydajności i kosztów utrzymania systemu. 