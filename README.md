# FlashLearn

A modern flashcard learning application with spaced repetition, multiple study modes, and AI-powered card generation.

## Features

- **User Authentication** - Secure email/password registration and login
- **Deck Management** - Create, edit, and delete flashcard decks
- **Multiple Study Modes**
  - **Flip Mode** - Classic flashcard flip animation
  - **Quiz Mode** - Multiple choice questions with smart distractors
  - **Match Mode** - Drag and drop matching game
  - **Review Mode** - Spaced repetition with SM-2 algorithm
- **AI Card Generation** - Upload documents (PDF, DOCX, PPTX, etc.) to auto-generate flashcards
- **Progress Tracking** - Track mastery level, streaks, XP, and levels
- **Responsive Design** - Works on desktop and mobile

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js
- **AI Integration**: OpenAI / Anthropic APIs

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- OpenAI or Anthropic API key (for AI card generation)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd flashcard-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="file:./dev.db"

   # NextAuth
   NEXTAUTH_SECRET="your-secret-key-here"
   NEXTAUTH_URL="http://localhost:3000"

   # AI APIs (at least one required for file upload feature)
   OPENAI_API_KEY="sk-your-openai-key"
   ANTHROPIC_API_KEY="sk-ant-your-anthropic-key"
   ```

4. **Initialize the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### Creating a Deck

1. Sign in or create an account
2. Click "Create Deck" from the dashboard
3. Either:
   - Upload a document (PDF, DOCX, PPTX, etc.) to auto-generate cards
   - Manually add cards with front/back content
4. Click "Create Deck" to save

### Studying

1. Select a deck from your dashboard
2. Choose a study mode:
   - **Flip** - Click cards to flip and reveal answers
   - **Quiz** - Answer multiple choice questions
   - **Match** - Match terms with definitions
   - **Review** - Spaced repetition with difficulty ratings

### File Upload

Supported file formats for AI card generation:

| Type | Extensions |
|------|------------|
| PDF | `.pdf` |
| Word | `.docx`, `.doc` |
| PowerPoint | `.pptx` |
| Excel | `.xlsx` |
| Text | `.txt`, `.md`, `.rtf` |
| Data | `.csv` |
| Web | `.html`, `.htm` |
| OpenDocument | `.odt`, `.odp` |

Maximum file size: 10MB

## Project Structure

```
flashcard-app/
├── prisma/
│   └── schema.prisma      # Database schema
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── api/           # API routes
│   │   ├── dashboard/     # Dashboard page
│   │   ├── decks/         # Deck pages (view, edit, study)
│   │   ├── login/         # Login page
│   │   └── register/      # Registration page
│   ├── components/        # React components
│   │   ├── deck/          # Deck-related components
│   │   ├── flashcard/     # Study mode components
│   │   ├── layout/        # Layout components (Navbar)
│   │   └── ui/            # Reusable UI components
│   └── lib/               # Utility functions
│       ├── ai.ts          # AI card generation
│       ├── auth.ts        # NextAuth configuration
│       ├── fileParser.ts  # File parsing utilities
│       ├── prisma.ts      # Prisma client
│       └── spacedRepetition.ts  # SM-2 algorithm
├── .env                   # Environment variables
├── package.json
└── README.md
```

## API Reference

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/*` | - | NextAuth authentication routes |
| `/api/register` | POST | Create new user account |
| `/api/decks` | GET | List all user's decks |
| `/api/decks` | POST | Create new deck |
| `/api/decks/[id]` | GET | Get single deck with cards |
| `/api/decks/[id]` | PUT | Update deck |
| `/api/decks/[id]` | DELETE | Delete deck |
| `/api/generate` | POST | Generate flashcards from file/text |
| `/api/progress` | GET | Get progress for a deck |
| `/api/progress` | POST | Update card progress |
| `/api/user/stats` | GET | Get user statistics |

## Spaced Repetition (SM-2 Algorithm)

The app uses the SM-2 algorithm for optimized learning:

- Cards are scheduled based on difficulty ratings (Again, Hard, Good, Easy)
- Ease factor adjusts based on performance
- Intervals increase as cards are mastered
- XP is awarded for studying with streak bonuses

**Rating Effects:**
- **Again (0)** - Reset interval, reduce ease factor
- **Hard (3)** - Shorter interval, slight ease reduction
- **Good (4)** - Normal interval progression
- **Easy (5)** - Longer interval, increased ease factor

## Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# View database (Prisma Studio)
npx prisma studio

# Reset database
npx prisma db push --force-reset

# Generate Prisma client
npx prisma generate
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Database connection string |
| `NEXTAUTH_SECRET` | Yes | Secret for NextAuth.js sessions |
| `NEXTAUTH_URL` | Yes | Base URL of your application |
| `OPENAI_API_KEY` | No* | OpenAI API key for card generation |
| `ANTHROPIC_API_KEY` | No* | Anthropic API key for card generation |

*At least one AI API key is required for the file upload feature.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details.
