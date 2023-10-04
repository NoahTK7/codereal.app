import ReactCodeMirror from "@uiw/react-codemirror"
import { useState } from "react"
import { useStopwatch } from "react-timer-hook"
import { api } from "~/utils/api"
import { noRefreshOpts, codeEditorExtensions, codeEditorTheme } from "./constants"
import { SubmissionDisplay } from "./submission"
import { type PersonalStatusData } from "~/server/api/routers/status"
import toast from "react-hot-toast"

const Question = ({ questionId }: { questionId: number }) => {
  const { data, isLoading, isError } = api.question.get.useQuery({ id: questionId }, noRefreshOpts)
  const { mutate: submitQuestion, isLoading: submitting } = api.submission.submit.useMutation({
    onSuccess: () => {
      toast.success('Your submission was recorded!')
      void ctx.status.personal.invalidate()
      void ctx.submission.invalidate(undefined, {
        type: 'all' // refresh queries on other pages
      })
    },
    onError: (error) => {
      toast.error(`An error occured: ${error.message}`)
    }
  })
  const [code, setCode] = useState<string>("")
  const ctx = api.useContext()

  if (isLoading) return <p>Question loading...</p>

  if (isError) return <p>Question could not be loaded. Please refresh the page.</p>

  const initialValue = data.funcSignature + ' {\n  \n}'
  if (code == "") setCode(initialValue)

  return (
    <div>
      <p className="text-xl mb-4">Question #{data.id}</p>
      <p>{data.questionDescription}</p>
      <ReactCodeMirror
        value={code}
        extensions={codeEditorExtensions}
        autoFocus={true}
        readOnly={submitting}
        theme={codeEditorTheme}
        onChange={(value, _update) => {
          setCode(value)
        }}
        className="shadow-xl mt-4"
      />
      <button
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline-green active:bg-green-800 ease-out duration-300 mt-8"
        type="submit"
        onClick={() => submitQuestion({ questionId, code })}
        disabled={submitting}
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

export const QuestionHandler = (props: PersonalStatusData) => {
  const ctx = api.useContext()
  const { mutate: startQuestion, isLoading: isQuestionLoading } = api.question.start.useMutation({
    onSuccess: () => {
      void ctx.status.personal.invalidate()
    },
    onError: (error) => {
      toast.error(`An error occured: ${error.message}`)
    }
  })

  if (props.isCompleted) {
    return (
      <>
        <p>You&apos;ve already completed today&apos;s challenge!</p>
        {props.submissionId
          ? <SubmissionDisplay id={props.submissionId} />
          : <p>There was an error retrieving your submission.</p>}
      </>
    )
  }

  if (props.isStarted) {
    return (
      <div className="px-2 py-2 space-y-4">
        <p className="text-xl font-mono font-bold">Today&apos;s Question (#{props.questionId})</p>
        <Question questionId={props.questionId} />
        {props.startTime && <p>Elapsed time: <ElapsedTimeCounter startTime={props.startTime} /></p>}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p>Click button to start today&apos;s question (#{props.questionId})!</p>
      <button
        disabled={isQuestionLoading}
        onClick={(_e) => startQuestion({ questionId: props.questionId })}
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline-green active:bg-green-800 ease-out duration-300"
      >
        Start!
      </button>
    </div>
  )
}
