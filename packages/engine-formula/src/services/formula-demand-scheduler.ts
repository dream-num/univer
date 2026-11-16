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

import type { IUnitRange, Nullable } from '@univerjs/core';
import type { IRuntimeUnitDataType } from '../basics/common';
import type { BaseAstNode } from '../engine/ast-node/base-ast-node';
import type { FunctionVariantType } from '../engine/reference-object/base-reference-object';
import type { ArrayValueObject } from '../engine/value-object/array-value-object';
import { withFormulaValueDemand } from '../engine/utils/formula-value-demand';

export interface IFormulaDemandTree {
    unitId: string;
    subUnitId: string;
    row: number;
    column: number;
    formula?: string;
    formulaId?: Nullable<string>;
    featureId?: Nullable<string>;
    cycleGroup?: string;
    hasDynamicDeps?: boolean;
    addressFunctionNodes?: readonly unknown[];
    rangeList?: readonly IUnitRange[];
    featureDirtyRanges?: readonly IUnitRange[];
}

export interface IFormulaDemandStep {
    preserve: boolean;
    iteration: number;
    probe: boolean;
}

interface IFrame<T> {
    tree: T;
    step: IFormulaDemandStep;
    group?: IFeedbackGroup<T>;
}

interface IFeedbackGroup<T> {
    members: Set<T>;
    remaining: T[];
    stackBase: number;
    iterator?: AsyncIterator<{ tree: T; preserve: boolean; iteration: number }>;
}

class FormulaValueSuspension<T> extends Error {
    constructor(readonly tree: T) {
        super('Formula value dependency is not ready');
    }
}

type FormulaSamples = Map<BaseAstNode, Map<string, FunctionVariantType[]>>;

/** The stack is made from actual unfinished reads, never static range edges. */
export class FormulaDemandScheduler<T extends IFormulaDemandTree> {
    private readonly _ready: Set<T>;
    private readonly _stack: IFrame<T>[] = [];
    private readonly _groups: IFeedbackGroup<T>[] = [];
    private readonly _samples = new Map<T, FormulaSamples>();
    private readonly _sampleIterations = new Map<T, number>();
    private readonly _iterationBudgets = new Map<T, number>();
    private readonly _referenceArrayCache = new Map<string, ArrayValueObject>();

    constructor(
        private readonly _roots: T[],
        private readonly _runtimeData: IRuntimeUnitDataType,
        private readonly _resolve: (unitId: string, sheetId: string, row: number, column: number) => T | undefined,
        private readonly _visitor: (tree: T, step: IFormulaDemandStep) => Promise<boolean | void>,
        private readonly _iterate: (group: T[], budgets: Map<T, number>) => AsyncIterator<{
            tree: T;
            preserve: boolean;
            iteration: number;
        }>,
        private readonly _isStopped: () => boolean,
        initiallyReady: readonly T[],
        ready?: Set<T>
    ) {
        this._ready = ready ?? new Set<T>();
        for (const tree of initiallyReady) {
            this._ready.add(tree);
        }
    }

    async run() {
        try {
            return await this._run();
        } finally {
            this._referenceArrayCache.clear();
            for (const group of this._groups) {
                if (group.iterator?.return) {
                    await group.iterator.return();
                }
            }
        }
    }

    private async _run() {
        while (!this._isStopped()) {
            const group = this._groups[this._groups.length - 1];
            if (group && this._stack.length === group.stackBase) {
                if (group.remaining.length) {
                    const tree = group.remaining.shift()!;
                    this._stack.push({ tree, step: { preserve: false, iteration: 0, probe: true }, group });
                } else {
                    group.iterator ??= this._iterate(Array.from(group.members), this._iterationBudgets);
                    const next = await group.iterator.next();
                    if (next.done) {
                        this._referenceArrayCache.clear();
                        for (const tree of group.members) {
                            this._ready.add(tree);
                        }
                        this._groups.pop();
                        continue;
                    }
                    this._stack.push({ tree: next.value.tree, step: { ...next.value, probe: false }, group });
                }
            }
            if (!this._stack.length) {
                const tree = this._roots.pop();
                if (!tree) {
                    return true;
                }
                if (this._ready.has(tree)) {
                    continue;
                }
                this._stack.push({ tree, step: { preserve: false, iteration: 0, probe: false } });
            }
            const frame = this._stack[this._stack.length - 1];
            if (!frame.group && this._ready.has(frame.tree)) {
                this._stack.pop();
                continue;
            }
            const previousIteration = this._sampleIterations.get(frame.tree) ?? 0;
            if (!frame.step.probe && frame.step.iteration > previousIteration) {
                this._samples.delete(frame.tree);
                this._sampleIterations.set(frame.tree, frame.step.iteration);
            }
            let samples = this._samples.get(frame.tree);
            if (!samples) {
                samples = new Map();
                this._samples.set(frame.tree, samples);
            }
            let pending: T | undefined;
            const scope = {
                samples,
                probe: frame.step.probe,
                sampleCounts: new Map<BaseAstNode, Map<string, number>>(),
                // Cycle members can mutate each other's ranges between attempts;
                // keep their materialization cache frame-local. Non-cycle demand
                // roots share the attempt cache after all dirty range producers
                // have become ready.
                arrayCache: frame.group ? new Map<string, ArrayValueObject>() : this._referenceArrayCache,
                readCell: (unitId: string, sheetId: string, row: number, column: number) => {
                    const precedent = this._resolve(unitId, sheetId, row, column);
                    if (pending) {
                        throw new FormulaValueSuspension(pending);
                    }
                    if (precedent && !this._ready.has(precedent) && !frame.group?.members.has(precedent)) {
                        pending = precedent;
                        throw new FormulaValueSuspension(precedent);
                    }
                },
            };
            try {
                const result = await withFormulaValueDemand(this._runtimeData, scope, () => this._visitor(frame.tree, frame.step));
                if (result === false) {
                    return false;
                }
            } catch (error) {
                if (!pending || !(error instanceof FormulaValueSuspension)) {
                    throw error;
                }
            }
            if (pending) {
                await this._blocked(pending);
            } else {
                this._stack.pop();
                if (!frame.group) {
                    this._ready.add(frame.tree);
                }
            }
        }
        return false;
    }

    private async _blocked(precedent: T) {
        const containingGroup = this._groups.findIndex((group) => group.members.has(precedent));
        if (containingGroup >= 0) {
            const stackBase = this._groups[containingGroup].stackBase;
            const members = new Set(this._stack.slice(stackBase).map((frame) => frame.tree));
            const removed = this._groups.splice(containingGroup);
            for (const group of removed) {
                for (const tree of group.members) {
                    members.add(tree);
                }
                if (group.iterator?.return) {
                    await group.iterator.return();
                }
            }
            this._openGroup(members, stackBase);
            return;
        }
        const position = this._stack.findIndex((frame) => frame.tree === precedent);
        if (position >= 0) {
            this._openGroup(new Set(this._stack.slice(position).map((frame) => frame.tree)), position);
        } else {
            this._stack.push({ tree: precedent, step: { preserve: false, iteration: 0, probe: false } });
        }
    }

    private _openGroup(members: Set<T>, stackBase: number) {
        this._stack.length = stackBase;
        for (const tree of members) {
            this._ready.delete(tree);
        }
        this._groups.push({ members, remaining: Array.from(members), stackBase });
    }
}
