import { useAppContext } from "@/context/AppContext"
import { useFileSystem } from "@/context/FileContext"
import { useViews } from "@/context/ViewContext"
import { useContextMenu } from "@/hooks/useContextMenu"
import useWindowDimensions from "@/hooks/useWindowDimensions"
import { ACTIVITY_STATE } from "@/types/app"
import { FileSystemItem, Id } from "@/types/file"
import { sortFileSystemItem } from "@/utils/file"
import { getIconClassName } from "@/utils/getIconClassName"
import { Icon } from "@iconify/react"
import cn from "classnames"
import { MouseEvent, useEffect, useRef, useState } from "react"
import { AiOutlineFolder, AiOutlineFolderOpen } from "react-icons/ai"
import { MdDelete } from "react-icons/md"
import { PiPencilSimpleFill } from "react-icons/pi"
import {
    RiFileAddLine,
    RiFolderAddLine,
    RiFolderUploadLine,
} from "react-icons/ri"
import RenameView from "./RenameView"
import useResponsive from "@/hooks/useResponsive"
import NewFileView from "./NewFileView"
import NewDirectoryView from "./NewDirectoryView"

const findDirectoryById = (
    item: FileSystemItem,
    id: Id,
): FileSystemItem | null => {
    if (item.id === id) return item

    if (item.children && item.type === "directory") {
        for (const child of item.children) {
            const found = findDirectoryById(child, id)
            if (found) return found
        }
    }

    return null
}

function FileStructureView() {
    const {
        fileStructure,
        createFile,
        createDirectory,
        collapseDirectories,
        toggleDirectory,
    } = useFileSystem()
    const explorerRef = useRef<HTMLDivElement | null>(null)
    const [selectedDirId, setSelectedDirId] = useState<Id>(fileStructure.id)
    const { minHeightReached } = useResponsive()
    const [isCreatingFile, setCreatingFile] = useState<boolean>(false)
    const [isCreatingDirectory, setCreatingDirectory] = useState<boolean>(false)

    const handleClickOutside = (e: MouseEvent) => {
        // Only handle clicks directly on the container element, not on its children
        if (e.target === explorerRef.current) {
            setSelectedDirId(fileStructure.id)
        }
    }

    // console.log("Selected Directory ID:", selectedDirId)

    const handleCreateFile = (e: React.MouseEvent) => {
        e.stopPropagation()
        setCreatingFile(true)
        setCreatingDirectory(false)
    }

    const handleCreateDirectory = () => {
        setCreatingDirectory(true)
        setCreatingFile(false)
    }

    // Function to get a directory item by its ID

    // Check if selected directory is the root
    const isRootSelected = selectedDirId === fileStructure.id

    // Find the selected directory
    const selectedDir = isRootSelected
        ? fileStructure
        : findDirectoryById(fileStructure, selectedDirId)

    // Make sure selected directories are open
    // useEffect(() => {
    //     if (!isRootSelected && selectedDir && !selectedDir.isOpen) {
    //         // Toggle the directory open if it's not already
    //         toggleDirectory(selectedDirId)
    //     }
    // }, [selectedDirId, selectedDir])

    useEffect(() => {
        if (!isRootSelected && selectedDir && !selectedDir.isOpen) {
            // Toggle the directory open if it's not already
            toggleDirectory(selectedDirId)
        }
    }, [selectedDirId])

    const sortedFileStructure = sortFileSystemItem(fileStructure)

    return (
        <div onClick={handleClickOutside} className="flex flex-grow flex-col">
            <div className="view-title flex justify-between">
                <h2>Files</h2>
                <div className="flex gap-2">
                    <button
                        className="rounded-md px-1 hover:bg-darkHover"
                        onClick={handleCreateFile}
                        title="Create File"
                    >
                        <RiFileAddLine size={20} />
                    </button>
                    <button
                        className="rounded-md px-1 hover:bg-darkHover"
                        onClick={handleCreateDirectory}
                        title="Create Directory"
                    >
                        <RiFolderAddLine size={20} />
                    </button>
                    <button
                        className="rounded-md px-1 hover:bg-darkHover"
                        onClick={collapseDirectories}
                        title="Collapse All Directories"
                    >
                        <RiFolderUploadLine size={20} />
                    </button>
                </div>
            </div>
            <div
                className={cn(
                    "min-h-[200px] flex-grow overflow-auto pr-2 sm:min-h-0",
                    {
                        "h-[calc(80vh-170px)]": !minHeightReached,
                        "h-[85vh]": minHeightReached,
                    },
                )}
                ref={explorerRef}
            >
                {/* Only render file creation input at root level when root is selected */}
                {isCreatingFile && isRootSelected && (
                    <div className="flex w-full items-center rounded-md px-2 py-1">
                        <Icon
                            icon="vscode-icons:file"
                            fontSize={22}
                            className="mr-2 min-w-fit"
                        />
                        <NewFileView
                            parentId={selectedDirId}
                            setCreatingFile={setCreatingFile}
                            openDir={() => {}}
                        />
                    </div>
                )}

                {isCreatingDirectory && isRootSelected && (
                    <div className="flex w-full items-center rounded-md px-2 py-1">
                        <AiOutlineFolder size={24} className="mr-2 min-w-fit" />
                        <NewDirectoryView
                            parentId={selectedDirId}
                            setCreatingDirectory={setCreatingDirectory}
                            openDir={() => {}}
                        />
                    </div>
                )}

                {sortedFileStructure.children &&
                    sortedFileStructure.children.map((item) => (
                        <Directory
                            key={item.id}
                            item={item}
                            setSelectedDirId={setSelectedDirId}
                            selectedDirId={selectedDirId}
                            isCreatingFile={isCreatingFile}
                            setCreatingFile={setCreatingFile}
                            isCreatingDirectory={isCreatingDirectory}
                            setCreatingDirectory={setCreatingDirectory}
                        />
                    ))}
            </div>
        </div>
    )
}

