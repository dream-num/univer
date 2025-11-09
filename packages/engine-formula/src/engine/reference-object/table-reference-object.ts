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

import type { ISuperTable, IUnitSheetNameMap } from '../../basics/common';
import { TableOptionType } from '../../basics/common';
import { matchToken } from '../../basics/token';
import { BaseReferenceObject } from './base-reference-object';

/**
 * Table reference object compatible with Excel Structured References
 *
 * Supported (examples):
 * - =Table[Column]                          // Single column (default DATA)
 * - =Table[[ColumnA]:[ColumnB]]             // Column range (default DATA)
 * - =Table[#All] / [#Data] / [#Headers] / [#Totals] / [#This Row]
 * - =Table[[#All],[Column]]                 // Section + column/column range
 * - =Table[[#Data],[ColA]:[ColB]]
 * - =Table[[#This Row],[Column]]
 *
 * Not supported (invalid):
 * - Multiple sections in parallel (e.g., [[#Headers],[#Data]])
 * - Non-existent sections (e.g., #Title)
 * - Column indices instead of column names (e.g., [[1]:[3]])
 */
export class TableReferenceObject extends BaseReferenceObject {
    private _isCurrentRowForRange: boolean = false;

    constructor(
        token: string,
        private _tableData: ISuperTable,
        /**
         * Structured reference body (with or without outer []):
         *  - "#Data" / "#All"
         *  - "[Col]" / "[[ColA]:[ColB]]"
         *  - "[[#Data],[Col]]" / "[[#All],[ColA]:[ColB]]"
         */
        private _columnDataString: string | undefined,
        /** Section text to enum mapping ('#All', '#Data', '#Headers', '#Totals', '#This Row') */
        private _tableOptionMap: Map<string, TableOptionType>
    ) {
        super(token);

        const { sheetId, range, titleMap } = this._tableData;
        this.setForcedSheetIdDirect(sheetId);

        const { startColumn, endColumn, type } = this._parseStructuredRef(this._columnDataString, titleMap);

        const tableStartRow = range.startRow;
        const tableEndRow = range.endRow;

        let startRow = -1;
        let endRow = -1;

        switch (type) {
            case TableOptionType.ALL:
                startRow = tableStartRow;
                endRow = tableEndRow;
                break;
            case TableOptionType.DATA:
                // Default: First row is header, data area = [startRow+1, endRow]
                startRow = tableStartRow + 1;
                endRow = tableEndRow;
                break;
            case TableOptionType.HEADERS:
                startRow = tableStartRow;
                endRow = tableStartRow;
                break;
            case TableOptionType.TOTALS:
                startRow = tableEndRow;
                endRow = tableEndRow;
                break;
            case TableOptionType.THIS_ROW: {
                const r = this._resolveThisRow(tableStartRow, tableEndRow);
                startRow = r;
                endRow = r;
                break;
            }
            default:
                // Defensive: Unknown type defaults to DATA
                startRow = tableStartRow + 1;
                endRow = tableEndRow;
                break;
        }

        this.setRangeData({
            startColumn,
            endColumn,
            startRow,
            endRow,
        });
    }

    override getRangeData() {
        const rangeData = super.getRangeData();
        if (this._isCurrentRowForRange) {
            const { startRow, startColumn, endRow, endColumn } = rangeData;
            const currentRow = this.getCurrentRow();
            return {
                startRow: currentRow == null ? startRow : currentRow,
                endRow: currentRow == null ? endRow : currentRow,
                startColumn,
                endColumn,
            };
        }
        return rangeData;
    }

    override getRefOffset() {
        return {
            x: 0,
            y: 0,
        };
    }

    override isTable() {
        return true;
    }

    override isCurrentRowForRange(): boolean {
        return this._isCurrentRowForRange;
    }

    override setForcedSheetId(sheetNameMap: IUnitSheetNameMap) {
        // No-op: already set in constructor
    }

