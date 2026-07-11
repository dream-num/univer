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

import type { Observable } from 'rxjs';
import type { CellValue, IBaseCellData, IBaseSnapshot, IFieldSnapshot, IRecordSnapshot, ITableSnapshot } from './typedef';
import { BehaviorSubject } from 'rxjs';
import { UnitModel, UniverInstanceType } from '../common/unit';
import { Tools } from '../shared/tools';
import { CellValueType } from '../types/enum';
import { getEmptySnapshot } from './empty-snapshot';
import { BaseFieldType } from './typedef';

const BASE_LIST_VALUE_SEPARATOR = ', ';
const BASE_ATTACHMENT_RESOURCE_KEY_SEPARATOR = '\u001F';
type ICompressedBaseCellTuple = [number, number, IBaseCellData & { c?: 1 }];

export class BaseDataModel extends UnitModel<IBaseSnapshot, UniverInstanceType.UNIVER_BASE> {
    override readonly type: UniverInstanceType.UNIVER_BASE = UniverInstanceType.UNIVER_BASE;

    private readonly _name$: BehaviorSubject<string>;
    override readonly name$: Observable<string>;
    private _snapshot: IBaseSnapshot;

    constructor(snapshot: Partial<IBaseSnapshot> = {}) {
        super();

        const defaultSnapshot = getEmptySnapshot();
        this._snapshot = normalizeBaseSnapshot(Tools.commonExtend(defaultSnapshot, snapshot));

        if (!this._snapshot.id) {
            this._snapshot.id = `base-${Math.random().toString(36).slice(2, 10)}`;
        }

        this._name$ = new BehaviorSubject<string>(this._snapshot.name);
        this.name$ = this._name$.asObservable();
    }

    override getUnitId(): string {
        return this._snapshot.id;
    }

    override setName(name: string): void {
        this._snapshot.name = name;
        this._snapshot.updatedAt = Date.now();
        this._name$.next(name);
    }

    override getSnapshot(): IBaseSnapshot {
        return this._snapshot;
    }

    /** Check if a table name already exists, ignoring case. */
    checkTableName(name: string): boolean {
        return Object.values(this._snapshot.tables).some((table) => table.name.toLowerCase() === name.toLowerCase());
    }

    /** Generate a table name that does not conflict with existing tables. */
    uniqueTableName(name: string): string {
        let output = name;
        let count = 1;
        while (this.checkTableName(output)) {
            output = `${name}${count}`;
            count++;
        }
        return output;
    }

    setSnapshot(snapshot: IBaseSnapshot): void {
        this._snapshot = isNormalizedBaseSnapshot(snapshot) ? snapshot : normalizeBaseSnapshot(snapshot);
        this._name$.next(snapshot.name);
    }

    override getRev(): number {
        return this._snapshot.rev ?? 1;
    }

    override incrementRev(): void {
        this._snapshot.rev = this.getRev() + 1;
    }

    override setRev(rev: number): void {
        this._snapshot.rev = rev;
    }

    override dispose(): void {
        super.dispose();
        this._name$.complete();
    }
}

function normalizeBaseSnapshot(snapshot: IBaseSnapshot): IBaseSnapshot {
    delete (snapshot as IBaseSnapshot & { compress?: unknown }).compress;
    delete (snapshot as IBaseSnapshot & { kind?: unknown }).kind;
    Object.values(snapshot.tables ?? {}).forEach((table) => {
        normalizeBaseTable(table);
    });
    return snapshot;
}

function isNormalizedBaseSnapshot(snapshot: IBaseSnapshot): boolean {
    return Object.values(snapshot.tables ?? {}).every((table) => isNormalizedBaseTable(table));
}

function isNormalizedBaseTable(table: ITableSnapshot): boolean {
    const records = table.records ?? {};
    const fields = table.fields ?? {};
    if (
        !Array.isArray(table.recordOrder)
        || !table.rowIndex
        || !table.rowId
        || !table.colIndex
        || !table.colId
        || !table.cellData
        || !table.resources
        || !table.resources.attachmentSets
        || !table.resources.attachments
    ) {
        return false;
    }

    if (Object.keys(records).length !== table.recordOrder.length) {
        return false;
    }

    for (let index = 0; index < table.recordOrder.length; index++) {
        const recordId = table.recordOrder[index];
        if (!records[recordId] || table.rowIndex[recordId] !== index || table.rowId[index] !== recordId) {
            return false;
        }
    }

    for (let index = 0; index < table.fieldOrder.length; index++) {
        const fieldId = table.fieldOrder[index];
        if (!fields[fieldId]) {
            continue;
        }
        if (table.colIndex[fieldId] !== index || table.colId[index] !== fieldId) {
            return false;
        }
    }

    return true;
}

function normalizeBaseTable(table: ITableSnapshot): void {
    hydrateCompressedCellData(table);

    const records = table.records ?? {};
    const fields = table.fields ?? {};
    const orderedRecordIds = getOrderedRecordIds(table, records);
    const orderedFieldIds = getOrderedFieldIds(table, fields);

    table.recordOrder = orderedRecordIds;
    cloneBaseTableMutableMaps(table);
    normalizeExistingCellData(table, fields);
    rebuildRowIndexes(table, records, orderedRecordIds);
    rebuildColumnIndexes(table, fields, orderedFieldIds);
    hydrateRecordCellData(table, records, fields);
}

