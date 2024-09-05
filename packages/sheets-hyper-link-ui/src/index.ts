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

export { SheetsHyperLinkSidePanelService, type ICustomHyperLinkView } from './services/side-panel.service';
export { SheetsHyperLinkPopupService } from './services/popup.service';
export { SheetsHyperLinkResolverService } from './services/resolver.service';
export { SheetsHyperLinkCopyPasteController } from './controllers/copy-paste.controller';
export { UniverSheetsHyperLinkUIPlugin } from './plugin';
export { InsertLinkShortcut } from './controllers/menu';

// #region - all commands
export {
    OpenHyperLinkSidebarOperation,
    InsertHyperLinkOperation,
    CloseHyperLinkSidebarOperation,
    type IOpenHyperLinkSidebarOperationParams,
} from './commands/operations/sidebar.operations';

export { AddHyperLinkCommand, type IAddHyperLinkCommandParams } from './commands/commands/add-hyper-link.command';
export { RemoveHyperLinkCommand, CancelHyperLinkCommand, type IRemoveHyperLinkCommandParams } from './commands/commands/remove-hyper-link.command';
export { UpdateHyperLinkCommand, type IUpdateHyperLinkCommandParams } from './commands/commands/update-hyper-link.command';
// #endregion
