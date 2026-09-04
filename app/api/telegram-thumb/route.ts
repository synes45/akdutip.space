import { NextRequest, NextResponse } from "next/server";

// Sunucu tarafında bellek önbelleği (scraping sayısını sıfıra indirmek için)
const thumbMemoryCache = new Map<string, string>();

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

  const cacheKey = `${channel}:${id}`;

  // Eğer bellekte varsa doğrudan yönlendir
  if (thumbMemoryCache.has(cacheKey)) {
    const targetUrl = thumbMemoryCache.get(cacheKey)!;
    return NextResponse.redirect(targetUrl, {
      status: 302,
      headers: {
        "Cache-Control": "public, max-age=604800, s-maxage=604800, immutable",
      },
    });
  }

  try {
    const embedUrl = `https://t.me/${channel}/${id}?embed=1`;

    const res = await fetch(embedUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      next: { revalidate: 604800 }, // 7 gün önbellek
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
      thumbMemoryCache.set(cacheKey, match[1]);
      return NextResponse.redirect(match[1], {
        status: 302,
        headers: {
          "Cache-Control": "public, max-age=604800, s-maxage=604800, immutable",
        },
      });
    }

    return NextResponse.json({ error: "Kapak görseli bulunamadı" }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: "Görsel çekilemedi" }, { status: 500 });
  }
}