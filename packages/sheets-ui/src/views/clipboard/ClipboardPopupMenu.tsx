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

import type { IDiscreteRange } from '../../controllers/utils/range-tools';
import type { IPasteHookKeyType } from '../../services/clipboard/type';
import { ICommandService, IUniverInstanceService, LocaleService } from '@univerjs/core';
import { Dropdown } from '@univerjs/design';
import { convertTransformToOffsetX, convertTransformToOffsetY, IRenderManagerService } from '@univerjs/engine-render';
import { CheckMarkSingle, MoreDownSingle, PasteSpecial } from '@univerjs/icons';
import { useDependency, useObservable } from '@univerjs/ui';
import { useState } from 'react';
import { SheetOptionalPasteCommand } from '../../commands/commands/clipboard.command';
import { useActiveWorkbook } from '../../components/hook';
import { getSheetObject } from '../../controllers/utils/component-tools';
import { ISheetClipboardService, PREDEFINED_HOOK_NAME } from '../../services/clipboard/clipboard.service';
import { ISheetSelectionRenderService } from '../../services/selection/base-selection-render.service';
import { SheetSkeletonManagerService } from '../../services/sheet-skeleton-manager.service';

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

    const positionEndX = convertTransformToOffsetX(endX, scaleX, scrollXY) ?? -9999;
    const positionEndY = convertTransformToOffsetY(endY, scaleY, scrollXY) ?? -9999;

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
    const showMenu = useObservable(clipboardService.showMenu$, false);
    // const clipboardController = useDependency(SheetClipboardController);
    const pasteOptionsCache = useObservable(clipboardService.pasteOptionsCache$, null);
    const localeService = useDependency(LocaleService);
    const commandService = useDependency(ICommandService);

    const [menuHovered, setMenuHovered] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);

    // const version = useObservable(clipboardController.refreshOptionalPaste$, Math.random());

    const range = pasteOptionsCache?.target.pastedRange;

    const relativePosition = useMenuPosition(range);

    if (!relativePosition || !showMenu) return null;

    if (relativePosition.positionX < 50 || relativePosition.positionY < 30) return null;

    const iconVisible = menuHovered || menuVisible;

    const handleClick = (type: string) => {
        setMenuVisible(false);
        commandService.executeCommand(SheetOptionalPasteCommand.id, { type });
    };

    return (
        <div
            className={`
              univer-absolute univer-z-[1080] univer-flex univer-cursor-pointer univer-items-center
              univer-justify-center univer-gap-2 univer-rounded univer-border univer-border-solid univer-border-gray-200
              univer-bg-white univer-p-1
              dark:univer-border-gray-700
              hover:univer-bg-gray-100
            `}
            style={{
                left: relativePosition.positionX + DEFAULT_PADDING,
                top: relativePosition.positionY + DEFAULT_PADDING,
            }}
            onMouseEnter={() => setMenuHovered(true)}
            onMouseLeave={() => setMenuHovered(false)}
        >
            <Dropdown
                align="start"
                overlay={(
                    <ul className="univer-m-0 univer-list-none univer-p-1.5">
                        {SheetPasteOptions.map((item) => {
                            const itemType = PREDEFINED_HOOK_NAME[item.value as IPasteHookKeyType];
                            const selected = pasteOptionsCache?.pasteType === itemType;
                            return (
                                <li
                                    key={item.value}
                                    className={`
                                      univer-cursor-pointer univer-rounded univer-px-2 univer-py-1.5
                                      univer-transition-colors
                                      dark:univer-border-gray-700
                                      hover:univer-bg-gray-100
                                    `}
                                    onClick={() => handleClick(item.value)}
                                >
                                    <span>
                                        {selected && (
                                            <CheckMarkSingle className="univer-absolute" style={{ color: 'rgb(var(--green-700, #409f11))' }} />
                                        )}
                                    </span>
                                    <div
                                        className={`
                                          univer-ml-5 univer-text-sm univer-text-gray-700
                                          dark:univer-text-white
                                        `}
                                    >
                                        {localeService.t(item.label)}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
                open={menuVisible}
                onOpenChange={setMenuVisible}
            >
                <div
                    className={`
                      univer-flex univer-cursor-pointer univer-content-center univer-items-center univer-rounded
                      univer-py-1
                      dark:univer-border-gray-700
                    `}
                    onClick={() => {
                        setMenuVisible(!menuVisible);
                    }}
                >
                    <PasteSpecial
                        className="univer-fill-primary-600 univer-text-gray-900"
                    />
                    {iconVisible && <MoreDownSingle />}
                </div>
            </Dropdown>
        </div>
    );
};
