'use client';

import { useEffect, useMemo } from 'react';
import CalendarHeatmap, { ReactCalendarHeatmapValue } from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

/** --- 서버 응답 데이터 타입 --- */
interface RawItem {
  date: string;
  totalSeconds?: number; // 서버 필드명에 맞춰 선택적으로 적용
  colorLevel?: number;
  formattedTime?: string;
}

/** --- 히트맵 컴포넌트 내부 가공 데이터 타입 --- */
interface TransformedValue extends ReactCalendarHeatmapValue<string> {
  date: string;
  colorLevel: number;
  totalSeconds: number;
  formattedTime: string;
}

/** --- 컴포넌트 Props 타입 --- */
interface HeatmapProps {
  // API 응답 구조에 따라 { heatmap: RawItem[] } 또는 RawItem[] 형태 수용
  heatmapData: { heatmap: RawItem[] } | RawItem[] | undefined;
}

/** --- 날짜 합산 처리를 위한 맵 데이터 타입 --- */
interface MergedData {
  totalSeconds: number;
  maxLevel: number;
}

const mockData: RawItem[] = [
  {
    date: '2026-01-01',
    colorLevel: 1,
    totalSeconds: 3600, // 3시간
    formattedTime: '1시간 0초', // 2-4시간 구간
  },
  {
    date: '2026-01-02',
    colorLevel: 1,
    totalSeconds: 10800, // 3시간
    formattedTime: '3시간 0초', // 2-4시간 구간
  },
  {
    date: '2026-01-03',
    colorLevel: 2,
    totalSeconds: 18000, // 5시간
    formattedTime: '5시간 0초', // 4-6시간 구간
  },
  {
    date: '2026-01-04',
    colorLevel: 3,
    totalSeconds: 25200, // 7시간
    formattedTime: '7시간 0초', // 6-8시간 구간
  },
  {
    date: '2026-01-05',
    colorLevel: 4,
    totalSeconds: 32400, // 9시간
    formattedTime: '9시간 0초', // 8-10시간 구간
  },
  {
    date: '2026-01-06',
    colorLevel: 5,
    totalSeconds: 43200, // 12시간
    formattedTime: '12시간 0초', // 10시간 초과 구간
  },
  {
    date: '2025-12-30',
    colorLevel: 1,
    totalSeconds: 3600, // 1시간
    formattedTime: '1시간 0초', // 0-2시간 구간
  },
  {
    date: '2025-12-30',
    colorLevel: 1,
    totalSeconds: 3628, // 1시간 28초
    formattedTime: '1시간 28초', // 0-2시간 구간
  },
  {
    date: '2025-12-30',
    colorLevel: 1,
    totalSeconds: 3600, // 1시간
    formattedTime: '1시간 0초', // 0-2시간 구간
  },
  {
    date: '2025-12-30',
    colorLevel: 1,
    totalSeconds: 3600, // 1시간
    formattedTime: '1시간 0초', // 0-2시간 구간
  },
];

const now = new Date();
const todayYear = now.getFullYear();
const todayMonth = now.getMonth();
const startDate = new Date(`${todayYear - 1}-${todayMonth + 1}-01`); // 시작일 계산 보정
const endDate = new Date(now);

