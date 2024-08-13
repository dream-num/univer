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

export type { Dependency } from '@univerjs/core';
export { Inject, Injector } from '@univerjs/core';
export { ICommandService, Plugin, UniverInstanceType } from '@univerjs/core';
export { UniverThreadCommentUIPlugin } from '@univerjs/thread-comment-ui';
export { SheetsThreadCommentPopupService } from './services/sheets-thread-comment-popup.service';
export { UniverSheetsThreadCommentPlugin } from './plugin';
export { SHEETS_THREAD_COMMENT } from './types/const';
export { IThreadCommentMentionDataService } from '@univerjs/thread-comment-ui';
export { IThreadCommentDataSourceService } from '@univerjs/thread-comment';
export { SheetsThreadCommentModel } from '@univerjs/sheets-thread-comment-base';

// #region - all commands

export { ShowAddSheetCommentModalOperation } from './commands/operations/comment.operation';
export {
    AddCommentCommand,
    DeleteCommentCommand,
    UpdateCommentCommand,
    ResolveCommentCommand,
    DeleteCommentTreeCommand,
} from '@univerjs/thread-comment';
export type {
    IAddCommentCommandParams,
    IDeleteCommentCommandParams,
    IResolveCommentCommandParams,
    IUpdateCommentCommandParams,
    IDeleteCommentTreeCommandParams,
} from '@univerjs/thread-comment';

// #endregion
