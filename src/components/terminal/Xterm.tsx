import React, { useEffect, useRef } from "react"
import { Terminal as XTerm } from "xterm"
import { FitAddon } from "xterm-addon-fit"
import { WebLinksAddon } from "xterm-addon-web-links"
import "xterm/css/xterm.css"

interface TerminalProps {
    id?: string
    className?: string
    // @ts-ignore
    options?: XTerm.ITerminalOptions
    onReady?: (terminal: XTerm) => void
    onData?: (data: string) => void
}

const Xterm: React.FC<TerminalProps> = ({
    id = "terminal",
    className = "",
    options = {},
    onReady,
    onData,
}) => {
    const terminalRef = useRef<HTMLDivElement>(null)
    const xtermRef = useRef<XTerm | null>(null)
    const fitAddonRef = useRef<FitAddon | null>(null)
    const isInitialized = useRef(false)

    useEffect(() => {
        if (!terminalRef.current || isInitialized.current) return
        // @ts-ignore
        const defaultOptions: XTerm.ITerminalOptions = {
            cursorBlink: true,
            cursorStyle: "block",
            fontSize: 14,
            fontFamily: "Fira Code, monospace",
            lineHeight: 1.2,
            // fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            theme: {
                background: "#1e1e1e",
                foreground: "#f0f0f0",
                cursor: "#f0f0f0",
                selection: "rgba(255, 255, 255, 0.3)",
            },
            allowTransparency: true,
            scrollback: 1000,
            ...options,
        }

        const xterm = new XTerm(defaultOptions)
        const fitAddon = new FitAddon()

        xterm.loadAddon(fitAddon)
        xterm.loadAddon(new WebLinksAddon())
        xterm.open(terminalRef.current)
        fitAddon.fit()

        xtermRef.current = xterm
        fitAddonRef.current = fitAddon
        isInitialized.current = true

        // xtermRef.current.writeln("Welcome to the terminal!")

        // Let node-pty handle data input/output
        if (onData) xterm.onData(onData)
        onReady?.(xterm)

        const resizeObserver = new ResizeObserver(() => {
            try {
                fitAddon.fit()
            } catch (error) {
                console.error("Resize error:", error)
            }
        })

        if (terminalRef.current) {
            resizeObserver.observe(terminalRef.current)
        }

        return () => {
            resizeObserver.disconnect()
            xterm.dispose()
            xtermRef.current = null
        }
    }, [])

    return (
        <div
            id={id}
            ref={terminalRef}
            className={`terminal-container ${className}`}
            style={{
                width: "100%",
                height: "100%",
                border: "1px solid #333",
                borderRadius: "4px",
                overflow: "hidden",
                position: "relative",
            }}
        ></div>
    )
}

export default Xterm
