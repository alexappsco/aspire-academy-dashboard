'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import { useTranslations } from 'next-intl';

import Iconify from 'src/components/iconify';
import { useToast } from 'src/components/toast';
import ConfirmationDialog from 'src/components/dialog/ConfirmationDialog';
import QuizDialog, { QuizConfig } from 'src/sections/courses/components/QuizDialog';
import { uploadFile, uploadAttachment, getAttachment } from 'src/actions/courses';
import {
  saveSessionRequestChaptersAction,
  deleteSessionRequestChapterAction,
  deleteSessionRequestLessonAction,
} from 'src/actions/instructor-session-requests';
import type {
  SessionChapterResult,
  SaveSessionChaptersCommand,
} from 'src/types/private-request';

interface Props {
  requestId: string;
  initialChapters?: SessionChapterResult[] | null;
  onChaptersUpdated?: (updatedChapters: SessionChapterResult[]) => void;
}

const ARABIC_LETTERS = ['أ', 'ب', 'ج', 'د', 'هـ', 'و', 'ز', 'ح'];

const inputRootSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    bgcolor: '#FFFFFF',
    fontSize: '0.9375rem',
    '& fieldset': { borderColor: '#E5E7EB' },
    '&:hover fieldset': { borderColor: '#CBD5E1' },
    '&.Mui-focused fieldset': { borderColor: '#1C252E' },
  },
};

/**
 * Validates whether a string is a standard RFC 4122 GUID/UUID.
 */
function isValidUuid(id?: string | null): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

