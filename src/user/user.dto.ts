import * as Joi from 'joi';

export const pageDto = Joi.object({
    page: Joi.number().integer().min(1).required(),
    pageSize: Joi.number().integer().min(1).max(100).required(),
});

export interface PageDto {
    page: number;
    pageSize: number;
}

