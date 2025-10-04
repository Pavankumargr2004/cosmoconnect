import React from 'react';
// Fix: Import types.ts to make A-Frame custom element types available to JSX.
import '../types';

interface CharacterViewerProps {
  modelUrl: string;
}

const CharacterViewer: React.FC<CharacterViewerProps> = ({ modelUrl }) => {
  return (
    <div className="w-full h-full rounded-lg animate-fade-in">
        <a-scene
            embedded
            renderer="colorManagement: true; alpha: true;"
            vr-mode-ui="enabled: false"
            style={{ backgroundColor: 'transparent' }}
        >
            <a-assets timeout="10000"></a-assets>

            <a-entity
                gltf-model={`url(${modelUrl})`}
                position="0 -0.8 0"
                scale="0.9 0.9 0.9"
            >
              <a-animation
                attribute="rotation"
                to="0 360 0"
                dur="15000"
                easing="linear"
                repeat="indefinite"
              ></a-animation>
            </a-entity>

            <a-camera position="0 0 2.5"></a-camera>

            <a-light type="ambient" color="#FFF" intensity="0.8"></a-light>
            <a-light type="directional" color="#FFF" intensity="0.6" position="-2 2 4"></a-light>
        </a-scene>
    </div>
  );
};

export default CharacterViewer;