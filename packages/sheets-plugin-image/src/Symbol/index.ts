import { createIdentifier } from '@wendellhu/redi';
import { IOverGridImageProperty } from '../Basics';

export const IImagePluginData = createIdentifier<Map<string, IOverGridImageProperty>>('image-plugin-data');
