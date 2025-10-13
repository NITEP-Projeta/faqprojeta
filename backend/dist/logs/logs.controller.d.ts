import { LogsService } from './logs.service';
export declare class LogsController {
    private readonly logsService;
    constructor(logsService: LogsService);
    create(body: {
        userId: string;
        action: string;
        metadata?: any;
    }): Promise<{
        id: string;
        userId: string;
        action: string;
    }>;
}
