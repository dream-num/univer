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

import { installShims } from './common/shims';

installShims();

export * from './bases';
export { dedupe, dedupeBy, groupBy, makeArray, remove, rotate } from './common/array';
export * from './common/async';
export { isBooleanString } from './common/boolean';
export * from './common/const';
export * from './common/di';
export { shallowEqual } from './common/equal';
export { CanceledError, CustomCommandExecutionError } from './common/error';
export { noop, throttle } from './common/function';
export type {
    IAsyncInterceptor,
    ICellInterceptor,
    IComposeInterceptors,
    IInterceptor,
    InterceptorHandler,
} from './common/interceptor';
export {
    AsyncInterceptorManager,
    composeInterceptors,
    createAsyncInterceptorKey,
    createInterceptorKey,
    InterceptorEffectEnum,
    InterceptorManager,
} from './common/interceptor';
export { invertColorByHSL } from './common/invert-color/invert-hsl';
// invert color utils
export { invertColorByMatrix } from './common/invert-color/invert-rgb';
export type { RGBColorType } from './common/invert-color/utils';
export type { Serializable } from './common/json';
export * from './common/lodash';
export { MemoryCursor } from './common/memory-cursor';
export { mixinClass } from './common/mixin';
export { isNumeric, isSafeNumeric, willLoseNumericPrecision } from './common/number';
export { regexp } from './common/regexp';
export { Registry, RegistryAsMap } from './common/registry';
export { requestImmediateMacroTask } from './common/request-immediate-macro-task';
export { sequence, sequenceAsync } from './common/sequence';
export type { ISequenceExecuteResult } from './common/sequence';
export { mergeSets } from './common/set';
export { UnitModel, UniverInstanceType } from './common/unit';
export { isSafeUrl, normalizeUrl, resolveWithBasePath } from './common/url';
export * from './docs';
export { EventState, EventSubject, fromEventSubject } from './observer/observable';
export type { IEventObserver } from './observer/observable';
export { AuthzIoLocalService } from './services/authz-io/authz-io-local.service';
export { IAuthzIoService } from './services/authz-io/type';
export {
    COMMAND_LOG_EXECUTION_CONFIG_KEY,
    CommandService,
    CommandType,
    ICommandService,
    NilCommand,
    sequenceExecute,
    sequenceExecuteAsync,
} from './services/command/command.service';
export type {
    CommandListener,
    ICommand,
    ICommandInfo,
    IExecutionOptions,
    IMultiCommand,
    IMutation,
    IMutationCommonParams,
    IMutationInfo,
    IOperation,
    IOperationInfo,
} from './services/command/command.service';
export { IConfigService } from './services/config/config.service';
export { ConfigService } from './services/config/config.service';
export { IConfirmService, TestConfirmService } from './services/confirm/confirm.service';
export * from './services/context/context';
export { ContextService, IContextService } from './services/context/context.service';
export { ErrorService } from './services/error/error.service';
export type { IError } from './services/error/error.service';
export { IImageIoService, ImageSourceType, ImageUploadStatusType } from './services/image-io/image-io.service';
export type { IImageIoServiceParam } from './services/image-io/image-io.service';
export { IURLImageService } from './services/image-io/url-image.service';
export { IUniverInstanceService, UniverInstanceService } from './services/instance/instance.service';
export type { ICreateUnitOptions } from './services/instance/instance.service';
export { LifecycleStages } from './services/lifecycle/lifecycle';
export { LifecycleService, LifecycleUnreachableError } from './services/lifecycle/lifecycle.service';
export { ILocalStorageService } from './services/local-storage/local-storage.service';
export { LocaleService } from './services/locale/locale.service';
export { DesktopLogService, ILogService, LogLevel } from './services/log/log.service';
export { MentionIOLocalService } from './services/mention-io/mention-io-local.service';
export { IMentionIOService } from './services/mention-io/type';
export type { IListMentionParam, IListMentionResponse, ITypeMentionList } from './services/mention-io/type';
export { PermissionService } from './services/permission/permission.service';
export { IPermissionService, PermissionStatus } from './services/permission/type';
export type { IPermissionParam } from './services/permission/type';
export type { IPermissionPoint } from './services/permission/type';
export type {
    IPermissionTypes,
    RangePermissionPointConstructor,
    WorkbookPermissionPointConstructor,
    WorkSheetPermissionPointConstructor,
} from './services/permission/type';
export { mergeOverrideWithDependencies } from './services/plugin/plugin-override';
export type { DependencyOverride } from './services/plugin/plugin-override';
export type { PluginCtor } from './services/plugin/plugin.service';
export { DependentOn, Plugin, PluginService } from './services/plugin/plugin.service';
export { IResourceLoaderService } from './services/resource-loader/type';
export { ResourceManagerService } from './services/resource-manager/resource-manager.service';
export type { IResourceHook, IResources } from './services/resource-manager/type';
export { IResourceManagerService } from './services/resource-manager/type';
export { ThemeService } from './services/theme/theme.service';
export {
    IUndoRedoService,
    LocalUndoRedoService,
    RedoCommand,
    RedoCommandId,
    UndoCommand,
    UndoCommandId,
} from './services/undoredo/undoredo.service';
export type {
    IUndoRedoCommandInfos,
    IUndoRedoCommandInfosByInterceptor,
    IUndoRedoItem,
    IUndoRedoStatus,
} from './services/undoredo/undoredo.service';
export { createDefaultUser } from './services/user-manager/const';
export { UserManagerService } from './services/user-manager/user-manager.service';
export type { IUser } from './services/user-manager/user-manager.service';
export * from './shared';
export { ImageCacheMap } from './shared/cache/image-cache';
export { isBlackColor, isWhiteColor } from './shared/color/color-kit';
export { cellToRange } from './shared/common';
export { customNameCharacterCheck, nameCharacterCheck } from './shared/name';
export { RBush, RTree } from './shared/r-tree';
export type { BBox, IRTreeItem } from './shared/r-tree';
export { generateRandomId } from './shared/random-id';
export { getIntersectRange } from './shared/range';
export {
    afterTime,
    bufferDebounceTime,
    convertObservableToBehaviorSubject,
    fromCallback,
    takeAfter,
} from './shared/rxjs';
export { awaitTime, delayAnimationFrame } from './shared/timer';
export { isNodeEnv } from './shared/tools';
export * from './sheets';
export { Skeleton } from './skeleton';
export * from './types/const';
export { skipParseTagNames } from './types/const/clipboard';
export * from './types/enum';
export { DataValidationErrorStyle } from './types/enum/data-validation-error-style';
export { DataValidationImeMode } from './types/enum/data-validation-ime-mode';
export { DataValidationOperator } from './types/enum/data-validation-operator';
export { DataValidationRenderMode } from './types/enum/data-validation-render-mode';
export { DataValidationStatus } from './types/enum/data-validation-status';
export { DataValidationType } from './types/enum/data-validation-type';
export * from './types/interfaces';
export type { ICellCustomRender, ICellRenderContext } from './types/interfaces/i-cell-custom-render';
export type {
    IDataValidationRule,
    IDataValidationRuleBase,
    IDataValidationRuleInfo,
    IDataValidationRuleOptions,
    ISheetDataValidationRule,
} from './types/interfaces/i-data-validation';
export { Univer } from './univer';
export type { IUniverConfig } from './univer';
