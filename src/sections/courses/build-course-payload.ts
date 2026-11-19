import { COURSE_TYPE_MAP } from './types';
import type { Chapter, CourseFormValues, CoursePayloadMode, LessonDoc } from './types';

const GUID_UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Server ids are GUIDs; items added in the form have local ids (`ch-0`, `opt-…`) and are sent without
 * one so the API creates them. Sending existing ids lets the API update in place instead of deleting and
 * re-creating — which it refuses once students have answered a question or watched a lesson. */
function serverId(id: string | undefined): string | undefined {
  return id && GUID_UUID_PATTERN.test(id) ? id : undefined;
}

function normalizeAttachmentIds(documents: LessonDoc[]): string[] {
  return documents
    .map((doc) => doc.attachmentId || doc.url)
    .filter((value): value is string => typeof value === 'string' && GUID_UUID_PATTERN.test(value));
}

function buildObjectives(objectives: CourseFormValues['learningObjectives']) {
  return objectives.map((objective, index) => ({
    textAr: objective.textAr,
    textEn: objective.textEn,
    order: index + 1,
  }));
}

function toHttps(url: string | undefined): string | null {
  if (!url) return null;
  return url.replace(/^http:\/\//i, 'https://');
}

function buildCurriculum(chapters: Chapter[]) {
  return {
    chapters: chapters.map((chapter, chapterIndex) => ({
      id: serverId(chapter.id),
      title: chapter.title,
      order: chapterIndex + 1,
      lessons: chapter.lessons.map((lesson, lessonIndex) => {
        const test =
          lesson.quiz && lesson.quiz.questions.length
            ? {
                questions: lesson.quiz.questions.map((question) => ({
                  id: serverId(question.id),
                  text: question.title || null,
                  explanation: question.explanation || null,
                  choices: question.options.map((option, optionIndex) => ({
                    id: serverId(option.id),
                    title: option.text || null,
                    order: optionIndex + 1,
                    isRight: option.isCorrect,
                  })),
                })),
              }
            : null;

        const videoUrl = toHttps(lesson.videoUrl);

        return {
          id: serverId(lesson.id),
          title: lesson.title,
          order: lessonIndex + 1,
          durationInSeconds: videoUrl ? 600 : 0,
          videoUrl,
          isFreePreview: false,
          attachmentIds: normalizeAttachmentIds(lesson.documents),
          test,
        };
      }),
    })),
  };
}

function appendFormObject(formData: FormData, prefix: string, value: unknown): void {
  if (value === null || value === undefined) return;
  if (Array.isArray(value)) {
    if (value.length === 0) return;
    value.forEach((item, index) => appendFormObject(formData, `${prefix}[${index}]`, item));
    return;
  }
  if (typeof value === 'object') {
    Object.entries(value).forEach(([key, child]) =>
      appendFormObject(formData, `${prefix}[${key}]`, child)
    );
    return;
  }
  formData.append(prefix, String(value));
}

export function buildCourseFormData(
  formValues: CourseFormValues,
  mode: CoursePayloadMode = 'json',
  options: { omitPricing?: boolean } = {}
): FormData {
  const { omitPricing = false } = options;
  const formData = new FormData();
  const objectives = buildObjectives(formValues.learningObjectives);
  const curriculum = buildCurriculum(formValues.chapters);

  formData.append('Title', formValues.title);
  formData.append('Description', formValues.description);
  formData.append('Type', String(COURSE_TYPE_MAP[formValues.type] ?? 0));
  if (!omitPricing) {
    formData.append('Price', formValues.price || '0');
    formData.append('OldPrice', formValues.oldPrice || '0');
  }
  formData.append('AccessDurationInDays', formValues.accessDurationInDays || '0');
  if (!omitPricing && formValues.platformPercentage !== '' && formValues.platformPercentage != null) {
    formData.append('PlatformPercentage', formValues.platformPercentage);
  }
  if (!omitPricing && formValues.currencyId) formData.append('CurrencyId', formValues.currencyId);
  if (formValues.instructorId) formData.append('InstructorId', formValues.instructorId);
  formData.append('FieldId', formValues.fieldId);

  if (formValues.specializationId) formData.append('SpecializationId', formValues.specializationId);
  if (formValues.facultyId) formData.append('FacultyId', formValues.facultyId);
  if (formValues.studyMaterialId) formData.append('StudyMaterialId', formValues.studyMaterialId);
  if (formValues.image instanceof File) formData.append('Image', formValues.image);

  if (mode === 'indexed') {
    appendFormObject(formData, 'ObjectivesJson', objectives);
    appendFormObject(formData, 'CurriculumJson', curriculum);
  } else {
    formData.append('ObjectivesJson', JSON.stringify(objectives));
    formData.append('CurriculumJson', JSON.stringify(curriculum));
  }

  return formData;
}