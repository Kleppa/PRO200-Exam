export interface Item{
    id?: string,
    name:string,
    price:number,
    category:string[],
    size:string,
    allergens?:string[],
    EAN:number,
    image:string,
    id?:string
}