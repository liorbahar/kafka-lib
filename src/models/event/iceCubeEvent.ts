/**
 * Representation of kafka messages used by the services
 */
export abstract class IceCubeEvent {

    public transactionId: string;
    public stepName: string;
    public data: object;
    public serviceName: string;
    public operation: string;

    protected constructor(transactionId: string, stepName: string, data: object, serviceName: string, operation: string) {
        this.transactionId = transactionId;
        this.stepName = stepName;
        this.data = data;
        this.serviceName = serviceName;
        this.operation = operation;
    }
}