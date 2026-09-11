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

import type { DocumentDataModel, ICommandInfo, IDrawingParam, Nullable } from '@univerjs/core';
import type { IDocDrawingTextWrapProps } from './DocDrawingTextWrap';
import {
    BooleanNumber,
    ICommandService,
    IUniverInstanceService,
    LocaleService,
    PositionedObjectLayoutType,
    UniverInstanceType,
    WrapTextType,
} from '@univerjs/core';
import { RichTextEditingMutation } from '@univerjs/docs';
import { TextWrappingStyle, UpdateDocDrawingWrappingStyleCommand } from '@univerjs/docs-drawing';
import { IDrawingManagerService } from '@univerjs/drawing';
import { useDependency } from '@univerjs/ui';
import { useEffect, useState } from 'react';
import {
    UpdateDocDrawingDistanceCommand,
    UpdateDocDrawingWrapTextCommand,
} from '../../commands/commands/update-doc-drawing.command';

const MIN_MARGIN = 0;
const MAX_MARGIN = 100;

interface IDistToText {
    distT: number;
    distL: number;
    distB: number;
    distR: number;
}

export function useDocDrawingTextWrap(props: IDocDrawingTextWrapProps) {
    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);
    const drawingManagerService = useDependency(IDrawingManagerService);
    const univerInstanceService = useDependency(IUniverInstanceService);

    const { drawings } = props;

    const drawingParam = drawings[0];

    const { unitId } = drawingParam;

    const documentDataModel = univerInstanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC);

    const [disableWrapText, setDisableWrapText] = useState(true);
    const [disableDistTB, setDisableDistTB] = useState(true);
    const [disableDistLR, setDisableDistLR] = useState(true);
    const [wrappingStyle, setWrappingStyle] = useState(TextWrappingStyle.INLINE);
    const [wrapText, setWrapText] = useState(WrapTextType.BOTH_SIDES);
    const [distToText, setDistToText] = useState<IDistToText>({
        distT: 0,
        distL: 0,
        distB: 0,
        distR: 0,
    });
    const [showPanel, setShowPanel] = useState(true);

    function handleWrappingStyleChange(value: number | string | boolean) {
        const style = Object.values(TextWrappingStyle).find((style) => style === value);
        if (style == null) {
            return;
        }

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
            wrappingStyle: style,
        });
    }

    function handleWrapTextChange(value: number | string | boolean) {
        const wrapText = [WrapTextType.BOTH_SIDES, WrapTextType.LEFT, WrapTextType.RIGHT].find((side) => String(side) === String(value));
        if (wrapText == null) {
            return;
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

        commandService.executeCommand(UpdateDocDrawingWrapTextCommand.id, {
            unitId: focusDrawings[0].unitId,
            subUnitId: focusDrawings[0].subUnitId,
            drawings,
            wrapText,
        });
    }

    function handleDistToTextChange(value: Nullable<number>, direction: keyof IDistToText) {
        if (value == null) {
            return;
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

        commandService.executeCommand(UpdateDocDrawingDistanceCommand.id, {
            unitId: focusDrawings[0].unitId,
            subUnitId: focusDrawings[0].subUnitId,
            drawings,
            dist: {
                [direction]: value,
            },
        });
    }

    useEffect(() => {
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

            setWrapText(wrapText);

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
    }, [commandService, documentDataModel, drawingManagerService]);

    return {
        localeService,
        showPanel,
        wrappingStyle,
        wrapText,
        distToText,
        disableWrapText,
        disableDistTB,
        disableDistLR,
        handleWrappingStyleChange,
        handleWrapTextChange,
        handleDistToTextChange,
        MIN_MARGIN,
        MAX_MARGIN,
    };
}
