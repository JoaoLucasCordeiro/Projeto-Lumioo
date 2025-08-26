import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/Login';
import SignupPage from './pages/Signup';
import { AllPosts } from './pages/AllPosts';
import { FeedPage } from './pages/Feed';
import { ProjectsPage } from './pages/Projects';
import { ProfilePage } from './pages/Profile';
import { SettingsPage } from './pages/Settings';
import { WorksPage } from './pages/Works';
import { ProjectDetailsPage } from './pages/ProjectDetails';
import { WorkDetails } from './pages/WorksDetails';
import { NewPostPage } from './pages/NewPost';
import { SubmitWorkPage } from './pages/SubmitWork';
import { NewProjectPage } from './pages/NewProject';
import { PostDetails } from './pages/PostDetails';
import { EditPostPage } from './pages/EditPosts';
import ExploreProjects from './pages/ExploreProjects';
import OurTeam from './pages/OurTeam';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/cadastro" element={<SignupPage />} />
      <Route path="/perfil" element={<ProfilePage />} />
      <Route path="/perfil/:username?" element={<ProfilePage />} />
      <Route path="/feed" element={<FeedPage />} />
      <Route path="/configuracoes" element={<SettingsPage />} />
      <Route path="/trabalhos" element={<WorksPage />} />
      <Route path="/trabalhos/:id" element={<WorkDetails />} />
      <Route path="/submeter-trabalho" element={<SubmitWorkPage />} />
      <Route path="/posts" element={<AllPosts />} />
      <Route path="/post/:id" element={<PostDetails />} />
      <Route path="/post/:id/edit" element={<EditPostPage />} />
      <Route path="/novo-projeto" element={<NewProjectPage />} />
      <Route path="/explorar-projetos" element={<ExploreProjects />} />
      <Route path="/nosso-time" element={<OurTeam />} />
      <Route path="/projetos" element={<ProjectsPage />} />
      <Route path="/projetos/:id" element={<ProjectDetailsPage />} />
      <Route path="/novo-post" element={<NewPostPage />} />
    </Routes>
  );
}

export default App;
