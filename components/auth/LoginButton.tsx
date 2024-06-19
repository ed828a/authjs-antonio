"use client"
import { useRouter } from 'next/navigation'
import React, { ReactNode } from 'react'

type Props = {
    children: ReactNode,
    mode?: "modal" | "redirect",
    asChild?: boolean
}

const LoginButton = ({children, mode = "redirect", asChild}: Props) => {
    const router = useRouter()

    const onClick = () => {
        router.push("/auth/login")
    }

    if(mode==="modal"){
        return (
            <span>
                todo: implement modal
            </span>
        )
    }
  return (
    <span className='cursor-pointer' onClick={onClick}>{children}</span>
  )
}

export default LoginButton