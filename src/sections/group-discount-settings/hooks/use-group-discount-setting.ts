'use client';

import { useCallback, useEffect, useState } from 'react';

import { getSessionGroupDiscountSetting } from 'src/actions/session-group-discount-settings';
import type { SessionGroupDiscountSetting } from 'src/types/session-group-discount-setting';

export default function useGroupDiscountSetting() {
  const [setting, setSetting] = useState<SessionGroupDiscountSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSetting = useCallback(async () => {
    setLoading(true);
    setError('');

    const response = await getSessionGroupDiscountSetting();
    if (response.success && response.data) {
      setSetting(response.data);
    } else {
      setSetting(null);
      setError(response.error || 'Failed to load group discount setting');
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void loadSetting();
  }, [loadSetting]);

  return { setting, loading, error, retry: loadSetting };
}
