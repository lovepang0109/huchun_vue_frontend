"use client";

import clientApi from "@/lib/clientApi";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { alert, success } from "alertifyjs";
import { Modal } from "react-bootstrap";

export default function ResendCode() {
  const { back } = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const handleClose = () => back();

  const onSubmit = async (data) => {
    try {
      await clientApi.put("/api/request-email-code", { userId: data.userId });
      success("New confirmation code has been resent to your email/SMS.");
      back();
    } catch (ex) {
      alert("Message", "Failed to send code.");
    }
  };

  return (
    <Modal
      show={true}
      onHide={handleClose}
      backdrop="static"
      keyboard={false}
      className="forgot-pass-modal"
    >
      <Modal.Header closeButton className="transparent-heading">
        <Modal.Title>Resend code for confirm registration</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label>Email or Phone Number</label>
            <input
              className="form-control border-bottom"
              placeholder="Email or Phone Number"
              maxLength={50}
              {...register("userId", {
                required: true,
                maxLength: 50,
                pattern:
                  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1, 3}\.[0-9]{1, 3}\.[0-9]{1, 3}\.[0-9]{1, 3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))|(^[0-9]{10})$/,
              })}
            ></input>

            <div>
              <p className="label label-danger text-danger">
                {errors.userId &&
                  errors.userId.type == "required" &&
                  "Email or phone number is required"}
                {errors.userId &&
                  errors.userId.type == "pattern" &&
                  "Invalid email or phone number entered"}
              </p>
            </div>
          </div>

          <div className="mt-2 text-right">
            <button
              className="btn btn-light"
              type="button"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button className="btn btn-primary ml-3" type="submit">
              Submit
            </button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
}
