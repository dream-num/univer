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

import type { IDocumentData } from '../types/interfaces';

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

export type BaseCellPrimitiveValue = string | number | boolean | null;
export type BaseCellValueType = FieldType | 'string' | 'number' | 'boolean' | 'blank';

export interface BaseCellData {
    v?: BaseCellPrimitiveValue;
    t?: BaseCellValueType | null;
    p?: IDocumentData | null;
    f?: string | null;
    si?: string | null;
}

export type BaseCellMatrix = Record<number, Record<number, BaseCellData>>;

export interface BaseResources {
    multiValueSets?: Record<string, string[]>;
    memberSets?: Record<string, string[]>;
    attachmentSets?: Record<string, string[]>;
    attachments?: Record<string, Record<string, unknown>>;
}

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
    | 'updatedBy'
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

export interface IBaseSnapshot {
    id: BaseId;
    name: string;
    schemaVersion: number;
    tables: Record<TableId, ITableSnapshot>;
    tableOrder: TableId[];
    createdAt: number;
    updatedAt: number;
    createdBy?: string;
    rev?: number;
}

export interface ITableSnapshot {
    id: TableId;
    name: string;
    fields: Record<FieldId, IFieldSnapshot>;
    fieldOrder: FieldId[];
    records: Record<RecordId, IRecordSnapshot>;
    recordOrder?: RecordId[];
    rowIndex?: Record<RecordId, number>;
    rowId?: Record<number, RecordId>;
    colIndex?: Record<FieldId, number>;
    colId?: Record<number, FieldId>;
    cellData?: BaseCellMatrix;
    resources?: BaseResources;
    views: Record<ViewId, IViewSnapshot>;
    viewOrder: ViewId[];
    primaryFieldId: FieldId;
    deleted?: boolean;
}

export interface IRecordSnapshot {
    id: RecordId;
    values: Record<FieldId, CellValue>;
    orderKey: string;
    createdAt: number;
    updatedAt: number;
    createdBy?: string;
    updatedBy?: string;
    deleted?: boolean;
}

export interface IFieldSnapshot {
    id: FieldId;
    name: string;
    description?: string;
    type: FieldType;
    config: FieldConfig;
    defaultValue?: CellValue;
    system?: boolean;
    readonly?: boolean;
    deleted?: boolean;
}

export interface IViewSnapshot<TConfig extends ViewSpecificConfig = ViewSpecificConfig> {
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

export type BaseSnapshot = IBaseSnapshot;
export type TableSnapshot = ITableSnapshot;
export type RecordSnapshot = IRecordSnapshot;
export type FieldSnapshot = IFieldSnapshot;
export type ViewSnapshot<TConfig extends ViewSpecificConfig = ViewSpecificConfig> = IViewSnapshot<TConfig>;

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
    coverFieldId?: FieldId | null;
    fieldIds: FieldId[];
}

export type KanbanCardLayoutMode = 'normal' | 'compose';

export interface KanbanFieldCardSetting {
    hidden?: boolean;
    order?: number;
}

export interface KanbanColumnSetting {
    title?: string;
    color?: string;
    collapsed?: boolean;
}

export interface KanbanViewConfig {
    groupFieldId: FieldId;
    coverFieldId?: FieldId | null;
    cardLayout?: KanbanCardLayoutMode;
    showFieldNames?: boolean;
    fieldSettings?: Record<FieldId, KanbanFieldCardSetting>;
    columnSettings?: Record<string, KanbanColumnSetting>;
    card?: CardLayoutConfig;
}

export interface CalendarViewConfig {
    startDateFieldId: FieldId;
    endDateFieldId?: FieldId;
    titleFieldId?: FieldId;
    colorFieldId?: FieldId;
    mode: 'month' | 'week' | 'day';
    timeslotSize?: 'short' | 'medium' | 'long';
    timeZone?: 'local' | string;
    displayColor?: { type: 'custom'; color: string } | { type: 'selectField'; fieldId: FieldId };
    fieldSettings?: Record<FieldId, { hidden?: boolean; order?: number }>;
}

