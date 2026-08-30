'use client';
import CloseIcon from '@mui/icons-material/Close';
import {
  Dialog,
  DialogContent,
  IconButton,
  Typography,
  Button,
  Box,
} from '@mui/material';

type DeleteDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
};

export default function DeleteDialog({
  open,
  onClose,
  onConfirm,
  loading = false,
}: DeleteDialogProps) {
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
              sm: '620px',
            },
            maxWidth: '620px',
            borderRadius: '28px',

            border: 'none',
            outline: 'none',
            backgroundImage: 'none',

            boxShadow:
              '0px 12px 35px rgba(0,0,0,.10)',
          },
        },
      }}
    >
      <DialogContent
        sx={{
          p: {
            xs: '20px',
            sm: '28px',
          },
          position: 'relative',
        }}
      >

        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 18,
            left: 18,
            p: 0,
            color: '#4A63D3',
          }}
        >
          <CloseIcon
            sx={{
              fontSize: 20,
            }}
          />
        </IconButton>


        <Typography
          sx={{
            fontSize: '20px',
            fontWeight: 700,
            textAlign: 'right',
            color: '#101828',
            mb: 6,
          }}
        >
          الحذف
        </Typography>


        <Typography
          sx={{
            fontSize: '20px',
            fontWeight: 700,
            textAlign: 'right',
            color: '#101828',
            mb: 8,
          }}
        >
          هل انت متاكد من انك تريد الحذف ؟
        </Typography>


        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2,
          }}
        >
          <Button
            onClick={onConfirm}
            disabled={loading}
            disableElevation
            variant="contained"
            sx={{
              width: '110px',
              height: '40px',
              borderRadius: '8px',
              background: '#FF6257',
              fontSize: '20px',
              fontWeight: 700,
              boxShadow: 'none',

              '&:hover': {
                background: '#FF554A',
                boxShadow: 'none',
              },
            }}
          >
            حذف
          </Button>

          <Button
            onClick={onClose}
            sx={{
              width: '110px',
              height: '40px',
              borderRadius: '8px',
              border: '2px solid #98A2B3',
              color: '#344054',
              fontSize: '20px',
              fontWeight: 700,

              '&:hover': {
                border: '2px solid #98A2B3',
              },
            }}
          >
            الغاء
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}