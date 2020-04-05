import {logLevel, SASLOptions} from "kafkajs";
import {Caster} from "../caster/caster";

export abstract class KafkaBuilder {
    public logLevel: logLevel;
    public clientId: string;
    public topic: string;
    public brokers: string[];
    public saslOptions?: SASLOptions;
    public additionalProperties: object = {};
    protected caster: Caster;


    setLogLevel(logLevel: logLevel) {
        this.logLevel = logLevel;
        return this;
    }

    setClientId(clientId: string) {
        this.clientId = clientId;
        return this;
    }

    setTopic(topic: string) {
        this.topic = topic;
        return this;
    }

    setBrokers(brokers: string[]) {
        this.brokers = brokers;
        return this;
    }

    setSASLOptions(saslOptions: SASLOptions) {
        this.saslOptions = saslOptions;
        return this;
    }

    setAuthenticationTimeout(authenticationTimeout: number) {
        this.additionalProperties["authenticationTimeout"] = authenticationTimeout;
        return this;
    }

    setReauthenticationThreshold(reauthenticationThreshold: number) {
        this.additionalProperties["reauthenticationThreshold"] = reauthenticationThreshold;
        return this;
    }

    setConnectionTimeout(connectionTimeout: number) {
        this.additionalProperties["connectionTimeout"] = connectionTimeout;
        return this;
    }

    setRequestTimeout(requestTimeout: number) {
        this.additionalProperties["requestTimeout"] = requestTimeout;
        return this;
    }

    setMaxRetryTime(maxRetryTime: number) {
        this.additionalProperties["maxRetryTime"] = maxRetryTime;
        return this;
    }

    setInitialRetryTime(initialRetryTime: number) {
        this.additionalProperties["initialRetryTime"] = initialRetryTime;
        return this;
    }

    getCaster(): Caster {
        return this.caster;
    }

}

