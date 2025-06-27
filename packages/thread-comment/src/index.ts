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

export {
    AddCommentCommand,
    DeleteCommentCommand,
    DeleteCommentTreeCommand,
    ResolveCommentCommand,
    UpdateCommentCommand,
} from './commands/commands/comment.command';
export type {
    IAddCommentCommandParams,
    IDeleteCommentCommandParams,
    IDeleteCommentTreeCommandParams,
    IResolveCommentCommandParams,
    IUpdateCommentCommandParams,
} from './commands/commands/comment.command';
export {
    AddCommentMutation,
    DeleteCommentMutation,
    ResolveCommentMutation,
    UpdateCommentMutation,
    UpdateCommentRefMutation,
} from './commands/mutations/comment.mutation';
export type {
    IAddCommentMutationParams,
    IDeleteCommentMutationParams,
    IResolveCommentMutationParams,
    IUpdateCommentMutationParams,
    IUpdateCommentPayload,
    IUpdateCommentRefMutationParams,
} from './commands/mutations/comment.mutation';
export { getDT } from './common/utils';
export type { IUniverThreadCommentConfig } from './controllers/config.schema';
export { SHEET_UNIVER_THREAD_COMMENT_PLUGIN, ThreadCommentResourceController } from './controllers/tc-resource.controller';
export { type CommentUpdate, type IThreadInfo, ThreadCommentModel } from './models/thread-comment.model';
export { UniverThreadCommentPlugin } from './plugin';
export {
    type IThreadCommentDataSource,
    IThreadCommentDataSourceService,
    ThreadCommentDataSourceService,
    type ThreadCommentJSON,
} from './services/tc-datasource.service';
export { TC_PLUGIN_NAME } from './types/const';
export type { IBaseComment, IThreadComment, IThreadCommentMention } from './types/interfaces/i-thread-comment';
