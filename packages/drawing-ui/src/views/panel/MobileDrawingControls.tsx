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

import type { IDrawingParam, Nullable } from '@univerjs/core';
import type { IChangeObserverConfig, Scene } from '@univerjs/engine-render';
import type { ComponentProps } from 'react';
import type { LocaleKey } from '../../locale/types';
import { debounce, DrawingTypeEnum, ICommandService, LocaleService } from '@univerjs/core';
import { Button, Checkbox, clsx, InputNumber, MobileSelect } from '@univerjs/design';
import { IDrawingManagerService } from '@univerjs/drawing';
import { IRenderManagerService } from '@univerjs/engine-render';
import { IconManager, useDependency, useObservable } from '@univerjs/ui';
import { useEffect, useState } from 'react';
import { filter, map, merge } from 'rxjs';
import { AlignType, SetDrawingAlignOperation } from '../../commands/operations/drawing-align.operation';
import { CancelDrawingGroupOperation, SetDrawingGroupOperation } from '../../commands/operations/drawing-group.operation';
import { MIN_DRAWING_HEIGHT_LIMIT, MIN_DRAWING_WIDTH_LIMIT, RANGE_DRAWING_ROTATION_LIMIT } from '../../utils/config';
import { getUpdateParams } from '../../utils/get-update-params';
import { resolveDrawingUIRotateEnabled } from '../../utils/rotate-enabled';
import { createDrawingTransformRotationChangeHandler, isDrawingTransformRotationDisabled } from './drawing-transform-rotation';

const INPUT_DEBOUNCE_TIME = 300;

interface IMobileDrawingTransformProps {
    transformShow: boolean;
    drawings: IDrawingParam[];
}

interface IMobileDrawingAlignProps {
    drawings: IDrawingParam[];
    alignShow: boolean;
}

interface IMobileDrawingGroupProps {
    drawings: IDrawingParam[];
    hasGroup: boolean;
}

function MobileDrawingInputNumber(props: ComponentProps<typeof InputNumber>) {
    return (
        <InputNumber
            {...props}
            controls={false}
            className={clsx('univer-h-12 univer-w-full', props.className)}
            inputClassName={clsx('[&_input]:!univer-h-12 [&_input]:!univer-text-base', props.inputClassName)}
        />
    );
}

function MobileDrawingCheckbox(props: ComponentProps<typeof Checkbox>) {
    return <Checkbox {...props} className={clsx('univer-flex univer-min-h-12 univer-items-center univer-justify-center', props.className)} />;
}

function MobileDrawingButton(props: ComponentProps<typeof Button>) {
    return (
        <Button
            {...props}
            className={clsx(`
              univer-flex univer-min-h-12 univer-flex-1 univer-items-center univer-justify-center univer-gap-2
              univer-text-base
            `, props.className)}
        />
    );
}

export function MobileDrawingTransform(props: IMobileDrawingTransformProps) {
    const renderManagerService = useDependency(IRenderManagerService);
    const drawingParam = props.drawings[0];
    const scene = drawingParam ? renderManagerService.getRenderUnitById(drawingParam.unitId)?.scene : undefined;
    const topScene = scene?.getEngine()?.activeScene as Nullable<Scene>;

    if (!drawingParam?.transform || !scene || !topScene) {
        return null;
    }

    return <MobileDrawingTransformContent {...props} />;
}

