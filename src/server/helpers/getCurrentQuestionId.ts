// This function is the source of truth
// The current question id is passed to the client via "status.personal" proc
// Otherwise, this function should only be used to validate that future questions are not being accessed/referenced
// All other procs that need a question id must get the id from the client
export const getCurrentQuestionId = () => {
  // TODO: query Question table
  return 3
}
