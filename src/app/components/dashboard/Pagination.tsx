import styles from './Pagination.module.css';
import clsx from 'clsx';

interface PaginationType {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
}

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
    <nav className="flex items-center gap-4" aria-label="Pagination Navigation">
      {/* 맨 처음으로 << */}
      <button
        disabled={!hasPrev}
        onClick={() => onPageChange(1)}
        className={clsx(
          styles.paginationButton, // 도메인에서 사용하기 위한 클래스는 파일 분리
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
          styles.paginationButton, // 🚩 'pg-btn' 문자열 대신 styles 적용
          hasPrev
            ? 'bg-primary-light text-brand-primary hover:bg-opacity-80 cursor-pointer'
            : 'cursor-not-allowed bg-gray-100 text-gray-300'
        )}
      >
        &lsaquo;
      </button>

      {/* 페이지 번호들 */}
      {totalPage.map((page) => (
        <button
          key={`page-${page}`}
          disabled={currentPage === page}
          onClick={() => onPageChange(page)}
          className={clsx(
            styles.paginationButton, // 🚩 공통 스타일 적용
            'text-[16px]',
            currentPage === page
              ? 'bg-brand-primary font-bold text-white'
              : 'cursor-pointer bg-gray-100 text-gray-600 hover:bg-gray-200'
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
          styles.paginationButton, // 🚩 적용
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
          styles.paginationButton, // 🚩 적용
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
