/**
 * 밀리초(ms)를 입력받아 '시'를 반환합니다.
 */
export const formatTime_hours = (ms: number) => {
  return Math.floor(ms / (1000 * 3600));
};

/**
 * 밀리초(ms)를 입력받아 '분'을 반환합니다.
 */
export const formatTime_minutes = (ms: number) => {
  return Math.floor((ms % (1000 * 3600)) / (1000 * 60));
};

/**
 * 밀리초(ms)를 입력받아 '초'를 반환합니다.
 */
export const formatTime_seconds = (ms: number) => {
  return Math.floor((ms % (1000 * 60)) / 1000);
};

/**
 * 밀리초(ms)를 입력받아 'H시간 M분 S초' 형태로 포맷팅합니다.
 * @param ms - 서버에서 받은 studyTime (ms 단위)
 */
export const formated_Time = (ms: number) => {
  // 1. 밀리초를 초(s) 단위로 환산
  const seconds = Math.floor(ms / 1000);

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const parts: string[] = [];
  if (h > 0) parts.push(`${h}시간`);
  if (m > 0) parts.push(`${m}분`);

  // 초는 값이 있거나, 시/분이 모두 0일 때(예: 0초) 표시합니다.
  if (s > 0 || (h === 0 && m === 0)) {
    parts.push(`${s}초`);
  }

  return parts.join(' ');
};

/**
 * 서버 전송용 데이터 포맷팅
 * 서버 통계(히트맵) 및 학습 로그의 단위 일치를 위해 ms 단위를 그대로 유지하여 전송합니다.
 */
export const formatSplitTimesForServer = (splitTimes: { date: string; timeSpent: number }[]) => {
  return splitTimes.map((s) => ({
    // 자정 보정 로직 유지
    date: s.date.includes('T00:00:00') ? new Date().toISOString() : s.date,

    // 🚩 수정: / 1000 을 제거하여 ms 단위로 전송
    // 로그상 서버가 5000을 5초로 인식하므로, ms 단위를 그대로 보냅니다.
    timeSpent: s.timeSpent,
  }));
};
