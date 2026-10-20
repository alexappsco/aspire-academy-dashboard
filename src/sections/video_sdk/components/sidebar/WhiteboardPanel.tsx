import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePubSub } from "@videosdk.live/react-sdk";
import {
  Box,
  Button,
  IconButton,
  Slider,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";

type Tool = "pen" | "eraser";

type WhiteboardEvent =
  | {
      t: "seg";
      x0: number;
      y0: number;
      x1: number;
      y1: number;
      c: string;
      w: number;
      tool: Tool;
    }
  | { t: "clear" };

function clamp01(n: number) {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

function safeJsonParse(s: string): unknown | null {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

function isWhiteboardEvent(v: unknown): v is WhiteboardEvent {
  if (!v || typeof v !== "object") return false;
  const obj = v as any;
  if (obj.t === "clear") return true;
  if (obj.t !== "seg") return false;
  return (
    typeof obj.x0 === "number" &&
    typeof obj.y0 === "number" &&
    typeof obj.x1 === "number" &&
    typeof obj.y1 === "number" &&
    typeof obj.c === "string" &&
    typeof obj.w === "number" &&
    (obj.tool === "pen" || obj.tool === "eraser")
  );
}

function applySegment(
  ctx: CanvasRenderingContext2D,
  seg: Extract<WhiteboardEvent, { t: "seg" }>
) {
  const { x0, y0, x1, y1, c, w, tool } = seg;
  const canvas = ctx.canvas;
  const px0 = x0 * canvas.width;
  const py0 = y0 * canvas.height;
  const px1 = x1 * canvas.width;
  const py1 = y1 * canvas.height;

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = Math.max(1, w);

  if (tool === "eraser") {
    ctx.globalCompositeOperation = "destination-out";
    ctx.strokeStyle = "rgba(0,0,0,1)";
  } else {
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = c;
  }

  ctx.beginPath();
  ctx.moveTo(px0, py0);
  ctx.lineTo(px1, py1);
  ctx.stroke();
  ctx.restore();
}

export function WhiteboardPanel({ panelHeight }: { panelHeight: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState<string>("#111111");
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const { publish } = usePubSub("WHITEBOARD");

  const sendSeg = useMemo(() => {
    let lastSentAt = 0;
    return (evt: Extract<WhiteboardEvent, { t: "seg" }>) => {
      const now = Date.now();
      if (now - lastSentAt < 18) return; // throttle
      lastSentAt = now;
      publish(JSON.stringify(evt), { persist: false });
    };
  }, [publish]);

  const clearLocal = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  const clearAll = useCallback(() => {
    publish(JSON.stringify({ t: "clear" } satisfies WhiteboardEvent), { persist: true });
    clearLocal();
  }, [clearLocal, publish]);

  usePubSub("WHITEBOARD", {
    onMessageReceived: (data: { message: string }) => {
      const parsed = safeJsonParse(data.message);
      if (!isWhiteboardEvent(parsed)) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (parsed.t === "clear") {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }
      applySegment(ctx, parsed);
    },
  });

  const resizeCanvasToContainer = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    const cssWidth = Math.max(1, Math.floor(rect.width));
    const cssHeight = Math.max(1, Math.floor(rect.height));

    const nextW = Math.floor(cssWidth * dpr);
    const nextH = Math.floor(cssHeight * dpr);

    if (canvas.width === nextW && canvas.height === nextH) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Preserve existing drawing.
    const prev = document.createElement("canvas");
    prev.width = canvas.width;
    prev.height = canvas.height;
    const prevCtx = prev.getContext("2d");
    if (prevCtx) prevCtx.drawImage(canvas, 0, 0);

    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;
    canvas.width = nextW;
    canvas.height = nextH;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = true;

    if (prev.width > 0 && prev.height > 0) {
      ctx.drawImage(prev, 0, 0, prev.width, prev.height, 0, 0, nextW, nextH);
    }
  }, []);

  useEffect(() => {
    resizeCanvasToContainer();
    const handleResize = () => resizeCanvasToContainer();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [resizeCanvasToContainer]);

  const getNormPointFromEvent = useCallback((e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = clamp01((e.clientX - rect.left) / rect.width);
    const y = clamp01((e.clientY - rect.top) / rect.height);
    return { x, y };
  }, []);

  const drawSegmentLocalAndBroadcast = useCallback(
    (from: { x: number; y: number }, to: { x: number; y: number }) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const seg: Extract<WhiteboardEvent, { t: "seg" }> = {
        t: "seg",
        x0: from.x,
        y0: from.y,
        x1: to.x,
        y1: to.y,
        c: color,
        w: strokeWidth,
        tool,
      };

      applySegment(ctx, seg);
      sendSeg(seg);
    },
    [color, sendSeg, strokeWidth, tool]
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      resizeCanvasToContainer();
      canvas.setPointerCapture(e.pointerId);
      const p = getNormPointFromEvent(e);
      if (!p) return;
      lastPointRef.current = p;
      setIsDrawing(true);
    },
    [getNormPointFromEvent, resizeCanvasToContainer]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDrawing) return;
      const p = getNormPointFromEvent(e);
      const last = lastPointRef.current;
      if (!p || !last) return;
      lastPointRef.current = p;
      drawSegmentLocalAndBroadcast(last, p);
    },
    [drawSegmentLocalAndBroadcast, getNormPointFromEvent, isDrawing]
  );

  const endDrawing = useCallback((e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (canvas) {
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    }
    setIsDrawing(false);
    lastPointRef.current = null;
  }, []);

  const palette = useMemo(
    () => ["#111111", "#ff5252", "#4caf50", "#40c4ff", "#ffd740", "#b388ff"],
    []
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: panelHeight, overflow: "hidden" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          px: 1.5,
          py: 1,
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <ToggleButtonGroup
          value={tool}
          exclusive
          onChange={(_, v) => v && setTool(v)}
          size="small"
          sx={{
            "& .MuiToggleButton-root": {
              color: "white",
              borderColor: "rgba(255,255,255,0.16)",
              textTransform: "none",
              px: 1.25,
            },
            "& .MuiToggleButton-root.Mui-selected": {
              bgcolor: "rgba(255,255,255,0.14)",
              color: "white",
            },
          }}
        >
          <ToggleButton value="pen">Pen</ToggleButton>
          <ToggleButton value="eraser">Eraser</ToggleButton>
        </ToggleButtonGroup>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          {palette.map((c) => (
            <Tooltip key={c} title={c === "#111111" ? "Black" : c} arrow>
              <Button
                onClick={() => setColor(c)}
                variant="contained"
                disableElevation
                sx={{
                  minWidth: 0,
                  width: 18,
                  height: 18,
                  p: 0,
                  borderRadius: "50%",
                  bgcolor: c,
                  border: color === c ? "2px solid #4CAF50" : "2px solid rgba(255,255,255,0.18)",
                  "&:hover": { bgcolor: c, opacity: 0.9 },
                }}
              />
            </Tooltip>
          ))}
        </Box>

        <Tooltip title="Clear board" arrow>
          <IconButton onClick={clearAll} sx={{ color: "white" }} size="small">
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 1.5, py: 1 }}>
        <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", minWidth: 52 }}>
          Size
        </Typography>
        <Slider
          value={strokeWidth}
          min={1}
          max={14}
          step={1}
          onChange={(_, v) => setStrokeWidth(v as number)}
          sx={{
            color: "#4CAF50",
            "& .MuiSlider-thumb": { width: 14, height: 14 },
            "& .MuiSlider-rail": { opacity: 0.2 },
          }}
        />
      </Box>

      <Box
        ref={containerRef}
        sx={{
          flex: 1,
          px: 1.5,
          pb: 1.5,
          touchAction: "none",
        }}
      >
        <Box
          sx={{
            height: "100%",
            borderRadius: 2,
            bgcolor: "#ffffff",
            border: "1px solid rgba(0,0,0,0.12)",
            overflow: "hidden",
          }}
        >
          <canvas
            ref={canvasRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrawing}
            onPointerCancel={endDrawing}
            style={{
              width: "100%",
              height: "100%",
              display: "block",
              cursor: tool === "eraser" ? "crosshair" : "crosshair",
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}

