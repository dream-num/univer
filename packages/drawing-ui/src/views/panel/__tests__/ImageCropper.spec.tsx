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

import type { ICommandInfo } from '@univerjs/core';
import type { Root } from 'react-dom/client';
import { DrawingTypeEnum, ICommandService, LocaleService, LocaleType, Univer } from '@univerjs/core';
import { ConfigProvider } from '@univerjs/design';
import { ComponentManager, RediContext } from '@univerjs/ui';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { AutoImageCropOperation, CloseImageCropOperation, CropType } from '../../../commands/operations/image-crop.operation';
import locale from '../../../locale/en-US';
import { DrawingImageClipService } from '../../../services/drawing-image-clip.service';
import { ImageCropper } from '../ImageCropper';

describe('ImageCropper mobile', () => {
    let univer: Univer | undefined;
    let root: Root | undefined;
    let container: HTMLDivElement | undefined;

    afterEach(() => {
        act(() => root?.unmount());
        container?.remove();
        univer?.dispose();
    });

    it('selects ratios in place and starts cropping once before releasing the drawer', async () => {
        univer = new Univer();
        const injector = univer.__getInjector();
        injector.add([DrawingImageClipService]);
        injector.add([ComponentManager]);
        const localeService = injector.get(LocaleService);
        localeService.load({ [LocaleType.EN_US]: locale });
        localeService.setLocale(LocaleType.EN_US);
        const commandService = injector.get(ICommandService);
        commandService.registerCommand(AutoImageCropOperation);
        commandService.registerCommand(CloseImageCropOperation);
        const commands: ICommandInfo[] = [];
        commandService.onCommandExecuted((command) => commands.push(command));
        let cropStarts = 0;
        container = document.createElement('div');
        document.body.appendChild(container);
        root = createRoot(container);
        act(() => root?.render(
            <RediContext.Provider value={{ injector }}>
                <ConfigProvider mobile mountContainer={document.body}>
                    <ImageCropper
                        drawings={[{ unitId: 'doc', subUnitId: 'doc', drawingId: 'image', drawingType: DrawingTypeEnum.DRAWING_IMAGE }]}
                        cropperShow
                        onCropStart={() => { cropStarts++; }}
                    />
                </ConfigProvider>
            </RediContext.Provider>
        ));
        const buttons = Array.from(container.querySelectorAll('button'));
        const ratio = buttons.find((button) => button.textContent === '16:9');
        const start = buttons.find((button) => button.textContent === 'Start Crop');
        if (!ratio || !start) {
            throw new Error('Mobile crop actions are missing');
        }
        await act(async () => ratio.click());
        expect(ratio.getAttribute('aria-pressed')).toBe('true');
        expect(commands).toEqual([]);
        expect(container.querySelector('[role="combobox"]')).toBeNull();

        await act(async () => start.click());
        expect(commands).toMatchObject([{ id: AutoImageCropOperation.id, params: { cropType: CropType.R16_9 } }]);
        expect(cropStarts).toBe(1);

        await act(async () => commandService.executeCommand(CloseImageCropOperation.id));
        const square = buttons.find((button) => button.textContent === '1:1');
        if (!square) {
            throw new Error('Square crop option is missing');
        }
        await act(async () => square.click());
        expect(commands.filter((command) => command.id === AutoImageCropOperation.id)).toHaveLength(1);
        expect(square.getAttribute('aria-pressed')).toBe('true');
    });
});
