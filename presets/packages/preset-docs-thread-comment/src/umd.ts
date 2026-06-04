import type { IPreset } from './types';
import { UniverDocsThreadCommentUIPlugin } from '@univerjs/docs-thread-comment-ui';
import { UniverThreadCommentUIPlugin } from '@univerjs/thread-comment-ui';


export interface IUniverDocsThreadCommentPresetConfig {
}

/**
 * This preset add thread comment features into your application.
 *
 * @param {Partial<IUniverDocsThreadCommentPresetConfig>} config - The configuration object.
 */
export function UniverDocsThreadCommentPreset(_config: Partial<IUniverDocsThreadCommentPresetConfig> = {}): IPreset {
    const plugins: IPreset['plugins'] = [
        UniverThreadCommentUIPlugin,
        UniverDocsThreadCommentUIPlugin,
    ];

    return { plugins };
}
