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

import './Sheets/Action';
import './Docs/Action';

export * from './Basics';
export * from './Command';
export * from './Types/Const';
export * from './Docs/Domain';
export * from './Types/Enum';
export * from './Types/Interfaces';
export * from './Observer';
export * from './Plugin';
export * from './Server';
export * from './Shared';
export { IRowColIter, createRowColIter } from './Shared/RowColIter';
export { DisposableCollection, Disposable, toDisposable } from './Shared/Lifecycle';
export * from './Sheets';
export * from './Slides/Domain';

export { ICurrentUniverService } from './Service/Current.service';
export { LocaleService } from './Service/Locale.service';
export { ICommandService, ICommand, CommandType, IMutation } from './Service/Command/Command.service';
export { IUndoRedoService, LocalUndoRedoService, UndoCommand, RedoCommand } from './Service/UndoRedo/undoRedo.service';
