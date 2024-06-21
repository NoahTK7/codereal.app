import { ChevronRightIcon } from "@radix-ui/react-icons";
import dayjs from "dayjs";
import Link from "next/link";
import React from "react";
import { noRefreshOpts, statusColors } from "~/components/utils/constants";
import { LoadingSpinner } from "~/components/utils/loading";
import { api } from "~/utils/api";

const QuestionList = () => {
  const {
    data,
    error,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = api.question.getInfinite.useInfiniteQuery({
    limit: 2
  }, {
    getNextPageParam: (lastPage, _pages) => lastPage.nextCursor,
    ...noRefreshOpts
  })

  if (error) return <p>Could not load past questions.</p>

  if (isLoading) return <div className="flex justify-center pt-4"><LoadingSpinner size={48} /></div>

  return (
    <>
      {data.pages.map((group, i) => (
        <React.Fragment key={i}>
          {group.questions.map((question, i) => {
            const submission = question.submissions[0]
            const statusColor = submission ? statusColors[submission.runResult] : statusColors.UNKNOWN
            return (
              <Link key={i} href={`/question/${question.num}`}>
                <div className="space-y-4 my-6 py-4 px-4 bg-slate-100	rounded">
                  <div className="flex justify-between gap-x-1">
                    <p className="space-x-2 inline-block">
                      <span className="text-xl block sm:inline-block">Question #{question.num}: {question.title}</span>
                      <span className="text-sm block sm:inline-block">{dayjs(question.startsAt).format('ddd MMM DD YYYY')}</span>
                    </p>
                    <div className="flex-right flex">
                      <div className="flex-right">
                        <span className={`font-bold text-md inline-block ${statusColor}`}>({submission?.runResult ?? "INCOMPLETE"})</span>
                      </div>
                      <div className="flex-right">
                        <ChevronRightIcon height={24} width={24} className="inline-block" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          }
          )}
        </React.Fragment>
      ))}

      <div className="flex justify-center pt-4">
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
    <>
      <div className="space-y-4 pb-6">
        <p className="text-2xl font-mono font-bold">Past Questions</p>
        {/* <p>Browse all previous questions.</p> */}
      </div>
      <hr />
      <QuestionList />
    </>
  )
}
