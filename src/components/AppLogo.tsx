
import React from 'react';
import { Store } from 'lucide-react'; // Example icon
import Image from 'next/image';

interface AppLogoProps {
  width?: number;
  height?: number;
  className?: string;
}

const AppLogo: React.FC<AppLogoProps> = ({ width = 40, height = 40, className }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <Image src="/wizzzey_logo.png" alt="Wizzzey" width={50} height={70} />
       <span className="font-headline text-2xl font-bold text-white hidden md:inline">Wizzzey</span>
    </div>
  );
};

export default AppLogo;
