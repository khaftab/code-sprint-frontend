// src/hooks/useHeartbeat.ts
import { useEffect } from "react"
import axios from "axios"
import { useAppContext } from "../context/AppContext"

const HEARTBEAT_INTERVAL = 10 * 60 * 1000 // 10 minutes in milliseconds
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://35.222.178.241"
// const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"

export const useHeartbeat = () => {
    const { currentUser } = useAppContext()

    const sendHeartbeat = async () => {
        if (!currentUser?.roomId) return

        try {
            await axios.post(`${BACKEND_URL}/api/heartbeat`, {
                roomId: currentUser.roomId,
                username: currentUser.username,
            })
            console.log("Heartbeat sent successfully")
        } catch (error) {
            console.error("Failed to send heartbeat:", error)
        }
    }
    useEffect(() => {
        if (!currentUser?.roomId) return

        // Initial heartbeat
        sendHeartbeat()
        const interval = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL)

        // Visibility change handler
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                sendHeartbeat() // Immediate heartbeat on tab focus
            }
        }

        document.addEventListener("visibilitychange", handleVisibilityChange)

        return () => {
            clearInterval(interval)
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange,
            )
        }
    }, [currentUser?.roomId])
}
