import { useState, useEffect } from "react";
import { shuffle } from "@/lib/validator";
import { formatQuestion } from "@/lib/pipe";
import MathJax from "../mathjax";

interface props {
  question: any;
  answerChanged: any;
}
const MixmatchQuestion = ({ question, answerChanged }: props) => {
  const [quest, setQuest] = useState<any>(question);
  const [answers, setAnswers] = useState<{ _id: string; userText: any }[]>([]);
  const [leftAnswers, setLeftAnswers] = useState<
    {
      answerTextArray: string[];
      answerText: string;
      correctMatch: string;
      _id: string;
      userText: string;
      isChecked: boolean;
    }[]
  >([]);
  const [leftQuestions, setLeftQuestions] = useState<
    { answerText: string; correctMatch: string; _id: string }[]
  >([]);
  const [correctAnsCount, setCorrectAnsCount] = useState<number>(0);
  const [bottomAnswers, setBottomAnswers] = useState<any>([]);
  const [reload, setReload] = useState<boolean>(false);
  const [options, setOptions] = useState<any[]>([]);
  const [interchangeIndex, setInterchangeIndex] = useState<number>();
  const [dragItem, setDragItem] = useState<any>();

  const questionChanged = (q: any) => {
    let leftAns: any[] = [];
    let leftQuest: any[] = [];
    let bottomAns: any[] = [];
    let opt: any[] = [];
    for (let i = 0; i < q.answers.length; i++) {
      if (q.answers[i] && q.answers[i]["userText"]) {
        opt.push([{ _id: q.answers[i]._id, userText: q.answers[i].userText }]);
        setReload(true);
      }
    }
    leftAns = q.answers;
    leftAns.forEach((r: any, i: number) => {
      leftQuest.push({
        answerText: r.answerText,
        correctMatch: r.correctMatch,
        _id: r._id,
      });
      if (
        leftAns[i].userText !== leftAns[i].correctMatch &&
        leftAns[i].isChecked
      ) {
        bottomAns.push({ userText: r.correctMatch, _id: r._id });
      }
      if (!leftAns[i].isChecked) {
        bottomAns.push({ userText: r.correctMatch, _id: r._id });
      }
    });
    opt.forEach((a) => {
      bottomAns.forEach((ba, j) => {
        if (a[0].userText === ba.userText) {
          bottomAns.splice(j, 1);
        }
      });
    });
    // creating options
    bottomAns.forEach((element) => {
      opt.push([]);
    });
    bottomAns = shuffle(bottomAns);
    setLeftAnswers(leftAns);
    setLeftQuestions(leftQuest);
    setBottomAnswers(bottomAns);
    setOptions(opt);
  };

  useEffect(() => {
    if (question) {
      questionChanged(question);
    }
  }, [question]);

  const checkOptionsHasValue = (dragData: any, items: any) => {
    let val = -1;
    items.forEach((element: any, index: number) => {
      if (
        element &&
        element.length > 0 &&
        element[0].userText === dragData.userText
      ) {
        val = index;
        return;
      }
    });
    return val;
  };

  const onVegetableDrop = (e: any, j: number) => {
    if (options[j].length == 0) {
      if (checkOptionsHasValue(e.dragData, options) > -1) {
        options[checkOptionsHasValue(e.dragData, options)] = [];
      }

      const index = bottomAnswers
        .map((e: any) => e.userText)
        .indexOf(e.dragData.userText);
      if (index > -1) {
        setBottomAnswers((prev: any) => prev.splice(index, 1));
      }
      options[j] = new Array(e.dragData);
      let userRes: any[] = [];
      for (let i = 0; i < leftQuestions.length; i++) {
        if (
          options[i] &&
          options[i][0] &&
          options[i][0].userText &&
          options[i][0].userText !== undefined
        ) {
          userRes.push({
            answerText: leftQuestions[i].answerText,
            userText: options[i][0].userText,
            isChecked: true,
            correctMatch: leftQuestions[i].correctMatch,
            _id: options[i][0]._id,
          });
        } else {
          userRes.push({
            answerText: leftQuestions[i].answerText,
            userText: "",
            correctMatch: leftQuestions[i].correctMatch,
          });
        }
      }
      quest.answers = userRes;
      setQuest(quest);
      let isAnswered = false;
      for (let j = 0; j < userRes.length; j++) {
        if (userRes[j].userText !== "") {
          isAnswered = true;
        }
      }
      answerChanged({
        isAnswer: isAnswered,
        question: quest,
      });
    } else {
      return;
    }
  };
  const swap = (ev: any, index: number, item: any) => {
    let itemIndex = -1;
    let opt = options;
    options.forEach((element: any[], i: number) => {
      if (!element || element.length == 0) {
        return;
      }
      if (element && element.length > 0) {
        if (element[0]._id == ev.dragData._id) {
          itemIndex = i;
          return;
        }
      }
    });

    if (itemIndex == -1) {
      return;
    }

    if (opt[index][0].length == 0) {
      opt[itemIndex][0] = [];
      opt[index][0] = ev.dragData;
    } else {
      opt[itemIndex][0] = item;
      opt[index][0] = ev.dragData;
    }
    const userRes: any[] = [];
    for (let i = 0; i < leftQuestions.length; i++) {
      if (
        opt[i] &&
        opt[i][0] &&
        opt[i][0].userText &&
        opt[i][0].userText !== undefined
      ) {
        userRes.push({
          answerText: leftQuestions[i].answerText,
          userText: opt[i][0].userText,
          isChecked: true,
          correctMatch: leftQuestions[i].correctMatch,
          _id: opt[i][0]._id,
        });
      } else {
        userRes.push({
          answerText: leftQuestions[i].answerText,
          userText: "",
          correctMatch: leftQuestions[i].correctMatch,
        });
      }
    }
    quest.answers = userRes;
    setQuest(quest);
    let isAnswered = false;
    for (let j = 0; j < userRes.length; j++) {
      if (userRes[j].userText !== "") {
        isAnswered = true;
      }
    }

    answerChanged({
      isAnswer: isAnswered,
      question: quest,
    });
  };

  return (
    <div>
      <div className="question-box bg-white">
        <div className="adaptive-question-area">
          <div className="question-item mb-3">
            <span>
              <MathJax value={question.questionText} />
            </span>
          </div>

          <div className="adaptive-question-box adaptive-question-ans bg-white">
            <div className="mix-match row">
              <div className="col-5 mix-match-content">
                {leftQuestions.map((q: any, index: number) => (
                  <div className="mix-match-drag" key={index}>
                    <span>
                      <MathJax value={q.answerText} />
                    </span>
                  </div>
                ))}
              </div>

              <div className="col-5 ml-auto">
                {options.map((t: any, j: number) => (
                  <div
                    className="mix-match-drop-area mix-match-dragd"
                    key={j}
                    onDrop={(e) => onVegetableDrop(e, j)}
                  >
                    <div className="w-100">
                      {t.length === 0 && <div>Drop Answers here</div>}
                      {t.map((item: any, index: number) => (
                        <li
                          className="mix-match-drop"
                          key={`item-${index}`}
                          style={{ listStyleType: "none" }}
                          draggable
                          onDrop={(e) => swap(e, j, item)}
                        >
                          <MathJax value={item.userText} />
                        </li>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mix-match-footer">
        <div className="footer-wrap">
          <div className="inner mx-auto">
            <ul className="d-flex">
              {bottomAnswers.map((number: any, index: number) => (
                <li className="bg-white" key={index}>
                  <MathJax value={number.userText} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
export default MixmatchQuestion;
