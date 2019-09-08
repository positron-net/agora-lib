const agoras = require('./agoras.json')

module.exports = (name) => {
  for (i in agoras) {
    if (agoras[i].name === name) {
      return agoras[i]
      break
    }
  }
}