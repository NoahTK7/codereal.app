import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Head from "next/head";
import Link from "next/link";
import { createContext, useContext, type PropsWithChildren } from "react";
import { api, getBaseUrl } from "~/utils/api";
import { useTimer } from "react-timer-hook";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { noRefreshOpts, skipBatchOpts } from "./utils/constants";
import { GlobalLeaderboard, PersonalStats } from "./sidebar";
import { MetaHeadEmbed } from "@phntms/react-share";
import { type ClientFeatureToggleState } from "~/server/api/routers/state";
import { type PublicQuestionInfo } from "~/server/helpers/filter";
import { LoadingSpinner } from "./utils/loading";

const Account = () => {
  return (
    <>
      <SignedIn>
        <UserButton
          appearance={{
            elements: {
              userButtonAvatarBox: {
                width: 56,
                height: 56
              }
            }
          }}
          afterSignOutUrl="/"
        />
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
  const utils = api.useUtils()
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
      await utils.question.status.invalidate()
      await utils.globalState.getLatestQuestion.invalidate()
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

export type GlobalState = {
  todaysQuestion: PublicQuestionInfo,
  featureToggles: ClientFeatureToggleState
}
export const GlobalStateContext = createContext<GlobalState>({} as GlobalState)

export const GlobalStateProvider = (props: PropsWithChildren) => {
  const {
    data: questionState,
    isLoading: questionStateLoading,
    isError: isQuestionStateError
  } = api.globalState.getLatestQuestion.useQuery(undefined, {
    ...noRefreshOpts,
    ...skipBatchOpts
  })
  const {
    data: toggleState,
    isLoading: toggleStateLoading,
    isError: isToggleStateError
  } = api.globalState.getFeatureToggles.useQuery(undefined, {
    ...noRefreshOpts,
    ...skipBatchOpts
  })

  if (questionStateLoading || toggleStateLoading) return (
    <GlobalStateContext.Provider value={{} as GlobalState}>
      <PageLayout>
        <div className="flex justify-center"><LoadingSpinner size={48} /></div>
      </PageLayout>
    </GlobalStateContext.Provider>
  )

  if (isQuestionStateError || isToggleStateError) return (
    <GlobalStateContext.Provider value={{} as GlobalState}>
      <PageLayout>
        <p>Could not connect to backend service.Please refresh the page.</p>
      </PageLayout>
    </GlobalStateContext.Provider>
  )

  const globalState: GlobalState = {
    todaysQuestion: questionState,
    featureToggles: toggleState
  }

  return (
    <GlobalStateContext.Provider value={globalState}>
      <PageLayout>
        {props.children}
      </PageLayout>
    </GlobalStateContext.Provider>
  )
}

export const PageLayout = (props: PropsWithChildren) => {
  const globalState = useContext(GlobalStateContext)
  const { data: globalStats } = api.statistics.global.useQuery(undefined, {
    ...noRefreshOpts,
    refetchInterval: 1000 * 60 * 5 // 5 minutes
  })

  return (
    <>
      <Head>
        <MetaHeadEmbed
          render={(meta: React.ReactNode) => <>{meta}</>}
          siteTitle="CodeReal"
          titleTemplate="[siteTitle]"
          description="Daily coding question. Created by Noah Kurrack."
          baseSiteUrl={getBaseUrl()}
          keywords={["daily", "coding", "question"]}
          imageUrl={`${getBaseUrl()}/codereal-og-preview.png`}
          imageWidth={2400}
          imageHeight={1260}
          imageAlt="CodeReal preview"
          twitter={{
            cardSize: "large",
            siteUsername: "@noahtk7",
            creatorUsername: "@noahtk7",
          }}
        />
        <title>CodeReal - Daily coding question</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex flex-col min-h-screen">
        <nav className="bg-slate-200">
          <div className="mx-auto px-2 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="flex flex-1 items-center justify-start sm:items-stretch space-x-4">
                <div className="flex flex-shrink-0 items-center">
                  <Link href="/" className="text-gray-700 hover:bg-slate-300 hover:text-gray-800 rounded-md px-3 py-2 text-xl font-mono font-bold" >CodeReal</Link>
                </div>
                <div className="flex space-x-4 items-center">
                  <Link href="/past-questions" className="text-gray-700 hover:bg-slate-300 hover:text-gray-800 rounded-md px-3 py-2 text-sm font-small">Past Questions</Link>
                </div>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                <Account />
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
          <div className="px-4 py-2 font-mono flex justify-center">
            <div className="text-center">
              {globalState && globalStats ? (
                <>
                  <span>{globalStats.numAnswered} people have solved today&apos;s question.  </span>
                  <QuestionCountDown expTimestamp={globalState.todaysQuestion.questionExp} />
                </>
              )
                : 'Loading...'}
            </div>
          </div>
          <div className="px-4 py-2 flex justify-center">
            <div>
              <p className="align-middle">Copyright © {new Date().getFullYear()} <a
                href="https://www.linkedin.com/in/noahkurrack/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >Noah Kurrack</a>. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
