import { FileSystemItem } from "@/types/file"

/**
 * Get the file path for a given file ID
 * @param {string} fileId - The ID of the file to find
 * @param {FileSystemItem} fileStructure - The root file structure
 * @returns {string|null} - The path to the file or null if not found
 */
export function getFilePathById(fileId: string, fileStructure: FileSystemItem) {
    // Skip the root directory in the path construction
    if (fileStructure.id === "root") {
        // If the root itself is the target, return just its name
        if (fileStructure.id === fileId) {
            return `./${fileStructure.name}`
        }

        // Check root's children directly without adding root to the path
        if (fileStructure.children) {
            for (const child of fileStructure.children) {
                const result = searchInItem(child, "./")
                if (result) return result
            }
        }
        return null
    }

    // For non-root structures, use the regular search
    return searchInItem(fileStructure, "./")

    // Helper function to search recursively within an item
    // @ts-ignore
    function searchInItem(item: FileSystemItem, currentPath: string) {
        // Check if current item matches
        if (item.id === fileId) {
            return `${currentPath}${item.name}`
        }

        // If it's a directory, search its children
        if (item.type === "directory" && item.children) {
            for (const child of item.children) {
                // @ts-ignore
                const result = searchInItem(
                    child,
                    `${currentPath}${item.name}/`,
                )
                if (result) return result
            }
        }

        return null
    }
}

// Example usage:
// const path1 = getFilePathById("index", fileStructure); // Should return "./index.js"
// const path2 = getFilePathById("9c0449d5-39f6-45ee-9442-39a956b282a6", fileStructure); // Should return "./src/rm.js"
// console.log(path1, path2);
