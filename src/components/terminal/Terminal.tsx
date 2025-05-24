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

interface TerminalComponentProps {
    initialHeight: number
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
    ({ initialHeight, initialVisible = false, onVisibilityChange }, ref) => {
        const [showTerminal, setShowTerminal] = useState(initialVisible)
        const [terminalHeight, setTerminalHeight] = useState(initialHeight)
        const { viewHeight } = useResponsive()
        const startResizeY = useRef(0)
        const startHeight = useRef(0)
        const isResizing = useRef(false)
        const terminalRef = useRef<XTerm | null>(null)
        const { socket } = useSocket()

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
                    setTerminalHeight((prev) => prev + 0.01)
                }, 500)
            // Re setting the terminal height, so, that terminal fit addon applies. Otherwise, when coming from another route and opening terminal, it cuts out the text when there is scroll.
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
            if (socket) socket.emit("terminal-input", command)
        }

        return (
            <div className="absolute bottom-0 left-0 right-0 z-50">
                {/* "Hide Terminal" Toggle */}
                {showTerminal && (
                    <div
                        className="absolute left-1/2 z-10 flex cursor-pointer items-center rounded bg-[#333] px-2.5 py-0.5"
                        style={{
                            bottom: terminalHeight,
                            transform:
                                "translateX(-50%) translateY(-100%) translateY(20px)",
                        }}
                        onClick={() => setShowTerminal(false)}
                    >
                        <ChevronDown size={16} />
                    </div>
                )}

                {/* Terminal Inner Div */}
                <div
                    className={`transition-height absolute bottom-0 left-0 right-0 flex flex-col overflow-hidden duration-300 ease-in-out ${showTerminal ? "h-auto" : "h-0"}`}
                >
                    <div
                        className={`terminal-resize-handle relative h-1 w-full cursor-ns-resize bg-[#333] ${
                            showTerminal ? "visible" : "hidden"
                        }`}
                        onMouseDown={startResize}
                    />
                    <div
                        className={`terminal-container w-full overflow-hidden ${
                            showTerminal ? "visible" : "hidden"
                        } bg-[#1e1e1e]`}
                        style={{
                            height: terminalHeight,
                        }}
                    >
                        <Terminal
                            onReady={handleTerminalReady}
                            onData={handleCommand}
                        />
                    </div>
                </div>

                {/* "Show Terminal" Toggle */}
                {!showTerminal && (
                    <div
                        className="terminal-toggle absolute bottom-0 left-1/2 z-10 flex cursor-pointer items-center justify-center rounded-t bg-[#333] px-2 py-0.5"
                        style={{ transform: "translateX(-50%)" }}
                        onClick={() => {
                            setShowTerminal(true)
                        }}
                    >
                        <ChevronUp size={16} />
                        <span className="ml-1 text-xs">Terminal (Ctrl+J)</span>
                    </div>
                )}
            </div>
        )
    },
)

export default TerminalComponent
