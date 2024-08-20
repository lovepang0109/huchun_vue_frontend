"use client"

import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import useIdleTimeout from "@/hooks/idleTimeout";

const TimeoutCounter = () => {
  const [countdown, setCountDown] = useState(30)

  useEffect(() => {
    const interval = setInterval(() => {
      if (countdown > 0) {
        setCountDown(countdown - 1)
      } else {
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  })

  return (
    <p>Logging out in {countdown} seconds</p>
  )
}

export function IdleTimer() {
  const router = useRouter();
  const [openModal, setOpenModal] = useState(false)
  const handleIdle = () => {
    setOpenModal(true);
  }

  const stay = () => {
    setOpenModal(false)
    idleTimer.reset()
  }

  const handleLogout = () => {
    setOpenModal(false)
    fetch("/logout", { method: 'POST' }).then(() => {
      router.push("/")
    })
  }

  const { idleTimer } = useIdleTimeout({ onIdle: handleIdle, onTimedOut: handleLogout })

  return (
    <div className={'modal fade ' + (openModal ? 'show d-block' : '')}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Idle Timeout</h5>
            <button type="button" className="btn-close" onClick={stay} aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <h3>Are you still here?</h3>
            {openModal && <TimeoutCounter />}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-primary" onClick={stay}>I&apos;m still here</button>
          </div>
        </div>
      </div>
    </div>
  );
}