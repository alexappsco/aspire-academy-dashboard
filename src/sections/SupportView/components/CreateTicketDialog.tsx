'use client';

import { Box, Button, Dialog, DialogContent, TextField, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import Iconify from 'src/components/iconify';

type CreateTicketDialogProps = {
  open: boolean;
  title: string;
  description: string;
  submitting: boolean;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export default function CreateTicketDialog({
  open,
  title,
  description,
  submitting,
  onTitleChange,
  onDescriptionChange,
  onClose,
  onSubmit,
}: CreateTicketDialogProps) {
  const t = useTranslations("Support");
  const isValid = title.trim().length > 0 && description.trim().length > 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      disableScrollLock
      slotProps={{
        paper: {
          sx: {
            borderRadius: '28px',
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
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, color: '#101828', fontSize: 22 }}
            >
              {t("create_title")}
            </Typography>

            <Button
              onClick={onClose}
              sx={{
                minWidth: 40,
                width: 40,
                height: 40,
                borderRadius: '12px',
                color: '#667085',
                p: 0,
                '&:hover': { bgcolor: '#f3f4f6' },
              }}
            >
              <Iconify icon="mingcute:close-line" width={20} />
            </Button>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography
                sx={{
                  color: '#344054',
                  fontSize: 16,
                  fontWeight: 400,
                  mb: 1,
                }}
              >
                {t("create_complaint_title")}
              </Typography>
              <TextField
                fullWidth
                value={title}
                onChange={(event) => onTitleChange(event.target.value)}
                placeholder={t("create_complaint_placeholder")}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '16px',
                    minHeight: 56,
                    bgcolor: '#fff',
                  },
                }}
              />
            </Box>

            <Box>
              <Typography
                sx={{
                  color: '#344054',
                  fontSize: 16,
                  fontWeight: 400,
                  mb: 1,
                }}
              >
                {t("create_description")}
              </Typography>
              <TextField
                fullWidth
                multiline
                minRows={5}
                value={description}
                onChange={(event) => onDescriptionChange(event.target.value)}
                placeholder={t("create_description_placeholder")}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '16px',
                    bgcolor: '#fff',
                  },
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
              <Button
                variant="contained"
                onClick={onSubmit}
                disabled={!isValid || submitting}
                sx={{
                  bgcolor: '#886ce8',
                  color: '#fff',
                  borderRadius: '12px',
                  fontWeight: 700,
                  height: 48,
                  px: 5,
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: '#7758e6',
                    boxShadow: 'none',
                  },
                }}
              >
                {submitting ? t("sending") : t("send")}
              </Button>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
