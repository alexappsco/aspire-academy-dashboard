'use client';

import React, { useState } from 'react';
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
import Iconify from 'src/components/iconify';
import { useToast } from 'src/components/toast';
import { RequestChapter, RequestLesson, LessonAttachment } from 'src/types/private-request';

interface Props {
  initialChapters?: RequestChapter[];
}

export default function RecordedCurriculumSection({ initialChapters }: Props) {
  const toast = useToast();

  const [chapters, setChapters] = useState<RequestChapter[]>(initialChapters || []);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [activeChapterId, setActiveChapterId] = useState<string>(
    initialChapters?.[0]?.id || 'ch-1'
  );

  // Video preview dialog
  const [videoPreviewOpen, setVideoPreviewOpen] = useState(false);
  const [previewVideoTitle, setPreviewVideoTitle] = useState('');

  // Edit lesson title dialog
  const [editingLesson, setEditingLesson] = useState<{ chapterId: string; lesson: RequestLesson } | null>(null);
  const [editedTitle, setEditedTitle] = useState('');

  // Toggle chapter accordion
  const handleToggleChapter = (chapterId: string) => {
    setChapters((prev) =>
      prev.map((ch) => (ch.id === chapterId ? { ...ch, isExpanded: !ch.isExpanded } : ch))
    );
  };

  // Delete chapter
  const handleDeleteChapter = (chapterId: string) => {
    setChapters((prev) => prev.filter((ch) => ch.id !== chapterId));
    toast.success('تم حذف الفصل بنجاح');
  };

  // Add lesson
  const handleAddLesson = () => {
    if (!newLessonTitle.trim()) {
      toast.warning('يرجى إدخال عنوان الدرس');
      return;
    }
    const newLes: RequestLesson = {
      id: `les-${Date.now()}`,
      number: 1,
      title: newLessonTitle.trim(),
      statusBadge: 'مضاف حديثاً',
      attachments: [],
    };

    setChapters((prev) => {
      if (prev.length === 0) {
        return [
          {
            id: 'ch-1',
            number: 1,
            title: 'الفصل الأول - أساسيات',
            isExpanded: true,
            lessons: [newLes],
          },
        ];
      }
      return prev.map((ch) =>
        ch.id === activeChapterId
          ? { ...ch, isExpanded: true, lessons: [newLes, ...ch.lessons] }
          : ch
      );
    });

    setNewLessonTitle('');
    toast.success('تمت إضافة الدرس بنجاح، يمكنك الآن إرفاق الفيديو والمستندات');
  };

  // Edit lesson title
  const handleOpenEditLesson = (chapterId: string, lesson: RequestLesson) => {
    setEditingLesson({ chapterId, lesson });
    setEditedTitle(lesson.title);
  };

  const handleSaveEditLesson = () => {
    if (!editingLesson || !editedTitle.trim()) return;
    setChapters((prev) =>
      prev.map((ch) =>
        ch.id === editingLesson.chapterId
          ? {
              ...ch,
              lessons: ch.lessons.map((les) =>
                les.id === editingLesson.lesson.id ? { ...les, title: editedTitle.trim() } : les
              ),
            }
          : ch
      )
    );
    setEditingLesson(null);
    toast.success('تم تحديث عنوان الدرس بنجاح');
  };

  // Delete lesson
  const handleDeleteLesson = (chapterId: string, lessonId: string) => {
    setChapters((prev) =>
      prev.map((ch) =>
        ch.id === chapterId
          ? { ...ch, lessons: ch.lessons.filter((l) => l.id !== lessonId) }
          : ch
      )
    );
    toast.success('تم حذف الدرس بنجاح');
  };

  // Delete attachment
  const handleDeleteAttachment = (chapterId: string, lessonId: string, attachmentId: string) => {
    setChapters((prev) =>
      prev.map((ch) =>
        ch.id === chapterId
          ? {
              ...ch,
              lessons: ch.lessons.map((les) =>
                les.id === lessonId
                  ? {
                      ...les,
                      attachments: les.attachments.filter((a) => a.id !== attachmentId),
                    }
                  : les
              ),
            }
          : ch
      )
    );
    toast.success('تم حذف المرفق بنجاح');
  };

  // Add dummy attachment
  const handleAddAttachment = (chapterId: string, lessonId: string, type: 'video' | 'document' | 'quiz') => {
    const dummy: LessonAttachment =
      type === 'video'
        ? {
            id: `att-${Date.now()}`,
            type: 'video',
            title: 'فيديو توضيحي إضافي mp4',
            quality: '1080p Full HD',
            fileSize: '185 MB',
            duration: '14:20 دقيقة',
            statusText: 'تمت المعالجة والرفع بنجاح',
            url: '#',
          }
        : type === 'document'
        ? {
            id: `att-${Date.now()}`,
            type: 'document',
            title: 'ملاحظات إضافية ومراجع pdf',
            fileSize: '2.1 MB',
            pagesCount: 15,
            statusText: 'جاهز للتحميل للطلاب',
            url: '#',
          }
        : {
            id: `att-${Date.now()}`,
            type: 'quiz',
            title: 'اختبار تجريبي قصير (MCQ)',
            passingScore: 60,
            questionsCount: 3,
            statusText: 'مفعل',
          };

    setChapters((prev) =>
      prev.map((ch) =>
        ch.id === chapterId
          ? {
              ...ch,
              lessons: ch.lessons.map((les) =>
                les.id === lessonId
                  ? { ...les, attachments: [...les.attachments, dummy] }
                  : les
              ),
            }
          : ch
      )
    );
    toast.success(`تمت إضافة ${type === 'video' ? 'فيديو جديد' : type === 'document' ? 'مستند جديد' : 'اختبار جديد'}`);
  };

  return (
    <Box sx={{ mb: 3 }}>
      {/* 1. Green Action / Upload Notice Banner */}
      <Box
        sx={{
          p: 2.25,
          borderRadius: 2.5,
          bgcolor: '#ECFDF5',
          border: '1px solid #A7F3D0',
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          mb: 2.5,
        }}
      >
        {/* Right in RTL (First child): Title and Icon */}
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: '#D1FAE5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Iconify icon="solar:clapperboard-play-bold" width={22} />
          </Box>
          <Box sx={{ textAlign: 'start' }}>
            <Typography sx={{ fontWeight: 800, fontSize: 15.5, color: '#065F46' }}>
              إضافة محاضرة أو مقطع مسجل جديد
            </Typography>
            <Typography sx={{ fontSize: 12, color: '#047857', mt: 0.25 }}>
              يتم التحقق من مدة الفيديو وحساب ساعاته التلقائية فور الرفع.
            </Typography>
          </Box>
        </Stack>

        {/* Left in RTL (Second child): Add content button */}
        <Button
          variant="contained"
          startIcon={<Iconify icon="solar:videocamera-add-bold" width={18} />}
          onClick={() => {
            const el = document.getElementById('lesson-title-input');
            el?.focus();
          }}
          sx={{
            borderRadius: 2,
            bgcolor: '#047857',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: 13.5,
            px: 2.5,
            py: 1,
            boxShadow: 'none',
            flexShrink: 0,
            '&:hover': {
              bgcolor: '#065F46',
              boxShadow: 'none',
            },
          }}
        >
          + إضافة محتوى مسجل
        </Button>
      </Box>

      {/* 2. Add Lesson Input Bar: Input on RIGHT (First in RTL), Button on LEFT (Second in RTL) */}
      <Card
        sx={{
          p: 2,
          borderRadius: 2.5,
          bgcolor: '#FFFFFF',
          border: '1px solid #F1F5F9',
          boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
          mb: 2.5,
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: 'center', gap: 1.5 }}>
          <TextField
            id="lesson-title-input"
            fullWidth
            size="small"
            placeholder="عنوان الدرس..."
            value={newLessonTitle}
            onChange={(e) => setNewLessonTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddLesson();
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fontSize: 14,
                bgcolor: '#F8FAFC',
              },
            }}
          />

          <Button
            variant="contained"
            onClick={handleAddLesson}
            startIcon={<Iconify icon="solar:add-circle-bold" width={18} />}
            sx={{
              borderRadius: 2,
              bgcolor: '#0F172A',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: 13.5,
              px: 2.5,
              py: 1.25,
              flexShrink: 0,
              width: { xs: '100%', sm: 'auto' },
              boxShadow: 'none',
              '&:hover': { bgcolor: '#1E293B', boxShadow: 'none' },
            }}
          >
            إضافة درس
          </Button>
        </Stack>
      </Card>

      {/* 3. Chapters & Lessons Accordions */}
      <Stack spacing={2} sx={{ mb: 2.5 }}>
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
              {/* Chapter Header: Title on RIGHT (First in RTL), Delete on LEFT (Second in RTL) */}
              <Box
                onClick={() => handleToggleChapter(chapter.id)}
                sx={{
                  p: 2,
                  bgcolor: '#F8FAFC',
                  borderBottom: isExpanded ? '1px solid #E2E8F0' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  userSelect: 'none',
                  '&:hover': { bgcolor: '#F1F5F9' },
                }}
              >
                {/* Chapter Title & Arrow (Right in RTL) */}
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', gap: 1.5 }}>
                  <Iconify
                    icon={isExpanded ? 'solar:alt-arrow-up-linear' : 'solar:alt-arrow-down-linear'}
                    width={18}
                    sx={{ color: '#64748B' }}
                  />
                  <Typography sx={{ fontWeight: 800, fontSize: 15, color: '#0F172A' }}>
                    {chapter.number}. {chapter.title} ({chapter.lessons.length} دروس)
                  </Typography>
                </Stack>

                {/* Delete chapter button (Left in RTL) */}
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteChapter(chapter.id);
                  }}
                  sx={{ color: '#EF4444', '&:hover': { bgcolor: '#FEF2F2' } }}
                >
                  <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                </IconButton>
              </Box>

              {/* Chapter Lessons Collapse */}
              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {chapter.lessons.length === 0 ? (
                    <Typography sx={{ color: '#94A3B8', fontSize: 13, textAlign: 'center', py: 3 }}>
                      لا توجد دروس مضافة في هذا الفصل بعد.
                    </Typography>
                  ) : (
                    chapter.lessons.map((lesson) => (
                      <Card
                        key={lesson.id}
                        sx={{
                          p: { xs: 2, sm: 2.5 },
                          borderRadius: 2,
                          bgcolor: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          boxShadow: 'none',
                        }}
                      >
                        {/* Lesson Top Row: Title on RIGHT (First in RTL), Actions on LEFT (Second in RTL) */}
                        <Stack
                          direction="row"
                          spacing={1.5}
                          sx={{
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 2,
                            flexWrap: 'wrap',
                            gap: 1,
                          }}
                        >
                          {/* Right in RTL (First child): Lesson Title & Status badge */}
                          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography sx={{ fontWeight: 800, fontSize: 14.5, color: '#0F172A' }}>
                              {lesson.number}. {lesson.title}
                            </Typography>
                            {lesson.statusBadge && (
                              <Chip
                                label={lesson.statusBadge}
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
                            )}
                          </Stack>

                          {/* Left in RTL (Second child): Actions: Edit title & Delete */}
                          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                            <Button
                              size="small"
                              variant="text"
                              startIcon={<Iconify icon="solar:pen-new-square-linear" width={15} />}
                              onClick={() => handleOpenEditLesson(chapter.id, lesson)}
                              sx={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}
                            >
                              تعديل العنوان
                            </Button>
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteLesson(chapter.id, lesson.id)}
                              sx={{ color: '#EF4444', '&:hover': { bgcolor: '#FEF2F2' } }}
                            >
                              <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                            </IconButton>
                          </Stack>
                        </Stack>

                        {/* Attachments List */}
                        <Stack spacing={1.5} sx={{ mb: 2 }}>
                          {lesson.attachments.map((att) => {
                            const isVid = att.type === 'video';
                            const isDoc = att.type === 'document';
                            const isQuiz = att.type === 'quiz';

                            return (
                              <Box
                                key={att.id}
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
                                {/* Right in RTL (First child): Description & Icon */}
                                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', textAlign: 'start', gap: 1.5, width: { xs: '100%', md: 'auto' } }}>
                                  <Box
                                    sx={{
                                      width: 36,
                                      height: 36,
                                      borderRadius: 2,
                                      bgcolor: isVid ? '#EFF6FF' : isDoc ? '#FEF2F2' : '#ECFDF5',
                                      color: isVid ? '#2563EB' : isDoc ? '#DC2626' : '#059669',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      flexShrink: 0,
                                    }}
                                  >
                                    <Iconify
                                      icon={
                                        isVid
                                          ? 'solar:video-frame-play-horizontal-bold'
                                          : isDoc
                                          ? 'solar:document-text-bold'
                                          : 'solar:diploma-verified-bold'
                                      }
                                      width={20}
                                    />
                                  </Box>

                                  <Box sx={{ flex: 1 }}>
                                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                                      <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>
                                        {att.title}
                                      </Typography>
                                      {att.statusText && (
                                        <Typography sx={{ fontSize: 11, color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 0.25 }}>
                                          <Iconify icon="solar:check-circle-bold" width={13} />
                                          {att.statusText}
                                        </Typography>
                                      )}
                                    </Stack>

                                    <Typography sx={{ fontSize: 11.5, color: '#64748B', mt: 0.25 }}>
                                      {isVid && `الجودة: ${att.quality || '1080p Full HD'} • الحجم: ${att.fileSize || '340 MB'} • المدة: ${att.duration || '24:15 دقيقة'}`}
                                      {isDoc && `الحجم: ${att.fileSize || '4.8 MB'} • ${att.pagesCount || 32} صفحة • ملف PDF إلكتروني`}
                                      {isQuiz && `درجة الاجتياز: %${att.passingScore || 60} • ${att.questionsCount || 5} أسئلة تدريبية تفاعلية (MCQ)`}
                                    </Typography>
                                  </Box>
                                </Stack>

                                {/* Left in RTL (Second child): Action Buttons */}
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  sx={{
                                    alignItems: 'center',
                                    flexWrap: 'wrap',
                                    gap: 1,
                                    width: { xs: '100%', md: 'auto' },
                                    justifyContent: { xs: 'flex-start', md: 'flex-end' },
                                  }}
                                >
                                  {isVid && (
                                    <>
                                      <Button
                                        size="small"
                                        variant="contained"
                                        startIcon={<Iconify icon="solar:play-bold" width={14} />}
                                        onClick={() => {
                                          setPreviewVideoTitle(att.title);
                                          setVideoPreviewOpen(true);
                                        }}
                                        sx={{
                                          borderRadius: 1.5,
                                          fontSize: 11.5,
                                          fontWeight: 800,
                                          bgcolor: '#0F172A',
                                          color: '#FFFFFF',
                                          boxShadow: 'none',
                                          '&:hover': { bgcolor: '#1E293B', boxShadow: 'none' },
                                        }}
                                      >
                                        معاينة الفيديو
                                      </Button>
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() => {
                                          toast.info('تم بدء استبدال الفيديو...');
                                        }}
                                        sx={{ borderRadius: 1.5, fontSize: 11.5, fontWeight: 700, borderColor: '#CBD5E1', color: '#475569' }}
                                      >
                                        استبدال
                                      </Button>
                                    </>
                                  )}

                                  {isDoc && (
                                    <>
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        startIcon={<Iconify icon="solar:file-download-linear" width={15} />}
                                        onClick={() => toast.info('جاري فتح / تحميل المستند...')}
                                        sx={{ borderRadius: 1.5, fontSize: 11.5, fontWeight: 700, borderColor: '#CBD5E1', color: '#0F172A' }}
                                      >
                                        تحميل / عرض
                                      </Button>
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() => {
                                          toast.info('تم بدء استبدال المستند...');
                                        }}
                                        sx={{ borderRadius: 1.5, fontSize: 11.5, fontWeight: 700, borderColor: '#CBD5E1', color: '#475569' }}
                                      >
                                        استبدال
                                      </Button>
                                    </>
                                  )}

                                  {isQuiz && (
                                    <>
                                      <Button
                                        size="small"
                                        variant="contained"
                                        startIcon={<Iconify icon="solar:document-add-bold" width={14} />}
                                        onClick={() => toast.info('معاينة بنك الأسئلة')}
                                        sx={{
                                          borderRadius: 1.5,
                                          fontSize: 11.5,
                                          fontWeight: 800,
                                          bgcolor: '#0F172A',
                                          color: '#FFFFFF',
                                          boxShadow: 'none',
                                          '&:hover': { bgcolor: '#1E293B', boxShadow: 'none' },
                                        }}
                                      >
                                        معاينة وتعديل الأسئلة ({att.questionsCount || 5})
                                      </Button>
                                      <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() => toast.info('إضافة سؤال جديد للاختبار')}
                                        sx={{ borderRadius: 1.5, fontSize: 11.5, fontWeight: 700, borderColor: '#CBD5E1', color: '#475569' }}
                                      >
                                        + إضافة سؤال
                                      </Button>
                                    </>
                                  )}

                                  <IconButton
                                    size="small"
                                    onClick={() => handleDeleteAttachment(chapter.id, lesson.id, att.id)}
                                    sx={{ color: '#EF4444', '&:hover': { bgcolor: '#FEF2F2' } }}
                                  >
                                    <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                                  </IconButton>
                                </Stack>
                              </Box>
                            );
                          })}
                        </Stack>

                        {/* Add Attachments Buttons Row & Order Hint */}
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' },
                            alignItems: { xs: 'flex-start', md: 'center' },
                            justifyContent: 'space-between',
                            pt: 1.5,
                            borderTop: '1px dashed #E2E8F0',
                            gap: 1.5,
                          }}
                        >
                          {/* Right in RTL: Reorder Hint */}
                          <Typography sx={{ fontSize: 11.5, color: '#94A3B8' }}>
                            يمكنك سحب وإفلات المرفقات لإعادة ترتيب ظهورها للطلاب
                          </Typography>

                          {/* Left in RTL: Add Media Buttons */}
                          <Stack
                            direction="row"
                            spacing={1}
                            sx={{
                              flexWrap: 'wrap',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<Iconify icon="solar:videocamera-record-linear" width={15} />}
                              onClick={() => handleAddAttachment(chapter.id, lesson.id, 'video')}
                              sx={{ borderRadius: 1.5, fontSize: 11.5, fontWeight: 700, borderColor: '#E2E8F0', color: '#334155' }}
                            >
                              + فيديو إضافي
                            </Button>

                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<Iconify icon="solar:document-linear" width={15} />}
                              onClick={() => handleAddAttachment(chapter.id, lesson.id, 'document')}
                              sx={{ borderRadius: 1.5, fontSize: 11.5, fontWeight: 700, borderColor: '#E2E8F0', color: '#334155' }}
                            >
                              + مستند إضافي
                            </Button>

                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<Iconify icon="solar:question-circle-linear" width={15} />}
                              onClick={() => handleAddAttachment(chapter.id, lesson.id, 'quiz')}
                              sx={{ borderRadius: 1.5, fontSize: 11.5, fontWeight: 700, borderColor: '#E2E8F0', color: '#334155' }}
                            >
                              + إضافة أسئلة
                            </Button>
                          </Stack>
                        </Box>
                      </Card>
                    ))
                  )}
                </Box>
              </Collapse>
            </Card>
          );
        })}
      </Stack>

      {/* 4. Important Notice Alert */}
      <Box
        sx={{
          p: 1.75,
          px: 2,
          borderRadius: 2,
          bgcolor: '#EFF6FF',
          border: '1px solid #BFDBFE',
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        <Box sx={{ color: '#2563EB', flexShrink: 0, display: 'flex' }}>
          <Iconify icon="solar:info-circle-bold" width={20} />
        </Box>
        <Typography sx={{ fontSize: 12.5, color: '#1E40AF', fontWeight: 600 }}>
          <strong>تنويه هام:</strong> رفع المحتوى لا ينهي الطلب تلقائياً، يظل الطلب قيد التنفيذ ومتاحاً لإضافة مقاطع إضافية حتى تختار يدوياً الضغط على زر &quot;إنهاء الخدمة&quot; عند اكتمال متطلبات الطالب بالكامل.
        </Typography>
      </Box>

      {/* Video Preview Modal */}
      <Dialog
        open={videoPreviewOpen}
        onClose={() => setVideoPreviewOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, overflow: 'hidden' } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: 16, bgcolor: '#0F172A', color: '#FFFFFF', py: 1.5 }}>
          {previewVideoTitle || 'معاينة الفيديو'}
        </DialogTitle>
        <DialogContent sx={{ p: 0, bgcolor: '#000000', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 380 }}>
          <Box sx={{ textAlign: 'center', color: '#94A3B8' }}>
            <Iconify icon="solar:play-circle-bold" width={64} sx={{ color: '#FFFFFF', mb: 1.5, cursor: 'pointer' }} />
            <Typography sx={{ fontSize: 14, color: '#FFFFFF', fontWeight: 700 }}>
              مشغل الفيديو التجريبي
            </Typography>
            <Typography sx={{ fontSize: 12, color: '#94A3B8', mt: 0.5 }}>
              1080p Full HD • 60 FPS
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 1.5, bgcolor: '#0F172A' }}>
          <Button
            variant="contained"
            onClick={() => setVideoPreviewOpen(false)}
            sx={{ borderRadius: 1.5, bgcolor: '#334155', color: '#FFFFFF', '&:hover': { bgcolor: '#475569' } }}
          >
            إغلاق
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Lesson Title Dialog */}
      <Dialog
        open={Boolean(editingLesson)}
        onClose={() => setEditingLesson(null)}
        maxWidth="xs"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 2.5 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: 16 }}>
          تعديل عنوان الدرس
        </DialogTitle>
        <DialogContent sx={{ py: 1 }}>
          <TextField
            fullWidth
            size="small"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            autoFocus
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button variant="outlined" onClick={() => setEditingLesson(null)}>
            إلغاء
          </Button>
          <Button variant="contained" onClick={handleSaveEditLesson} sx={{ bgcolor: '#0F172A', '&:hover': { bgcolor: '#1E293B' } }}>
            حفظ
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
