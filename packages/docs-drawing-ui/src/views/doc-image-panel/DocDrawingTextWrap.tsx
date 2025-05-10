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

import type { ICommandInfo, IDrawingParam, Nullable } from '@univerjs/core';
import type { IDocDrawing } from '@univerjs/docs-drawing';
import { BooleanNumber, ICommandService, IUniverInstanceService, LocaleService, PositionedObjectLayoutType, WrapTextType } from '@univerjs/core';
import { borderTopClassName, clsx, InputNumber, Radio, RadioGroup } from '@univerjs/design';
import { RichTextEditingMutation } from '@univerjs/docs';
import { IDrawingManagerService } from '@univerjs/drawing';
import { IRenderManagerService } from '@univerjs/engine-render';
import { useDependency } from '@univerjs/ui';
import { useEffect, useState } from 'react';
import { TextWrappingStyle, UpdateDocDrawingDistanceCommand, UpdateDocDrawingWrappingStyleCommand, UpdateDocDrawingWrapTextCommand } from '../../commands/commands/update-doc-drawing.command';

const MIN_MARGIN = 0;
const MAX_MARGIN = 100;

export interface IDocDrawingTextWrapProps {
    drawings: IDrawingParam[];
}

interface IDistToText {
    distT: number;
    distL: number;
    distB: number;
    distR: number;
}

