'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import {
  createAcademyBankAccount,
  deleteAcademyBankAccount,
  getAcademyBankAccounts,
  updateAcademyBankAccount,
  updateAcademyBankAccountVisibility,
} from 'src/actions/academy-bank-accounts';
import { useToast } from 'src/components/toast';
import type {
  AcademyBankAccount,
  AcademyBankAccountPayload,
} from 'src/types/academy-bank-account';

export default function useAcademyBankAccounts() {
  const t = useTranslations('AcademyBankAccounts.messages');
  const toast = useToast();
  const [accounts, setAccounts] = useState<AcademyBankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState('');

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    setError('');
    const response = await getAcademyBankAccounts();
    if (response.success && response.data) {
      setAccounts(response.data);
    } else {
      setAccounts([]);
      setError(response.error || t('load_error'));
    }
    setLoading(false);
  }, [t]);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  const saveAccount = async (
    data: AcademyBankAccountPayload,
    account?: AcademyBankAccount | null
  ) => {
    setSaving(true);
    const response = account
      ? await updateAcademyBankAccount(account.id, data)
      : await createAcademyBankAccount(data);

    if (response.success && response.data) {
      setAccounts((current) =>
        account
          ? current.map((item) => (item.id === account.id ? response.data! : item))
          : [...current, response.data!]
      );
      toast.success(t(account ? 'update_success' : 'create_success'));
      setSaving(false);
      return true;
    }

    toast.error(response.error || t(account ? 'update_error' : 'create_error'));
    setSaving(false);
    return false;
  };

  const removeAccount = async (account: AcademyBankAccount) => {
    setActionId(account.id);
    const response = await deleteAcademyBankAccount(account.id);
    if (response.success) {
      setAccounts((current) => current.filter((item) => item.id !== account.id));
      toast.success(t('delete_success'));
    } else {
      toast.error(response.error || t('delete_error'));
    }
    setActionId('');
    return response.success;
  };

  const changeVisibility = async (account: AcademyBankAccount, isVisible: boolean) => {
    setActionId(account.id);
    const response = await updateAcademyBankAccountVisibility(account.id, isVisible);
    if (response.success && response.data) {
      setAccounts((current) =>
        current.map((item) => (item.id === account.id ? response.data! : item))
      );
      toast.success(t('visibility_success'));
    } else {
      toast.error(response.error || t('visibility_error'));
    }
    setActionId('');
  };

  return {
    accounts,
    loading,
    error,
    saving,
    actionId,
    retry: loadAccounts,
    saveAccount,
    removeAccount,
    changeVisibility,
  };
}
