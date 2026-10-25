'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import {
  createSessionGroupDiscountTier,
  getSessionGroupDiscountSetting,
} from 'src/actions/session-group-discount-settings';
import { useToast } from 'src/components/toast';
import type {
  CreateSessionGroupDiscountTierPayload,
  SessionGroupDiscountSetting,
} from 'src/types/session-group-discount-setting';

export default function useGroupDiscountSetting() {
  const t = useTranslations('GroupDiscountSettings.create');
  const toast = useToast();
  const [setting, setSetting] = useState<SessionGroupDiscountSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const loadSetting = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError('');

    const response = await getSessionGroupDiscountSetting();
    if (response.success && response.data) {
      setSetting(response.data);
    } else {
      setSetting(null);
      setError(response.error || 'Failed to load group discount setting');
    }

    if (showLoader) setLoading(false);
  }, []);

  useEffect(() => {
    void loadSetting();
  }, [loadSetting]);

  const createTier = async (data: CreateSessionGroupDiscountTierPayload) => {
    if (creating) return false;
    setCreating(true);
    const response = await createSessionGroupDiscountTier(data);

    if (response.success) {
      await loadSetting(false);
      toast.success(t('success'));
      setCreating(false);
      return true;
    }

    toast.error(response.error || t('error'));
    setCreating(false);
    return false;
  };

  return { setting, loading, creating, error, retry: loadSetting, createTier };
}
