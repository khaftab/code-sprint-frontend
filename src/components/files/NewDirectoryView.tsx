import { useFileSystem } from "@/context/FileContext"
import { Id } from "@/types/file"
import { useEffect, useRef } from "react"
import toast from "react-hot-toast"

interface NewDirectoryViewProps {
    parentId: Id
    setCreatingDirectory: (value: boolean) => void
    openDir: () => void
}

function NewDirectoryView({
    parentId,
    setCreatingDirectory,
    openDir,
}: NewDirectoryViewProps) {
    const { createDirectory } = useFileSystem()
    const inputRef = useRef<HTMLInputElement | null>(null)

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
            const dirName = inputRef.current?.value.trim()
            // block illegal directory names
            const illegalDirName = /[<>:"/\\|?*]/g
            if (illegalDirName.test(dirName || "")) {
                toast.error(
                    'Directory name cannot contain any of the following characters: < > : " / \\ | ? *',
                )
                return
            }

            if (dirName?.startsWith(".")) {
                toast.error("Directory name cannot start with a dot")
                return
            }

            if (dirName && dirName.length > 25) {
                toast.error(
                    "Directory name cannot be longer than 25 characters",
                )
                return
            }

            if (dirName) {
                createDirectory(parentId, dirName)
                setCreatingDirectory(false)
            }
        } else if (e.key === "Escape") {
            setCreatingDirectory(false)
        }
    }

    const handleBlur = () => {
        setCreatingDirectory(false)
    }

    return (
        <input
            ref={inputRef}
            className="w-full flex-grow bg-transparent outline-none focus:outline-none"
            type="text"
            placeholder="Enter folder name"
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
        />
    )
}

export default NewDirectoryView
