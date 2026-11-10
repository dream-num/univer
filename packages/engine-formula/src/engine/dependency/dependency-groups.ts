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

/**
 * Returns strongly connected components in dependency order: precedents before their dependents.
 * Mutually dependent nodes stay together so only their group needs iterative calculation.
 * Uses iterative Kosaraju traversal to avoid overflowing the call stack on large dependency graphs.
 */
export function getDependencyGroups<T>(nodes: T[], getId: (node: T) => number, getDependents: (node: T) => Iterable<number>): T[][] {
    const byId = new Map(nodes.map((node) => [getId(node), node]));
    const edges = new Map<number, number[]>();
    const reverse = new Map<number, number[]>();
    for (const node of nodes) {
        const id = getId(node);
        const dependents = Array.from(getDependents(node)).filter((dependent) => byId.has(dependent));
        edges.set(id, dependents);
        for (const dependent of dependents) {
            const incoming = reverse.get(dependent) ?? [];
            incoming.push(id);
            reverse.set(dependent, incoming);
        }
    }
    const visited = new Set<number>();
    const order: number[] = [];
    for (const id of byId.keys()) {
        if (visited.has(id)) {
            continue;
        }
        visited.add(id);
        const stack = [{ id, next: 0 }];
        while (stack.length) {
            const frame = stack[stack.length - 1];
            const children = edges.get(frame.id)!;
            if (frame.next === children.length) {
                order.push(frame.id);
                stack.pop();
                continue;
            }
            const child = children[frame.next++];
            if (!visited.has(child)) {
                visited.add(child);
                stack.push({ id: child, next: 0 });
            }
        }
    }
    visited.clear();
    const groups: T[][] = [];
    for (let i = order.length - 1; i >= 0; i--) {
        const id = order[i];
        if (visited.has(id)) {
            continue;
        }
        const group: T[] = [];
        const stack = [id];
        visited.add(id);
        while (stack.length) {
            const current = stack.pop()!;
            group.push(byId.get(current)!);
            for (const parent of reverse.get(current) ?? []) {
                if (!visited.has(parent)) {
                    visited.add(parent);
                    stack.push(parent);
                }
            }
        }
        groups.push(group);
    }
    return groups;
}
