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

import type {
    DocumentDataModel,
    ICommandInfo,
    IDrawingParam,
    IObjectPositionH,
    IObjectPositionV,
} from '@univerjs/core';
import type { IUpdateDrawingDocTransformCommandParams } from '@univerjs/docs-drawing';
import type { LocaleKey } from '../../locale/types';
import type { IDocDrawingPositionProps } from './DocDrawingPosition';
import {
    DocumentFlavor,
    ICommandService,
    IUniverInstanceService,
    LocaleService,
    ObjectRelativeFromH,
    ObjectRelativeFromV,
    PositionedObjectLayoutType,
    UniverInstanceType,
} from '@univerjs/core';
import { DocSkeletonManagerService, RichTextEditingMutation } from '@univerjs/docs';
import { findDocDrawing, UpdateDrawingDocTransformCommand } from '@univerjs/docs-drawing';
import { DocSelectionRenderService } from '@univerjs/docs-ui';
import { IDrawingManagerService } from '@univerjs/drawing';
import { IRenderManagerService } from '@univerjs/engine-render';
import { useDependency } from '@univerjs/ui';
import { useEffect, useState } from 'react';
import {
    findDrawingAnchor,
    getDrawingWrappingPosition,
    resolveDrawingWrappingPosition,
} from '../../utils/drawing-wrapping-position';

const MIN_OFFSET = -1000;
const MAX_OFFSET = 1000;

