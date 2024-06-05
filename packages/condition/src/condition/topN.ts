/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Represents a heap data structure.
 */
class Heap {
    heap: number[];

    /**
     * Initializes a new instance of the Heap class.
     */
    constructor() {
        this.heap = [];
    }

    /**
     * Swaps the elements at the given indices in the heap.
     * @param index1 The index of the first element.
     * @param index2 The index of the second element.
     */
    swap(index1: number, index2: number) {
        const temp = this.heap[index1];
        this.heap[index1] = this.heap[index2];
        this.heap[index2] = temp;
    }

    /**
     * Returns the index of the parent node for the given index.
     * @param index The index of the node.
     * @returns The index of the parent node.
     */
    getParentIndex(index: number) {
        return Math.floor((index - 1) / 2);
    }

    /**
     * Returns the index of the left child node for the given index.
     * @param index The index of the node.
     * @returns The index of the left child node.
     */
    getLeftIndex(index: number) {
        return index * 2 + 1;
    }

    /**
     * Returns the index of the right child node for the given index.
     * @param index The index of the node.
     * @returns The index of the right child node.
     */
    getRightIndex(index: number) {
        return index * 2 + 2;
    }

    /**
     * Returns the number of elements in the heap.
     * @returns The number of elements in the heap.
     */
    size(): number {
        return this.heap.length;
    }

    /**
     * Returns the minimum value in the heap without removing it.
     * @returns The minimum value in the heap.
     */
    peek(): number {
        return this.heap[0];
    }

    /**
     * @description Returns whether the heap includes the given value.
     * @param {number} value  The value to be checked.
     * @returns {boolean} return true if the heap includes the given value
     */
    include(value: number): boolean {
        return this.heap.includes(value);
    }
}

/**
 * Represents a min heap data structure.
 */
class MinHeap extends Heap {
    /**
     * Initializes a new instance of the MinHeap class.
     */
    constructor() {
        super();
    }

    /**
     * Moves the element at the given index up the heap until it satisfies the min heap property.
     * @param index The index of the element to be shifted up.
     */
    shiftUp(index: number) {
        if (index === 0) {
            return;
        }
        const parentIndex = this.getParentIndex(index);
        if (this.heap[parentIndex] > this.heap[index]) {
            this.swap(parentIndex, index);
            this.shiftUp(parentIndex);
        }
    }

    /**
     * Moves the element at the given index down the heap until it satisfies the min heap property.
     * @param index The index of the element to be shifted down.
     */
    shiftDown(index: number) {
        const leftIndex = this.getLeftIndex(index);
        const rightIndex = this.getRightIndex(index);
        if (this.heap[leftIndex] < this.heap[index]) {
            this.swap(leftIndex, index);
            this.shiftDown(leftIndex);
        }
        if (this.heap[rightIndex] < this.heap[index]) {
            this.swap(rightIndex, index);
            this.shiftDown(rightIndex);
        }
    }

    /**
     * Inserts a new value into the min heap.
     * @param value The value to be inserted.
     */
    insert(value) {
        this.heap.push(value);
        this.shiftUp(this.heap.length - 1);
    }

    /**
     * Removes and returns the minimum value from the min heap.
     */
    pop() {
        this.heap[0] = this.heap.pop() as number;
        this.shiftDown(0);
    }
}

/**
 * Represents a max heap data structure.
 */
class MaxHeap extends Heap {
    /**
     * Initializes a new instance of the MaxHeap class.
     */
    constructor() {
        super();
    }

    /**
     * Moves the element at the given index up the heap until it satisfies the max heap property.
     * @param index The index of the element to be shifted up.
     */
    shiftUp(index: number) {
        if (index === 0) {
            return;
        }
        const parentIndex = this.getParentIndex(index);
        if (this.heap[parentIndex] < this.heap[index]) {
            this.swap(parentIndex, index);
            this.shiftUp(parentIndex);
        }
    }

    /**
     * Moves the element at the given index down the heap until it satisfies the max heap property.
     * @param index The index of the element to be shifted down.
     */
    shiftDown(index: number) {
        const leftIndex = this.getLeftIndex(index);
        const rightIndex = this.getRightIndex(index);
        if (this.heap[leftIndex] > this.heap[index]) {
            this.swap(leftIndex, index);
            this.shiftDown(leftIndex);
        }
        if (this.heap[rightIndex] > this.heap[index]) {
            this.swap(rightIndex, index);
            this.shiftDown(rightIndex);
        }
    }

    /**
     * Inserts a new value into the max heap.
     * @param value The value to be inserted.
     */
    insert(value: number) {
        this.heap.push(value);
        this.shiftUp(this.heap.length - 1);
    }

    /**
     * Removes and returns the maximum value from the max heap.
     */
    pop() {
        this.heap[0] = this.heap.pop() as number;
        this.shiftDown(0);
    }
}

/**
 * Returns the kth largest element from the given list using a min heap.
 * @param {number[]} list The list of numbers.
 * @param {number} k The value of k.
 * @returns The kth largest element.
 */
export const getLargestK = (list: number[], k: number) => {
    const min = new MinHeap();
    list.forEach((n) => {
        min.insert(n);
        if (min.size() > k) {
            min.pop();
        }
    });
    return min;
};

/**
 * Returns the kth smallest element from the given list using a max heap.
 * @param {number[]} list The list of numbers.
 * @param {number} k The value of k.
 * @returns The kth smallest element.
 */
export const getSmallestK = (list: number[], k: number) => {
    const max = new MaxHeap();
    list.forEach((n) => {
        max.insert(n);
        if (max.size() > k) {
            max.pop();
        }
    });
    return max;
};

