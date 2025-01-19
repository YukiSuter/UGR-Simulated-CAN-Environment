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

function getMessages(){
    websocket.send("getMessages");
}

// When websocket is established, call the getReadings() function
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

    var d = new Date(); // for now
    var timeString = "[" + d.getDay() + "/" + d.getMonth() + "/" + d.getFullYear() + "; " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + "]"

    console.log(wsEvent)

    if (keys.length > 0) {
        if (keys[0] = "type") {
            if (wsEvent.type = "canRx") {
                can_box = document.getElementById("canBox")
                var rxID = wsEvent.body.id
                var rxData = wsEvent.body.data
                var rxLength = wsEvent.body.dataLength

                var stringMsg = timeString + " ID: 0x" + rxID.toString(16) + "; Data Length: 0x" + rxLength + "; Data: [ "

                for (let i = 0; i < rxLength-1; i++) {
                    stringMsg += "0x"+rxData[i].toString(16) + " "
                } 

                can_box.value += stringMsg + "]\n"
                can_box.scrollTop = can_box.scrollHeight 
            }
        } else {
            console.log("Unknown message type")
        }
    } else {
        console.log("Empty message received.")
    }

    
}

// UI

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
    console.log("CAN submit pressed!")

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/send_CAN?messageID="+can_address.value, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send();
});

config_static.addEventListener('click', () => {
    console.log("Static Config!")

    config_static_settings.style.display = 'block'
    config_custom_settings.style.display = 'none'

    config_static_cont.className = 'mt-1 h-10 border-l border-slate-700'
    config_dynamic_cont.className = 'h-10 mt-1 bg-slate-700 rounded-tl-md border-l border-t border-slate-600'
    config_custom_cont.className = 'h-10 mt-1 bg-slate-700 border-l border-t border-slate-600'
    config_settings_cont.className = 'h-10 mt-1 bg-slate-700 border-t border-slate-600'
    
    config_spacer.className = 'h-10 flex-grow bg-slate-700 border border-slate-600 mt-1'

    config_static.className = 'text-xl text-sky-300 py-1 px-5 border-b-2 border-sky-300 h-full'
    config_dynamic.className = 'text-xl text-gray-400 py-1 px-5 border-b-2 border-slate-600 h-full'
    config_custom.className = 'text-xl text-gray-400 py-1 px-5 border-b-2 border-slate-600 h-full'
    config_settings.className = 'text-xl text-gray-400 py-1 px-5 border-b-2 border-slate-600 h-full'
});

config_dynamic.addEventListener('click', () => {
    console.log("Dynamic Config!")

    config_static_cont.className = 'h-10 mt-1 bg-slate-700 rounded-tr-md border-x border-t border-slate-600'
    config_dynamic_cont.className = 'mt-1 h-10'
    config_custom_cont.className = 'h-10 mt-1 bg-slate-700 rounded-tl-md border-l border-t border-slate-600'
    config_settings_cont.className = 'h-10 mt-1 bg-slate-700 border-t border-slate-600'
    
    config_spacer.className = 'h-10 flex-grow bg-slate-700 border border-slate-600 mt-1'

    config_static.className = 'text-xl text-gray-400 py-1 px-5 border-b-2 border-slate-600 h-full'
    config_dynamic.className = 'text-xl text-sky-300 py-1 px-5 border-b-2 border-sky-300 h-full'
    config_custom.className = 'text-xl text-gray-400 py-1 px-5 border-b-2 border-slate-600 h-full'
    config_settings.className = 'text-xl text-gray-400 py-1 px-5 border-b-2 border-slate-600 h-full'
});

config_custom.addEventListener('click', () => {
    console.log("Custom Config!")

    config_static_settings.style.display = 'none'
    config_custom_settings.style.display = 'block'

    config_static_cont.className = 'h-10 mt-1 bg-slate-700 border-l border-t border-slate-600'
    config_dynamic_cont.className = 'h-10 mt-1 bg-slate-700 rounded-tr-md border-x border-t border-slate-600'
    config_custom_cont.className = 'mt-1 h-10'
    config_settings_cont.className = 'h-10 mt-1 bg-slate-700 border-t border-slate-600'
    
    config_spacer.className = 'h-10 flex-grow bg-slate-700 rounded-tl-md border border-slate-600 mt-1'

    config_static.className = 'text-xl text-gray-400 py-1 px-5 border-b-2 border-slate-600 h-full'
    config_dynamic.className = 'text-xl text-gray-400 py-1 px-5 border-b-2 border-slate-600 h-full'
    config_custom.className = 'text-xl text-sky-300 py-1 px-5 border-b-2 border-sky-300 h-full'
    config_settings.className = 'text-xl text-gray-400 py-1 px-5 border-b-2 border-slate-600 h-full'
});

config_settings.addEventListener('click', () => {
    console.log("Custom Config!")

    config_static_cont.className = 'h-10 mt-1 bg-slate-700 border-l border-t border-slate-600'
    config_dynamic_cont.className = 'h-10 mt-1 bg-slate-700 border-l border-t border-slate-600'
    config_custom_cont.className = 'h-10 mt-1 bg-slate-700 border-l border-t border-slate-600'
    config_settings_cont.className = 'mt-1 h-10'
    
    config_spacer.className = 'h-10 flex-grow bg-slate-700 rounded-tr-md border border-slate-600 mt-1'

    config_static.className = 'text-xl text-gray-400 py-1 px-5 border-b-2 border-slate-600 h-full'
    config_dynamic.className = 'text-xl text-gray-400 py-1 px-5 border-b-2 border-slate-600 h-full'
    config_custom.className = 'text-xl text-gray-400 py-1 px-5 border-b-2 border-slate-600 h-full'
    config_settings.className = 'text-xl text-sky-300 py-1 px-5 border-b-2 border-sky-300 h-full'
});