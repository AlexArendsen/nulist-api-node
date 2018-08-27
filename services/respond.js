const fs = require('fs');

module.exports = {

  async withHtml(path, response, next) {

    const send = (err, contents) => {
      response.setHeader('Content-Type', 'text/html');
      response.writeHead(200);
      response.end(contents);
      next();
    }

    // TODO -- Cache this so we aren't hammering the disk
    await fs.readFile(path, send);
  }

}
