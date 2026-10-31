import { asyncHandler } from '../../shared/http';
import * as authService from './auth.service';

export const signIn = asyncHandler(async (req, res) => {
  res.status(200).json(await authService.signIn(req.body));
});
