import {KafkaConsumerBuilder} from "./kafkaConsumerBuilder";
import {KafkaConsumer} from "../kafkaConsumer";
import {ServiceEventCaster} from "../../../caster/serviceEventCaster";

export class ServiceEventConsumerBuilder extends KafkaConsumerBuilder {

    public constructor() {
        super();
        this.caster = new ServiceEventCaster();
    }

    build(): KafkaConsumer {
        return new KafkaConsumer(this);
    }

}