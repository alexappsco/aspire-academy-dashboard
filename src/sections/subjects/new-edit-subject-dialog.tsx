"use client";

import React, { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import FormControlLabel from "@mui/material/FormControlLabel";
import CircularProgress from "@mui/material/CircularProgress";

import Iconify from "src/components/iconify";
import { getFaculties } from "src/actions/faculties";
import {
  getAcademicYears,
  type AcademicYearDto,
} from "src/actions/academic-years";
import type { Faculty } from "src/types/faculty";
import type {
  StudyMaterialDto,
  CreateStudyMaterialDto,
} from "src/types/study-material";

/** One editable faculty → academic year → semester row. */
interface PlacementRow {
  key: number;
  facultyId: string;
  academicYearId: string;
  semesterId: string;
}

let nextRowKey = 1;
const newRow = (facultyId = "", academicYearId = "", semesterId = ""): PlacementRow => ({
  key: nextRowKey++,
  facultyId,
  academicYearId,
  semesterId,
});

function initialRows(initialData?: StudyMaterialDto | null): PlacementRow[] {
  if (initialData?.placements?.length) {
    return initialData.placements.map((p) =>
      newRow(p.facultyId, p.academicYearId ?? "", p.semesterId),
    );
  }
  if (initialData?.facultyId) {
    return [
      newRow(initialData.facultyId, initialData.academicYearId ?? "", initialData.semesterId ?? ""),
    ];
  }
  return [newRow()];
}

const getTextFieldStyles = (isRtl: boolean) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 1.5,
    ...(isRtl && {
      "& fieldset": {
        textAlign: "right",
      },
    }),
  },
  ...(isRtl && {
    direction: "rtl",
    "& .MuiInputLabel-root": {
      fontSize: "0.875rem",
      right: 28,
      left: "auto",
      transformOrigin: "top right",
      textAlign: "right",
    },
    "& .MuiInputLabel-shrink": {
      transform: "translate(0, -6px) scale(0.75)",
      right: 28,
      left: "auto",
      transformOrigin: "top right",
    },
    "& .MuiOutlinedInput-notchedOutline legend": {
      textAlign: "right",
    },
    "& .MuiOutlinedInput-input": {
      textAlign: "right",
      direction: "rtl",
    },
    "& input::placeholder": {
      textAlign: "right",
      direction: "rtl",
      opacity: 0.7,
    },
    "& .MuiInputBase-input::placeholder": {
      textAlign: "right",
      direction: "rtl",
      opacity: 0.7,
    },
    "& .MuiSelect-select": {
      textAlign: "right",
      direction: "rtl",
      pr: "14px !important",
      pl: "36px !important",
    },
    "& .MuiSelect-icon": {
      right: "auto !important",
      left: "10px !important",
    },
    "& .MuiFormHelperText-root": {
      textAlign: "right",
    },
  }),
});

interface Props {
  open: boolean;
  onClose: () => void;
  initialData?: StudyMaterialDto | null;
  onSave: (data: CreateStudyMaterialDto) => Promise<boolean>;
}

interface FormContentProps {
  initialData?: StudyMaterialDto | null;
  onClose: () => void;
  onSave: (data: CreateStudyMaterialDto) => Promise<boolean>;
  isRtl: boolean;
}

