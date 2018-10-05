const _               = require('lodash');
const { makeExecutableSchema } = require("graphql-tools");

let schemaText =`

# Suggest a possible target when filing a comic
type Suggestion { 
    description : String
    id : String
    cover_date :  String
    issue_number :  String
    site_detail_url : String
    image_url : String
    volume_name : String
    volume_id : String
 }

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

let SAMPLE_SUGGESTIONS = [{
        "description": "<p><em>“THE ROAD TO FLASH WAR!” Wally West is overwhelmed by fragments from his past! With his protégé’s psyche falling apart, Barry Allen races around the DCU calling in every favor possible to save his shattered family. Meanwhile, Hunter Zolomon’s sinister machinations tip over the first domino in what might prove to be the end of everything for The Flash!</em></p><h4>List of covers and their creators:</h4><table data-max-width=\"true\"><thead><tr><th scope=\"col\">Cover</th><th scope=\"col\">Name</th><th scope=\"col\">Creator(s)</th><th scope=\"col\">Sidebar Location</th></tr></thead><tbody><tr><td>Reg</td><td>Regular Cover</td><td>Dan Panosian</td><td>1</td></tr><tr><td>Var</td><td>Variant Cover</td><td>Francesco Mattina</td><td>2</td></tr></tbody></table>",
        "id": 669430,
        "cover_date": "2018-07-01",
        "issue_number": "46",
        "site_detail_url": "https://comicvine.gamespot.com/the-flash-46-road-to-flash-war/4000-669430/",
        "image_url": "https://comicvine.gamespot.com/api/image/scale_small/6425116-46.jpg",
        "volume_name": "The Flash",
        "volume_id": 91750
    }]

//Scan the import directory to generate a list of all unfiled comics
module.exports.root = {

  suggestion:( {name, issue_number, year}, req) => {
    return SAMPLE_SUGGESTIONS;
  },

  unfiled_comics: () =>{
      return [];
  }

};
