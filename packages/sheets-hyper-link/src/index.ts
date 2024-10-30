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

export { SheetHyperLinkType } from './types/enums/hyper-link-type';
export { UniverSheetsHyperLinkPlugin } from './plugin';
export type { ICellHyperLink, ICellLinkContent } from './types/interfaces/i-hyper-link';
export { HyperLinkEditSourceType } from './types/enums/edit-source';
export { type ISheetHyperLinkInfo, type ISheetUrlParams, SheetsHyperLinkParserService } from './services/parser.service';
export { ERROR_RANGE } from './types/const';

// #region - all commands

export { AddHyperLinkCommand, AddRichHyperLinkCommand, type IAddHyperLinkCommandParams, type IAddRichHyperLinkCommandParams } from './commands/commands/add-hyper-link.command';
export { CancelHyperLinkCommand, CancelRichHyperLinkCommand, type ICancelHyperLinkCommandParams, type ICancelRichHyperLinkCommandParams } from './commands/commands/remove-hyper-link.command';
export { type IUpdateHyperLinkCommandParams, type IUpdateRichHyperLinkCommandParams, UpdateHyperLinkCommand, UpdateRichHyperLinkCommand } from './commands/commands/update-hyper-link.command';
// #endregion
