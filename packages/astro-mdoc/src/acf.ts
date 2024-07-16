import { customAlphabet } from 'nanoid/non-secure';

export const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz_ABCDEFGHIJKLMNOPQRSTUVWXYZ');
export const acfMap = new Map<string, unknown>();

export class ACFMap {
    static add(component: unknown, name: string) {
        if(acfMap.has(name)) {
            throw new Error(`component with name ${name} already exists!`)
        } else {
            acfMap.set(name, component)
        }
    }
}

export const getImportSafeName = (size: number) => {
    const s = nanoid(size);
    return s;
}
