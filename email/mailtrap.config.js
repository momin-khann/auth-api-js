import { MailtrapClient } from "mailtrap";

const TOKEN = process.env.MAILTRAP_TOKEN;

export const mailtrapClient = new MailtrapClient({ token: TOKEN });

export const sender = { name: "Momin Khan", email: "<noreply@momin-khan.com>" };
