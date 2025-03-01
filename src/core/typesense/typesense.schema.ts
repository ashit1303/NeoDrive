import { Constants } from "../constants";

export const schema = {
  name: Constants.LeetCollection,
  fields: [
    { name: 'id', type: 'string' },
    { name: 'questionTitle', type: 'string' },
  ],
  default_sorting_field: 'id',
};