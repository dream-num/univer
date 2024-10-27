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
    [unitId: string]: Nullable<{ [sheetId: string]: { [formulaId: string]: Nullable<number> } }>;
}

export interface IFeatureFormulaDependencyParam {
    [unitId: string]: Nullable<{ [sheetId: string]: { [featureId: string]: Nullable<number> } }>;
}

export interface IFormulaDependencyParam {
    [unitId: string]: Nullable<{ [sheetId: string]: ObjectMatrix< number> }>;
}

export interface IDependencyManagerService {
    dispose(): void;

    getAllTree(): FormulaDependencyTree[];

    // buildDependencyTree(shouldBeBuildTrees: FormulaDependencyTree[], dependencyTrees?: FormulaDependencyTree[]): FormulaDependencyTree[];

    // clearDependencyForTree(shouldBeClearTree: Nullable<FormulaDependencyTree>): void;

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

    removeFormulaDependencyByDefinedName(unitId: string, definedName: string): void;

    clearFormulaDependency(unitId: string, sheetId?: string): void;

    addDependencyRTreeCache(tree: FormulaDependencyTree): void;

    searchDependency(search: IUnitRange[]): Set<number>;

    getLastTreeId(): number;

    clearDependencyAll(): void;

    clearOtherFormulaDependency(unitId: string, sheetId?: string): void;
    clearFeatureFormulaDependency(unitId: string, sheetId?: string): void;

    openKdTree(): void;
    closeKdTree(): void;

    getTreeById(treeId: number): Nullable<FormulaDependencyTree>;
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

    private _allTreeMap: Map<number, FormulaDependencyTree> = new Map();

    private _dependencyRTreeCache: RTree = new RTree(true); // true: open kd-tree search state

    private _dependencyTreeIdLast: number = 0;

    override dispose(): void {
        this._otherFormulaData = {};
        this._featureFormulaData = {};
        this._formulaData = {};
        this._dependencyRTreeCache.dispose();
        this._restDependencyTreeId();
        this._allTreeMap.clear();
    }

    /**
     * Get all FormulaDependencyTree from _otherFormulaData, _featureFormulaData, _formulaData
     * return FormulaDependencyTree[]
     */
    getAllTree() {
        // const trees: FormulaDependencyTree[] = [];

        // const resetAndPush = (item: FormulaDependencyTree) => {
        //     if (item) {
        //         item.resetState();
        //         trees.push(item);
        //     }
        // };

        // // _otherFormulaData
        // for (const unitKey in this._otherFormulaData) {
        //     const unit = this._otherFormulaData[unitKey];
        //     if (!unit) continue;

        //     for (const sheetKey in unit) {
        //         const sheet = unit[sheetKey];
        //         for (const formulaKey in sheet) {
        //             if (sheet[formulaKey] == null) {
        //                 continue;
        //             }
        //             resetAndPush(sheet[formulaKey]);
        //         }
        //     }
        // }

        // // _featureFormulaData
        // for (const unitKey in this._featureFormulaData) {
        //     const unit = this._featureFormulaData[unitKey];
        //     if (!unit) continue;

        //     for (const sheetKey in unit) {
        //         const sheet = unit[sheetKey];
        //         for (const featureKey in sheet) {
        //             if (sheet[featureKey] == null) {
        //                 continue;
        //             }
        //             resetAndPush(sheet[featureKey]);
        //         }
        //     }
        // }

        // // _formulaData
        // for (const unitKey in this._formulaData) {
        //     const unit = this._formulaData[unitKey];
        //     if (!unit) continue;

        //     for (const sheetKey in unit) {
        //         const sheet = unit[sheetKey];
        //         sheet.forValue((row, col, item) => {
        //             if (item == null) {
        //                 return true;
        //             }
        //             resetAndPush(item);
        //         });
        //     }
        // }

        const trees: FormulaDependencyTree[] = [];
        this._allTreeMap.forEach((tree) => {
            tree.resetState();
            trees.push(tree);
        });

        return trees;
    }

