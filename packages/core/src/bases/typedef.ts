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

import type { ImageSourceType } from '../services/image-io/image-io.service';
import type { IResources } from '../services/resource-manager/type';
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

export interface IBaseAttachment {
    /**
     * Stable attachment identifier.
     *
     * Keep this value unique within one attachment cell. For an uploaded attachment, use the
     * identifier returned by the attachment service.
     */
    id: string;
    /** User-visible file name. Include the extension so clients can classify the file when `mimeType` is absent. */
    name: string;
    /** MIME type used to classify and preview the attachment, for example `image/webp` or `application/pdf`. */
    mimeType?: string;
    /** File size in bytes. This is descriptive metadata and does not affect source loading. */
    size?: number;
    /** Image width in pixels when known. This is descriptive metadata used to reserve preview space. */
    width?: number;
    /** Image height in pixels when known. This is descriptive metadata used to reserve preview space. */
    height?: number;
    /**
     * How clients should resolve `source`.
     *
     * Facade write APIs infer `BASE64` for data URLs and otherwise default to `URL`. Set this
     * explicitly to `UUID` for identifiers managed by an attachment service.
     */
    sourceType?: ImageSourceType;
    /**
     * Canonical attachment source: an uploaded file id, URL, or Base64 data.
     *
     * Facade write APIs require a non-empty source for every non-empty attachment entry.
     */
    source?: string;
    /**
     * Optional preview source when it differs from `source`.
     *
     * A data URL is treated as Base64; every other value is treated as a URL.
     */
    thumbnail?: string;
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
    Numbering = 'numbering',
    Phone = 'phone',
    Email = 'email',
    Progress = 'progress',
    Currency = 'currency',
    Rating = 'rating',
    RecordLink = 'recordLink',
    RecordId = 'recordId',
    CreatedBy = 'createdBy',
    UpdatedBy = 'updatedBy',
    CreatedAt = 'createdAt',
    UpdatedAt = 'updatedAt',
}

/** Semantic roles supported by Base RecordLink fields. */
export enum BaseRecordLinkRole {
    Parent = 'parent',
}

/**
 * Configuration for a RecordLink field.
 *
 * A RecordLink points to records in another table in the same Base. The cell
 * stores target record IDs, while the UI resolves those IDs to the configured
 * display field. Prefer the dedicated RecordLink Facade methods instead of
 * reading or writing the canonical cell string directly.
 */
export interface IRecordLinkFieldConfig extends Record<string, unknown> {
    /** ID of the target table. The table must belong to the same Base. */
    targetTableId: TableId;
    /** `false` allows one linked record; `true` allows an ordered list of linked records. */
    multiple: boolean;
    /**
     * Target-table field used as the visible label in cells, cards, and record details.
     * Defaults to the target table's primary field. The field must exist and must not
     * be a system field such as `record-id`.
     */
    displayFieldId?: FieldId;
    /**
     * Ordered target-table fields shown as secondary context in the record picker.
     * These fields help users distinguish records; they do not change the stored link
     * or add more labels to the cell. IDs must be unique, existing, non-system fields.
     */
    pickerFieldIds?: FieldId[];
    /** Optional table-level semantic role of this link. */
    relationRole?: BaseRecordLinkRole;
}

export enum BaseViewType {
    Grid = 'grid',
    Kanban = 'kanban',
    Calendar = 'calendar',
    Gantt = 'gantt',
    Gallery = 'gallery',
    Pivot = 'pivot',
}

export type FieldConfig = Record<string, unknown>;

export type BaseDateHourCycle = 'h12' | 'h24';

/** Where a Base conditional color is painted when its condition matches. */
export const BaseConditionalColorTarget = {
    /** Paint only the cell in the rule's field. */
    CELL: 'cell',
    /** Paint the complete record row. */
    ROW: 'row',
    /** Paint the rule's field column unconditionally; operator, operand, and date mode are ignored. */
    COLUMN: 'column',
} as const;

export type BaseConditionalColorTarget = typeof BaseConditionalColorTarget[keyof typeof BaseConditionalColorTarget];

/**
 * Operators supported by Base conditional coloring rules.
 *
 * Text, select, person, and similar fields support equality, containment, and
 * empty checks. Number, currency, progress, and rating fields support equality,
 * numeric comparison, and empty checks. Date-like fields support equality,
 * before/after, and empty checks. Checkbox fields support equality only.
 */
