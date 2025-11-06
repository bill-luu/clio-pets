import React from "react";
import "./styles/Pagination.css";

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
  showingStart,
  showingEnd,
}) {
  if (totalPages <= 1) {
    return null; // Don't show pagination if there's only one page or no items
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page) => {
    onPageChange(page);
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5; // Show max 5 page numbers at once

    if (totalPages <= maxVisible) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisible - 1);

      // Adjust start if we're near the end
      if (end - start < maxVisible - 1) {
        start = Math.max(1, end - maxVisible + 1);
      }

      // Add first page if not included
      if (start > 1) {
        pages.push(1);
        if (start > 2) {
          pages.push("ellipsis-start");
        }
      }

      // Add pages in range
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add last page if not included
      if (end < totalPages) {
        if (end < totalPages - 1) {
          pages.push("ellipsis-end");
        }
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        Showing {showingStart}-{showingEnd} of {totalItems} pets
      </div>
      <div className="pagination-controls">
        <button
          className="pagination-btn"
          onClick={handlePrevious}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          ← Previous
        </button>
        <div className="pagination-pages">
          {pageNumbers.map((page, index) => {
            if (page === "ellipsis-start" || page === "ellipsis-end") {
              return (
                <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                  ...
                </span>
              );
            }
            return (
              <button
                key={page}
                className={`pagination-page-btn ${
                  currentPage === page ? "active" : ""
                }`}
                onClick={() => handlePageClick(page)}
                aria-label={`Go to page ${page}`}
                aria-current={currentPage === page ? "page" : undefined}
              >
                {page}
              </button>
            );
          })}
        </div>
        <button
          className="pagination-btn"
          onClick={handleNext}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

