import dotenv from "dotenv";
dotenv.config();

export const config = {
  SAM_API_KEY: process.env.SAM_API_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  MONGO_URI: process.env.MONGO_URI,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  GOOGLE_DOC_ID: process.env.GOOGLE_DOC_ID,
  NOTIFY_EMAILS: process.env.NOTIFY_EMAILS?.split(","),
};

//export const naicsCodes = ["541330", "541611", "541614", "611430", "611519"];
export const naicsCodes = ["541330"];
// 551330 - Engineering Services
// 541611 - Administrative Management and General Management Consulting Services
// 541614 - Process, Physical Distribution, and Logistics Consulting Services
// 611430 - Professional and Management Development Training
// 611519 - Other Technical and Trade Schools

export const setAsideValues = [
  "SBA",
  "SDVOSBC",
  "SDVOSBS",
  "IEE",
  "ISBEE",
  "BICiv",
  "VSA",
  "VSS",
];
// SBA                       Total Small Business Set-Aside (FAR 19.5)
// SDVOSBC        Service-Disabled Veteran-Owned Small Business (SDVOSB) Set-Aside (FAR 19.14)
// SDVOSBS         Service-Disabled Veteran-Owned Small Business (SDVOSB) Sole Source (FAR 19.14)
// IEE                         Indian Economic Enterprise (IEE) Set-Aside (specific to Department of Interior)
// ISBEE  Indian Small Business Economic Enterprise (ISBEE) Set-Aside (specific to Department of Interior)
// BICiv    Buy Indian Set-Aside (specific to Department of Health and Human Services, Indian Health Services)
// VSA       Veteran-Owned Small Business Set-Aside (specific to Department of Veterans Affairs)
// VSS       Veteran-Owned Small Business Sole source (specific to Department of Veterans Affairs)

export const pCodes = ["p", "a", "r", "s", "o", "k", "i"];
// p = Pre solicitation
// a = Award Notice
// r = Sources Sought
// s = Special Notice
// o = Solicitation
// k = Combined Synopsis/Solicitation
// i = Intent to Bundle Requirements (DoD-Funded)

export const samApiUrl = "https://api.sam.gov/opportunities/v2/search";

export const openAIApiUrl = "https://api.openai.com/v1/chat/completions";

export const googleDocAPIUrl = "https://sheets.googleapis.com/v4/spreadsheets";
