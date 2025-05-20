import { useFileSystem } from "@/context/FileContext"
import { FormEvent, useCallback, useEffect, useRef, useState } from "react"
import toast from "react-hot-toast"

interface RenameViewProps {
    id: string
    preName: string
    type: "file" | "directory"
    setEditing: (isEditing: boolean) => void
}

function RenameView({ id, preName, setEditing, type }: RenameViewProps) {
    const [name, setName] = useState<string>(preName || "")
    const { renameFile, openFile, renameDirectory } = useFileSystem()
    const formRef = useRef<HTMLFormElement>(null)

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        e.stopPropagation()
        // trim the name
        const trimmedName = name.trim()

        const capitalizedType = type.charAt(0).toUpperCase() + type.slice(1)

        const illegalName = /[<>:"/\\|?*]/g
        if (illegalName.test(name)) {
            toast.error(
                `${capitalizedType} name cannot contain any of the following characters: < > : " / \\ | ? *`,
            )
            return
        }

        if (trimmedName === "") {
            toast.error(`${capitalizedType} name cannot be empty`)
            return
        }

        if (trimmedName.length > 25) {
            toast.error(
                `${capitalizedType} name cannot be longer than 25 characters`,
            )
            return
        }

        // if (trimmedName === preName) {
        //     toast.error(`${capitalizedType} name cannot be the same as before`)
        //     return
        // }

        // If we've made it here, the name is valid
        const isRenamed =
            type === "directory"
                ? renameDirectory(id, trimmedName)
                : renameFile(id, trimmedName)

        if (isRenamed && type === "file") {
            openFile(id)
        }

        if (!isRenamed) {
            toast.error(`${capitalizedType} with same name already exists`)
        } else {
            setEditing(false)
        }
    }

    const handleFormKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === "Enter") {
                formRef.current?.requestSubmit()
            } else if (e.key === "Escape") {
                setEditing(false)
            }
        },
        [setEditing],
    )

    const handleDocumentEvent = useCallback(
        (e: KeyboardEvent | MouseEvent) => {
            const formNode = formRef.current

            if (formNode && !formNode.contains(e.target as Node)) {
                // Handle outside click logic here
                setEditing(false)
            }
        },
        [setEditing],
    )

    useEffect(() => {
        const formNode = formRef.current

        if (!formNode) return

        formNode.focus()

        formNode.addEventListener("keydown", handleFormKeyDown)
        document.addEventListener("keydown", handleDocumentEvent)
        document.addEventListener("click", handleDocumentEvent)

        return () => {
            formNode.removeEventListener("keydown", handleFormKeyDown)
            document.removeEventListener("keydown", handleDocumentEvent)
            document.removeEventListener("click", handleDocumentEvent)
        }
    }, [handleDocumentEvent, handleFormKeyDown, setEditing])

    return (
        <div className="rounded-md">
            <form
                onSubmit={handleSubmit}
                ref={formRef}
                className="flex w-full items-center gap-2 rounded-md"
            >
                <input
                    type="text"
                    className="w-full flex-grow rounded-sm bg-dark px-2 text-base text-white outline-none"
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </form>
        </div>
    )
}

export default RenameView
