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

export { UniverSlidesUIPlugin } from './plugin';
export { SlidesUIController } from './controllers/slide-ui.controller';
export { SlideSideBar } from './components/slide-bar/SlideBar';

export { ISlideEditorBridgeService } from './services/slide-editor-bridge.service';
export { SlideCanvasPopMangerService } from './services/slide-popup-manager.service';

export { SlideEditorContainer } from './views/editor-container/EditorContainer';
export { SLIDE_EDITOR_ID } from './const';

export { CanvasView } from './controllers/canvas-view';

export { SLIDES_IMAGE_MENU_ID } from './controllers/image.menu';
export { SHAPE_MENU_ID } from './controllers/shape.menu';

export { menuSchema as SlidesUIMenuSchema } from './controllers/menu.schema';

// #region - all commands

export { ActivateSlidePageOperation } from './commands/operations/activate.operation';
export { DeleteSlideElementOperation } from './commands/operations/delete-element.operation';
export { InsertSlideFloatImageCommand } from './commands/operations/insert-image.operation';
export { InsertSlideShapeRectangleCommand, InsertSlideShapeRectangleOperation } from './commands/operations/insert-shape.operation';
export { SetSlidePageThumbOperation } from './commands/operations/set-thumb.operation';
export { AppendSlideOperation } from './commands/operations/append-slide.operation';
export { SlideAddTextCommand, SlideAddTextOperation } from './commands/operations/insert-text.operation';
export { UpdateSlideElementOperation } from './commands/operations/update-element.operation';

// #endregion