function Directory({
    item,
    setSelectedDirId,
    selectedDirId,
    isCreatingFile,
    setCreatingFile,
    isCreatingDirectory,
    setCreatingDirectory,
}: {
    item: FileSystemItem
    setSelectedDirId: (id: Id) => void
    selectedDirId: Id | null
    isCreatingFile: boolean
    setCreatingFile: (value: boolean) => void
    isCreatingDirectory: boolean
    setCreatingDirectory: (value: boolean) => void
}) {
    const [isEditing, setEditing] = useState<boolean>(false)
    const [isCreatingLocalFile, setCreatingLocalFile] = useState<boolean>(false)
    const [isCreatingLocalDirectory, setCreatingLocalDirectory] =
        useState<boolean>(false)
    const dirRef = useRef<HTMLDivElement | null>(null)
    const { coords, menuOpen, setMenuOpen } = useContextMenu({
        ref: dirRef,
    })
    const { deleteDirectory, toggleDirectory } = useFileSystem()

    // Check if this directory is the selected one
    const isSelected = selectedDirId === item.id

    // Determine if we should show the global file creation UI here
    const shouldShowGlobalFileCreation = isCreatingFile && isSelected
    const shouldShowGlobalDirCreation = isCreatingDirectory && isSelected

    const handleDirClick = (e: MouseEvent, dirId: string) => {
        e.stopPropagation()
        console.log("Directory clicked:", dirId)

        // If it's already selected, just toggle its state
        if (selectedDirId === dirId) {
            toggleDirectory(dirId)
        }
        // If it's not selected, select it (the useEffect will open it)
        else {
            setSelectedDirId(dirId)
        }
        // toggleDirectory(dirId)
        // setSelectedDirId(dirId)
    }

    const handleRenameDirectory = (e: MouseEvent) => {
        e.stopPropagation()
        setMenuOpen(false)
        setEditing(true)
    }

    const handleDeleteDirectory = (e: MouseEvent, id: Id) => {
        e.stopPropagation()
        setMenuOpen(false)
        const isConfirmed = confirm(
            `Are you sure you want to delete directory?`,
        )
        if (isConfirmed) {
            deleteDirectory(id)
        }
    }

    const handleCreateNewFile = (e: MouseEvent) => {
        e.stopPropagation()
        setMenuOpen(false)
        setCreatingLocalFile(true)
        // setSelectedDirId(item.id)
    }

    const handleCreateNewDirectory = (e: MouseEvent) => {
        e.stopPropagation()
        setMenuOpen(false)
        setCreatingLocalDirectory(true)
        // setSelectedDirId(item.id)
    }

    // Add F2 key event listener to directory for renaming
    useEffect(() => {
        const dirNode = dirRef.current

        if (!dirNode) return

        dirNode.tabIndex = 0

        const handleF2 = (e: KeyboardEvent) => {
            e.stopPropagation()
            if (e.key === "F2") {
                setEditing(true)
            }
        }

        dirNode.addEventListener("keydown", handleF2)

        return () => {
            dirNode.removeEventListener("keydown", handleF2)
        }
    }, [])

    if (item.type === "file") {
        return <File item={item} setSelectedDirId={setSelectedDirId} />
    }

    return (
        <div className="overflow-x-auto">
            <div
                className={cn(
                    "flex w-full items-center rounded-md px-2 py-1 hover:bg-darkHover",
                    {
                        "border-l-2 border-blue-400 bg-blue-900/30": isSelected,
                    },
                )}
                onClick={(e) => handleDirClick(e, item.id)}
                ref={dirRef}
            >
                {item.isOpen ? (
                    <AiOutlineFolderOpen size={24} className="mr-2 min-w-fit" />
                ) : (
                    <AiOutlineFolder size={24} className="mr-2 min-w-fit" />
                )}
                {isEditing ? (
                    <RenameView
                        id={item.id}
                        preName={item.name}
                        type="directory"
                        setEditing={setEditing}
                    />
                ) : (
                    <p
                        className="flex-grow cursor-pointer overflow-hidden truncate"
                        title={item.name}
                    >
                        {item.name}
                    </p>
                )}
            </div>

            <div
                className={cn(
                    { hidden: !item.isOpen },
                    { block: item.isOpen },
                    { "pl-4": item.name !== "root" },
                )}
            >
                {/* Show the global file creation input if this is the selected directory */}
                {shouldShowGlobalFileCreation && (
                    <div className="flex w-full items-center rounded-md px-2 py-1">
                        <Icon
                            icon="vscode-icons:file"
                            fontSize={22}
                            className="mr-2 min-w-fit"
                        />
                        <NewFileView
                            parentId={item.id}
                            setCreatingFile={setCreatingFile}
                            openDir={() => {
                                if (!item.isOpen) {
                                    toggleDirectory(item.id)
                                }
                            }}
                            // openDir={() => {}}
                        />
                    </div>
                )}

                {/* Show the global directory creation input if this is the selected directory */}
                {shouldShowGlobalDirCreation && (
                    <div className="flex w-full items-center rounded-md px-2 py-1">
                        <AiOutlineFolder size={24} className="mr-2 min-w-fit" />
                        <NewDirectoryView
                            parentId={item.id}
                            setCreatingDirectory={setCreatingDirectory}
                            openDir={() => {
                                if (!item.isOpen) {
                                    toggleDirectory(item.id)
                                }
                            }}
                            // openDir={() => {}}
                        />
                    </div>
                )}

                {/* Local file creation (from context menu) */}
                {isCreatingLocalFile && (
                    <div className="flex w-full items-center rounded-md px-2 py-1">
                        <Icon
                            icon="vscode-icons:file"
                            fontSize={22}
                            className="mr-2 min-w-fit"
                        />
                        <NewFileView
                            parentId={item.id}
                            setCreatingFile={setCreatingLocalFile}
                            openDir={() => {
                                if (!item.isOpen) {
                                    toggleDirectory(item.id)
                                }
                            }}
                        />
                    </div>
                )}

                {/* Local directory creation (from context menu) */}
                {isCreatingLocalDirectory && (
                    <div className="flex w-full items-center rounded-md px-2 py-1">
                        <AiOutlineFolder size={24} className="mr-2 min-w-fit" />
                        <NewDirectoryView
                            parentId={item.id}
                            setCreatingDirectory={setCreatingLocalDirectory}
                            openDir={() => {
                                if (!item.isOpen) {
                                    toggleDirectory(item.id)
                                }
                            }}
                        />
                    </div>
                )}

                {item.children &&
                    item.children.map((child) => (
                        <Directory
                            key={child.id}
                            item={child}
                            setSelectedDirId={setSelectedDirId}
                            selectedDirId={selectedDirId}
                            isCreatingFile={isCreatingFile}
                            setCreatingFile={setCreatingFile}
                            isCreatingDirectory={isCreatingDirectory}
                            setCreatingDirectory={setCreatingDirectory}
                        />
                    ))}
            </div>

            {menuOpen && (
                <DirectoryMenu
                    handleDeleteDirectory={handleDeleteDirectory}
                    handleRenameDirectory={handleRenameDirectory}
                    handleCreateNewFile={handleCreateNewFile}
                    handleCreateNewDirectory={handleCreateNewDirectory}
                    id={item.id}
                    left={coords.x}
                    top={coords.y}
                />
            )}
        </div>
    )
}

