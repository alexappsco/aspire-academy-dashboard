'use client';

import {
  Dialog,
  DialogContent,
  Typography,
  Button,
  Box,
} from '@mui/material';

import Iconify from 'src/components/iconify';

type ConfirmationDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  variant: 'warning' | 'success';
  title: string;
  confirmLabel: string;
  cancelLabel?: string; // If omitted, only one button is displayed
  cancelVariant?: 'outlined' | 'gray'; // Outlined green or solid gray
};

export default function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  variant,
  title,
  confirmLabel,
  cancelLabel,
  cancelVariant = 'outlined',
}: ConfirmationDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={false}
      slotProps={{
        paper: {
          sx: {
            width: {
              xs: '92%',
              sm: '420px',
            },
            maxWidth: '420px',
            borderRadius: '24px',
            border: 'none',
            outline: 'none',
            backgroundImage: 'none',
            boxShadow: '0px 12px 35px rgba(0, 0, 0, 0.1)',
          },
        },
      }}
    >
      <DialogContent
        sx={{
          p: {
            xs: '24px',
            sm: '32px',
          },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
        }}
      >
        {/* Circular Icon Badge */}
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: variant === 'success' ? 'rgba(16, 117, 78, 0.08)' : 'rgba(255, 59, 48, 0.08)',
          }}
        >
          <Iconify
            icon={variant === 'success' ? 'solar:check-circle-bold-duotone' : 'solar:danger-triangle-bold-duotone'}
            width={32}
            sx={{ color: variant === 'success' ? '#10754E' : '#FF3B30' }}
          />
        </Box>

        {/* Title Text */}
        <Typography
          sx={{
            fontSize: '1.125rem',
            fontWeight: 700,
            textAlign: 'center',
            color: '#161C24',
            lineHeight: 1.5,
          }}
        >
          {title}
        </Typography>

        {/* Buttons Stack (Vertical) */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            width: '100%',
            mt: 1,
          }}
        >
          <Button
            variant="contained"
            fullWidth
            onClick={onConfirm}
            sx={{
              bgcolor: '#10754E',
              color: 'white',
              fontWeight: 700,
              borderRadius: '8px',
              py: 1.2,
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#0c5b3c',
                boxShadow: 'none',
              },
            }}
          >
            {confirmLabel}
          </Button>

          {cancelLabel && (
            <Button
              variant={cancelVariant === 'gray' ? 'contained' : 'outlined'}
              fullWidth
              onClick={onClose}
              sx={{
                fontWeight: 700,
                borderRadius: '8px',
                py: 1.2,
                boxShadow: 'none',
                ...(cancelVariant === 'gray'
                  ? {
                      bgcolor: '#F4F6F8',
                      color: '#637381',
                      '&:hover': {
                        bgcolor: '#E5E8EB',
                        boxShadow: 'none',
                      },
                    }
                  : {
                      borderColor: '#10754E',
                      color: '#10754E',
                      '&:hover': {
                        borderColor: '#0c5b3c',
                        bgcolor: 'rgba(16, 117, 78, 0.04)',
                      },
                    }),
              }}
            >
              {cancelLabel}
            </Button>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
