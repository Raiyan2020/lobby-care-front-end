'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

type PaginationItem = number | 'start-ellipsis' | 'end-ellipsis';

interface CompactPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  dir: 'rtl' | 'ltr';
  isArabic: boolean;
  isLoading?: boolean;
}

function getPaginationItems(currentPage: number, totalPages: number): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: PaginationItem[] = [1];
  let start = Math.max(2, currentPage - 1);
  let end = Math.min(totalPages - 1, currentPage + 1);

  if (currentPage <= 4) {
    start = 2;
    end = 5;
  } else if (currentPage >= totalPages - 3) {
    start = totalPages - 4;
    end = totalPages - 1;
  }

  if (start > 2) items.push('start-ellipsis');
  for (let page = start; page <= end; page += 1) items.push(page);
  if (end < totalPages - 1) items.push('end-ellipsis');

  items.push(totalPages);
  return items;
}

export function CompactPagination({
  currentPage,
  totalPages,
  onPageChange,
  dir,
  isArabic,
  isLoading = false,
}: CompactPaginationProps) {
  if (totalPages <= 1) return null;

  const items = getPaginationItems(currentPage, totalPages);
  const PreviousIcon = dir === 'rtl' ? ChevronRight : ChevronLeft;
  const NextIcon = dir === 'rtl' ? ChevronLeft : ChevronRight;

  return (
    <nav
      aria-label={isArabic ? 'التنقل بين صفحات المنتجات' : 'Product pages'}
      className="mt-12 flex flex-col items-center gap-3"
    >
      <div className="inline-flex max-w-full items-center gap-1 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-sm dark:border-white/10 dark:bg-neutral-900">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1 || isLoading}
          aria-label={isArabic ? 'الصفحة السابقة' : 'Previous page'}
          className="flex size-9 shrink-0 items-center justify-center rounded-xl text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-35 dark:text-gray-300 dark:hover:bg-neutral-800"
        >
          <PreviousIcon className="size-4" />
        </button>

        {items.map((item) => {
          if (typeof item !== 'number') {
            return (
              <span
                key={item}
                aria-hidden="true"
                className="flex size-8 shrink-0 items-center justify-center text-sm font-bold text-gray-400"
              >
                …
              </span>
            );
          }

          const isActive = item === currentPage;
          return (
            <button
              type="button"
              key={item}
              onClick={() => onPageChange(item)}
              disabled={isLoading}
              aria-label={isArabic ? `الصفحة ${item}` : `Page ${item}`}
              aria-current={isActive ? 'page' : undefined}
              className={`flex size-8 shrink-0 items-center justify-center rounded-xl text-xs font-black transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                isActive
                  ? 'text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-neutral-800'
              }`}
              style={isActive ? { backgroundColor: 'var(--store-secondary-color)' } : undefined}
            >
              {item}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || isLoading}
          aria-label={isArabic ? 'الصفحة التالية' : 'Next page'}
          className="flex size-9 shrink-0 items-center justify-center rounded-xl text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-35 dark:text-gray-300 dark:hover:bg-neutral-800"
        >
          <NextIcon className="size-4" />
        </button>
      </div>

      <p className="text-center text-xs font-medium text-gray-400" aria-live="polite">
        {isArabic ? `صفحة ${currentPage} من ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
      </p>
    </nav>
  );
}