export function useDocDrawingPosition(props: IDocDrawingPositionProps) {
    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);
    const drawingManagerService = useDependency(IDrawingManagerService);
    const renderManagerService = useDependency(IRenderManagerService);
    const univerInstanceService = useDependency(IUniverInstanceService);

    const { drawings } = props;

    const drawingParam = drawings[0];

    const { unitId } = drawingParam;

    const documentDataModel = univerInstanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC);

    const documentFlavor = documentDataModel?.getSnapshot().documentStyle.documentFlavor;

    const renderObject = renderManagerService.getRenderUnitById(unitId);
    const scene = renderObject!.scene!;
    const transformer = scene.getTransformerByCreate();

    const HORIZONTAL_RELATIVE_FROM = [{
        label: localeService.t<LocaleKey>('docs-drawing-ui.image-position.column'),
        value: String(ObjectRelativeFromH.COLUMN),
    }, {
        label: localeService.t<LocaleKey>('docs-drawing-ui.image-position.page'),
        value: String(ObjectRelativeFromH.PAGE),
    }, {
        label: localeService.t<LocaleKey>('docs-drawing-ui.image-position.margin'),
        value: String(ObjectRelativeFromH.MARGIN),
    }];

    const VERTICAL_RELATIVE_FROM = [{
        label: localeService.t<LocaleKey>('docs-drawing-ui.image-position.line'),
        value: String(ObjectRelativeFromV.LINE),
        disabled: documentFlavor === DocumentFlavor.MODERN,
    }, {
        label: localeService.t<LocaleKey>('docs-drawing-ui.image-position.page'),
        value: String(ObjectRelativeFromV.PAGE),
        disabled: documentFlavor === DocumentFlavor.MODERN,
    }, {
        label: localeService.t<LocaleKey>('docs-drawing-ui.image-position.margin'),
        value: String(ObjectRelativeFromV.MARGIN),
        disabled: documentFlavor === DocumentFlavor.MODERN,
    }, {
        label: localeService.t<LocaleKey>('docs-drawing-ui.image-position.paragraph'),
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
        value: IObjectPositionH | IObjectPositionV,
        positionH?: IObjectPositionH
    ) {
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

        commandService.executeCommand<IUpdateDrawingDocTransformCommandParams>(UpdateDrawingDocTransformCommand.id, {
            unitId: focusDrawings[0].unitId,
            subUnitId: focusDrawings[0].subUnitId,
            drawings: drawings.flatMap((drawing) => [{
                drawingId: drawing.drawingId,
                key: direction,
                value,
            }, ...(positionH ? [{ drawingId: drawing.drawingId, key: 'positionH' as const, value: positionH }] : [])]),
        });

        const docSelectionRenderService = renderManagerService.getRenderUnitById(unitId)?.with(DocSelectionRenderService);

        if (docSelectionRenderService) {
            docSelectionRenderService.blur();
        }

        transformer.refreshControls();
    }

    function getFocusedDrawingAnchor() {
        const drawing = drawingManagerService.getFocusDrawings()[0];
        if (!drawing) {
            return null;
        }
        const manager = renderManagerService.getRenderUnitById(drawing.unitId)?.with(DocSkeletonManagerService);
        const skeleton = manager?.getSkeleton().getSkeletonData();
        const viewModel = manager?.getViewModel();
        const snapshot = documentDataModel?.getSnapshot();
        return skeleton && viewModel
            ? findDrawingAnchor(drawing.unitId, drawing.drawingId, skeleton, viewModel.getEditArea(), snapshot && findDocDrawing(snapshot, drawing.drawingId)?.drawing)
            : null;
    }

    function handleHorizontalRelativeFromChange(value: string) {
        const relativeFrom = [ObjectRelativeFromH.COLUMN, ObjectRelativeFromH.PAGE, ObjectRelativeFromH.MARGIN]
            .find((reference) => String(reference) === value);
        if (relativeFrom == null) {
            return;
        }
        if (hPosition.relativeFrom === relativeFrom) {
            return;
        }
        const anchor = getFocusedDrawingAnchor();
        if (!anchor) {
            return;
        }
        const position = getDrawingWrappingPosition(anchor, anchor.skeDrawing.drawingOrigin.layoutType, relativeFrom);
        handlePositionChange('positionH', position.positionH);
    }

    function handleVerticalRelativeFromChange(value: string) {
        const relativeFrom = [ObjectRelativeFromV.LINE, ObjectRelativeFromV.PAGE, ObjectRelativeFromV.MARGIN, ObjectRelativeFromV.PARAGRAPH]
            .find((reference) => String(reference) === value);
        if (relativeFrom == null) {
            return;
        }
        if (vPosition.relativeFrom === relativeFrom) {
            return;
        }
        const anchor = getFocusedDrawingAnchor();
        if (!anchor) {
            return;
        }
        const initialPosition = getDrawingWrappingPosition(anchor, anchor.skeDrawing.drawingOrigin.layoutType, undefined, relativeFrom);
        const position = documentDataModel
            ? resolveDrawingWrappingPosition(anchor, initialPosition, documentDataModel.getSnapshot(), localeService, renderObject!.with(DocSkeletonManagerService).getViewModel().getEditArea())
            : initialPosition;
        if (!position) {
            return;
        }
        handlePositionChange('positionV', position.positionV, position.positionH);
    }

    function handleFollowTextMoveCheck(val: string | number | boolean) {
        handleVerticalRelativeFromChange(val ? String(ObjectRelativeFromV.PARAGRAPH) : String(ObjectRelativeFromV.PAGE));
    }

    useEffect(() => {
        function updateState(drawingParam: IDrawingParam) {
            const snapshot = documentDataModel?.getSnapshot();
            const drawing = snapshot && findDocDrawing(snapshot, drawingParam.drawingId)?.drawing;
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
    }, [commandService, documentDataModel, drawingManagerService]);

    return {
        localeService,
        showPanel,
        disabled,
        hPosition,
        vPosition,
        followTextMove,
        documentFlavor,
        HORIZONTAL_RELATIVE_FROM,
        VERTICAL_RELATIVE_FROM,
        handlePositionChange,
        handleHorizontalRelativeFromChange,
        handleVerticalRelativeFromChange,
        handleFollowTextMoveCheck,
        MIN_OFFSET,
        MAX_OFFSET,
    };
}
