import { z } from 'zod';

const RequestStatusSchema = z.enum(['NONE', 'PENDING_SENT', 'PENDING_RECEIVED', 'FRIEND']);

const DbTimestampSchema = z.iso.datetime({ offset: true });

// GET /api/friends/search 쿼리 파라미터 검증 (Route Handler의 단일 검증 지점)
export const SearchFriendsQuerySchema = z.object({
  keyword: z.string().trim().min(2, '검색어는 2자 이상 입력해주세요.'),
});

// GET /api/friends/my-code DTO
export const MyFriendCodeSchema = z.object({
  code: z.string(),
});

// GET /api/friends/search DTO
export const FriendCandidateSchema = z.object({
  userId: z.uuid(),
  nickname: z.string(),
  friendCode: z.string(),
  characterType: z.string().nullable(),
  colorTheme: z.string().nullable(),
  level: z.number().int(),
  requestStatus: RequestStatusSchema,
});

export const FriendCandidateListSchema = z.array(FriendCandidateSchema);

// GET /api/friends/requests DTO
export const PendingFriendRequestSchema = z.object({
  requestId: z.uuid(),
  senderId: z.uuid(),
  nickname: z.string(),
  characterType: z.string().nullable(),
  colorTheme: z.string().nullable(),
  level: z.number().int(),
  createdAt: DbTimestampSchema,
});

export const PendingFriendRequestListSchema = z.array(PendingFriendRequestSchema);

// POST /api/friends/requests DTO
export const SendFriendRequestSchema = z.object({
  targetUserId: z.uuid(),
});

// PATCH /api/friends/requests/[id] DTO
export const RespondFriendRequestSchema = z.object({
  action: z.enum(['accept', 'reject']),
});

// POST /api/friends/requests, PATCH /api/friends/requests/[id] 공용 응답 DTO
export const FriendRequestActionResultSchema = z.object({
  id: z.uuid(),
  status: z.string(),
});

export type RequestStatus = z.infer<typeof RequestStatusSchema>;
export type MyFriendCode = z.infer<typeof MyFriendCodeSchema>;
export type FriendCandidate = z.infer<typeof FriendCandidateSchema>;
export type PendingFriendRequest = z.infer<typeof PendingFriendRequestSchema>;
export type SendFriendRequest = z.infer<typeof SendFriendRequestSchema>;
export type RespondFriendRequest = z.infer<typeof RespondFriendRequestSchema>;
export type FriendRequestActionResult = z.infer<typeof FriendRequestActionResultSchema>;
