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

export * from './basics';
export { dedupe, remove, rotate, groupBy } from './common/array';
export {
    DEFAULT_EMPTY_DOCUMENT_VALUE,
    DOCS_FORMULA_BAR_EDITOR_UNIT_ID_KEY,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
} from './common/const';
export { throttle } from './common/function';
export { MemoryCursor } from './common/memory-cursor';
export { requestImmediateMacroTask } from './common/request-immediate-macro-task';
export { type ISequenceExecuteResult, sequence, sequenceAsync } from './common/sequence';
export * from './docs/data-model';
export {
    TextXActionType,
    type TextXAction,
    type IDeleteAction,
    type IInsertAction,
    type IRetainAction,
} from './docs/data-model/action-types';
export { ActionIterator } from './docs/data-model/text-x/action-iterator';
export { getBodySlice, composeBody } from './docs/data-model/text-x/utils';
export { TextX } from './docs/data-model/text-x/text-x';
export { replaceInDocumentBody } from './docs/data-model/replacement';
export * from './observer';
export { Plugin, PluginType } from './plugin/plugin';
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
export * from './services/context/context';
export { ContextService, IContextService } from './services/context/context.service';
export { ErrorService, type IError } from './services/error/error.service';
export type { IOffset, IScale, ISize, ITransformState } from './services/floating-object/floating-object-interfaces';
export {
    DEFAULT_DOCUMENT_SUB_COMPONENT_ID,
    FloatingObjectManagerService,
    type IFloatingObjectManagerParam,
    type IFloatingObjectManagerSearchItemParam,
    IFloatingObjectManagerService,
} from './services/floating-object/floating-object-manager.service';
export { IUniverInstanceService, UniverInstanceType } from './services/instance/instance.service';
export { LifecycleStages, OnLifecycle, runOnLifecycle } from './services/lifecycle/lifecycle';
export { LifecycleService } from './services/lifecycle/lifecycle.service';
export { ILocalStorageService } from './services/local-storage/local-storage.service';
export { LocaleService } from './services/locale/locale.service';
export { DesktopLogService, ILogService, LogLevel } from './services/log/log.service';
export {
    IPermissionService,
    PermissionService,
    UniverEditablePermission,
    UniverEditablePermissionPoint,
    UniverPermissionService,
} from './services/permission';
export { ResourceManagerService } from './services/resource-manager/resource-manager.service';
export type { IResourceHook } from './services/resource-manager/type';
export { IResourceManagerService, ISnapshotPersistenceService } from './services/resource-manager/type';
export { type IStyleSheet, ThemeService } from './services/theme/theme.service';
export {
    type IUndoRedoCommandInfos,
    type IUndoRedoItem,
    IUndoRedoService,
    type IUndoRedoStatus,
    LocalUndoRedoService,
    RedoCommand,
    UndoCommand,
    RedoCommandId,
    UndoCommandId,
} from './services/undoredo/undoredo.service';
export * from './shared';
export { fromCallback } from './shared/rxjs';

// #region sheet
export type { IComposeInterceptors, IInterceptor, InterceptorHandler } from './common/interceptor';
export { composeInterceptors, createInterceptorKey, InterceptorManager } from './common/interceptor';
export { normalizeTextRuns } from './docs/data-model/apply-utils/common';
export type { PluginCtor } from './plugin/plugin';
export { Range } from './sheets/range';
export { Styles } from './sheets/styles';
export {
    DEFAULT_WORKSHEET_COLUMN_COUNT,
    DEFAULT_WORKSHEET_COLUMN_COUNT_KEY,
    DEFAULT_WORKSHEET_COLUMN_TITLE_HEIGHT_KEY,
    DEFAULT_WORKSHEET_COLUMN_WIDTH_KEY,
    DEFAULT_WORKSHEET_ROW_COUNT_KEY,
    DEFAULT_WORKSHEET_ROW_HEIGHT_KEY,
    DEFAULT_WORKSHEET_ROW_TITLE_WIDTH_KEY,
    DEFAULT_WORKSHEET_COLUMN_TITLE_HEIGHT,
    DEFAULT_WORKSHEET_COLUMN_WIDTH,
    DEFAULT_WORKSHEET_ROW_COUNT,
    DEFAULT_WORKSHEET_ROW_HEIGHT,
    DEFAULT_WORKSHEET_ROW_TITLE_WIDTH,
    mergeWorksheetSnapshotWithDefault,
} from './sheets/sheet-snapshot-utils';
export { SheetViewModel } from './sheets/view-model';
export { getWorksheetUID, Workbook } from './sheets/workbook';
export { Worksheet, extractPureTextFromCell } from './sheets/worksheet';
export * from './slides/domain';
export * from './types/const';
export * from './types/enum';
export * from './types/interfaces';
export { UniverInstanceService } from './services/instance/instance.service';
export { LifecycleInitializerService } from './services/lifecycle/lifecycle.service';
export { ConfigService } from './services/config/config.service';
export { ISnapshotServerService } from './services/snapshot/snapshot-server.service';
export {
    transformSnapshotToWorkbookData,
    transformWorkbookDataToSnapshot,
    transformDocumentDataToSnapshot,
    transformSnapshotToDocumentData,
    generateTemporarySnap,
} from './services/snapshot/snapshot-transform';
export { textEncoder, textDecoder } from './services/snapshot/snapshot-utils';
export { type ILogContext } from './services/log/context';
export { b64DecodeUnicode, b64EncodeUnicode } from './shared/coder';
export { ClientSnapshotServerService } from './services/snapshot/snapshot-server.service';
export { getSheetBlocksFromSnapshot } from './services/snapshot/snapshot-transform';

export { isBlackColor, isWhiteColor } from './shared/color/color-kit';
export { cellToRange } from './shared/common';

installShims();
