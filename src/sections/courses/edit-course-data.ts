import type { CourseCurriculum, LessonTest } from 'src/types/course';
import type {
  AttachmentItem,
  Chapter,
  LessonQuiz,
  LessonQuizOption,
  LessonQuizQuestion,
  RichChapter,
} from './types';

export const COURSE_TYPE_KEY_MAP: Record<number, string> = {
  1: 'Full',
  2: 'MidTerm',
  3: 'Final',
};

const QUIZ_LETTERS = ['أ', 'ب', 'ج', 'د', 'هـ', 'و', 'ز', 'ح'];

export function mapLessonTestToLessonQuiz(test: LessonTest, fallbackTitle = 'بنك أسئلة الدرس'): LessonQuiz {
  const questions: LessonQuizQuestion[] = (test.questions ?? []).map((question, qi) => ({
    id: question.id ?? `q-${qi}`,
    number: qi + 1,
    title: question.text,
    points: 10,
    explanation: question.explanation ?? '',
    options: (question.choices ?? []).map((choice, ci): LessonQuizOption => ({
      id: choice.id ?? `opt-${qi}-${ci}`,
      letter: QUIZ_LETTERS[ci] ?? String(ci + 1),
      text: choice.title,
      isCorrect: Boolean(choice.isRight),
    })),
  }));

  return {
    title: fallbackTitle,
    questions,
  };
}

export function mapCurriculumToFormChapters(curriculum: CourseCurriculum | null | undefined): Chapter[] {
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
      quiz: lesson.test?.questions?.length ? mapLessonTestToLessonQuiz(lesson.test) : null,
      documents: (lesson.attachmentIds ?? []).map((url, docIndex) => ({
        id: `doc-${lesson.id ?? lessonIndex}-${docIndex}`,
        name: url.split('/').pop() || url,
        url,
      })),
    })),
  }));
}

export function mapCurriculumToRichChapters(curriculum: CourseCurriculum | null | undefined): RichChapter[] {
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
          badgeText: 'تم المعالجة والرفع بنجاح',
          metaText: 'فيديو',
          url: lesson.videoUrl,
          isUploading: false,
        });
      }

      const questionsCount = lesson.test?.questions?.length ?? 0;
      if (questionsCount > 0) {
        attachments.push({
          id: `quiz-${lesson.id ?? lessonIndex}`,
          type: 'quiz',
          title: 'بنك أسئلة وتدريبات الدرس',
          badgeText: 'مفعل بعد انتهاء الفيديو',
          metaText: `${questionsCount} أسئلة`,
          questionsCount,
          quiz: mapLessonTestToLessonQuiz(lesson.test as LessonTest),
        });
      }

      (lesson.attachmentIds ?? []).forEach((url, attIndex) => {
        attachments.push({
          id: `pdf-${lesson.id ?? lessonIndex}-${attIndex}`,
          type: 'pdf',
          title: url.split('/').pop() || url,
          badgeText: 'جاهز للتحميل',
          metaText: 'ملف PDF',
          url,
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