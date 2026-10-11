'use client';

import React, { useState, useCallback, useEffect } from 'react';
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

import Iconify from 'src/components/iconify';
import { useToast } from 'src/components/toast';
import QuizDialog, { QuizConfig } from 'src/sections/courses/components/QuizDialog';
import { saveSessionRequestChaptersAction } from 'src/actions/instructor-session-requests';
import type { LessonQuiz } from 'src/sections/courses/types';
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

// Check if an ID is a valid GUID
function isValidUuid(id?: string | null): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

// Guarantee a valid GUID: keep existing if valid, otherwise generate a new RFC4122 UUID
function ensureUuid(id?: string | null): string {
  if (isValidUuid(id)) return id!;
  return crypto.randomUUID();
}

// Extract embed URL for video preview (YouTube, Vimeo, etc.)
function getEmbedUrl(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const ytMatch = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  );
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return null;
}

// Internal UI types - strictly video and quiz attachments, zero mock data
export interface CurriculumAttachmentItem {
  id: string;
  type: 'video' | 'quiz';
  title: string;
  badgeText: string;
  metaText: string;
  questionsCount?: number;
  url?: string;
  durationInSeconds?: number;
  quiz?: LessonQuiz;
}

export interface CurriculumLesson {
  id: string;
  number: number;
  title: string;
  subtitle?: string;
  isCompleted?: boolean;
  attachments: CurriculumAttachmentItem[];
}

export interface CurriculumChapter {
  id: string;
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

  return backendChapters.map((ch, chIdx) => ({
    id: ensureUuid(ch.id),
    number: ch.order || chIdx + 1,
    title: ch.title || `الفصل ${chIdx + 1}`,
    hours: ch.hours || 1,
    isExpanded: chIdx === 0,
    lessons: (ch.lessons || []).map((les, lIdx) => {
      const attachments: CurriculumAttachmentItem[] = [];

      if (les.videoUrl) {
        const durationMin = Math.max(1, Math.round((les.durationInSeconds || 0) / 60));
        attachments.push({
          id: ensureUuid(les.id ? `vid-${les.id}` : null),
          type: 'video',
          title: `فيديو المحاضرة: ${les.title}`,
          badgeText: 'تم الربط بنجاح',
          metaText: `المدة: ${durationMin} دقيقة • رابط الفيديو`,
          url: les.videoUrl,
          durationInSeconds: les.durationInSeconds || durationMin * 60,
        });
      }

      if (les.test && les.test.questions && les.test.questions.length > 0) {
        const questionsCount = les.test.questions.length;
        attachments.push({
          id: ensureUuid(les.test.id),
          type: 'quiz',
          title: 'بنك أسئلة وتدريبات الدرس (Self-Assessment)',
          badgeText: 'مفعل بعد انتهاء الفيديو',
          metaText: `${questionsCount} أسئلة تدريبية تفاعلية (MCQ)`,
          questionsCount,
          quiz: {
            title: 'بنك أسئلة وتدريبات الدرس',
            questions: les.test.questions.map((q, qIdx) => ({
              id: ensureUuid(q.id),
              number: qIdx + 1,
              title: q.text,
              points: 1,
              explanation: q.explanation || '',
              options: (q.choices || []).map((c, cIdx) => ({
                id: ensureUuid(c.id),
                letter: ARABIC_LETTERS[cIdx] || `${cIdx + 1}`,
                text: c.title,
                isCorrect: Boolean(c.isRight),
              })),
            })),
          },
        });
      }

      return {
        id: ensureUuid(les.id),
        number: les.order || lIdx + 1,
        title: les.title || `الدرس ${lIdx + 1}`,
        subtitle: les.description || undefined,
        isCompleted: attachments.length > 0,
        attachments,
      };
    }),
  }));
}

