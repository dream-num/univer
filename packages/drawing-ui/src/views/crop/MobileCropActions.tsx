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

import type { LocaleKey } from '../../locale/types';
import { ICommandService, LocaleService } from '@univerjs/core';
import { MobileActionRow } from '@univerjs/design';
import { CheckMarkIcon, CloseIcon } from '@univerjs/icons';
import { useDependency, useObservable } from '@univerjs/ui';
import { CloseImageCropOperation } from '../../commands/operations/image-crop.operation';
import { MobileImageCropperController } from '../../controllers/mobile/image-cropper.controller';

export function MobileCropActions() {
    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);
    const cropperController = useDependency(MobileImageCropperController);
    const cropping = useObservable(cropperController.cropping$, false);

    if (!cropping) {
        return null;
    }

    return (
        <div
            role="group"
            aria-label={localeService.t<LocaleKey>('drawing-ui.image-panel.crop.title')}
            className="
              univer-absolute univer-inset-x-0 univer-bottom-0 univer-z-[1200] univer-grid univer-grid-cols-2
              univer-gap-3 univer-bg-gray-0 univer-p-3 univer-pb-[max(12px,env(safe-area-inset-bottom))]
              univer-shadow-lg
              dark:!univer-bg-gray-900
            "
        >
            <MobileActionRow
                icon={<CloseIcon />}
                title={localeService.t<LocaleKey>('drawing-ui.image-panel.crop.cancel')}
                variant="subtle"
                onClick={() => commandService.executeCommand(CloseImageCropOperation.id, { isCancel: true })}
            />
            <MobileActionRow
                icon={<CheckMarkIcon />}
                title={localeService.t<LocaleKey>('drawing-ui.image-panel.crop.apply')}
                className="!univer-bg-primary-600 !univer-text-white"
                onClick={() => commandService.executeCommand(CloseImageCropOperation.id)}
            />
        </div>
    );
}
