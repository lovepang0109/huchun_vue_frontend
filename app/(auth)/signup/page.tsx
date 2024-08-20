import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import SignUpForm from "./SignUpForm";
import { AppLogo } from "@/components/AppLogo";
import Svg from '@/components/svg'
import { getSettings } from "@/lib/api";
import Link from "next/link";

export default async function SignUpPage() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/home")
  }

  const settings = await getSettings()

  return <>
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

    <main className="institute-signup my-gap-common">
      <div className="container">
        <div className="mx-auto">
          <div className="container7 ml-0">
            <div className="row no-gutters">
              <div className="col-lg-6 pr-lg-0">
                <div className="signup-area h-100">
                  <div dangerouslySetInnerHTML={{ __html: settings.signupMsg }}></div>
                  <Svg.SecureLogin />
                </div>
              </div>
              <div className="col-lg-6 pr-lg-0">
                <SignUpForm settings={settings}></SignUpForm>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </>
}
