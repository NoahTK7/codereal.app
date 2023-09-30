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
              <hr />
              <Submission {...submission} />
            </div>
          ))}
        </React.Fragment>
      ))
      }
      <div className="flex justify-center">
        <button
          onClick={() => void fetchNextPage()}
          disabled={!hasNextPage || isFetchingNextPage}
        >
          {isFetchingNextPage || isFetching
            ? 'Loading more...'
            : hasNextPage
              ? 'Load More'
              : 'Nothing more to load'}
        </button>
        {/* TODO: display spinner instead of button when fetching; hiden when no more to load */}
      </div>
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
