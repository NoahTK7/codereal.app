/* Client-side constants */

import { javascript } from "@codemirror/lang-javascript"
import { noctisLilac } from '@uiw/codemirror-theme-noctis-lilac'

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
export const codeEditorExtensions = [javascript()]
export const codeEditorTheme = noctisLilac

export const noRefreshOpts = {
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: 2,
}

// used for isolating calls that will be cached on edge
export const skipBatchOpts = {
  trpc: {
    context: {
      skipBatch: true
    }
  }
}

export const statusColors = {
  ERROR: "text-rose-700",
  TIMEOUT: "text-rose-700",
  INCORRECT: "text-yellow-500",
  CORRECT: "text-emerald-600",
  UNKNOWN: "text-slate-500"
};
