import { useState, useRef } from "react";
import MathJax from "@/components/assessment/mathjax";
import { formatQuestion } from "@/lib/pipe";
import { useTakeTestStore } from "@/stores/take-test-store";
import { success } from "alertifyjs";
import { runCode } from "@/lib/helpers";
import CodeMirror from "@uiw/react-codemirror";

const ContentRenderer = ({ _content }: { _content: any }) => {
  const codeElement: any = useRef(null);
  const { clientData } = useTakeTestStore();
  const [content, setContent] = useState<any>(_content);
  const [highlightedLines, setHighlightedLines] = useState<any[]>([]);
  const [isFullscreen, setIsFullScreen] = useState<boolean>(false);

  const copyCode = (codeItem: any) => {
    navigator.clipboard.writeText(codeItem.code);
    success("Code is copied to your clipboard");
  };

  const toggleFullscreen = () => {
    if (codeElement.current) {
      setIsFullScreen(!isFullscreen);
    }
  };

  const clearHighlightedLine = () => {
    if (codeElement.current) {
      highlightedLines.forEach((l) => {
        // Set line css class
        codeElement.current.editor.removeLineClass(
          l,
          "background",
          "line-error"
        );
      });
    }

    // highlightedLines = []
  };

  const trimErrorMessage = (err: string) => {
    return err ? err.replace(/File\s("|\\")\/app\/assets([^,]+),\s/, "") : "";
  };

  const highlightLine = (lineNumber: any) => {
    // Line number is zero based index
    const actualLineNumber = lineNumber - 1;

    // Select editor loaded in the DOM
    if (codeElement) {
      codeElement.current.editor.addLineClass(
        actualLineNumber,
        "background",
        "line-error"
      );
      setHighlightedLines([...highlightedLines, actualLineNumber]);
    }
  };
  const execute = async (codeEle: any) => {
    clearHighlightedLine();

    codeEle.running = true;
    const code = codeEle.showSolution ? codeEle.solution : codeEle.code;
    try {
      const { data } = await runCode(
        {
          useTestFramework: false,
          language: codeEle.language,
        },
        code,
        [
          {
            args: codeEle.args,
            input: codeEle.input,
          },
        ]
      );
      codeEle.compilerSubscription = data;

      codeEle.running = false;
      const output = data.output;
      if (output && output.result && output.result[0]) {
        if (output.result[0].exitCode != 0 && output.result[0].err) {
          let msg = "";
          for (const err of output.result[0].err) {
            msg += trimErrorMessage(err) + "\n";

            // Extract the line number
            let lines = [];
            if (err.indexOf("\n") > -1) {
              lines = err.split("\n");
            } else {
              lines.push(err);
            }
            lines.forEach((l: any) => {
              if (l.startsWith("In function")) {
                const idx = l.indexOf(":");
                if (idx > -1) {
                  l = l.substring(idx).replace(":", "");
                }
              }

              const lineNum = parseInt(l.replace(/.*line\s(\d)/, "$1"));
              if (!isNaN(lineNum)) {
                highlightLine(lineNum);
              }
            });
          }
          codeEle.output = msg;
        } else {
          codeEle.output = output.result[0].out
            ? output.result[0].out.trimEnd()
            : "";
        }
      }
    } catch (error: any) {
      codeEle.running = false;

      const data = error.error;
      if (data && data.output && data.output.err) {
        const output = data.output;
        let msg = "";
        for (let i = 0; i < output.err.length; i++) {
          msg += output.err[i];

          // Extract the line number
          let lines = [];
          if (output.err[i].indexOf("\n") > -1) {
            lines = output.err[i].split("\n");
          } else {
            lines.push(output.err[i]);
          }
          lines.forEach((l: any) => {
            if (l.startsWith("In function")) {
              const idx = l.indexOf(":");
              if (idx > -1) {
                l = l.substring(idx).replace(":", "");
              }
            }
            const lineNum = parseInt(l);
            if (!isNaN(lineNum)) {
              highlightLine(lineNum);
            }
          });
        }
        codeEle.output = msg;
      }
    } finally {
      codeEle.showOutput = true;
    }
  };

  const showHideSolution = (e: any) => {};

  const cancel = (codeEle: any) => {
    if (codeEle.compilerSubscription) {
      codeEle.compilerSubscription.unsubscribe();
      codeEle.compilerSubscription = null;
    }
    codeEle.running = false;
  };

  const clearOutput = (codeEle: any) => {
    codeEle.output = "";
  };

  return (
    <>
      <div>
        {content.map((e: any, i: number) => (
          <div key={"content" + i}>
            {e.type === "text" && (
              <MathJax className="text-element" value={e.data} />
            )}
            {e.type === "code" && (
              <div className={`code-element ${i > 0 ? "my-4" : "my-1"}`}>
                <div
                  className="px-1 py-2 mb-1"
                  style={{ background: "#f7f7f7" }}
                >
                  <div className="d-flex align-items-center justify-content-end">
                    <div
                      className="mr-3"
                      data-toggle="tooltip"
                      data-placement="top"
                      title="Copy the code"
                    >
                      <a onClick={() => copyCode(e.data)}>
                        <span className="material-icons align-bottom">
                          content_copy
                        </span>
                      </a>
                    </div>

                    <div
                      className="mr-2"
                      data-toggle="tooltip"
                      data-placement="top"
                      title="Full Screen"
                    >
                      <a onClick={toggleFullscreen}>
                        <figure>
                          <img src="/assets/images/window-icon.png" alt="" />
                        </figure>
                      </a>
                    </div>
                  </div>
                </div>
                {!e.data.showSolution ? (
                  <CodeMirror
                    value={e.data.code}
                    options={e.data.options}
                    ref={codeElement}
                  />
                ) : (
                  <CodeMirror
                    value={e.data.showSolution}
                    options={{
                      readOnly: "nocursor",
                      lineNumbers: true,
                      theme: "default",
                      lineWrapping: true,
                      mode: e.data.options.mode,
                      foldGutter: true,
                      gutters: [
                        "CodeMirror-linenumbers",
                        "CodeMirror-foldgutter",
                      ],
                    }}
                  />
                )}
                <div className="row mt-2">
                  <div className="col">
                    <button
                      className={`btn btn-nofocus pb-0 border-top-0 border-left-0 border-right-0 px-0 ${
                        e.data.hasInput ? "border-dark" : ""
                      }`}
                      name={`ele_input_${i}`}
                      onClick={() =>
                        setContent((prev: any) => ({
                          ...prev,
                          data: { ...prev.data, hasInput: !prev.data.hasInput },
                        }))
                      }
                    >
                      Input
                    </button>
                    <button
                      className={`btn btn-nofocus pb-0 border-top-0 border-left-0 border-right-0 ml-3 px-0 ${
                        e.data.hasArgs ? "border-dark" : ""
                      }`}
                      name={`ele_arg_${i}`}
                      onClick={() =>
                        setContent((prev: any) => ({
                          ...prev,
                          data: { ...prev.data, hasArgs: !prev.data.hasArgs },
                        }))
                      }
                    >
                      Args
                    </button>
                  </div>
                  {e.data.solution && (
                    <div className="col">
                      <input
                        id="ele_{{i}}"
                        type="checkbox"
                        value={e.data.showSolution}
                        className="chk-normal"
                        onChange={(e: any) => showHideSolution(e)}
                      />
                      <label>Solution</label>
                    </div>
                  )}

                  <div className="col text-right">
                    {e.data.running && (
                      <button
                        onClick={() => cancel(e.data)}
                        className="btn btn-link"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={() => execute(e.data)}
                      className="btn btn-primary"
                      disabled={e.data.running}
                    >
                      {" "}
                      Run
                    </button>
                  </div>
                </div>

                <div className="row mt-2">
                  {e.data.hasInput && (
                    <div className="col">
                      <textarea
                        className="form-control"
                        value={e.data.input}
                        placeholder="Your input..."
                      ></textarea>
                    </div>
                  )}
                  {e.data.hasArgs && (
                    <div className="col">
                      <textarea
                        className="form-control"
                        value="e.data.args"
                        placeholder="Your arguments..."
                      ></textarea>
                    </div>
                  )}
                </div>
                {e.data.showOutput && (
                  <div>
                    <div className="d-flex justify-content-left">
                      <label>Output</label>
                      {e.data.output && (
                        <button
                          className="btn btn-link py-0 ml-2"
                          onClick={() => clearOutput(e.data)}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <textarea
                      className="form-control"
                      value={e.data.output}
                      readOnly
                      rows={3}
                    ></textarea>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      {isFullscreen && (
        <div>
          <button className="btn fullscreen-off" onClick={toggleFullscreen}>
            <img src="/assets/images/window-icon.png" alt="" />
          </button>
        </div>
      )}
    </>
  );
};

export default ContentRenderer;
