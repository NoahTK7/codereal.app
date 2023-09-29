import React from "react";
import { noRefreshOpts } from "~/components/constants";
import { PageLayout } from "~/components/layout";
import { Submission } from "~/components/submission";
import { api } from "~/utils/api";

const SubmissionsList = () => {
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = api.submission.getInfinite.useInfiniteQuery({}, {
    getNextPageParam: (lastPage, _pages) => lastPage.nextCursor,
    ...noRefreshOpts
  })

  return status === 'loading' ? (
    <p>Loading...</p>
  ) : status === 'error' ? (
    <p>Error: {error.message}</p>
  ) : (
    <>
      {data.pages.map((group, i) => (
        <React.Fragment key={i}>
          {group.submissions.map((submission, i) => (
            <Submission key={i} {...submission} />
          ))}
        </React.Fragment>
      ))}
      <div>
        <button
          onClick={() => void fetchNextPage()}
          disabled={!hasNextPage || isFetchingNextPage}
        >
          {isFetchingNextPage
            ? 'Loading more...'
            : hasNextPage
              ? 'Load More'
              : 'Nothing more to load'}
        </button>
      </div>
      <div>{isFetching && !isFetchingNextPage ? 'Fetching...' : null}</div>
    </>
  )
}

export default function PastQuestionsPage() {
  return (
    <PageLayout>
      <p className="text-2xl font-mono font-bold">Past Questions</p>
      <SubmissionsList />
    </PageLayout>
  )
}
