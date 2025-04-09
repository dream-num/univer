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

export type { IUniverSheetsHyperLinkUIConfig } from './controllers/config.schema';
export { SheetsHyperLinkCopyPasteController } from './controllers/copy-paste.controller';
export { InsertLinkShortcut } from './controllers/menu';
export { UniverSheetsHyperLinkUIPlugin } from './plugin';

export { SheetsHyperLinkPopupService } from './services/popup.service';

export { SheetsHyperLinkResolverService } from './services/resolver.service';
export { type ICustomHyperLinkView, SheetsHyperLinkSidePanelService } from './services/side-panel.service';

// #region - all commands

export {
    CloseHyperLinkPopupOperation,
    InsertHyperLinkOperation,
    type IOpenHyperLinkEditPanelOperationParams,
    OpenHyperLinkEditPanelOperation,
} from './commands/operations/popup.operations';

// #endregion
