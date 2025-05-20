import { useFileSystem } from "@/context/FileContext"
import { getIconClassName } from "@/utils/getIconClassName"
import { Icon } from "@iconify/react"
import { IoClose, IoPlayOutline } from "react-icons/io5"
import cn from "classnames"
import { useEffect, useRef } from "react"
import customMapping from "@/utils/customMapping"
import { useSettings } from "@/context/SettingContext"
import langMap from "lang-map"
import { useSocket } from "@/context/SocketContext"
import { generateRunCommand } from "@/utils/getRunCommand"
import { getFilePathById } from "@/utils/getFilePath"

function FileTab() {
    const {
        openFiles,
        closeFile,
        activeFile,
        updateFileContent,
        setActiveFile,
        fileStructure,
    } = useFileSystem()
    const fileTabRef = useRef<HTMLDivElement>(null)
    const { setLanguage } = useSettings()
    const { socket } = useSocket()
    // if (!socket) {
    //     console.log("Socket is not connected", socket)
    //     return
    // }
    // console.log("active from filetap", activeFile?.name)

    const changeActiveFile = (fileId: string) => {
        console.log("change active file")

        // If the file is already active, do nothing
        if (activeFile?.id === fileId) return

        updateFileContent(activeFile?.id || "", activeFile?.content || "")

        const file = openFiles.find((file) => file.id === fileId)
        if (file) {
            setActiveFile(file)
        }
    }

    useEffect(() => {
        const fileTabNode = fileTabRef.current
        if (!fileTabNode) return

        const handleWheel = (e: WheelEvent) => {
            if (e.deltaY > 0) {
                fileTabNode.scrollLeft += 100
            } else {
                fileTabNode.scrollLeft -= 100
            }
        }

        fileTabNode.addEventListener("wheel", handleWheel)

        return () => {
            fileTabNode.removeEventListener("wheel", handleWheel)
        }
    }, [])

    // Update the editor language when a file is opened
    useEffect(() => {
        if (activeFile?.name === undefined) return
        // Get file extension on file open and set language when file is opened
        const extension = activeFile.name.split(".").pop()
        if (!extension) return

        // Check if custom mapping exists
        if (customMapping[extension]) {
            setLanguage(customMapping[extension])
            return
        }

        const language = langMap.languages(extension)
        setLanguage(language[0])
    }, [activeFile?.name, setLanguage])

    const handleRunClick = () => {
        const isTerminalClosed = document.querySelector(".lucide-chevron-up")
        if (isTerminalClosed) {
            const event = new KeyboardEvent("keydown", {
                key: "j",
                ctrlKey: true,
                bubbles: true,
                cancelable: true,
            })
            document.dispatchEvent(event)
        }
        // get the active file path by using the active file id

        const path = getFilePathById(activeFile?.id || "", fileStructure)
        const command = generateRunCommand(path || "")
        console.log("path", command)

        if (socket) {
            // emit node index.js
            socket.emit("terminal-input", command)
            socket.emit("terminal-input", "\r")
        }
    }

    return (
        // <div className="flex items-center justify-between">
        <div
            className="relative flex h-[50px] w-full select-none items-center justify-between gap-2 overflow-x-auto overflow-y-hidden p-2 pb-1"
            ref={fileTabRef}
        >
            <div className="flex items-center justify-center">
                {openFiles.map((file) => (
                    <span
                        key={file.id}
                        className={cn(
                            "flex w-fit cursor-pointer items-center rounded-t-md px-2 py-2 text-white",
                            { "bg-darkHover": file.id === activeFile?.id },
                        )}
                        onClick={() => {
                            console.log("I clicked on a file - ", file.name)

                            changeActiveFile(file.id)
                        }}
                    >
                        <Icon
                            icon={getIconClassName(file.name)}
                            fontSize={22}
                            className="mr-2 min-w-fit"
                        />
                        <p
                            className="flex-grow cursor-pointer overflow-hidden truncate"
                            title={file.name}
                        >
                            {file.name}
                        </p>
                        <IoClose
                            className="ml-3 inline rounded-md hover:bg-darkHover"
                            size={20}
                            onClick={(e) => {
                                e.stopPropagation() // Stop event from bubbling up
                                closeFile(file.id)
                            }}
                        />
                    </span>
                ))}
            </div>
            <div
                className="mx-2 flex h-full w-fit cursor-pointer items-center justify-center rounded-md p-2 text-white hover:bg-darkHover"
                onClick={handleRunClick}
            >
                <IoPlayOutline size={30} />
            </div>
            {/* <TerminalComponent
                initialHeight={300}
                initialVisible={false}
                onVisibilityChange={() => {}}
            /> */}
        </div>
        /* <div className="mx-2 flex h-[50px] w-fit cursor-pointer items-center justify-center rounded-md px-3 text-white hover:bg-darkHover">
                <IoPlayOutline size={30} />
            </div> */
        // </div>
    )
}

export default FileTab
