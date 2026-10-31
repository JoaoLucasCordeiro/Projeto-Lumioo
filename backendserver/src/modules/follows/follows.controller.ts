import { asyncHandler, queryString, requireUserId } from '../../shared/http';
import * as followsService from './follows.service';

export const followUser = asyncHandler(async (req, res) => {
  res.status(201).json(await followsService.followUser(requireUserId(req), req.params.userId));
});

export const unfollowUser = asyncHandler(async (req, res) => {
  res.status(200).json(await followsService.unfollowUser(requireUserId(req), req.params.userId));
});

export const getFollowers = asyncHandler(async (req, res) => {
  res.status(200).json(await followsService.getFollowers(req.params.userId, queryString(req.query.cursor)));
});

export const getFollowing = asyncHandler(async (req, res) => {
  res.status(200).json(await followsService.getFollowing(req.params.userId, queryString(req.query.cursor)));
});

export const blockUser = asyncHandler(async (req, res) => {
  res.status(201).json(await followsService.blockUser(requireUserId(req), req.params.userId));
});

export const unblockUser = asyncHandler(async (req, res) => {
  res.status(200).json(await followsService.unblockUser(requireUserId(req), req.params.userId));
});

export const getBlockedUsers = asyncHandler(async (req, res) => {
  res.status(200).json(await followsService.getBlockedUsers(requireUserId(req), queryString(req.query.cursor)));
});
