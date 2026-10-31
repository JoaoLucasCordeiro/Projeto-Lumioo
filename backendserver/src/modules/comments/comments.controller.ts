import { asyncHandler, requireUserId } from '../../shared/http';
import * as commentsService from './comments.service';

export const createComment = asyncHandler(async (req, res) => {
  res.status(201).json(await commentsService.createComment(requireUserId(req), req.params.postId, req.body.text));
});

export const getCommentsForPost = asyncHandler(async (req, res) => {
  res.status(200).json(await commentsService.listComments(req.params.postId));
});

export const updateComment = asyncHandler(async (req, res) => {
  res.status(200).json(await commentsService.updateComment(requireUserId(req), req.params.commentId, req.body.text));
});

export const deleteComment = asyncHandler(async (req, res) => {
  await commentsService.deleteComment(requireUserId(req), req.params.commentId);
  res.status(204).send();
});

export const toggleCommentLike = asyncHandler(async (req, res) => {
  res.status(200).json(await commentsService.toggleCommentLike(requireUserId(req), req.params.commentId));
});
