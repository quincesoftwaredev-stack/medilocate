import { GMAIL, PASSWORD } from '@/config'
import { template } from '@/utility/mail'
import axios from 'axios'
import nodemailer from 'nodemailer'
const from = process.env.FROM

class Message {
    async sendMessage(data) {
        const { number, message, sendInDevelopment = false } = data;

        if (!number || !message) {
            return "Missing Number Or Message";
        }

        // Don't send SMS in development
        if (process.env.NODE_ENV !== "production" && !sendInDevelopment) {
            return {
                success: true,
                skipped: true,
                message: "SMS skipped in development mode.",
            };
        }

        if (!process.env.BULK_SMS_API_KEY || !process.env.BULK_SMS_SENDER_ID) {
            return { success: false, error: "SMS provider is not configured." };
        }

        try {
            const apiUrl = "https://bulksmsbd.net/api/smsapi";

            const payload = {
                api_key: process.env.BULK_SMS_API_KEY,
                senderid: process.env.BULK_SMS_SENDER_ID,
                number,
                message,
            };

            const { data: responseData } = await axios.post(apiUrl, payload, {
                headers: {
                    "Content-Type": "application/json",
                },
                timeout: 10000,
            });

            return responseData;
        } catch (error) {
            console.error("SMS delivery failed:", error.message);

            return {
                success: false,
                error: "SMS delivery failed.",
            };
        }
    }
}

export default Message
