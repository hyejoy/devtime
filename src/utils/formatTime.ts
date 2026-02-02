export const formatTime_hours = (seconds: number) => {
  return Math.floor(seconds / 3600);
};

export const formatTime_minutes = (seconds: number) => {
  return Math.floor((seconds % 3600) / 60);
};

export const formatTime_seconds = (seconds: number) => {
  return seconds % 60;
};
