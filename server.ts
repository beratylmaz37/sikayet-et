import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { Resend } from 'resend';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

const resendApiKey = process.env.RESEND_API_KEY || '';
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const fromEmail = process.env.NOTIFICATION_SENDER_EMAIL || 'Şikayetimiz Var <onboarding@resend.dev>';

// API Route for sending email notifications
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, type, complaintTitle, complaintId, actorName, commentText, statusText, adminNoteText } = req.body;

    if (!to || !to.includes('@')) {
      return res.status(400).json({ success: false, message: 'Geçersiz alıcı e-posta adresi.' });
    }

    let emailSubject = subject || 'Şikayetiniz Hakkında Yeni Bildirim';
    let headline = 'Şikayetinizde Yeni Bir Gelişme Var!';
    let messageBody = '';

    if (type === 'upvote') {
      emailSubject = `👍 "${complaintTitle}" başlıklı şikayetinize yeni bir destek oyu geldi!`;
      headline = 'Şikayetiniz Destek Gördü!';
      messageBody = `
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">
          Bir öğrenci veya okul üyesi <strong>"${complaintTitle}"</strong> konulu şikayetinizi destekledi (Oy verdi).
        </p>
        <p style="color: #64748b; font-size: 13px;">
          Talebiniz daha fazla destek aldıkça okul idaresinin öncelik sıralamasında üst sıralara taşınacaktır.
        </p>
      `;
    } else if (type === 'comment') {
      emailSubject = `💬 "${complaintTitle}" şikayetinize yeni bir yorum yapıldı!`;
      headline = 'Yeni Bir Yorum Eklendi';
      messageBody = `
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">
          <strong>${actorName || 'Bir kullanıcı'}</strong> şikayetinize şu yorumu yaptı:
        </p>
        <blockquote style="border-left: 4px solid #6366f1; padding: 12px 16px; margin: 16px 0; background: #f8fafc; border-radius: 6px; font-style: italic; color: #1e293b;">
          "${commentText || '...'}"
        </blockquote>
      `;
    } else if (type === 'status_update') {
      emailSubject = `📌 "${complaintTitle}" şikayetinizin durumu güncellendi: ${statusText}`;
      headline = 'Şikayet Durumu Güncellendi';
      messageBody = `
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">
          Okul idaresi <strong>"${complaintTitle}"</strong> başlıklı şikayetinizin durumunu <strong>"${statusText}"</strong> olarak güncelledi.
        </p>
        ${adminNoteText ? `
          <div style="margin-top: 16px; padding: 14px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px;">
            <p style="margin: 0 0 6px 0; font-weight: bold; color: #065f46; font-size: 14px;">🛡️ Okul İdaresi Açıklaması:</p>
            <p style="margin: 0; color: #047857; font-size: 13px; line-height: 1.5;">${adminNoteText}</p>
          </div>
        ` : ''}
      `;
    } else if (type === 'admin_note') {
      emailSubject = `🛡️ "${complaintTitle}" şikayetinize okul idaresinden resmi yanıt geldi!`;
      headline = 'Okul İdaresi Resmi Yanıtı';
      messageBody = `
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">
          Okul idaresi <strong>"${complaintTitle}"</strong> başlıklı bildiriminiz için resmi bir açıklama yayınladı:
        </p>
        <div style="margin-top: 16px; padding: 16px; background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px;">
          <p style="margin: 0; color: #065f46; font-size: 14px; line-height: 1.6;">${adminNoteText || '...'}</p>
        </div>
      `;
    } else {
      messageBody = `<p style="color: #334155; font-size: 15px;">${commentText || 'Şikayetinizle ilgili bir güncelleme yapıldı.'}</p>`;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${emailSubject}</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; padding: 24px; margin: 0;">
        <div style="max-w-xl; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0;">
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%); padding: 28px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">Şikayetimiz Var</h1>
            <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">Okul Geri Bildirim ve Çözüm Portalı</p>
          </div>
          
          <div style="padding: 32px 28px;">
            <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 18px; font-weight: 700;">${headline}</h2>
            ${messageBody}
            
            <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="margin: 0 0 12px 0; font-size: 12px; color: #64748b;">
                Şikayet Detayını ve diğer yorumları görüntülemek için platformu ziyaret edebilirsiniz.
              </p>
            </div>
          </div>
          
          <div style="background: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
            Bu e-posta "Şikayetimiz Var" platformunda bildirim tercihi yaptığınız için gönderilmiştir. &copy; ${new Date().getFullYear()}
          </div>
        </div>
      </body>
      </html>
    `;

    if (resend) {
      const response = await resend.emails.send({
        from: fromEmail,
        to: [to],
        subject: emailSubject,
        html: htmlContent,
      });

      console.log(`[Resend Email Sent] ID: ${response.data?.id} to ${to}`);
      return res.json({ success: true, deliveredVia: 'resend', id: response.data?.id });
    } else {
      // Fallback: Simulation / Local Log
      console.log(`[Notification Mail Prepared] To: ${to} | Subject: ${emailSubject}`);
      return res.json({ 
        success: true, 
        deliveredVia: 'simulated_local',
        message: 'E-posta bildirimi hazırlandı ve gönderim kuyruğuna alındı (Resend API anahtarı eklenirse doğrudan SMTP/Resend ile iletilir).' 
      });
    }
  } catch (error) {
    console.error('Send Email Error:', error);
    return res.status(500).json({ success: false, error: (error as Error).message });
  }
});

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
