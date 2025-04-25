```mermaid
graph TD
    A["Użytkownik"]
    B["UI: Strona logowania"]
    C["API: Endpoint OAuth"]
    D["Serwis OAuth - bez social login"]
    E["Middleware: Weryfikacja Tokena"]
    F["Chronione zasoby"]

    A --"Kliknięcie 'Zaloguj'"--> B
    B --"Wprowadzenie danych logowania"--> C
    C ==> D
    D --"Generuje token OAuth"--> C
    C --"Odpowiedź tokenem"--> A
    A --"Żądanie z Bearer token"--> E
    E -.-> F

classDef auth fill:#f96,stroke:#333,stroke-width:2px;
class D auth