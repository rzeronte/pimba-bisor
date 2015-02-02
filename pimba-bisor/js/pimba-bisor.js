var PimbaBisor = function (aOptions) {

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
    this.showSelectorCards             = aOptions['showSelectorCards'];
    this.gridWidth                     = 20;
    this.gridHeight                    = 20;

    // Contenedor de las acciones en los widgets
    if (aOptions['widgetContainerActionClass'] != '') {
        this.widgetContainerActionClass    = aOptions['widgetContainerActionClass'];
    } else {
        this.widgetContainerActionClass    = 'actions';
    }
    this.actions                       = aOptions["actions"];
    /* Callbacks para refresco de información*/
    this.cb_init                       = aOptions['cb_init'];
    this.cb_change_select              = aOptions['cb_change_select'];
    this.cb_update_widget              = aOptions['cb_update_widget'];
    this.cb_edit_widget                = aOptions['cb_edit_widget'];
    this.cb_create_widget              = aOptions['cb_create_widget'];
    this.cb_delete_widget              = aOptions['cb_delete_widget'];

    // Cálculo de columnas automáticas al soltar un widget
    if (aOptions['bootstrapColumnsAutoOnDrop'] != undefined) {
        this.bootstrapColumnsAutoOnDrop = aOptions['bootstrapColumnsAutoOnDrop'];
    } else {
        this.bootstrapColumnsAutoOnDrop = true;
    }

    // Datos de los widgets en estático para el inicio:
    if (aOptions['widgetsData'] != undefined) {
        this.widgetsData               = this.dataWidgetOrigin = aOptions['widgetsData'];
    }

    /* Control de la instalación tipo bower o pelo */
    if (aOptions["bowerInstallation"] == undefined) {
        this.bowerInstallation        = true;
    } else {
        this.bowerInstallation        = aOptions["bowerInstallation"];
    }

    this.ready                        = false;

    /*Template para el widget, si no se definen se usan por defecto */
    if (typeof(aOptions['depthTemplates']) == 'undefined') {
        this.depthTemplates = {
            0: { file: '../pimba-bisor/templates/default-card.html', id:'bisor-template-default'},
            1: { file: '../pimba-bisor/templates/small-card.html',   id:'bisor-template-small'},
            2: { file: '../pimba-bisor/templates/big-card.html',     id:'bisor-template-big'}
        };
    } else {
        this.depthTemplates            = aOptions['depthTemplates'];
    }

    this.constructor = function(aOptions) {
        console.log('[Bisor]constructor')

        /* Ejecutamos callback de inicio */
        if (typeof(this.cb_init) === 'function') {
            this.cb_init(self);
        }

        /* Cargámos el template controlando los origenes, si la instalación es bower o no */
        var bowerSource = "";
        if (self.bowerInstallation == true) {
            var bowerSource = 'bower_components/pimba-bisor/';
        }

        // Cargamos vía AJAX las templates
        self.loadStaticTemplates(bowerSource);

    }

    //***************************************************************** MÉTODOS
    /*
    * Incorpora a self.widgetContainerActionClass una acción personalizada
    */
    this.addAction = function(divActionsContainer, aOptions) {
        var action = $("<div>", aOptions);
        $(action).appendTo(divActionsContainer);
    }

    /**
     * Inicia pimba-bisor
     **/
    this.go = function() {
        console.log("[Bisor] Go");
        self.clearDashboard();
        /* Creamos físicamente cada widget desde el array de datos */
        self.createWidgets(self.dataWidgetOrigin);

        self.updateResizers();
        //Bindeos para controles que hacen resizable mediante bootstrap los widgets
        self.resizeBindControls();

    }

    /*
    * Reposiciona las capas de resizamiento del widget indicado
    * */
    this.updateResizersForWidget = function (widgetId) {
        var widget = $("#" + widgetId);

        widget.find(".resize_top").position(   { of : "#" + widget.attr("id"), at: 'center top', my: 'center top' }).fadeTo('fast', 0);
        widget.find(".resize_bottom").position({ of : "#" + widget.attr("id"), at: 'center bottom', my: 'center bottom' }).fadeTo('fast', 0);
        widget.find(".resize_left").position(  { of : "#" + widget.attr("id"), at: 'left center', my: 'left center' }).fadeTo('fast', 0);
        widget.find(".resize_right").position( { of : "#" + widget.attr("id"), at: 'right center', my: 'right center' }).fadeTo('fast', 0);

    }

    /*
    * Bindea los eventos sobre las capas de resize para los widgets
    * */
    this.resizeBindControls = function() {
        $( ".resize_top" ).on( "click", function() {

        });

        $( ".resize_bottom" ).on( "click", function() {
        });

        // Resize Izquierda
        $( ".resize_left" ).on( "click", function() {
            var widget = $(this).parent();

            var currentColMd = self.getColMdForWidget(widget.attr("id"));

            if (currentColMd > 1 ) {
                widget.removeClass("col-md-" + currentColMd);
                widget.addClass("col-md-"+parseInt(currentColMd - 1))
                self.updateResizers();
            } else {
                console.log("mínimo o máximo");
            }
        });

        // Resize Right
        $( ".resize_right" ).on( "click", function() {
            var widget = $(this).parent();

            var currentColMd = self.getColMdForWidget(widget.attr("id"));

            if ( currentColMd < 12) {
                widget.removeClass("col-md-" + currentColMd);
                widget.addClass("col-md-"+parseInt(currentColMd + 1))
                self.updateResizers();
            } else {
                console.log("mínimo o máximo");
            }
        });

        $( ".resize_control" ).on( "mouseenter", function() {
            $( this ).fadeTo( "fast", 1 );
        });


        $( ".resize_control" ).on( "mouseout", function() {
            $( this ).fadeTo( "fast", 0 );
        });
    }

    this.updateResizers = function() {
        $(".rze_widget").each(function( index ) {
            self.updateResizersForWidget($(this).attr("id"))
        });
    }

    /*
    * Devuelve el tamaño de la columna bootstrap para un widget (class col-md-x)
    * */
    this.getColMdForWidget = function(widgetId) {
        var widget = $("#" + widgetId);
        for (var index = 1; index<=12;index++) {
            if (widget.hasClass("col-md-"+index)) {
                return index;
            }
        }

        return false;
    }

    /*
     * Carga templates para dialogo y para depth de tarjetas
     **/
    this.loadStaticTemplates = function(prefixBower) {

        // Templates para widgets
        var elementosCargados = 0;
        var elementosParaCargar= Object.keys(self.depthTemplates).length;

        for (var i in self.depthTemplates) {

            if (self.bowerInstallation == true) {
                var fileRoute = 'bower_components/pimba-bisor/' + self.depthTemplates[i]['file'];
            } else {
                var fileRoute = self.depthTemplates[i]['file'];
            }

            $.ajax({
                type: 'GET',
                url: fileRoute,
                success: function(data) {
                    console.log(elementosCargados +"-"+elementosParaCargar);
                    elementosCargados++;
                    if (elementosCargados == elementosParaCargar) {
                        self.ready = true;
                        console.log("ready");
                    }
                    $(".rze_container").after(data);
                },error: function(){ console.log("Error loadTemplateWidget[depthTemplates]");  }
            });
        }
        console.log("fin loadStaticTemplates")
    }

    /*
     * Establece los datos desde un array json
     **/
    this.setJSONDataWidgets = function(data) {
        self.dataWidgetOrigin = data;
    }

    /*
     * Cambia el parentId de un widget en el array de datos: MAL
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
     * Establece la posición X e Y para un widget
     * 
     */
    this.setWidgetPositionXYInArray = function (widgetId, X, Y) {

        for (var i = 0; i< dataWidgetOrigin.length; i++) {
            if (dataWidgetOrigin[i]["_id"] == widgetId) {
                dataWidgetOrigin[i]["posX"] = 69;
                dataWidgetOrigin[i]["posY"] = 69;
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
     * Redibuja todos los widgets dentro del widget dado
     **/
    this._widgetRedrawChildrens = function(oChildren) {

        var liItems = $(".rze_container > .rze_widget .rze_widget").get();

        for(var i = liItems.length - 1; i >= 0; --i) {
            //$(liItems[i]).width($(liItems[i]).find( " >.content").width());
        }

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
            $("#"+self.depthHover[i]).addClass("rze_widget_hovered");
            var depth = $("#"+self.depthHover[i]).attr("data-depth");
        }
    }

    /**
     * Crea capa de acciones en un widget y lo hace draggable y droppable
     **/
    this.setupWidget = function(obj, widgetData) {

        /* Container de acciones en el widget*/
        var divActionResizeTop    = $("<div>", { "class": "resize_control resize_top"});
        var divActionResizeBottom = $("<div>", { "class": "resize_control resize_bottom"});
        var divActionResizeLeft   = $("<div>", { "class": "resize_control resize_left"});
        var divActionResizeRight  = $("<div>", { "class": "resize_control resize_right"});

        $(obj).append(divActionResizeTop);
        $(obj).append(divActionResizeBottom);
        $(obj).append(divActionResizeLeft);
        $(obj).append(divActionResizeRight);

        var divActions = $("<div>", {
            "class": self.widgetContainerActionClass
        });

        if (self.actions != undefined) {
            for (var i=0; i<self.actions.length; i++) {
                self.addAction(divActions, self.actions[i]);
            }
        }

        $(obj).append(divActions);

        var divContent = $("<div>", {
            "class": 'content'
        });

        $(obj).append(divContent);

        if (!self._isWidgetFirstDepth(obj.attr("id"))) {
            /* Añadimos Tooltip de arrastre (la banza izquierda) */
            var div = $("<div>", {
                "class": 'move label label-primary',
                "title": 'Move card',
                'text': 'Move'
            });
            $(divActions).prepend(div);
        }

        // Añadimos la capa para los hijos
        var divChilds =  $("<div>", {
            "class": 'childs row'
        });

        divChilds.appendTo(obj);

        /* Si no se indica parent se crea en el dashboard */
        if (widgetData['parent']== false) {
            obj.appendTo("div.rze_container");
            obj.addClass("dashboard");
        } else {
            obj.appendTo("#" + widgetData['parent'] + "> .childs");
        }


        // HACEMOS EL WIDGET DRAGGABLE
        $(obj).draggable({
            handle     : "div.move",
            zIndex     : 10,
            revert: 'valid',
            opacity: 0.25,
            start: function(event, ui) {
                $(this).draggable("option", "cursorAt", {
                    cursor: "move",
                    left: Math.round($(this).outerWidth() / 2),
                    top: Math.round($(this).outerHeight() / 2)
                });

                var idWidget = $(this).attr("id");
                $(this).addClass("current");

                self.currentWidgetDragging = idWidget;
                var divParent = $(this).parents(".rze_widget");
                if (divParent.length > 0) {
                    self.currentFatherOfWidgetDragging = divParent;
                }

                $(this).draggable( "option", "zIndex", 15 );
                $(this).addClass("rze_widget_dragging");

                // Sin esto no se ve el drag fuera del container (no podemos sacar a otro widget)
                $(".rze_widget").css("overflow", "visible");
            },
            stop: function() {
                $(".rze_ghost").remove();
                self.currentWidgetDragging = null;
                self.currentFatherOfWidgetDragging = null;
                $(this).draggable( "option", "zIndex", 10 );
                $(this).removeClass("rze_widget_dragging");
                $(".rze_widget").css("overflow", "hidden");
                $(this).removeClass("current");
            }
        });

        /*-----------------------Creamos la configuración droppable básica*/
        $(obj).droppable({
            accept: '.rze_widget',
            over: function (event, ui) {
                //Actualizamos el widget sobre el que nos encontramos
                var idWidget = $(this).attr("id");
                self.currentWidgetOn = idWidget;
                console.log("over) self.currentWidgetOn:"+ idWidget);

                // Como podemos estar encima de varios
                // guardamos el últimos sobre el quenos encontramos
                self.depthHover.push(idWidget);
                $(this).addClass("rze_widget_hovered")

                if (self.currentWidgetOn != $("#"+self.currentWidgetDragging).parent().parent().attr("id") &&
                self.currentWidgetOn != $(".rze_container >.rze_widget:first").attr("id")) {
                    // Creamos una copia de la capa que arrastramos y la colocamos antes de la que nos hemos
                    //posicionado

                    var divClone = $("<div/>", {
                        class: 'rze_widget rze_ghost'
                    });

                    divClone.html($("#"+self.currentWidgetDragging).html());

                    var currentMd = self.getColMdForWidget(self.currentWidgetDragging);

                    divClone.removeClass("col-md-"+ currentMd);
                    divClone.addClass("col-md-1");

                    //$(this).find(">.childs").prepend(divClone);
                }
            },
            out: function (event, ui) {
                $(".rze_ghost").remove();
                // Si salimos, eliminamos la referencia del array dephHover
                $(this).removeClass("rze_widget_hovered")

                if (self.depthHover.length == 0) {
                    self.currentWidgetOn = null;
                } else {
                    var stackHover = self.depthHover.pop();
                    var stackLastAfterPop = self.depthHover[self.depthHover.length-1];
                    self.currentWidgetOn = stackLastAfterPop;
                }
                console.log("out) self.currentWidgetOn:"+ self.currentWidgetOn);

                //self.refreshCascadeSelectWidgets();
            },
            drop: function (event, ui) {
                var draggableId = ui.draggable.attr("id");
                var droppableId = $(this).attr("id");

                $(".rze_ghost").remove();
                $(this).removeClass("rze_widget_hovered")

                // HACK Jquery: Para evitar que se dispare el drop hacia atrás
                // comprobamos adcionalmente que el drop que ejecuta esto, es el del
                //  widget
                console.log("self.currentWidgetOn:"+ self.currentWidgetOn +" - attr(id):"+ droppableId);

                if (self.currentWidgetOn == droppableId) {
                    // Solo hago cosas si cambio de padre el widget que arrastro
                    if (self.currentWidgetOn != $("#"+self.currentWidgetDragging).parent().parent().attr("id")) {
                        // callback de actualización
                        if (typeof(self.cb_update_widget) === 'function' ) {
                            self.cb_update_widget(self, {
                                '_id': self.currentWidgetDragging,
                                'parent': self.currentWidgetOn,
                                'title': $(self.currentWidgetDragging + " [name='title']").val(),
                                'description': $(self.currentWidgetDragging + " [name='description']").val(),
                                'from': (self.currentFatherOfWidgetDragging != null) ? self.currentFatherOfWidgetDragging.attr("id") : null
                            });
                        }
                        // Cambiamos el padre en el array de datos
                        self.changeWidgetParentInArray(self.currentWidgetDragging, self.currentWidgetOn);

                        // Movemos el widget físicamente
                        $("#"+self.currentWidgetOn + "> .childs").append($("#"+self.currentWidgetDragging));


                        // Cambiamos la posición X e Y en el array de datos (con el widget ya movido físicamente)
                        self.setWidgetPositionXYInArray(self.currentWidgetDragging, 69, 69);

                        // Redibujamos la capa destino
                        self._widgetRedrawChildrens($("#"+self.currentWidgetOn));

                        self.setClassByDataDepth();

                        self.calcBootstrapGrid(self.currentWidgetDragging);
                        self.updateResizers();

                        // Actualizamos el origen si existiese
                        if (self.currentFatherOfWidgetDragging != null){
                            self._widgetRedrawChildrens(self.currentFatherOfWidgetDragging);
                            self.currentFatherOfWidgetDragging = null;
                        }
                    } else {
                        // Cambiamos la posición X e Y en el array de datos (con el widget ya movido físicamente)
                        self.setWidgetPositionXYInArray(self.currentWidgetDragging, 69, 69);
                    }
                    $(".rze_widget").css("overflow", "hidden");
                    $("#"+self.currentWidgetOn).find(".rze_widget").show();
                    self.depthHover = new Array();
                    //self.refreshCascadeSelectWidgets();
                }
            }
        });
    }

    /*
    * Cambia el col-md de un widget en relacion al resto de su mismo nivel
    * */
    this.calcBootstrapGrid = function(widgetId) {
        // Eliminamos actual col-md
        for (i=1;i<=12;i++) {
            $("#"+widgetId).removeClass("col-md-"+i);
        }

        if (self.bootstrapColumnsAutoOnDrop) {

            var widgetParent = $("#"+widgetId).parent().parent();
            var hermanos     = widgetParent.find(">.childs >.rze_widget");
            var numHermanos  = hermanos.length;

            var columnas = 0;
            for (var i=0; i<hermanos.length;i++) {
                var idHermano= $(hermanos[i]).attr("id");
                if ( idHermano != widgetId) {
                    columnas+=self.getColMdForWidget(idHermano);
                }
            }

            console.log("Hay ocupadas:" + columnas);

            // Si es menor que 12, ocupamos tó el espacio libre
            if (columnas < 12) {
                $("#"+widgetId).addClass("col-md-" + parseInt(12-columnas));
            } else {
                var newColMd = 12/ numHermanos;
                // Si es entero, todas son iguales con el cambio
                if (Math.floor(newColMd) == newColMd && $.isNumeric(newColMd)) {
                    // Ancho igualpara todos;

                    for (var i=0; i<hermanos.length;i++) {
                        for (var j=1;j<=12;j++) { $(hermanos[i]).removeClass("col-md-" + j); }
                        $(hermanos[i]).addClass("col-md-"+newColMd);
                    }

                } else {
                    var newColMd = Math.floor(newColMd);
                    var ocupacion = newColMd*hermanos.length;

                    var diferencia = 0;

                    if (ocupacion < 12) {
                        diferencia = 12 - ocupacion;
                    }

                    //console.log("no es igual, todas a " + newColMd + "ocupan ("+diferencia+"), menos una con diferencia de " + diferencia);

                    for (var i=0; i<hermanos.length;i++) {
                        for (var j=1;j<=12;j++) { $(hermanos[i]).removeClass("col-md-" + j); }
                        if (i == 0) {
                            $(hermanos[i]).addClass("col-md-" + parseInt(newColMd + diferencia));
                        } else {
                            $(hermanos[i]).addClass("col-md-"+newColMd);
                        }
                    }
                }
            }
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
        self.addWidget(widgetData);

        var widgetsChildren = widgetData["childs"];
        if (typeof(widgetsChildren) != 'undefined') {
            for (var j=0; j < widgetsChildren.length ; j++) {
                self.createWidgetsForWidget(widgetsChildren[j]);
            }
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

        widget.resizable("option", "disabled", false );

    }

    /**
     * Añade un widget, con un padre si es dado
     * Si parent != false, situa en dashboard
     * Si el Id Widget es 0, se autogenera automáticamente
     **/
    this.addWidget = function(widgetData) {
        var idWidget = widgetData["_id"];

        var idWidgetParent = (widgetData["parent"] == "undefined") ? "false":widgetData["parent"];

        /* Si no se especifica ID se crea uno aleatorio e insertamos en array general*/
        if (idWidget === 0) {
            idWidget = self._randomIdentifiers(1111, 9999);
        }

        // Contenedor principal del widget
        var divWidget = $("<div>", {
            "id": idWidget,
            "class": 'rze_widget col-md-'+widgetData["col-md"],
            "data-draggable": "true"
        });

        //$('[data-toggle="tooltip"]').tooltip({
        //    'placement': 'top'
        //});

        // Resto de configuraciones en el widget
        self.setupWidget(divWidget, widgetData);
        self.loadDataInTemplateWidget(widgetData);

        self.setClassByDataDepth();
    }

    /*
     * Carga en un widget su template e inyecta sus datos en el
     **/
    this.loadDataInTemplateWidget = function(widgetData) {
        var widget   = $("#" + widgetData['_id']);
        var depth = widget.parents(".rze_widget").length;
        var templatesDefined = Object.keys(self.depthTemplates).length;

        if (depth >= templatesDefined) {
            depth = 0;
        }

        var idTemplate = self.depthTemplates[depth]['id'];
        var template = $("#"+idTemplate);
        widget.children(".bisor-theme-default").remove();
        widget.children(".content").html($(template).html());

        /* Rastreamos el array de widget para sustituir en el template */
        for (var i in widgetData) {
            if (typeof(widgetData[i]) != 'object') {
                widget.children(".content").find("[data-pimba-field='" + i + "']").text(widgetData[i]);
            }
        }


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

    /*
     * Elimina un widget
     **/
    this.deleteWidget = function(idWidget) {
        $("#"+idWidget).remove();
        /* callback de eliminación de widget*/
        if (typeof(self.cb_delete_widget) === 'function' ) {
            self.cb_delete_widget(self, {
                _id: idWidget
            });
        }
    }

    /* Inserta la información de un widget en el array donde corresponda */
    this.insertWidgetData = function(widgetData){
        var parentId = widgetData["parent"];
    }

    /* Lanzamos al final una vez definidos todos los métodos*/
    self.constructor(aOptions);
}