    /**
     * Parse structured reference body, returning column range and Section type.
     * Determination rules:
     *  - Whether it's a Section depends on "whether it starts with # after stripping", not whether it still has brackets.
     *  - No comma: Either Section, or column/column range
     *  - Has comma: Left is Section, right is column/column range
     */
    private _parseStructuredRef(
        raw: string | undefined,
        titleMap: Map<string, number>
    ): { startColumn: number; endColumn: number; type: TableOptionType } {
        const { range } = this._tableData;
        const fullStartCol = range.startColumn ?? 0;
        const fullEndCol = range.endColumn ?? 0;

        if (!raw || raw.trim().length === 0) {
            // Empty reference: By conventional semantics → all columns in data area
            return { startColumn: fullStartCol, endColumn: fullEndCol, type: TableOptionType.DATA };
        }

        const s = raw.trim();

        // Section-only form (without brackets): e.g., "#Data"
        if (s[0] !== '[') {
            const typeMaybe = this._mapSection(s); // Only hits if starts with #
            if (typeMaybe !== undefined) {
                return { startColumn: fullStartCol, endColumn: fullEndCol, type: typeMaybe };
            }
            // Not a Section: Treat as column name (rare, but for error tolerance)
            const { startColumn, endColumn } = this._parseColumnOrRange(s, titleMap);
            return { startColumn, endColumn, type: TableOptionType.DATA };
        }

        // Strip one layer of outer brackets
        const body = this._stripOuterBracketOnce(s);
        const commaAt = this._findCommaAtTopLevel(body);

        if (body.length === 0) {
            // Empty brackets: By conventional semantics → all columns in data area
            return { startColumn: fullStartCol, endColumn: fullEndCol, type: TableOptionType.DATA };
        }

        if (commaAt === -1) {
            // No comma: Either Section, or column/column range
            if (body.startsWith('#')) {
                const typeMaybe = this._mapSection(body);
                if (typeMaybe !== undefined) {
                    return { startColumn: fullStartCol, endColumn: fullEndCol, type: typeMaybe };
                }
                // '#...' but not recognized → fallback to DATA (could also throw error)
                return { startColumn: fullStartCol, endColumn: fullEndCol, type: TableOptionType.DATA };
            }
            // Not a Section: column/column range. Note: passing original s (with brackets) is more robust.
            const { startColumn, endColumn } = this._parseColumnOrRange(body, titleMap);
            return { startColumn, endColumn, type: TableOptionType.DATA };
        }

        // Has comma: Left Section + Right column/column range
        const sectionRaw = body.slice(0, commaAt).trim(); // May be "[#Data]" or "#Data"
        const columnsRaw = body.slice(commaAt + 1).trim(); // May be "[Col]" or "[[ColA]:[ColB]]" or "Col"

        const section = this._parseSectionMaybeBracketed(sectionRaw);
        const { startColumn, endColumn } = this._parseColumnOrRange(columnsRaw, titleMap);

        return { startColumn, endColumn, type: section };
    }

    /** Strip one layer of outer brackets from "[...]" (return as-is if none) */
    private _stripOuterBracketOnce(s: string): string {
        if (s.length >= 2 && s[0] === '[' && s[s.length - 1] === ']') {
            return s.slice(1, -1);
        }
        return s;
    }

    /**
     * Find first comma at depth=0 (used to split Section and column parts)
     * Compatible with nesting like "[[#Data],[ColA]:[ColB]]".
     */
    private _findCommaAtTopLevel(s: string): number {
        let depth = 0;
        for (let i = 0; i < s.length; i++) {
            const ch = s[i];
            if (ch === '[') depth++;
            else if (ch === ']') depth = Math.max(0, depth - 1);
            else if (ch === matchToken.COMMA && depth === 0) return i;
        }
        return -1;
    }

