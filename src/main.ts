import {logLevel, SASLOptions} from "kafkajs";
import {Result, ResultStatus, ServiceEvent} from "./models/event/serviceEvent";
import {IceCubeEvent} from "./models/event/iceCubeEvent";
import {ServiceEventProducerBuilder} from "./kafka/producer/builder/serviceEventProducerBuilder";
import {TransactionManagerConsumerBuilder} from "./kafka/consumer/builder/transactionManagerConsumerBuilder";
import {Session} from "./models/session/session";
import { FilterOptions } from "./filter/filterOptions";
import { IcecubeEventFilterBuilder } from "./filter/IcecubeEventFilter";
import { v4 as uuidv4 } from 'uuid';

async function main() {
    let saslOptions: SASLOptions = {mechanism: 'scram-sha-256', username: 'admin', password: 'admin-secret'};
    let brokers = ['onmydick.com:9092'];
    let producerBuilder = new ServiceEventProducerBuilder();

    let producer = producerBuilder.setBrokers(brokers)
    .setClientId('test-client')
    .setLogLevel(logLevel.INFO)
    .setRequestTimeout(30000)
    .setTopic('test')
    .setTransactionalId('id')
    .setSASLOptions(saslOptions)
    .build();

    /*for (let i = 0 ; i < 30 ; i++){
        console.log(`insert data ${i} to kafka`)
        console.log(uuidv4().toString())
        let message = new ServiceEvent(uuidv4().toString(), 'testStep', {'some-key': 'some-value'},
        new Result(ResultStatus.SUCCESS, {'some-data': 'data'}), 'testService', 'create-cube');
        await producer.sendMessage(message);
    }*/
    let message = new ServiceEvent('88', 'testStep', {'some-key': 'some-value'},
        new Result(ResultStatus.SUCCESS, {'some-data': 'data'}), 'testService', 'create-cube');
    /*let message2 = new ServiceEvent('77', 'testStep', {'some-key': 'some-value'},
    new Result(ResultStatus.SUCCESS, {'some-data': 'data'}), 'testService', 'create-cube');
    let message3 = new ServiceEvent('77', 'testStep', {'some-key': 'some-value'},
    new Result(ResultStatus.SUCCESS, {'some-data': 'data'}), 'testService', 'create-cube');
    let message5 = new ServiceEvent('77', 'testStep', {'some-key': 'some-value'},
    new Result(ResultStatus.SUCCESS, {'some-data': 'data'}), 'testService', 'create-cube');*/
        
    
    await producer.sendMessage(message);
    /*await producer.sendMessage(message2);
    await producer.sendMessage(message3);
    await producer.sendMessage(message5);*/
    let consumerBuilder = new TransactionManagerConsumerBuilder();
    let consumer = consumerBuilder.setBrokers(brokers)
    .setClientId('test-client')
    .setLogLevel(logLevel.INFO)
    .setTopic('test')
    .setSASLOptions(saslOptions)
    .setGroupId('test-group')
    .build();

    
    
    
    let filterOptions = new IcecubeEventFilterBuilder()
    .makeFilterByStepName("testStep")
    .makefilterByTransactionId("9f53fbc7-c05f-413e-8a95-fa02e7aae969")
    .build()
    let message4 = await consumer.getMessageBatch(filterOptions);
       console.log(message4);
    console.log('finish');
    //await consumer.getMessage(FilterOptions);
    /*message = new ServiceEvent('2', 'testStep2', {'some-key2': 'some-value2'},
        new Result(ResultStatus.SUCCESS, {'some-data': 'data'}), 'testService', 'operation-test');
    await producer.sendMessage(message);*/
}

async function callback(session: Session) {
    try {
        let serviceEvent: IceCubeEvent = session.getEvent();
        console.log(serviceEvent);
        await session.commit();
    } catch (e) {
        session.rollback();
    }
}

(async function () {
    await main();
})();