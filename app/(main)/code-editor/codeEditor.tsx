"use client";
import React, { useState, useEffect, useRef } from "react";
import { Dropdown, Pagination } from "react-bootstrap";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { WebLinksAddon } from "xterm-addon-web-links";
// import { LocalEchoController } from "xterm-addon-local-echo";
import LocalEchoController from "local-echo";
import CustomPagination from "@/components/CustomPagenation";
import ToggleComponent from "@/components/ToggleComponent";
import { Modal } from "react-bootstrap";
import { EditorView } from "@codemirror/view";

import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { fromEvent, Subject, Subscription } from "rxjs";
import { setWsHeartbeat } from "ws-heartbeat/client";
import { useParams } from "react-router-dom";
import alertify from "alertifyjs";
import TagInput from "react-tag-input";
import clientApi from "@/lib/clientApi";
import { trimEnd } from "@/lib/helpers";
import { useSession } from "next-auth/react";
import * as settingSvc from "@/services/settingService";
import * as authSvc from "@/services/auth";
import * as eventBusSvc from "@/services/eventBusService";
import * as codesnippetSvc from "@/services/codesnippetService";
import * as socketSvc from "@/services/socket-service";
import { fromNow } from "@/lib/pipe";
import { TagsInput } from "react-tag-input-component";
import { useSocket } from "@/contexts/SocketContext";

import {
  getCodeLanguages,
  testcaseToString,
  codeOuputCompare,
  asyncConfirm,
  ConfirmResult,
  copyText,
} from "@/lib/helpers";
import { useRouter, useSearchParams } from "next/navigation";
import { download } from "@/lib/common";
import CodeMirror from "@uiw/react-codemirror";
import { okaidia } from "@uiw/codemirror-theme-okaidia";
import { javascript } from "@codemirror/lang-javascript";
import { cpp } from "@codemirror/lang-cpp";
import { java } from "@codemirror/lang-java";
import { python } from "@codemirror/lang-python";

import { createTheme } from "@uiw/codemirror-themes";
import { tags as t } from "@lezer/highlight";
import { title } from "process";