const File = ({
    item,
    setSelectedDirId,
}: {
    item: FileSystemItem
    setSelectedDirId: (id: Id) => void
}) => {
    const { deleteFile, openFile, updateFileContent, activeFile } =
        useFileSystem()
    const [isEditing, setEditing] = useState<boolean>(false)
    const { setIsSidebarOpen } = useViews()
    const { isMobile } = useWindowDimensions()
    const { activityState, setActivityState } = useAppContext()
    const fileRef = useRef<HTMLDivElement | null>(null)
    const { menuOpen, coords, setMenuOpen } = useContextMenu({
        ref: fileRef,
    })

    const handleFileClick = (e: MouseEvent, fileId: string) => {
        console.log("File clicked:", fileId)

        e.stopPropagation()
        if (isEditing) return

        // Don't set files as selected directory - remove this line
        // setSelectedDirId(fileId)
        // if it is active file, do nothing
        if (activeFile && activeFile.id === fileId) {
            // save the file content
            updateFileContent(fileId, activeFile.content || "")
        } else {
            openFile(fileId)
        }
        if (isMobile) {
            setIsSidebarOpen(false)
        }
        if (activityState === ACTIVITY_STATE.DRAWING) {
            setActivityState(ACTIVITY_STATE.CODING)
        }
    }

    const handleRenameFile = (e: MouseEvent) => {
        e.stopPropagation()
        setEditing(true)
        setMenuOpen(false)
    }

    const handleDeleteFile = (e: MouseEvent, id: Id) => {
        e.stopPropagation()
        setMenuOpen(false)
        const isConfirmed = confirm(`Are you sure you want to delete file?`)
        if (isConfirmed) {
            deleteFile(id)
        }
    }

    // Add F2 key event listener to file for renaming
    useEffect(() => {
        const fileNode = fileRef.current

        if (!fileNode) return

        fileNode.tabIndex = 0

        const handleF2 = (e: KeyboardEvent) => {
            e.stopPropagation()
            if (e.key === "F2") {
                setEditing(true)
            }
        }

        fileNode.addEventListener("keydown", handleF2)

        return () => {
            fileNode.removeEventListener("keydown", handleF2)
        }
    }, [])

    return (
        <div
            className="flex w-full items-center rounded-md px-2 py-1 hover:bg-darkHover"
            onClick={(e) => handleFileClick(e, item.id)}
            ref={fileRef}
        >
            <Icon
                icon={getIconClassName(item.name)}
                fontSize={22}
                className="mr-2 min-w-fit"
            />
            {isEditing ? (
                <RenameView
                    id={item.id}
                    preName={item.name}
                    type="file"
                    setEditing={setEditing}
                />
            ) : (
                <p
                    className="flex-grow cursor-pointer overflow-hidden truncate"
                    title={item.name}
                >
                    {item.name}
                </p>
            )}

            {/* Context Menu For File*/}
            {menuOpen && (
                <FileMenu
                    top={coords.y}
                    left={coords.x}
                    id={item.id}
                    handleRenameFile={handleRenameFile}
                    handleDeleteFile={handleDeleteFile}
                />
            )}
        </div>
    )
}

