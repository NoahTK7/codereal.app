import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Head from "next/head";
import Link from "next/link";
import { type PropsWithChildren } from "react";
import { api } from "~/utils/api";
import { LinkedInLogoIcon } from '@radix-ui/react-icons';

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

export const PageLayout = (props: PropsWithChildren) => {
  const globalStatus = api.status.global.useQuery(undefined, {
    staleTime: 1000 * 60 // 1 minute
  })

  // TODO: add timeout to send toast when question changes (based on time returned by status.global)

  return (
    <>
      <Head>
        <title>CodeReal</title>
        <meta name="description" content="CodeReal, created by Noah Kurrack" />
        {/* TODO: fix favicon */}
        <link rel="icon" href="/favicon.ico" />
        {/* TODO: add more metadata, specifically opengraph vals */}
      </Head>

      <div className="flex flex-col min-h-screen">
        <nav className="bg-slate-200">
          <div className="mx-auto max-w-7xl px-2 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="flex flex-1 items-center justify-start sm:items-stretch space-x-4">
                <div className="flex flex-shrink-0 items-center">
                  <Link href="/" className="text-gray-700 hover:bg-slate-300 hover:text-gray-800 rounded-md px-3 py-2 text-xl font-large font-mono font-bold" >CodeReal</Link>
                </div>
                <div className="flex space-x-4 items-center">
                  <Link href="/past-submissions" className="text-gray-700 hover:bg-slate-300 hover:text-gray-800 rounded-md px-3 py-2 text-sm font-small">Past Submissions</Link>
                </div>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                <div className="relative ml-3">
                  <Account />
                </div>
              </div>
            </div>
          </div>
        </nav>

        <main className="flex-grow lg:w-3/4">
          <div className="px-4 lg:px-16 py-4 lg:py-8">
            {props.children}
          </div>
        </main>
        {/* TODO: add leaderboard and stats sidebar */}

        <footer className="grid grid-cols-1 divide-y divide-slate-400 bg-slate-200 text-gray-800">
          <div className="flex justify-center ">
            <div className="max-w-7xl px-4 py-2 font-mono">
              {globalStatus.data ? `${globalStatus.data.numAnswered} people have solved todays question.` : 'Loading...'}
            </div>
            {/* TODO: calculate time til next question */}
          </div>
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