export default function StudyHeatmap({ heatmapData }: HeatmapProps) {
  const tooltipId = 'study-heatmap-tooltip';

  // 💠 데이터 변환 및 레벨 재계산 로직
  const transformedValues = useMemo((): TransformedValue[] => {
    // 데이터 추출 (객체 형태일 경우와 배열 형태일 경우 대응)
    // 서버 코드 수정될때까지만 임시 mockData
    // const targetArray = Array.isArray(heatmapData) ? heatmapData : heatmapData?.heatmap || mockData;
    const targetArray = mockData;

    if (!targetArray || targetArray.length === 0) return [];

    // 1. 데이터 병합 (날짜별 totalSeconds 합산)
    const mergedMap = targetArray.reduce((acc, curr) => {
      const existing = acc.get(curr.date) || { totalSeconds: 0, maxLevel: 0 };

      acc.set(curr.date, {
        totalSeconds: existing.totalSeconds + (curr.totalSeconds || 0),
        maxLevel: Math.max(existing.maxLevel, curr.colorLevel || 0),
      });

      return acc;
    }, new Map<string, MergedData>());

    // 2. 병합된 데이터를 바탕으로 결과 생성 및 레벨 재계산
    return Array.from(mergedMap.entries()).map(([date, data]): TransformedValue => {
      const { totalSeconds } = data;
      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;

      // 3. 시간 구간별 colorLevel 재정의
      let newColorLevel = 1;
      if (h >= 8) newColorLevel = 5;
      else if (h >= 6) newColorLevel = 4;
      else if (h >= 4) newColorLevel = 3;
      else if (h >= 2) newColorLevel = 2;
      else newColorLevel = 1;

      const parts: string[] = [];
      if (h > 0) parts.push(`${h}시간`);
      if (m > 0) parts.push(`${m}분`);
      if (s > 0 || (h === 0 && m === 0)) parts.push(`${s}초`);

      return {
        date,
        count: totalSeconds, // 라이브러리 기본 필수 필드 대응
        colorLevel: newColorLevel,
        totalSeconds,
        formattedTime: parts.join(' '),
      };
    });
  }, [heatmapData]);

  return (
    <div className="mt-4 w-full rounded-xl bg-white p-6">
      <h2 className="mb-4 text-[18px] font-semibold text-gray-400">공부 시간 바다</h2>
      <div className="flex w-full">
        <div className="flex flex-col gap-1.5 pt-7 text-[12px] font-medium text-gray-500">
          {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="m-0 flex-1 overflow-visible">
          <CalendarHeatmap
            gutterSize={3}
            startDate={startDate}
            endDate={endDate}
            values={transformedValues}
            showOutOfRangeDays={true}
            showWeekdayLabels={false}
            monthLabels={[
              '1월',
              '2월',
              '3월',
              '4월',
              '5월',
              '6월',
              '7월',
              '8월',
              '9월',
              '10월',
              '11월',
              '12월',
            ]}
            // 1. 타입을 기본 라이브러리 타입으로 받고, 내부에서 'as'로 단언
            classForValue={(value: ReactCalendarHeatmapValue<string> | undefined) => {
              const data = value as TransformedValue | undefined;
              // 데이터가 없을 때
              if (!data || data.totalSeconds === 0) {
                return 'fill-gray-100 stroke-gray-200 stroke-[0.5px]';
              }

              if (!data || data.colorLevel <= 0)
                if (data.colorLevel === 5) return 'fill-heatmap5 stroke-heatmap5 stroke-[0.5px]';
              if (data.colorLevel === 4) return 'fill-heatmap4 stroke-heatmap4 stroke-[0.5px]';
              if (data.colorLevel === 3) return 'fill-heatmap3 stroke-heatmap3 stroke-[0.5px]';
              if (data.colorLevel === 2) return 'fill-heatmap2 stroke-heatmap2 stroke-[0.5px]';

              return 'fill-heatmap1 stroke-heatmap1 stroke-[0.5px]';
            }}
            // 2. 툴팁 속성
            tooltipDataAttrs={(value: ReactCalendarHeatmapValue<string> | undefined) => {
              const data = value as TransformedValue | undefined;
              console.log('data!', data);
              return {
                'data-tooltip-id': tooltipId,
                'data-tooltip-content': data?.formattedTime
                  ? `[${data.date}] ${data.formattedTime}`
                  : '기록 없음',
              } as any;
            }}
          />
        </div>
        {/* 하단 Color 색 */}
      </div>
      <div className="mt-4 flex items-center gap-2 text-[12px]">
        <span className="text-heatmap1 font-semibold">Shallow</span>
        <div className="flex">
          <div className="bg-heatmap1 h-4 w-6 rounded-tl-sm rounded-bl-sm" />
          <div className="bg-heatmap2 h-4 w-6" />
          <div className="bg-heatmap3 h-4 w-6" />
          <div className="bg-heatmap4 h-4 w-6" />
          <div className="bg-heatmap5 h-4 w-6 rounded-tr-sm rounded-br-sm" />
        </div>
        <span className="text-heatmap5 font-semibold">Deep</span>
      </div>
      {/* Tooltip */}
      <Tooltip id={tooltipId} />
    </div>
  );
}
