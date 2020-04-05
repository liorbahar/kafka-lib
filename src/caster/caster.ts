import {IceCubeEvent} from "../models/event/iceCubeEvent";
import {KafkaMessage} from "../models/message/kafkaMessage";
import {CastingEventError} from "../errors/castingEventError";

export function tryCatchDecorator() {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        let originalMethod = descriptor.value;
        descriptor.value = (...args : any) => {
            try {
                return originalMethod(...args);
            } catch (e) {
                throw new CastingEventError('Failed casting event to message or message to event', e.message);
            }
        }
    }
}


export abstract class Caster {

    /**
     *
     * @param iceCubeEvent
     * @throws CastingEventError upon failure
     */
    public abstract iceCubeEventToKafkaMessage(iceCubeEvent: IceCubeEvent): KafkaMessage;

    /**
     *
     * @param kafkaMessage
     * @throws CastingEventError upon failure
     */
    public abstract kafkaMessageToIceCubeEvent(kafkaMessage: KafkaMessage): IceCubeEvent;
}

