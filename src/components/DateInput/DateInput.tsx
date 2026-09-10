'use client';

import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import TextField, { TextFieldProps } from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Iconify from 'src/components/iconify';

export interface DateInputProps extends Omit<TextFieldProps, 'onChange' | 'value'> {
  value?: string; // Format: YYYY-MM-DD or empty
  onChange?: (value: string) => void; // Emits YYYY-MM-DD or empty
  placeholder?: string;
}

// Convert YYYY-MM-DD -> DD/MM/YYYY
function toDisplayDate(isoDate?: string): string {
  if (!isoDate) return '';
  const clean = isoDate.split('T')[0];
  const parts = clean.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    const [year, month, day] = parts;
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  }
  return '';
}

// Convert DD/MM/YYYY -> YYYY-MM-DD (validates date)
function toIsoDate(displayDate: string): string | null {
  const parts = displayDate.split('/');
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  if (
    isNaN(day) ||
    isNaN(month) ||
    isNaN(year) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    year < 1900 ||
    year > 2100
  ) {
    return null;
  }

  const d = new Date(year, month - 1, day);
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) {
    return null;
  }

  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// Format raw typing string as DD/MM/YYYY
function maskDateInput(input: string): string {
  const digits = input.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export default function DateInput({
  value = '',
  onChange,
  placeholder = 'DD/MM/YYYY',
  slotProps,
  sx,
  ...other
}: DateInputProps) {
  const [displayText, setDisplayText] = useState(() => toDisplayDate(value));
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDisplayText(toDisplayDate(value));
  }, [value]);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    if (!rawVal.trim()) {
      setDisplayText('');
      onChange?.('');
      return;
    }

    const masked = maskDateInput(rawVal);
    setDisplayText(masked);

    if (masked.length === 10) {
      const iso = toIsoDate(masked);
      if (iso) {
        onChange?.(iso);
      }
    } else if (value) {
      onChange?.('');
    }
  };

  const handleNativePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isoVal = e.target.value; // YYYY-MM-DD
    if (isoVal) {
      setDisplayText(toDisplayDate(isoVal));
      onChange?.(isoVal);
    } else {
      setDisplayText('');
      onChange?.('');
    }
  };

  const handleOpenPicker = () => {
    if (hiddenInputRef.current) {
      if (typeof hiddenInputRef.current.showPicker === 'function') {
        hiddenInputRef.current.showPicker();
      } else {
        hiddenInputRef.current.focus();
        hiddenInputRef.current.click();
      }
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDisplayText('');
    onChange?.('');
  };

  return (
    <Box sx={{ position: 'relative', width: other.fullWidth ? '100%' : 'auto', display: 'inline-block' }}>
      <TextField
        {...other}
        value={displayText}
        placeholder={placeholder}
        onChange={handleTextChange}
        slotProps={{
          ...slotProps,
          input: {
            ...slotProps?.input,
            endAdornment: (
              <InputAdornment position="end" sx={{ gap: 0.5 }}>
                {displayText && (
                  <IconButton size="small" onClick={handleClear} sx={{ p: 0.25, color: '#919EAB' }}>
                    <Iconify icon="eva:close-fill" width={16} />
                  </IconButton>
                )}
                <IconButton
                  size="small"
                  onClick={handleOpenPicker}
                  sx={{ p: 0.5, color: '#919EAB', '&:hover': { color: '#1C252E' } }}
                >
                  <Iconify icon="solar:calendar-bold" width={18} />
                </IconButton>
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
          ...sx,
        }}
      />

      {/* Hidden native date picker to leverage native calendar popup */}
      <input
        ref={hiddenInputRef}
        type="date"
        value={value ? value.split('T')[0] : ''}
        onChange={handleNativePickerChange}
        tabIndex={-1}
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: 'none',
          border: 'none',
          padding: 0,
          margin: 0,
        }}
      />
    </Box>
  );
}
