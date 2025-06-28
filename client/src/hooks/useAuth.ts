import { useQuery } from "@tanstack/react-query";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    queryFn: () =>
      fetch("/api/auth/user", { credentials: "include" }).then(res => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      }),
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}


// import { useQuery } from "@tanstack/react-query";

// export function useAuth() {
//   const { data: user, isLoading } = useQuery({
//     queryKey: ["/api/auth/user"],
//     retry: false,
//   });

//   return {
//     user,
//     isLoading,
//     isAuthenticated: !!user,
//   };
// }
