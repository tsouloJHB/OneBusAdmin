/// <reference types="google.maps" />

declare global {
  interface Window {
    google: {
      maps: {
        Map: typeof google.maps.Map;
        Marker: typeof google.maps.Marker;
        Size: typeof google.maps.Size;
        Point: typeof google.maps.Point;
        LatLngLiteral: google.maps.LatLngLiteral;
        MapMouseEvent: google.maps.MapMouseEvent;
        Icon: google.maps.Icon;
        Symbol: google.maps.Symbol;
        event: {
          removeListener: (listener: google.maps.MapsEventListener) => void;
        };
      };
    };
  }
}

// Type aliases for easier use
export type LatLngLiteral = {
  lat: number;
  lng: number;
};

export type MapMouseEvent = {
  latLng?: {
    toJSON(): LatLngLiteral;
  };
};

export type MapIcon = {
  url: string;
  scaledSize?: any;
  anchor?: any;
};

export {};