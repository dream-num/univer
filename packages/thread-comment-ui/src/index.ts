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

export { UniverThreadCommentUIPlugin } from './plugin';
export { type ActiveCommentInfo, ThreadCommentPanelService } from './services/thread-comment-panel.service';
export { ThreadCommentPanel } from './views/thread-comment-panel';
export type { IThreadCommentPanelProps } from './views/thread-comment-panel';
export { ThreadCommentTree } from './views/thread-comment-tree';
export type { IThreadCommentTreeProps } from './views/thread-comment-tree';
export { THREAD_COMMENT_PANEL } from './types/const';

// #region - all commands

export {
    type ISetActiveCommentOperationParams,
    SetActiveCommentOperation,
    ToggleSheetCommentPanelOperation,
} from './commands/operations/comment.operations';

// #endregion
