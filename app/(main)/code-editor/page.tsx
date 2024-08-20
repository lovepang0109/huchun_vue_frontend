// page.tsx
import CodeEditor from "./codeEditor";
import "@/public/css/base.style.css";
import "./codeEditor.css";

export default async function CodeEditorRoute() {
  // if (session?.user.role == "teacher") {
  return <CodeEditor />;
  // } else {
  //   return <TeacherOnboarding />;
  // }
}
