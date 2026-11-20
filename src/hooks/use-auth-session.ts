"use client"

import { authClient } from "@/lib/auth-client";
import { apiRequest, getAuthToken } from "@/lib/api";
import { useEffect, useState } from "react";

type Session = NonNullable<typeof authClient.$Infer.Session> & {
  profileImage?: string | null;
};
type User = Session["user"] & {
  profileImage?: string | null;
};

interface BackendProfile {
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  profileImage: string | null;
  role: "customer" | "owner" | "admin";
  roleVersion: number;
  updatedAt: string;
}

export function useAuthSession() {
  const { data: session, isPending, error, refetch } = authClient.useSession();
  const [backendProfile, setBackendProfile] = useState<BackendProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  // Fetch backend profile when session becomes available
  useEffect(() => {
    let cancelled = false;

    async function fetchBackendProfile() {
      if (!session) {
        if (!cancelled) {
          setBackendProfile(null);
          setIsProfileLoading(false);
        }
        return;
      }

      setIsProfileLoading(true);
      try {
        const token = await getAuthToken();
        if (!token) {
          if (!cancelled) {
            setBackendProfile(null);
          }
          return;
        }

        const response = await apiRequest("/api/profile", { token });
        if (response.ok) {
          const data = await response.json();
          if (!cancelled && data.success && data.data?.profile) {
            setBackendProfile(data.data.profile);
          } else if (!cancelled) {
            setBackendProfile(null);
          }
        } else if (!cancelled) {
          setBackendProfile(null);
        }
      } catch {
        if (!cancelled) {
          setBackendProfile(null);
        }
      } finally {
        if (!cancelled) {
          setIsProfileLoading(false);
        }
      }
    }

    fetchBackendProfile();

    return () => {
      cancelled = true;
    };
  }, [session]);

  return {
    session: (session ?? null) as Session | null,
    user: (session?.user ?? null) as User | null,
    backendProfile,
    isPending: isPending || isProfileLoading,
    error,
    refetch: async () => {
      await refetch();
      // Trigger profile refetch by re-running the effect
      // The effect depends on session, which will be updated after refetch
    },
  };
}

export type { Session, User, BackendProfile };
