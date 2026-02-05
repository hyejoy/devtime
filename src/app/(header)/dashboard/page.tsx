'use client';

import StudyTimeChart from '@/app/components/dashboard/Chart';
import Pagination from '@/app/components/dashboard/Pagination';
import StudyHeatmap from '@/app/components/dashboard/StudyHeatmap';
import SummaryCard from '@/app/components/dashboard/SummaryCard';
import Table from '@/app/components/dashboard/Table';
import { API } from '@/constants/endpoints';
import { StatsResponse, WeekdayStudyTime } from '@/types/api';
import { formatTime_hours, formatTime_minutes } from '@/utils/formatTime';
import { useEffect, useState } from 'react';

/** --- 임시 데이터 --- */
const today = new Date();

// 1년 전 날짜 설정
const oneYearAgo = new Date();
oneYearAgo.setFullYear(today.getFullYear() - 1);

const INITIAL_STUDY_LOGS: StudyLogsResponse = {
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    hasNext: false,
    hasPrev: false,
  },
  studyLogs: [],
};

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

export interface RawData {
  date: string;
  studyTimeHours: number;
  colorLevel: number;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export type StudyLog = {
  completionRate: number;
  date: string;
  id: string;
  incompleteTasks: number;
  studyTime: number;
  todayGoal: string;
  totalTasks: number;
};

export interface StudyLogsResponse {
  pagination: Pagination;
  studyLogs: StudyLog[];
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
  const [studyLogs, setStudyLogs] = useState<StudyLogsResponse>(INITIAL_STUDY_LOGS);
  const [heatmapData, setHeatmapData] = useState<RawData[]>([]);

  const [weekdayStudyTime, setWeekdayStudyTime] = useState<WeekdayStudyTime | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
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

  /** --- 요일별 공부 시간 평균 데이터 조회--- */
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
          console.log('요일별 공부시간 평균 데이터 : ', data);

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

  /** 히트맵(공부 시간 바다 ) 데이터 조회  */
  useEffect(() => {
    const fetchHeatMap = async () => {
      try {
        const res = await fetch(`${API.HEATMAP.HEATMAP}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          console.log('학습 히트맵 데이터 조회 (바다):', data.heatmap);
          setHeatmapData(data);
        }
      } catch (err) {
        console.log('학습 히트맵 데이터 조회 (바다) err : ', err);
      }
    };

    fetchHeatMap();
  }, []);

  const fetchStudyLogs = async (page: number) => {
    try {
      const url = `${API.STUDYLOGS.GET_STUDY_LOGS({
        page: page,
        limit: 10,
      })}`;

      const res = await fetch(url, {
        method: 'GET',
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        const result: StudyLogsResponse = data.data;
        console.log('학습 기록 (GRID)조회 : ', result);
        setStudyLogs(result);
      }
    } catch (err) {
      console.log('학습 기록 (GRID)조회 err : ', err);
    }
  };

  const handleMovePage = (page: number) => {
    setCurrentPage(page); // 현재 페이지 상태 업데이트
    fetchStudyLogs(page);
  };

  // 삭제 후 현재 페이지 데이터를 다시 불러오기 위함
  const onDeleteAndRefresh = async (id: string) => {
    await handleDeleteStudyLog(id);
  };

  const handleDeleteStudyLog = async (id: string) => {
    try {
      const res = await fetch(`${API.STUDYLOGS.GET_DETAIL_STUDY_LOG(id)}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        fetchStudyLogs(currentPage);
      }
    } catch (err) {
      console.log('학습기록 로그 삭제 에러 : ', err);
    }
  };
  /** 학습 기록 (GRID)  데이터 조회 */
  useEffect(() => {
    fetchStudyLogs(1);
  }, []);

  return (
    <main className="mt-[40px] w-[70vw] flex-1">
      <section className="flex gap-4">
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
      <section>
        <StudyHeatmap heatmapData={heatmapData} />
      </section>

      {/* 학습기록 Grid */}
      <section className="mt-8 mb-16 flex flex-col rounded-xl bg-white p-6 pb-8">
        <div className="mb-6 text-[18px] font-semibold text-gray-400">학습 기록</div>

        {/* Table 컴포넌트 */}
        <Table studyLogs={studyLogs.studyLogs} onDelete={onDeleteAndRefresh} />

        {/* Pagination 컴포넌트 : 직접 페이지네이션 상태 관리 */}
        <section className="mt-9 flex items-center justify-center">
          <Pagination {...studyLogs.pagination} onPageChange={handleMovePage} />
        </section>
      </section>
    </main>
  );
}
