'use client';

import React, { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import Iconify from 'src/components/iconify';
import { Chapter } from '../types';

interface ChaptersStepProps {
  chapters: Chapter[];
  onChaptersChange: (chapters: Chapter[]) => void;
}

const inputRootSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    bgcolor: '#FFFFFF',
    fontSize: '0.9375rem',
    '& fieldset': { borderColor: '#E5E7EB' },
    '&:hover fieldset': { borderColor: '#CBD5E1' },
    '&.Mui-focused fieldset': { borderColor: '#1B8354' },
  },
};

export default function ChaptersStep({
  chapters,
  onChaptersChange,
}: ChaptersStepProps) {
  const t = useTranslations('CreateCourse.chapters');

  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [lessonTitles, setLessonTitles] = useState<Record<string, string>>({});
  const videoInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // 1. Add new chapter
  const handleAddChapter = () => {
    if (!newChapterTitle.trim()) return;
    const newChapter: Chapter = {
      id: `ch-${Date.now()}`,
      title: newChapterTitle.trim(),
      isExpanded: true,
      lessons: [],
    };
    onChaptersChange([...chapters, newChapter]);
    setNewChapterTitle('');
  };

  // 2. Delete chapter
  const handleDeleteChapter = (chapterId: string) => {
    onChaptersChange(chapters.filter((ch) => ch.id !== chapterId));
  };

  // 3. Toggle chapter accordion
  const handleToggleChapter = (chapterId: string) => {
    onChaptersChange(
      chapters.map((ch) =>
        ch.id === chapterId ? { ...ch, isExpanded: !ch.isExpanded } : ch
      )
    );
  };

  // 4. Add lesson to chapter
  const handleAddLesson = (chapterId: string) => {
    const title = lessonTitles[chapterId]?.trim();
    if (!title) return;

    onChaptersChange(
      chapters.map((ch) => {
        if (ch.id !== chapterId) return ch;
        return {
          ...ch,
          lessons: [
            ...ch.lessons,
            {
              id: `les-${Date.now()}`,
              title,
              hasVideo: false,
            },
          ],
        };
      })
    );

    setLessonTitles((prev) => ({ ...prev, [chapterId]: '' }));
  };

  // 5. Delete lesson
  const handleDeleteLesson = (chapterId: string, lessonId: string) => {
    onChaptersChange(
      chapters.map((ch) => {
        if (ch.id !== chapterId) return ch;
        return {
          ...ch,
          lessons: ch.lessons.filter((l) => l.id !== lessonId),
        };
      })
    );
  };

  // 6. Handle video file upload for lesson
  const handleVideoUpload = (
    chapterId: string,
    lessonId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    onChaptersChange(
      chapters.map((ch) => {
        if (ch.id !== chapterId) return ch;
        return {
          ...ch,
          lessons: ch.lessons.map((l) =>
            l.id === lessonId
              ? {
                  ...l,
                  hasVideo: true,
                  videoFile: file,
                  videoName: file.name,
                }
              : l
          ),
        };
      })
    );
  };

  return (
    <Card
      sx={{
        borderRadius: 2.5,
        p: { xs: 2.5, sm: 3.5 },
        bgcolor: '#FFFFFF',
        border: '1px solid #F1F3F5',
        boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.02)',
      }}
    >
      {/* Card Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          mb: 2.5,
        }}
      >
        <Iconify
          icon="solar:info-circle-bold"
          width={24}
          sx={{ color: '#1C252E' }}
        />
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: '#1C252E', fontSize: 18 }}
        >
          {t('card_title')}
        </Typography>
      </Box>

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
            {t('add_chapter_box_title')}
          </Typography>

          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <TextField
              fullWidth
              size="small"
              placeholder={t('chapter_title_placeholder')}
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
              startIcon={<Iconify icon="mingcute:add-line" width={18} />}
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
                gap: 1,
                '&:hover': { bgcolor: '#2C353E' },
              }}
            >
              {t('add_chapter_btn')}
            </Button>
          </Stack>
        </Box>

        {/* 2. Chapters Accordion List */}
        {chapters.map((chapter, chIndex) => (
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
                  {chIndex + 1}. {chapter.title} :{' '}
                  <Box
                    component="span"
                    sx={{ color: '#64748B', fontWeight: 500, fontSize: 14 }}
                  >
                    ({t('lessons_count', { count: chapter.lessons.length })})
                  </Box>
                </Typography>
              </Box>

              {/* Delete Chapter Button */}
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteChapter(chapter.id);
                }}
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
                    placeholder={t('lesson_title_placeholder')}
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
                    startIcon={<Iconify icon="mingcute:add-line" width={18} />}
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
                      gap: 1,
                      '&:hover': { bgcolor: '#2C353E' },
                    }}
                  >
                    {t('add_lesson_btn')}
                  </Button>
                </Stack>

                {/* Lessons List */}
                <Stack spacing={1.5}>
                  {chapter.lessons.map((lesson, lesIndex) => (
                    <Box
                      key={lesson.id}
                      sx={{
                        border: '1px solid #E2E8F0',
                        borderRadius: 2,
                        p: 1.5,
                        px: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        bgcolor: '#FFFFFF',
                      }}
                    >
                      {/* Lesson Title & Video Status */}
                      <Box>
                        <Typography
                          sx={{
                            fontWeight: 600,
                            fontSize: 14,
                            color: '#1E293B',
                          }}
                        >
                          {lesIndex + 1}. {lesson.title}
                        </Typography>
                        {lesson.hasVideo && (
                          <Typography
                            sx={{
                              color: '#10B981',
                              fontSize: 12,
                              fontWeight: 600,
                              mt: 0.25,
                            }}
                          >
                            {t('video_uploaded')}
                          </Typography>
                        )}
                      </Box>

                      {/* Lesson Actions */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {/* Hidden Video Input */}
                        <input
                          ref={(el) => {
                            videoInputRefs.current[lesson.id] = el;
                          }}
                          type="file"
                          accept="video/*"
                          hidden
                          onChange={(e) =>
                            handleVideoUpload(chapter.id, lesson.id, e)
                          }
                        />

                        {/* Upload Video Button */}
                        {!lesson.hasVideo && (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() =>
                              videoInputRefs.current[lesson.id]?.click()
                            }
                            endIcon={
                              <Iconify
                                icon="solar:upload-track-2-bold"
                                width={16}
                              />
                            }
                            sx={{
                              borderColor: '#E2E8F0',
                              color: '#1E293B',
                              borderRadius: 1.5,
                              px: 2,
                              py: 0.6,
                              fontWeight: 600,
                              fontSize: 13,
                              gap: 0.5,
                              '&:hover': {
                                borderColor: '#CBD5E1',
                                bgcolor: '#F8FAFC',
                              },
                            }}
                          >
                            {t('upload_video')}
                          </Button>
                        )}

                        {/* Delete Lesson Button */}
                        <IconButton
                          size="small"
                          onClick={() =>
                            handleDeleteLesson(chapter.id, lesson.id)
                          }
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
                          <Iconify
                            icon="solar:trash-bin-trash-bold"
                            width={18}
                          />
                        </IconButton>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}
          </Box>
        ))}
      </Stack>
    </Card>
  );
}
