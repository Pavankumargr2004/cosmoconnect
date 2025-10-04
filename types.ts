

export enum PerspectiveCharacter {
  Astronaut = 'Astronaut',
  Pilot = 'Pilot',
  Farmer = 'Farmer',
  Photographer = 'Photographer'
}

export interface CMEData {
  activityID: string;
  startTime: string;
  note: string;
  instruments: { displayName: string }[];
  cmeAnalyses: {
    time21_5: string;
    latitude: number;
    longitude: number;
    halfAngle: number;
    speed: number;
    type: string;
    isMostAccurate: boolean;
    note: string;
    levelOfData: number;
  }[];
}

export interface APODData {
  copyright: string;
  date: string;
  explanation: string;
  hdurl: string;
  media_type: 'image' | 'video';
  service_version: string;
  title: string;
  url: string;
}

export interface CMEAnalysisData {
  time21_5: string;
  latitude: number;
  longitude: number;
  halfAngle: number;
  speed: number;
  type: string;
  isMostAccurate: boolean;
  note: string;
  catalog: string;
  link: string;
}

// FIX: Augment the global JSX namespace to include A-Frame's custom elements as well as standard HTML and SVG elements. This resolves numerous "Property '...' does not exist on type 'JSX.IntrinsicElements'" errors by ensuring the global JSX type definition is complete.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'a-scene': any;
      'a-assets': any;
      'a-asset-item': any;
      'a-camera': any;
      'a-gltf-model': any;
      'a-light': any;
      'a-entity': any;
      'a-animation': any;
      'a-sphere': any;
      'a-torus': any;
      'a-sky': any;
      'a-text': any;

      // HTML elements
      a: any;
      audio: any;
      button: any;
      canvas: any;
      div: any;
      footer: any;
      form: any;
      h1: any;
      h2: any;
      h3: any;
      h4: any;
      header: any;
      iframe: any;
      img: any;
      input: any;
      label: any;
      li: any;
      main: any;
      nav: any;
      option: any;
      p: any;
      section: any;
      select: any;
      source: any;
      span: any;
      strong: any;
      ul: any;
      video: any;
      
      // SVG elements
      svg: any;
      path: any;
      circle: any;
      // FIX: Add missing SVG element types ('defs', 'linearGradient', 'stop') to fix TypeScript errors in recharts components.
      defs: any;
      linearGradient: any;
      stop: any;
    }
  }
}
