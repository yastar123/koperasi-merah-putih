import { createContext, useContext, ReactNode } from "react";
import { useGetMe, useLogin, useLogout, User, LoginInput } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null | undefined;
  isLoading: boolean;
  login: (data: LoginInput) => void;
  logout: () => void;
  isLoggingIn: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: user, isLoading: isUserLoading, refetch } = useGetMe({
    query: {
      retry: false,
    }
  });

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (res) => {
        refetch().then((me) => {
          const role = me.data?.role;
          if (role === "super_admin") setLocation("/super-admin/dashboard");
          else if (role === "pengurus") setLocation("/pengurus/dashboard");
          else if (role === "pengawas") setLocation("/pengawas/dashboard");
          else if (role === "anggota") setLocation("/anggota/dashboard");
          else if (role === "operator_unit") setLocation("/operator/dashboard");
          else setLocation("/");
        });
      },
      onError: (err: any) => {
        toast({
          title: "Gagal Login",
          description: err.message || "Username atau password salah",
          variant: "destructive",
        });
      }
    }
  });

  const logoutMutation = useLogout({
    mutation: {
      onSuccess: () => {
        refetch();
        setLocation("/login");
      }
    }
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: isUserLoading,
        login: (data) => loginMutation.mutate({ data }),
        logout: () => logoutMutation.mutate(undefined),
        isLoggingIn: loginMutation.isPending,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
