'use client';

import { useEffect } from 'react';
import { clearSessionRefresh, refreshSession } from '../lib/auth';

export default function AuthSessionRenewal() {
  useEffect(() => {
    void refreshSession().catch(() => undefined);
    return clearSessionRefresh;
  }, []);

  return null;
}