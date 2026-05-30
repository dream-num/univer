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
import type { BaseCellData, IBaseSnapshot, CellValue, IFieldSnapshot, ITableSnapshot } from './typedef';
import { BehaviorSubject } from 'rxjs';
import { UnitModel, UniverInstanceType } from '../common/unit';
import { Tools } from '../shared/tools';

const BASE_LIST_VALUE_SEPARATOR = ', ';
const BASE_ATTACHMENT_RESOURCE_KEY_SEPARATOR = '\u001f';

export class BaseDataModel extends UnitModel<IBaseSnapshot, UniverInstanceType.UNIVER_BASE> {
    override readonly type: UniverInstanceType.UNIVER_BASE = UniverInstanceType.UNIVER_BASE;

    private readonly _name$: BehaviorSubject<string>;
    override readonly name$: Observable<string>;
    private _snapshot: IBaseSnapshot;

    constructor(snapshot: Partial<IBaseSnapshot> = {}) {
        super();

        const now = Date.now();
        this._snapshot = normalizeBaseSnapshot(Tools.commonExtend({
            id: '',
            name: '',
            schemaVersion: 1,
            tables: {},
            tableOrder: [],
            createdAt: now,
            updatedAt: now,
            rev: 1,
        } as IBaseSnapshot, snapshot));

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

    setSnapshot(snapshot: IBaseSnapshot): void {
        this._snapshot = normalizeBaseSnapshot(snapshot);
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
    Object.values(snapshot.tables ?? {}).forEach(normalizeBaseTable);
    return snapshot;
}

function normalizeBaseTable(table: ITableSnapshot): void {
    const records = table.records ?? {};
    const fields = table.fields ?? {};
    const sortedRecordIds = Object.values(records)
        .sort((a, b) => a.orderKey.localeCompare(b.orderKey))
        .map((record) => record.id);
    const orderedRecordIds = [
        ...(table.recordOrder?.filter((recordId) => records[recordId]) ?? []),
        ...sortedRecordIds.filter((recordId) => !(table.recordOrder ?? []).includes(recordId)),
    ];
    const orderedFieldIds = table.fieldOrder.filter((fieldId) => fields[fieldId]);

    table.recordOrder = orderedRecordIds;
    table.rowIndex = { ...(table.rowIndex ?? {}) };
    table.rowId = { ...(table.rowId ?? {}) };
    table.colIndex = { ...(table.colIndex ?? {}) };
    table.colId = { ...(table.colId ?? {}) };
    table.cellData = { ...(table.cellData ?? {}) };
    table.resources = { ...(table.resources ?? {}) };
    table.resources.attachmentSets = { ...(table.resources.attachmentSets ?? {}) };
    table.resources.attachments = { ...(table.resources.attachments ?? {}) };

    orderedRecordIds.forEach((recordId, index) => {
        if (table.rowIndex![recordId] == null) {
            table.rowIndex![recordId] = index;
        }
    });
    Object.entries(table.rowIndex).forEach(([recordId, row]) => {
        if (records[recordId]) {
            table.rowId![row] = recordId;
        }
    });

    orderedFieldIds.forEach((fieldId, index) => {
        if (table.colIndex![fieldId] == null) {
            table.colIndex![fieldId] = index;
        }
    });
    Object.entries(table.colIndex).forEach(([fieldId, col]) => {
        if (fields[fieldId]) {
            table.colId![col] = fieldId;
        }
    });

    Object.values(records).forEach((record) => {
        const row = table.rowIndex![record.id];
        if (row == null) {
            return;
        }
        table.cellData![row] = { ...(table.cellData![row] ?? {}) };
        Object.entries(record.values ?? {}).forEach(([fieldId, value]) => {
            const field = fields[fieldId];
            if (field?.type === 'attachment') {
                writeAttachmentResources(table, record.id, fieldId, value);
            }
            const col = table.colIndex![fieldId];
            if (col == null) {
                return;
            }
            const existingCell = table.cellData![row][col];
            if (existingCell != null) {
                if (shouldRefreshCellDataFromRecord(existingCell, field, value)) {
                    table.cellData![row][col] = toBaseCellData(value, field);
                }
                return;
            }
            table.cellData![row][col] = toBaseCellData(value, field);
        });
    });
}

function toBaseCellData(value: CellValue | BaseCellData, field?: IFieldSnapshot): BaseCellData {
    if (isBaseCellData(value)) {
        if (field?.type === 'attachment') {
            return { ...value, v: '', t: field.type };
        }
        return value;
    }
    if (field?.type === 'attachment') {
        return { v: '', t: field.type };
    }
    if (isListField(field)) {
        return { v: normalizeListValue(value).join(BASE_LIST_VALUE_SEPARATOR), t: field.type };
    }
    if (field?.type === 'link' && value && typeof value === 'object' && !Array.isArray(value)) {
        const link = value as { text?: unknown; url?: unknown };
        return { v: String(link.text ?? link.url ?? ''), t: field.type };
    }
    if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        return { v: value, t: field?.type ?? inferPrimitiveType(value) };
    }

    return { v: null, t: field?.type ?? 'blank' };
}

function isBaseCellData(value: unknown): value is BaseCellData {
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
    table.resources = { ...(table.resources ?? {}) };
    table.resources.attachmentSets = { ...(table.resources.attachmentSets ?? {}) };
    table.resources.attachments = { ...(table.resources.attachments ?? {}) };
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
    return values.map((item, index) => {
        if (item && typeof item === 'object') {
            return { ...(item as Record<string, unknown>) };
        }
        return { id: `attachment-${index}`, name: String(item) };
    }).filter((attachment) => Object.keys(attachment).length > 0);
}

function shouldRefreshCellDataFromRecord(cell: BaseCellData, field: IFieldSnapshot | undefined, value: unknown): boolean {
    if (field?.type === 'attachment') {
        return cell.v !== '';
    }
    if (isListField(field)) {
        return Array.isArray(value) && (cell.v == null || cell.v === '');
    }
    return false;
}

function isListField(field?: IFieldSnapshot): field is IFieldSnapshot & { type: 'multiSelect' | 'person' | 'group' } {
    return field?.type === 'multiSelect' || field?.type === 'person' || field?.type === 'group';
}

function normalizeListValue(value: unknown): string[] {
    if (value == null || value === '') {
        return [];
    }
    if (Array.isArray(value)) {
        return value.map((item) => primitiveText(item)).filter(Boolean);
    }
    return String(value).split(',').map((item) => item.trim()).filter(Boolean);
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

function inferPrimitiveType(value: CellValue): 'string' | 'number' | 'boolean' | 'blank' {
    if (value == null) {
        return 'blank';
    }
    if (typeof value === 'number') {
        return 'number';
    }
    if (typeof value === 'boolean') {
        return 'boolean';
    }
    return 'string';
}
