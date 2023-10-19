import { type Submission, type PrismaClient, type Prisma } from "@prisma/client";
import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";
import { getCurrentQuestionId } from "~/server/helpers/getCurrentQuestionId";
import { withTransaction, type TransactionPrismaClient } from "~/server/helpers/transaction";
import { getUserById } from "./user";

export const statisticsRouter = createTRPCRouter({
  global: publicProcedure
    .query(async ({ ctx }) => {
      const currentQuestionId = getCurrentQuestionId()
      const questionStats = await ctx.db.questionStats.findFirst({
        where: {
          questionId: currentQuestionId
        }
      })

      return {
        questionId: currentQuestionId,
        numAnswered: questionStats?.numSubmissions ?? 0,
        topFive: questionStats?.top5Scores as LeaderboardEntry[] ?? [],
        lastUpdated: questionStats?.updatedAt ?? new Date()
      }
    }),
  personal: privateProcedure
    .query(async ({ ctx }) => {
      const userStats = await ctx.db.userStats.findFirst({
        where: {
          userId: ctx.userId
        }
      })

      return {
        totalAnswered: userStats?.numSubmissions ?? 0,
        highScore: userStats?.topScore ?? 0,
        avgScore: userStats?.avgScore ?? 0,
        lastUpdated: userStats?.updatedAt ?? new Date()
      }
    })
});

export const updateUserStats = async (db: PrismaClient, submission: Submission) => {
  await withTransaction<Submission>(db, updateUserStatsFunc, submission, { retries: 3 })
}

const updateUserStatsFunc = async (db: TransactionPrismaClient, submission: Submission) => {
  const statsRecord = await db.userStats.upsert({
    where: {
      userId: submission.authorId
    },
    create: {
      userId: submission.authorId,
      avgScore: 0,
      topScore: 0,
      numSubmissions: 0
    },
    update: {}
  })

  statsRecord.topScore = Math.max(statsRecord.topScore, submission.score)
  statsRecord.avgScore = (statsRecord.avgScore * statsRecord.numSubmissions + submission.score) / (statsRecord.numSubmissions + 1)
  statsRecord.numSubmissions += 1

  try {
    await db.userStats.update({
      where: {
        userId: submission.authorId
      },
      data: {
        ...statsRecord,
        updatedAt: new Date()
      }
    })
  } catch (e) {
    console.log(`could not update user stats for submission (${submission.id})`, e)
  }
}

export const updateQuestionStats = async (db: PrismaClient, submission: Submission) => {
  await withTransaction<Submission>(db, updateQuestionStatsFunc, submission, { retries: 3 })
}

const updateQuestionStatsFunc = async (db: TransactionPrismaClient, submission: Submission) => {
  const [statsRecord, user] = await Promise.all([
    db.questionStats.upsert({
      where: {
        questionId: submission.questionId
      },
      create: {
        questionId: submission.questionId,
        top5Scores: [] as Prisma.JsonArray,
        numSubmissions: 0
      },
      update: {}
    }),
    getUserById(submission.authorId)
  ])

  const topScores = statsRecord.top5Scores as Prisma.JsonArray
  topScores.push({ username: user.username, score: submission.score })
  topScores.sort((a, b) => {
    return (b as LeaderboardEntry).score - (a as LeaderboardEntry).score
  })
  topScores.slice(0, 5)

  try {
    await db.questionStats.update({
      where: {
        questionId: submission.questionId
      },
      data: {
        top5Scores: topScores,
        numSubmissions: statsRecord.numSubmissions + 1,
        updatedAt: new Date()
      }
    })
  } catch (e) {
    console.log(`could not update question stats for submission (${submission.id})`)
  }
}

type LeaderboardEntry = {
  username: string,
  score: number
}
