import { asyncHandler, requireUserId } from '../../shared/http';
import * as chatService from './chat.service';

export const findOrCreateConversation = asyncHandler(async (req, res) => {
  const { conversation, created } = await chatService.findOrCreateConversation(requireUserId(req), req.body.recipientId);
  res.status(created ? 201 : 200).json(conversation);
});

export const getUserConversations = asyncHandler(async (req, res) => {
  res.status(200).json(await chatService.listConversations(requireUserId(req)));
});

export const getConversationById = asyncHandler(async (req, res) => {
  res.status(200).json(await chatService.getConversation(requireUserId(req), req.params.conversationId));
});

export const getMessagesForConversation = asyncHandler(async (req, res) => {
  res.status(200).json(await chatService.listMessages(requireUserId(req), req.params.conversationId));
});
