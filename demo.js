/*
 * Trigger en el onload que inicia FAP
 **/
window.onload = login("pimba", "pimba");

/*
 * Ejemplo básico Ajax para logeo en la API Pimba
 **/
function login(username, password) {
    var pimbaConfig = {
        'url_login' : "http://93.156.34.198:8080/api/login"
    };

    $.ajax({
        type: 'POST',
        url : pimbaConfig["url_login"],
        data: { 'username': username, 'password': password },
        dataType: 'json',
        success : function(data) {
            fakePrivatePimbasProject(data.token);
        },
        error: function() {
            alert("Se ha producido un error en el login");
        }
    });
}

/*
 * Ejemplo de inicializacioń del pimba-bisor, para un cliente ya logeado.
 **/
function fakePrivatePimbasProject(sessionId) {
    var pimbaConfig = {
        'url_userData'           :"http://93.156.34.198:8080/api/users",
        'url_getPerspectiveCards':"http://93.156.34.198:8080/api/perspectives"
    };
    
    /* Callbacks de eventos:
     * 
     * Son funciones que permiten customizar el comportamiento de una app que utilice pimba-bisor
     * pimba-bisor ejecutará estas funciones en momentos determinados según el tipo de callback que
     * sea.
     * 
     * En nuestro caso usaremos estos callbacks para negociar contra api-pimba-server y actualizar
     * pimba-bisor a nuestro antojo
     * */
    aOptions = {
            /* callback de inicio del dashboard */
            'cb_init': function (objRZe) {
                    $.ajax({
                        type: 'GET',
                        url: pimbaConfig["url_userData"],
                        success: function(data) {
                            /*Actualización de select del pimba-bisor*/
                            objRZe.fillSelectPerspectives(data.perspectives);
                        },beforeSend: function (xhr) {
                            xhr.setRequestHeader ("Authorization", "Bearer " + sessionId);
                        },error: function(){
                            console.log("Error getCardsData");
                        }
                    });     
                },
            /* callback para cambio de perspectiva en selector de las mismas */
            'cb_change_perspective': function (objRZe, id_perspective) {
                $.ajax({
                    type: 'GET',
                    url: pimbaConfig["url_getPerspectiveCards"] + "/" + id_perspective,
                    success: function(data) {
                        /* Establece datos de tarjetas y refresca el dashboard*/
                        objRZe.setJSONDataWidgets(data);
                    },beforeSend: function (xhr) {
                        xhr.setRequestHeader ("Authorization", "Bearer " + sessionId);
                    },error: function(){
                        console.log("Error getCardsData");
                    }
                });     
            }
    };
    
    oRZe = new rZe(aOptions);
}