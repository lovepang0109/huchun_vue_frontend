import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import SigninForm from "./(auth)/signin/SigninForm";
import { AppLogo } from "@/components/AppLogo";
import { getSettings } from "@/lib/api";
import Link from "next/link";

export default async function Root() {
  const session: any = await getServerSession(authOptions);

  if (session) {
    redirect("/home");
  }

  const settings = await getSettings();

  return (
    <>
      <header>
        <div className="container">
          <div className="header-area classroom d-none d-lg-block ml-4">
            <nav className="navbar navbar-expand-lg navbar-light p-0">
              <Link className="navbar-brand p-0" href="/">
                <AppLogo></AppLogo>
              </Link>
            </nav>
          </div>

          <div className="header-area classroom d-block d-lg-none mx-auto">
            <nav className="navbar navbar-expand-lg navbar-light p-0">
              <Link className="navbar-brand p-0" href="/">
                <AppLogo></AppLogo>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <SigninForm settings={settings}></SigninForm>
    </>
  );
}
