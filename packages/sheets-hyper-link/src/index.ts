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

export { HyperLinkModel } from './models/hyper-link.model';
export { SheetHyperLinkType } from './types/enums/hyper-link-type';
export { UniverSheetsHyperLinkPlugin } from './plugin';
export type { ICellHyperLink, ICellLinkContent } from './types/interfaces/i-hyper-link';

export { ERROR_RANGE } from './types/const';

// #region - all commands

export { AddHyperLinkMutation, type IAddHyperLinkMutationParams } from './commands/mutations/add-hyper-link.mutation';
export { RemoveHyperLinkMutation, type IRemoveHyperLinkMutationParams } from './commands/mutations/remove-hyper-link.mutation';
export { UpdateHyperLinkMutation, UpdateHyperLinkRefMutation, type IUpdateHyperLinkMutationParams, type IUpdateHyperLinkRefMutationParams } from './commands/mutations/update-hyper-link.mutation';

// #endregion

