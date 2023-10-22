import { type Question, SubmissionResult } from '@prisma/client';
import { randomUUID } from 'crypto';
import Sandbox from 'v8-sandbox';

const TIMEOUT = 500 //ms
export type CodeExecutionResult = {
  runResult: SubmissionResult,
  accuracy: number
  execTime: number,
  errorMessage: string | null,
  executionId: string
}

export const executeCode = async (question: Question, userCode: string): Promise<CodeExecutionResult> => {
  const runnerCode = `
const testCases = ${JSON.stringify(question.testCases)};

function runTests(func, testCases) {
  let successCount = 0;
  for (let i = 0; i < testCases.length; ++i) {
    if (func.apply(null, testCases[i]["args"]) === testCases[i]["ans"]) successCount++;
  };
  return successCount / testCases.length
}

${userCode};

const result = runTests(${question.funcName}, testCases)
setResult({value: result, error: null})
`

  const executionId = randomUUID()

  const sandbox = new Sandbox({
    httpEnabled: false,
    timersEnabled: false,
    memory: 8,
    // argv: ['--untrusted-code-mitigations']
  })

  const startTime = process.hrtime()
  const res = await sandbox.execute({ code: runnerCode, timeout: TIMEOUT })
  const execTime = parseHrtimeToMilliseconds(process.hrtime(startTime))

  await sandbox.shutdown()
  console.log(`execution ${executionId} result: ${JSON.stringify(res)}`)

  let runResult: SubmissionResult = SubmissionResult.UNKNOWN
  if (typeof res.value === 'number') runResult = (res.value < 1) ? SubmissionResult.INCORRECT : SubmissionResult.CORRECT
  else if (res.error) runResult = (res.error.isTimeout) ? SubmissionResult.TIMEOUT : SubmissionResult.ERROR

  return {
    runResult,
    accuracy: res.value ? res.value as number : 0,
    execTime,
    errorMessage: res.error ? res.error.message.substring(0, 1000) : null,
    executionId
  } satisfies CodeExecutionResult
}

const parseHrtimeToMilliseconds = (hrtime: [number, number]) => {
  const milliseconds = Math.round(hrtime[0] + (hrtime[1] / 1e6))
  return milliseconds
}
