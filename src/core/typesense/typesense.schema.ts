import { Constants } from "../constants";

export const LeetCodeschema = {
  name: Constants.LeetCollection,
  fields: [
    { name: 'id', type: 'string' },
    { name: 'questionTitle', type: 'string' },
  ],
  default_sorting_field: 'id',
};

export const AddressSchema = {
  name: 'addresses',
  fields: [
    { name: 'address', type: 'string' },
    { name: 'pincode', type: 'string' },
    { name: 'coordinates', type: 'string' },
    
  ],
};

// let addrDoc = {
//   'title': 'Louvre Museuem',
//   'points': 1,
//   'location': [48.86093481609114, 2.33698396872901]
// }

// let searchParameters = {
//   'q'         : '*',
//   'query_by'  : 'title',
//   'filter_by' : 'location:(48.90615915923891, 2.3435897727061175, 5.1 km)',
//   'sort_by'   : 'location(48.853, 2.344):asc'
// }
