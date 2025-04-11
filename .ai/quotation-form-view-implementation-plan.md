# Plan implementacji widoku Formularz tworzenia wyceny

## 1. Przegląd
Widok umożliwia użytkownikowi wprowadzenie szczegółowego opisu projektu, wybór platform oraz określenie typu wyceny. Dynamiczna walidacja zapewnia poprawność danych przed przesłaniem do API, które wygeneruje wycenę wraz z odpowiednim buforem.

## 2. Routing widoku
Widok powinien być dostępny pod następującymi ścieżkami:
- /wyceny/nowa
- /quotes/new

## 3. Struktura komponentów
- Główny komponent: QuotationForm
  - Dzieci:
    - ProjectDescriptionInput – pole tekstowe do opisu projektu, w formie TextArea
    - PlatformSelection – grupa checkboxów umożliwiająca wybór platform
    - EstimationTypeSelector – selektor typu wyceny (Fixed Price / Time & Material)
    - SubmitButton – przycisk przesyłania formularza

## 4. Szczegóły komponentów
### QuotationForm
- Opis: Główny komponent zarządzający stanem formularza, walidacją i wysyłką danych do API.
- Główne elementy: Formularz zawierający textarea, checkboxy, radio buttony oraz przycisk submit.
- Obsługiwane interakcje:
  - onChange dla wszystkich pól
  - onBlur dla walidacji
  - onSubmit wysyłający dane
- Walidacja:
  - Opis projektu nie przekracza 10 000 znaków
  - Przynajmniej jedna platforma musi być wybrana
  - Typ wyceny musi być jedną z określonych opcji
- Typy: Bazuje na typie CreateQuotationCommand (z pliku src/types.ts)
- Propsy: Opcjonalne callbacki (np. onSuccess, onError)

### ProjectDescriptionInput
- Opis: Pole tekstowe umożliwiające wprowadzenie opisu projektu.
- Główne elementy: <textarea>
- Obsługiwane interakcje:
  - onChange aktualizujący stan
  - onBlur sprawdzający długość tekstu
- Walidacja: Maksymalnie 10 000 znaków
- Typy: string
- Propsy: value, onChange, onBlur, error

### PlatformSelection
- Opis: Grupa checkboxów do wyboru platform, np. frontend, backend, iOS, Android.
- Główne elementy: Lista checkboxów z etykietami
- Obsługiwane interakcje: onChange aktualizujący listę wybranych platform
- Walidacja: Minimum jedna platforma musi być zaznaczona
- Typy: string[]
- Propsy: selectedPlatforms, onChange, error

### EstimationTypeSelector
- Opis: Umożliwia wybór typu wyceny – "Fixed Price" lub "Time & Material".
- Główne elementy: Radio buttony lub przełącznik
- Obsługiwane interakcje: onChange zmieniający wybrany typ
- Walidacja: Wartość musi być jedną z dozwolonych opcji
- Typy: "Fixed Price" | "Time & Material"
- Propsy: selectedType, onChange

### SubmitButton
- Opis: Przycisk umożliwiający wysłanie formularza.
- Główne elementy: Button
- Obsługiwane interakcje: onClick wywołujący submit formularza
- Propsy: disabled (w zależności od stanu formularza)

## 5. Typy
Nowy ViewModel formularza:
- QuotationFormViewModel:
  - scope: string – opis projektu
  - platforms: string[] – lista wybranych platform
  - estimation_type: "Fixed Price" | "Time & Material" – typ wyceny
  - errors: { scope?: string; platforms?: string; estimation_type?: string } – komunikaty walidacyjne
  - isSubmitting: boolean – status wysyłki

Bazowy DTO: CreateQuotationCommand z pliku src/types.ts

## 6. Zarządzanie stanem
Stan formularza będzie zarządzany w głównym komponencie przy użyciu hooków takich jak useState lub zaawansowanego rozwiązania np. react-hook-form, co uprości walidację i obsługę błędów. Opcjonalnie można stworzyć customowy hook useFormController do centralizacji logiki.

## 7. Integracja API
- Endpoint: POST /api/quotations
- Żądanie: JSON zgodny z CreateQuotationCommand
- Odpowiedź: Obiekt wyceny, zawierający powiązane platformy i zadania
- Działania frontendowe: Po poprawnej odpowiedzi, przekierowanie lub wyświetlenie potwierdzenia, obsługa błędów np. toast notification

## 8. Interakcje użytkownika
- Dynamiczne liczenie znaków podczas wpisywania opisu projektu
- Aktualizacja stanu przy zmianie wyboru checkboxów (PlatformSelection)
- Zmiana wybranego typu wyceny w EstimationTypeSelector
- Wciśnięcie przycisku powoduje walidację i wysyłkę formularza
- Informacja zwrotna po wysłaniu (sukces/błąd)

## 9. Warunki i walidacja
- Opis projektu: max 10 000 znaków
- Minimalny wybór: przynajmniej jedna platforma
- Typ wyceny: tylko dozwolone wartości
- Lokalna walidacja przed wysyłką danych na backend, wyświetlanie komunikatów błędów obok pól

## 10. Obsługa błędów
- Walidacja na poziomie klienta: wyświetlanie komunikatów błędów dla każdego pola
- Obsługa błędów API: wyświetlenie toastów lub komunikatów, blokowanie przycisku submit w trakcie operacji
- Informacja o błędach sieciowych i odpowiednia reakcja (np. retry lub komunikat o braku połączenia)

## 11. Kroki implementacji
1. Utworzyć nową stronę w folderze src/pages/quotes/new.astro (lub alternatywnie src/pages/wyceny/nowa.astro), importującą główny komponent QuotationForm.
2. Zaimplementować komponent QuotationForm:
   - Inicjalizacja stanu (QuotationFormViewModel).
   - Implementacja logiki walidacji oraz obsługi submit.
3. Zaimplementować komponent ProjectDescriptionInput z dynamiczną walidacją długości tekstu.
4. Zaimplementować komponent PlatformSelection renderujący checkboxy dla dostępnych platform (statyczna lista lub pobierana z API).
5. Zaimplementować komponent EstimationTypeSelector z opcjami Fixed Price i Time & Material.
6. Zaimplementować komponent SubmitButton sterowany stanem isSubmitting.
7. Zintegrować wysyłkę formularza z API (POST /api/quotations) i obsłużyć odpowiedź oraz ewentualne błędy.
8. Zastosować stylizację Tailwind CSS zgodnie z wytycznymi projektu.
9. Przeprowadzić testy interfejsu pod kątem responsywności, walidacji i obsługi błędów. 