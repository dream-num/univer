export function remove<T>(arr: T[], item: T): boolean {
    const index = arr.indexOf(item);
    if (index > -1) {
        arr.splice(index, 1);
        return true;
    }
    return false;
}
