'use client';

import { useCallback, useEffect, useState } from 'react';

import { getAdminSessionRequestById } from 'src/actions/admin-session-requests';
import type { AdminSessionRequest } from 'src/types/admin-session-request';

export default function useAdminSessionRequestDetails(requestId: string) {
  const [request, setRequest] = useState<AdminSessionRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRequest = useCallback(async () => {
    setLoading(true);
    setError('');

    const response = await getAdminSessionRequestById(requestId);
    if (response.success && response.data) {
      setRequest(response.data);
    } else {
      setRequest(null);
      setError(response.error || 'Failed to load private request details');
    }

    setLoading(false);
  }, [requestId]);

  useEffect(() => {
    void loadRequest();
  }, [loadRequest]);

  return { request, loading, error, retry: loadRequest };
}
