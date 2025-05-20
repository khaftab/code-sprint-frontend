import { useFileSystem } from "@/context/FileContext"
import { Id } from "@/types/file"
import { useEffect, useRef } from "react"
import toast from "react-hot-toast"

interface NewFileViewProps {
    parentId: Id
    setCreatingFile: (value: boolean) => void
    openDir: () => void
}

function NewFileView({ parentId, setCreatingFile, openDir }: NewFileViewProps) {
    const { createFile, activeFile, updateFileContent } = useFileSystem()
    const inputRef = useRef<HTMLInputElement | null>(null)
    console.log("Prent id", parentId)

    useEffect(() => {
        openDir()
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus()
            }
        }, 0)
    }, [])

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            const fileName = inputRef.current?.value.trim()
            // block illegal file names
            const illegalFileName = /[<>:"/\\|?*]/g
            if (illegalFileName.test(fileName || "")) {
                toast.error(
                    'File name cannot contain any of the following characters: < > : " / \\ | ? *',
                )
                return
            }
            if (!fileName?.includes(".")) {
                toast.error("File name must contain a file extension")
                return
            }

            if (fileName) {
                createFile(parentId, fileName)
                updateFileContent(
                    activeFile?.id || "",
                    activeFile?.content || "",
                ) // when creating a new file, update the content of the active file. Otherwise, the content will be lost.
                setCreatingFile(false)
            }
        } else if (e.key === "Escape") {
            setCreatingFile(false)
        }
    }

    const handleBlur = () => {
        setCreatingFile(false)
    }

    return (
        <input
            ref={inputRef}
            // className="outline-none focus:outline-none flex-grow bg-transparent"
            className="w-full flex-grow rounded-sm border border-gray-400 bg-dark px-1 text-base text-white outline-none"
            type="text"
            placeholder="Enter file name"
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
        />
    )
}

export default NewFileView
