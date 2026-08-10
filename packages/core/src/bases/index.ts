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

export { BaseDataModel } from './base-data-model';
export {
    createDefaultBaseTableSnapshot,
    getEmptySnapshot as getBasesEmptySnapshot,
    type ICreateDefaultBaseTableSnapshotOptions,
} from './empty-snapshot';
export {
    allocateBaseFormulaTableName,
    createBaseFormulaTableNameMap,
    createBaseFormulaTableReferenceNormalizer,
    getBaseFormulaTableName,
    migrateBaseFormulaTableNames,
    normalizeBaseFormulaTableName,
    normalizeBaseFormulaTableReferences,
} from './formula-table-name';
export {
    assertBaseTableRecordIdentity,
    BASE_RECORD_ID_FIELD_ID,
    BASE_RECORD_ID_FIELD_NAME,
    createBaseRecordIdField,
    isBaseRecordIdFieldName,
    isValidBaseRecordId,
} from './record-identity';
export {
    BaseConditionalColorOperator,
    BaseConditionalColorTarget,
    BaseConditionalDateMode,
    BaseFieldType,
    BaseFilterConjunction,
    BaseFilterOperator,
    BaseHierarchyInvalidReason,
    BaseRecordLinkRole,
    BaseSortDirection,
    BaseViewType,
} from './typedef';
export type {
    BaseCellMatrix,
    BaseCellPrimitiveValue,
    CellValue as BaseCellValue,
    BaseCellValueType,
    BaseDateHourCycle,
    BaseHitTestResult,
    BaseId,
    PrimitiveCellValue as BasePrimitiveCellValue,
    BaseSelection,
    BaseSnapshot,
    BaseViewProjection,
    FieldConfig,
    FieldId,
    FieldSnapshot,
    IBaseAttachment,
    IBaseCellData,
    IBaseConditionalColoringConfig,
    IBaseConditionalColorRule,
    IBaseDateFieldConfig,
    IBaseHierarchyNodeProjection,
    IBaseHierarchyProjection,
    IBaseInvalidation,
    IBaseRect,
    IBaseResources,
    IBaseSnapshot,
    IBaseViewColorCondition,
    IBaseViewCommonConfig,
    IBaseViewport,
    ICalendarEventResizeSelection,
    ICalendarEventSelection,
    ICalendarProjection,
    ICalendarViewConfig,
    ICardLayoutConfig,
    IFieldCapabilities,
    IFieldSnapshot,
    IFilterCondition,
    IFilterConfig,
    IGalleryCardSelection,
    IGalleryProjection,
    IGalleryViewConfig,
    IGanttBarSelection,
    IGanttCellSelection,
    IGanttProjection,
    IGanttTimeColumn,
    IGanttViewConfig,
    IGridCellSelection,
    IGridFieldSelection,
    IGridGroupSelection,
    IGridProjection,
    IGridRecordSelection,
    IGridViewConfig,
    IGroupConfig,
    IInvalidViewProjection,
    IKanbanCardSelection,
    IKanbanColumnSetting,
    IKanbanFieldCardSetting,
    IKanbanProjection,
    IKanbanViewConfig,
    IProjectedField,
    IProjectedGroup,
    IProjectedRow,
    IRecordLinkFieldConfig,
    IRecordSnapshot,
    ISortConfig,
    ITableSnapshot,
    IValidationResult,
    IViewFieldSetting,
    IViewProjection,
    IViewSnapshot,
    KanbanCardLayoutMode,
    RecordId,
    RecordSnapshot,
    TableId,
    TableSnapshot,
    ViewId,
    ViewSnapshot,
    ViewSpecificConfig,
} from './typedef';
