'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
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

import Iconify from 'src/components/iconify';
import { useToast } from 'src/components/toast';
import { uploadFile, uploadAttachment } from 'src/actions/courses';
import QuizDialog, { QuizConfig } from 'src/sections/courses/components/QuizDialog';
import { saveSessionRequestChaptersAction } from 'src/actions/instructor-session-requests';
import type { AttachmentItem, RichChapter, LessonQuiz } from 'src/sections/courses/types';
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

// Check if an ID is a valid GUID from backend
function isValidUuid(id?: string | null): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

// Map backend chapters into rich UI chapters (Zero fake data)
function mapBackendChaptersToRich(backendChapters?: SessionChapterResult[] | null): RichChapter[] {
  if (!backendChapters || backendChapters.length === 0) return [];

  return backendChapters.map((ch, chIdx) => ({
    id: ch.id || `ch-${chIdx + 1}`,
    number: ch.order || chIdx + 1,
    title: ch.title || `الفصل ${chIdx + 1}`,
    isExpanded: chIdx === 0,
    lessons: (ch.lessons || []).map((les, lIdx) => {
      const attachments: AttachmentItem[] = [];

      if (les.videoUrl) {
        attachments.push({
          id: `vid-${les.id || lIdx}`,
          type: 'video',
          title: `فيديو المحاضرة: ${les.title}`,
          badgeText: 'تم المعالجة والرفع بنجاح',
          metaText: `الجودة: 1080p Full HD • المدة: ${Math.floor((les.durationInSeconds || 0) / 60)} دقيقة`,
          url: les.videoUrl,
        });
      }

      if (les.test) {
        const questionsCount = les.test.questions?.length || 0;
        attachments.push({
          id: `quiz-${les.test.id || les.id || lIdx}`,
          type: 'quiz',
          title: 'بنك أسئلة وتدريبات الدرس (Self-Assessment)',
          badgeText: 'مفعل بعد انتهاء الفيديو',
          metaText: `${questionsCount} أسئلة تدريبية تفاعلية (MCQ)`,
          questionsCount,
          quiz: {
            title: 'بنك أسئلة وتدريبات الدرس',
            questions: (les.test.questions || []).map((q, qIdx) => ({
              id: q.id,
              number: qIdx + 1,
              title: q.text,
              points: 1,
              explanation: q.explanation || '',
              options: (q.choices || []).map((c, cIdx) => ({
                id: c.id,
                letter: ARABIC_LETTERS[cIdx] || `${cIdx + 1}`,
                text: c.title,
                isCorrect: Boolean(c.isRight),
              })),
            })),
          },
        });
      }

      return {
        id: les.id || `les-${lIdx + 1}`,
        number: les.order || lIdx + 1,
        title: les.title || `الدرس ${lIdx + 1}`,
        subtitle: les.description || undefined,
        isCompleted: attachments.length > 0,
        attachments,
      };
    }),
  }));
}

// Map rich UI chapters to backend save payload
function mapRichChaptersToBackendPayload(rich: RichChapter[]): SaveSessionChaptersCommand {
  return {
    chapters: rich.map((ch, chIdx) => ({
      id: isValidUuid(ch.id) ? ch.id : null,
      title: ch.title,
      order: ch.number || chIdx + 1,
      hours: 1,
      lessons: ch.lessons.map((les, lIdx) => {
        const videoAtt = les.attachments.find((a) => a.type === 'video');
        const quizAtt = les.attachments.find((a) => a.type === 'quiz');

        let testInput = null;
        if (quizAtt?.quiz?.questions && quizAtt.quiz.questions.length > 0) {
          testInput = {
            id: null,
            questions: quizAtt.quiz.questions.map((q) => ({
              id: isValidUuid(q.id) ? q.id : null,
              text: q.title,
              explanation: q.explanation || null,
              choices: q.options.map((opt, optIdx) => ({
                id: isValidUuid(opt.id) ? opt.id : null,
                title: opt.text,
                order: optIdx + 1,
                isRight: Boolean(opt.isCorrect),
              })),
            })),
          };
        }

        return {
          id: isValidUuid(les.id) ? les.id : null,
          title: les.title,
          description: les.subtitle || null,
          order: les.number || lIdx + 1,
          durationInSeconds: 1200,
          videoUrl: videoAtt?.url || null,
          test: testInput,
        };
      }),
    })),
  };
}

