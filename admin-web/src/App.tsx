import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AdminEventsReview from './pages/AdminEventsReview';
import './index.css';

function App() {
  // Hàm trợ giúp để tự động thêm class 'active' khi người dùng đang ở đường dẫn tương ứng
  const getNavLinkClass = ({ isActive }: { isActive: boolean }) => 
    isActive ? "nav-item active" : "nav-item";

  return (
    <BrowserRouter>
      <div className="app-layout">
        <aside className="sidebar">
          <div className="logo-container">
            <h1>CampusFlow</h1>
            <span className="badge">Admin</span>
          </div>
          
          <nav className="nav-menu">
            {/* Dùng thuộc tính 'end' cho route '/' để tránh việc nó luôn sáng đèn (active) khi ở các trang con */}
            <NavLink to="/" end className={getNavLinkClass}>
              Dashboard
            </NavLink>
            
            {/* Gắn sẵn path cho các trang tương lai */}
            <NavLink to="/students" className={getNavLinkClass}>
              Quản lý Sinh viên
            </NavLink>
            
            <NavLink to="/events" className={getNavLinkClass}>
              Sự kiện & CLB
            </NavLink>
            
            <NavLink to="/logs" className={getNavLinkClass}>
              System Logs
            </NavLink>
            
            <NavLink to="/admin/events-review" className={getNavLinkClass}>
              Duyệt Sự kiện (Admin)
            </NavLink>
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
              {/* Các route chính thức đã hoàn thiện */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/admin/events-review" element={<AdminEventsReview />} />
              
              {/* Route mặc định (Catch-all 404) cho các trang menu chưa xây dựng */}
              <Route path="*" element={
                <div style={{ padding: '2rem', color: '#6b7280', textAlign: 'center', marginTop: '2rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Tính năng đang phát triển</h3>
                  <p>Module này sẽ được cập nhật trong các Sprint tiếp theo.</p>
                </div>
              } />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
