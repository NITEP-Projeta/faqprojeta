import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type Props = {
  title: string
  description: string
  href: string
}

export default function TrainingCard({ title, description, href }: Props) {
  return (
    <Card className="hover:shadow-lg transition">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <a href={href} target="_blank" className="text-blue-600 hover:underline">
          Acessar conteúdo
        </a>
      </CardContent>
    </Card>
  )
}
