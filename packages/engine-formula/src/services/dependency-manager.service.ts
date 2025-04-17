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

import type { IRTreeItem, IUnitRange, Nullable } from '@univerjs/core';
import type { AstRootNode } from '../engine/ast-node';
import type { FormulaDependencyTree, IFormulaDependencyTree } from '../engine/dependency/dependency-tree';
import { createIdentifier, Disposable, ObjectMatrix, RTree } from '@univerjs/core';

export interface IDependencyManagerService {
    dispose(): void;

    reset(): void;

    addOtherFormulaDependency(unitId: string, sheetId: string, formulaId: string, dependencyTree: IFormulaDependencyTree): void;
    addOtherFormulaDependencyMainData(formulaId: string): void;
    removeOtherFormulaDependency(unitId: string, sheetId: string, formulaId: string[]): void;
    hasOtherFormulaDataMainData(formulaId: string): boolean;
    clearOtherFormulaDependency(unitId: string, sheetId?: string): void;
    getOtherFormulaDependency(unitId: string, sheetId: string, formulaId: string): Nullable<ObjectMatrix<number>>;

    addFeatureFormulaDependency(unitId: string, sheetId: string, featureId: string, dependencyTree: FormulaDependencyTree): void;
    removeFeatureFormulaDependency(unitId: string, sheetId: string, featureIds: string[]): void;
    getFeatureFormulaDependency(unitId: string, sheetId: string, featureId: string): Nullable<number>;
    clearFeatureFormulaDependency(unitId: string, sheetId?: string): void;

    addFormulaDependency(unitId: string, sheetId: string, row: number, column: number, dependencyTree: IFormulaDependencyTree): void;
    removeFormulaDependency(unitId: string, sheetId: string, row: number, column: number): void;
    getFormulaDependency(unitId: string, sheetId: string, row: number, column: number): Nullable<number>;
    clearFormulaDependency(unitId: string, sheetId?: string): void;

    removeFormulaDependencyByDefinedName(unitId: string, definedName: string): void;
    addFormulaDependencyByDefinedName(tree: IFormulaDependencyTree, node: Nullable<AstRootNode>): void;

    addDependencyRTreeCache(tree: IFormulaDependencyTree): void;
    searchDependency(search: IUnitRange[], exceptTreeIds?: Set<number>): Set<number>;

    getLastTreeId(): number;

    getTreeById(treeId: number): Nullable<IFormulaDependencyTree>;

    getAllTree(): IFormulaDependencyTree[];

    buildDependencyTree(shouldBeBuildTrees: IFormulaDependencyTree[], dependencyTrees?: IFormulaDependencyTree[]): IFormulaDependencyTree[];
}

export class DependencyManagerBaseService extends Disposable implements IDependencyManagerService {
    buildDependencyTree(shouldBeBuildTrees: IFormulaDependencyTree[], dependencyTrees?: IFormulaDependencyTree[]): IFormulaDependencyTree[] {
        throw new Error('Method not implemented.');
    }

    getTreeById(treeId: number): Nullable<IFormulaDependencyTree> {
        throw new Error('Method not implemented.');
    }

    getAllTree(): IFormulaDependencyTree[] {
        throw new Error('Method not implemented.');
    }

    protected _otherFormulaData: Map<string, Map<string, Map<string, ObjectMatrix<number>>>> = new Map(); //  [unitId: string]: Nullable<{ [sheetId: string]: { [formulaId: string]: Set<number> } }>;

    protected _featureFormulaData: Map<string, Map<string, Map<string, Nullable<number>>>> = new Map(); // [unitId: string]: Nullable<{ [sheetId: string]: { [featureId: string]: Nullable<number> } }>;

    protected _formulaData: Map<string, Map<string, ObjectMatrix<number>>> = new Map(); // [unitId: string]: Nullable<{ [sheetId: string]: ObjectMatrix<number> }>;

    protected _definedNameMap: Map<string, Map<string, Set<number>>> = new Map(); // unitId -> definedName -> treeId