    getTreeById(treeId: number) {
        return this._allTreeMap.get(treeId);
    }

    searchDependency(search: IUnitRange[]): Set<number> {
        return this._dependencyRTreeCache.bulkSearch(search) as Set<number>;
    }

    reset() {
        this._otherFormulaData = {};
        this._featureFormulaData = {};
        this._formulaData = {};
        this._dependencyRTreeCache.clear();
        this._allTreeMap.clear();
        this._restDependencyTreeId();
    }

    addOtherFormulaDependency(unitId: string, sheetId: string, formulaId: string, dependencyTree: FormulaDependencyTree) {
        if (!this._otherFormulaData[unitId]) {
            this._otherFormulaData[unitId] = {};
        }
        if (!this._otherFormulaData[unitId]![sheetId]) {
            this._otherFormulaData[unitId]![sheetId] = {};
        }

        this._otherFormulaData[unitId]![sheetId][formulaId] = dependencyTree.treeId;
        this._allTreeMap.set(dependencyTree.treeId, dependencyTree);
    }

    removeOtherFormulaDependency(unitId: string, sheetId: string, formulaIds: string[]) {
        if (this._otherFormulaData[unitId] && this._otherFormulaData[unitId]![sheetId]) {
            formulaIds.forEach((formulaId) => {
                const deleteTreeId = this._otherFormulaData[unitId]![sheetId][formulaId];
                if (deleteTreeId == null) {
                    return;
                }
                const deleteTree = this._allTreeMap.get(deleteTreeId);
                this._removeDependencyRTreeCache(deleteTree);
                // this.clearDependencyForTree(deleteTree);
                delete this._otherFormulaData[unitId]![sheetId][formulaId];
                this._removeAllTreeMap(deleteTreeId);
            });
        }
    }

    getOtherFormulaDependency(unitId: string, sheetId: string, formulaId: string) {
        let treeId = this._otherFormulaData[unitId]?.[sheetId]?.[formulaId];
        if (treeId == null) {
            treeId = -1;
        }
        return this._allTreeMap.get(treeId);
    }

    hasOtherFormulaDependency(unitId: string, sheetId: string, formulaId: string) {
        return this.getOtherFormulaDependency(unitId, sheetId, formulaId) != null;
    }

    clearOtherFormulaDependency(unitId: string, sheetId?: string) {
        if (sheetId && this._otherFormulaData[unitId] && this._otherFormulaData[unitId]![sheetId]) {
            this._removeDependencyRTreeCacheById(unitId, sheetId);
            Object.values(this._otherFormulaData[unitId]![sheetId]).forEach((formulaTreeId) => {
                if (formulaTreeId == null) {
                    return;
                }
                const formula = this._allTreeMap.get(formulaTreeId);
                // this.clearDependencyForTree(formula);
                this._removeAllTreeMap(formulaTreeId);
            });

            this._otherFormulaData[unitId]![sheetId] = {};
        } else if (this._otherFormulaData[unitId]) {
            const unitOtherData = this._otherFormulaData[unitId]!;
            Object.keys(unitOtherData).forEach((sheetId) => {
                if (sheetId == null) {
                    return;
                }
                this._removeDependencyRTreeCacheById(unitId, sheetId);
                Object.values(unitOtherData[sheetId]!).forEach((formulaTreeId) => {
                    if (formulaTreeId == null) {
                        return;
                    }
                    const formula = this._allTreeMap.get(formulaTreeId);
                    // this.clearDependencyForTree(formula);
                    this._removeAllTreeMap(formulaTreeId);
                });
            });

            this._otherFormulaData[unitId] = null;
        }
    }

    addFeatureFormulaDependency(unitId: string, sheetId: string, featureId: string, dependencyTree: FormulaDependencyTree) {
        if (!this._featureFormulaData[unitId]) {
            this._featureFormulaData[unitId] = {};
        }
        if (!this._featureFormulaData[unitId]![sheetId]) {
            this._featureFormulaData[unitId]![sheetId] = {};
        }

        this._featureFormulaData[unitId]![sheetId][featureId] = dependencyTree.treeId;
        this._allTreeMap.set(dependencyTree.treeId, dependencyTree);
    }

