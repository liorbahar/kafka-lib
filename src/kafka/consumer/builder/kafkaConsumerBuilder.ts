import {KafkaConsumer} from "../kafkaConsumer";
import {KafkaBuilder} from "../../kafkaBuilder";

export abstract class KafkaConsumerBuilder extends KafkaBuilder {

    public groupId: string;
    public filter: object;

    abstract build(): KafkaConsumer;

    setGroupId(groupId: string) {
        this.groupId = groupId;
        return this;
    }

    setFilter(filter: object) {
        this.filter = filter;
        return this;
    }
}