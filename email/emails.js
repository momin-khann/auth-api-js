import { mailtrapClient, sender } from "./mailtrap.config.js";
import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
} from "./emailTemplates.js";
import { ApiError } from "../utils/ApiError.js";

export const sendVerificationEmail = async (email, verificationToken) => {
  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: [{ email }],
      subject: "Verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken,
      ),
      category: "Email Verification",
    });

    if (!response) return null;

    console.log("Email sent successfully", response);
    return response.success;
  } catch (error) {
    console.error(`Error sending verification`, error.message);
    throw new ApiError(400, `error: ${error.message}`);
  }
};

export const sendWelcomeEmail = async (email, name) => {
  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: [{ email }],
      template_uuid: "9d023a64-d782-45de-830b-1af2f096ea17",
      template_variables: {
        company_info_name: "Momin Enterprises",
        name: name,
      },
    });

    if (!response) return null;

    console.log("Welcome email sent successfully", response);
    return response.success;
  } catch (error) {
    console.error(`Error sending welcome email`, error.message);
    throw new ApiError(400, `error: ${error.message}`);
  }
};

export const sendPasswordResetEmail = async (email, resetURL) => {
  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: [{ email }],
      subject: "Reset your password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
      category: "Password Reset",
    });

    if (!response) return null;

    console.log("Email sent successfully", response);
    return response.success;
  } catch (error) {
    console.error(`Error sending password reset email`, error.message);
    throw new ApiError(400, `error: ${error.message}`);
  }
};

export const sendResetSuccessEmail = async (email) => {
  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: [{ email }],
      subject: "Password Reset Successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      category: "Password Reset",
    });

    if (!response) return null;

    console.log("email sent successfully", response);
    return response.success;
  } catch (error) {
    console.error(`Error sending password reset success email`, error.message);
    throw new ApiError(400, `error: ${error.message}`);
  }
};
