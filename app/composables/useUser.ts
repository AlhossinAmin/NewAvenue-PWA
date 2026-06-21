import { useApi } from "~/composables/useApi";
import type { Member } from "~/constants/dummy/members";
import type { ApiResponse } from "~/types/api";

interface LoginData {
  token: string;
  token_type: string;
  user: Member;
}

export function useUser() {
  const token = useCookie<string | null>("auth_token", {
    default: () => null,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });

  const user = useState<Member | null>("auth_user", () => null);

  const isLoggedIn = computed(() => !!token.value);

  const api = useApi();

  const login = async (username: string, password: string): Promise<Member> => {
    const res = await api<ApiResponse<LoginData>>("/login", {
      method: "POST",
      body: {
        username,
        password,
      },
    });
    token.value = res.data.token;
    user.value = res.data.user;
    return res.data.user;
  };

  const fetchMe = async (): Promise<Member | null> => {
    if (!token.value) return null;
    const res = await api<ApiResponse<Member>>("/me");
    user.value = res.data;
    return res.data;
  };

  const logout = async (): Promise<void> => {
    try {
      if (token.value) await api("/logout", { method: "POST" });
    } finally {
      token.value = null;
      user.value = null;
    }
  };

  return {
    user,
    token,
    isLoggedIn,
    login,
    fetchMe,
    logout,
  };
}
