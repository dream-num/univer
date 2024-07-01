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

import type { DocumentDataModel } from '@univerjs/core';
import { BooleanNumber, Disposable, DocumentFlavor, ICommandService, IUniverInstanceService, LocaleService, toDisposable, Tools } from '@univerjs/core';
import type { Documents, DocumentViewModel, IMouseEvent, IPageRenderConfig, IPathProps, IPointerEvent, IRenderContext, IRenderModule, RenderComponentType } from '@univerjs/engine-render';
import { DocumentEditArea, IRenderManagerService, ITextSelectionRenderManager, PageLayoutType, Path, Vector2 } from '@univerjs/engine-render';
import { Inject } from '@wendellhu/redi';

import { ComponentManager, IEditorService } from '@univerjs/ui';
import { DocSkeletonManagerService, neoGetDocObject } from '@univerjs/docs';
import type { Nullable } from 'vitest';
import { TextBubbleShape } from '../views/header-footer/text-bubble';
import { CoreHeaderFooterCommand, OpenHeaderFooterPanelCommand } from '../commands/commands/doc-header-footer.command';
import { COMPONENT_DOC_HEADER_FOOTER_PANEL } from '../views/header-footer/panel/component-name';
import { DocHeaderFooterPanel } from '../views/header-footer/panel/DocHeaderFooterPanel';
import { SidebarDocHeaderFooterPanelOperation } from '../commands/operations/doc-header-footer-panel.operation';

const HEADER_FOOTER_STROKE_COLOR = 'rgba(58, 96, 247, 1)';
const HEADER_FOOTER_FILL_COLOR = 'rgba(58, 96, 247, 0.08)';

export enum HeaderFooterType {
    FIRST_PAGE_HEADER,
    FIRST_PAGE_FOOTER,
    DEFAULT_HEADER,
    DEFAULT_FOOTER,
    EVEN_PAGE_HEADER,
    EVEN_PAGE_FOOTER,
}

interface IHeaderFooterCreate {
    createType: Nullable<HeaderFooterType>;
    headerFooterId: Nullable<string>;
}

// TODO: @JOCS also need to check sectionBreak config in the future.
function checkCreateHeaderFooterType(viewModel: DocumentViewModel, editArea: DocumentEditArea, segmentPage: number): IHeaderFooterCreate {
    const { documentStyle } = viewModel.getDataModel().getSnapshot();
    const {
        defaultHeaderId,
        defaultFooterId,
        evenPageHeaderId,
        evenPageFooterId,
        firstPageHeaderId,
        firstPageFooterId,
        evenAndOddHeaders,
        useFirstPageHeaderFooter,
    } = documentStyle;

    switch (editArea) {
        case DocumentEditArea.BODY:
            return {
                createType: null,
                headerFooterId: null,
            };
        case DocumentEditArea.HEADER: {
            if (useFirstPageHeaderFooter === BooleanNumber.TRUE && !firstPageHeaderId) {
                return {
                    createType: HeaderFooterType.FIRST_PAGE_HEADER,
                    headerFooterId: null,
                };
            }

            if (evenAndOddHeaders === BooleanNumber.TRUE && segmentPage % 2 === 0 && !evenPageHeaderId) {
                return {
                    createType: HeaderFooterType.EVEN_PAGE_HEADER,
                    headerFooterId: null,
                };
            }

            return defaultHeaderId
                ? {
                    createType: null,
                    headerFooterId: defaultHeaderId,
                }
                : {
                    createType: HeaderFooterType.DEFAULT_HEADER,
                    headerFooterId: null,
                };
        }
        case DocumentEditArea.FOOTER: {
            if (useFirstPageHeaderFooter === BooleanNumber.TRUE && !firstPageFooterId) {
                return {
                    createType: HeaderFooterType.FIRST_PAGE_FOOTER,
                    headerFooterId: null,
                };
            }

            if (evenAndOddHeaders === BooleanNumber.TRUE && segmentPage % 2 === 0 && !evenPageFooterId) {
                return {
                    createType: HeaderFooterType.EVEN_PAGE_FOOTER,
                    headerFooterId: null,
                };
            }

            return defaultFooterId
                ? {
                    createType: null,
                    headerFooterId: defaultFooterId,
                }
                : {
                    createType: HeaderFooterType.DEFAULT_FOOTER,
                    headerFooterId: null,
                };
        }
        default:
            throw new Error(`Invalid editArea: ${editArea}`);
    }
}

