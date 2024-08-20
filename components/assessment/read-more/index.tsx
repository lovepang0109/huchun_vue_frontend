import { useState } from "react";

export default function ReadMore(children: any) {
  const [isCopllapsed, setIsCollapsed] = useState<boolean>(true);
  return (
    <div>
      {isCopllapsed && (
        <div style={{ height: "65px", overflow: "hidden" }}>
          <div></div>
        </div>
      )}
      {isCopllapsed && (
        <a
          className="pull-right mt-1"
          onClick={() => setIsCollapsed(!isCopllapsed)}
        >
          Read more
        </a>
      )}
      {!isCopllapsed && (
        <a
          className="pull-right mt-1"
          onClick={() => setIsCollapsed(!isCopllapsed)}
        >
          Read less
        </a>
      )}
      {children}
    </div>
  );
}
