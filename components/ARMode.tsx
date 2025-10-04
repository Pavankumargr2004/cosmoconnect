import React, { useEffect, useState } from 'react';
import ARTutorial from './ARTutorial';
// Fix: Import types.ts to make A-Frame custom element types available to JSX.
import '../types';

interface ARModeProps {
  onClose: () => void;
}

const ARMode: React.FC<ARModeProps> = ({ onClose }) => {
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    const tutorialCompleted = localStorage.getItem('arTutorialCompleted');
    if (!tutorialCompleted) {
        setShowTutorial(true);
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleCloseTutorial = () => {
    localStorage.setItem('arTutorialCompleted', 'true');
    setShowTutorial(false);
  };


  return (
    <div id="ar-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 1000
    }}>
      <a-scene
        webxr="requiredFeatures: viewer,local-floor; optionalFeatures: dom-overlay; overlayElement: #ar-overlay;"
        vr-mode-ui="enabled: false"
        ar-mode-ui="enabled: false"
        renderer="colorManagement: true;"
      >
        <a-assets>
          <audio id="chime-sound" src="https://cdn.glitch.global/e843c0c0-15a2-439c-9c3f-4a699bce8042/magic-chime.mp3?v=1716334543143" preload="auto"></audio>
          <audio id="ambient-music" src="https://cdn.glitch.global/e843c0c0-15a2-439c-9c3f-4a699bce8042/deep-space-ambience.mp3?v=1718911111293" preload="auto"></audio>
          <audio id="ambient-drone" src="https://cdn.glitch.global/e843c0c0-15a2-439c-9c3f-4a699bce8042/subtle-space-drone.mp3?v=1718911116491" preload="auto"></audio>
        </a-assets>

        <a-camera position="0 1.6 0" cursor="rayOrigin: mouse;"></a-camera>

        {/* Ambient Sounds */}
        <a-entity sound="src: #ambient-music; autoplay: true; loop: true; volume: 0.2;"></a-entity>
        <a-entity sound="src: #ambient-drone; autoplay: true; loop: true; volume: 0.4;"></a-entity>
        
        {/* Sunny Model - Now with interactive components */}
        <a-entity
          gltf-model="url(https://cdn.glitch.global/e843c0c0-15a2-439c-9c3f-4a699bce8042/sun_character.glb?v=1716330343388)"
          position="0 1.5 -2.5"
          scale="0.5 0.5 0.5"
          click-handler
          sparkle-burst
          sound="src: #chime-sound; on: tap;"
        >
          {/* Continuous rotation */}
          <a-animation
            attribute="rotation"
            to="0 360 0"
            dur="10000"
            easing="linear"
            repeat="indefinite"
          ></a-animation>
          {/* Continuous bobbing */}
           <a-animation
            attribute="position"
            from="0 1.45 -2.5"
            to="0 1.55 -2.5"
            dur="2000"
            direction="alternate"
            easing="ease-in-out"
            repeat="indefinite"
          ></a-animation>
          {/* Wobble animation on tap */}
           <a-animation
            attribute="scale"
            begin="tap"
            to="0.45 0.55 0.5"
            dur="400"
            direction="alternate"
            repeat="1"
            easing="easeInOutSine"
           ></a-animation>
        </a-entity>
        
        <a-light type="ambient" intensity="0.5"></a-light>
        <a-light type="point" intensity="1" position="0 2 -2"></a-light>
        
        {/* Aurora Effects */}
        <a-entity aurora-particles="color: #f472b6; size: 0.25; count: 400; speed: 0.0008;"></a-entity>
        <a-entity aurora-particles="color: #a78bfa; size: 0.3; count: 400; speed: 0.001;"></a-entity>
        <a-entity aurora-particles="color: #67e8f9; size: 0.2; count: 400; speed: 0.0012;"></a-entity>
        
      </a-scene>
      
      {showTutorial && <ARTutorial onClose={handleCloseTutorial} />}

      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          padding: '12px 20px',
          fontSize: '16px',
          fontWeight: 'bold',
          color: 'white',
          backgroundColor: 'rgba(56, 189, 248, 0.8)', // sky-400
          border: 'none',
          borderRadius: '9999px',
          cursor: 'pointer',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          zIndex: 1001
        }}
      >
        Exit AR
      </button>
    </div>
  );
};

export default ARMode;