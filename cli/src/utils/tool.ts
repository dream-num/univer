export function generateRandomId(): string {
    function S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    return new Date().getTime() + S4() + S4();
}
