'use client';

import { useCallback, useEffect, useState } from 'react';

import { getAdminSessionRequestById } from 'src/actions/admin-session-requests';
import { useSessionRequestsHub } from 'src/hooks/use-session-requests-hub';
import type { AdminSessionRequest } from 'src/types/admin-session-request';

export default function useAdminSessionRequestDetails(requestId: string) {
  const [request, setRequest] = useState<AdminSessionRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRequest = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!options?.silent) {
        setLoading(true);
        setError('');
      }

      const response = await getAdminSessionRequestById(requestId);
      if (response.success && response.data) {
        setRequest(response.data);
        if (options?.silent) setError('');
      } else if (!options?.silent) {
        setRequest(null);
        setError(response.error || 'Failed to load private request details');
      }

      if (!options?.silent) setLoading(false);
    },
    [requestId]
  );

  useEffect(() => {
    void loadRequest();
  }, [loadRequest]);

  useSessionRequestsHub('admin', () => {
    void loadRequest({ silent: true });
  }, { enabled: Boolean(requestId) });

  return { request, loading, error, retry: loadRequest, setRequest };
}
