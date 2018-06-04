export interface Item{
    name:string,
    price:number,
    category:string[],
    size:string,
    allergens?:string[],
    EAN:number,
    image:string
}