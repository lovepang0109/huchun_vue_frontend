import QuestionBank from "./questionBank"; // Use PascalCase for the component name
import "@/public/css/base.style.css";

export default async function ContentRoute() {
  return <QuestionBank />; // Use camelCase when using the component in JSX
}
