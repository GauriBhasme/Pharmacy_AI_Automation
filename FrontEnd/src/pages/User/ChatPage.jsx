import { useState, useRef, useEffect } from "react";
import { Bot, User, Loader2, Mic, Paperclip, Send } from "lucide-react";
import axios from "axios";

// Remove TypeScript interface and use plain JS
const initialMessages = [
    {
        id: "1",
        role: "assistant",
        content:
            "Hello! I'm your AI Pharmacist assistant. You can type, speak, or upload an image prescription.\n\nHow can I assist you today?",
        timestamp: new Date(),
    },
];

export default function ChatPage() {
    const [messages, setMessages] = useState(initialMessages);
    const [input, setInput] = useState("");
    const [image, setImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);


    //for image OCR 
    const [extractedData, setExtractedData] = useState(null);
const [showConfirm, setShowConfirm] = useState(false);
const [selectedFile, setSelectedFile] = useState(null);


const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);

    const formData = new FormData();
    formData.append("image", file);

    try {
        setIsLoading(true);

        const res = await axios.post(
            "http://localhost:5000/api/prescription",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        setExtractedData(res.data.result);
        setShowConfirm(true);

    } catch (err) {
        alert("OCR Failed");
    }

    setIsLoading(false);
};



    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Voice Input
    const startListening = () => {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Speech Recognition not supported in this browser.");
            return;
        }
        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.start();
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
        };
    };

    // Image Upload
    // const handleImageUpload = (e) => {
    //     const file = e.target.files?.[0];
    //     if (!file) return;
    //     const reader = new FileReader();
    //     reader.onloadend = () => {
    //         setImage(reader.result);
    //     };
    //     reader.readAsDataURL(file);
    // };

    const handleSend = async () => {
        if ((!input.trim() && !image) || isLoading) return;
        const now = Date.now();
        let userMessage = input.trim();
        if (userMessage) {
            setMessages((prev) => [
                ...prev,
                {
                    id: now.toString(),
                    role: "user",
                    content: userMessage,
                    timestamp: new Date(),
                },
            ]);
        }
        if (image) {
            setMessages((prev) => [
                ...prev,
                {
                    id: (now + 1).toString(),
                    role: "user",
                    content: `<img src="${image}" style="max-width:200px;border-radius:10px;" />`,
                    timestamp: new Date(),
                },
            ]);
        }
        setInput("");
        setImage(null);
        setIsLoading(true);
        try {
            // Send message to backend Gemini agent
            const token = localStorage.getItem("token");
            const res = await axios.post(
                "http://localhost:5000/api/chat/chat",
                { message: userMessage },
                {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                }
            );
            setMessages((prev) => [
                ...prev,
                {
                    id: (now + 2).toString(),
                    role: "assistant",
                    content: res.data.reply,
                    timestamp: new Date(),
                },
            ]);
        } catch (err) {
            setMessages((prev) => [
                ...prev,
                {
                    id: (now + 2).toString(),
                    role: "assistant",
                    content: "Sorry, there was an error communicating with the AI agent.",
                    timestamp: new Date(),
                },
            ]);
        }
        setIsLoading(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex h-screen flex-col bg-gradient-to-br from-[#0B1F3A] to-[#0E2F5A]">
            {/* Header */}
            <div className="border-b px-8 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#135C8C] text-white">
                        <Bot className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-white">AI Pharmacist</h1>
                        <p className="text-sm text-[#9FB7C8]">Text • Voice • Image Enabled</p>
                    </div>
                </div>
            </div>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-8">
                <div className="mx-auto max-w-3xl space-y-6">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex gap-4 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                        >
                            <div
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${message.role === "assistant"
                                    ? "bg-[#135C8C] text-white"
                                    : "bg-[#0E2F5A] text-white"
                                    }`}
                            >
                                {message.role === "assistant" ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
                            </div>
                            <div
                                className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === "assistant"
                                    ? "bg-[#0E2F5A] text-white"
                                    : "bg-[#135C8C] text-white"
                                    }`}
                            >
                                <div
                                    dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                                />
                                <p className="mt-2 text-[10px] opacity-60">
                                    {message.timestamp.toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-4">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#135C8C] text-white">
                                <Bot className="h-5 w-5" />
                            </div>
                            <div className="flex items-center gap-2 rounded-2xl bg-[#0E2F5A] px-4 py-3 text-white">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Analyzing...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>
            {/* Input */}
            <div className="border-t p-8 bg-[#0B1F3A]">
                <div className="mx-auto max-w-3xl relative">
                    {/* Image preview */}
                    {image && (
                        <div className="mb-2">
                            <img
                                src={image}
                                alt="preview"
                                className="max-w-[120px] rounded-lg border"
                            />
                        </div>
                    )}
                    <div className="flex items-end gap-2">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type, speak, or upload prescription..."
                            className="min-h-[60px] resize-none w-full rounded-lg bg-[#0E2F5A] text-white border border-[#135C8C] focus:outline-none focus:ring-2 focus:ring-[#135C8C] px-4 py-2"
                            style={{ boxSizing: 'border-box' }}
                        />
                        <div className="flex gap-2 items-center">
                            <button
                                type="button"
                                className="rounded-lg p-2 hover:bg-[#135C8C]"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Paperclip className="h-5 w-5 text-[#9FB7C8]" />
                            </button>
                            <button
                                type="button"
                                className="rounded-lg p-2 hover:bg-[#135C8C]"
                                onClick={startListening}
                            >
                                <Mic className="h-5 w-5 text-[#9FB7C8]" />
                            </button>
                            <button
                                type="button"
                                className="rounded-lg p-2 bg-[#135C8C] text-white"
                                onClick={handleSend}
                                disabled={(!input.trim() && !image) || isLoading}
                            >
                                <Send className="h-4 w-4" />
                            </button>
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                    </div>
                    <p className="mt-2 text-center text-xs text-[#9FB7C8]">
                        AI responses are for assistance only.
                    </p>
                </div>
            </div>
            {showConfirm && (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl p-6 max-w-lg w-full">
      <h2 className="text-lg font-semibold mb-4">Confirm Extracted Medicines</h2>

      <pre className="bg-gray-100 p-3 rounded text-sm max-h-60 overflow-auto">
        {extractedData}
      </pre>

      <div className="flex justify-end gap-3 mt-4">
        <button
          className="px-4 py-2 bg-gray-300 rounded"
          onClick={() => setShowConfirm(false)}
        >
          Cancel
        </button>

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => confirmPrescription()}
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
)}
        </div>
    );
}

function formatMessage(content) {
    return content
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\n/g, "<br />");
}

function getStubResponse(input) {
    // No longer needed, replaced by backend Gemini response
    return "";
}