// import { useTakeTestStore } from "@/stores/take-test-store";
// import { Question } from "./Question";

// function Buttons() {
//   const test = useTakeTestStore(state => state.test)
//   const questionIndex = useTakeTestStore(state => state.questionIndex)
//   const nextQuestion = useTakeTestStore(state => state.nextQuestion)
//   const previousQuestion = useTakeTestStore(state => state.previousQuestion)

//   return (
//     <>
//       {questionIndex > 0 ? (
//         <button className="btn btn-secondary me-2" onClick={previousQuestion}>
//           Previous
//         </button>
//       ) : <></>}
//       {questionIndex < test.questions.length - 1 ? (
//         <button className="btn btn-primary" onClick={nextQuestion}>
//           Next
//         </button>
//       ) : <></>}
//     </>
//   )
// }

// function Header() {
//   const test = useTakeTestStore(state => state.test)
//   const questionIndex = useTakeTestStore(state => state.questionIndex)

//   return (
//     <>
//       <h5>{test.title}</h5>
//       <div className="d-flex justify-content-between">
//         <p>Question {questionIndex + 1}/{test.questions.length}</p>

//         <form method="post" >
//           <input
//             type="hidden"
//             name="attemptId"
//             value={test._id}
//           />
//           <button type="submit" className="btn btn-success">Finish</button>
//         </form>
//       </div>
//     </>
//   )
// }

// export function Test() {
//   return (
//     <>
//       <Header></Header>
//       <Question></Question>
//       <Buttons></Buttons>
//     </>
//   );
// }