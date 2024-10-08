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

import type { IRTreeItem, IUnitRange, Nullable } from '@univerjs/core';
import type { FormulaDependencyTree } from '../engine/dependency/dependency-tree';
import { createIdentifier, Disposable, ObjectMatrix, RTree } from '@univerjs/core';

export interface IOtherFormulaDependencyParam {
    [unitId: string]: Nullable<{ [sheetId: string]: { [formulaId: string]: Nullable<FormulaDependencyTree> } }>;
}

export interface IFeatureFormulaDependencyParam {
    [unitId: string]: Nullable<{ [sheetId: string]: { [featureId: string]: Nullable<FormulaDependencyTree> } }>;
}

export interface IFormulaDependencyParam {
    [unitId: string]: Nullable<{ [sheetId: string]: ObjectMatrix<Nullable<FormulaDependencyTree>> }>;
}

export interface IDependencyManagerService {
    dispose(): void;

    getAllTree(): FormulaDependencyTree[];

    buildDependencyTree(shouldBeBuildTrees: FormulaDependencyTree[], dependencyTrees?: FormulaDependencyTree[]): FormulaDependencyTree[];

    clearDependencyForTree(shouldBeClearTree: Nullable<FormulaDependencyTree>): void;

    reset(): void;

    addOtherFormulaDependency(unitId: string, sheetId: string, formulaId: string, dependencyTree: FormulaDependencyTree): void;

    removeOtherFormulaDependency(unitId: string, sheetId: string, formulaId: string[]): void;

    getOtherFormulaDependency(unitId: string, sheetId: string, formulaId: string): Nullable<FormulaDependencyTree>;

    addFeatureFormulaDependency(unitId: string, sheetId: string, featureId: string, dependencyTree: FormulaDependencyTree): void;

    removeFeatureFormulaDependency(unitId: string, sheetId: string, featureIds: string[]): void;

    getFeatureFormulaDependency(unitId: string, sheetId: string, featureId: string): Nullable<FormulaDependencyTree>;

    addFormulaDependency(unitId: string, sheetId: string, row: number, column: number, dependencyTree: FormulaDependencyTree): void;

    removeFormulaDependency(unitId: string, sheetId: string, row: number, column: number): void;

    getFormulaDependency(unitId: string, sheetId: string, row: number, column: number): Nullable<FormulaDependencyTree>;

    clearFormulaDependency(unitId: string, sheetId?: string): void;

    addDependencyRTreeCache(tree: FormulaDependencyTree): void;

    searchDependency(search: IUnitRange[]): Map<string, IRTreeItem>;

    hasTreeIdInCache(treeId: string): boolean;
}

/**
 * Passively marked as dirty, register the reference and execution actions of the feature plugin.
 * After execution, a dirty area and calculated data will be returned,
 * causing the formula to be marked dirty again,
 * thereby completing the calculation of the entire dependency tree.
 */
export class DependencyManagerService extends Disposable implements IDependencyManagerService {
    private _otherFormulaData: IOtherFormulaDependencyParam = {};

    private _featureFormulaData: IFeatureFormulaDependencyParam = {};

    private _formulaData: IFormulaDependencyParam = {};

    private _dependencyRTreeCache: RTree = new RTree();

    private _dependencyTreeIdsCache: Set<string> = new Set();

    override dispose(): void {
        this._otherFormulaData = {};
        this._featureFormulaData = {};
        this._formulaData = {};
        this._dependencyRTreeCache.dispose();
        this._clearTreeIdCache();
    }

    /**
     * Get all FormulaDependencyTree from _otherFormulaData, _featureFormulaData, _formulaData
     * return FormulaDependencyTree[]
     */
    getAllTree() {
        const trees: FormulaDependencyTree[] = [];

        Object.values(this._otherFormulaData).forEach((unit) => {
            if (unit == null) {
                return true;
            }
            Object.values(unit).forEach((sheet) => {
                Object.values(sheet).forEach((formula) => {
                    if (formula) {
                        formula.resetState();
                        trees.push(formula);
                    }
                });
            });
        });

        Object.values(this._featureFormulaData).forEach((unit) => {
            if (unit == null) {
                return true;
            }
            Object.values(unit).forEach((sheet) => {
                Object.values(sheet).forEach((feature) => {
                    if (feature) {
                        feature.resetState();
                        trees.push(feature);
                    }
                });
            });
        });

        Object.values(this._formulaData).map((unit) => {
            if (unit == null) {
                return [];
            }
            return Object.values(unit).forEach((sheet) => {
                return sheet.forValue((row, col, item) => {
                    if (item) {
                        item.resetState();
                        trees.push(item);
                    }
                });
            });
        });

        return trees;
    }

    buildDependencyTree(shouldBeBuildTrees: FormulaDependencyTree[], dependencyTrees: FormulaDependencyTree[] = []): FormulaDependencyTree[] {
        const allTrees = this.getAllTree();
        if (shouldBeBuildTrees.length === 0) {
            this._buildReverseDependency(allTrees, dependencyTrees);
            return allTrees;
        }

        this._buildDependencyTree(allTrees, shouldBeBuildTrees);
        this._buildReverseDependency(allTrees, shouldBeBuildTrees);
        return allTrees;
    }

