const _         = require('lodash');

class archive {

    constructor({name, location}) {
        this.name = name;
        this.location = location;
    }

    get title() {
        let basename = this.name;

        //Drop the brackets
        let bracket = basename.indexOf('(');
        let title = basename.substr(0, bracket);

        //Drop the numbers
        title = _.split(title, ' ').filter(token => isNaN(Number(token)));

        return title.join(' ');
    }

    get number() {
        let basename = this.name;
        let token = basename.split(' ').filter(token => !isNaN(Number(token)));
        let issue = _.toInteger(token);
        return issue;
    }

    get year() {
        let basename = this.name;
        basename = basename.replace('(', '').replace(')', ' ');
        let numbers = _.split(basename, ' ').filter(token => !isNaN(Number(token)));
        let number = numbers.find(value => {
            value = _.toNumber(value);
            return (value < 2050 && value > 1935);
        })
        return number;
    }
}

module.exports = archive;