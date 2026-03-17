# Code Catalysts

Code Catalysts is a student-led builder community focused on creating real products, learning in public, and growing through collaboration. This repository contains the official website and application flow for the team.

## What is Code Catalysts

Code Catalysts is a space for developers, designers, and creators who want to learn by building. The website presents the community, highlights the team journey, and gives new members a way to apply through a structured form experience.

## Vision

Our vision is to build a strong culture of makers who:

- learn fast by working on real ideas
- collaborate across design, frontend, backend, and AI
- ship polished projects instead of stopping at concepts
- grow into confident builders through teamwork and consistency

## Team

Current team members featured on the website:

- Rudraksh Pandey
- Sarthak Saini
- Tanishka Agarwal
- Ansh Aditya
- Radhika Maheshwari
- Ananya Khatri
- Prakhar Saxena
- Sparsh Raj
- Somya Purohit
- Shatakshi Bajpai
- Shambhavi

## Live Link

Website: https://codecatalysts-ten.vercel.app/


## Features

- modern landing page for the community
- animated interactive background
- team, about, projects, and journey sections
- dedicated `/apply` page for onboarding new members
- multi-step application form with validation
- secure form submission through a serverless API

## Tech Stack

- React 19
- Vite 7
- React Router DOM
- Framer Motion
- Lucide React
- Vercel Serverless Functions
- Supabase

## Project Structure

```text
.
|-- api/
|   `-- apply.js
|-- public/
|   |-- favicon.ico
|   |-- icon.png
|   `-- team/
|-- src/
|   |-- components/
|   |-- pages/
|   |-- App.jsx
|   |-- data.js
|   |-- index.css
|   `-- main.jsx
|-- index.html
|-- package.json
|-- vercel.json
`-- vite.config.js
```

## Getting Started

Install dependencies:

```bash
npm install
```

Run locally:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Backend Setup

The application form submits to the Vercel serverless function in [api/apply.js](/e:/CodeCatalysts/api/apply.js), which stores application data in Supabase.

Required environment variables:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Routes

- `/` for the main website
- `/apply` for the application form