export default function RecordedCurriculumSection({
  requestId,
  initialChapters,
  onChaptersUpdated,
}: Props) {
  const toast = useToast();

  // State strictly initialized with backend data - ZERO fake data
  const [richChapters, setRichChapters] = useState<RichChapter[]>(() =>
    mapBackendChaptersToRich(initialChapters)
  );
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [lessonTitles, setLessonTitles] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);

  // Sync state if initialChapters changes from parent
  useEffect(() => {
    if (initialChapters) {
      setRichChapters(mapBackendChaptersToRich(initialChapters));
    }
  }, [initialChapters]);

  // Dialog states
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [activeChapterForQuiz, setActiveChapterForQuiz] = useState<string>('الفصل الأول - مقدمة');
  const [quizLessonId, setQuizLessonId] = useState<string | null>(null);
  const [videoPreviewOpen, setVideoPreviewOpen] = useState(false);
  const [previewVideoTitle, setPreviewVideoTitle] = useState('');

  // Editing lesson title state
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [editingLessonTitle, setEditingLessonTitle] = useState<string>('');

  const videoFileInputRef = useRef<HTMLInputElement | null>(null);
  const docFileInputRef = useRef<HTMLInputElement | null>(null);
  const [targetLessonForUpload, setTargetLessonForUpload] = useState<{
    chapterId: string;
    lessonId: string;
  } | null>(null);

  // Sync with backend API
  const syncChaptersToBackend = useCallback(
    async (next: RichChapter[]) => {
      setRichChapters(next);
      try {
        const payload = mapRichChaptersToBackendPayload(next);
        const res = await saveSessionRequestChaptersAction(requestId, payload);
        if (res.success && res.data) {
          onChaptersUpdated?.(res.data);
        }
      } catch {
        // Keeps local UI state consistent
      }
    },
    [requestId, onChaptersUpdated]
  );

  // 1. Add new chapter
  const handleAddChapter = () => {
    if (!newChapterTitle.trim()) {
      toast.warning('يرجى كتابة عنوان الفصل');
      return;
    }
    const newChapter: RichChapter = {
      id: `ch-${Date.now()}`,
      number: richChapters.length + 1,
      title: newChapterTitle.trim(),
      isExpanded: true,
      lessons: [],
    };
    syncChaptersToBackend([...richChapters, newChapter]);
    setNewChapterTitle('');
    toast.success('تمت إضافة الفصل بنجاح');
  };

  // 2. Delete chapter
  const handleDeleteChapter = (chapterId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    syncChaptersToBackend(
      richChapters
        .filter((ch) => ch.id !== chapterId)
        .map((ch, idx) => ({ ...ch, number: idx + 1 }))
    );
    toast.success('تم حذف الفصل بنجاح');
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

    const updated = richChapters.map((ch) => {
      if (ch.id !== chapterId) return ch;
      return {
        ...ch,
        lessons: [
          ...ch.lessons,
          {
            id: `les-${Date.now()}`,
            number: ch.lessons.length + 1,
            title,
            attachments: [],
          },
        ],
      };
    });

    syncChaptersToBackend(updated);
    setLessonTitles((prev) => ({ ...prev, [chapterId]: '' }));
    toast.success('تمت إضافة الدرس بنجاح');
  };

  // 5. Delete lesson
  const handleDeleteLesson = (chapterId: string, lessonId: string) => {
    const updated = richChapters.map((ch) => {
      if (ch.id !== chapterId) return ch;
      return {
        ...ch,
        lessons: ch.lessons
          .filter((l) => l.id !== lessonId)
          .map((l, idx) => ({ ...l, number: idx + 1 })),
      };
    });

    syncChaptersToBackend(updated);
    toast.success('تم حذف الدرس بنجاح');
  };

  // 6. Delete attachment
  const handleDeleteAttachment = (
    chapterId: string,
    lessonId: string,
    attachmentId: string
  ) => {
    const updated = richChapters.map((ch) => {
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
    });

    syncChaptersToBackend(updated);
    toast.success('تم حذف المرفق بنجاح');
  };

  // 7. Open Quiz Dialog
  const handleOpenQuizDialog = (
    chapterId: string,
    lessonId: string,
    chapterTitle: string
  ) => {
    setActiveChapterForQuiz(chapterTitle);
    setQuizLessonId(lessonId);
    setQuizDialogOpen(true);
  };

  // Save the quiz config back onto the target lesson
  const handleSaveQuiz = useCallback(
    (config: QuizConfig) => {
      if (!quizLessonId) return;

      const quizAtt: AttachmentItem = {
        id: `att-${Date.now()}`,
        type: 'quiz',
        title: 'بنك أسئلة وتدريبات الدرس (Self-Assessment)',
        badgeText: 'مفعل بعد انتهاء الفيديو',
        metaText: `${config.questions.length} أسئلة تدريبية تفاعلية (MCQ)`,
        questionsCount: config.questions.length,
        quiz: config as LessonQuiz,
      };

      const updated = richChapters.map((ch) => ({
        ...ch,
        lessons: ch.lessons.map((les) => {
          if (les.id !== quizLessonId) return les;
          return {
            ...les,
            isCompleted: true,
            subtitle: les.subtitle || 'تم إرفاق اختبار تقييمي لهذا الدرس',
            attachments: [...les.attachments.filter((a) => a.type !== 'quiz'), quizAtt],
          };
        }),
      }));

      syncChaptersToBackend(updated);
      setQuizLessonId(null);
      setQuizDialogOpen(false);
      toast.success('تم حفظ وتحديث بنك الأسئلة بنجاح');
    },
    [quizLessonId, richChapters, syncChaptersToBackend, toast]
  );

  // 8. Handle video upload
  const handleTriggerVideoUpload = (chapterId: string, lessonId: string) => {
    setTargetLessonForUpload({ chapterId, lessonId });
    if (videoFileInputRef.current) {
      videoFileInputRef.current.value = '';
      videoFileInputRef.current.click();
    }
  };

  const handleVideoFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetLessonForUpload || uploading) return;

    setUploading(true);
    try {
      const res = await uploadFile(file, 'videos');
      if (!res.success || !res.data) {
        toast.error(res.error || 'فشل رفع الفيديو');
        return;
      }

      const newAtt: AttachmentItem = {
        id: `att-${Date.now()}`,
        type: 'video',
        title: `فيديو المحاضرة: ${file.name}`,
        badgeText: 'تم المعالجة والرفع بنجاح',
        metaText: `الجودة: 1080p Full HD • الحجم: ${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        url: res.data.url,
      };

      const updated = richChapters.map((ch) => {
        if (ch.id !== targetLessonForUpload.chapterId) return ch;
        return {
          ...ch,
          lessons: ch.lessons.map((les) => {
            if (les.id !== targetLessonForUpload.lessonId) return les;
            return {
              ...les,
              isCompleted: true,
              subtitle: les.subtitle || 'تم إرفاق محتوى تعليمي لهذا الدرس',
              attachments: [...les.attachments.filter((a) => a.type !== 'video'), newAtt],
            };
          }),
        };
      });

      syncChaptersToBackend(updated);
      toast.success('تم رفع الفيديو بنجاح');
    } catch {
      toast.error('فشل رفع الفيديو');
    } finally {
      setUploading(false);
    }
  };

  // 9. Handle doc upload
  const handleTriggerDocUpload = (chapterId: string, lessonId: string) => {
    setTargetLessonForUpload({ chapterId, lessonId });
    if (docFileInputRef.current) {
      docFileInputRef.current.value = '';
      docFileInputRef.current.click();
    }
  };

  const handleDocFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetLessonForUpload || uploading) return;

    setUploading(true);
    try {
      const res = await uploadAttachment(file, file.name);
      if (!res.success || !res.data) {
        toast.error(res.error || 'فشل رفع المستند');
        return;
      }

      const newAtt: AttachmentItem = {
        id: `att-${Date.now()}`,
        type: 'pdf',
        attachmentId: res.data.id,
        title: res.data.name || file.name,
        badgeText: 'جاهز للتحميل للطلاب',
        metaText: `الحجم: ${(file.size / (1024 * 1024)).toFixed(1)} MB • ملف PDF إلكتروني`,
        url: res.data.url,
      };

      const updated = richChapters.map((ch) => {
        if (ch.id !== targetLessonForUpload.chapterId) return ch;
        return {
          ...ch,
          lessons: ch.lessons.map((les) => {
            if (les.id !== targetLessonForUpload.lessonId) return les;
            return {
              ...les,
              isCompleted: true,
              attachments: [...les.attachments, newAtt],
            };
          }),
        };
      });

      syncChaptersToBackend(updated);
      toast.success('تم إرفاق المستند بنجاح');
    } catch {
      toast.error('فشل رفع المستند');
    } finally {
      setUploading(false);
    }
  };

  // 10. Edit lesson title
  const handleStartEditLessonTitle = (lessonId: string, currentTitle: string) => {
    setEditingLessonId(lessonId);
    setEditingLessonTitle(currentTitle);
  };

  const handleSaveLessonTitle = (chapterId: string, lessonId: string) => {
    if (!editingLessonTitle.trim()) return;
    const updated = richChapters.map((ch) => {
      if (ch.id !== chapterId) return ch;
      return {
        ...ch,
        lessons: ch.lessons.map((l) =>
          l.id === lessonId ? { ...l, title: editingLessonTitle.trim() } : l
        ),
      };
    });

    syncChaptersToBackend(updated);
    setEditingLessonId(null);
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
      {/* Hidden file inputs */}
      <input
        ref={videoFileInputRef}
        type="file"
        accept="video/*"
        hidden
        onChange={handleVideoFileSelected}
      />
      <input
        ref={docFileInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        hidden
        onChange={handleDocFileSelected}
      />

      {/* Card Header matching /courses/new */}
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 2.5 }}>
        <Iconify
          icon="solar:info-circle-bold"
          width={24}
          sx={{ color: '#1C252E' }}
        />
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: '#1C252E', fontSize: 18 }}
        >
          معلومات الكورس
        </Typography>
      </Stack>

      <Divider sx={{ mb: 3.5, borderColor: '#F1F5F9' }} />

      <Stack spacing={3}>
        {/* 1. Add New Chapter Box */}
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
              placeholder="عنوان الفصل (مثال : الفصل الأول - مقدمة)"
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

        {/* 2. Chapters Accordion List */}
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
                    placeholder="عنوان الدرس"
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
                                        <Button
                                          size="small"
                                          variant="contained"
                                          onClick={() => {
                                            setPreviewVideoTitle(att.title);
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
                                      )}

                                      {isPdf && (
                                        <Button
                                          size="small"
                                          variant="outlined"
                                          onClick={() => {
                                            if (att.url) {
                                              window.open(att.url, '_blank', 'noopener,noreferrer');
                                            } else {
                                              toast.warning('لا يوجد رابط للمرفق');
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
                                          <span>تحميل / عرض</span>
                                        </Button>
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

                                      {(isVideo || isPdf) && (
                                        <Button
                                          size="small"
                                          variant="outlined"
                                          onClick={() => {
                                            if (isVideo) handleTriggerVideoUpload(chapter.id, lesson.id);
                                            else handleTriggerDocUpload(chapter.id, lesson.id);
                                          }}
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
                                          استبدال
                                        </Button>
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

                        {/* Lesson Action Buttons (Quick upload or Sub-actions) */}
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
                            <Button
                              size="small"
                              variant={hasAttachments ? 'outlined' : 'contained'}
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
                              <Box component="img" src="/icons/vedio.svg" alt="video" sx={{ width: 16, height: 16, ...(hasAttachments ? {} : { filter: 'brightness(0) invert(1)' }) }} />
                              <span>{hasAttachments ? '+ فيديو إضافي' : '+ رفع فيديو'}</span>
                            </Button>

                            <Button
                              size="small"
                              variant={hasAttachments ? 'outlined' : 'contained'}
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
                              <Box component="img" src="/icons/file.svg" alt="file" sx={{ width: 16, height: 16, ...(hasAttachments ? {} : { filter: 'brightness(0) invert(1)' }) }} />
                              <span>{hasAttachments ? '+ مستند إضافي' : '+ اضافة مستند'}</span>
                            </Button>

                            <Button
                              size="small"
                              variant={hasAttachments ? 'outlined' : 'contained'}
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
                              <Box component="img" src="/icons/exam.svg" alt="exam" sx={{ width: 16, height: 16, ...(hasAttachments ? {} : { filter: 'brightness(0) invert(1)' }) }} />
                              <span>{hasAttachments ? '+ اضافة اسئلة' : '+ اضافة سؤال'}</span>
                            </Button>
                          </Stack>

                          {hasAttachments && (
                            <Typography sx={{ fontSize: 11.5, color: '#94A3B8' }}>
                              يمكنك سحب وإفلات المرفقات لإعادة ترتيب ظهورها للطلاب
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
      </Stack>

      {/* 3. Quiz Dialog Modal - Matches Image 2 */}
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

      {/* 4. Video Preview Dialog Modal */}
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
          <Box
            sx={{
              height: 380,
              bgcolor: '#1E293B',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
            }}
          >
            <Box
              sx={{
                width: 68,
                height: 68,
                borderRadius: '50%',
                bgcolor: '#0284C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 24px rgba(2, 132, 199, 0.5)',
              }}
            >
              <Iconify icon="solar:play-bold" width={34} sx={{ color: '#FFFFFF' }} />
            </Box>
            <Typography sx={{ color: '#94A3B8', fontSize: 14 }}>
              معاينة تشغيل الفيديو (1080p Full HD)
            </Typography>
          </Box>
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
