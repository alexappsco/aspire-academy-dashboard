"use client";

import { useRef, useState } from "react";
import { useRouter } from "src/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { useToast } from "src/components/toast";
import Iconify from "src/components/iconify";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  MenuItem,
  Stack,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";


const STEP_ICONS = [
  "solar:shop-bold-duotone",
  "solar:map-point-bold-duotone",
  "solar:file-bold-duotone",
];

const fieldStyle = {
  "& .MuiOutlinedInput-root": { borderRadius: "12px" },
  "& .MuiInputBase-input": { py: 1.15, fontSize: "0.9rem" },
};

export default function RegisterPage() {
  const router = useRouter();
  const t = useTranslations("Register");
  const locale = useLocale();
  const { error, success } = useToast();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    customerName: "",
    storeName: "",
    subcategory_id: "",
    email: "",
    password: "",
    description: "",
    city_id: "",
    address: "",
    phone: "",
    whatsapp: "",
    phone2: "",
  });

  const [subcategories, setSubcategories] = useState<{ id: string; name: string }[]>([]);
  const [subcategoriesLoading, setSubcategoriesLoading] = useState(false);

  const [cities, setCities] = useState<{ id: string; name?: string; name_ar?: string; name_en?: string }[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);

  const [located, setLocated] = useState(false);
  const [coords, setCoords] = useState({ lat: 24.7136, lng: 46.6753 });
  const [terms, setTerms] = useState(false);

  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [banner, setBanner] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [commercialReg, setCommercialReg] = useState<File | null>(null);
  const [taxCert, setTaxCert] = useState<File | null>(null);

  const avatarRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  const cityLabel = (city: { id: string; name?: string; name_ar?: string; name_en?: string }) =>
    locale === "ar"
      ? city.name_ar || city.name || city.name_en || ""
      : city.name_en || city.name || city.name_ar || "";

  const setField = (key: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleImage = (
    file: File | undefined,
    setter: (f: File) => void,
    previewSetter: (p: string) => void,
    label: string
  ) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      error(t("toasts.invalid_image", { label }));
      return;
    }
    setter(file);
    previewSetter(URL.createObjectURL(file));
  };

  const handleLocate = () => {
    setLocated(true);
    setCoords({
      lat: 24.7136 + (Math.random() - 0.5) * 0.05,
      lng: 46.6753 + (Math.random() - 0.5) * 0.05,
    });
    success(t("toasts.location_set"));
  };

  const validateStep = (s: number): string | null => {
    if (s === 0) {
      if (!form.customerName.trim()) return t("validation.name_required");
      if (!form.email.trim()) return t("validation.email_required");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        return t("validation.email_invalid");
      if (!form.password) return t("validation.password_required");
      return null;
    }
    return null;
  };

  const handleNext = () => {
    const msg = validateStep(step);
    if (msg) {
      error(msg);
      return;
    }
    if (step < 2) {
      setStep((s) => s + 1);
      return;
    }
    handleSubmit();
  };

  const handleSubmit = async () => {
    setLoading(true);
    success(t("toasts.register_success"));
    setTimeout(() => {
      router.push("/auth/login");
    }, 1000);
  };

  const phonePrefix = "🇸🇦 +966";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        minHeight: "100vh",
        height: { md: "100vh" },
        overflow: { md: "hidden" },
        alignItems: "center",
        bgcolor: "#fff",
      }}
    >
      {/* Form container */}
      <Box
        sx={{
          width: { xs: "100%", md: "50%" },
          height: { md: "100vh" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          order: { xs: 2, md: 1 },
          py: { xs: 8, md: 0 },
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 600, px: 4, py: { xs: 2, md: 1.5 } }}>
          <Box
            sx={{
              bgcolor: "#fff",
              borderRadius: "24px",
              boxShadow: "0 24px 70px rgba(0,0,0,0.18)",
              px: { xs: 3, md: 4 },
              py: { xs: 3, md: 2.5 },
            }}
          >
            {/* Step header */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: "10px",
                  bgcolor: "#EDE9FE",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#6D4FE2",
                }}
              >
                <Iconify icon={STEP_ICONS[step]} width={20} />
              </Box>
              <Box>
                <Typography
                  sx={{ fontWeight: 800, fontSize: "1.05rem", color: "#111827" }}
                >
                  {t(`steps.${step}.title`)}
                </Typography>
                <Typography sx={{ fontSize: "0.78rem", color: "#9CA3AF" }}>
                  {t(`steps.${step}.subtitle`)}
                </Typography>
              </Box>
            </Box>

            <style>{`
              @keyframes fadeSlideIn {
                from { opacity: 0; transform: translateY(14px); }
                to { opacity: 1; transform: translateY(0); }
              }
              @keyframes pinPulse {
                0% { transform: scale(0.6); opacity: 0.8; }
                100% { transform: scale(1.4); opacity: 0; }
              }
            `}</style>

            <Box key={step} sx={{ animation: "fadeSlideIn 0.4s ease" }}>
              {step === 0 && (
                <>
                  {/* Avatar + Banner */}
                  <Box sx={{ position: "relative", mt: 3, mb: 3.5 }}>
                    <Box
                      onClick={() => bannerRef.current?.click()}
                      sx={{
                        height: { xs: 90, sm: 105 },
                        borderRadius: "18px",
                        background: bannerPreview
                          ? `url(${bannerPreview}) center/cover no-repeat`
                          : "linear-gradient(120deg, #886ce8, #a78bfa)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      {!bannerPreview && (
                        <Stack
                          spacing={0.5}
                          sx={{ alignItems: "center", color: "#fff", opacity: 0.9 }}
                        >
                          <Iconify icon="solar:gallery-bold" width={24} />
                          <Typography sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
                            {t("fields.cover")}
                          </Typography>
                        </Stack>
                      )}
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          bannerRef.current?.click();
                        }}
                        sx={{
                          position: "absolute",
                          bottom: 8,
                          insetInlineEnd: 8,
                          bgcolor: "rgba(255,255,255,0.9)",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                          width: 26,
                          height: 26,
                        }}
                      >
                        <Iconify icon="solar:camera-minimalistic-bold" width={14} />
                      </IconButton>
                    </Box>

                    <Box
                      onClick={() => avatarRef.current?.click()}
                      sx={{
                        position: "absolute",
                        bottom: -24,
                        insetInlineStart: { xs: 16, md: 24 },
                        width: 76,
                        height: 76,
                        borderRadius: "50%",
                        border: "3px solid #fff",
                        background: avatarPreview
                          ? `url(${avatarPreview}) center/cover no-repeat`
                          : "linear-gradient(135deg, #6d4fe2, #a78bfa)",
                        cursor: "pointer",
                        boxShadow: "0 8px 22px rgba(0,0,0,0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {!avatarPreview && (
                        <Iconify
                          icon="solar:user-circle-bold"
                          width={36}
                          sx={{ color: "rgba(255,255,255,0.9)" }}
                        />
                      )}
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          avatarRef.current?.click();
                        }}
                        sx={{
                          position: "absolute",
                          bottom: 0,
                          insetInlineEnd: 0,
                          bgcolor: "#fff",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                          width: 24,
                          height: 24,
                          p: 0.5,
                        }}
                      >
                        <Iconify icon="solar:camera-minimalistic-bold" width={12} />
                      </IconButton>
                    </Box>
                  </Box>

                  <input
                    ref={bannerRef}
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) =>
                      handleImage(
                        e.target.files?.[0],
                        setBanner,
                        setBannerPreview,
                        t("fields.cover")
                      )
                    }
                  />
                  <input
                    ref={avatarRef}
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) =>
                      handleImage(
                        e.target.files?.[0],
                        setAvatar,
                        setAvatarPreview,
                        t("fields.logo")
                      )
                    }
                  />

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      gap: 2,
                      ...fieldStyle,
                    }}
                  >
                    <TextField
                      label={t("fields.customer_name")}
                      placeholder={t("placeholders.full_name")}
                      value={form.customerName}
                      onChange={(e) => setField("customerName")(e.target.value)}
                    />
                    <TextField
                      label={t("fields.store_name")}
                      placeholder={t("placeholders.business_name")}
                      value={form.storeName}
                      onChange={(e) => setField("storeName")(e.target.value)}
                    />
                    <TextField
                      select
                      label={t("fields.category")}
                      value={form.subcategory_id}
                      onChange={(e) => setField("subcategory_id")(e.target.value)}
                    >
                      <MenuItem value="" disabled>
                        {subcategoriesLoading
                          ? t("placeholders.select_loading")
                          : t("placeholders.select_category")}
                      </MenuItem>
                      {subcategories.map((sub) => (
                        <MenuItem key={sub.id} value={sub.id}>
                          {sub.name}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      label={t("fields.email")}
                      placeholder={t("placeholders.email")}
                      type="email"
                      dir="ltr"
                      value={form.email}
                      onChange={(e) => setField("email")(e.target.value)}
                    />
                    <TextField
                      label={t("fields.password")}
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                      dir="ltr"
                      value={form.password}
                      onChange={(e) => setField("password")(e.target.value)}
                      sx={{ gridColumn: { xs: "auto", sm: "1 / -1" } }}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end" sx={{ ml: 0.5 }}>
                              <IconButton
                                size="small"
                                onClick={() => setShowPassword((prev) => !prev)}
                                edge="end"
                                sx={{ color: "text.secondary" }}
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  </Box>

                  <TextField
                    label={t("fields.description")}
                    placeholder={t("placeholders.description")}
                    multiline
                    rows={2}
                    fullWidth
                    value={form.description}
                    onChange={(e) => setField("description")(e.target.value)}
                    sx={{ mt: 2, ...fieldStyle }}
                  />
                </>
              )}

              {step === 1 && (
                <>
                  <TextField
                    select
                    label={t("fields.city")}
                    value={form.city_id}
                    onChange={(e) => setField("city_id")(e.target.value)}
                    fullWidth
                    sx={{ mt: 3, ...fieldStyle }}
                  >
                    <MenuItem value="" disabled>
                      {citiesLoading
                        ? t("placeholders.select_loading")
                        : t("placeholders.select_city")}
                    </MenuItem>
                    {cities.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {cityLabel(c)}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    label={t("fields.address")}
                    placeholder={t("placeholders.address")}
                    multiline
                    rows={2}
                    fullWidth
                    value={form.address}
                    onChange={(e) => setField("address")(e.target.value)}
                    sx={{ mt: 2, ...fieldStyle }}
                  />

                  {/* Mini interactive map */}
                  <Box
                    sx={{
                      position: "relative",
                      height: 130,
                      borderRadius: "16px",
                      overflow: "hidden",
                      border: "1px solid #EDE9FE",
                      mt: 2,
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        bgcolor: "#EEF0FA",
                        backgroundImage:
                          "linear-gradient(rgba(136,108,232,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(136,108,232,0.09) 1px, transparent 1px)",
                        backgroundSize: "26px 26px",
                      }}
                    >
                      <Box
                        sx={{
                          position: "absolute",
                          top: 0,
                          bottom: 0,
                          insetInlineStart: "30%",
                          width: 14,
                          bgcolor: "#fff",
                          borderLeft: "1px solid #E3E0F5",
                          borderRight: "1px solid #E3E0F5",
                        }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          top: "-10%",
                          bottom: "-10%",
                          insetInlineStart: "64%",
                          width: 20,
                          bgcolor: "#fff",
                          transform: "rotate(8deg)",
                          borderLeft: "1px solid #E3E0F5",
                          borderRight: "1px solid #E3E0F5",
                        }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          left: 0,
                          right: 0,
                          top: "46%",
                          height: 16,
                          bgcolor: "#fff",
                          borderTop: "1px solid #E3E0F5",
                          borderBottom: "1px solid #E3E0F5",
                        }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          left: 0,
                          right: 0,
                          top: "18%",
                          height: 10,
                          bgcolor: "#fff",
                          borderTop: "1px solid #E3E0F5",
                          borderBottom: "1px solid #E3E0F5",
                        }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          top: "58%",
                          insetInlineEnd: "6%",
                          width: 70,
                          height: 48,
                          borderRadius: "12px",
                          bgcolor: "#DCEFD9",
                        }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          top: "10%",
                          insetInlineStart: "10%",
                          width: 54,
                          height: 38,
                          borderRadius: "12px",
                          bgcolor: "#DCEFD9",
                        }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 0,
                          insetInlineEnd: "26%",
                          width: 88,
                          height: 56,
                          borderTopLeftRadius: "100%",
                          borderTopRightRadius: "100%",
                          bgcolor: "#C9E4F8",
                        }}
                      />
                    </Box>

                    {/* Center pin */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Box
                        sx={{
                          position: "absolute",
                          width: located ? 44 : 34,
                          height: located ? 44 : 34,
                          borderRadius: "50%",
                          bgcolor: "rgba(136,108,232,0.35)",
                          animation: "pinPulse 1.6s ease-out infinite",
                        }}
                      />
                      <Iconify
                        icon="solar:map-point-bold"
                        width={32}
                        sx={{ color: "#6D4FE2", position: "relative" }}
                      />
                    </Box>

                    {/* Locate button */}
                    {located ? (
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 10,
                          insetInlineEnd: 10,
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          bgcolor: "rgba(255,255,255,0.92)",
                          backdropFilter: "blur(6px)",
                          borderRadius: "999px",
                          px: 1.5,
                          py: 0.75,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                        }}
                      >
                        <Iconify
                          icon="eva:checkmark-circle-2-fill"
                          width={16}
                          sx={{ color: "#22C55E" }}
                        />
                        <Typography
                          sx={{
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            color: "#374151",
                            direction: "ltr",
                          }}
                        >
                          {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
                        </Typography>
                      </Box>
                    ) : (
                      <Button
                        onClick={handleLocate}
                        sx={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          bgcolor: "rgba(255,255,255,0.9)",
                          backdropFilter: "blur(8px)",
                          color: "#6D4FE2",
                          fontWeight: 700,
                          borderRadius: "999px",
                          px: 2,
                          py: 0.8,
                          fontSize: "0.82rem",
                          textTransform: "none",
                          boxShadow: "0 6px 18px rgba(0,0,0,0.15)",
                          "&:hover": { bgcolor: "#fff" },
                          gap: 1,
                        }}
                      >
                        <Iconify icon="solar:gps-bold" width={16} />
                        {t("actions.locate")}
                      </Button>
                    )}
                  </Box>

                  {/* Contact pills */}
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      gap: 2,
                      mt: 2,
                      ...fieldStyle,
                    }}
                  >
                    <TextField
                      label={t("fields.phone")}
                      placeholder={t("placeholders.phone")}
                      dir="ltr"
                      value={form.phone}
                      onChange={(e) => setField("phone")(e.target.value)}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.4,
                                }}
                              >
                                <Typography sx={{ fontSize: "0.85rem" }}>
                                  {phonePrefix.split(" ")[0]}
                                </Typography>
                                <Typography
                                  sx={{
                                    fontSize: "0.85rem",
                                    color: "#6B7280",
                                    fontWeight: 700,
                                    direction: "ltr",
                                  }}
                                >
                                  {phonePrefix.split(" ")[1]}
                                </Typography>
                              </Box>
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                    <TextField
                      label={t("fields.whatsapp")}
                      placeholder={t("placeholders.phone")}
                      dir="ltr"
                      value={form.whatsapp}
                      onChange={(e) => setField("whatsapp")(e.target.value)}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.4,
                                }}
                              >
                                <Iconify
                                  icon="mdi:whatsapp"
                                  width={18}
                                  sx={{ color: "#22C55E" }}
                                />
                                <Typography
                                  sx={{
                                    fontSize: "0.85rem",
                                    color: "#6B7280",
                                    fontWeight: 700,
                                    direction: "ltr",
                                  }}
                                >
                                  {phonePrefix.split(" ")[1]}
                                </Typography>
                              </Box>
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                    <TextField
                      label={t("fields.phone_extra")}
                      placeholder={t("placeholders.phone")}
                      dir="ltr"
                      value={form.phone2}
                      onChange={(e) => setField("phone2")(e.target.value)}
                      sx={{ gridColumn: { xs: "auto", sm: "1 / -1" } }}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <Typography
                                sx={{
                                  fontSize: "0.85rem",
                                  color: "#6B7280",
                                  fontWeight: 700,
                                  direction: "ltr",
                                }}
                              >
                                {phonePrefix}
                              </Typography>
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  </Box>
                </>
              )}

              {step === 2 && (
                <>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      gap: 2,
                      mt: 3,
                    }}
                  >
                    <DocumentUpload
                      label={t("documents.commercial_reg")}
                      optional
                      file={commercialReg}
                      onSelect={setCommercialReg}
                      onRemove={() => setCommercialReg(null)}
                      onError={error}
                    />
                    <DocumentUpload
                      label={t("documents.tax_cert")}
                      optional
                      file={taxCert}
                      onSelect={setTaxCert}
                      onRemove={() => setTaxCert(null)}
                      onError={error}
                    />
                  </Box>

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={terms}
                        onChange={(e) => setTerms(e.target.checked)}
                        sx={{ color: "#886ce8", "&.Mui-checked": { color: "#886ce8" } }}
                      />
                    }
                    label={t("terms")}
                    sx={{
                      mt: 2,
                      "& .MuiTypography-root": {
                        fontSize: "0.85rem",
                        color: "#4B5563",
                      },
                    }}
                  />
                </>
              )}
            </Box>

            {/* Navigation */}
            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              {step > 0 && (
                <Button
                  onClick={() => setStep((s) => s - 1)}
                  sx={{
                    flex: 1,
                    border: "1px solid #E5E7EB",
                    color: "#6B7280",
                    fontWeight: 700,
                    py: 1.25,
                    borderRadius: "999px",
                    fontSize: "0.9rem",
                    textTransform: "none",
                    "&:hover": { bgcolor: "#F9FAFB" },
                  }}
                >
                  {t("actions.previous")}
                </Button>
              )}
              <Button
                onClick={handleNext}
                disabled={loading}
                sx={{
                  flex: 1,
                  bgcolor: "#1B2942",
                  color: "#fff",
                  fontWeight: 700,
                  py: 1.25,
                  borderRadius: "999px",
                  fontSize: "0.9rem",
                  textTransform: "none",
                  boxShadow: "0 12px 26px rgba(136,108,232,0.45)",
                  "&:hover": { bgcolor: "#7758d9" },
                }}
              >
                {loading
                  ? t("actions.creating")
                  : step < 2
                    ? t("actions.next")
                    : t("actions.create_account")}
              </Button>
            </Stack>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.5,
                mt: 2,
              }}
            >
              <Typography sx={{ fontSize: "0.82rem", color: "#9CA3AF" }}>
                {t("actions.have_account")}
              </Typography>
              <Typography
                onClick={() => router.push("/auth/login")}
                sx={{
                  fontSize: "0.82rem",
                  color: "#6D4FE2",
                  fontWeight: 700,
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                {t("actions.login")}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Brand & progress panel */}
      <Box
        sx={{
          width: { xs: "100%", md: "50%" },
          height: { md: "100vh" },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          order: { xs: 1, md: 2 },
          py: { xs: 6, md: 0 },
          px: 4,
        }}
      >
        <Box
          component="img"
          src="/logo.svg"
          alt="aspire academy"
          sx={{ width: { xs: 150, md: 200 }, objectFit: "contain", mb: 4 }}
        />

        <Stack spacing={0} sx={{ width: "100%", maxWidth: 380 }}>
          {STEP_ICONS.map((icon, i) => {
            const isActive = i === step;
            const isDone = i < step;
            return (
              <Box key={t(`steps.${i}.title`)} sx={{ display: "flex", gap: 1.5 }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: isDone
                        ? "#886ce8"
                        : isActive
                          ? "#886ce8"
                          : "#E6E3F2",
                      color: isDone || isActive ? "#fff" : "#A5A3B8",
                      boxShadow: isActive
                        ? "0 10px 24px rgba(136,108,232,0.45)"
                        : "none",
                      transition: "all 0.3s",
                    }}
                  >
                    {isDone ? (
                      <Iconify icon="eva:checkmark-fill" width={18} />
                    ) : (
                      <Iconify icon={icon} width={18} />
                    )}
                  </Box>
                  {i < STEP_ICONS.length - 1 && (
                    <Box
                      sx={{
                        width: 2,
                        height: 26,
                        bgcolor: isDone ? "#886ce8" : "#E6E3F2",
                        my: 0.75,
                        transition: "all 0.3s",
                      }}
                    />
                  )}
                </Box>
                <Box sx={{ pt: 0.9 }}>
                  <Typography
                    sx={{
                      fontWeight: isActive ? 800 : 600,
                      fontSize: "0.9rem",
                      color: isActive || isDone ? "#1F2937" : "#9CA3AF",
                      transition: "all 0.3s",
                    }}
                  >
                    {t(`steps.${i}.title`)}
                  </Typography>
                  <Typography sx={{ fontSize: "0.75rem", color: "#9CA3AF" }}>
                    {t(`steps.${i}.subtitle`)}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Stack>

        <Box
          sx={{
            mt: 4,
            maxWidth: 360,
            textAlign: "center",
            bgcolor: "#fff",
            borderRadius: "18px",
            p: 2,
            boxShadow: "0 10px 30px rgba(136,108,232,0.12)",
            border: "1px solid #E8E4F8",
          }}
        >
          <Iconify
            icon="solar:stars-bold-duotone"
            width={22}
            sx={{ color: "#886ce8", mb: 0.5 }}
          />
          <Typography
            sx={{
              fontSize: "0.85rem",
              color: "#4B5563",
              lineHeight: 1.8,
              fontWeight: 500,
            }}
          >
            {t(`steps.${step}.msg`)}
          </Typography>
        </Box>
      </Box>

    </Box>
  );
}

// ----------------------------------------------------------------------

function DocumentUpload({
  label,
  required,
  optional,
  file,
  onSelect,
  onRemove,
  onError,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  file: File | null;
  onSelect: (file: File) => void;
  onRemove: () => void;
  onError: (msg: string) => void;
}) {
  const t = useTranslations("Register");
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptFile = (f: File | undefined) => {
    if (!f) return;
    const ok = /\.(pdf|jpg|jpeg|png)$/i.test(f.name) || f.type.includes("pdf");
    if (!ok) {
      onError(t("documents.invalid_file"));
      return;
    }
    onSelect(f);
  };

  return (
    <Box>
      <Typography
        sx={{ fontWeight: 600, fontSize: "0.85rem", color: "#374151", mb: 1 }}
      >
        {label}{" "}
        {required && (
          <Box component="span" sx={{ color: "#EF4444" }}>
            *
          </Box>
        )}
        {optional && (
          <Box component="span" sx={{ color: "#9CA3AF", fontSize: "0.75rem" }}>
            {t("documents.optional")}
          </Box>
        )}
      </Typography>
      <Box
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          acceptFile(e.dataTransfer.files?.[0]);
        }}
        sx={{
          border: "2px dashed #D6D0F0",
          borderRadius: "16px",
          p: 2,
          textAlign: "center",
          bgcolor: "#FAFAFF",
          cursor: "pointer",
          transition: "all 0.3s",
          minHeight: 115,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          "&:hover": { bgcolor: "#F3F0FF", borderColor: "#886ce8" },
        }}
      >
        <input
          ref={inputRef}
          type="file"
          hidden
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => {
            acceptFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        {file ? (
          <>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "12px",
                bgcolor: "#FEE2E2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#EF4444",
              }}
            >
              <Iconify icon="solar:file-bold-duotone" width={20} />
            </Box>
            <Typography
              sx={{
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "#374151",
                mt: 1,
                px: 1,
                wordBreak: "break-all",
              }}
            >
              {file.name}
            </Typography>
            <Typography sx={{ fontSize: "0.72rem", color: "#22C55E", mt: 0.5 }}>
              {t("documents.uploaded")}
            </Typography>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              sx={{
                position: "absolute",
                top: 8,
                insetInlineEnd: 8,
                bgcolor: "#fff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                width: 26,
                height: 26,
                "&:hover": { bgcolor: "#FEE2E2" },
              }}
            >
              <Iconify icon="eva:close-fill" width={16} sx={{ color: "#EF4444" }} />
            </IconButton>
          </>
        ) : (
          <>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                bgcolor: "#EDE9FE",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 1,
              }}
            >
              <Iconify icon="solar:documents-bold" width={18} sx={{ color: "#6D4FE2" }} />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: "0.85rem", color: "#374151" }}>
              {t("documents.upload_prompt")}
            </Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "#9CA3AF", mt: 0.5 }}>
              {t("documents.upload_hint")}
            </Typography>
          </>
        )}
      </Box>
    </Box>
  );
}
