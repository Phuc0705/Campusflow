import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <aside className="sidebar">
          <div className="logo-container">
            <h1>CampusFlow</h1>
            <span className="badge">Admin</span>
          </div>
          <nav className="nav-menu">
            <Link to="/" className="nav-item active">Dashboard</Link>
            <Link to="#" className="nav-item">Quản lý Sinh viên</Link>
            <Link to="#" className="nav-item">Sự kiện & CLB</Link>
            <Link to="#" className="nav-item">System Logs</Link>
            <Link to="#" className="nav-item">Cài đặt</Link>
          </nav>
        </aside>
        
        <main className="main-content">
          <header className="topbar">
            <h2>Hệ thống Quản trị Tổng quan</h2>
            <div className="user-profile">
              <span>Admin User</span>
              <div className="avatar">A</div>
            </div>
          </header>
          
          <div className="content-area">
            <Routes>
              <Route path="/" element={<Dashboard />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
