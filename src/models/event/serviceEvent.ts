import {IceCubeEvent} from "./iceCubeEvent";

export class ServiceEvent extends IceCubeEvent {

    public result: Result;

    public constructor(transactionId: string, stepName: string, data: object, result: Result, serviceName: string,
                       operation: string) {
        super(transactionId, stepName, data, serviceName, operation);
        this.result = result;
    }
}

export class Result {

    private status: ResultStatus;
    private data: object;

    public constructor(status: ResultStatus, data: object) {
        this.status = status;
        this.data = data;
    }
}

export enum ResultStatus {
    SUCCESS = "SUCCESS",
    FAILED = "FAILED"
}
