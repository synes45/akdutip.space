import { NextRequest, NextResponse } from "next/server";
import { TelegramClient } from "telegram";
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

// Telegram MTProto için zorunlu hizalama bloğu (128 KB)
const TELEGRAM_BLOCK_SIZE = 128 * 1024;

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

    const media = message.media as any;
    const fileSize = media.document?.size || 0;
    const range = request.headers.get("range");

    // Range başlığı yoksa tüm dosyayı gönder
    if (!range || !fileSize) {
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of client.iterDownload({
              file: message.media,
              requestSize: TELEGRAM_BLOCK_SIZE,
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
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      });
    }

    // Range parsing
    const parts = range.replace(/bytes=/, "").split("-");
    const rawStart = parseInt(parts[0], 10);
    const rawEnd = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    // Telegram gereksinimi: Offset 128 KB'ın katı olmak zordadır
    const alignedStart = Math.floor(rawStart / TELEGRAM_BLOCK_SIZE) * TELEGRAM_BLOCK_SIZE;
    const skipBytes = rawStart - alignedStart; // İstenecek gerçek veri için kırpılacak miktar
    const limitSize = (rawEnd - alignedStart) + 1;

    let bytesStreamed = 0;

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of client.iterDownload({
            file: message.media,
            offset: bigInt(alignedStart) as any,
            limit: limitSize,
            requestSize: TELEGRAM_BLOCK_SIZE,
          })) {
            let buffer = chunk;

            // Eğer offset hizalamasından dolayı ilk blokta fazla veri geldiyse kırp
            if (bytesStreamed === 0 && skipBytes > 0) {
              buffer = buffer.subarray(skipBytes);
            }

            controller.enqueue(buffer);
            bytesStreamed += buffer.length;
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    const contentLength = rawEnd - rawStart + 1;

    return new NextResponse(stream, {
      status: 206,
      headers: {
        "Content-Range": `bytes ${rawStart}-${rawEnd}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength.toString(),
        "Content-Type": "video/mp4",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Stream hatası:", error);
    return NextResponse.json({ error: "Yayın oluşturulamadı" }, { status: 500 });
  }
}