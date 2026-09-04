import {Router} from 'express';

import { createApiKey, deleteApiKey, getUserApiKeys, toggleApiKeyStatus } from '../controllers/key.controller.js';


import { isAuthenticated } from '../middlewares/auth.middleware.js';


const keyRouter = Router();

keyRouter.post('/', isAuthenticated, createApiKey);
keyRouter.get('/', isAuthenticated, getUserApiKeys);
keyRouter.delete('/:id', isAuthenticated, deleteApiKey);
keyRouter.patch('/:id/toggle-status', isAuthenticated, toggleApiKeyStatus);

export default keyRouter;