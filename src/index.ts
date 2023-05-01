import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import morgan from 'morgan';
import needle from 'needle';
import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import apicache from 'apicache';
import url from 'url';
import { errorHandler, notFound } from './errorHandler';
dotenv.config();
interface IQuery {
    q?: string;
}
const limiter: RateLimitRequestHandler = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
});
let cache = apicache.middleware;
const API_BASE_URL: string = process.env.API_BASE_URL!;
const API_KEY_NAME: string = process.env.API_KEY_NAME!;
const API_KEY_VALUE: string = process.env.API_KEY_VALUE!;
const port: number = +process.env.PORT! || 4000;
const app: Express = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(limiter);
app.set('trust proxy', 1);
app.get('/', cache('2 minutes'), async (req: Request, res: Response) => {
    let queryObj: IQuery = url.parse(req.url, true)?.query;
    const params = new URLSearchParams({
        [API_KEY_NAME]: API_KEY_VALUE,
        ...queryObj,
    });
    const response = await needle('get', `${API_BASE_URL}?${params}`);
    if (process.env.NODE_ENV !== 'production') {
        console.log(`${API_BASE_URL}?${params}`);
    }
    return res.json(response.body);
});
app.get('/welcome', (req: Request, res: Response) => {
    return res.status(200).json({
        message: 'Welcome to the server 👋👋👋',
    });
});
app.use(notFound);
app.use(errorHandler);
app.listen(port, () => {
    console.log(`Server listen on http://localhost:${port}`);
});
