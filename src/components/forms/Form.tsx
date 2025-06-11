import { useAppContext } from "@/context/AppContext"
import { useSocket } from "@/context/SocketContext"
import { SocketEvent } from "@/types/socket"
import { USER_STATUS } from "@/types/user"
import { ChangeEvent, FormEvent, useEffect, useRef } from "react"
import { toast } from "react-hot-toast"
import { useLocation, useNavigate } from "react-router-dom"
import { v4 as uuidv4 } from "uuid"
import { ArrowRight, Shuffle } from "lucide-react"

const palette = {
    dark: "#181A20",
    darkHover: "#23262F",
    light: "#F4F7FA",
    primary: "#4ADE80",
    danger: "#F87171",
}

const Form = () => {
    const location = useLocation()
    const { currentUser, setCurrentUser, status, setStatus } = useAppContext()
    const { initializeSocket } = useSocket()
    const usernameRef = useRef<HTMLInputElement | null>(null)
    const navigate = useNavigate()

    const createNewRoomId = () => {
        setCurrentUser({ ...currentUser, roomId: uuidv4() })
        toast.success("Created a new Room Id")
        usernameRef.current?.focus()
    }

    const handleInputChanges = (e: ChangeEvent<HTMLInputElement>) => {
        const name = e.target.name
        const value = e.target.value
        setCurrentUser({ ...currentUser, [name]: value })
    }

    const validateForm = () => {
        if (currentUser.username.trim().length === 0) {
            toast.error("Enter your username")
            return false
        } else if (currentUser.roomId.trim().length === 0) {
            toast.error("Enter a room id")
            return false
        } else if (currentUser.roomId.trim().length < 5) {
            toast.error("ROOM Id must be at least 5 characters long")
            return false
        } else if (currentUser.username.trim().length < 3) {
            toast.error("Username must be at least 3 characters long")
            return false
        }
        return true
    }

    const joinRoom = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (status === USER_STATUS.ATTEMPTING_JOIN) return
        if (!validateForm()) return

        try {
            toast.loading("Joining room...")
            setStatus(USER_STATUS.ATTEMPTING_JOIN)

            // Get dynamic socket path from backend
            const response = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/api/get-socket-path`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ roomId: currentUser.roomId }),
                },
            )

            const { socketPath } = await response.json()
            // console.log(`Socket path: ${socketPath}`)

            // Initialize socket with dynamic path
            const socket = initializeSocket(socketPath)

            // Wait for connection
            await new Promise<void>((resolve, reject) => {
                socket.connect()
                socket.once("connect", resolve)
                socket.once("connect_error", (err: Error) => {
                    reject(err)
                    socket.emit(SocketEvent.JOIN_REQUEST, currentUser)
                })
            })

            // Emit join request after successful connection
            socket.emit(SocketEvent.JOIN_REQUEST, currentUser)
        } catch (err) {
            // toast.error("Failed to join room")
            setStatus(USER_STATUS.INITIAL)
        }
    }

    useEffect(() => {
        if (currentUser.roomId.length > 0) return
        if (location.state?.roomId) {
            setCurrentUser({ ...currentUser, roomId: location.state.roomId })
            if (currentUser.username.length === 0) {
                toast.success("Enter your username")
            }
        }
    }, [currentUser, location.state?.roomId, setCurrentUser])

    useEffect(() => {
        const isRedirect = sessionStorage.getItem("redirect") || false

        if (status === USER_STATUS.JOINED && !isRedirect) {
            const username = currentUser.username
            sessionStorage.setItem("redirect", "true")
            navigate(`/editor/${currentUser.roomId}`, {
                state: { username },
            })
        } else if (
            (status === USER_STATUS.JOINED || status === USER_STATUS.INITIAL) &&
            isRedirect
        ) {
            sessionStorage.removeItem("redirect")
            setStatus(USER_STATUS.DISCONNECTED)
        }
    }, [currentUser, navigate, setStatus, status])

    return (
        <div className="flex h-full flex-col">
            <div
                className="flex h-full flex-col rounded-3xl border p-8"
                style={{
                    borderColor: "#23262F",
                    background: palette.darkHover,
                }}
            >
                {/* Form Header */}
                <div className="mb-8 text-center">
                    <div className="mb-4 inline-flex items-center gap-2">
                        <div
                            className="h-2 w-2 animate-pulse rounded-full"
                            style={{ background: palette.primary }}
                        ></div>
                        <span
                            className="text-sm font-medium"
                            style={{ color: palette.primary }}
                        >
                            Ready to connect
                        </span>
                    </div>
                    <h2
                        className="mb-2 text-2xl font-bold"
                        style={{ color: palette.light }}
                    >
                        Join a Room
                    </h2>
                    <p style={{ color: "#A3A9B7" }}>
                        Enter your details to start collaborating
                    </p>
                </div>

                {/* Form */}
                <form className="space-y-6" onSubmit={joinRoom}>
                    <div className="space-y-4">
                        <div className="group relative">
                            <input
                                type="text"
                                name="roomId"
                                placeholder="Room ID"
                                className="w-full rounded-xl border px-4 py-4 transition-all duration-75 focus:border-[#23262F] focus:outline-none focus:ring-2"
                                style={{
                                    background: palette.dark,
                                    borderColor: "#23262F",
                                    color: palette.light,
                                    outline: "none",
                                }}
                                onChange={handleInputChanges}
                                value={currentUser.roomId}
                            />
                        </div>

                        <div className="group relative">
                            <input
                                type="text"
                                name="username"
                                placeholder="Your Username"
                                className="w-full rounded-xl border px-4 py-4 transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2"
                                style={{
                                    background: palette.dark,
                                    borderColor: "#23262F",
                                    color: palette.light,
                                    outline: "none",
                                    boxShadow: "none",
                                }}
                                onChange={handleInputChanges}
                                value={currentUser.username}
                                ref={usernameRef}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="group flex w-full transform items-center justify-center gap-2 rounded-xl px-6 py-4 font-semibold shadow-lg transition-all duration-200 active:scale-[0.98]"
                        style={{
                            background: palette.primary,
                            color: palette.dark,
                        }}
                    >
                        <span>Join Room</span>

                        <ArrowRight className="h-5 w-5" color={palette.dark} />
                    </button>
                </form>

                {/* Generate Room ID Button */}
                <div className="mt-6 text-center">
                    <button
                        onClick={createNewRoomId}
                        type="button"
                        className="group inline-flex items-center gap-2 transition-colors duration-200"
                        style={{
                            color: "#A3A9B7",
                        }}
                    >
                        <Shuffle className="h-4 w-4" color={palette.primary} />
                        <span className="text-sm">Generate Unique Room ID</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Form
