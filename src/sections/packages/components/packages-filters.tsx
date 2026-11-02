'use client';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useTranslations } from 'next-intl';

import SelectField from 'src/components/SelectField/SelectField';

export type PackageStatusFilter = 'all' | 'active' | 'inactive';
type SpecializationOption = { id: string; name: string };

type Props = {
  search: string;
  specializationId: string;
  coursesCount: string;
  status: PackageStatusFilter;
  specializationOptions: SpecializationOption[];
  onSearchChange: (value: string) => void;
  onSpecializationChange: (value: string) => void;
  onCoursesCountChange: (value: string) => void;
  onStatusChange: (value: PackageStatusFilter) => void;
};

export default function PackagesFilters({
  search,
  specializationId,
  coursesCount,
  status,
  specializationOptions,
  onSearchChange,
  onSpecializationChange,
  onCoursesCountChange,
  onStatusChange,
}: Props) {
  const t = useTranslations('Packages.filters');

  return (
    <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} sx={{ p: 2 }}>
      <TextField
        size="small"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={t('search')}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => onSearchChange('')}>
                  <CloseRoundedIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          },
        }}
        sx={{ flex: 1, minWidth: 0 }}
      />

      <SelectField
        size="small"
        value={specializationId}
        onChange={(event) => onSpecializationChange(String(event.target.value))}
        slotProps={{ select: { displayEmpty: true } }}
        sx={{ width: { xs: '100%', lg: 190 }, flexShrink: 0 }}
      >
        <MenuItem value="">{t('all_specializations')}</MenuItem>
        {specializationOptions.map((option) => (
          <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
        ))}
      </SelectField>

      <SelectField
        size="small"
        value={coursesCount}
        onChange={(event) => onCoursesCountChange(String(event.target.value))}
        slotProps={{ select: { displayEmpty: true } }}
        sx={{ width: { xs: '100%', lg: 170 }, flexShrink: 0 }}
      >
        <MenuItem value="">{t('all_courses_counts')}</MenuItem>
        {Array.from({ length: 10 }, (_, index) => index + 1).map((count) => (
          <MenuItem key={count} value={String(count)}>
            {t('courses_count_option', { count })}
          </MenuItem>
        ))}
      </SelectField>

      <SelectField
        size="small"
        value={status}
        onChange={(event) => onStatusChange(event.target.value as PackageStatusFilter)}
        slotProps={{ select: { displayEmpty: true } }}
        sx={{ width: { xs: '100%', lg: 160 }, flexShrink: 0 }}
      >
        <MenuItem value="all">{t('all_statuses')}</MenuItem>
        <MenuItem value="active">{t('active')}</MenuItem>
        <MenuItem value="inactive">{t('inactive')}</MenuItem>
      </SelectField>
    </Stack>
  );
}
