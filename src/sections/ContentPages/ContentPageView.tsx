'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, Card, Stack, CircularProgress } from '@mui/material';
import { useTranslations } from 'next-intl';
import RichTextEditor from 'src/components/RichTextEditor';
import { useToast } from 'src/components/toast';
import { getPageBySlug, updatePage } from 'src/actions/pages';
import type { PageItem, UpdatePagePayload } from 'src/types/page';
import { MOCK_TERMS_CONTENT, MOCK_ABOUT_CONTENT, ContentPageData } from 'src/sections/content-pages/_mock';

type ContentPageViewProps = {
  namespace: 'TermsAndConditions' | 'AboutUs' | 'PrivacyPolicy';
  slug?: string;
};

const NAMESPACE_TO_SLUG: Record<ContentPageViewProps['namespace'], string> = {
  AboutUs: 'about_us',
  TermsAndConditions: 'terms_and_conditions',
  PrivacyPolicy: 'privacy_policy',
};

const MOCK_DATA: Record<ContentPageViewProps['namespace'], ContentPageData> = {
  TermsAndConditions: MOCK_TERMS_CONTENT,
  AboutUs: MOCK_ABOUT_CONTENT,
  PrivacyPolicy: MOCK_TERMS_CONTENT,
};

export default function ContentPageView({ namespace, slug }: ContentPageViewProps) {
  const t = useTranslations(namespace);
  const toast = useToast();

  const targetSlug = slug || NAMESPACE_TO_SLUG[namespace] || 'about_us';
  const initialFallback = MOCK_DATA[namespace] || MOCK_ABOUT_CONTENT;

  const [pageData, setPageData] = useState<PageItem | null>(null);
  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [arabicContent, setArabicContent] = useState(initialFallback.content_ar);
  const [englishContent, setEnglishContent] = useState(initialFallback.content_en);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPage = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getPageBySlug(targetSlug);
      if (res.success && res.data) {
        setPageData(res.data);
        setTitleAr(res.data.titleAr || '');
        setTitleEn(res.data.titleEn || '');
        setArabicContent(res.data.descriptionAr || '');
        setEnglishContent(res.data.descriptionEn || '');
      } else {
        // Fallback to initial mock content if page not found
        setArabicContent(initialFallback.content_ar);
        setEnglishContent(initialFallback.content_en);
      }
    } catch {
      setArabicContent(initialFallback.content_ar);
      setEnglishContent(initialFallback.content_en);
    } finally {
      setLoading(false);
    }
  }, [targetSlug, initialFallback.content_ar, initialFallback.content_en]);

  useEffect(() => {
    fetchPage();
  }, [fetchPage]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: UpdatePagePayload = {
        titleAr: titleAr || (namespace === 'AboutUs' ? 'من نحن' : 'الشروط والأحكام'),
        titleEn: titleEn || (namespace === 'AboutUs' ? 'About Us' : 'Terms And Conditions'),
        descriptionAr: arabicContent,
        descriptionEn: englishContent,
      };

      const res = await updatePage(targetSlug, payload);
      if (res.success) {
        if (res.data) {
          setPageData(res.data);
        }
        toast.success(t('save_success'));
      } else {
        toast.error(res.error || t('save_error'));
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t('save_error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ py: 2, pb: 6 }}>
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
          {pageData?.titleAr || t('title')}
        </Typography>

        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving || loading}
          sx={{
            bgcolor: '#1C252E',
            color: '#FFFFFF',
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

      {loading ? (
        <Box sx={{ py: 10, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress size={38} sx={{ color: '#008767' }} />
        </Box>
      ) : (
        <>
          {/* Arabic Content Card */}
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

          {/* English Content Card */}
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
        </>
      )}
    </Box>
  );
}
