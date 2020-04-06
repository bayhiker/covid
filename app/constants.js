/*
 * Global constants
 */

export const REST_PREFIX = '/api/v1';
export const REST_URL_USERS = `${REST_PREFIX}/users`;
export const REST_URL_PROBLEMS = `${REST_PREFIX}/problems`;
export const REST_URL_QUIZZES = `${REST_PREFIX}/quizzes`;

export const getUserVotesUrl = (userUuid, pageSize = -1) =>
  `${REST_URL_USERS}/${userUuid}/votes?page_size=${pageSize}`;

export const getProblemVotesUrl = (problemUuid, pageSize = -1) =>
  pageSize < 0
    ? `${REST_URL_PROBLEMS}/${problemUuid}/votes`
    : `${REST_URL_PROBLEMS}/${problemUuid}/votes?page_size=${pageSize}`;

export const getProblemVoteUrl = (problemUuid, voteUuid) =>
  `${REST_URL_PROBLEMS}/${problemUuid}/votes/${voteUuid}`;
