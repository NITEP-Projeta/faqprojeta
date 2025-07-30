"use client"

import { useEffect, useRef } from "react"

export default function CursorBall() {
  const ballRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ball = ballRef.current
    const move = (e: MouseEvent) => {
      if (ball) {
        ball.style.left = e.clientX + "px"
        ball.style.top = e.clientY + "px"
      }
    }

    // Esconde o cursor nativo apenas quando este componente está renderizado
    document.body.classList.add("hide-native-cursor")
    document.addEventListener("mousemove", move)

    return () => {
      document.body.classList.remove("hide-native-cursor")
      document.removeEventListener("mousemove", move)
    }
  }, [])

  return (
    <div
      ref={ballRef}
      className="fixed z-50 w-4 h-4 bg-primary rounded-full pointer-events-none transition-all duration-150 ease-out"
      style={{ transform: "translate(-50%, -50%)" }}
    />
  )
}
