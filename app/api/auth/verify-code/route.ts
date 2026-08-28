import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { email, password, code, name } = await req.json();

    if (!email || !password || !code) {
      return NextResponse.json(
        { error: "E-posta, şifre ve doğrulama kodu zorunludur." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Kod doğrulama
    const validCode = await prisma.verificationCode.findFirst({
      where: {
        email: cleanEmail,
        code: code.trim(),
        expiresAt: { gt: new Date() },
      },
    });

    if (!validCode) {
      return NextResponse.json(
        { error: "Geçersiz veya süresi dolmuş doğrulama kodu." },
        { status: 400 }
      );
    }

    // 2. Kullanıcı varlık kontrolü
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Bu e-posta adresiyle zaten kayıt olunmuş. Lütfen giriş yapın." },
        { status: 400 }
      );
    }

    // 3. Şifreleme ve kullanıcıyı veritabanına ekleme
    const hashedPassword = await bcrypt.hash(password, 10);
    const defaultName = name || cleanEmail.split("@")[0];

    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        password: hashedPassword,
        name: defaultName,
        role: "STUDENT",
      },
    });

    // 4. Doğrulama kodunu temizle
    await prisma.verificationCode.deleteMany({
      where: { email: cleanEmail },
    });

    // 5. Oturum aç
    const cookieStore = await cookies();
    cookieStore.set("user_session", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: "Kayıt başarılı!",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Kayıt hatası:", error);
    return NextResponse.json(
      { error: "Kayıt sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}