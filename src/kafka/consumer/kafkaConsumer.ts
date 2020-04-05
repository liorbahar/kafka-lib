import {Consumer, Kafka} from "kafkajs";
import {Caster} from "../../caster/caster";
import {KafkaMessage} from "../../models/message/kafkaMessage";
import {KafkaConsumerBuilder} from "./builder/kafkaConsumerBuilder";
import {Session} from "../../models/session/session";
import { IceCubeEvent } from "../../models/event/iceCubeEvent";
import { FilterOptions } from "../../filter/filterOptions";
import { resolve } from "dns";



export class KafkaConsumer {

    private kafkaClient: Kafka;
    private readonly topic: string;
    private readonly consumer: Consumer;
    private caster: Caster;
    private readonly filter: object = {};

    public constructor(kafkaConsumerBuilder: KafkaConsumerBuilder) {
        let kafkaConfig = {
            logLevel: kafkaConsumerBuilder.logLevel,
            brokers: kafkaConsumerBuilder.brokers,
            clientId: kafkaConsumerBuilder.clientId,
            ...kafkaConsumerBuilder.additionalProperties
        };
        if (kafkaConsumerBuilder.saslOptions != null) {
            kafkaConfig["sasl"] = kafkaConsumerBuilder.saslOptions;
        }
        this.kafkaClient = new Kafka(kafkaConfig);
        this.topic = kafkaConsumerBuilder.topic;
        this.caster = kafkaConsumerBuilder.getCaster();
        this.consumer = this.kafkaClient.consumer({groupId: kafkaConsumerBuilder.groupId});

        //initialise the filter
        for (let key in kafkaConsumerBuilder.filter) {
            this.filter[key] = new RegExp(kafkaConsumerBuilder.filter[key]);
        }
    }

    private validateHeadersByFilter(message_headers: object): boolean {
        for (let key in this.filter) {
            if (!this.filter[key].test(message_headers[key])) {
                return false;
            }
        }
        return true;
    }

    private async commit(topic: string, partition: number, offset: string) {
        await this.consumer.commitOffsets([{
            topic: topic,
            partition: partition,
            offset: String(parseInt(offset) + 1)
        }]);
    }

    private async handelSession(session: Session) {
        try {
            let serviceEvent: IceCubeEvent = session.getEvent();
            console.log(serviceEvent);
            await session.commit();
        } catch (e) {
            session.rollback();
        }
    }

 
    public async getMessage(filterOptions? : FilterOptions , stopCountNotFoundMessage? : number , autoCommit: boolean = true) : Promise<IceCubeEvent>{
        return new Promise(async(resolve , reject) => {
        let foundEvent : IceCubeEvent;
        let countMessageNotFound : number = 0;
        console.log('cusumer connect');
        await this.consumer.connect();
        console.log('cusumer subscribe')
        await this.consumer.subscribe({topic: this.topic, fromBeginning: true});
        
        console.log('cusumer listen to kafka messages')
        await this.consumer.run({
                autoCommit: autoCommit,
                eachMessage: async ({topic, partition, message}) => {
                    let message_headers = {};
                    for (let header in message.headers) {
                        message_headers[header] = message.headers[header].toString();
                    }

                    if (this.filter != null) {
                        if (!this.validateHeadersByFilter(message_headers)) {
                            await this.commit(topic, partition, message.offset);
                            return;
                        }
                    }

                    let message_value_object = JSON.parse(message.value.toString());
                    console.log(`message :${JSON.stringify(message_value_object)}`)

                    if (filterOptions != null){
                        if (filterOptions.filterMessage(message_value_object)){
                            console.log('message match to filter options')
                            await this.commit(topic, partition, message.offset);
                            let session = new Session(this.consumer, topic, partition, message.offset,
                                this.caster.kafkaMessageToIceCubeEvent(new KafkaMessage(message_value_object, message_headers)))
                            await this.handelSession(session);
                            foundEvent = session.getEvent();
                            //await this.disconnect();
                            resolve(foundEvent);
                        }
                    }
                    console.log('The message NOT match to filter options')
                    countMessageNotFound++;
                }
            }
            
        )
        })
        
    }

    public async disconnect() {
        await this.consumer.disconnect();
    }




    public async getMessageBatch(filterOptions? : FilterOptions , stopCountNotFoundMessage? : number , autoCommit: boolean = true) : Promise<IceCubeEvent>{
        return new Promise(async (resolve,reject) => { 
            console.log('cusumer connect');
        await this.consumer.connect();
        console.log('cusumer subscribe')
        await this.consumer.subscribe({topic: this.topic, fromBeginning: true});
        let foundEvent : IceCubeEvent;
        console.log('cusumer listen to kafka messages')
            await this.consumer.run({
                autoCommit: false,
                eachBatch: async ({ batch, resolveOffset, heartbeat, isRunning, isStale }) => {
                console.log(batch.messages.length)
                for (let i = 0 ; i < batch.messages.length ; i++){
                    let message = batch.messages[i];
                    let message_value_object = JSON.parse(batch.messages[i].value.toString());
                
                    let topic = batch.topic;
                    let partition = batch.partition;
                        let message_headers = {};
                    for (let header in message.headers) {
                        message_headers[header] = message.headers[header].toString();
                    }

                    if (this.filter != null) {
                        if (!this.validateHeadersByFilter(message_headers)) {
                            //await this.commit(topic, partition, message.offset);
                            return;
                        }
                    }
                    
                    console.log(`message :${JSON.stringify(message_value_object)}`)
                    if (filterOptions != null){
                        if (filterOptions.filterMessage(message_value_object)){
                            console.log('message match to filter options')
                            //await this.commit(topic, partition, message.offset);
                            let session = new Session(this.consumer, topic, partition, message.offset,
                               this.caster.kafkaMessageToIceCubeEvent(new KafkaMessage(message_value_object, message_headers)))
                            //await this.handelSession(session);
                            foundEvent = session.getEvent();
                            //await this.disconnect();
                            resolve(foundEvent);
                        }
                    }
                }
            }
            })
        })
    }
}
    




