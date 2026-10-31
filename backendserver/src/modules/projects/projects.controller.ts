import { asyncHandler, queryString, requireUserId } from '../../shared/http';
import * as projectsService from './projects.service';

export const createProject = asyncHandler(async (req, res) => {
  res.status(201).json(await projectsService.createProject(requireUserId(req), req.body));
});

export const getAllProjects = asyncHandler(async (req, res) => {
  const q = req.query;
  res.status(200).json(
    await projectsService.listProjects({
      search: queryString(q.search),
      category: queryString(q.category),
      year: queryString(q.year),
      campus: queryString(q.campus),
      city: queryString(q.city),
      state: queryString(q.state),
      country: queryString(q.country),
      cursor: queryString(q.cursor),
    }),
  );
});

export const getProjectById = asyncHandler(async (req, res) => {
  res.status(200).json(await projectsService.getProject(req.params.id));
});

export const updateProject = asyncHandler(async (req, res) => {
  res.status(200).json(await projectsService.updateProject(requireUserId(req), req.params.id, req.body));
});

export const deleteProject = asyncHandler(async (req, res) => {
  await projectsService.deleteProject(requireUserId(req), req.params.id);
  res.status(204).send();
});

export const getProjectStats = asyncHandler(async (req, res) => {
  const q = req.query;
  res.status(200).json(
    await projectsService.getProjectStats({
      dimension: queryString(q.dimension),
      limit: queryString(q.limit),
      state: queryString(q.state),
      country: queryString(q.country),
      category: queryString(q.category),
    }),
  );
});

export const getProjectFieldSuggestions = asyncHandler(async (req, res) => {
  res.status(200).json(await projectsService.getProjectSuggestions(queryString(req.query.field), queryString(req.query.q)));
});
