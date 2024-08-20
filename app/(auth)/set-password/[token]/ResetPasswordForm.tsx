"use client";

import clientApi from "@/lib/clientApi";
import { faEye, faEyeSlash } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export default function ResetPasswordForm({ user, invalidCode }) {

  const [apiErrors, setApiErrors] = useState<string[]>([])
  const [showNewPass, setShowNewPass] = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const [pmismatch, setPMismatch] = useState(false)
  const { push } = useRouter()

  useEffect(() => {
    if (invalidCode) {
      setApiErrors(['Your token is invalid or expired'])
    }
  }, [invalidCode])

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm();

  async function onSubmit(data) {
    if (invalidCode) {
      return;
    }
    if (data.newPassword != data.rePassword) {
      setPMismatch(true)
      return;
    }

    try {
      await clientApi.put(`/api/user/new-password/${user._id}`, { newPassword: data.newPassword })

      push('/password-changed')
    } catch (ex) {
      if (ex?.response.data?.message) {
        setApiErrors([ex?.response.data.message])
      } else {
        setApiErrors(['Fail to change password'])
      }
    }
  }

  return (
    <form className="bg-white" onSubmit={handleSubmit(onSubmit)}>
      <div className="heading mx-auto">
        <h4 className="text-center">Reset Password</h4>
        <p className="text-center">Enter a new password</p>

      </div>
      <div className="text-danger">
        {apiErrors.map((err, idx) => (
          <p key={idx} className="label label-danger text-danger">{err}</p>
        ))}
      </div>

      <div className="form-group">
        <label>NEW PASSWORD</label>
        <div className="position-relative">
          <input
            placeholder="New Password"
            className="form-control"
            type={showNewPass ? 'text' : 'password'}
            maxLength={20}
            minLength={8}
            {...register("newPassword", { required: true, maxLength: 20, minLength: 8, pattern: /(?=^.{8,20}$)((?=.*\d)(?=.*[A-Za-z])(?=.*[A-Za-z])|(?=.*\d)(?=.*[^A-Za-z0-9])(?=.*[a-z])|(?=.*[^A-Za-z0-9])(?=.*[A-Z])(?=.*[a-z])|(?=.*\d)(?=.*[A-Z])(?=.*[^A-Za-z0-9]))^.*/ })}
          ></input>
          <a onClick={() => setShowNewPass(!showNewPass)} className="show-pass">
            {showNewPass ? <FontAwesomeIcon icon={faEye}></FontAwesomeIcon> : <FontAwesomeIcon icon={faEyeSlash}></FontAwesomeIcon>}
          </a>
        </div>

        <div>
          <p className="label label-danger text-danger">
            {errors.newPassword && errors.newPassword.type == 'required' && 'New Password is required'}
            {errors.newPassword && errors.newPassword.type != 'required' && 'New Password must be 8 - 20 characters with at least one number and one alphabet'}
          </p>
        </div>
      </div>

      <div className="form-group">
        <label>CONFIRM PASSWORD</label>

        <div className="position-relative">
          <input
            placeholder="Confirm Password"
            className="form-control"
            type={showConfirmPass ? 'text' : 'password'}
            maxLength={20}
            minLength={8}
            {...register("rePassword", { required: true, maxLength: 20, minLength: 8, pattern: /(?=^.{8,20}$)((?=.*\d)(?=.*[A-Za-z])(?=.*[A-Za-z])|(?=.*\d)(?=.*[^A-Za-z0-9])(?=.*[a-z])|(?=.*[^A-Za-z0-9])(?=.*[A-Z])(?=.*[a-z])|(?=.*\d)(?=.*[A-Z])(?=.*[^A-Za-z0-9]))^.*/ })}
          ></input>
          <a onClick={() => setShowConfirmPass(!showConfirmPass)} className="show-pass">
            {showConfirmPass ? <FontAwesomeIcon icon={faEye}></FontAwesomeIcon> : <FontAwesomeIcon icon={faEyeSlash}></FontAwesomeIcon>}
          </a>
        </div>

        <div>
          <p className="label label-danger text-danger">
            {errors.rePassword && errors.rePassword.type == 'required' && 'New Password is required'}
            {errors.rePassword && errors.rePassword.type != 'required' && 'New Password must be 8 - 20 characters with at least one number and one alphabet'}
          </p>
        </div>

        {pmismatch &&
          <p className="label label-danger text-danger" >
            Password does not match.
          </p>
        }
      </div >

      <button type="submit" className="btn py-0 text-white mt-3 mb-4" disabled={invalidCode ? true : false} > Reset Password</button>
    </form >
  )
}