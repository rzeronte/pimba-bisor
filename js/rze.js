var oRZe;

var rZe = function (aOptions) {
    //**************************************************** PROPIEDADES
    var self = this;
    
    /* Propiedades */
    var dataWidgetOrigin               = new Array();
    this.depthHover                    = new Array();
    this.widgetMainDepthWidth          = 100;
    this.widgetMainDepthHeight         = 100;
    this.currentWidgetDragging         = null;
    this.currentWidgetOn               = null;
    this.currentFatherOfWidgetDragging = null;
    this.mouseX                        = 0;
    this.mouseY                        = 0;
    this.maxDepth                      = 4;
    
    /* Callbacks para refresco de información*/
    this.cb_init                       = aOptions['cb_init'];
    this.cb_change_perspective         = aOptions['cb_change_perspective'];

    /* Ejecutamos callback de inicio */
    this.cb_init(self);
    /**
     * Inicia el proceso
     **/        
    this.go = function() {
        
        /* Creamos físicamente cada widget desde el array de datos */
        self.createWidgets(self.dataWidgetOrigin);

        /* Redibujamos widgets*/
        self.widgetsRedraw();
        
        /* ----------------------------------------Droppable genérico - Desktop*/
        $(".rze_container").droppable({
            accept: '.rze_widget',
            drop: function (event, ui) {
                var divFromParent = $(".rze_container > #"+self.currentWidgetDragging);
                if (divFromParent.length > 0) {
                    console.log("El Div ya está en el desktop no se hace nada");
                } else {
                    self.changeWidgetParentInArray(self.currentWidgetDragging, false);
                    $("#"+self.currentWidgetDragging).appendTo(".rze_container");
                    $("#"+self.currentWidgetDragging).attr("position", "absolute");

                    $("#"+self.currentWidgetDragging).css({left:0,top: 0});

                    /* Actualizamos el origen si existiese */
                    if (self.currentFatherOfWidgetDragging != null){
                        self._widgetRedrawChildrens(self.currentFatherOfWidgetDragging);
                        self.setClassByDataDepth();

                        self.currentFatherOfWidgetDragging = null;
                    }                    
                }
            }
        });
    
        /* --------------------------------------- Coordenadas de mouse*/
        $("body").mousemove(function(e){
           var parentOffset = $(this).parent().offset(); 
           //or $(this).offset(); if you really just want the current element's offset
           var relX = e.pageX - parentOffset.left;
           var relY = e.pageY - parentOffset.top;

           self.mouseX = relX;
           self.mouseY = relY;
        });

        self.createDialog();
    }
    
    /*
     * Establece los datos desde un array json
     **/
    this.setJSONDataWidgets = function(data) {
        self.dataWidgetOrigin = data;
        self.go(); // Reinicia el dashboard
    }
    /*
     * Cambia el parentId de un widget en el array de datos
     **/
    this.changeWidgetParentInArray = function(widgetId, newParentId) {
        for (var i = 0; i< dataWidgetOrigin.length; i++) {
            if (dataWidgetOrigin[i]["_id"] == widgetId) {
                dataWidgetOrigin[i]["parent"] = newParentId;
                return;
            }
        }        
    }

    /*
     * Crea un número aleatorio entre min y max
     **/
    this._randomIdentifiers = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    } 

    /*
     * Devuelve si un widget está en el primer nivel o no
     **/
    this._isWidgetFirstDepth = function(idWidget) {
         var widgetInFirstLevel = $(".rze_container").children("#" + idWidget);
         
         if (widgetInFirstLevel.length > 0) {
             return true;
         } else {
             return false;
         }
    }
    
    /*
     * Redibuja todos los widgets
     **/    
    this.widgetsRedraw = function() {
        $(".rze_container > .rze_widget").each(function( index ) {

            self._widgetRedrawChildrens(this);
            
            $(this).css("top", 0);
            $(this).css("left", 0);
            $(this).css("position", "relative");

            /*Set del Tag de depth*/
            $( this ).attr("data-depth", "0");

        });
        
        self.setClassByDataDepth();
    }
    
    /*
     * Redibuja todos los widgets dentro del widget dado
     **/       
    this._widgetRedrawChildrens = function(oChildren) {
            var offsetChildrenX = 0;
            var offsetChildrenY = 10;
            var childrenWidth = self.widgetMainDepthWidth;
            var childrenHeight = self.widgetMainDepthHeight;         
            var separation = 10;

            $(oChildren).children(".rze_widget").each(function( index ) {
                /* Control de la posición */
                $(this).css("position", "relative");
                $(this).css("top", 10);
                $(this).css("left", 0);
            
                /*Set del Tag de depth*/
                var depth = $( this ).parents(".rze_widget").length;
                $( this ).attr("data-depth", depth);
                
                self._widgetRedrawChildrens(this);
        });
        
    }
    
    /**
     * Asigna las clases de profundidad en función del data-depth del widget
     **/
    this.setClassByDataDepth = function() {
        $(".rze_widget").each(function( index ) {
            for (i=0; i <= self.maxDepth; i++) {
                $(this).removeClass("depth_" + i);
            }
            var depth = $( this ).parents(".rze_widget").length;
            $(this).addClass("depth_" + depth);
            $(this).attr("data-depth", depth);
        });
    }
    
    /**
     * Refresca el estilo 'hover' de los widets cuando se apilan/sobreponen
     **/
    this.refreshCascadeSelectWidgets = function(){
        
        $(".rze_widget").each(function( index ) {
            $(this).removeClass("rze_widget_hovered");
        });
        
        for (i=0; i<self.depthHover.length; i++) {
            $("#"+self.depthHover[i]).addClass("rze_widget_hovered");
            var depth = $("#"+self.depthHover[i]).attr("data-depth");
        }
    }
    
    /**
     * Configura y habilita un widget 
     **/    
    this.setupWidget = function(obj) {
        /* Añadimos Tooltip de arrastre (la banza izquierda) */
        var div = $("<div>", {
            "class": 'move'
        });
        $(obj).prepend(div);

        /* Añadimos opción de minimizar/maximizar widget) */
        var div = $("<div>", {
            "class": 'hook',
            "text": "[-]",
            "data-collapsed": "false"
        });
        $(obj).prepend(div);

        $( obj ).append("<span class='identifier' title='Widget'>" + obj.attr("id")+"</span>");   // Debug;

        $(obj).find("span").tooltip({
            show: {
                effect: "slideDown",
                delay: 250
            },
            content: function() {
                var html = "";
                var currentDepth = $(obj).attr("data-depth");
                html+="Identificador: " + obj.attr("id") + "<br/>";
                html+="Estado Draggable: " + $( obj ).attr("data-draggable") + "<br/>";
                html+="---<br/>";
                html+="Nº Hijos: " + $( obj ).children(".rze_widget").length + "<br/>";
                html+="Nº Descendientes: " + $( obj ).find(".rze_widget").length + "<br/>";
                html+="---<br/>";
                html+="Profundidad: " + currentDepth + "<br/>";
                html+="---<br/>";
                html+="Nº Depth uno: " + $( obj ).find("div[data-depth='"+parseInt(parseInt(currentDepth)+1)+"']" ).length + "<br/>";
                html+="Nº Depth dos: " + $( obj ).find("div[data-depth='"+parseInt(parseInt(currentDepth)+2)+"']" ).length + "<br/>";
                html+="Nº Depth tres: " + $( obj ).find("div[data-depth='"+parseInt(parseInt(currentDepth)+3)+"']" ).length + "<br/>";
                html+="Nº Depth cuatro: " + $( obj ).find("div[data-depth='"+parseInt(parseInt(currentDepth)+4)+"']" ).length + "<br/>";
                return html;
            }
        });

        self.setContextMenuForWidget(obj.attr("id"));
        /* --------------------- Creamos la configuración draggable básica*/
        $(obj).resizable();

        $( obj ).draggable({
            snap:        ".containerDev",
            containment: ".rze_container",
            handle:      "div.move",
            zIndex:      10,
            start: function(event, ui) {
                var idWidget = $(this).attr("id");
                self.currentWidgetDragging = idWidget;
                var divParent = $(this).parents(".rze_widget");
                if (divParent.length > 0) {
                    self.currentFatherOfWidgetDragging = divParent;
                }

                $(this).draggable( "option", "zIndex", 15 );
                $(this).addClass("rze_widget_dragging");

                if (!self._isWidgetFirstDepth(idWidget)) {
                    $(".rze_container").droppable( "option", "disabled", false );
                }

                $(".rze_widget").css("overflow", "visible");

                $(this).find(".rze_widget").hide();
            },
            stop: function() {
                self.currentWidgetDragging = null;
                self.currentFatherOfWidgetDragging = null;
                $(this).draggable( "option", "zIndex", 10 );
                $(this).removeClass("rze_widget_dragging");

                $(this).find(".rze_widget").show();

                $(".rze_widget").css("overflow", "hidden");

                //$(this).find(".rze_widget").fadeIn();
            }
        });

        /*-----------------------Creamos la configuración droppable básica*/
        $(obj).droppable({
            accept: '.rze_widget',
            //hoverClass: "hoverClass",
            over: function (event, ui) {
                var idWidget = $(this).attr("id");
                self.currentWidgetOn = idWidget;

                $(".rze_container").droppable( "option", "disabled", true );
                self.depthHover.push(idWidget);
                self.refreshCascadeSelectWidgets();
            },
            out: function (event, ui) {
                if (self.depthHover.length == 0) {
                    self.currentWidgetOn = null;                        
                } else {
                    var stackHover = self.depthHover.pop();
                    var stackLastAfterPop = self.depthHover[self.depthHover.length-1];
                    self.currentWidgetOn = stackLastAfterPop;                                           
                    $(".rze_container").droppable( "option", "disabled", true );
                }

                if (self.currentWidgetOn == null) {
                    $(".rze_container").droppable( "option", "disabled", false );                        
                }

                self.refreshCascadeSelectWidgets();

            },
            drop: function (event, ui) {
                self.changeWidgetParentInArray(self.currentWidgetDragging, self.currentWidgetOn);
                $("#"+self.currentWidgetOn).append($("#"+self.currentWidgetDragging));

                /* Redibujamos la capa destino */
                self._widgetRedrawChildrens($("#"+self.currentWidgetOn));
                self.setClassByDataDepth();

                /* Actualizamos el origen si existiese */
                if (self.currentFatherOfWidgetDragging != null){
                    self._widgetRedrawChildrens(self.currentFatherOfWidgetDragging);
                    self.currentFatherOfWidgetDragging = null;
                }

                $(".rze_widget").css("overflow", "hidden");

                $("#"+self.currentWidgetOn).find(".rze_widget").show();

                self.depthHover = new Array();    
                self.refreshCascadeSelectWidgets();
            }
        });
    }

    /*
    * Añade opciones al select de perspectivas desde userData
    */
    this.fillSelectPerspectives = function(perspectives) {
        for (var i=0; i<perspectives.length;i++) {
            $("#rze_perspectives select").append(new Option('Perspective #'+perspectives[i], perspectives[i], false, false));        
        }
    }
    
    /*
     * Crea en el DOM los div que servirán de widgets desde array de datos
     * recursivamente
     **/
    this.createWidgets = function(widgetsData) {
        widgetsData["parent"] = false;
        self.createWidgetsForWidget(widgetsData);
    }
    /*
     * Crea en el DOM las capas de widgets para un widget dado
     * recursivamente
     */
    this.createWidgetsForWidget = function(widgetData) {
        self.addWidget(
            (widgetData["parent"] == "undefined") ? "false":widgetData["parent"], 
            widgetData["_id"],
            widgetData["title"],
            widgetData["description"]
        );
        var widgetsChildren = widgetData["childs"];
        for (var j=0; j < widgetsChildren.length ; j++){
            self.createWidgetsForWidget(widgetsChildren[j]);
        }
    }

    /**
     * Minimiza el widget dado
     **/           
    this.minimizeWidget = function(idWidget) {
        var widget = $("#" + idWidget);
        
        widget.css("min-height", 15);
        widget.css("height", 15);
        
        widget.css("min-width", 100);
        widget.css("width", 30);
        
        widget.find(".rze_widget").hide();
        widget.find(".rze_info").hide();

        widget.resizable("option", "disabled", true );
    }
    
    /**
     * Maximiza el widget dado
     **/           
    this.maximizeWidget = function(idWidget) {
        var widget = $("#" + idWidget);
        widget.show();
        widget.css("min-height", 40);
        widget.css("height", "auto");
        
        widget.css("min-width", 100);
        widget.css("width", "auto");

        widget.find(".rze_widget").show();
        widget.find(".rze_info").show();
        
        widget.resizable("option", "disabled", false );
        
        widget.find(".hook").text("[+]");
    }

    /**
     * Crea el menú contextual para un widget
     **/     
    this.setContextMenuForWidget = function(idWidget) {
    
        $.contextMenu({
            selector: '#'+ idWidget, 
            callback: function(key, options) {
                var idWidget = options.selector;
                
                if (key == "widget_status_delete") {
                    $(idWidget).remove();
                } else if (key == "widget_status_add") {
                    self.addDialog($(idWidget).attr("id"));
                    //self.addWidget($(idWidget).attr("id"), 0);
                } else {
                    $(idWidget).removeClass("widget_status_off");
                    $(idWidget).removeClass("widget_status_wip");
                    $(idWidget).removeClass("widget_status_ended");
                    $(idWidget).removeClass("widget_status_problem");
                    $(idWidget).removeClass("widget_status_blocked");

                    $(idWidget).addClass(key);
                }
            },
            items: {
                "widget_status_off": {name: "Pendiente", icon: "off"},
                "widget_status_wip": {name: "En proceso", icon: "wip"},
                "widget_status_ended": {name: "Finalizado", icon: "ended"},
                "sep1": "---------",
                "widget_status_problem": {name: "Problema", icon: "problem"},
                "widget_status_blocked": {name: "Bloqueado", icon: "blocked"},
                "sep2": "---------",
                "widget_status_delete": {name: "Eliminar", icon: "delete"},
                "widget_status_add": {name: "Añadir tarjeta", icon: "add"},
                "sep3": "---------",
                "salir": {name: "Salir", icon: "quit"}
            }
        });        
    }
    
    /**
     * Añade un widget, con un padre si es dado
     * Si parent != false, situa en dashboard
     * Si el Id Widget es 0, se autogenera automáticamente
     **/    
    this.addWidget = function(idWidgetParent, idWidget, title, description){
        /* Si no se especifica ID se crea uno aleatorio e insertamos en array general*/
        if (idWidget === 0) {
            idWidget = self._randomIdentifiers(1111, 9999);
            dataWidgetOrigin.push({
                "widgetId": idWidget,
                "data": {
                    "parentId": idWidgetParent,
                    "title": title, 
                    "description": description
                }
            });
        }
        
        var divWidget = $("<div>", {
            "id": idWidget,
            "class": 'rze_widget',
            "data-draggable": "true"
        })
        
        /* Si no se indica parent se crea en el dashboard */
        if (idWidgetParent == false) {
            divWidget.appendTo("div.rze_container");
        } else {
            divWidget.appendTo("#" + idWidgetParent)
        }

        /* Añadimos capa info y cargamos datos en ellas*/
        var divInfo = $("<div>", { "class": 'rze_info' });
        var divInfoTitle = $("<div>", { "class": 'rze_title' });
        var divInfoDescription = $("<div>", { "class": 'rze_desc' });
        $(divInfo).prepend(divInfoTitle);
        $(divInfo).prepend(divInfoDescription);
        $(divWidget).prepend(divInfo);
        divWidget.find(".rze_title").text(title);
        divWidget.find(".rze_desc").text(description);
        
        // Resto de configuraciones en el widget
        self.setupWidget(divWidget);
      
        self.setClassByDataDepth();
        self.widgetsRedraw();
    }

    /**
     * Añade una perspectiva
     **/    
    this.addPerspective = function(idWidget) {
        /* Solo añadimos perspectiva cuando estamos en DashBoards, osea
         * sin perspectiva */
        if ($("#rze_perspectives select").val() <= 0) {
            $("#rze_perspectives select").append(new Option('Perspective #'+idWidget, idWidget, false, false));        
        }
    }

    /*
     *Vacia de widgets el dashboard
     **/
    this.clearDashboard = function() {
        $(".rze_container").html("");
    }
    
    /* Crea las capa para el jquery dialog */
    this.createDialog = function() {
        var divDialog = $("<div>", {
            "id": "rze_popup_add",
            "title": "Crear nueva tarjeta"
        });

        var tagForm = $("<form>", {
            "id"    : "rze_popup_add_form",
            "method": "post"
        });
        
        /* Input para título */
        var inputTitle = document.createElement('input');
        inputTitle.setAttribute('type', 'text');
        inputTitle.setAttribute('placeholder', 'Escribe el título');
        inputTitle.setAttribute('name', 'title');
        $(inputTitle).appendTo(tagForm);
        
        /* Input para descripción */
        var inputDescription = document.createElement('textarea');
        inputDescription.setAttribute('type', 'text');
        inputDescription.setAttribute('placeholder', 'Escribe la descripción');
        inputDescription.setAttribute('name', 'description');
        $(inputDescription).appendTo(tagForm);

        /* Input para parent */
        var inputParent = document.createElement('input');
        inputParent.setAttribute('type', 'text');
        inputParent.setAttribute('value', '0');
        inputParent.setAttribute('name', 'parent');
        $(inputParent).appendTo(tagForm);
        
        /* Input para submit */
        var inputSubmit = document.createElement('input');
        inputSubmit.setAttribute('type', 'submit');
        inputSubmit.setAttribute('value', 'Crear');
        $(inputSubmit).appendTo(tagForm);


        tagForm.appendTo(divDialog);
        divDialog.appendTo("body");
        
        /* Gestión de evento click sobre el boton crear del formulario de alta
        * de widget*/
        $( "#rze_popup_add_form" ).submit(function( event ) {
            var title = $( "#rze_popup_add_form [name='title']").val();
            var description = $( "#rze_popup_add_form [name='description']").val();
            var parentId = $( "#rze_popup_add_form [name='parent']").val();
            
            // Si no tengo perspectiva, añadimos al dashboard
            if ($("#rze_perspectives select").val() <= 0) {
                self.addWidget(parentId, 0, title, description);
                $("#rze_popup_add").dialog("close");
            } else {
                //... y sino añadimos al widget que estámos usando de perspectiva
                self.addWidget(parentId, 0, title, description);
                $("#rze_popup_add").dialog("close");
            }
            // Vaciamos formulario de datos
            this.reset();
            
            event.preventDefault();
        });
        
        $("#rze_popup_add").hide();
    }
    
    /* Activa y muestra el dialogo*/
    this.addDialog = function(idWidget) {
        $( "#rze_popup_add" ).show();
        $( "#rze_popup_add" ).dialog();
        $( "#rze_popup_add_form [name='parent']").val(idWidget);
    }
}
    /**/

