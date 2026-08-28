import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "E-posta servisi yapılandırılmamış (API Key eksik)." },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "E-posta adresi gerekli." }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Akdeniz E-Posta Kontrolü
    const isAkdenizEmail =
      cleanEmail.endsWith("@ogr.akdeniz.edu.tr") || cleanEmail.endsWith("@akdeniz.edu.tr");

    if (!isAkdenizEmail) {
      return NextResponse.json(
        { error: "Bu platform yalnızca Akdeniz Üniversitesi e-posta adresi (@ogr.akdeniz.edu.tr) ile kullanılabilir." },
        { status: 403 }
      );
    }

    // 🔴 2. Zaten Kayıtlı Mı Kontrolü (Aynı Maille Tekrar Kaydı Engelleme)
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Bu e-posta adresiyle zaten bir hesap oluşturulmuş. Lütfen Giriş Yapın." },
        { status: 400 }
      );
    }

    // 3. 6 Haneli Kod Üretme
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 dakika geçerli

    // 4. Veritabanına Kaydetme
    await prisma.verificationCode.deleteMany({
      where: { email: cleanEmail },
    });

    await prisma.verificationCode.create({
      data: {
        email: cleanEmail,
        code,
        expiresAt,
      },
    });

    // TEST İÇİN KONSOLA YAZDIR
    console.log(`\n========================================`);
    console.log(`🔑 [TEST OTP KODU]: ${cleanEmail} -> ${code}`);
    console.log(`========================================\n`);

    // 5. Resend İle Mail Gönderme
    const { error } = await resend.emails.send({
      from: "Akdeniz Tıp Portal <onboarding@resend.dev>",
      to: [cleanEmail],
      subject: `${code} - Akdeniz Tıp Portal Kayıt Kodunuz`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 20px; background-color: #0a0a0a; color: #ffffff; border-radius: 12px; border: 1px solid #262626;">
          <h2 style="color: #facc15; margin-bottom: 8px;">Akdeniz Tıp Portal</h2>
          <p style="color: #a3a3a3; font-size: 14px;">Kayıt işleminizi tamamlamak için aşağıdaki 6 haneli doğrulama kodunu kullanabilirsiniz.</p>
          <div style="background-color: #171717; border: 1px solid #404040; border-radius: 8px; padding: 16px; text-align: center; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #ffffff;">${code}</span>
          </div>
        </div>
      `,
    });

    if (error) {
      console.warn("Resend Uyarısı (Domain doğrulanmadığı için mail gitmedi, terminaldeki kodu kullanabilirsiniz):", error.message);
    }

    return NextResponse.json({ success: true, message: "Doğrulama kodu e-postanıza gönderildi." });
  } catch (error) {
    console.error("Kod gönderme hatası:", error);
    return NextResponse.json({ error: "Kod gönderilirken bir hata oluştu." }, { status: 500 });
  }
}