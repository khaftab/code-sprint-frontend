// Add this utility function (could be in a separate file)
export function debounce(func: Function, wait: number) {
    let timeout: ReturnType<typeof setTimeout> | null = null

    return function (this: unknown, ...args: any[]) {
        const context = this
        if (timeout) clearTimeout(timeout)
        timeout = setTimeout(() => {
            func.apply(context, args)
        }, wait)
    }
}
