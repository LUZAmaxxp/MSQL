import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <div className="py-24">
      <div className="container-custom">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="text-6xl font-display text-primary-600 mb-4">404</h1>
          <h2 className="text-3xl font-display mb-6">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            The page you are looking for might have been removed, had its name changed,
            or is temporarily unavailable.
          </p>
          <Link to="/" className="btn-primary px-8 py-3 rounded-full inline-block">
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;