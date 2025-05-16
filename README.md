# CoverGenie

CoverGenie is a Chrome extension that generates personalized cover letters using AI. It uses Ollama with the Mistral model to generate cover letters based on your resume and job descriptions.

## Features

- Chrome extension for easy access
- Extracts job details from LinkedIn and Handshake
- Generates personalized cover letters using AI
- Edit generated cover letters directly in the extension
- Free and local AI processing using Ollama

## Prerequisites

- Python 3.9+
- Chrome browser
- Ollama installed locally

## Installation

1. Install Ollama:
   ```bash
   # For macOS
   brew install ollama
   brew services start ollama
   
   # Pull the Mistral model
   ollama pull mistral
   ```

2. Install Python dependencies:
   ```bash
   pip install fastapi uvicorn requests python-dotenv
   ```

3. Load the Chrome extension:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `extension` folder from this project

## Usage

1. Start the backend server:
   ```bash
   uvicorn backend.main:app --reload
   ```

2. Go to any job posting (LinkedIn, Handshake, etc.)
3. Click the CoverGenie extension icon
4. Click "Generate Cover Letter"
5. Edit the generated cover letter if needed
6. Copy and use the cover letter

## Project Structure

```
covergenie/
├── backend/
│   ├── main.py
│   └── utils/
│       ├── ollama.py
│       ├── parser.py
│       ├── prompt_builder.py
│       └── doc_gen.py
├── extension/
│   ├── manifest.json
│   ├── popup.html
│   ├── popup.js
│   ├── content.js
│   └── icon.png
├── resume/
│   └── resume_data.json
├── .gitignore
└── README.md
```

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is licensed under the MIT License - see the LICENSE file for details.
