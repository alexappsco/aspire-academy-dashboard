'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import Iconify from 'src/components/iconify';
import SelectField from 'src/components/SelectField/SelectField';
import { useToast } from 'src/components/toast';
import {
  getInstructorAssignedStudyMaterialsAction,
  getInstructorProfileAction,
  getInstructorProfileCountriesAction,
  getInstructorProfileSpecializationsAction,
  getInstructorProfileUniversitiesAction,
  updateInstructorAssignedStudyMaterialsAction,
  updateInstructorProfileAction,
} from 'src/actions/instructor-profile';
import type { InstructorLookupItem, InstructorProfileDto } from 'src/types/instructor-profile';
import type { AddedStudyMaterial } from 'src/sections/minutes-management/components/InstructorStudyMaterialsCard';
import ProfileStudyMaterialsCard from './components/ProfileStudyMaterialsCard';

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
    <Box sx={{ width: '100%' }}>
      <Typography
        sx={{
          mb: 0.75,
          color: '#475467',
          fontSize: 13,
          fontWeight: 600,
          textAlign: rtl ? 'right' : 'left',
        }}
      >
        {label}
        {required && (
          <Box component="span" sx={{ color: '#D14343', ml: 0.5 }}>
            *
          </Box>
        )}
      </Typography>
      {children}
    </Box>
  );
}

function ReadOnlyField({
  label,
  value,
  icon,
  rtl,
}: {
  label: string;
  value: string;
  icon: string;
  rtl: boolean;
}) {
  return (
    <Box sx={{ width: '100%' }}>
      <Typography
        sx={{
          mb: 0.75,
          color: '#475467',
          fontSize: 13,
          fontWeight: 600,
          textAlign: rtl ? 'right' : 'left',
        }}
      >
        {label}
      </Typography>
      <TextField
        fullWidth
        size="small"
        value={value || '—'}
        slotProps={{
          input: {
            readOnly: true,
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon={icon} width={18} sx={{ color: '#94A3B8' }} />
              </InputAdornment>
            ),
          },
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            bgcolor: '#F8FAFC',
            '& fieldset': { borderColor: '#E5E7EB' },
            '& input': {
              direction: rtl ? 'rtl' : 'ltr',
              textAlign: rtl ? 'right' : 'left',
              fontSize: 14,
              color: '#1E293B',
              WebkitTextFillColor: '#1E293B',
            },
          },
        }}
      />
    </Box>
  );
}

function lookupLabel(item: InstructorLookupItem | undefined, isRtl: boolean) {
  if (!item) return '';
  return isRtl
    ? item.nameAr || item.name || item.nameEn || ''
    : item.nameEn || item.name || item.nameAr || '';
}

