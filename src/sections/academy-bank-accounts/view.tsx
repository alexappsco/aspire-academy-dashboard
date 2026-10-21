'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

import type { AcademyBankAccount } from 'src/types/academy-bank-account';

import AcademyBankAccountsHeader from './components/accounts-header';
import AcademyBankAccountsNotice from './components/accounts-notice';
import BankAccountCard from './components/bank-account-card';
import BankAccountFormDialog from './components/bank-account-form-dialog';
import DeleteBankAccountDialog from './components/delete-bank-account-dialog';
import useAcademyBankAccounts from './hooks/use-academy-bank-accounts';

export default function AcademyBankAccountsView() {
  const t = useTranslations('AcademyBankAccounts');
  const bankAccounts = useAcademyBankAccounts();
  const [formOpen, setFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AcademyBankAccount | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<AcademyBankAccount | null>(null);

  const openCreate = () => { setEditingAccount(null); setFormOpen(true); };
  const openEdit = (account: AcademyBankAccount) => { setEditingAccount(account); setFormOpen(true); };
  const confirmDelete = async () => {
    if (!deletingAccount) return;
    if (await bankAccounts.removeAccount(deletingAccount)) setDeletingAccount(null);
  };

  return (
    <Box sx={{ py: 2, pb: 6, display: 'grid', gap: 1.5 }}>
      <AcademyBankAccountsHeader onAdd={openCreate} />
      <AcademyBankAccountsNotice />
      <Box sx={{ bgcolor: '#FFF', borderRadius: 2.5, p: { xs: 1.5, md: 2 }, display: 'grid', gap: 1.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>{t('section_title')}</Typography>
        {bankAccounts.loading && <Box sx={{ minHeight: 240, display: 'grid', placeItems: 'center' }}><CircularProgress /></Box>}
        {!bankAccounts.loading && bankAccounts.error && (
          <Alert severity="error" action={<Button onClick={() => void bankAccounts.retry()}>{t('retry')}</Button>}>{bankAccounts.error}</Alert>
        )}
        {!bankAccounts.loading && !bankAccounts.error && bankAccounts.accounts.length === 0 && (
          <Box sx={{ minHeight: 200, display: 'grid', placeItems: 'center', textAlign: 'center', color: 'text.secondary' }}>
            <Box><Typography sx={{ fontWeight: 700 }}>{t('empty.title')}</Typography><Typography sx={{ fontSize: 13, mt: 0.5 }}>{t('empty.description')}</Typography></Box>
          </Box>
        )}
        {!bankAccounts.loading && !bankAccounts.error && bankAccounts.accounts.map((account) => (
          <BankAccountCard
            key={account.id}
            account={account}
            loading={bankAccounts.actionId === account.id}
            onEdit={() => openEdit(account)}
            onDelete={() => setDeletingAccount(account)}
            onVisibilityChange={(visible) => void bankAccounts.changeVisibility(account, visible)}
            onSetPrimary={() => void bankAccounts.setPrimary(account)}
          />
        ))}
      </Box>
      <BankAccountFormDialog open={formOpen} account={editingAccount} saving={bankAccounts.saving} onClose={() => !bankAccounts.saving && setFormOpen(false)} onSave={(data) => bankAccounts.saveAccount(data, editingAccount)} />
      <DeleteBankAccountDialog account={deletingAccount} loading={Boolean(deletingAccount && bankAccounts.actionId === deletingAccount.id)} onClose={() => setDeletingAccount(null)} onConfirm={confirmDelete} />
    </Box>
  );
}
