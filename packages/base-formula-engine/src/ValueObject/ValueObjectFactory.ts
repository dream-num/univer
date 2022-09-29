import { BooleanValue } from '../Basics/Common';
import { ErrorType } from '../Basics/ErrorType';
import { $ARRAY_VALUE_REGEX } from '../Basics/Regex';
import { ErrorValueObject } from '../OtherObject/ErrorValueObject';
import { BooleanValueObject } from './BooleanValueObject';
import { NumberValueObject } from './NumberValueObject';
import { StringValueObject } from './StringValueObject';

export class ValueObjectFactory {
    static create(rawValue: string | number | boolean) {
        if (typeof rawValue === 'boolean') {
            return new BooleanValueObject(rawValue, true);
        } else if (typeof rawValue === 'string') {
            const rawValueUpper = rawValue.toLocaleUpperCase();
            if (rawValueUpper === BooleanValue.TRUE || rawValueUpper === BooleanValue.FALSE) {
                return new BooleanValueObject(rawValueUpper);
            } else if (!isNaN(Number(rawValue))) {
                return new NumberValueObject(rawValue);
            } else if ($ARRAY_VALUE_REGEX.test(rawValue)) {
                return new StringValueObject(rawValue);
            } else {
                return new StringValueObject(rawValue);
            }
        } else if (typeof rawValue === 'number') {
            return new NumberValueObject(rawValue, true);
        }
        return ErrorValueObject.create(ErrorType.NA);
    }
}
