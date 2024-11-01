import { onRequest } from 'firebase-functions/v2/https';
import { server } from './main';

export const api = onRequest(server);
