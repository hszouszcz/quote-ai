# Przewodnik implementacji usługi OpenRouter

## 1. Opis usługi

Usługa OpenRouter stanowi pośrednika łączącego interfejs API OpenRouter z aplikacją czatu opartą na modelach językowych (LLM). Jej celem jest przetwarzanie zapytań użytkownika, budowanie odpowiednich żądań do API (z uwzględnieniem komunikatu systemowego, komunikatu użytkownika, ustrukturyzowanych odpowiedzi, nazwy modelu oraz parametrów modelu) oraz efektywne zarządzanie odpowiedziami. Integracja ta umożliwia dynamiczne, bezpieczne i skalowalne uzupełnianie czatów danymi generowanymi przez LLM.

### Kluczowe komponenty usługi OpenRouter

1. **Moduł konfiguracji**  
   - Funkcjonalność: Inicjalizuje połączenie z API OpenRouter, ładuje URL, API Key, domyślną nazwę modelu, parametry oraz response_format.  
   - Wyzwania: Bezpieczeństwo klucza API i dynamiczne zmiany konfiguracji.  
   - Rozwiązania: Przechowywanie klucza w zmiennych środowiskowych oraz walidacja danych konfiguracyjnych.

2. **Moduł budowania payloadu**  
   - Funkcjonalność: Łączy komunikat systemowy, komunikat użytkownika, response_format, nazwę modelu i parametry w spójne żądanie.  
   - Wyzwania: Zachowanie spójności danych i walidacja formatu JSON.  
   - Rozwiązania: Implementacja metody `_buildPayload` z wbudowaną walidacją schematu.

3. **Moduł wysyłania żądania**  
   - Funkcjonalność: Wysyła zbudowany payload do API OpenRouter z obsługą retry logic, timeout i monitorowaniem odpowiedzi.  
   - Wyzwania: Błędy sieciowe, rate limiting oraz timeout.  
   - Rozwiązania: Mechanizmy ponownych prób, kolejkowanie żądań i monitorowanie czasu odpowiedzi.

4. **Moduł przetwarzania odpowiedzi**  
   - Funkcjonalność: Parsuje i waliduje odpowiedź API zgodnie z zdefiniowanym `response_format`.  
   - Wyzwania: Niespełnienie schematu lub błędy parsowania JSON.  
   - Rozwiązania: Użycie dedykowanej biblioteki do walidacji schematów JSON oraz obsługa wyjątków.

5. **Moduł logowania i obsługi błędów**  
   - Funkcjonalność: Centralizuje logowanie błędów i umożliwia szczegółową diagnostykę problemów.  
   - Wyzwania: Zbyt ogólna obsługa błędów i niedostateczne logowanie krytycznych zdarzeń.  
   - Rozwiązania: Szczegółowe komunikaty błędów, maskowanie danych wrażliwych oraz integracja z systemem monitorowania błędów.

### Integracja wymagań OpenRouter API

1. **Komunikat systemowy**: np. "System: Udzielaj krótkich, precyzyjnych odpowiedzi."  
2. **Komunikat użytkownika**: Dynamicznie pobierany z interfejsu użytkownika.  
3. **Ustrukturyzowane odpowiedzi**: Oparte na schemacie `response_format`, przykładowo:

   ```json
   {
     "type": "json_schema",
     "json_schema": {
       "name": "OpenRouterResponse",
       "strict": true,
       "schema": { "result": "string", "metadata": "object" }
     }
   }
   ```

4. **Nazwa modelu**: np. `gpt-3.5-turbo` lub `gpt-4`.  
5. **Parametry modelu**: np. `temperature`, `max_tokens`, `top_p` (oraz ewentualnie inne konfiguracje dynamiczne).

## 2. Opis konstruktora

Konstruktor usługi powinien:
- Inicjalizować konfigurację połączenia z API OpenRouter, w tym URL, API Key oraz domyślne parametry modelu.
- Ustawiać wartości domyślne, takie jak nazwa modelu (np. `gpt-3.5-turbo`), parametry (temperature, max_tokens, top_p) oraz schemat `response_format`:

  ```json
  {
    "type": "json_schema",
    "json_schema": {
      "name": "OpenRouterResponse",
      "strict": true,
      "schema": { "result": "string", "metadata": "object" }
    }
  }
  ```

- Ładować ustawienia bezpieczeństwa, w tym mechanizmy logowania i obsługi błędów.

## 3. Publiczne metody i pola

1. **executeRequest(input: RequestPayload): Promise<ResponsePayload>**
   - Odpowiada za wysłanie żądania do API OpenRouter.
   - Buduje payload, łącząc:
     1. Komunikat systemowy (przykładowo: "System: Udzielaj krótkich, precyzyjnych odpowiedzi.")
     2. Komunikat użytkownika, pochodzący z interfejsu.
     3. Ustrukturyzowany response_format zgodnie ze schematem:
        ```json
        {
          "type": "json_schema",
          "json_schema": {
            "name": "OpenRouterResponse",
            "strict": true,
            "schema": { "result": "string", "metadata": "object" }
          }
        }
        ```
     4. Nazwą modelu (np. `gpt-3.5-turbo` lub `gpt-4`) oraz dynamicznymi parametrami modelu.

2. **setModelConfig(config: ModelConfig): void**
   - Pozwala na aktualizację konfiguracji modelu oraz powiązanych parametrów (temperature, max_tokens, top_p itd.).

3. **Pola konfiguracyjne** takie jak:
   - `apiUrl: string`
   - `apiKey: string`
   - `defaultModel: string`
   - `defaultParams: ModelParams`
   - `responseSchema: ResponseFormat`

