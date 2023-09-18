import { Disposable } from '@univerjs/core';
import { createIdentifier } from '@wendellhu/redi';

import { IClipboardInterfaceService } from './clipboard-interface.service';

/**
 * This interface provides an interface for features to hook in copy paste feature.
 */
export interface IClipboardService {}

export const IClipboardService = createIdentifier<IClipboardService>('univer.clipboard-service');

export class DesktopClipboardService extends Disposable implements IClipboardService {
    constructor(@IClipboardInterfaceService private readonly _clipboardInterfaceService: IClipboardInterfaceService) {
        super();
    }
}
