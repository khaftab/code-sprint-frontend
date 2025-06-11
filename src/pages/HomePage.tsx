import { Code2 } from "lucide-react"

import Form from "@/components/forms/Form"

const palette = {
    dark: "#181A20",
    darkHover: "#23262F",
    light: "#F4F7FA",
    primary: "#4ADE80",
    danger: "#F87171",
}

const HomePage = () => {
    return (
        <div
            className="relative min-h-screen overflow-hidden"
            style={{
                background: palette.dark,
                fontFamily: "'Poppins', sans-serif",
            }}
        >
            <div className="container relative z-10 mx-auto px-4 py-8">
                <div className="mb-16 text-center">
                    <div className="mb-6 inline-flex items-center gap-3">
                        <div
                            className="rounded-xl p-3"
                            style={{ background: palette.darkHover }}
                        >
                            <Code2
                                className="h-5 w-5"
                                color={palette.primary}
                            />
                        </div>
                        <h1
                            className="text-4xl font-bold md:text-3xl"
                            style={{
                                color: palette.light,
                                fontFamily: "'Poppins', sans-serif",
                            }}
                        >
                            CodeSprint
                        </h1>
                    </div>
                    <p
                        className="mx-auto max-w-2xl text-lg leading-relaxed"
                        style={{ color: "#A3A9B7" }}
                    >
                        Collaborative coding made simple. Join rooms, code
                        together.
                    </p>
                </div>

                <div className="mx-auto grid max-w-5xl items-stretch gap-8 lg:grid-cols-2 lg:gap-12">
                    <div className="flex h-full">
                        <div
                            className="flex w-full flex-col rounded-2xl border"
                            style={{
                                borderColor: "#23262F",
                                background: "#1E212A",
                                height: "100%",
                            }}
                        >
                            {/* Terminal Header */}
                            <div
                                className="border-b p-4"
                                style={{ borderColor: "#23262F" }}
                            >
                                <div className="mb-3 flex items-center gap-2">
                                    <div
                                        className="h-3 w-3 rounded-full"
                                        style={{ background: palette.danger }}
                                    ></div>
                                    <div
                                        className="h-3 w-3 rounded-full"
                                        style={{ background: "#FBBF24" }}
                                    ></div>
                                    <div
                                        className="h-3 w-3 rounded-full"
                                        style={{ background: "#34D399" }}
                                    ></div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span
                                        className="text-xs font-medium"
                                        style={{ color: "#A3A9B7" }}
                                    >
                                        collaborative-editor.js
                                    </span>
                                    <div
                                        className="h-1.5 w-1.5 animate-pulse rounded-full"
                                        style={{ background: palette.primary }}
                                    ></div>
                                    <span
                                        className="text-xs"
                                        style={{ color: palette.primary }}
                                    >
                                        Live
                                    </span>
                                </div>
                            </div>

                            {/* Code Content */}
                            <div className="flex-1 overflow-hidden p-6">
                                <div
                                    className="space-y-3 font-mono text-sm leading-relaxed"
                                    style={{ color: "#C9D1D9" }}
                                >
                                    {/* Simplified code content to fit */}
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span style={{ color: "#E5C07B" }}>
                                                import
                                            </span>
                                            <span style={{ color: "#7EE787" }}>
                                                {"{ useState }"}
                                            </span>
                                            <span style={{ color: "#E5C07B" }}>
                                                from
                                            </span>
                                            <span style={{ color: "#A5D6FF" }}>
                                                'react'
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span style={{ color: "#E5C07B" }}>
                                                import
                                            </span>
                                            <span style={{ color: "#7EE787" }}>
                                                io
                                            </span>
                                            <span style={{ color: "#E5C07B" }}>
                                                from
                                            </span>
                                            <span style={{ color: "#A5D6FF" }}>
                                                'socket.io-client'
                                            </span>
                                        </div>
                                    </div>

                                    <div className="h-2"></div>

                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span style={{ color: "#7EE787" }}>
                                                const
                                            </span>
                                            <span style={{ color: "#61AFEF" }}>
                                                CollaborativeEditor
                                            </span>
                                            <span style={{ color: "#C9D1D9" }}>
                                                =
                                            </span>
                                            <span style={{ color: "#C9D1D9" }}>
                                                () =&gt; {"{"}
                                            </span>
                                        </div>

                                        <div className="space-y-2 pl-4">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    style={{ color: "#7EE787" }}
                                                >
                                                    const
                                                </span>
                                                <span
                                                    style={{ color: "#61AFEF" }}
                                                >
                                                    [code, setCode]
                                                </span>
                                                <span
                                                    style={{ color: "#C9D1D9" }}
                                                >
                                                    =
                                                </span>
                                                <span
                                                    style={{ color: "#E5C07B" }}
                                                >
                                                    useState
                                                </span>
                                                <span
                                                    style={{ color: "#A5D6FF" }}
                                                >
                                                    (&#39;&#39;)
                                                </span>
                                            </div>
                                            <div style={{ color: "#8B949E" }}>
                                                {/* Real-time collaboration */}
                                                // Real-time collaboration
                                            </div>
                                            {/* Extra 4 lines of code */}
                                            <div className="flex items-center gap-2">
                                                <span
                                                    style={{ color: "#7EE787" }}
                                                >
                                                    const
                                                </span>
                                                <span
                                                    style={{ color: "#61AFEF" }}
                                                >
                                                    socket
                                                </span>
                                                <span
                                                    style={{ color: "#C9D1D9" }}
                                                >
                                                    =
                                                </span>
                                                <span
                                                    style={{ color: "#E5C07B" }}
                                                >
                                                    io()
                                                </span>
                                            </div>
                                            <div className="flex items-center">
                                                <span
                                                    style={{ color: "#61AFEF" }}
                                                >
                                                    socket
                                                </span>
                                                <span
                                                    style={{ color: "#C9D1D9" }}
                                                >
                                                    .
                                                </span>
                                                <span
                                                    style={{ color: "#E5C07B" }}
                                                >
                                                    on
                                                </span>
                                                <span
                                                    style={{ color: "#A5D6FF" }}
                                                >
                                                    (
                                                </span>
                                                <span
                                                    style={{ color: "#A5D6FF" }}
                                                >
                                                    'code'
                                                </span>
                                                <span
                                                    style={{ color: "#C9D1D9" }}
                                                >
                                                    , (
                                                </span>
                                                <span
                                                    style={{ color: "#61AFEF" }}
                                                >
                                                    newCode
                                                </span>
                                                <span
                                                    style={{ color: "#C9D1D9" }}
                                                >
                                                    ) =&gt; {"{"}
                                                </span>
                                            </div>
                                            <div className="flex items-center pl-4">
                                                <span
                                                    style={{ color: "#E5C07B" }}
                                                >
                                                    setCode
                                                </span>
                                                <span
                                                    style={{ color: "#61AFEF" }}
                                                >
                                                    (newCode)
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span
                                                    style={{ color: "#C9D1D9" }}
                                                >
                                                    {"})"}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span style={{ color: "#C9D1D9" }}>
                                                {"}"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Form />
                </div>

                <div className="mt-16 text-center">
                    <p className="text-sm" style={{ color: "#A3A9B7" }}>
                        Start coding together in seconds • No downloads required
                    </p>
                </div>
            </div>
        </div>
    )
}

export default HomePage
