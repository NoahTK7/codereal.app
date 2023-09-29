/* Client-side constants */

import { javascript } from "@codemirror/lang-javascript"
import { noctisLilac } from '@uiw/codemirror-theme-noctis-lilac'

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
export const codeEditorExtensions = [javascript()]
export const codeEditorTheme = noctisLilac

// TODO: invalidate queries when question changes (e.g. at midnight UTC?)
// TODO: revisit desired refetch behavior
export const noRefreshOpts = {
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: 2,
  staleTime: 1000 * 60 * 60 // 1 hour
}
