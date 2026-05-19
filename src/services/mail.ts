import { Resend } from "resend";

export const resend = new Resend(process.env.resend_api_key);

export interface ISendEmail {
    email: string;
    subject: string;
    html: string;
    text?: string;
    replyTo?: string
}

export const sendEmail = async (EmailProps: ISendEmail) => {

    const { email, subject, html, text, replyTo } = EmailProps;

    const app_domain = process.env.app_domain;
    const from = `neeteshparihar <Support@${app_domain}>`

    const data = await resend.emails.send({
        from: from,
        to: email,
        subject,
        html,
        text: text,
        replyTo: replyTo
    });

    return data;
}

