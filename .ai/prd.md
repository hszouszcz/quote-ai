# Dokument wymagań produktu (PRD) - AI Wycena

## 1. Przegląd produktu
Projekt "AI Wycena" to system automatyzujący generowanie wycen projektów IT przy użyciu modelu AI. Aplikacja umożliwia użytkownikom przejście przez iteracyjny, wieloetapowy proces zbierania informacji o projekcie, w którym użytkownik odpowiada na dynamicznie generowane pytania dotyczące zakresu, technologii, wymagań i ograniczeń projektu. Na podstawie tych odpowiedzi system generuje szczegółowy scope projektu, wylicza man-days bazując na stałych 5-6 godzinach pracy dziennie oraz dodaje bufor minimum 30%. Proces ten jest wspierany przez mechanizmy autoryzacji oparte na OAuth oraz zapewnia standardowe zabezpieczenia danych.

## 2. Problem użytkownika
Softwarehouse i inne firmy technologiczne borykają się z problemem czasochłonnych i kosztownych wycen projektów IT, które wymagają angażowania deweloperów, opóźniając tym samym proces odpowiedzi do klienta. Brak automatyzacji w tym obszarze prowadzi do nieefektywnego wykorzystania zasobów oraz ryzyka błędnych wyliczeń, co może negatywnie wpływać na satysfakcję klienta i konkurencyjność firmy.

## 3. Wymagania funkcjonalne

- **Iteracyjny, dynamiczny formularz zbierania wymagań**: Zamiast pojedynczego formularza, użytkownik przechodzi przez sekwencję kroków (wizard), gdzie na każdym etapie prezentowane są pytania dostosowane do wcześniejszych odpowiedzi. Przykładowe etapy:
  - Wprowadzenie ogólnego opisu projektu.
  - Wybór głównych platform (frontend, backend, iOS, Android, inne).
  - Doprecyzowanie wymagań funkcjonalnych i niefunkcjonalnych (np. integracje, bezpieczeństwo, skalowalność).
  - Określenie priorytetów, ograniczeń i oczekiwań biznesowych.
  - Uzupełnienie szczegółowych informacji technicznych (opcjonalnie, jeśli wymagane).
- **Dynamiczne generowanie pytań**: System na bieżąco analizuje odpowiedzi i może zadawać dodatkowe pytania pogłębiające, aby doprecyzować zakres lub wyjaśnić niejasności.
- **Walidacja i podsumowanie**: Po przejściu wszystkich kroków użytkownik otrzymuje podsumowanie zebranych informacji i może je zatwierdzić lub wrócić do wybranych etapów w celu korekty.
- **Przetwarzanie i generowanie wyceny**: Po zatwierdzeniu danych wejściowych system uruchamia algorytm generowania wyceny, który:
  - Analizuje zebrane odpowiedzi.
  - Tworzy szczegółowy scope projektu (podział na zadania, estymacje czasowe).
  - Wylicza man-days na podstawie zadanych parametrów (5-6h/dzień, bufor min. 30%).
  - Prezentuje wynik w czytelnej formie.
- **Możliwość powrotu do wcześniejszych kroków**: Użytkownik może w dowolnym momencie wrócić do poprzednich etapów i zmodyfikować odpowiedzi.
- **Historia i ocena wycen**: Jako użytkownik chcę mieć możliwość przeglądania historii wygenerowanych wycen, aby móc śledzić zmiany i ponownie ocenić wcześniejsze wyceny.

## 4. Granice produktu
- Produkt koncentruje się na iteracyjnym, dynamicznym procesie zbierania wymagań i automatyzacji wyceny projektów IT.
- Brak pojedynczego, statycznego formularza – proces jest etapowy i adaptacyjny.
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
  - Uzytkownik moze zalogować się do systemu poprzez przycisk w prawym górnym rogu w sekcji header lub ze strony głównej (landing page)
  - Odzyskiwanie hasła powinno być mozliwe.
  - Po zalogowaniu uzytkownik przekierowany jest na widok listy swoich wycen
  - Logowanie i rejestracja odbywa się na dedykowanych im stronach. 
  - Niezalogowany uzytkownik przekierowany jest na stronę logowania (landing page)

### US-002: Iteracyjne wprowadzanie wymagań projektowych
- ID: US-002
- Tytuł: Iteracyjne wprowadzanie wymagań projektowych
- Opis: Jako użytkownik chcę przejść przez wieloetapowy, dynamiczny proces zbierania wymagań, w którym odpowiadam na kolejne pytania dotyczące projektu, aby system mógł precyzyjnie zrozumieć moje potrzeby i wygenerować adekwatną wycenę.
- Kryteria akceptacji:
  - Proces składa się z kilku kroków, w których pytania są dostosowywane do wcześniejszych odpowiedzi.
  - System może zadawać dodatkowe pytania pogłębiające w zależności od kontekstu.
  - Użytkownik może wracać do poprzednich kroków i edytować odpowiedzi.
  - Po zakończeniu procesu prezentowane jest podsumowanie do akceptacji.
  - Walidacja danych na każdym etapie z jasnymi komunikatami o błędach.

### US-003: Wybór platform i typu wyceny (w ramach procesu)
- ID: US-003
- Tytuł: Wybór platform i typu wyceny (w ramach procesu)
- Opis: Jako użytkownik chcę, aby wybór platform i typu wyceny był jednym z kroków procesu zbierania wymagań, a nie osobnym formularzem, aby cały proces był spójny i intuicyjny.
- Kryteria akceptacji:
  - Wybór platform i typu wyceny następuje w dedykowanym kroku wizardu.
  - System wymusza wybór co najmniej jednej platformy.
  - Wybrany typ wyceny jest jednoznacznie przekazywany do algorytmu.

### US-004: Automatyczne generowanie wyceny na podstawie iteracyjnie zebranych danych
- ID: US-004
- Tytuł: Automatyczne generowanie wyceny na podstawie iteracyjnie zebranych danych
- Opis: Jako użytkownik chcę, aby system generował wycenę na podstawie wszystkich zebranych w procesie krok po kroku odpowiedzi, aby uzyskać precyzyjny i dopasowany do mojego projektu wynik.
- Kryteria akceptacji:
  - System analizuje całość zebranych odpowiedzi.
  - Generuje szczegółowy scope, podział na zadania i estymacje.
  - Uwzględnia parametry pracy i bufor.
  - Wynik prezentowany jest w czytelnej formie.

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