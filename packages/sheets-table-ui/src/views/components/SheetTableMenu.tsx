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

import type { ICanvasPopup } from '@univerjs/sheets-ui';
import { DropdownMenu } from '@univerjs/design';

export type SheetTableMenuAction = 'rename' | 'update-range' | 'set-theme' | 'delete';

export interface ISheetTableMenuExtraProps {
    anchorWidth: number;
    tableName: string;
    labels: Record<SheetTableMenuAction, string>;
    onSelect: (action: SheetTableMenuAction) => void | Promise<void>;
    onClose: () => void;
}

interface ISheetTableMenuProps {
    popup: ICanvasPopup;
}

export function SheetTableMenu({ popup }: ISheetTableMenuProps) {
    const menu = popup.extraProps as unknown as ISheetTableMenuExtraProps | undefined;

    if (!menu) {
        return null;
    }

    return (
        <DropdownMenu
            align="start"
            className="univer-min-w-40"
            items={[
                { type: 'item', children: menu.labels.rename, onSelect: () => menu.onSelect('rename') },
                { type: 'item', children: menu.labels['update-range'], onSelect: () => menu.onSelect('update-range') },
                { type: 'item', children: menu.labels['set-theme'], onSelect: () => menu.onSelect('set-theme') },
                { type: 'item', children: menu.labels.delete, variant: 'destructive', onSelect: () => menu.onSelect('delete') },
            ]}
            open
            sideOffset={0}
            onOpenChange={(open) => {
                if (!open) {
                    menu.onClose();
                }
            }}
        >
            <button
                type="button"
                aria-label={menu.tableName}
                className="univer-block univer-h-px univer-opacity-0"
                style={{ width: menu.anchorWidth }}
                tabIndex={-1}
            />
        </DropdownMenu>
    );
}
