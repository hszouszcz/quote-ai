🧩 ETAP 1: ZROZUMIENIE PROJEKTU

Cel: Znormalizować surowy opis od klienta w postaci zrozumiałej dla AI.
AI musi rozpoznać typ aplikacji, cel biznesowy, kluczowe funkcje i ograniczenia.

⸻

🔸 System Prompt

You are a senior presales consultant and solution architect specialized in scoping and estimating custom software projects for clients.
Your goal is to analyze a client’s project description and produce a structured understanding of what they want to build.
Be explicit, practical, and concise.

⸻

🔸 User Prompt

Analyze the following project brief.
Extract and summarize the following information:
	•	Project goal
	•	Target audience
	•	Product type (SaaS, mobile app, marketplace, internal tool, etc.)
	•	Key features (grouped logically)
	•	Non-functional requirements (e.g. performance, integrations, scalability)
	•	Known constraints or open questions

Input example:

I want to build a platform for climbing gyms that allows customers to book classes, track progress, and buy memberships. There should be an admin dashboard for gym owners, an app for users, and integration with Stripe.

Output example (JSON):
{
  "goal": "Digital platform for climbing gyms",
  "target_audience": ["gym owners", "climbers"],
  "type": "SaaS + mobile app",
  "key_features": {
    "User app": ["class booking", "membership management", "progress tracking"],
    "Admin dashboard": ["schedule management", "user insights", "payment tracking"]
  },
  "non_functional": ["Stripe integration", "mobile + web"],
  "open_questions": ["Will users log in via email or social auth?", "Should it support multiple gyms?"]
}

🧩 ETAP 2: IDENTYFIKACJA MODUŁÓW SYSTEMU

Cel: Podzielić projekt na logiczne moduły, które można osobno wyceniać.

⸻

🔸 System Prompt

You are a software architect experienced in modular system design.
Based on the structured project summary, identify the main system modules and their internal components.

⸻

🔸 User Prompt

Based on the following project description (JSON), list all logical modules of the system, and for each module, describe:
	•	Its purpose
	•	Key features inside the module
	•	Dependencies between modules
	•	Which team would own it (frontend / backend / mobile / devops)

Output Example:
{
  "modules": [
    {
      "name": "Authentication & User Management",
      "purpose": "Allow users to register, log in, and manage profiles",
      "features": ["Email/password login", "Social auth", "Role management"],
      "dependencies": ["Database", "Frontend"],
      "team": "backend"
    },
    {
      "name": "Booking System",
      "purpose": "Enable users to book climbing classes",
      "features": ["Schedule view", "Booking API", "Payment link"],
      "dependencies": ["Authentication", "Payments"],
      "team": "frontend + backend"
    }
  ]
}

🧩 ETAP 3: OCENA ZŁOŻONOŚCI MODUŁÓW

Cel: Określić trudność implementacji każdego modułu.

⸻

🔸 System Prompt

You are a senior delivery manager with 10+ years of experience estimating software projects.
Assess the technical and functional complexity of each module.

⸻

🔸 User Prompt

For each module in the input JSON, assign:
	•	Complexity: Low, Medium, or High
	•	Risk: Low, Medium, or High
	•	Justification: short, practical reason (e.g. “standard login + social auth = medium complexity”)

Output Example:
[
  {
    "module": "Authentication & User Management",
    "complexity": "Medium",
    "risk": "Low",
    "justification": "Standard OAuth + basic CRUD"
  },
  {
    "module": "Booking System",
    "complexity": "High",
    "risk": "Medium",
    "justification": "Calendar logic + concurrency + payment flow"
  }
]

🧩 ETAP 4: ESTYMACJA NAKŁADU PRACY (MD)

Cel: Ustalić zakres czasowy realizacji.
Heurystyka bazuje na złożoności, liczbie funkcji i ryzyku.

⸻

🔸 System Prompt

You are an AI assistant for project estimation.
Use industry heuristics to assign man-days (MD) to each module.
Each module has three scenarios: optimistic, realistic, and pessimistic.