function toHttps(url?: string | null): string | null {
  if (!url) return null;
  return url.replace(/^http:\/\//i, 'https://');
}

export interface CurriculumAttachmentItem {
  id: string;
  dbId?: string;
  type: 'video' | 'quiz' | 'pdf';
  attachmentId?: string;
  title: string;
  badgeText: string;
  metaText: string;
  questionsCount?: number;
  url?: string;
  durationInSeconds?: number;
  quiz?: QuizConfig;
}

export interface CurriculumLesson {
  id: string;
  dbId?: string;
  number: number;
  title: string;
  subtitle?: string;
  isCompleted?: boolean;
  attachments: CurriculumAttachmentItem[];
}

export interface CurriculumChapter {
  id: string;
  dbId?: string;
  number: number;
  title: string;
  hours?: number;
  isExpanded: boolean;
  lessons: CurriculumLesson[];
}

// Map backend response chapters to rich UI representation
function mapBackendChaptersToRich(
  backendChapters?: SessionChapterResult[] | null
): CurriculumChapter[] {
  if (!backendChapters || backendChapters.length === 0) return [];

  return backendChapters.map((ch, chIdx) => {
    const chapterDbId = isValidUuid(ch.id) ? ch.id : undefined;

    return {
      id: chapterDbId || `ch-local-${chIdx + 1}`,
      dbId: chapterDbId,
      number: ch.order || chIdx + 1,
      title: ch.title || `الفصل ${chIdx + 1}`,
      hours: ch.hours || 1,
      isExpanded: chIdx === 0,
      lessons: (ch.lessons || []).map((les, lIdx) => {
        const lessonDbId = isValidUuid(les.id) ? les.id : undefined;
        const attachments: CurriculumAttachmentItem[] = [];

        if (les.videoUrl) {
          const durationMin = Math.max(1, Math.round((les.durationInSeconds || 0) / 60));
          attachments.push({
            id: `vid-${les.id || lIdx}`,
            dbId: lessonDbId,
            type: 'video',
            title: `فيديو المحاضرة: ${les.title}`,
            badgeText: 'تم المعالجة والرفع بنجاح',
            metaText: `المدة: ${durationMin} دقيقة • فيديو الدرس`,
            url: toHttps(les.videoUrl) || les.videoUrl,
            durationInSeconds: les.durationInSeconds || durationMin * 60,
          });
        }

        if (les.test && les.test.questions && les.test.questions.length > 0) {
          const testDbId = isValidUuid(les.test.id) ? les.test.id : undefined;
          const questionsCount = les.test.questions.length;
          attachments.push({
            id: `quiz-${les.test.id || les.id || lIdx}`,
            dbId: testDbId,
            type: 'quiz',
            title: 'بنك أسئلة وتدريبات الدرس (Self-Assessment)',
            badgeText: 'مفعل بعد انتهاء الفيديو',
            metaText: `${questionsCount} أسئلة تدريبية تفاعلية (MCQ)`,
            questionsCount,
            quiz: {
              title: 'بنك أسئلة وتدريبات الدرس',
              questions: les.test.questions.map((q, qIdx) => ({
                id: q.id || `q-${qIdx + 1}`,
                number: qIdx + 1,
                title: q.text,
                points: 1,
                explanation: q.explanation || '',
                options: (q.choices || []).map((c, cIdx) => ({
                  id: c.id || `c-${cIdx + 1}`,
                  letter: ARABIC_LETTERS[cIdx] || `${cIdx + 1}`,
                  text: c.title,
                  isCorrect: Boolean(c.isRight),
                })),
              })),
            },
          });
        }

        // Map attachments if present (either full attachment objects or attachmentIds)
        if (les.attachments && les.attachments.length > 0) {
          les.attachments.forEach((att, attIdx) => {
            attachments.push({
              id: att.id || `doc-${les.id || lIdx}-${attIdx}`,
              dbId: isValidUuid(att.id) ? att.id : undefined,
              attachmentId: att.id,
              type: 'pdf',
              title: att.name || att.fileName || 'مستند مرفق',
              badgeText: 'جاهز للتحميل للطلاب',
              metaText: 'ملف إلكتروني',
              url: toHttps(att.url) || att.url,
            });
          });
        } else if (les.attachmentIds && les.attachmentIds.length > 0) {
          les.attachmentIds.forEach((attId, attIdx) => {
            attachments.push({
              id: `doc-${les.id || lIdx}-${attIdx}`,
              dbId: isValidUuid(attId) ? attId : undefined,
              attachmentId: attId,
              type: 'pdf',
              title: 'مستند مرفق',
              badgeText: 'جاهز للتحميل للطلاب',
              metaText: 'ملف إلكتروني',
              url: undefined,
            });
          });
        }

        return {
          id: lessonDbId || `les-local-${lIdx + 1}`,
          dbId: lessonDbId,
          number: les.order || lIdx + 1,
          title: les.title || `الدرس ${lIdx + 1}`,
          subtitle: les.description || undefined,
          isCompleted: attachments.length > 0,
          attachments,
        };
      }),
    };
  });
}

// Map rich UI chapters into exact backend Save payload:
// Existing items send their dbId, new items send null so EF Core inserts them cleanly
function mapRichChaptersToBackendPayload(
  rich: CurriculumChapter[]
): SaveSessionChaptersCommand {
  return {
    chapters: rich.map((ch, chIdx) => {
      const chapterId = ch.dbId && isValidUuid(ch.dbId) ? ch.dbId : null;

      const lessons = ch.lessons.map((les, lIdx) => {
        const lessonId = les.dbId && isValidUuid(les.dbId) ? les.dbId : null;
        const videoAtt = les.attachments.find((a) => a.type === 'video');
        const quizAtt = les.attachments.find((a) => a.type === 'quiz');
        const docAtts = les.attachments.filter((a) => a.type === 'pdf' && a.attachmentId);

        let testInput = null;
        if (quizAtt?.quiz?.questions && quizAtt.quiz.questions.length > 0) {
          const validQuestions = quizAtt.quiz.questions.filter((q) => q.title && q.title.trim() !== '');

          if (validQuestions.length > 0) {
            const testId = quizAtt.dbId && isValidUuid(quizAtt.dbId) ? quizAtt.dbId : null;
            testInput = {
              id: testId,
              questions: validQuestions.map((q) => {
                const questionId = isValidUuid(q.id) ? q.id : null;
                const validChoices = q.options.filter((opt) => opt.text && opt.text.trim() !== '');
                const hasCorrect = validChoices.some((opt) => opt.isCorrect);

                return {
                  id: questionId,
                  text: q.title.trim(),
                  explanation: q.explanation?.trim() || null,
                  choices: validChoices.map((opt, optIdx) => ({
                    id: isValidUuid(opt.id) ? opt.id : null,
                    title: opt.text.trim(),
                    order: optIdx + 1,
                    isRight: hasCorrect ? Boolean(opt.isCorrect) : optIdx === 0,
                  })),
                };
              }),
            };
          }
        }

        const hasVideo = Boolean(videoAtt?.url?.trim());
        const rawVideoUrl = hasVideo ? videoAtt!.url!.trim() : null;
        const videoUrl = rawVideoUrl ? (toHttps(rawVideoUrl) || rawVideoUrl) : null;
        const durationSeconds = hasVideo ? Number(videoAtt?.durationInSeconds) || 600 : 0;
        const attachmentIds = docAtts.map((d) => d.attachmentId!);

        return {
          id: lessonId,
          title: les.title.trim(),
          description: les.subtitle?.trim() || null,
          order: les.number || lIdx + 1,
          durationInSeconds: durationSeconds,
          videoUrl,
          test: testInput,
          attachmentIds: attachmentIds.length > 0 ? attachmentIds : [],
        };
      });

      // Chapter hours: strictly required by backend to be > 0 (minimum 1 hour)
      const chapterHours =
        typeof ch.hours === 'number' && ch.hours > 0 ? Math.round(ch.hours) : 1;

      return {
        id: chapterId,
        title: ch.title.trim(),
        order: ch.number || chIdx + 1,
        hours: chapterHours,
        lessons,
      };
    }),
  };
}

export default function RecordedCurriculumSection({
  requestId,
  initialChapters,
  onChaptersUpdated,
}: Props) {
  const toast = useToast();
  const t = useTranslations('PrivateRequests');

  // State strictly initialized with backend data - ZERO fake data
  const [richChapters, setRichChapters] = useState<CurriculumChapter[]>(() =>
    mapBackendChaptersToRich(initialChapters)
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [lessonTitles, setLessonTitles] = useState<Record<string, string>>({});


  // Quiz Dialog state
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [activeChapterForQuiz, setActiveChapterForQuiz] = useState<string>('');
  const [quizLessonId, setQuizLessonId] = useState<string | null>(null);

  // Video Preview Dialog state
  const [videoPreviewOpen, setVideoPreviewOpen] = useState(false);
  const [previewVideoTitle, setPreviewVideoTitle] = useState('');
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);

  // Editing lesson title state
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [editingLessonTitle, setEditingLessonTitle] = useState<string>('');

  // Delete Chapter Dialog state
  const [chapterToDelete, setChapterToDelete] = useState<CurriculumChapter | null>(null);
  const [isDeletingChapter, setIsDeletingChapter] = useState(false);

  // Delete Lesson Dialog state
  const [lessonToDelete, setLessonToDelete] = useState<{
    chapterId: string;
    chapterDbId: string;
    lessonId: string;
    lessonDbId: string;
    lessonTitle: string;
  } | null>(null);
  const [isDeletingLesson, setIsDeletingLesson] = useState(false);

  // Upload and attachment refs & state
  const videoFileInputRef = useRef<HTMLInputElement | null>(null);
  const docFileInputRef = useRef<HTMLInputElement | null>(null);
  const [targetLessonForUpload, setTargetLessonForUpload] = useState<{
    chapterId: string;
    lessonId: string;
  } | null>(null);
  const [uploadingState, setUploadingState] = useState<{
    lessonId: string;
    type: 'video' | 'pdf';
  } | null>(null);

  const isUploading = Boolean(uploadingState);
  const isVideoUploading = (lessonId: string) =>
    uploadingState?.lessonId === lessonId && uploadingState?.type === 'video';
  const isDocUploading = (lessonId: string) =>
    uploadingState?.lessonId === lessonId && uploadingState?.type === 'pdf';

  // Sync state if initialChapters changes from parent & resolve attachment details
  useEffect(() => {
    if (!initialChapters) return;

    const mapped = mapBackendChaptersToRich(initialChapters);
    setRichChapters(mapped);
    setHasUnsavedChanges(false);

    const pendingIds = new Set<string>();
    mapped.forEach((ch) =>
      ch.lessons.forEach((les) =>
        les.attachments.forEach((att) => {
          if (att.type === 'pdf' && att.attachmentId && !att.url) {
            pendingIds.add(att.attachmentId);
          }
        })
      )
    );

    if (pendingIds.size === 0) return;

    let active = true;
    (async () => {
      const resolvedMap: Record<string, { name: string; url: string }> = {};
      await Promise.all(
        Array.from(pendingIds).map(async (attId) => {
          try {
            const res = await getAttachment(attId);
            if (res.success && res.data) {
              resolvedMap[attId] = { name: res.data.name, url: res.data.url };
            }
          } catch {
            // ignore
          }
        })
      );

      if (!active || Object.keys(resolvedMap).length === 0) return;

      setRichChapters((prev) =>
        prev.map((ch) => ({
          ...ch,
          lessons: ch.lessons.map((les) => ({
            ...les,
            attachments: les.attachments.map((att) => {
              if (att.type === 'pdf' && att.attachmentId && resolvedMap[att.attachmentId]) {
                const info = resolvedMap[att.attachmentId];
                return {
                  ...att,
                  title: info.name || att.title,
                  url: info.url,
                };
              }
              return att;
            }),
          })),
        }))
      );
    })();

    return () => {
      active = false;
    };
  }, [initialChapters]);

  // ── Explicit Save Handler (Persists to Backend Database) ──────────────────────────
  const handleSaveCurriculum = async () => {
    if (richChapters.length === 0) {
      toast.warning('يرجى إضافة فصل واحد على الأقل قبل الحفظ');
      return;
    }

    // Validation
    for (const ch of richChapters) {
      if (!ch.title.trim()) {
        toast.error('يوجد فصل بدون عنوان، يرجى كتابة عنوان الفصل');
        return;
      }
      for (const les of ch.lessons) {
        if (!les.title.trim()) {
          toast.error(`يوجد درس بدون عنوان داخل ${ch.title}`);
          return;
        }
        const videoAtt = les.attachments.find((a) => a.type === 'video');
        if (!videoAtt?.url?.trim()) {
          toast.error(
            `الدرس "${les.title}" داخل "${ch.title}" لا يحتوي على فيديو. يرجى رفع فيديو للدرس أولاً قبل الحفظ.`
          );
          return;
        }
      }
    }

    setIsSaving(true);
    try {
      const payload = mapRichChaptersToBackendPayload(richChapters);
      const res = await saveSessionRequestChaptersAction(requestId, payload);

      if (res.success && res.data) {
        toast.success(t('notifications.curriculum_saved'));
        setHasUnsavedChanges(false);
        const mappedFromBackend = mapBackendChaptersToRich(res.data);
        setRichChapters(mappedFromBackend);
        onChaptersUpdated?.(res.data);
      } else {
        toast.error(res.error || t('notifications.curriculum_save_error'));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('notifications.curriculum_save_error'));
    } finally {
      setIsSaving(false);
    }
  };

  // 1. Add new chapter
  const handleAddChapter = () => {
    if (!newChapterTitle.trim()) {
      toast.warning(t('notifications.enter_chapter_title_warning'));
      return;
    }
    const newChapter: CurriculumChapter = {
      id: crypto.randomUUID(),
      number: richChapters.length + 1,
      title: newChapterTitle.trim(),
      hours: 1,
      isExpanded: true,
      lessons: [],
    };
    setRichChapters((prev) => [...prev, newChapter]);
    setNewChapterTitle('');
    setHasUnsavedChanges(true);
    toast.success(t('notifications.chapter_added_local'));
  };

  // 2. Delete chapter (local vs backend)
  const handleRequestDeleteChapter = (chapter: CurriculumChapter, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!chapter.dbId) {
      // Local chapter not yet saved to backend
      setRichChapters((prev) =>
        prev
          .filter((ch) => ch.id !== chapter.id)
          .map((ch, idx) => ({ ...ch, number: idx + 1 }))
      );
      setHasUnsavedChanges(true);
      toast.info(t('notifications.chapter_deleted_local'));
      return;
    }
    // Saved in backend -> open confirm dialog
    setChapterToDelete(chapter);
  };

  const handleConfirmDeleteChapter = async () => {
    if (!chapterToDelete?.dbId) return;

    setIsDeletingChapter(true);
    try {
      const res = await deleteSessionRequestChapterAction(requestId, chapterToDelete.dbId);
      if (res.success) {
        toast.success(t('notifications.chapter_deleted'));
        const updatedChapters = richChapters
          .filter((ch) => ch.id !== chapterToDelete.id)
          .map((ch, idx) => ({ ...ch, number: idx + 1 }));
        setRichChapters(updatedChapters);
        setChapterToDelete(null);

        // Notify parent of updated state
        const payload = mapRichChaptersToBackendPayload(updatedChapters);
        onChaptersUpdated?.(payload.chapters as any);
      } else {
        toast.error(res.error || t('notifications.chapter_deleted'));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('notifications.chapter_deleted'));
    } finally {
      setIsDeletingChapter(false);
    }
  };

  // 3. Toggle chapter accordion
  const handleToggleChapter = (chapterId: string) => {
    setRichChapters((prev) =>
      prev.map((ch) =>
        ch.id === chapterId ? { ...ch, isExpanded: !ch.isExpanded } : ch
      )
    );
  };

  // 4. Add lesson to chapter
  const handleAddLesson = (chapterId: string) => {
    const title = lessonTitles[chapterId]?.trim();
    if (!title) {
      toast.warning(t('notifications.enter_lesson_title_warning'));
      return;
    }

    setRichChapters((prev) =>
      prev.map((ch) => {
        if (ch.id !== chapterId) return ch;
        return {
          ...ch,
          lessons: [
            ...ch.lessons,
            {
              id: crypto.randomUUID(),
              number: ch.lessons.length + 1,
              title,
              attachments: [],
            },
          ],
        };
      })
    );

    setLessonTitles((prev) => ({ ...prev, [chapterId]: '' }));
    setHasUnsavedChanges(true);
    toast.success(t('notifications.lesson_added_local'));
  };

  // 5. Delete lesson (local vs backend)
  const handleRequestDeleteLesson = (
    chapter: CurriculumChapter,
    lesson: CurriculumLesson
  ) => {
    if (!chapter.dbId || !lesson.dbId) {
      // Local lesson (not yet saved to backend) -> delete directly from state
      setRichChapters((prev) =>
        prev.map((ch) => {
          if (ch.id !== chapter.id) return ch;
          return {
            ...ch,
            lessons: ch.lessons
              .filter((les) => les.id !== lesson.id)
              .map((les, idx) => ({ ...les, number: idx + 1 })),
          };
        })
      );
      setHasUnsavedChanges(true);
      toast.info(t('notifications.lesson_deleted_local'));
      return;
    }

    // Persisted on backend -> open confirmation modal
    setLessonToDelete({
      chapterId: chapter.id,
      chapterDbId: chapter.dbId,
      lessonId: lesson.id,
      lessonDbId: lesson.dbId,
      lessonTitle: lesson.title,
    });
  };

  const handleConfirmDeleteLesson = async () => {
    if (!lessonToDelete) return;

    setIsDeletingLesson(true);
    try {
      const res = await deleteSessionRequestLessonAction(
        requestId,
        lessonToDelete.chapterDbId,
        lessonToDelete.lessonDbId
      );

      if (res.success) {
        toast.success(t('notifications.lesson_deleted'));
        setRichChapters((prev) =>
          prev.map((ch) => {
            if (ch.id !== lessonToDelete.chapterId) return ch;
            return {
              ...ch,
              lessons: ch.lessons
                .filter((les) => les.id !== lessonToDelete.lessonId)
                .map((les, idx) => ({ ...les, number: idx + 1 })),
            };
          })
        );
        setLessonToDelete(null);
      } else {
        toast.error(res.error || t('notifications.lesson_deleted'));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('notifications.lesson_deleted'));
    } finally {
      setIsDeletingLesson(false);
    }
  };


  // 8. Quiz Dialog Handlers
  const handleOpenQuizDialog = (
    chapterId: string,
    lessonId: string,
    chapterTitle: string
  ) => {
    setActiveChapterForQuiz(chapterTitle);
    setQuizLessonId(lessonId);
    setQuizDialogOpen(true);
  };

  const handleSaveQuiz = useCallback(
    (config: QuizConfig) => {
      if (!quizLessonId) return;

      const quizAtt: CurriculumAttachmentItem = {
        id: crypto.randomUUID(),
        type: 'quiz',
        title: t('details.recorded_curriculum.quiz_att_title'),
        badgeText: t('details.recorded_curriculum.quiz_badge'),
        metaText: t('details.recorded_curriculum.quiz_meta', { count: config.questions.length }),
        questionsCount: config.questions.length,
        quiz: config,
      };

      setRichChapters((prev) =>
        prev.map((ch) => ({
          ...ch,
          lessons: ch.lessons.map((les) => {
            if (les.id !== quizLessonId) return les;
            return {
              ...les,
              isCompleted: true,
              subtitle: les.subtitle || t('details.recorded_curriculum.quiz_attached_subtitle'),
              attachments: [
                ...les.attachments.filter((a) => a.type !== 'quiz'),
                quizAtt,
              ],
            };
          }),
        }))
      );

      setQuizLessonId(null);
      setQuizDialogOpen(false);
      setHasUnsavedChanges(true);
      toast.success(t('notifications.quiz_saved_local'));
    },
    [quizLessonId, t, toast]
  );

  // 9. Video and Document Upload Handlers
  const handleTriggerVideoUpload = (chapterId: string, lessonId: string) => {
    setTargetLessonForUpload({ chapterId, lessonId });
    if (videoFileInputRef.current) {
      videoFileInputRef.current.value = '';
      videoFileInputRef.current.click();
    }
  };

  const handleVideoFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetLessonForUpload || isUploading) return;

    const currentTarget = targetLessonForUpload;
    setUploadingState({ lessonId: currentTarget.lessonId, type: 'video' });
    try {
      // Extract video duration from file in browser if possible
      let durationInSeconds = 600;
      try {
        const video = document.createElement('video');
        video.preload = 'metadata';
        const durationPromise = new Promise<number>((resolve) => {
          video.onloadedmetadata = () => {
            window.URL.revokeObjectURL(video.src);
            resolve(Math.round(video.duration) || 600);
          };
          video.onerror = () => resolve(600);
        });
        video.src = URL.createObjectURL(file);
        durationInSeconds = await Promise.race([
          durationPromise,
          new Promise<number>((r) => setTimeout(() => r(600), 2000)),
        ]);
      } catch {
        durationInSeconds = 600;
      }

      const res = await uploadFile(file, 'videos');
      if (!res.success || !res.data) {
        toast.error(res.error || t('notifications.video_upload_failed'));
        return;
      }

      const cleanUrl = toHttps(res.data.url) || res.data.url;
      const durationMin = Math.max(1, Math.round(durationInSeconds / 60));
      const newAtt: CurriculumAttachmentItem = {
        id: `att-${Date.now()}`,
        type: 'video',
        title: t('details.recorded_curriculum.video_att_title', { name: file.name }),
        badgeText: t('details.recorded_curriculum.video_badge'),
        metaText: t('details.recorded_curriculum.video_meta', {
          duration: durationMin,
          size: (file.size / (1024 * 1024)).toFixed(1),
        }),
        url: cleanUrl,
        durationInSeconds,
      };

      setRichChapters((prev) =>
        prev.map((ch) => {
          if (ch.id !== currentTarget.chapterId) return ch;
          return {
            ...ch,
            lessons: ch.lessons.map((les) => {
              if (les.id !== currentTarget.lessonId) return les;
              const otherAtts = les.attachments.filter((a) => a.type !== 'video');
              return {
                ...les,
                isCompleted: true,
                subtitle: les.subtitle || t('details.recorded_curriculum.video_attached_subtitle'),
                attachments: [...otherAtts, newAtt],
              };
            }),
          };
        })
      );
      setHasUnsavedChanges(true);
      toast.success(t('notifications.video_upload_success'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('notifications.video_upload_failed'));
    } finally {
      setUploadingState(null);
      setTargetLessonForUpload(null);
    }
  };

  const handleTriggerDocUpload = (chapterId: string, lessonId: string) => {
    setTargetLessonForUpload({ chapterId, lessonId });
    if (docFileInputRef.current) {
      docFileInputRef.current.value = '';
      docFileInputRef.current.click();
    }
  };

  const handleDocFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetLessonForUpload || isUploading) return;

    const currentTarget = targetLessonForUpload;
    setUploadingState({ lessonId: currentTarget.lessonId, type: 'pdf' });
    try {
      const res = await uploadAttachment(file, file.name);
      if (!res.success || !res.data) {
        toast.error(res.error || t('notifications.doc_upload_failed'));
        return;
      }

      const cleanUrl = toHttps(res.data.url) || res.data.url;
      const newAtt: CurriculumAttachmentItem = {
        id: `att-${Date.now()}`,
        type: 'pdf',
        attachmentId: res.data.id,
        title: res.data.name || file.name,
        badgeText: t('details.recorded_curriculum.doc_badge'),
        metaText: t('details.recorded_curriculum.doc_meta', {
          size: (file.size / (1024 * 1024)).toFixed(1),
        }),
        url: cleanUrl,
      };

      setRichChapters((prev) =>
        prev.map((ch) => {
          if (ch.id !== currentTarget.chapterId) return ch;
          return {
            ...ch,
            lessons: ch.lessons.map((les) => {
              if (les.id !== currentTarget.lessonId) return les;
              return {
                ...les,
                isCompleted: true,
                attachments: [...les.attachments, newAtt],
              };
            }),
          };
        })
      );
      setHasUnsavedChanges(true);
      toast.success(t('notifications.doc_upload_success'));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('notifications.doc_upload_failed'));
    } finally {
      setUploadingState(null);
      setTargetLessonForUpload(null);
    }
  };

  const handleDeleteAttachment = (chapterId: string, lessonId: string, attachmentId: string) => {
    setRichChapters((prev) =>
      prev.map((ch) => {
        if (ch.id !== chapterId) return ch;
        return {
          ...ch,
          lessons: ch.lessons.map((les) => {
            if (les.id !== lessonId) return les;
            const nextAtts = les.attachments.filter((a) => a.id !== attachmentId);
            return {
              ...les,
              isCompleted: nextAtts.length > 0,
              attachments: nextAtts,
            };
          }),
        };
      })
    );
    setHasUnsavedChanges(true);
    toast.success(t('notifications.attachment_deleted'));
  };

  // 10. Edit lesson title
  const handleStartEditLessonTitle = (lessonId: string, currentTitle: string) => {
    setEditingLessonId(lessonId);
    setEditingLessonTitle(currentTitle);
  };

  const handleSaveLessonTitle = (chapterId: string, lessonId: string) => {
    if (!editingLessonTitle.trim()) return;
    setRichChapters((prev) =>
      prev.map((ch) => {
        if (ch.id !== chapterId) return ch;
        return {
          ...ch,
          lessons: ch.lessons.map((l) =>
            l.id === lessonId ? { ...l, title: editingLessonTitle.trim() } : l
          ),
        };
      })
    );
    setEditingLessonId(null);
    setHasUnsavedChanges(true);
    toast.success(t('notifications.lesson_title_updated'));
  };

  return (
    <Card
      sx={{
        borderRadius: 2.5,
        p: { xs: 2.5, sm: 3.5 },
        bgcolor: '#FFFFFF',
        border: '1px solid #F1F3F5',
        boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.02)',
        mb: 3,
      }}
    >
      {/* ── Section Header with Prominent Save Button ─────────────────────── */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 2.5,
        }}
      >
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              bgcolor: '#F0F9FF',
              border: '1px solid #BAE6FD',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0284C7',
            }}
          >
            <Iconify icon="solar:folder-with-files-bold" width={24} />
          </Box>
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, color: '#1C252E', fontSize: 18 }}
              >
                {t('details.recorded_curriculum.title')}
              </Typography>
              {hasUnsavedChanges && (
                <Chip
                  label={t('details.recorded_curriculum.unsaved_changes')}
                  size="small"
                  sx={{
                    bgcolor: '#FEF3C7',
                    color: '#D97706',
                    fontWeight: 700,
                    fontSize: 11.5,
                    borderRadius: 1,
                  }}
                />
              )}
            </Stack>
            <Typography sx={{ color: '#64748B', fontSize: 13, mt: 0.2 }}>
              {t('details.recorded_curriculum.subtitle')}
            </Typography>
          </Box>
        </Stack>
      </Stack>

      <Divider sx={{ mb: 3.5, borderColor: '#F1F5F9' }} />

      <Stack spacing={3}>
        {/* ── 1. Add New Chapter Box ────────────────────────────────────────── */}
        <Box
          sx={{
            border: '1.5px solid #C6DCFC',
            borderRadius: 2.5,
            p: 2.5,
            bgcolor: '#FFFFFF',
          }}
        >
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: 15,
              color: '#1E293B',
              mb: 2,
            }}
          >
            {t('details.recorded_curriculum.add_chapter_title')}
          </Typography>

          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <TextField
              fullWidth
              size="small"
              placeholder={t('details.recorded_curriculum.chapter_placeholder')}
              value={newChapterTitle}
              onChange={(e) => setNewChapterTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddChapter();
                }
              }}
              sx={inputRootSx}
            />

            <Button
              variant="contained"
              onClick={handleAddChapter}
              disabled={!newChapterTitle.trim()}
              sx={{
                bgcolor: '#1C252E',
                color: '#FFFFFF',
                borderRadius: 1.5,
                px: 3,
                py: 1,
                fontWeight: 700,
                fontSize: 14,
                whiteSpace: 'nowrap',
                boxShadow: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 1.2,
                '&:hover': { bgcolor: '#2C353E' },
              }}
            >
              <Iconify icon="mingcute:add-line" width={18} />
              <span>{t('details.recorded_curriculum.add_chapter_btn')}</span>
            </Button>
          </Stack>
        </Box>

        {/* ── Empty State If Zero Chapters from Backend ─────────────────────── */}
        {richChapters.length === 0 && (
          <Box
            sx={{
              p: 4.5,
              textAlign: 'center',
              border: '1.5px dashed #CBD5E1',
              borderRadius: 2.5,
              bgcolor: '#F8FAFC',
            }}
          >
            <Iconify
              icon="solar:folder-open-bold"
              width={52}
              sx={{ color: '#94A3B8', mb: 1.5 }}
            />
            <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#334155', mb: 0.5 }}>
              {t('details.recorded_curriculum.empty_chapters_title')}
            </Typography>
            <Typography sx={{ fontSize: 13, color: '#64748B', maxWidth: 460, mx: 'auto' }}>
              {t('details.recorded_curriculum.empty_chapters_desc')}
            </Typography>
          </Box>
        )}

        {/* ── 2. Chapters Accordion List ────────────────────────────────────── */}
        {richChapters.map((chapter) => (
          <Box
            key={chapter.id}
            sx={{
              border: '1.5px solid #C6DCFC',
              borderRadius: 2.5,
              bgcolor: '#FFFFFF',
              overflow: 'hidden',
            }}
          >
            {/* Chapter Header */}
            <Box
              sx={{
                p: 2,
                px: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                bgcolor: chapter.isExpanded ? '#FAFBFD' : '#FFFFFF',
                transition: 'background-color 0.2s ease',
              }}
              onClick={() => handleToggleChapter(chapter.id)}
            >
              {/* Chapter Title & Lesson Count */}
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Iconify
                  icon={
                    chapter.isExpanded
                      ? 'solar:alt-arrow-down-linear'
                      : 'solar:alt-arrow-up-linear'
                  }
                  width={20}
                  sx={{ color: '#1E293B', transition: 'transform 0.2s ease' }}
                />
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: 15,
                    color: '#1E293B',
                  }}
                >
                  {chapter.number}. {chapter.title} :{' '}
                  <Box
                    component="span"
                    sx={{ color: '#64748B', fontWeight: 500, fontSize: 14 }}
                  >
                    {t('details.recorded_curriculum.lessons_count', { count: chapter.lessons.length })}
                  </Box>
                </Typography>
              </Stack>

              {/* Chapter Actions (Hours input & Delete) */}
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ alignItems: 'center' }}
                onClick={(e) => e.stopPropagation()}
              >
                <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center' }}>
                  <Typography sx={{ fontSize: 12.5, color: '#64748B', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {t('details.recorded_curriculum.hours_label')}
                  </Typography>
                  <TextField
                    type="number"
                    size="small"
                    slotProps={{
                      htmlInput: {
                        min: 1,
                        style: { textAlign: 'center', padding: '3px 6px', fontSize: 13 },
                      },
                    }}
                    value={chapter.hours || 1}
                    onChange={(e) => {
                      const val = Math.max(1, parseInt(e.target.value, 10) || 1);
                      setRichChapters((prev) =>
                        prev.map((c) => (c.id === chapter.id ? { ...c, hours: val } : c))
                      );
                      setHasUnsavedChanges(true);
                    }}
                    sx={{ width: 68, ...inputRootSx }}
                  />
                </Stack>

                {/* Delete Chapter Button */}
                <IconButton
                  size="small"
                  onClick={(e) => handleRequestDeleteChapter(chapter, e)}
                  sx={{
                    border: '1px solid #FECACA',
                    borderRadius: 1.5,
                    p: 0.75,
                    color: '#EF4444',
                    '&:hover': {
                      bgcolor: 'rgba(239, 68, 68, 0.08)',
                      borderColor: '#EF4444',
                    },
                  }}
                >
                  <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                </IconButton>
              </Stack>
            </Box>

            {/* Chapter Content (Lessons) */}
            {chapter.isExpanded && (
              <Box sx={{ p: 2.5, pt: 2, borderTop: '1px solid #E2E8F0' }}>
                {/* Add Lesson Row */}
                <Stack direction="row" spacing={1.5} sx={{ mb: 2.5, alignItems: 'center' }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder={t('details.recorded_curriculum.add_lesson_placeholder')}
                    value={lessonTitles[chapter.id] || ''}
                    onChange={(e) =>
                      setLessonTitles((prev) => ({
                        ...prev,
                        [chapter.id]: e.target.value,
                      }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddLesson(chapter.id);
                      }
                    }}
                    sx={inputRootSx}
                  />

                  <Button
                    variant="contained"
                    onClick={() => handleAddLesson(chapter.id)}
                    disabled={!lessonTitles[chapter.id]?.trim()}
                    sx={{
                      bgcolor: '#1C252E',
                      color: '#FFFFFF',
                      borderRadius: 1.5,
                      px: 3,
                      py: 1,
                      fontWeight: 700,
                      fontSize: 14,
                      whiteSpace: 'nowrap',
                      boxShadow: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.2,
                      '&:hover': { bgcolor: '#2C353E' },
                    }}
                  >
                    <Iconify icon="mingcute:add-line" width={18} />
                    <span>{t('details.recorded_curriculum.add_lesson_btn')}</span>
                  </Button>
                </Stack>

                {/* Lessons List */}
                <Stack spacing={2}>
                  {chapter.lessons.map((lesson) => {
                    const hasAttachments = lesson.attachments.length > 0;
                    const videoAtt = lesson.attachments.find((a) => a.type === 'video');
                    const pdfAtt = lesson.attachments.find((a) => a.type === 'pdf');
                    const quizAtt = lesson.attachments.find((a) => a.type === 'quiz');

                    return (
                      <Card
                        key={lesson.id}
                        variant="outlined"
                        sx={{
                          p: { xs: 2, sm: 2.5 },
                          borderRadius: 2.5,
                          bgcolor: '#FFFFFF',
                          borderColor: '#E2E8F0',
                          boxShadow: '0px 1px 4px rgba(0,0,0,0.02)',
                        }}
                      >
                        {/* Lesson Header */}
                        <Stack
                          direction="row"
                          sx={{
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            mb: hasAttachments ? 2 : 1.5,
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            {editingLessonId === lesson.id ? (
                              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.5 }}>
                                <TextField
                                  size="small"
                                  value={editingLessonTitle}
                                  onChange={(e) => setEditingLessonTitle(e.target.value)}
                                  sx={{ maxWidth: 300, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                                />
                                <Button
                                  size="small"
                                  variant="contained"
                                  onClick={() => handleSaveLessonTitle(chapter.id, lesson.id)}
                                  sx={{ bgcolor: '#1C252E', color: '#FFFFFF', borderRadius: 1.5 }}
                                >
                                  {t('details.recorded_curriculum.save')}
                                </Button>
                              </Stack>
                            ) : (
                              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 0.5, flexWrap: 'wrap', gap: 1 }}>
                                <Typography sx={{ fontSize: 14.5, fontWeight: 700, color: '#1E293B' }}>
                                  {lesson.number}. {lesson.title}
                                </Typography>
                                {lesson.isCompleted && (
                                  <Chip
                                    label={t('details.recorded_curriculum.content_completed', { count: lesson.attachments.length })}
                                    size="small"
                                    sx={{
                                      bgcolor: '#ECFDF5',
                                      color: '#10B981',
                                      fontWeight: 700,
                                      fontSize: 11.5,
                                      borderRadius: 1,
                                    }}
                                  />
                                )}
                              </Stack>
                            )}

                            {lesson.subtitle && (
                              <Typography sx={{ fontSize: 12.5, color: '#64748B', mt: 0.3 }}>
                                {lesson.subtitle}
                              </Typography>
                            )}
                          </Box>

                          {/* Lesson Header Actions */}
                          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                            {hasAttachments && (
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() =>
                                  handleStartEditLessonTitle(lesson.id, lesson.title)
                                }
                                sx={{
                                  borderColor: '#E2E8F0',
                                  color: '#64748B',
                                  borderRadius: 1.5,
                                  fontSize: 12,
                                  fontWeight: 600,
                                  px: 1.5,
                                  py: 0.4,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.8,
                                  '&:hover': { bgcolor: '#F8FAFC' },
                                }}
                              >
                                <Iconify icon="solar:pen-linear" width={14} />
                                <span>{t('details.recorded_curriculum.edit_title')}</span>
                              </Button>
                            )}

                            <IconButton
                              size="small"
                              onClick={() => handleRequestDeleteLesson(chapter, lesson)}
                              sx={{
                                border: '1px solid #FECACA',
                                borderRadius: 1.5,
                                p: 0.7,
                                color: '#EF4444',
                                '&:hover': {
                                  bgcolor: 'rgba(239, 68, 68, 0.08)',
                                  borderColor: '#EF4444',
                                },
                              }}
                            >
                              <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                            </IconButton>
                          </Stack>
                        </Stack>

                        {/* Lesson Attachments List */}
                        {hasAttachments && (
                          <Stack spacing={1.5} sx={{ mb: 2 }}>
                            {lesson.attachments.map((att) => {
                              const isVideo = att.type === 'video';
                              const isPdf = att.type === 'pdf';
                              const isQuiz = att.type === 'quiz';

                              return (
                                <Card
                                  key={att.id}
                                  variant="outlined"
                                  sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    bgcolor: '#F8FAFC',
                                    borderColor: '#E2E8F0',
                                  }}
                                >
                                  <Stack
                                    direction={{ xs: 'column', md: 'row' }}
                                    spacing={2}
                                    sx={{
                                      justifyContent: 'space-between',
                                      alignItems: { xs: 'flex-start', md: 'center' },
                                    }}
                                  >
                                    {/* Attachment Info */}
                                    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                                      <Box
                                        sx={{
                                          width: 40,
                                          height: 40,
                                          borderRadius: 2,
                                          bgcolor: isVideo ? '#EFF6FF' : isPdf ? '#FEF2F2' : '#ECFDF5',
                                          border: `1px solid ${isVideo ? '#BFDBFE' : isPdf ? '#FECACA' : '#BBF7D0'}`,
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                        }}
                                      >
                                        <Box
                                          component="img"
                                          src={
                                            isVideo
                                              ? '/icons/vedio.svg'
                                              : isPdf
                                              ? '/icons/file.svg'
                                              : '/icons/exam.svg'
                                          }
                                          alt={att.type}
                                          sx={{ width: 22, height: 22 }}
                                        />
                                      </Box>

                                      <Box>
                                        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.3, flexWrap: 'wrap', gap: 0.8 }}>
                                          <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#1E293B' }}>
                                            {att.title}
                                          </Typography>
                                          <Chip
                                            label={`${att.badgeText} ✓`}
                                            size="small"
                                            sx={{
                                              bgcolor: '#ECFDF5',
                                              color: '#10B981',
                                              fontWeight: 700,
                                              fontSize: 11,
                                              borderRadius: 1,
                                              height: 20,
                                            }}
                                          />
                                        </Stack>
                                        <Typography sx={{ fontSize: 12, color: '#64748B' }}>
                                          {att.metaText}
                                        </Typography>
                                      </Box>
                                    </Stack>

                                    {/* Attachment Actions */}
                                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                                      {isVideo && (
                                        <>
                                          <Button
                                            size="small"
                                            variant="contained"
                                            onClick={() => {
                                              setPreviewVideoTitle(att.title);
                                              setPreviewVideoUrl(att.url || null);
                                              setVideoPreviewOpen(true);
                                            }}
                                            sx={{
                                              bgcolor: '#1C252E',
                                              color: '#FFFFFF',
                                              borderRadius: 1.5,
                                              fontWeight: 700,
                                              fontSize: 12.5,
                                              px: 1.8,
                                              py: 0.6,
                                              boxShadow: 'none',
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: 1,
                                              '&:hover': { bgcolor: '#2C353E' },
                                            }}
                                          >
                                            <Iconify icon="solar:play-bold" width={15} />
                                            <span>{t('details.recorded_curriculum.preview_video')}</span>
                                          </Button>

                                          <Button
                                            size="small"
                                            variant="outlined"
                                            disabled={isUploading}
                                            onClick={() => handleTriggerVideoUpload(chapter.id, lesson.id)}
                                            sx={{
                                              borderColor: '#E2E8F0',
                                              color: '#475569',
                                              borderRadius: 1.5,
                                              fontWeight: 600,
                                              fontSize: 12.5,
                                              px: 1.5,
                                              py: 0.6,
                                              '&:hover': { bgcolor: '#E2E8F0' },
                                            }}
                                          >
                                            {isVideoUploading(lesson.id) ? (
                                              <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center' }}>
                                                <CircularProgress size={14} sx={{ color: 'inherit' }} />
                                                <span>{t('details.recorded_curriculum.uploading')}</span>
                                              </Stack>
                                            ) : (
                                              t('details.recorded_curriculum.replace')
                                            )}
                                          </Button>
                                        </>
                                      )}

                                      {isPdf && (
                                        <>
                                          <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={() => {
                                              if (att.url) {
                                                window.open(att.url, '_blank', 'noopener,noreferrer');
                                              } else {
                                                toast.warning(t('notifications.no_attachment_link'));
                                              }
                                            }}
                                            sx={{
                                              borderColor: '#E2E8F0',
                                              color: '#1C252E',
                                              borderRadius: 1.5,
                                              fontWeight: 600,
                                              fontSize: 12.5,
                                              px: 1.8,
                                              py: 0.6,
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: 1,
                                              '&:hover': { bgcolor: '#F8FAFC' },
                                            }}
                                          >
                                            <Iconify icon="solar:download-minimalistic-linear" width={16} />
                                            <span>{t('details.recorded_curriculum.download_view')}</span>
                                          </Button>

                                          <Button
                                            size="small"
                                            variant="outlined"
                                            disabled={isUploading}
                                            onClick={() => handleTriggerDocUpload(chapter.id, lesson.id)}
                                            sx={{
                                              borderColor: '#E2E8F0',
                                              color: '#475569',
                                              borderRadius: 1.5,
                                              fontWeight: 600,
                                              fontSize: 12.5,
                                              px: 1.5,
                                              py: 0.6,
                                              '&:hover': { bgcolor: '#E2E8F0' },
                                            }}
                                          >
                                            {isDocUploading(lesson.id) ? (
                                              <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center' }}>
                                                <CircularProgress size={14} sx={{ color: 'inherit' }} />
                                                <span>{t('details.recorded_curriculum.uploading')}</span>
                                              </Stack>
                                            ) : (
                                              t('details.recorded_curriculum.replace')
                                            )}
                                          </Button>
                                        </>
                                      )}

                                      {isQuiz && (
                                        <>
                                          <Button
                                            size="small"
                                            variant="contained"
                                            onClick={() => handleOpenQuizDialog(chapter.id, lesson.id, chapter.title)}
                                            sx={{
                                              bgcolor: '#1C252E',
                                              color: '#FFFFFF',
                                              borderRadius: 1.5,
                                              fontWeight: 700,
                                              fontSize: 12.5,
                                              px: 1.8,
                                              py: 0.6,
                                              boxShadow: 'none',
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: 1,
                                              '&:hover': { bgcolor: '#2C353E' },
                                            }}
                                          >
                                            <Box component="img" src="/icons/exam.svg" alt="exam" sx={{ width: 16, height: 16, filter: 'brightness(0) invert(1)' }} />
                                            <span>{t('details.recorded_curriculum.preview_edit_quiz', { count: att.questionsCount || 0 })}</span>
                                          </Button>

                                          <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={() => handleOpenQuizDialog(chapter.id, lesson.id, chapter.title)}
                                            sx={{
                                              borderColor: '#10B981',
                                              color: '#10B981',
                                              borderRadius: 1.5,
                                              fontWeight: 700,
                                              fontSize: 12.5,
                                              px: 1.5,
                                              py: 0.6,
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: 0.8,
                                              '&:hover': { bgcolor: '#ECFDF5' },
                                            }}
                                          >
                                            <Box component="img" src="/icons/exam.svg" alt="exam" sx={{ width: 15, height: 15 }} />
                                            <span>{t('details.recorded_curriculum.add_question')}</span>
                                          </Button>
                                        </>
                                      )}

                                      <IconButton
                                        size="small"
                                        onClick={() => handleDeleteAttachment(chapter.id, lesson.id, att.id)}
                                        sx={{
                                          border: '1px solid #FECACA',
                                          borderRadius: 1.5,
                                          p: 0.7,
                                          color: '#EF4444',
                                          '&:hover': { bgcolor: '#FEF2F2' },
                                        }}
                                      >
                                        <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                                      </IconButton>
                                    </Stack>
                                  </Stack>
                                </Card>
                              );
                            })}
                          </Stack>
                        )}

                        {/* Lesson Action Buttons (Matching /courses/new) */}
                        <Stack
                          direction={{ xs: 'column', sm: 'row' }}
                          spacing={1.5}
                          sx={{
                            pt: hasAttachments ? 1.5 : 0,
                            borderTop: hasAttachments ? '1px dashed #E2E8F0' : 'none',
                            justifyContent: 'space-between',
                            alignItems: { xs: 'flex-start', sm: 'center' },
                          }}
                        >
                          <Stack direction="row" spacing={1.2} sx={{ flexWrap: 'wrap', gap: 1 }}>
                            {/* Video Button */}
                            <Button
                              size="small"
                              variant={hasAttachments ? 'outlined' : 'contained'}
                              disabled={isUploading}
                              onClick={() => handleTriggerVideoUpload(chapter.id, lesson.id)}
                              sx={{
                                bgcolor: hasAttachments ? '#FFFFFF' : '#1C252E',
                                color: hasAttachments ? '#0284C7' : '#FFFFFF',
                                borderColor: hasAttachments ? '#BAE6FD' : 'transparent',
                                borderStyle: hasAttachments ? 'dashed' : 'solid',
                                borderRadius: 1.5,
                                fontWeight: 700,
                                fontSize: 12.5,
                                px: 1.8,
                                py: 0.6,
                                boxShadow: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                '&:hover': {
                                  bgcolor: hasAttachments ? '#F0F9FF' : '#2C353E',
                                  borderColor: '#0284C7',
                                },
                              }}
                            >
                              {isVideoUploading(lesson.id) ? (
                                <CircularProgress size={16} sx={{ color: 'inherit' }} />
                              ) : (
                                <Box
                                  component="img"
                                  src="/icons/vedio.svg"
                                  alt="video"
                                  sx={{
                                    width: 16,
                                    height: 16,
                                    ...(hasAttachments ? {} : { filter: 'brightness(0) invert(1)' }),
                                  }}
                                />
                              )}
                              <span>
                                {isVideoUploading(lesson.id)
                                  ? t('details.recorded_curriculum.uploading_video')
                                  : hasAttachments
                                  ? t('details.recorded_curriculum.extra_video')
                                  : t('details.recorded_curriculum.upload_video')}
                              </span>
                            </Button>

                            {/* Document Button */}
                            <Button
                              size="small"
                              variant={hasAttachments ? 'outlined' : 'contained'}
                              disabled={isUploading}
                              onClick={() => handleTriggerDocUpload(chapter.id, lesson.id)}
                              sx={{
                                bgcolor: hasAttachments ? '#FFFFFF' : '#1C252E',
                                color: hasAttachments ? '#E11D48' : '#FFFFFF',
                                borderColor: hasAttachments ? '#FECDD3' : 'transparent',
                                borderStyle: hasAttachments ? 'dashed' : 'solid',
                                borderRadius: 1.5,
                                fontWeight: 700,
                                fontSize: 12.5,
                                px: 1.8,
                                py: 0.6,
                                boxShadow: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                '&:hover': {
                                  bgcolor: hasAttachments ? '#FFF1F2' : '#2C353E',
                                  borderColor: '#E11D48',
                                },
                              }}
                            >
                              {isDocUploading(lesson.id) ? (
                                <CircularProgress size={16} sx={{ color: 'inherit' }} />
                              ) : (
                                <Box
                                  component="img"
                                  src="/icons/file.svg"
                                  alt="file"
                                  sx={{
                                    width: 16,
                                    height: 16,
                                    ...(hasAttachments ? {} : { filter: 'brightness(0) invert(1)' }),
                                  }}
                                />
                              )}
                              <span>
                                {isDocUploading(lesson.id)
                                  ? t('details.recorded_curriculum.uploading_doc')
                                  : hasAttachments
                                  ? t('details.recorded_curriculum.extra_doc')
                                  : t('details.recorded_curriculum.upload_doc')}
                              </span>
                            </Button>

                            {/* Quiz Button */}
                            <Button
                              size="small"
                              variant={hasAttachments ? 'outlined' : 'contained'}
                              disabled={isUploading}
                              onClick={() => handleOpenQuizDialog(chapter.id, lesson.id, chapter.title)}
                              sx={{
                                bgcolor: hasAttachments ? '#FFFFFF' : '#1C252E',
                                color: hasAttachments ? '#16A34A' : '#FFFFFF',
                                borderColor: hasAttachments ? '#BBF7D0' : 'transparent',
                                borderStyle: hasAttachments ? 'dashed' : 'solid',
                                borderRadius: 1.5,
                                fontWeight: 700,
                                fontSize: 12.5,
                                px: 1.8,
                                py: 0.6,
                                boxShadow: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                '&:hover': {
                                  bgcolor: hasAttachments ? '#F0FDF4' : '#2C353E',
                                  borderColor: '#16A34A',
                                },
                              }}
                            >
                              <Box
                                component="img"
                                src="/icons/exam.svg"
                                alt="exam"
                                sx={{
                                  width: 16,
                                  height: 16,
                                  ...(hasAttachments ? {} : { filter: 'brightness(0) invert(1)' }),
                                }}
                              />
                              <span>{hasAttachments ? t('details.recorded_curriculum.extra_quiz') : t('details.recorded_curriculum.add_quiz')}</span>
                            </Button>
                          </Stack>

                          {hasAttachments && (
                            <Typography sx={{ fontSize: 11.5, color: '#94A3B8' }}>
                              {t('details.recorded_curriculum.content_attached_success')}
                            </Typography>
                          )}
                        </Stack>
                      </Card>
                    );
                  })}
                </Stack>
              </Box>
            )}
          </Box>
        ))}

        {/* ── Bottom Save Action When Chapters Exist ──────────────────────── */}
        {richChapters.length > 0 && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              borderRadius: 2,
              bgcolor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <Iconify icon="solar:info-circle-bold" width={20} sx={{ color: '#0284C7' }} />
              <Typography sx={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>
                {t('details.recorded_curriculum.total_summary', {
                  chapters: richChapters.length,
                  lessons: richChapters.reduce((acc, c) => acc + c.lessons.length, 0),
                })}
              </Typography>
            </Stack>

            <Button
              variant="contained"
              onClick={handleSaveCurriculum}
              disabled={isSaving}
              startIcon={
                isSaving ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <Iconify icon="solar:diskette-bold" width={20} />
                )
              }
              sx={{
                bgcolor: '#1C252E',
                color: '#FFFFFF',
                borderRadius: 1.75,
                px: 3,
                py: 1,
                fontWeight: 700,
                fontSize: 14,
                boxShadow: 'none',
                '&:hover': { bgcolor: '#2C353E' },
              }}
            >
              {isSaving ? t('details.recorded_curriculum.saving_curriculum') : t('details.recorded_curriculum.save_curriculum')}
            </Button>
          </Box>
        )}
      </Stack>

      {/* ── Hidden File Inputs for Video & Doc Uploads ──────────────────── */}
      <input
        type="file"
        ref={videoFileInputRef}
        style={{ display: 'none' }}
        accept="video/*"
        onChange={handleVideoFileSelected}
      />
      <input
        type="file"
        ref={docFileInputRef}
        style={{ display: 'none' }}
        accept=".pdf,.doc,.docx"
        onChange={handleDocFileSelected}
      />




      {/* ── 4. Quiz Dialog Modal - Matches /courses/new QuizDialog ───────── */}
      <QuizDialog
        key={quizLessonId ?? 'closed'}
        open={quizDialogOpen}
        onClose={() => {
          setQuizDialogOpen(false);
          setQuizLessonId(null);
        }}
        chapterTitle={activeChapterForQuiz}
        initialQuiz={
          quizLessonId
            ? richChapters
                .flatMap((ch) => ch.lessons)
                .find((l) => l.id === quizLessonId)
                ?.attachments.find((a) => a.type === 'quiz')?.quiz ?? null
            : null
        }
        onSave={handleSaveQuiz}
      />

      {/* ── 5. Video Preview Dialog Modal ─────────────────────────────────── */}
      <Dialog
        open={videoPreviewOpen}
        onClose={() => setVideoPreviewOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: { sx: { borderRadius: 2.5, bgcolor: '#0F172A', color: '#FFFFFF' } },
        }}
      >
        <DialogTitle
          sx={{
            px: 2.5,
            pt: 2,
            pb: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#F8FAFC' }}>
            {previewVideoTitle}
          </Typography>
          <IconButton onClick={() => setVideoPreviewOpen(false)} sx={{ color: '#94A3B8' }}>
            <Iconify icon="eva:close-fill" width={20} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 2.5, py: 2 }}>
          {previewVideoUrl ? (
            <Box
              component="video"
              controls
              src={previewVideoUrl}
              sx={{
                width: '100%',
                maxHeight: 480,
                borderRadius: 2,
                bgcolor: '#000000',
              }}
            />
          ) : (
            <Box
              sx={{
                height: 280,
                bgcolor: '#1E293B',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography sx={{ color: '#94A3B8', fontSize: 14 }}>
                {t('details.recorded_curriculum.no_video_link')}
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 2.5, pb: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setVideoPreviewOpen(false)}
            sx={{ color: '#F8FAFC', borderColor: '#334155' }}
          >
            {t('details.recorded_curriculum.close')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── 6. Confirm Delete Chapter Dialog ─────────────────────────────────── */}
      <ConfirmationDialog
        open={Boolean(chapterToDelete)}
        onClose={() => !isDeletingChapter && setChapterToDelete(null)}
        onConfirm={handleConfirmDeleteChapter}
        variant="warning"
        title={
          chapterToDelete?.title
            ? t('details.recorded_curriculum.confirm_delete_chapter_named', { name: chapterToDelete.title })
            : t('details.recorded_curriculum.confirm_delete_chapter')
        }
        confirmLabel={isDeletingChapter ? t('details.recorded_curriculum.deleting') : t('details.recorded_curriculum.delete')}
        cancelLabel={t('details.recorded_curriculum.cancel')}
        cancelVariant="gray"
      />

      {/* ── 7. Confirm Delete Lesson Dialog ──────────────────────────────────── */}
      <ConfirmationDialog
        open={Boolean(lessonToDelete)}
        onClose={() => !isDeletingLesson && setLessonToDelete(null)}
        onConfirm={handleConfirmDeleteLesson}
        variant="warning"
        title={
          lessonToDelete?.lessonTitle
            ? t('details.recorded_curriculum.confirm_delete_lesson_named', { name: lessonToDelete.lessonTitle })
            : t('details.recorded_curriculum.confirm_delete_lesson')
        }
        confirmLabel={isDeletingLesson ? t('details.recorded_curriculum.deleting') : t('details.recorded_curriculum.delete')}
        cancelLabel={t('details.recorded_curriculum.cancel')}
        cancelVariant="gray"
      />
    </Card>
  );
}
