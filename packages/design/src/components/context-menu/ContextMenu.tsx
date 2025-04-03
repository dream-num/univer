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

import React from 'react';
import {
    CopyIcon,
    CutIcon,
    DeleteIcon,
    DividerIcon,
    H1Icon,
    H2Icon,
    H3Icon,
    H4Icon,
    H5Icon,
    OrderedListIcon,
    TableIcon,
    TextIcon,
    UnorderedListIcon,
} from './icons';

interface ContextMenuProps {
    onClose?: () => void;
    onCopy?: () => void;
    onCut?: () => void;
    onDelete?: () => void;
    onInsertBulletedList?: () => void;
    onInsertNumberedList?: () => void;
    onInsertTable?: () => void;
    onInsertSheetChart?: () => void;
    onInsertDivider?: () => void;
    onHeadingChange?: (level: 1 | 2 | 3 | 4 | 5 | 'text') => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
    onClose,
    onCopy,
    onCut,
    onDelete,
    onInsertBulletedList,
    onInsertNumberedList,
    onInsertTable,
    onInsertSheetChart,
    onInsertDivider,
    onHeadingChange,
}) => {
    return (
        <div
            className={`
              univer-rounded-xl univer-border univer-border-[#E3E5EA] univer-bg-white univer-p-1
              univer-shadow-[0px_2px_6px_-1px_rgba(30,40,77,0.1),0px_1px_6px_-2px_rgba(30,40,77,0.08)]
            `}
        >
            {/* Heading Section */}
            <div className="univer-flex univer-flex-wrap univer-gap-2.5 univer-p-1">
                <div
                    onClick={() => onHeadingChange?.(1)}
                    className={`
                      univer-flex univer-h-6 univer-w-6 univer-items-center univer-justify-center univer-rounded-md
                      hover:univer-bg-[#EEEFF1]
                    `}
                >
                    <H1Icon className="univer-h-4 univer-w-4 univer-text-[#181C2A]" />
                </div>
                <div
                    onClick={() => onHeadingChange?.(2)}
                    className={`
                      univer-flex univer-h-6 univer-w-6 univer-items-center univer-justify-center univer-rounded-md
                      hover:univer-bg-[#EEEFF1]
                    `}
                >
                    <H2Icon className="univer-h-4 univer-w-4 univer-text-[#181C2A]" />
                </div>
                <div
                    onClick={() => onHeadingChange?.(3)}
                    className={`
                      univer-flex univer-h-6 univer-w-6 univer-items-center univer-justify-center univer-rounded-md
                      hover:univer-bg-[#EEEFF1]
                    `}
                >
                    <H3Icon className="univer-h-4 univer-w-4 univer-text-[#181C2A]" />
                </div>
                <div
                    onClick={() => onHeadingChange?.(4)}
                    className={`
                      univer-flex univer-h-6 univer-w-6 univer-items-center univer-justify-center univer-rounded-md
                      hover:univer-bg-[#EEEFF1]
                    `}
                >
                    <H4Icon className="univer-h-4 univer-w-4 univer-text-[#181C2A]" />
                </div>
                <div
                    onClick={() => onHeadingChange?.(5)}
                    className={`
                      univer-flex univer-h-6 univer-w-6 univer-items-center univer-justify-center univer-rounded-md
                      hover:univer-bg-[#EEEFF1]
                    `}
                >
                    <H5Icon className="univer-h-4 univer-w-4 univer-text-[#181C2A]" />
                </div>
                <div
                    onClick={() => onHeadingChange?.('text')}
                    className={`
                      univer-flex univer-h-6 univer-w-6 univer-items-center univer-justify-center univer-rounded-md
                      hover:univer-bg-[#EEEFF1]
                    `}
                >
                    <TextIcon className="univer-h-4 univer-w-4 univer-text-[#181C2A]" />
                </div>
                <div
                    onClick={() => onHeadingChange?.(5)}
                    className={`
                      univer-flex univer-h-6 univer-w-6 univer-items-center univer-justify-center univer-rounded-md
                      hover:univer-bg-[#EEEFF1]
                    `}
                >
                    <H5Icon className="univer-h-4 univer-w-4 univer-text-[#181C2A]" />
                </div>
                <div
                    onClick={() => onHeadingChange?.('text')}
                    className={`
                      univer-flex univer-h-6 univer-w-6 univer-items-center univer-justify-center univer-rounded-md
                      hover:univer-bg-[#EEEFF1]
                    `}
                >
                    <TextIcon className="univer-h-4 univer-w-4 univer-text-[#181C2A]" />
                </div>
            </div>

            {/* Separator */}
            <div className="univer-px-2">
                <div className="univer-h-px univer-bg-[#E3E5EA]" />
            </div>

            {/* Edit Actions */}
            <div className="univer-flex univer-flex-col univer-gap-1 univer-py-1">
                <div
                    onClick={onCopy}
                    className={`
                      univer-flex univer-items-center univer-gap-2 univer-rounded-lg univer-px-2 univer-py-1.5
                      hover:univer-bg-[#F8F9FA]
                    `}
                >
                    <CopyIcon className="univer-h-4 univer-w-4 univer-text-[#5F6574]" />
                    <span className="univer-text-sm univer-text-[#181C2A]">Copy</span>
                </div>
                <div
                    onClick={onCut}
                    className={`
                      univer-flex univer-items-center univer-gap-2 univer-rounded-lg univer-px-2 univer-py-1.5
                      hover:univer-bg-[#F8F9FA]
                    `}
                >
                    <CutIcon className="univer-h-4 univer-w-4 univer-text-[#5F6574]" />
                    <span className="univer-text-sm univer-text-[#181C2A]">Cut</span>
                </div>
                <div
                    onClick={onDelete}
                    className={`
                      univer-flex univer-items-center univer-gap-2 univer-rounded-lg univer-px-2 univer-py-1.5
                      hover:univer-bg-[#F8F9FA]
                    `}
                >
                    <DeleteIcon className="univer-h-4 univer-w-4 univer-text-[#5F6574]" />
                    <span className="univer-text-sm univer-text-[#181C2A]">Delete</span>
                </div>
            </div>

            {/* Separator */}
            <div className="univer-px-2">
                <div className="univer-h-px univer-bg-[#E3E5EA]" />
            </div>

            {/* Insert Section */}
            <div className="univer-flex univer-flex-col univer-gap-1 univer-py-1">
                <div className="univer-px-2 univer-pt-1.5">
                    <span className="univer-text-xs univer-font-semibold univer-text-[#979DAC]">Insert below</span>
                </div>
                <div
                    onClick={onInsertBulletedList}
                    className={`
                      univer-flex univer-items-center univer-gap-2 univer-rounded-lg univer-px-2 univer-py-1.5
                      hover:univer-bg-[#F8F9FA]
                    `}
                >
                    <UnorderedListIcon className="univer-h-4 univer-w-4 univer-text-[#5F6574]" />
                    <span className="univer-text-sm univer-text-[#181C2A]">Bulleted list</span>
                </div>
                <div
                    onClick={onInsertNumberedList}
                    className={`
                      univer-flex univer-items-center univer-gap-2 univer-rounded-lg univer-px-2 univer-py-1.5
                      hover:univer-bg-[#F8F9FA]
                    `}
                >
                    <OrderedListIcon className="univer-h-4 univer-w-4 univer-text-[#5F6574]" />
                    <span className="univer-text-sm univer-text-[#181C2A]">Numbered list</span>
                </div>
                <div
                    onClick={onInsertTable}
                    className={`
                      univer-flex univer-items-center univer-gap-2 univer-rounded-lg univer-px-2 univer-py-1.5
                      hover:univer-bg-[#F8F9FA]
                    `}
                >
                    <TableIcon className="univer-h-4 univer-w-4 univer-text-[#5F6574]" />
                    <span className="univer-text-sm univer-text-[#181C2A]">Table</span>
                </div>
                <div
                    onClick={onInsertSheetChart}
                    className={`
                      univer-flex univer-items-center univer-gap-2 univer-rounded-lg univer-px-2 univer-py-1.5
                      hover:univer-bg-[#F8F9FA]
                    `}
                >
                    <TableIcon className="univer-h-4 univer-w-4 univer-text-[#5F6574]" />
                    <span className="univer-text-sm univer-text-[#181C2A]">Sheet + Chart</span>
                </div>
                <div
                    onClick={onInsertDivider}
                    className={`
                      univer-flex univer-items-center univer-gap-2 univer-rounded-lg univer-px-2 univer-py-1.5
                      hover:univer-bg-[#F8F9FA]
                    `}
                >
                    <DividerIcon className="univer-h-4 univer-w-4 univer-text-[#5F6574]" />
                    <span className="univer-text-sm univer-text-[#181C2A]">Divider</span>
                </div>
            </div>
        </div>
    );
};
