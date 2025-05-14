# SAM Opportunity Finder Integration Agent (SOFIA)

**Author:** David G. Smith, DGS Creative LLC  
**Date:** May 14, 2025  
**Created for:** VLinc Corporation

---

## Description

**SAM Opportunity Finder Integration Agent (SOFIA)** is a microservice designed to automate the discovery, summarization, and distribution of government contracting opportunities from SAM.gov. This tool is tailored for VLinc Corporation to streamline the process of identifying relevant opportunities, summarizing them using OpenAI, and notifying stakeholders via email and Google Sheets.

SOFIA integrates seamlessly with SAM.gov, OpenAI, and Google APIs to provide a robust and efficient solution for managing government opportunities.

---

## Tech Stack

- **Backend Framework:** Node.js with Express
- **Task Scheduling:** Node-Cron
- **APIs Used:**
  - SAM.gov API
  - OpenAI API
  - Google Sheets API
- **Database:** Local file system (for logging and storage)
- **Email Service:** Nodemailer
- **Logging:** Winston with Daily Rotate File
- **Deployment Platform:** DigitalOcean App Platform

---

## Design

SOFIA is designed as a modular microservice with the following key components:

1. **SAM.gov Integration**:

   - Fetches opportunities based on NAICS codes, set-asides, and procurement types.
   - See https://nodemailer.com/usage/using-gmail/
   - Filters and stores opportunities in a local JSON file or MongoDB.
   - See https://open.gsa.gov/api/get-opportunities-public-api/

2. **Summarization**:

   - Uses OpenAI's GPT-4 model to generate concise summaries of opportunities.
   - See https://platform.openai.com/docs/api-reference/introduction

3. **Notification System**:

   - Sends email roll-ups of new opportunities to stakeholders.
   - Updates Google Sheets with emailed records.
   - See https://developers.google.com/workspace/docs/api/how-tos/overview

4. **Task Scheduling**:

   - Daily tasks: Fetch opportunities and generate summaries.
   - Weekly tasks: Send email roll-ups, update Google Sheets, and clean old records.
   - Garbage collection: Removes records older than 30 days.

5. **Health Monitoring**:
   - Exposes endpoints for health checks and manual task triggering.

---

## Features

- **Automated Opportunity Fetching**:

  - Polls SAM.gov daily to fetch new opportunities.
  - Filters opportunities based on NAICS codes, set-asides, and procurement types.

- **AI-Powered Summarization**:

  - Summarizes opportunities using OpenAI's GPT-4 model.

- **Email Notifications**:

  - Sends daily or weekly email roll-ups to stakeholders.

- **Google Sheets Integration**:

  - Logs emailed opportunities to a shared Google Sheet.

- **Health Monitoring**:

  - Provides endpoints for health checks and manual task execution.

- **Logging**:
  - Logs actions, errors, and traffic for debugging and monitoring.

---

## Configuration

### Customizing the config.js file for your organization

The config.js file also includes constants such as NAICS codes, set-aside values, procurement codes, and email recipients, allowing you to change the paramaters for the API calls as your organization changes and grows. These are pre-defined in the file and can be modified as needed:

```javascript
// config.js
export const naicsCodes = ["541330", "541611", "541614", "611430", "611519"];
export const setAsideValues = ["SBA", "SDVOSBC", "ISBEE"];
export const pCodes = ["p", "a", "r", "s", "o", "k", "i"];
export const emailRecipeients = [
  "recipient1@email.com",
  "recipient2@email.com",
];
```

---

## Deployment

### Deploying as a Microservice

SOFIA is designed to run as a microservice on DigitalOcean's App Platform. To restrict endpoint access, configure network-level restrictions to allow only specific IP addresses.

#### Prerequisites:

- DigitalOcean account
- Environment variables configured (see below)

#### Steps for Deployment:

