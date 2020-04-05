import {IceCubeEvent} from "./iceCubeEvent";

export class TransactionManagerEvent extends IceCubeEvent {

    public constructor(transactionId: string, stepName: string, data: object, serviceName: string, operation: string) {
        super(transactionId, stepName, data, serviceName, operation);
    }
}