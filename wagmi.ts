import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  flare,
} from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'RainbowKit demo',
  projectId: 'YOUR_PROJECT_ID',
  chains: [ flare ],
  ssr: true,
});
