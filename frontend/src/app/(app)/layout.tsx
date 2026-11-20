import type { Metadata } from "next";
import AuthInitializer from "../AuthInitializer";


export default function ExploreLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <>
        <AuthInitializer>        
                {children}
        </AuthInitializer>
    </>;
}