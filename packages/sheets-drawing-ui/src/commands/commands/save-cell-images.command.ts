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

import type { ICommand } from '@univerjs/core';
import { CommandType, LocaleService } from '@univerjs/core';
import { IDialogService } from '@univerjs/ui';
import { IBatchSaveImagesService } from '../../services/batch-save-images.service';
import { BATCH_SAVE_IMAGES_DIALOG_ID } from '../../views/batch-save-images/component-name';

export const SaveCellImagesCommand: ICommand = {
    id: 'sheet.command.save-cell-images',
    type: CommandType.COMMAND,
    handler: async (accessor) => {
        const dialogService = accessor.get(IDialogService);
        const batchSaveService = accessor.get(IBatchSaveImagesService);

        const images = batchSaveService.getCellImagesInSelection();

        // If only one image, download directly without dialog
        if (images.length === 1) {
            try {
                await batchSaveService.downloadSingleImage(images[0]);
                return true;
            } catch (error) {
                console.error('Failed to download image:', error);
                return false;
            }
        }

        // Multiple images: open batch save dialog
        const localeService = accessor.get(LocaleService);
        const selectionRange = batchSaveService.getSelectionRangeNotation();
        const titleText = `${localeService.t('sheetImage.save.title')} (${selectionRange})`;

        dialogService.open({
            id: BATCH_SAVE_IMAGES_DIALOG_ID,
            draggable: true,
            width: 360,
            title: { title: titleText },
            children: {
                label: BATCH_SAVE_IMAGES_DIALOG_ID,
            },
            destroyOnClose: true,
            preservePositionOnDestroy: true,
            onClose: () => dialogService.close(BATCH_SAVE_IMAGES_DIALOG_ID),
        });

        return true;
    },
};
