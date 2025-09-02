import nodemailer from "nodemailer";
import { config } from "dotenv";
config();

const transporter = nodemailer.createTransport({
	service: "gmail",
	secure: false,
	auth: {
		user: process.env.APP_USER,
		pass: process.env.APP_PASSWORD,
	},
});

/**
 * mail service sends a  mail to given email with application template
 * @param to to email adderess
 * @param text message
 * @param subject subject
 * @returns true if email send send succesfully else false
 * NOTE : dont neeed an html in text the function uses an application html template
 */
export async function sendEmail(to: string, text: string, subject: string): Promise<boolean> {
	try {
		console.log("sending");
		const data_to_Sned = getTemplate(text);
		await transporter.sendMail({
			to,
			subject,
			html: data_to_Sned,
		});
		console.log("sendend");
		return true;
	} catch (e) {
		console.log(e);
		return false;
	}
}

const getTemplate = (message: string) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>DonTo Exchange</title>
</head>
<body style="margin:0; padding:0; background:#0d1117; font-family:Arial, sans-serif; color:#e6edf3;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" style="padding:30px;">
        <!-- Container -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#161b22; border-radius:12px; overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:#0d1117; padding:20px; text-align:center; border-bottom:1px solid #30363d;">
              <h1 style="margin:0; font-size:22px; color:#58a6ff;">DonTo Exchange</h1>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding:30px; font-size:15px; line-height:1.6; color:#e6edf3;">
             ${message}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#0d1117; padding:20px; text-align:center; font-size:12px; color:#8b949e; border-top:1px solid #30363d;">
              © 2025 DonTo Exchange. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
