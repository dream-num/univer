/**
 * Copyright 2023-present DreamNum Co., Ltd.
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

import { describe, expect, it } from 'vitest';
import type { IBoundingBox } from '../rbush';
import { RBush } from '../rbush';

describe('RBush', () => {
    it('keeps inclusive range queries accurate after loading batches of different sizes and removing shared edges', () => {
        const boxes = Array.from({ length: 1024 }, (_, i) => ({
            minX: i % 32,
            minY: Math.floor(i / 32),
            maxX: i % 32 + 1,
            maxY: Math.floor(i / 32) + 1,
        }));
        const tree = new RBush<IBoundingBox>(4);
        tree.insert(boxes[0]).load(boxes.slice(1, 128)).load(boxes.slice(128)).load([boxes[0]]);
        const corner = { minX: 1, minY: 1, maxX: 1, maxY: 1 };
        expect(tree.search(corner)).toHaveLength(5);
        tree.remove(boxes[0]).remove({ ...boxes[0] });
        expect(tree.search(corner).sort((a, b) => a.minY - b.minY || a.minX - b.minX))
            .toEqual([boxes[0], boxes[1], boxes[32], boxes[33]]);
        for (const box of [boxes[0], boxes[1], boxes[32], boxes[33]]) {
            tree.remove(box);
        }
        expect(tree.collides(corner)).toBe(false);
        expect(tree.all()).toHaveLength(boxes.length - 4);
    });

    it.each([
        { batch: true, order: [6, 2, 11, 1, 10, 7, 9, 0, 8, 5, 4, 3] },
        { batch: false, order: [0, 1, 11, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
    ])('preserves the public hit order for coincident entries (batch: $batch)', ({ batch, order }) => {
        const box = { minX: 1, minY: 1, maxX: 2, maxY: 2 };
        const items = Array.from({ length: 12 }, (_, id) => ({ ...box, id }));
        const tree = new RBush<typeof items[number]>(4);
        if (batch) {
            tree.load(items);
        } else {
            items.forEach((item) => tree.insert(item));
        }
        expect(tree.search(box).map((item) => item.id)).toEqual(order);
        tree.remove(items[0], (a, b) => a.minX === b.minX);
        expect(tree.search(box).map((item) => item.id)).toEqual(order.slice(1));
    });

    it('returns the same first match when a saved index is reopened', () => {
        const item = (id: string, minX: number, maxX: number) => ({ id, minX, maxX, minY: 0, maxY: 0 });
        const first = item('left', 0, 2);
        const middle = item('middle', 1, 1);
        const last = item('right', 1, 3);
        const leaf = (entry: typeof first) => ({ ...entry, children: [entry], leaf: true as const, height: 1 });
        const index = new RBush<typeof first>().fromJSON({
            minX: 0,
            maxX: 3,
            minY: 0,
            maxY: 0,
            height: 2,
            leaf: false,
            children: [leaf(first), leaf(middle), leaf(last)],
        });

        expect(index.search(middle)).toEqual([middle, last, first]);
        expect(index.search({ ...middle, minX: 0, maxX: 3 })).toEqual([first, middle, last]);
        expect(index.all()).toEqual([last, middle, first]);
    });

    it('removes by ID when the supplied copy moved to a neighboring leaf in a saved index', () => {
        const left = { id: 'left', minX: 0, maxX: 0, minY: 0, maxY: 0 };
        const right = { ...left, id: 'right', minX: 9, maxX: 9 };
        const leaf = (entry: typeof left) => ({ ...entry, children: [entry], leaf: true as const, height: 1 });
        const index = new RBush<typeof left>().fromJSON({
            minX: 0,
            maxX: 9,
            minY: 0,
            maxY: 0,
            height: 2,
            leaf: false,
            children: [leaf(left), leaf(right)],
        });

        index.remove({ ...right, id: 'left' }, (copy, stored) => copy.id === stored.id);
        expect(index.collides(left)).toBe(false);
        expect(index.all()).toEqual([right]);
    });

    it('reads a saved RBush node and preserves custom item coordinates and removal by value', () => {
        type Point = [number, number];
        class PointIndex extends RBush<Point> {
            override toBBox([x, y]: Point) {
                return { minX: x, minY: y, maxX: x, maxY: y };
            }

            override compareMinX(a: Point, b: Point) { return a[0] - b[0]; }
            override compareMinY(a: Point, b: Point) { return a[1] - b[1]; }
        }
        const bounds = { minX: -4, minY: 2, maxX: 7, maxY: 11 };
        const leaf = { ...bounds, leaf: true as const, height: 1, children: [[-4, 2], [7, 11]] as Point[] };
        const tree = new PointIndex(4).fromJSON({ ...bounds, leaf: false, height: 2, children: [leaf] });
        tree.load(Array.from({ length: 40 }, (_, i) => [20 + i, i]));
        tree.remove([-4, 2], (a, b) => a[0] === b[0] && a[1] === b[1]);
        const restored = new PointIndex(4).fromJSON(JSON.parse(JSON.stringify(tree.toJSON())));
        expect(restored.search(bounds)).toEqual([[7, 11]]);
        expect(restored.all()).toHaveLength(41);
        expect(restored.clear().collides(bounds)).toBe(false);
    });
});
