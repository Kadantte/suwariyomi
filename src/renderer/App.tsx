import './css/App.css';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { StyleSheet, css } from 'aphrodite';

import Topbar from './components/topbar';
import Library from './pages/library';
import Login from './pages/login';
import Search from './pages/search';
import NotFound from './pages/404';
import View from './pages/view';
import Reader from './pages/reader';
import Settings from './pages/settings';

const styles = StyleSheet.create({
  root: {
    height: 'calc(100% - 32px)',
    width: '100vw',
    backgroundColor: '#111111',
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
  },
});

export default function App() {
  return (
    <div>
      <Topbar />
      <div className={css(styles.root)} id="root">
        <Router>
          <Routes>
            <Route path="*" element={<NotFound />} />
            <Route path="/" element={<Settings />} />
            <Route path="/search" element={<Search />} />
            <Route path="/library" element={<Library />} />
            <Route path="/view" element={<View />} />
            <Route path="/read" element={<Reader />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </Router>
      </div>
    </div>
  );
}
