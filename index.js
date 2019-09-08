const dgram = require('dgram') // import dgram
const client = dgram.createSocket('udp4') // create new connection
const event = require('events') // import "events" module
const mse = new event // create a new event

const { security } = require('../../Positron/index') // import the "secutity" module from Positron

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
    console.log(bytes)
  })
}

module.exports = {
  getServer (name) {
    return new Promise(resolve => {
      srv = require('./serverGetter')(name)
      resolve(srv)
    })
  },

  // A function to login into an Agora
  login (username, password, digit) {
    return new Promise(resolve => {
      // Hash password
      security.hash(Buffer.from(password)).then(psw => {
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
    })
  },

  // To update the address and port in the Agora
  connect (username, password, digit, port) {
    return new Promise(resolve => {
      security.hash(Buffer.from(password)).then(psw => {
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
    })
  },

  // Get a specific client with a token
  getClient (token) {
    return new Promise(resolve => {
      send('GET_USER', { token: token }) // Send message

      // On receiving an answer
      mse.on('GET_USER', (r) => {
        resolve(r.content) // return content the content of the message
      })      
    })
  },

  // Get a specific client with a token
  getClients (number) {
    return new Promise(resolve => {
      send('GET_USERS', { number: number }) // Send message

      // On receiving an answer
      mse.on('GET_USERS', (r) => {
        resolve(r.content) // return content the content of the message
      })      
    })
  }
}