export class DocHeaderFooterController extends Disposable implements IRenderModule {
    private _loadedMap = new WeakSet<RenderComponentType>();

    constructor(
        private readonly _context: IRenderContext<DocumentDataModel>,
        @ICommandService private readonly _commandService: ICommandService,
        @IEditorService private readonly _editorService: IEditorService,
        @IUniverInstanceService private readonly _instanceSrv: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService,
        @ITextSelectionRenderManager private readonly _textSelectionRenderManager: ITextSelectionRenderManager,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager
    ) {
        super();

        this._initialize();
    }

    private _initialize() {
        // FIXME: @Jocs, NO need to register this controller in Modern Document???
        const docDataModel = this._context.unit;

        const documentFlavor = docDataModel.getSnapshot().documentStyle.documentFlavor;

        // Only traditional document support header/footer.
        if (documentFlavor !== DocumentFlavor.TRADITIONAL) {
            return;
        }

        this._init();
        this._drawHeaderFooterLabel();
        this._registerCommands();
        this._initCustomComponents();
    }

    private _registerCommands() {
        [
            CoreHeaderFooterCommand,
            OpenHeaderFooterPanelCommand,
            SidebarDocHeaderFooterPanelOperation,
        ].forEach((command) => this.disposeWithMe(this._commandService.registerCommand(command)));
    }

    private _initCustomComponents(): void {
        const componentManager = this._componentManager;
        this.disposeWithMe(componentManager.register(COMPONENT_DOC_HEADER_FOOTER_PANEL, DocHeaderFooterPanel));
    }

    private _init() {
        const { unitId } = this._context;
        const docObject = neoGetDocObject(this._context);
        if (docObject == null || docObject.document == null) {
            return;
        }

        if (!this._loadedMap.has(docObject.document)) {
            this._initialMain(unitId);
            this._loadedMap.add(docObject.document);
        }
    }

    private _initialMain(unitId: string) {
        const docObject = neoGetDocObject(this._context);
        const { document } = docObject;

        this.disposeWithMe(document.onDblclick$.subscribeEvent(async (evt: IPointerEvent | IMouseEvent) => {
            if (this._isEditorReadOnly(unitId)) {
                return;
            }

            const { offsetX, offsetY } = evt;

            const {
                pageLayoutType = PageLayoutType.VERTICAL,
                pageMarginLeft,
                pageMarginTop,
            } = document.getOffsetConfig();

            const coord = this._getTransformCoordForDocumentOffset(offsetX, offsetY);

            if (coord == null) {
                return;
            }

            const viewModel = this._docSkeletonManagerService.getViewModel();
            const skeleton = this._docSkeletonManagerService.getSkeleton();
            const preEditArea = viewModel.getEditArea();
            const { editArea, pageNumber } = skeleton.findEditAreaByCoord(
                coord,
                pageLayoutType,
                pageMarginLeft,
                pageMarginTop
            );

            if (preEditArea === editArea) {
                return;
            }

            viewModel.setEditArea(editArea);

            const { createType, headerFooterId } = checkCreateHeaderFooterType(viewModel, editArea, pageNumber);

            if (editArea === DocumentEditArea.BODY) {
                this._textSelectionRenderManager.setSegment('');
                this._textSelectionRenderManager.setSegmentPage(-1);
                this._textSelectionRenderManager.setCursorManually(offsetX, offsetY);
            } else {
                if (createType != null) {
                    const SEGMENT_ID_LEN = 6;
                    const segmentId = Tools.generateRandomId(SEGMENT_ID_LEN);
                    this._textSelectionRenderManager.setSegment(segmentId);
                    this._textSelectionRenderManager.setSegmentPage(pageNumber);

                    await this._commandService.executeCommand(CoreHeaderFooterCommand.id, {
                        unitId,
                        createType,
                        segmentId,
                    });
                } else if (headerFooterId != null) {
                    this._textSelectionRenderManager.setSegment(headerFooterId);
                    this._textSelectionRenderManager.setSegmentPage(pageNumber);
                    this._textSelectionRenderManager.setCursorManually(offsetX, offsetY);
                }
            }
        }));
    }

