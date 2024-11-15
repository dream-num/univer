/**
 * Copyright 2023-present DreamNum Inc.
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

import { installShims } from './common/shims';

installShims();

export { debounce, get, merge, mergeWith, set } from 'lodash-es';
export { textDiff } from './shared/text-diff';
export { dedupe, groupBy, makeArray, remove, rotate } from './common/array';
export { isBooleanString } from './common/boolean';
export {
    createInternalEditorID,
    DEFAULT_EMPTY_DOCUMENT_VALUE,
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    DOCS_ZEN_EDITOR_UNIT_ID_KEY,
    IS_ROW_STYLE_PRECEDE_COLUMN_STYLE,
    isInternalEditorID,
} from './common/const';
export * from './common/di';
export { shallowEqual } from './common/equal';
export { CustomCommandExecutionError } from './common/error';
export { throttle } from './common/function';
export type { ICellInterceptor, IComposeInterceptors, IInterceptor, InterceptorHandler } from './common/interceptor';
export { AsyncInterceptorManager, composeInterceptors, createAsyncInterceptorKey, createInterceptorKey, InterceptorEffectEnum, InterceptorManager } from './common/interceptor';
export type { Serializable } from './common/json';
export { MemoryCursor } from './common/memory-cursor';
export { mixinClass } from './common/mixin';
export { FBase } from './facade/f-base';
export { FUniver } from './facade/f-univer';
export { FHooks } from './facade/f-hooks';
export { isNumeric, isSafeNumeric } from './common/number';
export { Registry, RegistryAsMap } from './common/registry';
export { requestImmediateMacroTask } from './common/request-immediate-macro-task';
export { type ISequenceExecuteResult, sequence, sequenceAsync } from './common/sequence';
export { mergeSets } from './common/set';
export { UnitModel, type UnitType, UniverInstanceType } from './common/unit';
export * from './docs/data-model';
export { JSON1, JSONX } from './docs/data-model/json-x/json-x';
export type { JSONXActions, JSONXPath } from './docs/data-model/json-x/json-x';
export { replaceInDocumentBody } from './docs/data-model/replacement';
export { DEFAULT_DOCUMENT_SUB_COMPONENT_ID } from './docs/data-model/subdocument';
export { ActionIterator } from './docs/data-model/text-x/action-iterator';
export {
    type IDeleteAction,
    type IInsertAction,
    type IRetainAction,
    type TextXAction,
    TextXActionType,
} from './docs/data-model/text-x/action-types';
export { normalizeTextRuns } from './docs/data-model/text-x/apply-utils/common';
export { updateAttributeByDelete } from './docs/data-model/text-x/apply-utils/delete-apply';
export { updateAttributeByInsert } from './docs/data-model/text-x/apply-utils/insert-apply';
export { TextX } from './docs/data-model/text-x/text-x';
export type { TPriority } from './docs/data-model/text-x/text-x';
export { composeBody, getBodySlice, SliceBodyType } from './docs/data-model/text-x/utils';
export { getCustomDecorationSlice, getCustomRangeSlice, normalizeBody } from './docs/data-model/text-x/utils';
export { EventState, EventSubject, fromEventSubject, type IEventObserver } from './observer/observable';
export { AuthzIoLocalService } from './services/authz-io/authz-io-local.service';
export { IAuthzIoService } from './services/authz-io/type';
export {
    type CommandListener,
    CommandService,
    CommandType,
    type ICommand,
    type ICommandInfo,
    ICommandService,
    type IExecutionOptions,
    type IMultiCommand,
    type IMutation,
    type IMutationCommonParams,
    type IMutationInfo,
    type IOperation,
    type IOperationInfo,
    NilCommand,
    sequenceExecute,
    sequenceExecuteAsync,
} from './services/command/command.service';
export { IConfigService } from './services/config/config.service';
export { ConfigService } from './services/config/config.service';
export * from './services/context/context';
export { ContextService, IContextService } from './services/context/context.service';
export { ErrorService, type IError } from './services/error/error.service';
export { IUniverInstanceService } from './services/instance/instance.service';
export { UniverInstanceService } from './services/instance/instance.service';
export { LifecycleStages } from './services/lifecycle/lifecycle';
export { LifecycleService } from './services/lifecycle/lifecycle.service';
export { ILocalStorageService } from './services/local-storage/local-storage.service';
export { LocaleService } from './services/locale/locale.service';
export { DesktopLogService, ILogService, LogLevel } from './services/log/log.service';
export { PermissionService } from './services/permission/permission.service';
export {
    IPermissionService,
    PermissionStatus,
} from './services/permission/type';
export type { IPermissionParam } from './services/permission/type';

// #region sheet

export type { IPermissionPoint } from './services/permission/type';
export type { IPermissionTypes, RangePermissionPointConstructor, WorkbookPermissionPointConstructor, WorkSheetPermissionPointConstructor } from './services/permission/type';
export { Plugin } from './services/plugin/plugin';
export type { PluginCtor } from './services/plugin/plugin';
export { DependentOn, PluginService } from './services/plugin/plugin.service';
export { type DependencyOverride, mergeOverrideWithDependencies } from './services/plugin/plugin-override';
export { IResourceLoaderService } from './services/resource-loader/type';
export { ResourceManagerService } from './services/resource-manager/resource-manager.service';
export type { IResourceHook, IResources } from './services/resource-manager/type';
export { IResourceManagerService } from './services/resource-manager/type';
export { type IStyleSheet, ThemeService } from './services/theme/theme.service';

// #region sheet

export {
    type IUndoRedoCommandInfos,
    type IUndoRedoCommandInfosByInterceptor,
    type IUndoRedoItem,
    IUndoRedoService,
    type IUndoRedoStatus,
    LocalUndoRedoService,
    RedoCommand,
    RedoCommandId,
    UndoCommand,
    UndoCommandId,
} from './services/undoredo/undoredo.service';
export { createDefaultUser } from './services/user-manager/const';
export { type IUser, UserManagerService } from './services/user-manager/user-manager.service';
export * from './shared';
export { isBlackColor, isWhiteColor } from './shared/color/color-kit';
export { cellToRange } from './shared/common';
export { getIntersectRange } from './shared/range';
export { nameCharacterCheck } from './shared/name';
export { afterTime, bufferDebounceTime, fromCallback, takeAfter } from './shared/rxjs';
export { awaitTime } from './shared/timer';
export { Range } from './sheets/range';
export {
    DEFAULT_WORKSHEET_COLUMN_COUNT,
    DEFAULT_WORKSHEET_COLUMN_COUNT_KEY,
    DEFAULT_WORKSHEET_COLUMN_TITLE_HEIGHT,
    DEFAULT_WORKSHEET_COLUMN_TITLE_HEIGHT_KEY,
    DEFAULT_WORKSHEET_COLUMN_WIDTH,
    DEFAULT_WORKSHEET_COLUMN_WIDTH_KEY,
    DEFAULT_WORKSHEET_ROW_COUNT,
    DEFAULT_WORKSHEET_ROW_COUNT_KEY,
    DEFAULT_WORKSHEET_ROW_HEIGHT,
    DEFAULT_WORKSHEET_ROW_HEIGHT_KEY,
    DEFAULT_WORKSHEET_ROW_TITLE_WIDTH,
    DEFAULT_WORKSHEET_ROW_TITLE_WIDTH_KEY,
    mergeWorksheetSnapshotWithDefault,
} from './sheets/sheet-snapshot-utils';
export { Styles } from './sheets/styles';
export * from './sheets/typedef';
export { addLinkToDocumentModel, isRangesEqual, isUnitRangesEqual } from './sheets/util';
export { SheetViewModel } from './sheets/view-model';

// #endregion

export { getWorksheetUID, Workbook } from './sheets/workbook';
export { extractPureTextFromCell, getOriginCellValue, Worksheet } from './sheets/worksheet';

export { SlideDataModel } from './slides/slide-model';
export * from './types/const';
export * from './types/const';
export { skipParseTagNames } from './types/const/clipboard';
export * from './types/enum';
export * from './types/enum';
export { DataValidationErrorStyle } from './types/enum/data-validation-error-style';
export { DataValidationImeMode } from './types/enum/data-validation-ime-mode';
export { DataValidationOperator } from './types/enum/data-validation-operator';
export { DataValidationRenderMode } from './types/enum/data-validation-render-mode';
export { DataValidationStatus } from './types/enum/data-validation-status';
export { DataValidationType } from './types/enum/data-validation-type';
export * from './types/interfaces';
export * from './types/interfaces';
export type { ICellCustomRender, ICellRenderContext } from './types/interfaces/i-cell-custom-render';
export type { IDataValidationRule, IDataValidationRuleBase, IDataValidationRuleInfo, IDataValidationRuleOptions, ISheetDataValidationRule } from './types/interfaces/i-data-validation';
export { type IRTreeItem, RTree } from './shared/r-tree';

export { type IUniverConfig, Univer } from './univer';
export { isNodeEnv } from './shared/tools';
