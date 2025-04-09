# AI Estimation

## Table of Contents
- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Description

AI Estimation is an automated system designed to generate IT project quotations using AI. It streamlines the quoting process by allowing users to input detailed project descriptions (up to 100000 characters), select target platforms, and choose an estimation type (Fixed Price or Time & Material). The system automatically generates a comprehensive project scope, including task breakdowns, man-day calculations (based on 5-6 working hours per day), and applies a minimum buffer of 30% to account for potential complexities.

Additional features include:
- OAuth-based user authentication for secure access.
- A rating and evaluation system for the generated estimates.
- A history log of all generated quotations for easy review.

## Tech Stack

- **Frontend:** Astro 5, React 19, TypeScript 5, Tailwind CSS 4, Shadcn/ui
- **Backend:** Supabase (PostgreSQL, authentication, and real-time APIs)
- **AI Integration:** Openrouter.ai for accessing a range of AI models
- **CI/CD & Hosting:** GitHub Actions for CI/CD pipelines and DigitalOcean (Docker-based deployment)

## Getting Started Locally

### Prerequisites
- Node.js version as specified in the `.nvmrc` file (22.14.0)
- npm (Node Package Manager)

### Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/hszouszcz/quote-ai.git
   ```
2. **Navigate to the project directory:**
   ```sh
   cd quote-ai
   ```
3. **Install dependencies:**
   ```sh
   npm install
   ```
4. **Run the development server:**
   ```sh
   npm run dev
   ```

## Available Scripts

The following scripts are available in the project:

- **dev:** Runs the development server (`astro dev`)
- **build:** Builds the project for production (`astro build`)
- **preview:** Serves the production build for preview (`astro preview`)
- **astro:** Helper command for Astro tasks
- **lint:** Runs ESLint to analyze the code for issues (`eslint .`)
- **lint:fix:** Automatically fixes ESLint issues (`eslint . --fix`)
- **format:** Formats the code using Prettier (`prettier --write .`)

## Project Scope

The project focuses on automating the creation of IT project quotations. Key functionalities include:

- Input of a detailed project description (up to 100000 characters) with robust validation.
- Selection of project platforms (e.g., frontend, backend, iOS, Android) via checkboxes (at least one must be selected).
- Choice of estimation type: Fixed Price or Time & Material.
- Automatic generation of project scope including task breakdowns and man-day calculations, with a built-in buffer of at least 30%.
- Secure user authentication using OAuth (without social login options).
- An evaluation system that allows users to rate and comment on generated estimates.
- Maintenance of a history log for all generated quotations.

## Project Status

This project is currently under active development. As a part-time endeavor with a planned timeline of 4 weeks, further enhancements and refinements are expected.

## License

This project is licensed under the MIT License. 