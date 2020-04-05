import {Caster, tryCatchDecorator} from "./caster";
import {TransactionManagerEvent} from "../models/event/transactionManagerEvent";
import {KafkaMessage} from "../models/message/kafkaMessage";
import {IHeaders} from "kafkajs";

export class TransactionManagerCaster implements Caster {

    @tryCatchDecorator()
    iceCubeEventToKafkaMessage(transactionManagerEvent: TransactionManagerEvent): KafkaMessage {
        let headers: IHeaders = {
            serviceName: transactionManagerEvent.serviceName,
            operation: transactionManagerEvent.operation
        };
        let value = {
            "transactionId": transactionManagerEvent.transactionId,
            "stepName": transactionManagerEvent.stepName,
            "data": transactionManagerEvent.data
        };
        return new KafkaMessage(value, headers);
    }

    @tryCatchDecorator()
    kafkaMessageToIceCubeEvent(kafkaMessage: KafkaMessage): TransactionManagerEvent {
        let transactionId = kafkaMessage.value["transactionId"];
        let stepName = kafkaMessage.value["stepName"];
        let data = kafkaMessage.value["data"];
        let serviceName = kafkaMessage.headers["serviceName"] as string;
        let operation = kafkaMessage.headers["operation"] as string;
        return new TransactionManagerEvent(transactionId, stepName, data, serviceName, operation);
    }


}