⸻

🔸 User Prompt

Estimate man-days for each module based on the following logic:
	•	Low complexity = 2–5 MD
	•	Medium = 5–10 MD
	•	High = 10–20 MD
Adjust for risk (add +20% for Medium, +40% for High risk).
Return values for optimistic / realistic / pessimistic variants.

Output Example:
[
  {
    "module": "Authentication & User Management",
    "md": { "optimistic": 4, "realistic": 6, "pessimistic": 9 }
  },
  {
    "module": "Booking System",
    "md": { "optimistic": 8, "realistic": 12, "pessimistic": 18 }
  }
]

🧩 ETAP 5: ANALIZA NIEPEWNOŚCI

Cel: Określić poziom pewności wyceny (confidence score).

⸻

🔸 System Prompt

You are a senior presales analyst.
Based on project clarity, number of unknowns, and integration count, assess uncertainty and confidence level.

⸻

🔸 User Prompt

Evaluate project uncertainty using the “cone of uncertainty” model.
Return:
	•	confidence_level: Low / Medium / High
	•	uncertainty_range: e.g. “±50%”
	•	main causes of uncertainty

Output Example:
{
  "confidence_level": "Medium",
  "uncertainty_range": "±40%",
  "drivers": ["External API details unknown", "No design yet", "Unclear deployment scope"]
}

🧩 ETAP 6: OPIS PRAC I ZADAŃ

Cel: Wygenerować listę konkretnych zadań i kroków implementacyjnych (dla raportu).

⸻

🔸 System Prompt

You are a delivery manager preparing a scoping report for a client.
Convert the technical modules into a clear, client-facing list of deliverables.

⸻

🔸 User Prompt

For each module, list:
	•	Short human-readable name
	•	Description of what will be delivered
	•	Key assumptions
	•	Estimated MD (realistic)

Output Example (Markdown Table):
Module
Description
Key Assumptions
MD
Auth
Login, registration, roles
Using existing OAuth providers
6
Booking
Class booking + calendar
Stripe for payments
12

🧩 ETAP 7: KALKULACJA KOSZTÓW

Cel: Przeliczyć MD na pieniądze i dodać bufory.

⸻

🔸 System Prompt

You are a financial analyst in a software house.
Convert man-days to estimated project cost with appropriate buffers.

⸻

🔸 User Prompt

Use rate: X PLN/MD.
Add 20% project management and QA overhead.
Add uncertainty buffer based on confidence level.
Return total and breakdown per module.

Output Example:
{
  "rate": 400,
  "modules": [
    { "name": "Auth", "md": 6, "cost": 2400 },
    { "name": "Booking", "md": 12, "cost": 4800 }
  ],
  "overhead": 1440,
  "buffer": 1440,
  "final_cost": 10080
}

🧩 ETAP 8: ANALIZA RYZYK

Cel: Pokazać klientowi, że wycena uwzględnia trudne elementy.

⸻

🔸 System Prompt

You are a delivery consultant.
Identify potential risks and mitigation strategies for the estimated project.

⸻

🔸 User Prompt

List the 3–5 main delivery risks and for each:
	•	Description
	•	Likelihood (Low/Medium/High)
	•	Impact
	•	Mitigation strategy

Output Example:
[
  {
    "risk": "API instability",
    "likelihood": "Medium",
    "impact": "High",
    "mitigation": "Add error handling and fallback mechanisms"
  }
]

🧩 ETAP 9: GENEROWANIE RAPORTU

Cel: Złożyć dane w jeden, spójny raport gotowy do prezentacji lub eksportu PDF.

⸻

🔸 System Prompt

You are an AI report generator specialized in software estimations.
Combine all prior data into a clear, executive summary for a client.
Be professional, concise, and persuasive.

⸻

🔸 User Prompt

