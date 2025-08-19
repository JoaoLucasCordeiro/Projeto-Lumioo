import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/user.routes';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// API Welcome Route
app.get('/', (req, res) => {
  res.send('Lumioo API rodando com sucesso 🚀');
});

// Main API Routes v1
app.use('/api/v1/lumioo', userRoutes); 

// Server Initialization
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
