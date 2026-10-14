import { React, useEffect, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateGroupModal from "../components/CreateGroupModal";
import UserContext from "../context/UserContext";
import useAxios from '../api/axiosConfig';
import { shortDate } from "../utils/datetime";

export const ChatLobby = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([]);
  const { authTokens, userData } = useContext(UserContext);
  const userId = localStorage.getItem("userId");
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const axiosInstance = useAxios();

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCardClick = async (message) => {
    const receiver_id = message.sender_id;
    localStorage.setItem('chatId', receiver_id);
    console.log("chatt", receiver_id)
    navigate(`/chat/${receiver_id}`);
  };

  const fetchMessages = async () => {
    try {
      const response = await axiosInstance.get(
        `/chat_lobby`
      );

      const sortedMessages = response.data.data.sort((message1, message2) => {
        return (
          new Date(message2.last_message_sent_at) -
          new Date(message1.last_message_sent_at)
        );
      });

      setMessages(sortedMessages);

    } catch (error) {
      console.error("Error fetching messages:", error);
      setError("An error occurred while fetching messages.");
    }
  };


  // const filterMessages = () => {
  //   if (!searchTerm) {
  //     setFilteredMessages(messages);
  //     return;
  //   }
  //   const lowerSearchTerm = searchTerm.toLowerCase();

  //   const filtered = messages.filter((message) => {
  //     const nameMatch = message.name && message.name.toLowerCase().includes(lowerSearchTerm);
  //     const messageMatch = message.last_message && message.last_message.toLowerCase().includes(lowerSearchTerm);
  //     return nameMatch || messageMatch;

  //   });

  //   setFilteredMessages(filtered);
  // };
  useEffect(() => {
    fetchMessages();
    // filterMessages();
  }, []);


  const formatMessageTime = (messageTime) => {
    const messageDate = new Date(messageTime);
    const now = new Date();

    const diff = now.getTime() - messageDate.getTime();
    const diffInDays = diff / (1000 * 3600 * 24);

    if (diffInDays < 1) {
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInDays < 2) {
      return "Yesterday";
    } else if (messageDate.getDay() !== now.getDay() && diffInDays < 7) {
      return messageDate.toLocaleDateString([], { weekday: "long" });
    }

    return messageDate.toLocaleDateString();
  };

  return (
    <ul className="divide-y divide-gray-200 py-3 flex flex-col gap-3 align-end">
      <div className="">
        <div className="flex space-x-4 justify-end">
          <button
            onClick={() => { setShowCreateGroupModal(true) }}
            className="flex justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Create Group
          </button>
        </div>
      </div>
      <CreateGroupModal showModal={showCreateGroupModal} setShowModal={setShowCreateGroupModal} onSuccess={() => fetchMessages()} />
      {
        messages.map(msg => (
          <li className="pb-3 sm:pb-4 hover:bg-slate-200 p-2 rounded-lg cursor-pointer" onClick={() => navigate(`/chat/${msg.id}`)}>
            <div className="flex items-center justify-between w-full">
              <div className="text-start flex items-center space-x-4 rtl:space-x-reverse overflow-hidden">
                <div className="flex-shrink-0">
                  {
                    msg.chat_type == "group" ?
                      <svg width="80" height="80" data-jdenticon-value="user127"></svg> :
                      <img className="w-8 h-8 rounded-full" src={msg.picture} alt="Neil image" />
                  }
                </div>
                <div className={`flex-1 min-w-0 ${!msg?.has_read ? "font-bold" : ""}`}>
                  <p className="text-sm text-gray-900 truncate">
                    {msg.name}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {msg.last_message}
                  </p>
                </div>
              </div>
              <p className="inline-flex items-center text-gray-900 shrink-0">
                {shortDate(msg.last_message_sent_at)}
              </p>
            </div>
          </li>
        ))
      }
    </ul>
  )
}