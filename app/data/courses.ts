export interface Video {
  id: string;
  title: string;
  telegramId: string;
  chatId?: string;     // Hata vermemesi için opsiyonel ekledik
  messageId?: string;  // Hata vermemesi için opsiyonel ekledik
}

export interface Lesson {
  id: string;
  name: string;
  videos: Video[];
}

export interface Committee {
  id: string;
  title: string;
  subtitle: string;
  bgImage?: string | null;
  lessons: Lesson[];
}