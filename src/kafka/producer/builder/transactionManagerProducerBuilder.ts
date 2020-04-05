import {KafkaProducerBuilder} from "./kafkaProducerBuilder";
import {KafkaProducer} from "../kafkaProducer";
import {TransactionManagerCaster} from "../../../caster/transactionManagerCaster";

export class TransactionManagerProducerBuilder extends KafkaProducerBuilder {

    public constructor() {
        super();
        this.caster = new TransactionManagerCaster();
    }

    build(): KafkaProducer {
        return new KafkaProducer(this);
    }

}
