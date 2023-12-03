import type { Sequence } from './sequence';

export declare class Serialize {
    static newInstance(sequence: Sequence): Serialize;

    static fromSequence(sequence: Sequence[]): Serialize[];
    static fromSequence(sequence: Sequence): Serialize;

    toSequence(): Sequence;
}
