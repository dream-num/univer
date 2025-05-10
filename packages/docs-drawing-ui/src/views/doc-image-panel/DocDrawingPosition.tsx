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

import type { ICommandInfo, IDrawingParam, IObjectPositionH, IObjectPositionV, Nullable } from '@univerjs/core';
import type { IDocDrawing } from '@univerjs/docs-drawing';
import type { IDocumentSkeletonDrawing } from '@univerjs/engine-render';
import { DocumentFlavor, ICommandService, IUniverInstanceService, LocaleService, ObjectRelativeFromH, ObjectRelativeFromV, PositionedObjectLayoutType } from '@univerjs/core';
import { borderTopClassName, Checkbox, clsx, InputNumber, Select } from '@univerjs/design';
import { DocSkeletonManagerService, RichTextEditingMutation } from '@univerjs/docs';
import { DocSelectionRenderService } from '@univerjs/docs-ui';
import { IDrawingManagerService } from '@univerjs/drawing';
import { IRenderManagerService } from '@univerjs/engine-render';
import { useDependency } from '@univerjs/ui';
import { useEffect, useState } from 'react';
import { UpdateDrawingDocTransformCommand } from '../../commands/commands/update-doc-drawing.command';

const MIN_OFFSET = -1000;
const MAX_OFFSET = 1000;

export interface IDocDrawingPositionProps {
    drawings: IDrawingParam[];
}

