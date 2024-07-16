export const getNamedImport = (component: object): string[] => {
    return Object.entries(component).map(([key, value]) => {
        if(key !== 'default' && value != null) {
            return key
        } else {
            throw new Error(`component with name ${key} and ${value} cannot be added to MarkdocConfig`)
        }
    }) ?? []
}