    protected _otherFormulaDataMainData: Set<string> = new Set();

    protected _dependencyRTreeCache: RTree = new RTree();

    private _dependencyTreeIdLast: number = 0;

    reset(): void {
        throw new Error('Method not implemented.');
    }

    addOtherFormulaDependency(unitId: string, sheetId: string, formulaId: string, dependencyTree: IFormulaDependencyTree): void {
        throw new Error('Method not implemented.');
    }

    removeOtherFormulaDependency(unitId: string, sheetId: string, formulaId: string[]): void {
        throw new Error('Method not implemented.');
    }

    clearOtherFormulaDependency(unitId: string, sheetId?: string): void {
        throw new Error('Method not implemented.');
    }

    addFeatureFormulaDependency(unitId: string, sheetId: string, featureId: string, dependencyTree: FormulaDependencyTree): void {
        throw new Error('Method not implemented.');
    }

    removeFeatureFormulaDependency(unitId: string, sheetId: string, featureIds: string[]): void {
        throw new Error('Method not implemented.');
    }

    clearFeatureFormulaDependency(unitId: string, sheetId?: string): void {
        throw new Error('Method not implemented.');
    }

    addFormulaDependency(unitId: string, sheetId: string, row: number, column: number, dependencyTree: IFormulaDependencyTree): void {
        throw new Error('Method not implemented.');
    }

    removeFormulaDependency(unitId: string, sheetId: string, row: number, column: number): void {
        throw new Error('Method not implemented.');
    }

    clearFormulaDependency(unitId: string, sheetId?: string): void {
        throw new Error('Method not implemented.');
    }

    removeFormulaDependencyByDefinedName(unitId: string, definedName: string): void {
        throw new Error('Method not implemented.');
    }

    searchDependency(search: IUnitRange[], exceptTreeIds?: Set<number>): Set<number> {
        return this._dependencyRTreeCache.bulkSearch(search, exceptTreeIds) as Set<number>;
    }

    protected _restDependencyTreeId() {
        this._dependencyTreeIdLast = 0;
    }

    getOtherFormulaDependency(unitId: string, sheetId: string, formulaId: string) {
        return this._otherFormulaData.get(unitId)?.get(sheetId)?.get(formulaId);
    }

    addOtherFormulaDependencyMainData(formulaId: string) {
        this._otherFormulaDataMainData.add(formulaId);
    }

    hasOtherFormulaDataMainData(formulaId: string) {
        return this._otherFormulaDataMainData.has(formulaId);
    }

    protected _removeDependencyRTreeCacheById(unitId: string, sheetId: string) {
        this._dependencyRTreeCache.removeById(unitId, sheetId);
    }

    getFeatureFormulaDependency(unitId: string, sheetId: string, featureId: string) {
        return this._featureFormulaData.get(unitId)?.get(sheetId)?.get(featureId);
    }

    getFormulaDependency(unitId: string, sheetId: string, row: number, column: number) {
        return this._formulaData.get(unitId)?.get(sheetId)?.getValue(row, column);
    }

    addDependencyRTreeCache(tree: IFormulaDependencyTree) {
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

        this._addAllTreeMap(tree);
    }

    getLastTreeId() {
        const id = this._dependencyTreeIdLast;
        this._dependencyTreeIdLast++;
        return id;
    }

    protected _addAllTreeMap(tree: IFormulaDependencyTree) {
        throw new Error('Method not implemented.');
    }

    protected _addDefinedName(unitId: string, definedName: string, treeId: number) {
        if (!this._definedNameMap.has(unitId)) {
            this._definedNameMap.set(unitId, new Map<string, Set<number>>());
        }

        const unitMap = this._definedNameMap.get(unitId)!;

        if (!unitMap.has(definedName)) {
            unitMap.set(definedName, new Set<number>());
        }

        const treeSet = unitMap.get(definedName)!;
        treeSet.add(treeId);
    }