function hydrateCompressedCellData(table: ITableSnapshot): void {
    const compressedCellData = (table as ITableSnapshot & { cd?: ICompressedBaseCellTuple[] }).cd;
    if (compressedCellData && !table.cellData) {
        table.cellData = Object.create(null) as ITableSnapshot['cellData'];
        compressedCellData.forEach(([row, col, cell]) => {
            table.cellData![row] = table.cellData![row] ?? {};
            const { c: _compressed, ...cellData } = cell;
            table.cellData![row][col] = cellData;
        });
        delete (table as ITableSnapshot & { cd?: unknown }).cd;
    }
}

function getOrderedRecordIds(table: ITableSnapshot, records: Record<string, IRecordSnapshot>): string[] {
    const orderedRecordIds = table.recordOrder?.filter((recordId) => records[recordId]) ?? [];
    const orderedRecordIdSet = new Set(orderedRecordIds);
    const missingRecords = Object.values(records).filter((record) => !orderedRecordIdSet.has(record.id));
    if (!missingRecords.length) {
        return orderedRecordIds;
    }

    return [
        ...orderedRecordIds,
        ...missingRecords.sort((a, b) => a.orderKey.localeCompare(b.orderKey)).map((record) => record.id),
    ];
}

function getOrderedFieldIds(table: ITableSnapshot, fields: Record<string, IFieldSnapshot>): string[] {
    return table.fieldOrder.filter((fieldId) => fields[fieldId]);
}

function cloneBaseTableMutableMaps(table: ITableSnapshot): void {
    table.rowIndex = { ...table.rowIndex };
    table.rowId = { ...table.rowId };
    table.colIndex = { ...table.colIndex };
    table.colId = { ...table.colId };
    table.cellData = { ...table.cellData };
    table.resources = { ...table.resources };
    table.resources.attachmentSets = { ...table.resources.attachmentSets };
    table.resources.attachments = { ...table.resources.attachments };
}

function normalizeExistingCellData(table: ITableSnapshot, fields: Record<string, IFieldSnapshot>): void {
    Object.entries(table.cellData ?? {}).forEach(([rowKey, rowData]) => {
        const row = Number(rowKey);
        table.cellData![row] = { ...rowData };
        Object.entries(table.cellData![row] ?? {}).forEach(([colKey, cell]) => {
            const col = Number(colKey);
            const fieldId = table.colId?.[col];
            table.cellData![row][col] = normalizeBaseCellData(cell, fieldId ? fields[fieldId] : undefined);
        });
    });
}

function rebuildRowIndexes(table: ITableSnapshot, records: Record<string, IRecordSnapshot>, orderedRecordIds: string[]): void {
    orderedRecordIds.forEach((recordId, index) => {
        if (table.rowIndex![recordId] == null) {
            table.rowIndex![recordId] = index;
        }
    });
    Object.entries(table.rowIndex ?? {}).forEach(([recordId, row]) => {
        if (records[recordId]) {
            table.rowId![row] = recordId;
        }
    });
}

function rebuildColumnIndexes(table: ITableSnapshot, fields: Record<string, IFieldSnapshot>, orderedFieldIds: string[]): void {
    orderedFieldIds.forEach((fieldId, index) => {
        if (table.colIndex![fieldId] == null) {
            table.colIndex![fieldId] = index;
        }
    });
    Object.entries(table.colIndex ?? {}).forEach(([fieldId, col]) => {
        if (fields[fieldId]) {
            table.colId![col] = fieldId;
        }
    });
}

function hydrateRecordCellData(table: ITableSnapshot, records: Record<string, IRecordSnapshot>, fields: Record<string, IFieldSnapshot>): void {
    Object.values(records).forEach((record) => {
        const row = table.rowIndex![record.id];
        if (row == null) {
            return;
        }
        table.cellData![row] = { ...table.cellData![row] };
        Object.entries(record.values ?? {}).forEach(([fieldId, value]) => {
            const field = fields[fieldId];
            if (field?.type === BaseFieldType.Attachment) {
                writeAttachmentResources(table, record.id, fieldId, value);
            }
            const col = table.colIndex![fieldId];
            if (col == null) {
                return;
            }
            const existingCell = table.cellData![row][col];
            if (existingCell != null) {
                table.cellData![row][col] = normalizeBaseCellData(existingCell, field);
                if (shouldRefreshCellDataFromRecord(existingCell, field, value)) {
                    table.cellData![row][col] = toBaseCellData(value, field);
                }
                return;
            }
            table.cellData![row][col] = toBaseCellData(value, field);
        });
    });
}

