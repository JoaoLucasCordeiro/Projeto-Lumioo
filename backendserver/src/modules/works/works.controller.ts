import { asyncHandler, queryString, requireUserId } from '../../shared/http';
import * as worksService from './works.service';

export const createWork = asyncHandler(async (req, res) => {
  res.status(201).json(await worksService.createWork(requireUserId(req), req.body));
});

export const getAllWorks = asyncHandler(async (req, res) => {
  const q = req.query;
  res.status(200).json(
    await worksService.listWorks(
      {
        search: queryString(q.search),
        workType: queryString(q.workType),
        year: queryString(q.year),
        area: queryString(q.area),
        campus: queryString(q.campus),
        city: queryString(q.city),
        state: queryString(q.state),
        country: queryString(q.country),
        cursor: queryString(q.cursor),
      },
      req.user?.userId,
    ),
  );
});

export const getWorkById = asyncHandler(async (req, res) => {
  res.status(200).json(await worksService.getWork(req.params.id, req.user?.userId));
});

export const downloadWorkById = asyncHandler(async (req, res) => {
  res.status(200).json(await worksService.downloadWork(req.params.id, requireUserId(req)));
});

export const updateWork = asyncHandler(async (req, res) => {
  res.status(200).json(await worksService.updateWork(requireUserId(req), req.params.id, req.body));
});

export const deleteWork = asyncHandler(async (req, res) => {
  await worksService.deleteWork(requireUserId(req), req.params.id);
  res.status(204).send();
});

export const requestWorkAccess = asyncHandler(async (req, res) => {
  res.status(201).json(await worksService.requestAccess(requireUserId(req), req.params.id));
});

export const getWorkAccessRequests = asyncHandler(async (req, res) => {
  res.status(200).json(await worksService.listAccessRequests(requireUserId(req), req.params.id));
});

export const respondToWorkAccessRequest = asyncHandler(async (req, res) => {
  res
    .status(200)
    .json(await worksService.respondToAccessRequest(requireUserId(req), req.params.id, req.params.requestId, req.body));
});

export const getMyWorkAccessRequests = asyncHandler(async (req, res) => {
  res.status(200).json(await worksService.listMyAccessRequests(requireUserId(req)));
});

export const getWorkStats = asyncHandler(async (req, res) => {
  const q = req.query;
  res.status(200).json(
    await worksService.getWorkStats({
      dimension: queryString(q.dimension),
      limit: queryString(q.limit),
      state: queryString(q.state),
      country: queryString(q.country),
      workType: queryString(q.workType),
      area: queryString(q.area),
    }),
  );
});

export const getWorkFieldSuggestions = asyncHandler(async (req, res) => {
  res.status(200).json(await worksService.getWorkSuggestions(queryString(req.query.field), queryString(req.query.q)));
});
