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

import type { CellValueType, LocaleType } from '../types/enum';
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
export type BaseCellValueType = CellValueType;

export interface IBaseCellData {
    v?: BaseCellPrimitiveValue;
    t?: BaseCellValueType | null;
    p?: IDocumentData | null;
    f?: string | null;
    si?: string | null;
}

export type BaseCellMatrix = Record<number, Record<number, IBaseCellData>>;

export interface IBaseResources {
    multiValueSets?: Record<string, string[]>;
    memberSets?: Record<string, string[]>;
    attachmentSets?: Record<string, string[]>;
    attachments?: Record<string, Record<string, unknown>>;
}

export enum BaseFieldType {
    Text = 'text',
    SingleSelect = 'singleSelect',
    MultiSelect = 'multiSelect',
    Person = 'person',
    Group = 'group',
    Date = 'date',
    Attachment = 'attachment',
    Number = 'number',
    Checkbox = 'checkbox',
    Link = 'link',
    Formula = 'formula',
    Lookup = 'lookup',
    Flow = 'flow',
    Button = 'button',
    Numbering = 'numbering',
    Phone = 'phone',
    Email = 'email',
    Location = 'location',
    Barcode = 'barcode',
    Progress = 'progress',
    Currency = 'currency',
    Rating = 'rating',
    TwoWayLink = 'twoWayLink',
    RecordId = 'recordId',
    CreatedBy = 'createdBy',
    UpdatedBy = 'updatedBy',
    CreatedAt = 'createdAt',
    UpdatedAt = 'updatedAt',
    Summary = 'summary',
}

export enum BaseViewType {
    Grid = 'grid',
    Kanban = 'kanban',
    Calendar = 'calendar',
    Gantt = 'gantt',
    Gallery = 'gallery',
}

export type FieldConfig = Record<string, unknown>;
export type ViewSpecificConfig =
    | IGridViewConfig
    | IKanbanViewConfig
    | ICalendarViewConfig
    | IGanttViewConfig
    | IGalleryViewConfig
    | Record<string, unknown>;

export interface IBaseSnapshot {
    id: BaseId;
    name: string;
    rev?: number;
    appVersion?: string;
    locale?: LocaleType;
    schemaVersion: number;
    tables: Record<TableId, ITableSnapshot>;
    tableOrder: TableId[];
    createdAt: number;
    updatedAt: number;
    createdBy?: string;
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
    resources?: IBaseResources;
    views: Record<ViewId, IViewSnapshot>;
    viewOrder: ViewId[];
    primaryFieldId: FieldId;
}

export interface IRecordSnapshot {
    id: RecordId;
    values: Record<FieldId, CellValue>;
    orderKey: string;
    createdAt: number;
    updatedAt: number;
    createdBy?: string;
    updatedBy?: string;
}

export interface IFieldSnapshot {
    id: FieldId;
    name: string;
    description?: string;
    type: BaseFieldType;
    config: FieldConfig;
    defaultValue?: CellValue;
    system?: boolean;
    readonly?: boolean;
}

export interface IViewSnapshot<TConfig extends ViewSpecificConfig = ViewSpecificConfig> {
    id: ViewId;
    tableId: TableId;
    name: string;
    type: BaseViewType;
    fieldOrder?: FieldId[];
    fieldSettings?: Record<FieldId, IViewFieldSetting>;
    filter?: IFilterConfig | null;
    sort?: ISortConfig[];
    group?: IGroupConfig[];
    config: TConfig;
}

export type BaseSnapshot = IBaseSnapshot;
export type TableSnapshot = ITableSnapshot;
export type RecordSnapshot = IRecordSnapshot;
export type FieldSnapshot = IFieldSnapshot;
export type ViewSnapshot<TConfig extends ViewSpecificConfig = ViewSpecificConfig> = IViewSnapshot<TConfig>;

export interface IViewFieldSetting {
    hidden?: boolean;
    width?: number;
    showInCard?: boolean;
}

