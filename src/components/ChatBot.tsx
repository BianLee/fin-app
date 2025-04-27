import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaChevronUp, FaComment } from "react-icons/fa";
import ReactMarkdown from "react-markdown";

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface PageContext {
    title: string;
    description?: string;
    keyConcepts?: string[];
    currentData?: any;
    learningObjectives?: string[];
}

interface ChatBotProps {
    currentLesson: string;
    pageContext: PageContext;
}

export default function ChatBot({ currentLesson, pageContext }: ChatBotProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isMinimized, setIsMinimized] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (!isMinimized && messages.length === 0) {
            setMessages([
                {
                    role: "assistant",
                    content: `Hi! I'm your financial literacy assistant. I'm here to help you understand ${currentLesson}. 
                    ${
                        pageContext.description
                            ? `\n\n${pageContext.description}`
                            : ""
                    }
                    ${
                        pageContext.keyConcepts
                            ? `\n\nKey concepts we'll cover: ${pageContext.keyConcepts.join(
                                  ", "
                              )}`
                            : ""
                    }
                    ${
                        pageContext.learningObjectives
                            ? `\n\nLearning objectives: ${pageContext.learningObjectives.join(
                                  ", "
                              )}`
                            : ""
                    }
                    Feel free to ask me any questions about what you're learning!`,
                },
            ]);
        }
    }, [isMinimized, currentLesson, pageContext]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage: Message = { role: "user", content: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                    currentLesson,
                    pageContext,
                }),
            });

            const data = await response.json();
            if (data.message) {
                setMessages((prev) => [
                    ...prev,
                    { role: "assistant", content: data.message },
                ]);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "Sorry, I encountered an error. Please try again.",
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    if (isMinimized) {
        return (
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                className="fixed bottom-4 right-4"
            >
                <button
                    onClick={() => setIsMinimized(false)}
                    className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-600 transition-colors"
                >
                    <FaComment />
                    <span>Chat</span>
                    <FaChevronUp className="ml-2" />
                </button>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-lg border border-gray-200"
        >
            <div className="flex justify-between items-center p-2 border-b border-gray-200">
                <h3 className="font-semibold text-gray-700">
                    Financial Assistant
                </h3>
                <button
                    onClick={() => setIsMinimized(true)}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <FaChevronDown />
                </button>
            </div>
            <div className="p-4 h-96 flex flex-col">
                <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                    <AnimatePresence>
                        {messages.map((message, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className={`flex ${
                                    message.role === "user"
                                        ? "justify-end"
                                        : "justify-start"
                                }`}
                            >
                                <div
                                    className={`max-w-[80%] p-3 rounded-lg ${
                                        message.role === "user"
                                            ? "bg-blue-500 text-white"
                                            : "bg-gray-100 text-gray-800"
                                    }`}
                                >
                                    {message.role === "user" ? (
                                        message.content
                                    ) : (
                                        <div className="prose prose-sm max-w-none">
                                            <ReactMarkdown>
                                                {message.content}
                                            </ReactMarkdown>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-gray-100 p-3 rounded-lg">
                                <div className="flex space-x-2">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                    >
                        Send
                    </button>
                </form>
            </div>
        </motion.div>
    );
}
