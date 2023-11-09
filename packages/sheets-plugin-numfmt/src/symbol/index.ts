import { createIdentifier } from '@wendellhu/redi';

import { NumfmtModel } from '../model/numfmt-model';

export const INumfmtPluginData = createIdentifier<NumfmtModel>('numfmt-plugin-data');
