// Marker management types for Google Maps integration

export interface MarkerData {
  id: string;
  position: google.maps.LatLngLiteral;
  title?: string;
  icon?: string | google.maps.Icon | google.maps.Symbol;
  clickable?: boolean;
  draggable?: boolean;
  visible?: boolean;
  zIndex?: number;
  animation?: google.maps.Animation;
  opacity?: number;
}

export interface MarkerState {
  marker: google.maps.Marker;
  data: MarkerData;
  listeners: google.maps.MapsEventListener[];
}

export interface MarkerOperation {
  type: 'add' | 'update' | 'remove';
  id: string;
  data?: MarkerData;
}

export class MarkerError extends Error {
  constructor(
    message: string,
    public readonly markerId?: string,
    public readonly operation?: string
  ) {
    super(message);
    this.name = 'MarkerError';
  }
}

export interface MarkerEventHandlers {
  onClick?: (markerId: string, marker: google.maps.Marker) => void;
  onDragEnd?: (markerId: string, position: google.maps.LatLngLiteral) => void;
  onMouseOver?: (markerId: string, marker: google.maps.Marker) => void;
  onMouseOut?: (markerId: string, marker: google.maps.Marker) => void;
}