import type { IPreset } from './types';
import { UniverSheetsThreadCommentPlugin } from '@univerjs/sheets-thread-comment';
import { UniverSheetsThreadCommentUIPlugin } from '@univerjs/sheets-thread-comment-ui';
import { UniverThreadCommentUIPlugin } from '@univerjs/thread-comment-ui';

import '@univerjs/sheets-thread-comment/facade';

export type * from '@univerjs/sheets-thread-comment/facade';

export interface IUniverSheetsThreadCommentPresetConfig {
}

/**
 * This preset add thread comment features into your application.
 *
 * @param {Partial<IUniverSheetsThreadCommentPresetConfig>} config - The configuration object.
 */
export function UniverSheetsThreadCommentPreset(_config: Partial<IUniverSheetsThreadCommentPresetConfig> = {}): IPreset {
    const plugins: IPreset['plugins'] = [
        UniverThreadCommentUIPlugin,
        UniverSheetsThreadCommentPlugin,
        UniverSheetsThreadCommentUIPlugin,
    ];

    return { plugins };
}
