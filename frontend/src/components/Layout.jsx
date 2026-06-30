import Navbar from './Navbar';

export default function Layout({ children, links }) {
  return (
    <div className="app-layout">
      <Navbar links={links} />
      <main className="main-content">{children}</main>
    </div>
  );
}
