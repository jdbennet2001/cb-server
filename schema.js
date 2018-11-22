const _               = require('lodash');
const { makeExecutableSchema } = require("graphql-tools");

let schemaText =`

# Suggest a possible target when filing a comic
type Series{
    name:String
    id: String
    count: Int
    location: String
}

type Suggestion {
    id : String
    image : String
    name : String
    description : String
    store_date: String
    url : String
    series: Series
    issue_number: String
 }

 #Describe a single file on disk
 type File {
    name : String
    location : String
    size: String
 }

 type ImportEntry{
    from: String
    to: String
    length: Int
 }

 #Information about a given Volume (identified by the id)
 type Volume{
   name: String
   publisher: String
   start_year: String
   directory: String
 }

  type Query {
    unfiled_comics: [File],
    suggestion(name: String, issue_number:Int, year:Int): [Suggestion],
    volume(id:String): Volume,
    getImportQueue: [ImportEntry]
  }

  type Mutation {
    queueImport(from: String, to:String): String
    import( from: String, to: String): String
    download_index(issue:Int, year:Int): Int
  }
`





const resolvers = {

};

module.exports.schema = makeExecutableSchema({
    typeDefs: schemaText,
    resolvers: resolvers
})

let {waiting}     = require('./lib/waiting');
let {suggestions} = require('./lib/import/suggestions');
let {volume_info} = require('./lib/import/volume');
let {
  queueComic,
  importComic,
  getImportQueue
}                  = require('./lib/import/importComic');
let {data}         = require('./lib/import/metadata');


module.exports.root = {

  suggestion:( {name, issue_number, year}) => {
    return suggestions(issue_number, year, name);
  },

  unfiled_comics: () =>{
    return waiting();
  },

  volume: ({id}) => {
    return volume_info(id);
  },

  queueImport: ({from, to}) => {
	   return queueComic(from, to);
  },

  import: ({from, to}) =>{
    return importComic(from, to);
  },

  download_index:({issue, year}) =>{
    return data(issue, year);
  },

  getImportQueue: () =>{
    return getImportQueue();
  }

};
