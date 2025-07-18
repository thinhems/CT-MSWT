import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="p-4 bg-gray-100">
      <Link to="/" className="mr-4">Trang chủ</Link>
      <Link to="/about">Giới thiệu</Link>
    </nav>
  );
}
