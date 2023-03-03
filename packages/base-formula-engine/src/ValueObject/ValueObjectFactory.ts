import { BooleanValue } from '../Basics/Common';
import { ErrorType } from '../Basics/ErrorType';
import { $ARRAY_VALUE_REGEX } from '../Basics/Regex';
import { ErrorValueObject } from '../OtherObject/ErrorValueObject';
import { ArrayValueObject } from './ArrayValueObject';
import { BooleanValueObject } from './BooleanValueObject';
import { NumberValueObject } from './NumberValueObject';
import { StringValueObject } from './StringValueObject';

export class ValueObjectFactory {
    static create(rawValue: string | number | boolean) {
        if (typeof rawValue === 'boolean') {
            return new BooleanValueObject(rawValue, true);
        }
        if (typeof rawValue === 'string') {
            const rawValueUpper = rawValue.toLocaleUpperCase();
            if (rawValueUpper === BooleanValue.TRUE || rawValueUpper === BooleanValue.FALSE) {
                return new BooleanValueObject(rawValueUpper);
            }
            if (!isNaN(Number(rawValue))) {
                return new NumberValueObject(rawValue);
            }
            if ($ARRAY_VALUE_REGEX.test(rawValue)) {
                return new ArrayValueObject(rawValue);
            }
            return new StringValueObject(rawValue);
        }
        if (typeof rawValue === 'number') {
            return new NumberValueObject(rawValue, true);
        }
        return ErrorValueObject.create(ErrorType.NA);
    }
}
