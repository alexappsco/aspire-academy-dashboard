'use client';

import { useState } from 'react';
import { Box, Typography, Button, Card, Stack } from '@mui/material';
import { useTranslations } from 'next-intl';
import RichTextEditor from 'src/components/RichTextEditor';
import { useToast } from 'src/components/toast';
import { MOCK_TERMS_CONTENT, MOCK_ABOUT_CONTENT, ContentPageData } from 'src/sections/content-pages/_mock';

type ContentPageViewProps = {
  namespace: 'TermsAndConditions' | 'AboutUs' | 'PrivacyPolicy';
};

const MOCK_DATA: Record<ContentPageViewProps['namespace'], ContentPageData> = {
  TermsAndConditions: MOCK_TERMS_CONTENT,
  AboutUs: MOCK_ABOUT_CONTENT,
  PrivacyPolicy: MOCK_TERMS_CONTENT,
};

export default function ContentPageView({ namespace }: ContentPageViewProps) {
  const t = useTranslations(namespace);
  const { success } = useToast();

  const initialData = MOCK_DATA[namespace] || MOCK_TERMS_CONTENT;
  const [arabicContent, setArabicContent] = useState(initialData.content_ar);
  const [englishContent, setEnglishContent] = useState(initialData.content_en);
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      success(t('save_success'));
    }, 400);
  };

  return (
    <Box sx={{ py: 2 }}>
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
          disabled={saving}
          sx={{
            bgcolor: '#1C252E',
            color: '#fff',
            borderRadius: 1.5,
            fontWeight: 700,
            fontSize: '0.875rem',
            px: 3,
            py: 1.2,
            boxShadow: 'none',
            '&:hover': { bgcolor: '#2C353E' },
          }}
        >
          {saving ? '...' : t('save_changes')}
        </Button>
      </Stack>

      <Card
        sx={{
          p: 3,
          borderRadius: 3,
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.02)',
          border: '1px solid #F1F3F5',
          bgcolor: '#FFFFFF',
          mb: 3,
        }}
      >
        <RichTextEditor
          label={t('arabic_text')}
          value={arabicContent}
          onChange={setArabicContent}
          placeholder="اكتب المحتوى بالعربية..."
          dir="rtl"
        />
      </Card>

      <Card
        sx={{
          p: 3,
          borderRadius: 3,
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.02)',
          border: '1px solid #F1F3F5',
          bgcolor: '#FFFFFF',
        }}
      >
        <RichTextEditor
          label={t('english_text')}
          value={englishContent}
          onChange={setEnglishContent}
          placeholder="Write content in English..."
          dir="ltr"
        />
      </Card>
    </Box>
  );
}
