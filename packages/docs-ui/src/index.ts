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

export { whenDocAndEditorFocused } from './shortcuts/utils';
export { IDocClipboardService } from './services/clipboard/clipboard.service';
export { DocBackScrollRenderController } from './controllers/render-controllers/back-scroll.render-controller';
export * from './basics';
export * from './docs-ui-plugin';
export { DocRenderController } from './controllers/render-controllers/doc.render-controller';
export * from './services';
export { DocsRenderService } from './services/docs-render.service';
export { DocCanvasPopManagerService } from './services/doc-popup-manager.service';
export { docDrawingPositionToTransform, transformToDocDrawingPosition } from './basics/transform-position';
export { DocHoverManagerService } from './services/doc-hover-manager.service';
export { DocUIController } from './controllers/doc-ui.controller';
// #region - all commands

export { DocCopyCommand, DocCutCommand, DocPasteCommand } from './commands/commands/clipboard.command';
export { DocCreateTableOperation } from './commands/operations/doc-create-table.operation';
// #endregion
