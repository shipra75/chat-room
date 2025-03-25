import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import "./App.css";
import {
  TelepartyClient,
  SocketEventHandler,
  SocketMessageTypes,
  SessionChatMessage,
} from "teleparty-websocket-lib";

// Define the expected structure for sending messages
interface SendMessageData {
  body: string;
  userNickname: string;
  userIcon?: string;
}

const ChatPage: React.FC = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const nickname = params.get("nickname") || "Anonymous";
  const roomidFromURL = params.get("roomId"); // Room ID from URL
  const [messages, setMessages] = useState<SessionChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const chatBoxRef = useRef<HTMLDivElement | null>(null);
  const [client, setClient] = useState<TelepartyClient | null>(null);
  const [roomId, setRoomId] = useState<string | null>(roomidFromURL);

  // Define WebSocket event handlers
  const eventHandler: SocketEventHandler = {
    onConnectionReady: () => {
      console.log("✅ Connection established");
    },
    onClose: () => {
      console.warn("⚠️ WebSocket connection closed");
    },
    onMessage: (message: any) => {
      console.log('message123', message)
      if (message?.type === SocketMessageTypes.SEND_MESSAGE) {
        const chatMessage: SessionChatMessage = {
          isSystemMessage: false,
          userIcon: message.data.userIcon || "",
          userNickname: message.data.userNickname || "Unknown",
          body: message.data.body || "",
          permId: message.data.permId || Math.random().toString(36).substring(7),
          timestamp: message.data.timestamp || Date.now(),
        };

        setMessages((prevMessages) => [...prevMessages, chatMessage]);
      }
    },
  };

  useEffect(() => {
    const tpClient = new TelepartyClient(eventHandler);
    setClient(tpClient);

    const initializeChat = async () => {
      try {
        if (!roomId) {
          const createdRoomId = await tpClient.createChatRoom(nickname, "public/computing.png");
          setRoomId(createdRoomId);
        }
        const previousMessages = await tpClient.joinChatRoom(nickname, roomId!, "public/computing.png");
        if (previousMessages && Array.isArray(previousMessages.messages)) {
          setMessages(previousMessages.messages as SessionChatMessage[]);
        }
      } catch (error) {
        console.error("❌ Error initializing chat:", error);
      }
    };
    setTimeout(initializeChat, 2000);
    return () => {
      tpClient.teardown();
    };
  }, [roomId, nickname]); // Depend on `roomId` to ensure correct joining

  const handleSendMessage = () => {
    if (newMessage.trim() !== "" && client) {
      const messageData: SendMessageData = {
        body: newMessage,
        userNickname: nickname, 
        userIcon: "public/computing.png", 
      };

      console.log("📤 Sending message:", messageData);
      client.sendMessage(SocketMessageTypes.SEND_MESSAGE, messageData);
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="chatContainer">
      <h2>Welcome, {nickname}!</h2>
      <p>You're in Room ID: {roomId}</p>

      {/* Chat Box */}
      <div className="chatBox" ref={chatBoxRef}>
        {messages.length === 0 ? (
          <p className="noMessages">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`messageContainer ${msg.userNickname === nickname ? "ownMessage" : "otherMessage"}`}>
            <div className="messageCard">
              <div className="nickname">{msg.userNickname}</div>
              <div className="messageBody">{msg.body}</div>
              <div className="timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</div>
            </div>
          </div>
          ))
        )}
      </div>
      <div className="messageInput">
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatPage;
