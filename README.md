# Vocabex

A lightweight web application that displays three new vocabulary words daily, complete with definitions and example sentences. The application uses an LLM to generate fresh content each day.

## Features

- Daily vocabulary words with multiple definitions
- Example sentences for each word
- Clean, dictionary-style presentation
- Server-side caching to ensure one LLM call per day
- Responsive design with Tailwind CSS

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd vocabex
```

2. Install dependencies:
```bash
npm install
```

3. Set the following env variables
```
LLM_API_ENDPOINT=your_llm_api_endpoint
LLM_API_KEY=your_llm_api_key
```

4. Start the server:
```bash
npm start
```

The application will be available at `http://localhost:3000`.

## Deployment to Google Cloud Run

1. Set up environment variables in Google Cloud Run:
```bash
gcloud run services update vocabex\
  --update-env-vars LLM_API_ENDPOINT=your_endpoint,LLM_API_KEY=your_key
```

2. Build and deploy:
```bash
# Build the container
gcloud builds submit --tag <region>-dev.pkg/YOUR_PROJECT_ID/vocabex/vocabex

# Deploy to Cloud Run
gcloud run deploy vocabex \
  --image <region>-dev.pkg/YOUR_PROJECT_ID/vocabex/vocabex \
  --platform managed \
  --region <region> \
  --allow-unauthenticated
```

Replace `YOUR_PROJECT_ID` with your Google Cloud project ID and `region` with your desired region (e.g., `us-central1`).

## Tech Stack

- Node.js with Express for the backend
- Alpine.js for minimal client-side interactivity
- Tailwind CSS for styling
- Mistral AI for LLM integration
- Docker for containerization
- Google Cloud Run for hosting

## Development

The application is built with simplicity in mind, using lightweight libraries and minimal dependencies. The server handles the LLM API calls and caches the results, while the client provides a clean, responsive interface for displaying the vocabulary words.

## License

MIT 