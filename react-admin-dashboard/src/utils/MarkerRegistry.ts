import { MarkerState, MarkerError } from '../types/marker';

/**
 * Centralized registry for managing Google Maps markers
 * Provides thread-safe operations for marker lifecycle management
 */
export class MarkerRegistry {
  private markers = new Map<string, MarkerState>();
  private readonly debugMode: boolean;

  constructor(debugMode = false) {
    this.debugMode = debugMode;
    this.log('MarkerRegistry initialized');
  }

  /**
   * Register a new marker in the registry
   */
  register(id: string, markerState: MarkerState): void {
    if (this.markers.has(id)) {
      this.log(`Warning: Overwriting existing marker ${id}`);
      // Clean up existing marker before overwriting
      this.unregister(id);
    }
    
    this.markers.set(id, markerState);
    this.log(`Registered marker ${id}`);
  }

  /**
   * Unregister and cleanup a marker
   */
  unregister(id: string): boolean {
    const markerState = this.markers.get(id);
    if (!markerState) {
      this.log(`Warning: Attempted to unregister non-existent marker ${id}`);
      return false;
    }

    try {
      // Remove all event listeners
      markerState.listeners.forEach(listener => {
        google.maps.event.removeListener(listener);
      });

      // Remove marker from map
      markerState.marker.setMap(null);
      
      // Remove from registry
      this.markers.delete(id);
      
      this.log(`Unregistered marker ${id}`);
      return true;
    } catch (error) {
      throw new MarkerError(
        `Failed to unregister marker ${id}: ${error}`,
        id,
        'unregister'
      );
    }
  }

  /**
   * Get a marker by ID
   */
  get(id: string): MarkerState | undefined {
    return this.markers.get(id);
  }

  /**
   * Check if a marker exists
   */
  has(id: string): boolean {
    return this.markers.has(id);
  }

  /**
   * Get all registered marker IDs
   */
  getAllIds(): Set<string> {
    return new Set(this.markers.keys());
  }

  /**
   * Get the count of registered markers
   */
  size(): number {
    return this.markers.size;
  }

  /**
   * Clear all markers and cleanup resources
   */
  clear(): void {
    const ids = Array.from(this.markers.keys());
    ids.forEach(id => this.unregister(id));
    this.log('Cleared all markers');
  }

  /**
   * Update marker properties
   */
  updateMarker(id: string, updates: Partial<google.maps.MarkerOptions>): void {
    const markerState = this.markers.get(id);
    if (!markerState) {
      throw new MarkerError(`Marker ${id} not found`, id, 'update');
    }

    try {
      markerState.marker.setOptions(updates);
      this.log(`Updated marker ${id}`);
    } catch (error) {
      throw new MarkerError(
        `Failed to update marker ${id}: ${error}`,
        id,
        'update'
      );
    }
  }

  /**
   * Get debug information about the registry
   */
  getDebugInfo(): object {
    return {
      totalMarkers: this.markers.size,
      markerIds: Array.from(this.markers.keys()),
      markers: Array.from(this.markers.entries()).map(([id, state]) => ({
        id,
        position: state.marker.getPosition()?.toJSON(),
        visible: state.marker.getVisible(),
        title: state.marker.getTitle(),
        listenerCount: state.listeners.length
      }))
    };
  }

  private log(message: string): void {
    if (this.debugMode) {
      console.log(`[MarkerRegistry] ${message}`);
    }
  }
}