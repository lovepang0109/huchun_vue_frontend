// import { useTakeTestStore } from "@/stores/take-test-store";


// function Option({ answer }) {
//   return (
//     <div className="d-flex ">
//       <p>
//         <input name={'answer_' + answer._id} type="checkbox" className="mr-2" />
//       </p>
//       <div dangerouslySetInnerHTML={{ __html: answer.answerText }} />
//     </div>
//   );
// }

// export function Question() {
//   const question = useTakeTestStore(state => state.question)

//   return (
//     <>
//       <div dangerouslySetInnerHTML={{ __html: question.questionText }} />
//       {question.answers.map((ans) => {
//         return (
//           <Option key={ans._id} answer={ans} />
//         )
//       })}
//     </>
//   );
// }