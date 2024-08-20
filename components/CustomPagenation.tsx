import React from "react";
import Pagination from "react-bootstrap/Pagination";

const CustomPagination = ({
  totalItems,
  limit,
  onPageChange,
  currentPage,
  maxSize = 10,
}: any) => {
  const totalPages = Math.ceil(totalItems / limit);

  const handlePageChange = (page) => {
    onPageChange(page);
  };

  // Calculate the range of pages to display
  const getPageRange = () => {
    let startPage = 1;
    let endPage = totalPages;

    if (totalPages > maxSize) {
      if (currentPage <= Math.ceil(maxSize / 2)) {
        // Near the start
        startPage = 1;
        endPage = maxSize;
      } else if (currentPage + Math.floor(maxSize / 2) >= totalPages) {
        // Near the end
        startPage = totalPages - maxSize + 1;
        endPage = totalPages;
      } else {
        // In the middle
        startPage = currentPage - Math.ceil(maxSize / 2) + 1;
        endPage = currentPage + Math.floor(maxSize / 2);
      }
    }

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
  };

  const pages = getPageRange();

  return (
    <Pagination>
      <Pagination.First
        onClick={() => handlePageChange(1)}
        disabled={currentPage === 1}
      />
      <Pagination.Prev
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      />

      {pages.map((page) => (
        <Pagination.Item
          key={page}
          active={page === currentPage}
          onClick={() => handlePageChange(page)}
        >
          {page}
        </Pagination.Item>
      ))}

      <Pagination.Next
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      />
      <Pagination.Last
        onClick={() => handlePageChange(totalPages)}
        disabled={currentPage === totalPages}
      />
    </Pagination>
  );
};

export default CustomPagination;
