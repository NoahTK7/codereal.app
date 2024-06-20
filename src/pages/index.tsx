import { useContext } from "react";
import { GlobalStateContext } from "~/components/layout";

import { QuestionHandler } from "~/components/question";


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

export default function HomePage() {
  const globalState = useContext(GlobalStateContext)

  return (
    <div className="space-y-4">
      <Description />
      <hr />
      <p className="text-xl font-mono font-bold px-2">Today&apos;s Question</p>
      <QuestionHandler {...globalState.todaysQuestion} />
    </div>
  )
}