export interface BaseViewColorCondition {
    id: string;
    color: string;
    target?: 'cell' | 'row' | 'column';
    fieldId: FieldId;
    operator:
        | 'is'
        | 'isNot'
        | 'contains'
        | 'notContains'
        | 'isEmpty'
        | 'isNotEmpty'
        | 'greaterThan'
        | 'lessThan'
        | 'before'
        | 'after';
    operand?: unknown;
    dateMode?:
        | 'exact'
        | 'today'
        | 'tomorrow'
        | 'yesterday'
        | 'thisWeek'
        | 'lastWeek'
        | 'thisMonth'
        | 'lastMonth'
        | 'past7'
        | 'next7'
        | 'past30'
        | 'next30';
}

export interface GanttViewConfig {
    startDateFieldId: FieldId;
    endDateFieldId: FieldId;
    titleFieldId?: FieldId;
    progressFieldId?: FieldId;
    dependencyFieldId?: FieldId;
    scale: 'week' | 'month' | 'quarter' | 'year';
    leftPaneWidth?: number;
    leftPaneCollapsed?: boolean;
    showTodayLine?: boolean;
    showWeekend?: boolean;
    displayColor?:
        | { type: 'custom'; color: string }
        | { type: 'selectField'; fieldId: FieldId }
        | { type: 'conditional'; rules: BaseViewColorCondition[] };
    fieldSettings?: Record<FieldId, { hidden?: boolean; order?: number }>;
    workingDaysOnly?: boolean;
    workingDays?: {
        weekdays: Array<1 | 2 | 3 | 4 | 5 | 6 | 7>;
        exceptions: Array<{
            id: string;
            date: number;
            name: string;
            type: 'off' | 'working';
        }>;
    };
}

export interface GalleryViewConfig {
    card: CardLayoutConfig;
    coverFieldId?: FieldId | null;
    cardLayout?: KanbanCardLayoutMode;
    showFieldNames?: boolean;
    fieldSettings?: Record<FieldId, KanbanFieldCardSetting>;
    cardSize?: 'small' | 'medium' | 'large';
}

export interface ProjectedField {
    id: FieldId;
    name: string;
    description?: string;
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
    groupFieldId: FieldId;
    coverFieldId?: FieldId | null;
    cardLayout: KanbanCardLayoutMode;
    showFieldNames: boolean;
    visibleCardFieldIds: FieldId[];
    lanes: Array<{
        key: string;
        title: string;
        color?: string;
        recordIds: RecordId[];
    }>;
}

export interface CalendarProjection extends ViewProjection {
    type: 'calendar';
    config: CalendarViewConfig;
    events: Array<{
        recordId: RecordId;
        title: string;
        start: number;
        end?: number;
        color?: string;
        startMs: number;
        endMs?: number;
        allDay: boolean;
        fieldValues: Record<FieldId, CellValue>;
    }>;
}

export interface GanttTimeColumn {
    id: string;
    label: string;
    majorLabel?: string;
    start: number;
    end: number;
    nonWorking?: boolean;
}

export interface GanttProjection extends ViewProjection {
    type: 'gantt';
    config: GanttViewConfig;
    timeline: {
        scale: 'week' | 'month' | 'quarter' | 'year';
        start: number;
        end: number;
        unitWidth: number;
        majorHeaders: Array<{
            id: string;
            label: string;
            start: number;
            end: number;
        }>;
        columns: GanttTimeColumn[];
    };
    bars: Array<{
        recordId: RecordId;
        title: string;
        start: number;
        end: number;
        color: string;
        progress?: number;
        workingDayCount?: number;
        dependencyRecordIds?: RecordId[];
    }>;
}

export interface GalleryProjection extends ViewProjection {
    type: 'gallery';
    coverFieldId?: FieldId | null;
    cardLayout: KanbanCardLayoutMode;
    showFieldNames: boolean;
    visibleCardFieldIds: FieldId[];
    cardSize: 'small' | 'medium' | 'large';
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
    groupKey?: string;
}

