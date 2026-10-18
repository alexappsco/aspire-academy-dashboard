'use client';

import { useCallback, useEffect, useState } from 'react';

import { getHoursChargeRequestById } from 'src/actions/hours-charge-requests';
import type { HoursChargeRequestDetails } from 'src/types/hours-charge-request';

export default function useHoursChargeRequestDetails(requestId: string) {
  const [request, setRequest] = useState<HoursChargeRequestDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRequest = useCallback(async () => {
    setLoading(true);
    setError('');

    const response = await getHoursChargeRequestById(requestId);

    if (response.success && response.data) {
      setRequest(response.data);
    } else {
      setRequest(null);
      setError(response.error || 'Failed to load hours charge request');
    }

    setLoading(false);
  }, [requestId]);

  useEffect(() => {
    loadRequest();
  }, [loadRequest]);

  return { request, loading, error, retry: loadRequest };
}
