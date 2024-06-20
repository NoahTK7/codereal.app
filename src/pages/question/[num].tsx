import { useRouter } from "next/router";
import { LoadingSpinner } from "~/components/loading";
import { QuestionHandler } from "~/components/question";
import { api } from "~/utils/api";


export default function QuestionPage() {
  const router = useRouter()

  if (!router.query.num || typeof router.query.num !== "string") {
    return <></>
  }

  const questionNum = parseInt(router.query.num)
  const { data, isLoading, isError } = api.question.getPublic.useQuery({ num: questionNum })

  if (isError) return <p>Error loading question</p>
  if (isLoading) return <div className="flex justify-center"><LoadingSpinner size={48} /></div>

  return (
    <QuestionHandler {...data} />
  )
}
