// SDBM hash Algorithm
export function hashAlgorithm(str: string): number {
    let hash = 0;

    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + (hash << 6) + (hash << 16) - hash;
    }

    // Convert it to an unsigned 32-bit integer.
    return hash >>> 0;
}
