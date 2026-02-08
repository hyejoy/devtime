'use client';

import { WeekdayStudyTime } from '@/types/api';
import { formatTimeHours, formatTimeMinutes, formatTimeSeconds } from '@/utils/formatTime';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  ChartOptions,
  ChartData,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

interface StudyAvgChartProps {
  weekdayStudyTime: WeekdayStudyTime | null;
}
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export default function StudyAvgChart({ weekdayStudyTime }: StudyAvgChartProps) {
  const labels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // 예시: 요일별 평균 공부시간(0~24)
  // const studyHours = [0, 17, 23, 20, 17, 14, 24];

  const days: (keyof WeekdayStudyTime)[] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  const studySeconds = weekdayStudyTime ? days.map((day) => weekdayStudyTime[day]) : [];

  const studyHours = studySeconds.map((s) => formatTimeHours(s));
  const remainHours = studyHours.map((h) => 24 - h);
  const studyHoursLabel = studySeconds.map((s) => {
    const h = formatTimeHours(s);
    const m = formatTimeMinutes(s);
    const sec = formatTimeSeconds(s);

    return `${h > 0 ? `${h}시 ` : ''}${m > 0 ? `${m}분 ` : '0분'}${sec > 0 ? `${sec}초` : ''}`.trim();
  });

  const data: ChartData<'bar'> = {
    labels,
    datasets: [
      {
        label: 'study',
        data: studyHours,
        backgroundColor: '#FFFFFF',
        borderWidth: 0,
        borderSkipped: false,
        stack: 'hours',
        borderRadius: (ctx: any) => {
          const i = ctx.dataIndex;
          const study = studyHours[i];

          if (study === 0) return 0; // 안 보임
          if (study === 24) return { topLeft: 8, topRight: 8, bottomLeft: 8, bottomRight: 8 };

          return { topLeft: 0, topRight: 0, bottomLeft: 8, bottomRight: 8 };
        },
      },
      {
        label: 'remain',
        data: remainHours,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderWidth: 0,
        borderSkipped: false,
        stack: 'hours',
        borderRadius: (ctx: any) => {
          const i = ctx.dataIndex;
          const remain = remainHours[i];
          const study = studyHours[i];

          // if (remain === 0) return 0; // 공부가 24시간이면 remain은 안 보임
          if (study === 0 || remain === 24 || remain === undefined || study === undefined) {
            // remain이 24시간(전체 바) -> 위/아래 모두 둥글게
            return { topLeft: 8, topRight: 8, bottomLeft: 8, bottomRight: 8 };
          }

          // 일반 케이스: 위만 둥글게
          return { topLeft: 8, topRight: 8, bottomLeft: 0, bottomRight: 0 };
        },
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        caretSize: 0,
        mode: 'point',
        enabled: true,
        padding: 4,
        backgroundColor: 'var(--color-gray-800)',
        titleColor: 'white',
        callbacks: {
          //타이틀 커스터마이징
          title: (context) => {
            const dataIndex = context[0].dataIndex;
            return studyHoursLabel[dataIndex];
          },
          label: () => {
            return '';
          },
        },
        titleMarginBottom: 0,
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
        border: { display: false },
        ticks: {
          display: false,
        },
      },
      y: {
        stacked: true,
        min: 0,
        max: 24,
        ticks: {
          display: false,
          // stepSize: 8,
          // color: 'rgba(255,255,255,0.75)',
          // callback: (v) => `${v !== 0 ? v + '시간' : ''}`,
          // font: { size: 12, weight: 'lighter' },
        },
        grid: {
          color: 'transparent',
          drawTicks: false,
        },
        border: { display: false },
      },
    },
    layout: {
      // y축 라벨 때문에 좌측 여백이 생기는데, 아래 HTML 라벨도 동일하게 맞추려고 고정
      // padding: { left: 10, right: 16 },
    },
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div className="pt-2 pr-6">
        <Bar
          data={data}
          options={options}
          // 막대 폭/간격 조절
          datasetIdKey="id"
        />
      </div>
      <div className="flex w-full justify-around pr-5">
        {labels.map((item, index) => (
          <div
            key={`${item}-${index}`}
            className="text-primary-900 flex h-6 w-6 items-center justify-center rounded-4xl bg-[rgba(255,255,255,0.5)] text-center text-[12px] font-bold"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
