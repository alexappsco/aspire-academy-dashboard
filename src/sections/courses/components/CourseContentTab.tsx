'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Iconify from 'src/components/iconify';
import { useToast } from 'src/components/toast';
import QuizDialog from './QuizDialog';

interface AttachmentItem {
  id: string;
  type: 'video' | 'pdf' | 'quiz';
  title: string;
  badgeText: string;
  badgeColor: 'success' | 'info' | 'primary' | 'secondary' | 'warning';
  metaText: string;
  fileSize?: string;
  duration?: string;
  quality?: string;
  questionsCount?: number;
  passingScore?: string;
}

interface LessonItem {
  id: string;
  number: number;
  title: string;
  subtitle?: string;
  isCompleted?: boolean;
  attachments: AttachmentItem[];
}

interface ChapterItem {
  id: string;
  number: number;
  title: string;
  lessons: LessonItem[];
  isExpanded: boolean;
}

const INITIAL_CHAPTERS_DATA: ChapterItem[] = [
  {
    id: 'ch-1',
    number: 1,
    title: 'الفصل الأول - مقدمة',
    isExpanded: true,
    lessons: [
      {
        id: 'les-1',
        number: 1,
        title: 'الدرس الاول',
        attachments: [],
      },
      {
        id: 'les-2',
        number: 2,
        title: 'الدرس الثاني',
        attachments: [],
      },
      {
        id: 'les-3',
        number: 3,
        title: 'الدرس الثالث: تشريح عضلة القلب والدورة الدموية',
        subtitle: 'تم إرفاق فيديو، ملخص ومستند، وبنك أسئلة تقييمية لهذا الدرس',
        isCompleted: true,
        attachments: [
          {
            id: 'att-3-1',
            type: 'video',
            title: 'فيديو المحاضرة: مدخل إلى تشريح عضلة القلب.mp4',
            badgeText: 'تم المعالجة والرفع بنجاح',
            badgeColor: 'success',
            metaText: 'الجودة: 1080p Full HD • الحجم: 340 MB • المدة: 24:15 دقيقة',
          },
          {
            id: 'att-3-2',
            type: 'pdf',
            title: 'الملخص والمذكرة التوضيحية — تشريح القلب.pdf',
            badgeText: 'جاهز للتحميل للطلاب',
            badgeColor: 'info',
            metaText: 'الحجم: 4.8 MB • 32 صفحة • ملف PDF إلكتروني',
          },
          {
            id: 'att-3-3',
            type: 'quiz',
            title: 'بنك أسئلة وتدريبات الدرس (Self-Assessment)',
            badgeText: 'مفعل بعد انتهاء الفيديو',
            badgeColor: 'success',
            metaText: 'درجة الاجتياز: 60% • 5 أسئلة تدريبية تفاعلية (MCQ)',
            questionsCount: 5,
          },
        ],
      },
    ],
  },
  {
    id: 'ch-2',
    number: 2,
    title: 'الفصل الأول - أساسيات',
    isExpanded: false,
    lessons: [
      { id: 'les-2-1', number: 1, title: 'الدرس الأول: تخطيط القلب الكهربائي ECG', attachments: [] },
      { id: 'les-2-2', number: 2, title: 'الدرس الثاني: أصوات القلب واللغط', attachments: [] },
      { id: 'les-2-3', number: 3, title: 'الدرس الثالث: ضغط الدم وتنظيم الدورة', attachments: [] },
    ],
  },
  {
    id: 'ch-3',
    number: 3,
    title: 'الفصل الثالث: أمراض الشرايين التاجية',
    isExpanded: false,
    lessons: [
      { id: 'les-3-1', number: 1, title: 'الدرس الأول: الذبحة الصدرية المستقرة وغير المستقرة', attachments: [] },
      { id: 'les-3-2', number: 2, title: 'الدرس الثاني: احتشاء عضلة القلب الحاد STEMI', attachments: [] },
    ],
  },
  {
    id: 'ch-4',
    number: 4,
    title: 'الفصل الرابع: الجراحة والعناية المركزة',
    isExpanded: false,
    lessons: [
      { id: 'les-4-1', number: 1, title: 'الدرس الأول: جراحة المجازة التاجية CABG', attachments: [] },
      { id: 'les-4-2', number: 2, title: 'الدرس الثاني: بروتوكول العناية المركزة القلبية CCU', attachments: [] },
    ],
  },
];

