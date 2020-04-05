import {IHeaders} from "kafkajs";

/**
 * Representation of kafka messages used by the Kafka itself
 */
export class KafkaMessage {
    public headers: IHeaders;
    public value: object;

    constructor(value: object, headers: IHeaders) {
        this.value = value;
        this.headers = headers;
    }
}