"use client"

import Link from "next/link"
import { trainingData } from "./data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function TrainingListPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">📚 Treinamentos</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainingData.map((item) => (
          <Card key={item.slug} className="hover:shadow-md transition">
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/training/${item.slug}`}>
                <Button variant="outline">Acessar</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
