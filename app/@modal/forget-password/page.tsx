
import { getSettings } from "@/lib/api";
import ForgetPasswordModal from "./ForgetPasswordModal";

export default async function ForgetPasswordPage() {
  const settings = await getSettings()
  return <ForgetPasswordModal settings={settings} />
}