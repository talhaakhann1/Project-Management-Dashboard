// "use client";

// import { useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useAppSelector } from "@/store/hook";
// import { AppLoader } from "@/components/skeletons/App-loader";

// export default function AuthLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const { loading, isLoggedIn } = useAppSelector(
//     (state) => state.auth
//   );

//   const router = useRouter();

//   useEffect(() => {
//     if (!loading && isLoggedIn) {
//       router.replace("/dashboard");
//     }
//   }, [loading, isLoggedIn]);

//   if (loading) {
//     return <AppLoader />;
//   }

//   if (isLoggedIn) {
//     return ;
//   }

//   return <>{children}</>;
// }