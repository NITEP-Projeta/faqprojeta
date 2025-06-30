import { trainingData } from "../data"
import { notFound } from "next/navigation"

export default function TrainingViewPage({ params }: { params: { slug: string } }) {
  const training = trainingData.find((t) => t.slug === params.slug)
  if (!training) return notFound()

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-4">{training.title}</h1>
      <p className="text-muted-foreground mb-6">{training.description}</p>

      {training.type === "pdf" && (
        <iframe
          src={training.file}
          className="w-full h-[80vh] border rounded-md"
          title={training.title}
        />
      )}

      {training.type === "video" && (
        <video
          controls
          className="w-full max-w-4xl rounded-lg shadow"
          src={training.file}
        />
      )}

      {training.type === "link" && (
        <a
          href={training.file}
          target="_blank"
          className="text-blue-600 underline"
        >
          Abrir curso externo
        </a>
      )}
    </div>
  )
}
