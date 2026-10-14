import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  MinChatUiProvider,
  MainContainer,
  MessageInput,
  MessageContainer,
  MessageList,
  MessageHeader,
  Message
} from "@minchat/react-chat-ui";
import { useParams } from 'react-router-dom';
import useAxios from '../api/axiosConfig';
import UserContext from "../context/UserContext";

const urlRegex = new RegExp(
  '^(https?:\\/\\/)?' + // protocol (http or https)
  '((([a-zA-Z\\d]([a-zA-Z\\d-]*[a-zA-Z\\d])*)\\.)+[a-zA-Z]{2,}|' + // domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
  '(\\:\\d+)?(\\/[-a-zA-Z\\d%_.~+]*)*' + // port and path
  '(\\?[;&a-zA-Z\\d%_.~+=-]*)?' + // query string
  '(\\#[-a-zA-Z\\d_]*)?$', 'i' // fragment locator
);
const videoExtensions = /\.(mp4|avi|mkv|mov|wmv|flv|mpeg|mpg|webm|3gp)$/i;
const imageExtensions = /\.(jpg|jpeg|png)$/i;
const gifExtensions = /\.gif$/i;

const myColorSet = {
  //loader
  "--loader-color": "rgb(0, 128, 0)",

  // incoming message
  "--incoming-message-background-color": "#91DDCF",

  //outgoing message
  "--outgoing-message-text-color": "#F7F9F2",
  "--outgoing-message-background-color": "#26355D",
  "--outgoing-message-timestamp-color": "#F7F9F2",
  "--outgoing-message-checkmark-color": "#F7F9F2",
  "--outgoing-message-loader-color": "#F7F9F2",
  "--outgoing-message-link-color": "rgb(0, 128, 0)",
}

const returnMessageType = (msg) => {
  const msgLower = msg.toLowerCase();
  if (urlRegex.test(msg)) {
    if (imageExtensions.test(msgLower)) {
      return "image";
    } else if (videoExtensions.test(msgLower)) {
      return "video";
    } else if (gifExtensions.test(msgLower)) {
      return "gif";
    } else {
      return "file";
    }
  } else {
    return "text";
  }
}

