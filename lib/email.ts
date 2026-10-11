import "server-only";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(
  email: string,
  resetUrl: string
) {
  const from =
    process.env.EMAIL_FROM ||
    "HocTap Digital <onboarding@resend.dev>";

  return resend.emails.send({
    from,
    to: email,
    subject: "Đặt lại mật khẩu - HocTap Digital",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Đặt lại mật khẩu</h2>

        <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản HocTap Digital.</p>

        <p>
          Nhấn vào nút bên dưới để đặt mật khẩu mới:
        </p>

        <p>
          <a
            href="${resetUrl}"
            style="
              display:inline-block;
              padding:12px 20px;
              background:#111827;
              color:white;
              text-decoration:none;
              border-radius:8px;
            "
          >
            Đặt lại mật khẩu
          </a>
        </p>

        <p>Liên kết này sẽ hết hạn sau 1 giờ.</p>

        <p>
          Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.
        </p>
      </div>
    `,
  });
}