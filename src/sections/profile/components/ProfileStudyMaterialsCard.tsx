'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
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
import {
  getInstructorAvailableStudyMaterialsAction,
  getInstructorStudyMaterialAcademicYearsAction,
  getInstructorStudyMaterialFacultiesAction,
  getInstructorStudyMaterialSemestersAction,
} from 'src/actions/instructor-profile';
import type { InstructorAssignedStudyMaterial, InstructorLookupItem } from 'src/types/instructor-profile';
import type { AddedStudyMaterial } from 'src/sections/minutes-management/components/InstructorStudyMaterialsCard';

function lookupLabel(item: InstructorLookupItem | undefined, isRtl: boolean) {
  if (!item) return '';
  return isRtl
    ? item.nameAr || item.name || item.nameEn || ''
    : item.nameEn || item.name || item.nameAr || '';
}

function materialLabel(item: InstructorAssignedStudyMaterial, isRtl: boolean) {
  const ar = item.nameAr;
  const en = item.nameEn;
  if (ar && en && ar !== en) return `${ar} (${en})`;
  return ar || en || item.name || '';
}

interface Props {
  value: AddedStudyMaterial[];
  onChange?: (items: AddedStudyMaterial[]) => void;
  isRtl?: boolean;
  readOnly?: boolean;
}

