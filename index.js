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
        return file.code.match(/\/\/\sTODO[\s:]+.*(;\s*\d{4}-\d{2}-\d{2};\s*.*)*/ig).map(comment => ({
            "important": ~comment.indexOf('!') ? '!' : ' ',
            "user": getAttribute('user', comment),
            "date": getAttribute('date', comment),
            "comment": getAttribute('comment', comment),
            "fileName": file.path.split('/')[1],
        }));
    });
    // Getting all objects of comments (alternative flat())
    return commentsFile.reduce((acc, val) => acc.concat(val), []);
}

function getAttribute(attribute, comment) {
    // comment division into attributes
    comment = comment.split(/\/\/\sTODO[\s:]+/ig)[1];
    switch (attribute) {
        case 'user':
            return ~comment.indexOf(';') ? comment.split(';')[0] : '';
        case 'date':
            comment = ~comment.indexOf(';') ? comment.split(';')[1] : '';
            return comment.charAt(0) === ' ' ? comment.slice(1) : comment;
        case 'comment':
            comment = ~comment.indexOf(';') ? comment.split(';')[2] : comment;
            return comment.charAt(0) === ' ' ? comment.slice(1) : comment;
    }
}

function createTable(comments) {
    let maxLengthUser = 0, maxLengthDate = 0, maxLengthComment = 0, maxLengthFileName = 0;

    comments.unshift({"important": '!', "user": 'user', "date": 'date', "comment": 'comment', "fileName": 'fileName'});

    comments.forEach(comment => {
        comment.user.length > maxLengthUser ? maxLengthUser = comment.user.length :
            comment.date.length > maxLengthDate ? maxLengthDate = comment.date.length :
                comment.comment.length > maxLengthComment ? maxLengthComment = comment.comment.length :
                    comment.fileName.length > maxLengthFileName ? maxLengthFileName = comment.fileName.length : null;
    });
    maxLengthUser = maxLengthUser > 10 ? 10 : maxLengthUser;
    maxLengthDate = maxLengthDate > 12 ? 12 : maxLengthDate;
    maxLengthComment = maxLengthComment > 50 ? 50 : maxLengthComment;
    maxLengthFileName = maxLengthFileName > 15 ? 15 : maxLengthFileName;

    comments.forEach((comment, index) => {
        let user = '', date = '', com = '', fileName = '';

        if (comment.user.length > 10) {
            user = comment.user.substr(0, 7).concat("...");
        } else {
            user = comment.user.padEnd(maxLengthUser);
        }

        if (comment.date.length > 12) {
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
            fileName = comment.fileName.padEnd(maxLengthFileName);
        }

        console.log(`  ${comment.important}  |  ${user}  |   ${date}  |  ${com}  |  ${fileName}  `);

        // calculation width of the table
        index === 0 ? console.log(''.padEnd(maxLengthUser + maxLengthDate + maxLengthComment + maxLengthFileName + 24, '-')) : null;
    });
}

function showComments() {
    const comments = getCommentsFile();
    createTable(comments);
}

function processCommand(command) {
    switch (command) {
        case ' ':
            showComments();
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
// TODO you can do it!
// TODO nik; 2012; lalalala!