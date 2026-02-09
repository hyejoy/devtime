'use client';

import { memo, useEffect, useMemo } from 'react';
import CalendarHeatmap, { ReactCalendarHeatmapValue } from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';
import styles from './StudyHeatmap.module.css';

/** --- 서버 응답 데이터 타입 --- */
interface RawItem {
  date: string;
  studyTimeHours?: number;
  colorLevel?: number;
}

/** --- 히트맵 컴포넌트 내부 가공 데이터 타입 --- */
interface TransformedValue extends ReactCalendarHeatmapValue<string> {
  date: string;
  colorLevel: number;
  totalSeconds: number;
  formattedTime: string;
}

interface HeatmapProps {
  heatmapData: { heatmap: RawItem[] } | RawItem[] | undefined;
}

interface MergedData {
  studyTimeHours: number;
}

const now = new Date();
const todayYear = now.getFullYear();
const todayMonth = now.getMonth();
const startDate = new Date(todayYear - 1, todayMonth + 1, 1); // 시작일: 1년 전 이번 달 1일
const endDate = now;

const StudyHeatmap = ({ heatmapData }: HeatmapProps) => {
  const tooltipId = 'study-heatmap-tooltip';

  // 💠 데이터 변환 및 레벨 재계산 로직
  const transformedValues = useMemo((): TransformedValue[] => {
    // 1. 데이터 추출 안정화
    const targetArray = Array.isArray(heatmapData) ? heatmapData : heatmapData?.heatmap || [];

    if (!targetArray || targetArray.length === 0) return [];

    // 2. 날짜별 studyTimeHours 합산
    const mergedMap = targetArray.reduce((acc, curr) => {
      const existing = acc.get(curr.date) || { studyTimeHours: 0 };
      acc.set(curr.date, {
        studyTimeHours: existing.studyTimeHours + (curr.studyTimeHours || 0),
      });
      return acc;
    }, new Map<string, MergedData>());

    // 3. 결과 생성 및 시/분/초 계산
    return Array.from(mergedMap.entries()).map(([date, data]): TransformedValue => {
      const { studyTimeHours } = data;
      // 시간(소수점) -> 전체 초 환산
      const totalSeconds = Math.round(studyTimeHours * 3600);

      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;

      // 4. 시간 기준 colorLevel 재정의 (0~2, 2~4, 4~6, 6~8, 8+)
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
        count: totalSeconds, // 라이브러리 내부용
        colorLevel: totalSeconds > 0 ? newColorLevel : 0,
        totalSeconds,
        formattedTime: parts.join(' '),
      };
    });
  }, [heatmapData]);

  {
  }
  return (
    <div className={`${styles.heatmapContainer}`}>
      <h2 className="mb-4 text-[18px] font-semibold text-gray-400">공부 시간 바다</h2>
      <div className="flex w-full">
        <div className="flex flex-col gap-[8px] pt-7 text-[12px] font-medium text-gray-600">
          {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="m-0 flex-1 overflow-visible">
          {/*  히트맵 본체 */}
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
            classForValue={(value) => {
              const data = value as TransformedValue | undefined;
              if (!data || data.totalSeconds === 0) {
                // 학습시간 없는 경우
                return 'fill-white stroke-gray-300 stroke-[0.5px]';
              }

              // Tailwind @theme 변수 사용
              switch (data.colorLevel) {
                case 5:
                  return 'fill-heatmap5 stroke-heatmap5 stroke-[0.5px]';
                case 4:
                  return 'fill-heatmap4 stroke-heatmap4 stroke-[0.5px]';
                case 3:
                  return 'fill-heatmap3 stroke-heatmap3 stroke-[0.5px]';
                case 2:
                  return 'fill-heatmap2 stroke-heatmap2 stroke-[0.5px]';
                default:
                  return 'fill-heatmap1 stroke-heatmap1 stroke-[0.5px]';
              }
            }}
            tooltipDataAttrs={(value: ReactCalendarHeatmapValue<string> | undefined) => {
              const data = value as TransformedValue | undefined;
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
          <div className="bg-heatmap0 h-4 w-6 rounded-tl-sm rounded-bl-sm" />
          <div className="bg-heatmap1 h-4 w-6" />
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
};

export default memo(StudyHeatmap);
