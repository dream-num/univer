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

import type { ICommandInfo } from '@univerjs/core';
import type { IDiscreteRange } from '../../controllers/utils/range-tools';
import type { IPasteHookKeyType } from '../../services/clipboard/type';
import { ICommandService, IUniverInstanceService, LocaleService, toDisposable, useDependency, useObservable } from '@univerjs/core';
import { DropdownOverlay, DropdownProvider, DropdownTrigger } from '@univerjs/design';
import { IRenderManagerService } from '@univerjs/engine-render';
import { CheckMarkSingle, MoreDownSingle, PasteSpecial } from '@univerjs/icons';
import clsx from 'clsx';
import React, { useCallback, useEffect, useState } from 'react';
import { SheetOptionalPasteCommand } from '../../commands/commands/clipboard.command';
import { SetScrollOperation } from '../../commands/operations/scroll.operation';
import { useActiveWorkbook, useSheetSkeleton } from '../../components/hook';
import { getSheetObject } from '../../controllers/utils/component-tools';
import { ISheetClipboardService, PREDEFINED_HOOK_NAME } from '../../services/clipboard/clipboard.service';
import { ISheetSelectionRenderService } from '../../services/selection/base-selection-render.service';
import { SheetSkeletonManagerService } from '../../services/sheet-skeleton-manager.service';
import styles from './index.module.less';

const DEFAULT_PADDING = 2;

const SheetPasteOptions = [
    { value: 'DEFAULT_PASTE', label: 'rightClick.paste' },
    { value: 'SPECIAL_PASTE_VALUE', label: 'rightClick.pasteValue' },
    { value: 'SPECIAL_PASTE_FORMAT', label: 'rightClick.pasteFormat' },
    { value: 'SPECIAL_PASTE_COL_WIDTH', label: 'rightClick.pasteColWidth' },
    { value: 'SPECIAL_PASTE_BESIDES_BORDER', label: 'rightClick.pasteBesidesBorder' },
    { value: 'SPECIAL_PASTE_FORMULA', label: 'formula.operation.pasteFormula' },
];

const useMenuPosition = (range?: IDiscreteRange) => {
    const univerInstanceService = useDependency(IUniverInstanceService);
    const renderManagerService = useDependency(IRenderManagerService);

    const workbook = useActiveWorkbook();
    if (!range || !workbook) return null;

    const anchor = {
        startRow: range.rows[0],
        startCol: range.cols[0],
        endRow: range.rows[range.rows.length - 1],
        endCol: range.cols[range.cols.length - 1],
    };

    if (anchor.endRow < 0 || anchor.endCol < 0) {
        return null;
    }

    const ru = renderManagerService.getRenderById(workbook.getUnitId());
    const sheetSkeletonManagerService = ru?.with(SheetSkeletonManagerService);
    const selectionRenderService = ru?.with(ISheetSelectionRenderService);

    const sheetObject = getSheetObject(univerInstanceService, renderManagerService);
    if (!sheetObject || !selectionRenderService) return null;

    const { scene } = sheetObject;
    const skeleton = sheetSkeletonManagerService?.getCurrentSkeleton();
    const viewport = selectionRenderService.getViewPort();
    const scaleX = scene?.scaleX;
    const scaleY = scene?.scaleY;
    const scrollXY = scene?.getViewportScrollXY(viewport);
    const canvas = scene.getEngine()?.getCanvas();
    if (!scaleX || !scene || !scaleX || !scaleY || !scrollXY) return null;

    const endPosition = skeleton?.getNoMergeCellPositionByIndex(anchor.endRow, anchor.endCol);
    const endX = endPosition?.endX ?? 0;
    const endY = endPosition?.endY ?? 0;

    const positionEndX = skeleton?.convertTransformToOffsetX(endX, scaleX, scrollXY) ?? -9999;
    const positionEndY = skeleton?.convertTransformToOffsetY(endY, scaleY, scrollXY) ?? -9999;

    const canvasWidth = canvas?.getWidth();
    const canvasHeight = canvas?.getHeight();

    if (!canvasWidth || !canvasHeight) return null;

    const XInSideView = positionEndX + 50 <= canvasWidth;
    const YInSideView = positionEndY + 50 <= canvasHeight;

    let positionX = positionEndX;
    let positionY = positionEndY;

    if (!XInSideView) {
        positionX = canvasWidth - 100;
    }

    if (!YInSideView) {
        positionY = canvasHeight - 100;
    }

    return {
        positionX,
        positionY,
    };
};

