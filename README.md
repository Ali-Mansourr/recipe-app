# RecipeVault - Recipe Management System

A full-stack recipe management application built with Next.js, Prisma, and AI-powered features. Organize, share, and discover recipes with an intuitive modern interface.

## Features

### Core Features
- **Recipe Management**: Create, edit, and delete recipes with ingredients, step-by-step instructions, and metadata (cuisine type, prep/cook time, servings)
- **Status Tagging**: Mark recipes as "Favorite," "To Try," or "Made Before" with one click
- **Search & Filters**: Find recipes by name, ingredient, cuisine type, or maximum prep time. Sort by newest, oldest, title, or prep time
- **Multi-User Support**: Full authentication with Google, GitHub, or email/password registration

### Sharing
- Share recipes with other users via email
- Control permissions (view-only or edit access)
- Make recipes public for anyone to discover
- Dedicated "Shared with Me" page

### AI Features (Groq-powered)
- **Recipe Generator**: Describe what you want to cook or list available ingredients — AI creates a complete recipe
- **Ingredient Substitution**: Find smart alternatives for any ingredient with dietary restriction support
- **AI Auto-fill**: Automatically detect cuisine type, estimate prep/cook time, and suggest tags
- **Meal Plan Generator**: Generate a full 7-day meal plan with a combined shopping list

### Extra Features
- Dark mode / light mode toggle
- Responsive design (mobile, tablet, desktop)
- Recipe tags system
- Loading skeletons and toast notifications
- Mobile bottom navigation bar

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| Authentication | NextAuth.js v5 (Auth.js) |
| AI | Groq Llama 3.3 70B (free) |
| Styling | Tailwind CSS |
| UI Components | Radix UI + shadcn/ui patterns |
| Deployment | Vercel |

## Getting Started

### Prerequisites
- Node.js 18.17+ 
- A PostgreSQL database (recommended: [Neon](https://neon.tech) free tier)
- Groq API key (free at [console.groq.com](https://console.groq.com))

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ali-Mansourr/recipe-app.git
   cd recipe-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in the values in `.env`:
   - `DATABASE_URL` — Your PostgreSQL connection string
   - `AUTH_SECRET` — Run `npx auth secret` or use any random string
   - `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` — From [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` — From [GitHub Developer Settings](https://github.com/settings/developers)
   - `GROQ_API_KEY` — From [Groq Console](https://console.groq.com/keys)

4. **Set up the database**
   ```bash
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

### Deploy to Vercel

1. Push your code to GitHub
2. Import the repository on [Vercel](https://vercel.com/new)
3. Add all environment variables from `.env.example` in Vercel's project settings
4. Deploy — Vercel auto-detects Next.js and runs `prisma generate` via the `postinstall` script

## Project Structure

```
recipe-app/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── (auth)/             # Login & register pages
│   │   ├── api/                # API routes (recipes, auth, AI, sharing)
│   │   ├── dashboard/          # Protected dashboard pages
│   │   │   ├── recipes/        # CRUD pages
│   │   │   ├── shared/         # Shared recipes page
│   │   │   ├── search/         # Search page
│   │   │   └── ai/             # AI features page
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Landing page
│   ├── auth.ts                 # NextAuth configuration
│   ├── middleware.ts            # Route protection
│   ├── components/             # React components
│   │   ├── ui/                 # Base UI components
│   │   ├── navbar.tsx
│   │   ├── recipe-card.tsx
│   │   ├── recipe-form.tsx
│   │   ├── share-dialog.tsx
│   │   └── status-toggle.tsx
│   ├── lib/                    # Utilities
│   └── types/                  # TypeScript declarations
├── .env.example
├── package.json
└── README.md
```

## License

MIT