export const DocDrawingPosition = (props: IDocDrawingPositionProps) => {
    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);
    const drawingManagerService = useDependency(IDrawingManagerService);
    const renderManagerService = useDependency(IRenderManagerService);
    const univerInstanceService = useDependency(IUniverInstanceService);

    const { drawings } = props;

    const drawingParam = drawings[0] as IDocDrawing;

    if (drawingParam == null) {
        return;
    }

    const { unitId } = drawingParam;

    const documentDataModel = univerInstanceService.getUniverDocInstance(unitId);

    const documentFlavor = documentDataModel?.getSnapshot().documentStyle.documentFlavor;

    const renderObject = renderManagerService.getRenderById(unitId);
    const scene = renderObject?.scene;
    if (scene == null) {
        return;
    }
    const transformer = scene.getTransformerByCreate();

    const HORIZONTAL_RELATIVE_FROM = [{
        label: localeService.t('image-position.column'),
        value: String(ObjectRelativeFromH.COLUMN),
    }, {
        label: localeService.t('image-position.page'),
        value: String(ObjectRelativeFromH.PAGE),
    }, {
        label: localeService.t('image-position.margin'),
        value: String(ObjectRelativeFromH.MARGIN),
    }];

    const VERTICAL_RELATIVE_FROM = [{
        label: localeService.t('image-position.line'),
        value: String(ObjectRelativeFromV.LINE),
        disabled: documentFlavor === DocumentFlavor.MODERN,
    }, {
        label: localeService.t('image-position.page'),
        value: String(ObjectRelativeFromV.PAGE),
        disabled: documentFlavor === DocumentFlavor.MODERN,
    }, {
        label: localeService.t('image-position.margin'),
        value: String(ObjectRelativeFromV.MARGIN),
        disabled: documentFlavor === DocumentFlavor.MODERN,
    }, {
        label: localeService.t('image-position.paragraph'),
        value: String(ObjectRelativeFromV.PARAGRAPH),
    }];

    const [disabled, setDisabled] = useState(true);
    const [hPosition, setHPosition] = useState<IObjectPositionH>({
        relativeFrom: ObjectRelativeFromH.PAGE,
        posOffset: 0,
    });
    const [vPosition, setVPosition] = useState<IObjectPositionV>({
        relativeFrom: ObjectRelativeFromV.PAGE,
        posOffset: 0,
    });
    const [followTextMove, setFollowTextMove] = useState(true);
    const [showPanel, setShowPanel] = useState(true);

    function handlePositionChange(
        direction: 'positionH' | 'positionV',
        value: IObjectPositionH | IObjectPositionV
    ) {
        if (direction === 'positionH') {
            setHPosition(value as IObjectPositionH);
        } else {
            setVPosition(value as IObjectPositionV);
        }

        const focusDrawings = drawingManagerService.getFocusDrawings();
        if (focusDrawings.length === 0) {
            return;
        }

        const drawings = focusDrawings.map((drawing) => {
            return {
                unitId: drawing.unitId,
                subUnitId: drawing.subUnitId,
                drawingId: drawing.drawingId,
            };
        });

        commandService.executeCommand(UpdateDrawingDocTransformCommand.id, {
            unitId: focusDrawings[0].unitId,
            subUnitId: focusDrawings[0].unitId,
            drawings: drawings.map((drawing) => ({
                drawingId: drawing.drawingId,
                key: direction,
                value,
            })),
        });

        const docSelectionRenderService = renderManagerService.getRenderById(unitId)?.with(DocSelectionRenderService);

        if (docSelectionRenderService) {
            docSelectionRenderService.blur();
        }

        transformer.refreshControls();
    }

    function handleHorizontalRelativeFromChange(value: string) {
        const prevRelativeFrom = hPosition.relativeFrom;
        const prevPosOffset = hPosition.posOffset;
        const relativeFrom = Number(value) as ObjectRelativeFromH;

        if (prevRelativeFrom === relativeFrom) {
            return;
        }

        const focusDrawings = drawingManagerService.getFocusDrawings();
        if (focusDrawings.length === 0) {
            return;
        }

        const drawingId = focusDrawings[0].drawingId;
        const unitId = focusDrawings[0].unitId;

        let drawing: Nullable<IDocumentSkeletonDrawing> = null;
        let pageMarginLeft = 0;
        const skeleton = renderManagerService.getRenderById(unitId)
            ?.with(DocSkeletonManagerService)
            .getSkeleton();

        const skeletonData = skeleton?.getSkeletonData();

        if (skeletonData == null) {
            return;
        }

        const { pages, skeHeaders, skeFooters } = skeletonData;

        for (const page of pages) {
            const { marginLeft, skeDrawings, headerId, footerId, pageWidth } = page;

            if (skeDrawings.has(drawingId)) {
                drawing = skeDrawings.get(drawingId);
                pageMarginLeft = marginLeft;
                break;
            }

            const headerPage = skeHeaders.get(headerId)?.get(pageWidth);
            if (headerPage?.skeDrawings.has(drawingId)) {
                drawing = headerPage?.skeDrawings.get(drawingId);
                pageMarginLeft = marginLeft;
                break;
            }

            const footerPage = skeFooters.get(footerId)?.get(pageWidth);
            if (footerPage?.skeDrawings.has(drawingId)) {
                drawing = footerPage?.skeDrawings.get(drawingId);
                pageMarginLeft = marginLeft;
                break;
            }
        }

        if (drawing == null) {
            return;
        }

        let delta = 0;

        if (prevRelativeFrom === ObjectRelativeFromH.COLUMN) {
            delta -= drawing.columnLeft;
        } else if (prevRelativeFrom === ObjectRelativeFromH.MARGIN) {
            delta -= pageMarginLeft;
        }

        if (relativeFrom === ObjectRelativeFromH.COLUMN) {
            delta += drawing.columnLeft;
        } else if (relativeFrom === ObjectRelativeFromH.MARGIN) {
            delta += pageMarginLeft;
        } else if (relativeFrom === ObjectRelativeFromH.PAGE) {
            // Do nothing.
        }

        const newPositionH = {
            relativeFrom,
            posOffset: (prevPosOffset ?? 0) - delta,
        };

        handlePositionChange('positionH', newPositionH);
    }

    function handleVerticalRelativeFromChange(value: string) {
        const prevRelativeFrom = vPosition.relativeFrom;
        const prevPosOffset = vPosition.posOffset;
        const relativeFrom = Number(value) as ObjectRelativeFromV;

        if (prevRelativeFrom === relativeFrom) {
            return;
        }

        const focusDrawings = drawingManagerService.getFocusDrawings();
        if (focusDrawings.length === 0) {
            return;
        }

        const { drawingId, unitId } = focusDrawings[0];
        const documentDataModel = univerInstanceService.getUniverDocInstance(unitId);
        const skeleton = renderManagerService.getRenderById(unitId)
            ?.with(DocSkeletonManagerService)
            .getSkeleton();

        const docSelectionRenderService = renderManagerService.getRenderById(unitId)?.with(DocSelectionRenderService);

        const segmentId = docSelectionRenderService?.getSegment();
        const segmentPage = docSelectionRenderService?.getSegmentPage();

        const drawing = documentDataModel?.getSelfOrHeaderFooterModel(segmentId).getBody()?.customBlocks?.find((c) => c.blockId === drawingId);

        if (drawing == null || skeleton == null || docSelectionRenderService == null) {
            return;
        }

        const { startIndex } = drawing;

        const glyph = skeleton.findNodeByCharIndex(startIndex, segmentId, segmentPage);
        const line = glyph?.parent?.parent;
        const column = line?.parent;
        const paragraphStartLine = column?.lines.find((l) => l.paragraphIndex === line?.paragraphIndex && l.paragraphStart);
        const page = column?.parent?.parent;

        if (glyph == null || line == null || paragraphStartLine == null || column == null || page == null) {
            return;
        }

        let delta = 0;

        if (prevRelativeFrom === ObjectRelativeFromV.PARAGRAPH) {
            delta -= paragraphStartLine.top;
        } else if (prevRelativeFrom === ObjectRelativeFromV.LINE) {
            delta -= line.top;
        } else if (prevRelativeFrom === ObjectRelativeFromV.PAGE) {
            delta += page.marginTop;
        }

        if (relativeFrom === ObjectRelativeFromV.PARAGRAPH) {
            delta += paragraphStartLine.top;
        } else if (relativeFrom === ObjectRelativeFromV.LINE) {
            delta += line.top;
        } else if (relativeFrom === ObjectRelativeFromV.PAGE) {
            delta -= page.marginTop;
        }

        const newPositionV = {
            relativeFrom,
            posOffset: (prevPosOffset ?? 0) - delta,
        };

        handlePositionChange('positionV', newPositionV);
    }

    function updateState(drawingParam: IDrawingParam) {
        const snapshot = documentDataModel?.getSnapshot();
        const drawing = snapshot?.drawings?.[drawingParam.drawingId];
        if (drawing == null) {
            return;
        }

        const { layoutType } = drawing;
        const {
            positionH,
            positionV,
        } = drawing.docTransform;

        setHPosition(positionH);
        setVPosition(positionV);
        setDisabled(layoutType === PositionedObjectLayoutType.INLINE);
        setFollowTextMove(positionV.relativeFrom === ObjectRelativeFromV.PARAGRAPH || positionV.relativeFrom === ObjectRelativeFromV.LINE);
    }

    function updateFocusDrawingState() {
        const focusDrawings = drawingManagerService.getFocusDrawings();
        if (focusDrawings.length === 0) {
            return;
        }

        updateState(focusDrawings[0]);
    }

    function handleFollowTextMoveCheck(val: string | number | boolean) {
        setFollowTextMove(val as boolean);

        handleVerticalRelativeFromChange(val ? String(ObjectRelativeFromV.PARAGRAPH) : String(ObjectRelativeFromV.PAGE));
    }

    useEffect(() => {
        // Get the init focus drawing position.
        updateFocusDrawingState();

        // Need to update focus drawing position when focus drawing changes.
        const subscription = drawingManagerService.focus$.subscribe((drawingParams) => {
            if (drawingParams.length === 0) {
                setShowPanel(false);
                return;
            }

            setShowPanel(true);
            updateState(drawingParams[0]);
        });

        // Need to update focus drawing position when focus drawing wrap style changed or other edit which will affect the position.
        const mutationListener = commandService.onCommandExecuted(async (command: ICommandInfo) => {
            if (command.id === RichTextEditingMutation.id) {
                updateFocusDrawingState();
            }
        });

        return () => {
            subscription.unsubscribe();
            mutationListener.dispose();
        };
    }, []);

    return (
        <div
            className={clsx('univer-relative univer-mt-5 univer-w-full', borderTopClassName, {
                'univer-hidden': !showPanel,
            })}
        >
            <div className="univer-relative univer-mt-2.5 univer-flex univer-h-full">
                <div className="univer-flex univer-items-center univer-gap-1 univer-text-gray-400">
                    <div>{localeService.t('image-position.title')}</div>
                </div>
            </div>
            <div
                className="univer-relative univer-mt-2.5 univer-flex univer-h-full"
            >
                <div
                    className={`
                      univer-flex univer-items-center univer-gap-1 univer-text-gray-900
                      dark:univer-text-white
                    `}
                >
                    <div>{localeService.t('image-position.horizontal')}</div>
                </div>
            </div>

            <div
                className="univer-relative univer-mt-2.5 univer-flex univer-h-full"
            >
                <div className="univer-flex univer-items-center univer-gap-1 univer-text-gray-400">
                    <label>
                        <div
                            className="univer-relative univer-mt-2.5 univer-flex univer-h-full"
                        >
                            <div className="univer-flex univer-items-center univer-gap-1">
                                {localeService.t('image-position.absolutePosition')}
                            </div>
                        </div>
                        <div
                            className="univer-relative univer-mt-2.5 univer-flex univer-h-full"
                        >
                            <div className="univer-flex univer-items-center univer-gap-1">
                                <InputNumber
                                    min={MIN_OFFSET}
                                    max={MAX_OFFSET}
                                    precision={1}
                                    disabled={disabled}
                                    value={hPosition.posOffset}
                                    onChange={(val) => {
                                        handlePositionChange('positionH', {
                                            relativeFrom: hPosition.relativeFrom,
                                            posOffset: val as number,
                                        });
                                    }}
                                />
                            </div>
                        </div>
                    </label>
                </div>
                <div className="univer-flex univer-items-center univer-gap-1">
                    <label>
                        <div className="univer-relative univer-mt-2.5 univer-flex univer-h-full">
                            <div className="univer-flex univer-items-center univer-gap-1">
                                {localeService.t('image-position.toTheRightOf')}
                            </div>
                        </div>
                        <div
                            className="univer-relative univer-mt-2.5 univer-flex univer-h-full"
                        >
                            <div className="univer-flex univer-items-center univer-gap-1">
                                <Select
                                    value={String(hPosition.relativeFrom)}
                                    disabled={disabled}
                                    options={HORIZONTAL_RELATIVE_FROM}
                                    onChange={handleHorizontalRelativeFromChange}
                                />
                            </div>
                        </div>
                    </label>
                </div>
            </div>

            <div className="univer-relative univer-mt-2.5 univer-flex univer-h-full">
                <div
                    className={`
                      univer-flex univer-items-center univer-gap-1 univer-text-gray-900
                      dark:univer-text-white
                    `}
                >
                    <div>{localeService.t('image-position.vertical')}</div>
                </div>
            </div>

            <div className="univer-relative univer-mt-2.5 univer-flex univer-h-full">
                <div className="univer-flex univer-items-center univer-gap-1">
                    <label>
                        <div className="univer-relative univer-mt-2.5 univer-flex univer-h-full">
                            <div className="univer-flex univer-items-center univer-gap-1">
                                {localeService.t('image-position.absolutePosition')}
                            </div>
                        </div>
                        <div
                            className="univer-relative univer-mt-2.5 univer-flex univer-h-full"
                        >
                            <div className="univer-flex univer-items-center univer-gap-1">
                                <InputNumber
                                    min={MIN_OFFSET}
                                    max={MAX_OFFSET}
                                    precision={1}
                                    disabled={disabled}
                                    value={vPosition.posOffset}
                                    onChange={(val) => {
                                        handlePositionChange('positionV', {
                                            relativeFrom: vPosition.relativeFrom,
                                            posOffset: val as number,
                                        });
                                    }}
                                />
                            </div>
                        </div>
                    </label>
                </div>
                <div className="univer-flex univer-items-center univer-gap-1">
                    <label>
                        <div className="univer-relative univer-mt-2.5 univer-flex univer-h-full">
                            <div className="univer-flex univer-items-center univer-gap-1">
                                {localeService.t('image-position.bellow')}
                            </div>
                        </div>
                        <div
                            className="univer-relative univer-mt-2.5 univer-flex univer-h-full"
                        >
                            <div className="univer-flex univer-items-center univer-gap-1">
                                <Select
                                    disabled={disabled}
                                    value={String(vPosition.relativeFrom)}
                                    options={VERTICAL_RELATIVE_FROM}
                                    onChange={handleVerticalRelativeFromChange}
                                />
                            </div>
                        </div>
                    </label>
                </div>
            </div>

            <div className="univer-relative univer-mt-2.5 univer-flex univer-h-full">
                <div
                    className={`
                      univer-flex univer-items-center univer-gap-1 univer-text-gray-900
                      dark:univer-text-white
                    `}
                >
                    <div>{localeService.t('image-position.options')}</div>
                </div>
            </div>

            <div
                className="univer-relative univer-mb-12 univer-mt-2.5 univer-flex univer-h-full"
            >
                <div className="univer-flex univer-items-center univer-gap-1">
                    <Checkbox disabled={disabled} checked={followTextMove} onChange={handleFollowTextMoveCheck}>{localeService.t('image-position.moveObjectWithText')}</Checkbox>
                </div>
            </div>
        </div>
    );
};
