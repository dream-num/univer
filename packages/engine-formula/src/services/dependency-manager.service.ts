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

import type { Nullable } from '@univerjs/core';
import { Disposable, ObjectMatrix } from '@univerjs/core';
import { createIdentifier } from '@wendellhu/redi';
import { FormulaDependencyTreeCache } from '../engine/dependency/dependency-tree';
import type { FormulaDependencyTree } from '../engine/dependency/dependency-tree';

export interface IOtherFormulaDependencyParam {
    [unitId: string]: Nullable<{ [sheetId: string]: { [formulaId: string]: Nullable<FormulaDependencyTree> } }>;
}

export interface IFormulaDependencyParam {
    [unitId: string]: Nullable<{ [sheetId: string]: ObjectMatrix<Nullable<FormulaDependencyTree>> }>;
}

export interface IDependencyManagerService {
    dispose(): void;

    getAllTree(): FormulaDependencyTree[];

    buildDependencyTree(shouldBeBuildTrees: FormulaDependencyTree[] | FormulaDependencyTreeCache): FormulaDependencyTree[];

    clearDependencyForTree(shouldBeClearTree: Nullable<FormulaDependencyTree>): void;

    reset(): void;

    addOtherFormulaDependency(unitId: string, sheetId: string, formulaId: string, dependencyTree: FormulaDependencyTree): void;

    removeOtherFormulaDependency(unitId: string, sheetId: string, formulaId: string[]): void;

    hasOtherFormulaDependency(unitId: string, sheetId: string, formulaId: string): boolean;

    addFeatureFormulaDependency(featureId: string, dependencyTree: FormulaDependencyTree): void;

    removeFeatureFormulaDependency(featureId: string): void;

    hasFeatureFormulaDependency(unitId: string, sheetId: string, featureId: string): boolean;

    addFormulaDependency(unitId: string, sheetId: string, row: number, column: number, dependencyTree: FormulaDependencyTree): void;

    removeFormulaDependency(unitId: string, sheetId: string, row: number, column: number): void;

    hasFormulaDependency(unitId: string, sheetId: string, row: number, column: number): boolean;

    clearFormulaDependency(unitId: string, sheetId: string): void;
}

/**
 * Passively marked as dirty, register the reference and execution actions of the feature plugin.
 * After execution, a dirty area and calculated data will be returned,
 * causing the formula to be marked dirty again,
 * thereby completing the calculation of the entire dependency tree.
 */
export class DependencyManagerService extends Disposable implements IDependencyManagerService {
    private _otherFormulaData: IOtherFormulaDependencyParam = {};

    private _featureFormulaData: Map<string, FormulaDependencyTree> = new Map();

    private _formulaData: IFormulaDependencyParam = {};

