import express from 'express';

const router = express.router();

const { catchErrors } = require('@/handlers/errorHandlers');



router.post('/register').post(catchErrors());