'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { getCountriesAction } from 'src/actions/countries';
import { getCurrenciesAction } from 'src/actions/currencies';
import Iconify from 'src/components/iconify';
import SelectField from 'src/components/SelectField/SelectField';
import type { AcademyBankAccount, AcademyBankAccountPayload } from 'src/types/academy-bank-account';
import type { CountryDto } from 'src/sections/countries/types';
import type { CurrencyDto } from 'src/sections/currencies/types';

type Props = {
  open: boolean;
  account?: AcademyBankAccount | null;
  saving: boolean;
  onClose: () => void;
  onSave: (data: AcademyBankAccountPayload) => Promise<boolean>;
};

const requiredField = (value: string) => value.trim().length > 0;

export default function BankAccountFormDialog({ open, account, saving, onClose, onSave }: Props) {
  const t = useTranslations('AcademyBankAccounts.form');
  const locale = useLocale();
  const isRtl = locale === 'ar';
  const direction = isRtl ? 'rtl' : 'ltr';
  const isEdit = Boolean(account);
  const [accountHolderName, setAccountHolderName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [iban, setIban] = useState('');
  const [swiftCode, setSwiftCode] = useState('');
  const [currencyId, setCurrencyId] = useState('');
  const [countryId, setCountryId] = useState('');
  const [studentInstructions, setStudentInstructions] = useState('');
  const [isVisibleToStudents, setIsVisibleToStudents] = useState(true);
  const [countries, setCountries] = useState<CountryDto[]>([]);
  const [currencies, setCurrencies] = useState<CurrencyDto[]>([]);
  const [lookupsLoading, setLookupsLoading] = useState(false);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) return;
    setAccountHolderName(account?.accountHolderName ?? '');
    setBankName(account?.bankName ?? '');
    setAccountNumber(account?.accountNumber ?? '');
    setIban(account?.iban ?? '');
    setSwiftCode(account?.swiftCode ?? '');
    setCurrencyId(account?.currencyId ?? '');
    setCountryId(account?.countryId ?? '');
    setStudentInstructions(account?.studentInstructions ?? '');
    setIsVisibleToStudents(account?.isVisibleToStudents ?? true);
    setTouched(false);
  }, [account, open]);

  useEffect(() => {
    if (!open || countries.length || currencies.length) return;
    const loadLookups = async () => {
      setLookupsLoading(true);
      const [countriesResponse, currenciesResponse] = await Promise.all([
        getCountriesAction({ IsActive: true, SkipCount: 0, MaxResultCount: 1000 }),
        getCurrenciesAction({ IsActive: true, SkipCount: 0, MaxResultCount: 1000 }),
      ]);
      setCountries(countriesResponse.success ? countriesResponse.data?.items ?? [] : []);
      setCurrencies(currenciesResponse.success ? currenciesResponse.data?.items ?? [] : []);
      setLookupsLoading(false);
    };
    void loadLookups();
  }, [countries.length, currencies.length, open]);

  const valid =
    requiredField(accountHolderName) &&
    requiredField(bankName) &&
    requiredField(accountNumber) &&
    requiredField(iban) &&
    requiredField(currencyId) &&
    requiredField(countryId);

  const submit = async () => {
    setTouched(true);
    if (!valid) return;
    const saved = await onSave({
      accountHolderName: accountHolderName.trim(),
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
      iban: iban.trim(),
      swiftCode: swiftCode.trim(),
      currencyId,
      countryId,
      studentInstructions: studentInstructions.trim(),
      isVisibleToStudents,
    });
    if (saved) onClose();
  };

  const fieldProps = (value: string) => ({
    error: touched && !requiredField(value),
    helperText: touched && !requiredField(value) ? t('required') : ' ',
  });

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{ paper: { dir: direction, sx: { borderRadius: 2.5 } } }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2.5, pt: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>{t(isEdit ? 'edit_title' : 'add_title')}</Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: 12, mt: 0.25 }}>{t('subtitle')}</Typography>
        </Box>
        <IconButton onClick={onClose} disabled={saving}><Iconify icon="mingcute:close-line" width={21} /></IconButton>
      </Box>

      <DialogContent sx={{ p: 2.5 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
            gap: 1.5,
            ...(isRtl && {
              '& .MuiInputLabel-root': {
                right: 24,
                left: 'auto',
                transformOrigin: 'right',
              },
              '& .MuiInputLabel-shrink': {
                right: 24,
                left: 'auto',
                transform: 'translate(0, -6px) scale(0.75)',
              },
              '& .MuiOutlinedInput-notchedOutline legend': {
                textAlign: 'right',
              },
              '& .MuiInputBase-input': {
                textAlign: 'right',
              },
            }),
          }}
        >
          <TextField label={t('bank_name')} value={bankName} onChange={(event) => setBankName(event.target.value)} disabled={saving} {...fieldProps(bankName)} />
          <TextField label={t('account_holder')} value={accountHolderName} onChange={(event) => setAccountHolderName(event.target.value)} disabled={saving} {...fieldProps(accountHolderName)} />
          <TextField label={t('account_number')} value={accountNumber} onChange={(event) => setAccountNumber(event.target.value)} disabled={saving} {...fieldProps(accountNumber)} />
          <SelectField label={t('currency')} value={currencyId} onChange={(event) => setCurrencyId(event.target.value)} disabled={saving || lookupsLoading} error={touched && !currencyId} helperText={touched && !currencyId ? t('required') : ' '}>
            {currencies.map((currency) => (
              <MenuItem key={currency.id} value={currency.id}>
                {(locale === 'ar' ? currency.nameAr : currency.nameEn) || currency.code} — {currency.code}
              </MenuItem>
            ))}
          </SelectField>
          <TextField label={t('iban')} value={iban} onChange={(event) => setIban(event.target.value)} disabled={saving} {...fieldProps(iban)} sx={{ gridColumn: { sm: '1 / -1' } }} />
          <TextField label={t('swift')} value={swiftCode} onChange={(event) => setSwiftCode(event.target.value)} disabled={saving} helperText=" " />
          <SelectField label={t('country')} value={countryId} onChange={(event) => setCountryId(event.target.value)} disabled={saving || lookupsLoading} error={touched && !countryId} helperText={touched && !countryId ? t('required') : ' '}>
            {countries.map((country) => (
              <MenuItem key={country.id} value={country.id}>{locale === 'ar' ? country.nameAr : country.nameEn}</MenuItem>
            ))}
          </SelectField>
          <TextField label={t('instructions')} value={studentInstructions} onChange={(event) => setStudentInstructions(event.target.value)} disabled={saving} multiline minRows={3} helperText=" " sx={{ gridColumn: { sm: '1 / -1' } }} />
        </Box>

        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', bgcolor: '#F8FAFC', borderRadius: 1.5, p: 1.25, mb: 2 }}>
          <Typography sx={{ fontSize: 13 }}>{t('visible')}</Typography>
          <Switch checked={isVisibleToStudents} disabled={saving} onChange={(event) => setIsVisibleToStudents(event.target.checked)} />
        </Stack>

        <Stack direction="row" spacing={1.25}>
          <Button fullWidth variant="contained" disabled={saving || lookupsLoading} onClick={() => void submit()} sx={{ minHeight: 44, bgcolor: '#17243E' }}>
            {saving && <CircularProgress size={18} color="inherit" sx={{ mx: 1 }} />}{t('save')}
          </Button>
          <Button fullWidth variant="outlined" disabled={saving} onClick={onClose}>{t('cancel')}</Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
