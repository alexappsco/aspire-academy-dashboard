import type { useTranslations } from 'next-intl';
import type { CourseCurriculum, LessonTest } from 'src/types/course';
import type {
  AttachmentItem,
  Chapter,
  LessonQuiz,
  LessonQuizOption,
  LessonQuizQuestion,
  RichChapter,
} from './types';

/** Translator already scoped to the `CreateCourse.chapters` namespace. */
export type ChaptersTranslator = ReturnType<typeof useTranslations>;

export const COURSE_TYPE_KEY_MAP: Record<number, string> = {
  1: 'Full',
  2: 'MidTerm',
  3: 'Final',
};

const ARABIC_QUIZ_LETTERS = ['أ', 'ب', 'ج', 'د', 'هـ', 'و', 'ز', 'ح'];
const LATIN_QUIZ_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export function quizLettersForLocale(locale?: string): string[] {
  return locale === 'ar' ? ARABIC_QUIZ_LETTERS : LATIN_QUIZ_LETTERS;
}

export function mapLessonTestToLessonQuiz(
  test: LessonTest,
  t: ChaptersTranslator,
  locale?: string
): LessonQuiz {
  const letters = quizLettersForLocale(locale);
  const questions: LessonQuizQuestion[] = (test.questions ?? []).map((question, qi) => ({
    id: question.id ?? `q-${qi}`,
    number: qi + 1,
    title: question.text,
    points: 10,
    explanation: question.explanation ?? '',
    options: (question.choices ?? []).map((choice, ci): LessonQuizOption => ({
      id: choice.id ?? `opt-${qi}-${ci}`,
      letter: letters[ci] ?? String(ci + 1),
      text: choice.title,
      isCorrect: Boolean(choice.isRight),
    })),
  }));

  return {
    title: t('lesson_quiz_bank_title'),
    questions,
  };
}

export type ResolvedAttachment = { name: string; url: string };

export function mapCurriculumToFormChapters(
  curriculum: CourseCurriculum | null | undefined,
  t: ChaptersTranslator,
  locale?: string,
  resolvedAttachments: Record<string, ResolvedAttachment> = {}
): Chapter[] {
  return (curriculum?.chapters ?? []).map((chapter, chapterIndex) => ({
    id: chapter.id ?? `ch-${chapterIndex}`,
    title: chapter.title,
    isExpanded: chapterIndex === 0,
    lessons: (chapter.lessons ?? []).map((lesson, lessonIndex) => ({
      id: lesson.id ?? `les-${lessonIndex}`,
      title: lesson.title,
      isCompleted: Boolean(lesson.videoUrl || lesson.test?.questions?.length),
      videoUrl: lesson.videoUrl,
      videoName: lesson.videoUrl ? lesson.title : undefined,
      quiz: lesson.test?.questions?.length
        ? mapLessonTestToLessonQuiz(lesson.test, t, locale)
        : null,
      documents: (lesson.attachmentIds ?? []).map((attId, docIndex) => {
        const resolved = resolvedAttachments[attId];
        return {
          id: `doc-${lesson.id ?? lessonIndex}-${docIndex}`,
          attachmentId: attId,
          name: resolved?.name || attId,
          url: resolved?.url || attId,
        };
      }),
    })),
  }));
}

export function mapCurriculumToRichChapters(
  curriculum: CourseCurriculum | null | undefined,
  t: ChaptersTranslator,
  locale?: string,
  resolvedAttachments: Record<string, ResolvedAttachment> = {}
): RichChapter[] {
  return (curriculum?.chapters ?? []).map((chapter, chapterIndex) => ({
    id: chapter.id ?? `ch-${chapterIndex}`,
    number: chapter.order ?? chapterIndex + 1,
    title: chapter.title,
    isExpanded: chapterIndex === 0,
    lessons: (chapter.lessons ?? []).map((lesson, lessonIndex) => {
      const attachments: AttachmentItem[] = [];

      if (lesson.videoUrl) {
        attachments.push({
          id: `video-${lesson.id ?? lessonIndex}`,
          type: 'video',
          title: lesson.title,
          badgeText: t('upload_success_badge'),
          metaText: t('video'),
          url: lesson.videoUrl,
          isUploading: false,
        });
      }

      const questionsCount = lesson.test?.questions?.length ?? 0;
      if (questionsCount > 0) {
        attachments.push({
          id: `quiz-${lesson.id ?? lessonIndex}`,
          type: 'quiz',
          title: t('quiz_bank_title_short'),
          badgeText: t('quiz_badge_after_video'),
          metaText: t('quiz_meta_count', { count: questionsCount }),
          questionsCount,
          quiz: mapLessonTestToLessonQuiz(lesson.test as LessonTest, t, locale),
        });
      }

      (lesson.attachmentIds ?? []).forEach((attId, attIndex) => {
        const resolved = resolvedAttachments[attId];
        attachments.push({
          id: `pdf-${lesson.id ?? lessonIndex}-${attIndex}`,
          type: 'pdf',
          attachmentId: attId,
          title: resolved?.name || attId,
          badgeText: t('doc_ready_short_badge'),
          metaText: t('pdf_file_meta'),
          url: resolved?.url || attId,
          isUploading: false,
        });
      });

      return {
        id: lesson.id ?? `les-${lessonIndex}`,
        number: lesson.order ?? lessonIndex + 1,
        title: lesson.title,
        isCompleted: Boolean(lesson.videoUrl || questionsCount > 0),
        attachments,
      };
    }),
  }));
}