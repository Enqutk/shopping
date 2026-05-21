import AuthForm from '../../components/auth/AuthForm';

export const metadata = {
  title: 'Register — LUXE',
  description: 'Create your LUXE account',
};

export default function RegisterPage() {
  return <AuthForm mode="register" />;
}
