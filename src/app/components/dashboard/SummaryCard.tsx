import { ReactNode } from 'react';
type MetricPart = { value: number | string; unit?: string };

export interface StatCardProps {
  title: string;
  parts: MetricPart[];
  onClick?: () => void;
  variant?: 'default' | 'highlight';
  isLoading?: boolean;
}

export default function SummaryCard({
  title,
  parts,
  onClick,
  variant,
  isLoading,
}: StatCardProps) {
  return (
    <div
      key={title}
      className="flex h-[124px] flex-col justify-center rounded-3xl bg-white p-8"
    >
      <div className="flex bg-yellow-100 text-[18px] font-semibold text-gray-400">
        {title}
      </div>
      <div className="text-primary-900 mt-2 flex items-baseline justify-end bg-yellow-400">
        {parts.map((item) => (
          <>
            <div className="text-[36px] leading-none font-bold">
              {item.value}
            </div>
            <div className="leading-none">{item.unit}</div>
          </>
        ))}
        {/* <div className="text-[36px] leading-none font-bold">32</div>
        <div className="leading-none">분</div> */}
      </div>
    </div>
  );
}
