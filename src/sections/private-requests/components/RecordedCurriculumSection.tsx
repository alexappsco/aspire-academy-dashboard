'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Collapse from '@mui/material/Collapse';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import InputAdornment from '@mui/material/InputAdornment';

import Iconify from 'src/components/iconify';
import { useToast } from 'src/components/toast';
import { uploadFile } from 'src/actions/courses';
import { saveSessionRequestChaptersAction } from 'src/actions/instructor-session-requests';
import {
  SessionChapterResult,
  SessionLessonResult,
  SessionLessonTestResult,
  SessionLessonQuestionResult,
  SessionLessonQuestionChoiceResult,
  SaveSessionChaptersCommand,
} from 'src/types/private-request';

interface Props {
  requestId: string;
  initialChapters?: SessionChapterResult[] | null;
  onChaptersUpdated?: (updatedChapters: SessionChapterResult[]) => void;
}

// Generate temp UUID for newly created items
function generateTempId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Check if an ID is a valid GUID from backend
function isValidUuid(id?: string | null): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

// Embed URL helper for YouTube/Vimeo
function getEmbedUrl(url: string): string | null {
  if (!url) return null;
  if (url.includes('youtube.com/watch?v=')) {
    return url.replace('youtube.com/watch?v=', 'youtube.com/embed/');
  }
  if (url.includes('youtu.be/')) {
    const id = url.split('/').pop()?.split('?')[0];
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }
  if (url.includes('vimeo.com/') && !url.includes('player.vimeo.com')) {
    const id = url.split('/').pop()?.split('?')[0];
    return id ? `https://player.vimeo.com/video/${id}` : null;
  }
  return null;
}