    /**
     * Parse Section, compatible with both "[#Data]" and "#Data" inputs
     * Returns TableOptionType if matched; returns DATA if not (could throw error instead)
     */
    private _parseSectionMaybeBracketed(raw: string): TableOptionType {
        const x = raw.trim();
        const inner = (x.startsWith('[') && x.endsWith(']')) ? this._stripOuterBracketOnce(x) : x;
        const typeMaybe = this._mapSection(inner);
        return typeMaybe ?? TableOptionType.DATA;
    }

    /**
     * Section mapping: Only accepts keywords starting with #.
     * Returns undefined if not a valid Section (caller treats as column or fallback).
     */
    private _mapSection(x: string): TableOptionType | undefined {
        const key = x.trim();
        if (!key.startsWith('#')) return undefined;

        // Exact match
        const hit = this._tableOptionMap.get(key);
        if (hit !== undefined) return hit;

        // Lenient: Remove extra spaces / ignore case
        const norm = key.replace(/\s+/g, ' ').toLowerCase();
        for (const [k, v] of this._tableOptionMap.entries()) {
            const kk = k.replace(/\s+/g, ' ').toLowerCase();
            if (kk === norm) return v;
        }
        return undefined;
    }

    /**
     * Parse column selection:
     * - "[Col]" / "Col"               => Single column
     * - "[[ColA]:[ColB]]" / "[ColA]:[ColB]" / "ColA:ColB"  => Column range
     *
     * Rules:
     * - First find colon at top level, strip one layer of brackets from left and right sides (if present)
     * - Returns -1 if column name not found (caller should handle as parse error)
     */
    private _parseColumnOrRange(
        raw: string,
        titleMap: Map<string, number>
    ): { startColumn: number; endColumn: number } {
        const s = raw.trim();

        // Check if there's a range colon at top level
        const colonAt = this._findColonAtTopLevel(s);
        if (colonAt === -1) {
            // Single column (may be "[Col]" or "Col")
            const name = this._stripOuterBracketIfAny(s);
            const idx = this._titleToIndex(name, titleMap);
            return { startColumn: idx, endColumn: idx };
        }

        // Range: Left and right may be "[ColA]" / "ColA"
        const left = s.slice(0, colonAt).trim();
        const right = s.slice(colonAt + 1).trim();

        const leftName = this._stripOuterBracketIfAny(left);
        const rightName = this._stripOuterBracketIfAny(right);

        const l = this._titleToIndex(leftName, titleMap);
        const r = this._titleToIndex(rightName, titleMap);

        // Excel requires l <= r; swap for error tolerance here (could throw error for strict conformance)
        if (l !== -1 && r !== -1 && l > r) {
            return { startColumn: r, endColumn: l };
        }
        return { startColumn: l, endColumn: r };
    }

    /** Strip one layer of outer brackets; return as-is if none (compatible with "[Col]" and "Col") */
    private _stripOuterBracketIfAny(t: string): string {
        return (t.length >= 2 && t[0] === '[' && t[t.length - 1] === ']')
            ? t.slice(1, -1)
            : t;
    }

    /** Find range colon at depth=0 */
    private _findColonAtTopLevel(s: string): number {
        let depth = 0;
        for (let i = 0; i < s.length; i++) {
            const ch = s[i];
            if (ch === '[') depth++;
            else if (ch === ']') depth = Math.max(0, depth - 1);
            else if (ch === matchToken.COLON && depth === 0) return i;
        }
        return -1;
    }

    /** Column title → column index; returns -1 if not found (caller should handle as parse error) */
    private _titleToIndex(name: string, titleMap: Map<string, number>): number {
        const key = name.trim();
        const hit = titleMap.get(key);
        if (hit !== undefined) return hit;

        // Defensive: Full-width space → half-width, then trim
        const keyNorm = key.replace(/\u3000/g, ' ').trim();
        return titleMap.get(keyNorm) ?? -1;
    }

    /** Resolve #This Row's row number; takes first data row (tableStartRow+1) when no context available */
    private _resolveThisRow(tableStartRow: number, tableEndRow: number): number {
        this._isCurrentRowForRange = true;
        return Math.min(tableStartRow + 1, tableEndRow);
    }
}
