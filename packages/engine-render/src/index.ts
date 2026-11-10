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

export {
    AlignmentSnapSession,
    getAlignmentRectXAnchors,
    getAlignmentRectYAnchors,
    getClosestAlignmentOffset,
    normalizeAlignmentRect,
} from './alignment-snap';
export type {
    AlignmentSnapAxis,
    IAlignmentRect,
    IAlignmentSnapAxisOptions,
    IAlignmentSnapAxisResult,
    IAlignmentSnapGuide,
    IAlignmentSnapSessionConfig,
} from './alignment-snap';
export * from './base-object';
export * from './basics';
export {
    combineDrawingEffectFilter,
    createDrawingEffectFilter,
    expandDrawingEffectBounds,
    resolveDrawingEffectMasks,
    resolveGlowEffect,
    resolveOuterShadowEffect,
} from './basics/drawing-effect';
export type { IResolvedDrawingShadow } from './basics/drawing-effect';
export { getOffsetRectForDom } from './basics/position';
export { getFontStyleString } from './basics/tools';
export * from './canvas';
export * from './components/component';
export type { DocsCustomBlockRenderViewportProvider, IDocsCustomBlockRenderViewport, IDocsCustomBlockRenderViewportInput } from './components/docs/custom-block-render-viewport';
export { getDocsCustomBlockRenderViewport, setDocsCustomBlockRenderViewportProvider } from './components/docs/custom-block-render-viewport';
export {
    getDocCustomGlyphRenderer,
    registerDocCustomGlyphRenderer,
} from './components/docs/custom-glyph-renderer';
export type {
    DocCustomGlyphRenderer,
    IDocCustomGlyphRendererRegistration,
    IDocCustomGlyphRenderInput,
} from './components/docs/custom-glyph-renderer';
export { DocBackground } from './components/docs/doc-background';
export { DOCS_EXTENSION_TYPE } from './components/docs/doc-extension';
export { Documents } from './components/docs/document';
export type { IDocumentGlyphPaint, IDocumentOffsetConfig, IPageRenderConfig } from './components/docs/document';
export { getDocumentLayoutPresentation, registerDocumentLayoutPresentation } from './components/docs/document-layout-presentation';
export type {
    IDocumentLayoutBody,
    IDocumentLayoutParagraph,
    IDocumentLayoutParagraphStyle,
    IDocumentLayoutPresentation,
    IDocumentLayoutSnapshot,
    IDocumentLayoutTextRun,
    IDocumentLayoutTextStyle,
} from './components/docs/document-layout-presentation';
export { hasDocumentReferenceLayout, registerDocumentReferenceLayoutResolver } from './components/docs/document-reference-layout';
export type { DocumentHeaderFooterReferenceResolver, IDocumentHeaderFooterReferencePage } from './components/docs/header-footer-reference';
export { hasDocumentHeaderFooterReferenceLayout, registerDocumentHeaderFooterReferenceResolver } from './components/docs/header-footer-reference';
export { resolveDocumentParagraphNumbering } from './components/docs/layout/block/paragraph/linebreaking';
export { getTableIdAndSliceIndex } from './components/docs/layout/block/table';
export {
    measureDocumentNoWrapTextRangeWidth,
    measureDocumentNoWrapTextWidth,
    measureDocumentUnbreakableTextWidth,
    measureDocumentWrappedTextWidth,
} from './components/docs/layout/doc-no-wrap-measure';
export * from './components/docs/layout/doc-simple-skeleton';
export { DocumentSkeleton } from './components/docs/layout/doc-skeleton';
export type { IFindNodeRestrictions } from './components/docs/layout/doc-skeleton';
export type { IDocumentLayoutPagePublication } from './components/docs/layout/document-layout-publication';
export type {
    DocumentLayoutMode,
    DocumentLayoutReason,
    IDocumentLayoutApplyResult,
    IDocumentLayoutInvalidation,
    IDocumentLayoutPageRange,
    IDocumentLayoutProgress,
    IDocumentLayoutProtectedContinuousRange,
    IDocumentLayoutProtectedPageRange,
    IDocumentLayoutProtectedRange,
} from './components/docs/layout/document-layout-types';
export { formatNoteNumber, resolveNoteReferences } from './components/docs/layout/note-numbering';
export { FontCache, invalidateDocumentFontMetrics } from './components/docs/layout/shaping-engine/font-cache';
export {
    compareDocumentSkeletonNestedPagePathOrder,
    documentSkeletonLineIterator,
    documentSkeletonTableIterator,
    getCharSpaceApply,
    getDocumentSkeletonColumnPagePathInfo,
    getDocumentSkeletonNestedPageOffset,
    getLastLine,
    getNumberUnitValue,
    getPageFromPath,
    glyphIterator,
    lineIterator,
} from './components/docs/layout/tools';
export type { IDocumentSkeletonColumnPagePathInfo, IDocumentSkeletonLineContext, IDocumentSkeletonLineIteratorOptions, IDocumentSkeletonTableCellGeometry, IDocumentSkeletonTableContext, IDocumentSkeletonTableIteratorOptions } from './components/docs/layout/tools';
export { getLastColumn } from './components/docs/layout/tools';
export { Liquid } from './components/docs/liquid';
export { getTopmostDocsTableHit } from './components/docs/table-hit-test';
export type {
    DocsTableRenderViewportProvider,
    IDocsTableRenderViewport,
} from './components/docs/table-render-viewport';
export {
    getDocsTableLayoutViewportWidth,
    getDocsTableRenderViewport,
    getDocsTableViewportLeft,
    setDocsTableRenderViewportProvider,
} from './components/docs/table-render-viewport';
export { DataStreamTreeNode } from './components/docs/view-model/data-stream-tree-node';
export { DocumentViewModel } from './components/docs/view-model/document-view-model';
export { DocumentEditArea } from './components/docs/view-model/document-view-model';
export { parseDataStreamToTree } from './components/docs/view-model/document-view-model';
export * from './components/extension';
export * from './components/sheets/column-header';
export * from './components/sheets/constants';
export * from './components/sheets/extensions/background';
export * from './components/sheets/extensions/border';
export * from './components/sheets/extensions/column-header-layout';
export * from './components/sheets/extensions/custom';
export * from './components/sheets/extensions/font';
export * from './components/sheets/extensions/marker';
export * from './components/sheets/extensions/row-header-layout';
export * from './components/sheets/extensions/sheet-extension';
export * from './components/sheets/interfaces';
export * from './components/sheets/row-header';
export { SheetCellDocumentViewModel } from './components/sheets/sheet-cell-document-view-model';
export * from './components/sheets/sheet-component';
export * from './components/sheets/sheet.render-skeleton';
export { RENDER_RAW_FORMULA_KEY } from './components/sheets/sheet.render-skeleton';
export * from './components/sheets/spreadsheet';
export { calculateCellImageRect } from './components/sheets/util';
export type { ICellImageRectConfig } from './components/sheets/util';
export * from './components/sheets/watermark/type';
export * from './components/sheets/watermark/util';
export * from './components/sheets/watermark/watermark-layer';
export type { IUniverEngineRenderConfig } from './config/config';
export * from './context';
export * from './custom';
export { DrawingGroupObject } from './drawing-group';
export type { IDrawingGroupShadow } from './drawing-group';
export * from './engine';
export * from './group';
export * from './layer';
export { UniverRenderEnginePlugin } from './plugin';
export {
    getCurrentTypeOfRenderer,
    IRenderManagerService,
    RenderManagerService,
    withCurrentTypeOfRenderer,
} from './render-manager/render-manager.service';
export { type RenderComponentType } from './render-manager/render-manager.service';
export { RenderUnit } from './render-manager/render-unit';
export type { IRender, IRenderContext, IRenderModule } from './render-manager/render-unit';
export * from './scene';
export * from './scene-viewer';
export { type IChangeObserverConfig } from './scene.transformer';
export * from './scroll-timer';
export { CanvasColorService, DumbCanvasColorService, ICanvasColorService } from './services/canvas-color.service';

export * from './shape';
export * from './viewport';

export type { IDocumentLayoutSessionStartOptions, IDocumentLayoutStepResult } from './worker-layout';
