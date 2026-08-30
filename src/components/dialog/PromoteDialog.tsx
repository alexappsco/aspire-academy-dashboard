"use client";

import { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import Iconify from "src/components/iconify";

export type PromoteDialogSubmitValues = {
  startDate: string;
  endDate: string;
};

type PromoteDialogLabels = {
  title: string;
  subtitle: string;
  badge: string;
  startDate: string;
  endDate: string;
  previewTitle: string;
  previewDescription: string;
  cancel: string;
  submit: string;
  submitting: string;
};

type PromoteDialogProps = {
  open: boolean;
  itemName?: string;
  loading?: boolean;
  labels: PromoteDialogLabels;
  onClose: () => void;
  onSubmit: (values: PromoteDialogSubmitValues) => void;
};

export default function PromoteDialog({
  open,
  itemName,
  loading = false,
  labels,
  onClose,
  onSubmit,
}: PromoteDialogProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const todayISO = new Date().toLocaleDateString("en-CA");
  const canSubmit = Boolean(startDate && endDate && !loading);

  const handleClose = () => {
    if (loading) return;
    setStartDate("");
    setEndDate("");
    onClose();
  };

  const handleStartDateChange = (value: string) => {
    if (value && value < todayISO) return;
    setStartDate(value);
  };

  const handleEndDateChange = (value: string) => {
    if (value && value < todayISO) return;
    setEndDate(value);
  };

  const handleSubmit = () => {
    onSubmit({ startDate, endDate });
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            borderRadius: "24px",
            overflow: "hidden",
            boxShadow: "0 24px 80px rgba(17, 24, 39, 0.22)",
          },
        },
      }}
    >
      <DialogContent sx={{ p: 0, bgcolor: "#fff" }}>
        <Box
          sx={{
            position: "relative",
            p: { xs: 3, sm: 4 },
            color: "#fff",
            overflow: "hidden",
            background: "linear-gradient(135deg, #111827 0%, #4F46E5 52%, #00A76F 100%)",
          }}
        >
          <IconButton
            onClick={handleClose}
            disabled={loading}
            sx={{
              position: "absolute",
              top: 16,
              left: 16,
              color: "#fff",
              bgcolor: "rgba(255,255,255,0.14)",
              "&:hover": { bgcolor: "rgba(255,255,255,0.22)" },
            }}
          >
            <Iconify icon="solar:close-circle-bold" />
          </IconButton>

          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              px: 1.5,
              py: 0.75,
              mb: 2,
              borderRadius: "999px",
              bgcolor: "rgba(255,255,255,0.16)",
              border: "1px solid rgba(255,255,255,0.22)",
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            <Iconify icon="solar:ranking-bold" />
            {labels.badge}
          </Box>

          <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>
            {labels.title}
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.82)", maxWidth: 420 }}>
            {labels.subtitle}
          </Typography>
        </Box>

        <Box sx={{ p: { xs: 3, sm: 4 } }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              p: 2,
              mb: 3,
              borderRadius: "16px",
              bgcolor: "#F8FAFC",
              border: "1px solid #EEF2F7",
            }}
          >
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: "14px",
                display: "grid",
                placeItems: "center",
                bgcolor: "#EEF2FF",
                color: "#4F46E5",
              }}
            >
              <Iconify icon="solar:star-fall-bold" width={28} />
            </Box>
            <Box sx={{ minWidth: 0, textAlign: "right" }}>
              <Typography sx={{ fontWeight: 800, color: "#111827" }} noWrap>
                {itemName}
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748B" }}>
                {labels.previewDescription}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
            <TextField
              label={labels.startDate}
              type="date"
              value={startDate}
              onChange={(event) => handleStartDateChange(event.target.value)}
              disabled={loading}
              slotProps={{
                inputLabel: { shrink: true },
                input: { inputProps: { min: todayISO } },
              }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "14px" } }}
            />
            <TextField
              label={labels.endDate}
              type="date"
              value={endDate}
              onChange={(event) => handleEndDateChange(event.target.value)}
              disabled={loading}
              slotProps={{
                inputLabel: { shrink: true },
                input: { inputProps: { min: todayISO } },
              }}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "14px" } }}
            />
          </Box>

          <Box
            sx={{
              mt: 3,
              p: 2,
              borderRadius: "16px",
              border: "1px dashed #CBD5E1",
              bgcolor: "#FCFCFD",
            }}
          >
            <Typography sx={{ fontWeight: 800, color: "#111827", mb: 0.5 }}>
              {labels.previewTitle}
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748B" }}>
              {startDate && endDate ? `${startDate} - ${endDate}` : labels.previewDescription}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1.5, mt: 3, justifyContent: "flex-end" }}>
            <Button
              onClick={handleClose}
              disabled={loading}
              sx={{
                height: 46,
                px: 2.5,
                borderRadius: "12px",
                color: "#475569",
                fontWeight: 700,
                textTransform: "none",
              }}
            >
              {labels.cancel}
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!canSubmit}
              startIcon={
                loading ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <Iconify icon="solar:rocket-bold" />
                )
              }
              sx={{
                height: 46,
                px: 3,
                gap: 1,
                borderRadius: "12px",
                bgcolor: "#4F46E5",
                fontWeight: 800,
                textTransform: "none",
                boxShadow: "0 12px 24px rgba(79, 70, 229, 0.28)",
                "&:hover": { bgcolor: "#4338CA" },
              }}
            >
              {loading ? labels.submitting : labels.submit}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
