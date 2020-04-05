import {KafkaProducerBuilder} from "./kafkaProducerBuilder";
import {KafkaProducer} from "../kafkaProducer";
import {ServiceEventCaster} from "../../../caster/serviceEventCaster";

export class ServiceEventProducerBuilder extends KafkaProducerBuilder {

    public constructor() {
        super();
        this.caster = new ServiceEventCaster();
    }

    build(): KafkaProducer {
        return new KafkaProducer(this);
    }
}