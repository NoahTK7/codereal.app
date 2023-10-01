import ReactCodeMirror from "@uiw/react-codemirror";
import { type RouterOutputs } from "~/utils/api";
import { codeEditorExtensions, codeEditorTheme } from "./constants";
import { useCollapse } from "react-collapsed";
import { ChevronDownIcon, ChevronRightIcon } from "@radix-ui/react-icons";

type SubmissionItem = RouterOutputs['submission']['getInfinite']['submissions'][number]
export const Submission = ({ data, solo }: { data: SubmissionItem, solo: boolean }) => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { getCollapseProps, getToggleProps, isExpanded } = useCollapse({
    defaultExpanded: solo
  })

  const statusColors = {
    ERROR: "text-rose-700",
    TIMEOUT: "text-rose-700",
    INCORRECT: "text-yellow-500",
    CORRECT: "text-emerald-600",
    UNKNOWN: "text-slate-500"
  };
  const statusColor = statusColors[data.runResult] || "";

  return (
    <div className="space-y-4 py-4 px-2">
      <div {...getToggleProps()} className="flex justify-between">
        <p className="space-x-2 inline-block"><span className="text-xl">Question #{data.questionId} Submission</span> <span className={`font-bold text-md ${statusColor}`}>({data.runResult})</span></p>
        {!solo &&
          <div className="flex-right">
            {isExpanded ? <ChevronDownIcon height={24} width={24} /> : <ChevronRightIcon height={24} width={24} />}
          </div>}
      </div>
      <section {...getCollapseProps()} className="space-y-4">
        {data.errorMessage &&
          <div className="rounded-md border border-stroke py-2 px-4 shadow-1 bg-rose-100 border-red-400">
            <p>Error: &quot;{data.errorMessage}&quot;</p>
          </div>
        }
        <div className="mx-auto mt-4.5 mb-5.5 grid max-w-94 grid-cols-2 md:grid-cols-4 rounded-md border border-stroke py-2.5 shadow-1">
          <div className="flex flex-col items-baseline justify-center gap-1 border-r border-stroke px-4 sm:flex-row">
            <span className="font-semibold text-black">
              {data.score}
            </span>
            <span className="text-sm">Score</span>
          </div>
          <div className="flex flex-col items-baseline justify-center gap-1 md:border-r border-stroke px-4 sm:flex-row">
            <span className="font-semibold text-black">
              {data.execTime}ms
            </span>
            <span className="text-sm">Runtime</span>
          </div>
          <div className="flex flex-col items-baseline justify-center gap-1 border-r border-stroke px-4 sm:flex-row">
            <span className="font-semibold text-black">
              {convertSeconds(Math.round(data.solveTime / 1000))}
            </span>
            <span className="text-sm">Solve time</span>
          </div>
          <div className="flex flex-col items-baseline justify-center gap-1 px-4 sm:flex-row">
            <span className="font-semibold text-black">
              {data.codeLength}
            </span>
            <span className="text-sm">Code length</span>
          </div>
        </div>
        <ReactCodeMirror
          readOnly={true}
          editable={false}
          value={data.code + "\n"}
          extensions={codeEditorExtensions}
          theme={codeEditorTheme}
          className="shadow-xl my-4"
        />
      </section>
    </div>
  )
}

const convertSeconds = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  const display = []
  if (hours > 0) display.push(`${hours}h`)
  if (minutes > 0) display.push(`${minutes}m`)
  display.push(`${remainingSeconds}s`)

  return display.join("")
}
