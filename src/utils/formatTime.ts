export const formatTime_hours = (seconds: number) => {
  return Math.floor(seconds / 3600);
};

export const formatTime_minutes = (seconds: number) => {
  return Math.floor((seconds % 3600) / 60);
};

export const formatTime_seconds = (seconds: number) => {
  return seconds % 60;
};

export const formated_Time = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const parts: string[] = [];
  if (h > 0) parts.push(`${h}시간`);
  if (m > 0) parts.push(`${m}분`);
  if (s > 0 || (h === 0 && m === 0)) parts.push(`${s}초`);
  return parts.join(' ');
};
