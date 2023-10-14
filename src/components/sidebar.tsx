
export const PersonalStats = () => {
  return (
    <>
      <div className="flex flex-col justify-between px-2 py-2 h-[14rem] text-center bg-slate-100">
        <p className="text-lg font-mono font-bold">Personal Stats</p>
        <div className="grow pt-2 space-y-1">
          <p>Top Score: 999</p>
          <p>Average Score: 678</p>
          <p>Questions Answered: 4</p>
        </div>
        <p className="text-sm text-gray-500">Last updated: 10 mins ago</p>
      </div>
    </>
  )
}

export const GlobalLeaderboard = () => {
  return (
    <>
      <div className="flex flex-col justify-between px-8 py-2 h-[14rem] bg-slate-100 text-center">
        <p className="text-lg font-mono font-bold">Today&apos;s Leaderboard</p>
        <div className="grow pt-2 flex justify-center">
          <div className="text-left pl-8 pr-4">
            <ol className="list-decimal">
              <li>999 - Noah</li>
              <li>987 - Jay</li>
              <li>876 - Michael</li>
              <li>800 - James</li>
              <li>777 - Josh</li>
            </ol>
          </div>
        </div>
        <p className="text-sm text-gray-500">Last updated: 10 mins ago</p>
      </div>
    </>
  )
}
