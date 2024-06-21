import ReactCodeMirror from "@uiw/react-codemirror"
import { useState } from "react"
import { useStopwatch } from "react-timer-hook"
import { api } from "~/utils/api"
import { noRefreshOpts, codeEditorExtensions, codeEditorTheme } from "./utils/constants"
import { SubmissionDisplay } from "./submission"
import toast from "react-hot-toast"
import { useAuth } from "@clerk/nextjs"
import { GreenSignInButton } from "./layout"
import { LoadingSpinner } from "./utils/loading"
import { type PublicQuestionInfo } from "~/server/helpers/filter"

const Question = ({ questionId }: { questionId: number }) => {
  const [isSubmitTimeout, setIsSubmitTimeout] = useState(false)
  const { data, isLoading, isError } = api.question.getPrivate.useQuery({ id: questionId }, noRefreshOpts)
  const { mutate: submitQuestion, isLoading: isSubmitLoading } = api.submission.submit.useMutation({
    onSuccess: (data) => {
      if (data.error) {
        toast.error(data.errorMessage ?? 'unknown error', {
          duration: 5000
        })
        return
      }
      toast.success('Your submission was recorded!')
      void utils.question.status.invalidate()
      void utils.question.getInfinite.invalidate(undefined, {
        type: 'all' // refresh queries on other pages
      })
      void utils.submission.invalidate(undefined, {
        type: 'all' // refresh queries on other pages
      })
      void utils.statistics.invalidate() // not needed if updating stats becomes async
    },
    onError: (error) => {
      toast.error(`An error occured: ${error.message}`)
    },
    onSettled: () => {
      setTimeout(() => setIsSubmitTimeout(false), 5000) // 5 second cooldown after submitting
    }
  })
  const [code, setCode] = useState<string>("")
  const utils = api.useUtils()

  if (isLoading) return <p>Question loading...</p>

  if (isError) return <p>Question could not be loaded. Please refresh the page.</p>

  const initialValue = data.signature + ' {\n  \n}'
  if (code == "") setCode(initialValue)

  return (
    <div>
      <p>{data.description}</p>
      <ReactCodeMirror
        value={code}
        extensions={codeEditorExtensions}
        autoFocus={true}
        readOnly={isSubmitLoading}
        theme={codeEditorTheme}
        maxHeight="8rem"
        onChange={(value, _update) => {
          setCode(value)
        }}
        className="shadow-xl mt-4"
      />
      <button
        className="bg-green-600 hover:bg-green-700 disabled:bg-slate-300 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline-green active:bg-green-800 ease-out duration-300 mt-8"
        type="submit"
        onClick={() => {
          setIsSubmitTimeout(true)
          submitQuestion({ questionId, code })
        }}
        disabled={isSubmitTimeout}
      >
        Submit
      </button>
    </div>
  )
}

const ElapsedTimeCounter = ({ startTime }: { startTime: Date }) => {
  const currentTime = new Date()
  const offsetMilliseconds = currentTime.getTime() - startTime.getTime()
  const offsetTimestamp = new Date()
  offsetTimestamp.setTime(currentTime.getTime() + offsetMilliseconds)

  const {
    seconds,
    minutes,
    hours
  } = useStopwatch({ autoStart: true, offsetTimestamp: offsetTimestamp });

  return (
    <span>{hours}h {minutes}m {seconds}s</span>
  )
}

export const QuestionHandler = (questionInfo: PublicQuestionInfo) => {
  const { isSignedIn } = useAuth()

  if (!isSignedIn) {
    return (
      <div className="px-2 py-2 space-y-4">
        <p className="text-xl mb-4">Question #{questionInfo.questionNum}: {questionInfo.questionTitle}</p>
        <p>Sign in to get started!</p>
        <GreenSignInButton />
      </div>
    )
  }

  return <QuestionSignedIn {...questionInfo} />
}

const QuestionSignedIn = (questionInfo: PublicQuestionInfo) => {
  const {
    data: questionStatus,
    isLoading: isQuestionStatusLoading,
    isError: isQuestionStatusError
  } = api.question.status.useQuery({ id: questionInfo.questionId }, noRefreshOpts)
  const utils = api.useUtils()
  const { mutate: startQuestion, isLoading: isQuestionLoading } = api.question.start.useMutation({
    onSuccess: () => {
      void utils.question.status.invalidate()
    },
    onError: (error) => {
      toast.error(`An error occured: ${error.message}`)
    }
  })

  if (isQuestionStatusError) return <p>Error</p>

  if (isQuestionStatusLoading) return <div className="flex justify-center"><LoadingSpinner size={48} /></div>

  if (questionStatus.isCompleted) {
    return (
      <div className="px-2 py-2 space-y-4">
        <p className="text-xl mb-4">Question #{questionInfo.questionNum}: {questionInfo.questionTitle}</p>
        <p>You&apos;ve already completed this question!</p>
        {questionStatus.submissionId
          ? <SubmissionDisplay id={questionStatus.submissionId} />
          : <p>There was an error retrieving your submission.</p>}
      </div>
    )
  }

  if (questionStatus.isStarted) {
    return (
      <div className="px-2 py-2 space-y-4">
        <p className="text-xl mb-4">Question #{questionInfo.questionNum}: {questionInfo.questionTitle}</p>
        <Question questionId={questionStatus.questionId} />
        {questionStatus.startTime && <p>Elapsed time: <ElapsedTimeCounter startTime={questionStatus.startTime} /></p>}
      </div>
    )
  }

  return (
    <>
      <div className="px-2 py-2 space-y-4">
        <p className="text-xl mb-4">Question #{questionInfo.questionNum}: {questionInfo.questionTitle}</p>
        <p>Click the button to start this question:</p>
        <button
          disabled={isQuestionLoading}
          onClick={(_e) => startQuestion({ questionId: questionStatus.questionId })}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline-green active:bg-green-800 ease-out duration-300"
        >
          Start!
        </button>
      </div>
    </>
  )
}
