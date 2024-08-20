"use client";

import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
// import CodeMirror, { useCodeMirror } from "@uiw/react-codemirror";
import { useCodeMirror } from "@uiw/react-codemirror";
import { StateEffect, StateField } from "@codemirror/state";
import { EditorView, Decoration } from "@codemirror/view";
import { langs } from "@uiw/codemirror-extensions-langs";
import { codeLanguages, codeOuputCompare, download } from "@/lib/common";
import { codeLanguageDisplay } from "@/lib/validator";
import { useSession } from "next-auth/react";
import clientApi from "@/lib/clientApi";
import MathJax from "../mathjax";
import { runCodeForQuestion } from "@/lib/servercies";
import { alert } from "alertifyjs";
import { useTakeTestStore } from "@/stores/take-test-store";
import { fullScreen } from "@/lib/helpers";
import { formatQuestion } from "@/lib/pipe";
import * as questionService from "@/services/questionService";
interface CodeQuestionComponentProps {
  question: any;
  setQuestion: any;
  userAnswers: any;
  practice: any;
  hideRunButton?: any;
  isStage?: boolean;
  answerChanged: (param: any) => void;
}

const CodingQuestion = forwardRef(
  (
    {
      question,
      setQuestion,
      userAnswers,
      practice,
      hideRunButton,
      answerChanged,
      isStage,
    }: CodeQuestionComponentProps,
    ref: any
  ) => {
    const { user } = useSession().data || {};
    const { codingQuestion, updateCodingQuestion, clientData } =
      useTakeTestStore();
    const codeMirrorRef = useRef<any>(null);
    const [selectedLang, setSelectedLang] = useState<any>({ language: "" });
    const [codingLanguages, setCodingLanguages] =
      useState<any[]>(codeLanguages);
    const [sampleTestcases, setSampleTestcases] = useState<any[]>([]);
    const [activeTestcase, setActiveTestcase] = useState<any>();
    const [highlightedLines, setHighlightedLines] = useState<any[]>([]);
    const [isFullscreen, setIsFullScreen] = useState<boolean>(false);
    const [stats, setStats] = useState<any>({});
    const [mode, setMode] = useState<string>("java");
    const [theme, setTheme] = useState<any>("light");
    const [code, setCode] = useState<any>();
    const [initload, setInitLoad] = useState<boolean>(false);

    // useEffect(() => {
    //   if(window.document){
    //     setTimeout(() => {
    //       fullScreen(true, window.document)
    //     }, 1000);
    //   }
    // }, [])

    const addLineHighlight = StateEffect.define();

    const lineHighlightField = StateField.define({
      create() {
        return Decoration.none;
      },
      update(lines, tr) {
        lines = lines.map(tr.changes);
        for (let e of tr.effects) {
          if (e.is(addLineHighlight)) {
            lines = Decoration.none;
            lines = lines.update({ add: [lineHighlightMark.range(e.value)] });
          }
        }
        return lines;
      },
      provide: (f) => EditorView.decorations.from(f),
    });

    const lineHighlightMark = Decoration.line({
      attributes: { style: "background-color: yellow" },
    });

    const { setContainer, view, state } = useCodeMirror({
      container: codeMirrorRef.current,
      extensions: [langs[mode](), lineHighlightField],
      theme: theme,
      value: code,
      height: "550px",
      onChange: (e) => {
        console.log(e);
      },
      basicSetup: {
        lineNumbers: true,
        foldGutter: true,
        autocompletion: true,
      },
    });

    useEffect(() => {
      if (codeMirrorRef.current) {
        setContainer(codeMirrorRef.current);
      }
    }, [codeMirrorRef.current]);

    const clearHighlightedLine = () => {
      const content = window.document.getElementsByClassName("cm-content");
      if (content) {
        highlightedLines.forEach((l) => {
          // Set line css class
          content[0]?.children[l].classList.remove("line-error");
        });
      }
      setHighlightedLines([]);
    };

    const refreshCodeMirror = () => {
      if (codeMirrorRef.current) {
        // codeMirrorRef.current.refresh()
      }
    };

    const onQuestionChanged = (question: any) => {
      if (question && question.category === "code") {
        let newQuestion = question;
        if (!newQuestion.answers[0]) {
          newQuestion.answers.push({});
        }
        let sampleTestCase = [];
        if (newQuestion.testcases) {
          sampleTestCase = newQuestion.testcases.filter((t: any) => t.isSample);
        }
        setActiveTestcase(sampleTestCase.length ? sampleTestCase[0] : null);
        setSampleTestcases(sampleTestCase);
        const defaultLanguages = codeLanguages;

        for (let i = defaultLanguages.length; i > 0; i--) {
          const idx = newQuestion.coding.findIndex(
            (c: any) => c.language == defaultLanguages[i - 1].language
          );

          if (idx === -1) {
            defaultLanguages.splice(i - 1, 1);
          }
        }

        if (!newQuestion?.userCode) {
          newQuestion = { ...newQuestion, userCode: {} };
        }

        // Select first lang as default
        if (!newQuestion?.userCode.selectedLang) {
          newQuestion = {
            ...newQuestion,
            userCode: {
              ...newQuestion?.userCode,
              selectedLang: defaultLanguages[0],
            },
          };
        }

        setMode(newQuestion?.userCode.selectedLang.language);

        let idx = -1;

        newQuestion.coding.forEach((qc: any, qidx: number) => {
          if (!newQuestion?.userCode[qc.language]) {
            // Init user code object with custom input enabled
            const defaultCode: any = { customInput: false };
            if (newQuestion.hasArg) {
              defaultCode.userArgs = newQuestion.testcases[0].args;
            }
            if (newQuestion.hasUserInput) {
              defaultCode.userInput = newQuestion.testcases[0].input;
            }
            newQuestion.userCode[qc.language] = defaultCode;
          }

          if (qc.language == newQuestion?.userCode.selectedLang.language) {
            idx = qidx;
          }
        });

        if (
          !newQuestion?.userCode[newQuestion?.userCode.selectedLang.language]
        ) {
          // Init user code object with custom input enabled
          const defaultCode: any = { customInput: false };
          if (newQuestion.hasArg) {
            defaultCode.userArgs = newQuestion.testcases[0].args;
          }
          if (newQuestion.hasUserInput) {
            defaultCode.userInput = newQuestion.testcases[0].input;
          }
          newQuestion.userCode[newQuestion?.userCode.selectedLang.language] =
            defaultCode;
        }

        if (
          !newQuestion?.userCode[newQuestion?.userCode.selectedLang.language]
            .code
        ) {
          newQuestion.userCode[
            newQuestion?.userCode.selectedLang.language
          ].code = newQuestion.coding[idx].template;
        }

        // Clear stats
        let newstats: any = {};
        newstats[newQuestion?.userCode.selectedLang.language] = {
          compileTime: 0,
          runTime: 0,
          testcasesPassed: 0,
          totalTestcases: newQuestion.testcases?.length
            ? newQuestion.testcases?.length
            : 0,
        };

        if (
          userAnswers &&
          userAnswers.answers &&
          userAnswers.answers[0] &&
          userAnswers.answers[0].testcases
        ) {
          const userA = userAnswers.answers[0];

          newstats[userA.codeLanguage] = {
            compileTime: 0,
            runTime: 0,
            testcasesPassed: 0,
            totalTestcases: userA.testcases.length,
            show: true,
          };

          if (!userA.testcases.length) {
            newstats[userA.codeLanguage].totalTestcases =
              newQuestion.testcases.length;
          }

          newstats[userA.codeLanguage].compileTime = userA.compileTime;

          let testcaseToDisplay: any = null;
          userA.testcases.forEach((c: any) => {
            newstats[userA.codeLanguage].runTime += c.runTime;
            if (c.status) {
              newstats[userA.codeLanguage].testcasesPassed++;
            } else if (!testcaseToDisplay) {
              testcaseToDisplay = c;
            }
          });

          if (!testcaseToDisplay) {
            testcaseToDisplay = userA.testcases[0];
          }

          newstats[userA.codeLanguage].correct =
            newstats[userA.codeLanguage].testcasesPassed ==
            newstats[userA.codeLanguage].totalTestcases;
          newstats[userA.codeLanguage].testcaseToDisplay = testcaseToDisplay;
          if (
            userA.compileMessage != "Compiled Successfully" &&
            userA.compileMessage != "done"
          ) {
            newstats[userA.codeLanguage].compileError = userA.compileMessage;
          }
        }
        setStats(newstats);
        updateCodingQuestion({ ...codingQuestion, stats: newstats });
        console.log(newQuestion, "q");

        setQuestion(newQuestion);
        setCode(
          newQuestion?.userCode[newQuestion?.userCode.selectedLang?.language]
            .code
        );
        setCodingLanguages(defaultLanguages);
        setTimeout(() => {
          updateCodingQuestion({
            ...codingQuestion,
            selectedLang: {
              language: newQuestion?.userCode.selectedLang.language,
            },
          });
          setSelectedLang({
            language: newQuestion?.userCode.selectedLang.language,
          });
        }, 200);

        clearHighlightedLine();
        refreshCodeMirror();
      }
    };

    useEffect(() => {
      onQuestionChanged(question);
    }, [question]);

    const onCodeChanged = (ev) => {
      clearHighlightedLine();
    };

    const onLanguageChanged = (e: any) => {
      updateCodingQuestion({
        ...codingQuestion,
        selectedLang: { language: e.target.value },
      });
      setSelectedLang({ language: e.target.value });
      let newQuestion = question;
      if (newQuestion?.userCode?.selectedLang?.language == e.target.value) {
        return;
      }
      newQuestion = {
        ...newQuestion,
        userCode: {
          ...newQuestion?.userCode,
          selectedLang: codingLanguages.find(
            (l) => l.language == e.target.value
          ),
        },
      };
      // newQuestion?.userCode.selectedLang = codingLanguages.find(l => l.language == e.target.value)
      clearHighlightedLine();

      setMode(newQuestion?.userCode.selectedLang.language);

      if (!newQuestion?.userCode[newQuestion?.userCode.selectedLang.language]) {
        newQuestion.userCode[newQuestion?.userCode.selectedLang.language] = {};
      }

      const idx = newQuestion.coding.findIndex(
        (c: any) => c.language == newQuestion?.userCode.selectedLang.language
      );

      if (
        !newQuestion?.userCode[question?.userCode.selectedLang.language].code
      ) {
        newQuestion.userCode[question?.userCode.selectedLang.language].code =
          newQuestion.coding[idx].template;
      }
      let newStats = stats;
      if (!newStats[newQuestion?.userCode.selectedLang.language]) {
        newStats[newQuestion?.userCode.selectedLang.language] = {
          compileTime: 0,
          runTime: 0,
          testcasesPassed: 0,
          totalTestcases: newQuestion.testcases.length,
        };
      }
      setQuestion(newQuestion);
      setStats(newStats);
      updateCodingQuestion({ ...codingQuestion, stats: newStats });
      refreshCodeMirror();
    };

    const saveCode = () => {
      const fileName = "code." + question?.userCode.selectedLang.language;
      download(
        document,
        fileName,
        "data:text/plain;charset=utf-8," +
        encodeURIComponent(
          question?.userCode[question?.userCode.selectedLang.language].code
        )
      );
    };

    const toggleFullscreen = () => {
      if (codeMirrorRef.current) {
        setIsFullScreen(!isFullscreen);
        console.log(codeMirrorRef.current);
        // codeMirrorRef.current.setOption("fullScreen", isFullscreen);
      }
    };

    const changeCodeTheme = () => {
      setTheme(theme === "light" ? "dark" : "light");
    };

    const trimErrorMessage = (err: string) => {
      return err ? err.replace(/File\s("|\\")\/app\/assets([^,]+),\s/, "") : "";
    };

    const handleHighlightLine = (lineNumber: number) => {
      // Line number is zero based index
      console.log("linenumber: ", state?.doc.line(lineNumber).from);
      const actualLineNumber = lineNumber - 1;
      const content = window.document?.querySelector('[role="textbox"]');
      if (content) {
        console.log("highlightLines: ", actualLineNumber);
        content.children[actualLineNumber].classList.add("line-error");
        setHighlightedLines((prev: any) => [...prev, actualLineNumber]);
      }

      // view?.dispatch({effects: addLineHighlight.of(state?.doc.line(lineNumber).from!)});
    };

    const executeCode = async (q: any) => {
      let quest = q;
      if (quest.processing) {
        return;
      }
      let userCode = quest.userCode[quest.userCode.selectedLang.language];

      if (!quest.answers[0]) {
        quest.answers.push({});
      }
      quest.answers[0].codeLanguage = quest.userCode.selectedLang.language;
      quest.answers[0].code = userCode.code;
      quest.answers[0].isChecked = true;

      if (quest.answers[0].code) {
        // clearHighlightedLine();
        let inputs = quest.testcases.map((t: any) => {
          return {
            input: quest.hasUserInput ? t.input : "",
            args: quest.hasArg ? t.args : "",
          };
        });

        if (userCode.customInput) {
          const input = userCode.userInput ? userCode.userInput : "";
          const arg = userCode.userArgs ? userCode.userArgs : "";
          inputs.push({ input: input, args: arg });
        }

        quest.processing = true;

        let stat = stats;
        stat[quest.answers[0].codeLanguage] = {};
        try {
          const result = await questionService.runCodeForQuestion(
            quest._id,
            quest.answers[0].code,
            inputs,
            quest.answers[0].codeLanguage,
            practice?._id
          );
          quest.processing = false;

          let msg = "";

          quest.answers[0].testcases = [];

          userCode.status = result.output.compileExitCode;
          userCode.compileMessage = result.output.compileMessage.join("\n");

          // for stats
          let totalExecTime = 0;
          let casesPassed = 0;
          let testcaseToDisplay: any = null;
          quest.testcases.forEach((t: any) => {
            const tInput = quest.hasUserInput ? t.input : "";
            const tArg = quest.hasArg ? t.args : "";
            const idx = result.output.result.findIndex((r: any) => {
              return r.input == tInput && r.args == tArg;
            });

            const codeResult = result.output.result[idx];
            totalExecTime += codeResult.runTime;

            let correctCase = false;
            let output = "";
            let error = "";
            if (codeResult.exitCode != 0 && codeResult.err) {
              for (let i = 0; i < codeResult.err.length; i++) {
                msg += "\n" + trimErrorMessage(codeResult.err[i]);
              }
              error = msg;
            } else {
              output = codeResult.out ? codeResult.out.trimEnd() : "";
              correctCase = codeOuputCompare(t.output, output);
            }
            casesPassed += correctCase ? 1 : 0;

            const tc = {
              args: t.args,
              input: t.input,
              output: output,
              expected: t.output,
              runTime: codeResult.runTime,
              status: correctCase,
              error: error,
            };

            quest.answers[0].testcases.push(tc);
            if (!correctCase && !testcaseToDisplay) {
              testcaseToDisplay = tc;
            }
          });

          if (!testcaseToDisplay) {
            testcaseToDisplay = quest.answers[0].testcases[0];
          }
          // Update stats
          stat[quest.userCode?.selectedLang.language] = { show: true };
          stat[quest.userCode?.selectedLang.language].compileTime =
            result.output.compileTime;
          stat[quest.userCode?.selectedLang.language].runTime = totalExecTime;
          stat[quest.userCode?.selectedLang.language].testcasesPassed =
            casesPassed;
          stat[quest.userCode?.selectedLang.language].totalTestcases =
            quest.testcases.length;
          stat[quest.userCode?.selectedLang.language].correct =
            casesPassed === quest.testcases.length;
          stat[quest.userCode?.selectedLang.language].testcaseToDisplay =
            testcaseToDisplay;
          setStats(stat);
          updateCodingQuestion({ ...codingQuestion, stats: stat });
          if (userCode.customInput) {
            const input = userCode.userInput ? userCode.userInput : "";
            const arg = userCode.userArgs ? userCode.userArgs : "";
            const idx = result.output.result.findIndex(
              (r: any) => r.input == input && r.args == arg
            );
            if (idx > -1) {
              const customOutput = result.output.result[idx];
              if (customOutput.err && customOutput.err.length > 0) {
                let msgg = "";
                for (let i = 0; i < customOutput.err.length; i++) {
                  msgg += "\n" + customOutput.err[i];
                }
                userCode.output = msgg.trim();
              } else {
                userCode.output = customOutput.out;
              }
            }
          }

          const answer = {
            codeLanguage: quest.answers[0].codeLanguage,
            code: quest.answers[0].code,
            testcases: quest.answers[0].testcases,
            userInput: userCode.userInput,
            userArgs: userCode.userArgs,
            output: userCode.output,
            compileMessage: userCode.compileMessage,
            status: userCode.status,
            customInput: userCode.customInput,
            compileTime: result.output.compileTime,
          };

          answerChanged({
            question: quest,
            attemptDetailId: result.attemptDetailId || "",
            answer: answer,
          });
        } catch (err: any) {
          quest.processing = false;
          const { data } = err.response;
          if (data && data.output && data.output.err) {
            const lang = quest.userCode.selectedLang.language;

            // Clear old data
            quest.answers[0].testcases = [];
            delete userCode.status;
            delete userCode.output;
            userCode.compileMessage = "";

            if (data && data.output && data.output.err) {
              const output = data.output;
              userCode.status = data.output.status;

              let msg = "";
              for (let i = 0; i < output.err.length; i++) {
                msg += output.err[i];

                if (quest._id === question._id) {
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
                    const lineNum = parseInt(l, 6);
                    if (!isNaN(lineNum)) {
                      handleHighlightLine(lineNum);
                    }
                  });
                }
              }

              userCode.compileMessage = msg;
              let stat = stats;
              // Update stat
              stat[lang] = { show: true };
              stat[lang].compileTime = 0;
              stat[lang].runTime = 0;
              stat[lang].testcasesPassed = 0;
              stat[lang].totalTestcases = quest.testcases.length;

              stat[lang].correct = false;
              stat[lang].compileError = msg;
              setStats(stat);
              updateCodingQuestion({ ...codingQuestion, stats: stat });
            } else {
              // Not compile error? may be code server has been stop
              alert(
                "Message",
                "There was a problem in the coding engine (not your fault)" +
                "Your code has been saved. Coding engine will process your code and update your result later"
              );
            }

            const answer = {
              codeLanguage: quest.answers[0].codeLanguage,
              code: quest.answers[0].code,
              compileMessage: userCode.compileMessage,
              status: userCode.status,
            };

            answerChanged({
              question: quest,
              attemptDetailId: data.attemptDetailId || "",
              answer: answer,
            });
          }
        }
      } else {
        quest.answers[0].answeredText = "";

        const answer = {
          answerId: quest.answers[0]._id,
          answerText: "",
          code: quest.answers[0].code,
        };

        answerChanged({
          question: quest,
          answer: answer,
        });
      }
    };

    const clearCode = () => {
      let quest = question;
      quest.userCode[quest.userCode.selectedLang.language].code = "";
      setQuestion(quest);
      setCode("");
    };
    useImperativeHandle(ref, () => ({
      executeCode(param: any) {
        executeCode(param);
      },
      handleHighlightLine(param: any) {
        handleHighlightLine(param);
      },
      clear() {
        clearCode();
      },
    }));
    return (
      <div style={{ boxSizing: "border-box" }}>
        {practice?.testMode != "learning" ? (
          <div className="coding clearfix">
            <div className="coding-left">
              <div className="p-4 bg-white coding-question-text">
                <div className="question-item">
                  <span>
                    <MathJax
                      value={formatQuestion(
                        clientData?.baseUrl,
                        question?.questionText
                      )}
                    />
                  </span>
                </div>
              </div>
              {sampleTestcases.length && (
                <div className="code-testcases">
                  <h4>Test Case(s): </h4>
                  <div>
                    {sampleTestcases.map((tc: any, idx: number) => (
                      <a
                        key={"sampleTestCase" + idx}
                        className={`bold ${activeTestcase == tc ? "active" : ""
                          }`}
                        onClick={() => setActiveTestcase(tc)}
                      >
                        {idx + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {activeTestcase && (
                <div className="form-row row-cols-2">
                  {question.hasArg && (
                    <div className="item col-12">
                      <h4>Argument</h4>
                      <textarea
                        className="form-control bg-white"
                        value={activeTestcase.args}
                        readOnly
                      ></textarea>
                    </div>
                  )}
                  {question.hasUserInput && (
                    <div className="item col-12">
                      <h4>Input</h4>
                      <textarea
                        className="form-control bg-white"
                        value={activeTestcase.input}
                        readOnly
                      ></textarea>
                    </div>
                  )}

                  <div className="item col-12">
                    <h4>Expected Output</h4>
                    <textarea
                      className="form-control bg-white"
                      value={activeTestcase.output}
                      readOnly
                    ></textarea>
                  </div>
                </div>
              )}
            </div>

            <div className="coding-window">
              <div className="coding-window-title">
                <div className="d-flex align-items-center justify-content-between flex-wrap">
                  <div className="">
                    <h4 className="p-0">Coding Window</h4>
                  </div>

                  <div className="">
                    <div className="button-group ml-auto">
                      <ul className="nav align-items-center">
                        <select
                          name="language"
                          value={selectedLang.language}
                          onChange={(e: any) => onLanguageChanged(e)}
                        >
                          {codeLanguages.map((lang: any, index: number) => (
                            <option key={index} value={lang.language}>
                              {lang.display}
                            </option>
                          ))}
                        </select>

                        <li
                          className="download-btn bg-white"
                          data-toggle="tooltip"
                          data-placement="top"
                          title="Download Code"
                        >
                          <a onClick={saveCode}>
                            <figure>
                              <img
                                src="/assets/images/download-icon.png"
                                alt=""
                              />
                            </figure>
                          </a>
                        </li>

                        <li
                          className="window-btn bg-white"
                          data-toggle="tooltip"
                          data-placement="top"
                          title="Full Screen"
                        >
                          <a onClick={toggleFullscreen}>
                            <figure>
                              <img
                                src="/assets/images/window-icon.png"
                                alt=""
                              />
                            </figure>
                          </a>
                        </li>

                        <li className="moon-btn">
                          <a onClick={changeCodeTheme}>
                            <figure
                              className="moon"
                              data-toggle="tooltip"
                              data-placement="top"
                              title="Change Theme"
                            >
                              <img src="/assets/images/icon-moon.png" alt="" />
                            </figure>

                            <figure
                              className="light"
                              data-toggle="tooltip"
                              data-placement="top"
                              title="Change Theme"
                            >
                              <img src="/assets/images/light.png" alt="" />
                            </figure>
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="coding-window-textfield">
                {/* <CodeMirror
                  value={code}
                  placeholder="Please enter the JavaScript code."
                  extensions={[langs[mode]()]}
                  basicSetup={{
                    lineNumbers: true,
                    foldGutter: true,
                    autocompletion: true,
                  }}

                  theme={theme}
                /> */}
                <div ref={codeMirrorRef} id="codemirror"></div>
                {/* <ngx-codemirror style="overflow-y: scroll;" #code_source (ngModelChange)="onCodeChanged($event)"
                  [(ngModel)]="question?.userCode[question?.userCode.selectedLang?.language].code"
                  [options]="codemirrorConfig"></ngx-codemirror> */}
              </div>
            </div>
            <div className="CustominputExapand-DesignChange">
              {(question.hasArg || question.hasUserInput) &&
                !!question?.userCode && (
                  <div className="ml-2 mt-2 mb-3">
                    <label className="container2 d-inline">
                      Provide Custom Input
                      <input
                        type="checkbox"
                        id="customInput"
                        name="customInput"
                        checked={
                          question?.userCode[
                            question?.userCode?.selectedLang.language
                          ].customInput
                        }
                        onChange={(e) => {
                          let newQuestion = question;
                          newQuestion.userCode[
                            question?.userCode?.selectedLang.language
                          ].customInput = e.target.checked;
                          onQuestionChanged(newQuestion);
                        }}
                      />
                      <span className="checkmark1 translate-middle-y"></span>
                    </label>
                  </div>
                )}
              {question?.userCode?.selectedLang?.language &&
                question?.userCode[question?.userCode?.selectedLang?.language]
                  .customInput && (
                  <div className="form-row row-cols-2">
                    {question.hasArg && (
                      <div className="item col">
                        <h4>Your Argument</h4>
                        <textarea
                          className="form-control inputCustomusEr"
                          value={
                            question?.userCode[
                              question?.userCode?.selectedLang.language
                            ].userArgs
                          }
                          onChange={(e: any) => {
                            let newQuestion = question;
                            newQuestion.userCode[
                              question?.userCode?.selectedLang.language
                            ].userArgs = e.target.value;
                            onQuestionChanged(newQuestion);
                          }}
                        ></textarea>
                      </div>
                    )}
                    {question.hasUserInput && (
                      <div className="item col">
                        <h4>Your Input</h4>
                        <textarea
                          className="form-control inputCustomusEr"
                          onChange={(e: any) => {
                            const newQuestion = question;
                            newQuestion.userCode[
                              question?.userCode.selectedLang.language
                            ].userInput = e.target.value;
                            onQuestionChanged(newQuestion);
                          }}
                          value={
                            question?.userCode[
                              question?.userCode?.selectedLang.language
                            ].userInput
                          }
                        ></textarea>
                      </div>
                    )}
                    <div className="item col">
                      <h4>Your Output</h4>
                      <textarea
                        className="form-control bg-white inputCustomusEr"
                        value={
                          question?.userCode[
                            question?.userCode.selectedLang.language
                          ].output
                        }
                        readOnly
                      ></textarea>
                    </div>
                  </div>
                )}
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-boxes bg-light mb-3">
              <div className="question-item">
                <span>
                  <MathJax value={question?.questionText} />
                </span>
              </div>
            </div>

            <div className="rounded-boxes bg-light">
              <div className="form-row row-cols-2">
                {question?.hasArg && (
                  <div className="item col">
                    <h4>Expected Argument</h4>
                    <textarea
                      className="form-control bg-white"
                      value={question.testcases[0].args}
                      readOnly
                    ></textarea>
                  </div>
                )}
                {question.hasUserInput && (
                  <div className="item col">
                    <h4>Expected Input</h4>
                    <textarea
                      className="form-control bg-white"
                      value={question.testcases[0].input}
                      readOnly
                    ></textarea>
                  </div>
                )}

                <div className="item col">
                  <h4>Expected Output</h4>
                  <textarea
                    className="form-control bg-white"
                    value={question.testcases[0].output}
                    readOnly
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="rounded-boxes bg-light">
              <div className="coding-window-title">
                <div className="d-flex align-items-center justify-content-between flex-wrap">
                  <div className="">
                    <h4 className="p-0">Coding Window</h4>
                  </div>

                  <div className="">
                    <div className="button-group ml-auto">
                      <ul className="nav align-items-center">
                        <select
                          name="language"
                          value={selectedLang.language}
                          onChange={(e: any) => onLanguageChanged(e)}
                        >
                          {codingLanguages.map((lang: any, index: number) => (
                            <option key={index} value={lang.language}>
                              {lang.display}
                            </option>
                          ))}
                        </select>

                        <li className="download-btn bg-white">
                          <a onClick={saveCode}>
                            <figure>
                              <img
                                src="/assets/images/download-icon.png"
                                alt=""
                              />
                            </figure>
                          </a>
                        </li>

                        <li className="window-btn bg-white">
                          <a onClick={toggleFullscreen}>
                            <figure>
                              <img
                                src="/assets/images/window-icon.png"
                                alt=""
                              />
                            </figure>
                          </a>
                        </li>

                        <li className="moon-btn">
                          <a onClick={changeCodeTheme}>
                            <figure className="moon">
                              <img src="/assets/images/icon-moon.png" alt="" />
                            </figure>

                            <figure className="light">
                              <img src="/assets/images/light.png" alt="" />
                            </figure>
                          </a>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="coding-window-textfield">
                <div ref={codeMirrorRef} id="codemirror"></div>
                {/* <ngx-codemirror style="overflow-y: scroll;" #code_source
                  [(ngModel)]="question?.userCode[question?.userCode.selectedLang?.language].code"
                  [options]="codemirrorConfig"></ngx-codemirror> */}
              </div>
            </div>
            {/* {isStage && ( */}
            <div className="rounded-boxes bg-light">
              <div className="d-flex justify-content-between align-items-center">
                <div className="">
                  {(question.hasArg || question.hasUserInput) && (
                    <div>
                      <label className="container2 d-inline">
                        Provide Custom Input
                        <input
                          type="checkbox"
                          id="customInput"
                          name="customInput"
                          onChange={(e: any) => {
                            let newQuestion = question;
                            newQuestion.userCode[
                              question?.userCode?.selectedLang.language
                            ].customInput = e.target.value;
                            onQuestionChanged(newQuestion);
                          }}
                        />
                        <span className="checkmark1 translate-middle-y"></span>
                      </label>
                    </div>
                  )}
                </div>
                {/* {!hideRunButton && ( */}
                <div className="">
                  <button
                    className={`btn btn-danger float-right ${question.processing ? "disabled" : ""
                      }`}
                    onClick={() => executeCode(question)}
                  >
                    Run Code{" "}
                    {question.processing && (
                      <i className="fa fa-spinner fa-pulse"></i>
                    )}
                  </button>
                </div>
                {/* )} */}
              </div>
            </div>

            {(question.hasArg || question.hasUserInput) && !hideRunButton && (
              <div className="rounded-boxes bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="">
                    {(question.hasArg || question.hasUserInput) && (
                      <div>
                        <label className="container2 d-inline">
                          Provide Custom Input
                          <input
                            type="checkbox"
                            id="customInput"
                            name="customInput"
                            onChange={(e: any) => {
                              let newQuestion = question;
                              newQuestion.userCode[
                                question?.userCode?.selectedLang.language
                              ].customInput = e.target.value;
                              onQuestionChanged(newQuestion);
                            }}
                          />
                          <span className="checkmark1 translate-middle-y"></span>
                        </label>
                      </div>
                    )}
                  </div>
                  {!hideRunButton && (
                    <div className="">
                      <button
                        className={`btn btn-danger float-right ${question.processing ? "disabled" : ""
                          }`}
                        onClick={() => executeCode(question)}
                      >
                        Run Code{" "}
                        {question.processing && (
                          <i className="fa fa-spinner fa-pulse"></i>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            {question?.userCode &&
              question?.userCode[
                question?.userCode
                  ? question?.userCode?.selectedLang.language
                  : 0
              ]?.customInput && (
                <div className="rounded-boxes bg-light">
                  <div className="form-row row-cols-2">
                    {question.hasArg && (
                      <div className="item col">
                        <h4>Your Argument</h4>
                        <textarea
                          className="form-control"
                          onChange={(e: any) => {
                            let newQuestion = question;
                            newQuestion.userCode[
                              question?.userCode?.selectedLang.language
                            ].userArgs = e.target.value;
                            onQuestionChanged(newQuestion);
                          }}
                          value={
                            question?.userCode[
                              question?.userCode?.selectedLang.language
                            ].userArgs
                          }
                        ></textarea>
                      </div>
                    )}
                    {question.hasUserInput && (
                      <div className="item col">
                        <h4>Your Input</h4>
                        <textarea
                          className="form-control"
                          onChange={(e: any) => {
                            let newQuestion = question;
                            newQuestion.userCode[
                              question?.userCode?.selectedLang.language
                            ].userInput = e.target.value;
                            onQuestionChanged(newQuestion);
                          }}
                          value={
                            question?.userCode[
                              question?.userCode?.selectedLang.language
                            ].userInput
                          }
                        ></textarea>
                      </div>
                    )}
                    <div className="item col">
                      <h4>Your Output</h4>
                      <textarea
                        className="form-control bg-white"
                        value={
                          question?.userCode[
                            question?.userCode?.selectedLang.language
                          ].output
                        }
                        readOnly
                      ></textarea>
                    </div>
                  </div>
                </div>
              )}
          </>
        )}
        {isFullscreen && (
          <div>
            <button className="btn fullscreen-off" onClick={toggleFullscreen}>
              <img src="/assets/images/window-icon.png" alt="" />
            </button>
          </div>
        )}
      </div>
    );
  }
);

CodingQuestion.displayName = "CodingQuestion";

export default CodingQuestion;