1. **Set Environment Variables**:

   - Configure the following environment variables in DigitalOcean:
     ```bash
     # .env
     NODE_ENV=production
     PORT=3000
     SAM_API_KEY=<your-sam-api-key>
     SAM_API_URL=https://api.sam.gov/opportunities/v2/search
     OPENAI_API_KEY=<your-openai-api-key>
     MESSAGE_FROM=<your-gmail-address>
     GMAIL_HOST='smtp.gmail.com'
     GMAIL_USERNAME=<your-gmail-address>
     GMAIL_PASSWORD=<your-gmail-app-password>
     GMAIL_HOST='smtp.gmail.com'
     MAIL_PORT='465'
     MAIL_SECURE='true'
     MAIL_TLS='true'
     GOOGLE_SHEET_ID=<your-google-sheet-id>
     GOOGLE_CLIENT_EMAIL=<your-google-cloud-service-client-email>
     GOOGLE_PRIVATE_KEY=<your-google-private-key>
     ```

2. **Point the `start` Script**:

   - Ensure the `start` script in `package.json` points to `index.js`.

3. **Deploy as a Web Service**:

   - Use DigitalOcean's App Platform to deploy the service as a web application.

4. **Restrict Access**:
   - Configure DigitalOcean's firewall to allow access only from specific IP addresses.

---

### Running Locally

To run SOFIA locally, follow these steps:

#### Prerequisites:

- **Node.js** (v16 or higher)
- **npm** (Node Package Manager)
- **Google Cloud Service Account** (for Google Sheets API)
- **SAM.gov API Key**
- **OpenAI API Key**
- **Google Mail APP**

#### Steps:

1. **Clone the Repository**:

   - Clone the repository to your local machine:
     ```javascript
     git clone https://github.com/your-username/SAM-opportunity-finder-integration-agent.git
     cd SAM-opportunity-finder-integration-agent
     ```

2. **Install Dependencies**:

   - Install the required Node.js packages using npm:
     ```javascript
     npm install
     ```

3. **Set Up Environment Variables**:

   - Create a `.env` file in the root directory of the project and add the following environment variables:
     ```javascript
     # .env
     NODE_ENV=production
     PORT=3000
     SAM_API_KEY=<your-sam-api-key>
     SAM_API_URL=https://api.sam.gov/opportunities/v2/search
     OPENAI_API_KEY=<your-openai-api-key>
     MESSAGE_FROM=<your-gmail-address>
     GMAIL_HOST='smtp.gmail.com'
     GMAIL_USERNAME=<your-gmail-address>
     GMAIL_PASSWORD=<your-gmail-app-password>
     GMAIL_HOST='smtp.gmail.com'
     MAIL_PORT='465'
     MAIL_SECURE='true'
     MAIL_TLS='true'
     GOOGLE_SHEET_ID=<your-google-sheet-id>
     GOOGLE_CLIENT_EMAIL=<your-google-cloud-service-client-email>
     GOOGLE_PRIVATE_KEY=<your-google-private-key>
     ```
   - Be sure to replace the placeholders with your actual API keys, email credentials, and Google Sheet ID, etc.
   - **Note**: For Gmail, you may need to set up an App Password if you have 2-Step Verification enabled. See [Gmail App Passwords](https://support.google.com/accounts/answer/185201) for more information.
   - For Google Sheets, you need to create a service account and download the JSON key file. Follow the instructions in the [Google Sheets API documentation](https://developers.google.com/sheets/api/quickstart/nodejs) to set this up.
   - For the Google API, you will need to share the Google Sheet with the service account email address.
   - For the OpenAI API, you will need to create an account and generate an API key. Follow the instructions in the [OpenAI API documentation](https://platform.openai.com/docs/api-reference/introduction) to set this up.
   - For the SAM.gov API, you will need to create an account and generate an API key. Follow the instructions in the [SAM.gov API documentation](https://open.gsa.gov/api/get-opportunities-public-api/) to set this up.

4. **Run the Application**:

   - Start the application using the following command:
     ```javascript
     npm start
     ```

5. **Access the Application**:

   - Open your browser or use a tool like Postman to access the following endpoints:
     - `/` – Basic status check to confirm the service is running.
     - `/health` – Detailed health check for all integrated services.
     - `/runall` – Manually trigger the weekly tasks.

6. **Verify Logs**:
   - Check the `logs` directory for action, error, and traffic logs to ensure the application is running as expected.

---
