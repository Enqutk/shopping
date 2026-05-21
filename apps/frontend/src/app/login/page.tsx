import AuthForm from '../../components/auth/AuthForm';

export const metadata = {
  title: 'Sign in — LUXE',
  description: 'Sign in to your LUXE account',
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
