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

import type { IUnitData } from '../../basics/common';
import type { BaseAstNode } from '../ast-node/base-ast-node';
import type { FunctionNode } from '../ast-node/function-node';
import type { ReferenceNode } from '../ast-node/reference-node';
import { NodeType } from '../ast-node/node-type';
import { BaseReferenceObject } from '../reference-object/base-reference-object';

interface ISheetSize {
    rowCount: number;
    columnCount: number;
}

interface IWorkbookReferenceContext {
    order: string[];
    sizes: Record<string, ISheetSize>;
    names: string[];
}

/** Retains sheet metadata only; formulas and dependency ranges stay in the existing caches. */
export class ReferenceContext {
    private _stable: Record<string, IWorkbookReferenceContext> = {};
    private _previous: Record<string, IWorkbookReferenceContext> = {};
    private _current: Record<string, IWorkbookReferenceContext> = {};
    private _orderChanged = false;
    private _changed = false;

    update(unitData: IUnitData, getSheetsInfo: (unitId: string) => { sheetOrder: string[]; sheetNameMap: Record<string, string> } | undefined): boolean {
        this._previous = this._current;
        this._current = {};
        this._orderChanged = false;
        this._changed = false;
        for (const [unitId, sheets] of Object.entries(unitData)) {
            const sizes = Object.fromEntries(Object.entries(sheets ?? {}).map(([sheetId, sheet]) => [
                sheetId,
                { rowCount: sheet.rowCount, columnCount: sheet.columnCount },
            ]));
            const info = getSheetsInfo(unitId);
            const order = [...(info?.sheetOrder ?? Object.keys(sizes))];
            const names = Object.values(info?.sheetNameMap ?? {}).map((name) => name.toLocaleLowerCase());
            this._current[unitId] = { order, sizes, names };
        }
        if (Object.keys(this._previous).length === 0) {
            this._stable = this._current;
            return false;
        }
        for (const unitId of new Set([...Object.keys(this._previous), ...Object.keys(this._current)])) {
            const before = this._previous[unitId];
            const after = this._current[unitId];
            if (JSON.stringify(before?.order) !== JSON.stringify(after?.order)) {
                this._orderChanged = true;
                this._changed = true;
            }
            if (JSON.stringify(before?.sizes) !== JSON.stringify(after?.sizes)) {
                this._changed = true;
            }
        }
        return this._changed;
    }

    finish(completed: boolean): void {
        if (completed) {
            this._stable = this._current;
        } else {
            this._current = this._stable;
        }
    }

    isSheetSizeChanged(unitId: string, sheetId: string): boolean {
        const before = this._previous[unitId]?.sizes[sheetId];
        const after = this._current[unitId]?.sizes[sheetId];
        return this._changed && Boolean(before && after &&
            (before.rowCount !== after.rowCount || before.columnCount !== after.columnCount));
    }

    isAffected(node: BaseAstNode, unitId: string, sheetId: string, offsetX = 0, offsetY = 0): boolean {
        if (!this._changed) {
            return false;
        }
        const token = node.getToken().toUpperCase();
        if (node.nodeType === NodeType.FUNCTION) {
            // Dynamic addresses can hide an open-ended or three-dimensional reference.
            if (token === 'INDIRECT' || token === 'OFFSET') {
                return true;
            }
            if ((node as FunctionNode).isAffectedBySheetMetadata?.(this._orderChanged, this.isSheetSizeChanged(unitId, sheetId)) ?? true) {
                return true;
            }
        }
        if (node.nodeType === NodeType.UNION && this._orderChanged) {
            // A 3D reference can retain the same members while their evaluation order changes.
            const first = node.getChildren()[0]?.getToken().trim().replace(/^'|'$/g, '').replace(/''/g, "'").toLocaleLowerCase();
            if (first && Object.values(this._current).some((book) => book.names.includes(first))) {
                return true;
            }
        }
        if (node.nodeType === NodeType.REFERENCE || node.nodeType === NodeType.UNION) {
            const value = this._resolveStaticReference(node, offsetX, offsetY);
            if (value === null) {
                // An invalid reference can become valid after a resize or sheet insertion.
                return true;
            }
            if (value && value.toUnitRanges().some(({ unitId, sheetId, range }) => {
                const before = this._previous[unitId]?.sizes[sheetId];
                const after = this._current[unitId]?.sizes[sheetId];
                if (!before || !after) {
                    return true;
                }
                return (before.rowCount !== after.rowCount && (value.isColumn() || range.endRow >= Math.min(before.rowCount, after.rowCount) - 1)) ||
                    (before.columnCount !== after.columnCount && (value.isRow() || range.endColumn >= Math.min(before.columnCount, after.columnCount) - 1));
            })) {
                return true;
            }
        }
        return node.getChildren().some((child) => this.isAffected(child, unitId, sheetId, offsetX, offsetY));
    }

    private _resolveStaticReference(node: BaseAstNode, offsetX: number, offsetY: number): BaseReferenceObject | null | undefined {
        if (node.nodeType === NodeType.REFERENCE) {
            (node as ReferenceNode).setRefOffset(offsetX, offsetY);
        } else if (node.nodeType !== NodeType.UNION || node.getChildren().some((child) =>
            this._resolveStaticReference(child, offsetX, offsetY) === undefined
        )) {
            return;
        }
        node.execute();
        const value = node.getValue();
        return value instanceof BaseReferenceObject ? value : null;
    }
}
