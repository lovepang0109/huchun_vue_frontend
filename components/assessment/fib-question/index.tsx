import { useState, useEffect } from "react";
import MathJax from "../mathjax";

const FibQuestion = ({
  question,
  setQuestion,
  userAnswers,
  readonly,
}: {
  question: any;
  setQuestion: any;
  userAnswers: any;
  readonly?: boolean;
}) => {
  const [loaded, setLoaded] = useState<boolean>(false);
  const [qT, setQText] = useState<any>(question.questionText)

  const onQuestionChanged = () => {
    let quest = question;
    let qText = question.questionText;
    const regex = /\{{([^}]+)\}}/gm;
    let m = null;
    let idx = 0;

    // Find any fib fields
    while ((m = regex.exec(qText)) !== null) {
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }
      const answer = m[0];
      const textId = question.answers[idx]._id;

      const textwidth = 95 + "px";

      const at = question.answers[idx].answerText;

      // Change the fib field to input field or math input field
      if (at.indexOf("<math ") > -1) {
        qText = qText.replace(
          answer,
          '<span style="display: inline-table; border-bottom: solid 1px black; min-width:100px"  type="text" name="mathlive_field" class="fib-input-' +
          question._id +
          '" id="m_' +
          textId +
          '"></span>' +
          '<a onclick="mathControl(' +
          idx +
          ",'" +
          textId +
          '\')"><svg style="height: 18px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M528 64H48C21.49 64 0 85.49 0 112v288c0 26.51 21.49 48 48 48h480c26.51 0 48-21.49 48-48V112c0-26.51-21.49-48-48-48zm16 336c0 8.823-7.177 16-16 16H48c-8.823 0-16-7.177-16-16V112c0-8.823 7.177-16 16-16h480c8.823 0 16 7.177 16 16v288zM168 268v-24c0-6.627-5.373-12-12-12h-24c-6.627 0-12 5.373-12 12v24c0 6.627 5.373 12 12 12h24c6.627 0 12-5.373 12-12zm96 0v-24c0-6.627-5.373-12-12-12h-24c-6.627 0-12 5.373-12 12v24c0 6.627 5.373 12 12 12h24c6.627 0 12-5.373 12-12zm96 0v-24c0-6.627-5.373-12-12-12h-24c-6.627 0-12 5.373-12 12v24c0 6.627 5.373 12 12 12h24c6.627 0 12-5.373 12-12zm96 0v-24c0-6.627-5.373-12-12-12h-24c-6.627 0-12 5.373-12 12v24c0 6.627 5.373 12 12 12h24c6.627 0 12-5.373 12-12zm-336 80v-24c0-6.627-5.373-12-12-12H84c-6.627 0-12 5.373-12 12v24c0 6.627 5.373 12 12 12h24c6.627 0 12-5.373 12-12zm384 0v-24c0-6.627-5.373-12-12-12h-24c-6.627 0-12 5.373-12 12v24c0 6.627 5.373 12 12 12h24c6.627 0 12-5.373 12-12zM120 188v-24c0-6.627-5.373-12-12-12H84c-6.627 0-12 5.373-12 12v24c0 6.627 5.373 12 12 12h24c6.627 0 12-5.373 12-12zm96 0v-24c0-6.627-5.373-12-12-12h-24c-6.627 0-12 5.373-12 12v24c0 6.627 5.373 12 12 12h24c6.627 0 12-5.373 12-12zm96 0v-24c0-6.627-5.373-12-12-12h-24c-6.627 0-12 5.373-12 12v24c0 6.627 5.373 12 12 12h24c6.627 0 12-5.373 12-12zm96 0v-24c0-6.627-5.373-12-12-12h-24c-6.627 0-12 5.373-12 12v24c0 6.627 5.373 12 12 12h24c6.627 0 12-5.373 12-12zm96 0v-24c0-6.627-5.373-12-12-12h-24c-6.627 0-12 5.373-12 12v24c0 6.627 5.373 12 12 12h24c6.627 0 12-5.373 12-12zm-96 152v-8c0-6.627-5.373-12-12-12H180c-6.627 0-12 5.373-12 12v8c0 6.627 5.373 12 12 12h216c6.627 0 12-5.373 12-12z"></path></svg></a>'
        );
      } else {
        // let patt = /[ \d_]+$/gm;
        // if(patt.test(at)){
        if (
          !isNaN(at.replace(/<[^>]+>/gm, "")) ||
          !isNaN(at.split("_")[0]) ||
          !isNaN(at.split("|")[0])
        ) {

          qText = qText.replace(
            answer,
            // '<input autofocus autocomplete="off" style="width:' +
            // textwidth +
            // '"  type="number" class="answer-input-box border-0 p-0 fib-input-' +
            // question._id +
            // '" id="' +
            // textId +
            // '" onclick="textClick(' +
            // idx +
            // ',id)" oninput="inputChange(' +
            // idx +
            // ',this)"/>'
            `<input autofocus autocomplete="off" style="width:${textwidth}" type="number" class="answer-input-box border-0 p-0 fib-input-${question._id}" id="${textId}" onclick="(idx, itemId) => { const event = new CustomEvent('onclick', { 'detail': { index: ${idx}, id: '${textId}' } }); document.getElementById('_ID_').dispatchEvent(event); }" oninput="(idx, ctrl, latex) => { const txt = ctrl.value; if (ctrl.style) { ctrl.style.width = ((ctrl.value.length + 1) * 12) + 'px'; } const event = new CustomEvent('oninput', { 'detail': { index: ${idx}, text: txt, latex: latex } }); document.getElementById('_ID_').dispatchEvent(event); }"/>`
          );
        } else {
          qText = qText.replace(
            answer,
            // '<input autofocus autocomplete="off" style="width:' +
            // textwidth +
            // '"  type="text" class="answer-input-box border-0 p-0 fib-input-' +
            // question._id +
            // '" id="' +
            // textId +
            // '" onclick="textClick(' +
            // idx +
            // ',id)" oninput="inputChange(' +
            // idx +
            // ',this)"/>'
            `<input autofocus autocomplete="off" style="width:${textwidth}" type="text" class="answer-input-box border-0 p-0 fib-input-${question._id}" id="${textId}" onclick="(idx, itemId) => { const event = new CustomEvent('onclick', { 'detail': { index: ${idx}, id: '${textId}' } }); document.getElementById('_ID_').dispatchEvent(event); }" oninput="(idx, ctrl, latex) => { const txt = ctrl.value; if (ctrl.style) { ctrl.style.width = ((ctrl.value.length + 1) * 12) + 'px'; } const event = new CustomEvent('oninput', { 'detail': { index: ${idx}, text: txt, latex: latex } }); document.getElementById('_ID_').dispatchEvent(event); }"/>`
          );

        }
      }
      setQText(qText)
      idx++;
    }

    quest.questionText = qText;
    setQuestion(quest);
    // Set old question
    if (userAnswers && userAnswers.answers && userAnswers.answers.length > 0) {
      setTimeout(() => {
        userAnswers.answers.forEach((answer: any) => {
          let e = document.getElementById(answer.answerId) as HTMLInputElement;
          let me = document.getElementById("m_" + answer.answerId);

          if (answer.mathData) {
            if (me != null) {
              me.textContent = answer.mathData;
            }
          } else {
            if (e != null) {
              e.value = answer.answerText;
            }
          }
        });
      }, 200);
    }
    setLoaded(true);
  };
  useEffect(() => {
    onQuestionChanged();

    if (!readonly) {
      setTimeout(() => {
        const s = document.createElement("script");
        s.type = "text/javascript";
        s.text = `var fibFields = {}; var displayingMathItems = {};
          let textClick = (idx, itemId) => {  
            var event = new CustomEvent("onclick",{ "detail": { index: idx, id:itemId }}); 
            document.getElementById("_ID_").dispatchEvent(event); 
          }
          function inputChange(idx, ctrl, latex) {
              var txt = ctrl.value; 
              if (ctrl.style) {
                ctrl.style.width = ((ctrl.value.length + 1) * 12) + "px"; 
              }
              var event = new CustomEvent("oninput",{ "detail": { index: idx, text: txt, latex: latex }});
              document.getElementById("_ID_").dispatchEvent(event);
          }
          function mathControl(idx, itemId, showMath) {
            /*
            var e = document.getElementById(itemId);
            var me = document.getElementById("m_" + itemId);
            if (showMath) {
                displayingMathItems[itemId] = showMath;
            } else {
                displayingMathItems[itemId] = !displayingMathItems[itemId];
            }
            if (displayingMathItems[itemId]) { 
                e.style.display = "none";
                me.style.display = "inline-table";
                if (fibFields[itemId] && fibFields[itemId].mf) {
                    fibFields[itemId].mf.$perform("showVirtualKeyboard");
                    inputChange(idx, { value: fibFields[itemId].mf.text('mathML') }, fibFields[itemId].mf.text());
                }
            } else {
                //e.style.display = "inline";
                //me.style.display = "none";
                inputChange(idx, { value: e.value });
            }*/
        }
          function createMathField(s, idx, itemId) {
            // console.log(s, idx, itemId)
              fibFields[itemId] = {};
              var obj = {
                  defaultMode:'text',
                  virtualKeyboardMode:'onfocus',
                  ignoreSpacebarInMathMode: false,
                  onContentDidChange: function(mf) {
                      var txt = mf.text('mathML');
                      fibFields[itemId].math = txt;
                      inputChange(idx, { value: txt }, mf.text());
                  },
                  onFocus: function(mf) {
                      textClick(idx, itemId);
                  }
              };
              const mathfield = MathLive.makeMathField(s, obj);
              fibFields[itemId].mf = mathfield;
              return mathfield;
          }

          var fields = document.getElementsByName('mathlive_field')
          for (var i = 0; i < fields.length; i++) {
            console.log(fields[i])
            createMathField(fields[i], i, fields[i].id)
          }
          `;

        // s.text = s.text.replace(/_ID_/g, elmRef.nativeElement.id)

        // renderer.appendChild(elmRef.nativeElement, s);
      }, 500);
    }
  }, []);

  const textClick = (idx: any, itemId: any) => {
    const event = new CustomEvent("onclick", { "detail": { index: idx, id: itemId } });
    document.getElementById("_ID_").dispatchEvent(event);
  }


  return (
    <div className="question-box bg-white">
      {loaded && (
        <div className="question-item">
          <span>
            <MathJax value={qT} />
          </span>
          {question.audioFiles?.length > 0 && (
            <div className="row">
              {question.audioFiles.map((audio: any, i: number) => (
                <div className="position-relative my-2 col-lg-6 col-12" key={i}>
                  <label>{audio.name}</label>
                  <audio controls src={audio.url} className="w-100"></audio>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FibQuestion;
