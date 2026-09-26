import type { Db } from "./client";
import type { Prisma } from "./generated/prisma/client";

export type ApiKeyRateLimitPolicy = {
	maxRequests: number;
	timeWindowMs: number;
};

export type ApiKeyRateLimitBackfillResult = {
	updated: number;
	alreadyPolicied: number;
};

const WITHOUT_POLICY: Prisma.ApikeyWhereInput = {
	OR: [{ rateLimitMax: null }, { rateLimitTimeWindow: null }],
};

export async function backfillApiKeyRateLimit(
	db: Db,
	policy: ApiKeyRateLimitPolicy,
): Promise<ApiKeyRateLimitBackfillResult> {
	const alreadyPolicied = await db.apikey.count({
		where: { NOT: WITHOUT_POLICY },
	});

	const { count: updated } = await db.apikey.updateMany({
		where: WITHOUT_POLICY,
		data: {
			rateLimitEnabled: true,
			rateLimitMax: policy.maxRequests,
			rateLimitTimeWindow: policy.timeWindowMs,
		},
	});

	return { updated, alreadyPolicied };
}
