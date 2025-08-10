import { useRef, useCallback, useEffect } from 'react';
import { MarkerData, MarkerState, MarkerError, MarkerEventHandlers } from '../types/marker';
import { MarkerRegistry } from '../utils/MarkerRegistry';
import { MarkerSyncEngine } from '../utils/MarkerSyncEngine';

interface UseMarkerManagerOptions {
  debugMode?: boolean;
  eventHandlers?: MarkerEventHandlers;
}

export function useMarkerManager(
  map: google.maps.Map | null,
  options: UseMarkerManagerOptions = {}
) {
  const { debugMode = false, eventHandlers = {} } = options;
  
  const registryRef = useRef<MarkerRegistry | null>(null);
  const syncEngineRef = useRef<MarkerSyncEngine | null>(null);

  // Initialize registry and sync engine
  useEffect(() => {
    if (!registryRef.current) {
      registryRef.current = new MarkerRegistry(debugMode);
    }
    if (!syncEngineRef.current) {
      syncEngineRef.current = new MarkerSyncEngine(debugMode);
    }
  }, [debugMode]);

  // Create a marker with event listeners
  const createMarker = useCallback((data: MarkerData): MarkerState => {
    if (!map) {
      throw new MarkerError('Map instance is required to create markers');
    }

    if (!window.google || !window.google.maps) {
      throw new MarkerError('Google Maps API is not loaded yet');
    }

    const marker = new google.maps.Marker({
      position: data.position,
      map: map,
      title: data.title,
      icon: data.icon,
      clickable: data.clickable ?? true,
      draggable: data.draggable ?? false,
      visible: data.visible ?? true,
      zIndex: data.zIndex,
      animation: data.animation,
      opacity: data.opacity ?? 1
    });

    const listeners: google.maps.MapsEventListener[] = [];

    // Add event listeners
    if (eventHandlers.onClick) {
      const clickListener = marker.addListener('click', () => {
        eventHandlers.onClick!(data.id, marker);
      });
      listeners.push(clickListener);
    }

    if (eventHandlers.onDragEnd) {
      const dragEndListener = marker.addListener('dragend', () => {
        const position = marker.getPosition();
        if (position) {
          eventHandlers.onDragEnd!(data.id, position.toJSON());
        }
      });
      listeners.push(dragEndListener);
    }

    if (eventHandlers.onMouseOver) {
      const mouseOverListener = marker.addListener('mouseover', () => {
        eventHandlers.onMouseOver!(data.id, marker);
      });
      listeners.push(mouseOverListener);
    }

    if (eventHandlers.onMouseOut) {
      const mouseOutListener = marker.addListener('mouseout', () => {
        eventHandlers.onMouseOut!(data.id, marker);
      });
      listeners.push(mouseOutListener);
    }

    return { marker, data, listeners };
  }, [map, eventHandlers]);

  // Update markers based on new data
  const updateMarkers = useCallback((newMarkers: MarkerData[]) => {
    if (!registryRef.current || !syncEngineRef.current || !map) {
      return;
    }

    const registry = registryRef.current;
    const syncEngine = syncEngineRef.current;

    try {
      // Convert array to map for easier processing
      const desiredMarkers = new Map(newMarkers.map(marker => [marker.id, marker]));
      const currentMarkers = registry.getAllIds();

      // Calculate operations needed
      const operations = syncEngine.calculateOperations(currentMarkers, desiredMarkers);
      const optimizedOps = syncEngine.optimizeOperations(operations);

      // Execute operations
      optimizedOps.forEach(operation => {
        switch (operation.type) {
          case 'add':
            if (operation.data) {
              const markerState = createMarker(operation.data);
              registry.register(operation.id, markerState);
            }
            break;

          case 'update':
            if (operation.data) {
              const existingState = registry.get(operation.id);
              if (existingState && !syncEngine.isMarkerDataEqual(existingState.data, operation.data)) {
                // Update marker properties
                existingState.marker.setOptions({
                  position: operation.data.position,
                  title: operation.data.title,
                  icon: operation.data.icon,
                  clickable: operation.data.clickable,
                  draggable: operation.data.draggable,
                  visible: operation.data.visible,
                  zIndex: operation.data.zIndex,
                  animation: operation.data.animation,
                  opacity: operation.data.opacity
                });
                existingState.data = operation.data;
              }
            }
            break;

          case 'remove':
            registry.unregister(operation.id);
            break;
        }
      });

      if (debugMode) {
        console.log('[MarkerManager] Update complete:', registry.getDebugInfo());
      }
    } catch (error) {
      console.error('[MarkerManager] Error updating markers:', error);
      throw error;
    }
  }, [map, createMarker, debugMode]);

  // Clear all markers
  const clearMarkers = useCallback(() => {
    if (registryRef.current) {
      registryRef.current.clear();
    }
  }, []);

  // Get marker by ID
  const getMarker = useCallback((id: string): google.maps.Marker | null => {
    const markerState = registryRef.current?.get(id);
    return markerState?.marker || null;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    const registry = registryRef.current;
    return () => {
      if (registry) {
        registry.clear();
      }
    };
  }, []);

  return {
    updateMarkers,
    clearMarkers,
    getMarker,
    getDebugInfo: () => registryRef.current?.getDebugInfo() || {}
  };
}