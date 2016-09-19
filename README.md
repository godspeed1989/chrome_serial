# chrome_serial
Chrome Serial Tool Using chrome.serial API


chrome.serial.getDevices(function callback)


chrome.serial.connect(string path, ConnectionOptions options, function callback)


chrome.serial.disconnect(integer connectionId, function callback)


chrome.serial.send(integer connectionId, ArrayBuffer data, function callback)


chrome.serial.onReceive.addListener(function callback)