const FileMenu = ({
    top,
    left,
    id,
    handleRenameFile,
    handleDeleteFile,
}: {
    top: number
    left: number
    id: Id
    handleRenameFile: (e: MouseEvent) => void
    handleDeleteFile: (e: MouseEvent, id: Id) => void
}) => {
    return (
        <div
            className="absolute z-10 w-[150px] rounded-md border border-darkHover bg-dark p-1"
            style={{
                top,
                left,
            }}
        >
            <button
                onClick={handleRenameFile}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1 hover:bg-darkHover"
            >
                <PiPencilSimpleFill size={18} />
                Rename
            </button>
            <button
                onClick={(e) => handleDeleteFile(e, id)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-danger hover:bg-darkHover"
            >
                <MdDelete size={20} />
                Delete
            </button>
        </div>
    )
}

const DirectoryMenu = ({
    top,
    left,
    id,
    handleRenameDirectory,
    handleDeleteDirectory,
    handleCreateNewFile,
    handleCreateNewDirectory,
}: {
    top: number
    left: number
    id: Id
    handleRenameDirectory: (e: MouseEvent) => void
    handleDeleteDirectory: (e: MouseEvent, id: Id) => void
    handleCreateNewFile: (e: MouseEvent) => void
    handleCreateNewDirectory: (e: MouseEvent) => void
}) => {
    return (
        <div
            className="absolute z-10 w-[150px] rounded-md border border-darkHover bg-dark p-1"
            style={{
                top,
                left,
            }}
        >
            <button
                onClick={handleCreateNewFile}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1 hover:bg-darkHover"
            >
                <RiFileAddLine size={18} />
                New File
            </button>
            <button
                onClick={handleCreateNewDirectory}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1 hover:bg-darkHover"
            >
                <RiFolderAddLine size={18} />
                New Folder
            </button>
            <button
                onClick={handleRenameDirectory}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1 hover:bg-darkHover"
            >
                <PiPencilSimpleFill size={18} />
                Rename
            </button>
            <button
                onClick={(e) => handleDeleteDirectory(e, id)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-danger hover:bg-darkHover"
            >
                <MdDelete size={20} />
                Delete
            </button>
        </div>
    )
}

export default FileStructureView
