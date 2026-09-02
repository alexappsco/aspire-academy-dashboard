'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import Iconify from 'src/components/iconify';
import { LearningObjective } from '../types';

interface LearningObjectivesCardProps {
  objectives: LearningObjective[];
  onChange: (objectives: LearningObjective[]) => void;
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

export default function LearningObjectivesCard({
  objectives,
  onChange,
}: LearningObjectivesCardProps) {
  const t = useTranslations('CreateCourse.learning_objectives');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingObj, setEditingObj] = useState<LearningObjective | null>(null);
  const [inputText, setInputText] = useState('');

  const handleOpenAdd = () => {
    setEditingObj(null);
    setInputText('');
    setDialogOpen(true);
  };

  const handleOpenEdit = (obj: LearningObjective) => {
    setEditingObj(obj);
    setInputText(obj.title);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!inputText.trim()) return;

    if (editingObj) {
      onChange(
        objectives.map((o) =>
          o.id === editingObj.id ? { ...o, title: inputText.trim() } : o
        )
      );
    } else {
      const newObj: LearningObjective = {
        id: `obj-${Date.now()}`,
        title: inputText.trim(),
      };
      onChange([...objectives, newObj]);
    }

    setDialogOpen(false);
    setInputText('');
    setEditingObj(null);
  };

  const handleDelete = (id: string) => {
    onChange(objectives.filter((o) => o.id !== id));
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
          justifyContent: 'space-between',
          mb: 2.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Iconify
            icon="solar:clipboard-list-bold"
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

        <Button
          variant="text"
          onClick={handleOpenAdd}
          startIcon={<Iconify icon="mingcute:add-line" width={18} />}
          sx={{
            color: '#1C252E',
            fontWeight: 700,
            fontSize: 14,
            gap: 0.5,
            '&:hover': { bgcolor: 'rgba(28, 37, 46, 0.04)' },
          }}
        >
          {t('add_objective_btn')}
        </Button>
      </Box>

      {/* Objectives List */}
      <Stack spacing={1.5}>
        {objectives.map((item) => (
          <Box
            key={item.id}
            sx={{
              bgcolor: '#F8FAFC',
              border: '1px solid #F1F5F9',
              borderRadius: 2,
              p: 2,
              px: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: '#F1F5F9',
              },
            }}
          >
            {/* Objective Badge & Text */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: '#E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748B',
                }}
              >
                <Iconify icon="solar:check-circle-bold" width={18} />
              </Box>
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: 14,
                  color: '#1E293B',
                }}
              >
                {item.title}
              </Typography>
            </Box>

            {/* Actions (Edit & Delete) */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                size="small"
                onClick={() => handleOpenEdit(item)}
                sx={{
                  color: '#64748B',
                  '&:hover': { color: '#1E293B', bgcolor: 'rgba(0,0,0,0.04)' },
                }}
              >
                <Iconify icon="solar:pen-bold" width={18} />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => handleDelete(item.id)}
                sx={{
                  color: '#EF4444',
                  '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.08)' },
                }}
              >
                <Iconify icon="solar:trash-bin-trash-bold" width={18} />
              </IconButton>
            </Box>
          </Box>
        ))}
      </Stack>

      {/* Add / Edit Objective Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="xs"
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              p: 1.5,
            },
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 2,
            pt: 1,
            pb: 1.5,
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: '#1E293B', fontSize: 18 }}
          >
            {editingObj ? t('dialog_edit_title') : t('dialog_add_title')}
          </Typography>

          <IconButton
            onClick={() => setDialogOpen(false)}
            size="small"
            sx={{ color: '#919EAB' }}
          >
            <Iconify icon="mingcute:close-line" width={20} />
          </IconButton>
        </Box>

        <DialogContent sx={{ px: 2, pt: 1, pb: 2 }}>
          <Stack spacing={2.5}>
            <TextField
              fullWidth
              multiline
              rows={3}
              placeholder={t('objective_placeholder')}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              sx={inputRootSx}
            />

            <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'flex-start', pt: 1 }}>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={!inputText.trim()}
                sx={{
                  bgcolor: '#1C252E',
                  color: '#FFFFFF',
                  borderRadius: 1.5,
                  px: 3.5,
                  py: 1,
                  fontWeight: 600,
                  fontSize: 14,
                  boxShadow: 'none',
                  '&:hover': { bgcolor: '#2C353E' },
                }}
              >
                {editingObj ? t('save_btn') : t('add_btn')}
              </Button>

              <Button
                variant="outlined"
                onClick={() => setDialogOpen(false)}
                sx={{
                  borderColor: '#E2E8F0',
                  color: '#1E293B',
                  borderRadius: 1.5,
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                  fontSize: 14,
                  '&:hover': {
                    borderColor: '#CBD5E1',
                    bgcolor: '#F8FAFC',
                  },
                }}
              >
                {t('cancel_btn')}
              </Button>
            </Box>
          </Stack>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
