const dgram = require('dgram') // import dgram
const client = dgram.createSocket('udp4') // create new connection
const event = require('events') // import "events" module
const mse = new event // create a new event

const hash = require('./hash') // import the "hahs" function

let srv

// When a message is received from an Agora
client.on('message', (msg, rinfo) => {
  msg = JSON.parse(Buffer.from(msg).toString()) // parse message
  mse.emit(msg.action, { // emit the message
    content: msg.content,
    remote: rinfo
  })
})

// A function to send messages to the Agora
const send = (action, content) => {
  const packet = JSON.stringify({ // create packet
    action: action,
    content: content
  })

  // send the message to the Agora
  client.send(packet, 0, packet.length, srv.port, srv.address, (err, bytes) => {
    if (err) throw err
  })
}

module.exports = {
  getServer (name) {
    return new Promise(resolve => {
      srv = require('./serverGetter')(name)
      resolve(srv)
    })
  },

  listServers () {
    return require('./agoras.json')
  },

  // A function to login into an Agora
  login (username, password, digit) {
    return new Promise((resolve, reject) => {
      // Hash password
      hash(Buffer.from(password)).then(psw => {
        send('LOGIN_USER', { // Send message
          username: username,
          password: psw,
          digit: digit
        })
      })

      // On receiving an answer
      mse.on('LOGIN_USER', (r) => {
        resolve(r.content) // return content the content of the message
      })

      setTimeout(() => reject({error: 'TIME_OUT'}), 10000)
    })
  },

  // To update the address and port in the Agora
  connect (username, password, digit, port) {
    return new Promise((resolve, reject) => {
      hash(Buffer.from(password)).then(psw => {
        send('CONNECT', { // Send message
          username: username,
          password: psw,
          digit: digit,
          port: port
        })
      })

      // On receiving an answer
      mse.on('CONNECT', (r) => {
        resolve(r.content) // return content the content of the message
      })

      setTimeout(() => reject({error: 'TIME_OUT'}), 10000)
    })
  },

  // Get a specific client with a token
  getClient (token) {
    return new Promise((resolve, reject) => {
      send('GET_USER', { token: token }) // Send message

      // On receiving an answer
      mse.on('GET_USER', (r) => {
        resolve(r.content) // return content the content of the message
      })
    
      setTimeout(() => reject({error: 'TIME_OUT'}), 10000)
    })
  },

  // Get a specific client with a token
  getClients (number) {
    return new Promise((resolve, reject) => {
      send('GET_USERS', { number: number }) // Send message

      // On receiving an answer
      mse.on('GET_USERS', (r) => {
        resolve(r.content) // return content the content of the message
      })

      setTimeout(() => reject({error: 'TIME_OUT'}), 10000)
    })
  }
}