"use client"

import Link from "next/link"
import { trainingData } from "./data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function TrainingListPage() {
  return (
  <div className="flex items-start justify-center min-h-screen bg-gray-50">
    <div className="container py-10 text-center">
      <h1 className="text-3xl font-bold mb-2">📚 Treinamentos</h1>
      <p className="text-gray-600 mb-8">Escolha um dos treinamentos disponíveis abaixo.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
        {trainingData.map((item) => (
          <Card key={item.slug} className="hover:shadow-md transition">
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/training/${item.slug}`}>
                <Button className="border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-100 transition" variant="outline">Acessar</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </div>
  )
}
