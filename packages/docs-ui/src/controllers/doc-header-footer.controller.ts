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

import type { DocumentDataModel, ICommandInfo, Nullable } from '@univerjs/core';
import type {
    Documents,
    DocumentViewModel,
    IDocumentSkeletonPage,
    IMouseEvent,
    IPageRenderConfig,
    IPathProps,
    IPointerEvent,
    IRenderContext,
    IRenderModule,
    RenderComponentType,
} from '@univerjs/engine-render';
import type { LocaleKey } from '../locale/types';
import {
    BooleanNumber,
    ColorKit,
    Disposable,
    DocumentFlavor,
    generateRandomId,
    ICommandService,
    Inject,
    IUniverInstanceService,
    LocaleService,
    ThemeService,
    toDisposable,
    UniverInstanceType,
} from '@univerjs/core';
import { DocSkeletonManagerService, HeaderFooterType, RichTextEditingMutation } from '@univerjs/docs';
import { DocumentEditArea, IRenderManagerService, PageLayoutType, Path, Rect, Vector2 } from '@univerjs/engine-render';
import { neoGetDocObject } from '../basics/component-tools';
import { CloseHeaderFooterCommand, CoreHeaderFooterCommand } from '../commands/commands/doc-header-footer.command';
import { IEditorService } from '../services/editor/editor-manager.service';
import { DocSelectionRenderService } from '../services/selection/doc-selection-render.service';
import { getDocPageSectionContext } from '../utils/section-header-footer';
import { TextBubbleShape } from '../views/header-footer/text-bubble';

const HEADER_FOOTER_COVER_ALPHA = 0.5;
const HEADER_FOOTER_LABEL_ALPHA = 0.08;

interface IHeaderFooterCreate {
    createType: Nullable<HeaderFooterType>;
    headerFooterId: Nullable<string>;
    sectionId?: string;
}

function checkCreateHeaderFooterType(
    viewModel: DocumentViewModel,
    editArea: DocumentEditArea,
    segmentPage: number,
    page?: IDocumentSkeletonPage
): IHeaderFooterCreate {
    const snapshot = viewModel.getDataModel().getSnapshot();
    const { sectionId, config } = getDocPageSectionContext(snapshot, page);
    const {
        defaultHeaderId,
        defaultFooterId,
        evenPageHeaderId,
        evenPageFooterId,
        firstPageHeaderId,
        firstPageFooterId,
        evenAndOddHeaders,
        useFirstPageHeaderFooter,
    } = config;
    const isFirstPage = page ? page.pageNumber === page.pageNumberStart : segmentPage === 0;
    const isEvenPage = page ? page.pageNumber % 2 === 0 : segmentPage % 2 === 1;

    if (editArea === DocumentEditArea.BODY) {
        return { createType: null, headerFooterId: null, sectionId };
    }

    const isHeader = editArea === DocumentEditArea.HEADER;
    if (!isHeader && editArea !== DocumentEditArea.FOOTER) {
        throw new Error(`Invalid editArea: ${editArea}`);
    }
    const variants = isHeader
        ? {
            first: [firstPageHeaderId, HeaderFooterType.FIRST_PAGE_HEADER] as const,
            even: [evenPageHeaderId, HeaderFooterType.EVEN_PAGE_HEADER] as const,
            default: [defaultHeaderId, HeaderFooterType.DEFAULT_HEADER] as const,
        }
        : {
            first: [firstPageFooterId, HeaderFooterType.FIRST_PAGE_FOOTER] as const,
            even: [evenPageFooterId, HeaderFooterType.EVEN_PAGE_FOOTER] as const,
            default: [defaultFooterId, HeaderFooterType.DEFAULT_FOOTER] as const,
        };
    const [headerFooterId, createType] = useFirstPageHeaderFooter === BooleanNumber.TRUE && isFirstPage
        ? variants.first
        : evenAndOddHeaders === BooleanNumber.TRUE && isEvenPage
            ? variants.even
            : variants.default;

    return {
        createType: headerFooterId ? null : createType,
        headerFooterId: headerFooterId ?? null,
        sectionId,
    };
}

export class DocHeaderFooterController extends Disposable implements IRenderModule {
    private _loadedMap = new WeakSet<RenderComponentType>();
    private _headerFooterColors = {
        primary: '',
        cover: '',
        label: '',
    };