    addFormulaDependencyByDefinedName(tree: IFormulaDependencyTree, node: Nullable<AstRootNode>) {
        const treeId = tree.treeId;
        // const node = tree.node;

        const definedNames = node?.getDefinedNames() || [];

        for (const definedName of definedNames) {
            this._addDefinedName(tree.unitId, definedName, treeId);
        }
    }
}

/**
 * Passively marked as dirty, register the reference and execution actions of the feature plugin.
 * After execution, a dirty area and calculated data will be returned,
 * causing the formula to be marked dirty again,
 * thereby completing the calculation of the entire dependency tree.
 */
export class DependencyManagerService extends DependencyManagerBaseService implements IDependencyManagerService {
    protected _allTreeMap: Map<number, IFormulaDependencyTree> = new Map();

    override dispose(): void {
        super.dispose();
        this.reset();
    }

    override buildDependencyTree(shouldBeBuildTrees: IFormulaDependencyTree[], dependencyTrees: IFormulaDependencyTree[] = []): IFormulaDependencyTree[] {
        const allTrees = this.getAllTree();
        if (shouldBeBuildTrees.length === 0) {
            this._buildReverseDependency(allTrees, dependencyTrees);
            return allTrees;
        }

        this._buildDependencyTree(allTrees, shouldBeBuildTrees);
        this._buildReverseDependency(allTrees, shouldBeBuildTrees);
        return allTrees;
    }

    /**
     * Build the dependency relationship between the trees.
     * @param allTrees  all FormulaDependencyTree
     * @param shouldBeBuildTrees  FormulaDependencyTree[] | FormulaDependencyTreeCache
     */
    private _buildDependencyTree(allTrees: IFormulaDependencyTree[], shouldBeBuildTrees: IFormulaDependencyTree[]) {
        const shouldBeBuildTreeMap = new Map<number, IFormulaDependencyTree>();
        for (let i = 0; i < shouldBeBuildTrees.length; i++) {
            const tree = shouldBeBuildTrees[i];
            shouldBeBuildTreeMap.set(tree.treeId, tree);
        }

        for (let i = 0; i < allTrees.length; i++) {
            const tree = allTrees[i];
            const RTreeItem = tree.toRTreeItem();

            const searchResults = this._dependencyRTreeCache.bulkSearch(RTreeItem);

            for (const id of searchResults) {
                const shouldBeBuildTree = shouldBeBuildTreeMap.get(id as number);

                if (shouldBeBuildTree && tree !== shouldBeBuildTree && !shouldBeBuildTree.hasChildren(tree.treeId)) {
                    shouldBeBuildTree.pushChildren(tree);
                }
            }
        }

        // console.log('searchResultsCount:', count);

        shouldBeBuildTreeMap.clear();
    }

    /**
     * Build the reverse dependency relationship between the trees.
     * @param allTrees
     * @param dependencyTrees
     */
    private _buildReverseDependency(allTrees: IFormulaDependencyTree[], dependencyTrees: IFormulaDependencyTree[]) {
        const allTreeMap = new Map<number, IFormulaDependencyTree>();

        for (let i = 0; i < allTrees.length; i++) {
            const tree = allTrees[i];
            allTreeMap.set(tree.treeId, tree);
        }

        for (let i = 0; i < dependencyTrees.length; i++) {
            const tree = dependencyTrees[i];
            const RTreeItem = tree.toRTreeItem();

            const searchResults = this._dependencyRTreeCache.bulkSearch(RTreeItem);

            for (const id of searchResults) {
                const allTree = allTreeMap.get(id as number);

                if (allTree && tree !== allTree && !allTree.hasChildren(tree.treeId)) {
                    allTree.pushChildren(tree);
                }
            }
        }

        allTreeMap.clear();
    }

     /**
      * Get all FormulaDependencyTree from _otherFormulaData, _featureFormulaData, _formulaData
      * return FormulaDependencyTree[]
      */
    override getAllTree() {
        const trees: IFormulaDependencyTree[] = [];
        this._allTreeMap.forEach((tree) => {
            tree.resetState();
            trees.push(tree);
        });

        return trees;
    }

