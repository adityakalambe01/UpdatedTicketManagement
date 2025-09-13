"use node";
import { action } from "../_generated/server";
import { v } from "convex/values";
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendTicketEmailAction = action({
  args: {
    to: v.string(),
    subject: v.string(),
    htmlContent: v.string(),
  },
  handler: async (ctx, { to, subject, htmlContent }) => {
    console.log('Attempting to send email...');
    console.log('To:', to);
    console.log('Subject:', subject);
    // For security, do not log htmlContent in full in production, but good for debugging
    console.log('HTML Content (partial):', htmlContent.substring(0, 100) + '...');
    console.log('Email User configured:', !!process.env.EMAIL_USER);

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        html: htmlContent,
      });
      console.log('Email sent successfully');
      return { success: true };
    } catch (error) {
      console.error('Error sending email:', error);
      // Log more details about the error object
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      } else if (typeof error === 'object' && error !== null && 'response' in error) {
        console.error('Nodemailer response error:', (error as any).response);
        console.error('Nodemailer response code:', (error as any).responseCode);
      }
      return { success: false, error: (error as Error).message };
    }
  },
});
