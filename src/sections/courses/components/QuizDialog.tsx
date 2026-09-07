'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Iconify from 'src/components/iconify';
import { useToast } from 'src/components/toast';

export interface QuizOption {
  id: string;
  letter: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  id: string;
  number: number;
  title: string;
  points: number;
  options: QuizOption[];
  explanation: string;
}

export interface QuizConfig {
  title: string;
  questions: QuizQuestion[];
}

interface QuizDialogProps {
  open: boolean;
  onClose: () => void;
  chapterTitle?: string;
  onSave?: (config: QuizConfig) => void;
}

const INITIAL_QUIZ: QuizConfig = {
  title: 'اختبار تقييم المفاهيم الأساسية لتشريح القلب',
  questions: [
    {
      id: 'q-1',
      number: 1,
      title: 'ما هو المعدل الطبيعي لضربات القلب في الدقيقة للبالغين أثناء الراحة؟',
      points: 10,
      options: [
        {
          id: 'opt-1',
          letter: 'أ',
          text: '60 - 100 ضربة في الدقيقة',
          isCorrect: true,
        },
        {
          id: 'opt-2',
          letter: 'ب',
          text: '40 - 60 ضربة في الدقيقة',
          isCorrect: false,
        },
        {
          id: 'opt-3',
          letter: 'ج',
          text: '100 - 120 ضربة في الدقيقة',
          isCorrect: false,
        },
        {
          id: 'opt-4',
          letter: 'د',
          text: '120 - 140 ضربة في الدقيقة',
          isCorrect: false,
        },
      ],
      explanation:
        'المعدل الطبيعي لنبضات القلب للبالغين الأصحاء أثناء الراحة يتراوح بين 60 إلى 100 ضربة في الدقيقة. أقل من 60 يعتبر بطء نبض (Bradycardia) وأعلى من 100 يعتبر تسارع (Tachycardia).',
    },
    {
      id: 'q-2',
      number: 2,
      title: 'ما هو الشريان الرئيسي المسؤول عن تغذية الجدار الخلفي للبطين الأيسر؟',
      points: 10,
      options: [
        { id: 'opt-2-1', letter: 'أ', text: 'الشريان التاجي الأيسر النازل الأمامي (LAD)', isCorrect: false },
        { id: 'opt-2-2', letter: 'ب', text: 'الشريان التاجي الأيمن (RCA) عبر الشريان بين البطينين الخلفي', isCorrect: true },
        { id: 'opt-2-3', letter: 'ج', text: 'الشريان المنعطف الأيسر (LCx)', isCorrect: false },
        { id: 'opt-2-4', letter: 'د', text: 'الشريان الهامشي الحاد (Marginal Artery)', isCorrect: false },
      ],
      explanation:
        'في 85% - 90% من البشر (Right Dominant Circulation)، ينشأ الشريان بين البطينين الخلفي (PDA) من الشريان التاجي الأيمن (RCA).',
    },
    {
      id: 'q-3',
      number: 3,
      title: 'أي من الصمامات التالية يفصل بين الأذين الأيسر والبطين الأيسر؟',
      points: 10,
      options: [
        { id: 'opt-3-1', letter: 'أ', text: 'الصمام ثلاثي الشرفات (Tricuspid)', isCorrect: false },
        { id: 'opt-3-2', letter: 'ب', text: 'الصمام الميترالي / التاجي (Mitral)', isCorrect: true },
        { id: 'opt-3-3', letter: 'ج', text: 'الصمام الأبهري (Aortic)', isCorrect: false },
        { id: 'opt-3-4', letter: 'د', text: 'الصمام الرئوي (Pulmonary)', isCorrect: false },
      ],
      explanation:
        'الصمام الميترالي (Mitral Valve) هو صمام ثنائي الشرف يفصل بين الأذين الأيسر والبطين الأيسر وينظم تدفق الدم المؤكسج.',
    },
  ],
};

const ARABIC_LETTERS = ['أ', 'ب', 'ج', 'د', 'هـ', 'و', 'ز', 'ح'];