$( document ).ready(function() {
    /*
     * Gestión de evento para click en botón de AÑADIR tarjeta
     **/
    $( "#btn_addWidget" ).click(function() {
        oRZe.addDialog(0);
    });
    
    /*
     * Gestión de evento para click en botón de ORDENAR WIDGET
     **/
    $( "#btn_orderWidgets" ).click(function() {
        oRZe.widgetsRedraw();
    }); 

    /*
     * Gestión de evento para cambio de perspectiva
     **/
    $("body").on('change', '#rze_perspectives', function() {
        var optionSelect = $("#rze_perspectives select").val();
        if ( parseInt(optionSelect) > 0) {
            oRZe.clearDashboard();
            //getPerspectiveData();
            oRZe.cb_change_perspective(oRZe, $("#rze_perspectives select").val());

        } else if (parseInt(optionSelect) == 0) {
            oRZe.clearDashboard();
        }
        
    });
    /*
     * Gestión de evento para click en botón de MINIMIZAR WIDGET
     **/    
    $("body").on("click",".hook", function(){
        var status = $(this).attr("data-collapsed");
        var idWidget = $(this).parent().attr("id");
        
        if (status == "true") {
            oRZe.maximizeWidget(idWidget);
            $(this).attr("data-collapsed", "false");
            $(this).text("[-]");
            
        } else if (status == "false") {
            oRZe.minimizeWidget(idWidget);            
            $(this).attr("data-collapsed", "true");
            $(this).text("[+]");
        }
    });
});