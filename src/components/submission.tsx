import ReactCodeMirror from "@uiw/react-codemirror";
import { type RouterOutputs } from "~/utils/api";
import { codeEditorExtensions, codeEditorTheme } from "./constants";

type SubmissionProps = RouterOutputs['submission']['getInfinite']['submissions'][number]
export const Submission = (data: SubmissionProps) => {
  const statusColors = {
    ERROR: "text-amber-700",
    TIMEOUT: "text-amber-700",
    INCORRECT: "text-yellow-400",
    CORRECT: "text-emerald-600",
  };
  const statusColor = statusColors[data.runResult] || "";

  return (
    <div className="space-y-4 py-4">
      <p className="space-x-2"><span className="text-xl">Question #{data.questionId} Submission</span> <span className={"text-md " + statusColor}>({data.runResult})</span></p>
      <div className="mx-auto mt-4.5 mb-5.5 grid max-w-94 grid-cols-2 xl:grid-cols-4 rounded-md border border-stroke py-2.5 shadow-1">
        <div className="flex flex-col items-center justify-center gap-1 border-r border-stroke px-4 xsm:flex-row">
          <span className="font-semibold text-black">
            {data.score}
          </span>
          <span className="text-sm">Score</span>
        </div>
        <div className="flex flex-col items-center justify-center gap-1 xl:border-r border-stroke px-4 xsm:flex-row">
          <span className="font-semibold text-black">
            {data.execTime}ms
          </span>
          <span className="text-sm">Runtime</span>
        </div>
        <div className="flex flex-col items-center justify-center gap-1 border-r border-stroke px-4 xsm:flex-row">
          <span className="font-semibold text-black">
            {data.solveTime / 1000}s
          </span>
          <span className="text-sm">Solve time</span>
        </div>
        <div className="flex flex-col items-center justify-center gap-1 px-4 xsm:flex-row">
          <span className="font-semibold text-black dark:text-white">
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
    </div>
  )
}
