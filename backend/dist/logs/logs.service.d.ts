import { FirebaseService } from '../shared/firebase.service';
export declare class LogsService {
    private readonly firebase;
    constructor(firebase: FirebaseService);
    create(userId: string, action: string, metadata?: any): Promise<{
        id: string;
        userId: string;
        action: string;
    }>;
}