Create a full report including:
	•	Executive summary
	•	Feature breakdown and scope
	•	Estimated effort and cost (with variants)
	•	Risk analysis
	•	Key assumptions and recommendations
Output as structured Markdown with sections and tables.


🧩 ETAP 10: UCZENIE I KOREKTA

Cel: System sam się poprawia po każdym użyciu (jeśli ma feedback od zespołu delivery).

⸻

🔸 Prompt logiczny (meta)

Compare actual delivery data vs original estimate.
Identify which modules had largest variance and adjust heuristic multipliers for next iteration.

⸻

Tabela Ról i wyników dla kolejnych kroków
Etap
Rola AI
Wynik
1
Presales Consultant
Zrozumienie projektu
2
System Architect
Moduły systemu
3
Delivery Manager
Złożoność i ryzyko
4
Estimation Bot
MD (3 warianty)
5
Analyst
Niepewność
6
Delivery Manager
Opis prac
7
Financial Analyst
Koszty
8
Risk Consultant
Analiza ryzyk
9
Report Generator
Raport końcowy
10
AI Trainer
Uczenie i korekta

----------------------------------------------------------

## CZĘŚĆ DRUGA: 
Powyzej przedstawiony plan jest bardzo uproszczony.
potrzebuje najpierw lepszego rozwiazania na wycene projektu. to nie moze byc takie proste ze effort przeliczamy na x dni roboczych. to nie ma sensu. Model musi to robic w taki sposob, aby bardziej to odpowiadalo rzeczywistej zlozonosci problemu i ile pracy trzeba w to wlozyc 

Sama konwersja “złożoność → liczba dni” to zbyt prymitywne podejście. Nie oddaje rzeczywistego charakteru pracy (różne technologie, ryzyka, iteracje, integracje, testy itd.).
Poniżej przedstawiam ulepszoną koncepcję wyceny projektów przez AI, opartą o model złożoności kontekstowej — czyli bardziej zbliżoną do tego, jak wycenia doświadczony zespół software house.

⸻

🧭 CELOWY MODEL: „AI Contextual Complexity Estimation”

Model opiera się na czterech głównych filarach, które razem pozwalają uzyskać realistyczną, adaptacyjną wycenę:
	1.	Złożoność domenowa (Domain Complexity)
	2.	Złożoność techniczna (Technical Depth)
	3.	Złożoność interakcji (System Interaction Complexity)
	4.	Złożoność procesowa (Workflow & Delivery Complexity)

Każdy z tych filarów generuje subscore, który później jest używany do oszacowania nakładu pracy, ryzyka i czasu.

⸻

🔍 1. Złożoność domenowa (Domain Complexity)

Opis:
Jak trudny jest problem biznesowy, który rozwiązujemy? Czy wymaga specjalistycznej wiedzy branżowej lub unikalnych reguł?

Przykłady czynników:
	•	Liczba typów użytkowników (np. admin, klient, dostawca, moderator)
	•	Liczba przepływów biznesowych
	•	Stopień specyfiki branży (np. fintech, healthcare, logistics)
	•	Czy logika biznesowa jest dobrze opisana, czy niejasna?

Wycena:
AI przypisuje score 1–5 oraz uzasadnienie.
➡️ 1 = prosty CRUD (np. to-do app)
➡️ 3 = umiarkowany biznes (np. marketplace, rezerwacje)
➡️ 5 = złożony system (np. ERP, scoring AI, system wielo-tenantowy)

Model do użycia:
	•	Llama 3 8B lub Claude 3 Haiku – klasyfikacja semantyczna.

⸻

⚙️ 2. Złożoność techniczna (Technical Depth)

Opis:
Jak trudne są aspekty techniczne wdrożenia? Jak dużo wiedzy specjalistycznej wymaga projekt?

Czynniki:
	•	Liczba integracji z zewnętrznymi API
	•	Obecność elementów AI / ML
	•	Wymagana skalowalność / wydajność
	•	Typ platformy (web, mobile, desktop, multi-platform)
	•	Poziom bezpieczeństwa i certyfikacji (np. RODO, ISO)

