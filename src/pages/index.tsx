import ReactCodeMirror from "@uiw/react-codemirror";
import { javascript } from '@codemirror/lang-javascript';
import { noctisLilac } from '@uiw/codemirror-theme-noctis-lilac'
import { useState } from "react";
import { PageLayout } from "~/components/PageLayout";
import { api } from "~/utils/api";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import type { PersonalStatusData } from "~/server/api/routers/status";
import { LoadingSpinner } from "~/components/loading";

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
const extensions = [javascript()]

const Description = () => {
  return (
    <div className="grid grid-cols-1 px-2 py-2 space-y-4">
      <p className="text-2xl font-mono font-bold">Welcome to CodeReal!</p>
      <p className="text-xl">Your task is to implement a short function in javascript according to the specifications.</p>
      <p className="text-xl">Your solution will be scored based on 4 factors:</p>
      <ul className="px-4 list-disc">
        <li>Accuracy - Your function returns the correct result for several hidden test cases</li>
        <li>Solve time - How long it takes for you to submit your solution from when you begin the challenge</li>
        <li>Code length - How many characters your code contains</li>
        <li>Speed - How long your code takes to execute</li>
      </ul>
      <p>Note: You only get to submit your code once, so make sure you double check your solution!</p>
    </div>
  )
}

type SubmissionProps = {
  id: number
}
const Submission = ({ id }: SubmissionProps) => {
  const { data, isLoading, isError } = api.submission.get.useQuery({ id })

  if (isLoading) return <LoadingSpinner />

  if (isError) return <p>There was an error retrieving your submission.</p>

  return (
    <div>
      {JSON.stringify(data)}
    </div>
  )
}

const Question = () => {
  const { data, isLoading, isError } = api.question.get.useQuery()
  const { mutate: submitQuestion, isLoading: submitting } = api.submission.submit.useMutation({
    onSuccess: () => {
      void ctx.status.personal.invalidate()
    },
    onError: () => {
      // TODO: send error toast
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
      <p>{data.questionDescription}</p>

      <ReactCodeMirror
        value={code}
        extensions={extensions}
        autoFocus={true}
        readOnly={submitting}
        theme={noctisLilac}
        onChange={(value, _update) => {
          setCode(value)
        }}
        className="shadow-xl mt-4"
      />
      <button
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline-green active:bg-green-800 ease-out duration-300 mt-8"
        type="submit"
        onClick={() => submitQuestion({ code })}
        disabled={submitting}
      >
        Submit
      </button>
    </div>
  )
}

const ChallengeHandler = (props: PersonalStatusData) => {
  const ctx = api.useContext()
  const { mutate: startQuestion, isLoading: isQuestionLoading } = api.question.start.useMutation({
    onSuccess: () => {
      void ctx.status.personal.invalidate()
    },
    onError: () => {
      // TODO: send error toast
    }
  })

  if (props.completed.status) {

    return (
      <>
        <p>You&apos;ve already completed today&apos;s challenge!</p>
        {props.completed.submissionId
          // TODO: display submission component
          ? <Submission id={props.completed.submissionId} />
          : <p>There was an error retrieving your submission.</p>}
      </>
    )
  }

  if (props.started.status) {
    return (
      <div className="px-2 py-2 space-y-4">
        <p className="text-large font-mono font-bold">Today&apos;s Challenge</p>
        <Question />
        {/* TODO: counter/time that counts up from start time in real time */}
        {props.started.startTime && <p>Elapsed time: {props.started.startTime.toISOString()}</p>}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p>Click button to start today&apos;s challenge!</p>
      <button
        disabled={isQuestionLoading}
        onClick={(_e) => startQuestion()}
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline-green active:bg-green-800 ease-out duration-300"
      >
        Start!
      </button>
    </div>
  )
}

const SignedInHome = () => {
  const {
    data: personalStatusData,
    isLoading: isPersonalStatusLoading,
    isError: isPersonalStatusError
  } = api.status.personal.useQuery()
  return (
    <>
      {isPersonalStatusError && <p>Could not connect to backend service.</p>}
      {isPersonalStatusLoading && <p>Connecting to backend service...</p>}
      {personalStatusData && <ChallengeHandler {...personalStatusData} />}
    </>
  )
}

export default function Home() {

  return (
    <>
      <PageLayout>
        <div className="px-4 lg:px-16 py-4 lg:py-8 space-y-4">
          <Description />
          <hr />
          <SignedIn>
            <SignedInHome />
          </SignedIn>
          <SignedOut>
            <div className="px-2 py-2 space-y-4">
              <p>Sign in to get started!</p>
              <div className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline-green active:bg-green-800 ease-out duration-300">
                <SignInButton />
              </div>

            </div>
          </SignedOut>
        </div>
      </PageLayout>
    </>
  );
}
