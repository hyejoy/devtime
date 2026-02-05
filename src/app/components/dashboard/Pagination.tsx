/* Pagenation.tsx (가급적 파일명도 Pagination.tsx로 변경 추천) */

import { Pagination as PaginationType } from '@/app/(header)/dashboard/page';
import clsx from 'clsx';

interface PaginationProps extends PaginationType {
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  hasNext,
  hasPrev,
  onPageChange,
}: PaginationProps) {
  if (!totalItems) return null;

  const totalPage = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className={clsx('flex items-center gap-4')}>
      {/* 맨 처음으로 <<*/}
      <button
        disabled={!hasPrev}
        onClick={() => onPageChange(1)}
        className={clsx(
          'pg-btn',
          hasPrev
            ? 'bg-primary-light text-brand-primary hover:bg-opacity-80 cursor-pointer'
            : 'cursor-not-allowed bg-gray-100 text-gray-300'
        )}
      >
        &laquo;
      </button>

      {/* 이전으로 < */}
      <button
        disabled={!hasPrev}
        onClick={() => onPageChange(currentPage - 1)}
        className={clsx(
          'pg-btn',
          hasPrev
            ? 'bg-primary-light text-brand-primary hover:bg-opacity-80 cursor-pointer'
            : 'cursor-not-allowed bg-gray-100 text-gray-300'
        )}
      >
        &lsaquo;
      </button>

      {totalPage.map((page) => (
        <button
          disabled={currentPage === page}
          key={`page-${page}`}
          onClick={() => onPageChange(page)} // 클릭 이벤트 연결
          className={clsx(
            // 공통 스타일
            'flex h-6 w-6 cursor-pointer items-center justify-center rounded-sm text-[16px] transition-colors',
            // 조건부 스타일 (활성화 상태)
            currentPage === page
              ? 'bg-brand-primary font-bold text-white' // 선택되었을 때
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200' // 선택되지 않았을 때
          )}
        >
          {page}
        </button>
      ))}

      {/* 다음으로 > */}
      <button
        disabled={!hasNext}
        onClick={() => onPageChange(currentPage + 1)}
        className={clsx(
          'pg-btn',
          hasNext
            ? 'bg-primary-light text-brand-primary hover:bg-opacity-80 cursor-pointer'
            : 'cursor-not-allowed bg-gray-100 text-gray-300'
        )}
      >
        &rsaquo;
      </button>
      {/* 맨 끝으로 >> */}
      <button
        disabled={!hasNext}
        onClick={() => onPageChange(totalPages)}
        className={clsx(
          'pg-btn',
          hasNext
            ? 'bg-primary-light text-brand-primary hover:bg-opacity-80 cursor-pointer'
            : 'cursor-not-allowed bg-gray-100 text-gray-300'
        )}
      >
        &raquo;
      </button>
    </nav>
  );
}
