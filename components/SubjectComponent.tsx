import React, { useState, useEffect } from "react";

const SubjectComponent = ({ subjects }: any) => {
  const [more, setMore] = useState<string>("");

  useEffect(() => {
    if (subjects && subjects.length > 1) {
      setMore(
        subjects
          .slice(1)
          .map((s) => s.name)
          .join("; ")
      );
    }
  }, [subjects]); // Added subjects to the dependency array

  return (
    <div className="subject-name">
      {subjects && subjects.length > 0 && (
        <>
          {subjects[0].name}
          {subjects.length > 1 && (
            <span className="cursor-pointer" data-toggle="tooltip" title={more}>
              {" "}
              + {subjects.length - 1} more{" "}
            </span>
          )}
        </>
      )}
    </div>
  );
};

export default SubjectComponent;
