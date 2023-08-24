import {Entity, model, property} from '@loopback/repository';

@model({settings: {strict: false}})
export class Product extends Entity {
  @property({
    type: 'string',
    required: true,
  })
  title: string;

  @property({
    type: 'string',
    id: true,
    generated: false,
  })
  id: string;

  @property({
    type: 'number',
    required: true,
  })
  price: number;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Product>) {
    super(data);
  }
}

export interface ProductRelations {
  // describe navigational properties here
}

export type ProductWithRelations = Product & ProductRelations;
