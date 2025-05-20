// Import section remains the same
import { useAppContext } from "@/context/AppContext"
import { useFileSystem } from "@/context/FileContext"
import { useSettings } from "@/context/SettingContext"
import { useSocket } from "@/context/SocketContext"
import usePageEvents from "@/hooks/usePageEvents"
import useResponsive from "@/hooks/useResponsive"
import { editorThemes } from "@/resources/Themes"
import { FileSystemItem } from "@/types/file"
import { SocketEvent } from "@/types/socket"
import { color } from "@uiw/codemirror-extensions-color"
import { hyperLink } from "@uiw/codemirror-extensions-hyper-link"
import { LanguageName, loadLanguage } from "@uiw/codemirror-extensions-langs"
import CodeMirror, {
    Extension,
    ViewUpdate,
    scrollPastEnd,
} from "@uiw/react-codemirror"
import { useEffect, useMemo, useState, useRef } from "react"
import toast from "react-hot-toast"
import { cursorTooltipBaseTheme, tooltipField } from "./tooltip"
import { Terminal as XTerm } from "xterm"
import TerminalComponent, { TerminalHandle } from "../terminal/MyTerminal"
import { cpp } from "@codemirror/lang-cpp"
import { debounce } from "@/utils/debounce"

function Editor() {
    const { users, currentUser } = useAppContext()
    const { activeFile, setActiveFile, fileStructure, updateFileContent } =
        useFileSystem()
    const { theme, language, fontSize } = useSettings()
    const { socket } = useSocket()
    const { viewHeight } = useResponsive()
    const [timeOut, setTimeOut] = useState(setTimeout(() => {}, 0))
    const filteredUsers = useMemo(
        () => users.filter((u) => u.username !== currentUser.username),
        [users, currentUser],
    )
    const [extensions, setExtensions] = useState<Extension[]>([])
    const [showTerminal, setShowTerminal] = useState(false)
    const [terminalHeight, setTerminalHeight] = useState(250)
    const terminalRef = useRef<TerminalHandle>(null)

    const debouncedSave = debounce((content: string) => {
        activeFile && updateFileContent(activeFile.id, content)
    }, 5000)

    const onCodeChange = (code: string, view: ViewUpdate) => {
        if (!activeFile) return
        const file: FileSystemItem = { ...activeFile, content: code }
        debouncedSave(code)
        setActiveFile(file)
        const cursorPosition = view.state?.selection?.main?.head
        socket.emit(SocketEvent.TYPING_START, {
            cursorPosition,
            currentFile: activeFile.id, // Send the active file ID using the existing property name
        })
        socket.emit(SocketEvent.FILE_UPDATED, {
            fileId: activeFile.id,
            newContent: code,
        })
        clearTimeout(timeOut)
        const newTimeOut = setTimeout(
            () => socket.emit(SocketEvent.TYPING_PAUSE),
            1000,
        )
        setTimeOut(newTimeOut)
    }

    // Listen wheel event to zoom in/out and prevent page reload
    usePageEvents()

    useEffect(() => {
        const extensions = [
            color,
            hyperLink,
            tooltipField(filteredUsers, activeFile?.id || null), // Pass activeFile to tooltipField
            cursorTooltipBaseTheme,
            scrollPastEnd(),
        ]
        // Determine language based on file extension
        const fileExtension = activeFile?.name?.split(".").pop()?.toLowerCase()

        // Map file extensions to actual language loaders
        const getLanguageExtension = (ext: string) => {
            switch (ext) {
                case "cpp":
                case "cc":
                case "h":
                case "hpp":
                    return cpp() // Use the imported C++ language
                // Handle other languages as before
                default:
                    return loadLanguage(language.toLowerCase() as LanguageName)
            }
        }

        const langExt = fileExtension
            ? getLanguageExtension(fileExtension)
            : loadLanguage(language.toLowerCase() as LanguageName)
        if (langExt) {
            extensions.push(langExt)
        } else {
            toast.error(
                "Syntax highlighting is unavailable for this language. Please adjust the editor settings; it may be listed under a different name.",
                {
                    duration: 5000,
                },
            )
        }

        setExtensions(extensions)
    }, [filteredUsers, language, activeFile]) // Add activeFile as dependency

    // Rest of the component remains the same
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey && event.key === "j") {
                event.preventDefault()
                setShowTerminal((prev) => !prev)
            }
        }

        document.addEventListener("keydown", handleKeyDown)
        return () => {
            document.removeEventListener("keydown", handleKeyDown)
        }
    }, [])

    useEffect(() => {
        if (showTerminal && terminalRef.current) {
            setTimeout(() => {
                terminalRef.current?.focus()
            }, 500)
        }
    }, [showTerminal])

    const handleRunClick = () => {
        if (socket) {
            socket.emit("terminal-input", "node hello.js")
            socket.emit("terminal-input", "\r")
        }
    }

    const fileTabHeight = 50
    const adjustedViewHeight = viewHeight - fileTabHeight

    const editorHeight = showTerminal
        ? `calc(${adjustedViewHeight}px - ${terminalHeight}px)`
        : `${adjustedViewHeight}px`

    return (
        <div className="maonj">
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    height: adjustedViewHeight,
                    position: "relative",
                }}
            >
                <CodeMirror
                    theme={editorThemes[theme]}
                    onChange={onCodeChange}
                    value={activeFile?.content}
                    extensions={extensions}
                    minHeight="100%"
                    maxWidth="100vw"
                    style={{
                        fontSize: fontSize + "px",
                        height: editorHeight,
                        position: "relative",
                    }}
                />
                <TerminalComponent
                    ref={terminalRef}
                    initialHeight={283.9}
                    initialVisible={false}
                    onVisibilityChange={() => {}}
                />
            </div>
        </div>
    )
}

export default Editor
