import { useState } from "react";
import { useNavigate } from "react-router-dom";

const HomePage: React.FC = () => {
  const [showNicknameBox, setShowNicknameBox] = useState<boolean>(false);
  const [showJoinBox, setShowJoinBox] = useState<boolean>(false);
  const [nickname, setNickname] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");
  const navigate = useNavigate();
  const handleCreateRoomClick = () => {
    setShowNicknameBox(true);
    setShowJoinBox(false);
  };

  const handleJoinClick = () => {
    setShowJoinBox(true);
    setShowNicknameBox(false);
  };

  const handleNicknameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNickname(event.target.value);
  };

  const handleRoomIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRoomId(event.target.value);
  };

  const handleCreateSubmit = () => {
    if (nickname.trim()) {
      navigate(`/chat?nickname=${nickname}`);
    } else {
      alert("Please enter a nickname.");
    }
  };

  const handleJoinSubmit = () => {
    if (roomId.trim() && nickname.trim()) {
      navigate(`/chat?nickname=${nickname}&roomId=${roomId}`);
    } else {
      alert("Please enter both Room ID and Nickname.");
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="chatButtons">
          <button className="ChatRoom" onClick={handleCreateRoomClick}>
            Create Room
          </button>
          <button className="join" onClick={handleJoinClick}>
            Join
          </button>
        </div>

        {showNicknameBox && (
          <div className="nicknameBox">
            <label>Enter your Nickname:</label>
            <input type="text" placeholder="Enter your nickname" value={nickname} onChange={handleNicknameChange} />
            <button onClick={handleCreateSubmit}>Submit</button>
          </div>
        )}

        {showJoinBox && (
          <div className="joinBox">
            <div className="input-group">
              <label>Enter Room ID:</label>
              <input type="text" placeholder="Enter Room ID" value={roomId} onChange={handleRoomIdChange} />
            </div>
            <div className="input-group">
              <label>Enter your Nickname:</label>
              <input type="text" placeholder="Enter your nickname" value={nickname} onChange={handleNicknameChange} />
            </div>
            <button onClick={handleJoinSubmit}>Join Room</button>
          </div>
        )}
      </header>
    </div>
  );
};

export default HomePage;
