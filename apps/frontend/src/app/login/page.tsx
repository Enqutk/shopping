export default function LoginPage() {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-8 bg-white dark:bg-gray-800 shadow rounded-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">Welcome Back</h2>
        <a
          href={`${backendUrl}/auth/google`}
          className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google Logo" className="w-5 h-5 mr-2" />
          Continue with Google
        </a>
      </div>
    </div>
  );
}
