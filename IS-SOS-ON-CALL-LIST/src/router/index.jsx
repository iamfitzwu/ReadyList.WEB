import { Navigate } from 'react-router-dom';
import ReadyCheck from '../pages/ReadyCheck';

const routes = [
  {
    path: '/',
    element: <Navigate to="/ready-check" replace />,
  },
  {
    path: '/ready-check',
    element: <ReadyCheck />,
  },
  // ... existing routes ...
];

export default routes; 