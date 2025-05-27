# SAM Opportunity Finder Integration Agent (SOFIA)

**Author:** David G. Smith, DGS Creative LLC  
**Date:** May 14, 2025

---

## Description

**SAM Opportunity Finder Integration Agent (SOFIA)** is a specialized microservice designed to automate the discovery, analysis, and distribution of government contracting opportunities from the System for Award Management (SAM.gov) platform. This tool leverages multiple APIs to streamline the identification of relevant opportunities, generate intelligent summaries, and distribute timely notifications to stakeholders.

SOFIA serves as a bridge between SAM.gov data and stakeholder decision-making processes, delivering actionable intelligence on government contracting opportunities through an automated workflow.

---

## Features

- **Automated Opportunity Discovery**
  - Configurable NAICS code-based search
  - Filtering by set-aside types and procurement categories
  - Daily refreshing of opportunities
- **AI-Powered Analysis**

  - Intelligent summarization of opportunity details using OpenAI's GPT-4
  - Extraction of key information including scope, deadlines, and requirements
  - One-liner summaries for quick assessment

- **Multi-Channel Distribution**

  - Configurable email notifications with detailed opportunity information
  - Google Sheets integration for team collaboration
  - Structured data export for further analysis

- **Efficient Data Management**

  - Cloud-based storage of opportunity data
  - Automated cleanup of outdated records
  - Status tracking through the entire opportunity lifecycle

- **Operational Reliability**
  - Health monitoring of all integrated services
  - Comprehensive logging system
  - Scheduled task management

---

## Architecture

SOFIA is built as a modular microservice with the following components:

1. **API Integration Layer**

   - SAM.gov API for opportunity data
   - OpenAI API for intelligent summarization
   - Google Sheets API for collaborative tracking

2. **Processing Engine**

   - Opportunity filtering based on configurable parameters
   - AI-powered summary generation
   - Status management workflow

3. **Distribution System**

   - Email notification generation and delivery
   - Google Sheets data synchronization

4. **Task Scheduler**

   - Daily opportunity discovery and summarization
   - Weekly email distribution and data synchronization
   - Automated housekeeping tasks

5. **Monitoring & Logging**
   - Health check endpoints
   - Multi-level logging system
   - Error tracking and reporting

---

## Technology Stack

- **Runtime**: Node.js with Express
- **Task Scheduling**: Node-Cron
- **APIs**:
  - SAM.gov API for government opportunities
  - OpenAI API for intelligent summarization
  - Google Sheets API for data integration
- **Storage**: DigitalOcean Spaces (S3-compatible)
- **Email**: Nodemailer with SMTP integration
- **Logging**: Winston with Daily Rotate File
- **Deployment**: DigitalOcean App Platform

---

## Configuration

SOFIA is designed to be highly configurable through environment variables and a central configuration file. Key configuration parameters include:

### NAICS Codes and Set-Asides

The `config.js` file allows customization of search parameters:

```javascript
// NAICS codes for targeted opportunity discovery
export const naicsCodes = [
  "541611", // Administrative Management and General Management Consulting
  "541330", // Engineering Services
  "541614", // Process, Physical Distribution, and Logistics Consulting
  // Additional codes can be added as needed
];

// Set-aside types to filter opportunities
export const setAsideValues = [
  "SBA", // Small Business Set-Aside
  "SDVOSBC", // Service-Disabled Veteran-Owned Small Business
  // Additional set-aside types can be added as needed
];

// Procurement types to include in search
export const pCodes = ["p", "a", "r", "s", "o", "k", "i"];
// p = Pre-solicitation, o = Solicitation, etc.
```

---

## Deployment

### Deployment as a Microservice

SOFIA is designed to run as a standalone microservice on cloud platforms supporting Node.js applications. The recommended deployment platform is DigitalOcean's App Platform.

#### Prerequisites:

- Node.js v16 or higher
- Access to SAM.gov API
- OpenAI API account
- Google Cloud Platform account with Google Sheets API enabled
- DigitalOcean account (or alternative deployment platform)

#### Environment Configuration:

Configure the following environment variables for deployment:

```
NODE_ENV=production
PORT=3000
SAM_API_KEY=<your-sam-api-key>
SAM_API_URL=https://api.sam.gov/opportunities/v2/search
OPENAI_API_KEY=<your-openai-api-key>
MESSAGE_FROM=<email-address>
GMAIL_HOST=smtp.gmail.com
GMAIL_USERNAME=<email-username>
GMAIL_PASSWORD=<app-password>
MAIL_PORT=465
MAIL_SECURE=true
MAIL_TLS=true
GOOGLE_SHEET_ID=<your-google-sheet-id>
GOOGLE_CLIENT_EMAIL=<your-service-account-email>
GOOGLE_PRIVATE_KEY=<your-private-key>
DO_SPACES_KEY=<your-spaces-key>
DO_SPACES_SECRET=<your-spaces-secret>
BUCKET_NAME=<your-bucket-name>
STORAGE_FILE_NAME=storage.json
EMAIL_RECIPS=<email-list-separated-by-colons>
```

---

## Local Development

To run SOFIA locally for development:

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/SAM-opportunity-finder-integration-agent.git
   cd SAM-opportunity-finder-integration-agent
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   - Create a `.env` file using the template above
   - Add your API keys and other configuration

4. **Start the service**

   ```bash
   npm run dev
   ```

5. **Access the API endpoints**
   - `http://localhost:3000/` - Service status
   - `http://localhost:3000/health` - Health check for all integrated services
   - `http://localhost:3000/runall` - Manually trigger all processing tasks

---

## API Endpoints

- **`/`** - Basic service status check
- **`/health`** - Comprehensive health check of all integrated services
- **`/runall`** - Manually trigger the opportunity discovery and processing workflow

---

## Scheduled Tasks

- **Daily Task (2:01 AM Eastern, Sun-Thu, Sat)**: Discover and summarize new opportunities
- **Weekly Task (2:01 AM Eastern, Fri)**: Discover, summarize, and email opportunities, update Google Sheets

---

## Logging

SOFIA maintains three types of log files:

- **Action Logs**: Records normal operations and activities
- **Error Logs**: Captures errors and exceptions
- **Traffic Logs**: Tracks API endpoint access

All logs utilize Winston's daily rotation to maintain a 14-day history.

---

## License

MIT

---

## Support

For issues, feature requests, or questions, please file an issue in the repository's issue tracker.
