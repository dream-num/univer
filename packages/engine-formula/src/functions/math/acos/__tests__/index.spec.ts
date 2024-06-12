import { describe, expect, it } from 'vitest';
import { FUNCTION_NAMES_MATH } from '../../function-names';
import { Acos } from '../index';
import { NumberValueObject, StringValueObject, ErrorValueObject } from '../../../../engine/value-object/primitive-object';
import { ArrayValueObject, transformToValue, transformToValueObject } from '../../../../engine/value-object/array-value-object';
import { ErrorType } from '../../../../basics/error-type';

describe('Test acos function', () => {
    const acosFunction = new Acos(FUNCTION_NAMES_MATH.ACOS);

    describe('Acos', () => {
        it('should return 0 for acos(1)', () => {
            const value = NumberValueObject.create(1);
            const result = acosFunction.calculate(value);
            expect(result.getValue()).toBe(0);
        });

        it('should return 0 for acos("1")', () => {
            const value = new StringValueObject('1');
            const result = acosFunction.calculate(value);
            expect(result.getValue()).toBe(0);
        });

        it('should return approximately 1.0471975511965979 for acos(0.5)', () => {
            const value = NumberValueObject.create(0.5);
            const result = acosFunction.calculate(value);
            expect(result.getValue()).toBeCloseTo(1.0471975511965979); // Approximately 1.0471975511965979
        });
    });
});
