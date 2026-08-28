export interface Video {
  id: string;
  title: string;
  telegramId: string;
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