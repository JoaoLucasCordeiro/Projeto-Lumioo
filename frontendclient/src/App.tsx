import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/Login';
import SignupPage from './pages/Signup';
import { PostDetails } from './components/shared/PostDetails';
import { AllPosts } from './pages/AllPosts';
import { FeedPage } from './pages/Feed';
import { ProjectsPage } from './pages/Projects';
import { ProfilePage } from './pages/Profile';
import { SettingsPage } from './pages/SettingsPage';
import { WorksPage } from './pages/Works';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<SignupPage />} />
        <Route path="/perfil" element={<ProfilePage />} />
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/configuracoes" element={<SettingsPage />} />
        <Route path="/trabalhos" element={<WorksPage />} />
        <Route path="/posts" element={<AllPosts />} />
        <Route path="/projetos" element={<ProjectsPage />} />
        <Route path="/post/:id" element={<PostDetails />} />
      </Routes>
    </BrowserRouter>
  );

  
}

export default App;