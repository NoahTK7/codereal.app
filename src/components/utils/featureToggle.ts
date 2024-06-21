import { useContext } from "react"
import { GlobalStateContext } from "~/components/layout"

export const useFeatureToggleState = (key: string) => {
  const toggleStates = useContext(GlobalStateContext)?.featureToggles

  if (!toggleStates) return false

  if (toggleStates[key]) return !!toggleStates[key]
  else return false
}
