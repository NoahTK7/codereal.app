import ReactCodeMirror from "@uiw/react-codemirror";
import { api, type RouterOutputs } from "~/utils/api";
import { codeEditorExtensions, codeEditorTheme, noRefreshOpts, statusColors } from "./utils/constants";
import { LoadingSpinner } from "./utils/loading";

type SubmissionItem = RouterOutputs['submission']['getInfinite']['submissions'][number]
export const Submission = ({ data }: { data: SubmissionItem }) => {
  const statusColor = statusColors[data.runResult] || "";

  return (
    <>
      <div className="flex justify-between">
        <p className="space-x-2 inline-block"><span className="text-lg">Result: </span> <span className={`font-bold text-lg ${statusColor}`}>{data.runResult}</span></p>
      </div>
      <section className="space-y-4 !mb-4">
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
          maxHeight="8rem"
          className="shadow-xl my-4"
        />
        {/* improvement: add share score button */}
      </section>
    </>
  )
}

export const SubmissionDisplay = ({ id }: { id: number }) => {
  const { data, isLoading, isError } = api.submission.getById.useQuery({ id }, noRefreshOpts)

  if (isLoading) return <div className="flex justify-center"><LoadingSpinner size={48} /></div>

  if (isError) return <p>There was an error retrieving your submission.</p>

  return <Submission data={data} />
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
