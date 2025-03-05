"use strict";
/**
 * This is a small directed graph for demonstration. The "edges" map says:
 *   from branchId -> possible next branchIds
 * Some merges occur (e.g. multiple nodes can lead to the same next node).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MERCHANT_BRANCH_GRAPH = void 0;
exports.MERCHANT_BRANCH_GRAPH = [
    { id: 0, next: [1, 2] },
    { id: 1, next: [3] },
    { id: 2, next: [3, 4] },
    { id: 3, next: [5] },
    { id: 4, next: [5] },
    { id: 5, next: [] } // end
];
/**
 * For example:
 *   0 -> 1 or 2
 *   1 -> 3
 *   2 -> 3 or 4
 *   3 -> 5
 *   4 -> 5
 *   5 -> end
 *
 * Node 3 merges the path from 1 or 2.
 * Node 5 merges from 3 or 4, etc.
 */
