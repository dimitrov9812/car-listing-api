const fs = require('fs-extra');

const read = async (path) => {
  try {
    const data = await fs.readFile(path, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
};

const write = async (path, data) => {
  await fs.writeFile(path, JSON.stringify(data, null, 2));
};

module.exports = { read, write };
