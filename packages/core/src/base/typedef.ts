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

export type BaseId = string;
export type TableId = string;
export type FieldId = string;
export type RecordId = string;
export type ViewId = string;

export type PrimitiveCellValue = string | number | boolean;
export type CellValue =
    | PrimitiveCellValue
    | PrimitiveCellValue[]
    | Record<string, unknown>
    | Record<string, unknown>[]
    | null;

export type FieldType =
    | 'text'
    | 'singleSelect'
    | 'multiSelect'
    | 'person'
    | 'group'
    | 'date'
    | 'attachment'
    | 'number'
    | 'checkbox'
    | 'link'
    | 'formula'
    | 'lookup'
    | 'flow'
    | 'button'
    | 'numbering'
    | 'phone'
    | 'email'
    | 'location'
    | 'barcode'
    | 'progress'
    | 'currency'
    | 'rating'
    | 'twoWayLink'
    | 'recordId'
    | 'createdBy'
    | 'createdAt'
    | 'updatedAt'
    | 'summary';

export type ViewType = 'grid' | 'kanban' | 'calendar' | 'gantt' | 'gallery';

export type FieldConfig = Record<string, unknown>;
export type ViewSpecificConfig =
    | GridViewConfig
    | KanbanViewConfig
    | CalendarViewConfig
    | GanttViewConfig
    | GalleryViewConfig
    | Record<string, unknown>;

export interface BaseSnapshot {
    id: BaseId;
    name: string;
    schemaVersion: number;
    tables: Record<TableId, TableSnapshot>;
    tableOrder: TableId[];
    createdAt: number;
    updatedAt: number;
    createdBy?: string;
    rev?: number;
}

export interface TableSnapshot {
    id: TableId;
    name: string;
    fields: Record<FieldId, FieldSnapshot>;
    fieldOrder: FieldId[];
    records: Record<RecordId, RecordSnapshot>;
    views: Record<ViewId, ViewSnapshot>;
    viewOrder: ViewId[];
    primaryFieldId: FieldId;
    deleted?: boolean;
}

export interface RecordSnapshot {
    id: RecordId;
    values: Record<FieldId, CellValue>;
    orderKey: string;
    createdAt: number;
    updatedAt: number;
    createdBy?: string;
    updatedBy?: string;
    deleted?: boolean;
}

export interface FieldSnapshot {
    id: FieldId;
    name: string;
    type: FieldType;
    config: FieldConfig;
    defaultValue?: CellValue;
    system?: boolean;
    readonly?: boolean;
    deleted?: boolean;
}

export interface ViewSnapshot<TConfig extends ViewSpecificConfig = ViewSpecificConfig> {
    id: ViewId;
    tableId: TableId;
    name: string;
    type: ViewType;
    fieldOrder?: FieldId[];
    fieldSettings?: Record<FieldId, ViewFieldSetting>;
    filter?: FilterConfig | null;
    sort?: SortConfig[];
    group?: GroupConfig[];
    config: TConfig;
    deleted?: boolean;
}

export interface ViewFieldSetting {
    hidden?: boolean;
    width?: number;
    showInCard?: boolean;
}

export interface FieldCapabilities {
    editable: boolean;
    sortable: boolean;
    filterable: boolean;
    groupable: boolean;
    usableAsKanbanGroup: boolean;
    usableAsCalendarDate: boolean;
    usableAsGanttStart: boolean;
    usableAsGanttEnd: boolean;
    usableAsGanttProgress: boolean;
    usableAsCardCover: boolean;
    usableAsTitle: boolean;
    supportsMultipleValues?: boolean;
    supportsOptions?: boolean;
    supportsRelation?: boolean;
}

export interface ValidationResult {
    valid: boolean;
    reason?: string;
}

export type FilterOperator =
    | 'is'
    | 'isNot'
    | 'contains'
    | 'notContains'
    | 'isEmpty'
    | 'isNotEmpty'
    | 'greaterThan'
    | 'greaterThanOrEqual'
    | 'lessThan'
    | 'lessThanOrEqual';

export interface FilterConfig {
    conjunction: 'and' | 'or';
    conditions: FilterCondition[];
}

export interface FilterCondition {
    fieldId: FieldId;
    operator: string;
    operand?: unknown;
}

export interface SortConfig {
    fieldId: FieldId;
    direction: 'asc' | 'desc';
}

export interface GroupConfig {
    fieldId: FieldId;
    direction?: 'asc' | 'desc';
    hideEmptyGroup?: boolean;
}

export interface GridViewConfig {
    frozenFieldCount?: number;
    showRecordIndex?: boolean;
    rowHeight?: 'short' | 'medium' | 'tall' | 'extraTall';
}

export interface CardLayoutConfig {
    titleFieldId?: FieldId;
    coverFieldId?: FieldId;
    fieldIds: FieldId[];
}

export interface KanbanViewConfig {
    groupFieldId: FieldId;
    card: CardLayoutConfig;
}

export interface CalendarViewConfig {
    startDateFieldId: FieldId;
    endDateFieldId?: FieldId;
    titleFieldId?: FieldId;
    colorFieldId?: FieldId;
    mode: 'month' | 'week' | 'day';
}

