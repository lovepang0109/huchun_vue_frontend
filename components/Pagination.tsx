import React from "react";

const PaginationComponent = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
}: any) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const pages = [];

  // Generate page numbers
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <nav aria-label="Page navigation">
      <ul className="pagination">
        {pages.map((page) => (
          <li
            key={page}
            className={`page-item ${page === currentPage ? "active" : ""}`}
          >
            <button className="page-link" onClick={() => onPageChange(page)}>
              {page}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default PaginationComponent;
