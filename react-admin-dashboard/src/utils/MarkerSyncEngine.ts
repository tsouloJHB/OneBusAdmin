import { MarkerData, MarkerOperation } from '../types/marker';

/**
 * Engine for efficiently synchronizing marker state
 * Uses diffing algorithm to minimize DOM operations
 */
export class MarkerSyncEngine {
  private readonly debugMode: boolean;

  constructor(debugMode = false) {
    this.debugMode = debugMode;
  }

  /**
   * Calculate the operations needed to sync current markers with desired state
   */
  calculateOperations(
    currentMarkers: Set<string>,
    desiredMarkers: Map<string, MarkerData>
  ): MarkerOperation[] {
    const operations: MarkerOperation[] = [];
    const currentIds = currentMarkers;
    const desiredIds = new Set(desiredMarkers.keys());

    // Find markers to remove (in current but not in desired)
    for (const id of Array.from(currentIds)) {
      if (!desiredIds.has(id)) {
        operations.push({ type: 'remove', id });
      }
    }

    // Find markers to add or update
    for (const [id, data] of Array.from(desiredMarkers.entries())) {
      if (!currentIds.has(id)) {
        operations.push({ type: 'add', id, data });
      } else {
        operations.push({ type: 'update', id, data });
      }
    }

    this.log(`Calculated ${operations.length} operations: ${this.summarizeOperations(operations)}`);
    return operations;
  }

  /**
   * Optimize operations by removing redundant updates
   */
  optimizeOperations(operations: MarkerOperation[]): MarkerOperation[] {
    // Remove redundant operations (e.g., update followed by remove)
    const optimized: MarkerOperation[] = [];
    const processed = new Set<string>();

    // Process in reverse order to handle remove operations first
    for (let i = operations.length - 1; i >= 0; i--) {
      const op = operations[i];
      if (!processed.has(op.id)) {
        optimized.unshift(op);
        processed.add(op.id);
      }
    }

    this.log(`Optimized ${operations.length} operations to ${optimized.length}`);
    return optimized;
  }

  /**
   * Check if two marker data objects are equivalent
   */
  isMarkerDataEqual(a: MarkerData, b: MarkerData): boolean {
    return (
      a.id === b.id &&
      a.position.lat === b.position.lat &&
      a.position.lng === b.position.lng &&
      a.title === b.title &&
      // Compare label values if present
      ((a.label && b.label) ? (a.label.text === b.label.text && a.label.color === b.label.color && a.label.fontSize === b.label.fontSize && a.label.fontWeight === b.label.fontWeight) : a.label === b.label) &&
      a.icon === b.icon &&
      a.clickable === b.clickable &&
      a.draggable === b.draggable &&
      a.visible === b.visible &&
      a.zIndex === b.zIndex &&
      a.animation === b.animation &&
      a.opacity === b.opacity
    );
  }

  /**
   * Create a summary of operations for logging
   */
  private summarizeOperations(operations: MarkerOperation[]): string {
    const counts = operations.reduce((acc, op) => {
      acc[op.type] = (acc[op.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .map(([type, count]) => `${count} ${type}`)
      .join(', ');
  }

  private log(message: string): void {
    if (this.debugMode) {
      console.log(`[MarkerSyncEngine] ${message}`);
    }
  }
}