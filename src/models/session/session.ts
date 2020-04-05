import {Consumer} from "kafkajs";
import {IceCubeEvent} from "../event/iceCubeEvent";

export class Session {
    private readonly consumer: Consumer;
    private readonly topic: string;
    private readonly partition: number;
    private readonly offset: string;
    private readonly event: IceCubeEvent;

    constructor(consumer: Consumer, topic: string, partition: number, offset: string, event: IceCubeEvent) {
        this.consumer = consumer;
        this.topic = topic;
        this.partition = partition;
        this.offset = offset;
        this.event = event;
    }

    public getEvent(): IceCubeEvent {
        return this.event;
    }

    public async commit() {
        await this.consumer.commitOffsets([{
            topic: this.topic,
            partition: this.partition,
            offset: String(parseInt(this.offset) + 1)
        }]);
    }

    public rollback() {
        this.consumer.seek({topic: this.topic, partition: this.partition, offset: this.offset})
    }
}