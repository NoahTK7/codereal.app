import { PageLayout } from "~/components/layout";
import { api } from "~/utils/api";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { LoadingSpinner } from "~/components/loading";
import { QuestionHandler } from "~/components/question";
import { noRefreshOpts } from "~/components/constants";

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

const SignedInHome = () => {
  const {
    data: personalStatusData,
    isLoading: isPersonalStatusLoading,
    isError: isPersonalStatusError
  } = api.status.personal.useQuery(undefined, noRefreshOpts)

  if (isPersonalStatusError) return <p>Could not connect to backend service.</p>

  if (isPersonalStatusLoading) return <div className="flex justify-center"><LoadingSpinner size={48} /></div>

  // TODO: use suspense boundary (?)
  return <QuestionHandler {...personalStatusData} />
}

export default function HomePage() {

  return (
    <>
      <PageLayout>
        <div className="space-y-4">
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
