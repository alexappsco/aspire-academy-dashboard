"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "src/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

import MenuItem from "@mui/material/MenuItem";

import Iconify from "src/components/iconify";
import SelectField from "src/components/SelectField/SelectField";
import { useToast } from "src/components/toast";
import {
  getInstructorById,
  createInstructor,
  updateInstructor,
  getUniversities,
} from "src/actions/instructors";
import { getCountriesAction } from "src/actions/countries";
import type { Country, University } from "src/types/instructor";

interface MinutesFormViewProps {
  id?: string;
}

function FormField({
  label,
  required = false,
  children,
  rtl,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  rtl: boolean;
}) {
  return (
    <Box sx={{ width: "100%" }}>
      <Typography
        sx={{
          mb: 0.75,
          color: "#475467",
          fontSize: 13,
          fontWeight: 600,
          textAlign: rtl ? "right" : "left",
        }}
      >
        {label}
        {required && (
          <Box component="span" sx={{ color: "#D14343", ml: 0.5 }}>
            *
          </Box>
        )}
      </Typography>
      {children}
    </Box>
  );
}

export default function NewMinutesManagementView({ id }: MinutesFormViewProps) {
  const t = useTranslations("MinutesManagement");
  const toast = useToast();
  const router = useRouter();
  const locale = useLocale();
  const isRtl = locale === "ar";

  const inputRootSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
      direction: isRtl ? "rtl" : "ltr",
      textAlign: isRtl ? "right" : "left",
      "& fieldset": { borderColor: "#E5E7EB" },
      "&:hover fieldset": { borderColor: "#B0B8C1" },
      "&.Mui-focused fieldset": { borderColor: "#1D4ED8" },
      "& input, & textarea": {
        direction: isRtl ? "rtl" : "ltr",
        textAlign: isRtl ? "right" : "left",
        fontSize: 14,
      },
    },
  };

  const isEdit = !!id;
  const listPath = `/${locale}/minutes-management`;

  const avatarRef = React.useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    title: "",
    country: "",
    university: "",
    qualification: "",
    startDate: "",
    bio: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(!!id);

  const [countries, setCountries] = useState<Country[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);

  useEffect(() => {
    getCountriesAction({ MaxResultCount: 1000 }).then((res) => {
      if (res.success && res.data) setCountries(res.data.items);
    });
    getUniversities({ MaxResultCount: 1000 }).then((res) => {
      if (res.success && res.data) setUniversities(res.data.items);
    });
  }, []);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    getInstructorById(id)
      .then((res) => {
        if (!isMounted) return;

        if (res.success && res.data) {
          const inst = res.data;
          setFormData({
            fullName: inst.name ?? "",
            title: inst.title ?? "",
            country: inst.countryId ?? "",
            university: inst.universityId ?? "",
            qualification: inst.educationalQualification ?? "",
            startDate: inst.startJobAt ? inst.startJobAt.slice(0, 10) : "",
            bio: inst.bio ?? "",
            email: inst.email ?? "",
            phone: inst.phoneNumber ?? "",
            password: "",
            confirmPassword: "",
          });
          setAvatarPreview(inst.imageUrl || null);
        } else {
          toast.error(res.error || "Failed to load instructor");
        }
      })
      .finally(() => {
        if (isMounted) {
          setInitLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id, toast]);

  const handleChange =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSelectChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!formData.fullName.trim()) {
      toast.error(t("messages.required_name"));
      return;
    }
    if (!formData.email.trim()) {
      toast.error(t("messages.required_email"));
      return;
    }
    if (!isEdit && !formData.password.trim()) {
      toast.error(t("messages.required_password"));
      return;
    }
    if (!isEdit && formData.password !== formData.confirmPassword) {
      toast.error(t("messages.password_mismatch"));
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        const payload = {
          Name: formData.fullName,
          Title: formData.title || undefined,
          Bio: formData.bio || undefined,
          EducationalQualification: formData.qualification || undefined,
          StartJobAt: formData.startDate || undefined,
          CountryId: formData.country || undefined,
          UniversityId: formData.university || undefined,
          ...(avatarFile && { ProfileImage: avatarFile }),
        };
        const res = await updateInstructor(id, payload as never);
        if (res.success) {
          toast.success(t("messages.update_success"));
          window.location.assign(listPath);
          return;
        } else {
          toast.error(res.error || "Failed to update instructor");
        }
      } else {
        const payload = {
          Name: formData.fullName,
          Email: formData.email,
          Password: formData.password,
          PhoneNumber: formData.phone || undefined,
          Title: formData.title || undefined,
          Bio: formData.bio || undefined,
          EducationalQualification: formData.qualification || undefined,
          StartJobAt: formData.startDate || undefined,
          CountryId: formData.country || undefined,
          UniversityId: formData.university || undefined,
          ...(avatarFile && { ProfileImage: avatarFile }),
        };
        const res = await createInstructor(payload as never);
        if (res.success) {
          toast.success(t("messages.add_success"));
          router.push("/minutes-management");
        } else {
          toast.error(res.error || "Failed to create instructor");
        }
      }
    } catch {
      toast.error(
        isEdit ? "Failed to update instructor" : "Failed to create instructor",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/minutes-management");
  };

  const getPasswordStrength = () => {
    const { password } = formData;
    if (!password) return { level: 0, label: "" };
    if (password.length < 4)
      return { level: 1, label: t("password_strength_weak") };
    if (password.length < 8) return { level: 2, label: "" };
    return { level: 3, label: "" };
  };

  const passwordStrength = getPasswordStrength();

  if (initLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      dir={isRtl ? "rtl" : "ltr"}
      sx={{
        py: 2,
        pb: 6,
        direction: isRtl ? "rtl" : "ltr",
        textAlign: isRtl ? "right" : "left",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{
          mb: 4,
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
        }}
      >
        <Box>
          <Breadcrumbs
            separator="›"
            aria-label="breadcrumb"
            sx={{
              mb: 1,
              "& .MuiBreadcrumbs-separator": { mx: 1, color: "#94A3B8" },
            }}
          >
            <Link
              underline="hover"
              color="inherit"
              onClick={() => router.push("/")}
              sx={{
                cursor: "pointer",
                fontSize: 13,
                color: "#64748B",
                fontWeight: 500,
              }}
            >
              {t("breadcrumb_dashboard")}
            </Link>
            <Link
              underline="hover"
              color="inherit"
              onClick={() => router.push("/minutes-management")}
              sx={{
                cursor: "pointer",
                fontSize: 13,
                color: "#64748B",
                fontWeight: 500,
              }}
            >
              {t("breadcrumb_lecturers")}
            </Link>
            <Typography
              sx={{ fontSize: 13, color: "#1E293B", fontWeight: 600 }}
            >
              {isEdit
                ? t("breadcrumb_edit_lecturer")
                : t("breadcrumb_add_lecturer")}
            </Typography>
          </Breadcrumbs>

          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: "#1C252E", mb: 0.5 }}
          >
            {isEdit ? t("page_title_edit") : t("page_title")}
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748B" }}>
            {t("page_subtitle")}
          </Typography>
        </Box>
      </Stack>

      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.02)",
          border: "1px solid #F1F3F5",
          mb: 3,
          bgcolor: "#FFFFFF",
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: "#1C252E", mb: 1 }}
          >
            {t("section_personal_info")}
          </Typography>
          <Divider sx={{ mb: 3, borderColor: "#E5E7EB" }} />

          <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
            <Box sx={{ flexShrink: 0 }}>
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: 3,
                  border: "2px dashed #CBD5E1",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  bgcolor: avatarPreview ? "transparent" : "#F9FAFB",
                  backgroundImage: avatarPreview
                    ? `url(${avatarPreview})`
                    : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  transition: "border-color 0.2s",
                  "&:hover": { borderColor: "#94A3B8" },
                }}
                onClick={() => avatarRef.current?.click()}
              >
                {!avatarPreview && (
                  <Iconify
                    icon="solar:camera-minimalistic-bold"
                    width={28}
                    sx={{ color: "#94A3B8", mb: 0.5 }}
                  />
                )}
              </Box>
              <input
                ref={avatarRef}
                type="file"
                hidden
                accept="image/*"
                onChange={handleAvatarChange}
              />
              <Button
                variant="outlined"
                size="small"
                onClick={() => avatarRef.current?.click()}
                sx={{
                  mt: 1.5,
                  borderColor: "#BFDBFE",
                  color: "#1D4ED8",
                  bgcolor: "#EFF6FF",
                  borderRadius: 1.5,
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  textTransform: "none",
                  "&:hover": { borderColor: "#93C5FD", bgcolor: "#DBEAFE" },
                }}
              >
                {t("upload_photo")}
              </Button>
              <Typography
                variant="caption"
                sx={{
                  color: "#94A3B8",
                  display: "block",
                  mt: 0.5,
                  textAlign: "center",
                }}
              >
                {t("photo_hint")}
              </Typography>
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack spacing={2.5}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <FormField label={t("field_full_name")} required rtl={isRtl}>
                    <TextField
                      fullWidth
                      size="small"
                      value={formData.fullName}
                      onChange={handleChange("fullName")}
                      placeholder={t("field_full_name")}
                      sx={inputRootSx}
                    />
                  </FormField>

                  <FormField label={t("field_title")} rtl={isRtl}>
                    <TextField
                      fullWidth
                      size="small"
                      value={formData.title}
                      onChange={handleChange("title")}
                      placeholder={t("field_title")}
                      sx={inputRootSx}
                    />
                  </FormField>
                </Stack>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <FormField label={t("field_country")} rtl={isRtl}>
                    <SelectField
                      fullWidth
                      size="small"
                      value={formData.country}
                      onChange={handleSelectChange("country")}
                      sx={inputRootSx}
                    >
                      <MenuItem value="">
                        <em>{isRtl ? "اختر الدولة" : "Select country..."}</em>
                      </MenuItem>
                      {countries.map((c) => (
                        <MenuItem key={c.id} value={c.id}>
                          {isRtl ? (c.nameAr ?? c.name) : (c.nameEn ?? c.name)}
                        </MenuItem>
                      ))}
                    </SelectField>
                  </FormField>

                  <FormField label={t("field_university")} rtl={isRtl}>
                    <SelectField
                      fullWidth
                      size="small"
                      value={formData.university}
                      onChange={handleSelectChange("university")}
                      sx={inputRootSx}
                    >
                      <MenuItem value="">
                        <em>
                          {isRtl ? "اختر الجامعة" : "Select university..."}
                        </em>
                      </MenuItem>
                      {universities.map((u) => (
                        <MenuItem key={u.id} value={u.id}>
                          {isRtl ? u.nameAr : u.nameEn}
                        </MenuItem>
                      ))}
                    </SelectField>
                  </FormField>
                </Stack>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <FormField label={t("field_qualification")} rtl={isRtl}>
                    <TextField
                      fullWidth
                      size="small"
                      value={formData.qualification}
                      onChange={handleChange("qualification")}
                      placeholder={t("field_qualification")}
                      sx={inputRootSx}
                    />
                  </FormField>

                  <FormField label={t("field_start_date")} rtl={isRtl}>
                    <TextField
                      fullWidth
                      size="small"
                      type="date"
                      value={formData.startDate}
                      onChange={handleChange("startDate")}
                      sx={inputRootSx}
                    />
                  </FormField>
                </Stack>

                <FormField label={t("field_bio")} rtl={isRtl}>
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    rows={4}
                    value={formData.bio}
                    onChange={handleChange("bio")}
                    placeholder={t("field_bio")}
                    sx={inputRootSx}
                  />
                </FormField>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Card>

      {!isEdit && (
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.02)",
            border: "1px solid #F1F3F5",
            mb: 3,
            bgcolor: "#FFFFFF",
          }}
        >
          <Box sx={{ p: 3 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "#1C252E", mb: 0.5 }}
            >
              {t("section_login_credentials")}
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748B", mb: 2 }}>
              {t("login_credentials_subtitle")}
            </Typography>
            <Divider sx={{ mb: 3, borderColor: "#E5E7EB" }} />

            <Stack spacing={2.5}>
              <FormField label={t("field_email")} required rtl={isRtl}>
                <TextField
                  fullWidth
                  size="small"
                  type="email"
                  value={formData.email}
                  onChange={handleChange("email")}
                  placeholder={t("field_email")}
                  sx={inputRootSx}
                />
              </FormField>

              <FormField label={t("field_phone")} rtl={isRtl}>
                <TextField
                  fullWidth
                  size="small"
                  value={formData.phone}
                  onChange={handleChange("phone")}
                  placeholder={t("field_phone")}
                  sx={inputRootSx}
                />
              </FormField>

              <Box>
                <FormField label={t("field_password")} required rtl={isRtl}>
                  <TextField
                    fullWidth
                    size="small"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange("password")}
                    placeholder={t("field_password")}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword((prev) => !prev)}
                              edge="end"
                              size="small"
                            >
                              {showPassword ? (
                                <VisibilityOff fontSize="small" />
                              ) : (
                                <Visibility fontSize="small" />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                    sx={inputRootSx}
                  />
                </FormField>
                {formData.password && (
                  <Box sx={{ mt: 1.5 }}>
                    <Stack direction="row" spacing={0.75} sx={{ mb: 0.5 }}>
                      {[1, 2, 3].map((segment) => (
                        <Box
                          key={segment}
                          sx={{
                            flex: 1,
                            height: 4,
                            borderRadius: 2,
                            bgcolor:
                              segment <= passwordStrength.level
                                ? passwordStrength.level <= 1
                                  ? "#EF4444"
                                  : passwordStrength.level === 2
                                    ? "#F59E0B"
                                    : "#22C55E"
                                : "#E5E7EB",
                          }}
                        />
                      ))}
                    </Stack>
                    <Typography
                      variant="caption"
                      sx={{ color: "#EF4444", fontWeight: 500 }}
                    >
                      {passwordStrength.label}
                    </Typography>
                  </Box>
                )}
              </Box>

              <FormField
                label={t("field_confirm_password")}
                required
                rtl={isRtl}
              >
                <TextField
                  fullWidth
                  size="small"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange("confirmPassword")}
                  placeholder={t("field_confirm_password")}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() =>
                              setShowConfirmPassword((prev) => !prev)
                            }
                            edge="end"
                            size="small"
                          >
                            {showConfirmPassword ? (
                              <VisibilityOff fontSize="small" />
                            ) : (
                              <Visibility fontSize="small" />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={inputRootSx}
                />
              </FormField>
            </Stack>
          </Box>
        </Card>
      )}

      <Stack direction="row" spacing={2} sx={{ justifyContent: "flex-start" }}>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{
            bgcolor: "#1E293B",
            color: "#FFFFFF",
            borderRadius: 1.5,
            px: 4,
            py: 1.2,
            gap: 1,
            fontWeight: 600,
            "&:hover": { bgcolor: "#0F172A" },
          }}
        >
          {loading ? (
            <CircularProgress size={18} color="inherit" />
          ) : (
            <Iconify icon="mingcute:check-line" width={20} />
          )}
          {isEdit ? t("btn_update_lecturer") : t("btn_create_lecturer")}
        </Button>
        <Button
          variant="outlined"
          onClick={handleCancel}
          disabled={loading}
          sx={{
            borderColor: "#CBD5E1",
            color: "#1E293B",
            borderRadius: 1.5,
            px: 4,
            py: 1.2,
            fontWeight: 600,
            "&:hover": { borderColor: "#94A3B8", bgcolor: "#F8FAFC" },
          }}
        >
          {t("btn_cancel")}
        </Button>
      </Stack>
    </Box>
  );
}
