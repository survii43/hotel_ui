import type { ReactNode } from 'react';
import StatusBar from './StatusBar';
import './DeviceFrame.css';

interface DeviceFrameProps {
  children: ReactNode;
}

export default function DeviceFrame({ children }: DeviceFrameProps) {
  return (
    <div className="device-bezel">
      <div className="device-frame">
        <div className="device-screen">
          <StatusBar />
          <div className="device-content">
            {children}
          </div>
          <div className="device-home-indicator" aria-hidden />
        </div>
      </div>
    </div>
  );
}
