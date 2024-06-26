import type { User } from "@clerk/nextjs/server";
import type { Question } from "@prisma/client";

export const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    profileImageUrl: user.imageUrl,
    externalUsername: user.externalAccounts.find((externalAccount) => externalAccount.provider === "oauth_github")?.username ?? null
  };
};

export type PublicQuestionInfo = {
  questionId: number
  questionNum: number
  questionTitle: string
  questionExp: Date
}

export const filterQuestionForClientPublic = (question: Question) => {
  return {
    questionId: question.id,
    questionNum: question.num,
    questionTitle: question.title,
    questionExp: question.endsAt
  } as PublicQuestionInfo
}

export const filterQuestionForClientPrivate = (question: Question) => {
  return {
    description: question.description,
    signature: question.funcSig,
  }
}