export const DocDrawingTextWrap = (props: IDocDrawingTextWrapProps) => {
    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);
    const drawingManagerService = useDependency(IDrawingManagerService);
    const renderManagerService = useDependency(IRenderManagerService);
    const univerInstanceService = useDependency(IUniverInstanceService);

    const { drawings } = props;

    const drawingParam = drawings[0] as IDocDrawing;

    if (drawingParam == null) {
        return null;
    }

    const { unitId } = drawingParam;

    const documentDataModel = univerInstanceService.getUniverDocInstance(unitId);

    const renderObject = renderManagerService.getRenderById(unitId);
    const scene = renderObject?.scene;
    if (scene == null) {
        return null;
    }

    const [disableWrapText, setDisableWrapText] = useState(true);
    const [disableDistTB, setDisableDistTB] = useState(true);
    const [disableDistLR, setDisableDistLR] = useState(true);
    const [wrappingStyle, setWrappingStyle] = useState(TextWrappingStyle.INLINE);
    const [wrapText, setWrapText] = useState('');
    const [distToText, setDistToText] = useState<IDistToText>({
        distT: 0,
        distL: 0,
        distB: 0,
        distR: 0,
    });
    const [showPanel, setShowPanel] = useState(true);

    function handleWrappingStyleChange(value: number | string | boolean) {
        setWrappingStyle(value as TextWrappingStyle);

        const focusDrawings = drawingManagerService.getFocusDrawings();
        if (focusDrawings.length === 0) {
            return;
        }

        const { unitId, subUnitId } = focusDrawings[0];

        const drawings = focusDrawings.map(({ unitId, subUnitId, drawingId }) => ({
            unitId,
            subUnitId,
            drawingId,
        }));

        commandService.executeCommand(UpdateDocDrawingWrappingStyleCommand.id, {
            unitId,
            subUnitId,
            drawings,
            wrappingStyle: value as TextWrappingStyle,
        });
    }

    function handleWrapTextChange(value: number | string | boolean) {
        setWrapText(value as string);

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

        commandService.executeCommand(UpdateDocDrawingWrapTextCommand.id, {
            unitId: focusDrawings[0].unitId,
            subUnitId: focusDrawings[0].unitId,
            drawings,
            wrapText: value as WrapTextType,
        });
    }

    function handleDistToTextChange(value: Nullable<number>, direction: keyof IDistToText) {
        if (value == null) {
            return;
        }

        const newDistToText = { ...distToText, [direction]: value };
        setDistToText(newDistToText as IDistToText);

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

        commandService.executeCommand(UpdateDocDrawingDistanceCommand.id, {
            unitId: focusDrawings[0].unitId,
            subUnitId: focusDrawings[0].unitId,
            drawings,
            dist: {
                [direction]: value,
            },
        });
    }

    function updateFocusDrawingState() {
        const focusDrawings = drawingManagerService.getFocusDrawings();
        if (focusDrawings.length === 0) {
            return;
        }

        updateState(focusDrawings[0]);
    }

    function updateState(drawingParam: IDrawingParam) {
        const drawing = documentDataModel?.getSnapshot()?.drawings?.[drawingParam.drawingId];
        if (drawing == null) {
            return;
        }

        const {
            distT = 0,
            distL = 0,
            distB = 0,
            distR = 0,
            layoutType = PositionedObjectLayoutType.INLINE,
            behindDoc = BooleanNumber.FALSE,
            wrapText = WrapTextType.BOTH_SIDES,
        } = drawing;
        const distToText = {
            distT,
            distL,
            distB,
            distR,
        };

        setDistToText(distToText);

        setWrapText(wrapText as unknown as string);

        setDisableWrapText(layoutType !== PositionedObjectLayoutType.WRAP_SQUARE);

        if (
            layoutType === PositionedObjectLayoutType.WRAP_NONE ||
            layoutType === PositionedObjectLayoutType.INLINE
        ) {
            setDisableDistTB(true);
        } else {
            setDisableDistTB(false);
        }

        if (
            layoutType === PositionedObjectLayoutType.WRAP_NONE ||
            layoutType === PositionedObjectLayoutType.INLINE ||
            layoutType === PositionedObjectLayoutType.WRAP_TOP_AND_BOTTOM
        ) {
            setDisableDistLR(true);
        } else {
            setDisableDistLR(false);
        }

        if (layoutType === PositionedObjectLayoutType.WRAP_NONE) {
            if (behindDoc === BooleanNumber.TRUE) {
                setWrappingStyle(TextWrappingStyle.BEHIND_TEXT);
            } else {
                setWrappingStyle(TextWrappingStyle.IN_FRONT_OF_TEXT);
            }
        } else {
            switch (layoutType) {
                case PositionedObjectLayoutType.INLINE:
                    setWrappingStyle(TextWrappingStyle.INLINE);
                    break;
                case PositionedObjectLayoutType.WRAP_SQUARE:
                    setWrappingStyle(TextWrappingStyle.WRAP_SQUARE);
                    break;
                case PositionedObjectLayoutType.WRAP_TOP_AND_BOTTOM:
                    setWrappingStyle(TextWrappingStyle.WRAP_TOP_AND_BOTTOM);
                    break;
                default:
                    throw new Error(`Unsupported layout type: ${layoutType}`);
            }
        }
    }

    useEffect(() => {
        updateFocusDrawingState();

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
                <div
                    className={`
                      univer-flex univer-items-center univer-gap-1 univer-text-gray-600
                      dark:univer-text-gray-200
                    `}
                >
                    <div>{localeService.t('image-text-wrap.title')}</div>
                </div>
            </div>
            <div className="univer-relative univer-mt-2.5 univer-flex univer-h-full">
                <div
                    className={`
                      univer-flex univer-items-center univer-gap-1 univer-text-gray-900
                      dark:univer-text-white
                    `}
                >
                    <div>{localeService.t('image-text-wrap.wrappingStyle')}</div>
                </div>
            </div>
            <div className="univer-relative univer-mt-2.5 univer-flex univer-h-full">
                <div className="univer-flex univer-items-center univer-gap-1">
                    <RadioGroup value={wrappingStyle} onChange={handleWrappingStyleChange} direction="vertical">
                        <Radio value={TextWrappingStyle.INLINE}>{localeService.t('image-text-wrap.inline')}</Radio>
                        <Radio value={TextWrappingStyle.WRAP_SQUARE}>{localeService.t('image-text-wrap.square')}</Radio>
                        <Radio value={TextWrappingStyle.WRAP_TOP_AND_BOTTOM}>{localeService.t('image-text-wrap.topAndBottom')}</Radio>
                        <Radio value={TextWrappingStyle.BEHIND_TEXT}>{localeService.t('image-text-wrap.behindText')}</Radio>
                        <Radio value={TextWrappingStyle.IN_FRONT_OF_TEXT}>{localeService.t('image-text-wrap.inFrontText')}</Radio>
                    </RadioGroup>
                </div>
            </div>

            <div className="univer-relative univer-mt-2.5 univer-flex univer-h-full">
                <div
                    className={`
                      univer-flex univer-items-center univer-gap-1 univer-text-gray-900
                      dark:univer-text-white
                    `}
                >
                    <div>{localeService.t('image-text-wrap.wrapText')}</div>
                </div>
            </div>
            <div
                className="univer-relative univer-mt-2.5 univer-flex univer-h-full"
            >
                <div className="univer-flex univer-items-center univer-gap-1">
                    <RadioGroup disabled={disableWrapText} value={wrapText} onChange={handleWrapTextChange} direction="horizontal">
                        <Radio value={WrapTextType.BOTH_SIDES}>{localeService.t('image-text-wrap.bothSide')}</Radio>
                        <Radio value={WrapTextType.LEFT}>{localeService.t('image-text-wrap.leftOnly')}</Radio>
                        <Radio value={WrapTextType.RIGHT}>{localeService.t('image-text-wrap.rightOnly')}</Radio>
                    </RadioGroup>
                </div>
            </div>

            <div className="univer-relative univer-mt-2.5 univer-flex univer-h-full">
                <div
                    className={`
                      univer-flex univer-items-center univer-gap-1 univer-text-gray-900
                      dark:univer-text-white
                    `}
                >
                    <div>{localeService.t('image-text-wrap.distanceFromText')}</div>
                </div>
            </div>

            <div
                className="univer-relative univer-mt-2.5 univer-flex univer-h-full"
            >
                <div className="univer-flex univer-items-center univer-gap-1">
                    <label>
                        <div className="univer-relative univer-mt-2.5 univer-flex univer-h-full">
                            <div className="univer-flex univer-items-center univer-gap-1">
                                {localeService.t('image-text-wrap.top')}
                            </div>
                        </div>
                        <div className="univer-relative univer-mt-2.5 univer-flex univer-h-full">
                            <div className="univer-flex univer-items-center univer-gap-1">
                                <InputNumber
                                    min={MIN_MARGIN}
                                    max={MAX_MARGIN}
                                    disabled={disableDistTB}
                                    precision={1}
                                    value={distToText.distT}
                                    onChange={(val) => { handleDistToTextChange(val, 'distT'); }}
                                />
                            </div>
                        </div>
                    </label>
                </div>
                <div className={clsx('univer-flex univer-items-center univer-gap-1')}>
                    <label>
                        <div
                            className="univer-relative univer-mt-2.5 univer-flex univer-h-full"
                        >
                            <div className="univer-flex univer-items-center univer-gap-1">
                                {localeService.t('image-text-wrap.left')}
                            </div>
                        </div>
                        <div className="univer-relative univer-mt-2.5 univer-flex univer-h-full">
                            <div className="univer-flex univer-items-center univer-gap-1">
                                <InputNumber
                                    min={MIN_MARGIN}
                                    max={MAX_MARGIN}
                                    disabled={disableDistLR}
                                    precision={1}
                                    value={distToText.distL}
                                    onChange={(val) => { handleDistToTextChange(val, 'distL'); }}
                                />
                            </div>
                        </div>
                    </label>
                </div>
            </div>
            <div
                className="univer-relative univer-mt-2.5 univer-flex univer-h-full"
            >
                <div className="univer-flex univer-items-center univer-gap-1">
                    <label>
                        <div className="univer-relative univer-mt-2.5 univer-flex univer-h-full">
                            <div className="univer-flex univer-items-center univer-gap-1">
                                {localeService.t('image-text-wrap.bottom')}
                            </div>
                        </div>
                        <div className="univer-relative univer-mt-2.5 univer-flex univer-h-full">
                            <div className="univer-flex univer-items-center univer-gap-1">
                                <InputNumber
                                    min={MIN_MARGIN}
                                    max={MAX_MARGIN}
                                    disabled={disableDistTB}
                                    precision={1}
                                    value={distToText.distB}
                                    onChange={(val) => { handleDistToTextChange(val, 'distB'); }}
                                />
                            </div>
                        </div>
                    </label>
                </div>
                <div className="univer-flex univer-items-center univer-gap-1">
                    <label>
                        <div className="univer-relative univer-mt-2.5 univer-flex univer-h-full">
                            <div className="univer-flex univer-items-center univer-gap-1">
                                {localeService.t('image-text-wrap.right')}
                            </div>
                        </div>
                        <div className="univer-relative univer-mt-2.5 univer-flex univer-h-full">
                            <div className="univer-flex univer-items-center univer-gap-1">
                                <InputNumber
                                    min={MIN_MARGIN}
                                    max={MAX_MARGIN}
                                    disabled={disableDistLR}
                                    precision={1}
                                    value={distToText.distR}
                                    onChange={(val) => { handleDistToTextChange(val, 'distR'); }}
                                />
                            </div>
                        </div>
                    </label>
                </div>
            </div>
        </div>
    );
};
