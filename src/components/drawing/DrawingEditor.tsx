import { useAppContext } from "@/context/AppContext"
import { useSocket } from "@/context/SocketContext"
import useWindowDimensions from "@/hooks/useWindowDimensions"
import { SocketEvent } from "@/types/socket"
import { useCallback, useEffect, useRef } from "react"
import { HistoryEntry, RecordsDiff, TLRecord, Tldraw, useEditor } from "tldraw"

function DrawingEditor() {
    const { isMobile } = useWindowDimensions()

    return (
        <Tldraw
            inferDarkMode
            forceMobile={isMobile}
            defaultName="Editor"
            className="z-0"
        >
            <ReachEditor />
        </Tldraw>
    )
}

function ReachEditor() {
    const editor = useEditor()
    const { drawingData, setDrawingData } = useAppContext()
    const { socket } = useSocket()
    const isInitialSync = useRef(true)
    const lastUpdateRef = useRef<string | null>(null)

    // Handler for local changes made by the current user
    const handleChangeEvent = useCallback(
        (change: HistoryEntry<TLRecord>) => {
            const snapshot = change.changes

            // Only update context if this is a significant change
            // This reduces unnecessary context updates
            const snapshotJSON = JSON.stringify(snapshot)
            if (snapshotJSON !== lastUpdateRef.current) {
                lastUpdateRef.current = snapshotJSON
                setDrawingData(editor.store.getSnapshot())
            }

            // Emit the snapshot to the server
            socket.emit(SocketEvent.DRAWING_UPDATE, { snapshot })
        },
        [editor.store, setDrawingData, socket],
    )

    // Handle drawing updates from other clients
    const handleRemoteDrawing = useCallback(
        ({ snapshot }: { snapshot: RecordsDiff<TLRecord> }) => {
            console.log("Received remote drawing update")

            editor.store.mergeRemoteChanges(() => {
                const { added, updated, removed } = snapshot

                for (const record of Object.values(added)) {
                    editor.store.put([record])
                }

                for (const [, to] of Object.values(updated)) {
                    editor.store.put([to])
                }

                for (const record of Object.values(removed)) {
                    editor.store.remove([record.id])
                }
            })

            // No need to update drawingData here as we're constantly
            // receiving updates - we'll persist on unmount instead
        },
        [editor.store],
    )

    // Handle initial sync from server (existing drawings)
    const handleSync = useCallback(
        ({ snapshots }: any) => {
            if (!snapshots || snapshots.length === 0) return

            console.log(
                "Syncing drawings from server:",
                snapshots.length,
                "snapshots",
            )

            editor.store.mergeRemoteChanges(() => {
                // loop through the snapshots and merge them
                for (const snapshot of snapshots) {
                    const { added, updated, removed } =
                        snapshot as RecordsDiff<TLRecord>

                    for (const record of Object.values(added)) {
                        editor.store.put([record])
                    }

                    for (const [, to] of Object.values(updated)) {
                        editor.store.put([to])
                    }

                    for (const record of Object.values(removed)) {
                        editor.store.remove([record.id])
                    }
                }
            })

            // Update the drawing data in context after sync is complete
            setDrawingData(editor.store.getSnapshot())
            isInitialSync.current = false
        },
        [editor.store, setDrawingData],
    )

    // Initialize with local data and request server data
    useEffect(() => {
        // Start with a clean snapshot
        const initialSnapshot = editor.store.getSnapshot()
        setDrawingData(initialSnapshot)

        // If we have existing drawing data from context, load it
        if (drawingData && Object.keys(drawingData).length > 0) {
            editor.store.loadSnapshot(drawingData)
        }

        // Request sync from server
        socket.emit(SocketEvent.DRAWING_READY, "ready")

        // Persist drawing on unmount
        return () => {
            setDrawingData(editor.store.getSnapshot())
        }
    }, []) // Empty dependency array - run once on mount

    // Set up event listeners
    useEffect(() => {
        // Listen for local changes
        const cleanup = editor.store.listen(handleChangeEvent, {
            source: "user",
            scope: "document",
        })

        // Listen for drawing updates from other clients
        socket.on(SocketEvent.DRAWING_UPDATE, handleRemoteDrawing)
        socket.on(SocketEvent.SYNC_DRAWING, handleSync)

        // Cleanup
        return () => {
            cleanup()
            socket.off(SocketEvent.DRAWING_UPDATE)
            socket.off(SocketEvent.SYNC_DRAWING)
        }
    }, [
        editor.store,
        handleChangeEvent,
        handleRemoteDrawing,
        handleSync,
        socket,
    ])

    return null
}

export default DrawingEditor