export const BaseConditionalColorOperator = {
    IS: 'is',
    IS_NOT: 'isNot',
    CONTAINS: 'contains',
    NOT_CONTAINS: 'notContains',
    IS_EMPTY: 'isEmpty',
    IS_NOT_EMPTY: 'isNotEmpty',
    GREATER_THAN: 'greaterThan',
    LESS_THAN: 'lessThan',
    BEFORE: 'before',
    AFTER: 'after',
} as const;

export type BaseConditionalColorOperator = typeof BaseConditionalColorOperator[keyof typeof BaseConditionalColorOperator];

/**
 * Relative or exact date windows supported by date conditional coloring rules.
 *
 * With `IS`, dates inside the selected window match. `IS_NOT` matches dates
 * outside it, `BEFORE` matches dates before its start, and `AFTER` matches
 * dates after its end. Relative windows do not use an operand; `EXACT` does.
 */
export const BaseConditionalDateMode = {
    EXACT: 'exact',
    TODAY: 'today',
    TOMORROW: 'tomorrow',
    YESTERDAY: 'yesterday',
    THIS_WEEK: 'thisWeek',
    LAST_WEEK: 'lastWeek',
    THIS_MONTH: 'thisMonth',
    LAST_MONTH: 'lastMonth',
    PAST_7_DAYS: 'past7',
    NEXT_7_DAYS: 'next7',
    PAST_30_DAYS: 'past30',
    NEXT_30_DAYS: 'next30',
} as const;

export type BaseConditionalDateMode = typeof BaseConditionalDateMode[keyof typeof BaseConditionalDateMode];

/**
 * A color condition stored by a Base view.
 *
 * Rules are evaluated in array order. Earlier matching rules are painted last
 * and therefore have higher visual priority than later matching rules.
 */
export interface IBaseViewColorCondition {
    /** Stable id unique within the view. */
    id: string;
    /** Valid CSS color rendered for a match, for example `#fde9e9` or `rgba(255, 0, 0, 0.2)`. */
    color: string;
    /** Paint target. Gantt color conditions may omit it for legacy snapshots. */
    target?: BaseConditionalColorTarget;
    /** Field whose value is evaluated for cell/row targets, or whose column is painted for a column target. */
    fieldId: FieldId;
    /** Comparison performed against the field value. Ignored for a column target. */
    operator: BaseConditionalColorOperator;
    /**
     * Comparison value in the field's normal value shape: number for numeric
     * fields, boolean for checkbox fields, text/option ids for text and select
     * fields, or a date-compatible value for an exact date comparison. Ignored
     * by empty checks, relative date modes, and column targets.
     */
    operand?: unknown;
    /**
     * Exact or relative date window for Date, CreatedAt, and UpdatedAt fields.
     * Defaults to `EXACT` when omitted. Ignored for a column target.
     */
    dateMode?: BaseConditionalDateMode;
}

/** A complete Base conditional coloring rule used by Grid and other Base views. */
export interface IBaseConditionalColorRule extends IBaseViewColorCondition {
    /** Paint target for the matching rule. */
    target: BaseConditionalColorTarget;
}

/** Persisted conditional coloring configuration for one Base view. */
export interface IBaseConditionalColoringConfig {
    /** Rules in descending visual-priority order. */
    rules: IBaseConditionalColorRule[];
}

/** Configuration shared by every Base view type. */
export interface IBaseViewCommonConfig {
    /** Conditional coloring rules, or `null` when the feature is cleared. */
    conditionalColoring?: IBaseConditionalColoringConfig | null;
}

/**
 * Display options for Date, CreatedAt, and UpdatedAt fields.
 */
export interface IBaseDateFieldConfig extends FieldConfig {
    /**
     * Date-only display pattern, such as `yyyy/mm/dd`.
     */
    pattern?: string;
    /**
     * Whether to append a time to the formatted date.
     */
    includeTime?: boolean;
    /**
     * Explicit 12-hour or 24-hour time format.
     */
    hourCycle?: BaseDateHourCycle;
}

export type ViewSpecificConfig =
    | IGridViewConfig
    | IKanbanViewConfig
    | ICalendarViewConfig
    | IGanttViewConfig
    | IGalleryViewConfig
    | (IBaseViewCommonConfig & Record<string, unknown>);

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
    resources?: IResources;
}

