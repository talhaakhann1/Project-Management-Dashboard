export interface User {
  _id: string;
  fullName: string;
  email: string;
  avatar: {
    url: string;
    localPath?: string;
  };
  role: string;
  isActive: boolean;
}