    removeFeatureFormulaDependency(unitId: string, sheetId: string, featureIds: string[]) {
        if (this._featureFormulaData[unitId] && this._featureFormulaData[unitId]![sheetId]) {
            featureIds.forEach((featureId) => {
                const deleteTreeId = this._featureFormulaData[unitId]![sheetId][featureId];
                if (deleteTreeId == null) {
                    return;
                }
                const deleteTree = this._allTreeMap.get(deleteTreeId);
                this._removeDependencyRTreeCache(deleteTree);
                // this.clearDependencyForTree(deleteTree);
                delete this._featureFormulaData[unitId]![sheetId][featureId];
                this._removeAllTreeMap(deleteTreeId);
            });
        }
    }

    clearFeatureFormulaDependency(unitId: string, sheetId?: string) {
        if (sheetId && this._featureFormulaData[unitId] && this._featureFormulaData[unitId]![sheetId]) {
            this._removeDependencyRTreeCacheById(unitId, sheetId);
            Object.values(this._featureFormulaData[unitId]![sheetId]).forEach((featureTreeId) => {
                if (featureTreeId == null) {
                    return;
                }
                const feature = this._allTreeMap.get(featureTreeId);
                this._removeDependencyRTreeCache(feature);
                // this.clearDependencyForTree(feature);
                this._removeAllTreeMap(featureTreeId);
            });

            this._featureFormulaData[unitId]![sheetId] = {};
        } else if (this._featureFormulaData[unitId]) {
            const unitFeatureData = this._featureFormulaData[unitId]!;
            Object.keys(unitFeatureData).forEach((sheetId) => {
                if (sheetId == null) {
                    return;
                }
                this._removeDependencyRTreeCacheById(unitId, sheetId);
                Object.values(unitFeatureData[sheetId]!).forEach((featureTreeId) => {
                    if (featureTreeId == null) {
                        return;
                    }
                    const feature = this._allTreeMap.get(featureTreeId);
                    // this.clearDependencyForTree(feature);
                    this._removeAllTreeMap(featureTreeId);
                });
            });

            this._featureFormulaData[unitId] = null;
        }
    }

    getFeatureFormulaDependency(unitId: string, sheetId: string, featureId: string) {
        const treeId = this._featureFormulaData[unitId]?.[sheetId]?.[featureId];
        if (treeId == null) {
            return null;
        }
        return this._allTreeMap.get(treeId);
    }

    addFormulaDependency(unitId: string, sheetId: string, row: number, column: number, dependencyTree: FormulaDependencyTree) {
        if (!this._formulaData[unitId]) {
            this._formulaData[unitId] = {};
        }
        if (!this._formulaData[unitId]![sheetId]) {
            this._formulaData[unitId]![sheetId] = new ObjectMatrix<number>();
        }
        this._formulaData[unitId]![sheetId].setValue(row, column, dependencyTree.treeId);
        this._allTreeMap.set(dependencyTree.treeId, dependencyTree);
    }

    removeFormulaDependency(unitId: string, sheetId: string, row: number, column: number) {
        if (this._formulaData[unitId] && this._formulaData[unitId]![sheetId]) {
            const deleteTreeId = this._formulaData[unitId]![sheetId].getValue(row, column);
            if (deleteTreeId == null) {
                return;
            }
            const deleteTree = this._allTreeMap.get(deleteTreeId);
            this._removeDependencyRTreeCache(deleteTree);
            // this.clearDependencyForTree(deleteTree);
            this._formulaData[unitId]![sheetId].realDeleteValue(row, column);
            this._removeAllTreeMap(deleteTreeId);
        }
    }

