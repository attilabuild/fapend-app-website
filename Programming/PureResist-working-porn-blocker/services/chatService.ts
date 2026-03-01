import { 
  getUserChats as apiGetUserChats, 
  getChatWithMessages as apiGetChatWithMessages,
  createGroupChat as apiCreateGroupChat,
  createOrGetDirectChat as apiCreateOrGetDirectChat,
  sendChatMessage as apiSendChatMessage,
  getGroupChats as apiGetGroupChats,
  joinGroupChat as apiJoinGroupChat
} from './api';
import { IUser } from '../types';

// Response types
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Chat and Message types
export interface IChat {
  _id: string;
  type: 'direct' | 'group';
  name: string;
  participants: IUser[];
  lastMessage?: IMessage;
  lastActivity: Date;
  createdBy: IUser;
  createdAt: Date;
}

export interface IMessage {
  _id: string;
  content: string;
  sender: IUser;
  isMine: boolean;
  readBy: string[];
  createdAt: Date;
  chatId?: string; // Use chatId instead of chat
}

// Chat response interfaces
export interface ChatWithMessagesResponse {
  chat: IChat;
  messages: IMessage[];
}

// Extend the base IUser interface with chat-specific properties
export interface IChatUser extends IUser {
  isOnline?: boolean;
  lastSeen?: Date;
}

// Error handling helper (copied from api.ts since it's not exported)
const handleApiError = (error: any) => {
  console.error('API Error:', error.response?.data || error.message || error);
  
  // Different error handling based on error type
  if (error.code === 'ECONNABORTED') {
    return {
      success: false,
      message: 'Connection timeout - server may be unavailable',
      error: 'Request timed out'
    };
  }
  
  if (!error.response) {
    return {
      success: false,
      message: 'Network error - please check your connection',
      error: error.message || 'Network error'
    };
  }
  
  return {
    success: false,
    message: error.response?.data?.message || 'An error occurred',
    error: error.response?.data?.error || error.message
  };
};

// Get all chats for a user
export const getUserChats = async (userId: string): Promise<ApiResponse<IChat[]>> => {
  const response = await apiGetUserChats(userId);
  return response as ApiResponse<IChat[]>;
};

// Get a specific chat with messages
export const getChatWithMessages = async (chatId: string, userId: string): Promise<ApiResponse<ChatWithMessagesResponse>> => {
  const response = await apiGetChatWithMessages(chatId, userId);
  return response as ApiResponse<ChatWithMessagesResponse>;
};

// Create a new group chat
export const createGroupChat = async (name: string, participantIds: string[], createdById: string): Promise<ApiResponse<IChat>> => {
  const response = await apiCreateGroupChat(name, participantIds, createdById);
  return response as ApiResponse<IChat>;
};

// Create or get a direct message chat
export const createOrGetDirectChat = async (userId: string, otherUserId: string): Promise<ApiResponse<IChat>> => {
  const response = await apiCreateOrGetDirectChat(userId, otherUserId);
  return response as ApiResponse<IChat>;
};

// Send a message to a chat
export const sendMessage = async (chatId: string, senderId: string, content: string): Promise<ApiResponse<IMessage>> => {
  const response = await apiSendChatMessage(chatId, senderId, content);
  return response as ApiResponse<IMessage>;
};

// Get all available group chats
export const getGroupChats = async (): Promise<ApiResponse<IChat[]>> => {
  const response = await apiGetGroupChats();
  return response as ApiResponse<IChat[]>;
};

// Join a group chat
export const joinGroupChat = async (chatId: string, userId: string): Promise<ApiResponse<IChat>> => {
  const response = await apiJoinGroupChat(chatId, userId);
  return response as ApiResponse<IChat>;
}; 