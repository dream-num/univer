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
    refreshDependencyRTreeCaches(trees: readonly IFormulaDependencyTree[]): void;
    hasDependencyRTreeCache(treeId: number): boolean;
    searchDependency(search: IUnitRange[], exceptTreeIds?: Set<number>): Set<number>;

    readonly calculationRegionReads?: Map<number, boolean>;
    getLastTreeId(): number;

    getTreeById(treeId: number): Nullable<IFormulaDependencyTree>;

    getAllTree(): IFormulaDependencyTree[];

    buildDependencyTree(shouldBeBuildTrees: IFormulaDependencyTree[], dependencyTrees?: IFormulaDependencyTree[]): IFormulaDependencyTree[];

    updateDependencyTreeDirtyState(treeId: number, isDirty: boolean): void;

    openKdTree(): void;
    closeKdTree(): void;
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

    refreshDependencyRTreeCaches(trees: readonly IFormulaDependencyTree[]): void {
        for (const tree of trees) {
            if (!tree.isCache) {
                this.addDependencyRTreeCache(tree);
            }
        }
    }

    addDependencyRTreeCache(tree: IFormulaDependencyTree) {
        const searchRanges = tree.rangeList.map(({ unitId, sheetId, range }): IRTreeItem => ({
            unitId,
            sheetId,
            range,
            id: tree.treeId,
        }));
        this._dependencyRTreeCache.bulkInsert(searchRanges);
        this._addAllTreeMap(tree, searchRanges);
    }

    /**
     * Whether this tree is currently present in the dependency index. A recalculation that
     * reuses the ranges of an unchanged formula may skip the index write only while the entry
     * it relies on still exists; a forced calculation resets the index and clears this state.
     */
    hasDependencyRTreeCache(treeId: number): boolean {
        throw new Error('Method not implemented.');
    }

    getLastTreeId() {
        const id = this._dependencyTreeIdLast;
        this._dependencyTreeIdLast++;
        return id;
    }

    protected _addAllTreeMap(tree: IFormulaDependencyTree, searchRanges: IRTreeItem[]) {
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

    updateDependencyTreeDirtyState(treeId: number, isDirty: boolean): void {
        throw new Error('Method not implemented.');
    }

    openKdTree(): void {}

    closeKdTree(): void {}
}

/**
 * Passively marked as dirty, register the reference and execution actions of the feature plugin.
 * After execution, a dirty area and calculated data will be returned,
 * causing the formula to be marked dirty again,
 * thereby completing the calculation of the entire dependency tree.
 */
export class DependencyManagerService extends DependencyManagerBaseService implements IDependencyManagerService {
    readonly calculationRegionReads = new Map<number, boolean>();
    protected _allTreeMap: Map<number, IRTreeItem[]> = new Map();

    protected override _dependencyRTreeCache: RTree = new RTree(true); // true: open kd-tree search state

    override hasDependencyRTreeCache(treeId: number) {
        return this._allTreeMap.has(treeId);
    }

    override addDependencyRTreeCache(tree: IFormulaDependencyTree) {
        if (this.hasDependencyRTreeCache(tree.treeId)) {
            this._removeDependencyRTreeCache(tree.treeId);
        }
        super.addDependencyRTreeCache(tree);
    }

    override refreshDependencyRTreeCaches(trees: readonly IFormulaDependencyTree[]): void {
        const replacedIds: number[] = [];
        for (const tree of trees) {
            if (!tree.isCache && this.hasDependencyRTreeCache(tree.treeId)) {
                replacedIds.push(tree.treeId);
            }
        }

        // Remove the old entries together so overlapping ranges share a single index scan.
        this._removeDependencyRTreeCaches(replacedIds);
        super.refreshDependencyRTreeCaches(trees);
    }

