export interface ICopilotContext {
    setInput: (input: string) => void
    output: string
    resetState: () => void
    isRunning: boolean
    generateCode: () => void
}
