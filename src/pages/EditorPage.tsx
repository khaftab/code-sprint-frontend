import SplitterComponent from "@/components/SplitterComponent"
import ConnectionStatusPage from "@/components/connection/ConnectionStatusPage"
import Sidebar from "@/components/sidebar/Sidebar"
import WorkSpace from "@/components/workspace"
import { useAppContext } from "@/context/AppContext"
import { useChatRoom } from "@/context/ChatContext"
import { useCopilot } from "@/context/CopilotContext"
import { useFileSystem } from "@/context/FileContext"
import { useSocket } from "@/context/SocketContext"
import useFullScreen from "@/hooks/useFullScreen"
import { useHeartbeat } from "@/hooks/useHeartbeat"
import useUserActivity from "@/hooks/useUserActivity"
import { SocketEvent } from "@/types/socket"
import { USER_STATUS, User } from "@/types/user"
import { useEffect } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"

function EditorPage() {
    const location = useLocation()
    const { status, setCurrentUser, currentUser, setDrawingData } =
        useAppContext()
    const { resetState } = useCopilot()
    const { roomId } = useParams()
    const { resetFileStructure } = useFileSystem()
    const { socket, isInitialized } = useSocket()
    const { setMessages } = useChatRoom()
    useEffect(() => {
        if (!isInitialized.current) {
            navigate("/", {
                state: { roomId },
            })
            return
        }
        return () => {
            // Clean up socket connection when the component unmounts
            if (socket) {
                socket.disconnect()
                resetFileStructure()
            }
            setMessages([])
            setDrawingData(null)
            resetState()
            // setStatus(USER_STATUS.INITIAL)
            // isTest("yoo")
        }
    }, [])
    useHeartbeat()
    // Listen user online/offline status
    useUserActivity()
    // Enable fullscreen mode
    useFullScreen()
    const navigate = useNavigate()

    useEffect(() => {
        if (currentUser.username.length > 0) return
        if (!socket) return
        const username = location.state?.username
        if (username === undefined) {
            navigate("/", {
                state: { roomId },
            })
        } else if (roomId) {
            const user: User = { username, roomId }
            setCurrentUser(user)
            socket.emit(SocketEvent.JOIN_REQUEST, user)
        }
    }, [
        currentUser.username,
        location.state?.username,
        navigate,
        roomId,
        setCurrentUser,
        socket,
    ])

    if (status === USER_STATUS.CONNECTION_FAILED) {
        return <ConnectionStatusPage />
    }

    return (
        <SplitterComponent>
            <Sidebar />
            <WorkSpace />
        </SplitterComponent>
    )
}

export default EditorPage
