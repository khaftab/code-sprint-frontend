import { useFileSystem } from "@/context/FileContext"
import useResponsive from "@/hooks/useResponsive"
import cn from "classnames"
import Editor from "./Editor"
import FileTab from "./FileTab"
import TerminalComponent from "../terminal/MyTerminal"
import { useEffect } from "react"
import { useSocket } from "@/context/SocketContext"

function EditorComponent() {
    const { openFiles } = useFileSystem()
    const { minHeightReached } = useResponsive()
    const { socket } = useSocket()

    if (openFiles.length <= 0) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <h1 className="text-xl text-white">
                    No file is currently open.
                </h1>
            </div>
        )
    }

    return (
        <>
            <main
                className={cn(
                    "flex w-full flex-col overflow-x-auto md:h-screen",
                    {
                        "h-[calc(100vh-50px)]": !minHeightReached,
                        "h-full": minHeightReached,
                    },
                )}
            >
                <FileTab />

                <div className="flex w-full flex-col">
                    <Editor />

                    {/* <TerminalComponent
                        initialHeight={300}
                        initialVisible={false}
                        onVisibilityChange={() => {}}
                    /> */}
                </div>
            </main>
        </>
    )
}

export default EditorComponent
