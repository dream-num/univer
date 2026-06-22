import { describe, it } from 'vitest';
import { expectCalculationResultMatchesSnapshot } from '../__testing__/util';

describe('Test formula correctness', () => {
    it('basic sum', async () => {
        await expectCalculationResultMatchesSnapshot();
    });
});
