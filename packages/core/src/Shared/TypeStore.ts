/**
 * Register, get type
 */
export class TypeStoreBase {
    static RegisteredTypes: { [key: string]: Object } = {};

    static GetClass(fqdn: string): any {
        if (this.RegisteredTypes && this.RegisteredTypes[fqdn]) {
            return this.RegisteredTypes[fqdn];
        }
        return null;
    }
}