    clearFormulaDependency(unitId: string, sheetId?: string) {
        if (sheetId && this._formulaData[unitId] && this._formulaData[unitId]![sheetId]) {
            this._removeDependencyRTreeCacheById(unitId, sheetId);
            this._formulaData[unitId]![sheetId].forValue((row, column, treeId) => {
                if (treeId == null) {
                    return true;
                }
                const tree = this._allTreeMap.get(treeId);
                // this.clearDependencyForTree(tree);
                this._removeAllTreeMap(treeId);
            });

            this._formulaData[unitId]![sheetId].reset();
        } else if (this._formulaData[unitId]) {
            const unitFormulaData = this._formulaData[unitId]!;
            Object.keys(unitFormulaData).forEach((sheetId) => {
                if (sheetId == null) {
                    return;
                }
                this._removeDependencyRTreeCacheById(unitId, sheetId);
                unitFormulaData[sheetId].forValue((row, column, treeId) => {
                    if (treeId == null) {
                        return true;
                    }
                    const tree = this._allTreeMap.get(treeId);
                    // this.clearDependencyForTree(tree);
                    this._removeAllTreeMap(treeId);
                });
            });

            this._formulaData[unitId] = null;
        }
    }

    clearDependencyAll() {
        this._otherFormulaData = {};
        this._featureFormulaData = {};
        this._formulaData = {};
        this._dependencyRTreeCache.clear();
        this._restDependencyTreeId();
    }

    getFormulaDependency(unitId: string, sheetId: string, row: number, column: number) {
        const treeId = this._formulaData[unitId]?.[sheetId]?.getValue(row, column);
        if (treeId == null) {
            return null;
        }
        return this._allTreeMap.get(treeId);
    }

    addDependencyRTreeCache(tree: FormulaDependencyTree) {
        const searchRanges: IRTreeItem[] = [];
        for (let i = 0; i < tree.rangeList.length; i++) {
            const unitRangeWithNum = tree.rangeList[i];
            const { unitId, sheetId, range } = unitRangeWithNum;

            searchRanges.push({
                unitId,
                sheetId,
                range,
                id: tree.treeId,
            });
        }

        this._dependencyRTreeCache.bulkInsert(searchRanges);
    }

    private _restDependencyTreeId() {
        this._dependencyTreeIdLast = 0;
    }

    getLastTreeId() {
        const id = this._dependencyTreeIdLast;
        this._dependencyTreeIdLast++;
        return id;
    }

    private _removeDependencyRTreeCacheById(unitId: string, sheetId: string) {
        this._dependencyRTreeCache.removeById(unitId, sheetId);
    }

    private _removeDependencyRTreeCache(tree: Nullable<FormulaDependencyTree>) {
        if (tree == null) {
            return;
        }

        const searchRanges: IRTreeItem[] = [];
        for (let i = 0; i < tree.rangeList.length; i++) {
            const unitRangeWithNum = tree.rangeList[i];
            const { unitId, sheetId, range } = unitRangeWithNum;

            searchRanges.push({
                unitId,
                sheetId,
                range,
                id: tree.treeId,
            });
        }

        this._dependencyRTreeCache.bulkRemove(searchRanges);
    }

    removeFormulaDependencyByDefinedName(unitId: string, definedName: string) {
        if (this._formulaData[unitId]) {
            Object.values(this._formulaData[unitId]).forEach((sheet) => {
                sheet.forValue((row, column, treeId) => {
                    const tree = this._allTreeMap.get(treeId);
                    if (tree?.nodeData?.node.hasDefinedName(definedName)) {
                        this._removeDependencyRTreeCache(tree);
                        // this.clearDependencyForTree(tree);
                        sheet.realDeleteValue(row, column);
                    }
                });
            });
        }
    }

    openKdTree() {
        this._dependencyRTreeCache.openKdTree();
    }

    closeKdTree() {
        this._dependencyRTreeCache.closeKdTree();
    }

    private _removeAllTreeMap(treeId: Nullable<number>) {
        if (treeId == null) {
            return;
        }
        this._allTreeMap.delete(treeId);
    }
}

export const IDependencyManagerService = createIdentifier<DependencyManagerService>(
    'univer.formula.dependency-manager.service'
);
