import { ChevronDown, ChevronUp } from "lucide-react"
import {
    useState,
    useRef,
    useEffect,
    forwardRef,
    useImperativeHandle,
} from "react"
import Terminal from "./Xterm"
import { Terminal as XTerm } from "xterm"
import useResponsive from "@/hooks/useResponsive"
import { useSocket } from "@/context/SocketContext"
import { io, Socket } from "socket.io-client"
import { SocketEvent } from "@/types/socket"
import { useAppContext } from "@/context/AppContext"

interface TerminalComponentProps {
    initialHeight?: number
    initialVisible?: boolean
    onVisibilityChange?: (isVisible: boolean) => void
}

// Define a handle type that exposes the terminal methods you want to access
export interface TerminalHandle {
    terminal: XTerm | null
    write: (data: string) => void
    writeln: (data: string) => void
    clear: () => void
    focus: () => void
}

const TerminalComponent = forwardRef<TerminalHandle, TerminalComponentProps>(
    (
        { initialHeight = 300, initialVisible = false, onVisibilityChange },
        ref,
    ) => {
        const [showTerminal, setShowTerminal] = useState(initialVisible)
        const [terminalHeight, setTerminalHeight] = useState(initialHeight)
        const { viewHeight } = useResponsive()
        const startResizeY = useRef(0)
        const startHeight = useRef(0)
        const isResizing = useRef(false)
        const terminalRef = useRef<XTerm | null>(null)
        const { socket } = useSocket()
        const { currentUser } = useAppContext()
        // let socket: Socket

        // Expose the terminal reference and methods to parent components
        useImperativeHandle(
            ref,
            () => ({
                terminal: terminalRef.current,
                write: (data: string) => {
                    if (terminalRef.current) {
                        terminalRef.current.write(data)
                    }
                },
                writeln: (data: string) => {
                    if (terminalRef.current) {
                        terminalRef.current.writeln(data)
                    }
                },
                clear: () => {
                    if (terminalRef.current) {
                        terminalRef.current.clear()
                    }
                },
                focus: () => {
                    if (terminalRef.current) {
                        terminalRef.current.focus()
                    }
                },
            }),
            [terminalRef.current],
        )

        useEffect(() => {
            if (onVisibilityChange) {
                onVisibilityChange(showTerminal)
            }
            if (showTerminal)
                setTimeout(() => {
                    setTerminalHeight((prev) => prev + 0.1)
                }, 500)
        }, [showTerminal, onVisibilityChange])

        const startResize = (e: React.MouseEvent) => {
            isResizing.current = true
            startResizeY.current = e.clientY
            startHeight.current = terminalHeight

            document.addEventListener("mousemove", handleResize)
            document.addEventListener("mouseup", stopResize)
        }

        const handleResize = (e: MouseEvent) => {
            if (!isResizing.current) return
            const delta = startResizeY.current - e.clientY
            const newHeight = Math.max(
                100,
                Math.min(viewHeight * 0.7, startHeight.current + delta),
            )
            setTerminalHeight(newHeight)
        }

        const stopResize = () => {
            isResizing.current = false
            document.removeEventListener("mousemove", handleResize)
            document.removeEventListener("mouseup", stopResize)
        }

        useEffect(() => {
            if (terminalRef.current) {
                terminalRef.current.write("devx:~/workspace$ ")
            }
        }, [])

        useEffect(() => {
            // socket.disconnect()
            // socket.connect()
            // console.log(currentUser, "currentUserEd")

            // socket.emit(SocketEvent.JOIN_REQUEST, currentUser)
            // Disconnecting and connecting to the socket again to ensure a fresh connection which will set inital response (devx:~/workspace$) to the terminal.
            if (!socket) return
            socket.on("connect", () => {
                console.log("Connected to server")
            })
            socket.on("disconnect", () => {
                console.log("Disconnected from server")
            })
            socket.on("terminal-output", (data: string) => {
                if (terminalRef.current) {
                    terminalRef.current.write(data)
                    // terminalRef.current.writeln("\r\n")
                }
            })

            socket.on("terminal:error", (error: string) => {
                console.log("terminal:error")

                if (terminalRef.current) {
                    terminalRef.current.writeln(error)
                }
            })

            return () => {
                socket.off("connect")
                socket.off("disconnect")
                socket.off("terminal-output")
                socket.off("terminal:error")
                document.removeEventListener("mousemove", handleResize)
                document.removeEventListener("mouseup", stopResize)
            }
        }, [socket])

        useEffect(() => {
            // terminalRef.current?.write("sdfljjksf")

            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.ctrlKey && e.key === "j") {
                    setShowTerminal((prev) => !prev)
                }
            }

            document.addEventListener("keydown", handleKeyDown)
            return () => {
                document.removeEventListener("keydown", handleKeyDown)
            }
        }, [])

        const handleTerminalReady = (terminal: XTerm) => {
            terminalRef.current = terminal
        }

        const handleCommand = (command: string) => {
            // socket.emit("terminal:write", command)

            if (socket) socket.emit("terminal-input", command)
            // if (command === "\r") {
            //     socket.emit("terminal-input", "\r")
            // } else {
            //     socket.emit("terminal-input", command)
            // }
        }

        return (
            <div
                style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 50,
                }}
            >
                {/* "Hide Terminal" Toggle */}
                {showTerminal && (
                    <div
                        style={{
                            position: "absolute",
                            bottom: terminalHeight, // Align with top of inner div
                            left: "50%",
                            transform:
                                "translateX(-50%) translateY(-100%) translateY(20px)", // Center and move up by height + 15px
                            backgroundColor: "#333",
                            borderRadius: "4px",
                            padding: "2.5px 10px",
                            display: "flex",
                            alignItems: "center",
                            cursor: "pointer",
                            zIndex: 10,
                        }}
                        onClick={() => setShowTerminal(false)}
                    >
                        <ChevronDown size={16} />
                        {/* <span style={{ marginLeft: "4px", fontSize: "12px" }}>
                        Hide Terminal
                    </span> */}
                    </div>
                )}

                {/* Terminal Inner Div */}
                <div
                    style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        display: "flex",
                        flexDirection: "column",
                        height: showTerminal ? "auto" : "0",
                        overflow: "hidden",
                        transition: "height 0.3s ease",
                    }}
                >
                    <div
                        className="terminal-resize-handle"
                        onMouseDown={startResize}
                        style={{
                            width: "100%",
                            height: "5px",
                            cursor: "ns-resize",
                            backgroundColor: "#333",
                            position: "relative",
                            visibility: showTerminal ? "visible" : "hidden",
                        }}
                    />
                    <div
                        className="terminal-container"
                        style={{
                            backgroundColor: "#1e1e1e",
                            height: terminalHeight,
                            width: "100%",
                            overflow: "hidden",
                            visibility: showTerminal ? "visible" : "hidden",
                        }}
                    >
                        <Terminal
                            onReady={handleTerminalReady}
                            onData={handleCommand}
                            // onCommand={handleCommand}
                            options={
                                {
                                    // fontSize: 14,
                                    // rows: Math.floor(terminalHeight / 20),
                                }
                            }
                        />
                    </div>
                </div>

                {/* "Show Terminal" Toggle */}
                {!showTerminal && (
                    <div
                        className="terminal-toggle flex justify-center"
                        style={{
                            position: "absolute",
                            bottom: "0",
                            left: "50%",
                            transform: "translateX(-50%)",
                            background: "#333",
                            borderRadius: "4px 4px 0 0",
                            padding: "2px 8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            zIndex: 10,
                        }}
                        onClick={() => {
                            setShowTerminal(true)
                            // setTimeout(() => {
                            //     setTerminalHeight((prev) => prev + 0.1)
                            // }, 500)
                            // Re setting the terminal height, so, that terminal fit addon applies. Otherwise, when coming from another route and opening terminal, it cuts out the text when there is scroll.
                        }}
                    >
                        <ChevronUp size={16} />
                        <span style={{ marginLeft: "4px", fontSize: "12px" }}>
                            Terminal (Ctrl+J)
                        </span>
                    </div>
                )}
            </div>
        )
    },
)

export default TerminalComponent
