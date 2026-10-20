import React, { useContext, createContext, useState, useEffect, useRef, ReactNode } from "react";

// ==================== TYPES ====================

interface SelectedDevice {
  id: string | null;
  label: string | null;
}

interface RaisedHandParticipant {
  participantId: string;
  raisedHandOn: number;
}

export interface ChatMessage {
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string | number;
  type?: "text" | "file" | "image";
  url?: string;
  fileName?: string;
  fileSize?: number;
}

interface UseRaisedHandParticipantsReturn {
  participantRaisedHand: (participantId: string) => void;
  participantLoweredHand: (participantId: string) => void;
}

interface MeetingAppContextType {
  // States
  raisedHandsParticipants: RaisedHandParticipant[];
  selectedMic: SelectedDevice;
  selectedWebcam: SelectedDevice;
  selectedSpeaker: SelectedDevice;
  sideBarMode: string | null;
  whiteboardOpen: boolean;
  whiteboardUrl: string | null;
  pipMode: boolean;
  isCameraPermissionAllowed: boolean | null;
  isMicrophonePermissionAllowed: boolean | null;
  unreadChatCount: number;
  chatMessages: ChatMessage[];
  
  // Setters
  setRaisedHandsParticipants: React.Dispatch<React.SetStateAction<RaisedHandParticipant[]>>;
  setSelectedMic: React.Dispatch<React.SetStateAction<SelectedDevice>>;
  setSelectedWebcam: React.Dispatch<React.SetStateAction<SelectedDevice>>;
  setSelectedSpeaker: React.Dispatch<React.SetStateAction<SelectedDevice>>;
  setSideBarMode: React.Dispatch<React.SetStateAction<string | null>>;
  setWhiteboardOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setWhiteboardUrl: React.Dispatch<React.SetStateAction<string | null>>;
  setPipMode: React.Dispatch<React.SetStateAction<boolean>>;
  setIsCameraPermissionAllowed: React.Dispatch<React.SetStateAction<boolean | null>>;
  setIsMicrophonePermissionAllowed: React.Dispatch<React.SetStateAction<boolean | null>>;
  setUnreadChatCount: React.Dispatch<React.SetStateAction<number>>;
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  useRaisedHandParticipants: () => UseRaisedHandParticipantsReturn;
}

interface MeetingAppProviderProps {
  children: ReactNode;
}

// ==================== CONTEXT CREATION ====================

export const MeetingAppContext = createContext<MeetingAppContextType | undefined>(undefined);

export const useMeetingAppContext = (): MeetingAppContextType => {
  const context = useContext(MeetingAppContext);
  if (context === undefined) {
    throw new Error("useMeetingAppContext must be used within a MeetingAppProvider");
  }
  return context;
};

// ==================== PROVIDER COMPONENT ====================

export const MeetingAppProvider: React.FC<MeetingAppProviderProps> = ({ children }) => {
  // States
  const [selectedMic, setSelectedMic] = useState<SelectedDevice>({ id: null, label: null });
  const [selectedWebcam, setSelectedWebcam] = useState<SelectedDevice>({ id: null, label: null });
  const [selectedSpeaker, setSelectedSpeaker] = useState<SelectedDevice>({ id: null, label: null });
  const [isCameraPermissionAllowed, setIsCameraPermissionAllowed] = useState<boolean | null>(null);
  const [isMicrophonePermissionAllowed, setIsMicrophonePermissionAllowed] = useState<boolean | null>(null);
  const [raisedHandsParticipants, setRaisedHandsParticipants] = useState<RaisedHandParticipant[]>([]);
  const [sideBarMode, setSideBarMode] = useState<string | null>(null);
  const [whiteboardOpen, setWhiteboardOpen] = useState<boolean>(false);
  const [whiteboardUrl, setWhiteboardUrl] = useState<string | null>(null);
  const [pipMode, setPipMode] = useState<boolean>(false);
  const [unreadChatCount, setUnreadChatCount] = useState<number>(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // Custom hook for raised hands functionality
  const useRaisedHandParticipants = (): UseRaisedHandParticipantsReturn => {
    const raisedHandsParticipantsRef = useRef<RaisedHandParticipant[]>([]);

    const participantRaisedHand = (participantId: string): void => {
      const currentRaisedHands = [...raisedHandsParticipantsRef.current];

      const newItem: RaisedHandParticipant = { 
        participantId, 
        raisedHandOn: new Date().getTime() 
      };

      const participantFound = currentRaisedHands.findIndex(
        ({ participantId: pID }) => pID === participantId
      );

      if (participantFound === -1) {
        currentRaisedHands.push(newItem);
      } else {
        currentRaisedHands[participantFound] = newItem;
      }

      setRaisedHandsParticipants(currentRaisedHands);
    };

    const participantLoweredHand = (participantId: string): void => {
      const currentRaisedHands = raisedHandsParticipantsRef.current.filter(
        ({ participantId: pID }) => pID !== participantId
      );
      setRaisedHandsParticipants(currentRaisedHands);
    };

    // Update ref when state changes
    useEffect(() => {
      raisedHandsParticipantsRef.current = raisedHandsParticipants;
    }, [raisedHandsParticipants]);

    return { participantRaisedHand, participantLoweredHand };
  };

  const contextValue: MeetingAppContextType = {
    // States
    raisedHandsParticipants,
    selectedMic,
    selectedWebcam,
    selectedSpeaker,
    sideBarMode,
    whiteboardOpen,
    whiteboardUrl,
    pipMode,
    isCameraPermissionAllowed,
    isMicrophonePermissionAllowed,
    
    // Setters
    setRaisedHandsParticipants,
    setSelectedMic,
    setSelectedWebcam,
    setSelectedSpeaker,
    setSideBarMode,
    setWhiteboardOpen,
    setWhiteboardUrl,
    setPipMode,
    useRaisedHandParticipants,
    setIsCameraPermissionAllowed,
    setIsMicrophonePermissionAllowed,
    unreadChatCount,
    setUnreadChatCount,
    chatMessages,
    setChatMessages,
  };

  return React.createElement(
    MeetingAppContext.Provider,
    { value: contextValue },
    children
  );
};