    private _getTransformCoordForDocumentOffset(evtOffsetX: number, evtOffsetY: number) {
        const docObject = neoGetDocObject(this._context);
        const { document, scene } = docObject;
        const { documentTransform } = document.getOffsetConfig();
        const activeViewport = scene.getViewports()[0];

        if (activeViewport == null) {
            return;
        }

        const originCoord = activeViewport.getRelativeVector(Vector2.FromArray([evtOffsetX, evtOffsetY]));

        return documentTransform.clone().invert().applyPoint(originCoord);
    }

    // eslint-disable-next-line max-lines-per-function
    private _drawHeaderFooterLabel() {
        const localeService = this._localeService;
        this._renderManagerService.currentRender$.subscribe((unitId) => {
            if (unitId == null) {
                return;
            }

            const currentRender = this._renderManagerService.getRenderById(unitId);
            if (this._editorService.isEditor(unitId) || this._instanceSrv.getUniverDocInstance(unitId) == null) {
                return;
            }

            if (currentRender == null) {
                return;
            }

            const { mainComponent } = currentRender;

            const docsComponent = mainComponent as Documents;

            this.disposeWithMe(
                toDisposable(
                    docsComponent.pageRender$.subscribe((config: IPageRenderConfig) => {
                        const viewModel = this._docSkeletonManagerService.getViewModel();
                        const isEditBody = viewModel.getEditArea() === DocumentEditArea.BODY;
                        if (this._editorService.isEditor(unitId) || isEditBody) {
                            return;
                        }

                        // Draw page borders
                        const { page, pageLeft, pageTop, ctx } = config;

                        const { pageWidth, pageHeight, marginTop, marginBottom } = page;

                        ctx.save();

                        ctx.translate(pageLeft - 0.5, pageTop - 0.5);

                        const headerPathConfigIPathProps = {
                            dataArray: [{
                                command: 'M',
                                points: [0, marginTop],
                            }, {
                                command: 'L',
                                points: [pageWidth, marginTop],
                            }] as unknown as IPathProps['dataArray'],
                            strokeWidth: 1,
                            stroke: HEADER_FOOTER_STROKE_COLOR,
                        };

                        const footerPathConfigIPathProps = {
                            dataArray: [{
                                command: 'M',
                                points: [0, pageHeight - marginBottom],
                            }, {
                                command: 'L',
                                points: [pageWidth, pageHeight - marginBottom],
                            }] as unknown as IPathProps['dataArray'],
                            strokeWidth: 1,
                            stroke: HEADER_FOOTER_STROKE_COLOR,
                        };

                        Path.drawWith(ctx, headerPathConfigIPathProps);
                        Path.drawWith(ctx, footerPathConfigIPathProps);

                        ctx.translate(0, marginTop + 1);
                        TextBubbleShape.drawWith(ctx, {
                            text: localeService.t('headerFooter.header'),
                            color: HEADER_FOOTER_FILL_COLOR,
                        });
                        ctx.translate(0, pageHeight - marginTop - marginBottom);
                        TextBubbleShape.drawWith(ctx, {
                            text: localeService.t('headerFooter.footer'),
                            color: HEADER_FOOTER_FILL_COLOR,
                        });
                        ctx.restore();
                    })
                )
            );
        });
    }

    private _isEditorReadOnly(unitId: string) {
        const editor = this._editorService.getEditor(unitId);
        if (!editor) {
            return false;
        }

        return editor.isReadOnly();
    }

    private _getDocDataModel() {
        return this._context.unit;
    }
}