export default function Chat() {
  const { roomId } = useParams();  // Extracts room id from the URL
  const [sentMessage, setSentMessage] = useState("");
  const [messages, setMessages] = useState([])
  const [chatSocket, setChatSocket] = useState();
  const [msgIdToDelete, setMsgIdToDelete] = useState();
  const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState(false);

  const axiosHttpInstance = useAxios();
  const { userData, authTokens } = useContext(UserContext);

  const loggedInUserId = useMemo(() => userData?.id, [userData])
  const loggedInUsername = useMemo(() => userData?.username, [userData])

  const fileSelectorInput = useRef();

  const sendMessage = (msg) => {
    setSentMessage(msg);
  }

  useEffect(() => {
    if (sentMessage == "") return;
    if (!chatSocket) return;
    chatSocket.send(JSON.stringify({
      'message': sentMessage,
      "sender_id": loggedInUserId
    }))
  }, [sentMessage])

  useEffect(() => {
    if (!chatSocket) return;
    chatSocket.onmessage = (e) => {
      const data = JSON.parse(e.data);

      const allMessages = []

      for (let message of data.message) {
        const msgId = message.id;
        const msg = message.message;
        const senderUsername = message.username;
        const messageType = returnMessageType(msg);

        if (data.type === 'chat') {
          let sender;

          if (senderUsername === loggedInUsername) {
            sender = {
              id: loggedInUsername,
              name: loggedInUsername
            }
          } else {
            sender = {
              id: senderUsername,
              name: senderUsername
            }
          }

          if (messageType != "text") {
            allMessages.push({
              media: {
                type: messageType,
                url: msg
              },
              user: sender,
              id: msgId
            })
          } else {
            allMessages.push({
              text: msg,
              user: sender,
              id: msgId
            })
          }
        }
      }

      setMessages(allMessages);
    }
  }, [chatSocket, sentMessage, loggedInUserId])

  useEffect(() => {
    if (!roomId) return;

    (async () => {
      // get all past messages
      const res = await axiosHttpInstance.get("/retrieve_all_messages", {
        params: { chat_id: roomId }
      })
      const resMsgs = res.data?.data;
      if (resMsgs) {
        setMessages(() => (
          resMsgs.map(msg => {
            const messageType = returnMessageType(msg.message);
            const msgId = msg.id;
            if (messageType != "text") {
              return {
                id: msgId,
                media: {
                  type: messageType,
                  url: msg.message
                },
                user: {
                  id: msg.username,
                  name: msg.username
                }
              }
            } else {
              return {
                id: msgId,
                text: msg.message,
                user: {
                  id: msg.username,
                  name: msg.username
                }
              }
            }
          }
          ))
        )
      }
    })()


    // create websocket instance
    const cs = new WebSocket(`${process.env.REACT_APP_WS_URL}/?chat_id=${roomId}&user_id=${loggedInUserId}`);
    setChatSocket(cs)

    return () => {
      if (cs) {
        cs.close();
        console.log("Cleaning up websocket connection.")
      }
    }
  }, [roomId])

  console.log(messages)

  const handleChange = (e) => {
    const file = e.target.files[0];

    const formData = new FormData();

    formData.append("chat_id", roomId);
    formData.append("media", file);

    (async () => {
      const res = await axiosHttpInstance.post(process.env.REACT_APP_API_URL + '/upload_chat_media', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${authTokens?.access}`
        },
      });

      const url = res.data.data.url;

      if (!chatSocket || !url) return;
      chatSocket.send(JSON.stringify({
        "message_type": "media",
        "sender_id": loggedInUserId,
        'message': url
      }))
    })()
  }

  const handleMsgClick = (msg) => {
    setMsgIdToDelete(msg.id);
    setIsDeleteDialogVisible(true);
  }

  const handleMsgDelete = () => {
    setIsDeleteDialogVisible(false);
    (async() => {
      await axiosHttpInstance.post(process.env.REACT_APP_API_URL + '/delete_message', {
        id: msgIdToDelete
      })
    })()
  }

  return loggedInUserId ? (
    <>
      <MinChatUiProvider theme="#6ea9d7" colorSet={myColorSet}>
        <MainContainer style={{ height: '100%' }}>
          <MessageContainer className="msgcontainer">
            {
              messages.map(msg => {
                const isOutgoing = loggedInUsername == msg.user.name;
                if (msg.media) {
                  return <div
                    onClick={() => isOutgoing && handleMsgClick(msg)}
                    className="inline"
                  >
                    <Message
                      media={msg.media}
                      user={msg.user}
                      type={isOutgoing ? "outgoing" : "incoming"}
                      showHeader
                    />
                  </div>
                } else {
                  return <div
                    onClick={() => isOutgoing && handleMsgClick(msg)}
                  >
                    <Message
                      text={msg.text}
                      user={msg.user}
                      type={isOutgoing ? "outgoing" : "incoming"}
                      showHeader
                    />
                  </div>
                }
              })
            }
            <input id="file-selector" type="file" className="" onChange={handleChange} hidden ref={fileSelectorInput} />
            <MessageInput placeholder="Type message here" onSendMessage={sendMessage} showAttachButton={true} onAttachClick={() => { fileSelectorInput.current?.click() }} />
          </MessageContainer>
        </MainContainer>
      </MinChatUiProvider>
      {
        isDeleteDialogVisible && <DeleteMessageDialog onCancel={() => setIsDeleteDialogVisible(false)} onDelete={handleMsgDelete} />
      }
    </>
  ) : <></>;
}


const DeleteMessageDialog = ({ onCancel, onDelete }) => {
  return (
    <div className="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h3 className="text-base font-semibold leading-6 text-gray-900" id="modal-title">Delete message</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">Are you sure you  want to delete this message?</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button type="button" className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto" onClick={onDelete}>Delete</button>
              <button type="button" className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto" onClick={onCancel}>Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}