export default function CourseContentTab() {
  const toast = useToast();

  const [chapters, setChapters] = useState<ChapterItem[]>(INITIAL_CHAPTERS_DATA);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [newLessonTitles, setNewLessonTitles] = useState<Record<string, string>>({});
  const [allExpanded, setAllExpanded] = useState<boolean>(false);

  // Dialogs
  const [quizDialogOpen, setQuizDialogOpen] = useState(false);
  const [activeChapterForQuiz, setActiveChapterForQuiz] = useState<string>('الفصل الأول - مقدمة');
  const [videoPreviewOpen, setVideoPreviewOpen] = useState(false);
  const [previewVideoTitle, setPreviewVideoTitle] = useState('');

  // Editing lesson title state
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [editingLessonTitle, setEditingLessonTitle] = useState<string>('');

  // Total stats calculations
  const totalChapters = chapters.length;
  const totalLessons = chapters.reduce((acc, ch) => acc + ch.lessons.length, 0);
  const totalQuizzes = 8;
  const totalFiles = 12;

  // Toggle expand all
  const handleToggleExpandAll = () => {
    const nextState = !allExpanded;
    setAllExpanded(nextState);
    setChapters((prev) =>
      prev.map((ch) => ({ ...ch, isExpanded: nextState }))
    );
  };

  const handleToggleChapter = (chapterId: string) => {
    setChapters((prev) =>
      prev.map((ch) => (ch.id === chapterId ? { ...ch, isExpanded: !ch.isExpanded } : ch))
    );
  };

  // Add Chapter
  const handleAddChapter = () => {
    if (!newChapterTitle.trim()) {
      toast.warning('يرجى كتابة عنوان الفصل');
      return;
    }
    const newChapter: ChapterItem = {
      id: `ch-${Date.now()}`,
      number: chapters.length + 1,
      title: newChapterTitle.trim(),
      isExpanded: true,
      lessons: [],
    };
    setChapters((prev) => [...prev, newChapter]);
    setNewChapterTitle('');
    toast.success('تمت إضافة الفصل بنجاح');
  };

  // Delete Chapter
  const handleDeleteChapter = (chapterId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChapters((prev) =>
      prev
        .filter((ch) => ch.id !== chapterId)
        .map((ch, idx) => ({ ...ch, number: idx + 1 }))
    );
    toast.success('تم حذف الفصل بنجاح');
  };

  // Add Lesson to a chapter
  const handleAddLesson = (chapterId: string) => {
    const title = newLessonTitles[chapterId]?.trim();
    if (!title) {
      toast.warning('يرجى كتابة عنوان الدرس');
      return;
    }
    setChapters((prev) =>
      prev.map((ch) => {
        if (ch.id !== chapterId) return ch;
        const newLesson: LessonItem = {
          id: `les-${Date.now()}`,
          number: ch.lessons.length + 1,
          title,
          attachments: [],
        };
        return { ...ch, lessons: [...ch.lessons, newLesson] };
      })
    );
    setNewLessonTitles((prev) => ({ ...prev, [chapterId]: '' }));
    toast.success('تمت إضافة الدرس بنجاح');
  };

  // Delete Lesson
  const handleDeleteLesson = (chapterId: string, lessonId: string) => {
    setChapters((prev) =>
      prev.map((ch) => {
        if (ch.id !== chapterId) return ch;
        const filtered = ch.lessons
          .filter((les) => les.id !== lessonId)
          .map((les, idx) => ({ ...les, number: idx + 1 }));
        return { ...ch, lessons: filtered };
      })
    );
    toast.success('تم حذف الدرس بنجاح');
  };

  // Delete Attachment
  const handleDeleteAttachment = (
    chapterId: string,
    lessonId: string,
    attachmentId: string
  ) => {
    setChapters((prev) =>
      prev.map((ch) => {
        if (ch.id !== chapterId) return ch;
        const updatedLessons = ch.lessons.map((les) => {
          if (les.id !== lessonId) return les;
          const remaining = les.attachments.filter((att) => att.id !== attachmentId);
          return {
            ...les,
            isCompleted: remaining.length > 0,
            attachments: remaining,
          };
        });
        return { ...ch, lessons: updatedLessons };
      })
    );
    toast.success('تم حذف المرفق بنجاح');
  };

  // Trigger quick add attachment
  const handleQuickAddAttachment = (
    chapterId: string,
    lessonId: string,
    type: 'video' | 'pdf' | 'quiz'
  ) => {
    if (type === 'quiz') {
      const chapter = chapters.find((c) => c.id === chapterId);
      setActiveChapterForQuiz(chapter ? chapter.title : 'الفصل الأول');
      setQuizDialogOpen(true);
      return;
    }

    const newAtt: AttachmentItem =
      type === 'video'
        ? {
            id: `att-${Date.now()}`,
            type: 'video',
            title: 'فيديو المحاضرة: شرح تفصيلي.mp4',
            badgeText: 'تم المعالجة والرفع بنجاح',
            badgeColor: 'success',
            metaText: 'الجودة: 1080p Full HD • الحجم: 340 MB • المدة: 24:15 دقيقة',
          }
        : {
            id: `att-${Date.now()}`,
            type: 'pdf',
            title: 'المستند التوضيحي والملخص.pdf',
            badgeText: 'جاهز للتحميل للطلاب',
            badgeColor: 'info',
            metaText: 'الحجم: 4.8 MB • 32 صفحة • ملف PDF إلكتروني',
          };

    setChapters((prev) =>
      prev.map((ch) => {
        if (ch.id !== chapterId) return ch;
        const updatedLessons = ch.lessons.map((les) => {
          if (les.id !== lessonId) return les;
          return {
            ...les,
            isCompleted: true,
            subtitle: les.subtitle || 'تم إرفاق فيديو، ملخص ومستند، وبنك أسئلة تقييمية لهذا الدرس',
            attachments: [...les.attachments, newAtt],
          };
        });
        return { ...ch, lessons: updatedLessons };
      })
    );
    toast.success(`تمت إضافة ${type === 'video' ? 'الفيديو' : 'المستند'} بنجاح`);
  };

  const handleOpenVideoPreview = (title: string) => {
    setPreviewVideoTitle(title);
    setVideoPreviewOpen(true);
  };

  return (
    <Box>
      {/* 1. Top Badges & Action Bar */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{
          justifyContent: 'space-between',
          alignItems: { xs: 'stretch', md: 'center' },
          mb: 3,
        }}
      >
        {/* Statistics Badges */}
        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          {/* Chapters Count */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: 2,
              px: 1.8,
              py: 0.8,
              boxShadow: '0px 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            <Iconify icon="solar:folder-bold" width={18} sx={{ color: '#0284C7' }} />
            <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#1E293B' }}>
              {totalChapters} فصول
            </Typography>
          </Box>

          {/* Video Lessons */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: 2,
              px: 1.8,
              py: 0.8,
              boxShadow: '0px 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            <Box component="img" src="/icons/vedio.svg" alt="video" sx={{ width: 18, height: 18 }} />
            <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#1E293B' }}>
              {totalLessons > 0 ? 24 : 0} درس فيديو
            </Typography>
          </Box>

          {/* Quizzes */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: 2,
              px: 1.8,
              py: 0.8,
              boxShadow: '0px 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            <Box component="img" src="/icons/exam.svg" alt="exam" sx={{ width: 18, height: 18 }} />
            <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#1E293B' }}>
              {totalQuizzes} اختبارات
            </Typography>
          </Box>

          {/* Files / Attachments */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: 2,
              px: 1.8,
              py: 0.8,
              boxShadow: '0px 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            <Box component="img" src="/icons/file.svg" alt="file" sx={{ width: 18, height: 18 }} />
            <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#1E293B' }}>
              {totalFiles} ملف وملحق
            </Typography>
          </Box>

          {/* Total Duration */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: 2,
              px: 1.8,
              py: 0.8,
              boxShadow: '0px 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            <Iconify icon="solar:clock-circle-bold" width={18} sx={{ color: '#64748B' }} />
            <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: '#475569' }}>
              إجمالي المدة: 18 ساعة و45 دقيقة
            </Typography>
          </Box>
        </Stack>

        {/* Action Buttons: Add Chapter & Expand All */}
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Button
            variant="contained"
            onClick={() => {
              const el = document.getElementById('chapter-creator-input');
              if (el) el.focus();
            }}
            sx={{
              bgcolor: '#0284C7',
              color: '#FFFFFF',
              borderRadius: 2,
              px: 2.5,
              py: 1,
              fontWeight: 700,
              fontSize: 14,
              boxShadow: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              '&:hover': { bgcolor: '#0369A1' },
            }}
          >
            <Iconify icon="solar:add-circle-bold" width={18} />
            <span>+ إضافة فصل جديد</span>
          </Button>

          <Button
            variant="outlined"
            onClick={handleToggleExpandAll}
            sx={{
              borderColor: '#E2E8F0',
              color: '#475569',
              borderRadius: 2,
              px: 2,
              py: 1,
              fontWeight: 600,
              fontSize: 14,
              bgcolor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              '&:hover': { borderColor: '#CBD5E1', bgcolor: '#F8FAFC' },
            }}
          >
            <Iconify icon="solar:sort-vertical-bold" width={18} />
            <span>{allExpanded ? 'طي الكل' : 'توسيع الكل / طي الكل'}</span>
          </Button>
        </Stack>
      </Stack>

      {/* 2. Main Curriculum Card */}
      <Card
        sx={{
          borderRadius: 3,
          p: { xs: 2.5, sm: 3.5 },
          bgcolor: '#FFFFFF',
          border: '1px solid #F1F3F5',
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.02)',
        }}
      >
        {/* Card Header & Inline Chapter Creator */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', md: 'center' },
            mb: 3,
            pb: 2.5,
            borderBottom: '1px solid #F1F5F9',
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Iconify icon="solar:info-circle-bold" width={22} sx={{ color: '#1E293B' }} />
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B', fontSize: 18 }}>
              معلومات الكورس
            </Typography>
          </Stack>

          {/* Add Chapter Input Box */}
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ width: { xs: '100%', md: 460 }, alignItems: 'center' }}
          >
            <TextField
              id="chapter-creator-input"
              fullWidth
              size="small"
              placeholder="عنوان الفصل (مثال : الفصل الأول - مقدمة)"
              value={newChapterTitle}
              onChange={(e) => setNewChapterTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddChapter();
              }}
              sx={{
                bgcolor: '#F8FAFC',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontSize: 13.5,
                },
              }}
            />

            <Button
              variant="contained"
              onClick={handleAddChapter}
              sx={{
                bgcolor: '#1C252E',
                color: '#FFFFFF',
                borderRadius: 2,
                px: 2.5,
                py: 0.9,
                fontWeight: 700,
                fontSize: 13.5,
                whiteSpace: 'nowrap',
                boxShadow: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                '&:hover': { bgcolor: '#2C353E' },
              }}
            >
              <Iconify icon="mingcute:add-line" width={18} />
              <span>+ إضافة فصل</span>
            </Button>
          </Stack>
        </Stack>

        {/* 3. Chapters Accordions List */}
        <Stack spacing={2}>
          {chapters.map((chapter) => {
            const isExpanded = chapter.isExpanded;
            return (
              <Accordion
                key={chapter.id}
                expanded={isExpanded}
                onChange={() => handleToggleChapter(chapter.id)}
                disableGutters
                sx={{
                  border: '1.5px solid #C6DCFC',
                  borderRadius: '12px !important',
                  bgcolor: '#FFFFFF',
                  boxShadow: 'none',
                  '&:before': { display: 'none' },
                  overflow: 'hidden',
                }}
              >
                {/* Chapter Accordion Summary */}
                <AccordionSummary
                  expandIcon={<Iconify icon="solar:alt-arrow-down-bold" width={20} sx={{ color: '#1E293B' }} />}
                  sx={{
                    bgcolor: isExpanded ? '#FAFBFD' : '#FFFFFF',
                    px: { xs: 2, sm: 2.5 },
                    py: 1,
                    minHeight: 56,
                    borderBottom: isExpanded ? '1px solid #E2E8F0' : 'none',
                    '& .MuiAccordionSummary-content': {
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      m: 0,
                    },
                  }}
                >
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <Typography sx={{ fontWeight: 800, fontSize: 15, color: '#1E293B' }}>
                      {chapter.number}. {chapter.title} :{' '}
                      <Box component="span" sx={{ color: '#64748B', fontWeight: 500, fontSize: 14 }}>
                        ({chapter.lessons.length} دروس)
                      </Box>
                    </Typography>
                  </Stack>

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center', mr: 2 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <IconButton
                      size="small"
                      onClick={(e) => handleDeleteChapter(chapter.id, e)}
                      sx={{
                        color: '#EF4444',
                        bgcolor: '#FEF2F2',
                        border: '1px solid #FECACA',
                        p: 0.8,
                        borderRadius: 1.5,
                        '&:hover': { bgcolor: '#FEE2E2' },
                      }}
                    >
                      <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                    </IconButton>
                  </Stack>
                </AccordionSummary>

                {/* Chapter Accordion Details (Inside Chapter) */}
                <AccordionDetails sx={{ p: { xs: 2, sm: 2.5 }, bgcolor: '#FAFAFA' }}>
                  <Stack spacing={2.5}>
                    {/* Add Lesson Input inside Chapter */}
                    <Stack
                      direction="row"
                      spacing={1.5}
                      sx={{ alignItems: 'center', bgcolor: '#FFFFFF', p: 1.5, borderRadius: 2, border: '1px solid #E2E8F0' }}
                    >
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="عنوان الدرس"
                        value={newLessonTitles[chapter.id] || ''}
                        onChange={(e) =>
                          setNewLessonTitles((prev) => ({
                            ...prev,
                            [chapter.id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddLesson(chapter.id);
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 1.5,
                            fontSize: 13.5,
                            bgcolor: '#F8FAFC',
                          },
                        }}
                      />

                      <Button
                        variant="contained"
                        onClick={() => handleAddLesson(chapter.id)}
                        sx={{
                          bgcolor: '#1C252E',
                          color: '#FFFFFF',
                          borderRadius: 1.5,
                          px: 2.5,
                          py: 0.8,
                          fontWeight: 700,
                          fontSize: 13.5,
                          whiteSpace: 'nowrap',
                          boxShadow: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          '&:hover': { bgcolor: '#2C353E' },
                        }}
                      >
                        <Iconify icon="mingcute:add-line" width={18} />
                        <span>+ إضافة درس</span>
                      </Button>
                    </Stack>

                    {/* Lessons Cards List */}
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
                                      onClick={() => {
                                        if (editingLessonTitle.trim()) {
                                          setChapters((prev) =>
                                            prev.map((ch) =>
                                              ch.id === chapter.id
                                                ? {
                                                    ...ch,
                                                    lessons: ch.lessons.map((l) =>
                                                      l.id === lesson.id
                                                        ? { ...l, title: editingLessonTitle.trim() }
                                                        : l
                                                    ),
                                                  }
                                                : ch
                                            )
                                          );
                                          setEditingLessonId(null);
                                          toast.success('تم تعديل عنوان الدرس');
                                        }
                                      }}
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

                              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                                {hasAttachments && (
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    onClick={() => {
                                      setEditingLessonId(lesson.id);
                                      setEditingLessonTitle(lesson.title);
                                    }}
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
                                    color: '#EF4444',
                                    bgcolor: '#FEF2F2',
                                    border: '1px solid #FEE2E2',
                                    borderRadius: 1.5,
                                    p: 0.8,
                                    '&:hover': { bgcolor: '#FEE2E2' },
                                  }}
                                >
                                  <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                                </IconButton>
                              </Stack>
                            </Stack>

                            {/* Lesson Attachments List (if any) */}
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
                                              onClick={() => handleOpenVideoPreview(att.title)}
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
                                              onClick={() => toast.success('جاري تجهيز وعرض ملف PDF...')}
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
                                                onClick={() => {
                                                  setActiveChapterForQuiz(chapter.title);
                                                  setQuizDialogOpen(true);
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
                                                <Box component="img" src="/icons/exam.svg" alt="exam" sx={{ width: 16, height: 16, filter: 'brightness(0) invert(1)' }} />
                                                <span>معاينة وتعديل الأسئلة ({att.questionsCount || 5})</span>
                                              </Button>
                                              <Button
                                                size="small"
                                                variant="outlined"
                                                onClick={() => {
                                                  setActiveChapterForQuiz(chapter.title);
                                                  setQuizDialogOpen(true);
                                                }}
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
                                              onClick={() => toast.info('يرجى اختيار ملف جديد للاستبدال')}
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

                            {/* Quick Add Attachment Buttons */}
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
                                  onClick={() => handleQuickAddAttachment(chapter.id, lesson.id, 'video')}
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
                                  onClick={() => handleQuickAddAttachment(chapter.id, lesson.id, 'pdf')}
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
                                  onClick={() => handleQuickAddAttachment(chapter.id, lesson.id, 'quiz')}
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
                  </Stack>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Stack>
      </Card>

      {/* 4. Quiz Dialog Modal */}
      <QuizDialog
        open={quizDialogOpen}
        onClose={() => setQuizDialogOpen(false)}
        chapterTitle={activeChapterForQuiz}
      />

      {/* 5. Video Preview Dialog Modal */}
      <Dialog
        open={videoPreviewOpen}
        onClose={() => setVideoPreviewOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: { sx: { borderRadius: 2.5, bgcolor: '#0F172A', color: '#FFFFFF' } },
        }}
      >
        <DialogTitle sx={{ px: 2.5, pt: 2, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
    </Box>
  );
}
