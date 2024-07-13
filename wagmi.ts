import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  flare,
} from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'RainbowKit demo',
  projectId: 'ba29a4b0642a94fd4dbc754841c2decb',
  chains: [ flare ],
  ssr: true,
});
