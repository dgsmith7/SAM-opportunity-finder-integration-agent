# SAM-opportunity-finder-integration-agent

// SAM.gov Opportunity Finder Integration Agent - SOFIA
// This agent integrates with the SAM.gov Opportunity Finder API to fetch and display opportunities.

# SOFIA Microservice

Automated government opportunity finder for VLinc Corporation.

## Features

- Polls SAM.gov hourly
- Filters based on NAICS, set-asides, and types
- Summarizes with OpenAI
- Emails stakeholders
- Logs to Google Docs and MongoDB
- Exposes health check and manual trigger endpoints

## Deployment

1. Set environment variables in DigitalOcean App Platform
2. Point `start` script to `index.js`
3. Run as a web service

## Endpoints

- `/` – Simple health check
- `/health` – Health check with detailed status
- `/run-now` – Manually trigger the job
