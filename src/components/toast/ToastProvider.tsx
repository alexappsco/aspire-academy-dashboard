"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert, { AlertColor } from '@mui/material/Alert';
import Slide, { SlideProps } from '@mui/material/Slide';

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

interface ToastContextType {
  toast: (message: string, severity?: AlertColor) => void;
  error: (message: string) => void;
  success: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [severity, setSeverity] = useState<AlertColor>('info');

  const toast = useCallback((msg: string, sev: AlertColor = 'info') => {
    setMessage(msg);
    setSeverity(sev);
    setOpen(true);
  }, []);

  const error = useCallback((msg: string) => toast(msg, 'error'), [toast]);
  const success = useCallback((msg: string) => toast(msg, 'success'), [toast]);
  const info = useCallback((msg: string) => toast(msg, 'info'), [toast]);
  const warning = useCallback((msg: string) => toast(msg, 'warning'), [toast]);

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const colorMap: Record<AlertColor, { bg: string; border: string; shadow: string }> = {
    error:   { bg: 'linear-gradient(135deg, #FF4842 0%, #B72136 100%)', border: 'rgba(255,72,66,0.3)', shadow: '0 8px 32px rgba(183,33,54,0.35)' },
    success: { bg: 'linear-gradient(135deg, #36B37E 0%, #1B806A 100%)', border: 'rgba(54,179,126,0.3)', shadow: '0 8px 32px rgba(27,128,106,0.35)' },
    warning: { bg: 'linear-gradient(135deg, #FFAB00 0%, #B76E00 100%)', border: 'rgba(255,171,0,0.3)',  shadow: '0 8px 32px rgba(183,110,0,0.35)'  },
    info:    { bg: 'linear-gradient(135deg, #1890FF 0%, #0C53B7 100%)', border: 'rgba(24,144,255,0.3)', shadow: '0 8px 32px rgba(12,83,183,0.35)'  },
  };

  const colors = colorMap[severity];

  return (
    <ToastContext.Provider value={{ toast, error, success, info, warning }}>
      {children}
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        slots={{ transition: SlideTransition }}
        transitionDuration={{ enter: 400, exit: 300 }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        sx={{ bottom: { xs: 24, sm: 62 }, left: { xs: 24, sm: 52 } }}
      >
        <Alert
          onClose={handleClose}
          severity={severity}
          variant="filled"
          sx={{
            animation: 'toastPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
            '@keyframes toastPop': {
              '0%': { transform: 'scale(0.85)', opacity: 0 },
              '100%': { transform: 'scale(1)', opacity: 1 },
            },
            minWidth: { xs: 250, sm: 270 },
            maxWidth: 520,
            borderRadius: '50px',
            px: '5px',
            py: '7px',
            overflow: 'hidden',
            fontFamily: 'inherit',
            fontSize: '0.95rem',
            fontWeight: 600,
            letterSpacing: '0.01em',
            background: colors.bg,
            border: `1px solid ${colors.border}`,
            boxShadow: colors.shadow,
            display: 'flex',
            alignItems: 'center',
            // icon
            '& .MuiAlert-icon': {
              fontSize: 22,
              opacity: 1,
              p: 0,
              m: 0,
              mr: '16px',
              ml: 1,
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
            },
            // message text
            '& .MuiAlert-message': {
              p: 0,
              flex: 1,
              lineHeight: 1.6,
              display: 'flex',
              alignItems: 'center',
              overflow: 'visible',
            },
            // close button container
            '& .MuiAlert-action': {
              p: 0,
              m: 0,
              ml: '0',
              mr: 0,
              pt: 0,
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
              '& .MuiButtonBase-root': {
                p: '6px',
                borderRadius: '8px',
                color: '#fff',
                opacity: 0.75,
                transition: 'all 0.2s ease',
                '& svg': { fontSize: 18 },
                '&:hover': {
                  opacity: 1,
                  bgcolor: 'rgba(255,255,255,0.18)',
                },
              },
            },
          }}
        >
          {message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
};
