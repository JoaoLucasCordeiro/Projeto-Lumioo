interface UserData {
  id: string;
  username: string;
  fullName: string;
  avatar: string | null;
}

const USER_KEY = 'lumioo_user';
const TOKEN_KEY = 'lumioo_token';

export const saveAuthData = (token: string, user: UserData): void => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearAuthData = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getUser = (): UserData | null => {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error("Failed to parse user data from localStorage", error);
    return null;
  }
};

export const updateLocalUser = (newUserData: Partial<UserData>): UserData | null => {
    const currentUser = getUser();
    if (!currentUser) return null;

    const updatedUser = { ...currentUser, ...newUserData };
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    return updatedUser;
}