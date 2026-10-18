'use client';

import { useCallback, useEffect, useState } from 'react';

import { getCountryByIdAction } from 'src/actions/countries';
import { getHoursChargeRequestById } from 'src/actions/hours-charge-requests';
import type { CountryDto } from 'src/sections/countries/types';
import type { HoursChargeRequestDetails } from 'src/types/hours-charge-request';

export default function useHoursChargeRequestDetails(requestId: string) {
  const [request, setRequest] = useState<HoursChargeRequestDetails | null>(null);
  const [country, setCountry] = useState<CountryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadRequest = useCallback(async () => {
    setLoading(true);
    setError('');

    const response = await getHoursChargeRequestById(requestId);

    if (response.success && response.data) {
      setRequest(response.data);
      const countryResponse = await getCountryByIdAction(response.data.countryId);
      setCountry(countryResponse.success && countryResponse.data ? countryResponse.data : null);
    } else {
      setRequest(null);
      setCountry(null);
      setError(response.error || 'Failed to load hours charge request');
    }

    setLoading(false);
  }, [requestId]);

  useEffect(() => {
    loadRequest();
  }, [loadRequest]);

  return { request, country, loading, error, retry: loadRequest };
}