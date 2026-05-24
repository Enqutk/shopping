import { Suspense } from 'react';
import AuthForm from '../../components/auth/AuthForm';

export const metadata = {
  title: 'Sign in | LUXE',
  description: 'Sign in to your LUXE account',
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-femme-black" />}>
      <AuthForm mode="login" />
    </Suspense>
  );
}
