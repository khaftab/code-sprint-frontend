import { SocketContext as SocketContextType, SocketEvent } from "@/types/socket"
import { USER_STATUS } from "@/types/user"
import {
    ReactNode,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react"
import { toast } from "react-hot-toast"
import { Socket, io } from "socket.io-client"
import { useAppContext } from "./AppContext"

const SocketContext = createContext<SocketContextType | null>(null)
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://35.222.178.241"
// const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"

export const useSocket = (): SocketContextType => {
    const context = useContext(SocketContext)
    if (!context) {
        throw new Error("useSocket must be used within a SocketProvider")
    }
    return context
}

const SocketProvider = ({ children }: { children: ReactNode }) => {
    const { setUsers, setStatus, setCurrentUser } = useAppContext()
    const [socket, setSocket] = useState<Socket | null>(null)
    const connectionAttemptRef = useRef(0)
    const isInitialized = useRef(false)
    const handleError = useCallback(
        (err: Error) => {
            connectionAttemptRef.current += 1
            console.error("Socket error:", err)
            setStatus(USER_STATUS.CONNECTION_FAILED)

            if (connectionAttemptRef.current > 3) {
                // showing connection error toast, as socket connection may not be established in first attempt.
                toast.dismiss()
                toast.error("Connection failed. Please try again.")
            }
        },
        [setStatus],
    )

    const initializeSocket = useCallback(
        (path: string) => {
            const newSocket = io(BACKEND_URL, {
                path: `/${path}`,
                reconnectionAttempts: 6,
                autoConnect: true,
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                timeout: 20000,
            })

            const handleUsernameExists = () => {
                toast.dismiss()
                setStatus(USER_STATUS.INITIAL)
                toast.error("Username already exists in this room")
            }

            const handleJoinAccepted = ({
                user,
                users,
            }: {
                user: any
                users: any[]
            }) => {
                setCurrentUser(user)
                setUsers(users)
                toast.dismiss()
                setStatus(USER_STATUS.JOINED)
            }

            const handleUserDisconnected = ({ user }: { user: any }) => {
                toast.success(`${user.username} left the room`)
                setUsers((prev) =>
                    prev.filter((u) => u.username !== user.username),
                )
            }

            // Setup event listeners
            newSocket
                .on("connect_error", handleError)
                .on("connect_failed", handleError)
                .on(SocketEvent.USERNAME_EXISTS, handleUsernameExists)
                .on(SocketEvent.JOIN_ACCEPTED, handleJoinAccepted)
                .on(SocketEvent.USER_DISCONNECTED, handleUserDisconnected)
                .on(SocketEvent.ERROR, (err) => {
                    toast.error(err.message || "An error occurred")
                    console.error("Socket server error:", err)
                })

            setSocket(newSocket)
            isInitialized.current = true
            newSocket.onAny((event, ...args) => {
                console.log(`Event ON onANY: ${event}`, args)
            })
            newSocket.onAnyOutgoing((event, ...args) => {
                console.log(`Event OUT onANY: ${event}`, args)
            })
            return newSocket
        },
        [handleError, setCurrentUser, setStatus, setUsers],
    )

    useEffect(() => {
        return () => {
            socket?.disconnect()
            socket?.removeAllListeners()
        }
    }, [socket])

    return (
        <SocketContext.Provider
            // @ts-ignore

            value={{ socket, initializeSocket, isInitialized }}
        >
            {children}
        </SocketContext.Provider>
    )
}
export { SocketProvider }
export default SocketContext
