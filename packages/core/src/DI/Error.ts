export class DIError extends Error {
    constructor(message: string) {
        super(`[DI]: ${message}`);
    }
}
