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

export { SetActiveCommentOperation } from './commands/operations/comment.operations';
export type { ISetActiveCommentOperationParams } from './commands/operations/comment.operations';
export type { IUniverThreadCommentUIConfig } from './config/config';
export { UniverThreadCommentUIPlugin } from './plugin';
export { ThreadCommentPanelService } from './services/thread-comment-panel.service';
export type { ActiveCommentInfo } from './services/thread-comment-panel.service';
export { ThreadCommentPanel } from './views/ThreadCommentPanel';
export type { IThreadCommentPanelProps } from './views/ThreadCommentPanel';
export { ThreadCommentTree, ThreadCommentTreeLocation } from './views/ThreadCommentTree';
export type { IThreadCommentTreeProps } from './views/ThreadCommentTree';
