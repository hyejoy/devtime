export const formatSplitTimesForServer = (
  splitTimes: { date: string; timeSpent: number }[]
) => {
  return splitTimes.map((s) => ({
    ...s,
    // 자정(T00:00:00)으로 설정된 날짜가 있다면 현재 시간의 ISO String으로 보정
    date: s.date.includes('T00:00:00') ? new Date().toISOString() : s.date,
  }));
};
