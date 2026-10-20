import UploadIcon from "../icons/NetworkStats/UploadIcon";
import DownloadIcon from "../icons/NetworkStats/DownloadIcon";
import RefreshIcon from "../icons/NetworkStats/RefreshIcon";
import RefreshCheck from "../icons/NetworkStats/RefreshCheck";
import WifiOff from "../icons/NetworkStats/WifiOff";
import { useEffect, useState } from "react";
import useIsMobile from "src/hooks/useIsMobile";
import { Box, Button, Chip, CircularProgress } from "@mui/material";

type ErrorState = "no-error-loading" | "no-error" | "no-wifi" | "timeout";

async function measureSpeed(bytes: number, run: () => Promise<void>) {
  const started = performance.now();
  await run();
  const seconds = Math.max((performance.now() - started) / 1000, 0.001);
  return Number(((bytes * 8) / seconds / 1_000_000).toFixed(2));
}

async function getNetworkStats(options?: { timeoutDuration?: number }) {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    throw "Not able to get NetworkStats due to no Network";
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), options?.timeoutDuration ?? 45000);
  const payload = new Uint8Array(128 * 1024);

  try {
    const downloadSpeed = await measureSpeed(256 * 1024, async () => {
      const response = await fetch("https://speed.cloudflare.com/__down?bytes=262144", {
        signal: controller.signal,
        cache: "no-store",
      });
      if (!response.ok) throw new Error("Download check failed");
      await response.arrayBuffer();
    });

    const uploadSpeed = await measureSpeed(payload.byteLength, async () => {
      const response = await fetch("https://speed.cloudflare.com/__up", {
        method: "POST",
        body: payload,
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("Upload check failed");
    });

    return { downloadSpeed, uploadSpeed };
  } catch (error) {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      throw "Not able to get NetworkStats due to no Network";
    }
    if (error instanceof DOMException && error.name === "AbortError") {
      throw "Not able to get NetworkStats due to timeout";
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

const NetworkStats: React.FC = () => {
  const [error, setError] = useState<ErrorState>("no-error-loading");
  const [uploadSpeed, setUploadSpeed] = useState<number | null>(null);
  const [downloadSpeed, setDownloadSpeed] = useState<number | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    getNetworkStatistics();
  }, []);

  const getNetworkStatistics = async () => {
    setError("no-error-loading");
    try {
      const options = { timeoutDuration: 45000 };
      const networkStats = await getNetworkStats(options);
      if (networkStats) {
        setError("no-error");
        setDownloadSpeed(networkStats["downloadSpeed"]);
        setUploadSpeed(networkStats["uploadSpeed"]);
      }
    } catch (ex) {
      if (ex === "Not able to get NetworkStats due to no Network") {
        setError("no-wifi");
      }
      if (ex === "Not able to get NetworkStats due to timeout") {
        setError("timeout");
      }
      console.log("Error in networkStats: ", ex);
    }
  };

  const handleOnClick = () => {
    getNetworkStatistics();
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        border: "1px solid #3F4346",
        borderRadius: "6px",
        bgcolor: "rgba(0,0,0,0.8)",
        height: 36,
        alignItems: "center",
      }}
    >
      {error === "no-error-loading" && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 2, color: "#B4B4B4", fontSize: "0.75rem" }}>
          Checking network speeds
          <CircularProgress size={16} sx={{ color: "#B4B4B4" }} />
        </Box>
      )}

      {error === "no-error" && (
        <>
          <Chip
            icon={<DownloadIcon />}
            label={`${downloadSpeed} MBPS`}
            sx={{
              bgcolor: "transparent",
              color: "#B4B4B4",
              fontSize: "0.75rem",
              width: isMobile ? "auto" : 128,
              "& .MuiChip-label": { px: 1 },
            }}
          />
          <Chip
            icon={<UploadIcon />}
            label={`${uploadSpeed} MBPS`}
            sx={{
              bgcolor: "transparent",
              color: "#B4B4B4",
              fontSize: "0.75rem",
              width: isMobile ? "auto" : 128,
              "& .MuiChip-label": { px: 1 },
            }}
          />
          <Button onClick={handleOnClick} sx={{ minWidth: 36, p: 0 }}>
            <RefreshIcon />
          </Button>
        </>
      )}

      {error === "no-wifi" && (
        <>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1, color: "#FF5D5D", fontSize: "0.75rem" }}>
            <WifiOff />
            You're offline! Check your connection
          </Box>
          <Button onClick={handleOnClick} sx={{ minWidth: 36, p: 1 }}>
            <RefreshIcon />
          </Button>
        </>
      )}

      {error === "timeout" && (
        <>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1, color: "#FF5D5D", fontSize: "0.75rem" }}>
            Something went wrong! Couldn't load data
          </Box>
          <Button onClick={handleOnClick} sx={{ minWidth: 36, p: 1 }}>
            <RefreshIcon />
          </Button>
        </>
      )}
    </Box>
  );
};

export default NetworkStats;