    override getTreeById(treeId: number) {
        return this._allTreeMap.get(treeId);
    }

    override reset() {
        this._otherFormulaData.clear();
        this._featureFormulaData.clear();
        this._formulaData.clear();
        this._definedNameMap.clear();
        this._otherFormulaDataMainData.clear();
        this._dependencyRTreeCache.clear();
        this._allTreeMap.clear();
        this._restDependencyTreeId();
    }

    override addOtherFormulaDependency(unitId: string, sheetId: string, formulaId: string, dependencyTree: IFormulaDependencyTree) {
        if (!this._otherFormulaData.has(unitId)) {
            this._otherFormulaData.set(unitId, new Map<string, Map<string, ObjectMatrix<number>>>());
        }

        const unitMap = this._otherFormulaData.get(unitId)!;

        if (!unitMap.has(sheetId)) {
            unitMap.set(sheetId, new Map<string, ObjectMatrix<number>>());
        }

        const sheetMap = unitMap.get(sheetId)!;

        if (!sheetMap.has(formulaId)) {
            sheetMap.set(formulaId, new ObjectMatrix<number>());
        }

        const formulaMatrix = sheetMap.get(formulaId)!;

        formulaMatrix.setValue(dependencyTree.refOffsetX, dependencyTree.refOffsetY, dependencyTree.treeId);

        this._addAllTreeMap(dependencyTree);
    }

    override removeOtherFormulaDependency(unitId: string, sheetId: string, formulaIds: string[]) {
        const unitMap = this._otherFormulaData.get(unitId);
        if (unitMap && unitMap.has(sheetId)) {
            const sheetMap = unitMap.get(sheetId)!;

            formulaIds.forEach((formulaId) => {
                const treeSet = sheetMap.get(formulaId);
                if (treeSet == null) {
                    return;
                }

                treeSet.forValue((row, column, treeId) => {
                    this._removeDependencyRTreeCache(treeId);
                    this.clearDependencyForTree(this._allTreeMap.get(treeId));
                    this._removeAllTreeMap(treeId);
                });

                sheetMap.delete(formulaId);
                this._otherFormulaDataMainData.delete(formulaId);
            });

            if (sheetMap.size === 0) {
                unitMap.delete(sheetId);
            }

            if (unitMap.size === 0) {
                this._otherFormulaData.delete(unitId);
            }
        }
    }

    override clearOtherFormulaDependency(unitId: string, sheetId?: string) {
        const unitMap = this._otherFormulaData.get(unitId);

        if (sheetId && unitMap && unitMap.has(sheetId)) {
            const sheetMap = unitMap.get(sheetId)!;

            this._removeDependencyRTreeCacheById(unitId, sheetId);
            for (const formulaId of sheetMap.keys()) {
                const formulaTreeSet = sheetMap.get(formulaId);
                if (formulaTreeSet == null) {
                    continue;
                }

                formulaTreeSet.forValue((row, column, treeId) => {
                    const tree = this._allTreeMap.get(treeId);
                    if (tree) {
                        this.clearDependencyForTree(tree);
                        this._removeAllTreeMap(treeId);
                    }
                });

                this._otherFormulaDataMainData.delete(formulaId);
            }

            sheetMap.clear(); // Clear the formula dependent data corresponding to the sheetId
        } else if (unitMap) {
            for (const sheetId of unitMap.keys()) {
                const sheetMap = unitMap.get(sheetId)!;
                this._removeDependencyRTreeCacheById(unitId, sheetId);
                for (const formulaId of sheetMap.keys()) {
                    const formulaTreeSet = sheetMap.get(formulaId);
                    if (formulaTreeSet == null) {
                        continue;
                    }

                    formulaTreeSet.forValue((row, column, treeId) => {
                        const tree = this._allTreeMap.get(treeId);
                        if (tree) {
                            this.clearDependencyForTree(tree);
                            this._removeAllTreeMap(treeId);
                        }
                    });

                    this._otherFormulaDataMainData.delete(formulaId);
                }
            }

            this._otherFormulaData.delete(unitId); // Delete the data corresponding to the entire unitId
        }
    }

