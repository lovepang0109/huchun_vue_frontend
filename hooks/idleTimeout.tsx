import { useState } from "react"
import { useIdleTimer } from "react-idle-timer"
/**
 * @param onIdle - function to notify user when idle timeout is close
 * @param onTimedOut - function to be called when timed out
 */
const useIdleTimeout = ({ onIdle, onTimedOut }) => {
  const idleTimeout = 1000 * 60 * 30; // 30 mins
  const [isIdle, setIdle] = useState(false)

  const handleIdle = () => {
    setIdle(true)
    onTimedOut()
  }

  const idleTimer = useIdleTimer({
    timeout: idleTimeout,
    promptBeforeIdle: 1000 * 30,
    onPrompt: onIdle,
    onIdle: handleIdle,
    debounce: 500
  })
  return {
    isIdle,
    setIdle,
    idleTimer
  }
}
export default useIdleTimeout;