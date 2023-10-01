import React from "react";
import { noRefreshOpts } from "~/components/constants";
import { PageLayout } from "~/components/layout";
import { LoadingSpinner } from "~/components/loading";
import { Submission } from "~/components/submission";
import { api } from "~/utils/api";

const SubmissionsList = () => {
  const {
    data,
    error,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = api.submission.getInfinite.useInfiniteQuery({
    limit: 2
  }, {
    getNextPageParam: (lastPage, _pages) => lastPage.nextCursor,
    ...noRefreshOpts
  })

  if (error) return <p>Could not load past submissions.</p>

  if (isLoading) return <div className="flex justify-center"><LoadingSpinner size={48} /></div>

  return (
    <>
      {data.pages.map((group, i) => (
        <React.Fragment key={i}>
          {group.submissions.map((submission, i) => (
            <div key={i} >
              <Submission data={submission} solo={false} />
              <hr />
            </div>
          ))}
        </React.Fragment>
      ))}

      <div className="flex justify-center">
        {isFetchingNextPage || isFetching
          ? <LoadingSpinner size={48} />
          : hasNextPage
            ?
            <button
              onClick={() => void fetchNextPage()}
              disabled={!hasNextPage || isFetchingNextPage}
              className="underline"
            >
              Load more
            </button>

            : null}
      </div>

    </>
  )
}

export default function PastQuestionsPage() {
  return (
    <PageLayout>
      <div className="space-y-4 pb-6">
        <p className="text-2xl font-mono font-bold">Past Submissions</p>
        <p>All of your previously submitted solutions are listed here.</p>
      </div>
      <hr />
      <SubmissionsList />
    </PageLayout>
  )
}