// Map rich UI chapters into exact backend Save payload with guaranteed RFC4122 GUIDs
function mapRichChaptersToBackendPayload(
  rich: CurriculumChapter[]
): SaveSessionChaptersCommand {
  return {
    chapters: rich.map((ch, chIdx) => {
      const chapterId = ensureUuid(ch.id);

      const lessons = ch.lessons.map((les, lIdx) => {
        const lessonId = ensureUuid(les.id);
        const videoAtt = les.attachments.find((a) => a.type === 'video');
        const quizAtt = les.attachments.find((a) => a.type === 'quiz');

        let testInput = null;
        if (quizAtt?.quiz?.questions && quizAtt.quiz.questions.length > 0) {
          testInput = {
            id: ensureUuid(quizAtt.quiz.questions[0]?.id ? `test-${lessonId}` : null),
            questions: quizAtt.quiz.questions.map((q) => ({
              id: ensureUuid(q.id),
              text: q.title || '',
              explanation: q.explanation || null,
              choices: q.options.map((opt, optIdx) => ({
                id: ensureUuid(opt.id),
                title: opt.text || '',
                order: optIdx + 1,
                isRight: Boolean(opt.isCorrect),
              })),
            })),
          };
        }

        const durationSeconds = Number(videoAtt?.durationInSeconds) || 1200;

        return {
          id: lessonId,
          title: les.title.trim(),
          description: les.subtitle?.trim() || null,
          order: les.number || lIdx + 1,
          durationInSeconds: durationSeconds,
          videoUrl: videoAtt?.url?.trim() || null,
          test: testInput,
        };
      });

      // Chapter hours: at least 1 or calculated from lesson durations
      const totalSeconds = lessons.reduce(
        (acc, l) => acc + (Number(l.durationInSeconds) || 0),
        0
      );
      const chapterHours = Math.max(1, Math.round(totalSeconds / 3600) || 1);

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

  // State strictly initialized with backend data - ZERO fake data
  const [richChapters, setRichChapters] = useState<CurriculumChapter[]>(() =>
    mapBackendChaptersToRich(initialChapters)
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [lessonTitles, setLessonTitles] = useState<Record<string, string>>({});

  // Sync state if initialChapters changes from parent
  useEffect(() => {
    if (initialChapters) {
      setRichChapters(mapBackendChaptersToRich(initialChapters));
      setHasUnsavedChanges(false);
    }
  }, [initialChapters]);

  // Quiz Dialog state
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [activeChapterForQuiz, setActiveChapterForQuiz] = useState<string>('');
  const [quizLessonId, setQuizLessonId] = useState<string | null>(null);

  // Video Link Dialog state (Backend expects videoUrl + durationInSeconds)
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoModalTarget, setVideoModalTarget] = useState<{
    chapterId: string;
    lessonId: string;
    lessonTitle: string;
    existingAttachmentId?: string;
  } | null>(null);
  const [videoModalUrl, setVideoModalUrl] = useState('');
  const [videoModalMinutes, setVideoModalMinutes] = useState<number>(20);

  // Video Preview Dialog state
  const [videoPreviewOpen, setVideoPreviewOpen] = useState(false);
  const [previewVideoTitle, setPreviewVideoTitle] = useState('');
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);

  // Editing lesson title state
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [editingLessonTitle, setEditingLessonTitle] = useState<string>('');

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
      }
    }

    setIsSaving(true);
    try {
      const payload = mapRichChaptersToBackendPayload(richChapters);
      const res = await saveSessionRequestChaptersAction(requestId, payload);

      if (res.success && res.data) {
        toast.success('تم حفظ واعتماد المنهج في النظام بنجاح');
        setHasUnsavedChanges(false);
        const mappedFromBackend = mapBackendChaptersToRich(res.data);
        setRichChapters(mappedFromBackend);
        onChaptersUpdated?.(res.data);
      } else {
        toast.error(res.error || 'فشل حفظ المنهج في النظام، يرجى المحاولة مرة أخرى');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ غير متوقع أثناء حفظ المنهج');
    } finally {
      setIsSaving(false);
    }
  };

  // 1. Add new chapter
  const handleAddChapter = () => {
    if (!newChapterTitle.trim()) {
      toast.warning('يرجى كتابة عنوان الفصل');
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
    toast.success('تمت إضافة الفصل محلياً. لا تنسَ الضغط على "حفظ المنهج" لتثبيته في النظام.');
  };

  // 2. Delete chapter
  const handleDeleteChapter = (chapterId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setRichChapters((prev) =>
      prev
        .filter((ch) => ch.id !== chapterId)
        .map((ch, idx) => ({ ...ch, number: idx + 1 }))
    );
    setHasUnsavedChanges(true);
    toast.info('تم حذف الفصل محلياً');
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
      toast.warning('يرجى كتابة عنوان الدرس');
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
    toast.success('تمت إضافة الدرس محلياً');
  };

  // 5. Delete lesson
  const handleDeleteLesson = (chapterId: string, lessonId: string) => {
    setRichChapters((prev) =>
      prev.map((ch) => {
        if (ch.id !== chapterId) return ch;
        return {
          ...ch,
          lessons: ch.lessons
            .filter((les) => les.id !== lessonId)
            .map((les, idx) => ({ ...les, number: idx + 1 })),
        };
      })
    );
    setHasUnsavedChanges(true);
    toast.info('تم حذف الدرس');
  };

  // 6. Delete attachment
  const handleDeleteAttachment = (
    chapterId: string,
    lessonId: string,
    attachmentId: string
  ) => {
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
    toast.info('تم حذف المرفق');
  };

  // 7. Video Link Dialog Handlers
  const handleOpenVideoModal = (
    chapterId: string,
    lessonId: string,
    lessonTitle: string,
    existingAtt?: CurriculumAttachmentItem
  ) => {
    setVideoModalTarget({
      chapterId,
      lessonId,
      lessonTitle,
      existingAttachmentId: existingAtt?.id,
    });
    setVideoModalUrl(existingAtt?.url || '');
    setVideoModalMinutes(
      existingAtt?.durationInSeconds
        ? Math.max(1, Math.round(existingAtt.durationInSeconds / 60))
        : 20
    );
    setVideoModalOpen(true);
  };

  const handleSaveVideoModal = () => {
    if (!videoModalTarget) return;
    const url = videoModalUrl.trim();
    if (!url) {
      toast.warning('يرجى إدخال رابط الفيديو');
      return;
    }

    const durationMinutes = Number(videoModalMinutes) > 0 ? Number(videoModalMinutes) : 15;
    const durationInSeconds = durationMinutes * 60;

    const newVideoAtt: CurriculumAttachmentItem = {
      id: videoModalTarget.existingAttachmentId || crypto.randomUUID(),
      type: 'video',
      title: `فيديو المحاضرة: ${videoModalTarget.lessonTitle}`,
      badgeText: 'تم الربط بنجاح',
      metaText: `المدة: ${durationMinutes} دقيقة • رابط الفيديو`,
      url,
      durationInSeconds,
    };

    setRichChapters((prev) =>
      prev.map((ch) => {
        if (ch.id !== videoModalTarget.chapterId) return ch;
        return {
          ...ch,
          lessons: ch.lessons.map((les) => {
            if (les.id !== videoModalTarget.lessonId) return les;
            const otherAtts = les.attachments.filter((a) => a.type !== 'video');
            return {
              ...les,
              isCompleted: true,
              subtitle: les.subtitle || 'تم ربط فيديو الشرح للمحاضرة',
              attachments: [...otherAtts, newVideoAtt],
            };
          }),
        };
      })
    );

    setVideoModalOpen(false);
    setVideoModalTarget(null);
    setHasUnsavedChanges(true);
    toast.success('تم ربط رابط الفيديو بالدرس محلياً');
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

      const mappedQuestions = config.questions.map((q, qIdx) => ({
        id: ensureUuid(q.id),
        number: qIdx + 1,
        title: q.title,
        points: q.points || 1,
        explanation: q.explanation || '',
        options: q.options.map((opt, optIdx) => ({
          id: ensureUuid(opt.id),
          letter: ARABIC_LETTERS[optIdx] || `${optIdx + 1}`,
          text: opt.text,
          isCorrect: Boolean(opt.isCorrect),
        })),
      }));

      const quizData: LessonQuiz = {
        title: config.title || 'بنك أسئلة وتدريبات الدرس',
        questions: mappedQuestions,
      };

      const quizAtt: CurriculumAttachmentItem = {
        id: crypto.randomUUID(),
        type: 'quiz',
        title: 'بنك أسئلة وتدريبات الدرس (Self-Assessment)',
        badgeText: 'مفعل بعد انتهاء الفيديو',
        metaText: `${mappedQuestions.length} أسئلة تدريبية تفاعلية (MCQ)`,
        questionsCount: mappedQuestions.length,
        quiz: quizData,
      };

      setRichChapters((prev) =>
        prev.map((ch) => ({
          ...ch,
          lessons: ch.lessons.map((les) => {
            if (les.id !== quizLessonId) return les;
            return {
              ...les,
              isCompleted: true,
              subtitle: les.subtitle || 'تم إرفاق اختبار تقييمي لهذا الدرس',
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
      toast.success('تم حفظ وتحديث بنك الأسئلة محلياً');
    },
    [quizLessonId, toast]
  );

  // 9. Edit lesson title
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
    toast.success('تم تعديل عنوان الدرس');
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
                منهج ومحتوى الجلسات المسجلة
              </Typography>
              {hasUnsavedChanges && (
                <Chip
                  label="توجد تعديلات غير محفوظة"
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
              قم بإعداد الفصول والدروس وإرفاق روابط الفيديوهات وبنوك الأسئلة، ثم اضغط حفظ لاعتماد المنهج.
            </Typography>
          </Box>
        </Stack>

        {/* Prominent Save Button */}
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
            px: 2.8,
            py: 1.1,
            fontWeight: 700,
            fontSize: 14,
            boxShadow: 'none',
            whiteSpace: 'nowrap',
            '&:hover': { bgcolor: '#2C353E' },
          }}
        >
          {isSaving ? 'جاري الحفظ في النظام...' : 'حفظ المنهج في النظام'}
        </Button>
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
            إضافة فصل جديد
          </Typography>

          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="اكتب عنوان الفصل الجديد هنا..."
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
              <span>إضافة فصل</span>
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
              لا توجد فصول مضافة بعد لهذا الطلب
            </Typography>
            <Typography sx={{ fontSize: 13, color: '#64748B', maxWidth: 460, mx: 'auto' }}>
              لم يتم إنشاء أي محتوى دراسي بعد. يمكنك البدء فوراً بكتابة عنوان الفصل الأول في الحقل أعلاه والضغط على "إضافة فصل".
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
                    ({chapter.lessons.length} دروس)
                  </Box>
                </Typography>
              </Stack>

              {/* Delete Chapter Button */}
              <IconButton
                size="small"
                onClick={(e) => handleDeleteChapter(chapter.id, e)}
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
            </Box>

            {/* Chapter Content (Lessons) */}
            {chapter.isExpanded && (
              <Box sx={{ p: 2.5, pt: 2, borderTop: '1px solid #E2E8F0' }}>
                {/* Add Lesson Row */}
                <Stack direction="row" spacing={1.5} sx={{ mb: 2.5, alignItems: 'center' }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="اكتب عنوان الدرس الجديد..."
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
                    <span>إضافة درس</span>
                  </Button>
                </Stack>

                {/* Lessons List */}
                <Stack spacing={2}>
                  {chapter.lessons.map((lesson) => {
                    const hasAttachments = lesson.attachments.length > 0;
                    const videoAtt = lesson.attachments.find((a) => a.type === 'video');
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
                                  حفظ
                                </Button>
                              </Stack>
                            ) : (
                              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 0.5, flexWrap: 'wrap', gap: 1 }}>
                                <Typography sx={{ fontSize: 14.5, fontWeight: 700, color: '#1E293B' }}>
                                  {lesson.number}. {lesson.title}
                                </Typography>
                                {lesson.isCompleted && (
                                  <Chip
                                    label={`مكتمل المحتوى (${lesson.attachments.length} مرفقات)`}
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
                                <span>تعديل العنوان</span>
                              </Button>
                            )}

                            <IconButton
                              size="small"
                              onClick={() => handleDeleteLesson(chapter.id, lesson.id)}
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
                                          bgcolor: isVideo ? '#EFF6FF' : '#ECFDF5',
                                          border: `1px solid ${isVideo ? '#BFDBFE' : '#BBF7D0'}`,
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                        }}
                                      >
                                        <Box
                                          component="img"
                                          src={isVideo ? '/icons/vedio.svg' : '/icons/exam.svg'}
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
                                            <span>معاينة الفيديو</span>
                                          </Button>

                                          <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={() =>
                                              handleOpenVideoModal(
                                                chapter.id,
                                                lesson.id,
                                                lesson.title,
                                                att
                                              )
                                            }
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
                                            تعديل الرابط
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
                                            <span>معاينة وتعديل الأسئلة ({att.questionsCount || 0})</span>
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
                                            <span>+ إضافة سؤال</span>
                                          </Button>
                                        </>
                                      )}

                                      <IconButton
                                        size="small"
                                        onClick={() =>
                                          handleDeleteAttachment(chapter.id, lesson.id, att.id)
                                        }
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

                        {/* Lesson Action Buttons (Exact /courses/new style without document upload) */}
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
                              variant={videoAtt ? 'outlined' : 'contained'}
                              onClick={() =>
                                handleOpenVideoModal(
                                  chapter.id,
                                  lesson.id,
                                  lesson.title,
                                  videoAtt
                                )
                              }
                              sx={{
                                bgcolor: videoAtt ? '#FFFFFF' : '#1C252E',
                                color: videoAtt ? '#0284C7' : '#FFFFFF',
                                borderColor: videoAtt ? '#BAE6FD' : 'transparent',
                                borderStyle: videoAtt ? 'dashed' : 'solid',
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
                                  bgcolor: videoAtt ? '#F0F9FF' : '#2C353E',
                                  borderColor: '#0284C7',
                                },
                              }}
                            >
                              <Box
                                component="img"
                                src="/icons/vedio.svg"
                                alt="video"
                                sx={{
                                  width: 16,
                                  height: 16,
                                  ...(videoAtt ? {} : { filter: 'brightness(0) invert(1)' }),
                                }}
                              />
                              <span>{videoAtt ? 'تعديل رابط الفيديو' : '+ إضافة رابط الفيديو'}</span>
                            </Button>

                            {/* Quiz Button */}
                            <Button
                              size="small"
                              variant={quizAtt ? 'outlined' : 'contained'}
                              onClick={() => handleOpenQuizDialog(chapter.id, lesson.id, chapter.title)}
                              sx={{
                                bgcolor: quizAtt ? '#FFFFFF' : '#1C252E',
                                color: quizAtt ? '#16A34A' : '#FFFFFF',
                                borderColor: quizAtt ? '#BBF7D0' : 'transparent',
                                borderStyle: quizAtt ? 'dashed' : 'solid',
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
                                  bgcolor: quizAtt ? '#F0FDF4' : '#2C353E',
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
                                  ...(quizAtt ? {} : { filter: 'brightness(0) invert(1)' }),
                                }}
                              />
                              <span>{quizAtt ? 'معاينة بنك الأسئلة' : '+ بنك أسئلة وتدريبات'}</span>
                            </Button>
                          </Stack>

                          {hasAttachments && (
                            <Typography sx={{ fontSize: 11.5, color: '#94A3B8' }}>
                              تم ربط المحتوى التعليمي للدرس بنجاح
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
                إجمالي الفصول المجهزة: {richChapters.length} • إجمالي الدروس:{' '}
                {richChapters.reduce((acc, c) => acc + c.lessons.length, 0)}
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
              {isSaving ? 'جاري الحفظ في النظام...' : 'حفظ واعتماد المنهج في النظام'}
            </Button>
          </Box>
        )}
      </Stack>

      {/* ── 3. Video Link Modal (Backend-compatible videoUrl + durationInSeconds) ── */}
      <Dialog
        open={videoModalOpen}
        onClose={() => setVideoModalOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: { sx: { borderRadius: 2.5, p: 1 } },
        }}
      >
        <DialogTitle sx={{ px: 2.5, pt: 2, pb: 1 }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.5,
                bgcolor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box component="img" src="/icons/vedio.svg" alt="video" sx={{ width: 20, height: 20 }} />
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, fontSize: 16, color: '#1C252E' }}>
                ربط رابط فيديو الدرس
              </Typography>
              <Typography sx={{ fontSize: 12.5, color: '#64748B' }}>
                {videoModalTarget?.lessonTitle}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ px: 2.5, py: 2 }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#1E293B', mb: 1 }}>
                رابط الفيديو (Video URL) *
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="https://www.youtube.com/watch?v=... أو https://vimeo.com/..."
                value={videoModalUrl}
                onChange={(e) => setVideoModalUrl(e.target.value)}
                sx={inputRootSx}
                helperText="أدخل رابط الفيديو المباشر أو من منصات مثل YouTube أو Vimeo أو Cloudflare"
              />
            </Box>

            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#1E293B', mb: 1 }}>
                مدة المحاضرة (بالدقائق) *
              </Typography>
              <TextField
                fullWidth
                type="number"
                size="small"
                placeholder="20"
                value={videoModalMinutes}
                onChange={(e) => setVideoModalMinutes(Math.max(1, Number(e.target.value)))}
                sx={inputRootSx}
                helperText="يتم تحويل الدقائق تلقائياً إلى ثوانٍ للتوافق مع الباك إند"
              />
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 2.5, pb: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setVideoModalOpen(false)}
            sx={{ borderRadius: 1.5, borderColor: '#CBD5E1', color: '#64748B' }}
          >
            إلغاء
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveVideoModal}
            disabled={!videoModalUrl.trim()}
            sx={{
              bgcolor: '#1C252E',
              color: '#FFFFFF',
              borderRadius: 1.5,
              fontWeight: 700,
              px: 3,
              '&:hover': { bgcolor: '#2C353E' },
            }}
          >
            تأكيد وربط الفيديو
          </Button>
        </DialogActions>
      </Dialog>

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
          {getEmbedUrl(previewVideoUrl) ? (
            <Box
              component="iframe"
              src={getEmbedUrl(previewVideoUrl)!}
              title={previewVideoTitle}
              sx={{
                width: '100%',
                height: 400,
                border: 'none',
                borderRadius: 2,
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : previewVideoUrl ? (
            <Box
              sx={{
                minHeight: 280,
                bgcolor: '#1E293B',
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 3,
                gap: 2,
                textAlign: 'center',
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  bgcolor: '#0284C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 24px rgba(2, 132, 199, 0.5)',
                }}
              >
                <Iconify icon="solar:link-bold" width={32} sx={{ color: '#FFFFFF' }} />
              </Box>
              <Typography sx={{ color: '#F8FAFC', fontSize: 15, fontWeight: 600 }}>
                رابط الفيديو المربوط:
              </Typography>
              <Typography
                sx={{
                  color: '#38BDF8',
                  fontSize: 13,
                  wordBreak: 'break-all',
                  maxWidth: 600,
                  bgcolor: '#0F172A',
                  p: 1.5,
                  borderRadius: 1.5,
                  border: '1px solid #334155',
                }}
              >
                {previewVideoUrl}
              </Typography>
              <Button
                variant="contained"
                onClick={() => window.open(previewVideoUrl, '_blank', 'noopener,noreferrer')}
                startIcon={<Iconify icon="solar:square-top-down-bold" width={18} />}
                sx={{ bgcolor: '#0284C7', color: '#FFFFFF', borderRadius: 1.5, mt: 1 }}
              >
                فتح رابط الفيديو في نافذة جديدة
              </Button>
            </Box>
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
                لا يوجد رابط مسجل لهذا الفيديو
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
            إغلاق
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
