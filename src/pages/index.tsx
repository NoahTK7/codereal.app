import { PageLayout } from "~/components/PageLayout";

import { api } from "~/utils/api";

export default function Home() {
  const globalStatus = api.status.global.useQuery()
  const personalStatus = api.status.personal.useQuery()

  return (
    <>
      <PageLayout>
        <p className="text-2xl text-white">
          {globalStatus.data ? globalStatus.data.numAnswered : "Loading tRPC query..."}
        </p>
        <p className="text-2xl text-white">
          {personalStatus.data ? personalStatus.data.userId : "Loading tRPC query..."}
        </p>
      </PageLayout>
    </>
  );
}
