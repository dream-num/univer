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

import './global.css';

export { ShowAddSheetCommentModalOperation } from './commands/operations/comment.operation';
export { UniverSheetsThreadCommentUIPlugin } from './plugin';
export { SheetsThreadCommentPopupService } from './services/sheets-thread-comment-popup.service';
export { SHEETS_THREAD_COMMENT } from './types/const';
export { IThreadCommentDataSourceService } from '@univerjs/thread-comment';
export { UniverThreadCommentUIPlugin } from '@univerjs/thread-comment-ui';

// #region - all commands
export {
    AddCommentCommand,
    DeleteCommentCommand,
    DeleteCommentTreeCommand,
    ResolveCommentCommand,
    UpdateCommentCommand,
} from '@univerjs/thread-comment';
export type {
    IAddCommentCommandParams,
    IDeleteCommentCommandParams,
    IDeleteCommentTreeCommandParams,
    IResolveCommentCommandParams,
    IUpdateCommentCommandParams,
} from '@univerjs/thread-comment';

// #endregion
