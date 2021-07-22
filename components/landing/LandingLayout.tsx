import { ReactNode } from 'react';
import Footer from './Footer';
import Navbar from './Navbar';

type Props = {
  children: ReactNode;
  showNavbar?: boolean;
  showFooter?: boolean;
  className?: string;
};

export default function LandingLayout(props: Props) {
  const {
    children,
    showNavbar = true,
    showFooter = true,
    className = '',
  } = props;

  return (
    <div className={`font-display ${className}`}>
      {showNavbar ? <Navbar /> : null}
      {children}
      {showFooter ? <Footer /> : null}
    </div>
  );
}
