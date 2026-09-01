'use client';

import React, { useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Iconify from 'src/components/iconify';

interface MediaUploadBoxProps {
  label: string;
  recommendedSize: string;
  iconName: string;
  value: File | string | null;
  onChange: (file: File | null) => void;
  required?: boolean;
}

export default function MediaUploadBox({
  label,
  recommendedSize,
  iconName,
  value,
  onChange,
  required,
}: MediaUploadBoxProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onChange(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onChange(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const previewUrl = value
    ? typeof value === 'string'
      ? value
      : URL.createObjectURL(value)
    : null;

  return (
    <Box sx={{ flex: 1, width: '100%' }}>
      {/* Field Label */}
      <Typography
        sx={{
          fontSize: 14,
          fontWeight: 600,
          color: '#1E293B',
          mb: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
        }}
      >
        {label}
        {required && <Box component="span" sx={{ color: '#EF4444' }}>*</Box>}
      </Typography>

      {/* Upload Dropzone */}
      <Box
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        sx={{
          border: '1.5px dashed #CBD5E1',
          borderRadius: 2.5,
          bgcolor: '#FAFBFD',
          minHeight: 180,
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
          transition: 'all 0.2s ease',
          overflow: 'hidden',
          '&:hover': {
            borderColor: '#94A3B8',
            bgcolor: '#F1F5F9',
          },
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleFileSelect}
        />

        {previewUrl ? (
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: 160,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              component="img"
              src={previewUrl}
              alt={label}
              sx={{
                maxWidth: '100%',
                maxHeight: '100%',
                borderRadius: 1.5,
                objectFit: 'contain',
              }}
            />
            <IconButton
              onClick={handleRemove}
              size="small"
              sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                color: '#EF4444',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                '&:hover': { bgcolor: '#FFFFFF' },
              }}
            >
              <Iconify icon="solar:trash-bin-trash-bold" width={18} />
            </IconButton>
          </Box>
        ) : (
          <>
            <Iconify
              icon={iconName}
              width={42}
              sx={{ color: '#64748B', mb: 1.5 }}
            />
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 600,
                color: '#1E293B',
                textAlign: 'center',
              }}
            >
              اسحب وأفلت الصورة هنا أوتصفح
            </Typography>
            <Typography
              sx={{
                fontSize: 12,
                color: '#94A3B8',
                mt: 0.5,
                textAlign: 'center',
              }}
            >
              {recommendedSize}
            </Typography>
          </>
        )}
      </Box>
    </Box>
  );
}
