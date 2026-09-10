import type { Chapter, Lesson, RichChapter } from './types';

export const EMPTY_RICH_CHAPTERS: RichChapter[] = [];

export function mapRichToFormChapters(rich: RichChapter[]): Chapter[] {
  return rich.map((ch) => ({
    id: ch.id,
    title: ch.title,
    isExpanded: ch.isExpanded,
    lessons: ch.lessons.map((les): Lesson => {
      const video = les.attachments.find((a) => a.type === 'video');
      const quiz = les.attachments.find((a) => a.type === 'quiz')?.quiz ?? null;
      return {
        id: les.id,
        title: les.title,
        subtitle: les.subtitle,
        isCompleted: les.isCompleted,
        videoUrl: video?.url,
        videoName: video?.title,
        documents: les.attachments
          .filter((a) => a.type === 'pdf' && a.url)
          .map((a) => ({ id: a.id, name: a.title, url: a.url as string })),
        quiz,
      };
    }),
  }));
}