function MobileDrawingTransformContent(props: IMobileDrawingTransformProps) {
    const localeService = useDependency(LocaleService);
    const drawingManagerService = useDependency(IDrawingManagerService);
    const renderManagerService = useDependency(IRenderManagerService);
    const { drawings, transformShow } = props;
    const drawingParam = drawings[0]!;
    const transform = drawingParam.transform!;
    const { unitId, subUnitId, drawingId, drawingType } = drawingParam;
    const scene = renderManagerService.getRenderUnitById(unitId)!.scene!;
    const topScene = scene.getEngine()!.activeScene as Scene;
    const transformer = scene.getTransformerByCreate();
    const {
        width: originWidth = 0,
        height: originHeight = 0,
        left: originX = 0,
        top: originY = 0,
        angle: originRotation = 0,
    } = transform;
    const [width, setWidth] = useState<number>(originWidth);
    const [height, setHeight] = useState(originHeight);
    const [xPosition, setXPosition] = useState(originX);
    const [yPosition, setYPosition] = useState(originY);
    const [rotation, setRotation] = useState(originRotation);
    const [lockRatio, setLockRatio] = useState(transformer.keepRatio);
    const rotateEnabled = resolveDrawingUIRotateEnabled(drawingParam, {
        getChildren: (drawing) => drawingManagerService.getDrawingsByGroup(drawing),
    });
    const rotationDisabled = isDrawingTransformRotationDisabled(rotateEnabled);

    const checkMoveBoundary = (left: number, top: number, drawingWidth: number, drawingHeight: number) => {
        const { width: topSceneWidth, height: topSceneHeight } = topScene;
        const { ancestorLeft, ancestorTop } = scene;
        let limitLeft = left;
        let limitTop = top;
        let limitWidth = drawingWidth;
        let limitHeight = drawingHeight;

        if (left + ancestorLeft < 0) {
            limitLeft = -ancestorLeft;
        }
        if (top + ancestorTop < 0) {
            limitTop = -ancestorTop;
        }

        limitWidth = Math.max(topSceneWidth - limitLeft - ancestorLeft, MIN_DRAWING_WIDTH_LIMIT);
        limitHeight = Math.max(topSceneHeight - limitTop - ancestorTop, MIN_DRAWING_HEIGHT_LIMIT);

        if (left + limitWidth + ancestorLeft > topSceneWidth) {
            limitLeft = topSceneWidth - drawingWidth - ancestorLeft;
        }
        if (top + limitHeight + ancestorTop > topSceneHeight) {
            limitTop = topSceneHeight - drawingHeight - ancestorTop;
        }

        return { limitLeft, limitTop, limitWidth, limitHeight };
    };

    const syncTransform = (drawing: IDrawingParam) => {
        const nextTransform = drawing.transform;
        if (nextTransform == null) {
            return;
        }

        const { width, height, left, top, angle } = nextTransform;
        if (width != null) setWidth(width);
        if (height != null) setHeight(height);
        if (left != null) setXPosition(left);
        if (top != null) setYPosition(top);
        if (angle != null) setRotation(angle);
    };

    const changeObserver = (state: IChangeObserverConfig) => {
        const params = getUpdateParams(state.objects, drawingManagerService);
        if (params.length === 1 && params[0] != null) {
            syncTransform(params[0]);
        }
    };

    useEffect(() => {
        const subscriptions = [
            transformer.changeStart$.subscribe(changeObserver),
            transformer.changing$.subscribe(changeObserver),
            transformer.changeEnd$.subscribe(changeObserver),
            drawingManagerService.focus$.subscribe((drawings) => {
                if (drawings.length !== 1) {
                    return;
                }
                const drawing = drawingManagerService.getDrawingByParam(drawings[0]);
                if (drawing != null) {
                    syncTransform(drawing);
                }
            }),
        ];

        return () => subscriptions.forEach((subscription) => subscription.unsubscribe());
    }, []);

    const notifyTransformChange = (updateParam: IDrawingParam) => {
        drawingManagerService.featurePluginUpdateNotification([updateParam]);
        transformer.refreshControls().changeNotification();
    };

    const handleWidthChange = debounce((value: number | null) => {
        if (value == null) {
            return;
        }

        const { limitWidth, limitHeight } = checkMoveBoundary(xPosition, yPosition, value, height);
        const nextWidth = Math.min(value, limitWidth);
        const updateParam: IDrawingParam = { unitId, subUnitId, drawingId, drawingType, transform: { width: nextWidth } };

        if (lockRatio) {
            const nextHeight = Math.max((nextWidth / width) * height, MIN_DRAWING_HEIGHT_LIMIT);
            if (nextHeight > limitHeight) {
                return;
            }
            setHeight(nextHeight);
            updateParam.transform!.height = nextHeight;
        }

        setWidth(nextWidth);
        notifyTransformChange(updateParam);
    }, INPUT_DEBOUNCE_TIME);

    const handleHeightChange = debounce((value: number | null) => {
        if (value == null) {
            return;
        }

        const { limitHeight, limitWidth } = checkMoveBoundary(xPosition, yPosition, width, value);
        const nextHeight = Math.min(value, limitHeight);
        const updateParam: IDrawingParam = { unitId, subUnitId, drawingId, drawingType, transform: { height: nextHeight } };

        if (lockRatio) {
            const nextWidth = Math.max((nextHeight / height) * width, MIN_DRAWING_WIDTH_LIMIT);
            if (nextWidth > limitWidth) {
                return;
            }
            setWidth(nextWidth);
            updateParam.transform!.width = nextWidth;
        }

        setHeight(nextHeight);
        notifyTransformChange(updateParam);
    }, INPUT_DEBOUNCE_TIME);

    const handleXChange = debounce((value: number | null) => {
        if (value == null) {
            return;
        }
        const { limitLeft } = checkMoveBoundary(value, yPosition, width, height);
        setXPosition(limitLeft);
        notifyTransformChange({ unitId, subUnitId, drawingId, drawingType, transform: { left: limitLeft } });
    }, INPUT_DEBOUNCE_TIME);

    const handleYChange = debounce((value: number | null) => {
        if (value == null) {
            return;
        }
        const { limitTop } = checkMoveBoundary(xPosition, value, width, height);
        setYPosition(limitTop);
        notifyTransformChange({ unitId, subUnitId, drawingId, drawingType, transform: { top: limitTop } });
    }, INPUT_DEBOUNCE_TIME);

    const handleRotationChange = createDrawingTransformRotationChangeHandler({
        rotateEnabled,
        drawingParam: { unitId, subUnitId, drawingId, drawingType },
        setRotation,
        emitUpdate: (updateParams) => drawingManagerService.featurePluginUpdateNotification(updateParams),
        notifyChange: () => transformer.refreshControls().changeNotification(),
    });

    const handleLockRatioChange = (value: string | number | boolean) => {
        if (typeof value !== 'boolean') {
            return;
        }
        setLockRatio(value);
        transformer.keepRatio = value;
    };

    return (
        <div
            className={clsx('univer-grid univer-gap-2 univer-py-2 univer-text-gray-400', {
                'univer-hidden': !transformShow,
            })}
        >
            <header
                className="
                  univer-text-gray-600
                  dark:!univer-text-gray-200
                "
            >
                <div>{localeService.t<LocaleKey>('drawing-ui.image-panel.transform.title')}</div>
            </header>

            <div
                className="
                  univer-grid univer-grid-cols-3 univer-gap-2
                  [&>div]:univer-grid [&>div]:univer-gap-2
                "
            >
                <div>
                    <span>{localeService.t<LocaleKey>('drawing-ui.image-panel.transform.width')}</span>
                    <MobileDrawingInputNumber precision={1} value={width} min={MIN_DRAWING_WIDTH_LIMIT} onChange={handleWidthChange} />
                </div>
                <div>
                    <span>{localeService.t<LocaleKey>('drawing-ui.image-panel.transform.height')}</span>
                    <MobileDrawingInputNumber precision={1} value={height} min={MIN_DRAWING_HEIGHT_LIMIT} onChange={handleHeightChange} />
                </div>
                <div>
                    <span>{localeService.t<LocaleKey>('drawing-ui.image-panel.transform.lock')}</span>
                    <div className="univer-text-center">
                        <MobileDrawingCheckbox checked={lockRatio} onChange={handleLockRatioChange} />
                    </div>
                </div>
            </div>

            <div
                className="
                  univer-grid univer-grid-cols-3 univer-gap-2
                  [&>div]:univer-grid [&>div]:univer-gap-2
                "
            >
                <div>
                    <span>{localeService.t<LocaleKey>('drawing-ui.image-panel.transform.x')}</span>
                    <MobileDrawingInputNumber precision={1} value={xPosition} onChange={handleXChange} />
                </div>
                <div>
                    <span>{localeService.t<LocaleKey>('drawing-ui.image-panel.transform.y')}</span>
                    <MobileDrawingInputNumber precision={1} value={yPosition} onChange={handleYChange} />
                </div>
                <div>
                    <span>{localeService.t<LocaleKey>('drawing-ui.image-panel.transform.rotate')}</span>
                    <MobileDrawingInputNumber
                        precision={1}
                        value={rotation}
                        min={RANGE_DRAWING_ROTATION_LIMIT[0]}
                        max={RANGE_DRAWING_ROTATION_LIMIT[1]}
                        disabled={rotationDisabled}
                        onChange={handleRotationChange}
                    />
                </div>
            </div>
        </div>
    );
}

