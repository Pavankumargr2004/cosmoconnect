
import React from 'react';

const BlackholeIcon: React.FC = () => (
    <div className="w-8 h-8 relative group-hover:[&>div]:animate-swirl-fast">
        <div className="absolute inset-0 border-2 border-dashed border-violet-400 rounded-full animate-swirl-slow"></div>
        <div className="absolute inset-2 border-2 border-dashed border-sky-400 rounded-full animate-swirl-medium"></div>
        <div className="absolute inset-4 bg-black rounded-full"></div>
    </div>
);

export default BlackholeIcon;
