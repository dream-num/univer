import { Disposable } from '@univerjs/core';
import { createIdentifier } from '@wendellhu/redi';

import { IClipboardInterfaceService } from './clipboard-interface.service';

// TODO@wzhudev: currently I have no idea if this should be moved to sheet-ui or other places. And it do not have any
// implementation yet.

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