function formatDisplayDate(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function mapAssignedMaterials(
  items: Awaited<ReturnType<typeof getInstructorAssignedStudyMaterialsAction>>['data'],
  isRtl: boolean
): AddedStudyMaterial[] {
  if (!items?.length) return [];

  return items.map((sm) => {
    const displayName = isRtl
      ? sm.nameAr || sm.name || sm.nameEn || ''
      : sm.nameEn || sm.name || sm.nameAr || '';

    return {
      id: sm.id,
      name: displayName,
      nameAr: sm.nameAr,
      nameEn: sm.nameEn,
      facultyId: sm.facultyId || '',
      facultyName: sm.facultyName || '',
      academicYearId: sm.academicYearId || '',
      academicYearName: sm.academicYearName || '',
      semesterId: sm.semesterId || '',
      semesterName: sm.semesterName || '',
    };
  });
}

export default function InstructorProfileView() {
  const t = useTranslations('InstructorProfile');
  const toast = useToast();
  const locale = useLocale();
  const isRtl = locale === 'ar';

  const inputRootSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      direction: isRtl ? 'rtl' : 'ltr',
      textAlign: isRtl ? 'right' : 'left',
      '& fieldset': { borderColor: '#E5E7EB' },
      '&:hover fieldset': { borderColor: '#B0B8C1' },
      '&.Mui-focused fieldset': { borderColor: '#1D4ED8' },
      '& input, & textarea': {
        direction: isRtl ? 'rtl' : 'ltr',
        textAlign: isRtl ? 'right' : 'left',
        fontSize: 14,
      },
    },
  };

  const avatarRef = React.useRef<HTMLInputElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [initLoading, setInitLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<InstructorProfileDto | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    title: '',
    country: '',
    university: '',
    qualification: '',
    startDate: '',
    bio: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    specializationIds: [] as string[],
  });

  const [studyMaterials, setStudyMaterials] = useState<AddedStudyMaterial[]>([]);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [countries, setCountries] = useState<InstructorLookupItem[]>([]);
  const [universities, setUniversities] = useState<InstructorLookupItem[]>([]);
  const [specializations, setSpecializations] = useState<InstructorLookupItem[]>([]);

  const loadProfile = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent === true;
    if (!silent) setInitLoading(true);
    try {
      const [profileRes, materialsRes, countriesRes, universitiesRes, specializationsRes] =
        await Promise.all([
          getInstructorProfileAction(),
          getInstructorAssignedStudyMaterialsAction(),
          getInstructorProfileCountriesAction(),
          getInstructorProfileUniversitiesAction(),
          getInstructorProfileSpecializationsAction(),
        ]);

      if (countriesRes.success && countriesRes.data) setCountries(countriesRes.data);
      if (universitiesRes.success && universitiesRes.data) setUniversities(universitiesRes.data);
      if (specializationsRes.success && specializationsRes.data) {
        setSpecializations(specializationsRes.data);
      }

      if (!profileRes.success || !profileRes.data) {
        toast.error(profileRes.error || t('messages.load_error'));
        return;
      }

      const data = profileRes.data;
      setProfile(data);
      setFormData({
        fullName: data.name ?? '',
        title: data.title ?? '',
        country: data.countryId ?? '',
        university: data.universityId ?? '',
        qualification: data.educationalQualification ?? '',
        startDate: data.startJobAt ? data.startJobAt.slice(0, 10) : '',
        bio: data.bio ?? '',
        email: data.email ?? '',
        phone: data.phoneNumber ?? '',
        password: '',
        confirmPassword: '',
        specializationIds: data.specializationIds ?? [],
      });
      setAvatarPreview(data.imageUrl || null);
      setAvatarFile(null);

      if (materialsRes.success && materialsRes.data) {
        setStudyMaterials(mapAssignedMaterials(materialsRes.data, isRtl));
      } else if (data.studyMaterialIds?.length) {
        setStudyMaterials(
          data.studyMaterialIds.map((id, index) => ({
            id,
            name: data.studyMaterialNames?.[index] || id,
            facultyId: '',
            facultyName: '',
            academicYearId: '',
            academicYearName: '',
            semesterId: '',
            semesterName: '',
          }))
        );
      } else {
        setStudyMaterials([]);
      }
    } catch {
      toast.error(t('messages.load_error'));
    } finally {
      if (!silent) setInitLoading(false);
    }
    // toast/t are stable enough for this screen; avoid remounting on toast open/close
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRtl]);

  useEffect(() => {
    void loadProfile();
    // Initial load only — do not re-fetch when toast closes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange =
    (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSelectChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSpecializationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.value as unknown as string[];
    setFormData((prev) => ({ ...prev, specializationIds: selected }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error(t('messages.image_too_large'));
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const getPasswordStrength = () => {
    const { password } = formData;
    if (!password) return { level: 0, label: '' };
    if (password.length < 4) return { level: 1, label: t('password_strength_weak') };
    if (password.length < 8) return { level: 2, label: t('password_strength_medium') };
    return { level: 3, label: t('password_strength_strong') };
  };

  const passwordStrength = getPasswordStrength();

  const specializationDisplayNames =
    profile?.specializationNames?.filter(Boolean) ??
    formData.specializationIds
      .map((id) => lookupLabel(specializations.find((s) => s.id === id), isRtl))
      .filter(Boolean);

  const handleCancelEdit = () => {
    setIsEditing(false);
    setAvatarFile(null);
    void loadProfile({ silent: true });
  };

  const handleSubmit = async () => {
    if (!formData.fullName.trim()) {
      toast.error(t('messages.required_name'));
      return;
    }
    if (!formData.email.trim()) {
      toast.error(t('messages.required_email'));
      return;
    }
    if (formData.password || formData.confirmPassword) {
      if (!formData.password.trim()) {
        toast.error(t('messages.required_password'));
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error(t('messages.password_mismatch'));
        return;
      }
    }

    setLoading(true);
    try {
      const studyMaterialIds = studyMaterials.map((s) => s.id);
      const payload = {
        Name: formData.fullName.trim(),
        Email: formData.email.trim(),
        PhoneNumber: formData.phone || undefined,
        Title: formData.title || undefined,
        Bio: formData.bio || undefined,
        EducationalQualification: formData.qualification || undefined,
        StartJobAt: formData.startDate || undefined,
        CountryId: formData.country || undefined,
        UniversityId: formData.university || undefined,
        SpecializationIds: formData.specializationIds,
        StudyMaterialIds: studyMaterialIds,
        ...(formData.password
          ? {
              NewPassword: formData.password,
              ConfirmNewPassword: formData.confirmPassword,
            }
          : {}),
        ...(avatarFile ? { ProfileImage: avatarFile } : {}),
      };

      const [profileRes, materialsRes] = await Promise.all([
        updateInstructorProfileAction(payload),
        updateInstructorAssignedStudyMaterialsAction({ studyMaterialIds }),
      ]);

      if (!profileRes.success) {
        toast.error(profileRes.error || t('messages.update_error'));
        return;
      }

      if (!materialsRes.success) {
        toast.error(materialsRes.error || t('messages.update_materials_error'));
      } else {
        toast.success(t('messages.update_success'));
      }

      setIsEditing(false);
      await loadProfile({ silent: true });
    } catch {
      toast.error(t('messages.update_error'));
    } finally {
      setLoading(false);
    }
  };

  if (initLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      dir={isRtl ? 'rtl' : 'ltr'}
      sx={{
        py: 2,
        pb: 6,
        direction: isRtl ? 'rtl' : 'ltr',
        textAlign: isRtl ? 'right' : 'left',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          mb: 3,
          alignItems: { xs: 'stretch', sm: 'flex-start' },
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1C252E', mb: 0.5 }}>
            {t('page_title')}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            {t('page_subtitle')}
          </Typography>
        </Box>

        {!isEditing ? (
          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:pen-bold" width={18} />}
            onClick={() => setIsEditing(true)}
            sx={{
              bgcolor: '#1E293B',
              color: '#FFFFFF',
              borderRadius: 1.5,
              px: 3,
              py: 1.1,
              fontWeight: 600,
              textTransform: 'none',
              alignSelf: { xs: 'stretch', sm: 'flex-start' },
              '&:hover': { bgcolor: '#0F172A' },
            }}
          >
            {t('btn_edit')}
          </Button>
        ) : null}
      </Stack>

      <Card
        sx={{
          borderRadius: 3,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)',
          border: '1px solid #F1F3F5',
          mb: 3,
          bgcolor: '#FFFFFF',
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1C252E', mb: 1 }}>
            {t('section_personal_info')}
          </Typography>
          <Divider sx={{ mb: 3, borderColor: '#E5E7EB' }} />

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            <Box sx={{ flexShrink: 0, textAlign: 'center' }}>
              {isEditing ? (
                <>
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      border: '2px dashed #CBD5E1',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      mx: 'auto',
                      bgcolor: avatarPreview ? 'transparent' : '#F9FAFB',
                      backgroundImage: avatarPreview ? `url(${avatarPreview})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      '&:hover': { borderColor: '#94A3B8' },
                    }}
                    onClick={() => avatarRef.current?.click()}
                  >
                    {!avatarPreview && (
                      <Iconify
                        icon="solar:camera-minimalistic-bold"
                        width={28}
                        sx={{ color: '#94A3B8' }}
                      />
                    )}
                  </Box>
                  <input
                    ref={avatarRef}
                    type="file"
                    hidden
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleAvatarChange}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => avatarRef.current?.click()}
                    sx={{
                      mt: 1.5,
                      borderColor: '#BFDBFE',
                      color: '#1D4ED8',
                      bgcolor: '#EFF6FF',
                      borderRadius: 1.5,
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      textTransform: 'none',
                    }}
                  >
                    {t('upload_photo')}
                  </Button>
                  <Typography
                    variant="caption"
                    sx={{ color: '#94A3B8', display: 'block', mt: 0.5 }}
                  >
                    {t('photo_hint')}
                  </Typography>
                </>
              ) : (
                <>
                  <Avatar
                    src={avatarPreview || undefined}
                    sx={{
                      width: 120,
                      height: 120,
                      mx: 'auto',
                      fontSize: 36,
                      bgcolor: '#E2E8F0',
                      color: '#475467',
                    }}
                  >
                    {(profile?.name || '?').slice(0, 1)}
                  </Avatar>
                  <Typography sx={{ mt: 1.5, fontWeight: 700, color: '#1C252E' }}>
                    {profile?.name}
                  </Typography>
                  {profile?.isVerified && (
                    <Chip
                      icon={<Iconify icon="solar:verified-check-bold" width={16} />}
                      label={t('account_active')}
                      size="small"
                      sx={{
                        mt: 1,
                        bgcolor: '#ECFDF3',
                        color: '#027A48',
                        fontWeight: 600,
                        '& .MuiChip-icon': { color: '#12B76A' },
                      }}
                    />
                  )}
                </>
              )}
            </Box>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              {isEditing ? (
                <Stack spacing={2.5}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <FormField label={t('field_full_name')} required rtl={isRtl}>
                      <TextField
                        fullWidth
                        size="small"
                        value={formData.fullName}
                        onChange={handleChange('fullName')}
                        placeholder={t('placeholders.full_name')}
                        sx={inputRootSx}
                      />
                    </FormField>
                    <FormField label={t('field_title')} rtl={isRtl}>
                      <TextField
                        fullWidth
                        size="small"
                        value={formData.title}
                        onChange={handleChange('title')}
                        placeholder={t('placeholders.title')}
                        sx={inputRootSx}
                      />
                    </FormField>
                  </Stack>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <FormField label={t('field_country')} required rtl={isRtl}>
                      <SelectField
                        fullWidth
                        size="small"
                        value={formData.country}
                        onChange={handleSelectChange('country')}
                        sx={inputRootSx}
                      >
                        <MenuItem value="">
                          <em>{t('placeholders.country')}</em>
                        </MenuItem>
                        {countries.map((c) => (
                          <MenuItem key={c.id} value={c.id}>
                            {lookupLabel(c, isRtl)}
                          </MenuItem>
                        ))}
                      </SelectField>
                    </FormField>
                    <FormField label={t('field_university')} rtl={isRtl}>
                      <SelectField
                        fullWidth
                        size="small"
                        value={formData.university}
                        onChange={handleSelectChange('university')}
                        sx={inputRootSx}
                      >
                        <MenuItem value="">
                          <em>{t('placeholders.university')}</em>
                        </MenuItem>
                        {universities.map((u) => (
                          <MenuItem key={u.id} value={u.id}>
                            {lookupLabel(u, isRtl)}
                          </MenuItem>
                        ))}
                      </SelectField>
                    </FormField>
                  </Stack>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <FormField label={t('field_qualification')} rtl={isRtl}>
                      <TextField
                        fullWidth
                        size="small"
                        value={formData.qualification}
                        onChange={handleChange('qualification')}
                        placeholder={t('placeholders.qualification')}
                        sx={inputRootSx}
                      />
                    </FormField>
                    <FormField label={t('field_start_date')} rtl={isRtl}>
                      <TextField
                        fullWidth
                        size="small"
                        type="date"
                        value={formData.startDate}
                        onChange={handleChange('startDate')}
                        sx={inputRootSx}
                      />
                    </FormField>
                  </Stack>

                  <FormField label={t('field_specializations')} rtl={isRtl}>
                    <SelectField
                      fullWidth
                      size="small"
                      value={formData.specializationIds}
                      onChange={handleSpecializationsChange}
                      slotProps={{
                        select: {
                          multiple: true,
                          renderValue: (selected: unknown) => {
                            const ids = ((selected as string[]) ?? []).filter(Boolean);
                            const names = ids
                              .map((sid) => specializations.find((s) => s.id === sid))
                              .filter((s): s is InstructorLookupItem => !!s)
                              .map((s) => lookupLabel(s, isRtl));
                            return names.length
                              ? names.join(isRtl ? '، ' : ', ')
                              : t('specializations_placeholder');
                          },
                        },
                      }}
                      sx={inputRootSx}
                    >
                      {specializations.map((s) => (
                        <MenuItem key={s.id} value={s.id}>
                          <Checkbox
                            checked={formData.specializationIds.includes(s.id)}
                            size="small"
                          />
                          {lookupLabel(s, isRtl)}
                        </MenuItem>
                      ))}
                    </SelectField>
                  </FormField>

                  <FormField label={t('field_bio')} rtl={isRtl}>
                    <TextField
                      fullWidth
                      size="small"
                      multiline
                      rows={4}
                      value={formData.bio}
                      onChange={handleChange('bio')}
                      placeholder={t('placeholders.bio')}
                      sx={inputRootSx}
                    />
                  </FormField>
                </Stack>
              ) : (
                <Stack spacing={2.5}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <ReadOnlyField
                      label={t('field_full_name')}
                      value={profile?.name || ''}
                      icon="solar:user-bold"
                      rtl={isRtl}
                    />
                    <ReadOnlyField
                      label={t('field_title')}
                      value={profile?.title || ''}
                      icon="solar:medal-ribbons-star-bold"
                      rtl={isRtl}
                    />
                  </Stack>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <ReadOnlyField
                      label={t('field_country')}
                      value={profile?.countryName || ''}
                      icon="solar:global-bold"
                      rtl={isRtl}
                    />
                    <ReadOnlyField
                      label={t('field_university')}
                      value={
                        profile?.universityName ||
                        lookupLabel(
                          universities.find((u) => u.id === profile?.universityId || ''),
                          isRtl
                        )
                      }
                      icon="solar:buildings-2-bold"
                      rtl={isRtl}
                    />
                  </Stack>

                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <ReadOnlyField
                      label={t('field_qualification')}
                      value={profile?.educationalQualification || ''}
                      icon="solar:diploma-bold"
                      rtl={isRtl}
                    />
                    <ReadOnlyField
                      label={t('field_start_date')}
                      value={formatDisplayDate(profile?.startJobAt)}
                      icon="solar:calendar-bold"
                      rtl={isRtl}
                    />
                  </Stack>

                  <Box>
                    <Typography
                      sx={{
                        mb: 0.75,
                        color: '#475467',
                        fontSize: 13,
                        fontWeight: 600,
                        textAlign: isRtl ? 'right' : 'left',
                      }}
                    >
                      {t('field_specializations')}
                    </Typography>
                    <Box
                      sx={{
                        minHeight: 42,
                        px: 1.5,
                        py: 1,
                        borderRadius: 2,
                        border: '1px solid #E5E7EB',
                        bgcolor: '#F8FAFC',
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 1,
                        alignItems: 'center',
                      }}
                    >
                      {specializationDisplayNames.length ? (
                        specializationDisplayNames.map((name) => (
                          <Chip
                            key={name}
                            label={name}
                            size="small"
                            sx={{
                              bgcolor: '#EFF6FF',
                              color: '#1D4ED8',
                              fontWeight: 600,
                            }}
                          />
                        ))
                      ) : (
                        <Typography sx={{ fontSize: 14, color: '#94A3B8' }}>—</Typography>
                      )}
                    </Box>
                  </Box>

                  <Box>
                    <Typography
                      sx={{
                        mb: 0.75,
                        color: '#475467',
                        fontSize: 13,
                        fontWeight: 600,
                        textAlign: isRtl ? 'right' : 'left',
                      }}
                    >
                      {t('field_bio')}
                    </Typography>
                    <TextField
                      fullWidth
                      size="small"
                      multiline
                      rows={4}
                      value={profile?.bio || '—'}
                      slotProps={{
                        input: { readOnly: true },
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          bgcolor: '#F8FAFC',
                          '& fieldset': { borderColor: '#E5E7EB' },
                          '& textarea': {
                            direction: isRtl ? 'rtl' : 'ltr',
                            textAlign: isRtl ? 'right' : 'left',
                            fontSize: 14,
                            color: '#1E293B',
                          },
                        },
                      }}
                    />
                  </Box>
                </Stack>
              )}
            </Box>
          </Stack>
        </Box>
      </Card>

      <ProfileStudyMaterialsCard
        value={studyMaterials}
        onChange={setStudyMaterials}
        isRtl={isRtl}
        readOnly={!isEditing}
      />

      <Card
        sx={{
          borderRadius: 3,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)',
          border: '1px solid #F1F3F5',
          mb: 3,
          bgcolor: '#FFFFFF',
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1C252E', mb: 0.5 }}>
            {t('section_login_credentials')}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', mb: 2 }}>
            {isEditing ? t('login_credentials_subtitle_edit') : t('login_credentials_subtitle')}
          </Typography>
          <Divider sx={{ mb: 3, borderColor: '#E5E7EB' }} />

          {isEditing ? (
            <Stack spacing={2.5}>
              <FormField label={t('field_email')} required rtl={isRtl}>
                <TextField
                  fullWidth
                  size="small"
                  type="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  placeholder={t('placeholders.email')}
                  sx={inputRootSx}
                />
              </FormField>

              <FormField label={t('field_phone')} rtl={isRtl}>
                <TextField
                  fullWidth
                  size="small"
                  value={formData.phone}
                  onChange={handleChange('phone')}
                  placeholder={t('placeholders.phone')}
                  sx={inputRootSx}
                />
              </FormField>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Box sx={{ flex: 1 }}>
                  <FormField label={t('field_password')} rtl={isRtl}>
                    <TextField
                      fullWidth
                      size="small"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange('password')}
                      placeholder={t('placeholders.password')}
                      autoComplete="new-password"
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
                                    ? '#EF4444'
                                    : passwordStrength.level === 2
                                      ? '#F59E0B'
                                      : '#22C55E'
                                  : '#E5E7EB',
                            }}
                          />
                        ))}
                      </Stack>
                      <Typography
                        variant="caption"
                        sx={{
                          color:
                            passwordStrength.level <= 1
                              ? '#EF4444'
                              : passwordStrength.level === 2
                                ? '#F59E0B'
                                : '#16A34A',
                          fontWeight: 500,
                        }}
                      >
                        {passwordStrength.label}
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Box sx={{ flex: 1 }}>
                  <FormField label={t('field_confirm_password')} rtl={isRtl}>
                    <TextField
                      fullWidth
                      size="small"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleChange('confirmPassword')}
                      placeholder={t('placeholders.confirm_password')}
                      autoComplete="new-password"
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowConfirmPassword((prev) => !prev)}
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
                </Box>
              </Stack>
            </Stack>
          ) : (
            <Stack spacing={2.5}>
              <ReadOnlyField
                label={t('field_email')}
                value={profile?.email || ''}
                icon="solar:letter-bold"
                rtl={isRtl}
              />
              <ReadOnlyField
                label={t('field_phone')}
                value={profile?.phoneNumber || ''}
                icon="solar:phone-bold"
                rtl={isRtl}
              />
              <ReadOnlyField
                label={t('field_password')}
                value="••••••••"
                icon="solar:lock-password-bold"
                rtl={isRtl}
              />
            </Stack>
          )}
        </Box>
      </Card>

      {isEditing && (
        <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-start' }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            sx={{
              bgcolor: '#1E293B',
              color: '#FFFFFF',
              borderRadius: 1.5,
              px: 4,
              py: 1.2,
              gap: 1,
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': { bgcolor: '#0F172A' },
            }}
          >
            {loading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <Iconify icon="mingcute:check-line" width={20} />
            )}
            {t('btn_save')}
          </Button>
          <Button
            variant="outlined"
            onClick={handleCancelEdit}
            disabled={loading}
            sx={{
              borderColor: '#CBD5E1',
              color: '#1E293B',
              borderRadius: 1.5,
              px: 4,
              py: 1.2,
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': { borderColor: '#94A3B8', bgcolor: '#F8FAFC' },
            }}
          >
            {t('btn_cancel')}
          </Button>
        </Stack>
      )}
    </Box>
  );
}
