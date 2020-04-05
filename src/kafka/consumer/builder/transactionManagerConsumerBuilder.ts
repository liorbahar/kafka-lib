import {KafkaConsumerBuilder} from "./kafkaConsumerBuilder";
import {KafkaConsumer} from "../kafkaConsumer";
import {TransactionManagerCaster} from "../../../caster/transactionManagerCaster";

export class TransactionManagerConsumerBuilder extends KafkaConsumerBuilder {

    public constructor() {
        super();
        this.caster = new TransactionManagerCaster();
    }

    
    build(): KafkaConsumer {
        return new KafkaConsumer(this);
    }

}