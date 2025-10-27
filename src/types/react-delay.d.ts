declare module 'react-delay' {
  import { ReactNode } from 'react';

  interface DelayProps {
    wait: number;
    children: ReactNode;
  }

  const Delay: React.FC<DelayProps>;
  export default Delay;
}
