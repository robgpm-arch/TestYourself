import { useState } from 'react';
import RegisterDialog from '../components/RegisterDialog';
import { Link } from 'react-router-dom';

export default function Splash() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-6">
      <img src="/logo.png" alt="TestYourself" className="mb-4 h-16 w-16" />
      <h1 className="mb-2 text-3xl font-bold">TestYourself</h1>
      <p className="mb-8 text-gray-600">Practice MCQs, Mock Exams & Smart Analytics</p>

      <div className="flex gap-3">
        <button
          className="rounded-xl bg-blue-600 px-6 py-3 font-medium text-white shadow hover:shadow-md"
          onClick={() => setOpen(true)}
        >
          Register
        </button>

        <Link
          to="/login"
          className="rounded-xl bg-gray-100 px-6 py-3 font-medium text-gray-900 hover:bg-gray-200"
        >
          Sign in
        </Link>
      </div>

      <RegisterDialog open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
