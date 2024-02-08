/** Wisp server node!
 * Made by Rafflesia@\MercuryWorkshop
 * 
 * This software is licensed under AGPLv3 &&
 * You should have a copy of AGPLv3 with this source code
 * 
 * This implimentation of wisp is sort of really broken 
 * so I set the buffer size to max 32bit int, 
 * I'm not sure why it doesn't work with lower values
 * 
 */


import WebSocket, { WebSocketServer } from 'ws';
import net from 'node:net'
// for anyone wondering why I keep putting true in dataview functions, apparently dataview is big endian by default, and wisp is little endian

type WispFrame = {
    type: CONNECT_TYPE;
    streamID: number;
    payload: Uint8Array;
}
enum CONNECT_TYPE {
    CONNECT     = 0x01,
    DATA        = 0x02,
    CONTINUE    = 0x03,
    CLOSE       = 0x04
}
enum STREAM_TYPE {
    TCP     = 0x01,
    UDP     = 0x02
}


export function routeRequest(ws) {
    const connections = new Map();
    
    function close(streamID: number, reason: number) {
        const closePacket = new DataView(new Uint8Array(9).buffer);
        closePacket.setInt8(0, CONNECT_TYPE.CLOSE)
        closePacket.setUint32(1, streamID, true)
        closePacket.setUint8(5, reason);
    
        ws.send(Buffer.from(initialPacket.buffer))
        connections.delete(streamID);
    }
    ws.on('message', (data, isBinary) => {
        try {
            // Someone add safety checks here later
            const wispFrame = wispFrameParser(Buffer.from((data as Buffer)));
            
            // Routing
            if (wispFrame.type == CONNECT_TYPE.CONNECT) {
                const dataview = new DataView(wispFrame.payload.buffer);
                const streamType = dataview.getUint8(0);
                const port = dataview.getUint16(1, true);
                const hostname = new TextDecoder('utf8').decode(dataview.buffer.slice(3, dataview.buffer.byteLength));
                const client = new net.Socket();
                client.connect(port, hostname)
                connections.set(wispFrame.streamID, {client: client, buffer: 0x7FFFFFFF16})

                // on data, send to client
                client.on('data', function(data) {
                    const dataPacketHeader = new DataView(new Uint8Array(5).buffer);
                    dataPacketHeader.setInt8(0, CONNECT_TYPE.DATA)
                    dataPacketHeader.setUint32(1, wispFrame.streamID, true);
                    
                    ws.send(Buffer.concat([Buffer.from(dataPacketHeader.buffer), data]));
                })

                // close stream if there is some network error
                client.on('error', function() {
                    console.error("Something went wrong")
                    close(wispFrame.streamID, 0x03)

                })

            }
            if (wispFrame.type == CONNECT_TYPE.DATA) {
                if (!connections.has(wispFrame.streamID)) {
                    close(wispFrame.streamID, 0x41)
                    return;
                } // I will add better error handling later (I wont)
                
                const stream = connections.get(wispFrame.streamID)
                stream.client.write(wispFrame.payload)
                stream.buffer--;

                if (stream.buffer == 0) {
                    const continuePacket = new DataView(new Uint8Array(9).buffer);
                    continuePacket.setInt8(0, CONNECT_TYPE.CONTINUE)
                    continuePacket.setUint32(1, wispFrame.streamID, true)
                    continuePacket.setUint32(5, 0x7FFFFFFF16, true);
                
                    ws.send(Buffer.from(initialPacket.buffer))
                }

            }
            if (wispFrame.type == CONNECT_TYPE.CLOSE) {
                // its joever
                console.log("Client decided to terminate with reason " + new DataView(wispFrame.payload.buffer).getUint8(0));
                ws.close();
                connections.delete(wispFrame.streamID);
            } 

        } catch(e) {
            ws.close(); // something went SUPER wrong, like its probably not even a wisp connection
            console.error(e)
        }
            
    });
    
    // SEND the initial continue packet
    const initialPacket = new DataView(new Uint8Array(9).buffer);
    initialPacket.setInt8(0, CONNECT_TYPE.CONTINUE)
    initialPacket.setUint32(1, 0, true)
    initialPacket.setUint32(5, 0x7FFFFFFF16, true);

    ws.send(Buffer.from(initialPacket.buffer))

};

function wispFrameParser(data: Buffer): WispFrame {
    const uint8arrayView = new Uint8Array(data)
    const dataView = new DataView(uint8arrayView.buffer);
    const type: CONNECT_TYPE = dataView.getUint8(0);
    let streamID = dataView.getUint32(1, true);
    let payload = uint8arrayView.slice(5, uint8arrayView.byteLength)

    return {
        type,
        streamID,
        payload
    }
}

export default {
    routeRequest
}