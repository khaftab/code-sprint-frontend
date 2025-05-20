import { RemoteUser } from "@/types/user"
import { StateField } from "@codemirror/state"
import { EditorView, showTooltip } from "@codemirror/view"

export function tooltipField(users: RemoteUser[], activeFile: string | null) {
    return StateField.define({
        create: () => getCursorTooltips(users, activeFile),
        update(tooltips, tr) {
            if (!tr.docChanged && !tr.selection) return tooltips
            return getCursorTooltips(users, activeFile)
        },
        provide: (f) => showTooltip.computeN([f], (state) => state.field(f)),
    })
}

export function getCursorTooltips(
    users: RemoteUser[],
    activeFile: string | null,
) {
    return users.map((user) => {
        if (user.currentFile !== activeFile) {
            return null
        }
        if (!user.typing) {
            return null
        }
        let text = user.username
        const pos = user.cursorPosition
        if (user) {
            text = user.username
        }

        return {
            pos,
            above: true,
            strictSide: true,
            arrow: true,
            create: () => {
                const dom = document.createElement("div")
                dom.className = "cm-tooltip-cursor"
                dom.textContent = text
                return { dom }
            },
        }
    })
}

export const cursorTooltipBaseTheme = EditorView.baseTheme({
    ".cm-tooltip.cm-tooltip-cursor": {
        backgroundColor: "#66b",
        color: "white",
        border: "none",
        padding: "2px 7px",
        borderRadius: "4px",
        zIndex: "10",
        "& .cm-tooltip-arrow:before": {
            borderTopColor: "#66b",
        },
        "& .cm-tooltip-arrow:after": {
            borderTopColor: "transparent",
        },
    },
})
