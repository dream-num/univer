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

import type { ITreeNodeProps } from './Tree';

export const findNodePathFromTree = (tree: ITreeNodeProps[], key: string) => {
    const result: string[] = [];
    const recursive = (node: ITreeNodeProps) => {
        result.push(node.key);
        if (key === node.key) {
            return true;
        }
        if (node.children?.length) {
            if (node.children.some(recursive)) {
                return true;
            }
        }
        result.pop();
    };
    tree.some(recursive);
    return result;
};

export const createCacheWithFindNodePathFromTree = (tree: ITreeNodeProps[], defaultCache?: Map<string, string[]>) => {
    const cache = defaultCache ?? new Map<string, string[]>();
    let cacheTree = tree;
    return {
        findNodePathFromTreeWithCache: (key: string) => {
            const cacheValue = cache.get(key);
            if (cacheValue) {
                return cacheValue;
            }
            const path = findNodePathFromTree(cacheTree, key);
            const pathList = path.map((k, index, arr) => {
                const result: string[] = [];
                for (let i = 0; i <= index; i++) {
                    result.push(arr[i]);
                }
                return result;
            }).reverse();
            pathList.forEach((list) => {
                const key = list[list.length - 1];
                cache.set(key, list);
            });
            return path;
        },
        reset: (newTree?: ITreeNodeProps[]) => {
            cache.clear();
            if (newTree) {
                cacheTree = newTree;
            }
        },
    };
};

export const findSubTreeFromPath = (tree: ITreeNodeProps[], path: string[]) => {
    if (!path.length) {
        return tree;
    }
    return path.reduce((list, key) => {
        const item = list.find((node) => node.key === key);
        return item?.children || [];
    }, tree);
};

export const findNodeFromPath = (tree: ITreeNodeProps[], _path: string[]) => {
    const path = _path.slice(0);
    const key = path.pop();
    const list = findSubTreeFromPath(tree, path);
    return list.find((node) => node.key === key);
};

export const mergeTreeSelected = (treeData: ITreeNodeProps[], treeSelected: string[], path: string[]) => {
    const set = new Set(treeSelected);
    const key = path[path.length - 1];
    const subTree = findSubTreeFromPath(treeData, path);
    if (!set.has(key)) {
        const addRecursive = (node: ITreeNodeProps) => {
            set.add(node.key);
            if (node.children) {
                node.children.forEach((n) => addRecursive(n));
            }
        };
        path.forEach((k) => set.add(k));
        if (subTree.length) {
            subTree.forEach(addRecursive);
        }
    } else {
        if (subTree.length) {
            const deleteRecursive = (node: ITreeNodeProps) => {
                set.delete(node.key);
                if (node.children) {
                    node.children.forEach((n) => deleteRecursive(n));
                }
            };
            subTree.forEach(deleteRecursive);
        }
        const pathList = path.map((k, index, arr) => {
            const result: string[] = [];
            for (let i = 0; i <= index; i++) {
                result.push(arr[i]);
            }
            return result;
        }).reverse();
        pathList.some((path) => {
            const list = findSubTreeFromPath(treeData, path);
            const key = path[path.length - 1];
            if (list.every((e) => !set.has(e.key))) {
                set.delete(key);
            } else {
                return true;
            }
            return false;
        });
    }
    return [...set];
};

export const isIntermediated = (treeSelected: Set<string>, node: ITreeNodeProps) => {
    const list = node.children || [];
    const checkIsSelected = (node: ITreeNodeProps) => {
        if (node.children?.length) {
            const isAllChecked = node.children.every(checkIsSelected);
            if (isAllChecked) {
                return true;
            }
            return false;
        }
        return treeSelected.has(node.key);
    };

    if (list.length) {
        return list.some((node) => !checkIsSelected(node));
    }
    return false;
};

export const filterLeafNode = (tree: ITreeNodeProps[], keyList: string[]) => {
    const result: ITreeNodeProps[] = [];
    const find = createCacheWithFindNodePathFromTree(tree);
    keyList.forEach((key) => {
        const path = find.findNodePathFromTreeWithCache(key);
        const node = findNodeFromPath(tree, path);
        if (node) {
            if (!node.children?.length) {
                result.push(node);
            }
        }
    });
    return result;
};
