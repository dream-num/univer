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

export { DRAWING_IMAGE_ALLOW_IMAGE_LIST, DRAWING_IMAGE_ALLOW_SIZE, DRAWING_IMAGE_COUNT_LIMIT, DRAWING_IMAGE_HEIGHT_LIMIT, DRAWING_IMAGE_WIDTH_LIMIT } from './basics/config';
export { DrawingManagerService, type IDrawingJson1Type, type IDrawingJsonUndo1, UnitDrawingService } from './services/drawing-manager-impl.service';
export { getDrawingShapeKeyByDrawingSearch } from './utils/get-image-shape-key';
export { getImageSize } from './utils/get-image-size';
export { UniverDrawingPlugin } from './plugin';
export { type IDocFloatDomData, type IDocFloatDomDataBase, type IImageData } from './models/image-model-interface';
export { IImageIoService, type IImageIoServiceParam, ImageSourceType, ImageUploadStatusType } from './services/image-io.service';
export { ImageIoService } from './services/image-io-impl.service';
export {
    type IDrawingGroupUpdateParam,
    IDrawingManagerService,
    type IDrawingMap,
    type IDrawingMapItem,
    type IDrawingMapItemData,
    type IDrawingOrderMapParam,
    type IDrawingOrderUpdateParam,
    type IDrawingSubunitMap,
    type IDrawingVisibleParam,
    type IUnitDrawingService,
} from './services/drawing-manager.service';

export { SetDrawingSelectedOperation } from './commands/operations/set-drawing-selected.operation';
