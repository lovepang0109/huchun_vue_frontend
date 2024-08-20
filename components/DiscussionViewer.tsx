import React, { useEffect, useState } from "react";
import MathJax from "@/components/assessment/mathjax";

const DiscussionViewer = ({ content }: any) => {
  const [contents, setContents] = useState<string>(content);
  const [discussion, setDiscussion] = useState<string>("");
  useEffect(() => {
    const p = content.includes("<p>");
    if (!p) {
      setContents("<p>" + content.toString() + "</p>");
    } else {
      setContents(content);
    }

    processDiscussion();
  }, []);

  const onClick = (evt: any) => {
    // if (evt.srcElement && evt.srcElement.innerText) {
    //   this.tagClick.emit(evt.srcElement.innerText)
    // }
  };

  const processDiscussion = () => {
    if (contents) {
      setContents(
        contents.replace(
          /(^|\s)(#[a-zA-Z\d][\w-]*)/gi,
          "$1<a href='#' onclick='return false;'>$2</a>"
        )
      );
    }
    setDiscussion(contents);
  };

  return <MathJax className="max-with-image word-break-w" value={discussion} />;
};

export default DiscussionViewer;
