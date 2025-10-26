// Type declarations for modules without official types

declare module 'store' {
    const store: {
        get: (key: string) => any;
        set: (key: string, value: any) => void;
        remove: (key: string) => void;
        clearAll: () => void;
    };
    export default store;
}

declare module 'prop-types' {
    export const string: any;
    export const func: any;
    export const bool: any;
    export const object: any;
    export const array: any;
    export const number: any;
    export const node: any;
    export const element: any;
    export const oneOf: any;
    export const oneOfType: any;
    export const arrayOf: any;
    export const shape: any;
}

declare module 'semantic-ui-react' {
    export const Button: any;
    export const Item: any;
}
