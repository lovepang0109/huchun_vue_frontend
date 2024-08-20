import React, { useState, useEffect, useRef } from "react";
import { alert, success, error, confirm } from "alertifyjs";
import * as favorSvc from "@/services/favaorite-service";
import * as courseSvc from "@/services/courseService";
import * as seriesSvc from "@/services/testseriesService";
import { useRouter } from "next/navigation";

const AppSubjects = ({ subjects }: any) => {
  const [more, setMore] = useState<string>("");

  useEffect(() => {
    if (subjects && subjects.length > 1) {
      setMore(
        subjects
          .slice(1)
          .map((s) => s.name)
          .join(";  ")
      );
    }
  }, []);

  return (
    <div className="subject-name">
      {subjects?.length > 0 && (
        <p>
          {subjects[0].name}
          {subjects.length > 1 && (
            <span className="cursor-pointer" data-toggle="tooltip" title={more}>
              {" "}
              + {subjects.length - 1} more
            </span>
          )}
        </p>
      )}
    </div>
  );
};

export default AppSubjects;