    constructor(
        private readonly _context: IRenderContext<DocumentDataModel>,
        @ICommandService private readonly _commandService: ICommandService,
        @IEditorService private readonly _editorService: IEditorService,
        @IUniverInstanceService private readonly _instanceSrv: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService,
        @Inject(DocSelectionRenderService) private readonly _docSelectionRenderService: DocSelectionRenderService,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(ThemeService) private readonly _themeService: ThemeService
    ) {
        super();

        this._initialize();
    }

    private _initialize() {
        this._initThemeColors();
        this._init();
        this._drawHeaderFooterLabel();
        this._listenSwitchMode();
    }

    private _initThemeColors(): void {
        this.disposeWithMe(this._themeService.currentTheme$.subscribe(() => {
            const primary = this._themeService.getColorFromTheme('primary.600');

            this._headerFooterColors = {
                primary,
                cover: new ColorKit(this._themeService.getColorFromTheme('gray.0'))
                    .setAlpha(HEADER_FOOTER_COVER_ALPHA)
                    .toRgbString(),
                label: new ColorKit(primary)
                    .setAlpha(HEADER_FOOTER_LABEL_ALPHA)
                    .toRgbString(),
            };
        }));
    }

    override dispose(): void {
        super.dispose();
        // this._loadedMap = new WeakSet<RenderComponentType>();
    }

