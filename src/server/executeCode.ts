import { SubmissionResult } from '@prisma/client';
import Sandbox from 'v8-sandbox';

const sandbox = new Sandbox();

const code = 'setResult({ value: 1 + inputValue });';

export const executeCode = async (): Promise<CodeExecutionResult> => {
  const res = await sandbox.execute({ code, timeout: 1000, globals: { inputValue: 2 } });

  await sandbox.shutdown();

  console.log(res.value);

  return {
    runResult: SubmissionResult.CORRECT,
    score: 456,
    codeLength: 23,
    solveTime: 7135,
    execTime: 342
  } satisfies CodeExecutionResult
}

type CodeExecutionResult = {
  runResult: SubmissionResult,
  score: number,
  codeLength: number,
  solveTime: number,
  execTime: number,
}
