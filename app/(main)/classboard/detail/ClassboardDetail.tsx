"use client"
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import clientApi from '@/lib/clientApi';
import MathJax from '@/components/assessment/mathjax';
import { numberToAlpha } from '@/lib/pipe';
import { success, alert } from 'alertifyjs'

export default function ClassBoardDetail() {

  const { user } = useSession()?.data || {};
  const code = useParams();
  const router = useRouter();
  const [classboard, setClassboard] = useState<any>();
  const lockedAnswers: { [key: string]: boolean } = {};``
  const [users, setUsers] = useState<any>();
  const [questionNotFound, setQuestionNotFound] = useState<boolean>(false);

  const [viewingStudent, setViewingStudent] = useState<any>();
  const [currentUserCode, setCurrentUserCode] = useState<any>({});
  let interval: any;
  const [hideHeader, setHideHeader] = useState<boolean>(true);

  const MCQ = ( question : any, answerChanged : any, lockedAnswers: any ) => {
    return (
      <div>
        {/* Render the question */}
        <p>{question}</p>
  
        {/* Render the answer options */}
        {lockedAnswers.map((answer:any, index: any) => (
          <div key={index}>
            <input
              type="radio"
              id={`answer-${index}`}
              name="answer"
              value={answer}
              onChange={answerChanged}
            />
            <label htmlFor={`answer-${index}`}>{answer}</label>
          </div>
        ))}
      </div>
    );
  };

  const YourComponent = ( children:any, answer:any ) => {
    const answerClass = answer.isCorrectAnswer && answer.isCorrectAnswerOfUser !== false
      ? 'green'
      : answer.isCorrectAnswerOfUser === false
      ? 'red'
      : '';
  
    return <div className={answerClass}></div>;
  };

  useEffect(() => {
    // this.spinner.show('appLoader')
    clientApi.get(`/api/questions/classboard/${code}`).then(res => {
      setUsers(res.data.classboard.users);
      setClassboard(res.data.classboard);

      for (const usr of users) {
        // set selection to answer
        if (usr.user._id == user._id) {
          usr.joined = true
          usr.answers.forEach((ans: any) => {
            lockedAnswers[ans.id] = true
          });

          for (const a of classboard.question.answers) {
            for (const ua of usr.answers) {
              if (a._id == ua._id) {
                a.isChecked = true
                a.isCorrectAnswerOfUser = a.isCorrectAnswer
              }
            }
            if (classboard.showAnswer) {
              a.isChecked = a.isChecked || a.isCorrectAnswer
            }
          }
        }

        // Show user answer to classboard owner
        if (user?.info?._id == classboard.user._id) {
          for (const ua of usr.answers) {
            for (let i = 0; i < classboard.question.answers.length; i++) {
              const a = classboard.question.answers[i]
              if (a._id == ua._id) {
                ua.isCorrectAnswerOfUser = a.isCorrectAnswer
                ua.display = numberToAlpha(i)
                break;
              }
            }
          }
        }
      }

      // this.socketSvc.emit('join.classboard', { code: classboard.code, userId: this.user._id, name: this.user.name, avatar: this.user.avatar })

      // this.socketSvc.on("join.classboard", this.onUserJoin, "class-board")
      // this.socketSvc.on("leave.classboard", this.onUserLeave, "class-board")
      // this.socketSvc.on("action.classboard", this.onUserAction, "class-board")

      if (classboard.question.category == 'code') {
        interval = setInterval(() => {
          if (currentUserCode?.selectedLang) {
            sessionStorage.setItem("userCode", JSON.stringify({ user: viewingStudent, code: currentUserCode }))
          }
        }, 1000)

        const savedCode = sessionStorage.getItem("userCode")
        if (savedCode) {
          const data = JSON.parse(savedCode)
          setViewingStudent(data.user);
          setCurrentUserCode(data.code)
        }
      }

      if (user._id == res.data.classboard.user._id) {
        this.eventBusService.emit('chatHistoryEnable', true);
      }
    }).catch(err => {
      console.log(err)
      setQuestionNotFound(true);
    })
    // this.spinner.hide('appLoader')
  }, []);

  const onUserJoin = (data: any) => {
    if (data.code == classboard.code) {
      const fu = users.find((u: any) => u.user._id == data.userId)
      if (fu) {
        fu.joined = true
      } else {
        setUsers([...users, {
          user: { _id: data.userId, name: data.name, avatar: data.avatar },
          joined: true
        }]);
      }
    }
  }

  const onUserLeave = (data: any) => {
    if (data.code == classboard.code) {
      if (users.find((u: any) => u.user._id == data.userId)) {
        users.find((u: any) => u.user._id == data.userId).joined = false
      }
    }
  }

  const onUserAction = (data: any) => {
    if (data.code == classboard.code) {
      if (data.action == 'answer') {
        const fu = users.find((u: any) => u.user._id == data.userId)
        if (fu) {
          if (!fu.answers) {
            fu.answers = []
          }
          fu.answers.push({ _id: data.answer })

          for (const ua of fu.answers) {
            for (let i = 0; i < classboard.question.answers.length; i++) {
              const a = classboard.question.answers[i]
              if (a._id == ua._id) {
                ua.isCorrectAnswerOfUser = a.isCorrectAnswer
                ua.display = numberToAlpha(i)
                break;
              }
            }
          }

          fu.isCorrect = data.isCorrect
          fu.timeTaken = data.timeTaken
        }
      } else if (data.action == 'show answer') {
        setClassboard((prev: any) => ({
          ...prev,
          showAnswer: true
        }))

        const fu = users.find((u: any) => u.user._id == user._id)
        for (const a of classboard.question.answers) {
          for (const ua of fu.answers) {
            if (a._id == ua._id) {
              a.isChecked = true
              a.isCorrectAnswerOfUser = a.isCorrectAnswer
            }
          }
          if (classboard.showAnswer) {
            a.isChecked = a.isChecked || a.isCorrectAnswer
          }
        }
      } else if (data.action == 'get code') {
        this.socketSvc.emit("action.classboard", {
          action: 'show code',
          code: classboard.code,
          userId: data.teacherId,
          userCode: currentUserCode
        })
      } else if (data.action == 'show code') {
        setCurrentUserCode(data.userCode)
      }
    }
  }

  const showAnswer = () => {
    setClassboard((prev: any) => ({
      ...prev,
      showAnswer: true
    }))
    clientApi.put(`/api/questions/classboard/${code}`).then(res => {
      this.socketSvc.emit("action.classboard", {
        action: 'show answer',
        code: classboard.code
      })
    })
  }

  const copyCode = () => {
    success("Class Board Code is copied to your clipboard.")
  }

  const selectAnswer = ( answer: any ) => {
    lockedAnswers[answer._id] = true;
    if (classboard.question.questionType == 'single') {
      // lock all answers
      classboard.question.answers.forEach((an: any) => {
        lockedAnswers[an._id] = true;
      })
    }

    clientApi.put(`/api/questions/classboard/${code}/answer`, classboard.question.answers.filter((an: any) => an.isChecked).map((a:any) => { return { _id: a._id } })).then(res => {
      // this.socketSvc.emit("action.classboard", {
      //   action: 'answer',
      //   code: classboard.code,
      //   userId: user._id,
      //   answer: answer._id,
      //   timeTaken: res.data.timeTaken,
      //   isCorrect: res.data.isCorrect
      // })

      const a = classboard.question.answers.find((a:any) => a._id == answer._id)
      a.isCorrectAnswerOfUser = a.isCorrectAnswer
    })
  }

  const openChat = (user:any) => {
    // this.chatSvc.openChat(user._id, user.name, user.avatar)
  }

  const openCode = (user:any) => {
    setViewingStudent(user);
    // this.socketSvc.emit("action.classboard", {
    //   action: 'get code',
    //   code: classboard.code,
    //   userId: user._id,
    //   teacherId: user._id
    // })
  }

  const closeCode = () => {
    setViewingStudent(null);
    setCurrentUserCode({});
    sessionStorage.removeItem('userCode')
  }

  const goBack = () => {
    const previousLink = sessionStorage.getItem('classboard_org')
    if (previousLink) {
      sessionStorage.removeItem('classboard_org')
      router.push(previousLink)
    } else {
      // location.back()
    }
  }

  return (
    <div>
      {user && <div>
        {/* {user.userRole == 'student' && <student-header></student-header>}
        {user.userRole == 'teacher' && <teacher-header></teacher-header>}
        {user.userRole == 'publisher' && <publisher-header></publisher-header>}
        {user.userRole == 'director' && <director-header></director-header>}
        {user.userRole == 'operator' && <operator-header></operator-header>}
        {user.userRole == 'mentor' && <mentor-header></mentor-header>} */}
      </div>}
      <div className="p-2">
        <div className="code-editor">
          <div className="code-highlight">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <h3 className="code-head">Class Board</h3>
                {classboard?.question.category == 'mcq' && <span>&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;{classboard.question.questionType == 'multiple' ? 'Multiple Answers' : 'Single Answer'}</span>}
              </div>

              <div className="d-flex align-items-center">
                <button className="btn btn-outline mr-2" onClick={goBack}>Return</button>

                {classboard && <div>
                  {viewingStudent && <div className="d-flex align-items-center bg-white mr-2">
                    <figure className="chatimg mx-2">
                      <img src={viewingStudent.avatar} alt="viewing student avatar" className="avatar" />
                    </figure>
                    <h5 className="mx-2">{viewingStudent.name}</h5>
                    <button className="btn btn-link" onClick={closeCode}>Close</button>
                  </div>}
                  {classboard.question.category == 'mcq' && !classboard.showAnswer && user._id == classboard.user._id && <button className="btn btn-primary mr-2" onClick={showAnswer}>Show Result</button>}
                  <span className="bold mr-2">{classboard.code}</span>
                  <a onClick={copyCode}>
                    <span className="material-icons">
                      content_copy
                    </span>
                  </a >
                </div>}
                {user?.userRole == 'student' && <a className="btn btn-outline" href={'..'} > Change Question</a >}
              </div >
            </div >
          </div >

          {classboard && <div className="row no-gutters" >
            <div className="col-8">
              {classboard.question.category == 'mcq' && <div>
                {classboard.question.questionHeader && <div className="border rounded p-3 m-3">
                  <div className="text-dark question-header">
                    <MathJax value={classboard.question.questionHeader}></MathJax>
                  </div>
                </div >}

                {!classboard.showAnswer && <div className="border rounded p-3 m-3">
                <MCQ question={classboard.question} answerChanged={selectAnswer} lockedAnswers={lockedAnswers} ></MCQ>
                </div >}
  

              {classboard.showAnswer && <div className="border rounded p-3 m-3">
                <div className="question-box bg-white min-h-auto mathjax-over-initial">
                  <div className="question-item mb-3">
                    <span>
                      <MathJax value={classboard.question.questionText}></MathJax>
                    </span>

                    {classboard.question.audioFiles?.length && <div className="row">
                      {classboard.question.audioFiles.map((audio: any, index: number) => <div key={index} className="position-relative my-2 col-lg-6 col-12">
                        <label>{audio.name}</label>
                        <audio controls src={audio.url} className="w-100"></audio>
                      </div >)}
                    </div >}
                  </div >

                  <div className="question-answers mb-0">
                    {classboard.question.answers.map((answer: any, index: number) => <YourComponent key={index} answer={answer}>
        <div className="row mb-2">
          <label className="col-auto my-0">
            <input name="answer_{$index}" type="checkbox" value={answer.isChecked} onChange={() => selectAnswer(answer)} disabled />
              <span className="checkmark"></span>
          </label>

          <span className="col answer-text">
            <MathJax value={answer.answerText}></MathJax>
          </span>
        </div>

        {answer.audioFiles?.length && <div className="row">
                      {
                        answer.audioFiles.map((audio: any, i: number) => <div key={i} className="position-relative my-2 col-lg-6 col-12" >
                          <label>{audio.name}</label>
                          <audio controls src={audio.url} className="w-100" ></audio >
                        </div >)
                      }
                      </div>}
      </YourComponent >)}
                </div >
              </div >
              </div >}

              {classboard.question.answerExplain && classboard.showAnswer && <div className="border rounded p-3 m-3">
                        <div className="exp pt-2">
                          <h5>Explanation:</h5>
                          <p>
                            <MathJax value={classboard.question.answerExplain}></MathJax>
                          </p>
                          {classboard.question.answerExplainAudioFiles?.length && <div className="row">
                            {classboard.question.answerExplainAudioFiles.map((audio: any, i: number) => <div key={i} className="position-relative my-2 col-lg-6 col-12" >
                              <label>{audio.name}</label>
                              <audio controls src={audio.url} className="w-100" ></audio >
                            </div >)}
                          </div >}
                        </div >
              </div >}
            </div>}

            {classboard.question.category == 'code' && <div>
              {/* <classboard question = {classboard.question} userCode = {currentUserCode} ></classboard> */}
            </div>}
          </div>
          </div >}
          <div className="col-4">
            <div className="border rounded p-3 m-3">
              <h4>Participants</h4>
              <div className="mt-2">
                {users.map((pu: any) => <div key={pu._id} className="mt-2">
                  <div className="d-flex align-items-center">
                    <figure className="user_img_circled_wrap">
                      <div className="avatar" style={{ backgroundImage: 'url(' + (pu.user.avatar)}}></div>
                    </figure>
                    <div>
                      <div className="d-flex align-items-center">
                        <h5 className="mx-2">{pu.user.name}</h5>
                        {pu.user._id != user._id && <a onClick={() => openChat(pu.user)}><i className="fa fa-comment" aria-hidden="true"></i></a>}
                      </div>
                      {classboard.question.category == 'mcq' && user._id == classboard.user._id && pu.answers?.length && <div>
                        {pu.answers.map((pua: any, i : any) => <span key={i} className={`mx-2 ${pua.isCorrectAnswerOfUser ? 'text-success' : 'text-danger'}`}>
                          {pua.display}
                        </span>)}
                        {pu.isCorrect ? (
                          <i className="fa fa-check" aria-hidden="true"></i>
                        ) : (
                          <i className="fa fa-dot-circle" aria-hidden="true"></i>
                        )}
                      </div >}

                      {classboard.question.category == 'code' && user._id == classboard.user._id && pu.user._id != user._id && <div className="mt-1" >
                    <a onClick={openCode(pu.user)} className="mx-2" >
                      <i className="fa fa-code f-16" aria-hidden="true"></i>
                    </a >
                      </div >}
                    </div >
                  </div >
                </div >)}
              </div >
            </div >
          </div >
        </div >

        { questionNotFound && <div className="text-center h5 py-5" >
        Question may no longer be asked in your class. Check with your teacher and try again.
        </div >
        }
      </div >
    </div >

  );
};
