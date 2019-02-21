const {getAllFilePathsWithExtension, readFile} = require('./fileSystem');
const {readLine} = require('./console');

app();

function app() {
    console.log('Please, write your command!');
    readLine(processCommand);
}

function getFiles() {
    const filePaths = getAllFilePathsWithExtension(process.cwd(), 'js');
    return filePaths.map(path => ({"code": readFile(path), "path": path})); // Contains file code and file path
}

function getCommentsFile() {
    const files = getFiles();
    let commentsFile = files.map(file => {
        let fileCode = file.code.match(/\/\/\sTODO[\s:]+.*(;\s*\d{4}-\d{2}-\d{2};\s*.*)*/ig);
        if (fileCode === null) {
            return [];
        } else {
            return fileCode.map(comment => ({
                "important": ~comment.indexOf('!') ? '!' : ' ',
                "user": getAttribute('user', comment),
                "date": getAttribute('date', comment),
                "comment": getAttribute('comment', comment),
                "fileName": file.path.split('/')[1],
            }));
        }
    });
    // Getting all objects of comments (alternative flat())
    return commentsFile.reduce((acc, val) => acc.concat(val), []);
}

function getAttribute(attribute, comment) {
    // comment division into attributes
    comment = comment.split(/\/\/\sTODO[\s:]+/ig)[1];
    switch (attribute) {
        case 'user':
            return ~comment.indexOf(';') ? comment.split(';')[0].trim() : '';
        case 'date':
            return ~comment.indexOf(';') ? comment.split(';')[1].trim() : '';
        case 'comment':
            return ~comment.indexOf(';') ? comment.split(';')[2].trim() : comment;
    }
}

function createTable(comments) {
    let maxLengthUser = 0, maxLengthDate = 0, maxLengthComment = 0, maxLengthFileName = 0;
    let table = '';
    comments.unshift({"important": '!', "user": 'user', "date": 'date', "comment": 'comment', "fileName": 'fileName'}); // table title
    // calculating max width of columns
    comments.forEach(comment => {
        comment.user.length > maxLengthUser ? maxLengthUser = comment.user.length : null;
        comment.date.length > maxLengthDate ? maxLengthDate = comment.date.length : null;
        comment.comment.length > maxLengthComment ? maxLengthComment = comment.comment.length : null;
        comment.fileName.length > maxLengthFileName ? maxLengthFileName = comment.fileName.length : null;
    });
    maxLengthUser = maxLengthUser > 10 ? 10 : maxLengthUser;
    maxLengthDate = maxLengthDate > 10 ? 10 : maxLengthDate;
    maxLengthComment = maxLengthComment > 50 ? 50 : maxLengthComment;
    maxLengthFileName = maxLengthFileName > 15 ? 15 : maxLengthFileName;

    comments.forEach((comment, index) => {
        let user = '', date = '', com = '', fileName = '';

        if (comment.user.length > 10) {
            user = comment.user.substr(0, 7).concat("...");
        } else {
            user = comment.user.padEnd(maxLengthUser);
        }

        if (comment.date.length > 10) {
            date = comment.date.substr(0, 7).concat("...");
        } else {
            date = comment.date.padEnd(maxLengthDate);
        }

        if (comment.comment.length > 50) {
            com = comment.comment.substr(0, 47).concat("...");
        } else {
            com = comment.comment.padEnd(maxLengthComment);
        }

        if (comment.fileName.length > 15) {
            fileName = comment.fileName.substr(0, 12).concat("...");
        } else {
            fileName = comment.fileName.concat(' '.repeat(maxLengthFileName - comment.fileName.length));
        }
        // table - variable which save all string of table
        table = table + `  ${comment.important}  |  ${user}  |  ${date}  |  ${com}  |  ${fileName}  \n`;
        index === 0 || index === comments.length - 1 ? table = table + ''.padEnd(maxLengthUser + maxLengthDate + maxLengthComment + maxLengthFileName + 25, '-') + '\n' : null;
    });
    console.log(table);
}

function showAllComments() {
    const comments = getCommentsFile();
    createTable(comments);
}

function showImportantComments() {
    let comments = getCommentsFile();
    comments = comments.filter(comment => comment.important === '!');
    createTable(comments);
}

function showUserComments(name) {
    let comments = getCommentsFile();
    let regName = new RegExp('^' + name, 'i');
    comments = comments.filter(comment => comment.user.match(regName));
    createTable(comments);
}

function sortImportance() {
    let comments = getCommentsFile();
    let importantComments = comments.filter(comment => comment.important === '!');

    importantComments.sort(function (a, b) {
        return b.comment.split('!').length - a.comment.split('!').length;
    });
    comments = comments.filter(comment => comment.important != '!');
    comments = importantComments.concat(comments);
    createTable(comments);
}

function sortUser() {
    let comments = getCommentsFile();

    comments.sort(function (a, b) {
        return a.user.toLowerCase().localeCompare(b.user.toLowerCase()); // case insensitive
    });
    let emptyUserComments = comments.filter(comment => comment.user === '');
    comments = comments.filter(comment => comment.user != '');
    comments = comments.concat(emptyUserComments);
    createTable(comments);
}

function sortDate() {
    let comments = getCommentsFile();
    comments.sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
    });
    let emptyDateComments = comments.filter(comment => comment.date === '');
    comments = comments.filter(comment => comment.date != '');
    comments = comments.concat(emptyDateComments);
    return comments;
}

function showDateComments(d) {
    let date = new Date(d);
    let comments = sortDate();
    let limit = 0;
    for (let i = 0; i < comments.length; i++) {
        let currentDate = new Date(comments[i].date);
        if (date > currentDate) {
            limit = i;
            break;
        }
    }
    comments = comments.slice(0, limit).sort(function (a, b) {
        return new Date(a.date) - new Date(b.date);
    });
    createTable(comments);
}

function processCommand(command) {
    switch (command) {
        case 'show':
            showAllComments();
            break;
        case 'important':
            showImportantComments();
            break;
        case command.startsWith('user') ? command : '':
            let name = command.slice(5);
            showUserComments(name);
            break;
        case 'sort importance':
            sortImportance();
            break;
        case 'sort user':
            sortUser();
            break;
        case 'sort date':
            createTable(sortDate());
            break;
        case command.startsWith('date') ? command : '':
            let date = command.slice(5);
            showDateComments(date);
            break;
        case 'exit':
            process.exit(0);
            break;
        default:
            console.log('wrong command');
            break;
    }
}

// TODO : Nik;2015-12-11 ; my name is Nik
// todo you can do it!