// Constants
type nats = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'

// Utilities
type _<T> = T;
type Merge<T> = _<{ [k in keyof T]: T[k] }>;
type Trim<T, K = ' ' | '\n'> = T extends `${K & string}${infer R}` ? Trim<R, K> : T;

// String Parsers
type Item<T> = T extends `${infer A}${infer B}` ? [A, B] : never;
type Many<T, N, Res = ''> = Item<T> extends [infer A, infer B] ? A extends N ? Many<B & string, N, `${Res & string}${A & string}`> : [Res, T] : never;
type Some<T, N> = Many<T, N> extends [infer I, infer R] ? I extends '' ? never : [I, R] : never; 

// JSON Parsers
export type Parse<T> = StringLiteral<T> | Null<T> | Int<T> | List<T> | Obj<T>

type StringLiteral<T> = Trim<T> extends `"${infer D}"${infer R}` ? [D, R] : never;
type Null<T> = Trim<T> extends `null${infer R}` ? [null, R] : never;
type Int<T> = Some<T, nats> extends [infer A, infer B] ? A extends string ? [number, B] : never : never;

type List<T> = T extends `[]${infer R}` ? [[], R] : T extends `[${infer R}` ? ListItems<R> : never
type ListItems<Input, Output extends any[] = []> = 
    Parse<Trim<Input>> extends [infer O1, infer R1] ? 
        Trim<R1> extends `,${infer R2}` ? ListItems<R2, [...Output, O1]> :
        Trim<R1> extends `]${infer R2}` ? [[...Output, O1], R2] : never : never
    
type Obj<T> = T extends `{}${infer R}` ? [{}, R] : T extends `{${infer R}` ? ObjValues<R> : never;
type ObjValues<Input, Output = {}> = 
    Trim<Input> extends `${infer A}:${infer B}` ?
       StringLiteral<A> extends [infer K, ''] ? 
          Parse<Trim<B>> extends [infer V, infer O] ?
            Trim<O> extends `,${infer O2}` ?
                ObjValues<O2, Merge<Output & { [Key in (K & string)]: V }>>
            : Trim<O> extends `}${infer O2}` ?
                [Merge<Output & { [Key in (K & string)]: V }>, O2]
            : never
        : never
    : never
    : never


type PARSE_RESULT = Parse<`[ { "one": { "two": [ { "one": { "two": [0] } }, {} ] } }, {} ]`>