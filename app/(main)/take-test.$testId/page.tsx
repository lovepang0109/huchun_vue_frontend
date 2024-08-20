// "use client";

// import type { LoaderArgs } from "@remix-run/node";
// import { redirect } from "@remix-run/node";
// import { json } from "@remix-run/node";
// import { useLoaderData } from "@remix-run/react";
// import { ClientOnly } from "remix-utils";
// import { getData } from "services/request";
// import { Test } from "./Test";
// import { Spinner } from "react-bootstrap";
// import { useTakeTestStore } from "~/stores/take-test-store";
// import { useEffect } from "react";

// export const loader = async ({ request, params }: LoaderArgs) => {
//   let test = await getData('/tests/findOneWithQuestions/' + params.testId + '?hasAccessMode=true', request)
//   return json(test);
// };

// export const action = async ({ request, params }: LoaderArgs) => {
//   const body = await request.formData();

//   return redirect(`/attempt/${body.get('attemptId')}`)
// };

// export default function TakeTestIndexRoute() {
//   const testData = useLoaderData<typeof loader>();
//   const initTest = useTakeTestStore((state: any) => state.init)
//   const test = useTakeTestStore((state: any) => state.test)

//   useEffect(() => {
//     if (!test) {
//       initTest(testData)
//     }
//   })

//   return (
//     <>
//       <ClientOnly fallback={<Spinner animation={"border"} />}>
//         {() => <Test />}
//       </ClientOnly>
//     </>
//   );
// }

export default function TakeTestIndexRoute() {

  return (
    <p>
      Take test page
    </p>
  );
}