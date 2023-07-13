export interface IDisposable {
    dispose(): void;
}

export function isIDisposable(thing: unknown): thing is IDisposable {
    return !!thing && typeof (thing as any).dispose === 'function';
}

export interface ICreatable {
    onCreate(): void;
}

export function isICreatable(thing: unknown): thing is ICreatable {
    return !!thing && typeof (thing as any).onCreate === 'function';
}
