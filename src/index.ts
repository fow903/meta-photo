import * as functions from 'firebase-functions';
import { api } from './main';

export const server = functions.https.onRequest(api);
