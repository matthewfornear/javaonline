/**
 * Priority Queue implementation for turn-based scheduling
 * Lower values have higher priority (earlier execution)
 */
class PriorityQueue {
    constructor() {
        this.heap = [];
    }

    /**
     * Add an item to the priority queue
     * @param {Object} item - The item to add
     * @param {number} priority - The priority value (lower = higher priority)
     */
    push(item, priority) {
        const node = { item, priority };
        this.heap.push(node);
        this._bubbleUp(this.heap.length - 1);
    }

    /**
     * Remove and return the highest priority item
     * @returns {Object|null} The highest priority item or null if empty
     */
    pop() {
        if (this.heap.length === 0) return null;
        if (this.heap.length === 1) return this.heap.pop().item;

        const min = this.heap[0].item;
        this.heap[0] = this.heap.pop();
        this._bubbleDown(0);
        return min;
    }

    /**
     * Peek at the highest priority item without removing it
     * @returns {Object|null} The highest priority item or null if empty
     */
    peek() {
        return this.heap.length > 0 ? this.heap[0].item : null;
    }

    /**
     * Check if the queue is empty
     * @returns {boolean} True if empty
     */
    isEmpty() {
        return this.heap.length === 0;
    }

    /**
     * Get the number of items in the queue
     * @returns {number} The size of the queue
     */
    size() {
        return this.heap.length;
    }

    /**
     * Clear all items from the queue
     */
    clear() {
        this.heap = [];
    }

    /**
     * Move an item up the heap to maintain heap property
     * @param {number} index - The index to bubble up
     * @private
     */
    _bubbleUp(index) {
        if (index === 0) return;

        const parentIndex = Math.floor((index - 1) / 2);
        if (this.heap[index].priority < this.heap[parentIndex].priority) {
            [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
            this._bubbleUp(parentIndex);
        }
    }

    /**
     * Move an item down the heap to maintain heap property
     * @param {number} index - The index to bubble down
     * @private
     */
    _bubbleDown(index) {
        const leftChild = 2 * index + 1;
        const rightChild = 2 * index + 2;
        let smallest = index;

        if (leftChild < this.heap.length && 
            this.heap[leftChild].priority < this.heap[smallest].priority) {
            smallest = leftChild;
        }

        if (rightChild < this.heap.length && 
            this.heap[rightChild].priority < this.heap[smallest].priority) {
            smallest = rightChild;
        }

        if (smallest !== index) {
            [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
            this._bubbleDown(smallest);
        }
    }
}