export interface CalendarEventSelection {
    type: 'calendar-event';
    tableId: TableId;
    viewId: ViewId;
    recordId: RecordId;
    allDay?: boolean;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
}

export interface CalendarEventResizeSelection {
    type: 'calendar-event-resize';
    tableId: TableId;
    viewId: ViewId;
    recordId: RecordId;
    edge: 'start' | 'end';
    x?: number;
    y?: number;
    width?: number;
    height?: number;
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
        type: 'grid-fill-handle';
        tableId: TableId;
        viewId: ViewId;
        recordId: RecordId;
        fieldId: FieldId;
    }
    | {
        type: 'grid-freeze-handle';
        tableId: TableId;
        viewId: ViewId;
        frozenFieldCount: number;
        x: number;
    }
    | {
        type: 'grid-stat';
        tableId: TableId;
        viewId: ViewId;
        fieldId: FieldId;
        fieldIndex: number;
    }
    | {
        type: 'grid-record-open';
        tableId: TableId;
        viewId: ViewId;
        recordId: RecordId;
    }
    | {
        type: 'kanban-add-record';
        tableId: TableId;
        viewId: ViewId;
        groupFieldId: FieldId;
        groupKey: string;
    }
    | {
        type: 'kanban-add-group';
        tableId: TableId;
        viewId: ViewId;
        groupFieldId: FieldId;
        x: number;
        y: number;
        width: number;
        height: number;
    }
    | {
        type: 'kanban-column';
        tableId: TableId;
        viewId: ViewId;
        groupFieldId: FieldId;
        groupKey: string;
        x: number;
        y: number;
        width: number;
        height: number;
    }
    | {
        type: 'kanban-column-title';
        tableId: TableId;
        viewId: ViewId;
        groupFieldId: FieldId;
        groupKey: string;
        title: string;
        x: number;
        y: number;
        width: number;
        height: number;
    }
    | {
        type: 'kanban-column-color';
        tableId: TableId;
        viewId: ViewId;
        groupFieldId: FieldId;
        groupKey: string;
        x: number;
        y: number;
        width: number;
        height: number;
    }
    | {
        type: 'kanban-card-checkbox';
        tableId: TableId;
        viewId: ViewId;
        recordId: RecordId;
        fieldId: FieldId;
        groupKey?: string;
    }
    | {
        type: 'kanban-lane-scrollbar-edge' | 'kanban-lane-scrollbar-thumb';
        tableId: TableId;
        viewId: ViewId;
        groupKey: string;
        x: number;
        y: number;
        width: number;
        height: number;
        trackY: number;
        trackHeight: number;
        thumbHeight: number;
        maxScroll: number;
    }
    | {
        type: 'calendar-mode-tab';
        tableId: TableId;
        viewId: ViewId;
        mode: 'day' | 'week' | 'month';
    }
    | {
        type: 'calendar-today';
        tableId: TableId;
        viewId: ViewId;
    }
    | {
        type: 'calendar-navigate';
        tableId: TableId;
        viewId: ViewId;
        direction: 'prev' | 'next';
    }
    | {
        type: 'calendar-day-cell';
        tableId: TableId;
        viewId: ViewId;
        dateMs: number;
    }
    | {
        type: 'calendar-more-events';
        tableId: TableId;
        viewId: ViewId;
        dateMs: number;
        count: number;
    }
    | {
        type: 'gantt-offscreen-record';
        tableId: TableId;
        viewId: ViewId;
        recordId: RecordId;
        direction: 'prev' | 'next';
    }
    | {
        type: 'gantt-row';
        tableId: TableId;
        viewId: ViewId;
        recordId: RecordId;
    }
    | CalendarEventResizeSelection
    | BaseSelection;

export interface BaseInvalidation {
    tableId: TableId;
    viewId?: ViewId;
    recordId?: RecordId;
    fieldId?: FieldId;
    row?: number;
    column?: number;
    reason: 'cell' | 'field' | 'record' | 'view' | 'table' | 'unknown';
}
