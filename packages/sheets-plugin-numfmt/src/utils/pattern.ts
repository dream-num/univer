import numfmt from '@univerjs/base-numfmt-engine';

import { FormatType } from '../base/types';

export const getPatternType = (pattern: string): FormatType => numfmt.getInfo(pattern).type || 'unknown';
