'use client';

import { createContext } from 'react';
import type { NeonGridContextValue } from './types';

export const NeonGridContext = createContext<NeonGridContextValue>({
  registerCard: () => {},
  registerNode: () => {},
});
