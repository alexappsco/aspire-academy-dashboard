import { nameTructed } from './helper';

export { nameTructed };

export const sideBarModes = {
  PARTICIPANTS: 'PARTICIPANTS',
  CHAT: 'CHAT',
  WHITEBOARD: 'WHITEBOARD',
} as const;

type QualityStat = {
  packetsLost?: number;
  totalPackets?: number;
  jitter?: number;
  rtt?: number;
};

export function getQualityScore(stat: QualityStat = {}): number {
  const totalPackets = stat.totalPackets || 0;
  const packetLossPercent = totalPackets > 0 ? ((stat.packetsLost || 0) / totalPackets) * 100 : 0;
  const jitter = stat.jitter || 0;
  const rtt = stat.rtt || 0;

  let score = 100;
  score -= Math.min(packetLossPercent * 2, 40);
  score -= Math.min(jitter / 2, 30);
  score -= Math.min(rtt / 20, 30);

  return Math.max(0, Math.round(score));
}
