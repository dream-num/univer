// Copyright (c) DreamNum Company. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.

/**
 * UniverSheet core package
 *
 * @remarks
 * The core defines basic data structures {@link IData} , APIs for modifying data {@link Domain},
 * easily extensible plugins {@link Plugin} and event listeners {@link Observer}
 *
 * @packageDocumentation
 *
 */

export * from './Basics';
export * from './Docs/Domain';
export * from './Observer';
export * from './Plugin';
export * from './Server';
export { CommandType, ICommand, ICommandInfo, ICommandService, IMutation, IOperation } from './services/command/command.service';
export { ICurrentUniverService } from './services/current.service';
export { LocaleService } from './services/locale.service';
export { DesktopLogService, ILogService } from './services/log/log.service';
export { DesktopPermissionService, IPermissionService } from './services/permission/permission.service';
export { IUndoRedoService, LocalUndoRedoService, RedoCommand, UndoCommand } from './services/undoredo/undoredo.service';
export * from './Shared';
export { Disposable, DisposableCollection, toDisposable } from './Shared/Lifecycle';
export { createRowColIter, IRowColIter } from './Shared/RowColIter';
export * from './Sheets';
export * from './Slides/Domain';
export * from './Types/Const';
export * from './Types/Enum';
export * from './Types/Interfaces';
