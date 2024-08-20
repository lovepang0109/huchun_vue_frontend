"use client";
import React, { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { alert, success, error, confirm } from "alertifyjs";
import MathJax from "@/components/assessment/mathjax";
import SkeletonLoaderComponent from "@/components/skeleton/SkeltonLoader";
import FibQuestionComponent from "./FibQuestionComponent";
import McqQuestionComponent from "./McqQuestionComponent";
import MixMatchQuestionComponent from "./MixMatchQuestionComponent";
import DescriptiveQuestionComponent from "./DescriptiveQuestionComponent";
import CodingQuestionComponent from "./CodingQuestionComponent";
import {
  IsAllowReuse,
  Question,
  QuestionCategory,
  QuestionComplexity,
  QuestionType,
  Subject,
  Unit,
  Topic,
} from "@/interfaces/interface";
import * as questionSvc from "@/services/question-service";
import * as subjectSvc from "@/services/subject-service";
import * as testSvc from "@/services/test-service";

import clientApi, { uploadFile } from "@/lib/clientApi";

class Stepper {
  // constructor(element: Element, _options?: StepperOptions) { }
  next(): void {}
  previous(): void {}
  to(stepNumber: number): void {}
  reset(): void {}
  destroy(): void {}
  private _currentIndex: number = 0;
  getCurrentIndex(): number {
    return this._currentIndex;
  }
}

const CreateQuestion = () => {
  const user: any = useSession()?.data?.user?.info || {};

  const [question, setQuestion] = useState<any>(null);
  const [subjects, setSubjects] = useState<any>(null);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [selectedUnit, setSelectedUnit] = useState<any>(null);

  const [selectedTopic, setSelectedTopic] = useState<any>({
    _id: "",
    name: "",
  });
  const router = useRouter();

  const [submitted, setSubmitted] = useState<any>("");

  const [settings, setSettings] = useState<any>({
    questionId: "",
    testId: "",
    testMenu: "",
    isNew: true,
    forQB: false,
    testStatus: "",
    marksAtTestLevel: true,
    last: false,
    lastSection: "",
    questionOrder: 0,
  });
  const [complexity, setComplexity] = useState(QuestionComplexity.MODERATE);
  const [isAllowReuse, setIsAllowReuse] = useState(IsAllowReuse.NONE);
  const [subscription, setSubscription] = useState<any>(null);
  const [clientData, setClientData] = useState<any>(null);
  const [testDetails, setTestDetails] = useState<any>([]);
  const [sections, setSections] = useState<any>([]);
  const [sectionName, setSectionName] = useState<string>("");
  // const { questionId } = useParams();
  const queryParams = useSearchParams();

  let questionId = queryParams.get("questionId");
  let testId_temp = queryParams.get("testId");
  let testMenu_temp = queryParams.get("testMenu");
  let temp_id = queryParams.get("id");
  let temp_forQB = queryParams.get("forQB");
  let temp_status = queryParams.get("status");
  let temp_marksAtTestLevel = queryParams.get("marksAtTestLevel");
  let temp_last = queryParams.get("last");
  let temp_order = queryParams.get("order");
  let temp_section = queryParams.get("section");
  let temp_nav = queryParams.get("nav");
  // let isEdit = urlParams.get('isEdit')
  const isEdit = queryParams.get("isEdit");

  //
  const [uploadingFile, setUploadingFile] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<any>(0);
  const [processing, setProcessing] = useState<any>(false);
  const [editorMap, setEditorMap] = useState<any>({});

  let stepper: Stepper;

  const [tagText, setTagText] = useState<string>("");
  const [token, setToken] = useState<string>("");
  const [config, setConfig] = useState<any>(null);
  const [canNavigate, setCanNavigate] = useState<boolean>(true);
  const [units, setUnits] = useState<any>([]);
  const [topics, setTopics] = useState<any>([]);

  const setQuestionFunc = (val: any) => {
    fixQuestionNewLine(val);
    setQuestion(val);
    onQuestionChanged();
  };
  const getQuestion = () => {
    return question;
  };
  const getSubmitted = () => {
    return submitted;
  };
  const setSubmittedFunc = (val: string) => {
    setSubmitted(val);
    const temp_processing = val && val != "error" && val != "done";
    setProcessing(temp_processing);
    if (submitted === "done") {
      reset();
    }
  };

  const fixQuestionNewLine = (question: any) => {
    if (!question) {
      return;
    }
    question.questionText = question.questionText
      ? question.questionText.replace(/\n/g, "<br />")
      : "";
    question.questionHeader = question.questionHeader
      ? question.questionHeader.replace(/\n/g, "<br />")
      : "";
    for (const a of question.answers) {
      a.answerText = a.answerText ? a.answerText.replace(/\n/g, "<br />") : "";
    }
  };

  const onQuestionChanged = () => {
    // Reset editor map
    setEditorMap({});
    if (!question.audioFiles) {
      setQuestion({
        ...question,
        audioFiles: [],
      });
    }
    if (!question.answerExplainAudioFiles) {
      setQuestion({
        ...question,
        answerExplainAudioFiles: [],
      });
    }
  };

  const onCkeditorReady = (editor: any, field: any) => {
    setEditorMap((prevEditorMap) => ({
      ...prevEditorMap,
      [field]: editor,
    }));
  };

  const getStepperID = () => {
    return "";
  };

  const pathJoin = (...args) => {
    const separator = "/";
    args = args.map((part, index) => {
      if (index) {
        part = part.replace(new RegExp("^" + separator), "");
      }
      if (index !== args.length - 1) {
        part = part.replace(new RegExp(separator + "$"), "");
      }
      return part;
    });
    return args.join(separator);
  };

  const InstructionFileUpload = (files: FileList) => {
    const file = files[0];
    if (file) {
      setUploadingFile(true);
      //  You could upload it like this:
      uploadFileFunc(file)
        .then((data: any) => {
          success("File uploaded successfully.");

          setQuestion({
            ...question,
            questionHeader: question.questionHeader
              ? question.questionHeader +
                `
            <a target="_blank" rel="noopener noreferrer" href="${data.data.fileUrl}">${file.name}</a>
          `
              : `
          <a target="_blank" rel="noopener noreferrer" href="${data.data.fileUrl}">${file.name}</a>
        `,
          });

          setUploadingFile(false);
        })
        .catch((err) => {
          alert("Message", "Fail to upload file.");
          setUploadingFile(false);
        });
    }
  };

  const onQuestionFileUpload = (files: FileList) => {
    const file = files[0];
    if (file) {
      setUploadingFile(true);
      //  You could upload it like this:
      uploadFileFunc(file)
        .then((data: any) => {
          success("File uploaded successfully.");
          setQuestion({
            ...question,
            questionText: question.questionText
              ? question.questionText +
                `
            <a target="_blank" rel="noopener noreferrer" href="${data.data.fileUrl}">${file.name}</a>
          `
              : `
          <a target="_blank" rel="noopener noreferrer" href="${data.data.fileUrl}">${file.name}</a>
        `,
          });

          setUploadingFile(false);
        })
        .catch((err) => {
          alert("Message", "Fail to upload file.");
          setUploadingFile(false);
        });
    }
  };

  const uploadFileFunc = (file) => {
    const formData: FormData = new FormData();
    formData.append("file", file, file.name);
    formData.append("uploadType", "file");

    return uploadFile(file, file.name, "file");
  };

  const addAnswer = (que?: any) => {
    if (!que) {
      que = question;
    }
    const updateQ = que;
    updateQ?.answers?.push({
      answerText: "",
      answerTextArray: [],
      isCorrectAnswer: false,
      // For coding question type. Use answerText for output
      input: "",
      marks: 0,
      // Base data for Psychometric quetion
      score: 0,
      // mixmatch
      correctMatch: "",
      audioFiles: [],
    });

    setQuestion({
      ...updateQ,
      answerNumber: updateQ?.answers?.length,
    });
  };

  const removeAnswer = (idx) => {
    setQuestion((prevQuestion) => {
      const newAnswers = [...prevQuestion.answers];
      newAnswers.splice(idx, 1);
      return {
        ...prevQuestion,
        answers: newAnswers,
      };
    });
    setQuestion({
      ...question,
      answerNumber: question?.answers?.splice(idx, 1).length,
    });
  };

  const validateStep = (currentPage?: any) => {
    return true;
  };

  const next = (currentPage?: any) => {
    if (validateStep(currentPage)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const presave = () => {
    for (const field in editorMap) {
      setQuestion((prevQuestion) => ({
        ...prevQuestion,
        [field]: getData(editorMap[field]),
      }));
    }

    return true;
  };

  const saveAndNext = () => {
    setProcessing(true);
    if (presave()) {
      // this.saveQuestion.emit({
      //   next: true
      // })
    } else {
      setProcessing(false);
    }
  };

  const reset = () => {
    setCurrentStep(0);
  };
  const getData = (ckeditor) => {
    let data: string = ckeditor.trim();
    data = data
      .replace(/^(<p>(&nbsp;|\s)*<\/p>\n*)*/, "")
      .replace(/^<p>(&nbsp;|\s)*/, "<p>")
      .replace(/(&nbsp;|\s)+<\/p>/g, "&nbsp;</p>");

    document.getElementById("tmpCode").innerHTML = data;
    const subTags = document.querySelectorAll("#tmpCode p");

    for (let i = subTags.length - 1; i >= 0; i--) {
      if (!subTags[i].innerHTML.replace(/&nbsp;*/g, "").trim()) {
        subTags[i].remove();
      } else {
        break;
      }
    }
    // trim last empty paragraph
    // data = data.replace(/([\s\S]*)(\<p\>(\&nbsp\;|\s)*\<\/p\>)/, "$1")
    // replace trailing space in paragraph
    return document.getElementById("tmpCode").innerHTML;
  };

  useEffect(() => {
    const getClientData = async () => {
      const { data } = await clientApi.get("/api/settings");
      setClientData(data);
    };
    getClientData();
    let primary_answer = [];
  }, []);

  useEffect(() => {
    setSettings({
      ...settings,
      forQB: temp_forQB,
    });
    const update_isAllowReuse = temp_forQB
      ? user.role == "publisher" || user?.primaryInstitute?.type == "publisher"
        ? IsAllowReuse.GLOBAL
        : IsAllowReuse.EVERYONE
      : IsAllowReuse.NONE;
    setIsAllowReuse(update_isAllowReuse);
  }, [temp_forQB]);

  useEffect(() => {
    const fetchFunc = async () => {
      setSettings({
        ...settings,
        questionId: questionId,
        testId: testId_temp,
        testMenu: testMenu_temp,
      });
      if (temp_nav) {
        setCanNavigate(temp_nav == "true");
      }
      let listener: any = [];
      let sub: any = [];
      if (!queryParams.get("questionId")) {
        refreshQuestion();
      }

      if (queryParams.get("testId")) {
        listener = subjectSvc
          .getByTest(queryParams.get("testId"), {
            unit: 1,
            topic: 1,
            testDetails: "sections enableSection questions",
          })
          .then((res) => {
            setSubjects(res.subjects);
            sub = res.subjects;
            res[0]?.map((r) => {
              setTestDetails(r.test);
              if (testDetails && testDetails.enableSection) {
                const tq = testDetails.questions.find(
                  (q) => q.question === questionId
                );
                setSections(
                  testDetails.sections.filter((sec) => !sec.isBreakTime)
                );
                setSectionName(tq ? tq.section : testDetails.sections[0]?.name);
              }
              return r.subjects;
            });
          });
      } else {
        listener = await subjectSvc.getMine({ unit: 1, topic: 1 });
        sortByName(listener);
        listener.forEach((sub) => {
          sortByName(sub.units);
          sub.units.forEach((unit) => {
            sortByName(unit.topics);
          });
        });
        setSubjects(listener);
      }
      // sortByName(listener);
      // listener.forEach(sub => {
      //   sortByName(sub.units);
      //   sub.units.forEach(unit => {
      //     sortByName(unit.topics);
      //   });
      // });
      // setSubjects(listener);

      // const params = route.params;
      if (!queryParams.get("questionId")) {
        if (queryParams.get("testId")) {
          const practiceSets_temp = [];
          practiceSets_temp.push(queryParams.get("testId"));

          // setQuestion({ ...question, practiceSets: practiceSets_temp });
        }
        if (listener.length === 1) {
          setSelectedSubject(listener[0]);
          if (listener[0].units.length === 1) {
            setSelectedUnit(listener[0].units[0]);
            if (listener[0].units[0].topics.length === 1) {
              setSelectedTopic(listener[0].units[0].topics[0]);
            }
          }
        }
      } else {
        questionSvc
          .getQ(queryParams.get("questionId"), {})
          .then((q) => {
            setQuestion(q);
            convertMathml(q);
            if (q.category === "code" && q.testcases) {
              setQuestion({
                ...q,
                testcases: q.testcases.map((t) => ({ ...t, status: true })),
              });
            }
            if (queryParams.get("testId")) {
              subjectSvc
                .getByTest(queryParams.get("testId"), {
                  unit: 1,
                  topic: 1,
                  testDetails: "sections enableSection questions",
                })
                .then((res) => {
                  const selectedSub = res.subjects.find(
                    (s) => s._id === q.subject._id
                  );
                  if (selectedSub) {
                    setSelectedSubject(selectedSub);
                    setUnits(selectedSub.units);
                    const selectedUnit = selectedSub.units.find(
                      (u) => u._id === q.unit._id
                    );
                    setTopics(selectedUnit.topics);
                    if (selectedUnit) {
                      setSelectedUnit(selectedUnit);
                      const selectedTopic = selectedUnit.topics.find(
                        (t) => t._id === q.topic._id
                      );
                      if (selectedTopic) {
                        setSelectedTopic(selectedTopic);
                      }
                    }
                  }
                });
            } else {
              setSelectedSubject(q.subject);
              const selSub = listener.find((s) => s._id === q.subject._id);
              setUnits(selSub.units);
              setSelectedUnit(q.unit);
              const selUnit = selSub.units.find((u) => u._id === q.unit._id);
              setTopics(selUnit.topics);
              setSelectedTopic(q.topic);
            }

            // setSelectedSubject(q.subject);
            // setSelectedUnit(q.unit);
            // setSelectedTopic(q.topic)
            if (q.complexity) {
              setComplexity(q.complexity);
            }
            if (q.isAllowReuse) {
              setIsAllowReuse(q.isAllowReuse);
            }
          })
          .catch((err) => {
            console.log(err);
            // error('Failed to get question data')
          });
      }
      // });

      // return () => {
      //   subscription.unsubscribe();
      // };
    };
    fetchFunc();
  }, [queryParams.get("testId")]);

  const sortByName = (arr: any[]) => {
    arr.sort((a: any, b: any) => {
      const i1 = a.name;
      const i2 = b.name;
      return i1.toLowerCase().localeCompare(i2.toLowerCase());
    });
  };

  const loadSettings = () => {
    setSettings({
      // questionId: temp_id,
      isNew: !temp_forQB,
      testId: testId_temp,
    });

    if (settings.testId) {
      setSettings({
        testMenu: testMenu_temp,
        testStatus: temp_status,
        marksAtTestLevel: temp_marksAtTestLevel != "false",
        last: temp_last == "true",
        questionOrder: temp_order,
        lastSection: temp_section,
      });
    }

    const update_isAllowReuse = temp_forQB
      ? user.role == "publisher" || user?.primaryInstitute?.type == "publisher"
        ? IsAllowReuse.GLOBAL
        : IsAllowReuse.EVERYONE
      : IsAllowReuse.NONE;
    setIsAllowReuse(update_isAllowReuse);
  };

  const refreshQuestion = () => {
    if (question && question.complexity) {
      setComplexity(question.complexity);
    }
    if (question && question.isAllowReuse) {
      setIsAllowReuse(question.isAllowReuse);
    }
    const updatedq = {
      user: user._id,
      practiceSets: question ? question.practiceSets : [],
      subject: question ? question.subject : selectedSubject,
      unit: question ? question.unit : selectedUnit,
      topic: question ? question.topic : selectedTopic,
      wordLimit: question ? question.wordLimit : 1000,
      complexity: question ? question.complexity : complexity,
      isAllowReuse: question ? question.isAllowReuse : isAllowReuse,
      questionType: question ? question.questionType : QuestionType.SINGLE,
      category: question ? question.category : QuestionCategory.MCQ,
      questionText: "",
      questionTextArray: [],
      answerExplainArr: [],
      answerExplain: "",
      prefferedLanguage: [],
      questionHeader: question ? question.questionHeader : "",
      answerNumber: 0,
      minusMark: question ? question.minusMark : 0,
      plusMark: question ? question.plusMark : 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      partialMark: false,
      answers: [],
      // Description for coding arguments
      userInputDescription: "",
      hasUserInput: false,
      argumentDescription: "",
      hasArg: false,
      modelId: 0,
      tComplexity: 0,
      coding:
        question &&
        question.category == "code" &&
        question.coding &&
        question.coding[0]
          ? [
              {
                language: question.coding[0].language,
                template: "",
                solution: "",
                timeLimit: 0,
                memLimit: 0,
              },
            ]
          : [],
      testcases: [],
      approveStatus: "",
      alternativeExplanations: [],
      tags: [],
    };

    for (let i = 0; i < 4; i++) {
      addAnswer(updatedq);
    }
  };

  const setCategory = (cat: any) => {
    setQuestion({
      ...question,
      category: cat,
    });
  };

  const cancel = () => {
    if (testId_temp) {
      const params = {
        menu: "question",
      };

      if (temp_order) {
        params.order = temp_order;
      }

      if (testMenu_temp) {
        params.menu = testMenu_temp;
      }

      // Redirect to test's question tab
      router.push(`/assessment/details/${testId_temp}`);
    } else {
      router.back();
    }
  };

  const save = (ev: any) => {
    const updatedQ = question;
    if (validateQuestion()) {
      setSubmitted("submitted");
      let practiceSets_temp = [];
      if (!questionId) {
        if (testId_temp) {
          practiceSets_temp.push(testId_temp);

          updatedQ.practiceSets = practiceSets_temp;
        }
      }
      updatedQ.subject = {
        _id: selectedSubject._id,
        name: selectedSubject.name,
      };
      updatedQ.unit = {
        _id: selectedUnit._id,
        name: selectedUnit.name,
      };
      updatedQ.topic = {
        _id: selectedTopic._id,
        name: selectedTopic.name,
      };

      let complexity_temp = "";

      if (complexity == "easy") {
        complexity_temp = QuestionComplexity.EASY;
        updatedQ.complexity = QuestionComplexity.EASY;
      }
      if (complexity == "moderate") {
        complexity_temp = QuestionComplexity.MODERATE;

        updatedQ.complexity = QuestionComplexity.MODERATE;
      }
      if (complexity == "hard") {
        complexity_temp = QuestionComplexity.HARD;
        updatedQ.complexity = QuestionComplexity.HARD;
      }
      let isAllowReuse_temp = "";
      if (isAllowReuse == "global") {
        isAllowReuse_temp = IsAllowReuse.GLOBAL;

        updatedQ.IsAllowReuse = IsAllowReuse.GLOBAL;
      }
      if (isAllowReuse == "self") {
        isAllowReuse_temp = IsAllowReuse.SELF;
        updatedQ.isAllowReuse = IsAllowReuse.SELF;
      }
      if (isAllowReuse == "none") {
        isAllowReuse_temp = IsAllowReuse.NONE;
        updatedQ.isAllowReuse = IsAllowReuse.NONE;
      }
      if (isAllowReuse == "everyone") {
        isAllowReuse_temp = IsAllowReuse.EVERYONE;
        updatedQ.isAllowReuse = IsAllowReuse.EVERYONE;
      }
      setQuestion(updatedQ);

      const params: any = { question: updatedQ };
      if (testDetails) {
        params.testId = testId_temp;
      }
      if (sectionName) {
        params.section = sectionName;
      }

      if (!questionId) {
        questionSvc
          .create(params)
          .then((q) => {
            success("Question is created successfully.");
            if (ev === false) {
              router.back();
            }
            postSave(ev);
            setSubmitted("done");
          })
          .catch((err) => {
            setSubmitted("error");

            if (err.error && err.error.message) {
              error(err.error.message);
            } else {
              alert("Message", "Failed to create question");
            }
          });
      } else {
        questionSvc
          .updateQuestion(questionId, params)
          .then((q) => {
            if (q) {
              postSave(ev);
              if (ev === false) {
                router.back();
              }
              setSubmitted("done");
            }
          })
          .catch((err) => {
            setSubmitted("error");
          });
      }
    } else {
      setSubmitted("error");
    }
  };

  const postSave = (ev: any) => {
    if (ev) {
      setCurrentStep(0);
      setSettings({
        ...settings,
        isNew: true,
      });
      if (sectionName) {
        setSettings({
          ...settings,
          lastSection: sectionName,
        });
      }
      refreshQuestion();
    } else {
      if (ev.next) {
        // get next question to edit from the test
        const cachedData = localStorage.getItem(
          "test_" + testId_temp + "_questions"
        );
        if (!questionId || !cachedData) {
          testSvc
            .getQuestionList(testId_temp)
            .then((questions: string[]) => {
              localStorage.setItem(
                "test_" + testId_temp + "_questions",
                JSON.stringify(questions)
              );
              // goToNextQuestion(questions);
              router.back();
            })
            .catch((err) => {
              alert("", "Fail to get next question");
            });
        } else {
          try {
            const questions = JSON.parse(cachedData);

            goToNextQuestion(questions);
          } catch (ex) {
            alert("Message", "Fail to get next question");
          }
        }
      } else if (ev.more) {
        setSettings({
          ...settings,
          isNew: true,
        });
        if (sectionName) {
          setSettings({
            ...settings,
            lastSection: sectionName,
          });
        }
        // router.push('/assessment/details/' + testId_temp);

        refreshQuestion();
      } else {
        if (testId_temp) {
          const params: any = {
            menu: "question",
          };

          if (temp_order) {
            params.order = temp_order;
          }

          if (testMenu_temp) {
            params.menu = testMenu_temp;
          }

          // Redirect to test's question tab
          return;
        }
        // router.back()
      }
    }
  };

  const goToNextQuestion = (questions: any) => {
    let qidx = questions.findIndex((q) => q._id == questionId);
    if (qidx == -1) {
      alert("", "Fail to get next question");
      return;
    } else if (qidx == questions.length - 1) {
      qidx = 0;
    } else {
      qidx++;
    }
    let nextQ = questions[qidx];

    for (let i = 0; i < questions.length; i++) {
      if (!nextQ.canEdit) {
        if (qidx == questions.length - 1) {
          qidx = 0;
        } else {
          qidx++;
        }
        nextQ = questions[qidx];
      } else {
        break;
      }
    }

    if (!nextQ.canEdit) {
      alert("", "No more question to edit.");
      return;
    }

    const newParams = {};

    // if (qidx == questions.length - 1) {
    //   newParams.last = true;
    // }

    // newParams.order = nextQ.order

    // router.push('/question/edit/' + nextQ._id)
  };

  const validateQuestion = () => {
    if (!selectedSubject) {
      alert("Message", "Please select subject");
      return false;
    }
    if (!selectedUnit) {
      alert("Message", "Please select unit");
      return false;
    }
    if (!selectedTopic) {
      alert("Message", "Please select topic");
      return false;
    }
    if (!question.questionText) {
      alert("Message", "Question text is required");
      return false;
    }

    if (!temp_marksAtTestLevel && !question.plusMark) {
      alert("Message", "Positive marks is required");
      return false;
    }

    if (question.plusMark < 0) {
      alert("Message", "Positive marks cannot < 0");
      return false;
    }

    if (question.minusMark > 0) {
      alert("Message", "Negative marks cannot > 0");
      return false;
    }

    return true;
  };

  const convertMathml = (q?: any) => {
    if (q) {
      if (q.questionText?.indexOf("<math") > -1) {
        const update_questionText = mathmlToLatex(q.questionText);

        q.questionText = update_questionText;
      }
      if (q.answerExplain?.indexOf("<math") > -1) {
        const update_question_answerExplain = mathmlToLatex(q.answerExplain);
        q.answerExplain = update_question_answerExplain;
      }
      if (q.questionHeader?.indexOf("<math") > -1) {
        const update_question_questionHeader = mathmlToLatex(q.questionHeader);
        q.questionHeader = update_question_questionHeader;
      }

      if (q.answers) {
        const update_answers = q.answers.map((a) => {
          if (a.answerText?.indexOf("<math") > -1) {
            return {
              ...a,
              answerText: mathmlToLatex(a.answerText),
            };
          }
          return a;
        });
        q.answers = update_answers;
      }
      setQuestion(q);
    } else {
      if (question.questionText?.indexOf("<math") > -1) {
        const update_questionText = mathmlToLatex(question.questionText);
        setQuestion({
          ...question,
          questionText: update_questionText,
        });
      }
      if (question.answerExplain?.indexOf("<math") > -1) {
        const update_question_answerExplain = mathmlToLatex(
          question.answerExplain
        );
        setQuestion({
          ...question,
          answerExplain: update_question_answerExplain,
        });
      }
      if (question.questionHeader?.indexOf("<math") > -1) {
        const update_question_questionHeader = mathmlToLatex(
          question.questionHeader
        );
        setQuestion({
          ...question,
          questionHeader: update_question_questionHeader,
        });
      }

      if (question.answers) {
        const update_answers = question.answers.map((a) => {
          if (a.answerText?.indexOf("<math") > -1) {
            return {
              ...a,
              answerText: mathmlToLatex(a.answerText),
            };
          }
          return a;
        });

        setQuestion({
          ...question,
          answers: update_answers,
        });
      }
    }
  };

  const mathmlToLatex = (text: any) => {
    return text;
    // const div = document.createElement('div');
    // div.innerHTML = text;

    // div.querySelectorAll('span.math-tex > math').forEach(mathText => {
    //   const parent = mathText.parentNode;
    //   div.innerHTML = div.innerHTML.replace(parent.outerHTML, '<script type="math/tex">' + Mathml2latex.convert(mathText.outerHTML) + '</script>'); // Invisible character U+2800
    // });

    // div.querySelectorAll('math').forEach(math => {
    //   div.innerHTML = div.innerHTML.replace(math.outerHTML, '<script type="math/tex">' + Mathml2latex.convert(math.outerHTML) + '</script>'); // Invisible character U+2800
    // });

    // return div.innerHTML;
  };

  const onChangeSubjects = (e) => {
    const selected_item = subjects.filter((sub) => sub._id === e.target.value);
    setSelectedSubject(selected_item[0]);
    setUnits(selected_item[0].units);
    setSelectedUnit(selected_item[0].units[0]);
    setTopics(selected_item[0].units[0].topics);
    setSelectedTopic(selected_item[0].units[0].topics[0]);
  };

  const onchangeUnits = (e) => {
    const selected_item = units.filter((unit) => unit._id === e.target.value);

    setSelectedUnit(selected_item[0]);
    setTopics(selected_item[0].topics);
  };
  const changeTopics = (e) => {
    const selected_item = topics.filter(
      (topic) => topic._id === e.target.value
    );
    setSelectedTopic(selected_item[0]);
  };

  return (
    <>
      <div className="my-gap-common">
        <div className="container">
          <div className="mx-auto">
            <div className="section_heading_wrapper">
              <h3 className="section_top_heading">
                {!questionId ? "Create New Question" : "Edit Question"}
              </h3>
            </div>
            {questionId && (
              <div className="rounded-boxes bg-white">
                <div className="form-row align-items-center">
                  {temp_order && (
                    <div className="col-auto">
                      <div className="number_box">{temp_order}</div>
                    </div>
                  )}
                  <div className="col text-truncate">
                    <div className="ques question_truncate_wrap">
                      {question?.questionText && (
                        <h4>
                          <MathJax value={question.questionText} />
                        </h4>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {question ? (
              <div className="dashboard-area assess-create-ques">
                <div className="post-box bg-white rounded-boxes form-boxes">
                  <div className="row">
                    <div className="assess-edit-align col-lg-4">
                      <div className="form-group">
                        <h4 className="form-box_subtitle">Subject</h4>
                        {temp_status === "published" ? (
                          <div>{question?.subject?.name}</div>
                        ) : (
                          <select
                            className="form-control form-control-sm border-bottom rounded-0 mw-100 my-0"
                            name="subject"
                            value={selectedSubject?._id}
                            onChange={(e) => onChangeSubjects(e)}
                            required
                          >
                            <option value="" disabled>
                              Select
                            </option>
                            <option value="" hidden></option>
                            {subjects?.map((subject, index) => (
                              <option key={subject._id} value={subject._id}>
                                {subject.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                    <div className="assess-edit-align col-lg-4">
                      <div className="form-group">
                        <h4 className="form-box_subtitle">Unit</h4>
                        {temp_status === "published" ? (
                          <div>{question?.unit?.name}</div>
                        ) : (
                          <select
                            className="form-control form-control-sm border-bottom rounded-0 mw-100 my-0"
                            name="unit"
                            value={selectedUnit?._id}
                            onChange={(e) => onchangeUnits(e)}
                            required
                          >
                            <option value="" disabled>
                              Select
                            </option>
                            {units.map((unit, index) => (
                              <option key={unit._id} value={unit._id}>
                                {unit.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                    <div className="assess-edit-align col-lg-4">
                      <div className="form-group">
                        <h4 className="form-box_subtitle">Topic</h4>
                        {temp_status === "published" ? (
                          <div>{question?.topic?.name}</div>
                        ) : (
                          <select
                            className="form-control form-control-sm border-bottom rounded-0 mw-100 my-0"
                            name="topic"
                            value={selectedTopic?._id}
                            onChange={(e) => changeTopics(e)}
                            required
                          >
                            <option value="" hidden></option>
                            <option value="" disabled>
                              Select
                            </option>
                            {topics.map((topic, index) => (
                              <option key={topic._id} value={topic._id}>
                                {topic.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="assess-edit-align col-lg-4">
                      <div className="form-group">
                        <h4 className="form-box_subtitle">Difficulty</h4>
                        <div className="form-row mt-2">
                          <div className="col-auto d-flex align-items-center">
                            <div className="container1 my-0">
                              <div className="radio my-0">
                                <input
                                  type="radio"
                                  value="easy"
                                  name="complexity"
                                  id="easy"
                                  checked={complexity === "easy"}
                                  onChange={() => {
                                    // handleDifficultyChange('easy')
                                    setComplexity("easy");
                                  }}
                                />
                                <label htmlFor="easy" className="my-0"></label>
                              </div>
                            </div>
                            <div className="rights my-0">Easy</div>
                          </div>
                          <div className="col-auto d-flex align-items-center">
                            <div className="container1 my-0">
                              <div className="radio my-0">
                                <input
                                  type="radio"
                                  value="moderate"
                                  name="complexity"
                                  id="moderate"
                                  checked={complexity === "moderate"}
                                  onChange={() => {
                                    // handleDifficultyChange('moderate')
                                    setComplexity("moderate");
                                  }}
                                />
                                <label
                                  htmlFor="moderate"
                                  className="my-0"
                                ></label>
                              </div>
                            </div>
                            <div className="rights my-0">Medium</div>
                          </div>
                          <div className="col-auto d-flex align-items-center">
                            <div className="container1 my-0">
                              <div className="radio my-0">
                                <input
                                  type="radio"
                                  value="hard"
                                  name="complexity"
                                  id="hard"
                                  checked={complexity === "hard"}
                                  onChange={() => {
                                    // handleDifficultyChange('hard')
                                    setComplexity("hard");
                                  }}
                                />
                                <label htmlFor="hard" className="my-0"></label>
                              </div>
                            </div>
                            <div className="rights my-0">Hard</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-4">
                      <div className="form-group">
                        <h4 className="form-box_subtitle">
                          Visibility in the Question Bank
                        </h4>
                        <div className="form-row mt-2">
                          {user?.role === "publisher" ||
                          (user?.primaryInstitute &&
                            user?.primaryInstitute?.type === "publisher") ? (
                            <div className="col-auto d-flex align-items-center">
                              <div className="container1 my-0">
                                <div className="radio my-0">
                                  <input
                                    type="radio"
                                    value="global"
                                    name="isAllowReuse"
                                    id="global"
                                    checked={isAllowReuse === "global"}
                                    onChange={() => setIsAllowReuse("global")}
                                  />
                                  <label
                                    htmlFor="global"
                                    className="my-0"
                                  ></label>
                                </div>
                              </div>
                              <div className="rights my-0">Global</div>
                            </div>
                          ) : (
                            <>
                              <div className="col-auto d-flex align-items-center">
                                <div className="container1 my-0">
                                  <div className="radio my-0">
                                    <input
                                      type="radio"
                                      value="everyone"
                                      name="isAllowReuse"
                                      id="everyone"
                                      checked={isAllowReuse === "everyone"}
                                      onChange={() =>
                                        setIsAllowReuse("everyone")
                                      }
                                    />
                                    <label
                                      htmlFor="everyone"
                                      className="my-0"
                                    ></label>
                                  </div>
                                </div>
                                <div className="rights my-0">Everyone</div>
                              </div>
                              <div className="col-auto d-flex align-items-center">
                                <div className="container1 my-0">
                                  <div className="radio my-0">
                                    <input
                                      type="radio"
                                      value="self"
                                      name="isAllowReuse"
                                      id="self"
                                      checked={isAllowReuse === "self"}
                                      onChange={() => setIsAllowReuse("self")}
                                    />
                                    <label
                                      htmlFor="self"
                                      className="my-0"
                                    ></label>
                                  </div>
                                </div>
                                <div className="rights my-0">Self</div>
                              </div>
                            </>
                          )}

                          {!temp_forQB && (
                            <div className="col-auto d-flex align-items-center">
                              <div className="container1 my-0">
                                <div className="radio my-0">
                                  <input
                                    type="radio"
                                    value="none"
                                    name="isAllowReuse"
                                    id="none"
                                    checked={isAllowReuse === "none"}
                                    onChange={() => setIsAllowReuse("none")}
                                  />
                                  <label
                                    htmlFor="none"
                                    className="my-0"
                                  ></label>
                                </div>
                              </div>
                              <div className="rights my-0">None</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="post-box bg-white form-boxes">
                  <div className="assess-edit-align">
                    <div className="profile-box clearfix rounded-boxes form-boxes">
                      <div className="profile-info1">
                        <h4 className="form-box_subtitle">
                          Question Type (Each type has a different template)
                        </h4>

                        <div className="d-flex overflow-auto mt-3">
                          {temp_status !== "published" ? (
                            <>
                              {/* {settings?.features.coding && ( */}
                              <div
                                className={`col-auto text-center ${
                                  question.category === "code"
                                    ? "border-bottom border-primary bordrCustomWth"
                                    : ""
                                }`}
                                onClick={() => setCategory("code")}
                              >
                                <div className="tab-icon-text">
                                  <i className="fas fa-laptop-code fa-3x"></i>
                                  <div className="ques-type-click">CODING</div>
                                </div>
                              </div>
                              {/* )} */}
                              <div
                                className={`col-auto text-center ${
                                  question.category === "descriptive"
                                    ? "border-bottom border-primary bordrCustomWth"
                                    : ""
                                }`}
                                onClick={() => setCategory("descriptive")}
                              >
                                <div className="tab-icon-text">
                                  <i className="fas fa-file-signature fa-3x"></i>
                                  <div className="ques-type-click">
                                    DESCRIPTIVE
                                  </div>
                                </div>
                              </div>
                              <div
                                className={`col-auto text-center ${
                                  question.category === "fib"
                                    ? "border-bottom border-primary bordrCustomWth"
                                    : ""
                                }`}
                                onClick={() => setCategory("fib")}
                              >
                                <div className="tab-icon-text">
                                  <i className="far fa-meh-blank fa-3x"></i>
                                  <div className="ques-type-click">
                                    FILL IN THE BLANKS
                                  </div>
                                </div>
                              </div>
                              <div
                                className={`col-auto text-center ${
                                  question.category === "mcq"
                                    ? "border-bottom border-primary bordrCustomWth"
                                    : ""
                                }`}
                                onClick={() => setCategory("mcq")}
                              >
                                <div className="tab-icon-text">
                                  <i className="fas fa-th-list fa-3x"></i>
                                  <div className="ques-type-click">MCQ</div>
                                </div>
                              </div>
                              <div
                                className={`col-auto text-center ${
                                  question.category === "mixmatch"
                                    ? "border-bottom border-primary bordrCustomWth"
                                    : ""
                                }`}
                                onClick={() => setCategory("mixmatch")}
                              >
                                <div className="tab-icon-text">
                                  <i className="fas fa-equals fa-3x"></i>
                                  <div className="ques-type-click">
                                    MISMATCH
                                  </div>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="d-flex overflow-auto">
                              <div
                                className={`col-auto text-center border-bottom border-primary bordrCustomWth ${
                                  question.category === "code"
                                    ? "border-bottom border-primary bordrCustomWth"
                                    : ""
                                }`}
                              >
                                <div className="tab-icon-text">
                                  <i className="fas fa-laptop-code fa-3x"></i>
                                  <div className="ques-type-click">CODING</div>
                                </div>
                              </div>
                              <div
                                className={`col-auto text-center border-bottom border-primary bordrCustomWth ${
                                  question.category === "descriptive"
                                    ? "border-bottom border-primary bordrCustomWth"
                                    : ""
                                }`}
                              >
                                <div className="tab-icon-text">
                                  <i className="fas fa-file-signature fa-3x"></i>
                                  <div className="ques-type-click">
                                    DESCRIPTIVE
                                  </div>
                                </div>
                              </div>
                              <div
                                className={`col-auto text-center border-bottom border-primary bordrCustomWth ${
                                  question.category === "fib"
                                    ? "border-bottom border-primary bordrCustomWth"
                                    : ""
                                }`}
                              >
                                <div className="tab-icon-text">
                                  <i className="far fa-meh-blank fa-3x"></i>
                                  <div className="ques-type-click">
                                    FILL IN THE BLANKS
                                  </div>
                                </div>
                              </div>
                              <div
                                className={`col-auto text-center border-bottom border-primary bordrCustomWth ${
                                  question.category === "mcq"
                                    ? "border-bottom border-primary bordrCustomWth"
                                    : ""
                                }`}
                              >
                                <div className="tab-icon-text">
                                  <i className="fas fa-th-list fa-3x"></i>
                                  <div className="ques-type-click">MCQ</div>
                                </div>
                              </div>
                              <div
                                className={`col-auto text-center border-bottom border-primary bordrCustomWth ${
                                  question.category === "mixmatch"
                                    ? "border-bottom border-primary bordrCustomWth"
                                    : ""
                                }`}
                              >
                                <div className="tab-icon-text">
                                  <i className="fas fa-equals fa-3x"></i>
                                  <div className="ques-type-click">
                                    MISMATCH
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* question editor */}
                {question.category == "fib" && (
                  <FibQuestionComponent
                    hidden={question.category !== "fib"}
                    question={question}
                    setQuestion={setQuestion}
                    settings={settings}
                    presave={presave}
                    currentStep={currentStep}
                    setCurrentStep={setCurrentStep}
                    onCkeditorReady={onCkeditorReady}
                    canNavigate={canNavigate}
                    cancel={cancel}
                    next={next}
                    save={save}
                    processing={processing}
                    saveAndNext={saveAndNext}
                    user={user}
                    instructionFileUploadClick={InstructionFileUpload}
                    questionFileUploadClick={onQuestionFileUpload}
                  />
                )}

                {question.category == "mcq" && (
                  <McqQuestionComponent
                    hidden={question.category !== "mcq"}
                    question={question}
                    setQuestion={setQuestion}
                    settings={settings}
                    onCancelQuestion={cancel}
                    onSaveQuestion={save}
                    presave={presave}
                    currentStep={currentStep}
                    setCurrentStep={setCurrentStep}
                    onCkeditorReady={onCkeditorReady}
                    canNavigate={canNavigate}
                    cancel={cancel}
                    save={save}
                    processing={processing}
                    setProcessing={setProcessing}
                    saveAndNext={saveAndNext}
                    user={user}
                    onQuestionChanged={onQuestionChanged}
                    addAnswer={addAnswer}
                    reset={reset}
                    removeAnswer={removeAnswer}
                    instructionFileUploadClick={InstructionFileUpload}
                    questionFileUploadClick={onQuestionFileUpload}
                    next={next}
                  />
                )}
                {question.category == "mixmatch" && (
                  <MixMatchQuestionComponent
                    hidden={question.category !== "mixmatch"}
                    question={question}
                    setQuestion={setQuestion}
                    settings={settings}
                    presave={presave}
                    currentStep={currentStep}
                    setCurrentStep={setCurrentStep}
                    onCkeditorReady={onCkeditorReady}
                    canNavigate={canNavigate}
                    cancel={cancel}
                    save={save}
                    next={next}
                    processing={processing}
                    saveAndNext={saveAndNext}
                    user={user}
                    onQuestionChanged={onQuestionChanged}
                    reset={reset}
                    instructionFileUploadClick={InstructionFileUpload}
                    questionFileUploadClick={onQuestionFileUpload}
                    removeAnswer={removeAnswer}
                    addAnswer={addAnswer}
                  />
                )}

                {question.category == "descriptive" && (
                  <DescriptiveQuestionComponent
                    hidden={question.category !== "descriptive"}
                    question={question}
                    setQuestion={setQuestion}
                    settings={settings}
                    presave={presave}
                    currentStep={currentStep}
                    setCurrentStep={setCurrentStep}
                    onCkeditorReady={onCkeditorReady}
                    canNavigate={canNavigate}
                    cancel={cancel}
                    save={save}
                    next={next}
                    processing={processing}
                    saveAndNext={saveAndNext}
                    user={user}
                    onQuestionChanged={onQuestionChanged}
                    reset={reset}
                    instructionFileUploadClick={InstructionFileUpload}
                    questionFileUploadClick={onQuestionFileUpload}
                    removeAnswer={removeAnswer}
                    addAnswer={addAnswer}
                  />
                )}

                {question.category == "code" && (
                  <CodingQuestionComponent
                    hidden={question.category !== "code"}
                    question={question}
                    setQuestion={setQuestion}
                    settings={settings}
                    presave={presave}
                    currentStep={currentStep}
                    setCurrentStep={setCurrentStep}
                    onCkeditorReady={onCkeditorReady}
                    canNavigate={canNavigate}
                    cancel={cancel}
                    save={save}
                    next={next}
                    processing={processing}
                    setProcessing={setProcessing}
                    saveAndNext={saveAndNext}
                    user={user}
                    onQuestionChanged={onQuestionChanged}
                    reset={reset}
                    instructionFileUploadClick={InstructionFileUpload}
                    questionFileUploadClick={onQuestionFileUpload}
                    removeAnswer={removeAnswer}
                    addAnswer={addAnswer}
                  />
                )}
              </div>
            ) : (
              <>
                <div className="rounded-boxes bg-white">
                  <SkeletonLoaderComponent Cwidth="100" Cheight="250" />
                </div>
                <div className="rounded-boxes bg-white">
                  <SkeletonLoaderComponent Cwidth="100" Cheight="250" />
                </div>
                <div className="rounded-boxes bg-white">
                  <SkeletonLoaderComponent Cwidth="100" Cheight="250" />
                </div>
                <div className="rounded-boxes bg-white">
                  <SkeletonLoaderComponent Cwidth="100" Cheight="250" />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <div id="tmpCode" className="d-none"></div>
    </>
  );
};

export default CreateQuestion;