    override reset() {
        this._otherFormulaData.clear();
        this._featureFormulaData.clear();
        this._formulaData.clear();
        this._dependencyRTreeCache.clear();
        this.calculationRegionReads.clear();
        this._allTreeMap.clear();
        this._restDependencyTreeId();

        this._otherFormulaDataMainData.clear();
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

        // this._addAllTreeMap(dependencyTree);
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
        const treeIds: number[] = [];
        const unitMap = this._otherFormulaData.get(unitId);
        if (sheetId && !unitMap?.has(sheetId)) {
            return;
        }

        if (sheetId && unitMap && unitMap.has(sheetId)) {
            const sheetMap = unitMap.get(sheetId)!;

            for (const formulaId of sheetMap.keys()) {
                const formulaTreeSet = sheetMap.get(formulaId);
                if (formulaTreeSet == null) {
                    continue;
                }

                formulaTreeSet.forValue((row, column, treeId) => {
                    const tree = this._allTreeMap.get(treeId);
                    if (tree) {
                        treeIds.push(treeId);
                    }
                });

                this._otherFormulaDataMainData.delete(formulaId);
            }

            sheetMap.clear(); // Clear the formula dependent data corresponding to the sheetId
        } else if (unitMap) {
            for (const sheetId of unitMap.keys()) {
                const sheetMap = unitMap.get(sheetId)!;
                for (const formulaId of sheetMap.keys()) {
                    const formulaTreeSet = sheetMap.get(formulaId);
                    if (formulaTreeSet == null) {
                        continue;
                    }

                    formulaTreeSet.forValue((row, column, treeId) => {
                        const tree = this._allTreeMap.get(treeId);
                        if (tree) {
                            treeIds.push(treeId);
                        }
                    });

                    this._otherFormulaDataMainData.delete(formulaId);
                }
            }

            this._otherFormulaData.delete(unitId); // Delete the data corresponding to the entire unitId
        }
        this._removeDependencyRTreeCaches(treeIds);
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
        // this._addAllTreeMap(dependencyTree);
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
                this._removeAllTreeMap(deleteTreeId);
            });
        }
    }

    override clearFeatureFormulaDependency(unitId: string, sheetId?: string) {
        const treeIds: number[] = [];
        const unitMap = this._featureFormulaData.get(unitId);
        if (sheetId && !unitMap?.has(sheetId)) {
            return;
        }

        if (sheetId && unitMap && unitMap.has(sheetId)) {
            const sheetMap = unitMap.get(sheetId)!;
            sheetMap.forEach((featureTreeId) => {
                if (featureTreeId == null) {
                    return;
                }
                treeIds.push(featureTreeId);
            });

            sheetMap.clear(); // Clear the formula dependent data corresponding to the sheetId
        } else if (unitMap) {
            unitMap.forEach((sheetMap, sheetId) => {
                sheetMap.forEach((featureTreeId) => {
                    if (featureTreeId == null) {
                        return;
                    }
                    treeIds.push(featureTreeId);
                });
            });

            this._featureFormulaData.delete(unitId); // Delete the data corresponding to the entire unitId
        }
        this._removeDependencyRTreeCaches(treeIds);
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
        // this._addAllTreeMap(dependencyTree);
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
            this._removeAllTreeMap(deleteTreeId);
        }
    }

    override clearFormulaDependency(unitId: string, sheetId?: string) {
        const treeIds: number[] = [];
        const unitMap = this._formulaData.get(unitId);
        if (sheetId && !unitMap?.has(sheetId)) {
            return;
        }

        if (sheetId && unitMap && unitMap.has(sheetId)) {
            const sheetMatrix = unitMap.get(sheetId)!;
            sheetMatrix.forValue((row, column, treeId) => {
                if (treeId == null) {
                    return true;
                }

                treeIds.push(treeId);
            });

            sheetMatrix.reset();
        } else if (unitMap) {
            unitMap.forEach((sheetMatrix, sheetId) => {
                sheetMatrix.forValue((row, column, treeId) => {
                    if (treeId == null) {
                        return true;
                    }

                    treeIds.push(treeId);
                });
            });

            this._formulaData.delete(unitId); // Delete the data of the entire unitId
        }
        this._removeDependencyRTreeCaches(treeIds);
    }

    private _removeDependencyRTreeCache(treeId: Nullable<number>) {
        if (treeId != null) {
            this._removeDependencyRTreeCaches([treeId]);
        }
    }

    private _removeDependencyRTreeCaches(treeIds: number[]) {
        const searchRanges: IRTreeItem[] = [];
        for (const treeId of treeIds) {
            this.calculationRegionReads.delete(treeId);
            const bounds = this._allTreeMap.get(treeId);
            if (!bounds) {
                continue;
            }
            for (const entry of bounds) {
                searchRanges.push(entry);
            }
            this._allTreeMap.delete(treeId);
        }
        this._dependencyRTreeCache.bulkRemove(searchRanges);
    }

    override removeFormulaDependencyByDefinedName(unitId: string, definedName: string) {
        const unitMap = this._definedNameMap.get(unitId);

        if (unitMap) {
            const treeSet = unitMap.get(definedName);
            if (treeSet) {
                for (const treeId of treeSet) {
                    this._removeDependencyRTreeCache(treeId);
                    this._removeAllTreeMap(treeId);
                }
                treeSet.clear();
            }
        }
    }

    override openKdTree() {
        this._dependencyRTreeCache.openKdTree();
    }

    override closeKdTree() {
        this._dependencyRTreeCache.closeKdTree();
    }

    protected _removeAllTreeMap(treeId: Nullable<number>) {
        if (treeId == null) {
            return;
        }
        this._allTreeMap.delete(treeId);
    }

    protected override _addAllTreeMap(tree: IFormulaDependencyTree, searchRanges: IRTreeItem[]) {
        if (searchRanges.length === 0) {
            return;
        }

        // Store one removal range per worksheet without retaining two Maps per formula.
        const bounds = searchRanges.length === 1 ? searchRanges : [searchRanges[0]];
        for (let index = 1; index < searchRanges.length; index++) {
            const entry = searchRanges[index];
            const existing = bounds.find(({ unitId, sheetId }) => unitId === entry.unitId && sheetId === entry.sheetId);
            if (!existing) {
                bounds.push(entry);
                continue;
            }
            const { range } = entry;
            const previous = existing.range;
            existing.range = {
                startRow: Math.min(range.startRow, previous.startRow),
                startColumn: Math.min(range.startColumn, previous.startColumn),
                endRow: Math.max(range.endRow, previous.endRow),
                endColumn: Math.max(range.endColumn, previous.endColumn),
            };
        }
        this._allTreeMap.set(tree.treeId, bounds);
    }

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
}

export const IDependencyManagerService = createIdentifier<IDependencyManagerService>(
    'univer.formula.dependency-manager.service'
);
