import type {
  ApiResponse,
  Chat,
  Message,
  PaginatedMessagesResponse,
  User,
} from "@/types/chat";
import type { DashboardPerformanceData } from "@/types/dashboard.type";
import axiosInstance from "./axios";

export const api = {
  // Chats
  async getAllChats() {
    const res = await axiosInstance.get<ApiResponse<Chat[]>>("/api/chat-app/chats");
    return res.data.data || [];
  },

  async searchUsers() {
    const res = await axiosInstance.get<ApiResponse<User[]>>("/api/chat-app/chats/users");
    return res.data.data || [];
  },

  async createOrGetOneOnOneChat(receiverId: string) {
    const res = await axiosInstance.post<ApiResponse<Chat>>(
      `/api/chat-app/chats/c/${receiverId}`
    );
    return res.data.data;
  },

  async createGroupChat(name: string, participants: string[]) {
    const res = await axiosInstance.post<ApiResponse<Chat>>("/api/chat-app/chats/group", {
      name,
      participants,
    });
    return res.data.data;
  },

  async getGroupChatDetails(chatId: string) {
    const res = await axiosInstance.get<ApiResponse<Chat>>(
      `/api/chat-app/chats/group/${chatId}`
    );
    return res.data.data;
  },

  async renameGroupChat(chatId: string, name: string) {
    const res = await axiosInstance.patch<ApiResponse<Chat>>(
      `/api/chat-app/chats/group/${chatId}`,
      { name }
    );
    return res.data.data;
  },

  async addParticipantToGroup(chatId: string, participantId: string) {
    const res = await axiosInstance.post<ApiResponse<Chat>>(
      `/api/chat-app/chats/group/${chatId}/${participantId}`
    );
    return res.data.data;
  },

  async removeParticipantFromGroup(chatId: string, participantId: string) {
    const res = await axiosInstance.delete<ApiResponse<Chat>>(
      `/api/chat-app/chats/group/${chatId}/${participantId}`
    );
    return res.data.data;
  },

  async leaveGroupChat(chatId: string) {
    const res = await axiosInstance.delete<ApiResponse<Chat>>(
      `/api/chat-app/chats/leave/group/${chatId}`
    );
    return res.data.data;
  },

  async deleteOneOnOneChat(chatId: string) {
    const res = await axiosInstance.delete<ApiResponse<Record<string, never>>>(
      `/api/chat-app/chats/remove/${chatId}`
    );
    return res.data.data;
  },

  async deleteGroupChat(chatId: string) {
    const res = await axiosInstance.delete<ApiResponse<Record<string, never>>>(
      `/api/chat-app/chats/group/${chatId}`
    );
    return res.data.data;
  },

  // Messages
  async getMessages(chatId: string, page = 1, limit = 50) {
    const res = await axiosInstance.get<ApiResponse<PaginatedMessagesResponse>>(
      `/api/chat-app/messages/${chatId}?page=${page}&limit=${limit}`
    );
    return res.data.data;
  },

  async sendMessage(chatId: string, content?: string, attachments?: File[]) {
    if (attachments && attachments.length > 0) {
      const formData = new FormData();
      if (content) {
        formData.append("content", content);
      }
      for (const file of attachments) {
        formData.append("attachments", file);
      }
      const res = await axiosInstance.post<ApiResponse<Message>>(
        `/api/chat-app/messages/${chatId}`,
        formData
      );
      return res.data.data;
    } else {
      const res = await axiosInstance.post<ApiResponse<Message>>(
        `/api/chat-app/messages/${chatId}`,
        { content }
      );
      return res.data.data;
    }
  },

  async deleteMessage(chatId: string, messageId: string) {
    const res = await axiosInstance.delete<ApiResponse<Message>>(
      `/api/chat-app/messages/${chatId}/${messageId}`
    );
    return res.data.data;
  },

  // Dashboard
  async getDashboardPerformance(period: "7d" | "30d" = "7d") {
    const res = await axiosInstance.get<ApiResponse<DashboardPerformanceData>>(
      `/api/dashboard/performance?period=${period}`
    );
    return res.data.data;
  },
};
