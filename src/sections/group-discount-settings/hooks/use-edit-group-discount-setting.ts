'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import {
  getSessionGroupDiscountSetting,
  updateSessionGroupDiscountSetting,
} from 'src/actions/session-group-discount-settings';
import { useToast } from 'src/components/toast';
import { useRouter } from 'src/i18n/routing';
import { paths } from 'src/routes/paths';

export default function useEditGroupDiscountSetting() {
  const t = useTranslations('GroupDiscountSettings.edit');
  const toast = useToast();
  const router = useRouter();
  const [minParticipants, setMinParticipants] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  const loadSetting = useCallback(async () => {
    setLoading(true);
    setError('');
    const response = await getSessionGroupDiscountSetting();

    if (response.success && response.data) {
      setMinParticipants(String(response.data.minParticipants));
      setDiscountPercentage(String(response.data.discountPercentage));
      setIsEnabled(response.data.isEnabled);
    } else {
      setError(response.error || t('load_error'));
    }
    setLoading(false);
  }, [t]);

  useEffect(() => {
    void loadSetting();
  }, [loadSetting]);

  const valuesAreValid = useMemo(() => {
    const participants = Number(minParticipants);
    const percentage = Number(discountPercentage);
    return (
      minParticipants.trim() !== '' &&
      discountPercentage.trim() !== '' &&
      Number.isInteger(participants) &&
      participants >= 0 &&
      Number.isFinite(percentage) &&
      percentage >= 0 &&
      percentage <= 100
    );
  }, [discountPercentage, minParticipants]);

  const save = async () => {
    setTouched(true);
    if (!valuesAreValid || saving) return;

    setSaving(true);
    const response = await updateSessionGroupDiscountSetting({
      isEnabled,
      minParticipants: Number(minParticipants),
      discountPercentage: Number(discountPercentage),
    });

    if (response.success) {
      toast.success(t('success'));
      router.push(paths.groupDiscountSettings.root);
    } else {
      toast.error(response.error || t('save_error'));
    }
    setSaving(false);
  };

  return {
    minParticipants,
    discountPercentage,
    isEnabled,
    loading,
    saving,
    error,
    touched,
    valuesAreValid,
    setMinParticipants,
    setDiscountPercentage,
    setIsEnabled,
    retry: loadSetting,
    save,
    cancel: () => router.push(paths.groupDiscountSettings.root),
  };
}