export interface ITableSnapshot {
    id: TableId;
    /**
     * Human-readable display name, subject to Excel worksheet name rules because
     * each Base table is exported as a worksheet. Names must be unique within the
     * Base, ignoring case. Do not use this value as a structured-reference identifier.
     */
    name: string;
    /**
     * Persisted stable identifier used by formulas and exported structured references.
     *
     * Historical snapshots may omit this field. Use `getBaseFormulaTableName()` when a
     * resolved formula identifier is required.
     */
    formulaName?: string;
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

export interface IGridViewConfig extends IBaseViewCommonConfig {
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

export interface IKanbanViewConfig extends IBaseViewCommonConfig {
    groupFieldId: FieldId;
    coverFieldId?: FieldId | null;
    cardLayout?: KanbanCardLayoutMode;
    showFieldNames?: boolean;
    fieldSettings?: Record<FieldId, IKanbanFieldCardSetting>;
    columnSettings?: Record<string, IKanbanColumnSetting>;
    card?: ICardLayoutConfig;
}

export interface ICalendarViewConfig extends IBaseViewCommonConfig {
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

export interface IGanttViewConfig extends IBaseViewCommonConfig {
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

export interface IGalleryViewConfig extends IBaseViewCommonConfig {
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

/** Why a stored Parent link cannot participate in the effective hierarchy. */
export enum BaseHierarchyInvalidReason {
    MissingParent = 'missingParent',
    SelfParent = 'selfParent',
    Cycle = 'cycle',
    MaxDepth = 'maxDepth',
}

export interface IBaseHierarchyNodeProjection {
    recordId: RecordId;
    parentRecordId: RecordId | null;
    depth: number;
    directChildCount: number;
    subtreeHeight: number;
    subtreeEndIndex: number;
    invalidReason?: BaseHierarchyInvalidReason;
}

export interface IBaseHierarchyProjection {
    fieldId: FieldId;
    rootRecordIds: RecordId[];
    orderedRecordIds: RecordId[];
    nodes: Record<RecordId, IBaseHierarchyNodeProjection>;
}

export interface IGridProjection extends IViewProjection {
    type: BaseViewType.Grid;
    frozenFieldCount?: number;
    hierarchy?: IBaseHierarchyProjection;
}

export interface IKanbanProjection extends IViewProjection {
    type: BaseViewType.Kanban;
    groupFieldId: FieldId;
    titleFieldId?: FieldId;
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
    titleFieldId?: FieldId;
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

/** Marker projection for view types rendered by a registered DOM view renderer. */
export interface IBaseCustomViewProjection {
    type: 'custom';
    viewType: BaseViewType;
}

export type BaseViewProjection =
    | IGridProjection
    | IKanbanProjection
    | ICalendarProjection
    | IGanttProjection
    | IGalleryProjection
    | IBaseCustomViewProjection
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
    mode?: 'cell' | 'row' | 'column';
    anchorRecordId?: RecordId;
    focusRecordId?: RecordId;
    anchorFieldId?: FieldId;
    focusFieldId?: FieldId;
    selectedRecordIds?: RecordId[];
    showBorder?: boolean;
    virtual?: boolean;
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
        type: 'grid-text-preview';
        tableId: TableId;
        viewId: ViewId;
        recordId: RecordId;
        fieldId: FieldId;
        virtual?: boolean;
        x: number;
        y: number;
        width: number;
        height: number;
        maxScroll: number;
    }
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
        type: 'grid-hierarchy-toggle' | 'grid-hierarchy-add-child';
        tableId: TableId;
        viewId: ViewId;
        recordId: RecordId;
    }
    | {
        type: 'grid-cell-checkbox';
        tableId: TableId;
        viewId: ViewId;
        recordId: RecordId;
        fieldId: FieldId;
    }
    | {
        type: 'grid-rating-icon';
        tableId: TableId;
        viewId: ViewId;
        recordId: RecordId;
        fieldId: FieldId;
        value: number;
    }
    | {
        type: 'grid-row-header' | 'grid-row-checkbox';
        tableId: TableId;
        viewId: ViewId;
        recordId: RecordId;
    }
    | {
        type: 'grid-row-header-select-all';
        tableId: TableId;
        viewId: ViewId;
    }
    | {
        type: 'grid-row-drag-handle';
        tableId: TableId;
        viewId: ViewId;
        recordId: RecordId;
        disabled: boolean;
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
