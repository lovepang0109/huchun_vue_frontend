import ProgramManagement from "./ProgramManagement";
import "@/public/css/base.style.css";
import { getSettings } from "@/lib/api";

export default async function CurriculumPage() {
  const settings = await getSettings();

  return <ProgramManagement settings={settings} />;
}
