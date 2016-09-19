var connectionId = -1;
var readBuffer = '';

function onRead(readInfo) {
    var uint8View = new Uint8Array(readInfo.data);
    var string = new TextDecoder("utf-8").decode(uint8View);
    var txt = document.createTextNode(string);
    document.getElementById('txtRecv').appendChild(txt);
};

function onOpen(openInfo) {
    if (typeof(openInfo) == "undefined") {
        return;
    }
    connectionId = openInfo.connectionId;
    console.log('connectionId: ' + connectionId);
    if (connectionId == -1) {
        setStatus('Could not open');
        return;
    }
    setStatus('Connected\n'
              +'bitrate: '+openInfo.bitrate+'\n'
              +'dataBits: '+openInfo.dataBits+'\n'
              +'parityBit: '+openInfo.parityBit+'\n'
              +'stopBits: '+openInfo.stopBits);
    document.getElementById('open-input').disabled = true;
    document.getElementById('close-input').disabled = false;
    document.getElementById('send-input').disabled = false;
};

function onClose(result) {
    console.log('onClose() '+result);
    setStatus('DisConnected');
    connectionId = -1;
    document.getElementById('open-input').disabled = false;
    document.getElementById('close-input').disabled = true;
    document.getElementById('send-input').disabled = true;
}

function setStatus(status) {
    document.getElementById('status').innerText = status;
}

function onSent(sendInfo) {
    console.log('onSend() '+sendInfo.bytesSent);
}
/////////////////////////////////////////////////////////////////////
function buildPortPicker(ports) {
    console.log('buildPortPicker()');
    var portPicker = document.getElementById('port-picker');
    ports.forEach(function(port) {
        var portOption = document.createElement('option');
        portOption.value = portOption.innerText = port.path;
        portPicker.appendChild(portOption);
    });
}

var ConnectionOptions = {
    bitrate     : 9600,
    dataBits    : 'eight',
    parityBit   : 'no',
    stopBits    : 'one',
    persistent  : true
};

function openSelectedPort() {
    console.log('openSelectedPort()');
    var portPicker = document.getElementById('port-picker');
    var selectedPort = portPicker.options[portPicker.selectedIndex].value;
    var baudPicker = document.getElementById('baud-picker');
    var selectedBaud = baudPicker.options[baudPicker.selectedIndex].value;
    console.log(selectedPort + ' ' + selectedBaud);
    ConnectionOptions.bitrate = Number(selectedBaud);
    chrome.serial.connect(selectedPort, ConnectionOptions, onOpen);
}

function closeSelectedPort() {
    if (connectionId != -1) {
        console.log('closeSelectedPort() ' + connectionId);
        chrome.serial.disconnect(connectionId, onClose);
    }
}

function str2ab(str) {
    var buf = new ArrayBuffer(str.length); // 1 byte for each char
    var bufView = new Uint8Array(buf);
    for (var i=0, strLen=str.length; i<strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

function sendString() {
    console.log('sendString()');
    if (connectionId != -1) {
        var data = document.getElementById('txtSend').value;
        chrome.serial.send(connectionId, str2ab(data), onSent);
    }
}

/////////////////////////////////////////////////////////////////////

onload = function() {
    document.getElementById('open-input').disabled = false;
    document.getElementById('open-input').onclick = function() {
        openSelectedPort();
    };
    document.getElementById('close-input').disabled = true;
    document.getElementById('close-input').onclick = function() {
        closeSelectedPort();
    };
    document.getElementById('send-input').disabled = true;
    document.getElementById('send-input').onclick = function() {
        sendString();
    };
   
    chrome.serial.onReceive.addListener(onRead);
    chrome.serial.getDevices(function(ports) {
        buildPortPicker(ports)
    });
};
