'use client';

import StudyTimeChart from '@/app/components/dashboard/Chart';
import Pagination from '@/app/components/dashboard/Pagination';
import StudyHeatmap from '@/app/components/dashboard/StudyHeatmap';
import SummaryCard from '@/app/components/dashboard/SummaryCard';
import Table from '@/app/components/dashboard/Table';
import DashboardDialog from '@/app/components/dialog/dashboard/DashboardDialog';
import TimerLogDeleteDialog from '@/app/components/dialog/dashboard/TimerLogDeleteDialog';
import { API } from '@/constants/endpoints';
import { useDialogStore } from '@/store/dialogStore';
import { StatsResponse, StudyLogsDetailResponse, WeekdayStudyTime } from '@/types/api';
import { FormattedData, RawData, StudyLogsResponse, SummaryItem } from '@/types/dashboard';
import { formatTimeHours, formatTimeMinutes } from '@/utils/formatTime';
import { useCallback, useEffect, useMemo, useState } from 'react';

const today = new Date();
// 1년 전 날짜 설정
const oneYearAgo = new Date();
oneYearAgo.setFullYear(today.getFullYear() - 1);
const CHART_LABELS = ['24시간', '16시간', '8시간'];

/** --- Utility: 데이터 포맷팅 함수 --- */
const formatSummaryData = (item: SummaryItem): FormattedData => {
  const { title, type, value } = item;

  if (type === 'time') {
    return {
      title,
      parts: [
        { value: formatTimeHours(value), unit: '시간' },
        { value: formatTimeMinutes(value), unit: '분' },
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
  const [studyLogs, setStudyLogs] = useState<StudyLogsResponse | null>(null);
  const [detailLog, setDetailLog] = useState<StudyLogsDetailResponse | null>(null);
  const [heatmapData, setHeatmapData] = useState<RawData[]>([]);
  const { isOpen } = useDialogStore();
  const [detailId, setDetailId] = useState<string | null>(null); // 주범
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [weekdayStudyTime, setWeekdayStudyTime] = useState<WeekdayStudyTime | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  /** --- Data Mapping --- */

  // 요일별 공부시간 메모이제이션
  const memoizedWeekdayStudyTime = useMemo(() => {
    return weekdayStudyTime;
  }, [weekdayStudyTime]);

  // 히트맵 데이터 메모이제이션
  const memoizedHeatmapData = useMemo(() => {
    return heatmapData;
  }, [heatmapData]);

  const memoizedStudyLogs = useMemo(() => {
    return studyLogs;
  }, [studyLogs]);

  // 요약 카드 설정 메모이제이션
  const summaryConfigs: SummaryItem[] = useMemo(
    () => [
      { title: '누적 공부 시간', value: stats.totalStudyTime, type: 'time' },
      { title: '누적 공부 일수', value: stats.consecutiveDays, type: 'day' },
      { title: '하루 평균 공부 시간', value: stats.avgDailyStudyTime, type: 'time' },
      { title: '목표 달성률', value: stats.taskRate, type: 'percent' },
    ],
    [stats]
  ); // stats가 바뀔 때만 배열 재생성

  // 포맷팅된 요약 카드 데이터 메모이제이션
  const formattedSummaryConfigs = useMemo(() => {
    return summaryConfigs.map((config) => ({
      ...config,
      display: formatSummaryData(config),
    }));
  }, [summaryConfigs]);

  // 첫 진입시 대시보드 데이터 조회
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
          // console.log('요일별 공부시간 평균 데이터 : ', data);

          setStats({
            consecutiveDays: data.consecutiveDays,
            totalStudyTime: data.totalStudyTime,
            avgDailyStudyTime: data.averageDailyStudyTime,
            taskRate: data.taskCompletionRate,
          });
          setWeekdayStudyTime(data.weekdayStudyTime);
        }
      } catch (error) {
        // console.error('대시보드 데이터 로드 실패:', error);
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
          // console.log('학습 히트맵 데이터 조회 (바다):', data.heatmap);
          setHeatmapData(data);
        }
      } catch (err) {
        // console.log('학습 히트맵 데이터 조회 (바다) err : ', err);
      }
    };

    fetchHeatMap();
  }, []);

  /** 학습 기록 (GRID) 데이터 조회 함수 */
  const fetchStudyLogs = useCallback(async (page: number) => {
    try {
      const url = `${API.STUDYLOGS.GET({
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
        // console.log('학습 기록 (GRID)조회 : ', result);
        setStudyLogs(result);
      }
    } catch (err) {
      // console.log('학습 기록 (GRID)조회 err : ', err);
    }
  }, []);

  const handleMovePage = (page: number) => {
    setCurrentPage(page); // 현재 페이지 상태 업데이트
    fetchStudyLogs(page);
  };

  /** 학습기록 로그 삭제 처리 */
  const handleDeleteStudyLog = useCallback(async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`${API.STUDYLOGS.DELETE(deleteId)}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        fetchStudyLogs(currentPage);
      }
    } catch (err) {
      // console.log('학습기록 로그 삭제 에러 : ', err);
    }
  }, [deleteId, currentPage, fetchStudyLogs]);

  const handleRowClick = useCallback((id: string) => {
    setDetailId(id);
  }, []); // id 설정 로직 고정

  const handleDeleteId = useCallback((id: string | null) => {
    setDeleteId(id);
  }, []); // id 설정 로직 고정

  /** 학습 기록 (GRID)  데이터 조회 */
  useEffect(() => {
    fetchStudyLogs(1);
  }, []);

  /** 디테일 다이얼로그 정보 불러오기 */
  useEffect(() => {
    const fetchLogDetail = async () => {
      if (!detailId) return;
      try {
        const res = await fetch(`${API.STUDYLOGS.DETAIL(detailId)}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (res.ok) {
          const data = await res.json();
          setDetailLog(data.data);
        }
      } catch (err) {
        // console.log('로그 디테일 에러 : ', err);
      }
    };
    fetchLogDetail();
  }, [detailId]);

  return (
    <main className="mt-[40px] w-full">
      <section className="flex gap-4">
        {/* 요약 카드 그리드 */}
        <div className="grid w-2/5 grid-cols-2 gap-4">
          {formattedSummaryConfigs.map((item) => (
            <SummaryCard
              key={item.display.title}
              title={item.display.title}
              parts={item.display.parts} // 이제 이 parts는 메모리 주소가 고정됩니다.
            />
          ))}
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
                <span key={label} className="mr-2 border-white/20 text-[12px] text-white/50">
                  {label}
                </span>
              ))}
            </div>
            {/* 차트 컴포넌트 */}
            <StudyTimeChart weekdayStudyTime={memoizedWeekdayStudyTime} />
          </div>
        </div>
      </section>

      {/* 공부 시간 바다 */}
      <section>
        <StudyHeatmap heatmapData={memoizedHeatmapData} />
      </section>

      {/* 학습기록 Grid */}
      <section className="mt-8 mb-16 flex flex-col rounded-xl bg-white p-6 pb-8">
        <div className="mb-6 text-[18px] font-semibold text-gray-400">학습 기록</div>

        {/* Table 컴포넌트 */}
        {memoizedStudyLogs && (
          <Table
            onClickRow={handleRowClick}
            studyLogs={memoizedStudyLogs.studyLogs}
            onChangeDeletId={handleDeleteId}
          />
        )}

        {/* Pagination 컴포넌트 : 직접 페이지네이션 상태 관리 */}
        {studyLogs && (
          <section className="mt-9 flex items-center justify-center">
            <Pagination {...studyLogs.pagination} onPageChange={handleMovePage} />
          </section>
        )}
      </section>
      {/* 학습 기록 상세보기 모달 */}
      {/* 상세보기: ID가 있고 상세 데이터도 준비되었을 때 */}
      {isOpen && detailId && detailLog && (
        <DashboardDialog
          detailLog={detailLog}
          onReset={() => {
            setDetailLog(null); // detail 내용 초기화
            setDetailId(null); // detail Id 초기화
          }}
        />
      )}
      {/* 삭제: 삭제용 ID가 있을 때 */}
      {isOpen && deleteId && (
        <TimerLogDeleteDialog onChangeDeleteId={handleDeleteId} onDelete={handleDeleteStudyLog} />
      )}
    </main>
  );
}
