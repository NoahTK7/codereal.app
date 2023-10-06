// TODO: move file contents to question.ts once actual db queries implemented

// This function is the source of truth
// The current question id is passed to the client via "status.personal" proc
// Otherwise, this function should only be used to validate that future questions are not being accessed/referenced
// All other procs that need a question id must get the id from the client
// This allows the user to start/submit previous questions at any time
export const getCurrentQuestionId = () => {
  // TODO: query Question table
  return 4
}

export const getCurrentQuestionExp = (_id: number) => {
  // TODO: query Question table
  const currentDate = new Date();
  const nextDay = new Date(currentDate);
  // nextDay.setTime(currentDate.getTime() + 1000 * 10) // in 10 seconds, for testing
  nextDay.setUTCDate(currentDate.getUTCDate() + 1);
  nextDay.setUTCHours(0, 0, 0, 0);
  return nextDay
}