    searchDependency(search: IUnitRange[]): Map<string, IRTreeItem> {
        return this._dependencyRTreeCache.bulkSearch(search);
    }

    /**
     * Build the dependency relationship between the trees.
     * @param allTrees  all FormulaDependencyTree
     * @param shouldBeBuildTrees  FormulaDependencyTree[] | FormulaDependencyTreeCache
     */
    private _buildDependencyTree(allTrees: FormulaDependencyTree[], shouldBeBuildTrees: FormulaDependencyTree[]) {
        const shouldBeBuildTreeMap = new Map<string, FormulaDependencyTree>();
        shouldBeBuildTrees.forEach((tree) => shouldBeBuildTreeMap.set(tree.treeId, tree));

        allTrees.forEach((tree) => {
            const RTreeItem = tree.toRTreeItem();
            const searchResults = this._dependencyRTreeCache.search(RTreeItem);

            searchResults.forEach((searchResult) => {
                const shouldBeBuildTree = shouldBeBuildTreeMap.get(searchResult.id);
                if (shouldBeBuildTree) {
                    if (tree === shouldBeBuildTree || shouldBeBuildTree.hasChildren(tree)) {
                        return;
                    }
                    shouldBeBuildTree.pushChildren(tree);
                }
            });

            // shouldBeBuildTrees.forEach((shouldBeBuildTree) => {
            //     if (tree === shouldBeBuildTree || shouldBeBuildTree.children.includes(tree)) {
            //         return true;
            //     }

            //     if (shouldBeBuildTree.dependency(tree)) {
            //         shouldBeBuildTree.pushChildren(tree);
            //     }
            // });
        });
        shouldBeBuildTreeMap.clear();
    }

    /**
     * Build the reverse dependency relationship between the trees.
     * @param allTrees
     * @param dependencyTrees
     */
    private _buildReverseDependency(allTrees: FormulaDependencyTree[], dependencyTrees: FormulaDependencyTree[]) {
        const allTreeMap = new Map<string, FormulaDependencyTree>();
        allTrees.forEach((tree) => allTreeMap.set(tree.treeId, tree));

        dependencyTrees.forEach((tree) => {
            const RTreeItem = tree.toRTreeItem();
            const searchResults = this._dependencyRTreeCache.search(RTreeItem);

            searchResults.forEach((searchResult) => {
                const allTree = allTreeMap.get(searchResult.id);
                if (allTree) {
                    if (tree === allTree || allTree.hasChildren(tree)) {
                        return;
                    }
                    allTree.pushChildren(tree);
                }
            });
        });

        allTreeMap.clear();

        // allTrees.forEach((tree) => {
        //     dependencyTrees?.forEach((dependencyTree) => {
        //         if (tree === dependencyTree || tree.children.includes(dependencyTree)) {
        //             return true;
        //         }

        //         if (tree.dependency(dependencyTree)) {
        //             tree.pushChildren(dependencyTree);
        //         }
        //     });
        // });
    }

    /**
     * Clear the dependency relationship of the tree.
     * establish the relationship between the parent and the child.
     * @param shouldBeClearTree
     */
    clearDependencyForTree(shouldBeClearTree: Nullable<FormulaDependencyTree>) {
        if (shouldBeClearTree == null) {
            return;
        }

        const parents = shouldBeClearTree.parents;

        const children = shouldBeClearTree.children;

        parents.forEach((parent) => {
            parent.children.delete(shouldBeClearTree);
        });

        children.forEach((child) => {
            child.parents.delete(shouldBeClearTree);
        });

        const parentsArray = [...parents];
        const childrenArray = [...children];

        this._buildDependencyTree(parentsArray, childrenArray);
        this._buildReverseDependency(parentsArray, childrenArray);

        shouldBeClearTree.dispose();
    }

    reset() {
        this._otherFormulaData = {};
        this._featureFormulaData = {};
        this._formulaData = {};
        this._dependencyRTreeCache.clear();
        this._clearTreeIdCache();
    }

    addOtherFormulaDependency(unitId: string, sheetId: string, formulaId: string, dependencyTree: FormulaDependencyTree) {
        if (!this._otherFormulaData[unitId]) {
            this._otherFormulaData[unitId] = {};
        }
        if (!this._otherFormulaData[unitId]![sheetId]) {
            this._otherFormulaData[unitId]![sheetId] = {};
        }

        this._otherFormulaData[unitId]![sheetId][formulaId] = dependencyTree;

        this._addTreeIdToCache(dependencyTree);
    }

    removeOtherFormulaDependency(unitId: string, sheetId: string, formulaIds: string[]) {
        if (this._otherFormulaData[unitId] && this._otherFormulaData[unitId]![sheetId]) {
            formulaIds.forEach((formulaId) => {
                const deleteTree = this._otherFormulaData[unitId]![sheetId][formulaId];
                this._removeDependencyRTreeCache(deleteTree);
                this.clearDependencyForTree(deleteTree);
                delete this._otherFormulaData[unitId]![sheetId][formulaId];

                this._removeTreeIdFromCache(deleteTree);
            });
        }
    }

