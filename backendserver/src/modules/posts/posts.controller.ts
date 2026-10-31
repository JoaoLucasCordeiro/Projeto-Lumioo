import { asyncHandler, queryString, requireUserId } from '../../shared/http';
import * as postsService from './posts.service';

export const getFeedPosts = asyncHandler(async (req, res) => {
  res.status(200).json(await postsService.getFeed(requireUserId(req), queryString(req.query.cursor)));
});

export const getAllPosts = asyncHandler(async (req, res) => {
  res
    .status(200)
    .json(await postsService.listPosts(req.user?.userId, queryString(req.query.search), queryString(req.query.cursor)));
});

export const getPostById = asyncHandler(async (req, res) => {
  res.status(200).json(await postsService.getPost(req.params.id, req.user?.userId));
});

export const createPost = asyncHandler(async (req, res) => {
  res.status(201).json(await postsService.createPost(requireUserId(req), req.body));
});

export const updatePost = asyncHandler(async (req, res) => {
  res.status(200).json(await postsService.updatePost(requireUserId(req), req.params.id, req.body));
});

export const deletePost = asyncHandler(async (req, res) => {
  await postsService.deletePost(requireUserId(req), req.params.id);
  res.status(204).send();
});

export const togglePostLike = asyncHandler(async (req, res) => {
  res.status(200).json(await postsService.togglePostLike(requireUserId(req), req.params.postId));
});

export const toggleSavePost = asyncHandler(async (req, res) => {
  const { saved, message } = await postsService.toggleSavePost(requireUserId(req), req.params.postId);
  res.status(saved ? 201 : 200).json({ message });
});
