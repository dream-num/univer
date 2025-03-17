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

export { UniverDocsQuickInsertUIPlugin } from './plugin';

export type {
    DocPopupMenu,
    IDocPopup,
    IDocPopupGroupItem,
    IDocPopupMenuItem,
} from './services/doc-quick-insert-popup.service';

export { DocQuickInsertPopupService } from './services/doc-quick-insert-popup.service';
export { DocQuickInsertTriggerController } from './controllers/doc-quick-insert-trigger.controller';
export { DocQuickInsertUIController } from './controllers/doc-quick-insert-ui.controller';
export { QuickInsertPlaceholderComponentKey } from './views/QuickInsertPlaceholder';
export { KeywordInputPlaceholderComponentKey } from './views/KeywordInputPlaceholder';

// #region - all commands

// #endregion
