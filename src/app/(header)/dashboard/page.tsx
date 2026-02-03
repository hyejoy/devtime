'use client';

import { useEffect, useState } from 'react';
import StudyTimeChart from '@/app/components/dashboard/Chart';
import SummaryCard from '@/app/components/dashboard/SummaryCard';
import { API } from '@/constants/endpoints';
import { StatsResponse, WeekdayStudyTime } from '@/types/api';
import { formatTime_hours, formatTime_minutes } from '@/utils/formatTime';

/** --- Interfaces & Types --- */
interface SummaryItem {
  title: string;
  value: number;
  type: 'time' | 'day' | 'percent';
}

interface DisplayPart {
  value: number;
  unit: '시간' | '분' | '일째' | '%';
}

interface FormattedData {
  title: string;
  parts: DisplayPart[];
}

const CHART_LABELS = ['24시간', '16시간', '8시간'];

/** --- Utility: 데이터 포맷팅 함수 --- */
const formatSummaryData = (item: SummaryItem): FormattedData => {
  const { title, type, value } = item;

  if (type === 'time') {
    return {
      title,
      parts: [
        { value: formatTime_hours(value), unit: '시간' },
        { value: formatTime_minutes(value), unit: '분' },
      ],
    };
  }

  if (type === 'day') {
    return { title, parts: [{ value, unit: '일째' }] };
  }

  return { title, parts: [{ value: Math.trunc(value), unit: '%' }] };
};

export default function DashboardPage() {
  /** --- States --- */
  const [stats, setStats] = useState<{
    consecutiveDays: number;
    totalStudyTime: number;
    avgDailyStudyTime: number;
    taskRate: number;
  }>({
    consecutiveDays: 0,
    totalStudyTime: 0,
    avgDailyStudyTime: 0,
    taskRate: 0,
  });

  const [weekdayStudyTime, setWeekdayStudyTime] =
    useState<WeekdayStudyTime | null>(null);

  /** --- Data Mapping --- */
  const summaryConfigs: SummaryItem[] = [
    { title: '누적 공부 시간', value: stats.totalStudyTime, type: 'time' },
    { title: '누적 공부 일수', value: stats.consecutiveDays, type: 'day' },
    {
      title: '하루 평균 공부 시간',
      value: stats.avgDailyStudyTime,
      type: 'time',
    },
    { title: '목표 달성률', value: stats.taskRate, type: 'percent' },
  ];

  /** --- Effects --- */
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch(`${API.STATS.STATS}`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        if (res.ok) {
          const data: StatsResponse = await res.json();
          console.log(data);

          setStats({
            consecutiveDays: data.consecutiveDays,
            totalStudyTime: data.totalStudyTime,
            avgDailyStudyTime: data.averageDailyStudyTime,
            taskRate: data.taskCompletionRate,
          });
          setWeekdayStudyTime(data.weekdayStudyTime);
        }
      } catch (error) {
        console.error('대시보드 데이터 로드 실패:', error);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <main className="mt-[40px] w-[70vw] flex-1">
      <section className="flex gap-1.5">
        {/* 요약 카드 그리드 */}
        <div className="grid w-2/5 grid-cols-2 gap-4">
          {summaryConfigs.map((config) => {
            const displayData = formatSummaryData(config);
            return (
              <SummaryCard
                key={displayData.title}
                title={displayData.title}
                parts={displayData.parts}
              />
            );
          })}
        </div>

        {/* 요일별 통계 차트 영역 */}
        <div className="bg-brand-primary flex w-3/5 overflow-hidden rounded-xl">
          <div className="w-1/3 pt-6 pl-6 text-[18px] font-semibold text-white">
            요일별 공부 시간 평균
          </div>

          <div className="mt-12 mr-12 mb-4 flex w-2/3 items-end">
            {/* Y축 커스텀 라벨 */}
            <div className="flex h-full w-20 flex-col justify-between pt-3 pb-16 text-nowrap">
              {CHART_LABELS.map((label) => (
                <span
                  key={label}
                  className="mr-2 border-t border-white/20 text-[12px] text-white/50"
                >
                  {label}
                </span>
              ))}
            </div>
            {/* 차트 컴포넌트 */}
            <StudyTimeChart weekdayStudyTime={weekdayStudyTime} />
          </div>
        </div>
      </section>

      {/* 하단 추가 섹션들 */}
      <section className="mt-8">공부시간 바다</section>
      <section className="mt-8">학습 기록</section>
    </main>
  );
}
