"use client";

import clientApi from "@/lib/clientApi";
import { validateUserId } from "@/lib/validator";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Modal } from "react-bootstrap";

export default function ForgetPasswordModal({ settings }) {
  const router = useRouter();

  const [userId, setUserId] = useState("")
  const [errors, setErrors] = useState<string[]>([])
  const [success, setSuccess] = useState(false)
  const reset = useRef({
    name: '',
    type: 'email',
    selectedCountry: { dialCode: '91', iso2Code: 'in', name: 'India (भारत)' },
    phone: '',
    email: ''
  })

  const handleClose = () => router.back()

  const submit = async () => {
    const error = validateUserId(userId)
    if (error) {
      setErrors([error])

      return;
    }

    const phoneno = /^\d{10}$/;

    if (userId.match(phoneno)) {
      reset.current.type = 'phone'
      reset.current.phone = `+91 ${userId}`;
      reset.current.email = '';
    } else {
      reset.current.type = 'email'
      reset.current.phone = '';
      reset.current.email = userId;
    }

    try {
      await clientApi.post('/api/recover-password', reset.current)
      setSuccess(true)
      // modalService.show(this.reset_pass_template)  
    } catch ({ response }: any) {
      if (response.data.msg) {
        setErrors([response.data.msg])
      } else if (response.data.errors) {
        setErrors(response.data.errors.map(e => e.message))
      } else {
        setErrors(response.data.map(e => e.msg))
      }
    }
  }

  return (
    <Modal
      show={true}
      onHide={handleClose}
      backdrop="static"
      keyboard={false}
      className="forgot-pass-modal"
    >
      <Modal.Header closeButton className="transparent-heading">
        <Modal.Title>Reset Password</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="login-area">
          {!success ? (
            <form className="bg-white mx-auto p-0" >
              <p className="text-danger">
                {errors.map((e, idx) => (
                  <span key={idx}>
                    {e}
                  </span>
                ))}
              </p>

              <div className="form-group">
                <label>Registered Email or Phone Number</label>

                <input type="text" className="form-control" placeholder="" value={userId} onChange={(e) => setUserId(e.target.value)}></input>
              </div>

              <button type="button" className="btn py-0 text-white mt-2" disabled={!userId} onClick={submit}>Request</button>

            </form>
          ) : (
            <>
              <div className="success-text text-center">
                <p>We have sent the password reset link to <br /><a href={reset.current.type == 'phone' ? reset.current.phone : reset.current.email}>{reset.current.type == 'phone' ? reset.current.phone : reset.current.email}</a>
                  <br /> Click on the link to change your password
                </p>
              </div>
              <div className="image text-center">
                <img src="/assets/images/password.png" alt="password reset successfully"></img>
              </div>
            </>
          )}
          <div>
            <p className="m-t-xl text-center text-secondary">Having trouble? Contact: <a href={'mailto:' + settings.supportEmail + '?Subject=Hello'} target="_top">{settings.supportEmail}</a></p>
          </div>
        </div>
      </Modal.Body>
    </Modal >
  );
}