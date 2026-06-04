import type { IPreset } from './types';

import { IImageIoService } from '@univerjs/core';
import { UniverDocsDrawingPlugin } from '@univerjs/docs-drawing';
import { UniverDocsDrawingUIPlugin } from '@univerjs/docs-drawing-ui';
import { UniverDrawingPlugin } from '@univerjs/drawing';
import { UniverDrawingUIPlugin } from '@univerjs/drawing-ui';


export interface IUniverDocsDrawingPresetConfig {
    collaboration?: boolean;
}

export function UniverDocsDrawingPreset(config: Partial<IUniverDocsDrawingPresetConfig> = {}): IPreset {
    const { collaboration = false } = config;

    return {
        plugins: [
            [UniverDrawingPlugin, { override: collaboration ? [[IImageIoService, null]] : [] }],
            UniverDrawingUIPlugin,
            UniverDocsDrawingPlugin,
            UniverDocsDrawingUIPlugin,
        ].filter(v => !!v) as IPreset['plugins'],
    };
};
