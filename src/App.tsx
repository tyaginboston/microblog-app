import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PostsList } from './pages/PostsList';
import { PostDetail } from './pages/PostDetail';
import { AuthorPosts } from './pages/AuthorPosts';
import './App.css';

function App() {
  return (
    <Router basename="/microblog-app">
      <div className="app">
        <Routes>
          <Route path="/" element={<PostsList />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/author/:userId" element={<AuthorPosts />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