    override addFeatureFormulaDependency(unitId: string, sheetId: string, featureId: string, dependencyTree: FormulaDependencyTree) {
        if (!this._featureFormulaData.has(unitId)) {
            this._featureFormulaData.set(unitId, new Map<string, Map<string, number>>());
        }

        const unitMap = this._featureFormulaData.get(unitId)!;

        if (!unitMap.has(sheetId)) {
            unitMap.set(sheetId, new Map<string, number>());
        }

        const sheetMap = unitMap.get(sheetId)!;
        sheetMap.set(featureId, dependencyTree.treeId);
        // this._allTreeMap.set(dependencyTree.treeId, dependencyTree);
        this._addAllTreeMap(dependencyTree);
    }

    override removeFeatureFormulaDependency(unitId: string, sheetId: string, featureIds: string[]) {
        const unitMap = this._featureFormulaData.get(unitId);
        if (unitMap && unitMap.has(sheetId)) {
            const sheetMap = unitMap.get(sheetId)!;
            featureIds.forEach((featureId) => {
                const deleteTreeId = sheetMap.get(featureId);
                if (deleteTreeId == null) {
                    return;
                }

                this._removeDependencyRTreeCache(deleteTreeId);

                sheetMap.delete(featureId);
                this.clearDependencyForTree(this._allTreeMap.get(deleteTreeId));
                this._removeAllTreeMap(deleteTreeId);
            });
        }
    }

    override clearFeatureFormulaDependency(unitId: string, sheetId?: string) {
        const unitMap = this._featureFormulaData.get(unitId);

        if (sheetId && unitMap && unitMap.has(sheetId)) {
            const sheetMap = unitMap.get(sheetId)!;
            this._removeDependencyRTreeCacheById(unitId, sheetId);
            sheetMap.forEach((featureTreeId) => {
                if (featureTreeId == null) {
                    return;
                }
                this.clearDependencyForTree(this._allTreeMap.get(featureTreeId));
                this._removeAllTreeMap(featureTreeId);
            });

            sheetMap.clear(); // Clear the formula dependent data corresponding to the sheetId
        } else if (unitMap) {
            unitMap.forEach((sheetMap, sheetId) => {
                this._removeDependencyRTreeCacheById(unitId, sheetId);
                sheetMap.forEach((featureTreeId) => {
                    if (featureTreeId == null) {
                        return;
                    }
                    this.clearDependencyForTree(this._allTreeMap.get(featureTreeId));
                    this._removeAllTreeMap(featureTreeId);
                });
            });

            this._featureFormulaData.delete(unitId); // Delete the data corresponding to the entire unitId
        }
    }

    override addFormulaDependency(unitId: string, sheetId: string, row: number, column: number, dependencyTree: IFormulaDependencyTree) {
        if (!this._formulaData.has(unitId)) {
            this._formulaData.set(unitId, new Map<string, ObjectMatrix<number>>());
        }
        const unitMap = this._formulaData.get(unitId)!;

        if (!unitMap.has(sheetId)) {
            unitMap.set(sheetId, new ObjectMatrix<number>());
        }
        const sheetMatrix = unitMap.get(sheetId)!;

        sheetMatrix.setValue(row, column, dependencyTree.treeId);
        // this._allTreeMap.set(dependencyTree.treeId, dependencyTree);
        this._addAllTreeMap(dependencyTree);
    }

