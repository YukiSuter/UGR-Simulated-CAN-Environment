// Statuses

var monitor = false;

// WEBSOCKET

var gateway = `ws://${window.location.hostname}/ws`;
var websocket;

var canMessages = "";
// Init web socket when the page loads
window.addEventListener('load', onload);

function onload(event) {
    initWebSocket();
}

function initWebSocket() {
    console.log('Trying to open a WebSocket connection…');
    websocket = new WebSocket(gateway);
    websocket.onopen = onOpen;
    websocket.onclose = onClose;
    websocket.onmessage = onMessage;
}

function sendWebsocketMessage(requestType, data = {}) {
    request = {}
    
    request.type = requestType
    request.content = data

    websocket.send(JSON.stringify(request))
}

function sendCANMessage() {
    let tx_add = parseInt(document.getElementById("can_address").value, 16);
    let tx_length = parseInt(document.getElementById("data_size").value);
    let tx_data_box = document.getElementById("can_tx_databox");

    let data = {
        id: tx_add,
        data_length: tx_length,
        data: []
    };

    for (let i = 0; i < tx_data_box.children.length; i++) {
        if (tx_data_box.children[i].tagName === "INPUT") {
            data.data.push(parseInt(tx_data_box.children[i].value, 16) || 0);
        }
    }

    sendWebsocketMessage("sendCAN", data);
}


function getMessages(){
    sendWebsocketMessage("getMessages");
}

function onOpen(event) {
    console.log('Connection opened');
    getMessages();
}

function onClose(event) {
    console.log('Connection closed');
    setTimeout(initWebSocket, 2000);
}

function onMessage(event) {

    console.log(event.data);
    var wsEvent = JSON.parse(event.data);
    var keys = Object.keys(wsEvent);
    console.log(wsEvent)

    if (keys.length > 0) {
        if (keys[0] = "type") {
            if (wsEvent.type == "canRx" && monitor) {

                var d = new Date(); // for now
                var timeString = "[" + d.getDate() + "/" + (d.getMonth()+1).toString() + "/" + d.getFullYear() + "; " + d.getHours().toString().padStart(2, '0') + ":" + d.getMinutes().toString().padStart(2, '0') + ":" + d.getSeconds().toString().padStart(2, '0') + "]"
            
                can_box_rx = document.getElementById("canBox_RX")
                var rxID = wsEvent.body.id
                var rxData = wsEvent.body.data
                var rxLength = wsEvent.body.dataLength

                var stringMsg = timeString + " ID: 0x" + rxID.toString(16) + "; Data Length: 0x" + rxLength + "; Data: [ "

                for (let i = 0; i < rxLength-1; i++) {
                    stringMsg += "0x"+rxData[i].toString(16) + " "
                } 

                can_box_rx.value += stringMsg + "]\n"
                can_box_rx.scrollTop = can_box_rx.scrollHeight 
            } else if (wsEvent.type == "canTx" && monitor) {

                var d = new Date(); // for now
                var timeString = "[" + d.getDate() + "/" + (d.getMonth()+1).toString() + "/" + d.getFullYear() + "; " + d.getHours().toString().padStart(2, '0') + ":" + d.getMinutes().toString().padStart(2, '0') + ":" + d.getSeconds().toString().padStart(2, '0') + "]"
            
                can_box_tx = document.getElementById("canBox_TX")
                var txID = wsEvent.body.id
                var txData = wsEvent.body.data
                var txLength = wsEvent.body.dataLength

                var stringMsg = timeString + " ID: 0x" + txID.toString(16) + "; Data Length: 0x" + txLength + "; Data: [ "

                for (let i = 0; i < txLength-1; i++) {
                    stringMsg += "0x"+txData[i].toString(16) + " "
                } 

                can_box_tx.value += stringMsg + "]\n"
                can_box_tx.scrollTop = can_box_tx.scrollHeight 
            }
        } else {
            console.log("Unknown message type")
        }
    } else {
        console.log("Empty message received.")
    }   
}

// UI - CAN
can_monitor_button = document.getElementById("monitor_button");
can_monitor_button.addEventListener('click', () => {
    if (monitor) {
        monitor = false;
        can_monitor_button.value = "🔴 Start Logging"
    } else {
        monitor = true;
        can_monitor_button.value = "🟢 Stop Logging"
    }
});

can_tx_datasize = document.getElementById("data_size");
can_tx_databox = document.getElementById("can_tx_databox")
can_tx_datasize.addEventListener('change', () => {
    can_tx_databox.innerHTML = ""
    for (let i = 0; i < Number(can_tx_datasize.value); i++) {
        can_tx_databox.innerHTML += `<div class="my-1 flex flex-row justify-between"><label class="rounded-md my-1 text-md text-white" for="can_content">[${i}]:</label><input class="rounded-md p-1 w-20" type="text" id="can_tx_data_${i}" name="content" value="" placeholder="0x00"></div>`
    } 
})

document.getElementById("clear_logs").addEventListener('click', () => {
    document.getElementById("canBox_RX").value = ""
    document.getElementById("canBox_TX").value = ""
})


// UI - Menu Bar
config_static_cont = document.getElementById("config_static_cont")
config_dynamic_cont = document.getElementById("config_dynamic_cont")
config_custom_cont = document.getElementById("config_custom_cont")
config_settings_cont = document.getElementById("config_settings_cont")