    override dispose(): void {
        this._otherFormulaData = {};
        this._featureFormulaData.clear();
        this._formulaData = {};
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

        this._featureFormulaData.forEach((feature) => {
            if (feature) {
                feature.resetState();
                trees.push(feature);
            }
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

    buildDependencyTree(shouldBeBuildTrees: FormulaDependencyTree[] | FormulaDependencyTreeCache): FormulaDependencyTree[] {
        const allTrees = this.getAllTree();
        if (shouldBeBuildTrees.length === 0) {
            return allTrees;
        }
        this._buildDependencyTree(allTrees, shouldBeBuildTrees);
        return allTrees;
    }

    /**
     * Build the dependency relationship between the trees.
     * @param allTrees  all FormulaDependencyTree
     * @param shouldBeBuildTrees  FormulaDependencyTree[] | FormulaDependencyTreeCache
     */
    private _buildDependencyTree(allTrees: FormulaDependencyTree[], shouldBeBuildTrees: FormulaDependencyTree[] | FormulaDependencyTreeCache) {
        allTrees.forEach((tree) => {
            if (shouldBeBuildTrees instanceof FormulaDependencyTreeCache) {
                shouldBeBuildTrees.dependency(tree);
            } else {
                shouldBeBuildTrees.forEach((shouldBeBuildTree) => {
                    if (tree === shouldBeBuildTree) {
                        return true;
                    }

                    if (shouldBeBuildTree.dependency(tree)) {
                        shouldBeBuildTree.pushChildren(tree);
                    }
                });
            }
        });
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
            parent.children = parent.children.filter((child) => child !== shouldBeClearTree);
        });

        children.forEach((child) => {
            child.parents = child.parents.filter((parent) => parent !== shouldBeClearTree);
        });

        this._buildDependencyTree(parents, children);

        shouldBeClearTree.dispose();
    }

    reset() {
        this._otherFormulaData = {};
        this._featureFormulaData.clear();
        this._formulaData = {};
    }

    addOtherFormulaDependency(unitId: string, sheetId: string, formulaId: string, dependencyTree: FormulaDependencyTree) {
        if (!this._otherFormulaData[unitId]) {
            this._otherFormulaData[unitId] = {};
        }
        if (!this._otherFormulaData[unitId]![sheetId]) {
            this._otherFormulaData[unitId]![sheetId] = {};
        }
        this._otherFormulaData[unitId]![sheetId][formulaId] = dependencyTree;
    }

    removeOtherFormulaDependency(unitId: string, sheetId: string, formulaIds: string[]) {
        if (this._otherFormulaData[unitId] && this._otherFormulaData[unitId]![sheetId]) {
            formulaIds.forEach((formulaId) => {
                const deleteTree = this._otherFormulaData[unitId]![sheetId][formulaId];
                this.clearDependencyForTree(deleteTree);
                delete this._otherFormulaData[unitId]![sheetId][formulaId];
            });
        }
    }

    hasOtherFormulaDependency(unitId: string, sheetId: string, formulaId: string) {
        return this._otherFormulaData[unitId]?.[sheetId]?.[formulaId] != null;
    }

    addFeatureFormulaDependency(featureId: string, dependencyTree: FormulaDependencyTree) {
        this._featureFormulaData.set(featureId, dependencyTree);
    }

    removeFeatureFormulaDependency(featureId: string) {
        const deleteTree = this._featureFormulaData.get(featureId);
        this.clearDependencyForTree(deleteTree);
        this._featureFormulaData.delete(featureId);
    }

    hasFeatureFormulaDependency(featureId: string) {
        return this._featureFormulaData.has(featureId);
    }

    addFormulaDependency(unitId: string, sheetId: string, row: number, column: number, dependencyTree: FormulaDependencyTree) {
        if (!this._formulaData[unitId]) {
            this._formulaData[unitId] = {};
        }
        if (!this._formulaData[unitId]![sheetId]) {
            this._formulaData[unitId]![sheetId] = new ObjectMatrix<Nullable<FormulaDependencyTree>>();
        }
        this._formulaData[unitId]![sheetId].setValue(row, column, dependencyTree);
    }

    removeFormulaDependency(unitId: string, sheetId: string, row: number, column: number) {
        if (this._formulaData[unitId] && this._formulaData[unitId]![sheetId]) {
            const deleteTree = this._formulaData[unitId]![sheetId].getValue(row, column);
            this.clearDependencyForTree(deleteTree);
            this._formulaData[unitId]![sheetId].realDeleteValue(row, column);
        }
    }

    clearFormulaDependency(unitId: string, sheetId: string) {
        if (this._formulaData[unitId] && this._formulaData[unitId]![sheetId]) {
            this._formulaData[unitId]![sheetId].reset();
        }
    }

    hasFormulaDependency(unitId: string, sheetId: string, row: number, column: number) {
        return this._formulaData[unitId]?.[sheetId]?.getValue(row, column) != null;
    }
}

export const IDependencyManagerService = createIdentifier<DependencyManagerService>(
    'univer.formula.dependency-manager.service'
);
