'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import { useToast } from 'src/components/toast';
import RichTextEditor from 'src/components/editor/rich-editor';
import { ContentPageData } from './_mock';

interface ContentEditorViewProps {
  translationNamespace: 'TermsAndConditions' | 'AboutUs';
  initialData: ContentPageData;
}

export default function ContentEditorView({
  translationNamespace,
  initialData,
}: ContentEditorViewProps) {
  const t = useTranslations(translationNamespace);
  const toast = useToast();

  const [contentAr, setContentAr] = useState(initialData.content_ar);
  const [contentEn, setContentEn] = useState(initialData.content_en);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate save
    setTimeout(() => {
      setIsSaving(false);
      toast.success(t('save_success'));
    }, 400);
  };

  return (
    <Box sx={{ py: 2 }}>
      {/* Header section */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          mb: 4,
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1C252E' }}>
          {t('title')}
        </Typography>

        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isSaving}
          sx={{
            bgcolor: '#1C252E',
            color: '#FFFFFF',
            borderRadius: 1.5,
            px: 3,
            py: 1.2,
            fontWeight: 700,
            fontSize: '0.875rem',
            boxShadow: 'none',
            '&:hover': {
              bgcolor: '#2C353E',
            },
          }}
        >
          {t('save_changes')}
        </Button>
      </Stack>

      {/* Arabic Content Card */}
      <Card
        sx={{
          borderRadius: 3,
          p: 3,
          mb: 3,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)',
          border: '1px solid #F1F3F5',
          bgcolor: '#FFFFFF',
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: '#637381',
            mb: 1.5,
            textAlign: 'right',
          }}
        >
          {t('arabic_text')}
        </Typography>

        <RichTextEditor
          dir="rtl"
          value={contentAr}
          onChange={setContentAr}
          placeholder="اكتب المحتوى بالعربية..."
          minHeight={260}
        />
      </Card>

      {/* English Content Card */}
      <Card
        sx={{
          borderRadius: 3,
          p: 3,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)',
          border: '1px solid #F1F3F5',
          bgcolor: '#FFFFFF',
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: '#637381',
            mb: 1.5,
            textAlign: 'right',
          }}
        >
          {t('english_text')}
        </Typography>

        <RichTextEditor
          dir="ltr"
          value={contentEn}
          onChange={setContentEn}
          placeholder="Write content in English..."
          minHeight={260}
        />
      </Card>
    </Box>
  );
}
