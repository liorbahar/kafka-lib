import { FilterOptions } from "./filterOptions";

export class IcecubeEventFilterBuilder {
    lsFiltersFunc  : { (message : Object) : boolean; } [] = [];
    
    makefilterByTransactionId(transactionId){
        //this.lsFiltersFunc.push( (message : Object) => { return (message['transactionId'] == transactionId) } );
        this.lsFiltersFunc.push( function filterByTransactionId(message : Object) { return message['transactionId'] == transactionId} );
        return this;
    }
    public makeFilterByStepName (stepName){
        
        //this.lsFiltersFunc.push( (message : Object) => { return (message['stepName'] == stepName) } );
        this.lsFiltersFunc.push( function filterByStepName(message : Object) { return message['stepName'] == stepName} );
        return this;
    }

    public addFilter( filterFunc : { (message : Object) : boolean; }) {
        this.lsFiltersFunc.push(filterFunc);
        return this;
    }

    public build() : FilterOptions{
        return new FilterOptions(this);
    }
}