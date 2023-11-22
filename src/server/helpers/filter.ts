import type { User } from "@clerk/nextjs/api";
import type { Question } from "@prisma/client";

export const filterUserForClient = (user: User) => {
  return {
    id: user.id,
    username: user.username,
    profileImageUrl: user.imageUrl,
    externalUsername: user.externalAccounts.find((externalAccount) => externalAccount.provider === "oauth_github")?.username ?? null
  };
};

export const filterQuestionForClient = (question: Question) => {
  return {
    id: question.id,
    title: question.title,
    questionDescription: question.description,
    funcSignature: question.funcSig,
  }
}
