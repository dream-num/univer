import { Tools } from '../Tools';
import { Sequence } from './Sequence';

type SerializerNewInstanceType = { newInstance: (sequence: Sequence) => Serializer };

export abstract class Serializer {
    static fromSequence<T extends Serializer>(sequence: Sequence[]): T[];
    static fromSequence<T extends Serializer>(sequence: Sequence): T;
    static fromSequence<T extends Serializer>(
        sequence: Sequence | Sequence[]
    ): T | T[] {
        if (Tools.isObject<Sequence>(sequence)) {
            if (Serializer.requiredNewInstance(this)) {
                const SerializerClass = this;
                return SerializerClass.newInstance(sequence) as T;
            }
        }
        if (Tools.isArray<Sequence>(sequence)) {
            if (Serializer.requiredNewInstance(this)) {
                const SerializerClass = this;
                return sequence.map((element: Sequence) =>
                    SerializerClass.newInstance(element)
                ) as T[];
            }
        }
        return [];
    }

    toSequence(): Sequence {
        return { className: Tools.getClassName(this) };
    }
}

export namespace Serializer {
    export function requiredNewInstance(
        target: any
    ): target is SerializerNewInstanceType {
        if (Tools.isDefine(target.newInstance)) {
            return true;
        }
        throw new Error('sequence newInstance need subclass implement!');
    }
}