export default function RecordedCurriculumSection({
  requestId,
  initialChapters,
  onChaptersUpdated,
}: Props) {
  const toast = useToast();

  // Local state holding the list of chapters and their lessons
  const [chapters, setChapters] = useState<(SessionChapterResult & { isExpanded?: boolean })[]>(
    () => (initialChapters || []).map((ch, idx) => ({ ...ch, isExpanded: idx === 0 }))
  );

  // Sync when initialChapters changes from parent
  useEffect(() => {
    if (initialChapters && initialChapters.length > 0) {
      setChapters((prev) =>
        initialChapters.map((ch, idx) => ({
          ...ch,
          isExpanded: prev.find((p) => p.id === ch.id)?.isExpanded ?? idx === 0,
        }))
      );
    }
  }, [initialChapters]);

  // Saving to backend state
  const [isSaving, setIsSaving] = useState(false);

  // -------------------------------------------------------------
  // 1. Chapter Dialog States (Add / Edit)
  // -------------------------------------------------------------
  const [chapterDialogOpen, setChapterDialogOpen] = useState(false);
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [chapterTitleInput, setChapterTitleInput] = useState('');
  const [chapterHoursInput, setChapterHoursInput] = useState<number | string>(1);

  const handleOpenAddChapter = () => {
    setEditingChapterId(null);
    setChapterTitleInput(`الفصل ${chapters.length + 1} - `);
    setChapterHoursInput(1);
    setChapterDialogOpen(true);
  };

  const handleOpenEditChapter = (chapter: SessionChapterResult) => {
    setEditingChapterId(chapter.id);
    setChapterTitleInput(chapter.title || '');
    setChapterHoursInput(chapter.hours ?? 1);
    setChapterDialogOpen(true);
  };

  const handleSaveChapter = () => {
    if (!chapterTitleInput.trim()) {
      toast.warning('يرجى كتابة عنوان الفصل');
      return;
    }

    const hours = Number(chapterHoursInput) || 0;

    if (editingChapterId) {
      // Editing existing chapter
      setChapters((prev) =>
        prev.map((ch) =>
          ch.id === editingChapterId
            ? { ...ch, title: chapterTitleInput.trim(), hours }
            : ch
        )
      );
      toast.success('تم تعديل بيانات الفصل بنجاح');
    } else {
      // Creating new chapter
      const newOrder = chapters.length + 1;
      const newChapter: SessionChapterResult & { isExpanded?: boolean } = {
        id: generateTempId(),
        title: chapterTitleInput.trim(),
        order: newOrder,
        hours,
        lessons: [],
        isExpanded: true,
      };
      setChapters((prev) => [...prev, newChapter]);
      toast.success('تمت إضافة الفصل الجديد بنجاح');
    }

    setChapterDialogOpen(false);
  };

  const handleToggleChapter = (chapterId: string) => {
    setChapters((prev) =>
      prev.map((ch) => (ch.id === chapterId ? { ...ch, isExpanded: !ch.isExpanded } : ch))
    );
  };

  // -------------------------------------------------------------
  // 2. Lesson Dialog States (Add / Edit)
  // -------------------------------------------------------------
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [targetChapterIdForLesson, setTargetChapterIdForLesson] = useState<string | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [lessonTitleInput, setLessonTitleInput] = useState('');
  const [lessonDescriptionInput, setLessonDescriptionInput] = useState('');
  const [lessonDurationInput, setLessonDurationInput] = useState<number | string>(20);

  const handleOpenAddLesson = (chapterId: string) => {
    const ch = chapters.find((c) => c.id === chapterId);
    const order = (ch?.lessons?.length || 0) + 1;
    setTargetChapterIdForLesson(chapterId);
    setEditingLessonId(null);
    setLessonTitleInput(`الدرس ${order}: `);
    setLessonDescriptionInput('');
    setLessonDurationInput(20);
    setLessonDialogOpen(true);
  };

  const handleOpenEditLesson = (chapterId: string, lesson: SessionLessonResult) => {
    setTargetChapterIdForLesson(chapterId);
    setEditingLessonId(lesson.id);
    setLessonTitleInput(lesson.title || '');
    setLessonDescriptionInput(lesson.description || '');
    setLessonDurationInput(Math.round((lesson.durationInSeconds || 0) / 60) || 20);
    setLessonDialogOpen(true);
  };

  const handleSaveLesson = () => {
    if (!lessonTitleInput.trim() || !targetChapterIdForLesson) {
      toast.warning('يرجى إدخال عنوان الدرس');
      return;
    }

    const durationSeconds = (Number(lessonDurationInput) || 0) * 60;

    if (editingLessonId) {
      setChapters((prev) =>
        prev.map((ch) =>
          ch.id === targetChapterIdForLesson
            ? {
                ...ch,
                lessons: (ch.lessons || []).map((l) =>
                  l.id === editingLessonId
                    ? {
                        ...l,
                        title: lessonTitleInput.trim(),
                        description: lessonDescriptionInput.trim() || null,
                        durationInSeconds: durationSeconds,
                      }
                    : l
                ),
              }
            : ch
        )
      );
      toast.success('تم تحديث بيانات الدرس بنجاح');
    } else {
      const targetChapter = chapters.find((c) => c.id === targetChapterIdForLesson);
      const newOrder = (targetChapter?.lessons?.length || 0) + 1;
      const newLesson: SessionLessonResult = {
        id: generateTempId(),
        title: lessonTitleInput.trim(),
        description: lessonDescriptionInput.trim() || null,
        order: newOrder,
        durationInSeconds: durationSeconds,
        videoUrl: null,
        test: null,
        creationTime: new Date().toISOString(),
      };

      setChapters((prev) =>
        prev.map((ch) =>
          ch.id === targetChapterIdForLesson
            ? { ...ch, isExpanded: true, lessons: [...(ch.lessons || []), newLesson] }
            : ch
        )
      );
      toast.success('تمت إضافة الدرس بنجاح، يمكنك الآن إرفاق الفيديو وبنك الأسئلة');
    }

    setLessonDialogOpen(false);
  };

  // -------------------------------------------------------------
  // 3. Video Upload / Link Dialog States
  // -------------------------------------------------------------
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [videoTarget, setVideoTarget] = useState<{ chapterId: string; lessonId: string } | null>(null);
  const [videoTab, setVideoTab] = useState<'url' | 'upload'>('url');
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [videoDurationMinutes, setVideoDurationMinutes] = useState<number | string>(25);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleOpenVideoDialog = (chapterId: string, lesson: SessionLessonResult) => {
    setVideoTarget({ chapterId, lessonId: lesson.id });
    setVideoUrlInput(lesson.videoUrl || '');
    setVideoDurationMinutes(Math.round((lesson.durationInSeconds || 0) / 60) || 25);
    setVideoTab(lesson.videoUrl ? 'url' : 'upload');
    setVideoDialogOpen(true);
  };

  const handleUploadVideoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingVideo(true);
    try {
      const res = await uploadFile(file, 'private-requests');
      if (res.success && res.data?.url) {
        setVideoUrlInput(res.data.url);
        toast.success('تم رفع ملف الفيديو بنجاح');
      } else {
        toast.error(res.error || 'فشل في رفع ملف الفيديو');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ أثناء الرفع');
    } finally {
      setIsUploadingVideo(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveVideo = () => {
    if (!videoTarget) return;
    if (!videoUrlInput.trim()) {
      toast.warning('يرجى تحديد أو إدخال رابط الفيديو');
      return;
    }

    const durationSeconds = (Number(videoDurationMinutes) || 0) * 60;

    setChapters((prev) =>
      prev.map((ch) =>
        ch.id === videoTarget.chapterId
          ? {
              ...ch,
              lessons: (ch.lessons || []).map((les) =>
                les.id === videoTarget.lessonId
                  ? {
                      ...les,
                      videoUrl: videoUrlInput.trim(),
                      durationInSeconds: durationSeconds || les.durationInSeconds,
                    }
                  : les
              ),
            }
          : ch
      )
    );

    toast.success('تم حفظ وتحديث فيديو الدرس بنجاح');
    setVideoDialogOpen(false);
  };

  const handleDeleteVideo = (chapterId: string, lessonId: string) => {
    setChapters((prev) =>
      prev.map((ch) =>
        ch.id === chapterId
          ? {
              ...ch,
              lessons: (ch.lessons || []).map((les) =>
                les.id === lessonId ? { ...les, videoUrl: null } : les
              ),
            }
          : ch
      )
    );
    toast.success('تم حذف الفيديو من الدرس');
  };

  // Video Preview Dialog State
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  const handleOpenPreview = (title: string, url: string) => {
    setPreviewTitle(title);
    setPreviewUrl(url);
    setPreviewOpen(true);
  };

  // -------------------------------------------------------------
  // 4. Test / Quiz Editor Dialog States
  // -------------------------------------------------------------
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [testTarget, setTestTarget] = useState<{ chapterId: string; lessonId: string } | null>(null);
  const [testQuestions, setTestQuestions] = useState<SessionLessonQuestionResult[]>([]);

  const handleOpenTestEditor = (chapterId: string, lesson: SessionLessonResult) => {
    setTestTarget({ chapterId, lessonId: lesson.id });
    const existingQuestions = lesson.test?.questions || [];

    if (existingQuestions.length > 0) {
      setTestQuestions(JSON.parse(JSON.stringify(existingQuestions)));
    } else {
      // Initialize with one default question
      setTestQuestions([
        {
          id: generateTempId(),
          text: '',
          explanation: '',
          choices: [
            { id: generateTempId(), title: '', order: 1, isRight: true },
            { id: generateTempId(), title: '', order: 2, isRight: false },
          ],
        },
      ]);
    }
    setTestDialogOpen(true);
  };

  const handleAddQuestion = () => {
    setTestQuestions((prev) => [
      ...prev,
      {
        id: generateTempId(),
        text: '',
        explanation: '',
        choices: [
          { id: generateTempId(), title: '', order: 1, isRight: true },
          { id: generateTempId(), title: '', order: 2, isRight: false },
        ],
      },
    ]);
  };

  const handleDeleteQuestion = (qIndex: number) => {
    setTestQuestions((prev) => prev.filter((_, idx) => idx !== qIndex));
  };

  const handleAddChoice = (qIndex: number) => {
    setTestQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== qIndex) return q;
        const newOrder = (q.choices?.length || 0) + 1;
        return {
          ...q,
          choices: [
            ...(q.choices || []),
            { id: generateTempId(), title: '', order: newOrder, isRight: false },
          ],
        };
      })
    );
  };

  const handleDeleteChoice = (qIndex: number, cIndex: number) => {
    setTestQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== qIndex) return q;
        const remaining = (q.choices || []).filter((_, ci) => ci !== cIndex);
        // Ensure at least one choice is marked right if we deleted the right one
        if (remaining.length > 0 && !remaining.some((c) => c.isRight)) {
          remaining[0].isRight = true;
        }
        return { ...q, choices: remaining };
      })
    );
  };

  const handleSetCorrectChoice = (qIndex: number, cIndex: number) => {
    setTestQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== qIndex) return q;
        return {
          ...q,
          choices: (q.choices || []).map((c, ci) => ({
            ...c,
            isRight: ci === cIndex,
          })),
        };
      })
    );
  };

  const handleSaveTest = () => {
    if (!testTarget) return;

    // Validate that questions have text and at least 2 choices
    for (let i = 0; i < testQuestions.length; i++) {
      const q = testQuestions[i];
      if (!q.text.trim()) {
        toast.warning(`يرجى كتابة نص السؤال رقم ${i + 1}`);
        return;
      }
      if (!q.choices || q.choices.length < 2) {
        toast.warning(`يجب إضافة خيارين على الأقل للسؤال رقم ${i + 1}`);
        return;
      }
      if (q.choices.some((c) => !c.title.trim())) {
        toast.warning(`يرجى إدخال نصوص جميع الخيارات في السؤال رقم ${i + 1}`);
        return;
      }
      if (!q.choices.some((c) => c.isRight)) {
        toast.warning(`يرجى تحديد الإجابة الصحيحة للسؤال رقم ${i + 1}`);
        return;
      }
    }

    const testObject: SessionLessonTestResult = {
      id: generateTempId(),
      questions: testQuestions,
    };

    setChapters((prev) =>
      prev.map((ch) =>
        ch.id === testTarget.chapterId
          ? {
              ...ch,
              lessons: (ch.lessons || []).map((les) =>
                les.id === testTarget.lessonId ? { ...les, test: testObject } : les
              ),
            }
          : ch
      )
    );

    toast.success(`تم حفظ بنك الأسئلة (${testQuestions.length} أسئلة) بنجاح`);
    setTestDialogOpen(false);
  };

  const handleDeleteTest = (chapterId: string, lessonId: string) => {
    setChapters((prev) =>
      prev.map((ch) =>
        ch.id === chapterId
          ? {
              ...ch,
              lessons: (ch.lessons || []).map((les) =>
                les.id === lessonId ? { ...les, test: null } : les
              ),
            }
          : ch
      )
    );
    toast.success('تم حذف بنك الأسئلة من الدرس');
  };

  // -------------------------------------------------------------
  // 5. Delete Confirm Dialog (Chapters & Lessons)
  // -------------------------------------------------------------
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: 'chapter' | 'lesson';
    chapterId: string;
    lessonId?: string;
    title: string;
  }>({
    open: false,
    type: 'chapter',
    chapterId: '',
    title: '',
  });

  const handleConfirmDelete = () => {
    if (deleteDialog.type === 'chapter') {
      setChapters((prev) => prev.filter((ch) => ch.id !== deleteDialog.chapterId));
      toast.success('تم حذف الفصل بنجاح');
    } else if (deleteDialog.type === 'lesson' && deleteDialog.lessonId) {
      setChapters((prev) =>
        prev.map((ch) =>
          ch.id === deleteDialog.chapterId
            ? {
                ...ch,
                lessons: (ch.lessons || []).filter((l) => l.id !== deleteDialog.lessonId),
              }
            : ch
        )
      );
      toast.success('تم حذف الدرس بنجاح');
    }
    setDeleteDialog((prev) => ({ ...prev, open: false }));
  };

  // -------------------------------------------------------------
  // 6. Save Chapters to Backend (PUT Endpoint)
  // -------------------------------------------------------------
  const handleSaveToBackend = async () => {
    if (!requestId) {
      toast.error('معرف الطلب غير متوفر');
      return;
    }

    setIsSaving(true);
    try {
      const payload: SaveSessionChaptersCommand = {
        chapters: chapters.map((ch, chIdx) => ({
          id: isValidUuid(ch.id) ? ch.id : null,
          title: ch.title,
          order: ch.order || chIdx + 1,
          hours: Number(ch.hours) || 0,
          lessons: (ch.lessons || []).map((les, lIdx) => ({
            id: isValidUuid(les.id) ? les.id : null,
            title: les.title,
            description: les.description || '',
            order: les.order || lIdx + 1,
            durationInSeconds: Number(les.durationInSeconds) || 0,
            videoUrl: les.videoUrl || null,
            test:
              les.test && les.test.questions && les.test.questions.length > 0
                ? {
                    id: isValidUuid(les.test.id) ? les.test.id : null,
                    questions: les.test.questions.map((q) => ({
                      id: isValidUuid(q.id) ? q.id : null,
                      text: q.text,
                      explanation: q.explanation || '',
                      choices: (q.choices || []).map((c, cIdx) => ({
                        id: isValidUuid(c.id) ? c.id : null,
                        title: c.title,
                        order: c.order || cIdx + 1,
                        isRight: Boolean(c.isRight),
                      })),
                    })),
                  }
                : null,
          })),
        })),
      };

      const res = await saveSessionRequestChaptersAction(requestId, payload);

      if (res.success && res.data) {
        toast.success('تم حفظ واعتماد الفصول والدروس المسجلة في النظام بنجاح!');
        setChapters(res.data.map((ch, idx) => ({ ...ch, isExpanded: idx === 0 })));
        onChaptersUpdated?.(res.data);
      } else {
        toast.error(res.error || 'فشل في حفظ المنهج الدراسي');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ أثناء حفظ التعديلات');
    } finally {
      setIsSaving(false);
    }
  };

  // Calculations for summary stats
  const totalHours = useMemo(
    () => chapters.reduce((acc, ch) => acc + (Number(ch.hours) || 0), 0),
    [chapters]
  );
  const totalLessons = useMemo(
    () => chapters.reduce((acc, ch) => acc + (ch.lessons?.length || 0), 0),
    [chapters]
  );

  return (
    <Box sx={{ mb: 3 }}>
      {/* 1. Header Toolbar Card */}
      <Card
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: 3,
          bgcolor: '#FFFFFF',
          border: '1px solid #F1F5F9',
          boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
          mb: 2.5,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'flex-start', md: 'center' },
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          {/* Right in RTL: Title & Badges */}
          <Box sx={{ textAlign: 'start' }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', gap: 1.25, mb: 1, flexWrap: 'wrap' }}>
              <Iconify icon="solar:book-bookmark-bold" width={22} sx={{ color: '#0D9488' }} />
              <Typography sx={{ fontWeight: 800, fontSize: { xs: 16, sm: 18 }, color: '#0F172A' }}>
                المنهج الدراسي وإدارة المحتوى المسجل للطلب
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              <Chip
                icon={<Iconify icon="solar:folder-bold" width={15} />}
                label={`${chapters.length} فصول معتمدة`}
                size="small"
                sx={{
                  bgcolor: '#F8FAFC',
                  color: '#475569',
                  fontWeight: 700,
                  fontSize: 12,
                  px: 1,
                  height: 26,
                  '& .MuiChip-icon': { margin: '0 !important', marginInlineEnd: '6px !important' },
                  '& .MuiChip-label': { px: 0.5 },
                }}
              />
              <Chip
                icon={<Iconify icon="solar:clock-circle-bold" width={15} />}
                label={`${totalHours} ساعة تدريبية معتمدة`}
                size="small"
                sx={{
                  bgcolor: '#ECFDF5',
                  color: '#059669',
                  fontWeight: 700,
                  fontSize: 12,
                  px: 1,
                  height: 26,
                  '& .MuiChip-icon': { color: '#059669', margin: '0 !important', marginInlineEnd: '6px !important' },
                  '& .MuiChip-label': { px: 0.5 },
                }}
              />
              <Chip
                icon={<Iconify icon="solar:videocamera-record-bold" width={15} />}
                label={`${totalLessons} دروس مسجلة`}
                size="small"
                sx={{
                  bgcolor: '#EFF6FF',
                  color: '#2563EB',
                  fontWeight: 700,
                  fontSize: 12,
                  px: 1,
                  height: 26,
                  '& .MuiChip-icon': { color: '#2563EB', margin: '0 !important', marginInlineEnd: '6px !important' },
                  '& .MuiChip-label': { px: 0.5 },
                }}
              />
            </Stack>
          </Box>

          {/* Left in RTL: Action Buttons (+ إضافة فصل جديد & حفظ المنهج) */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ width: { xs: '100%', md: 'auto' }, gap: 1.5 }}
          >
            <Button
              variant="outlined"
              onClick={handleOpenAddChapter}
              startIcon={<Iconify icon="solar:folder-add-bold" width={18} />}
              sx={{
                borderRadius: 2,
                fontWeight: 800,
                fontSize: 13,
                borderColor: '#CBD5E1',
                color: '#334155',
                bgcolor: '#FFFFFF',
                px: 2,
                py: 1,
                flexShrink: 0,
                '& .MuiButton-startIcon': { margin: '0 !important', marginInlineEnd: '8px !important' },
                '&:hover': { bgcolor: '#F8FAFC', borderColor: '#94A3B8' },
              }}
            >
              + إضافة فصل جديد
            </Button>

            <Button
              variant="contained"
              onClick={handleSaveToBackend}
              disabled={isSaving}
              startIcon={
                isSaving ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <Iconify icon="solar:diskette-bold" width={18} />
                )
              }
              sx={{
                borderRadius: 2,
                bgcolor: '#0D9488',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: 13,
                px: 2.5,
                py: 1,
                flexShrink: 0,
                boxShadow: 'none',
                '& .MuiButton-startIcon': { margin: '0 !important', marginInlineEnd: '8px !important' },
                '&:hover': { bgcolor: '#0F766E', boxShadow: 'none' },
              }}
            >
              {isSaving ? 'جاري حفظ التعديلات...' : 'حفظ المنهج في النظام'}
            </Button>
          </Stack>
        </Box>
      </Card>

      {/* 2. Chapters & Lessons Accordions */}
      {chapters.length === 0 ? (
        <Card
          sx={{
            p: 5,
            borderRadius: 3,
            bgcolor: '#FFFFFF',
            border: '1px dashed #CBD5E1',
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 3,
              bgcolor: '#F1F5F9',
              color: '#64748B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <Iconify icon="solar:folder-open-broken" width={32} />
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: 16, color: '#0F172A', mb: 0.5 }}>
            لم يتم إنشاء فصول دراسية لهذا الطلب بعد
          </Typography>
          <Typography sx={{ fontSize: 13, color: '#64748B', mb: 2.5 }}>
            ابدأ بإضافة الفصل الأول لتحديد عدد الساعات وإضافة الدروس ومقاطع الفيديو وبنوك الأسئلة.
          </Typography>
          <Button
            variant="contained"
            onClick={handleOpenAddChapter}
            startIcon={<Iconify icon="solar:add-circle-bold" width={18} />}
            sx={{
              borderRadius: 2,
              bgcolor: '#0F172A',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: 13.5,
              px: 3,
              py: 1,
              '& .MuiButton-startIcon': { margin: '0 !important', marginInlineEnd: '8px !important' },
            }}
          >
            إضافة الفصل الأول
          </Button>
        </Card>
      ) : (
        <Stack spacing={2.5}>
          {chapters.map((chapter) => {
            const isExpanded = chapter.isExpanded !== false;

            return (
              <Card
                key={chapter.id}
                sx={{
                  borderRadius: 2.5,
                  bgcolor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  overflow: 'hidden',
                }}
              >
                {/* Chapter Header: Title on RIGHT (First in RTL), Actions on LEFT (Second in RTL) */}
                <Box
                  onClick={() => handleToggleChapter(chapter.id)}
                  sx={{
                    p: 2,
                    px: 2.5,
                    bgcolor: '#F8FAFC',
                    borderBottom: isExpanded ? '1px solid #E2E8F0' : 'none',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    userSelect: 'none',
                    gap: 1.5,
                    '&:hover': { bgcolor: '#F1F5F9' },
                  }}
                >
                  {/* Right in RTL (First child): Title, Order, Hours, Lessons count */}
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
                    <Iconify
                      icon={isExpanded ? 'solar:alt-arrow-up-linear' : 'solar:alt-arrow-down-linear'}
                      width={18}
                      sx={{ color: '#64748B' }}
                    />
                    <Typography sx={{ fontWeight: 800, fontSize: 15.5, color: '#0F172A' }}>
                      {chapter.order}. {chapter.title}
                    </Typography>

                    <Chip
                      label={`${chapter.lessons?.length || 0} دروس`}
                      size="small"
                      sx={{
                        bgcolor: '#EFF6FF',
                        color: '#2563EB',
                        fontWeight: 700,
                        fontSize: 11.5,
                        height: 22,
                        borderRadius: 1,
                      }}
                    />
                    <Chip
                      label={`${chapter.hours || 0} ساعة معتمدة`}
                      size="small"
                      sx={{
                        bgcolor: '#ECFDF5',
                        color: '#059669',
                        fontWeight: 700,
                        fontSize: 11.5,
                        height: 22,
                        borderRadius: 1,
                      }}
                    />
                  </Stack>

                  {/* Left in RTL (Second child): Add lesson, Edit, Delete Chapter */}
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center', gap: 1 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => handleOpenAddLesson(chapter.id)}
                      startIcon={<Iconify icon="solar:add-circle-bold" width={15} />}
                      sx={{
                        borderRadius: 1.5,
                        bgcolor: '#0F172A',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: 12,
                        px: 1.75,
                        py: 0.5,
                        boxShadow: 'none',
                        '& .MuiButton-startIcon': { margin: '0 !important', marginInlineEnd: '6px !important' },
                        '&:hover': { bgcolor: '#1E293B', boxShadow: 'none' },
                      }}
                    >
                      + إضافة درس
                    </Button>

                    <Tooltip title="تعديل بيانات الفصل">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenEditChapter(chapter)}
                        sx={{ color: '#64748B', '&:hover': { bgcolor: '#E2E8F0' } }}
                      >
                        <Iconify icon="solar:pen-new-square-linear" width={17} />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="حذف الفصل بالكامل">
                      <IconButton
                        size="small"
                        onClick={() =>
                          setDeleteDialog({
                            open: true,
                            type: 'chapter',
                            chapterId: chapter.id,
                            title: chapter.title,
                          })
                        }
                        sx={{ color: '#EF4444', '&:hover': { bgcolor: '#FEF2F2' } }}
                      >
                        <Iconify icon="solar:trash-bin-trash-bold" width={17} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Box>

                {/* Chapter Lessons Collapse */}
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <Box sx={{ p: { xs: 2, sm: 2.5 }, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {(!chapter.lessons || chapter.lessons.length === 0) ? (
                      <Box
                        sx={{
                          p: 3,
                          borderRadius: 2,
                          bgcolor: '#F8FAFC',
                          border: '1px dashed #E2E8F0',
                          textAlign: 'center',
                        }}
                      >
                        <Typography sx={{ color: '#64748B', fontSize: 13, mb: 1.5 }}>
                          لا توجد دروس مضافة في هذا الفصل بعد.
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleOpenAddLesson(chapter.id)}
                          startIcon={<Iconify icon="solar:add-circle-bold" width={16} />}
                          sx={{
                            borderRadius: 1.5,
                            fontWeight: 700,
                            fontSize: 12,
                            '& .MuiButton-startIcon': { margin: '0 !important', marginInlineEnd: '6px !important' },
                          }}
                        >
                          إضافة الدرس الأول لهذا الفصل
                        </Button>
                      </Box>
                    ) : (
                      chapter.lessons.map((lesson) => {
                        const hasVideo = Boolean(lesson.videoUrl);
                        const hasTest = Boolean(lesson.test && (lesson.test.questions?.length || 0) > 0);

                        return (
                          <Card
                            key={lesson.id}
                            sx={{
                              p: { xs: 2, sm: 2.5 },
                              borderRadius: 2.5,
                              bgcolor: '#FFFFFF',
                              border: '1px solid #E2E8F0',
                              boxShadow: 'none',
                            }}
                          >
                            {/* Lesson Top Row: Title on RIGHT, Actions on LEFT (Matching Image 1) */}
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'space-between',
                                mb: 2,
                                flexWrap: 'wrap',
                                gap: 1.5,
                              }}
                            >
                              {/* Right in RTL (First child): Title, Badge & Subtitle */}
                              <Box sx={{ textAlign: 'start' }}>
                                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                  <Typography sx={{ fontWeight: 800, fontSize: 15, color: '#0F172A' }}>
                                    {lesson.order}. {lesson.title}
                                  </Typography>

                                  {hasVideo && hasTest ? (
                                    <Chip
                                      label="مكتمل المحتوى (فيديو واختبار)"
                                      size="small"
                                      sx={{
                                        bgcolor: '#ECFDF5',
                                        color: '#059669',
                                        fontWeight: 700,
                                        fontSize: 11,
                                        height: 22,
                                        borderRadius: 1,
                                      }}
                                    />
                                  ) : hasVideo ? (
                                    <Chip
                                      label="فيديو مرفوع"
                                      size="small"
                                      sx={{
                                        bgcolor: '#EFF6FF',
                                        color: '#2563EB',
                                        fontWeight: 700,
                                        fontSize: 11,
                                        height: 22,
                                        borderRadius: 1,
                                      }}
                                    />
                                  ) : hasTest ? (
                                    <Chip
                                      label="اختبار تقييمي فقط"
                                      size="small"
                                      sx={{
                                        bgcolor: '#F5F3FF',
                                        color: '#7C3AED',
                                        fontWeight: 700,
                                        fontSize: 11,
                                        height: 22,
                                        borderRadius: 1,
                                      }}
                                    />
                                  ) : (
                                    <Chip
                                      label="بانتظار رفع المحتوى"
                                      size="small"
                                      sx={{
                                        bgcolor: '#FEF3C7',
                                        color: '#D97706',
                                        fontWeight: 700,
                                        fontSize: 11,
                                        height: 22,
                                        borderRadius: 1,
                                      }}
                                    />
                                  )}
                                </Stack>

                                <Typography sx={{ fontSize: 12, color: '#64748B', mt: 0.5 }}>
                                  {lesson.description || 'تم إرفاق محتوى الفيديو والاختبار التقييمي لهذا الدرس'}
                                </Typography>
                              </Box>

                              {/* Left in RTL (Second child): Edit lesson & Delete */}
                              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', gap: 1 }}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<Iconify icon="solar:pen-new-square-linear" width={15} />}
                                  onClick={() => handleOpenEditLesson(chapter.id, lesson)}
                                  sx={{
                                    borderRadius: 1.5,
                                    fontSize: 12,
                                    fontWeight: 700,
                                    borderColor: '#E2E8F0',
                                    color: '#475569',
                                    '& .MuiButton-startIcon': { margin: '0 !important', marginInlineEnd: '6px !important' },
                                  }}
                                >
                                  تعديل العنوان
                                </Button>

                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    setDeleteDialog({
                                      open: true,
                                      type: 'lesson',
                                      chapterId: chapter.id,
                                      lessonId: lesson.id,
                                      title: lesson.title,
                                    })
                                  }
                                  sx={{
                                    color: '#EF4444',
                                    border: '1px solid #FEE2E2',
                                    borderRadius: 1.5,
                                    '&:hover': { bgcolor: '#FEF2F2' },
                                  }}
                                >
                                  <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                                </IconButton>
                              </Stack>
                            </Box>

                            {/* Lesson Attached Media Items (Matching Image 1) */}
                            <Stack spacing={1.5} sx={{ mb: 2 }}>
                              {/* 1. Video Item Row */}
                              {hasVideo ? (
                                <Box
                                  sx={{
                                    p: 1.75,
                                    px: 2,
                                    borderRadius: 2,
                                    bgcolor: '#F8FAFC',
                                    border: '1px solid #F1F5F9',
                                    display: 'flex',
                                    flexDirection: { xs: 'column', md: 'row' },
                                    alignItems: { xs: 'flex-start', md: 'center' },
                                    justifyContent: 'space-between',
                                    gap: 1.5,
                                  }}
                                >
                                  {/* Right in RTL: Icon & Video metadata */}
                                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', gap: 1.5, textAlign: 'start' }}>
                                    <Box
                                      sx={{
                                        width: 38,
                                        height: 38,
                                        borderRadius: 2,
                                        bgcolor: '#EFF6FF',
                                        color: '#2563EB',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                      }}
                                    >
                                      <Iconify icon="solar:videocamera-record-bold" width={20} />
                                    </Box>
                                    <Box>
                                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', gap: 0.75 }}>
                                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                                          فيديو المحاضرة: {lesson.title}
                                        </Typography>
                                        <Typography sx={{ fontSize: 11, color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                          <Iconify icon="solar:check-circle-bold" width={13} />
                                          تم المعالجة والرفع بنجاح
                                        </Typography>
                                      </Stack>
                                      <Typography sx={{ fontSize: 11.5, color: '#64748B', mt: 0.25 }}>
                                        المدة: {Math.floor((lesson.durationInSeconds || 0) / 60)} دقيقة • الرابط: {lesson.videoUrl?.slice(0, 45)}...
                                      </Typography>
                                    </Box>
                                  </Stack>

                                  {/* Left in RTL: Actions (معاينة الفيديو, استبدال, حذف) */}
                                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', gap: 1 }}>
                                    <Button
                                      size="small"
                                      variant="contained"
                                      startIcon={<Iconify icon="solar:play-bold" width={14} />}
                                      onClick={() => handleOpenPreview(lesson.title, lesson.videoUrl || '')}
                                      sx={{
                                        borderRadius: 1.5,
                                        fontSize: 11.5,
                                        fontWeight: 800,
                                        bgcolor: '#0F172A',
                                        color: '#FFFFFF',
                                        boxShadow: 'none',
                                        '& .MuiButton-startIcon': { margin: '0 !important', marginInlineEnd: '6px !important' },
                                        '&:hover': { bgcolor: '#1E293B', boxShadow: 'none' },
                                      }}
                                    >
                                      معاينة الفيديو
                                    </Button>

                                    <Button
                                      size="small"
                                      variant="outlined"
                                      onClick={() => handleOpenVideoDialog(chapter.id, lesson)}
                                      sx={{
                                        borderRadius: 1.5,
                                        fontSize: 11.5,
                                        fontWeight: 700,
                                        borderColor: '#CBD5E1',
                                        color: '#475569',
                                      }}
                                    >
                                      استبدال
                                    </Button>

                                    <IconButton
                                      size="small"
                                      onClick={() => handleDeleteVideo(chapter.id, lesson.id)}
                                      sx={{ color: '#EF4444', '&:hover': { bgcolor: '#FEF2F2' } }}
                                    >
                                      <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                                    </IconButton>
                                  </Stack>
                                </Box>
                              ) : null}

                              {/* 2. Test / Quiz Item Row */}
                              {hasTest ? (
                                <Box
                                  sx={{
                                    p: 1.75,
                                    px: 2,
                                    borderRadius: 2,
                                    bgcolor: '#F8FAFC',
                                    border: '1px solid #F1F5F9',
                                    display: 'flex',
                                    flexDirection: { xs: 'column', md: 'row' },
                                    alignItems: { xs: 'flex-start', md: 'center' },
                                    justifyContent: 'space-between',
                                    gap: 1.5,
                                  }}
                                >
                                  {/* Right in RTL: Icon & Quiz metadata */}
                                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', gap: 1.5, textAlign: 'start' }}>
                                    <Box
                                      sx={{
                                        width: 38,
                                        height: 38,
                                        borderRadius: 2,
                                        bgcolor: '#ECFDF5',
                                        color: '#059669',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                      }}
                                    >
                                      <Iconify icon="solar:diploma-verified-bold" width={20} />
                                    </Box>
                                    <Box>
                                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', gap: 0.75 }}>
                                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                                          بنك أسئلة وتدريبات الدرس (Self-Assessment)
                                        </Typography>
                                        <Typography sx={{ fontSize: 11, color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                          <Iconify icon="solar:check-circle-bold" width={13} />
                                          مفعل بعد انتهاء الفيديو
                                        </Typography>
                                      </Stack>
                                      <Typography sx={{ fontSize: 11.5, color: '#64748B', mt: 0.25 }}>
                                        درجة الاجتياز: %70 • {lesson.test?.questions?.length || 0} أسئلة تدريبية تفاعلية (MCQ)
                                      </Typography>
                                    </Box>
                                  </Stack>

                                  {/* Left in RTL: Actions (معاينة وتعديل الأسئلة, + إضافة سؤال, حذف) */}
                                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', gap: 1 }}>
                                    <Button
                                      size="small"
                                      variant="contained"
                                      startIcon={<Iconify icon="solar:document-add-bold" width={14} />}
                                      onClick={() => handleOpenTestEditor(chapter.id, lesson)}
                                      sx={{
                                        borderRadius: 1.5,
                                        fontSize: 11.5,
                                        fontWeight: 800,
                                        bgcolor: '#0F172A',
                                        color: '#FFFFFF',
                                        boxShadow: 'none',
                                        '& .MuiButton-startIcon': { margin: '0 !important', marginInlineEnd: '6px !important' },
                                        '&:hover': { bgcolor: '#1E293B', boxShadow: 'none' },
                                      }}
                                    >
                                      معاينة وتعديل الأسئلة ({lesson.test?.questions?.length || 0})
                                    </Button>

                                    <Button
                                      size="small"
                                      variant="outlined"
                                      onClick={() => handleOpenTestEditor(chapter.id, lesson)}
                                      sx={{
                                        borderRadius: 1.5,
                                        fontSize: 11.5,
                                        fontWeight: 700,
                                        borderColor: '#CBD5E1',
                                        color: '#475569',
                                      }}
                                    >
                                      + إضافة سؤال
                                    </Button>

                                    <IconButton
                                      size="small"
                                      onClick={() => handleDeleteTest(chapter.id, lesson.id)}
                                      sx={{ color: '#EF4444', '&:hover': { bgcolor: '#FEF2F2' } }}
                                    >
                                      <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                                    </IconButton>
                                  </Stack>
                                </Box>
                              ) : null}
                            </Stack>

                            {/* Bottom row inside lesson (Matching Image 1) */}
                            <Box
                              sx={{
                                pt: 1.5,
                                borderTop: '1px dashed #E2E8F0',
                                display: 'flex',
                                flexWrap: 'wrap',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 1.5,
                              }}
                            >
                              <Typography sx={{ fontSize: 11.5, color: '#94A3B8' }}>
                                يمكنك إضافة مقاطع الفيديو وبنوك الأسئلة التفاعلية التابعة لهذا الدرس
                              </Typography>

                              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<Iconify icon="solar:videocamera-record-linear" width={15} />}
                                  onClick={() => handleOpenVideoDialog(chapter.id, lesson)}
                                  sx={{
                                    borderRadius: 1.5,
                                    fontSize: 11.5,
                                    fontWeight: 700,
                                    borderColor: '#E2E8F0',
                                    color: '#334155',
                                    '& .MuiButton-startIcon': { margin: '0 !important', marginInlineEnd: '6px !important' },
                                  }}
                                >
                                  {hasVideo ? '+ استبدال الفيديو' : '+ فيديو إضافي'}
                                </Button>

                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<Iconify icon="solar:question-circle-linear" width={15} />}
                                  onClick={() => handleOpenTestEditor(chapter.id, lesson)}
                                  sx={{
                                    borderRadius: 1.5,
                                    fontSize: 11.5,
                                    fontWeight: 700,
                                    borderColor: '#E2E8F0',
                                    color: '#334155',
                                    '& .MuiButton-startIcon': { margin: '0 !important', marginInlineEnd: '6px !important' },
                                  }}
                                >
                                  {hasTest ? '+ إضافة أسئلة' : '+ إنشاء اختبار'}
                                </Button>
                              </Stack>
                            </Box>
                          </Card>
                        );
                      })
                    )}
                  </Box>
                </Collapse>
              </Card>
            );
          })}
        </Stack>
      )}

      {/* ------------------------------------------------------------- */}
      {/* Dialog 1: Add / Edit Chapter Dialog */}
      {/* ------------------------------------------------------------- */}
      <Dialog
        open={chapterDialogOpen}
        onClose={() => setChapterDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: 18, color: '#0F172A', textAlign: 'start' }}>
          {editingChapterId ? 'تعديل بيانات الفصل' : 'إضافة فصل دراسي جديد'}
        </DialogTitle>
        <DialogContent sx={{ py: 2 }}>
          <Stack spacing={2.5}>
            <TextField
              label="عنوان الفصل"
              fullWidth
              size="medium"
              placeholder="مثال: الفصل الأول - أساسيات الجراحة العامة"
              value={chapterTitleInput}
              onChange={(e) => setChapterTitleInput(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

            <TextField
              label="عدد الساعات المعتمدة للفصل"
              type="number"
              fullWidth
              size="medium"
              value={chapterHoursInput}
              onChange={(e) => setChapterHoursInput(e.target.value)}
              slotProps={{
                htmlInput: { min: 0, step: 0.5 },
                input: {
                  endAdornment: <InputAdornment position="end">ساعة</InputAdornment>,
                },
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setChapterDialogOpen(false)}
            sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}
          >
            إلغاء
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveChapter}
            sx={{ borderRadius: 2, px: 3, bgcolor: '#0F172A', fontWeight: 800 }}
          >
            حفظ الفصل
          </Button>
        </DialogActions>
      </Dialog>

      {/* ------------------------------------------------------------- */}
      {/* Dialog 2: Add / Edit Lesson Dialog */}
      {/* ------------------------------------------------------------- */}
      <Dialog
        open={lessonDialogOpen}
        onClose={() => setLessonDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: 18, color: '#0F172A', textAlign: 'start' }}>
          {editingLessonId ? 'تعديل بيانات الدرس' : 'إضافة درس جديد للفصل'}
        </DialogTitle>
        <DialogContent sx={{ py: 2 }}>
          <Stack spacing={2.5}>
            <TextField
              label="عنوان الدرس"
              fullWidth
              size="medium"
              placeholder="مثال: الدرس الأول: مقدمة وتشريح عضلة القلب"
              value={lessonTitleInput}
              onChange={(e) => setLessonTitleInput(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

            <TextField
              label="وصف الدرس والمستهدف الأكاديمي (اختياري)"
              fullWidth
              multiline
              rows={3}
              placeholder="نبذة توضيحية عما يتعلمه الطالب في هذا الدرس..."
              value={lessonDescriptionInput}
              onChange={(e) => setLessonDescriptionInput(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />

            <TextField
              label="المدة التقديرية للدرس (بالدقائق)"
              type="number"
              fullWidth
              size="medium"
              value={lessonDurationInput}
              onChange={(e) => setLessonDurationInput(e.target.value)}
              slotProps={{
                htmlInput: { min: 1, step: 1 },
                input: {
                  endAdornment: <InputAdornment position="end">دقيقة</InputAdornment>,
                },
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setLessonDialogOpen(false)}
            sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}
          >
            إلغاء
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveLesson}
            sx={{ borderRadius: 2, px: 3, bgcolor: '#0F172A', fontWeight: 800 }}
          >
            حفظ الدرس
          </Button>
        </DialogActions>
      </Dialog>

      {/* ------------------------------------------------------------- */}
      {/* Dialog 3: Video Upload / Link Dialog */}
      {/* ------------------------------------------------------------- */}
      <Dialog
        open={videoDialogOpen}
        onClose={() => !isUploadingVideo && setVideoDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: 18, color: '#0F172A', textAlign: 'start' }}>
          إرفاق فيديو الدرس
        </DialogTitle>
        <DialogContent sx={{ py: 2 }}>
          <Tabs
            value={videoTab}
            onChange={(_, val) => setVideoTab(val)}
            sx={{
              mb: 2.5,
              '& .MuiTab-root': { fontWeight: 700, fontSize: 13 },
            }}
          >
            <Tab value="url" label="رابط فيديو مباشر (URL / Embed)" />
            <Tab value="upload" label="رفع ملف من الجهاز (Upload MP4)" />
          </Tabs>

          {videoTab === 'url' ? (
            <Stack spacing={2}>
              <TextField
                label="رابط الفيديو (YouTube / Vimeo / Direct CDN)"
                fullWidth
                size="medium"
                dir="ltr"
                placeholder="https://..."
                value={videoUrlInput}
                onChange={(e) => setVideoUrlInput(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <Typography sx={{ fontSize: 12, color: '#64748B' }}>
                يمكنك لصق رابط فيديو مباشر من منصة يوتيوب، فيميو، أو رابط وسائط رقمية بصيغة mp4.
              </Typography>
            </Stack>
          ) : (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                style={{ display: 'none' }}
                onChange={handleUploadVideoFile}
              />
              <Box
                onClick={() => !isUploadingVideo && fileInputRef.current?.click()}
                sx={{
                  p: 3,
                  borderRadius: 2.5,
                  border: '2px dashed #CBD5E1',
                  bgcolor: '#F8FAFC',
                  cursor: isUploadingVideo ? 'wait' : 'pointer',
                  '&:hover': { bgcolor: '#F1F5F9', borderColor: '#94A3B8' },
                }}
              >
                {isUploadingVideo ? (
                  <Stack spacing={1.5} sx={{ alignItems: 'center', py: 2 }}>
                    <CircularProgress size={32} sx={{ color: '#0D9488' }} />
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0D9488' }}>
                      جاري رفع ملف الفيديو ومعالجته في السيرفر...
                    </Typography>
                  </Stack>
                ) : (
                  <>
                    <Iconify icon="solar:cloud-upload-bold" width={40} sx={{ color: '#0284C7', mb: 1 }} />
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#0F172A', mb: 0.5 }}>
                      اضغط هنا لاختيار ملف فيديو من جهازك
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: '#64748B' }}>
                      الصيغ المدعومة: MP4, WebM (الحد الأقصى 500 ميجابايت)
                    </Typography>
                  </>
                )}
              </Box>

              {videoUrlInput && (
                <Typography sx={{ fontSize: 12, color: '#059669', mt: 1.5, fontWeight: 700, direction: 'ltr' }}>
                  الملف المرفوع: {videoUrlInput}
                </Typography>
              )}
            </Box>
          )}

          <TextField
            label="مدة الفيديو (بالدقائق)"
            type="number"
            fullWidth
            size="medium"
            value={videoDurationMinutes}
            onChange={(e) => setVideoDurationMinutes(e.target.value)}
            slotProps={{
              htmlInput: { min: 1, step: 1 },
              input: { endAdornment: <InputAdornment position="end">دقيقة</InputAdornment> },
            }}
            sx={{ mt: 2.5, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            variant="outlined"
            disabled={isUploadingVideo}
            onClick={() => setVideoDialogOpen(false)}
            sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}
          >
            إلغاء
          </Button>
          <Button
            variant="contained"
            disabled={isUploadingVideo || !videoUrlInput.trim()}
            onClick={handleSaveVideo}
            sx={{ borderRadius: 2, px: 3, bgcolor: '#0F172A', fontWeight: 800 }}
          >
            حفظ الفيديو
          </Button>
        </DialogActions>
      </Dialog>

      {/* ------------------------------------------------------------- */}
      {/* Dialog 4: Test / Questions Editor Dialog */}
      {/* ------------------------------------------------------------- */}
      <Dialog
        open={testDialogOpen}
        onClose={() => setTestDialogOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: 18, color: '#0F172A', textAlign: 'start' }}>
          بنك أسئلة وتدريبات الدرس التفاعلية (MCQ)
        </DialogTitle>
        <DialogContent sx={{ py: 2 }}>
          <Typography sx={{ fontSize: 13, color: '#64748B', mb: 2 }}>
            أضف أسئلة الاختيار من متعدد مع تحديد الإجابة الصحيحة لكل سؤال.
          </Typography>

          <Stack spacing={3}>
            {testQuestions.map((question, qIdx) => (
              <Card
                key={question.id || qIdx}
                sx={{
                  p: 2.5,
                  borderRadius: 2.5,
                  bgcolor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                }}
              >
                <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography sx={{ fontWeight: 800, fontSize: 14.5, color: '#0F172A' }}>
                    السؤال {qIdx + 1}:
                  </Typography>

                  {testQuestions.length > 1 && (
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteQuestion(qIdx)}
                      sx={{ color: '#EF4444', '&:hover': { bgcolor: '#FEE2E2' } }}
                    >
                      <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                    </IconButton>
                  )}
                </Stack>

                <TextField
                  label="نص السؤال"
                  fullWidth
                  size="small"
                  placeholder="اكتب نص السؤال هنا..."
                  value={question.text}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTestQuestions((prev) =>
                      prev.map((q, idx) => (idx === qIdx ? { ...q, text: val } : q))
                    );
                  }}
                  sx={{ mb: 2, bgcolor: '#FFFFFF', '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                />

                <TextField
                  label="توضيح الإجابة الصحيحة (اختياري)"
                  fullWidth
                  size="small"
                  placeholder="الشرح والتفسير الأكاديمي للحل..."
                  value={question.explanation || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTestQuestions((prev) =>
                      prev.map((q, idx) => (idx === qIdx ? { ...q, explanation: val } : q))
                    );
                  }}
                  sx={{ mb: 2, bgcolor: '#FFFFFF', '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                />

                {/* Choices list */}
                <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#475569', mb: 1 }}>
                  خيارات الإجابة (حدد الدائرة أمام الخيار الصحيح):
                </Typography>

                <Stack spacing={1}>
                  {(question.choices || []).map((choice, cIdx) => (
                    <Box
                      key={choice.id || cIdx}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        p: 0.5,
                        px: 1,
                        borderRadius: 1.5,
                        bgcolor: choice.isRight ? '#ECFDF5' : '#FFFFFF',
                        border: `1px solid ${choice.isRight ? '#A7F3D0' : '#E2E8F0'}`,
                      }}
                    >
                      <Radio
                        checked={Boolean(choice.isRight)}
                        onChange={() => handleSetCorrectChoice(qIdx, cIdx)}
                        size="small"
                        sx={{ color: choice.isRight ? '#059669' : '#94A3B8', '&.Mui-checked': { color: '#059669' } }}
                      />

                      <TextField
                        fullWidth
                        size="small"
                        placeholder={`الخيار ${cIdx + 1}...`}
                        value={choice.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setTestQuestions((prev) =>
                            prev.map((q, idx) => {
                              if (idx !== qIdx) return q;
                              return {
                                ...q,
                                choices: (q.choices || []).map((c, ci) =>
                                  ci === cIdx ? { ...c, title: val } : c
                                ),
                              };
                            })
                          );
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 1.5,
                            bgcolor: '#FFFFFF',
                            fontSize: 13,
                          },
                        }}
                      />

                      {question.choices.length > 2 && (
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteChoice(qIdx, cIdx)}
                          sx={{ color: '#EF4444' }}
                        >
                          <Iconify icon="solar:close-circle-bold" width={16} />
                        </IconButton>
                      )}
                    </Box>
                  ))}
                </Stack>

                <Button
                  size="small"
                  variant="text"
                  onClick={() => handleAddChoice(qIdx)}
                  startIcon={<Iconify icon="solar:add-circle-bold" width={15} />}
                  sx={{
                    mt: 1.5,
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#0284C7',
                    '& .MuiButton-startIcon': { margin: '0 !important', marginInlineEnd: '6px !important' },
                  }}
                >
                  + إضافة خيار إضافي
                </Button>
              </Card>
            ))}

            <Button
              variant="outlined"
              onClick={handleAddQuestion}
              startIcon={<Iconify icon="solar:add-circle-bold" width={18} />}
              sx={{
                py: 1.25,
                borderRadius: 2,
                borderStyle: 'dashed',
                fontWeight: 800,
                fontSize: 13,
                borderColor: '#94A3B8',
                color: '#334155',
                '& .MuiButton-startIcon': { margin: '0 !important', marginInlineEnd: '8px !important' },
              }}
            >
              + إضافة سؤال جديد
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setTestDialogOpen(false)}
            sx={{ borderRadius: 2, px: 3, fontWeight: 700 }}
          >
            إلغاء
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveTest}
            sx={{ borderRadius: 2, px: 3, bgcolor: '#0F172A', fontWeight: 800 }}
          >
            اعتماد وحفظ بنك الأسئلة
          </Button>
        </DialogActions>
      </Dialog>

      {/* ------------------------------------------------------------- */}
      {/* Dialog 5: Video Preview Dialog */}
      {/* ------------------------------------------------------------- */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1, bgcolor: '#0F172A' } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: 16, color: '#FFFFFF', textAlign: 'start' }}>
          معاينة الفيديو: {previewTitle}
        </DialogTitle>
        <DialogContent sx={{ py: 1 }}>
          {getEmbedUrl(previewUrl) ? (
            <Box
              component="iframe"
              src={getEmbedUrl(previewUrl)!}
              sx={{
                width: '100%',
                height: { xs: 260, sm: 420 },
                border: 0,
                borderRadius: 2,
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <Box
              component="video"
              src={previewUrl}
              controls
              autoPlay
              sx={{
                width: '100%',
                maxHeight: 450,
                borderRadius: 2,
                bgcolor: '#000000',
              }}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            variant="contained"
            onClick={() => setPreviewOpen(false)}
            sx={{ borderRadius: 2, px: 3, bgcolor: '#334155', color: '#FFFFFF', fontWeight: 700 }}
          >
            إغلاق المعاينة
          </Button>
        </DialogActions>
      </Dialog>

      {/* ------------------------------------------------------------- */}
      {/* Dialog 6: Delete Confirmation Dialog */}
      {/* ------------------------------------------------------------- */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog((prev) => ({ ...prev, open: false }))}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: 17, color: '#0F172A', textAlign: 'center' }}>
          تأكيد الحذف
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', py: 1 }}>
          <Typography sx={{ color: '#64748B', fontSize: 14 }}>
            هل أنت متأكد من رغبتك في حذف{' '}
            {deleteDialog.type === 'chapter' ? 'الفصل' : 'الدرس'} &ldquo;{deleteDialog.title}&rdquo;؟
          </Typography>
          {deleteDialog.type === 'chapter' && (
            <Typography sx={{ color: '#DC2626', fontSize: 12, mt: 1, fontWeight: 700 }}>
              سيتم حذف جميع الدروس ومقاطع الفيديو التابعة لهذا الفصل.
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setDeleteDialog((prev) => ({ ...prev, open: false }))}
            sx={{ borderRadius: 2, px: 2.5, fontWeight: 700 }}
          >
            تراجع
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmDelete}
            sx={{ borderRadius: 2, px: 2.5, fontWeight: 800 }}
          >
            تأكيد الحذف
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
