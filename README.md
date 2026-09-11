# AI Study Companion

Now make the entire application AI-integration ready.

Do NOT connect a real AI API yet.

Create clean frontend service interfaces for:

Writing evaluation

Speaking evaluation

AI Coach

Mistake analysis

Personalized study plan

Vocabulary generation

Grammar exercise generation

Use mock responses for now.

The future architecture will be:

Frontend
→ FastAPI
→ AI service
→ AI model
→ structured JSON
→ Frontend

Create TypeScript types/interfaces for AI responses.

Example:

WritingEvaluation:

taskResponse

coherence

lexicalResource

grammar

overall

strengths

weaknesses

corrections

recommendations

SpeakingEvaluation:

fluency

lexicalResource

grammar

pronunciation

overall

transcript

corrections

recommendations

Keep the frontend completely functional using mock data.

Do not expose API keys in frontend code.

Do not add paid subscription functionality.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ca1c8d55-86be-474f-9ff6-7c9ac478b3fb).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
