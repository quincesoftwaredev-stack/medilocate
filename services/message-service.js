import { GMAIL, PASSWORD } from '@/config'
import { template } from '@/utility/mail'
import axios from 'axios'
import nodemailer from 'nodemailer'
const from = process.env.FROM

class Message {
    async sendMessage(data) {
        const { number, message } = data;

        if (!number || !message) {
            return "Missing Number Or Message";
        }

        // Don't send SMS in development/test
        if (process.env.NODE_ENV !== "production") {
            console.log("SMS skipped in development:", {
                number,
                message,
            });

            return {
                success: true,
                skipped: true,
                message: "SMS skipped in development mode.",
            };
        }

        try {
            const apiUrl = "http://bulksmsbd.net/api/smsapi";

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

            console.log("SMS response:", responseData);

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