Wycena:
AI tworzy listę technologii i funkcji → przypisuje wagę.
Każdy typ komponentu ma wbudowany baseline complexity coefficient (np. API = 1.2, AI module = 2.5, realtime sync = 1.7).

Model do użycia:
	•	Mixtral 8x7B – reasoning techniczny
	•	(dla jakości) GPT-4o-mini

⸻

🔄 3. Złożoność interakcji (System Interaction Complexity)

Opis:
Jak bardzo elementy systemu są od siebie zależne i jak trudna jest ich koordynacja?

Czynniki:
	•	Liczba integracji między modułami (np. backend ↔ frontend ↔ mobile ↔ admin panel)
	•	Czy aplikacja działa offline / realtime / wielosesyjnie
	•	Liczba unikalnych ekranów i przepływów użytkownika
	•	Wymagana synchronizacja danych

Wycena:
AI generuje macierz zależności pomiędzy komponentami, np.:
Moduł
Powiązane z
Waga interakcji
Autoryzacja
API, UI, DB
1.2
Płatności
API, Admin, CRM
1.6

Potem liczy średni interaction coefficient = Σ(wagi)/N.

Model:
	•	Claude 3 Haiku lub GPT-4o-mini – analiza relacji między modułami.

⸻

🧩 4. Złożoność procesowa (Workflow & Delivery Complexity)

Opis:
Jak trudny jest proces dostarczenia projektu? Jakie są ryzyka w komunikacji, testach, wdrożeniu?

Czynniki:
	•	Liczba środowisk (dev/stage/prod)
	•	Zespół jednoosobowy czy wielozespołowy
	•	Częstotliwość iteracji (np. Agile, Waterfall)
	•	Wymagania QA / CI/CD / dokumentacji
	•	Zależności z zewnętrznymi dostawcami

Wycena:
Każdy czynnik ma process overhead w procentach, np.
	•	QA: +10%
	•	Multi-platform delivery: +15%
	•	Complex CI/CD: +5%

Model:
	•	Mistral 7B (darmowy, szybki) do analizy workflow.

🧮 Wzór na ostateczną estymację

Każdy moduł (np. “Login”, “Payments”) otrzymuje:
EffortScore = (Domain * 0.3 + Technical * 0.3 + Interaction * 0.2 + Process * 0.2)

A następnie:
MD_realistic = BaseEffort * EffortScore * (1 + RiskFactor)

Gdzie:
	•	BaseEffort to wartość referencyjna (np. CRUD = 1 MD)
	•	RiskFactor może wynosić np. 0.1–0.5 (na podstawie stożka niepewności)

⸻

📊 Co daje takie podejście
	•	Pozwala AI symulować sposób myślenia doświadczonego analityka IT
	•	Generuje nie tylko estymację, ale i uzasadnienie dlaczego taka estymacja powstała
	•	Można uśredniać wyniki kilku modeli → “ensemble estimation”
	•	Pozwala porównywać projekty między sobą (benchmark własny z czasem)

⸻

🔧 Implementacyjnie
	1.	Krok 1: AI tworzy JSON z listą modułów.
	2.	Krok 2: Dla każdego modułu generuje cztery podskale (Domain, Technical, Interaction, Process).
	3.	Krok 3: Liczy EffortScore i przelicza na MD-range.
	4.	Krok 4: Generuje raport z uzasadnieniem („dlaczego ten moduł jest trudny”).


I Teraz problem polega na tym, ze ten rozbudowany system okreslania wyceny opisany w części drugiej - trzeba opisac w taki sposób jak czesc pierwsza. Tj. opis musi zawierac  CEL, SYSTEM PROMPT, HUMAN PROMPT, przykladowe inputy i outputy. Oraz w sposob logiczny i uporzadkowany obie te czesci nalezy połączyc aby algorytm ustalania wyceny (opisany w czesci 2) stał sie integralnym elementem całego procesu.