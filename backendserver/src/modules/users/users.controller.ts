import { asyncHandler, requireUserId } from '../../shared/http';
import * as usersService from './users.service';

export const createUser = asyncHandler(async (req, res) => {
  res.status(201).json(await usersService.createUser(req.body));
});

export const getAllUsers = asyncHandler(async (_req, res) => {
  res.status(200).json(await usersService.listUsers());
});

export const getUserById = asyncHandler(async (req, res) => {
  res.status(200).json(await usersService.getUserById(req.params.id));
});

export const getMyProfile = asyncHandler(async (req, res) => {
  res.status(200).json(await usersService.getMyProfile(requireUserId(req)));
});

export const getUserProfileByUsername = asyncHandler(async (req, res) => {
  res.status(200).json(await usersService.getPublicProfile(req.params.username, req.user?.userId));
});

export const updateUser = asyncHandler(async (req, res) => {
  res.status(200).json(await usersService.updateProfile(requireUserId(req), req.body));
});

export const deleteUser = asyncHandler(async (req, res) => {
  await usersService.deleteUser(requireUserId(req), req.params.id);
  res.status(204).send();
});

export const changePassword = asyncHandler(async (req, res) => {
  res.status(200).json(await usersService.changePassword(requireUserId(req), req.body));
});
