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

export type EditableDiscountTier = {
  id: string;
  minParticipants: string;
  discountPercentage: string;
};

export default function useEditGroupDiscountSetting() {
  const t = useTranslations('GroupDiscountSettings.edit');
  const toast = useToast();
  const router = useRouter();
  const [tiers, setTiers] = useState<EditableDiscountTier[]>([]);
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
      setTiers(
        response.data.tiers.map((tier) => ({
          id: tier.id,
          minParticipants: String(tier.minParticipants),
          discountPercentage: String(tier.discountPercentage),
        }))
      );
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
    return tiers.every((tier) => {
      const participants = Number(tier.minParticipants);
      const percentage = Number(tier.discountPercentage);
      return (
        tier.minParticipants.trim() !== '' &&
        tier.discountPercentage.trim() !== '' &&
        Number.isInteger(participants) &&
        participants >= 0 &&
        Number.isFinite(percentage) &&
        percentage >= 0 &&
        percentage <= 100
      );
    });
  }, [tiers]);

  const updateTier = (
    index: number,
    field: 'minParticipants' | 'discountPercentage',
    value: string
  ) => {
    setTiers((current) =>
      current.map((tier, tierIndex) =>
        tierIndex === index ? { ...tier, [field]: value } : tier
      )
    );
  };

  const save = async () => {
    setTouched(true);
    if (!valuesAreValid || saving) return;

    setSaving(true);
    const response = await updateSessionGroupDiscountSetting({
      isEnabled,
      tiers: tiers.map((tier) => ({
        id: tier.id,
        minParticipants: Number(tier.minParticipants),
        discountPercentage: Number(tier.discountPercentage),
      })),
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
    tiers,
    isEnabled,
    loading,
    saving,
    error,
    touched,
    valuesAreValid,
    updateTier,
    setIsEnabled,
    retry: loadSetting,
    save,
    cancel: () => router.push(paths.groupDiscountSettings.root),
  };
}
