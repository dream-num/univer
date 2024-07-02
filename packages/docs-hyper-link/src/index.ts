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

export { DOC_HYPER_LINK_PLUGIN } from './types/const';
export { DocHyperLinkModel } from './models/hyper-link.model';

// #region - all commands

export { AddDocHyperLinkMutation, type IAddDocHyperLinkMutationParams } from './commands/mutations/add-link.mutation';
export { UpdateDocHyperLinkMutation, type IUpdateDocHyperLinkMutationParams } from './commands/mutations/update-link.mutation';
export { DeleteDocHyperLinkMutation, type IDeleteDocHyperLinkMutationParams } from './commands/mutations/delete-link.mutation';

// #endregion
