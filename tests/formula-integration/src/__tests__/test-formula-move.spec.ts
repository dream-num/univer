import { describe, it } from 'vitest';
import {
    expectMoveFormulaCellResultMatchesSnapshot,
    expectMoveFormulaRowsResultMatchesSnapshot,
    expectMoveFormulaSiRowsResultMatchesSnapshot,
} from '../__testing__/test-formula-move';

describe('Test formula move', () => {
    it('move formula rows', async () => {
        await expectMoveFormulaRowsResultMatchesSnapshot();
    });

    it('move formula si rows', async () => {
        await expectMoveFormulaSiRowsResultMatchesSnapshot();
    });

    it('move formula cell', async () => {
        await expectMoveFormulaCellResultMatchesSnapshot();
    });
});
