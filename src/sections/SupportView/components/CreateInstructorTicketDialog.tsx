'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import Iconify from 'src/components/iconify';

type CreateInstructorTicketDialogProps = {
  open: boolean;
  submitting: boolean;
  defaultName?: string;
  defaultEmail?: string;
  onClose: () => void;
  onSubmit: (values: { name: string; email: string; title: string; notes: string }) => void;
};

const inputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '8px',
    bgcolor: '#fff',
  },
};

export default function CreateInstructorTicketDialog({
  open,
  submitting,
  defaultName = '',
  defaultEmail = '',
  onClose,
  onSubmit,
}: CreateInstructorTicketDialogProps) {
  const t = useTranslations('Support');

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');

  const isValid = title.trim().length > 0 && notes.trim().length > 0;

  const resetForm = () => {
    setTitle('');
    setNotes('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    onSubmit({ name: defaultName, email: defaultEmail, title, notes });
    resetForm();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      disableScrollLock
      slotProps={{
        paper: {
          sx: {
            borderRadius: '16px',
            boxShadow: '0 24px 48px rgba(15, 23, 42, 0.18)',
            bgcolor: '#fff',
          },
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: { xs: 3, sm: 4 } }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              mb: 4,
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#101828', fontSize: 20 }}>
              {t('create_ticket_title')}
            </Typography>

            <Button
              onClick={handleClose}
              sx={{
                minWidth: 32,
                width: 32,
                height: 32,
                borderRadius: '8px',
                color: '#667085',
                p: 0,
                '&:hover': { bgcolor: '#f3f4f6' },
              }}
            >
              <Iconify icon="mingcute:close-line" width={20} />
            </Button>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label={t('create_title_label')}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={t('create_title_placeholder')}
              sx={inputSx}
            />

            <TextField
              fullWidth
              multiline
              minRows={5}
              label={t('create_notes_label')}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder={t('create_notes_placeholder')}
              sx={inputSx}
            />

            <Box sx={{ display: 'flex', gap: 2, pt: 1 }}>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!isValid || submitting}
                sx={{
                  bgcolor: '#1C252E',
                  color: '#fff',
                  borderRadius: '8px',
                  fontWeight: 600,
                  height: 44,
                  px: 4,
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: '#454F5B',
                    boxShadow: 'none',
                  },
                }}
              >
                {submitting ? t('sending') : t('send')}
              </Button>

              <Button
                variant="outlined"
                onClick={handleClose}
                disabled={submitting}
                sx={{
                  color: '#1C252E',
                  borderColor: '#E5E7EB',
                  borderRadius: '8px',
                  fontWeight: 600,
                  height: 44,
                  px: 4,
                  '&:hover': {
                    bgcolor: '#F1F3F5',
                    borderColor: '#E5E7EB',
                  },
                }}
              >
                {t('cancel')}
              </Button>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}