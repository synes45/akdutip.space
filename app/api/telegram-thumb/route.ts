import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const channel = searchParams.get("channel");
  let id = searchParams.get("id");

  if (!channel || !id) {
    return NextResponse.json({ error: "Eksik parametre" }, { status: 400 });
  }

  // 1547/1548 gibi bir değer geldiyse en sondaki esas mesaj ID'sini alıyoruz
  if (id.includes("/")) {
    const parts = id.split("/").filter(Boolean);
    id = parts[parts.length - 1];
  }

  try {
    const embedUrl = `https://t.me/${channel}/${id}?embed=1`;

    const res = await fetch(embedUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      next: { revalidate: 86400 }, // 24 saat önbellekleme yap
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Telegram'a ulaşılamadı" }, { status: 502 });
    }

    const html = await res.text();

    // Video thumbnail veya blurred photo kapak görsellerini yakalayan esnek Regex
    const match =
      html.match(/background-image:\s*url\(['"]?([^'"]+)['"]?\)/i) ||
      html.match(/tgme_widget_message_video_thumb"[^>]*style="background-image:url\('([^']+)'\)"/i);

    if (match && match[1]) {
      return NextResponse.redirect(match[1]);
    }

    return NextResponse.json({ error: "Kapak görseli bulunamadı" }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: "Görsel çekilemedi" }, { status: 500 });
  }
}