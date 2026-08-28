import { NextRequest, NextResponse } from "next/server";
import { TelegramClient, Api } from "telegram";
import { StringSession } from "telegram/sessions";
import bigInt from "big-integer";

const apiId = Number(process.env.TELEGRAM_API_ID);
const apiHash = process.env.TELEGRAM_API_HASH!;
const stringSession = new StringSession(process.env.TELEGRAM_SESSION || "");

let clientInstance: TelegramClient | null = null;

async function getTelegramClient() {
  if (!clientInstance) {
    clientInstance = new TelegramClient(stringSession, apiId, apiHash, {
      connectionRetries: 5,
    });
    await clientInstance.connect();
  }
  return clientInstance;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get("chatId");
  const messageId = Number(searchParams.get("messageId"));

  if (!chatId || !messageId) {
    return NextResponse.json({ error: "Eksik parametre" }, { status: 400 });
  }

  try {
    const client = await getTelegramClient();
    const messages = await client.getMessages(chatId, { ids: [messageId] });
    const message = messages[0];

    if (!message || !message.media) {
      return NextResponse.json({ error: "Video bulunamadı" }, { status: 404 });
    }

    const range = request.headers.get("range");
    const media = message.media as any;
    const fileSize = media.document?.size || 0;
    const chunkSize = 512 * 1024; // 512 KB parçalar

    // Range başlığı yoksa tüm dosyayı gönder
    if (!range || !fileSize) {
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of client.iterDownload({
              file: message.media,
              requestSize: chunkSize,
            })) {
              controller.enqueue(chunk);
            }
            controller.close();
          } catch (err) {
            controller.error(err);
          }
        },
      });

      return new NextResponse(stream, {
        headers: {
          "Content-Type": "video/mp4",
          "Accept-Ranges": "bytes",
          "Content-Length": fileSize.toString(),
        },
      });
    }

    // Range başlığı varsa istenen parçayı Telegram'dan çek (Seeking Desteği)
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of client.iterDownload({
            file: message.media,
            offset: bigInt(start) as any, // GramJS BigInteger tip dönüşümü
            limit: chunksize,
            requestSize: chunkSize,
          })) {
            controller.enqueue(chunk);
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new NextResponse(stream, {
      status: 206,
      headers: {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize.toString(),
        "Content-Type": "video/mp4",
      },
    });
  } catch (error) {
    console.error("Stream hatası:", error);
    return NextResponse.json({ error: "Yayın oluşturulamadı" }, { status: 500 });
  }
}