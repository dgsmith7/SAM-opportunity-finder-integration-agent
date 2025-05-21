import dotenv from "dotenv";
dotenv.config(); // Load environment variables from a .env file

// Configuration object for environment variables
export const config = {
  SAM_API_KEY: process.env.SAM_API_KEY, // API key for SAM.gov
  OPENAI_API_KEY: process.env.OPENAI_API_KEY, // API key for OpenAI
  MONGO_URI: process.env.MONGO_URI, // MongoDB connection string
  EMAIL_USER: process.env.EMAIL_USER, // Email username for sending notifications
  EMAIL_PASS: process.env.EMAIL_PASS, // Email password for sending notifications
  GOOGLE_DOC_ID: process.env.GOOGLE_DOC_ID, // Google Doc ID for integration
  NOTIFY_EMAILS: process.env.NOTIFY_EMAILS?.split(","), // List of notification email recipients
};

// List of NAICS codes to filter opportunities
export const naicsCodes = [
  "336611",
  "488190",
  "488999",
  "541310",
  "541330",
  "541350",
  "541360",
  "541370",
  "541380",
  "541611",
  "541614",
  "541690",
  "541990",
  "611430",
  "611512",
  "611519",
];
// 336611 - Ship Building and Repairing
// 541330 - Engineering Services
// 541611 - Administrative Management and General Management Consulting Services
// 541614 - Process, Physical Distribution, and Logistics Consulting Services
// 611430 - Professional and Management Development Training
// 611519 - Other Technical and Trade Schools

// List of set-aside values for filtering opportunities
export const setAsideValues = [
  "SBA", // Total Small Business Set-Aside (FAR 19.5)
  "SDVOSBC", // Service-Disabled Veteran-Owned Small Business Set-Aside (FAR 19.14)
  "SDVOSBS", // Service-Disabled Veteran-Owned Small Business Sole Source (FAR 19.14)
  "IEE", // Indian Economic Enterprise Set-Aside (specific to Department of Interior)
  "ISBEE", // Indian Small Business Economic Enterprise Set-Aside (specific to Department of Interior)
  "BICiv", // Buy Indian Set-Aside (specific to Department of Health and Human Services, Indian Health Services)
  "VSA", // Veteran-Owned Small Business Set-Aside (specific to Department of Veterans Affairs)
  "VSS", // Veteran-Owned Small Business Sole Source (specific to Department of Veterans Affairs)
];

// List of procurement codes for filtering opportunities
export const pCodes = ["p", "a", "r", "s", "o", "k", "i"];
// p = Pre-solicitation
// a = Award Notice
// r = Sources Sought
// s = Special Notice
// o = Solicitation
// k = Combined Synopsis/Solicitation
// i = Intent to Bundle Requirements (DoD-Funded)

// Base URL for SAM.gov API
export const samApiUrl = "https://api.sam.gov/opportunities/v2/search";

// Base URL for OpenAI API
export const openAIApiUrl = "https://api.openai.com/v1/chat/completions";

// Base URL for Google Sheets API
export const googleDocAPIUrl = "https://sheets.googleapis.com/v4/spreadsheets";

// List of email recipients for notifications
export const emailRecipients = ["marc.aparicio@vlinc.com"];