function toBaseCellData(value: CellValue | IBaseCellData, field?: IFieldSnapshot): IBaseCellData {
    if (isBaseCellData(value)) {
        if (field?.type === BaseFieldType.Attachment) {
            return { ...value, v: '', t: CellValueType.STRING };
        }
        return normalizeBaseCellData(value, field);
    }
    if (field?.type === BaseFieldType.Attachment) {
        return { v: '', t: CellValueType.STRING };
    }
    if (isListField(field)) {
        return { v: normalizeListValue(value).join(BASE_LIST_VALUE_SEPARATOR), t: CellValueType.STRING };
    }
    if (field?.type === BaseFieldType.Link && value && typeof value === 'object' && !Array.isArray(value)) {
        const link = value as { text?: unknown; url?: unknown };
        return { v: String(link.text ?? link.url ?? ''), t: CellValueType.STRING };
    }
    if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return { v: value, t: inferPrimitiveType(value) };
    }

    return { v: null, t: null };
}

function normalizeBaseCellData(cell: IBaseCellData, _field?: IFieldSnapshot): IBaseCellData {
    const type = normalizeBaseCellValueType(cell.t, cell.v);
    if (type === undefined) {
        const { t: _t, ...rest } = cell;
        return rest;
    }
    return { ...cell, t: type };
}

function isBaseCellData(value: unknown): value is IBaseCellData {
    return !!value && typeof value === 'object' && (
        Object.prototype.hasOwnProperty.call(value, 'v')
        || Object.prototype.hasOwnProperty.call(value, 't')
        || Object.prototype.hasOwnProperty.call(value, 'p')
        || Object.prototype.hasOwnProperty.call(value, 'f')
        || Object.prototype.hasOwnProperty.call(value, 'si')
    );
}

function writeAttachmentResources(table: ITableSnapshot, recordId: string, fieldId: string, value: unknown): void {
    const attachments = normalizeAttachmentValue(value);
    table.resources = { ...table.resources };
    table.resources.attachmentSets = { ...table.resources.attachmentSets };
    table.resources.attachments = { ...table.resources.attachments };
    const key = `${fieldId}${BASE_ATTACHMENT_RESOURCE_KEY_SEPARATOR}${recordId}`;
    table.resources.attachmentSets[key] = attachments.map((attachment, index) => {
        const id = String(attachment.id ?? `${key}${BASE_ATTACHMENT_RESOURCE_KEY_SEPARATOR}${index}`);
        const normalizedAttachment = { ...attachment, id };
        table.resources!.attachments![id] = normalizedAttachment;
        return id;
    });
}

function normalizeAttachmentValue(value: unknown): Record<string, unknown>[] {
    if (value == null || value === '') {
        return [];
    }
    if (isBaseCellData(value) && !('id' in value) && !('name' in value)) {
        return [];
    }
    const values = Array.isArray(value) ? value : [value];
    const attachments: Record<string, unknown>[] = [];
    for (let i = 0; i < values.length; i++) {
        const item = values[i];
        if (item && typeof item === 'object') {
            const attachment = { ...(item as Record<string, unknown>) };
            if (Object.keys(attachment).length > 0) {
                attachments.push(attachment);
            }
            continue;
        }
        attachments.push({ id: `attachment-${i}`, name: String(item) });
    }
    return attachments;
}

function shouldRefreshCellDataFromRecord(cell: IBaseCellData, field: IFieldSnapshot | undefined, value: unknown): boolean {
    if (field?.type === BaseFieldType.Attachment) {
        return cell.v !== '';
    }
    if (isListField(field)) {
        return Array.isArray(value) && (cell.v == null || cell.v === '');
    }
    return false;
}

function isListField(field?: IFieldSnapshot): boolean {
    return field?.type === BaseFieldType.MultiSelect || field?.type === BaseFieldType.Person || field?.type === BaseFieldType.Group;
}

function normalizeListValue(value: unknown): string[] {
    if (value == null || value === '') {
        return [];
    }
    const result: string[] = [];
    if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
            const item = primitiveText(value[i]);
            if (item) {
                result.push(item);
            }
        }
        return result;
    }
    const items = String(value).split(',');
    for (let i = 0; i < items.length; i++) {
        const item = items[i].trim();
        if (item) {
            result.push(item);
        }
    }
    return result;
}

function primitiveText(value: unknown): string {
    if (value == null) {
        return '';
    }
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }
    if (typeof value === 'object') {
        const record = value as Record<string, unknown>;
        return String(record.id ?? record.name ?? record.text ?? '');
    }
    return String(value);
}

function inferPrimitiveType(value: CellValue): CellValueType | null {
    if (value == null) {
        return null;
    }
    if (typeof value === 'number') {
        return CellValueType.NUMBER;
    }
    if (typeof value === 'boolean') {
        return CellValueType.BOOLEAN;
    }
    return CellValueType.STRING;
}

function normalizeBaseCellValueType(type: IBaseCellData['t'], value: IBaseCellData['v']): CellValueType | null | undefined {
    if (type === CellValueType.STRING || type === CellValueType.NUMBER || type === CellValueType.BOOLEAN || type === CellValueType.FORCE_STRING || type == null) {
        return type;
    }
    return inferPrimitiveType(value ?? null);
}
