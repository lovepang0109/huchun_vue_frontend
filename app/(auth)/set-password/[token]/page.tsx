import { AppLogo } from '@/components/AppLogo';
import { confirmResetPasswordToken } from '@/lib/api';
import ResetPasswordForm from './ResetPasswordForm';
import Link from 'next/link';

export default async function SetPasswordPage({ params }) {

  let invalidCode = false
  let userInfo: any = {}
  try {
    userInfo = await confirmResetPasswordToken(params.token)
  } catch (ex) {
    invalidCode = true
  }

  return (
    <section className="login bg-white">

      <div className="login-area">
        <div className="logo mr-auto mb-2">
          <Link href="/">
            <AppLogo />
          </Link>
        </div>

        <ResetPasswordForm user={userInfo.user} invalidCode={invalidCode}></ResetPasswordForm>

      </div >
    </section >
  )
}