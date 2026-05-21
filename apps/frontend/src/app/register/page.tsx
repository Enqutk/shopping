import { Suspense } from 'react';
import AuthForm from '../../components/auth/AuthForm';

export const metadata = {
  title: 'Register — LUXE',
  description: 'Create your LUXE account',
};

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-femme-black" />}>
      <AuthForm mode="register" />
    </Suspense>
  );
}
