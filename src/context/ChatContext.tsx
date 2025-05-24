import { ChatContext as ChatContextType, ChatMessage } from "@/types/chat"
import { SocketEvent } from "@/types/socket"
import {
    ReactNode,
    createContext,
    useContext,
    useEffect,
    useState,
} from "react"
import { useSocket } from "./SocketContext"

const ChatContext = createContext<ChatContextType | null>(null)

export const useChatRoom = (): ChatContextType => {
    const context = useContext(ChatContext)
    if (!context) {
        throw new Error("useChatRoom must be used within a ChatContextProvider")
    }
    return context
}

function ChatContextProvider({ children }: { children: ReactNode }) {
    const { socket } = useSocket()
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [isNewMessage, setIsNewMessage] = useState<boolean>(false)
    const [lastScrollHeight, setLastScrollHeight] = useState<number>(0)

    useEffect(() => {
        if (!socket) return

        const handleMessage = ({ message }: { message: ChatMessage }) => {
            setMessages((prev) => [...prev, message])
            setIsNewMessage(true)
        }

        const handleHistory = (history: ChatMessage[]) => {
            setMessages(history)
            setIsNewMessage(true)
        }

        socket.on(SocketEvent.RECEIVE_MESSAGE, handleMessage)
        socket.on(SocketEvent.MESSAGE_HISTORY, handleHistory)

        return () => {
            socket.off(SocketEvent.RECEIVE_MESSAGE, handleMessage)
            socket.off(SocketEvent.MESSAGE_HISTORY, handleHistory)
        }
    }, [socket]) // Add socket to dependency array

    return (
        <ChatContext.Provider
            value={{
                messages,
                setMessages,
                isNewMessage,
                setIsNewMessage,
                lastScrollHeight,
                setLastScrollHeight,
            }}
        >
            {children}
        </ChatContext.Provider>
    )
}

export { ChatContextProvider }
export default ChatContext
