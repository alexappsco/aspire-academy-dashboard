"use client";

import { useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { Box } from "@mui/material";
import type { Props } from "react-apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

function subscribe() {
  return () => {};
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

/**
 * ApexCharts can throw when mask/gradient animations run after unmount
 * (e.g. Fast Refresh). Render only on client and disable animations.
 */
export default function ApexChart({
  options = {},
  height,
  width,
  ...rest
}: Props) {
  const mounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  const safeOptions = {
    ...options,
    chart: {
      ...(options.chart ?? {}),
      animations: {
        ...(options.chart?.animations ?? {}),
        enabled: false,
      },
      redrawOnParentResize: true,
    },
  };

  const chartHeight =
    typeof height === "number" ? height : options.chart?.height ?? 300;

  if (!mounted) {
    return (
      <Box
        sx={{
          width: width ?? "100%",
          minHeight: chartHeight,
        }}
      />
    );
  }

  return (
    <ReactApexChart
      options={safeOptions}
      height={height}
      width={width}
      {...rest}
    />
  );
}
