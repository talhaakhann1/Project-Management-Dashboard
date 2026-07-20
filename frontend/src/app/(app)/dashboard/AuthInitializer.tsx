"use client"
import api from '@/lib/axios'
import { login, logout } from '@/store/authSlice';
import { useAppDispatch } from '@/store/hook';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { DashboardContentSkeleton } from '@/components/skeletons/dashboard-content-skeleton';

function AuthInitializer({ children }:
    { children: React.ReactNode }) {
    const dispatch = useAppDispatch();
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    useEffect(() => {
        let isMounted = true;

        async function reloadUser() {
            try {
                const res = await api.get("/api/auth/get-user")
                if (!isMounted) return;
                dispatch(login(res.data.data))
            } catch (error) {
                if (!isMounted) return;
                if (axios.isAxiosError(error)) {
                    if (error.response?.status === 401) {
                        dispatch(logout());
                    } else {
                        console.error(error.response?.data);
                    }
                } else {
                    console.error(error);
                }
            } finally {
                if (isMounted) setIsCheckingAuth(false);
            }
        }
        reloadUser()

        return () => {
            isMounted = false;
        }
    }, [dispatch])

    if (isCheckingAuth) {
        return <DashboardContentSkeleton />
    }

    return (
        <>
            {children}
        </>
    )
}


export default AuthInitializer