export default function ProfileStudyMaterialsCard({
  value = [],
  onChange,
  isRtl = true,
  readOnly = false,
}: Props) {
  const t = useTranslations('InstructorProfile');

  const [faculties, setFaculties] = useState<InstructorLookupItem[]>([]);
  const [academicYears, setAcademicYears] = useState<InstructorLookupItem[]>([]);
  const [semesters, setSemesters] = useState<InstructorLookupItem[]>([]);
  const [availableMaterials, setAvailableMaterials] = useState<InstructorAssignedStudyMaterial[]>([]);

  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [selectedYearId, setSelectedYearId] = useState('');
  const [selectedSemesterId, setSelectedSemesterId] = useState('');

  const [loadingFaculties, setLoadingFaculties] = useState(false);
  const [loadingYears, setLoadingYears] = useState(false);
  const [loadingSemesters, setLoadingSemesters] = useState(false);
  const [loadingMaterials, setLoadingMaterials] = useState(false);

  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null);
  const [materialSearchQuery, setMaterialSearchQuery] = useState('');
  const [pendingSelectedMaterialIds, setPendingSelectedMaterialIds] = useState<string[]>([]);

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

  useEffect(() => {
    if (readOnly) return;
    setLoadingFaculties(true);
    getInstructorStudyMaterialFacultiesAction()
      .then((res) => {
        if (res.success && res.data) setFaculties(res.data);
      })
      .finally(() => setLoadingFaculties(false));
  }, [readOnly]);

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
    getInstructorStudyMaterialAcademicYearsAction(facultyId)
      .then((res) => {
        if (res.success && res.data) setAcademicYears(res.data);
      })
      .finally(() => setLoadingYears(false));
  };

  const handleYearChange = (yearId: string) => {
    setSelectedYearId(yearId);
    setSelectedSemesterId('');
    setSemesters([]);
    setAvailableMaterials([]);
    setPendingSelectedMaterialIds([]);

    if (!yearId) return;

    setLoadingSemesters(true);
    getInstructorStudyMaterialSemestersAction(yearId)
      .then((res) => {
        if (res.success && res.data) setSemesters(res.data);
      })
      .finally(() => setLoadingSemesters(false));
  };

  const handleSemesterChange = (semesterId: string) => {
    setSelectedSemesterId(semesterId);
    setAvailableMaterials([]);
    setPendingSelectedMaterialIds([]);

    if (!semesterId) return;

    setLoadingMaterials(true);
    getInstructorAvailableStudyMaterialsAction(semesterId)
      .then((res) => {
        if (res.success && res.data) setAvailableMaterials(res.data);
      })
      .finally(() => setLoadingMaterials(false));
  };

  const alreadyAddedIds = useMemo(() => new Set(value.map((v) => v.id)), [value]);

  const filteredMaterials = useMemo(() => {
    return availableMaterials.filter((m) => {
      if (alreadyAddedIds.has(m.id)) return false;
      if (!materialSearchQuery.trim()) return true;
      const q = materialSearchQuery.trim().toLowerCase();
      return Boolean(
        m.nameAr?.toLowerCase().includes(q) ||
          m.nameEn?.toLowerCase().includes(q) ||
          m.name?.toLowerCase().includes(q)
      );
    });
  }, [availableMaterials, alreadyAddedIds, materialSearchQuery]);

  const isMaterialDropdownDisabled =
    !selectedFacultyId || !selectedSemesterId || loadingMaterials;

  const handleOpenPopover = (e: React.MouseEvent<HTMLElement>) => {
    if (isMaterialDropdownDisabled) return;
    setPopoverAnchor(e.currentTarget);
    setMaterialSearchQuery('');
  };

  const handleClosePopover = () => setPopoverAnchor(null);

  const handleTogglePendingMaterial = (id: string) => {
    setPendingSelectedMaterialIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddSelectedMaterials = () => {
    if (!onChange || pendingSelectedMaterialIds.length === 0) return;

    const facultyName = lookupLabel(
      faculties.find((f) => f.id === selectedFacultyId),
      isRtl
    );
    const yearName = lookupLabel(
      academicYears.find((y) => y.id === selectedYearId),
      isRtl
    );
    const semesterName = lookupLabel(
      semesters.find((s) => s.id === selectedSemesterId),
      isRtl
    );

    const newItems: AddedStudyMaterial[] = pendingSelectedMaterialIds
      .map((id) => availableMaterials.find((m) => m.id === id))
      .filter((m): m is InstructorAssignedStudyMaterial => Boolean(m))
      .map((m) => ({
        id: m.id,
        name: materialLabel(m, isRtl),
        nameAr: m.nameAr,
        nameEn: m.nameEn,
        facultyId: selectedFacultyId || m.facultyId || '',
        facultyName: facultyName || m.facultyName || '',
        academicYearId: selectedYearId || m.academicYearId || '',
        academicYearName: yearName || m.academicYearName || '',
        semesterId: selectedSemesterId || m.semesterId || '',
        semesterName: semesterName || m.semesterName || '',
      }));

    onChange([...value, ...newItems]);
    setPendingSelectedMaterialIds([]);
    handleClosePopover();
  };

  const handleRemoveMaterial = (id: string) => {
    onChange?.(value.filter((item) => item.id !== id));
  };

  const triggerLabel = useMemo(() => {
    if (isMaterialDropdownDisabled) return t('study_materials.material_disabled_placeholder');
    if (pendingSelectedMaterialIds.length > 0) {
      return isRtl
        ? `• تم تحديد ${pendingSelectedMaterialIds.length} مواد`
        : `• ${pendingSelectedMaterialIds.length} materials selected`;
    }
    return t('study_materials.material_placeholder');
  }, [isMaterialDropdownDisabled, pendingSelectedMaterialIds.length, isRtl, t]);

  return (
    <Card
      dir={isRtl ? 'rtl' : 'ltr'}
      sx={{
        borderRadius: 3,
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.02)',
        border: '1px solid #F1F3F5',
        mb: 3,
        bgcolor: '#FFFFFF',
        direction: isRtl ? 'rtl' : 'ltr',
      }}
    >
      <Box sx={{ p: 3, direction: isRtl ? 'rtl' : 'ltr', textAlign: isRtl ? 'right' : 'left' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isRtl ? 'flex-start' : 'flex-start',
            gap: 1.5,
            mb: 0.5,
            flexDirection: isRtl ? 'row' : 'row',
          }}
        >
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
            <Iconify icon="solar:book-bookmark-bold" width={24} sx={{ color: '#1C252E' }} />
            {t('study_materials.title')}
          </Typography>
          {value.length > 0 && (
            <Chip
              label={value.length}
              size="small"
              sx={{
                bgcolor: '#EFF6FF',
                color: '#1D4ED8',
                fontWeight: 700,
                height: 24,
                minWidth: 28,
              }}
            />
          )}
        </Box>

        {!readOnly && (
          <Typography variant="body2" sx={{ color: '#64748B', mb: 3 }}>
            {t('study_materials.subtitle')}
          </Typography>
        )}

        {!readOnly && (
          <Stack
            direction={{ xs: 'column', lg: 'row' }}
            spacing={2}
            sx={{ mb: 3, alignItems: { xs: 'stretch', lg: 'flex-end' } }}
          >
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
                disabled={loadingFaculties}
                onChange={(e) => handleFacultyChange(e.target.value)}
                sx={fieldSx}
              >
                <MenuItem value="">
                  <em>{t('study_materials.faculty_placeholder')}</em>
                </MenuItem>
                {faculties.map((f) => (
                  <MenuItem key={f.id} value={f.id}>
                    {lookupLabel(f, isRtl)}
                  </MenuItem>
                ))}
              </SelectField>
            </Box>

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
                disabled={!selectedFacultyId || loadingYears}
                onChange={(e) => handleYearChange(e.target.value)}
                sx={fieldSx}
              >
                <MenuItem value="">
                  <em>{t('study_materials.year_placeholder')}</em>
                </MenuItem>
                {academicYears.map((y) => (
                  <MenuItem key={y.id} value={y.id}>
                    {lookupLabel(y, isRtl)}
                  </MenuItem>
                ))}
              </SelectField>
            </Box>

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
                disabled={!selectedYearId || loadingSemesters}
                onChange={(e) => handleSemesterChange(e.target.value)}
                sx={fieldSx}
              >
                <MenuItem value="">
                  <em>{t('study_materials.semester_placeholder')}</em>
                </MenuItem>
                {semesters.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {lookupLabel(s, isRtl)}
                  </MenuItem>
                ))}
              </SelectField>
            </Box>

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
                  height: 40,
                  px: 1.5,
                  borderRadius: 2,
                  border: '1px solid #E5E7EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: isMaterialDropdownDisabled ? 'not-allowed' : 'pointer',
                  bgcolor: isMaterialDropdownDisabled ? '#F9FAFB' : '#FFFFFF',
                  opacity: isMaterialDropdownDisabled ? 0.7 : 1,
                }}
              >
                <Typography
                  noWrap
                  sx={{ fontSize: 13.5, color: pendingSelectedMaterialIds.length ? '#1E293B' : '#94A3B8' }}
                >
                  {triggerLabel}
                </Typography>
                {loadingMaterials ? (
                  <CircularProgress size={16} />
                ) : (
                  <Iconify icon="solar:alt-arrow-down-linear" width={18} sx={{ color: '#94A3B8' }} />
                )}
              </Box>
            </Box>

            <Box sx={{ flexShrink: 0 }}>
              <Button
                variant="contained"
                onClick={
                  pendingSelectedMaterialIds.length > 0
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
                  '&:hover': { bgcolor: '#2C353E' },
                  '&.Mui-disabled': { bgcolor: '#F3F4F6', color: '#9CA3AF' },
                }}
              >
                {t('study_materials.add_button')}
              </Button>
            </Box>
          </Stack>
        )}

        <Popover
          open={Boolean(popoverAnchor)}
          anchorEl={popoverAnchor}
          onClose={handleClosePopover}
          anchorOrigin={{ vertical: 'bottom', horizontal: isRtl ? 'right' : 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: isRtl ? 'right' : 'left' }}
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
                      <Iconify icon="solar:magnifer-linear" width={18} sx={{ color: '#94A3B8' }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#F8FAFC',
                  fontSize: 13,
                },
              }}
            />
            <IconButton size="small" onClick={handleClosePopover} sx={{ color: '#94A3B8' }}>
              <Iconify icon="ic:round-close" width={18} />
            </IconButton>
          </Box>

          <Box sx={{ maxHeight: 250, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0.75, mb: 1.5 }}>
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
                    }}
                  >
                    <Checkbox checked={isChecked} size="small" sx={{ '&.Mui-checked': { color: '#1D4ED8' } }} />
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{ fontWeight: 600, color: isChecked ? '#1D4ED8' : '#1E293B', fontSize: 13 }}
                    >
                      {materialLabel(material, isRtl)}
                    </Typography>
                  </Box>
                );
              })
            )}
          </Box>

          <Button
            fullWidth
            variant="contained"
            disabled={pendingSelectedMaterialIds.length === 0}
            onClick={handleAddSelectedMaterials}
            sx={{
              borderRadius: 2,
              bgcolor: '#1C252E',
              fontWeight: 700,
              textTransform: 'none',
              '&:hover': { bgcolor: '#2C353E' },
            }}
          >
            {t('study_materials.add_selected_button')}
          </Button>
        </Popover>

        <TableContainer
          dir={isRtl ? 'rtl' : 'ltr'}
          sx={{
            border: '1px solid #E5E7EB',
            borderRadius: 2,
            overflow: 'hidden',
            direction: isRtl ? 'rtl' : 'ltr',
          }}
        >
          <Table
            size="small"
            sx={{
              direction: isRtl ? 'rtl' : 'ltr',
              '& .MuiTableCell-root': {
                textAlign: isRtl ? 'right' : 'left',
              },
            }}
          >
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                <TableCell
                  align={isRtl ? 'right' : 'left'}
                  sx={{ fontWeight: 700, fontSize: 13, color: '#64748B' }}
                >
                  {t('study_materials.col_material')}
                </TableCell>
                <TableCell
                  align={isRtl ? 'right' : 'left'}
                  sx={{ fontWeight: 700, fontSize: 13, color: '#64748B' }}
                >
                  {t('study_materials.col_faculty')}
                </TableCell>
                <TableCell
                  align={isRtl ? 'right' : 'left'}
                  sx={{ fontWeight: 700, fontSize: 13, color: '#64748B' }}
                >
                  {t('study_materials.col_year')}
                </TableCell>
                <TableCell
                  align={isRtl ? 'right' : 'left'}
                  sx={{ fontWeight: 700, fontSize: 13, color: '#64748B' }}
                >
                  {t('study_materials.col_semester')}
                </TableCell>
                {!readOnly && (
                  <TableCell align="center" sx={{ fontWeight: 700, fontSize: 13, color: '#64748B' }}>
                    {t('study_materials.col_actions')}
                  </TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {value.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={readOnly ? 4 : 5} align="center" sx={{ py: 5 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Iconify
                        icon="solar:diploma-verified-bold-duotone"
                        width={40}
                        sx={{ color: '#CBD5E1', mb: 1 }}
                      />
                      <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                        {t('study_materials.empty_table')}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                value.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell
                      align={isRtl ? 'right' : 'left'}
                      sx={{ fontSize: 13, fontWeight: 600, color: '#1E293B' }}
                    >
                      {row.name}
                    </TableCell>
                    <TableCell
                      align={isRtl ? 'right' : 'left'}
                      sx={{ fontSize: 13, color: '#475467' }}
                    >
                      {row.facultyName || '—'}
                    </TableCell>
                    <TableCell
                      align={isRtl ? 'right' : 'left'}
                      sx={{ fontSize: 13, color: '#475467' }}
                    >
                      {row.academicYearName || '—'}
                    </TableCell>
                    <TableCell
                      align={isRtl ? 'right' : 'left'}
                      sx={{ fontSize: 13, color: '#475467' }}
                    >
                      {row.semesterName || '—'}
                    </TableCell>
                    {!readOnly && (
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveMaterial(row.id)}
                          sx={{ color: '#EF4444' }}
                        >
                          <Iconify icon="solar:trash-bin-trash-bold" width={18} />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {!readOnly && (
          <Typography
            variant="caption"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              mt: 2,
              color: '#64748B',
            }}
          >
            <Iconify icon="solar:info-circle-bold" width={16} />
            {t('study_materials.info_alert')}
          </Typography>
        )}
      </Box>
    </Card>
  );
}