const CodeEditor = () => {
  const queryParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState<any>(1);
  const { emit, on, off } = useSocket();
  const [selectedLang, setSelectedLang] = useState<any>(null);
  const [languages, setLanguages] = useState<any[]>([]);
  const [saveModal, setSaveModal] = useState<boolean>(true);
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
  const [codemirrorConfig, setCodemirrorConfig] = useState<any>({
    theme: "default",
    lineNumbers: true,
    fullScreen: false,
    lineWrapping: true,
    foldGutter: true,
    autoCloseBrackets: "()[]{}''\"\"",
    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
    mode: "text/x-java",
    extraKeys: {
      "Ctrl-Space": "autocomplete",
    },
    matchBrackets: true,
  });
  const codeSrc = useRef(null);
  const [line, setLine] = useState<number>(1);
  const [col, setCol] = useState<number>(1);
  const [codemirrorOptions, setCodemirrorOptions] = useState<any>({
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
  });

  const [codeMirrorCompileOptions, setCodeMirrorCompileOptions] = useState<any>(
    {
      readOnly: "nocursor",
    }
  );
  const [highlightedLines, setHighlightedLines] = useState<any>([]);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [processing, setProcessing] = useState<boolean>(false);
  const [isVertical, setIsVertical] = useState<boolean>(false);
  const [showLibrary, setShowLibrary] = useState<boolean>(false);
  const [txtCodeSearch, setTxtCodeSearch] = useState<string>("");

  const user: any = useSession()?.data?.user?.info || {};
  const terminalRef = useRef(null);
  const [term, setTerm] = useState<Terminal | null>(null);
  const [fitAddon, setFitAddon] = useState<FitAddon | null>(null);
  const [localEcho, setLocalEcho] = useState<any>(null);
  const [isReading, setIsReading] = useState<boolean>(false);
  const [outputChanged] = useState(() => new Subject<string>());
  const [codeEngineAddress, setCodeEngineAddress] = useState<string>("");
  const [ws, setWs] = useState<any>(null);
  const [cachedOutput, setCacheOutput] = useState<string>("");
  const [serverConnected, setServerConnected] = useState<boolean>(false);
  const [argument, setArgument] = useState<string>("");
  const [loadingCodeSnippet, setLoadingCodeSnippet] = useState<boolean>(false);
  const [codeSnippetParams, setCodeSnippetParams] = useState<any>({
    skip: 0,
    limit: 15,
    page: 1,
    search: "",
  });
  const [totalSnippets, setTotalSnippets] = useState<number>(0);
  const [codeSnippets, setCodeSnippets] = useState<any>([]);
  const [editingSnippet, setEditingSnippet] = useState<any>({
    tags: [],
    code: "",
    language: "",
    pairCoding: false,
  });
  const [executeSubscription, setExecuteSubscription] = useState<any>(null);
  const [settings, setSettings] = useState<any>([]);
  const [unsavedCode, setUnsaveCode] = useState<string>("");
  const [excludedIntelliSenseTriggerKeys, setExcludedIntelliSenseTriggerKeys] =
    useState<any>({
      "8": "backspace",
      "9": "tab",
      "13": "enter",
      "16": "shift",
      "17": "ctrl",
      "18": "alt",
      "19": "pause",
      "20": "capslock",
      "27": "escape",
      "33": "pageup",
      "34": "pagedown",
      "35": "end",
      "36": "home",
      "37": "left",
      "38": "up",
      "39": "right",
      "40": "down",
      "45": "insert",
      "46": "delete",
      "91": "left window key",
      "92": "right window key",
      "93": "select",
      "107": "add",
      "109": "subtract",
      "110": "decimal point",
      "111": "divide",
      "112": "f1",
      "113": "f2",
      "114": "f3",
      "115": "f4",
      "116": "f5",
      "117": "f6",
      "118": "f7",
      "119": "f8",
      "120": "f9",
      "121": "f10",
      "122": "f11",
      "123": "f12",
      "144": "numlock",
      "145": "scrolllock",
      "186": "semicolon",
      "187": "equalsign",
      "188": "comma",
      "189": "dash",
      "190": "period",
      "191": "slash",
      "192": "graveaccent",
      "220": "backslash",
      "222": "quote",
    });
  const [usersCursor, setUsersCursor] = useState<any>({});

  const [typing, setTyping] = useState<boolean>(false);
  const [peer, setPeer] = useState<any>(null);
  const typingSubject = new Subject();
  const [peerExecuting, setPeerExecuting] = useState<any>(false);
  const [editCodeSnippetModal, setEditCodeSnippetModal] =
    useState<boolean>(false);
  const [undoHistory, setUndoHistory] = useState([]);
  const [redoHistory, setRedoHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const println = (message: string) => {
    if (term) {
      const normInput = message.replace(/[\r\n]+/g, "\n");
      term.write(normInput.replace(/\n/g, "\r\n"));
    } else {
      console.error(
        "Terminal is not initialized yet, Cannot print message:",
        message
      );
    }
  };

  useEffect(() => {
    on("on.pair.coding", (data) => {
      console.log(data, "pira");
    });

    return () => {
      // Cleanup listeners if needed
    };
  }, [on]);

  const getClientDataFunc = async () => {
    const { data } = await clientApi.get(`/api/settings`);
    setSettings(data);
  };

  useEffect(() => {
    getClientDataFunc();
    const lang = getCodeLanguages();
    setLanguages(lang);
    lang.forEach((l) => (l.code = ""));
    setLanguages(lang);
    const lastLang = localStorage.getItem(user._id + "_last_code_lang");
    const updated_selectedLang = lastLang
      ? lang.find((l) => l.language == lastLang)
      : lang.find((l) => l.language == "java");
    setSelectedLang(updated_selectedLang);
    setEditingSnippet({
      code: "",
      language: updated_selectedLang?.language,
      tags: [],
      pairCoding: false,
    });
    setUnsaveCode("");
    clear();
    settingSvc.getCodeEngineAddress().then((codeEngine: any) => {
      setCodeEngineAddress(codeEngine.url);
      connectToCodeEngineServer(codeEngine.url);
    });

    handleWindowResize();
    console.log("errr", updated_selectedLang);
    loadCodeSnippet(true, updated_selectedLang);

    const savedSnippet = sessionStorage.getItem(
      `current-code-snippet-${user._id}`
    );
    if (savedSnippet) {
      const toOpen = JSON.parse(savedSnippet);

      onLanguageChanged(lang.find((l) => l.language == toOpen.language));
      changeEditingSnippet(toOpen);
      setUnsaveCode(toOpen.code);
      refreshCodeMirror(false);
    } else if (queryParams.get("snippet")) {
      codesnippetSvc
        .getByUId(queryParams.get("snippet"))
        .then((snippet: any) => {
          console.log(snippet, "snippet");
          onLanguageChanged(
            lang.find((l) => l.language == snippet.language),
            snippet
          );
          changeEditingSnippet(snippet);
          setUnsaveCode(snippet.code);
          refreshCodeMirror(!editingSnippet.canPairEdit);
        });
    }
  }, [term]);

  useEffect(() => {
    const subscription = outputChanged
      .pipe(debounceTime(500))
      .subscribe((output) => {
        handleWSMessage(output);
      });

    return () => {
      subscription.unsubscribe(); // Clean up the subscription
    };
  }, [outputChanged]);

  useEffect(() => {
    const fetchData = async () => {
      setTimeout(() => {
        initializeCodeMirror();
      }, 1000);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (editingSnippet) {
      on("on.pair.coding", ({ snippet }) => {
        if (editingSnippet._id === snippet) {
          emit("join.pair.coding", { snippet: editingSnippet._id });
          setEditingSnippet((prev) => ({ ...prev, pairCoding: true }));
        }
      });

      on("off.pair.coding", ({ snippet }) => {
        if (editingSnippet._id === snippet) {
          setEditingSnippet((prev) => ({ ...prev, pairCoding: false }));
        }
      });

      // Other socket event listeners...
      on(
        "changes.pair.coding",
        ({ snippet, user, userName, changes }: any) => {
          if (editingSnippet._id == snippet && user != user._id && codeSrc) {
            if (usersCursor[user]) {
              usersCursor[user].clear();
              setUsersCursor((prevUsersCursor) => ({
                ...prevUsersCursor,
                [user]: null,
              }));
            }
            setEditingSnippet({
              ...editingSnippet,
              applyChanges: true,
            });
            changes.forEach(({ from, to, text, removed, origin }: any) => {
              const cursorCoords = codeSrc.current.codeMirror.cursorCoords(
                changes[changes.length - 1].to
              );
            });
            setEditingSnippet({
              ...editingSnippet,
              applyChanges: false,
            });
            const cursorCoords = codeSrc.current.codeMirror.cursorCoords(
              changes[changes.length - 1].to
            );

            setUsersCursor((prevUsersCursor) => ({
              ...prevUsersCursor,
              [user]: codeSrc.current.codeMirror.setBookmark(
                {
                  line: changes[changes.length - 1].to.line,
                  ch: changes[changes.length - 1].to.ch + 1,
                },
                { widget: createCursorElement(cursorCoords, userName) }
              ),
            }));

            setPeer(userName);
            setTyping(true);

            typingSubject.next(typing);
          }
        },
        "pair-coding"
      );

      on(
        "cursor.pair.coding",
        ({ snippet, user, userName, cursor }: any) => {
          if (editingSnippet._id == snippet && user != user._id && codeSrc) {
            if (usersCursor[user]) {
              usersCursor[user].clear();
              setUsersCursor((prevUsersCursor) => ({
                ...prevUsersCursor,
                [user]: null,
              }));
            }

            const cursorCoords =
              codeSrc.current.codeMirror.cursorCoords(cursor);

            // Set the generated DOM node at the position of the cursor sent from another client
            // setBookmark first argument: The position of the cursor sent from another client
            // Second argument widget: Generated DOM node

            setUsersCursor((prevUsersCursor) => ({
              ...prevUsersCursor,
              [user]: odeSrc.current.codeMirror.setBookmark(cursor, {
                widget: createCursorElement(cursorCoords, userName),
              }),
            }));
          }
        },
        "pair-coding"
      );

      on(
        "execute.pair.coding",
        ({ snippet, user, userName, status, output }: any) => {
          if (editingSnippet._id == snippet && user != user._id) {
            setPeer(userName);
            const status = "executing";
            setPeerExecuting("executing");
            if (status == "executing") {
              println(`${userName} is executing code...`);
            } else if (status == "output") {
              const lines = output.split("\r\n");

              for (let i = 0; i < lines.length; i++) {
                println(lines[i]);
              }
            } else if (status == "executed") {
              if (
                output.result[0] &&
                output.result[0].err &&
                output.result[0].err.length
              ) {
                let msg = "";
                for (const e of output.result[0].err) {
                  msg += trimErrorMessage(e) + "\n";
                }
                handleError(output.result[0].err);

                println(msg);
              }
              // setTimeout(() => {
              readUserInput();
              // }, 500);
            } else if (output) {
              println(output);
              // setTimeout(() => {
              readUserInput();
              // }, 500);
            }
          }
        },
        "pair-coding"
      );

      on(
        "canEdit.pair.coding",
        ({ snippet, canEdit }: any) => {
          if (editingSnippet._id == snippet) {
            setEditingSnippet({
              ...editingSnippet,
              canPairEdit: canEdit,
            });
            alertify.warning(
              "Pair Editing is " + (canEdit ? "enabled" : "disabled")
            );

            // change code mirror option base on this
            setCodemirrorConfig({
              ...codemirrorConfig,
              readOnly: !canEdit,
            });
            refreshCodeMirror(!editingSnippet.canPairEdit);
          }
        },
        "pair-coding"
      );

      typingSubject.pipe(debounceTime(500)).subscribe(() => {
        setTyping(false);
      });
    }

    return () => {
      if (editingSnippet.pairCoding) {
        // if owner leave turn off pair coding
        if (editingSnippet.user == user._id) {
          codesnippetSvc
            .changePairCoding(
              editingSnippet._id,
              false,
              editingSnippet.canPairEdit
            )
            .then(() => {});
        }

        emit("off.pair.coding", { snippet: editingSnippet._id });
      }
      off("pair-coding");
    };
  }, []);

  // useEffect(() => {
  //   if (!term || !fitAddon || !localEcho || !terminalRef.current) {
  //     return;
  //   }

  //   term.loadAddon(fitAddon);
  //   term.loadAddon(new WebLinksAddon());
  //   term.loadAddon(localEcho);
  //   term.open(terminalRef.current);
  //   fitAddon.fit();

  //   return () => {
  //     term.dispose();
  //   };
  // }, [term, fitAddon, localEcho]);

  const initializeCodeMirror = () => {
    // codeMirrorLoaded()
    codeMirrorLoaded(codeSrc.current.codeMirror);
    const termInstance = new Terminal({
      cursorBlink: true,
      scrollback: 1000,
      tabStopWidth: 4,
      theme: {
        background: "white",
        foreground: "black",
        cursor: "#333",
        selection: "#005cc5",
      },
    });
    const fitAddonInstance = new FitAddon();
    const localEchoInstance = new LocalEchoController();

    termInstance.loadAddon(fitAddonInstance);
    termInstance.loadAddon(new WebLinksAddon());
    termInstance.loadAddon(localEchoInstance);

    termInstance.open(terminalRef.current);
    fitAddonInstance.fit();

    // termInstance.onKey((e) => {
    //   const printable =
    //     !e.domEvent.altKey &&
    //     !e.domEvent.altGraphKey &&
    //     !e.domEvent.ctrlKey &&
    //     !e.domEvent.metaKey;
    //   console.log(e.key, "ekey");
    //   if (e.key === "Enter") {
    //     termInstance.write("\r\n");
    //   } else if (e.key === "Backspace") {
    //     // Do something when backspace is pressed
    //   } else if (printable) {
    //     termInstance.write(e.key);
    //   }
    // });

    const spanElement = document.querySelector(".xterm-char-measure-element");

    // Check if the span element exists
    if (spanElement) {
      // Remove the text content from the span element
      spanElement.innerText = "";
    }

    setTerm(termInstance);

    setFitAddon(fitAddonInstance);
    setLocalEcho(localEchoInstance);
  };

  outputChanged.pipe(debounceTime(500)).subscribe((output) => {
    handleWSMessage(output);
  });

  const createCursorElement = (cursorCoords: any, userName: any) => {
    const wrapper = document.createElement("div");
    wrapper.style.display = "inline-block";

    const cursorElement = document.createElement("span");
    cursorElement.style.borderLeftStyle = "solid";
    cursorElement.style.borderLeftWidth = "2px";
    cursorElement.style.borderLeftColor = "#ff0000";
    cursorElement.style.height = `${cursorCoords.bottom - cursorCoords.top}px`;
    cursorElement.style.padding = "0";
    cursorElement.style.zIndex = "0";

    const nameElement = document.createElement("span");
    nameElement.style.position = "absolute";
    nameElement.style.top = "-10px";
    nameElement.style.left = cursorCoords.left - 45 + "px";
    nameElement.style.background = "lightgreen";
    nameElement.style.border = "1px solid lightblue";
    nameElement.style.padding = "0px 5px";
    nameElement.innerHTML = userName;

    wrapper.appendChild(cursorElement);
    wrapper.appendChild(nameElement);

    return wrapper;
  };

  const connectToCodeEngineServer = (address?: string) => {
    console.log("here");
    if (!address) {
      address = codeEngineAddress;
    }
    const protocol = address.startsWith("https") ? "wss" : "ws";
    const trimAddress = address.replace("https", "").replace("http", "");
    const wsUrl = `${protocol}${trimAddress}wsconsole?userId=${user._id}`;
    const wsInstance = new WebSocket(wsUrl);

    setWs(wsInstance);
    setWsHeartbeat(wsInstance, '{"kind":"ping"}', {
      pingTimeout: 60 * 2 * 1000,
      pingInterval: 30 * 1000,
    });

    println("Connecting to code engine...\r\n");
    wsInstance.onerror = (ev) => {
      println("Failed to connect.");
    };
    wsInstance.onopen = () => {
      setServerConnected(true);
      println("Connected.\r\n");
      readUserInput();
    };
    wsInstance.onclose = () => {
      stopUserInput();
      println("Disconnected.");
      setServerConnected(false);
      setWs(null);

      println("Trying to reconnect in 30 seconds.");
      setTimeout(() => {
        connectToCodeEngineServer();
      }, 30 * 1000);
    };
    wsInstance.onmessage = (ev) => {
      if (ev.data === '{"kind":"pong"}') {
        // Handle ping-pong
      } else {
        setCacheOutput(cachedOutput + ev.data);
        outputChanged.next(cachedOutput);
      }
    };
  };

  const handleWSMessage = (data: any) => {
    stopUserInput();
    data = data.replace(/\n/g, "\r\n");

    let isDone = false;
    if (data.indexOf("P_END") > -1) {
      isDone = true;
      data = data.replace("P_END", "");
      data = trimEnd(data);
    }

    const lines = data.split("\r\n");

    for (let i = 0; i < lines.length; i++) {
      if (isDone) {
        println(lines[i]);
      } else {
        if (i == lines.length - 1) {
          readUserInput(lines[i]);
        } else {
          println(lines[i]);
        }
      }
    }
    setCacheOutput("");

    if (isDone) {
      setProcessing(false);
      readUserInput();
    }

    if (editingSnippet.pairCoding && editingSnippet.loaded) {
      emit("execute.pair.coding", {
        snippet: editingSnippet._id,
        user: user._id,
        userName: user.name,
        status: "output",
        output: data,
      });
    }
  };

  const handleWindowResize = () => {
    fromEvent(window, "resize")
      .pipe(debounceTime(1500), distinctUntilChanged())
      .subscribe((event) => {
        fitAddon.fit();
      });
  };

  const read = (prompt, continuationPrompt = "> ") => {
    return new Promise((resolve, reject) => {
      term.write(prompt);
      // this._activePrompt = {
      //   prompt,
      //   continuationPrompt,
      //   resolve,
      //   reject
      // };

      // this._input = "";
      // this._cursor = 0;
      // this._active = true;
    });
  };

  const readUserInput = (prefix?: any) => {
    setIsReading(true);
    const nextPrefix = prefix ? prefix : processing ? "" : "~$ ";

    read(nextPrefix, "> ")
      .then((input) => {
        if (ws) {
          ws.send(input);
          if (editingSnippet.pairCoding && editingSnippet.loaded) {
            emit("execute.pair.coding", {
              snippet: editingSnippet._id,
              user: user._id,
              userName: user.name,
              status: "output",
              output: input,
            });
          }
        }
      })
      .catch((error) => {
        setIsReading(false);

        if (error != "aborted") {
          println(`Error reading: ${error}`);
        }
      });
  };

  const stopUserInput = () => {
    console.log("stopUserInput");

    if (isReading) {
      setIsReading(false);
      localEcho.abortRead();
    }
  };

  const refreshCodeMirror = (readOnly = false) => {
    // setCodemirrorConfig({
    //   ...codemirrorConfig,
    //   mode: codemirrorOptions[selectedLang.language].mode,
    //   readOnly: readOnly,
    // });
    // if (codeSrc) {
    //   // codeSrc.current.codeMirror.refresh();
    // }
  };

  const codeMirrorLoaded = (editor: any) => {
    if (!editor) {
      return;
    }

    // Editor part
    const doc = editor.getDoc();

    // Events
    editor.on("cursorActivity", (instance) => {
      const cursor = doc.getCursor();
      setLine(cursor.line + 1);
      setCol(cursor.ch + 1);

      if (editingSnippet.pairCoding && editingSnippet.loaded) {
        emit("cursor.pair.coding", {
          snippet: editingSnippet._id,
          user: user._id,
          userName: user.name,
          cursor: cursor,
        });
      }
    });

    editor.on("changes", (editor: any, changes: any[]) => {
      if (editingSnippet.applyChanges) {
        return;
      }
      if (editingSnippet.pairCoding && editingSnippet.loaded) {
        emit("changes.pair.coding", {
          snippet: editingSnippet._id,
          user: user._id,
          userName: user.name,
          changes: changes,
        });
      }
      setEditingSnippet({
        ...editingSnippet,
        loaded: true,
      });
      // const cursor = doc.getCursor();
      // const token = editor.getTokenAt(cursor);

      // if (!editor.state.completionActive &&
      //   !this.ExcludedIntelliSenseTriggerKeys[(event.keyCode || event.which).toString()] &&
      //   (token.type == "tag" || token.string == " " || token.string == "<" || token.string == "/")) {
      //   CodeMirror.commands.autocomplete(editor, null, { completeSingle: false });
      // }
    });
  };

  const onLanguageChanged = async (lang: any, newSnippet?: any) => {
    if (lang != selectedLang) {
      if (await checkUnsavedCode()) {
        setSelectedLang(lang);
        changeEditingSnippet({
          ...newSnippet,
          language: lang.language,
        });
        setUnsaveCode("");
        localStorage.setItem(user._id + "_last_code_lang", lang.language);

        refreshCodeMirror();

        loadCodeSnippet(true);
      }
    }
  };

  const execute = () => {
    if (!editingSnippet.code || processing) {
      return;
    }

    setProcessing(true);
    clearHighlightedLine();

    const args = argument ? argument.split(" ").join("\r\n") : "";

    if (editingSnippet.pairCoding && editingSnippet.loaded) {
      emit("execute.pair.coding", {
        snippet: editingSnippet._id,
        user: user._id,
        userName: user.name,
        status: "executing",
        output: "",
      });
    }

    const sub = clientApi
      .post(`${codeEngineAddress}${editingSnippet.language}`, {
        userId: user._id,
        code: editingSnippet.code,
        testcases: [{ input: "", args: args }],
      })
      .then((output) => {
        if (editingSnippet.pairCoding && editingSnippet.loaded) {
          emit("execute.pair.coding", {
            snippet: editingSnippet._id,
            user: user._id,
            userName: user.name,
            status: "executed",
            output: output,
          });
        }
        setProcessing(false);
        stopUserInput();
        setEditingSnippet({
          ...editingSnippet,
          output: JSON.stringify(output, null, "\t"),
        });
        if (
          output.data.result[0] &&
          output.data.result[0].out &&
          output.data.result[0].out.length
        ) {
          // setTimeout(() => {
          println(output.data.result[0].out);

          readUserInput();
          // }, 300);
        }

        if (
          output.data.result[0] &&
          output.data.result[0].err &&
          output.data.result[0].err.length
        ) {
          let msg = "";
          for (const e of output.data.result[0].err) {
            msg += trimErrorMessage(e) + "\n";
          }
          handleError(output.data.result[0].err);

          // setTimeout(() => {
          println(msg);

          readUserInput();
          // }, 300);
        }
      })
      .catch((res) => {
        stopUserInput();
        setProcessing(false);

        setEditingSnippet({
          ...editingSnippet,
          output: "",
        });
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
            lines.forEach((l) => {
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

          setEditingSnippet({
            ...editingSnippet,
            output: msg,
          });
          // setTimeout(() => {
          println(msg);
          readUserInput();
          // }, 500);
        } else {
          // setTimeout(() => {
          readUserInput();
          // }, 200);
        }
        if (editingSnippet.pairCoding && editingSnippet.loaded) {
          emit("execute.pair.coding", {
            snippet: editingSnippet._id,
            user: user._id,
            userName: user.name,
            status: "executing",
            output: msg,
          });
        }
      });
    setExecuteSubscription(sub);
    return () => {
      if (executeSubscription) {
        executeSubscription.unsubscribe();
      }
    };
  };

  const stop = () => {
    ws.send("P_KILL");
  };

  const handleError = (errors: any) => {
    // Extract the line number
    let lines = [];
    for (const err of errors) {
      if (err.indexOf("\n") > -1) {
        lines = err.split("\n");
      } else {
        lines.push(err);
      }
      lines.forEach((l: string) => {
        if (l.startsWith("In function")) {
          const idx = l.indexOf(":");
          if (idx > -1) {
            l = l.substring(idx).replace(":", "");
          }

          const lineNum = parseInt(l, 6);
          if (!isNaN(lineNum)) {
            highlightLine(lineNum);
          }
        } else if (l.indexOf("line ") > -1) {
          const idx = l.indexOf("line ");
          l = l.substring(idx).replace("line ", "");

          const lineNum = parseInt(l);
          if (!isNaN(lineNum)) {
            highlightLine(lineNum);
          }
        }
      });
    }
  };

  const highlightLine = (lineNumber: any) => {
    // Line number is zero based index
    const actualLineNumber = lineNumber - 1;

    // Select editor loaded in the DOM
    if (codeSrc) {
      codeSrc.current.codeMirror.addLineClass(
        actualLineNumber,
        "background",
        "line-error"
      );
      highlightedLines.push(actualLineNumber);
    }
  };

  const clearHighlightedLine = () => {
    if (codeSrc) {
      highlightedLines.forEach((l) => {
        // Set line css class
        codeSrc.current.codeMirror.removeLineClass(
          l,
          "background",
          "line-error"
        );
      });
    }

    setHighlightedLines([]);
  };

  const undo = () => {
    const prevIndex = historyIndex - 1;
    const prevValue = undoHistory[prevIndex];
    setEditingSnippet({
      ...editingSnippet,
      code: prevValue,
    });
    setHistoryIndex(prevIndex);
    setRedoHistory([...redoHistory, prevValue]);
  };

  const redo = () => {
    console.log("redo");
    if (historyIndex < undoHistory.length - 1) {
      const nextIndex = historyIndex + 1;
      const nextValue = undoHistory[nextIndex];
      setEditingSnippet({
        ...editingSnippet,
        code: nextValue,
      });
      setHistoryIndex(nextIndex);
      setUndoHistory([...undoHistory, nextValue]);
    }
  };

  const save = (saveTemplate: any) => {
    if (editingSnippet._id && editingSnippet.user == user._id) {
      codesnippetSvc
        .updateFunc(editingSnippet._id, editingSnippet.code)
        .then((res) => {
          alertify.success("Code is saved.");
          setUnsaveCode(editingSnippet.code);
          const tomove = codeSnippets.findIndex(
            (s) => s._id == editingSnippet._id
          );
          if (tomove > -1) {
            const tmp = codeSnippets.splice(tomove, 1);
            const cde_tmp = codeSnippets.unshift(tmp[0]);
            setCodeSnippets(cde_tmp);
          }
        });
    } else {
      delete editingSnippet._id;
      delete editingSnippet.user;
      openCodeSnippetModal(saveTemplate);
    }
  };

  const copy = () => {
    const listener = (e: ClipboardEvent) => {
      e.clipboardData.setData("text/plain", editingSnippet.code);
      e.preventDefault();
      alertify.success("Code is copied to clipboard.");
    };

    document.addEventListener("copy", listener);
    document.execCommand("copy");
    document.removeEventListener("copy", listener);
  };

  const downloadFunc = () => {
    if (!editingSnippet.code) {
      return;
    }
    const fileName =
      "code." + codemirrorOptions[editingSnippet.language].fileExt;

    download(
      document,
      fileName,
      "data:text/plain;charset=utf-8," + encodeURIComponent(editingSnippet.code)
    );
  };

  const newCodeSnippet = async () => {
    if (await checkUnsavedCode()) {
      changeEditingSnippet({
        code: "",
        language: selectedLang?.language,
        tags: [],
      });
      setUnsaveCode("");
      clear();
      if (showLibrary) {
        toggleLibrary();
      }
      refreshCodeMirror();
    }
  };

  const checkUnsavedCode = async () => {
    if (unsavedCode != editingSnippet.code) {
      const confirm = await asyncConfirm(
        "Unsaved Code",
        "Your code will be lost if you don`t save it, do you want to continue?"
      );
      return confirm == ConfirmResult.OK;
    }

    return true;
  };

  const downloadSnippet = (snippet: any) => {
    const fileName =
      snippet.title + "." + codemirrorOptions[snippet.language].fileExt;

    download(
      document,
      fileName,
      "data:text/plain;charset=utf-8," + encodeURIComponent(snippet.code)
    );
  };

  const getSharedLink = (snippet: any) => {
    console.log(settings, "settings");
    copyText(settings.baseUrl + "code-editor" + "?snippet=" + snippet.uid);
    alertify.success("Snippet link is copied to clipboard");
  };

  const rotate = () => {
    setIsVertical(!isVertical);
    setTimeout(() => {
      fitAddon.fit();
    }, 500);
  };

  const changeTheme = () => {
    if (codemirrorConfig.theme === "default") {
      console.log("white");
      // Apply the new configuration to the CodeMirror instance
      setMyTheme(okaidia);
      setCodemirrorConfig({
        ...codemirrorConfig,
        theme: "monokai",
      });
      const tmp_term = term;

      tmp_term.options.theme = {
        background: "#272822",
        foreground: "#f8f8f2",
        cursor: "white",
        selection: "#22863a",
      };
      setTerm(tmp_term);
      console.log(term.options.theme, "term");
    } else {
      setMyTheme(
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
      setCodemirrorConfig({
        ...codemirrorConfig,
        theme: "default",
      });
      term.options.theme = {
        background: "white",
        foreground: "black",
        cursor: "#333",
        selection: "#005cc5",
      };
    }
  };

  const fullscreen = () => {
    const elem = document.querySelector(".inner-editor");
    setIsFullscreen(!fullscreen);
    elem.requestFullscreen();
  };

  const trimErrorMessage = (err: string) => {
    return err ? err.replace(/File\s("|"\/|"\/app\/)assets([^,]+),\s/, "") : "";
  };

  const clear = () => {
    stopUserInput();

    setTimeout(() => {
      term.clear();
    }, 200);
    // setTimeout(() => {
    readUserInput();
    // }, 200);
  };

  const toggleLibrary = () => {
    setShowLibrary(!showLibrary);
    setTimeout(() => {
      fitAddon.fit();
    }, 100);
  };

  const onCodeChanged = (ev: any) => {
    if (highlightedLines && highlightedLines.length) {
      clearHighlightedLine();
    }
  };

  const loadCodeSnippet = (reload?: any, lang?: any) => {
    if (loadingCodeSnippet) {
      return;
    }
    setLoadingCodeSnippet(true);
    if (!lang) {
      lang = selectedLang;
    }
    let tmp_params: any = codeSnippetParams;
    if (reload) {
      setCodeSnippetParams({
        ...codeSnippetParams,
        skip: 0,
        language: lang?.language,
      });
      tmp_params = {
        ...codeSnippetParams,
        skip: 0,
        language: lang?.language,
      };
    }
    const query = { ...tmp_params, count: reload };
    console.log(query, "query");
    codesnippetSvc
      .findFunc(query)
      .then((res) => {
        setCodeSnippets(res.snippets);
        if (reload) {
          setTotalSnippets(res.count);
        }
        setLoadingCodeSnippet(false);
      })
      .catch((err) => {
        console.error(err);
        setLoadingCodeSnippet(false);
      });
  };

  const searchCode = (e: any) => {
    e.preventDefault();

    loadCodeSnippet(true);
  };

  const snippetPageChanged = (ev: any) => {
    setCurrentPage(ev);

    setCodeSnippetParams({
      ...codeSnippetParams,
      skip: (codeSnippetParams.page - 1) * codeSnippetParams.limit,
    });
    loadCodeSnippet();
  };

  const openCodeSnippetModal = (template: any) => {
    if (template === "editCodeSnippetModal") {
      if (editingSnippet.code) {
        setEditCodeSnippetModal(true);
      }
    }
    // if (this.editingSnippet.code) {
    //   this.editCodeSnippetModalRef = this.modalSvc.show(template, { backdrop: 'static', keyboard: false, ignoreBackdropClick: true })
    // }
  };

  const saveCode = (form?: any) => {
    if (editingSnippet.title) {
      const tmp_eidignsnippet = {
        ...editingSnippet,
        loaded: true,
      };
      codesnippetSvc.createFunc(tmp_eidignsnippet).then((res: any) => {
        setEditingSnippet({
          ...tmp_eidignsnippet,
          _id: res._id,
          uid: res.uid,
          user: res.user,
          userName: user.name,
          updatedAt: res.updatedAt,
        });

        setUnsaveCode(editingSnippet.code);
        const tmp = codeSnippets;
        tmp.unshift(res);
        setCodeSnippets(tmp);
        setEditCodeSnippetModal(false);
        // if (editCodeSnippetModalRef) {
        //   this.editCodeSnippetModalRef.hide();
        // }
      });
    }
  };

  const closeEditModal = () => {
    setEditCodeSnippetModal(false);
    // if (this.editCodeSnippetModalRef) {
    //   this.editCodeSnippetModalRef.hide()
    if (!editingSnippet._id) {
      setEditingSnippet({
        ...editingSnippet,
        title: "",
        description: "",
        tags: [],
      });
    }
    // }
  };

  const deleteCode = (snippet: any) => {
    alertify.confirm(
      "Are you sure you want to delete this code snippet?",
      (msg) => {
        codesnippetSvc.deleteFunc(snippet._id).then((res) => {
          alertify.success("Code snippet is deleted");
          const idx = codeSnippets.findIndex((s) => s._id == snippet._id);
          if (idx > -1) {
            const tmp = codeSnippets;
            tmp.splice(idx, 1);
            setCodeSnippets(tmp);
          }
        });
      }
    );
  };

  const changeEditingSnippet = (newSnippet: any) => {
    if (editingSnippet.pairCoding) {
      // if owner leave turn off pair coding
      if (editingSnippet.user == user._id) {
        codesnippetSvc
          .changePairCoding(
            editingSnippet._id,
            false,
            editingSnippet.canPairEdit
          )
          .then(() => {});
      }
      emit("off.pair.coding", { snippet: editingSnippet._id });
      setEditingSnippet({
        ...editingSnippet,
        pairCoding: false,
      });
    }

    setEditingSnippet(newSnippet);

    if (editingSnippet.pairCoding) {
      emit("join.pair.coding", { snippet: editingSnippet._id });
    }
    if (editingSnippet._id) {
      sessionStorage.setItem(
        `current-code-snippet-${user._id}`,
        JSON.stringify(editingSnippet)
      );
    }
  };

  const getCode = async (snippet: any) => {
    if (await checkUnsavedCode()) {
      changeEditingSnippet(snippet);
      setUnsaveCode(snippet.code);
      setSelectedLang(languages.find((l) => l.language == snippet.language));

      refreshCodeMirror();
      setShowLibrary(false);
    }
  };

  const togglePairCoding = (val: any) => {
    console.log("ddd");
    setEditingSnippet({
      ...editingSnippet,
      pairCoding: val,
    });
    codesnippetSvc
      .changePairCoding(editingSnippet._id, !editingSnippet.pairCoding, true)
      .then(() => {
        alertify.success(`Pair coding is ${val ? "enabled" : "disabled"}`);

        if (val) {
          emit("on.pair.coding", { snippet: editingSnippet._id });
        } else {
          emit("off.pair.coding", { snippet: editingSnippet._id });
        }
      });
  };

  const toggleShareSnippetEditing = (val: any) => {
    setEditingSnippet({
      ...editingSnippet,
      canPairEdit: val,
    });
    codesnippetSvc
      .changePairCoding(editingSnippet._id, editingSnippet.pairCoding, val)
      .then(() => {
        alertify.success(`Pair editing is ${val ? "enabled" : "disabled"}`);
        emit("canEdit.pair.coding", {
          snippet: editingSnippet._id,
          canEdit: val,
        });
      });
  };

  const handleCode = (editor, data, value) => {
    setEditingSnippet((prevState) => ({
      ...prevState,
      code: value,
    }));
  };

  return (
    <>
      <div className="p-2">
        <div
          className={`code-editor ${
            codemirrorConfig.theme === "monokai" ? "dark-mode" : ""
          }`}
        >
          <div className="code-highlight">
            <div className="row align-items-center">
              <div className="col-md-auto">
                <h3 className="code-head m-0">Code Editor</h3>
              </div>
              <div className="col-lg-auto ml-auto">
                <div className="form-row align-items-center">
                  <h3 className="col-auto m-0" style={{ fontSize: "14px" }}>
                    Select the language
                  </h3>
                  <div className="col">
                    <div className="filter-area clearfix my-0 ml-0">
                      <div className="filter-item">
                        <div className="dropdown">
                          <a
                            className={`btn  text-left  ${
                              codemirrorConfig.theme !== "monokai"
                                ? "border-black black-caret"
                                : ""
                            }`}
                            href="#"
                            role="button"
                            id="codeDropdown"
                            data-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="false"
                          >
                            <span className="pr-5" style={{ width: "134px" }}>
                              {selectedLang?.display}
                            </span>
                          </a>

                          <div
                            className="dropdown-menu border-0 py-0"
                            aria-labelledby="codeDropdown"
                          >
                            {languages.map((lang, index) => (
                              <a
                                key={index}
                                className="dropdown-item"
                                onClick={() => onLanguageChanged(lang)}
                              >
                                {lang.display}
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="code-high-right col-lg-auto">
                <a
                  onClick={undo}
                  data-toggle="tooltip"
                  data-placement="top"
                  title="Undo your changes"
                >
                  <span className="material-icons">replay</span>
                </a>
                <a
                  onClick={redo}
                  data-toggle="tooltip"
                  data-placement="top"
                  title="Refresh the question"
                >
                  <span className="material-icons">refresh</span>
                </a>
                <a
                  onClick={copy}
                  data-toggle="tooltip"
                  data-placement="top"
                  title="Copy the code"
                >
                  <span className="material-icons">content_copy</span>
                </a>
                <a
                  onClick={downloadFunc}
                  data-toggle="tooltip"
                  data-placement="top"
                  title="Download the code"
                >
                  <span className="material-icons">download</span>
                </a>
                <a
                  onClick={changeTheme}
                  data-toggle="tooltip"
                  data-placement="top"
                  title="Change the theme"
                >
                  <span className="material-icons">nightlight_round</span>
                </a>
                <a
                  onClick={fullscreen}
                  data-toggle="tooltip"
                  data-placement="top"
                  title="Full Screen"
                >
                  <span className="material-icons">fullscreen</span>
                </a>
                <a
                  onClick={rotate}
                  data-toggle="tooltip"
                  data-placement="top"
                  title="Rotate the screen"
                >
                  <span className="material-icons">flip</span>
                </a>
                <a
                  onClick={toggleLibrary}
                  data-toggle="tooltip"
                  data-placement="top"
                  title="Code Library"
                >
                  <span className="material-icons">local_library</span>
                </a>
                <a
                  onClick={newCodeSnippet}
                  data-toggle="tooltip"
                  data-placement="top"
                  title="New Code"
                >
                  <span className="material-icons">insert_drive_file</span>
                </a>
              </div>
            </div>
          </div>
          <div className="row no-gutters">
            {showLibrary && (
              <div
                className="col-12 col-md-3 shadow"
                style={{ height: "calc(100vh - 177px)", overflow: "auto" }}
              >
                <div className="px-3 pt-3">
                  <h6>Code Snippet Library</h6>
                  <form
                    className="d-flex align-items-center"
                    onSubmit={(e) => searchCode(e)}
                  >
                    <input
                      type="text"
                      aria-label="code_Editor Text area"
                      name="codeSearch"
                      value={codeSnippetParams.search}
                      onChange={(e) =>
                        setCodeSnippetParams({
                          ...codeSnippetParams,
                          search: e.target.value,
                        })
                      }
                      className="flex-fill border px-2"
                      style={{ paddingTop: "10px", paddingBottom: "10px" }}
                      placeholder="Search"
                    />
                    <div>
                      <button className="btn btn-primary" type="submit">
                        <i className="fas fa-search"></i>
                      </button>
                    </div>
                  </form>
                </div>
                {loadingCodeSnippet && (
                  <div className="text-center">
                    <i className="fa fa-pulse fa-spinner"></i>
                  </div>
                )}
                {codeSnippets.map((snippet, index) => (
                  <div key={index} className="code-snippet-panel">
                    <div
                      className={
                        "d-flex px-3 py-2 border-bottom " +
                        (snippet._id === editingSnippet._id ? "bg-light" : "")
                      }
                    >
                      <div className="mr-3">
                        {snippet.language === "c" && (
                          <svg
                            width="15"
                            height="17"
                            viewBox="0 0 15 17"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M14.9747 5.00016C14.9746 4.71509 14.9141 4.46318 14.7917 4.24698C14.6715 4.03439 14.4914 3.8562 14.2499 3.71532C12.2562 2.55737 10.2606 1.40296 8.26764 0.243826C7.73033 -0.0686361 7.20937 -0.0572448 6.67605 0.259703C5.88252 0.73111 1.90957 3.02393 0.725684 3.71467C0.238125 3.99897 0.000878906 4.43408 0.000761719 4.99963C0 7.32834 0.000761719 9.65699 0 11.9858C0.000117187 12.2646 0.0580664 12.5116 0.175078 12.7245C0.295371 12.9436 0.477949 13.1266 0.725039 13.2707C1.90898 13.9615 5.88246 16.2541 6.67582 16.7256C7.20937 17.0427 7.73033 17.0541 8.26781 16.7415C10.2609 15.5823 12.2566 14.428 14.2505 13.27C14.4976 13.126 14.6802 12.9428 14.8005 12.7239C14.9173 12.511 14.9754 12.264 14.9755 11.9851C14.9755 11.9851 14.9755 7.32893 14.9747 5.00016Z"
                              fill="#575757"
                            />
                            <path
                              d="M7.3356 8L0 12.2545C0.120293 12.4736 0.302872 12.6567 0.549962 12.8007C1.73391 13.4915 5.70739 15.7841 6.50075 16.2556C7.03431 16.5728 7.55526 16.5841 8.09275 16.2715C10.0858 15.1123 12.0815 13.958 14.0755 12.8C14.3226 12.656 14.5051 12.4728 14.6254 12.2539L7.3356 8Z"
                              fill="#575757"
                            />
                            <path
                              d="M5.33984 9.72996C5.7667 10.4806 6.56914 10.9869 7.48965 10.9869C8.41584 10.9869 9.22285 10.4742 9.64754 9.7155L7.51256 8.46973L5.33984 9.72996Z"
                              fill="#575757"
                            />
                            <path
                              d="M14.9758 5.00025C14.9757 4.71517 14.9152 4.46327 14.7928 4.24707L7.51172 8.47009L14.8015 12.724C14.9184 12.5111 14.9764 12.2641 14.9766 11.9852C14.9766 11.9852 14.9766 7.32902 14.9758 5.00025Z"
                              fill="#575757"
                            />
                            <path
                              d="M14.5727 8.7745H14.003V9.34843H13.4332V8.7745H12.8637V8.20076H13.4332V7.62695H14.003V8.20076H14.5727V8.7745ZM12.494 8.7745H11.9245V9.34843H11.3548V8.7745H10.7852V8.20076H11.3548V7.62695H11.9245V8.20076H12.494V8.7745Z"
                              fill="white"
                            />
                            <path
                              d="M9.64667 9.71593C9.22198 10.4746 8.41497 10.9873 7.48877 10.9873C6.56827 10.9873 5.76582 10.481 5.33897 9.73039C5.12453 9.35373 5.01192 8.92702 5.01237 8.49282C5.01237 7.11519 6.12114 5.99838 7.48877 5.99838C8.40336 5.99838 9.20159 6.49835 9.63055 7.24132L11.7951 5.98581C10.9347 4.48984 9.3285 3.4834 7.48877 3.4834C4.74213 3.4834 2.51562 5.72623 2.51562 8.49282C2.51562 9.40046 2.75533 10.2516 3.17428 10.9858C4.03244 12.4897 5.64324 13.5023 7.48877 13.5023C9.3377 13.5023 10.951 12.4856 11.808 10.9773L9.64667 9.71593Z"
                              fill="white"
                            />
                          </svg>
                        )}
                        {snippet.language === "cpp" && (
                          <svg
                            width="15"
                            height="17"
                            viewBox="0 0 15 17"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M14.9747 5.00016C14.9746 4.71509 14.9141 4.46318 14.7917 4.24698C14.6715 4.03439 14.4914 3.8562 14.2499 3.71532C12.2562 2.55737 10.2606 1.40296 8.26764 0.243826C7.73033 -0.0686361 7.20937 -0.0572448 6.67605 0.259703C5.88252 0.73111 1.90957 3.02393 0.725684 3.71467C0.238125 3.99897 0.000878906 4.43408 0.000761719 4.99963C0 7.32834 0.000761719 9.65699 0 11.9858C0.000117187 12.2646 0.0580664 12.5116 0.175078 12.7245C0.295371 12.9436 0.477949 13.1266 0.725039 13.2707C1.90898 13.9615 5.88246 16.2541 6.67582 16.7256C7.20937 17.0427 7.73033 17.0541 8.26781 16.7415C10.2609 15.5823 12.2566 14.428 14.2505 13.27C14.4976 13.126 14.6802 12.9428 14.8005 12.7239C14.9173 12.511 14.9754 12.264 14.9755 11.9851C14.9755 11.9851 14.9755 7.32893 14.9747 5.00016Z"
                              fill="#575757"
                            />
                            <path
                              d="M7.3356 8L0 12.2545C0.120293 12.4736 0.302872 12.6567 0.549962 12.8007C1.73391 13.4915 5.70739 15.7841 6.50075 16.2556C7.03431 16.5728 7.55526 16.5841 8.09275 16.2715C10.0858 15.1123 12.0815 13.958 14.0755 12.8C14.3226 12.656 14.5051 12.4728 14.6254 12.2539L7.3356 8Z"
                              fill="#575757"
                            />
                            <path
                              d="M5.33984 9.72996C5.7667 10.4806 6.56914 10.9869 7.48965 10.9869C8.41584 10.9869 9.22285 10.4742 9.64754 9.7155L7.51256 8.46973L5.33984 9.72996Z"
                              fill="#575757"
                            />
                            <path
                              d="M14.9758 5.00025C14.9757 4.71517 14.9152 4.46327 14.7928 4.24707L7.51172 8.47009L14.8015 12.724C14.9184 12.5111 14.9764 12.2641 14.9766 11.9852C14.9766 11.9852 14.9766 7.32902 14.9758 5.00025Z"
                              fill="#575757"
                            />
                            <path
                              d="M14.5727 8.7745H14.003V9.34843H13.4332V8.7745H12.8637V8.20076H13.4332V7.62695H14.003V8.20076H14.5727V8.7745ZM12.494 8.7745H11.9245V9.34843H11.3548V8.7745H10.7852V8.20076H11.3548V7.62695H11.9245V8.20076H12.494V8.7745Z"
                              fill="white"
                            />
                            <path
                              d="M9.64667 9.71593C9.22198 10.4746 8.41497 10.9873 7.48877 10.9873C6.56827 10.9873 5.76582 10.481 5.33897 9.73039C5.12453 9.35373 5.01192 8.92702 5.01237 8.49282C5.01237 7.11519 6.12114 5.99838 7.48877 5.99838C8.40336 5.99838 9.20159 6.49835 9.63055 7.24132L11.7951 5.98581C10.9347 4.48984 9.3285 3.4834 7.48877 3.4834C4.74213 3.4834 2.51562 5.72623 2.51562 8.49282C2.51562 9.40046 2.75533 10.2516 3.17428 10.9858C4.03244 12.4897 5.64324 13.5023 7.48877 13.5023C9.3377 13.5023 10.951 12.4856 11.808 10.9773L9.64667 9.71593Z"
                              fill="white"
                            />
                          </svg>
                        )}
                        {snippet.language === "java" && (
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 18 18"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g clip-path="url(#clip0_1161_2187)">
                              <path
                                d="M8.49984 10.216C8.40434 10.2062 8.31102 10.1686 8.23188 10.1035C8.16274 10.0455 6.53134 8.67006 6.68904 7.12542C6.8554 5.49589 8.11463 4.74054 9.12685 4.13354C9.92347 3.65598 10.6116 3.24307 10.6824 2.55001C10.7169 2.21177 10.5361 2.02041 10.5343 2.01822C10.3324 1.83007 10.3212 1.51329 10.5093 1.31136C10.698 1.11015 11.0134 1.09946 11.2162 1.28636C11.2725 1.33835 11.762 1.82123 11.6773 2.65091C11.5557 3.84205 10.5827 4.42559 9.64183 4.99028C8.69457 5.55834 7.80004 6.0956 7.6846 7.22639C7.59867 8.06801 8.51337 9.03324 8.87262 9.33462C9.08439 9.51171 9.11253 9.82686 8.9361 10.0387C8.82412 10.1707 8.65901 10.2322 8.49984 10.216Z"
                                fill="#575757"
                              />
                              <path
                                d="M9.75518 10.2344C9.48061 10.2064 9.28051 9.96078 9.30855 9.68621C9.3556 9.22527 9.23786 9.06582 9.04364 8.80206C8.8188 8.49698 8.51094 8.07955 8.59463 7.25982C8.74934 5.74436 11.4967 4.51236 12.0457 4.28092C12.3 4.17285 12.5927 4.29253 12.7007 4.54682C12.8081 4.80105 12.6891 5.09447 12.4348 5.20187C11.3283 5.66924 9.65913 6.67893 9.58945 7.36138C9.54497 7.79712 9.65914 7.95218 9.84866 8.20943C10.0771 8.51889 10.3896 8.94349 10.3033 9.78844C10.2753 10.0623 10.0298 10.2624 9.75518 10.2344Z"
                                fill="#575757"
                              />
                              <path
                                d="M6.40815 11.5514C5.27869 11.4361 4.32162 11.201 3.87098 10.8562C3.50856 10.5793 3.48328 10.2624 3.50008 10.0979C3.58715 9.245 5.01794 8.96219 6.20361 8.87483C6.4765 8.85377 6.71799 9.06137 6.73878 9.33691C6.75957 9.61244 6.55217 9.85195 6.27737 9.87214C5.66353 9.91804 5.01091 10.0484 4.671 10.1813C5.69997 10.6442 9.57628 10.9173 11.5112 10.1733C11.7698 10.075 12.0583 10.203 12.1573 10.4611C12.2563 10.7191 12.1276 11.0082 11.8695 11.1072C10.5654 11.6066 8.25654 11.7402 6.40815 11.5514ZM6.86363 13.4636C5.1187 13.2854 4.89414 12.459 4.86528 12.2691C4.82412 11.9962 5.01298 11.7414 5.2859 11.7002C5.54058 11.6606 5.78058 11.8238 5.84402 12.0688C5.87821 12.1212 6.22244 12.5631 7.93817 12.489C9.68356 12.4132 10.1585 12.1595 10.238 12.1086C10.3865 11.9342 10.6408 11.8784 10.852 11.9897C11.0961 12.1185 11.1899 12.4209 11.0618 12.6652C10.8156 13.1333 9.77947 13.4101 7.98161 13.4879C7.55277 13.5071 7.18264 13.4962 6.86363 13.4636ZM5.8542 12.1201L5.85413 12.1208C5.85479 12.1209 5.85413 12.1208 5.8542 12.1201ZM5.85433 12.1188L5.85426 12.1195C5.85426 12.1195 5.85426 12.1195 5.85433 12.1188ZM10.1772 12.1989L10.1771 12.1996L10.1772 12.1989ZM10.178 12.1977C10.1773 12.1983 10.1773 12.1983 10.178 12.1977C10.1773 12.1983 10.1773 12.1983 10.178 12.1977ZM10.1781 12.1963L10.1781 12.197C10.1781 12.197 10.1781 12.197 10.1781 12.1963Z"
                                fill="#575757"
                              />
                              <path
                                d="M5.3392 15.198C4.17061 15.0787 3.23854 14.9071 2.88668 14.7237C2.47385 14.5074 2.43965 14.2057 2.45611 14.0445C2.53086 13.3123 3.59049 13.0023 4.21516 12.8832C4.48717 12.8312 4.7485 13.0086 4.79995 13.2793C4.85206 13.55 4.67519 13.812 4.40377 13.8647C4.22598 13.8995 4.03635 13.9519 3.87092 14.01C5.79433 14.4289 11.6443 14.5436 12.3817 13.9106C12.5911 13.7302 12.9069 13.7551 13.0872 13.9645C13.2669 14.1738 13.2427 14.4897 13.0333 14.67C12.0991 15.4706 8.07166 15.4769 5.3392 15.198Z"
                                fill="#575757"
                              />
                              <path
                                d="M6.02934 16.7263C4.811 16.6019 3.8498 16.4072 3.45304 16.2173C3.20387 16.098 3.09901 15.7992 3.21754 15.5506C3.33613 15.3013 3.63572 15.1959 3.88424 15.3151C4.92375 15.8126 11.0072 16.3445 13.6478 15.0748C13.8965 14.9561 14.1954 15.0604 14.3154 15.3092C14.4347 15.5586 14.3299 15.8568 14.0811 15.9768C12.0727 16.9418 8.51575 16.9801 6.02934 16.7263ZM11.33 13.4778C11.1377 13.4582 10.9661 13.3274 10.9043 13.1315C10.8206 12.8683 10.9665 12.5876 11.2297 12.5039C12.2083 12.1937 13.617 11.4577 13.6847 10.7944C13.701 10.6346 13.6592 10.5982 13.6432 10.5845C13.4454 10.4142 12.7768 10.4652 12.3894 10.5643C12.123 10.6336 11.8493 10.4723 11.7808 10.2047C11.7123 9.937 11.8728 9.66456 12.1405 9.59606C12.3827 9.53367 13.6278 9.25134 14.2949 9.82606C14.5019 10.004 14.7369 10.3343 14.6796 10.896C14.5189 12.4698 11.8365 13.3613 11.5311 13.4575C11.4639 13.4788 11.3957 13.4845 11.33 13.4778Z"
                                fill="#575757"
                              />
                            </g>
                            <defs>
                              <clipPath id="clip0_1161_2187">
                                <rect
                                  width="16"
                                  height="16"
                                  fill="white"
                                  transform="translate(1.85547 0.228516) rotate(5.82931)"
                                />
                              </clipPath>
                            </defs>
                          </svg>
                        )}
                        {snippet.language === "python" && (
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 15 15"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g clip-path="url(#clip0_1161_2184)">
                              <path
                                d="M7.32875 -0.000703125C6.72438 -7.81247e-05 6.1325 0.0530469 5.5575 0.154297L5.61875 0.145547C4.10438 0.413047 3.83 0.973047 3.83 2.00555V3.3693H7.40875V3.82367H2.4875C2.475 3.82367 2.46063 3.82305 2.44625 3.82305C1.36063 3.82305 0.45625 4.59742 0.254375 5.62367L0.251875 5.63805C0.091875 6.18305 0 6.8093 0 7.4568C0 8.1043 0.091875 8.73055 0.26375 9.32242L0.251875 9.27492C0.50625 10.3343 1.11375 11.0887 2.15188 11.0887H3.3825V9.45367C3.41063 8.23305 4.39625 7.2518 5.61625 7.23055H5.61813H9.1925C10.1825 7.22242 10.9819 6.41867 10.9819 5.42742C10.9819 5.4218 10.9819 5.4168 10.9819 5.41117V5.4118V2.0043C10.9169 1.02867 10.1606 0.248047 9.20188 0.144922L9.19313 0.144297C8.65188 0.0511719 8.02875 -0.00195312 7.39375 -0.00195312C7.37125 -0.00195312 7.34938 -0.00195312 7.32688 -0.00195312H7.33L7.32875 -0.000703125ZM5.39375 1.09617H5.40438C5.78125 1.09617 6.08625 1.4018 6.08625 1.77805C6.08625 2.1543 5.78063 2.45992 5.40438 2.45992C5.02875 2.45992 4.72375 2.15555 4.7225 1.77992C4.7225 1.77867 4.7225 1.7768 4.7225 1.77492C4.7225 1.40242 5.0225 1.09992 5.39375 1.09617H5.39438H5.39375Z"
                                fill="#575757"
                              />
                              <path
                                d="M11.4308 3.82422V5.41297C11.417 6.64859 10.4283 7.64922 9.19828 7.68172H9.19515H5.62078C4.63078 7.70234 3.83578 8.50797 3.83203 9.49984V12.908C3.83203 13.8773 4.67516 14.448 5.62078 14.7267C6.15516 14.8998 6.77015 14.9998 7.40828 14.9998C8.0464 14.9998 8.6614 14.8998 9.23765 14.7148L9.19515 14.7267C10.0952 14.4661 10.9839 13.9405 10.9839 12.908V11.543H7.40953V11.0886H12.7733C13.8133 11.0886 14.2008 10.363 14.5627 9.27484C14.7377 8.73109 14.8383 8.10547 14.8383 7.45609C14.8383 6.80672 14.7377 6.18109 14.5508 5.59422L14.5627 5.63797C14.3058 4.60297 13.8127 3.82422 12.7733 3.82422H11.4308ZM9.42078 12.4536H9.4314C9.80828 12.4536 10.1133 12.7592 10.1133 13.1355C10.1133 13.5117 9.80765 13.8173 9.4314 13.8173C9.05453 13.8173 8.74953 13.5117 8.74953 13.1355C8.74953 13.1348 8.74953 13.1336 8.74953 13.133C8.74953 13.1317 8.74953 13.1298 8.74953 13.1286C8.74953 12.7567 9.04953 12.4555 9.42078 12.4536Z"
                                fill="#575757"
                              />
                            </g>
                            <defs>
                              <clipPath id="clip0_1161_2184">
                                <rect width="15" height="15" fill="white" />
                              </clipPath>
                            </defs>
                          </svg>
                        )}
                        {snippet.language === "ruby" && (
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M11.9925 2.4045C12.0245 1.3115 11.5945 0.269 10.078 0.005L10.0795 0L8.25 1.027L11.416 3.624L11.7235 3.8805L7.3135 4.1665L7.8085 6.1285L8.5065 8.8605L3.879 7.3735L3.871 7.3885L3.886 7.385L2.4835 11.985L0.8225 8.082L0 9.5915C0.075 11.901 1.7165 11.969 2.453 12L11.3175 11.388L12 2.389L11.9925 2.4045Z"
                              fill="#575757"
                            />
                            <path
                              d="M0.367554 7.66183C1.31347 8.61791 3.7521 7.43297 5.66595 5.53312C7.58248 3.63327 8.58533 1.30511 7.63888 0.349037C6.69082 -0.609711 4.22211 0.51373 2.30933 2.41465L2.30772 2.41625C0.391726 4.31717 -0.581043 6.70576 0.367554 7.66183Z"
                              fill="#575757"
                            />
                          </svg>
                        )}
                        {snippet.language === "javascript" && (
                          <i
                            className="fab fa-js"
                            style={{ fontSize: "18px" }}
                          ></i>
                        )}
                      </div>
                      <div className="flex-fill">
                        <div className="d-flex align-items-center">
                          <p className="bold flex-fill">{snippet.title}</p>
                          <div className="dropdown">
                            <a
                              role="button"
                              id="dropdown-profile-box-btn"
                              data-toggle="dropdown"
                            >
                              <i className="fas fa-ellipsis-v"></i>
                            </a>
                            <ul
                              aria-labelledby="dropdown-profile-box-btn"
                              className="dropdown-menu dropdown-menu-right py-0 border-0 shadow"
                              x-placement="bottom-end"
                            >
                              <li>
                                <a
                                  className="dropdown-item"
                                  onClick={() => getCode(snippet)}
                                >
                                  Open
                                </a>
                              </li>
                              <li>
                                <a
                                  className="dropdown-item"
                                  onClick={() => downloadSnippet(snippet)}
                                >
                                  Download
                                </a>
                              </li>
                              <li>
                                <a
                                  className="dropdown-item"
                                  onClick={() => getSharedLink(snippet)}
                                >
                                  Copy Link
                                </a>
                              </li>
                              <li>
                                <a
                                  className="dropdown-item"
                                  onClick={() => deleteCode(snippet)}
                                >
                                  Delete
                                </a>
                              </li>
                            </ul>
                          </div>
                        </div>
                        <p className="my-1">{snippet.description}</p>
                        <div className="question-tags">
                          {snippet.tags.map((tag, index) => (
                            <span key={index} className="tags f-12">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {totalSnippets > codeSnippetParams.limit && (
                  <div className="text-center mt-2 d-flex justify-content-center">
                    <CustomPagination
                      totalItems={totalSnippets}
                      limit={codeSnippetParams.limit}
                      onPageChange={(e) => snippetPageChanged(e)}
                      currentPage={currentPage}
                    />
                  </div>
                )}
              </div>
            )}
            <div className={`col ${showLibrary ? "col-md-9" : ""}`}>
              <div
                style={{ height: "30px" }}
                className="d-flex justify-content-between"
              >
                {editingSnippet.title && (
                  <div>
                    <span
                      className="badge badge-success mt-2"
                      style={{ fontSize: "100%" }}
                    >
                      {editingSnippet.title}
                    </span>
                    {editingSnippet.userName && (
                      <span>
                        &nbsp;by {editingSnippet.userName} (
                        {fromNow(editingSnippet.updatedAt)})
                      </span>
                    )}
                    {editingSnippet.pairCoding && (
                      <>
                        <span className="mx-2">{editingSnippet.uid}</span>
                        <a onClick={() => getSharedLink(editingSnippet)}>
                          <span className="material-icons align-bottom">
                            content_copy
                          </span>
                        </a>
                      </>
                    )}
                  </div>
                )}
                {editingSnippet.title && (
                  <div className="pr-2 d-flex gap-sm">
                    {editingSnippet.pairCoding && (
                      <div className="d-flex align-items-center m-1">
                        <div className="mr-1 mt-0">Allow Editing</div>
                        <div className="switch-item mt-0 float-none ml-auto d-block">
                          <label className="switch my-0">
                            <input
                              type="checkbox"
                              value="1"
                              checked={editingSnippet.canPairEdit}
                              onChange={(e) => {
                                toggleShareSnippetEditing(e.target.checked);
                              }}
                              disabled={editingSnippet.user !== user._id}
                            />
                            <span className="slider round translate-middle-y"></span>
                          </label>
                        </div>
                      </div>
                    )}

                    <div className="d-flex align-items-center m-1">
                      <div className="mr-1 mt-0">Pair Coding</div>
                      <div className="switch-item mt-0 float-none ml-auto d-block">
                        <label className="switch my-0">
                          <input
                            type="checkbox"
                            value="1"
                            checked={editingSnippet.pairCoding}
                            onChange={(e) => {
                              togglePairCoding(e.target.checked);
                            }}
                            disabled={editingSnippet.user !== user._id}
                          />
                          <span className="slider round translate-middle-y"></span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="row no-gutters">
                <div
                  className={`code-area mb-3 ${
                    isVertical ? "vertical col-12" : "col-6"
                  }`}
                >
                  <div className="inner p-1">
                    <div className="d-flex">
                      <input
                        name="arguments"
                        value={editingSnippet.arguments}
                        onChange={(event) => {
                          setEditingSnippet({
                            ...editingSnippet,
                            arguments: event.target.value,
                          });
                          setArgument(event.target.value);
                        }}
                        placeholder="Command line arguments . . ."
                        className="form-control border-0 txt-arguments bg-transparent m-0"
                      />
                      {!processing && (
                        <button
                          className="btn btn-primary px-4 ml-4 bold"
                          disabled={
                            !editingSnippet.code ||
                            !serverConnected ||
                            peerExecuting
                          }
                          onClick={execute}
                        >
                          Run
                        </button>
                      )}
                      {processing && (
                        <button
                          className="btn btn-primary px-4 ml-4 bold"
                          onClick={stop}
                        >
                          Stop
                        </button>
                      )}
                      <button
                        className="btn btn-outline px-4 ml-2 bold"
                        disabled={!editingSnippet.code}
                        onClick={() => save("editCodeSnippetModal")}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                  {selectedLang && (
                    <div className="inner-editor">
                      <CodeMirror
                        ref={codeSrc}
                        value={editingSnippet.code}
                        onChange={(template) => {
                          // Handle the template change
                          const newUndoHistory = [
                            ...undoHistory.slice(0, historyIndex + 1),
                            template,
                          ];
                          setUndoHistory(newUndoHistory);
                          setHistoryIndex(newUndoHistory.length - 1);
                          setEditingSnippet({
                            ...editingSnippet,
                            code: template,
                          });
                        }}
                        theme={myTheme}
                        extensions={
                          selectedLang.language === "cpp" ||
                          selectedLang.language === "c"
                            ? [cpp()]
                            : selectedLang.language === "java"
                            ? [java()]
                            : selectedLang.language === "python"
                            ? [python()]
                            : [
                                javascript({ jsx: true }),
                                EditorView.lineWrapping,
                              ]
                        }
                        // readOnly={!editingSnippet.canPairEdit}
                      />
                    </div>
                  )}
                </div>
                <div
                  className={`code-area mb-3 ${
                    isVertical ? "vertical col-12" : "col-6"
                  }`}
                >
                  <div className="inner p-1">
                    <div className="row">
                      <div className="col d-flex align-items-center">
                        <h3 className="admin-head">
                          {processing && (
                            <i className="fas fa-spinner fa-pulse"></i>
                          )}
                        </h3>
                        {typing && <span>{peer} is typing...</span>}
                        {peerExecuting && (
                          <span>{peer} is executing code...</span>
                        )}
                      </div>
                      <div className="col-auto">
                        <button
                          className="btn btn-outline-danger border px-4 bold"
                          disabled={processing || !serverConnected}
                          onClick={clear}
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  </div>
                  {selectedLang && (
                    <div className="inner-editor">
                      <div ref={terminalRef}></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isFullscreen && (
        <div>
          <button className="btn fullscreen-off" onClick={fullscreen}>
            <img src="/assets/images/window-icon.png" alt="" />
          </button>
        </div>
      )}

      <Modal
        show={editCodeSnippetModal}
        onHide={() => {
          setEditCodeSnippetModal(false);
        }}
        backdrop="static"
        keyboard={false}
      >
        <div role="document">
          <div className="modal-content form-boxes">
            <div className="modal-header modal-header-bg justify-content-center">
              <h4 className="form-box_title">Save Code Snippet</h4>
            </div>
            {/* {errors.length > 0 && (
          <div type="danger">
            {errors.map((error, index) => (
              <p key={index} className="label label-danger text-danger">{error}</p>
            ))}
          </div>
        )} */}
            <div className="modal-body admiN_ModAlAlL cusTomMargin_modalAlL PassWdsManagment">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  saveCode();
                }}
              >
                <div>
                  <h4 className="form-box_subtitle mb-0">Title</h4>
                  <input
                    className="form-control border-bottom"
                    required
                    name="title"
                    id="title"
                    value={editingSnippet.title}
                    onChange={(e) =>
                      setEditingSnippet({
                        ...editingSnippet,
                        title: e.target.value,
                      })
                    }
                    maxLength="250"
                    placeholder="Add title"
                  />
                  {!title.trim() && (
                    <p className="label label-danger text-danger">
                      Title is required
                    </p>
                  )}
                </div>

                <div className="mt-2">
                  <h4 className="form-box_subtitle mb-0">Description</h4>
                  <input
                    className="form-control border-bottom"
                    name="description"
                    id="description"
                    value={editingSnippet.description}
                    onChange={(e) =>
                      setEditingSnippet({
                        ...editingSnippet,
                        description: e.target.value,
                      })
                    }
                    placeholder="Add description"
                    maxLength="500"
                  />
                </div>

                <div className="mt-2">
                  <h4 className="form-box_subtitle mb-0">Tags</h4>
                  <TagsInput
                    //@ts-ignore
                    value={editingSnippet.tags || []}
                    //@ts-ignore
                    onChange={(e) =>
                      setEditingSnippet({
                        ...editingSnippet,
                        tags: e,
                      })
                    }
                    name="tags"
                    placeHolder="+ Add tags"
                    separators={[" "]}
                  />
                </div>

                <div className="d-flex justify-content-end mt-2">
                  <button
                    className="btn btn-link"
                    type="button"
                    onClick={closeEditModal}
                  >
                    Cancel
                  </button>
                  <button className="btn btn-primary ml-2" type="submit">
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default CodeEditor;