    getOtherFormulaDependency(unitId: string, sheetId: string, formulaId: string) {
        return this._otherFormulaData[unitId]?.[sheetId]?.[formulaId];
    }

    hasOtherFormulaDependency(unitId: string, sheetId: string, formulaId: string) {
        return this._otherFormulaData[unitId]?.[sheetId]?.[formulaId] != null;
    }

    addFeatureFormulaDependency(unitId: string, sheetId: string, featureId: string, dependencyTree: FormulaDependencyTree) {
        if (!this._featureFormulaData[unitId]) {
            this._featureFormulaData[unitId] = {};
        }
        if (!this._featureFormulaData[unitId]![sheetId]) {
            this._featureFormulaData[unitId]![sheetId] = {};
        }

        this._featureFormulaData[unitId]![sheetId][featureId] = dependencyTree;

        this._addTreeIdToCache(dependencyTree);
    }

    removeFeatureFormulaDependency(unitId: string, sheetId: string, featureIds: string[]) {
        if (this._featureFormulaData[unitId] && this._featureFormulaData[unitId]![sheetId]) {
            featureIds.forEach((featureId) => {
                const deleteTree = this._featureFormulaData[unitId]![sheetId][featureId];
                this._removeDependencyRTreeCache(deleteTree);
                this.clearDependencyForTree(deleteTree);
                delete this._featureFormulaData[unitId]![sheetId][featureId];

                this._removeTreeIdFromCache(deleteTree);
            });
        }
    }

    getFeatureFormulaDependency(unitId: string, sheetId: string, featureId: string) {
        return this._featureFormulaData[unitId]?.[sheetId]?.[featureId];
    }

    addFormulaDependency(unitId: string, sheetId: string, row: number, column: number, dependencyTree: FormulaDependencyTree) {
        if (!this._formulaData[unitId]) {
            this._formulaData[unitId] = {};
        }
        if (!this._formulaData[unitId]![sheetId]) {
            this._formulaData[unitId]![sheetId] = new ObjectMatrix<Nullable<FormulaDependencyTree>>();
        }
        this._formulaData[unitId]![sheetId].setValue(row, column, dependencyTree);

        this._addTreeIdToCache(dependencyTree);
    }

    removeFormulaDependency(unitId: string, sheetId: string, row: number, column: number) {
        if (this._formulaData[unitId] && this._formulaData[unitId]![sheetId]) {
            const deleteTree = this._formulaData[unitId]![sheetId].getValue(row, column);
            this._removeDependencyRTreeCache(deleteTree);
            this.clearDependencyForTree(deleteTree);
            this._formulaData[unitId]![sheetId].realDeleteValue(row, column);

            this._removeTreeIdFromCache(deleteTree);
        }
    }

    clearFormulaDependency(unitId: string, sheetId?: string) {
        if (sheetId && this._formulaData[unitId] && this._formulaData[unitId]![sheetId]) {
            this._formulaData[unitId]![sheetId].forValue((row, column, item) => {
                this._removeTreeIdFromCache(item);
            });

            this._formulaData[unitId]![sheetId].reset();
        } else if (this._formulaData[unitId]) {
            Object.values(this._formulaData[unitId]!).forEach((sheet) => {
                sheet.forValue((row, column, item) => {
                    this._removeTreeIdFromCache(item);
                });
            });

            this._formulaData[unitId] = null;
        }
    }

    getFormulaDependency(unitId: string, sheetId: string, row: number, column: number) {
        return this._formulaData[unitId]?.[sheetId]?.getValue(row, column);
    }

    addDependencyRTreeCache(tree: FormulaDependencyTree) {
        this._dependencyRTreeCache.bulkInsert(tree.rangeList.map((range) => {
            return {
                ...range,
                id: tree.treeId,
            };
        }));
    }

    private _addTreeIdToCache(tree: FormulaDependencyTree) {
        this._dependencyTreeIdsCache.add(tree.treeId);
    }

    private _removeTreeIdFromCache(tree: Nullable<FormulaDependencyTree>) {
        if (tree == null) {
            return;
        }
        this._dependencyTreeIdsCache.delete(tree.treeId);
    }

    private _clearTreeIdCache() {
        this._dependencyTreeIdsCache.clear();
    }

    hasTreeIdInCache(treeId: string) {
        return this._dependencyTreeIdsCache.has(treeId);
    }

    private _removeDependencyRTreeCache(tree: Nullable<FormulaDependencyTree>) {
        if (tree == null) {
            return;
        }
        this._dependencyRTreeCache.bulkRemove(tree.rangeList.map((range) => {
            return {
                ...range,
                id: tree.treeId,
            };
        }));
    }
}

export const IDependencyManagerService = createIdentifier<DependencyManagerService>(
    'univer.formula.dependency-manager.service'
);
