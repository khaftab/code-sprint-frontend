const getExtension = (fileName: string) => {
    // Handle edge cases where there's no extension or no filename
    if (!fileName || !fileName.includes(".")) return ""

    // Split by dot and get the last part
    const extension = fileName.split(".").pop()?.toLowerCase() || ""

    return extension
}

// Helper function to escape shell special characters
const escapeShellArg = (arg: string): string => {
    // Wrap the argument in single quotes and escape any existing single quotes
    return `'${arg.replace(/'/g, "'\\''")}'`
}

export const generateRunCommand = (fileName: string): string => {
    // Extract the file extension
    // filename = "./index.js", "./src/rm.sh" etc.
    const extension = getExtension(fileName)

    // Escape the filename for shell usage
    const escapedFileName = escapeShellArg(fileName)

    // For output files or class names, we need the filename without extension
    // but still properly escaped

    // Handle each file type appropriately
    switch (extension) {
        // JavaScript files
        case "js":
            return `cd /home/devx/workspace && node ${escapedFileName}`

        // TypeScript files
        case "ts": {
            const outputFile = escapeShellArg(fileName.replace(".ts", ".js"))
            return `cd /home/devx/workspace && tsc ${escapedFileName} && node ${outputFile}`
        }

        // Python files
        case "py":
            return `cd /home/devx/workspace && python ${escapedFileName}`

        // Shell scripts
        case "sh":
            return `cd /home/devx/workspace && bash ${escapedFileName}`

        // Ruby files
        case "rb":
            return `cd /home/devx/workspace && ruby ${escapedFileName}`

        // Go files
        case "go":
            return `cd /home/devx/workspace && go run ${escapedFileName}`

        // Java files
        case "java": {
            // Extract directory path and class name safely
            const lastSlashIndex = fileName.lastIndexOf("/")
            const dirPath =
                lastSlashIndex > 0
                    ? escapeShellArg(
                          fileName.substring(0, lastSlashIndex) || "./",
                      )
                    : "'./'"

            // Get the class name without extension
            const fullClassName = fileName.substring(lastSlashIndex + 1)
            const className = fullClassName.split(".")[0]

            return `cd /home/devx/workspace && javac -d ${dirPath} ${escapedFileName} && java -cp ${dirPath} ${className}`
        }

        // C files
        case "c": {
            const outputFile = escapeShellArg(fileName.replace(".c", ""))
            return `cd /home/devx/workspace && gcc ${escapedFileName} -o ${outputFile} && ${outputFile}`
        }

        // C++ files
        case "cpp":
        case "cc": {
            const outputFile = escapeShellArg(
                fileName.replace(/\.(cpp|cc)$/, ""),
            )
            return `cd /home/devx/workspace && g++ ${escapedFileName} -o ${outputFile} && ${outputFile}`
        }

        // Default for unknown file types
        default:
            return `echo "Don't know how to run files with .${extension} extension"`
    }
}
