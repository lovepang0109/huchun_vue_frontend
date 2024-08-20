"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { alert, success } from "alertifyjs";
import { useForm } from "react-hook-form";
import clientApi from "@/lib/clientApi";

export default function ConfirmRegister({ user }) {
  const { push } = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  async function resendCode() {
    if (user) {
      await clientApi.put("/api/request-email-code/", { userId: user._id });
      success("New confirmation code has been resent to your email/SMS.");
    } else {
      push("/confirmRegister/resend-code");
    }
  }

  async function onSubmit(data) {
    try {
      await clientApi.post("/api/confirm-email", { token: data.confirmCode });
      success("Thank you, your account has been activated.");
      if (user) {
        push("/home");
      } else {
        push("/");
      }
    } catch (ex) {
      alert("Message", "Invalid code! Please check and try again.");
    }
  }

  return (
    <>
      <form className="bg-white" onSubmit={handleSubmit(onSubmit)}>
        <div className="heading mx-auto">
          <h4 className="text-center">Confirm your registration</h4>
        </div>

        <div className="form-group">
          <label>Enter confirmation code received in your email/sms.</label>

          <input
            type="text"
            className="form-control"
            placeholder="6 digits code"
            {...register("confirmCode", {
              required: true,
              minLength: 6,
              maxLength: 6,
            })}
          ></input>
        </div>

        <div className="row">
          <div className="col">
            <button
              type="button"
              className="p-0 btn text-white"
              onClick={resendCode}
            >
              Resend Code
            </button>
          </div>
          <div className="col">
            <button type="submit" className="p-0 btn text-white">
              Confirm
            </button>
          </div>
        </div>

        {!!user && (
          <div>
            <button
              type="button"
              className="btn p-0 text-white"
              onClick={() => {
                signOut({ callbackUrl: "/" });
              }}
            >
              Logout
            </button>
          </div>
        )}
      </form>
    </>
  );
}