export default function QuizDialog({
  open,
  onClose,
  chapterTitle = 'الفصل الأول: أساسيات وأمراض القلب والأوعية الدموية',
  onSave,
}: QuizDialogProps) {
  const toast = useToast();
  const [quiz, setQuiz] = useState<QuizConfig>(INITIAL_QUIZ);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);

  const currentQuestion = quiz.questions[activeQuestionIndex] || quiz.questions[0];
  const totalPoints = quiz.questions.reduce((acc, q) => acc + (Number(q.points) || 0), 0);

  // Updates for general config
  const handleConfigChange = <K extends keyof QuizConfig>(field: K, value: QuizConfig[K]) => {
    setQuiz((prev) => ({ ...prev, [field]: value }));
  };

  // Question manipulation
  const handleQuestionTextChange = (text: string) => {
    setQuiz((prev) => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[activeQuestionIndex] = {
        ...updatedQuestions[activeQuestionIndex],
        title: text,
      };
      return { ...prev, questions: updatedQuestions };
    });
  };

  const handleExplanationChange = (text: string) => {
    setQuiz((prev) => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[activeQuestionIndex] = {
        ...updatedQuestions[activeQuestionIndex],
        explanation: text,
      };
      return { ...prev, questions: updatedQuestions };
    });
  };

  const handleOptionTextChange = (optIndex: number, text: string) => {
    setQuiz((prev) => {
      const updatedQuestions = [...prev.questions];
      const updatedOptions = [...updatedQuestions[activeQuestionIndex].options];
      updatedOptions[optIndex] = { ...updatedOptions[optIndex], text };
      updatedQuestions[activeQuestionIndex] = {
        ...updatedQuestions[activeQuestionIndex],
        options: updatedOptions,
      };
      return { ...prev, questions: updatedQuestions };
    });
  };

  const handleSetCorrectOption = (optId: string) => {
    setQuiz((prev) => {
      const updatedQuestions = [...prev.questions];
      const updatedOptions = updatedQuestions[activeQuestionIndex].options.map((opt) => ({
        ...opt,
        isCorrect: opt.id === optId,
      }));
      updatedQuestions[activeQuestionIndex] = {
        ...updatedQuestions[activeQuestionIndex],
        options: updatedOptions,
      };
      return { ...prev, questions: updatedQuestions };
    });
  };

  const handleAddOption = () => {
    if (!currentQuestion) return;
    if (currentQuestion.options.length >= ARABIC_LETTERS.length) {
      toast.warning('تم الوصول إلى الحد الأقصى للخيارات');
      return;
    }
    const nextLetter = ARABIC_LETTERS[currentQuestion.options.length];
    const newOption: QuizOption = {
      id: `opt-${Date.now()}`,
      letter: nextLetter,
      text: '',
      isCorrect: false,
    };
    setQuiz((prev) => {
      const updatedQuestions = [...prev.questions];
      updatedQuestions[activeQuestionIndex] = {
        ...updatedQuestions[activeQuestionIndex],
        options: [...updatedQuestions[activeQuestionIndex].options, newOption],
      };
      return { ...prev, questions: updatedQuestions };
    });
  };

  const handleDeleteOption = (optIndex: number) => {
    if (currentQuestion.options.length <= 2) {
      toast.warning('يجب أن يحتوي السؤال على خيارين على الأقل');
      return;
    }
    setQuiz((prev) => {
      const updatedQuestions = [...prev.questions];
      const filteredOptions = updatedQuestions[activeQuestionIndex].options
        .filter((_, idx) => idx !== optIndex)
        .map((opt, idx) => ({ ...opt, letter: ARABIC_LETTERS[idx] }));

      const hasCorrect = filteredOptions.some((o) => o.isCorrect);
      if (!hasCorrect && filteredOptions.length > 0) {
        filteredOptions[0].isCorrect = true;
      }

      updatedQuestions[activeQuestionIndex] = {
        ...updatedQuestions[activeQuestionIndex],
        options: filteredOptions,
      };
      return { ...prev, questions: updatedQuestions };
    });
  };

  const handleAddNewQuestion = () => {
    const nextNum = quiz.questions.length + 1;
    const newQuestion: QuizQuestion = {
      id: `q-${Date.now()}`,
      number: nextNum,
      title: '',
      points: 10,
      options: [
        { id: `opt-${Date.now()}-1`, letter: 'أ', text: '', isCorrect: true },
        { id: `opt-${Date.now()}-2`, letter: 'ب', text: '', isCorrect: false },
        { id: `opt-${Date.now()}-3`, letter: 'ج', text: '', isCorrect: false },
        { id: `opt-${Date.now()}-4`, letter: 'د', text: '', isCorrect: false },
      ],
      explanation: '',
    };
    setQuiz((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
    setActiveQuestionIndex(quiz.questions.length);
  };

  const handleSaveAndAddAnother = () => {
    toast.success('تم حفظ السؤال الحالي');
    handleAddNewQuestion();
  };

  const handleSaveAll = () => {
    if (onSave) onSave(quiz);
    toast.success('تم حفظ الاختبار والعودة للكورس بنجاح');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            p: { xs: 1.5, sm: 2.5 },
            bgcolor: '#FFFFFF',
            maxHeight: '94vh',
          },
        },
      }}
    >
      {/* 1. Dialog Header */}
      <DialogTitle sx={{ px: 1, pt: 1, pb: 2 }}>
        <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2,
                bgcolor: '#1C252E',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                component="img"
                src="/icons/exam.svg"
                alt="exam"
                sx={{ width: 22, height: 22, filter: 'brightness(0) invert(1)' }}
              />
            </Box>

            <Box>
              <Stack direction="row" spacing={1.2} sx={{ alignItems: 'center', mb: 0.3 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B', fontSize: 17 }}>
                  إعداد واختبار الفصل — بنك الأسئلة
                </Typography>
                <Chip
                  label="اختبار تقييمي"
                  size="small"
                  sx={{
                    bgcolor: '#ECFDF5',
                    color: '#10B981',
                    fontWeight: 700,
                    fontSize: 11.5,
                    borderRadius: 1,
                    height: 22,
                  }}
                />
              </Stack>
              <Typography sx={{ fontSize: 12.5, color: '#64748B', fontWeight: 500 }}>
                {chapterTitle}
              </Typography>
            </Box>
          </Stack>

          <IconButton
            onClick={onClose}
            sx={{
              color: '#94A3B8',
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: 1.5,
              p: 0.8,
              '&:hover': { bgcolor: '#F8FAFC', color: '#1E293B' },
            }}
          >
            <Iconify icon="eva:close-fill" width={18} />
          </IconButton>
        </Stack>
      </DialogTitle>

      {/* 2. Dialog Content Body */}
      <DialogContent sx={{ px: 1, py: 1.5 }}>
        <Stack spacing={2.5}>
          {/* Section 1: إعدادات الاختبار العامة */}
          <Card
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: '#FFFFFF',
              borderColor: '#E2E8F0',
            }}
          >
            {/* Header: Title + Apply to all */}
            <Stack
              direction="row"
              sx={{
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2,
              }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Iconify icon="solar:tuning-square-bold" width={18} sx={{ color: '#64748B' }} />
                <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#1E293B' }}>
                  إعدادات الاختبار العامة
                </Typography>
              </Stack>

              <Button
                size="small"
                variant="text"
                onClick={() => toast.success('تم تطبيق الإعدادات على جميع الطلاب')}
                sx={{
                  bgcolor: '#EFF6FF',
                  color: '#0284C7',
                  fontWeight: 700,
                  fontSize: 12,
                  px: 1.5,
                  py: 0.3,
                  borderRadius: 1,
                  '&:hover': { bgcolor: '#DBEAFE' },
                }}
              >
                تطبيق على جميع الطلاب
              </Button>
            </Stack>

            {/* Quiz Title */}
            <Box>
              <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#1E293B', mb: 0.6 }}>
                عنوان الاختبار*
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={quiz.title}
                onChange={(e) => handleConfigChange('title', e.target.value)}
                sx={{
                  bgcolor: '#FFFFFF',
                  '& .MuiOutlinedInput-root': { borderRadius: 1.5, fontSize: 13.5 },
                }}
              />
            </Box>
          </Card>

          {/* Section 2: الأسئلة والخيارات */}
          <Box>
            {/* Header: Title + Badge + Add Question Button */}
            <Stack
              direction="row"
              sx={{
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1.5,
              }}
            >
              <Stack direction="row" spacing={1.2} sx={{ alignItems: 'center' }}>
                <Iconify icon="solar:list-bold" width={20} sx={{ color: '#64748B' }} />
                <Typography sx={{ fontSize: 15, fontWeight: 800, color: '#1E293B' }}>
                  الأسئلة والخيارات
                </Typography>
                <Chip
                  label={`${quiz.questions.length} أسئلة مضافة (الإجمالي: ${totalPoints} درجة)`}
                  size="small"
                  sx={{
                    bgcolor: '#F1F5F9',
                    color: '#64748B',
                    fontWeight: 700,
                    fontSize: 11.5,
                    borderRadius: 1,
                  }}
                />
              </Stack>

              <Button
                variant="contained"
                size="small"
                onClick={handleAddNewQuestion}
                sx={{
                  bgcolor: '#1C252E',
                  color: '#FFFFFF',
                  borderRadius: 1.5,
                  fontWeight: 700,
                  fontSize: 13,
                  boxShadow: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.8,
                  px: 2,
                  py: 0.7,
                  '&:hover': { bgcolor: '#2C353E' },
                }}
              >
                <Iconify icon="solar:add-circle-bold" width={16} />
                <span>+ إضافة سؤال جديد</span>
              </Button>
            </Stack>

            {/* Question Navigator Pills */}
            <Stack
              direction="row"
              spacing={1.2}
              sx={{
                mb: 2,
                alignItems: 'center',
                overflowX: 'auto',
                py: 0.5,
              }}
            >
              <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#64748B', whiteSpace: 'nowrap' }}>
                تصفح الأسئلة:
              </Typography>

              {quiz.questions.map((q, idx) => {
                const isActive = idx === activeQuestionIndex;
                return (
                  <Button
                    key={q.id}
                    variant={isActive ? 'contained' : 'outlined'}
                    onClick={() => setActiveQuestionIndex(idx)}
                    sx={{
                      borderRadius: 1.5,
                      px: 1.8,
                      py: 0.6,
                      fontSize: 12.5,
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                      bgcolor: isActive ? '#EFF6FF' : '#FFFFFF',
                      color: isActive ? '#0284C7' : '#64748B',
                      borderColor: isActive ? '#0284C7' : '#E2E8F0',
                      boxShadow: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.8,
                      '&:hover': {
                        bgcolor: isActive ? '#DBEAFE' : '#F8FAFC',
                        borderColor: isActive ? '#0284C7' : '#CBD5E1',
                      },
                    }}
                  >
                    {isActive ? (
                      <Box
                        sx={{
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          bgcolor: '#0284C7',
                        }}
                      />
                    ) : (
                      <Iconify icon="solar:check-circle-bold" width={14} sx={{ color: '#10B981' }} />
                    )}
                    <span>السؤال {q.number}</span>
                  </Button>
                );
              })}
            </Stack>

            {/* Active Question Box */}
            {currentQuestion && (
              <Card
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  borderColor: '#E2E8F0',
                  bgcolor: '#FFFFFF',
                }}
              >
                {/* Question Card Banner Header */}
                <Box
                  sx={{
                    bgcolor: '#EEF2F6',
                    px: 2,
                    py: 1.2,
                    borderRadius: 1.5,
                    mb: 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: '#475569',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: 12,
                    }}
                  >
                    {currentQuestion.number}
                  </Box>
                  <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#1E293B' }}>
                    {currentQuestion.number === 1
                      ? 'محرر السؤال الأول'
                      : currentQuestion.number === 2
                      ? 'محرر السؤال الثاني'
                      : currentQuestion.number === 3
                      ? 'محرر السؤال الثالث'
                      : `محرر السؤال رقم ${currentQuestion.number}`}
                  </Typography>
                </Box>

                {/* Question Text */}
                <Box sx={{ mb: 2.5 }}>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#1E293B', mb: 0.6 }}>
                    نص السؤال*
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    placeholder="اكتب نص السؤال هنا..."
                    value={currentQuestion.title}
                    onChange={(e) => handleQuestionTextChange(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1.5,
                        fontSize: 13.5,
                        bgcolor: '#FFFFFF',
                      },
                    }}
                  />
                </Box>

                {/* Options Section */}
                <Box sx={{ mb: 1 }}>
                  <Stack
                    direction="row"
                    sx={{
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 1.5,
                    }}
                  >
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>
                      الخيارات والإجابة الصحيحة
                    </Typography>
                    <Typography sx={{ fontSize: 11.5, color: '#94A3B8' }}>
                      اختر الدائرة لتحديد الإجابة المعتمدة
                    </Typography>
                  </Stack>

                  <RadioGroup
                    value={currentQuestion.options.find((o) => o.isCorrect)?.id || ''}
                    onChange={(e) => handleSetCorrectOption(e.target.value)}
                  >
                    <Stack spacing={1.2}>
                      {currentQuestion.options.map((option, optIdx) => {
                        const isCorrect = option.isCorrect;
                        return (
                          <Card
                            key={option.id}
                            variant="outlined"
                            sx={{
                              p: 1,
                              px: 1.5,
                              borderRadius: 2,
                              borderColor: isCorrect ? '#059669' : '#E2E8F0',
                              borderWidth: isCorrect ? 1.5 : 1,
                              bgcolor: isCorrect ? '#F0FDF4' : '#FFFFFF',
                              transition: 'all 0.2s',
                            }}
                          >
                            <Stack
                              direction="row"
                              spacing={1.5}
                              sx={{
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                width: '100%',
                              }}
                            >
                              {/* 1. Right Side in RTL (Start of row): Radio Button + Letter Box + Text Field */}
                              <Stack
                                direction="row"
                                spacing={1.5}
                                sx={{ alignItems: 'center', flex: 1 }}
                              >
                                <Radio
                                  value={option.id}
                                  checked={isCorrect}
                                  size="small"
                                  sx={{
                                    p: 0.5,
                                    color: '#CBD5E1',
                                    '&.Mui-checked': { color: '#059669' },
                                  }}
                                />

                                <Box
                                  sx={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: 1,
                                    bgcolor: isCorrect ? '#059669' : '#EFF6FF',
                                    color: isCorrect ? '#FFFFFF' : '#0284C7',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 700,
                                    fontSize: 12,
                                  }}
                                >
                                  {option.letter}
                                </Box>

                                <TextField
                                  fullWidth
                                  size="small"
                                  placeholder={`الخيار (${option.letter})`}
                                  value={option.text}
                                  onChange={(e) => handleOptionTextChange(optIdx, e.target.value)}
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      bgcolor: 'transparent',
                                      borderRadius: 1.5,
                                      fontSize: 13,
                                      '& fieldset': { border: 'none' },
                                    },
                                    '& .MuiOutlinedInput-input': {
                                      fontWeight: 600,
                                      color: '#1E293B',
                                      py: 0.5,
                                    },
                                  }}
                                />
                              </Stack>

                              {/* 2. Left Side in RTL (End of row): Correct Badge + Trash Button */}
                              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexShrink: 0 }}>
                                {isCorrect && (
                                  <Chip
                                    label="✓ الإجابة الصحيحة"
                                    size="small"
                                    sx={{
                                      bgcolor: '#059669',
                                      color: '#FFFFFF',
                                      fontWeight: 700,
                                      fontSize: 11.5,
                                      borderRadius: 1,
                                      height: 24,
                                    }}
                                  />
                                )}

                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteOption(optIdx)}
                                  sx={{
                                    color: '#94A3B8',
                                    '&:hover': { color: '#EF4444', bgcolor: '#FEF2F2' },
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
                  </RadioGroup>

                  {/* Add option button aligned on the left (End in RTL) */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1.5 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleAddOption}
                      sx={{
                        borderStyle: 'dashed',
                        borderColor: '#CBD5E1',
                        color: '#1E293B',
                        borderRadius: 1.5,
                        fontWeight: 600,
                        fontSize: 12,
                        bgcolor: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.8,
                        px: 1.5,
                        py: 0.5,
                        '&:hover': { borderColor: '#94A3B8', bgcolor: '#F8FAFC' },
                      }}
                    >
                      <Iconify icon="solar:add-circle-bold" width={15} sx={{ color: '#10B981' }} />
                      <span>+ إضافة خيار إضافي</span>
                    </Button>
                  </Box>
                </Box>
              </Card>
            )}
          </Box>

          {/* Section 3: تفسير الإجابة وملاحظات الدكتور التي تظهر للطالب */}
          <Card
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: '#FFFFFF',
              borderColor: '#E2E8F0',
            }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1.2 }}>
              <Iconify icon="solar:document-text-bold" width={18} sx={{ color: '#1E293B' }} />
              <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: '#1E293B' }}>
                تفسير الإجابة وملاحظات الدكتور التي تظهر للطالب
              </Typography>
            </Stack>

            <TextField
              fullWidth
              multiline
              minRows={2.5}
              placeholder="اكتب التفسير الطبي والملاحظات التوضيحية للطالب عند مراجعة إجاباته..."
              value={currentQuestion.explanation}
              onChange={(e) => handleExplanationChange(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1.5,
                  fontSize: 12.5,
                  lineHeight: 1.7,
                  bgcolor: '#FFFFFF',
                },
              }}
            />
          </Card>
        </Stack>
      </DialogContent>

      {/* 3. Footer Actions */}
      <DialogActions sx={{ px: 1, py: 1.5 }}>
        <Stack
          direction="row"
          sx={{
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
          }}
        >
          {/* Action buttons on the right side in RTL */}
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="contained"
              onClick={handleSaveAll}
              startIcon={<Iconify icon="solar:check-circle-bold" width={16} />}
              sx={{
                bgcolor: '#1C252E',
                color: '#FFFFFF',
                borderRadius: 1.5,
                px: 2.5,
                py: 0.9,
                fontWeight: 700,
                fontSize: 13,
                boxShadow: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 0.8,
                '&:hover': { bgcolor: '#2C353E' },
              }}
            >
              حفظ الاختبار والعودة للكورس
            </Button>

            <Button
              variant="contained"
              onClick={handleSaveAndAddAnother}
              startIcon={<Iconify icon="solar:add-circle-bold" width={16} />}
              sx={{
                bgcolor: '#1C252E',
                color: '#FFFFFF',
                borderRadius: 1.5,
                px: 2.5,
                py: 0.9,
                fontWeight: 700,
                fontSize: 13,
                boxShadow: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 0.8,
                '&:hover': { bgcolor: '#2C353E' },
              }}
            >
              حفظ وإضافة سؤال آخر
            </Button>
          </Stack>

          {/* Cancel button on the left side in RTL */}
          <Button
            variant="outlined"
            onClick={onClose}
            startIcon={<Iconify icon="mingcute:close-line" width={16} />}
            sx={{
              borderColor: '#E2E8F0',
              color: '#1E293B',
              borderRadius: 1.5,
              px: 3,
              py: 0.9,
              fontWeight: 600,
              fontSize: 13,
              bgcolor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              gap: 0.8,
              '&:hover': { bgcolor: '#F8FAFC', borderColor: '#CBD5E1' },
            }}
          >
            إلغاء
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
