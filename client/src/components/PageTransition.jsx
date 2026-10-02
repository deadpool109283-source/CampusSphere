import { useLocation } from 'react-router-dom';

export default function PageTransition({ children }) {
  const location = useLocation();

  return (
    <div className="route-transition" key={location.pathname}>
      {children}
    </div>
  );
}
