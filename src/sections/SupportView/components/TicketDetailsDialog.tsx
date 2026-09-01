'use client';

import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Typography,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import Iconify from 'src/components/iconify';
import type { SupportTicket } from '../types';

type TicketDetailsDialogProps = {
  open: boolean;
  ticket: SupportTicket | null;
  onClose: () => void;
};

export default function TicketDetailsDialog({
  open,
  ticket,
  onClose,
}: TicketDetailsDialogProps) {
  const t = useTranslations("Support");

  const handleClose = () => {
    onClose();
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
            borderRadius: '20px',
            boxShadow: '0 16px 40px rgba(15, 23, 42, 0.12)',
            bgcolor: '#fff',
          },
        },
      }}
    >
      <DialogContent sx={{ p: { xs: 3, sm: 4 } }} >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 3,
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, color: '#101828', fontSize: 20 }}
          >
            {t("details_title")}
          </Typography>
          <Button
            onClick={handleClose}
            sx={{
              minWidth: 40,
              width: 40,
              height: 40,
              borderRadius: '10px',
              color: '#667085',
              p: 0,
              '&:hover': { bgcolor: '#f3f4f6' },
            }}
          >
            <Iconify icon="mingcute:close-line" width={20} />
          </Button>
        </Box>

        {ticket && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box>
              <Typography
                sx={{ color: '#667085', fontSize: 14, fontWeight: 500, mb: 0.75 }}
              >
                {t("details_ticket_number")}
              </Typography>
              <Typography
                sx={{ color: '#101828', fontSize: 16, fontWeight: 700, lineHeight: 1.6 }}
              >
                {ticket.ticketNumber}
              </Typography>
            </Box>

            <Box>
              <Typography
                sx={{ color: '#667085', fontSize: 14, fontWeight: 500, mb: 0.75 }}
              >
                {t("details_complaint_title")}
              </Typography>
              <Typography
                sx={{ color: '#101828', fontSize: 16, fontWeight: 700, lineHeight: 1.6 }}
              >
                {ticket.title}
              </Typography>
            </Box>

            <Box>
              <Typography
                sx={{ color: '#667085', fontSize: 14, fontWeight: 500, mb: 0.75 }}
              >
                {t("details_description")}
              </Typography>
              <Typography
                sx={{
                  color: '#344054',
                  fontSize: 15,
                  lineHeight: 1.8,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {ticket.description}
              </Typography>
            </Box>

            <Box>
              <Typography
                sx={{ color: '#667085', fontSize: 14, fontWeight: 500, mb: 0.75 }}
              >
                {t("details_status")}
              </Typography>
              <Typography sx={{ color: '#344054', fontSize: 15, fontWeight: 600 }}>
                {t(ticket.status)}
              </Typography>
            </Box>

            {ticket.reply && (
              <Box>
                <Typography
                  sx={{ color: '#667085', fontSize: 14, fontWeight: 500, mb: 0.75 }}
                >
                  {t("details_reply")}
                </Typography>
                <Typography
                  sx={{
                    color: '#344054',
                    fontSize: 15,
                    lineHeight: 1.8,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {ticket.reply}
                </Typography>
              </Box>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
              <Button
                variant="outlined"
                onClick={handleClose}
                sx={{
                  borderRadius: '12px',
                  fontWeight: 700,
                  height: 44,
                  px: 4,
                  borderColor: '#E5E7EB',
                  color: '#344054',
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: '#D1D5DB',
                    bgcolor: '#F9FAFB',
                  },
                }}
              >
                {t("close")}
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
