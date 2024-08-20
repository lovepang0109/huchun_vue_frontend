import React, { useEffect, useState, useRef } from "react";
import { alert, success, error, confirm } from "alertifyjs";
import { Coding } from "@/interfaces/interface";
import * as questionSvc from "@/services/question-service";
import * as adminSvc from "@/services/adminService";
import { CKEditorCustomized } from "@/components/CKEditorCustomized";
import {
  getCodeLanguages,
  testcaseToString,
  codeOuputCompare,
} from "@/lib/helpers";
import Multiselect from "multiselect-react-dropdown";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import CodeMirror from "@uiw/react-codemirror";
import EidtTestCaseModal from "./EidtTestCaseModal";
import AudioRecordComponent from "./AudioRecordComponent";
import { TagsInput } from "react-tag-input-component";
import { createTheme } from "@uiw/codemirror-themes";
import { tags as t } from "@lezer/highlight";
import { okaidia } from "@uiw/codemirror-theme-okaidia";
import { javascript } from "@codemirror/lang-javascript";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { python } from "@codemirror/lang-python";
const CodingQuestionComponent = ({
  question,
  setQuestion,
  submitted,
  settings,
  cancelQuestion,
  saveQuestion,
  presave,
  currentStep,
  setCurrentStep,
  onCkeditorReady,
  canNavigate,
  cancel,
  save,
  next,
  processing,
  setProcessing,
  saveAndNext,
  user,
  onQuestionChanged,
  reset,
  instructionFileUploadClick,
  questionFileUploadClick,
  removeAnswer,
  addAnswer,
}: any) => {
  const codeSrc = useRef<any>(null);
  const [isNew, setIsNew] = useState<boolean>(true);
  const [isTouched, setIsTouched] = useState(false);
  const [myTheme, setMyTheme] = useState<any>(
    createTheme({
      theme: "light",
      settings: {
        background: "#ffffff",
        backgroundImage: "",
        // foreground: "#75baff",
        caret: "#5d00ff",
        selection: "#036dd626",
        selectionMatch: "#036dd626",
        lineHighlight: "#8a91991a",
        gutterBackground: "#fff",
        gutterForeground: "#8a919966",
      },
      styles: [
        { tag: t.comment, color: "#787b8099" },
        { tag: t.variableName, color: "#0080ff" },
        { tag: [t.string, t.special(t.brace)], color: "#5c6166" },
        { tag: t.number, color: "#5c6166" },
        { tag: t.bool, color: "#5c6166" },
        { tag: t.null, color: "#5c6166" },
        { tag: t.keyword, color: "#5c6166" },
        { tag: t.operator, color: "#5c6166" },
        { tag: t.className, color: "#5c6166" },
        { tag: t.definition(t.typeName), color: "#5c6166" },
        { tag: t.typeName, color: "#5c6166" },
        { tag: t.angleBracket, color: "#5c6166" },
        { tag: t.tagName, color: "#5c6166" },
        { tag: t.attributeName, color: "#5c6166" },
      ],
    })
  );
  const [showTestcaseModal, setShowTestcaseModal] = useState<boolean>(false);
  const [editIndex, setEditIndex] = useState<any>(0);
  const [languages, setLanguages] = useState<Coding[]>([]);
  const [line, setLine] = useState<any>(1);
  const [col, setCol] = useState<any>(1);
  const [codemirrorConfig, setCodemirrorConfig] = useState<any>({
    theme: "default",
    lineNumbers: true,
    fullScreen: false,
    lineWrapping: true,
    foldGutter: true,
    autoRefresh: true,
    autoCloseBrackets: "()[]{}''\"\"",
    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
    mode: "text/x-java",
  });

  const [selectedLangs, setSelectedLangs] = useState<any>([]);
  const [activeLang, setActiveLang] = useState<any>([]);
  const [error, setError] = useState<any>({
    question: false,
    testcaseMin: false,
    solution: "",
    template: "",
  });

  const [stats, setStats] = useState<any>({});
  const [lastRunCode, setLastRunCode] = useState<any>({});
  const [excuting, setExcuting] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(false);
  const [generateTC, setGenerateTC] = useState<any>(null);

  useEffect(() => {
    const temp_languages = getCodeLanguages().map((l, index) => {
      return {
        display: l.display,
        language: l.language,
        template: "",
        solution: "",
        timeLimit: 0,
        memLimit: 0,
      };
    });
    setLanguages(temp_languages);

    onQuestionChangedFunc(temp_languages);
  }, []);

  const getStepperID = () => {
    return "#code-stepper";
  };

  const isValidUrl = (url) => {
    const pattern = new RegExp(
      "^(https?:\\/\\/)?" + // protocol
        "((([a-zA-Z0-9$-_@.&+!*'(),]|%[0-9a-fA-F]{2})+)(:[0-9]+)?(@[a-zA-Z0-9.-]+)?)" + // credentials
        "((([a-zA-Z0-9.-]{2,256})\\.[a-zA-Z]{2,6})" + // domain
        "|((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
        "(\\:\\d+)?(\\/[-a-zA-Z0-9@:%_+.~#?&//=]*)?$" // port and path
    );
    return pattern.test(url);
  };
  const onQuestionChangedFunc = (langs: any) => {
    if (question) {
      for (const lang of langs) {
        lang.template = "";
        lang.solution = "";
        lang.timeLimit = 0;
        lang.memLimit = 0;
      }
      setLanguages((prevLanguages) =>
        langs.map((lang) => ({
          ...lang,
          template: "",
          solution: "",
          timeLimit: 0,
          memLimit: 0,
        }))
      );
      // load selectedLangs
      const selectedLangs_temp = [];
      for (const code of question.coding) {
        const l: any = langs.find((l) => l.language == code.language);

        l.template = code.template;
        l.solution = code.solution;
        l.timeLimit = code.timeLimit;
        l.memLimit = code.memLimit;

        selectedLangs_temp.push(l);

        setStats((prevStats) => ({
          ...prevStats,
          [code.language]: {
            time: 0,
            mem: 0,
            passedTestcase: question.testcases.length,
            output: "",
            highlightedLines: [],
            status: true,
          },
        }));

        setLastRunCode((prevLastRunCode) => ({
          ...prevLastRunCode,
          [code.language]: {
            solution: code.solution,
            testcases: testcaseToString(question.testcases),
            output: "",
          },
        }));
      }

      const uniqueLangs = [...new Set(selectedLangs_temp)];
      setSelectedLangs(uniqueLangs);

      onLanguageChanged(uniqueLangs);
    }
  };

  const presaveFunc = () => {
    presave();
    if (!question.coding.length) {
      alert("Message", "Please select at least one language.");
      return false;
    }

    const sample = question.testcases.find((t) => t.isSample);
    if (!sample) {
      alert("Message", "Please choose at least one sample test case.");
      return false;
    }

    const tcString = testcaseToString(question.testcases);
    const tcError = [];
    for (const coding of question.coding) {
      if (!stats[coding.language]) {
        alert(
          "Message",
          `Please run your ${coding.display} code against the test cases.`
        );
        return false;
      }

      if (!stats[coding.language].status) {
        alert(
          "Message",
          `One or more test case(s) didn't pass. please check your ${coding.display} code and test cases and try again.`
        );
        return false;
      }

      if (
        !lastRunCode[coding.language] ||
        lastRunCode[coding.language].solution !== coding.solution
      ) {
        alert(
          "Message",
          `Solution of ${coding.display} has been changed, please run the code again.`
        );
        return false;
      }

      if (lastRunCode[coding.language].testcases !== tcString) {
        tcError.push(coding.language);
      }
    }

    if (tcError.length) {
      alert(
        "Message",
        `Test cases have been changed, please run your ${tcError.join(
          "/"
        )} code again.`
      );
      return false;
    }

    const invalidT = question.coding.find((c) => !c.template);
    if (invalidT) {
      alert("Message", `Template for  ${invalidT.display} is empty`);
      return false;
    }

    return true;
  };
  const resetFunc = () => {
    reset();
    setError({
      question: false,
      testcaseMin: false,
      solution: "",
      template: "",
    });
    setStats({});
    setLastRunCode({});
    setExcuting(false);
  };

  const onLanguageRemoved = (item?: any) => {
    if (!item) {
      item = selectedLangs;
    } else {
      setSelectedLangs(item);
    }

    const coding_temp = item.filter((l) => {
      return item.findIndex((sl) => sl.language == l.language) > -1;
    });
    console.log(coding_temp, "seletected");
    setQuestion({
      ...question,
      coding: coding_temp,
    });

    if (!coding_temp.length) {
      setActiveLang(null);
      return;
    }
    if (
      coding_temp.length > 0 &&
      (!activeLang ||
        coding_temp.findIndex((c) => c.language == activeLang.language) == -1)
    ) {
      setActiveLang(coding_temp[0]);
      console.log(coding_temp[0], "question.coding[0]");
    }

    setQuestion((prevQuestion) => ({
      ...prevQuestion,
      coding: prevQuestion.coding.map((c) => ({
        ...c,
        timeLimit: c.timeLimit || 0,
        memLimit: c.memLimit || 0,
        solution: c.solution || "",
        template: c.template || "",
      })),
    }));

    changeMode();
    refreshCodeMirror();
  };

  const onLanguageChanged = (item?: any) => {
    if (!item) {
      item = selectedLangs;
    } else {
      setSelectedLangs(item);
    }
    if (item.length > 0) {
      const q_updated = [...question.coding];
      q_updated.push(item[item.length - 1]);
      item = q_updated;
      console.log(item[item.length - 1], q_updated, item, "updated item");
    }

    const coding_temp = item.filter((l) => {
      return item.findIndex((sl) => sl.language == l.language) > -1;
    });
    console.log(coding_temp, "seletected");
    setQuestion({
      ...question,
      coding: coding_temp,
    });

    if (!coding_temp.length) {
      setActiveLang(null);
      return;
    }
    if (
      coding_temp.length > 0 &&
      (!activeLang ||
        coding_temp.findIndex((c) => c.language == activeLang.language) == -1)
    ) {
      setActiveLang(coding_temp[0]);
      console.log(coding_temp[0], "question.coding[0]");
    }

    setQuestion((prevQuestion) => ({
      ...prevQuestion,
      coding: prevQuestion.coding.map((c) => ({
        ...c,
        timeLimit: c.timeLimit || 0,
        memLimit: c.memLimit || 0,
        solution: c.solution || "",
        template: c.template || "",
      })),
    }));

    changeMode();
    refreshCodeMirror();
  };
  const refreshCodeMirror = () => {
    setTimeout(() => {
      // if (codeSrc) {
      //   codeSrc.codeMirror.refresh()
      // }
      // if (codeTemplate) {
      //   codeTemplate.codeMirror.refresh()
      // }
    }, 500);
  };

  const addTestcase = () => {
    setShowTestcaseModal(true);
    setIsNew(true);
    // this.testcaseModalRef = this.modalSvc.show(EditTestCaseComponent, {
    //   ignoreBackdropClick: true,
    //   keyboard: false,
    //   initialState: {
    //     question: this.question
    //   }
    // });
  };
  const deleteTestcase = (idx) => {
    setQuestion((prevQuestion) => {
      const updatedTestcases = [...prevQuestion.testcases];
      updatedTestcases.splice(idx, 1);

      return {
        ...prevQuestion,
        testcases: updatedTestcases,
      };
    });
  };

  const editTestcase = (idx) => {
    setShowTestcaseModal(true);
    setEditIndex(idx);
    setIsNew(false);
  };

  const onActiveLanguageChanged = (lang: any) => {
    console.log(question.coding, "tjos");
    const acitive_code = question.coding.filter(
      (code) => code.language === lang
    );
    setActiveLang(acitive_code[0]);
    console.log(activeLang, "langu");
    changeMode();
    refreshCodeMirror();
    applyHighlightedLine(lang.language);
  };

  const changeMode = () => {
    if (!activeLang) {
      return;
    }
    switch (activeLang.language) {
      case "java":
        setCodemirrorConfig({
          ...codemirrorConfig,
          mode: "text/x-java",
        });
        break;

      case "c":
        setCodemirrorConfig({
          ...codemirrorConfig,
          mode: "text/x-c++src",
        });
        break;

      case "cpp":
        setCodemirrorConfig({
          ...codemirrorConfig,
          mode: "text/x-csharp",
        });
        break;

      case "python":
        setCodemirrorConfig({
          ...codemirrorConfig,
          mode: "text/x-python",
        });
        break;

      case "ruby":
        setCodemirrorConfig({
          ...codemirrorConfig,
          mode: "text/x-ruby",
        });
        break;

      case "javascript":
        setCodemirrorConfig({
          ...codemirrorConfig,
          mode: "text/javascript",
        });
        break;
    }
  };

  const validateStep = (currentStep?: any) => {
    if (currentStep == "question") {
      if (!question.questionText) {
        setError({
          ...error,
          question: true,
        });
        return false;
      } else {
        setError({
          ...error,
          question: false,
        });
      }
    } else if (currentStep == "testcase") {
      if (question.testcases.length < 3) {
        setError({
          ...error,
          testcaseMin: true,
        });
        return false;
      } else {
        setError({
          ...error,
          testcaseMin: false,
        });
      }
    } else if (currentStep == "solution") {
      const invalidS = question.coding.find((c) => !c.solution);
      if (invalidS) {
        setError({
          ...error,
          solution: "*Solution for " + invalidS.display + " is empty.",
        });
        return false;
      }
    } else if (currentStep == "template") {
      const invalidT = question.coding.find((c) => !c.template);
      if (invalidT) {
        setError({
          ...error,
          solution: "*Template for " + invalidT.display + " is empty.",
        });
        return false;
      }
    }

    return true;
  };

  const onCodeSrcChanged = (item: any) => {
    setActiveLang({
      ...activeLang,
      solution: item,
    });

    const coding_tmp = [...question.coding];
    coding_tmp.map((code) => {
      if (code.language === activeLang?.language) {
        code.solution = item;
      }
    });
    setQuestion({
      ...question,
      coding: coding_tmp,
    });

    clearHighlightedLine(activeLang?.language); // Use optional chaining to access activeLang.language
  };

  const onCodeTempChanged = (item: any) => {
    setActiveLang({
      ...activeLang,
      template: item,
    });

    const coding_tmp = [...question.coding];
    coding_tmp.map((code) => {
      if (code.language === activeLang?.language) {
        code.template = item;
      }
    });
    setQuestion({
      ...question,
      coding: coding_tmp,
    });

    clearHighlightedLine(activeLang?.language); // Use optional chaining to access activeLang.language
  };

  const runCode = async () => {
    if (excuting) {
      return;
    }

    if (!question.testcases.length) {
      alert("Message", "Please add some testcases.");
      return;
    }

    if (!activeLang || !activeLang.solution) {
      alert("Message", "Solution is empty.");
      return;
    }

    const inputToRun = question.testcases.map((t) => {
      return {
        input: question.hasUserInput ? t.input : "",
        args: question.hasArg ? t.args : "",
      };
    });

    clearHighlightedLine();

    setExcuting(true);
    const coding = activeLang;
    setStats((prevStats) => ({
      ...prevStats,
      [coding.language]: {
        time: 0,
        mem: 0,
        passedTestcase: 0,
        output: "",
        highlightedLines: [],
        status: false,
      },
    }));

    setLastRunCode((prevLastRunCode) => ({
      ...prevLastRunCode,
      [coding.language]: {
        solution: coding.solution,
        testcases: testcaseToString(question.testcases),
        output: "",
      },
    }));

    try {
      for (const tc of question.testcases) {
        tc.solutionOutput = "";
      }
      console.log(activeLang, "type");
      const res: any = await questionSvc.runCode(
        { language: coding.language },
        coding.solution,
        inputToRun,
        coding.timeLimit,
        coding.memLimit
      );
      const output = res.data.output;

      for (const tc of question.testcases) {
        for (const result of output.result) {
          const input = question.hasUserInput ? tc.input : "";
          const args = question.hasArg ? tc.args : "";
          if (input == result.input && args == result.args) {
            setStats((prevStats) => ({
              ...prevStats,
              [coding.language]: {
                ...prevStats[coding.language],
                time: prevStats[coding.language].time + result.runTime,
                mem: prevStats[coding.language].mem + result.memory,
              },
            }));

            tc.solutionOutput = result.out;
            if (codeOuputCompare(tc.output, result.out)) {
              tc.status = true;
              setStats((prevStats) => ({
                ...prevStats,
                [coding.language]: {
                  ...prevStats[coding.language],
                  passedTestcase: prevStats[coding.language].passedTestcase + 1,
                },
              }));
            } else {
              tc.status = false;
            }
            break;
          }
        }
      }

      setStats((prevStats) => ({
        ...prevStats,
        [coding.language]: {
          ...prevStats[coding.language],
          output: JSON.stringify(output, null, "\t"),
          status:
            prevStats[coding.language].passedTestcase ===
            question.testcases.length,
        },
      }));
    } catch (res) {
      const output = res?.error?.output;
      // var codeData = result.codeData;
      if (output && output.err) {
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
          lines.forEach((l) => {
            if (l.startsWith("In function")) {
              const idx = l.indexOf(":");
              if (idx > -1) {
                l = l.substring(idx).replace(":", "");
              }
            }
            const lineNum = parseInt(l);
            if (!isNaN(lineNum)) {
              highlightLine(coding.language, lineNum);
            }
          });
        }

        // Clear test cases result in case error
        setQuestion((prevQuestion) => ({
          ...prevQuestion,
          testcases: prevQuestion.testcases.map((testcase) => ({
            ...testcase,
            status: null,
            solutionOutput: "Compilation Error",
          })),
        }));

        setStats((prevStats) => ({
          ...prevStats,
          [coding.language]: {
            ...prevStats[coding.language],
            output: msg,
          },
        }));
      }
    }

    setExcuting(false);
  };

  const highlightLine = (lang: any, lineNum: any) => {
    const actualLineNumber = lineNum - 1;

    // if (codeSrc) {
    //   this.stats[lang].highlightedLines.push(actualLineNumber)
    //   if (lang == this.activeLang.language) {
    //     this.codeSrc.codeMirror.addLineClass(actualLineNumber, 'background', 'line-error')
    //   }
    // }
  };
  const clearHighlightedLine = (lang = "") => {
    if (codeSrc.current) {
      if (lang && stats[lang] && stats[lang].highlightedLines.length) {
        stats[lang].highlightedLines.forEach((l) => {
          codeSrc.current.codeMirror.removeLineClass(
            l,
            "background",
            "line-error"
          );
        });
        setStats((prevStats) => ({
          ...prevStats,
          [lang]: { ...prevStats[lang], highlightedLines: [] },
        }));
      } else {
        for (const code in stats) {
          stats[code].highlightedLines.forEach((l) => {
            codeSrc.current.codeMirror.removeLineClass(
              l,
              "background",
              "line-error"
            );
          });
          setStats((prevStats) => ({
            ...prevStats,
            [code]: { ...prevStats[code], highlightedLines: [] },
          }));
        }
      }
    }
  };

  const applyHighlightedLine = (lang) => {
    // if (this.codeSrc && this.stats[lang] && this.stats[lang].highlightedLines.length) {
    //   setTimeout(() => {
    //     this.stats[lang].highlightedLines.forEach(l => {
    //       this.codeSrc.codeMirror.addLineClass(l, 'background', 'line-error')
    //     });
    //   }, 800);
    // }
  };

  const aiGenerateExplanation = () => {
    if (!question.coding[0]?.solution) {
      alert("Messate", "Please add solution first");
      return;
    }

    setProcessing(true);
    setGenerating(true);
    adminSvc
      .getReportData("openai_coding_explaination", {
        question: question._id,
        location: user.activeLocation,
      })
      .then((res: any) => {
        if (res.msg) {
          console.log("aiGenerateExplanation", res.msg);
          alert("Messate", "No explanation available. Please try again.");
        } else {
          success("Explanation is generated.");
          setQuestion({
            ...question,
            answerExplain: res.data,
          });
        }
        setProcessing(false);
        setGenerating(false);
      })
      .catch((err) => {
        error("Fail to generate explanation.");
        console.log(err);
        setProcessing(false);
        setGenerating(false);
      });
  };

  const generateTestCases = (num) => {
    if (!question.coding[0]?.solution) {
      alert("Message", "Please add solution first");
      return;
    }

    setGenerateTC(true);
    questionSvc
      .generateTestCases(
        { solution: question.coding[0].solution },
        { count: num, locationId: user.activeLocation }
      )
      .then((res: any) => {
        if (res.msg) {
          console.log("openai_create_testcases", res.msg);
          alert("Message", "No test cases available. Please try again.");
        } else {
          success("Test Cases are generated.");
          setQuestion({
            ...question,
            testcases: [...question.testcases, ...res.data],
          });
          if (res.data.length) {
            setQuestion({
              ...question,
              hasArg: !res.data[0].args,
              hasUserInput: !!res.data[0].input,
            });
          }
        }
        setGenerateTC(false);
      })
      .catch((err) => {
        alert("Message", "Fail to generate test cases");
        console.log(err, "err");
        setGenerateTC(false);
      });
  };

  return (
    <>
      <div className="coding-post-box bg-white rounded-boxes form-boxes">
        <div className="assess-create-align ques-num">
          <div className="profile-info1">
            <div className="row align-items-center">
              <div className="col-lg-3">
                <h4 className="form-box_subtitle d-inline-block mr-3">
                  Positive Marks
                </h4>
                <input
                  type="number"
                  name="pos_mark"
                  id="coding_pos_mark"
                  aria-label="input postive marks"
                  className="form-control all border-bottom rounded-0"
                  min="0"
                  readOnly={settings.testStatus === "published"}
                  value={question.plusMark}
                  onChange={(e) =>
                    setQuestion({
                      ...question,
                      plusMark: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="col-lg-3">
                <h4 className="form-box_subtitle d-inline-block mr-3">
                  Negative Marks
                </h4>
                <input
                  type="number"
                  aria-label="Enter negative marks"
                  name="minus_mark"
                  id="coding_minus_mark"
                  className="form-control all border-bottom rounded-0"
                  max="0"
                  readOnly={settings.testStatus === "published"}
                  value={question.minusMark}
                  onChange={(e) =>
                    setQuestion({
                      ...question,
                      minusMark: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="col-lg-4">
                <h4 className="form-box_subtitle d-inline-block mr-3">
                  Languages
                </h4>
                <Multiselect
                  className="form-control coding border-bottom rounded-0"
                  options={languages}
                  displayValue="display"
                  onSelect={onLanguageChanged}
                  onRemove={onLanguageRemoved}
                  selectedValues={selectedLangs}
                  placeholder="Select languages"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <ul
        id="description-stepper"
        className="stepper nav nav-pills nav-justified text-center"
      >
        <li
          className={`nav-item ${currentStep >= 0 ? "active" : ""}`}
          onClick={() => setCurrentStep(0)}
        >
          <strong>Question</strong>
        </li>
        <li
          className={`nav-item ${currentStep >= 1 ? "active" : ""}`}
          onClick={() => setCurrentStep(1)}
        >
          <strong>Solution</strong>
        </li>
        <li
          className={`nav-item ${currentStep >= 2 ? "active" : ""}`}
          onClick={() => setCurrentStep(2)}
        >
          <strong>Test cases</strong>
        </li>
        <li
          className={`nav-item ${currentStep >= 3 ? "active" : ""}`}
          onClick={() => setCurrentStep(3)}
        >
          <strong>Template</strong>
        </li>
        <li
          className={`nav-item ${currentStep >= 4 ? "active" : ""}`}
          onClick={() => setCurrentStep(4)}
        >
          <strong>Explanation</strong>
        </li>
      </ul>
      <div className="mt-3 p-0">
        {currentStep == "0" && (
          <div>
            <div className="bg-white rounded-boxes form-boxes">
              <div className="assess-create-align ques-num">
                <h4 className="form-box_subtitle">
                  Question{" "}
                  <a
                    className="mx-2"
                    onClick={() =>
                      document.getElementById("fileInput2").click()
                    }
                  >
                    <input
                      type="file"
                      id="fileInput2"
                      name="fileupload"
                      hidden
                      className="mx-2"
                      multiple
                      onChange={(e) => questionFileUploadClick(e.target.files)}
                    />
                    <i className="fas fa-paperclip"></i>
                  </a>
                </h4>
                <div className="mt-2">
                  <CKEditorCustomized
                    defaultValue={question.questionText}
                    onChangeCon={(event) => {
                      onCkeditorReady(event, "questionText");
                      setQuestion({
                        ...question,
                        questionText: event,
                      });
                    }}
                  />
                </div>
                {error.question && (
                  <em className="text-danger">Question is required</em>
                )}
                <AudioRecordComponent
                  question={question}
                  setQuestion={setQuestion}
                  audioFiles={question.audioFiles}
                  type={"ques"}
                />
              </div>
            </div>

            <div className="text-right">
              <a className="btn btn-light mr-2" onClick={cancel}>
                Cancel
              </a>
              <a className="btn btn-primary" onClick={() => next("question")}>
                Continue
              </a>
            </div>
          </div>
        )}
        {currentStep == "1" && (
          <div>
            <div className="bg-white rounded-boxes form-boxes">
              <div className="assess-create-align ques-num">
                <h4 className="form-box_subtitle">Solution</h4>
                {error.solution && (
                  <em className="text-danger">{error.solution}</em>
                )}
                <Tabs
                  id="coding-tabs"
                  activeKey={activeLang?.language}
                  onSelect={(lang) => {
                    onActiveLanguageChanged(lang);
                  }}
                  className="mt-2"
                >
                  {[
                    ...new Map(
                      question.coding.map((code) => [code.language, code])
                    ).values(),
                  ].map((code) => (
                    <Tab
                      key={code._id}
                      eventKey={code.language}
                      title={code.language}
                    >
                      <CodeMirror
                        ref={codeSrc}
                        value={activeLang?.solution ? activeLang?.solution : ""}
                        onChange={(e) => onCodeSrcChanged(e)}
                        theme={myTheme}
                        extensions={
                          code.language === "cpp" ||
                          activeLang?.language === "cpp" ||
                          code.language === "c" ||
                          activeLang?.language === "c"
                            ? [cpp()]
                            : code.language === "java" ||
                              activeLang?.language === "java"
                            ? [java()]
                            : code.language === "python" ||
                              activeLang?.language === "python"
                            ? [python()]
                            : [javascript({ jsx: true })]
                        }
                      />
                    </Tab>
                  ))}
                </Tabs>
              </div>
            </div>

            {activeLang && stats[activeLang.language] && (
              <div className="bg-white rounded-boxes form-boxes">
                <div className="assess-create-align ques-num">
                  <div className="profile-info1">
                    <h4 className="form-box_subtitle">Output</h4>
                    <br />
                    <div className="folder-area clearfix mx-auto">
                      <div className="table-wrap">
                        <table className="table mb-0">
                          <thead>
                            <tr>
                              <th className="border-0">
                                <div className="student mb-2">
                                  <strong>Time(sec)</strong>
                                </div>
                                <span>{stats[activeLang.language].time}</span>
                              </th>
                              <th className="border-0">
                                <div className="student mb-2">Memory(mb)</div>
                                <span>
                                  {stats[activeLang.language].mem
                                    ? stats[activeLang.language].mem
                                    : "< 1"}
                                </span>
                              </th>
                              <th className="border-0">
                                <div className="student mb-2">Language</div>
                                <span>{activeLang.language}</span>
                              </th>
                              <th className="border-0">
                                <div className="student mb-2">
                                  Passed Test Case
                                </div>
                                <span
                                  className={
                                    stats[activeLang.language].status
                                      ? "text-success"
                                      : "text-danger"
                                  }
                                >
                                  {stats[activeLang.language].passedTestcase}/
                                  {question.testcases.length} test case passed
                                </span>
                              </th>
                            </tr>
                          </thead>
                        </table>
                      </div>
                    </div>
                    <div className="assignment mx-auto bg-white">
                      <div className="assignment-content-area pt-0">
                        <div className="box1 bg-white mb-3">
                          <textarea
                            className="form-control"
                            name="codeOutput"
                            value={stats[activeLang.language].output}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="text-right">
              <a className="btn btn-light  mr-2" onClick={cancel}>
                Cancel
              </a>
              <button
                className="btn btn-success mr-2"
                disabled={excuting || !activeLang || !activeLang.solution}
                onClick={runCode}
              >
                Run Code{" "}
                <i
                  className={excuting ? "fa fa-spinner fa-pulse ml-1" : ""}
                ></i>
              </button>
              <a className="btn btn-primary" onClick={() => next("solution")}>
                Continue
              </a>
            </div>
          </div>
        )}
        {currentStep == "2" && (
          <div>
            <div className="bg-white rounded-boxes form-boxes">
              <div className="assess-create-align ques-num">
                <h4 className="form-box_subtitle">Constraints</h4>
                <Tabs
                  id="coding-tabs"
                  activeKey={activeLang?.language}
                  onSelect={(lang) => {
                    onActiveLanguageChanged(lang);
                  }}
                  className="mt-2"
                >
                  {question.coding.map((code) => (
                    <Tab
                      key={code.language}
                      eventKey={code.language}
                      title={code.language}
                    >
                      <div className="row inline mt-2">
                        <div className="col-lg-4">
                          <h4 className="form-box_subtitle d-inline-block mr-3">
                            Time limit
                          </h4>
                          <input
                            type="number"
                            value={code.timeLimit}
                            onChange={(e) => {
                              const updatedCode = {
                                ...code,
                                timeLimit: e.target.value,
                              };
                              const updatedCoding = question.coding.map((c) =>
                                c.language === code.language ? updatedCode : c
                              );
                              setQuestion((prevQuestion) => ({
                                ...prevQuestion,
                                coding: updatedCoding,
                              }));
                            }}
                            className="form-control all border-bottom rounded-0"
                          />
                          <em>(in seconds)</em>
                        </div>
                        <div className="col-lg-4">
                          <h4 className="form-box_subtitle d-inline-block mr-3">
                            Space limit
                          </h4>
                          <input
                            type="number"
                            value={code.memLimit}
                            onChange={(e) => {
                              const updatedCode = {
                                ...code,
                                memLimit: e.target.value,
                              };
                              const updatedCoding = question.coding.map((c) =>
                                c.language === code.language ? updatedCode : c
                              );
                              setQuestion((prevQuestion) => ({
                                ...prevQuestion,
                                coding: updatedCoding,
                              }));
                            }}
                            className="form-control all border-bottom rounded-0"
                          />
                          <em>(in MB)</em>
                        </div>
                      </div>
                    </Tab>
                  ))}
                </Tabs>
              </div>
            </div>

            <div className="bg-white rounded-boxes form-boxes">
              <div className="assess-create-align ques-num">
                <div className="row align-items-center">
                  <div className="col-auto">
                    <h4 className="form-box_subtitle">Test Cases</h4>
                    <p className="p-0">
                      Test cases ensure validation of logic and correctness of
                      the code. Don&apos;t forget to include boundary condition.
                    </p>
                  </div>
                  <div className="col text-right">
                    {user.primaryInstitute?.canUseAI && (
                      <div className="btn-group mr-2">
                        <button
                          disabled={generateTC}
                          type="button"
                          className="btn btn-primary dropdown-toggle"
                          data-toggle="dropdown"
                          aria-expanded="false"
                        >
                          Generate Test Cases &nbsp;
                          <i
                            className={
                              generateTC ? "fa fa-spinner fa-pulse" : ""
                            }
                          ></i>
                        </button>
                        <div className="dropdown-menu">
                          <a
                            className="dropdown-item"
                            onClick={() => generateTestCases(6)}
                          >
                            6 Test Cases
                          </a>
                          <a
                            className="dropdown-item"
                            onClick={() => generateTestCases(8)}
                          >
                            8 Test Cases
                          </a>
                          <a
                            className="dropdown-item"
                            onClick={() => generateTestCases(10)}
                          >
                            10 Test Cases
                          </a>
                        </div>
                      </div>
                    )}
                    <button className="btn btn-primary" onClick={addTestcase}>
                      + New Test Case
                    </button>
                  </div>
                </div>
                <div className="folder-area clearfix mx-auto">
                  <div
                    className="table-responsive table-wrap"
                    style={{
                      display:
                        question && question.testcases.length > 0
                          ? "block"
                          : "none",
                    }}
                  >
                    <table className="table c-test-cases mb-0 vertical-middle">
                      <thead>
                        <tr>
                          <th className="border-0"></th>
                          <th className="border-0">Status</th>
                          {question.hasArg && (
                            <th className="border-0">Args</th>
                          )}
                          {question.hasUserInput && (
                            <th className="border-0">Input</th>
                          )}
                          <th className="border-0">Expected Output</th>
                          <th className="border-0">Output</th>
                          <th className="border-0"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {question.testcases.map(
                          (testCase: any, index: number) => (
                            <tr key={index}>
                              <td className="px-0">
                                <div className="folder mb-0 p-0">
                                  <div className="inner">
                                    <h4 className="all-test">
                                      #{index + 1}{" "}
                                      {testCase.isSample && (
                                        <em className="ml-1 text-primary">
                                          Sample
                                        </em>
                                      )}
                                    </h4>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="status1">
                                  <span
                                    className={`all-test ${
                                      testCase.status
                                        ? "text-success"
                                        : "text-danger"
                                    } ${!testCase.status && "underline"}`}
                                  >
                                    {testCase.status ? "PASS" : "FAIL"}
                                  </span>
                                </div>
                              </td>
                              {question.hasArg && (
                                <td>
                                  <div className="pre-wrap">
                                    {testCase.args}
                                  </div>
                                </td>
                              )}
                              {question.hasUserInput && (
                                <td>
                                  <div className="pre-wrap">
                                    {testCase.input}
                                  </div>
                                </td>
                              )}
                              <td>
                                <div
                                  className={`pre-wrap ${
                                    testCase.status
                                      ? "text-success"
                                      : "text-danger"
                                  } ${!testCase.status && "underline"}`}
                                >
                                  {testCase.output}
                                </div>
                              </td>
                              <td>
                                <div
                                  className={`pre-wrap ${
                                    testCase.status
                                      ? "text-success"
                                      : "text-danger"
                                  } ${!testCase.status && "underline"}`}
                                >
                                  {testCase.solutionOutput}
                                </div>
                              </td>
                              <td className="d-flex align-items-center justify-content-end">
                                <a
                                  className="btn btn-light btn-sm"
                                  onClick={() => editTestcase(index)}
                                >
                                  <i className="fas fa-pencil-alt mr-1"></i>
                                  Edit
                                </a>
                                <div className="test-case-right ml-1">
                                  <a
                                    className="btn btn-danger btn-sm btn-test-case"
                                    onClick={() => deleteTestcase(index)}
                                  >
                                    Delete
                                  </a>
                                </div>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>

                  {error.testcaseMin && (
                    <em className="text-danger">
                      Please add at least 3 test cases
                    </em>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right">
              <a className="btn btn-light mr-2" onClick={cancel}>
                Cancel
              </a>
              <button
                className="btn btn-success mr-2"
                disabled={excuting || !activeLang || !activeLang.solution}
                onClick={runCode}
              >
                Run Code{" "}
                <i
                  className={excuting ? "fa fa-spinner fa-pulse ml-1" : ""}
                ></i>
              </button>
              <a className="btn btn-primary" onClick={() => next("testcase")}>
                Continue
              </a>
            </div>
          </div>
        )}
        {currentStep == "3" && (
          <div>
            <div className="bg-white rounded-boxes form-boxes">
              <div className="assess-create-align ques-num">
                <div className="profile-info1">
                  <h4 className="form-box_subtitle">Template Code</h4>
                  {error.template && (
                    <em className="text-danger">{error.template}</em>
                  )}
                  <Tabs
                    id="coding-tabs"
                    activeKey={activeLang?.language}
                    onSelect={(lang) => {
                      onActiveLanguageChanged(lang);
                    }}
                    className="mt-2"
                  >
                    {[
                      ...new Map(
                        question.coding.map((code) => [code.language, code])
                      ).values(),
                    ].map((code) => (
                      <Tab
                        key={code._id}
                        eventKey={code.language}
                        title={code.language}
                      >
                        <CodeMirror
                          value={activeLang ? activeLang.template : ""}
                          onChange={(e) => onCodeTempChanged(e)}
                          theme={myTheme}
                          extensions={
                            code.language === "cpp" ||
                            activeLang?.language === "cpp" ||
                            code.language === "c" ||
                            activeLang?.language === "c"
                              ? [cpp()]
                              : code.language === "java" ||
                                activeLang?.language === "java"
                              ? [java()]
                              : code.language === "python" ||
                                activeLang?.language === "python"
                              ? [python()]
                              : [javascript({ jsx: true })]
                          }
                        />
                      </Tab>
                    ))}
                  </Tabs>
                </div>
              </div>
            </div>

            {(question.userRole !== "publisher" ||
              user.role === "publisher" ||
              user?.primaryInstitute?.type === "publisher") && (
              <div className="bg-white rounded-boxes form-boxes">
                <div className="assess-create-align">
                  <div className="profile-box-remove clearfix">
                    <h4 className="form-box_subtitle">Question Tag</h4>
                    <TagsInput
                      //@ts-ignore
                      value={question.tags}
                      //@ts-ignore
                      onChange={(e) => {
                        setQuestion({
                          ...question,
                          tags: e,
                        });
                      }}
                      name=" tags "
                      placeHolder="+ Add Tag"
                      separators={[" "]}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="text-right">
              <a className="btn btn-light mr-2" onClick={cancel}>
                Cancel
              </a>
              <a className="btn btn-primary" onClick={() => next("template")}>
                Continue
              </a>
            </div>
          </div>
        )}
        {currentStep == "4" && (
          <div>
            <div className="bg-white rounded-boxes form-boxes">
              <div className="assess-create-align ques-num">
                <div className="profile-box-remove clearfix">
                  <h4 className="form-box_subtitle">Answer Explanation</h4>
                  <div className="mt-2">
                    <CKEditorCustomized
                      defaultValue={question.answerExplain}
                      onChangeCon={(event) => {
                        onCkeditorReady(event, "answerExplain");
                        setQuestion((prevQ) => ({
                          ...prevQ,
                          answerExplain: event,
                        }));
                      }}
                    />
                  </div>
                  <AudioRecordComponent
                    question={question}
                    setQuestion={setQuestion}
                    audioFiles={question.answerExplainAudioFiles}
                    type={"explain"}
                  />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-boxes form-boxes">
              <div className="assess-create-align ques-num">
                <div className="profile-box-remove clearfix">
                  <h4 className="form-box_subtitle">Video Explanation</h4>
                  <form className="mt-2">
                    <input
                      type="text"
                      name="txt_videoExp"
                      className="form-control border-bottom"
                      value={question.answerExplainVideo}
                      onChange={(e) => {
                        setQuestion({
                          ...question,
                          answerExplainVideo: e.target.value,
                        });
                      }}
                      onBlur={() => setIsTouched(true)}
                      placeholder="Provide a valid video url"
                    />
                    {isTouched && !isValidUrl(question.answerExplainVideo) && (
                      <p className="label label-danger text-danger">
                        Invalid URL
                      </p>
                    )}
                  </form>
                </div>
              </div>
            </div>
            <div className="d-flex justify-content-end gap-xs">
              {question._id && user.primaryInstitute?.canUseAI && (
                <button
                  className="btn btn-primary"
                  onClick={aiGenerateExplanation}
                  disabled={processing}
                >
                  Generate Explanation &nbsp;
                  <i className={generating ? "fa fa-spinner fa-pulse" : ""}></i>
                </button>
              )}

              <button
                className="btn btn-light"
                onClick={cancel}
                disabled={processing}
              >
                Cancel
              </button>
              <button
                className="btn btn-outline"
                onClick={() => {
                  if (presaveFunc()) {
                    save(false);
                  }
                }}
                disabled={processing}
              >
                Save and Exit
              </button>

              {canNavigate &&
                (settings.testStatus === "published" ||
                  settings.testStatus === "draft") &&
                !settings.last && (
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      if (presaveFunc()) {
                        saveAndNext();
                      }
                    }}
                    disabled={processing}
                  >
                    Save and Next
                  </button>
                )}

              {canNavigate &&
                settings.testStatus !== "published" &&
                !settings.questioId && (
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      if (presaveFunc()) {
                        save(true);
                        setActiveLang([]);
                      }
                    }}
                    disabled={processing}
                  >
                    Save and Add More
                  </button>
                )}
            </div>
          </div>
        )}
      </div>
      <input
        type="file"
        // ref={(ref) => ref?.questionFileUpload}
        hidden
        accept=".zip,.pdf,.txt,.docx"
        onChange={(e) => {
          if (e.target.files) {
            questionFileUploadClick(e.target.files);
            e.target.value = "";
          }
        }}
      />
      <EidtTestCaseModal
        show={showTestcaseModal}
        setShow={setShowTestcaseModal}
        onClose={() => setShowTestcaseModal(false)}
        question={question}
        setQuestion={setQuestion}
        testCase={question.testcases[editIndex]}
        idx={editIndex}
        isNew={isNew}
        setIsNew={setIsNew}
      />
    </>
  );
};

export default CodingQuestionComponent;