## 4. Prywatne metody i pola

1. **_buildPayload(input: RequestPayload): RequestPayload**
   - Prywatna metoda odpowiedzialna za stworzenie spójnego payloadu, łącząc komunikat systemowy i użytkownika oraz dodając response_format.

2. **_handleResponse(rawResponse: any): ResponsePayload**
   - Odpowiada za walidację i parsowanie odpowiedzi API zgodnie z zdefiniowanym schematem.

3. **_logError(error: Error, context: string): void**
   - Centralizuje logowanie błędów i przekazuje je do systemu monitorowania.

4. **_validatePayload(payload: RequestPayload): boolean**
   - Sprawdza poprawność payloadu przed wysłaniem go do API.

## 5. Obsługa błędów

Potencjalne scenariusze błędów i proponowane rozwiązania:

1. **Błąd połączenia sieciowego (timeout, brak połączenia)**
   - Rozwiązanie: Implementacja mechanizmu ponownych prób z eksponencjalnym opóźnieniem oraz wstępna walidacja dostępności sieci.

2. **Nieważny lub brakujący klucz API**
   - Rozwiązanie: Weryfikacja konfiguracji API na etapie inicjalizacji usługi oraz informowanie o błędach konfiguracyjnych.

3. **Nieoczekiwany format odpowiedzi lub niespełnienie schematu `response_format`**
   - Rozwiązanie: Walidacja odpowiedzi za pomocą dedykowanej biblioteki do schematów JSON oraz obsługa wyjątków.

4. **Ograniczenia API (rate limiting)**
   - Rozwiązanie: Implementacja mechanizmu kolejkowania żądań oraz detekcja kodów błędu związanych z limitowaniem.

5. **Błędy przetwarzania danych (parsowanie JSON, błędy logiki)**
   - Rozwiązanie: Użycie bloków try/catch w metodach przetwarzających dane oraz szczegółowe logowanie występujących błędów.

## 6. Kwestie bezpieczeństwa

1. Przechowywanie klucza API w bezpiecznych zmiennych środowiskowych oraz ograniczony dostęp do konfiguracji.
2. Walidacja danych wejściowych i wyjściowych przy budowie żądań i przetwarzaniu odpowiedzi.
3. Użycie protokołu HTTPS dla komunikacji z API.
4. Logowanie błędów przy jednoczesnym maskowaniu danych wrażliwych.
5. Implementacja mechanizmów autoryzacji dla metod administracyjnych oraz zmiany konfiguracji.

## 7. Plan wdrożenia krok po kroku

1. **Przygotowanie środowiska**
   - Upewnij się, że projekt korzysta z Astro 5, TypeScript 5, React 19, Tailwind 4 oraz Shadcn/ui.
   - Skonfiguruj zmienne środowiskowe, w szczególności klucz API dla OpenRouter.

2. **Inicjalizacja modułu OpenRouter**
   - Utwórz dedykowany moduł w katalogu `./src/lib` odpowiedzialny za komunikację z API OpenRouter.
   - Zaimplementuj konstruktor inicjalizujący konfigurację (URL, API Key, domyślne ustawienia modelu).

3. **Implementacja metod publicznych**
   - Zaimplementuj metodę `executeRequest`:
     - Zbuduj payload łączący komunikat systemowy oraz użytkownika.
     - Ustaw response_format zgodnie z poniższym przykładem:
       ```json
       {
         "type": "json_schema",
         "json_schema": {
           "name": "OpenRouterResponse",
           "strict": true,
           "schema": { "result": "string", "metadata": "object" }
         }
       }
       ```
     - Przekaż nazwę modelu (np. `gpt-3.5-turbo` lub `gpt-4`) oraz dynamiczne parametry modelu.
   - Zaimplementuj metodę `setModelConfig` umożliwiającą aktualizację ustawień modelu.

4. **Implementacja metod prywatnych**
   - Zaimplementuj `_buildPayload` dla spójnego tworzenia żądań.
   - Zaimplementuj `_handleResponse` do walidacji i parsowania odpowiedzi API.
   - Dodaj `_logError` oraz `_validatePayload` dla wzmocnionej obsługi błędów.

5. **Integracja z interfejsem API OpenRouter**
   - Testuj wysyłanie żądań do OpenRouter, upewniając się, że:
     1. Komunikat systemowy (np. "System: Proszę o krótkie i precyzyjne odpowiedzi") jest poprawnie przekazywany.
     2. Komunikat użytkownika jest dynamicznie pobierany z interfejsu.
     3. Response_format jest zgodny z oczekiwanym schematem.
     4. Nazwa modelu i parametry (temperature, max_tokens, top_p) są poprawnie konfigurowane.

6. **Testowanie i walidacja**
   - Napisz testy jednostkowe oraz integracyjne w celu walidacji:
     - Budowy payloadu i parsowania odpowiedzi.
     - Mechanizmów ponownych prób i obsługi błędów.
     - Zgodności odpowiedzi z ustrukturyzowanym schematem JSON.

7. **Wdrożenie mechanizmów obsługi błędów oraz bezpieczeństwa**
   - Zaimplementuj centralny system logowania błędów i mechanizmy obsługi wyjątków.
   - Testuj scenariusze błędów: brak połączenia, niewłaściwy klucz API, niezgodność schematu odpowiedzi oraz rate limiting.

8. **Finalne wdrożenie**
   - Wdróż moduł OpenRouter w środowisku developerskim i przeprowadź pełen cykl testów.
   - Zintegruj moduł z interfejsem czatu, monitorując logi i wydajność.
   - Po pomyślnym zakończeniu testów wdroż rozwiązanie na środowisko produkcyjne. 