export interface IFieldCapabilities {
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

export interface IValidationResult {
    valid: boolean;
    reason?: string;
}

export enum BaseFilterOperator {
    IS = 'is',
    IS_NOT = 'isNot',
    CONTAINS = 'contains',
    NOT_CONTAINS = 'notContains',
    IS_EMPTY = 'isEmpty',
    IS_NOT_EMPTY = 'isNotEmpty',
    GREATER_THAN = 'greaterThan',
    GREATER_THAN_OR_EQUAL = 'greaterThanOrEqual',
    LESS_THAN = 'lessThan',
    LESS_THAN_OR_EQUAL = 'lessThanOrEqual',
    BEFORE = 'before',
    AFTER = 'after',
}

export enum BaseFilterConjunction {
    AND = 'and',
    OR = 'or',
}

export interface IFilterConfig {
    conjunction: BaseFilterConjunction;
    conditions: IFilterCondition[];
}

export interface IFilterCondition {
    fieldId: FieldId;
    operator: BaseFilterOperator;
    operand?: unknown;
}

export enum BaseSortDirection {
    ASC = 'asc',
    DESC = 'desc',
}

export interface ISortConfig {
    fieldId: FieldId;
    direction: BaseSortDirection;
}

export interface IGroupConfig {
    fieldId: FieldId;
    direction?: BaseSortDirection;
    hideEmptyGroup?: boolean;
}

export interface IGridViewConfig {
    frozenFieldCount?: number;
    showRecordIndex?: boolean;
    rowHeight?: 'short' | 'medium' | 'tall' | 'extraTall';
}

export interface ICardLayoutConfig {
    titleFieldId?: FieldId;
    coverFieldId?: FieldId | null;
    fieldIds: FieldId[];
}

export type KanbanCardLayoutMode = 'normal' | 'compose';

export interface IKanbanFieldCardSetting {
    hidden?: boolean;
    order?: number;
}

export interface IKanbanColumnSetting {
    title?: string;
    color?: string;
    collapsed?: boolean;
}

export interface IKanbanViewConfig {
    groupFieldId: FieldId;
    coverFieldId?: FieldId | null;
    cardLayout?: KanbanCardLayoutMode;
    showFieldNames?: boolean;
    fieldSettings?: Record<FieldId, IKanbanFieldCardSetting>;
    columnSettings?: Record<string, IKanbanColumnSetting>;
    card?: ICardLayoutConfig;
}

export interface ICalendarViewConfig {
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

export interface IBaseViewColorCondition {
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

export interface IGanttViewConfig {
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
        | { type: 'conditional'; rules: IBaseViewColorCondition[] };
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

export interface IGalleryViewConfig {
    card: ICardLayoutConfig;
    coverFieldId?: FieldId | null;
    cardLayout?: KanbanCardLayoutMode;
    showFieldNames?: boolean;
    fieldSettings?: Record<FieldId, IKanbanFieldCardSetting>;
    cardSize?: 'small' | 'medium' | 'large';
}

export interface IProjectedField {
    id: FieldId;
    name: string;
    description?: string;
    type: BaseFieldType;
    config?: FieldConfig;
    width?: number;
    setting: IViewFieldSetting;
}

export interface IViewProjection {
    type: BaseViewType;
    fields: IProjectedField[];
    rows: IProjectedRow[];
    groups?: IProjectedGroup[];
}

export interface IProjectedRow {
    recordId: RecordId;
    values: Record<FieldId, CellValue>;
}

export interface IProjectedGroup {
    key: string;
    path?: string;
    label: string;
    recordIds: RecordId[];
    fieldId?: FieldId;
    level?: number;
    children?: IProjectedGroup[];
}

export interface IGridProjection extends IViewProjection {
    type: BaseViewType.Grid;
    frozenFieldCount?: number;
}

export interface IKanbanProjection extends IViewProjection {
    type: BaseViewType.Kanban;
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

export interface ICalendarProjection extends IViewProjection {
    type: BaseViewType.Calendar;
    config: ICalendarViewConfig;
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

export interface IGanttTimeColumn {
    id: string;
    label: string;
    majorLabel?: string;
    start: number;
    end: number;
    nonWorking?: boolean;
}

export interface IGanttProjection extends IViewProjection {
    type: BaseViewType.Gantt;
    config: IGanttViewConfig;
    dateRangeAllDay?: boolean;
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
        columns: IGanttTimeColumn[];
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

export interface IGalleryProjection extends IViewProjection {
    type: BaseViewType.Gallery;
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

export interface IInvalidViewProjection {
    type: 'invalid';
    viewType: BaseViewType;
    reason:
        | 'missingField'
        | 'invalidGroupField'
        | 'invalidDateField'
        | 'invalidGanttStartField'
        | 'invalidGanttEndField';
    fieldId?: FieldId;
}

export type BaseViewProjection =
    | IGridProjection
    | IKanbanProjection
    | ICalendarProjection
    | IGanttProjection
    | IGalleryProjection
    | IInvalidViewProjection;

export interface IBaseViewport {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface IBaseRect extends IBaseViewport {}

export type BaseSelection =
    | IGridCellSelection
    | IGridGroupSelection
    | IGridRecordSelection
    | IGridFieldSelection
    | IKanbanCardSelection
    | ICalendarEventSelection
    | IGanttCellSelection
    | IGanttBarSelection
    | IGalleryCardSelection;

export interface IGridCellSelection {
    type: 'grid-cell';
    tableId: TableId;
    viewId: ViewId;
    recordId: RecordId;
    fieldId: FieldId;
}

export interface IGridGroupSelection {
    type: 'grid-group';
    tableId: TableId;
    viewId: ViewId;
    fieldId: FieldId;
    groupKey: string;
    groupPath: string;
    level: number;
    collapsed: boolean;
}

export interface IGridRecordSelection {
    type: 'grid-record';
    tableId: TableId;
    viewId: ViewId;
    recordId: RecordId;
}

export interface IGridFieldSelection {
    type: 'grid-field';
    tableId: TableId;
    viewId: ViewId;
    fieldId: FieldId;
}

export interface IKanbanCardSelection {
    type: 'kanban-card';
    tableId: TableId;
    viewId: ViewId;
    recordId: RecordId;
    groupKey?: string;
}

export interface ICalendarEventSelection {
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

export interface ICalendarEventResizeSelection {
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

export interface IGanttCellSelection {
    type: 'gantt-cell';
    tableId: TableId;
    viewId: ViewId;
    recordId: RecordId;
    fieldId: FieldId;
}

export interface IGanttBarSelection {
    type: 'gantt-bar';
    tableId: TableId;
    viewId: ViewId;
    recordId: RecordId;
}

export interface IGalleryCardSelection {
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
    | ICalendarEventResizeSelection
    | BaseSelection;

export interface IBaseInvalidation {
    tableId: TableId;
    viewId?: ViewId;
    recordId?: RecordId;
    fieldId?: FieldId;
    row?: number;
    column?: number;
    reason: 'cell' | 'field' | 'record' | 'view' | 'table' | 'unknown';
}
