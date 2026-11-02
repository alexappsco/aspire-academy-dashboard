'use client';

import { useMemo, useState } from 'react';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import { useTranslations } from 'next-intl';

import Iconify from 'src/components/iconify';
import SelectField from 'src/components/SelectField/SelectField';
import type { CourseDto } from 'src/types/course';

type Props = {
  open: boolean;
  courses: CourseDto[];
  selectedIds: string[];
  countries: { id: string; name: string; currencyId?: string | null }[];
  onClose: () => void;
  onConfirm: (ids: string[]) => void;
};

export default function CoursePickerDialog({ open, courses, selectedIds, countries, onClose, onConfirm }: Props) {
  const t = useTranslations('Packages.form.course_picker');
  const [search, setSearch] = useState('');
  const [draftIds, setDraftIds] = useState<string[]>(selectedIds);
  const [countryId, setCountryId] = useState('');

  const filtered = useMemo(() => {
    const value = search.trim().toLocaleLowerCase();
    const selectedCountry = countries.find((country) => country.id === countryId);
    return courses.filter((course) => {
      const matchesSearch = !value || course.title.toLocaleLowerCase().includes(value);
      const matchesCountry = !selectedCountry || course.currencyId === selectedCountry.currencyId;
      return matchesSearch && matchesCountry;
    });
  }, [countries, countryId, courses, search]);

  const handleEntered = () => setDraftIds(selectedIds);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" TransitionProps={{ onEntered: handleEntered }}>
      <DialogTitle>{t('title')}</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mt: 1, mb: 2 }}>{t('country_warning')}</Alert>
        <SelectField
          fullWidth
          size="small"
          value={countryId}
          onChange={(event) => setCountryId(String(event.target.value))}
          slotProps={{ select: { displayEmpty: true } }}
        >
          <MenuItem value="">{t('all_countries')}</MenuItem>
          {countries.map((country) => <MenuItem key={country.id} value={country.id}>{country.name}</MenuItem>)}
        </SelectField>
        <TextField
          fullWidth
          size="small"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t('search')}
          sx={{ mt: 2, mb: 2 }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><Iconify icon="solar:magnifer-linear" /></InputAdornment> } }}
        />
        <List sx={{ maxHeight: 380, overflow: 'auto' }}>
          {filtered.map((course) => {
            const checked = draftIds.includes(course.id);
            const selectedCurrencyId = courses.find((item) => draftIds.includes(item.id))?.currencyId;
            const incompatible = Boolean(selectedCurrencyId && course.currencyId !== selectedCurrencyId);
            return (
              <ListItemButton
                key={course.id}
                disabled={!checked && incompatible}
                onClick={() => setDraftIds((ids) => checked ? ids.filter((id) => id !== course.id) : [...ids, course.id])}
                sx={{
                  width: '100%',
                  flexDirection: 'row-reverse',
                  justifyContent: 'space-between',
                }}
              >
                <Checkbox checked={checked} disabled={!checked && incompatible} />
                <ListItemText
                  primary={course.title}
                  secondary={course.instructor?.name || course.specialization?.name || ''}
                  sx={{
                    flex: '0 1 auto',
                    m: 0,
                    '& .MuiListItemText-primary, & .MuiListItemText-secondary': {
                      textAlign: 'start',
                    },
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </DialogContent>
      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Button onClick={onClose} color="inherit">{t('cancel')}</Button>
        <Button variant="contained" onClick={() => { onConfirm(draftIds); onClose(); }}>{t('confirm')}</Button>
      </DialogActions>
    </Dialog>
  );
}
