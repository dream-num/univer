import { createIdentifier } from '@wendellhu/redi';

import { NumfmtModel } from '../Model/NumfmtModel';

export const INumfmtPluginData = createIdentifier<NumfmtModel>('numfmt-plugin-data');
