'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import Iconify from 'src/components/iconify';
import SharedTable from 'src/components/SharedTable/SharedTable';
import { cellAlignment } from 'src/components/SharedTable/types';
import { useToast } from 'src/components/toast';
import { getFaqs, deleteFaq } from 'src/actions/faqs';
import type { FaqItem } from 'src/types/faq';

import QuestionFormDialog from './new-edit-question-dialog';
import DeleteConfirmDialog from './delete-confirm-dialog';

interface FormattedQuestion {
  id: string;
  question: string;
  answer: string;
}

export default function CommonQuestionsView() {
  const t = useTranslations('CommonQuestions');
  const toast = useToast();
  const locale = useLocale();
  const isRtl = locale === 'ar';

  const [items, setItems] = useState<FaqItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<FaqItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(debounceTimer.current);
  }, [searchQuery]);

  useEffect(() => {
    let isMounted = true;

    async function loadFaqs() {
      try {
        const params: Record<string, unknown> = {
          SkipCount: 0,
          MaxResultCount: 1000,
        };
        if (debouncedSearch.trim()) params.Filter = debouncedSearch.trim();

        const res = await getFaqs(params as { Filter?: string; SkipCount?: number; MaxResultCount?: number });

        if (!isMounted) return;

        if (res.success && res.data) {
          setItems(res.data.items);
          setTotalCount(res.data.totalCount);
        } else {
          toast.error(res.error || 'Failed to load');
        }
      } catch {
        if (isMounted) {
          toast.error('Failed to load');
        }
      }
    }

    loadFaqs();

    return () => {
      isMounted = false;
    };
  }, [debouncedSearch, toast, refreshKey]);

  const handleOpenAdd = () => {
    setEditingQuestion(null);
    setFormDialogOpen(true);
  };

  const handleOpenEdit = (row: FormattedQuestion) => {
    const question = items.find((q) => q.id === row.id);
    if (question) {
      setEditingQuestion(question);
      setFormDialogOpen(true);
    }
  };

  const handleOpenDelete = (row: FormattedQuestion) => {
    setDeletingId(row.id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;

    try {
      const res = await deleteFaq(deletingId);

      if (res.success) {
        toast.success(t('messages.delete_success'));
        setItems((prev) => prev.filter((q) => q.id !== deletingId));
        setTotalCount((prev) => prev - 1);
      } else {
        toast.error(res.error || 'Failed to delete');
      }
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeletingId(null);
    }
  };

  const tableHead = [
    { id: 'question', label: t('columns.question'), align: (isRtl ? 'right' : 'left') as cellAlignment },
    { id: 'answer', label: t('columns.answer'), align: (isRtl ? 'right' : 'left') as cellAlignment },
  ];

  const actions = [
    {
      label: t('actions.edit'),
      icon: <Iconify icon="solar:pen-bold" />,
      onClick: (row: FormattedQuestion) => handleOpenEdit(row),
    },
    {
      label: t('actions.delete'),
      icon: <Iconify icon="solar:trash-bin-trash-bold" />,
      sx: { color: 'error.main' },
      onClick: (row: FormattedQuestion) => handleOpenDelete(row),
    },
  ];

  const tableData: FormattedQuestion[] = items.map((item) => ({
    id: item.id,
    question: isRtl ? item.questionAr : item.questionEn,
    answer: isRtl ? item.answerAr : item.answerEn,
  }));

  return (
    <Box sx={{ py: 2 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ mb: 4, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' } }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1C252E', mb: 0.5 }}>
            {t('title')}
          </Typography>
          <Typography variant="body2" sx={{ color: '#637381' }}>
            {t('subtitle')}
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" width={20} />}
          onClick={handleOpenAdd}
          sx={{
            bgcolor: '#1C252E',
            color: '#FFFFFF',
            borderRadius: 1.5,
            px: 2.5,
            py: 1,
            fontWeight: 700,
            boxShadow: 'none',
            '&:hover': { bgcolor: '#2C353E' },
          }}
        >
          {t('add_question')}
        </Button>
      </Stack>

      <Card
        sx={{
          borderRadius: 3,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)',
          border: '1px solid #F1F3F5',
          overflow: 'visible',
          bgcolor: '#FFFFFF',
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ p: 2.5, borderBottom: '1px dashed #F1F3F5' }}>
          <TextField
            fullWidth
            size="small"
            placeholder={t('search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="eva:search-fill" sx={{ color: '#919EAB', width: 20, height: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: '#FFFFFF',
                '& fieldset': { borderColor: '#E5E7EB' },
              },
            }}
          />
        </Stack>

        <Box sx={{ px: 1 }}>
          <SharedTable<FormattedQuestion>
            data={tableData}
            count={totalCount}
            tableHead={tableHead}
            actions={actions}
          />
        </Box>
      </Card>

      <QuestionFormDialog
        key={editingQuestion?.id ?? 'new'}
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        initialData={editingQuestion}
        onSaved={() => setRefreshKey((k) => k + 1)}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
}