    // Close header footer panel when switch mode.
    private _listenSwitchMode() {
        // this.disposeWithMe(
        //     this._commandService.beforeCommandExecuted((command: ICommandInfo) => {
        //         if (SwitchDocModeCommand.id === command.id) {
        //             const viewModel = this._docSkeletonManagerService.getViewModel();
        //             const editArea = viewModel.getEditArea();

        //             if (editArea !== DocumentEditArea.BODY) {
        //                 this._commandService.executeCommand(CloseHeaderFooterCommand.id, {
        //                     unitId: this._context.unitId,
        //                 });
        //             }
        //         }
        //     })
        // );

        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (RichTextEditingMutation.id === command.id) {
                    const docDataModel = this._context.unit;

                    const viewModel = this._docSkeletonManagerService.getViewModel();
                    const editArea = viewModel.getEditArea();

                    const documentFlavor = docDataModel.getSnapshot().documentStyle.documentFlavor;

                    if (editArea !== DocumentEditArea.BODY && documentFlavor === DocumentFlavor.MODERN) {
                        this._commandService.executeCommand(CloseHeaderFooterCommand.id, {
                            unitId: this._context.unitId,
                        });
                    }
                }
            })
        );
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

            if (!this._isTraditionalMode()) {
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

            if (
                preEditArea === editArea &&
                (editArea === DocumentEditArea.BODY || this._docSelectionRenderService.getSegmentPage() === pageNumber)
            ) {
                return;
            }

            viewModel.setEditArea(editArea);

            const page = skeleton.getSkeletonData()?.pages[pageNumber];
            const { createType, headerFooterId, sectionId } = checkCreateHeaderFooterType(viewModel, editArea, pageNumber, page);

            if (editArea === DocumentEditArea.BODY) {
                this._docSelectionRenderService.setSegment('');
                this._docSelectionRenderService.setSegmentPage(-1);
                this._docSelectionRenderService.setCursorManually(offsetX, offsetY);
            } else {
                if (createType != null) {
                    const SEGMENT_ID_LEN = 6;
                    const segmentId = generateRandomId(SEGMENT_ID_LEN);
                    this._docSelectionRenderService.setSegment(segmentId);
                    this._docSelectionRenderService.setSegmentPage(pageNumber);

                    await this._commandService.executeCommand(CoreHeaderFooterCommand.id, {
                        unitId,
                        createType,
                        segmentId,
                        sectionId,
                    });
                } else if (headerFooterId != null) {
                    this._docSelectionRenderService.setSegment(headerFooterId);
                    this._docSelectionRenderService.setSegmentPage(pageNumber);
                    this._docSelectionRenderService.setCursorManually(offsetX, offsetY);
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

        const originCoord = activeViewport.transformVector2SceneCoord(Vector2.FromArray([evtOffsetX, evtOffsetY]));

        return documentTransform.clone().invert().applyPoint(originCoord);
    }

    private _drawHeaderFooterLabel() {
        this.disposeWithMe(this._instanceSrv.getCurrentTypeOfUnit$(UniverInstanceType.UNIVER_DOC).subscribe((unit) => {
            if (unit == null) {
                return;
            }

            const unitId = unit.getUnitId();
            const currentRender = this._renderManagerService.getRenderUnitById(unitId);
            if (this._editorService.isEditor(unitId) || this._instanceSrv.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC) == null) {
                return;
            }

            if (currentRender == null) {
                return;
            }

            const { mainComponent } = currentRender;

            const docsComponent = mainComponent as Documents;

            this.disposeWithMe(
                toDisposable(
                    docsComponent.pageRender$.subscribe((config: IPageRenderConfig) => this._drawHeaderFooterPage(config, unitId))
                )
            );
        }));
    }

    private _drawHeaderFooterPage(config: IPageRenderConfig, unitId: string): void {
        if (this._editorService.isEditor(unitId) || !this._isTraditionalMode()) {
            return;
        }

        const editArea = this._docSkeletonManagerService.getViewModel().getEditArea();
        const isEditBody = editArea === DocumentEditArea.BODY;
        const { pageLeft, pageTop, ctx } = config;

        ctx.save();
        ctx.translate(pageLeft - 0.5, pageTop - 0.5);
        this._drawHeaderFooterCover(config, isEditBody);

        if (!isEditBody) {
            this._drawHeaderFooterGuides(config);
        }

        ctx.restore();
    }

    private _drawHeaderFooterCover({ page, ctx }: IPageRenderConfig, isEditBody: boolean): void {
        const { pageWidth, pageHeight, marginTop, marginBottom } = page;

        if (isEditBody) {
            Rect.drawWith(ctx, {
                left: 0,
                top: 0,
                width: pageWidth,
                height: marginTop,
                fill: this._headerFooterColors.cover,
            });
            ctx.save();
            ctx.translate(0, pageHeight - marginBottom);
            Rect.drawWith(ctx, {
                left: 0,
                top: 0,
                width: pageWidth,
                height: marginBottom,
                fill: this._headerFooterColors.cover,
            });
            ctx.restore();
            return;
        }

        ctx.save();
        ctx.translate(0, marginTop);
        Rect.drawWith(ctx, {
            left: 0,
            top: marginTop,
            width: pageWidth,
            height: pageHeight - marginTop - marginBottom,
            fill: this._headerFooterColors.cover,
        });
        ctx.restore();
    }

    private _drawHeaderFooterGuides({ page, ctx }: IPageRenderConfig): void {
        const { pageWidth, pageHeight, marginTop, marginBottom } = page;
        const headerPathConfig = {
            dataArray: [{
                command: 'M',
                points: [0, marginTop],
            }, {
                command: 'L',
                points: [pageWidth, marginTop],
            }] as unknown as IPathProps['dataArray'],
            strokeWidth: 1,
            stroke: this._headerFooterColors.primary,
        };
        const footerPathConfig = {
            dataArray: [{
                command: 'M',
                points: [0, pageHeight - marginBottom],
            }, {
                command: 'L',
                points: [pageWidth, pageHeight - marginBottom],
            }] as unknown as IPathProps['dataArray'],
            strokeWidth: 1,
            stroke: this._headerFooterColors.primary,
        };

        Path.drawWith(ctx, headerPathConfig);
        Path.drawWith(ctx, footerPathConfig);

        ctx.translate(0, marginTop + 1);
        TextBubbleShape.drawWith(ctx, {
            text: this._localeService.t<LocaleKey>('docs-ui.headerFooter.header'),
            color: this._headerFooterColors.label,
        });
        ctx.translate(0, pageHeight - marginTop - marginBottom);
        TextBubbleShape.drawWith(ctx, {
            text: this._localeService.t<LocaleKey>('docs-ui.headerFooter.footer'),
            color: this._headerFooterColors.label,
        });
    }

    private _isEditorReadOnly(unitId: string) {
        const editor = this._editorService.getEditor(unitId);
        if (!editor) {
            return false;
        }

        return editor.isReadOnly();
    }

    private _isTraditionalMode() {
        const docDataModel = this._context.unit;

        const documentFlavor = docDataModel.getSnapshot().documentStyle.documentFlavor;

        return documentFlavor === DocumentFlavor.TRADITIONAL;
    }
}
