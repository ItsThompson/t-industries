<div align="center">
<pre>
  _          _           _           _        _           
 | |        (_)         | |         | |      (_)          
 | |_ ______ _ _ __   __| |_   _ ___| |_ _ __ _  ___  ___ 
 | __|______| | '_ \ / _` | | | / __| __| '__| |/ _ \/ __|
 | |_       | | | | | (_| | |_| \__ \ |_| |  | |  __/\__ \
  \__|      |_|_| |_|\__,_|\__,_|___/\__|_|  |_|\___||___/

-----------------------------------------------------------------------------------------
Personal portfolio website built with SvelteKit, TypeScript, and Tailwind CSS.

</pre>

![GitHub top language](https://img.shields.io/github/languages/top/ItsThompson/t-industries)
![GitHub last commit (branch)](https://img.shields.io/github/last-commit/ItsThompson/t-industries/main)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/ItsThompson/t-industries)

</div>

## Introduction

This is the source code for [t-industri.es](https://t-industri.es), my personal portfolio website. Built with SvelteKit and styled with Tailwind CSS, it features a dynamic pipes background animation, real-time data fetching from a Google Sheets backend for R&D interests, and automated deployment to GitHub Pages via GitHub Actions.

## Tech Stack

- **Framework:** SvelteKit
- **Language:** TypeScript
- **Styling:** Tailwind CSS + PostCSS
- **Testing:** Vitest + Testing Library
- **Deployment:** GitHub Pages (via GitHub Actions)
- **Backend:** Google Sheets API (read-only, for dynamic content)

## Usage

### Getting Started

1. Clone the repository
```bash
git clone git@github.com:ItsThompson/t-industries.git
cd t-industries
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run check` | Run svelte-check type checking |
| `npm run test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run deploy` | Deploy to GitHub Pages |

### Building for Production

```bash
npm run build
```

The static output will be in the `build/` directory, ready for deployment.

## Project Structure

```
src/
├── components/       # Reusable Svelte components
│   ├── PipesBackground.svelte
│   ├── NavBar.svelte
│   ├── Badge.svelte
│   └── ...
├── routes/           # SvelteKit file-based routing
│   ├── +page.svelte
│   ├── ethos/
│   └── projects/
├── lib/              # Shared utilities
├── app.css           # Global styles
└── app.html          # HTML template
```
