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
 }

 #Describe a single file on disk
 type File {
    name : String
    location : String
 }


  type Query {
    unfiled_comics: [File],
    suggestion(name: String, issue_number:Int, year:Int): [Suggestion]
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

//Scan the import directory to generate a list of all unfiled comics
module.exports.root = {

  suggestion:( {name, issue_number, year}) => {
    return suggestions(issue_number, year, name);
  },

  unfiled_comics: () =>{
    return waiting();
  }

};
