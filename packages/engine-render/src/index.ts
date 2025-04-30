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

export * from './base-object';
export * from './basics';
export { getOffsetRectForDom } from './basics/position';
export * from './canvas';
export * from './components';
export { DocBackground } from './components/docs/doc-background';
export { Documents } from './components/docs/document';
export type { IPageRenderConfig } from './components/docs/document';
export type { IDocumentOffsetConfig } from './components/docs/document';
export { getTableIdAndSliceIndex } from './components/docs/layout/block/table';
export { DocumentSkeleton } from './components/docs/layout/doc-skeleton';
export type { IFindNodeRestrictions } from './components/docs/layout/doc-skeleton';
export { getCharSpaceApply, getLastLine, getNumberUnitValue, getPageFromPath, glyphIterator, lineIterator } from './components/docs/layout/tools';
export { Liquid } from './components/docs/liquid';
export { DataStreamTreeNode } from './components/docs/view-model/data-stream-tree-node';
export { DocumentViewModel } from './components/docs/view-model/document-view-model';
export { DocumentEditArea } from './components/docs/view-model/document-view-model';
export { parseDataStreamToTree } from './components/docs/view-model/document-view-model';
export { getLastColumn } from './components/docs/layout/tools';
export { DEFAULT_PADDING_DATA } from './components/sheets/sheet.render-skeleton';
export * from './context';
export * from './custom';
export * from './engine';
export * from './group';
export * from './layer';
export { IRenderingEngine, UniverRenderEnginePlugin } from './plugin';
export {
    getCurrentTypeOfRenderer,
    IRenderManagerService,
    type RenderComponentType,
    RenderManagerService,
    withCurrentTypeOfRenderer,
} from './render-manager/render-manager.service';
export { CanvasColorService, DumbCanvasColorService, ICanvasColorService } from './services/canvas-color.service';
export { type IRender, type IRenderContext, type IRenderModule, RenderUnit } from './render-manager/render-unit';
export * from './scene';
export { type IChangeObserverConfig } from './scene.transformer';
export * from './scene-viewer';
export * from './scroll-timer';
export * from './shape';
export * from './viewport';
