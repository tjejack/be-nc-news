const fs = require("fs/promises");

module.exports.fetchEndpoints = () => {
    return fs.readFile(`${__dirname}/../endpoints.json`)
      .then((endpoints) => {
        const parsedEnds = JSON.parse(endpoints);
        return parsedEnds;
      })
      .catch((err) => {
        return Promise.reject({status: 404, msg: 'No Available Endpoints'})
      });
};