config_spacer = document.getElementById("config_spacer")

config_static = document.getElementById("config_static")
config_dynamic = document.getElementById("config_dynamic")
config_custom = document.getElementById("config_custom")
config_settings = document.getElementById("config_settings")

config_static_settings = document.getElementById("static_settings_container")
config_custom_settings = document.getElementById("custom_settings_container")

can_submit = document.getElementById("can_submit")
can_address = document.getElementById("can_address")

can_submit.addEventListener('click', () => {
    sendCANMessage()
});

config_static.addEventListener('click', () => {
    console.log("Static Config!")

    config_static_settings.style.display = 'block'
    config_custom_settings.style.display = 'none'

    config_static_cont.className = 'mt-1 h-10 border-l border-zinc-700'
    config_dynamic_cont.className = 'h-10 mt-1 bg-zinc-700 rounded-tl-md border-l border-t border-zinc-600'
    config_custom_cont.className = 'h-10 mt-1 bg-zinc-700 border-l border-t border-zinc-600'
    config_settings_cont.className = 'h-10 mt-1 bg-zinc-700 border-t border-zinc-600'
    
    config_spacer.className = 'h-10 flex-grow bg-zinc-700 border border-zinc-600 mt-1'

    config_static.className = 'text-xl text-yellow-300 py-1 px-5 border-b-2 border-yellow-300 h-full'
    config_dynamic.className = 'text-xl text-gray-400 py-1 px-5 border-b-2 border-zinc-600 h-full'
    config_custom.className = 'text-xl text-gray-400 py-1 px-5 border-b-2 border-zinc-600 h-full'
    config_settings.className = 'text-xl text-gray-400 py-1 px-5 border-b-2 border-zinc-600 h-full'
});

config_dynamic.addEventListener('click', () => {
    console.log("Dynamic Config!")

    config_static_cont.className = 'h-10 mt-1 bg-zinc-700 rounded-tr-md border-x border-t border-zinc-600'
    config_dynamic_cont.className = 'mt-1 h-10'
    config_custom_cont.className = 'h-10 mt-1 bg-zinc-700 rounded-tl-md border-l border-t border-zinc-600'
    config_settings_cont.className = 'h-10 mt-1 bg-zinc-700 border-t border-zinc-600'
    
    config_spacer.className = 'h-10 flex-grow bg-zinc-700 border border-zinc-600 mt-1'

    config_static.className = 'text-xl text-gray-400 py-1 px-5 border-b-2 border-zinc-600 h-full'
    config_dynamic.className = 'text-xl text-yellow-300 py-1 px-5 border-b-2 border-yellow-300 h-full'
    config_custom.className = 'text-xl text-gray-400 py-1 px-5 border-b-2 border-zinc-600 h-full'
    config_settings.className = 'text-xl text-gray-400 py-1 px-5 border-b-2 border-zinc-600 h-full'
});

config_custom.addEventListener('click', () => {
    console.log("Custom Config!")

    config_static_settings.style.display = 'none'
    config_custom_settings.style.display = 'block'

    config_static_cont.className = 'h-10 mt-1 bg-zinc-700 border-l border-t border-zinc-600'
    config_dynamic_cont.className = 'h-10 mt-1 bg-zinc-700 rounded-tr-md border-x border-t border-zinc-600'
    config_custom_cont.className = 'mt-1 h-10'
    config_settings_cont.className = 'h-10 mt-1 bg-zinc-700 border-t border-zinc-600'
    
    config_spacer.className = 'h-10 flex-grow bg-zinc-700 rounded-tl-md border border-zinc-600 mt-1'

    config_static.className = 'text-xl text-gray-400 py-1 px-5 border-b-2 border-zinc-600 h-full'
    config_dynamic.className = 'text-xl text-gray-400 py-1 px-5 border-b-2 border-zinc-600 h-full'
    config_custom.className = 'text-xl text-yellow-300 py-1 px-5 border-b-2 border-yellow-300 h-full'
    config_settings.className = 'text-xl text-gray-400 py-1 px-5 border-b-2 border-zinc-600 h-full'
});

config_settings.addEventListener('click', () => {
    console.log("Custom Config!")

    config_static_cont.className = 'h-10 mt-1 bg-zinc-700 border-l border-t border-zinc-600'
    config_dynamic_cont.className = 'h-10 mt-1 bg-zinc-700 border-l border-t border-zinc-600'
    config_custom_cont.className = 'h-10 mt-1 bg-zinc-700 border-l border-t border-zinc-600'
    config_settings_cont.className = 'mt-1 h-10'
    
    config_spacer.className = 'h-10 flex-grow bg-zinc-700 rounded-tr-md border border-zinc-600 mt-1'

    config_static.className = 'text-xl text-gray-400 py-1 px-5 border-b-2 border-zinc-600 h-full'
    config_dynamic.className = 'text-xl text-gray-400 py-1 px-5 border-b-2 border-zinc-600 h-full'
    config_custom.className = 'text-xl text-gray-400 py-1 px-5 border-b-2 border-zinc-600 h-full'
    config_settings.className = 'text-xl text-yellow-300 py-1 px-5 border-b-2 border-yellow-300 h-full'
});