import React from "react";

const MathJax = ({ value, className }: { value: any; className?: string }) => {
  return (
    <div
      className={`mathjax-container ck-content ${className}`}
      // style={{ fontSize: 12 }}
      dangerouslySetInnerHTML={{
        __html: value,
      }}
    ></div>
  );
};

export default React.memo(MathJax);
