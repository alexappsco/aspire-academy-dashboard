import { COURSE_TYPE_MAP } from './types';
import type { Chapter, CourseFormValues, CoursePayloadMode } from './types';

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
      title: chapter.title,
      order: chapterIndex + 1,
      lessons: chapter.lessons.map((lesson, lessonIndex) => {
        const test =
          lesson.quiz && lesson.quiz.questions.length
            ? {
                questions: lesson.quiz.questions.map((question) => ({
                  text: question.title || null,
                  explanation: question.explanation || null,
                  choices: question.options.map((option, optionIndex) => ({
                    title: option.text || null,
                    order: optionIndex + 1,
                    isRight: option.isCorrect,
                  })),
                })),
              }
            : null;

        const videoUrl = toHttps(lesson.videoUrl);

        return {
          title: lesson.title,
          order: lessonIndex + 1,
          durationInSeconds: videoUrl ? 600 : 0,
          videoUrl,
          isFreePreview: false,
          attachmentIds: lesson.documents.map((doc) => doc.url),
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
  mode: CoursePayloadMode = 'json'
): FormData {
  const formData = new FormData();
  const objectives = buildObjectives(formValues.learningObjectives);
  const curriculum = buildCurriculum(formValues.chapters);

  formData.append('Title', formValues.title);
  formData.append('Description', formValues.description);
  formData.append('Type', String(COURSE_TYPE_MAP[formValues.type] ?? 0));
  formData.append('Price', formValues.price || '0');
  formData.append('OldPrice', formValues.oldPrice || '0');
  formData.append('AccessDurationInDays', formValues.accessDurationInDays || '0');
  formData.append('CurrencyId', formValues.currencyId);
  formData.append('InstructorId', formValues.instructorId);
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