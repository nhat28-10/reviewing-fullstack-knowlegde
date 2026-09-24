function add(a, b) {
  return a + b;
}

function subtract(a, b) {
  return a - b;
}

const appName = "CommonJS Example";

module.exports = {
  add,
  subtract,
  appName,
};
