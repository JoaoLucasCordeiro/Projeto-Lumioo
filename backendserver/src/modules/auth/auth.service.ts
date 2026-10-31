import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { unauthorized } from '../../shared/errors';
import { prisma } from '../../shared/prisma';
import type { SignInInput } from './auth.schemas';

export async function signIn({ identifier, password }: SignInInput) {
  const user = identifier.includes('@')
    ? await prisma.user.findUnique({ where: { academicEmail: identifier } })
    : await prisma.user.findUnique({ where: { username: identifier } });

  // Mesma mensagem para usuário inexistente e senha errada (não revela qual dos dois falhou)
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw unauthorized('Invalid credentials.');
  }

  const token = jwt.sign({ userId: user.id, username: user.username }, env.JWT_SECRET, { expiresIn: '1d' });

  const { password: _password, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
}
