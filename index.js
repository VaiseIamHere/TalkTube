import dgram from 'node:dgram'
import dnsPacket from 'dns-packet'

const server = dgram.createSocket('udp4')

const db = {
    'vaibhavsingh.dev': '127.0.0.1',
    'google.com': '8.8.8.8',
    'netflix': '1.2.3.4'
}

server.on('message', (msg, rinfo) => {
    const incomingRequest = dnsPacket.decode(msg)
    const question = incomingRequest.questions[0]
    const ipFromDb = db[question.name]

    // Just to check what's incoming
    console.log({
        msg: msg.toString(), 
        remoteInfo: rinfo, 
        decodedRequest: incomingRequest,
        question: question
    })

    const buf = dnsPacket.encode({
        type: 'response',
        id: incomingRequest.id,
        flags: dnsPacket.AUTHORITATIVE_ANSWER,
        questions: incomingRequest.questions,
        answers: [{
            type: 'A',
            class: 'IN',
            name: question.name,
            data: ipFromDb
        }]
    })

    server.send(buf, rinfo.port, rinfo.address)
})

server.bind(53, () => {
    console.log('My DNS server is running on port 53...')
})
