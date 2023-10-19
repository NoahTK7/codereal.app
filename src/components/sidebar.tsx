import { api } from "~/utils/api"
import { noRefreshOpts } from "./constants"
import { LoadingSpinner } from "./loading"
import { SignedIn, SignedOut } from "@clerk/nextjs"
import { GreenSignInButton } from "./layout"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime";
import { useEffect, useState } from "react"
dayjs.extend(relativeTime)

export const PersonalStats = () => {
  return (
    <>
      <SignedIn>
        <PersonalStatsContent />
      </SignedIn>
      <SignedOut>
        <GreenSignInButton />
      </SignedOut>
    </>
  )
}

const PersonalStatsContent = () => {
  const { data } = api.statistics.personal.useQuery(undefined, noRefreshOpts)
  return (
    <>
      <div className="flex flex-col justify-between px-2 py-2 h-[14rem] text-center bg-slate-100">
        <p className="text-lg font-mono font-bold">Personal Stats</p>
        {data ?
          <div className="grow pt-2 space-y-1">
            <p>Top Score: {data.highScore}</p>
            <p>Average Score: {Math.round(data.avgScore)}</p>
            <p>Questions Answered: {data.totalAnswered}</p>
          </div>
          :
          <div className="flex text-center justify-center align-middle">
            <LoadingSpinner size={40} />
          </div>
        }
        {data ? <LastUpdatedText timestamp={data.lastUpdated} /> : <p></p>}
      </div>
    </>
  )
}

const LastUpdatedText = ({ timestamp }: { timestamp: Date }) => {
  const [, setTime] = useState<Date>(new Date());

  // rerender every ~1 minute
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1005 * 60);
    return () => {
      // clear interval when component unmounted to avoid memory leak
      clearInterval(interval);
    };
  }, []);

  return (
    <p className="text-sm text-gray-500">Last updated: {dayjs(timestamp).fromNow()}</p>
  )
}

export const GlobalLeaderboard = () => {
  const { data } = api.statistics.global.useQuery(undefined, noRefreshOpts)
  return (
    <>
      <div className="flex flex-col justify-between px-8 py-2 h-[14rem] bg-slate-100 text-center">
        <p className="text-lg font-mono font-bold">Today&apos;s Leaderboard</p>
        {data ?
          <div className="grow pt-2 flex justify-center">
            <div className="text-left pl-8 pr-4">
              <ol className="list-decimal">
                {data.topFive.length == 0 && <p>No solutions yet!</p>}
                {data.topFive.map((entry, index) =>
                  <li key={index}>{entry.score} - {entry.username}</li>
                )}
              </ol>
            </div>
          </div>
          :
          <div className="flex text-center justify-center align-middle">
            <LoadingSpinner size={40} />
          </div>
        }
        {data ? <LastUpdatedText timestamp={data.lastUpdated} /> : <p></p>}
      </div>
    </>
  )
}