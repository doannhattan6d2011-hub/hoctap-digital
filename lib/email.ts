export function emailLayout(content: string, title = "HocTap Digital") {
  return `
    <div style="font-family: sans-serif; padding: 20px; background-color: #f8fafc;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 24px; border-radius: 8px;">
        <h2 style="color: #2563eb; margin-top: 0;">${title}</h2>
        ${content}
      </div>
    </div>
  `;
}

export async function sendMail({ to, subject, html }: { to: string; subject: string; html: string }) {
  console.log(`[Email Mock] Gửi tới: ${to} | Tiêu đề: ${subject}`);
  return true;
}

export async function sendPasswordResetEmail(to: string, token: string) {
  return sendMail({
    to,
    subject: "Khôi phục mật khẩu - HocTap Digital",
    html: emailLayout(`<p>Mã xác thực khôi phục mật khẩu của bạn là: <b>${token}</b></p>`),
  });
}