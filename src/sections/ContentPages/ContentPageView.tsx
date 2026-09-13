"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  Stack,
  CircularProgress,
} from "@mui/material";
import { useTranslations } from "next-intl";
import RichTextEditor from "src/components/RichTextEditor";
import { useToast } from "src/components/toast";
import { contentPagesService } from "./services/contentPagesService";
import type { ContentPageSlug } from "src/types/content-page";

type ContentPageViewProps = {
  namespace: "TermsAndConditions" | "AboutUs" | "PrivacyPolicy";
  slug: ContentPageSlug;
};

export default function ContentPageView({
  namespace,
  slug,
}: ContentPageViewProps) {
  const t = useTranslations(namespace);
  const toast = useToast();

  const [arabicContent, setArabicContent] = useState("");
  const [englishContent, setEnglishContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadPage = async () => {
      try {
        setLoading(true);
        const page = await contentPagesService.getPage(slug);
        if (!mounted) return;
        setArabicContent(page.contentAr ?? page.content_ar ?? "");
        setEnglishContent(page.contentEn ?? page.content_en ?? "");
      } catch (error) {
        if (mounted) {
          toast.error(
            error instanceof Error ? error.message : t("fetch_error"),
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadPage();
    return () => {
      mounted = false;
    };
  }, [slug, t, toast]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await contentPagesService.updatePage(slug, {
        contentAr: arabicContent,
        contentEn: englishContent,
      });
      toast.success(t("save_success"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("save_error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ py: 2 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{
          mb: 4,
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#1C252E" }}>
          {t("title")}
        </Typography>

        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving}
          sx={{
            bgcolor: "#1C252E",
            color: "#fff",
            borderRadius: 1.5,
            fontWeight: 700,
            fontSize: "0.875rem",
            px: 3,
            py: 1.2,
            boxShadow: "none",
            "&:hover": { bgcolor: "#2C353E" },
          }}
        >
          {saving ? (
            <CircularProgress size={18} color="inherit" />
          ) : (
            t("save_changes")
          )}
        </Button>
      </Stack>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Card
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: "0 4px 20px 0 rgba(0,0,0,0.02)",
              border: "1px solid #F1F3F5",
              bgcolor: "#FFFFFF",
              mb: 3,
            }}
          >
            <RichTextEditor
              label={t("arabic_text")}
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
              boxShadow: "0 4px 20px 0 rgba(0,0,0,0.02)",
              border: "1px solid #F1F3F5",
              bgcolor: "#FFFFFF",
            }}
          >
            <RichTextEditor
              label={t("english_text")}
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
