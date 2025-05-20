import React, { useRef, useState } from "react"
import Terminal from "./Xterm"
import { Terminal as XTerm } from "xterm"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useViews } from "@/context/ViewContext"
import useResponsive from "@/hooks/useResponsive"

const TerminalExample = ({ rows }: { rows: number }) => {
    const terminalRef = useRef<XTerm | null>(null)
    const [showTerminal, setShowTerminal] = useState(false)
    const { isSidebarOpen } = useViews()
    const { viewHeight } = useResponsive()
    const startResizeY = useRef(0)
    const startHeight = useRef(0)
    const isResizing = useRef(false)

    const startResize = (e: React.MouseEvent) => {
        isResizing.current = true
        startResizeY.current = e.clientY
        startHeight.current = terminalHeight

        // Add event listeners for mousemove and mouseup
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

    const handleTerminalReady = (terminal: XTerm) => {
        // Store reference to terminal
        terminalRef.current = terminal
    }

    const handleCommand = (command: string) => {
        // You can handle commands here or pass them to a backend
        console.log("Command received:", command)
    }

    const [terminalHeight, setTerminalHeight] = useState(250)

    return (
        // <div
        //     className="haka absolute bottom-0 w-[85%f]"
        //     // style={{ maxWidth: "100vw", minWidth: "100%" }}
        // >

        <Terminal
            onReady={handleTerminalReady}
            onData={handleCommand}
            options={{
                // cursorBlink: true,
                fontSize: 14,
                fontFamily: '"Fira Code", monospace',

                rows,
                // columns: 5,
                // overflow: "hidden",
                // width: "100%",
            }}
        />
    )
}

export default TerminalExample

// const handleTerminalReady = (terminal: XTerm) => {
//     // Store reference to terminal
//     terminalRef.current = terminal
// }

// const handleCommand = (command: string) => {
//     // You can handle commands here or pass them to a backend
//     console.log("Command received:", command)
// }

// const executeCommand = () => {
//     if (terminalRef.current) {
//         terminalRef.current.writeln("")
//         terminalRef.current.writeln("Executing sample command...")
//         terminalRef.current.writeln("ls -la")
//         terminalRef.current.writeln(
//             "drwxr-xr-x  3 user  staff  96 Mar 17 14:23 .",
//         )
//         terminalRef.current.writeln(
//             "drwxr-xr-x  5 user  staff  160 Mar 17 14:22 ..",
//         )
//         terminalRef.current.writeln(
//             "-rw-r--r--  1 user  staff  977 Mar 17 14:23 index.html",
//         )
//         terminalRef.current.writeln(
//             "-rw-r--r--  1 user  staff  354 Mar 17 14:23 main.js",
//         )
//         terminalRef.current.writeln(
//             "-rw-r--r--  1 user  staff  532 Mar 17 14:23 package.json",
//         )
//         terminalRef.current.write("$ ")
//     }
// }
