# common-lib
This library will define the standard for communication between our services, from the properties of the events to the 
actual communication with Kafka.

## KafkaMessage
Representation of the actual message sent to Kafka.
KafkaMessage is built of 2 parts - the message (general object), and headers (general JSON, where each key is header name, 
and the value is the header value).

## Services separation
Any of the the following contain 2 implementations:
1. For transaction manager service
2. For the rest of the services

The main difference is the in IceCubeEvent object. 
While both of the implementations contains mainly the same properties, the events that the services send to the transaction
manager should contain results about the actions they did, and thus the 2 objects.

Therefore, we created 2 consumers and 2 producers. We have 2 kind of events, and we need to be able to do the casting between each event
and the general kafka message (of which there is only 1).

### IceCubeEvent
Representation of Kafka message for the services(for code usage).
Here we have more explicit and detailed properties of what message should contain.

#### Body

Property | Type | Description
--- | --- | ---
TransactionId | string | Unique ID for transactions
stepName | string | Current step in transaction, the action to be done 
data | object | General object of the data, should include any relevant data for the destination service

As mentioned above, there are two types - *TransactionManagerEvent*, and *ServiceEvent*.
The *ServiceEvent* contain the following property as well:

##### Result
Properties:

Property | Type | Description
--- | --- | ---
status | ResultStatus | SUCCESS/FAILED
data | object | Any relevant data about the action that was performed. For example, a UUID of created flow on NiFi. On the other hand, could be error details upon failure
  

#### Headers 

Property | Type | Description
--- | --- | ---
serviceName | string | The name of the destination service of this message 
operation | string | The operation name (for identifying the transaction)

## Producer&Consumer - using the builder design pattern
For both producer and consumer, we've decided it's best to use the builder design pattern. 
We want to offer as much flexibility as possible, and the builder design pattern helps us to achieve that.
Thus, the producer and the consumer should not be created directly, but using the builders.
Since we have 2 implementations of consumers, and 2 of producers (for services and transaction manager), we have total of
4 builders: ServiceEventConsumerBuilder, TransactionManagerConsumerBuilder, ServiceEventProducerBuilder, TransactionManagerProducerBuilder.
### Producer
Produces messages to Kafka topic.
The producer work with transactions only, as we decided we want to be sure each message arrived to every broker.


Properties:

Property | Type | Description
--- | --- | ---
brokers | string[] | List of brokers - hostname:port
clientId | string | Kafka Client Id
logLevel | KakfaJS.logLevel | KafkaJS log level configuration
topic | string | Kafka topic name
transactionalId | string | Transaction Id for producer. Note that when a transaction with specific Id is active, that producer cannot produce any other messages until it's committed.
SASLOptions | KafkaJS.SASLOptions | Configuration for SASL communication with Kafka.
additionalProperties | object | Additional configuraions to the client

SASLOptions:

Property | Type | Description
--- | --- | ---
mechanism | string | plain/scram-sha-256/scram-sha-512/aws
username | string | Kafka username
password | string | Kafka password

additionalProperties:

Property | Type | Description | Default(ms)
--- | --- | --- | ---
authenticationTimeout | number | Timeout in ms for authentication requests | 1000
reauthenticationThreshold | number | When periodic reauthentication (connections.max.reauth.ms) is configured on the broker side, reauthenticate when reauthenticationThreshold milliseconds remain of session lifetime. | 10000
connectionTimeout | number | Time in milliseconds to wait for a successful connection | 1000
requestTimeout | number | Time in milliseconds to wait for a successful request | 30000
maxRetryTime | number | Maximum wait time for a retry in milliseconds | 30000
initialRetryTime | number | Initial value used to calculate the retry in milliseconds | 300
#### Example
```typescript 
let saslOptions: SASLOptions = {mechanism: 'scram-sha-256', username: 'admin', password: 'admin-secret'};
let brokers = ['13.42.90.100:9092'];
let producerBuilder = new ServiceEventProducerBuilder();
let producer = producerBuilder.setBrokers(brokers)
                                .setClientId('test-client')
                                .setLogLevel(logLevel.INFO)
                                .setTopic('test')
                                .setTransactionalId('id')
                                .setSASLOptions(saslOptions)
                                .build();
let message = new ServiceEvent('1', 'testStep', {'some-key': 'some-value'},
        new Result(ResultStatus.SUCCESS, {'some-data': 'data'}), 'testService', 'operation-test');
await producer.sendMessage(message);                                        
```

### Consumer
Consumes messages from Kafka topic.
The consumer should get a callback listener that gets a Session as an argument, and another boolean that indicates whether to 
auto commit or not. If set to false, the user must commit manually for each message.

The consumer will convert the general KafkaMessage to specific IceCubeEvent and will run the given callback, for each message
received.

Properties:

Property | Type | Description
--- | --- | ---
brokers | string[] | List of brokers - [hostname1:port1, hostname2:port2]
clientId | string | Kafka Client Id
logLevel | KakfaJS.logLevel | KafkaJS log level configuration
topic | string | Kafka topic name
transactionalId | string | Transaction Id for producer. Note that when a transaction with specific Id is active, that producer cannot produce any other messages until it's committed.
SASLOptions | KafkaJS.SASLOptions | Configuration for SASL communication with Kafka (further details in [Producer](#Producer))
additionalProperties | object | Additional configuraions to the client (further details in [Producer](#Producer))
filter(Optional) | object | A key-value pairs, where the key is a filter name, and the value should be regex to filter by. Filtering means that the message will be committed without calling the callback.

For each message consumed, the Consumer will test every message's header against the provided filter.
The message must contain every header that the filter has, and every header value must match the relevant regex.
Note that if for  a message has 2 header that matches their regex in the filter, but the filter was provided with 3 headers,
the message will be ignored - committed without calling the callback.

#### Session

Represents the messages that was consumed from Kafka, after it was converted, including functionality to commit/rollback when done.
This way, the user can decide when to mark a message as success (commit), or a failure (rollback).

Method |  Description
---  | ---
commit() | Commit to Kafka - mark this message as 'read'
rollback() | Seek back to this message in Kafka - meaning this event will be consumed again
getEvent() | Returns the IceCubeEvent that was consumed  



#### Example
```typescript
async function callback(session: Session) {
    try {
        let serviceEvent: IceCubeEvent = session.getEvent();
        console.log(serviceEvent);
        await session.commit();    
    } catch (e) {
        session.rollback();
    }
}


let consumerBuilder = new TransactionManagerConsumerBuilder();
let consumer = consumerBuilder.setBrokers(brokers)
                                .setClientId('test-client')
                                .setLogLevel(logLevel.INFO)
                                .setTopic('test')
                                .setSASLOptions(saslOptions)
                                .setGroupId('test-group')
                                .setFilter({'serviceName': 'test-service'})                               
                                .build();
await consumer.getMessage(callback);
```

### TransactionSteps
Under construction...
# kafka-lib
