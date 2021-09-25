import type { FormEvent } from 'react';
import { useCallback, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { useAuth } from 'utils/useAuth';

type Props = {
  signup?: boolean;
};

export default function AuthForm(props: Props) {
  const { signup = false } = props;
  const { signIn, signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showEmailConfirmationMessage, setShowEmailConfirmationMessage] =
    useState(false);

  const onSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setIsLoading(true);

      let error;
      if (signup) {
        const result = await signUp(email, password);
        error = result.error;
      } else {
        const result = await signIn(email, password);
        error = result.error;
      }

      if (error) {
        toast.error(error.message);
      } else if (signup) {
        // Add signup to email list
        await fetch('/api/email-list', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });
        setShowEmailConfirmationMessage(true);
      }

      setIsLoading(false);
    },
    [signup, email, password, signIn, signUp]
  );

  return (
    <form onSubmit={onSubmit}>
      <div>
        <label htmlFor="email" className="block text-gray-700">
          Email
        </label>
        <input
          type="email"
          name="email"
          id="email"
          autoComplete="email"
          className="w-full py-2 mt-2 input"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>
      <div className="mt-4">
        <label htmlFor="password" className="block text-gray-700">
          Password
        </label>
        <input
          type="password"
          name="password"
          id="password"
          className="w-full py-2 mt-2 input"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
        {!signup ? (
          <div className="mt-2">
            <Link href="/reset">
              <a className="text-sm link">Forgot your password?</a>
            </Link>
          </div>
        ) : null}
      </div>
      <button
        className={`w-full mt-6 btn ${isLoading && 'opacity-50 cursor-wait'}`}
        disabled={isLoading}
      >
        {signup ? 'Sign up' : 'Sign in'}
      </button>
      {signup && showEmailConfirmationMessage ? (
        <div className="mt-4 text-primary-500">
          We just sent you a confirmation email. Please check your inbox and
          confirm your email address.
        </div>
      ) : null}
    </form>
  );
}
