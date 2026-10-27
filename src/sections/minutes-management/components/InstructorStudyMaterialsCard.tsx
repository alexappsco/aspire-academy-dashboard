'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Popover from '@mui/material/Popover';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';

import Iconify from 'src/components/iconify';
import SelectField from 'src/components/SelectField/SelectField';
import { getFaculties } from 'src/actions/faculties';
import { getAcademicYears, AcademicYearDto } from 'src/actions/academic-years';
import { getSemesters, SemesterDto } from 'src/actions/semesters';
import { getStudyMaterialsAction } from 'src/actions/study-materials';
import type { Faculty } from 'src/types/faculty';
import type { StudyMaterialDto } from 'src/types/study-material';

export interface AddedStudyMaterial {
  id: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  code?: string;
  facultyId: string;
  facultyName: string;
  academicYearId?: string;
  academicYearName: string;
  semesterId: string;
  semesterName: string;
}

interface Props {
  value: AddedStudyMaterial[];
  onChange: (items: AddedStudyMaterial[]) => void;
  isRtl?: boolean;
}

export default function InstructorStudyMaterialsCard({
  value = [],
  onChange,
  isRtl = true,
}: Props) {
  const t = useTranslations('MinutesManagement');
  const locale = useLocale();

  // Lookups data
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYearDto[]>([]);
  const [semesters, setSemesters] = useState<SemesterDto[]>([]);
  const [availableMaterials, setAvailableMaterials] = useState<StudyMaterialDto[]>([]);

  // Selection states
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>('');
  const [selectedYearId, setSelectedYearId] = useState<string>('');
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>('');

  // Loading states
  const [loadingFaculties, setLoadingFaculties] = useState(false);
  const [loadingYears, setLoadingYears] = useState(false);
  const [loadingSemesters, setLoadingSemesters] = useState(false);
  const [loadingMaterials, setLoadingMaterials] = useState(false);

  // Popover state for Materials multi-select
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null);
  const [materialSearchQuery, setMaterialSearchQuery] = useState('');
  const [pendingSelectedMaterialIds, setPendingSelectedMaterialIds] = useState<string[]>([]);

  // Common styling for input fields
  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: 2,
      bgcolor: '#FFFFFF',
      fontSize: 13.5,
      direction: isRtl ? 'rtl' : 'ltr',
      textAlign: isRtl ? 'right' : 'left',
      '& fieldset': { borderColor: '#E5E7EB' },
      '&:hover fieldset': { borderColor: '#B0B8C1' },
      '&.Mui-focused fieldset': { borderColor: '#1D4ED8' },
    },
  };

  // 1. Load faculties on mount
  useEffect(() => {
    setLoadingFaculties(true);
    getFaculties({ MaxResultCount: 1000, IsActive: true })
      .then((res) => {
        if (res.success && res.data) {
          setFaculties(res.data.items);
        }
      })
      .finally(() => setLoadingFaculties(false));
  }, []);

  // 2. When faculty changes, fetch academic years
  const handleFacultyChange = (facultyId: string) => {
    setSelectedFacultyId(facultyId);
    setSelectedYearId('');
    setSelectedSemesterId('');
    setAcademicYears([]);
    setSemesters([]);
    setAvailableMaterials([]);
    setPendingSelectedMaterialIds([]);

    if (!facultyId) return;

    setLoadingYears(true);
    getAcademicYears({ FacultyId: facultyId, MaxResultCount: 1000, IsActive: true })
      .then((res) => {
        if (res.success && res.data) {
          setAcademicYears(res.data.items);
        }
      })
      .finally(() => setLoadingYears(false));
  };

  // 3. When academic year changes, fetch semesters
  const handleYearChange = (yearId: string) => {
    setSelectedYearId(yearId);
    setSelectedSemesterId('');
    setSemesters([]);
    setAvailableMaterials([]);
    setPendingSelectedMaterialIds([]);

    if (!yearId || !selectedFacultyId) return;

    setLoadingSemesters(true);
    getSemesters({
      FacultyId: selectedFacultyId,
      AcademicYearId: yearId,
      MaxResultCount: 1000,
      IsActive: true,
    })
      .then((res) => {
        if (res.success && res.data) {
          setSemesters(res.data.items);
        }
      })
      .finally(() => setLoadingSemesters(false));
  };

  // 4. When semester changes, fetch study materials
  const handleSemesterChange = (semesterId: string) => {
    setSelectedSemesterId(semesterId);
    setAvailableMaterials([]);
    setPendingSelectedMaterialIds([]);

    if (!semesterId || !selectedFacultyId) return;

    setLoadingMaterials(true);
    getStudyMaterialsAction({
      FacultyId: selectedFacultyId,
      AcademicYearId: selectedYearId || undefined,
      SemesterId: semesterId,
      MaxResultCount: 1000,
      IsActive: true,
    })
      .then((res) => {
        if (res.success && res.data) {
          setAvailableMaterials(res.data.items);
        }
      })
      .finally(() => setLoadingMaterials(false));
  };

  // Check which materials are already in the table
  const alreadyAddedIds = useMemo(() => new Set(value.map((v) => v.id)), [value]);

  // Materials available for selection in the popover
  const filteredMaterials = useMemo(() => {
    return availableMaterials.filter((m) => {
      // Exclude already added materials
      if (alreadyAddedIds.has(m.id)) return false;

      // Apply search query
      if (!materialSearchQuery.trim()) return true;
      const q = materialSearchQuery.trim().toLowerCase();
      const matchAr = m.nameAr?.toLowerCase().includes(q);
      const matchEn = m.nameEn?.toLowerCase().includes(q);
      return Boolean(matchAr || matchEn);
    });
  }, [availableMaterials, alreadyAddedIds, materialSearchQuery]);

  // Names of already added materials in current selection for the footer note
  const hiddenAddedNames = useMemo(() => {
    return availableMaterials
      .filter((m) => alreadyAddedIds.has(m.id))
      .map((m) => (isRtl ? m.nameAr || m.nameEn : m.nameEn || m.nameAr));
  }, [availableMaterials, alreadyAddedIds, isRtl]);

  // Popover toggle
  const isMaterialDropdownDisabled =
    !selectedFacultyId || !selectedSemesterId || loadingMaterials;

  const handleOpenPopover = (e: React.MouseEvent<HTMLElement>) => {
    if (isMaterialDropdownDisabled) return;
    setPopoverAnchor(e.currentTarget);
    setMaterialSearchQuery('');
  };

  const handleClosePopover = () => {
    setPopoverAnchor(null);
  };

  const handleTogglePendingMaterial = (id: string) => {
    setPendingSelectedMaterialIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Commit selected materials into the added table
  const handleAddSelectedMaterials = () => {
    if (pendingSelectedMaterialIds.length === 0) return;

    const currentFaculty = faculties.find((f) => f.id === selectedFacultyId);
    const facultyName = currentFaculty
      ? isRtl
        ? currentFaculty.nameAr || currentFaculty.nameEn
        : currentFaculty.nameEn || currentFaculty.nameAr
      : '';

    const currentYear = academicYears.find((y) => y.id === selectedYearId);
    const yearName = currentYear
      ? isRtl
        ? currentYear.nameAr || currentYear.nameEn
        : currentYear.nameEn || currentYear.nameAr
      : '';

    const currentSemester = semesters.find((s) => s.id === selectedSemesterId);
    const semesterName = currentSemester
      ? isRtl
        ? currentSemester.nameAr || currentSemester.nameEn
        : currentSemester.nameEn || currentSemester.nameAr
      : '';

    const newItems: AddedStudyMaterial[] = pendingSelectedMaterialIds
      .map((id) => availableMaterials.find((m) => m.id === id))
      .filter((m): m is StudyMaterialDto => Boolean(m))
      .map((m) => {
        const ar = m.nameAr;
        const en = m.nameEn;
        const displayName =
          ar && en && ar !== en ? `${ar} (${en})` : ar || en || '';

        return {
          id: m.id,
          name: displayName,
          nameAr: m.nameAr,
          nameEn: m.nameEn,
          facultyId: selectedFacultyId,
          facultyName,
          academicYearId: selectedYearId,
          academicYearName: yearName,
          semesterId: selectedSemesterId,
          semesterName,
        };
      });

    onChange([...value, ...newItems]);
    setPendingSelectedMaterialIds([]);
    handleClosePopover();
  };

  // Remove material from table
  const handleRemoveMaterial = (id: string) => {
    onChange(value.filter((item) => item.id !== id));
  };

  // Label inside the trigger box
  const triggerLabel = useMemo(() => {
    if (isMaterialDropdownDisabled) {
      return t('study_materials.material_disabled_placeholder');
    }
    if (pendingSelectedMaterialIds.length > 0) {
      return isRtl
        ? `• تم تحديد ${pendingSelectedMaterialIds.length} مواد (${pendingSelectedMaterialIds.length})`
        : `• ${pendingSelectedMaterialIds.length} materials selected`;
    }
    return t('study_materials.material_placeholder');
  }, [isMaterialDropdownDisabled, pendingSelectedMaterialIds.length, isRtl, t]);

  return (
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
        {/* 1. Header with Book Icon */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: '#1C252E',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Iconify
              icon="solar:book-bookmark-bold"
              width={24}
              sx={{ color: '#1C252E' }}
            />
            {t('study_materials.title')}
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
          {t('study_materials.subtitle')}
        </Typography>

        {/* 2. Selection Row: Faculty, Academic Year, Semester, Material, Add Button */}
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          spacing={2}
          sx={{ mb: 3, alignItems: { xs: 'stretch', lg: 'flex-end' } }}
        >
          {/* A. الكلية */}
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                mb: 0.75,
                color: '#475467',
                fontSize: 13,
                fontWeight: 600,
                textAlign: isRtl ? 'right' : 'left',
              }}
            >
              {t('study_materials.faculty_label')}
            </Typography>
            <SelectField
              fullWidth
              size="small"
              value={selectedFacultyId}
              onChange={(e) => handleFacultyChange(e.target.value)}
              disabled={loadingFaculties}
              sx={fieldSx}
            >
              <MenuItem value="">
                <em>{t('study_materials.faculty_placeholder')}</em>
              </MenuItem>
              {faculties.map((f) => (
                <MenuItem key={f.id} value={f.id}>
                  {isRtl ? f.nameAr || f.nameEn : f.nameEn || f.nameAr}
                </MenuItem>
              ))}
            </SelectField>
          </Box>

          {/* B. السنة الدراسية */}
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                mb: 0.75,
                color: '#475467',
                fontSize: 13,
                fontWeight: 600,
                textAlign: isRtl ? 'right' : 'left',
              }}
            >
              {t('study_materials.year_label')}
            </Typography>
            <SelectField
              fullWidth
              size="small"
              value={selectedYearId}
              onChange={(e) => handleYearChange(e.target.value)}
              disabled={!selectedFacultyId || loadingYears}
              sx={fieldSx}
            >
              <MenuItem value="">
                <em>{t('study_materials.year_placeholder')}</em>
              </MenuItem>
              {academicYears.map((y) => (
                <MenuItem key={y.id} value={y.id}>
                  {isRtl ? y.nameAr || y.nameEn : y.nameEn || y.nameAr}
                </MenuItem>
              ))}
            </SelectField>
          </Box>

          {/* C. الفصل الدراسي */}
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                mb: 0.75,
                color: '#475467',
                fontSize: 13,
                fontWeight: 600,
                textAlign: isRtl ? 'right' : 'left',
              }}
            >
              {t('study_materials.semester_label')}
            </Typography>
            <SelectField
              fullWidth
              size="small"
              value={selectedSemesterId}
              onChange={(e) => handleSemesterChange(e.target.value)}
              disabled={!selectedFacultyId || loadingSemesters}
              sx={fieldSx}
            >
              <MenuItem value="">
                <em>{t('study_materials.semester_placeholder')}</em>
              </MenuItem>
              {semesters.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {isRtl ? s.nameAr || s.nameEn : s.nameEn || s.nameAr}
                </MenuItem>
              ))}
            </SelectField>
          </Box>

          {/* D. المادة Multi-select Trigger */}
          <Box sx={{ flex: 1.2 }}>
            <Typography
              sx={{
                mb: 0.75,
                color: '#475467',
                fontSize: 13,
                fontWeight: 600,
                textAlign: isRtl ? 'right' : 'left',
              }}
            >
              {t('study_materials.material_label')}
            </Typography>

            <Box
              onClick={handleOpenPopover}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: 40,
                px: 1.75,
                borderRadius: 2,
                border: '1px solid',
                borderColor: popoverAnchor ? '#1D4ED8' : '#E5E7EB',
                bgcolor: isMaterialDropdownDisabled ? '#F9FAFB' : '#FFFFFF',
                cursor: isMaterialDropdownDisabled ? 'not-allowed' : 'pointer',
                color: isMaterialDropdownDisabled
                  ? '#9CA3AF'
                  : pendingSelectedMaterialIds.length > 0
                  ? '#1C252E'
                  : '#64748B',
                fontWeight: pendingSelectedMaterialIds.length > 0 ? 600 : 400,
                fontSize: 13.5,
                transition: 'all 0.15s ease',
                '&:hover': {
                  borderColor: isMaterialDropdownDisabled ? '#E5E7EB' : '#B0B8C1',
                },
              }}
            >
              <Typography
                variant="body2"
                noWrap
                sx={{
                  fontSize: 13.5,
                  fontWeight: pendingSelectedMaterialIds.length > 0 ? 600 : 400,
                  color: isMaterialDropdownDisabled ? '#9CA3AF' : '#1E293B',
                }}
              >
                {triggerLabel}
              </Typography>
              <Iconify
                icon={
                  popoverAnchor
                    ? 'solar:alt-arrow-up-linear'
                    : 'solar:alt-arrow-down-linear'
                }
                width={16}
                sx={{
                  color: isMaterialDropdownDisabled ? '#D1D5DB' : '#64748B',
                  flexShrink: 0,
                  ml: isRtl ? 0 : 1,
                  mr: isRtl ? 1 : 0,
                }}
              />
            </Box>
          </Box>

          {/* E. زر إضافة المادة */}
          <Box sx={{ flexShrink: 0 }}>
            <Button
              variant="contained"
              onClick={
                popoverAnchor
                  ? handleAddSelectedMaterials
                  : pendingSelectedMaterialIds.length > 0
                  ? handleAddSelectedMaterials
                  : handleOpenPopover
              }
              disabled={isMaterialDropdownDisabled}
              startIcon={<Iconify icon="mingcute:add-line" width={18} />}
              sx={{
                height: 40,
                px: 2.5,
                borderRadius: 2,
                bgcolor: '#1C252E',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: 13.5,
                boxShadow: 'none',
                whiteSpace: 'nowrap',
                gap: 0.5,
                '&:hover': { bgcolor: '#2C353E' },
                '&.Mui-disabled': {
                  bgcolor: '#F3F4F6',
                  color: '#9CA3AF',
                },
              }}
            >
              {t('study_materials.add_button')}
            </Button>
          </Box>
        </Stack>

        {/* 3. Materials Multi-select Popover (Matching Image 2) */}
        <Popover
          open={Boolean(popoverAnchor)}
          anchorEl={popoverAnchor}
          onClose={handleClosePopover}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: isRtl ? 'right' : 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: isRtl ? 'right' : 'left',
          }}
          slotProps={{
            paper: {
              sx: {
                width: { xs: 320, sm: 380 },
                borderRadius: 2.5,
                boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.1)',
                p: 2,
                mt: 1,
                border: '1px solid #E2E8F0',
              },
            },
          }}
        >
          {/* Top Search Input with Close button */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <TextField
              fullWidth
              size="small"
              placeholder={t('study_materials.search_placeholder')}
              value={materialSearchQuery}
              onChange={(e) => setMaterialSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify
                        icon="solar:magnifer-linear"
                        width={18}
                        sx={{ color: '#94A3B8' }}
                      />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#F8FAFC',
                  fontSize: 13,
                  '& fieldset': { borderColor: '#E2E8F0' },
                  '&:hover fieldset': { borderColor: '#CBD5E1' },
                  '&.Mui-focused fieldset': { borderColor: '#1D4ED8' },
                },
              }}
            />
            <IconButton
              size="small"
              onClick={handleClosePopover}
              sx={{ color: '#94A3B8' }}
            >
              <Iconify icon="ic:round-close" width={18} />
            </IconButton>
          </Box>

          {/* Subheader: Choose Material + Badge */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              py: 0.5,
              mb: 1,
            }}
          >
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
              {t('study_materials.choose_materials')}
            </Typography>
            {pendingSelectedMaterialIds.length > 0 && (
              <Chip
                label={`${pendingSelectedMaterialIds.length} ${t('study_materials.badge_selected')}`}
                size="small"
                sx={{
                  bgcolor: '#E0F2FE',
                  color: '#0284C7',
                  fontWeight: 700,
                  fontSize: 11.5,
                  height: 22,
                }}
              />
            )}
          </Box>

          {/* Scrollable Material List */}
          <Box
            sx={{
              maxHeight: 250,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 0.75,
              mb: 1.5,
            }}
          >
            {loadingMaterials ? (
              <Box sx={{ py: 3, textAlign: 'center' }}>
                <CircularProgress size={24} />
              </Box>
            ) : filteredMaterials.length === 0 ? (
              <Box sx={{ py: 3, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                  {t('study_materials.no_materials')}
                </Typography>
              </Box>
            ) : (
              filteredMaterials.map((material) => {
                const isChecked = pendingSelectedMaterialIds.includes(material.id);
                const title =
                  material.nameAr && material.nameEn && material.nameAr !== material.nameEn
                    ? `${material.nameAr} (${material.nameEn})`
                    : material.nameAr || material.nameEn;

                return (
                  <Box
                    key={material.id}
                    onClick={() => handleTogglePendingMaterial(material.id)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 1,
                      borderRadius: 2,
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: isChecked ? '#BFDBFE' : '#F1F5F9',
                      bgcolor: isChecked ? '#EFF6FF' : '#F8FAFC',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        borderColor: '#93C5FD',
                        bgcolor: '#F0F9FF',
                      },
                    }}
                  >
                    <Checkbox
                      checked={isChecked}
                      size="small"
                      sx={{
                        color: '#94A3B8',
                        p: 0.5,
                        mr: isRtl ? 0 : 1,
                        ml: isRtl ? 1 : 0,
                        '&.Mui-checked': { color: '#1D4ED8' },
                      }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography
                          variant="body2"
                          noWrap
                          sx={{
                            fontWeight: 600,
                            color: isChecked ? '#1D4ED8' : '#1E293B',
                            fontSize: 13,
                          }}
                        >
                          {title}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                );
              })
            )}
          </Box>

          {/* Footer note: previously added materials hidden automatically */}
          {hiddenAddedNames.length > 0 && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                p: 1,
                mb: 1.5,
                borderRadius: 1.5,
                bgcolor: '#F8FAFC',
              }}
            >
              <Iconify
                icon="solar:filter-linear"
                width={15}
                sx={{ color: '#94A3B8', flexShrink: 0 }}
              />
              <Typography
                variant="caption"
                sx={{ color: '#64748B', fontSize: 11.5 }}
              >
                {isRtl
                  ? `المواد المضافة سابقاً (${hiddenAddedNames.slice(0, 2).join('، ')}${
                      hiddenAddedNames.length > 2 ? '...' : ''
                    }) تم حجبها تلقائياً`
                  : t('study_materials.hidden_materials_note')}
              </Typography>
            </Box>
          )}

          {/* Bottom Button inside Popover: Add Selected */}
          <Button
            fullWidth
            variant="contained"
            onClick={handleAddSelectedMaterials}
            disabled={pendingSelectedMaterialIds.length === 0}
            startIcon={<Iconify icon="solar:add-circle-bold" width={18} />}
            sx={{
              bgcolor: '#1C252E',
              color: '#FFFFFF',
              borderRadius: 2,
              py: 1,
              fontWeight: 700,
              fontSize: 13,
              boxShadow: 'none',
              '&:hover': { bgcolor: '#2C353E' },
              '&.Mui-disabled': {
                bgcolor: '#F3F4F6',
                color: '#9CA3AF',
              },
            }}
          >
            {isRtl
              ? `إضافة المحدد (${pendingSelectedMaterialIds.length} مواد)`
              : `${t('study_materials.add_selected_button')} (${pendingSelectedMaterialIds.length})`}
          </Button>
        </Popover>

        {/* 4. Table Header Row (Matching Image 1) */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 1.5,
            pt: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1C252E' }}>
              {t('study_materials.added_title')}
            </Typography>
            <Chip
              label={value.length}
              size="small"
              sx={{
                bgcolor: '#EFF6FF',
                color: '#1D4ED8',
                fontWeight: 700,
                fontSize: 12,
                height: 22,
                minWidth: 24,
              }}
            />
          </Box>

          <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 500 }}>
            {t('study_materials.active_schedule_note')}
          </Typography>
        </Box>

        {/* 5. Added Materials Table (Matching Image 1) */}
        <TableContainer
          sx={{
            borderRadius: 2.5,
            border: '1px solid #F1F5F9',
            overflow: 'hidden',
            mb: 2.5,
          }}
        >
          <Table size="small">
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell
                  align={isRtl ? 'right' : 'left'}
                  sx={{ py: 1.5, fontWeight: 700, color: '#64748B', fontSize: 13 }}
                >
                  {t('study_materials.col_material')}
                </TableCell>
                <TableCell
                  align={isRtl ? 'right' : 'left'}
                  sx={{ py: 1.5, fontWeight: 700, color: '#64748B', fontSize: 13 }}
                >
                  {t('study_materials.col_faculty')}
                </TableCell>
                <TableCell
                  align={isRtl ? 'right' : 'left'}
                  sx={{ py: 1.5, fontWeight: 700, color: '#64748B', fontSize: 13 }}
                >
                  {t('study_materials.col_year')}
                </TableCell>
                <TableCell
                  align={isRtl ? 'right' : 'left'}
                  sx={{ py: 1.5, fontWeight: 700, color: '#64748B', fontSize: 13 }}
                >
                  {t('study_materials.col_semester')}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ py: 1.5, fontWeight: 700, color: '#64748B', fontSize: 13, width: 80 }}
                >
                  {t('study_materials.col_actions')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {value.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                      {t('study_materials.empty_table')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                value.map((item) => (
                  <TableRow
                    key={item.id}
                    sx={{
                      '&:hover': { bgcolor: '#F8FAFC' },
                      '&:last-child td': { borderBottom: 0 },
                    }}
                  >
                    <TableCell
                      align={isRtl ? 'right' : 'left'}
                      sx={{ py: 1.75, fontWeight: 600, color: '#1E293B', fontSize: 13.5 }}
                    >
                      {item.name}
                    </TableCell>
                    <TableCell
                      align={isRtl ? 'right' : 'left'}
                      sx={{ py: 1.75, color: '#475467', fontSize: 13 }}
                    >
                      {item.facultyName}
                    </TableCell>
                    <TableCell
                      align={isRtl ? 'right' : 'left'}
                      sx={{ py: 1.75, color: '#475467', fontSize: 13 }}
                    >
                      {item.academicYearName || '—'}
                    </TableCell>
                    <TableCell
                      align={isRtl ? 'right' : 'left'}
                      sx={{ py: 1.75, color: '#475467', fontSize: 13 }}
                    >
                      {item.semesterName}
                    </TableCell>
                    <TableCell align="center" sx={{ py: 1.75 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveMaterial(item.id)}
                        sx={{ color: '#E53935', '&:hover': { bgcolor: '#FEE2E2' } }}
                      >
                        <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 6. Info Alert Callout at Bottom (Matching Image 1) */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            py: 1.25,
            px: 2,
            borderRadius: 2,
            bgcolor: '#F0F9FF',
            border: '1px solid #BAE6FD',
          }}
        >
          <Iconify
            icon="solar:info-circle-bold"
            width={18}
            sx={{ color: '#0284C7', flexShrink: 0 }}
          />
          <Typography
            variant="caption"
            sx={{ color: '#0369A1', fontWeight: 500, fontSize: 12.5 }}
          >
            {t('study_materials.info_alert')}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
}
