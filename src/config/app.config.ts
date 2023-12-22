import * as dotenv from 'dotenv';
import { registerAs } from '@nestjs/config';
dotenv.config();

export default registerAs('app', () => ({}));
