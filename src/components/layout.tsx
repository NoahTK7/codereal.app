import { SignInButton, SignedIn, SignedOut, UserButton, useAuth } from "@clerk/nextjs";
import Head from "next/head";
import Link from "next/link";
import { type PropsWithChildren } from "react";
import { api } from "~/utils/api";
import { LinkedInLogoIcon } from '@radix-ui/react-icons';
import { useTimer } from "react-timer-hook";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { noRefreshOpts } from "./constants";
import { GlobalLeaderboard, PersonalStats } from "./sidebar";

const Account = () => {
  return (
    <>
      <SignedIn>
        <UserButton appearance={{
          elements: {
            userButtonAvatarBox: {
              width: 56,
              height: 56
            }
          }
        }} />
      </SignedIn>
      <SignedOut>
        <SignInButton />
      </SignedOut>
    </>
  )
}

export const GreenSignInButton = () => {
  return (
    <>
      <div className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline-green active:bg-green-800 ease-out duration-300">
        <SignInButton />
      </div>
    </>
  )
}

const QuestionCountDown = ({ expTimestamp }: { expTimestamp: Date }) => {
  const ctx = api.useContext()
  const router = useRouter()

  const displayNewQuestionAvailable = () => {
    toast.dismiss()
    toast((t) => (
      <span>
        A new question is available.
        <div className="flex justify-center mt-1 sm:inline sm:mt-0">
          <button
            onClick={() => void loadNewQuestion(t.id)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold ml-2 p-1 rounded focus:outline-none focus:shadow-outline-green active:bg-green-800 ease-out duration-300"
          >
            Go!
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-slate-200 text-gray-800 ml-2 p-1 rounded"
          >
            Dismiss
          </button>
        </div>
      </span>
    ), {
      duration: Infinity,
      style: { minWidth: "360px" }
    })

    const loadNewQuestion = async (tId: string) => {
      await ctx.status.invalidate()
      toast.dismiss(tId)
      router.push("/")
    }
  }

  const remainingTime = useTimer({
    expiryTimestamp: expTimestamp,
    autoStart: false,
    onExpire: displayNewQuestionAvailable
  })

  setTimeout(() => {
    if (expTimestamp.getTime() - new Date().getTime() > 1000 * 5)
      remainingTime.restart(expTimestamp)
  }, 1000)

  return <span>Next question in {`${remainingTime.hours}h ${remainingTime.minutes}m ${remainingTime.seconds}s`}.</span>
}

export const PageLayout = (props: PropsWithChildren) => {
  const { isSignedIn } = useAuth()
  const { data: globalStatus } = api.status.global.useQuery(undefined, noRefreshOpts)
  const { data: globalStats } = api.statistics.global.useQuery(undefined, {
    ...noRefreshOpts,
    refetchInterval: 1000 * 60 * 5 // 5 minutes
  })

  return (
    <>
      <Head>
        <title>CodeReal</title>
        <meta name="description" content="CodeReal, created by Noah Kurrack" />
        {/* TODO: replace favicon */}
        <link rel="icon" href="/favicon.ico" />
        {/* TODO: add more metadata, specifically opengraph vals */}
      </Head>

      <div className="flex flex-col min-h-screen">
        <nav className="bg-slate-200">
          <div className="mx-auto max-w-7xl px-2 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="flex flex-1 items-center justify-start sm:items-stretch space-x-4">
                <div className="flex flex-shrink-0 items-center">
                  <Link href="/" className="text-gray-700 hover:bg-slate-300 hover:text-gray-800 rounded-md px-3 py-2 text-xl font-mono font-bold" >CodeReal</Link>
                </div>
                {isSignedIn &&
                  <div className="flex space-x-4 items-center">
                    <Link href="/past-submissions" className="text-gray-700 hover:bg-slate-300 hover:text-gray-800 rounded-md px-3 py-2 text-sm font-small">Past Submissions</Link>
                  </div>
                }
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                <div className="relative ml-3">
                  <Account />
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="grow flex flex-wrap">
          <div className="flex-grow lg:w-3/4">
            <div className="px-4 lg:px-16 py-4 lg:py-8">
              {props.children}
            </div>
          </div>
          <div className="flex-grow lg:w-1/4">
            <div className="sticky top-0 px-12 lg:pl-0 lg:pr-8 py-12 lg:py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 max-sm:space-y-4 sm:max-lg:space-x-4 lg:space-y-4">
              <GlobalLeaderboard />
              <PersonalStats />
            </div>
          </div>
        </main>

        <footer className="grid grid-cols-1 divide-y divide-slate-400 bg-slate-200 text-gray-800">
          <div className="flex justify-center ">
            <div className="max-w-7xl px-4 py-2 font-mono">
              {globalStatus && globalStats ? (
                <>
                  <span>{globalStats.numAnswered} people have solved today&apos;s question.  </span>
                  <QuestionCountDown expTimestamp={globalStatus.questionExpiration} />
                </>
              )
                : 'Loading...'}
            </div>
          </div>
          {/* TODO: share link button (copy to clipboard/) */}
          <div className="flex justify-between">
            <div className="max-w-7xl px-4 py-2 justify-left">
              <p className="align-middle">© 2023 Noah Kurrack. All rights reserved.</p>
            </div>
            <div className="max-w-7xl px-4 py-2 justify-right items-center">
              <div className="hover:bg-white duration-200 px-1 py-1 rounded-sm">
                <a
                  href="https://www.linkedin.com/in/noahkurrack/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <LinkedInLogoIcon height={20} width={20} />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