export const ClipboardPopupMenu = () => {
    const clipboardService = useDependency(ISheetClipboardService);
    const showMenu = useObservable(clipboardService.showMenu$, true);
    const pasteOptionsCache = useObservable(clipboardService.pasteOptionsCache$, null);
    const renderManagerService = useDependency(IRenderManagerService);
    const localeService = useDependency(LocaleService);
    const commandService = useDependency(ICommandService);

    const [menuHovered, setMenuHovered] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);

    const [_, setVersion] = useState(Math.random());

    const range = pasteOptionsCache?.target.pastedRange;

    const relativePosition = useMenuPosition(range);

    const sheetSkeletonManagerService = useSheetSkeleton();

    useEffect(() => {
        if (!showMenu) {
            setMenuHovered(false);
            setMenuVisible(false);
        }
    }, [showMenu]);

    const forceUpdate = useCallback(() => setVersion(Math.random()), []);

    useEffect(() => {
        const disposable = sheetSkeletonManagerService && toDisposable(
            sheetSkeletonManagerService.currentSkeleton$.subscribe((skeleton) => {
                if (skeleton) {
                    forceUpdate();
                }
            }));
        return disposable?.dispose;
    }, [sheetSkeletonManagerService, forceUpdate]);

    useEffect(() => {
        const disposable = commandService.onCommandExecuted((command: ICommandInfo) => {
            if (command.id === SetScrollOperation.id) {
                forceUpdate();
            }
        });
        return disposable.dispose;
    }, [forceUpdate, commandService]);

    if (!relativePosition || !showMenu) return null;

    if (relativePosition.positionX < 50 || relativePosition.positionY < 30) return null;

    const iconVisible = menuHovered || menuVisible;

    const handleClick = (type: string) => {
        commandService.executeCommand(SheetOptionalPasteCommand.id, { type });
    };

    return (
        <div
            className={styles.sheetPasteOptionsWrapper}
            style={{
                left: relativePosition.positionX + DEFAULT_PADDING,
                top: relativePosition.positionY + DEFAULT_PADDING,
            }}
            onMouseEnter={() => setMenuHovered(true)}
            onMouseLeave={() => setMenuHovered(false)}
        >
            <DropdownProvider>
                <DropdownTrigger>
                    <div
                        className={styles.sheetPasteOptionsIconWrapper}
                        onClick={() => {
                            setMenuVisible(!menuVisible);
                        }}
                    >
                        <PasteSpecial
                            style={{ color: '#35322B' }}
                            extend={{ colorChannel1: 'rgb(var(--green-700))' }}
                        />
                        {iconVisible && <MoreDownSingle />}
                    </div>
                </DropdownTrigger>
                <DropdownOverlay className={clsx(styles.sheetPasteOptionsMenu, `
                  univer-border univer-border-gray-200 univer-border-solid
                `)}
                >
                    <ul>
                        {SheetPasteOptions.map((item) => {
                            const itemType = PREDEFINED_HOOK_NAME[item.value as IPasteHookKeyType];
                            const selected = pasteOptionsCache?.pasteType === itemType;
                            return (
                                <li
                                    key={item.value}
                                    onClick={() => handleClick(item.value)}
                                    className={clsx(styles.sheetPasteOptionsMenuItem, 'hover:univer-bg-neutral-100')}
                                >
                                    <span>
                                        {selected && (
                                            <CheckMarkSingle className={styles.sheetPasteOptionsMenuItemIcon} style={{ color: 'rgb(var(--green-700, #409f11))' }} />
                                        )}
                                    </span>
                                    <div className={clsx(styles.sheetPasteOptionsMenuItemTitle, 'univer-text-gray-700')}>{localeService.t(item.label)}</div>
                                </li>
                            );
                        })}
                    </ul>
                </DropdownOverlay>
            </DropdownProvider>
        </div>
    );
};