export function MobileDrawingAlign(props: IMobileDrawingAlignProps) {
    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);
    const { drawings, alignShow } = props;
    const [alignValue, setAlignValue] = useState<AlignType>(AlignType.default);
    const alignOptions = [
        {
            label: localeService.t<LocaleKey>('drawing-ui.image-panel.align.default'),
            value: AlignType.default,
        },
        {
            options: [
                { label: localeService.t<LocaleKey>('drawing-ui.image-panel.align.left'), value: AlignType.left },
                { label: localeService.t<LocaleKey>('drawing-ui.image-panel.align.center'), value: AlignType.center },
                { label: localeService.t<LocaleKey>('drawing-ui.image-panel.align.right'), value: AlignType.right },
            ],
        },
        {
            options: [
                { label: localeService.t<LocaleKey>('drawing-ui.image-panel.align.top'), value: AlignType.top },
                { label: localeService.t<LocaleKey>('drawing-ui.image-panel.align.middle'), value: AlignType.middle },
                { label: localeService.t<LocaleKey>('drawing-ui.image-panel.align.bottom'), value: AlignType.bottom },
            ],
        },
        {
            options: [
                { label: localeService.t<LocaleKey>('drawing-ui.image-panel.align.horizon'), value: AlignType.horizon },
                { label: localeService.t<LocaleKey>('drawing-ui.image-panel.align.vertical'), value: AlignType.vertical },
            ],
        },
    ];

    const handleAlignChange = (value: string | number | boolean) => {
        const alignType = Object.values(AlignType).find((option) => option === value);
        if (alignType == null) {
            return;
        }
        setAlignValue(alignType);
        commandService.executeCommand(SetDrawingAlignOperation.id, { alignType, drawings });
    };

    return (
        <div className={clsx('univer-relative univer-w-full', { 'univer-hidden': !alignShow })}>
            <header
                className="
                  univer-text-gray-600
                  dark:!univer-text-gray-200
                "
            >
                <div>{localeService.t<LocaleKey>('drawing-ui.image-panel.align.title')}</div>
            </header>
            <div className="univer-relative univer-mt-2.5 univer-flex univer-h-full">
                <div
                    className="
                      univer-w-full univer-text-gray-900
                      dark:!univer-text-gray-0
                    "
                >
                    <MobileSelect value={alignValue} options={alignOptions} onChange={handleAlignChange} />
                </div>
            </div>
        </div>
    );
}

