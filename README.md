# Daily Vocabulary Words

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
cd daily-vocabulary-words
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your LLM API credentials:
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

1. Install the [Google Cloud SDK](https://cloud.google.com/sdk/docs/install)

2. Enable required APIs:
```bash
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
```

3. Set up environment variables in Google Cloud Run:
```bash
gcloud run services update daily-vocabulary-words \
  --update-env-vars LLM_API_ENDPOINT=your_endpoint,LLM_API_KEY=your_key
```

4. Build and deploy:
```bash
# Build the container
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/daily-vocabulary-words

# Deploy to Cloud Run
gcloud run deploy daily-vocabulary-words \
  --image gcr.io/YOUR_PROJECT_ID/daily-vocabulary-words \
  --platform managed \
  --region your-preferred-region \
  --allow-unauthenticated
```

Replace `YOUR_PROJECT_ID` with your Google Cloud project ID and `your-preferred-region` with your desired region (e.g., `us-central1`).

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