    override removeFormulaDependency(unitId: string, sheetId: string, row: number, column: number) {
        const unitMap = this._formulaData.get(unitId);
        if (unitMap && unitMap.has(sheetId)) {
            const sheetMatrix = unitMap.get(sheetId)!;
            const deleteTreeId = sheetMatrix.getValue(row, column);
            if (deleteTreeId == null) {
                return;
            }

            this._removeDependencyRTreeCache(deleteTreeId);

            sheetMatrix.realDeleteValue(row, column);
            this.clearDependencyForTree(this._allTreeMap.get(deleteTreeId));
            this._removeAllTreeMap(deleteTreeId);
        }
    }

    override clearFormulaDependency(unitId: string, sheetId?: string) {
        const unitMap = this._formulaData.get(unitId);

        if (sheetId && unitMap && unitMap.has(sheetId)) {
            const sheetMatrix = unitMap.get(sheetId)!;
            this._removeDependencyRTreeCacheById(unitId, sheetId);

            sheetMatrix.forValue((row, column, treeId) => {
                if (treeId == null) {
                    return true;
                }
                this.clearDependencyForTree(this._allTreeMap.get(treeId));
                this._removeAllTreeMap(treeId);
            });

            sheetMatrix.reset();
        } else if (unitMap) {
            unitMap.forEach((sheetMatrix, sheetId) => {
                this._removeDependencyRTreeCacheById(unitId, sheetId);

                sheetMatrix.forValue((row, column, treeId) => {
                    if (treeId == null) {
                        return true;
                    }
                    this.clearDependencyForTree(this._allTreeMap.get(treeId));
                    this._removeAllTreeMap(treeId);
                });
            });

            this._formulaData.delete(unitId); // Delete the data of the entire unitId
        }
    }

    /**
     * Clear the dependency relationship of the tree.
     * establish the relationship between the parent and the child.
     * @param shouldBeClearTree
     */
    clearDependencyForTree(shouldBeClearTree: Nullable<IFormulaDependencyTree>) {
        if (shouldBeClearTree == null) {
            return;
        }

        const parents = shouldBeClearTree.parents;

        const children = shouldBeClearTree.children;

        const allTreeMap = this._allTreeMap;

        for (const parentTreeId of parents) {
            const parent = allTreeMap.get(parentTreeId);
            parent?.children.delete(shouldBeClearTree.treeId);
        }

        for (const childTreeId of children) {
            const child = allTreeMap.get(childTreeId);
            child?.parents.delete(shouldBeClearTree.treeId);
        }

        shouldBeClearTree.dispose();
    }

    private _removeDependencyRTreeCache(treeId: Nullable<number>) {
        if (treeId == null) {
            return;
        }

        const treeRangeMap = this._allTreeMap.get(treeId);

        if (treeRangeMap) {
            const searchRanges: IRTreeItem[] = [];
            for (let i = 0; i < treeRangeMap.rangeList.length; i++) {
                const unitRangeWithNum = treeRangeMap.rangeList[i];
                const { unitId, sheetId, range } = unitRangeWithNum;

                searchRanges.push({
                    unitId,
                    sheetId,
                    range,
                    id: treeId,
                });
            }

            this._dependencyRTreeCache.bulkRemove(searchRanges);
        }
    }

    override removeFormulaDependencyByDefinedName(unitId: string, definedName: string) {
        const unitMap = this._definedNameMap.get(unitId);

        if (unitMap) {
            const treeSet = unitMap.get(definedName);
            if (treeSet) {
                for (const treeId of treeSet) {
                    this._removeDependencyRTreeCache(treeId);
                    this.clearDependencyForTree(this._allTreeMap.get(treeId));
                    this._removeAllTreeMap(treeId);
                }
                treeSet.clear();
            }
        }
    }

    protected _removeAllTreeMap(treeId: Nullable<number>) {
        if (treeId == null) {
            return;
        }
        this._allTreeMap.delete(treeId);
    }

    protected override _addAllTreeMap(tree: IFormulaDependencyTree) {
        this._allTreeMap.set(tree.treeId, tree);
    }
}

export const IDependencyManagerService = createIdentifier<DependencyManagerService>(
    'univer.formula.dependency-manager.service'
);
