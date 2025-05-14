import nodemailer from "nodemailer";
import { readFileStorage, saveToFileStorage } from "./storage.js";
import { emailRecipeients } from "../config.js";
import { logAction, logError } from "../utils/logger.js";

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  host: process.env.GMAIL_HOST,
  port: parseInt(process.env.MAIL_PORT, 10),
  secure: process.env.MAIL_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.GMAIL_USERNAME,
    pass: process.env.GMAIL_PASSWORD,
  },
});

// Function to send email roll-up of new notifications
export async function sendEmailRollup() {
  try {
    // Read data from storage.json
    const storageData = await readFileStorage();

    // Filter records with a status of "summarized"
    const summarizedRecords = storageData.filter(
      (record) => record.noticeStatus === "summarized"
    );

    // If no new opportunities, send an email stating that
    if (summarizedRecords.length === 0) {
      logAction("No new summarized records to include in the email roll-up.");

      // Send the "no new opportunities" email
      const mailOptions = {
        from: process.env.MESSAGE_FROM, // Sender address
        to: process.env.MESSAGE_TO, // Recipient address
        subject: "No New Opportunities", // Subject line
        html: `
          <h1>No New Opportunities</h1>
          <p>There are no new opportunities since the last update.</p>
        `,
      };

      await transporter.sendMail(mailOptions);
      logAction("No new opportunities email sent successfully.");
      return;
    }

    // Generate HTML content for the email roll-up
    let emailHtml = "<h1>New Opportunities Roll-Up</h1>";
    for (const record of summarizedRecords) {
      // Extract the one-liner and summary paragraph from the summary text
      let cleanedOneLiner = "No one-liner available.";
      let summaryParagraph = "No summary available.";

      if (record.summaryText) {
        // Match the one-liner section
        const oneLinerMatch = record.summaryText.match(
          /\*\*One-line Description:\*\*\s*(.+)/
        );
        if (oneLinerMatch) {
          cleanedOneLiner = oneLinerMatch[1].trim(); // Extract and clean the one-liner
        }

        // Match the summary paragraph section
        const summaryParagraphMatch = record.summaryText.match(
          /\*\*Summary:\*\*\s*([\s\S]+)/
        );
        if (summaryParagraphMatch) {
          summaryParagraph = summaryParagraphMatch[1].trim(); // Extract and clean the summary paragraph
        }
      }
      // Determine the due date or fallback to "Not specified"
      const dueDate = record.dueDate || "Not specified";

      // Add the record to the email HTML
      emailHtml += `
        <div>
          <p><strong>One-Liner:</strong> ${cleanedOneLiner.trim()}</p>
          <p><strong>Notice ID:</strong> ${record.noticeId}</p>
          <p><strong>Date Posted:</strong> ${record.datePosted}</p>
          <p><strong>Due Date:</strong> ${dueDate}</p>
          <p><strong>Organization:</strong> ${record.federalOrg}</p>
          <p><strong>Set-Aside Type(s):</strong> ${record.setAside}</p>
          <p><strong>NAICS Code(s):</strong> ${
            record.naicsCodes?.join(", ") || "Not specified"
          }</p>
          <p><strong>Summary:</strong> ${summaryParagraph.trim()}</p>
          <p><strong>Link:</strong> <a href="${
            record.samUrl
          }" target="_blank">${record.samUrl}</a></p>
        </div>
        <hr>
      `;

      // Update the noticeStatus to "emailed"
      record.noticeStatus = "emailed";

      // Save the updated record back to storage.json
      await saveToFileStorage(
        record.noticeId,
        record.dateFetched,
        record.title,
        record.federalOrg,
        record.datePosted,
        record.dueDate,
        record.setAside,
        record.naicsCodes,
        record.locationCity,
        record.locationState,
        record.descriptionUrl,
        record.samUrl,
        record.summaryText,
        record.noticeStatus
      );
    }

    // Send the email roll-up to each recipient
    for (const recipient of emailRecipeients) {
      const mailOptions = {
        from: process.env.MESSAGE_FROM, // Sender address
        to: recipient, // Recipient address
        subject: "New Opportunities Roll-Up", // Subject line
        html: emailHtml, // HTML body
      };

      await transporter.sendMail(mailOptions);
      logAction(`Email roll-up sent successfully to ${recipient}.`);
    }
  } catch (error) {
    logError(`Error sending email roll-up: ${error.message}`);
  }
}
