'use client';

import { useEffect } from 'react';
import { initLogger } from '@/utils/logger';

export default function LoggerInitializer() {
  useEffect(() => {
    initLogger();
  }, []);

  return null;
}