export function MobileDrawingGroup(props: IMobileDrawingGroupProps) {
    const localeService = useDependency(LocaleService);
    const renderManagerService = useDependency(IRenderManagerService);
    const drawingManagerService = useDependency(IDrawingManagerService);
    const commandService = useDependency(ICommandService);
    const iconManager = useDependency(IconManager);
    const { hasGroup, drawings } = props;
    const GroupIcon = iconManager.get('GroupIcon');
    const UngroupIcon = iconManager.get('UngroupIcon');
    const drawingParam = drawings[0];
    const transformer = drawingParam
        ? renderManagerService.getRenderUnitById(drawingParam.unitId)?.scene?.getTransformerByCreate()
        : undefined;
    const groupState = useObservable(
        transformer
            ? () => merge(
                transformer.clearControl$.pipe(
                    filter((changeSelf) => changeSelf === true),
                    map(() => ({ groupShow: false, groupBtnShow: false, ungroupBtnShow: false }))
                ),
                transformer.changeStart$.pipe(map((state) => {
                    const params = getUpdateParams(state.objects, drawingManagerService);
                    const groupBtnShow = params.length > 1;
                    const ungroupBtnShow = params.some((item) => item?.drawingType === DrawingTypeEnum.DRAWING_GROUP);
                    return {
                        groupShow: groupBtnShow || ungroupBtnShow,
                        groupBtnShow,
                        ungroupBtnShow,
                    };
                }))
            )
            : null,
        { groupShow: false, groupBtnShow: true, ungroupBtnShow: true },
        false,
        [drawingManagerService, transformer]
    );
    const { groupShow, groupBtnShow, ungroupBtnShow } = groupState;

    return (
        <div
            className={clsx('univer-grid univer-gap-2 univer-py-2 univer-text-gray-400', {
                'univer-hidden': (hasGroup && !groupShow) || !hasGroup,
            })}
        >
            <header
                className="
                  univer-text-gray-600
                  dark:!univer-text-gray-200
                "
            >
                <div>{localeService.t<LocaleKey>('drawing-ui.image-panel.group.title')}</div>
            </header>
            <div className="univer-flex univer-items-center univer-justify-center univer-gap-2">
                <MobileDrawingButton
                    className={clsx({ 'univer-hidden': !groupBtnShow })}
                    onClick={() => commandService.syncExecuteCommand(SetDrawingGroupOperation.id, { drawings })}
                >
                    <GroupIcon />
                    {localeService.t<LocaleKey>('drawing-ui.image-panel.group.group')}
                </MobileDrawingButton>
                <MobileDrawingButton
                    className={clsx({ 'univer-hidden': !ungroupBtnShow })}
                    onClick={() => commandService.syncExecuteCommand(CancelDrawingGroupOperation.id, { drawings })}
                >
                    <UngroupIcon />
                    {localeService.t<LocaleKey>('drawing-ui.image-panel.group.unGroup')}
                </MobileDrawingButton>
            </div>
        </div>
    );
}
