export class CastingEventError extends Error {

    public details: string;

    public constructor(message: string, details?: string) {
        super(message);
        this.details = details;
    }
}