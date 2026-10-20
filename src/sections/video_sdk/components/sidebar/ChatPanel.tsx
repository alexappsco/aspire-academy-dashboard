
import { useFile, useMeeting, usePubSub } from "@videosdk.live/react-sdk";
import React, { useEffect, useRef, useState } from "react";

import { formatAMPM, json_verify, nameTructed } from "src/utils/helper";
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  InputAdornment,

  CircularProgress
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import DownloadIcon from "@mui/icons-material/Download";
import { useMeetingAppContext } from "../../MeetingAppContextDef";

interface ChatMessageProps {
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  type?: 'text' | 'file' | 'image';
  url?: string;
  fileName?: string;
}

/** Pub/Sub may deliver `timestamp` as string (e.g. ISO or ms) or number */
function toTimestampMs(ts: string | number): number {
  if (typeof ts === "number" && !Number.isNaN(ts)) return ts;
  if (typeof ts === "string") {
    const asNum = Number(ts);
    if (!Number.isNaN(asNum) && ts.trim() !== "") return asNum;
    const parsed = Date.parse(ts);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return Date.now();
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Failed to read file"));
        return;
      }
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function mimeFromFileName(fileName: string | undefined, type: "file" | "image") {
  const ext = fileName?.split(".").pop()?.toLowerCase();
  if (type === "image") {
    if (ext === "png") return "image/png";
    if (ext === "gif") return "image/gif";
    if (ext === "webp") return "image/webp";
    return "image/jpeg";
  }
  if (ext === "pdf") return "application/pdf";
  if (ext === "txt") return "text/plain";
  return "application/octet-stream";
}

const ChatAttachment: React.FC<{
  type: "file" | "image";
  url: string;
  fileName?: string;
  token?: string;
}> = ({ type, url, fileName, token }) => {
  const { fetchBase64File } = useFile();
  const [src, setSrc] = useState<string | null>(url.startsWith("data:") ? url : null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (url.startsWith("data:")) {
      setSrc(url);
      return;
    }
    if (!token) return;

    let cancelled = false;
    fetchBase64File({ url, token })
      .then((base64) => {
        if (cancelled || !base64) return;
        setSrc(`data:${mimeFromFileName(fileName, type)};base64,${base64}`);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [fetchBase64File, fileName, token, type, url]);

  if (type === "image") {
    return (
      <Box sx={{ mt: 1 }}>
        {src ? (
          <Box
            component="img"
            src={src}
            alt={fileName || "chat image"}
            sx={{
              borderRadius: 1,
              width: "100%",
              maxWidth: 260,
              maxHeight: 260,
              objectFit: "cover",
            }}
          />
        ) : (
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)" }}>
            {failed ? fileName || "Image" : "..."}
          </Typography>
        )}
        {src && (
          <Box sx={{ mt: 0.5, display: "flex", justifyContent: "flex-end" }}>
            <IconButton
              component="a"
              href={src}
              download={fileName || "chat-image"}
              size="small"
              sx={{ color: "rgba(255,255,255,0.75)" }}
            >
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        mt: 1,
        mb: 1,
        p: 1,
        bgcolor: "rgba(255,255,255,0.05)",
        borderRadius: 1,
      }}
    >
      <InsertDriveFileIcon sx={{ mr: 1, color: "#4CAF50" }} />
      <Box sx={{ flex: 1, minWidth: 0, mr: 1 }}>
        <Typography variant="body2" noWrap sx={{ color: "white" }}>
          {fileName || "File"}
        </Typography>
      </Box>
      {src && (
        <IconButton
          component="a"
          href={src}
          download={fileName || "file"}
          size="small"
          sx={{
            bgcolor: "rgba(255,255,255,0.1)",
            color: "white",
            "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
          }}
        >
          <DownloadIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
};

const ChatMessageComponent: React.FC<ChatMessageProps> = ({
  senderId,
  senderName,
  text,
  timestamp,
  type = 'text',
  url,
  fileName,
  token,
}: ChatMessageProps & { token?: string }) => {
  const mMeeting = useMeeting();
  const localParticipantId = mMeeting?.localParticipant?.id;
  const isLocalSender = localParticipantId === senderId;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isLocalSender ? "flex-end" : "flex-start",
        mt: 2,
        maxWidth: "100%",
      }}
    >
      <Paper
        sx={{
          display: "flex",
          flexDirection: "column",
          py: 0.5,
          px: 1.5,
          borderRadius: 2,
          bgcolor: "#2a2d3a",
          maxWidth: "80%",
        }}
      >
        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>
          {isLocalSender ? "You" : nameTructed(senderName, 15)}
        </Typography>

        {(type === "image" || type === "file") && url ? (
          <ChatAttachment type={type} url={url} fileName={fileName} token={token} />
        ) : null}

        {text && (
          <Typography variant="body2" sx={{ color: "white", wordBreak: "break-word" }}>
            {text}
          </Typography>
        )}

        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)", textAlign: "right", mt: 0.5 }}>
          {formatAMPM(new Date(timestamp))}
        </Typography>
      </Paper>
    </Box>
  );
};

const ChatInput: React.FC<{ inputHeight: number; token?: string }> = ({ token }) => {
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { publish } = usePubSub("CHAT");
  const { uploadBase64File } = useFile();
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sendMessage = (customText?: string, attachment?: { type: string, url: string, fileName: string }) => {
    const messageText = customText !== undefined ? customText : message.trim();

    if (messageText.length > 0 || attachment) {
      try {
        const payload = attachment ? JSON.stringify({
          type: attachment.type,
          text: messageText,
          url: attachment.url,
          fileName: attachment.fileName
        }) : messageText;

        publish(payload, { persist: true });
        setTimeout(() => setMessage(""), 100);
        inputRef.current?.focus();
      } catch (e) {
        console.log("Error in pubsub", e);
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // التحقق من صيغ الصور المدعومة (بما في ذلك jfif)
    const isImage = file.type.startsWith('image/') ||
      file.name.match(/\.(jpg|jpeg|png|gif|webp|jfif)$/i);

    if (!token) {
      alert("تعذر إرسال الملف داخل الجلسة.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert("حجم الملف أكبر من 8 ميجا.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsUploading(true);
    try {
      const base64 = await readFileAsBase64(file);
      const url = await uploadBase64File({
        base64Data: base64,
        token,
        fileName: file.name,
      });
      sendMessage("", {
        type: isImage ? "image" : "file",
        url,
        fileName: file.name,
      });
    } catch (err) {
      console.error("File processing error", err);
      alert("حدث خطأ أثناء معالجة الملف");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        px: 1.5,
        py: 1.5,
        borderTop: "1px solid rgba(255,255,255,0.1)",
        bgcolor: "#2a2d3a",
        zIndex: 1
      }}
    >
      <TextField
        autoFocus
        inputRef={inputRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Write your message..."
        variant="outlined"
        fullWidth
        size="medium"
        sx={{
          "& .MuiOutlinedInput-root": {
            bgcolor: "rgba(255,255,255,0.03)",
            borderRadius: "12px",
            "& input": {
              color: "white",
              py: 1,
              fontSize: "0.9rem",
              "&::placeholder": {
                color: "rgba(255,255,255,0.5)",
                opacity: 1
              }
            },
            "& fieldset": {
              borderColor: "rgba(255,255,255,0.1)",
              borderWidth: "1px"
            },
            "&:hover fieldset": {
              borderColor: "rgba(255,255,255,0.2)"
            },
            "&.Mui-focused fieldset": {
              borderColor: "#4CAF50"
            }
          },
        }}
        slotProps={{
          input: {
          startAdornment: (
            <InputAdornment position="start">
              <input
                type="file"
                hidden
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.*,text/plain,.jfif"
              />
              <IconButton
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                sx={{ color: "rgba(255,255,255,0.5)" }}
              >
                {isUploading ? <CircularProgress size={20} color="inherit" /> : <AttachFileIcon />}
              </IconButton>
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => sendMessage()}
                disabled={message.trim().length === 0}
                edge="end"
                sx={{ ml: 1 }}
              >
                <SendIcon sx={{ color: message.trim().length === 0 ? "rgba(255,255,255,0.2)" : "#4CAF50" }} />
              </IconButton>
            </InputAdornment>
          ),
          },
        }}
      />
    </Box>
  );
};

const ChatMessages: React.FC<{ listHeight: number; token?: string }> = ({ token }) => {
  const listRef = useRef<HTMLDivElement>(null);
  const { chatMessages } = useMeetingAppContext();

  const scrollToBottom = () => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  if (!chatMessages || chatMessages.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
        <Typography sx={{ color: "gray" }}>No messages</Typography>
      </Box>
    );
  }

  return (
    <Box
      ref={listRef}
      sx={{
        overflowY: "auto",
        flex: 1,
        p: 2,
        height: "100%",
        pt: 2
      }}
    >
      {
        chatMessages.map((msg, i) => {
          let type: 'text' | 'file' | 'image' = msg.type || 'text';
          let messageToShow = msg.message;
          let url = msg.url;
          let fileName = msg.fileName;

          const isJson = json_verify(msg.message);
          if (isJson) {
            try {
              const parsed = JSON.parse(msg.message);
              type = parsed.type || type;
              messageToShow = parsed.text || "";
              url = parsed.url || url;
              fileName = parsed.fileName || fileName;
            } catch (e) {
              console.error("JSON parse error", e);
            }
          }

          return (
            <ChatMessageComponent
              key={`chat_item_${i}`}
              senderId={msg.senderId}
              senderName={msg.senderName}
              text={messageToShow}
              timestamp={toTimestampMs(msg.timestamp)}
              type={type}
              url={url}
              fileName={fileName}
              token={token}
            />
          );
        })
      }
    </Box >
  );
};

export function ChatPanel({
  panelHeight,
  token,
}: {
  panelHeight: number;
  token?: string;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: panelHeight,
        overflow: "hidden",
      }}
    >
      <Box sx={{ flex: 1, overflow: "hidden" }}>
        <ChatMessages listHeight={0} token={token} />
      </Box>

      <Box sx={{ flexShrink: 0 }}>
        <ChatInput inputHeight={72} token={token} />
      </Box>
    </Box>
  );
};


// import { useMeeting, usePubSub } from "@videosdk.live/react-sdk";
// import React, { useEffect, useRef, useState } from "react";
// import { formatAMPM, json_verify, nameTructed } from "src/utils/helper";
// import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
// import {
//   Box,
//   Paper,
//   Typography,
//   TextField,
//   IconButton,
//   InputAdornment,
//   List,
//   ListItem,
//   CircularProgress
// } from "@mui/material";
// import SendIcon from "@mui/icons-material/Send";
// import AttachFileIcon from "@mui/icons-material/AttachFile";
// import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
// import DownloadIcon from "@mui/icons-material/Download";
// import { useMeetingAppContext } from "../../MeetingAppContextDef";

// interface ChatMessageProps {
//   senderId: string;
//   senderName: string;
//   text: string;
//   timestamp: number;
//   type?: 'text' | 'file' | 'image';
//   url?: string;
//   fileName?: string;
// }

// /** Pub/Sub may deliver `timestamp` as string (e.g. ISO or ms) or number */
// function toTimestampMs(ts: string | number): number {
//   if (typeof ts === "number" && !Number.isNaN(ts)) return ts;
//   if (typeof ts === "string") {
//     const asNum = Number(ts);
//     if (!Number.isNaN(asNum) && ts.trim() !== "") return asNum;
//     const parsed = Date.parse(ts);
//     if (!Number.isNaN(parsed)) return parsed;
//   }
//   return Date.now();
// }

// const ChatMessageComponent: React.FC<ChatMessageProps> = ({
//   senderId,
//   senderName,
//   text,
//   timestamp,
//   type = 'text',
//   url,
//   fileName,
// }) => {
//   const mMeeting = useMeeting();
//   const localParticipantId = mMeeting?.localParticipant?.id;
//   const isLocalSender = localParticipantId === senderId;

//   return (
//     <Box
//       sx={{
//         display: "flex",
//         justifyContent: isLocalSender ? "flex-end" : "flex-start",
//         mt: 2,
//         maxWidth: "100%",
//       }}
//     >
//       <Paper
//         sx={{
//           display: "flex",
//           flexDirection: "column",
//           py: 0.5,
//           px: 1.5,
//           borderRadius: 2,
//           bgcolor: "#2a2d3a",
//           maxWidth: "80%",
//         }}
//       >
//         <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)" }}>
//           {isLocalSender ? "You" : nameTructed(senderName, 15)}
//         </Typography>

//         {type === "image" && url ? (
//           <Box sx={{ mt: 1 }}>
//             <Box
//               component="img"
//               src={url}
//               alt={fileName || "chat image"}
//               sx={{
//                 borderRadius: 1,
//                 width: "100%",
//                 maxWidth: 260,
//                 maxHeight: 260,
//                 objectFit: "cover",
//               }}
//             />
//             <Box sx={{ mt: 0.5, display: "flex", justifyContent: "flex-end" }}>
//               <IconButton
//                 component="a"
//                 href={url}
//                 download={fileName || "chat-image"}
//                 size="small"
//                 sx={{ color: "rgba(255,255,255,0.75)" }}
//               >
//                 <DownloadIcon fontSize="small" />
//               </IconButton>
//             </Box>
//           </Box>
//         ) : null}

//         {type === 'file' && url && (
//           <Box
//             sx={{
//               display: 'flex',
//               alignItems: 'center',
//               mt: 1,
//               mb: 1,
//               p: 1,
//               bgcolor: 'rgba(255,255,255,0.05)',
//               borderRadius: 1,
//               position: 'relative'
//             }}
//           >
//             <InsertDriveFileIcon sx={{ mr: 1, color: '#4CAF50' }} />
//             <Box sx={{ flex: 1, minWidth: 0, mr: 1 }}>
//               <Typography variant="body2" noWrap sx={{ color: 'white' }}>
//                 {fileName || 'File'}
//               </Typography>
//             </Box>
//             <IconButton
//               component="a"
//               href={url}
//               download={fileName || "file"}
//               target="_blank"
//               rel="noopener noreferrer"
//               size="small"
//               sx={{
//                 bgcolor: 'rgba(255,255,255,0.1)',
//                 color: 'white',
//                 '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
//               }}
//             >
//               <DownloadIcon fontSize="small" />
//             </IconButton>
//           </Box>
//         )}

//         {text && (
//           <Typography variant="body2" sx={{ color: "white", wordBreak: "break-word" }}>
//             {text}
//           </Typography>
//         )}

//         <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.5)", textAlign: "right", mt: 0.5 }}>
//           {formatAMPM(new Date(timestamp))}
//         </Typography>
//       </Paper>
//     </Box>
//   );
// };

// const ChatInput: React.FC<{ inputHeight: number }> = ({ inputHeight }) => {
//   const [message, setMessage] = useState("");
//   const [isUploading, setIsUploading] = useState(false);
//   const { publish } = usePubSub("CHAT");
//   const inputRef = useRef<HTMLInputElement>(null);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   const fileToDataUrl = (file: File): Promise<string> =>
//     new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.onload = () => {
//         if (typeof reader.result === "string") {
//           resolve(reader.result);
//           return;
//         }
//         reject(new Error("Unable to convert file to data URL"));
//       };
//       reader.onerror = () => reject(reader.error || new Error("FileReader failed"));
//       reader.readAsDataURL(file);
//     });

//   const uploadFileToMockService = async (file: File): Promise<string | null> => {
//     try {
//       const formData = new FormData();
//       formData.append("file", file);

//       const response = await fetch("https://tmpfiles.org/api/v1/upload", {
//         method: "POST",
//         body: formData,
//       });

//       const data = await response.json();
//       if (data.status === "success" && data.data && data.data.url) {
//         // Tmpfiles returns a link to a viewer page by default. 
//         // We need the direct link. Converting https://tmpfiles.org/XXXXX to https://tmpfiles.org/dl/XXXXX
//         return data.data.url.replace("tmpfiles.org/", "tmpfiles.org/dl/");
//       }
//       return null;
//     } catch (error) {
//       console.error("Upload error:", error);
//       return null;
//     }
//   };

//   const sendMessage = (customText?: string, attachment?: { type: string, url: string, fileName: string }) => {
//     const messageText = customText !== undefined ? customText : message.trim();

//     if (messageText.length > 0 || attachment) {
//       try {
//         const payload = attachment ? JSON.stringify({
//           type: attachment.type,
//           text: messageText,
//           url: attachment.url,
//           fileName: attachment.fileName
//         }) : messageText;

//         publish(payload, { persist: true });
//         setTimeout(() => setMessage(""), 100);
//         inputRef.current?.focus();
//       } catch (e) {
//         console.log("Error in pubsub", e);
//       }
//     }
//   };

//   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     setIsUploading(true);
//     try {
//       const isImage = file.type.startsWith('image/');
//       let url: string | null = null;

//       if (isImage) {
//         // Use Base64 for images (faster, works for everyone without backend)
//         url = await fileToDataUrl(file);
//       } else {
//         // Use Mock Service for other files
//         url = await uploadFileToMockService(file);
//       }

//       if (url) {
//         const type = isImage ? 'image' : 'file';
//         sendMessage("", {
//           type,
//           url: url,
//           fileName: file.name
//         });
//       } else {
//         alert("Failed to process file. Please try again.");
//       }
//     } catch (err) {
//       console.error("File processing error", err);
//     } finally {
//       setIsUploading(false);
//       if (fileInputRef.current) fileInputRef.current.value = "";
//     }
//   };

//   const handleKeyPress = (e: React.KeyboardEvent) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       sendMessage();
//     }
//   };

//   return (
//     <Box
//       sx={{
//         width: "100%",
//         display: "flex",
//         alignItems: "center",
//         px: 1.5, // Slightly more compact padding
//         py: 1.5,
//         borderTop: "1px solid rgba(255,255,255,0.1)",
//         bgcolor: "#2a2d3a",
//         zIndex: 1 // Ensure it's on top
//       }}
//     >
//       <TextField
//         autoFocus
//         inputRef={inputRef}
//         value={message}
//         onChange={(e) => setMessage(e.target.value)}
//         onKeyPress={handleKeyPress}
//         placeholder="Write your message..."
//         variant="outlined"
//         fullWidth
//         size="medium" // Slightly larger for easier clicking
//         sx={{
//           "& .MuiOutlinedInput-root": {
//             bgcolor: "rgba(255,255,255,0.03)",
//             borderRadius: "12px", // More rounded corners
//             "& input": {
//               color: "white",
//               py: 1,
//               fontSize: "0.9rem",
//               "&::placeholder": {
//                 color: "rgba(255,255,255,0.5)",
//                 opacity: 1
//               }
//             },
//             "& fieldset": {
//               borderColor: "rgba(255,255,255,0.1)",
//               borderWidth: "1px"
//             },
//             "&:hover fieldset": {
//               borderColor: "rgba(255,255,255,0.2)"
//             },
//             "&.Mui-focused fieldset": {
//               borderColor: "#4CAF50"
//             }
//           },
//         }}
//         InputProps={{
//           startAdornment: (
//             <InputAdornment position="start">
//               <input
//                 type="file"
//                 hidden
//                 ref={fileInputRef}
//                 onChange={handleFileChange}
//               />
//               <IconButton
//                 onClick={() => fileInputRef.current?.click()}
//                 disabled={isUploading}
//                 sx={{ color: "rgba(255,255,255,0.5)" }}
//               >
//                 {isUploading ? <CircularProgress size={20} color="inherit" /> : <AttachFileIcon />}
//               </IconButton>
//             </InputAdornment>
//           ),
//           endAdornment: (
//             <InputAdornment position="end">
//               <IconButton
//                 onClick={() => sendMessage()}
//                 disabled={message.trim().length === 0}
//                 edge="end"
//                 sx={{ ml: 1 }}
//               >
//                 <SendIcon sx={{ color: message.trim().length === 0 ? "rgba(255,255,255,0.2)" : "#4CAF50" }} />
//               </IconButton>
//             </InputAdornment>
//           ),
//         }}
//       />
//     </Box>
//   );
// };

// const ChatMessages: React.FC<{ listHeight: number }> = ({ listHeight }) => {
//   const listRef = useRef<HTMLDivElement>(null);
//   const { chatMessages } = useMeetingAppContext();

//   const scrollToBottom = () => {
//     if (listRef.current) {
//       listRef.current.scrollTop = listRef.current.scrollHeight;
//     }
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [chatMessages]);

//   if (!chatMessages || chatMessages.length === 0) {
//     return (
//       <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
//         <Typography sx={{ color: "gray" }}>No messages</Typography>
//       </Box>
//     );
//   }

//   return (
//     <Box
//       ref={listRef}
//       sx={{
//         overflowY: "auto",   // ✅ ده اللي بيعمل scroll
//         flex: 1,             // ✅ ياخد المساحة المتبقية
//         p: 2,
//         height: "100%",
//         pt: 2      // مهم
//       }}
//     >
//       {/* <Box sx={{ : 2 }} /> */}
//       {
//         chatMessages.map((msg, i) => {
//           let type: 'text' | 'file' | 'image' = 'text';
//           let messageToShow = msg.message;
//           let url = undefined;
//           let fileName = undefined;

//           const isJson = json_verify(msg.message);
//           if (isJson) {
//             try {
//               const parsed = JSON.parse(msg.message);
//               type = parsed.type || 'text';
//               messageToShow = parsed.text || "";
//               url = parsed.url;
//               fileName = parsed.fileName;
//             } catch (e) {
//               console.error("JSON parse error", e);
//             }
//           }

//           return (
//             <ChatMessageComponent
//               key={`chat_item_${i}`}
//               senderId={msg.senderId}
//               senderName={msg.senderName}
//               text={messageToShow}
//               timestamp={toTimestampMs(msg.timestamp)}
//               type={type}
//               url={url}
//               fileName={fileName}
//             />
//           );
//         })
//       }
//     </Box >
//   );
// };

// export function ChatPanel({ panelHeight }: { panelHeight: number }) {
//   return (
//     <Box
//       sx={{
//         display: "flex",
//         flexDirection: "column",
//         height: panelHeight,
//         overflow: "hidden", // مهم
//       }}
//     >
//       <Box sx={{ flex: 1, overflow: "hidden" }}>
//         <ChatMessages listHeight={0} />
//       </Box>

//       <Box sx={{ flexShrink: 0 }}>
//         <ChatInput inputHeight={72} />
//       </Box>
//     </Box>
//   );
// }