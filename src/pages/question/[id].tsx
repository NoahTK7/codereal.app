import { useRouter } from "next/router";
import { LoadingSpinner } from "~/components/loading";
import { QuestionHandler } from "~/components/question";
import { api } from "~/utils/api";


export default function QuestionPage() {
  const router = useRouter()

  if (!router.query.id || typeof router.query.id !== "string") {
    return <></>
  }

  const questionId = parseInt(router.query.id)
  const { data, isLoading, isError } = api.question.getPublic.useQuery({ id: questionId })

  if (isError) return <p>Error loading question</p>
  if (isLoading) return <div className="flex justify-center"><LoadingSpinner size={48} /></div>

  return (
    <>
      {/* // TODO: breadcrumbs */}
      <QuestionHandler {...data} />
    </>

  )
}
