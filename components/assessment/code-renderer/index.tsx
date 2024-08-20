import { useEffect, useRef } from "react";
import hljs from "highlight.js";

interface props {
  code: any;
  language: any;
}

const CodeRenderer = ({ code, language }: props) => {
  const ref = useRef<any>(null);
  useEffect(() => {
    setTimeout(() => {
      if (language) {
        ref.current.querySelectorAll("code").forEach((codeEle: any) => {
          codeEle.classList.add("language-" + language);
        });

        ref.current.querySelectorAll("pre > code").forEach((block: any) => {
          hljs.highlightBlock(block);
        });
      } else {
        ref.current.querySelectorAll("pre > code").forEach((block: any) => {
          hljs.highlightBlock(block);
        });
      }
    }, 1000);
  }, [ref]);
  return (
    <div>
      <pre>
        <code
          dangerouslySetInnerHTML={{
            __html: code,
          }}
          className="code-light"
          ref={ref}
        ></code>
      </pre>
    </div>
  );
};

export default CodeRenderer;
