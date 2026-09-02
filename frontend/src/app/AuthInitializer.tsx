"use client"
import { useEffect, useState } from "react";
import api from '@/lib/axios'
import { login, logout } from '@/store/authSlice';
import { useAppDispatch, useAppSelector } from '@/store/hook';
import { useRouter, usePathname } from 'next/navigation';
import { AppLoader } from '@/components/skeletons/App-loader';
import { useDispatch } from "react-redux";
import axios from "axios";

const PROTECTED_PREFIXES = ["/dashboard"];
const AUTH_ROUTES = ["/sign-in", "/sign-up", "/verify"];

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch()
  const [checked, setChecked] = useState(false)
  useEffect(() => {
    async function checkAuth() {
      let cancelled = false
      try {
        const res = await api.get("/get-user")
        if (!cancelled) {
          dispatch(login(res.data.data))
        }
      } catch (error) {
        if (!cancelled) {
          dispatch(logout())
        }
      } finally {
        if (!cancelled) {
          setChecked(true)
        }
      }
      return () => {
        setChecked(true)
      }
    }
    checkAuth()
  }, [dispatch])
  if (!checked) {
    return null
  }
  return <>{children}</>
}

export default AuthInitializer;