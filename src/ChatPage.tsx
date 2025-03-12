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
}

const ChatPage: React.FC = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const nickname = params.get("nickname") || "Anonymous";

  const [messages, setMessages] = useState<SessionChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const chatBoxRef = useRef<HTMLDivElement | null>(null);
  const [client, setClient] = useState<TelepartyClient | null>(null);
  const [roomId, setRoomId] = useState<string>("");

  // Define WebSocket event handlers
  const eventHandler: SocketEventHandler = {
    onConnectionReady: () => {
      alert("Connection has been established");
    },
    onClose: () => {
      alert("Socket has been closed");
    },
    onMessage: (message) => {
        if (message.type=== SocketMessageTypes.SEND_MESSAGE) {
            setMessages((prevMessages) => [...prevMessages, message as unknown as SessionChatMessage]);
        }
      },
  };

  useEffect(() => {
    const tpClient = new TelepartyClient(eventHandler);

    const initializeChat = async () => {
      const createdRoomId = await tpClient.createChatRoom(nickname);
      setRoomId(createdRoomId);
      const previousMessages = await tpClient.joinChatRoom(nickname, createdRoomId);
      setMessages(previousMessages.messages as SessionChatMessage[]);
      setClient(tpClient);
    };

    initializeChat();

    return () => {
      tpClient.teardown(); 
    };
  }, [nickname]);

  const handleSendMessage = () => {
    if (newMessage.trim() !== "" && client) {
      const messageData: SendMessageData = {
        body: newMessage,
      };

      client.sendMessage(SocketMessageTypes.SEND_MESSAGE,messageData);
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
            <div
              key={index}
              className={`message ${msg.userNickname === nickname ? "ownMessage" : "otherMessage"}`}
            >
              <strong>{msg.userNickname}:</strong> {msg.body}{" "}
              <span className="timestamp">{msg.timestamp}</span>
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
          onKeyPress={handleKeyPress} // Send message on Enter key press
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatPage;
