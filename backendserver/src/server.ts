import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/user.routes';
import authRoutes from './routes/auth.routes';
import postRoutes from './routes/post.routes';
import commentRoutes from './routes/comment.routes';
import likeRoutes from './routes/like.routes';
import savedPostRoutes from './routes/savedPost.routes';
import projectRoutes from './routes/project.routes';
import workRoutes from './routes/work.routes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/', (req, res) => {
  res.send('Lumioo API rodando com sucesso 🚀');
});

app.use('/api/v1/lumioo', userRoutes);
app.use('/api/v1/lumioo/auth', authRoutes);
app.use('/api/v1/lumioo', postRoutes);
app.use('/api/v1/lumioo', commentRoutes);
app.use('/api/v1/lumioo', likeRoutes);
app.use('/api/v1/lumioo', savedPostRoutes);
app.use('/api/v1/lumioo', projectRoutes);
app.use('/api/v1/lumioo', workRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});