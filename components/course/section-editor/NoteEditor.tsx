import React, { useEffect, useState } from "react";
import * as authService from "@/services/auth";
import { getCodeEngineAddress } from "@/services/settingService";
import { getReportData } from "@/services/auth";
import { getSubjectTree } from "@/services/subjectService";
import { Modal } from "react-bootstrap";
import { getCodeLanguages } from "@/lib/common";
import { copyText } from "@/lib/helpers";
import clientApi from "@/lib/clientApi";
import { confirm, success, alert } from "alertifyjs";
import { CKEditorCustomized } from "@/components/CKEditorCustomized";
import CodeMirror from "@uiw/react-codemirror";

const NoteEditorComponent = ({
  user,
  settings,
  course,
  section,
  setSection,
  content,
  setContent,
  Save,
  Cancel,
}: any) => {
  const ckeOptions = {
    placeholder: "Write Description",
    simpleUpload: {
      uploadUrl: "/api/v1/files/discussionUpload?method=drop",
      withCredentials: true,
      headers: {
        "X-CSRF-TOKEN": "CSRF-Token",
        Authorization: "Bearer " + authService.getToken(),
      },
    },
  };
  const codeOptions = {
    java: {
      mode: "text/x-java", // text/x-csrc (C), text/x-c++src (C++), text/x-java (Java) text/x-csharp
      fileExt: "java",
    },
    cpp: {
      mode: "text/x-csharp", // text/x-csrc (C), text/x-c++src (C++), text/x-java (Java) text/x-csharp
      fileExt: "cpp",
    },
    python: {
      mode: "text/x-python",
      fileExt: "py",
    },
    c: {
      mode: "text/x-c++src",
      fileExt: "c",
    },
    ruby: {
      mode: "text/x-ruby",
      fileExt: "ruby",
    },
    javascript: {
      mode: "text/javascript",
      fileExt: "js",
    },
  };

  const [edit, setEdit] = useState<boolean>(false);
  const [reviewing, setReviewing] = useState<boolean>(false);
  const codemirrorConfig = {
    theme: "default",
    lineNumbers: true,
    fullScreen: false,
    lineWrapping: true,
    foldGutter: true,
    autoRefresh: true,
    autoCloseBrackets: "()[]{}''\"\"",
    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
    mode: "text/x-java",
  };
  const [activeLang, setActiveLang] = useState<any>();
  const [languages, setLanguages] = useState<any>();
  const [codeEngineAddress, setCodeEngineAddress] = useState<string>("");
  const [highlightedLines, setHighLightedLines] = useState<any>({});
  const [isFullscreen, setIsFullscreen] = useState<any>();
  const [currentFullscreenItemIdx, setCurrentFullscreenItemIdx] = useState();
  const [editingContent, setEditingContent] = useState<any>();
  const [subjects, setSubjects] = useState<any>();
  const [notesGenerateParams, setNotesGenerateParams] = useState<any>({
    subject: null,
    unit: null,
    topic: null,
    testMode: "quiz",
    quesNumber: 10,
  });
  const [processing, setProcessing] = useState<boolean>(false);
  const [required, setRequired] = useState<boolean>(false);
  const [generalNoteModalShow, setGeneralNoteModalShow] =
    useState<boolean>(false);

  useEffect(() => {
    setRequired(true);
    setLanguages(
      getCodeLanguages().map((l: any) => {
        return {
          display: l.display,
          language: l.language,
          solution: "",
        };
      })
    );

    setEdit(!content.isNew);
    let editingContentData = editingContent;
    editingContentData = { ...content, note: [] };
    for (const note of content.note) {
      editingContentData.note.push({
        type: note.type,
        data: note.type == "text" ? note.data : { ...note.data },
      });
    }
    getCodeEngineAddresFunction();

    if (editingContentData.note) {
      for (const item of editingContentData.note) {
        if (item.type == "code") {
          item.options = {
            theme: "default",
            lineNumbers: true,
            fullScreen: false,
            lineWrapping: true,
            foldGutter: true,
            autoRefresh: true,
            autoCloseBrackets: "()[]{}''\"\"",
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
            mode: "text/x-python",
          };
          item.processing = false;
        }

        switch (item.language) {
          case "java":
            item.options.mode = "text/x-java";
            break;

          case "c":
            item.options.mode = "text/x-c++src";
            break;

          case "cpp":
            item.options.mode = "text/x-csharp";
            break;

          case "python":
            item.options.mode = "text/x-python";
            break;

          case "ruby":
            item.options.mode = "text/x-ruby";
            break;
        }
      }
    }
    setEditingContent(editingContentData);
  }, []);

  const getCodeEngineAddresFunction = () => {
    getCodeEngineAddress().then((codeEngine: any) => {
      setCodeEngineAddress(codeEngine.url);
    });
  };

  const saveNote = () => {
    // clean up data
    if (!validateData()) {
      return;
    }
    const editingContentData = editingContent;
    const contentData = content;
    for (const item of editingContentData.note) {
      if (item.type == "code") {
        delete item.options;
        delete item.processing;
      }
    }

    for (const k in editingContentData) {
      contentData[k] = editingContentData[k];
    }
    setEditingContent(editingContentData);
    setSection({
      ...section,
      content: contentData,
    });

    Save(contentData);
  };

  const addText = () => {
    const noteData = editingContent.note || [];
    if (
      noteData &&
      noteData[noteData.length] &&
      noteData[noteData.length].type === "text"
    ) {
      return;
    }

    noteData.push({
      type: "text",
      data: "",
    });
    setEditingContent({
      ...editingContent,
      note: noteData,
    });
    setSection({
      ...section,
      content: {
        ...section.content,
        hasChanges: true,
      },
    });
  };

  const addCode = () => {
    const noteData = editingContent.note || [];
    noteData.push({
      type: "code",
      data: {
        code: "",
        language: "python",
        display: "Python",
        options: {
          theme: "default",
          lineNumbers: true,
          fullScreen: false,
          lineWrapping: true,
          foldGutter: true,
          autoRefresh: true,
          autoCloseBrackets: "()[]{}''\"\"",
          gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
          mode: "text/x-python",
        },
        solution: "",
        input: "",
        args: "",
        output: "",
        showSolution: false,
        processing: false,
        valid: false,
      },
    });

    setEditingContent({
      ...editingContent,
      note: [...noteData],
    });
    setSection({
      ...section,
      content: {
        ...section.content,
        hasChanges: true,
      },
    });
  };

  const onLanguageChanged = (codeItem: any, langItem: any) => {
    codeItem.code = "";
    codeItem.language = langItem.language;
    codeItem.display = langItem.display;
    codeItem.valid = false;

    switch (codeItem.language) {
      case "java":
        codeItem.options.mode = "text/x-java";
        break;

      case "c":
        codeItem.options.mode = "text/x-c++src";
        break;

      case "cpp":
        codeItem.options.mode = "text/x-csharp";
        break;

      case "python":
        codeItem.options.mode = "text/x-python";
        break;

      case "ruby":
        codeItem.options.mode = "text/x-ruby";
        break;
    }
  };

  const onCodeChanged = (itemIdx: any, item: any, ev: any) => {
    clearHighlightedLine(itemIdx);
    item.data.valid = false;
  };

  const runCode = (codeItem: any, itemIdx: any) => {
    if (!codeItem.code || codeItem.processing) {
      return;
    }

    codeItem.processing = true;

    clientApi
      .post(`${codeEngineAddress}${codeItem.language}`, {
        code: codeItem.code,
        testcases: [{ input: codeItem.input, args: codeItem.args }],
      })
      .then(
        (output: any) => {
          if (output.result[0]) {
            if (output.result[0].err && output.result[0].err.length) {
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
                    highlightLine(itemIdx, lineNum);
                  }
                });
              }

              codeItem.output = msg;
              codeItem.valid = false;
            } else {
              codeItem.valid = true;
              codeItem.output = output.result[0].out;
            }
          }
        },
        (res: any) => {
          if (res.error && res.error.err) {
            let msg = "";

            for (let i = 0; i < res.error.err.length; i++) {
              msg += res.error.err[i];

              // Extract the line number
              let lines = [];
              if (res.error.err[i].indexOf("\n") > -1) {
                lines = res.error.err[i].split("\n");
              } else {
                lines.push(res.error.err[i]);
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
                  highlightLine(itemIdx, lineNum);
                }
              });
            }

            codeItem.output = msg;
          }
          codeItem.valid = false;
        }
      );
    codeItem.processing = false;
  };

  const trimErrorMessage = (err: string) => {
    return err ? err.replace(/File\s("|"\/|"\/app\/)assets([^,]+),\s/, "") : "";
  };

  const remove = (idx: any) => {
    confirm("Are you sure you want to remove this content?", (msg: any) => {
      let newNoteData = editingContent.note.filter(
        (item: any, index: number) => index !== idx
      );
      setEditingContent({
        ...editingContent,
        note: newNoteData,
      });
      setSection({
        ...section,
        content: {
          ...section.content,
          hasChanges: true,
        },
      });
    });
  };

  const validateData = () => {
    console.log(editingContent);
    let isEmpty = false;
    let isInvalidCode = false;
    // Check empty data
    if (editingContent.note) {
      if (editingContent.note.length) {
        editingContent.note.forEach((el: any) => {
          if (el.type == "code") {
            if (!el.data.code) {
              isEmpty = true;
            } else if (!el.data.valid) {
              isInvalidCode = true;
            }
          } else if (!el.data) {
            isEmpty = true;
          }
        });
      } else {
        isEmpty = true;
      }
    }

    if (required && isEmpty) {
      alert("Message", "Please add a text or code in notes");
      return false;
    }

    if (isInvalidCode) {
      // Check valid code
      alert("Message", "Please fix your code and run it again");
      return false;
    }

    return true;
  };

  const highlightLine = (itemIdx: any, lineNumber: any) => {
    // Line number is zero based index
    const actualLineNumber = lineNumber - 1;

    // Select editor loaded in the DOM
    if (document.getElementById("code_" + itemIdx)) {
      const highLightedLinesData = highlightedLines;
      const codeMirrorEle = (
        document.querySelector("#code_" + itemIdx + " .CodeMirror") as any
      ).CodeMirror;
      codeMirrorEle.addLineClass(actualLineNumber, "background", "line-error");
      if (!highLightedLinesData[itemIdx]) {
        highLightedLinesData[itemIdx] = [];
      }
      highLightedLinesData[itemIdx].push(actualLineNumber);
      setHighLightedLines(highLightedLinesData);
    }
  };

  const clearHighlightedLine = (codeIdx: any) => {
    const highLightedLinesData = highlightedLines;
    if (!highLightedLinesData[codeIdx]) {
      return;
    }

    if (document.getElementById("code_" + codeIdx)) {
      const codeMirrorEle = (
        document.querySelector("#code_" + codeIdx + " .CodeMirror") as any
      ).CodeMirror;
      highLightedLinesData[codeIdx].forEach((l: any) => {
        // Set line css class
        codeMirrorEle.removeLineClass(l, "background", "line-error");
      });
    }

    highLightedLinesData[codeIdx] = [];
    setHighLightedLines(highLightedLinesData);
  };

  const copyCode = (codeItem: any) => {
    copyText(codeItem.code);
    success("Code is copied to your clipboard");
  };

  const toggleFullscreen = (idx: any) => {
    if (document.getElementById("code_" + idx)) {
      let isFullscreenData = isFullscreen;
      const codeMirrorEle = (
        document.querySelector("#code_" + idx + " .CodeMirror") as any
      ).CodeMirror;

      isFullscreenData = !isFullscreen;
      codeMirrorEle.setOption("fullScreen", isFullscreenData);
      setCurrentFullscreenItemIdx(idx);
    }
  };

  const onDataChange = (data: any) => {
    for (const k in data) {
      if (k != "hasChanges" && !content[k] && content[k] != data[k]) {
        setContent({
          ...content,
          hasChanges: true,
        });
        return;
      }
    }
    setSection({
      ...section,
      content: {
        ...section.content,
        hasChanges: true,
      },
    });
  };

  const onNoteChange = (id: number, value: any) => {
    const editingContentData = editingContent;
    editingContentData.note[id].data = value;
    setEditingContent(editingContentData);
  };

  const onNoteDataChange = (value: any, id: number) => {
    const editingContentData = editingContent;
    editingContentData.note[id].args = value;
    setEditingContent(editingContentData);
  };

  const aiReviewNotes = () => {
    setReviewing(true);
    getReportData("openai_content_review", {
      courseId: course._id,
      sectionId: section._id,
      contentId: content._id,
      locationId: user.activeLocation,
    })
      .then((res: any) => {
        setEditingContent({
          ...editingContent,
          note: res.data,
        });
        success("Notes is updated");
      })
      .catch(() => {
        alert("Message", "Fail to review this note. Please try again.");
      });
    setReviewing(false);
  };

  const aiCreateNote = () => {
    getSubjectTree(course.subjects.map((s: any) => s._id)).then((res: any) => {
      setSubjects(res.subjects);
      setGeneralNoteModalShow(true);
    });
  };

  const close = () => {
    setGeneralNoteModalShow(false);
  };

  const generateNotes = () => {
    if (!notesGenerateParams.title) {
      alert("Message", "Please enter title");
      return;
    }

    if (!notesGenerateParams.subject) {
      alert("Message", "Please select subject");
      return;
    }
    if (!notesGenerateParams.unit) {
      alert("Message", "Please select unit");
      return;
    }
    if (!notesGenerateParams.topic) {
      alert("Message", "Please select topic");
      return;
    }

    const params: any = {
      summary: notesGenerateParams.title,
      courseId: course._id,
      sectionId: section._id,
      locationId: user.activeLocation,
      userId: user._id,
      subjectId: notesGenerateParams.subject._id,
      unitId: notesGenerateParams.unit._id,
      topicId: notesGenerateParams.topic._id,
    };

    if (notesGenerateParams.testMode != "none") {
      if (!notesGenerateParams.quesNumber) {
        alert("Message", "Please enter number of question");
        return;
      }

      params.testMode = notesGenerateParams.testMode;
      params.quesNumber = notesGenerateParams.quesNumber;
    }

    setProcessing(true);
    let sectionData = section;
    getReportData("openai_create_course_notes", params).then(
      (res: any) => {
        success("Note is created");
        sectionData.contents.push(res.data.note);
        if (notesGenerateParams.testMode != "none") {
          sectionData.contents.push(res.data.test);
        }
        setGeneralNoteModalShow(false);
        Cancel();
      },
      () => {
        alert("Message", "Fail to generate note. Please try again.");
      }
    );
    setSection(sectionData);
    setProcessing(false);
  };

  const clearUnit = () => {
    setNotesGenerateParams({
      notesGenerateParams,
      unit: null,
    });
  };

  const clearTopic = () => {
    setNotesGenerateParams({
      notesGenerateParams,
      topic: null,
    });
  };

  return (
    <>
      {!edit && user.primaryInstitute?.canUseAI && (
        <div className="rounded-boxes bg-white d-flex justify-content-between align-items-center">
          <p>
            You can create notes or notes with their assessment/quiz with help
            of AI
          </p>
          <button className="btn btn-primary" onClick={() => aiCreateNote()}>
            Create Notes using AI
          </button>
        </div>
      )}
      <div className="rounded-boxes bg-white">
        <h4 className="form-box_subtitle">Notes:</h4>

        <input
          type="text"
          name="txtTitle"
          className="form-control border-bottom rounded-0 pl-0 mb-3"
          placeholder="Enter a Title.."
          max={80}
          defaultValue={editingContent?.title}
          onChange={(e) => {
            setEditingContent({
              ...editingContent,
              title: e.target.value,
            });
            let updatedData = editingContent;
            updatedData.title = e.target.value;
            // onDataChange(updatedData);
          }}
        />

        <div className="mb-3">
          <h4 className="form-box_subtitle d-inline">Summary</h4>
          <span className="ml-2">
            {" "}
            (Optional; Quick summary in case student wants to skip reading
            entire notes)
          </span>
        </div>

        <div className="mb-2">
          <CKEditorCustomized
            defaultValue={editingContent?.summary}
            onChangeCon={(data: any) => {
              setEditingContent({
                ...editingContent,
                summary: data,
              });
              let updatedData = editingContent;
              updatedData.summary = data;
              onDataChange(updatedData);
            }}
            config={ckeOptions}
          />
        </div>

        {editingContent?.note?.map((item: any, i: number) => (
          <div
            key={i}
            className="mb-2"
            style={{ maxHeight: "500px", overflow: "auto" }}
          >
            {item.type === "text" && (
              <>
                <CKEditorCustomized
                  defaultValue={item.data}
                  onChangeCon={(data: any) => {
                    onNoteChange(i, data);
                  }}
                  config={ckeOptions}
                />
                <div className="text-right mt-2">
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => remove(i)}
                  >
                    Remove
                  </button>
                </div>
              </>
            )}
            {item.type === "code" && (
              <>
                <div className="border">
                  <div
                    className="d-flex justify-content-between p-1"
                    style={{ background: "#f7f7f7" }}
                  >
                    <div className="d-flex align-items-center">
                      <h4 className="form-box_subtitle d-inline-block mr-3">
                        Language
                      </h4>
                      <div className="filter-area mb-0">
                        <div className="filter-item">
                          <div className="dropdown">
                            <button
                              className="btn dropdown-toggle text-left"
                              type="button"
                              id="codeDropdown"
                              data-toggle="dropdown"
                              aria-haspopup="true"
                              aria-expanded="false"
                            >
                              <span className="pr-5">{item.data.display}</span>
                            </button>
                            <div
                              className="dropdown-menu border-0 py-0"
                              aria-labelledby="codeDropdown"
                            >
                              {languages?.map((lang: any) => (
                                <a
                                  key={lang.value}
                                  className="dropdown-item"
                                  onClick={() =>
                                    onLanguageChanged(item.data, lang)
                                  }
                                >
                                  {lang.display}
                                </a>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="d-flex align-items-center">
                      <div
                        className="mr-3"
                        data-toggle="tooltip"
                        data-placement="top"
                        title="Copy the code"
                      >
                        <a onClick={() => copyCode(item.data)}>
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
                        <a onClick={() => toggleFullscreen(i)}>
                          <figure>
                            <img src="/assets/images/window-icon.png" alt="" />
                          </figure>
                        </a>
                      </div>
                    </div>
                  </div>
                  <div>
                    <CodeMirror
                      value={item.data.code}
                      options={item.data.options}
                      onChange={(e: any) => onCodeChanged(i, item, e)}
                    />
                  </div>
                </div>

                <div className="row my-2">
                  <div className="col">
                    <textarea
                      className="form-control border"
                      name="arguments"
                      defaultValue={item.data.args}
                      onChange={(e) => {
                        const editingContentData = editingContent;
                        editingContentData.note[i].data.args = e.target.value;
                        setEditingContent(editingContentData);
                      }}
                      placeholder="Arguments"
                    />
                  </div>
                  <div className="col">
                    <textarea
                      className="form-control border"
                      name="input"
                      defaultValue={item.data.input}
                      onChange={(e) => {
                        const editingContentData = editingContent;
                        editingContentData.note[i].data.input = e.target.value;
                        setEditingContent(editingContentData);
                      }}
                      placeholder="Input"
                    />
                  </div>
                </div>
                <div>
                  <textarea
                    className="form-control border"
                    rows={3}
                    name="output"
                    defaultValue={item.data.output}
                    readOnly
                    placeholder="Output"
                  />
                </div>
                <div className="text-right mt-2">
                  <button
                    className="btn btn-danger mr-2 btn-sm ml-2"
                    onClick={() => remove(i)}
                  >
                    Remove
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={!item.data.code || item.data.processing}
                    onClick={() => runCode(item.data, i)}
                  >
                    Run
                    {item.data.processing && (
                      <i className="fa fa-spinner fa-pulse"></i>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        <div className="d-flex justify-content-end gap-xs btn-area ml-auto mt-2">
          {edit &&
            user.primaryInstitute?.canUseAI &&
            section.status == "draft" &&
            editingContent.note.length && (
              <button
                disabled={reviewing}
                className="btn btn-primary btn-sm"
                onClick={aiReviewNotes}
              >
                Review the Notes&nbsp;
                {reviewing && <i className="fa fa-spinner fa-pulse"></i>}
              </button>
            )}
          <a className="btn btn-light btn-sm" onClick={addText}>
            Add Text
          </a>
          {settings?.features.coding && (
            <a className="btn btn-light btn-sm" onClick={addCode}>
              Add Code
            </a>
          )}
          <a className="btn btn-light btn-sm" onClick={() => Cancel()}>
            Cancel
          </a>
          <a className="btn btn-primary btn-sm" onClick={saveNote}>
            Save
          </a>
        </div>

        {isFullscreen && (
          <button
            className="btn fullscreen-off"
            onClick={() => toggleFullscreen(currentFullscreenItemIdx)}
          >
            <img src="/assets/images/window-icon.png" alt="" />
          </button>
        )}
      </div>
      <Modal show={generalNoteModalShow} backdrop="static" keyboard={false}>
        <div className="form-boxes">
          <div className="modal-header modal-header-bg justify-content-center">
            <h3 className="form-box_title">
              Create Notes and Quiz/Assessment With AI
            </h3>
          </div>
          <div className="modal-body text-dark">
            <div className="bg-white px-2">
              <div className="form-group">
                <h4 className="form-box_subtitle">Notes Title</h4>
                <input
                  type="text"
                  placeholder="Title"
                  max={200}
                  className="form-control my-0 pl-0 border-bottom"
                  name="note-title"
                  defaultValue={notesGenerateParams.title}
                  onChange={(e) =>
                    setNotesGenerateParams({
                      ...notesGenerateParams,
                      title: e.target.value,
                    })
                  }
                  aria-label="Note title"
                />
              </div>
              <div>
                <div className="row">
                  <div className="col-md-4">
                    <div className="form-group border-bottom">
                      <h4 className="form-box_subtitle">Subject</h4>
                      <select
                        className="form-control border-0 my-0 pl-0"
                        name="subject"
                        value={
                          notesGenerateParams.subject
                            ? notesGenerateParams.subject
                            : ""
                        }
                        onChange={(e) =>
                          setNotesGenerateParams({
                            ...notesGenerateParams,
                            subject: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="" disabled>
                          Select One
                        </option>
                        {subjects?.map((subject: any, index: number) => (
                          <option key={index} value={subject}>
                            {subject.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group border-bottom">
                      <h4 className="form-box_subtitle">Unit</h4>
                      <select
                        className="form-control border-0 my-0 pl-0"
                        name="unit"
                        value={
                          notesGenerateParams.unit
                            ? notesGenerateParams.unit
                            : ""
                        }
                        onChange={(e) =>
                          setNotesGenerateParams({
                            ...notesGenerateParams,
                            unit: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="" disabled>
                          Select One
                        </option>
                        {notesGenerateParams.subject?.units?.map(
                          (unit: any, index: number) => (
                            <option key={index} value={unit}>
                              {unit.name}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group border-bottom">
                      <h4 className="form-box_subtitle">Topic</h4>
                      <select
                        className="form-control border-0 my-0 pl-0"
                        name="topic"
                        value={
                          notesGenerateParams.topic
                            ? notesGenerateParams.topic
                            : ""
                        }
                        onChange={(e) =>
                          setNotesGenerateParams({
                            ...notesGenerateParams,
                            topic: e.target.value,
                          })
                        }
                        required
                      >
                        <option value="" disabled>
                          Select One
                        </option>
                        {notesGenerateParams.unit?.topics?.map(
                          (topic: any, index: number) => (
                            <option key={index} value={topic}>
                              {topic.name}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-4">
                    <div className="form-group">
                      <h4 className="form-box_subtitle">Select Type</h4>
                      <div className="form-row mt-2">
                        <div className="col-auto d-flex align-items-center">
                          <div className="container1 my-0">
                            <div className="radio my-0">
                              <input
                                type="radio"
                                value="quiz"
                                name="testMode"
                                id="quiz"
                                checked={
                                  notesGenerateParams.testMode === "quiz"
                                }
                                onChange={() =>
                                  setNotesGenerateParams({
                                    ...notesGenerateParams,
                                    testMode: "quix",
                                  })
                                }
                              />
                              <label htmlFor="quiz" className="my-0"></label>
                            </div>
                          </div>
                          <div className="rights my-0">Quiz</div>
                        </div>
                        <div className="col-auto d-flex align-items-center">
                          <div className="container1 my-0">
                            <div className="radio my-0">
                              <input
                                type="radio"
                                value="assessment"
                                name="testMode"
                                id="assessment"
                                checked={
                                  notesGenerateParams.testMode === "assessment"
                                }
                                onChange={() =>
                                  setNotesGenerateParams({
                                    ...notesGenerateParams,
                                    testMode: "assessment",
                                  })
                                }
                              />
                              <label
                                htmlFor="assessment"
                                className="my-0"
                              ></label>
                            </div>
                          </div>
                          <div className="rights my-0">Assessment</div>
                        </div>
                        <div className="col-auto d-flex align-items-center">
                          <div className="container1 my-0">
                            <div className="radio my-0">
                              <input
                                type="radio"
                                value="none"
                                name="testMode"
                                id="none"
                                checked={
                                  notesGenerateParams.testMode === "none"
                                }
                                onChange={() =>
                                  setNotesGenerateParams({
                                    ...notesGenerateParams,
                                    testMode: "none",
                                  })
                                }
                              />
                              <label htmlFor="none" className="my-0"></label>
                            </div>
                          </div>
                          <div className="rights my-0">None</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {notesGenerateParams.testMode !== "none" && (
                    <div className="col-md-4">
                      <div className="form-group border-bottom">
                        <h4 className="form-box_subtitle">
                          Number Of Question
                        </h4>
                        <input
                          type="number"
                          min="0"
                          max="60"
                          className="form-control my-0 pl-0"
                          name="quesNumber"
                          value={notesGenerateParams.quesNumber}
                          onChange={(e) =>
                            setNotesGenerateParams({
                              ...notesGenerateParams,
                              quesNumber: e.target.value,
                            })
                          }
                          aria-label="Enter the Number Of Question"
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <button
                    className="btn btn-outline mr-2"
                    onClick={close}
                    disabled={processing}
                  >
                    Close
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={generateNotes}
                    disabled={processing}
                  >
                    Generate&nbsp;
                    <i
                      className={processing ? "fa fa-spinner fa-pulse" : ""}
                    ></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default NoteEditorComponent;
