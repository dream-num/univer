export function sortRules(oa: any, ob: any) {
    if (oa.zIndex > ob.zIndex) {
        return 1;
    }
    if (oa.zIndex === ob.zIndex) {
        return 0;
    }
    return -1;
}

export function sortRulesByDesc(oa: any, ob: any) {
    if (oa.zIndex > ob.zIndex) {
        return -1;
    }
    if (oa.zIndex === ob.zIndex) {
        return 0;
    }
    return 1;
}

/**
 *
 * @param key compare key
 * @param ruler 1:asc , 0:desc
 * @returns sort function
 */
export function sortRulesFactory(key = 'index', ruler = 1) {
    return (oa: any, ob: any) => {
        if (oa[key] > ob[key]) {
            return ruler;
        }
        if (oa[key] === ob[key]) {
            return 0;
        }
        return -ruler;
    };
}