function FormContent({
  initialData,
  onClose,
  onSave,
  isRtl,
}: FormContentProps) {
  const t = useTranslations("Subjects");
  const isEdit = !!initialData;

  const [nameAr, setNameAr] = useState(initialData?.nameAr ?? "");
  const [nameEn, setNameEn] = useState(initialData?.nameEn ?? "");
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [rows, setRows] = useState<PlacementRow[]>(() => initialRows(initialData));

  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loadingFaculties, setLoadingFaculties] = useState(false);
  /** Academic years (with their semesters) per faculty id, loaded on demand. */
  const [yearsByFaculty, setYearsByFaculty] = useState<Record<string, AcademicYearDto[]>>({});
  const [loadingYearsFor, setLoadingYearsFor] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loadYears = async (facultyId: string) => {
    if (!facultyId || yearsByFaculty[facultyId] || loadingYearsFor[facultyId]) return;
    setLoadingYearsFor((prev) => ({ ...prev, [facultyId]: true }));
    try {
      const res = await getAcademicYears({
        FacultyId: facultyId,
        MaxResultCount: 1000,
      });
      const items = res.success && res.data?.items ? res.data.items : [];
      setYearsByFaculty((prev) => ({
        ...prev,
        [facultyId]: [...items].sort((a, b) => a.order - b.order),
      }));
    } finally {
      setLoadingYearsFor((prev) => ({ ...prev, [facultyId]: false }));
    }
  };

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoadingFaculties(true);
      try {
        const res = await getFaculties({ MaxResultCount: 1000 });
        if (isMounted && res.success && res.data?.items) {
          setFaculties(res.data.items);
        }
      } finally {
        if (isMounted) setLoadingFaculties(false);
      }
    })();
    // Years for the faculties already on the subject being edited.
    Array.from(new Set(rows.map((r) => r.facultyId).filter(Boolean))).forEach((id) => {
      void loadYears(id);
    });
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearError = (key: string) => {
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const updateRow = (key: number, patch: Partial<PlacementRow>) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
    clearError("placements");
    clearError(`row-${key}`);
  };

  const facultyLabel = (f: Faculty) => {
    const name = (isRtl ? f.nameAr : f.nameEn) || f.nameAr || f.nameEn;
    return f.university?.name ? `${name} — ${f.university.name}` : name;
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!nameAr.trim()) {
      newErrors.nameAr = isRtl
        ? "يرجى إدخال الاسم بالعربية"
        : "Please enter Arabic name";
    }
    if (!nameEn.trim()) {
      newErrors.nameEn = isRtl
        ? "يرجى إدخال الاسم بالإنجليزية"
        : "Please enter English name";
    }
    if (rows.length === 0) {
      newErrors.placements = t("dialog.placements_required");
    }
    const seen = new Set<string>();
    rows.forEach((r) => {
      if (!r.facultyId || !r.academicYearId || !r.semesterId) {
        newErrors[`row-${r.key}`] = t("dialog.placement_incomplete");
        return;
      }
      const id = `${r.facultyId}|${r.academicYearId}|${r.semesterId}`;
      if (seen.has(id)) newErrors[`row-${r.key}`] = t("dialog.placement_duplicate");
      seen.add(id);
    });
    setErrors(newErrors);
    return Object.values(newErrors).every((v) => !v);
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload: CreateStudyMaterialDto = {
        nameAr: nameAr.trim(),
        nameEn: nameEn.trim(),
        placements: rows.map((r) => ({
          facultyId: r.facultyId,
          academicYearId: r.academicYearId,
          semesterId: r.semesterId,
        })),
        isActive,
      };

      const success = await onSave(payload);
      if (success) {
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontWeight: 700,
          fontSize: "1.125rem",
          pb: 1,
          pt: 2.5,
          px: 3,
        }}
      >
        {isEdit ? t("dialog.edit_title") : t("dialog.add_title")}
        <IconButton size="small" onClick={onClose} disabled={submitting}>
          <Iconify icon="mingcute:close-line" width={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{ pt: 2.5, px: 3, pb: 3, direction: isRtl ? "rtl" : "ltr" }}
      >
        <Stack spacing={2.5} sx={{ direction: isRtl ? "rtl" : "ltr" }}>
          {/* الاسم بالعربية */}
          <TextField
            fullWidth
            label={t("dialog.name_ar")}
            placeholder={t("dialog.name_ar_placeholder")}
            value={nameAr}
            onChange={(e) => {
              setNameAr(e.target.value);
              if (errors.nameAr) setErrors((prev) => ({ ...prev, nameAr: "" }));
            }}
            error={!!errors.nameAr}
            helperText={errors.nameAr}
            disabled={submitting}
            required
            sx={getTextFieldStyles(isRtl)}
          />

          {/* الاسم بالإنجليزية */}
          <TextField
            fullWidth
            label={t("dialog.name_en")}
            placeholder={t("dialog.name_en_placeholder")}
            value={nameEn}
            onChange={(e) => {
              setNameEn(e.target.value);
              if (errors.nameEn) setErrors((prev) => ({ ...prev, nameEn: "" }));
            }}
            error={!!errors.nameEn}
            helperText={errors.nameEn}
            disabled={submitting}
            required
            sx={getTextFieldStyles(isRtl)}
          />

          {/* أماكن التدريس: كلية → سنة دراسية → فصل دراسي */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              {t("dialog.placements")}
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748B", display: "block", mb: 1.5 }}>
              {t("dialog.placements_hint")}
            </Typography>

            <Stack spacing={1.5}>
              {rows.map((row) => {
                const years = yearsByFaculty[row.facultyId] ?? [];
                const year = years.find((y) => y.id === row.academicYearId);
                const semesters = [...(year?.semesters ?? [])].sort((a, b) => a.order - b.order);
                const loadingYears = !!loadingYearsFor[row.facultyId];
                const rowError = errors[`row-${row.key}`];
                return (
                  <Box
                    key={row.key}
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      border: "1px solid",
                      borderColor: rowError ? "error.main" : "#E2E8F0",
                      bgcolor: "#F8FAFC",
                    }}
                  >
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ alignItems: "flex-start" }}>
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label={t("dialog.college")}
                        value={row.facultyId}
                        onChange={(e) => {
                          updateRow(row.key, { facultyId: e.target.value, academicYearId: "", semesterId: "" });
                          void loadYears(e.target.value);
                        }}
                        disabled={submitting || loadingFaculties}
                        sx={{ ...getTextFieldStyles(isRtl), bgcolor: "#fff" }}
                      >
                        {loadingFaculties ? (
                          <MenuItem disabled>
                            <CircularProgress size={18} sx={{ mx: 1 }} />
                            {isRtl ? "جارٍ التحميل..." : "Loading..."}
                          </MenuItem>
                        ) : (
                          faculties.map((f) => (
                            <MenuItem key={f.id} value={f.id}>
                              {facultyLabel(f)}
                            </MenuItem>
                          ))
                        )}
                      </TextField>

                      <TextField
                        select
                        fullWidth
                        size="small"
                        label={t("dialog.academic_year")}
                        value={years.some((y) => y.id === row.academicYearId) ? row.academicYearId : ""}
                        onChange={(e) => updateRow(row.key, { academicYearId: e.target.value, semesterId: "" })}
                        disabled={submitting || !row.facultyId || loadingYears}
                        sx={{ ...getTextFieldStyles(isRtl), bgcolor: "#fff" }}
                      >
                        {years.length === 0 ? (
                          <MenuItem disabled>
                            {loadingYears
                              ? isRtl ? "جارٍ التحميل..." : "Loading..."
                              : isRtl ? "لا توجد سنوات دراسية لهذه الكلية" : "This faculty has no academic years"}
                          </MenuItem>
                        ) : (
                          years.map((y) => (
                            <MenuItem key={y.id} value={y.id}>
                              {(isRtl ? y.nameAr : y.nameEn) || y.nameAr || y.nameEn}
                            </MenuItem>
                          ))
                        )}
                      </TextField>

                      <TextField
                        select
                        fullWidth
                        size="small"
                        label={t("dialog.semester")}
                        value={semesters.some((x) => x.id === row.semesterId) ? row.semesterId : ""}
                        onChange={(e) => updateRow(row.key, { semesterId: e.target.value })}
                        disabled={submitting || !row.academicYearId}
                        sx={{ ...getTextFieldStyles(isRtl), bgcolor: "#fff" }}
                      >
                        {semesters.length === 0 ? (
                          <MenuItem disabled>
                            {isRtl ? "لا توجد فصول دراسية في هذه السنة" : "This year has no semesters"}
                          </MenuItem>
                        ) : (
                          semesters.map((x) => (
                            <MenuItem key={x.id} value={x.id}>
                              {x.name}
                            </MenuItem>
                          ))
                        )}
                      </TextField>

                      <IconButton
                        aria-label={t("dialog.remove_placement")}
                        onClick={() => setRows((prev) => prev.filter((r) => r.key !== row.key))}
                        disabled={submitting || rows.length === 1}
                        sx={{ color: "error.main", mt: 0.25 }}
                      >
                        <Iconify icon="solar:trash-bin-trash-bold" width={20} />
                      </IconButton>
                    </Stack>
                    {rowError && (
                      <Typography variant="caption" sx={{ color: "error.main", display: "block", mt: 0.75 }}>
                        {rowError}
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Stack>

            {errors.placements && (
              <Typography variant="caption" sx={{ color: "error.main", display: "block", mt: 1 }}>
                {errors.placements}
              </Typography>
            )}

            <Button
              size="small"
              onClick={() => {
                // Start the new row from the last one's faculty — the common case is the same faculty, another year.
                const last = rows[rows.length - 1];
                setRows((prev) => [...prev, newRow(last?.facultyId ?? "")]);
                clearError("placements");
              }}
              disabled={submitting}
              startIcon={<Iconify icon="mingcute:add-line" width={18} />}
              sx={{ mt: 1.5, color: "#1C252E", fontWeight: 600 }}
            >
              {t("dialog.add_placement")}
            </Button>
          </Box>

          {/* مفعل / غير مفعل */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              pt: 0.5,
              direction: isRtl ? "rtl" : "ltr",
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {t("dialog.status")}
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  color="success"
                  disabled={submitting}
                />
              }
              label={isActive ? t("status.active") : t("status.inactive")}
              sx={{ m: 0 }}
            />
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, direction: isRtl ? "rtl" : "ltr" }}>
        <Button
          onClick={onClose}
          variant="outlined"
          disabled={submitting}
          sx={{ borderRadius: 1.5, borderColor: "#E2E8F0", color: "#1E293B" }}
        >
          {t("dialog.cancel")}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={submitting}
          startIcon={
            submitting ? <CircularProgress size={18} color="inherit" /> : null
          }
          sx={{
            borderRadius: 1.5,
            bgcolor: "#1C252E",
            "&:hover": { bgcolor: "#2C353E" },
            px: 3,
          }}
        >
          {isEdit ? t("dialog.save") : t("dialog.save")}
        </Button>
      </DialogActions>
    </>
  );
}

export default function SubjectFormDialog({
  open,
  onClose,
  initialData,
  onSave,
}: Props) {
  const locale = useLocale();
  const isRtl = locale === "ar";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      dir={isRtl ? "rtl" : "ltr"}
      slotProps={{
        paper: {
          dir: isRtl ? "rtl" : "ltr",
          sx: {
            borderRadius: 2,
            direction: isRtl ? "rtl" : "ltr",
          },
        },
      }}
    >
      {open && (
        <FormContent
          initialData={initialData}
          onClose={onClose}
          onSave={onSave}
          isRtl={isRtl}
        />
      )}
    </Dialog>
  );
}
