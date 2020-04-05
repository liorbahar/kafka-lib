import { IcecubeEventFilterBuilder } from "./IcecubeEventFilter";

export class FilterOptions{
    private lsFiltersFunc  : { (message : Object) : boolean; } [] = [];
    constructor(icecubeEventFilter : IcecubeEventFilterBuilder){
        this.lsFiltersFunc = icecubeEventFilter.lsFiltersFunc;
    }
    public filterMessage(message : Object) : boolean{
        for (let i = 0; i < this.lsFiltersFunc.length ; i++){
            console.log(`run filter function ${this.lsFiltersFunc[i].name}`)
            let value = this.lsFiltersFunc[i](message);
            if (!value){
                return false;
            }
        }
        return true;
    }

}

