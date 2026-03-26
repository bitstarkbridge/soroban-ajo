import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const visiblePages = 5;
  const pages: number[] = [];

  const start = Math.max(1, currentPage - Math.floor(visiblePages / 2));
  const end = Math.min(totalPages, start + visiblePages - 1);

  for (let i = start; i <= end; i++) pages.push(i);

  const btnBase =
    "px-3 py-1.5 rounded text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1";
  const btnActive = "bg-blue-600 text-white aria-[current=page]:font-bold";
  const btnDefault = "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800";
  const btnDisabled = "opacity-40 cursor-not-allowed";

  return (
    <nav aria-label="Pagination" className="flex justify-center gap-1 mt-4">
      <button
        disabled={currentPage === 1}
        aria-disabled={currentPage === 1}
        aria-label="Go to previous page"
        onClick={() => onPageChange(currentPage - 1)}
        className={`${btnBase} ${currentPage === 1 ? btnDisabled : btnDefault}`}
      >
        Prev
      </button>

      {start > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            aria-label="Go to page 1"
            className={`${btnBase} ${btnDefault}`}
          >
            1
          </button>
          {start > 2 && <span aria-hidden="true" className="px-2 py-1.5 text-gray-400">…</span>}
        </>
      )}

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          aria-label={`Go to page ${page}`}
          aria-current={currentPage === page ? "page" : undefined}
          className={`${btnBase} ${currentPage === page ? btnActive : btnDefault}`}
        >
          {page}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span aria-hidden="true" className="px-2 py-1.5 text-gray-400">…</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            aria-label={`Go to page ${totalPages}`}
            className={`${btnBase} ${btnDefault}`}
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        disabled={currentPage === totalPages}
        aria-disabled={currentPage === totalPages}
        aria-label="Go to next page"
        onClick={() => onPageChange(currentPage + 1)}
        className={`${btnBase} ${currentPage === totalPages ? btnDisabled : btnDefault}`}
      >
        Next
      </button>
    </nav>
  );
};

export default Pagination;