export interface GanttViewConfig {
    startDateFieldId: FieldId;
    endDateFieldId: FieldId;
    titleFieldId?: FieldId;
    progressFieldId?: FieldId;
    dependencyFieldId?: FieldId;
    scale: 'week' | 'month' | 'quarter' | 'year';
    leftPaneWidth?: number;
    showTodayLine?: boolean;
    showWeekend?: boolean;
}

export interface GalleryViewConfig {
    card: CardLayoutConfig;
    cardSize?: 'small' | 'medium' | 'large';
}

export interface ProjectedField {
    id: FieldId;
    name: string;
    type: FieldType;
    config?: FieldConfig;
    width?: number;
    setting: ViewFieldSetting;
}

export interface ViewProjection {
    type: ViewType;
    fields: ProjectedField[];
    rows: ProjectedRow[];
    groups?: ProjectedGroup[];
}

export interface ProjectedRow {
    recordId: RecordId;
    values: Record<FieldId, CellValue>;
}

export interface ProjectedGroup {
    key: string;
    path?: string;
    label: string;
    recordIds: RecordId[];
    fieldId?: FieldId;
    level?: number;
    children?: ProjectedGroup[];
}

export interface GridProjection extends ViewProjection {
    type: 'grid';
    frozenFieldCount?: number;
}

export interface KanbanProjection extends ViewProjection {
    type: 'kanban';
    lanes: Array<{
        key: string;
        title: string;
        recordIds: RecordId[];
    }>;
}

export interface CalendarProjection extends ViewProjection {
    type: 'calendar';
    events: Array<{
        recordId: RecordId;
        title: string;
        start: number;
        end?: number;
        color?: string;
    }>;
}

export interface GanttTimeColumn {
    id: string;
    label: string;
    start: number;
    end: number;
}

export interface GanttProjection extends ViewProjection {
    type: 'gantt';
    timeline: {
        scale: 'week' | 'month' | 'quarter' | 'year';
        start: number;
        end: number;
        columns: GanttTimeColumn[];
    };
    bars: Array<{
        recordId: RecordId;
        title: string;
        start: number;
        end: number;
        progress?: number;
        dependencyRecordIds?: RecordId[];
    }>;
}

export interface GalleryProjection extends ViewProjection {
    type: 'gallery';
    cards: Array<{
        recordId: RecordId;
        title: string;
        values: Record<FieldId, CellValue>;
    }>;
}

export interface InvalidViewProjection {
    type: 'invalid';
    viewType: ViewType;
    reason:
        | 'missingField'
        | 'invalidGroupField'
        | 'invalidDateField'
        | 'invalidGanttStartField'
        | 'invalidGanttEndField';
    fieldId?: FieldId;
}

export type BaseViewProjection =
    | GridProjection
    | KanbanProjection
    | CalendarProjection
    | GanttProjection
    | GalleryProjection
    | InvalidViewProjection;

export interface Viewport {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface Rect extends Viewport {}

export type BaseSelection =
    | GridCellSelection
    | GridGroupSelection
    | GridRecordSelection
    | GridFieldSelection
    | KanbanCardSelection
    | CalendarEventSelection
    | GanttCellSelection
    | GanttBarSelection
    | GalleryCardSelection;

export interface GridCellSelection {
    type: 'grid-cell';
    tableId: TableId;
    viewId: ViewId;
    recordId: RecordId;
    fieldId: FieldId;
}

export interface GridGroupSelection {
    type: 'grid-group';
    tableId: TableId;
    viewId: ViewId;
    fieldId: FieldId;
    groupKey: string;
    groupPath: string;
    level: number;
    collapsed: boolean;
}

export interface GridRecordSelection {
    type: 'grid-record';
    tableId: TableId;
    viewId: ViewId;
    recordId: RecordId;
}

export interface GridFieldSelection {
    type: 'grid-field';
    tableId: TableId;
    viewId: ViewId;
    fieldId: FieldId;
}

export interface KanbanCardSelection {
    type: 'kanban-card';
    tableId: TableId;
    viewId: ViewId;
    recordId: RecordId;
}

export interface CalendarEventSelection {
    type: 'calendar-event';
    tableId: TableId;
    viewId: ViewId;
    recordId: RecordId;
}

export interface GanttCellSelection {
    type: 'gantt-cell';
    tableId: TableId;
    viewId: ViewId;
    recordId: RecordId;
    fieldId: FieldId;
}

export interface GanttBarSelection {
    type: 'gantt-bar';
    tableId: TableId;
    viewId: ViewId;
    recordId: RecordId;
}

export interface GalleryCardSelection {
    type: 'gallery-card';
    tableId: TableId;
    viewId: ViewId;
    recordId: RecordId;
}

export type BaseHitTestResult =
    | { type: 'empty'; x: number; y: number }
    | {
        type: 'grid-freeze-handle';
        tableId: TableId;
        viewId: ViewId;
        frozenFieldCount: number;
        x: number;
    }
    | BaseSelection;

export interface BaseInvalidation {
    tableId: TableId;
    viewId?: ViewId;
    recordId?: RecordId;
    fieldId?: FieldId;
    reason: 'cell' | 'field' | 'record' | 'view' | 'table' | 'unknown';
}
