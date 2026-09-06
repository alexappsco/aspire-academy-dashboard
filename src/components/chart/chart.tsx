'use client';

import dynamic from 'next/dynamic';
import type { Props as ApexChartProps } from 'react-apexcharts';

const DynamicApexChart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
  loading: () => null,
});

export default function Chart(props: ApexChartProps) {
  return <DynamicApexChart {...props} />;
}

export type { ApexChartProps };
