var sessionId = "";
var userData = new Array();
var pimbaConfig = {
    'url_login'              :"http://93.156.34.198:8080/api/login",
    'url_userData'           :"http://93.156.34.198:8080/api/users",
    'url_getPerspectiveCards':"http://93.156.34.198:8080/api/perspectives"
};

/*
 * Trigger en el onload que inicia FAP
 **/
window.onload = docReady();

/*
 *  Inicia (y logea temporalmente a lo bruto)
 */
function docReady() {  
    aOptions = [];
    oRZe = new rZe(aOptions);
    login("pimba", "pimba");
}

/*
 * Cliente para Login Pimba
 **/
function login(username, password) {
    $.ajax({
        type: 'POST',
        url: pimbaConfig["url_login"],
        data:{
            'username': username,
            'password': password
        },
        dataType: 'json',
        success: function(data) {
            sessionId = data.token;
            getUserData();
        }
    });
}

/*
 * Cliente para user->get Pimba
 **/
function getUserData() {
    $.ajax({
        type: 'GET',
        url: pimbaConfig["url_userData"],
        success: function(data) {
            userData = data;
            fillSelectPerspectives();
        },beforeSend: function (xhr) {
            xhr.setRequestHeader ("Authorization", "Bearer " + sessionId);
        },error: function(){
            console.log("Error getCardsData");
        }
    });     
}

/*
 * Cliente para user->get Pimba
 **/
function getPerspectiveData(id_perspective) {
    $.ajax({
        type: 'GET',
        url: pimbaConfig["url_getPerspectiveCards"] + "/"+ id_perspective,
        success: function(data) {
            oRZe.dataWidgetOrigin = data;   //convertArray(data);
            oRZe.go(); // Array de datos en dataExample.js
        },beforeSend: function (xhr) {
            xhr.setRequestHeader ("Authorization", "Bearer " + sessionId);
        },error: function(){
            console.log("Error getCardsData");
        }
    });     
}

/*
* Añade opciones al select de perspectivas desde userData
*/
function fillSelectPerspectives() {
    for (var i=0; i<userData.perspectives.length;i++) {
        $("#rze_perspectives select").append(new Option('Perspective #'+userData.perspectives[i], userData.perspectives[i], false, false));        
    }
}
