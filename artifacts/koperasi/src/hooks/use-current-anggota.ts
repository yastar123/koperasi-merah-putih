import { useAuth } from "@/hooks/use-auth";
import { useListAnggota } from "@workspace/api-client-react";

export function useCurrentAnggota() {
  const { user } = useAuth();

  const { data, isLoading, error } = useListAnggota(
    { userId: user?.id ?? undefined },
    { query: { queryKey: [], enabled: !!user?.id } }
  );

  const anggota = data?.[0] ?? null;

  return {
    anggota,
    anggotaId: anggota?.id ?? null,
    isLoading,
    error,
  };
}
