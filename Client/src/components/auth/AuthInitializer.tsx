import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useRefreshTokenMutation } from '@/store/api/authApi';
import { setCredentials } from '@/store/slices/authSlice';

/**
 * Runs once on app startup.
 * If no access token is in localStorage but the server still has a valid
 * refreshToken cookie, silently exchanges it for a new access token so the
 * user stays logged in across hard refreshes / tab restores.
 */
export function AuthInitializer() {
  const dispatch = useDispatch();
  const [refreshToken] = useRefreshTokenMutation();
  const attempted = useRef(false);

  useEffect(() => {
    // Only run once
    if (attempted.current) return;
    attempted.current = true;

    // If we already have a persisted token in localStorage, Redux state is
    // already rehydrated correctly — nothing to do.
    if (localStorage.getItem('token')) return;

    // No localStorage token → try the httpOnly refreshToken cookie
    refreshToken(undefined)
      .unwrap()
      .then((res) => {
        const accessToken: string | undefined = res?.data?.accessToken;
        const user = res?.data?.user;
        if (accessToken) {
          // Persist the new access token so subsequent refreshes work
          localStorage.setItem('token', accessToken);
          if (user) {
            dispatch(setCredentials({ user, token: accessToken }));
          }
        }
      })
      .catch(() => {
        // No valid refresh cookie — user needs to log in. Silently ignore.
      });
  }, [dispatch, refreshToken]);

  return null;
}
