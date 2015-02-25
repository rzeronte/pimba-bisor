var PimbaBisor = function (aOptions) {

    var self = this;
    this.mouseX;
    this.mouseY;

    $(document).mousemove(function(e) {
        self.mouseX = e.pageX;
        self.mouseY = e.pageY;
    });

    /* Propiedades */
    var dataWidgetOrigin               = new Array();
    this.currentWidgetDragging         = null;
    this.currentFatherOfWidgetDragging = null;
    this.showSelectorCards             = aOptions['showSelectorCards'];

    // Contenedor de las acciones en los widgets
    if (aOptions['widgetContainerActionClass'] != '') {
        this.widgetContainerActionClass    = aOptions['widgetContainerActionClass'];
    } else {
        this.widgetContainerActionClass    = 'actions';
    }

    // Acciones predefinidas por el usuario
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
        self.loadStaticTemplates();

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

        //widget.find(".resize_top").position(   { of : "#" + widget.attr("id"), at: 'center top', my: 'center top' }).fadeTo('fast', 0);
        //widget.find(".resize_bottom").position({ of : "#" + widget.attr("id"), at: 'center bottom', my: 'center bottom' }).fadeTo('fast', 0);
        //widget.find(".resize_left").position(  { of : "#" + widget.attr("id"), at: 'left center', my: 'left center' }).fadeTo('fast', 0);
        //widget.find(".resize_right").position( { of : "#" + widget.attr("id"), at: 'right center', my: 'right center' }).fadeTo('fast', 0);

        widget.find(".drag_order_top").width(widget.find(".drag_order_top").parent().innerWidth());
        widget.find(".drag_order_top").position(   { of : "#" + widget.attr("id"), at: 'center top', my: 'center top' });

        widget.find(".drag_order_bottom").width(widget.find(".drag_order_bottom").parent().innerWidth());
        widget.find(".drag_order_bottom").position({ of : "#" + widget.attr("id"), at: 'center bottom', my: 'center bottom' });

        widget.find(".drag_order_left").height(widget.find(".drag_order_left").parent().innerHeight());
        widget.find(".drag_order_left").position(  { of : "#" + widget.attr("id"), at: 'left center', my: 'left center' });

        widget.find(".drag_order_right").height(widget.find(".drag_order_right").parent().innerHeight());
        widget.find(".drag_order_right").position( { of : "#" + widget.attr("id"), at: 'right center', my: 'right center' });

    }

    /*
    * Bindea los eventos sobre las capas de resize para los widgets
    * */
    this.resizeBindControls = function() {
        $( ".resize_top" ).on( "click", function() {
            var widget = $(this).parent();
            widget.height(widget.height()-100);
            self.updateResizers();
        });

        $( ".resize_bottom" ).on( "click", function() {
            var widget = $(this).parent();
            widget.height(widget.height()+100);
            self.updateResizers();
        });

        // Resize Izquierda
        $( ".resize_left" ).on( "click", function() {
            var widget = $(this).parent();

            var currentColMd = self.getColMdForWidget(widget.attr("id"));

            if (currentColMd > 1 ) {
                widget.removeClass("col-md-" + currentColMd);
                widget.addClass("col-md-"+parseInt(currentColMd - 1))
                self.updateResizers();
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
    this.loadStaticTemplates = function() {

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
                    elementosCargados++;
                    if (elementosCargados == elementosParaCargar) {
                        self.ready = true;
                    }
                    $(".rze_container").after(data);
                },error: function(){ console.log("Error loadTemplateWidget[depthTemplates]");  }
            });
        }
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

    /**
     * Crea capa de acciones en un widget y lo hace draggable y droppable
     **/
    this.setupWidget = function(obj, widgetData) {

        /* Container de acciones en el widget*/
        //var divActionResizeTop    = $("<div>", { "class": "resize_control resize_top"});
        //var divActionResizeBottom = $("<div>", { "class": "resize_control resize_bottom"});
        //var divActionResizeLeft   = $("<div>", { "class": "resize_control resize_left"});
        //var divActionResizeRight  = $("<div>", { "class": "resize_control resize_right"});
        //
        //$(obj).append(divActionResizeTop);
        //$(obj).append(divActionResizeBottom);
        //$(obj).append(divActionResizeLeft);
        //$(obj).append(divActionResizeRight);

        /* Container de acciones en el widget*/
        var divActionOrderTop    = $("<div>", { "class": "drag_order drag_order_top"});
        var divActionOrderBottom = $("<div>", { "class": "drag_order drag_order_bottom"});
        var divActionOrderLeft   = $("<div>", { "class": "drag_order drag_order_left"});
        var divActionOrderRight  = $("<div>", { "class": "drag_order drag_order_right"});
        $(obj).append(divActionOrderTop);
        $(obj).append(divActionOrderBottom);
        $(obj).append(divActionOrderLeft);
        $(obj).append(divActionOrderRight);

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
            //$(divActions).prepend(div);
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
            //handle     : "div.move",
            zIndex     : 10,
            opacity: 0.5,
//            helper: 'clone',
            scroll:true,
            cursor: 'move',
            refreshPositions:true,
            appendTo: 'body',
            cursorAt: {
                top: 20,
                left: 20
            },
            helper: function (){
                return $("<div style='width: 40px;height:40px;background-color:red;' class='hola'></div>");
            },
            //helper: 'clone',
            start: function(event, ui) {

                var idWidget = $(this).attr("id");
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
            drag: function(event, ui) {
                var offset = ui.helper.offset();

                $(".hola").css("top", self.mouseY);
                $(".hola").css("left", self.mouseX);


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

        $(divActionOrderRight).droppable({
            greedy: true,
            over: function (event, ui) {
                var widgetSobre = $(this).parent().attr("id");
                $("#"+widgetSobre).after($("#"+self.currentWidgetDragging)).show('slow');;
                $("#"+self.currentWidgetDragging).fadeIn('fast');

                console.log("[Bisor] over - drag_border_right from: " + widgetSobre)
            },
            out: function (event, ui) {
                $(".rze_ghost").remove();
                $(this).removeClass("rze_widget_hovered")
            },
            drop: function (event, ui) {
                //alert("se2");
            }
        });

        $(divActionOrderLeft).droppable({
            greedy: true,
            over: function (event, ui) {
                var widgetSobre = $(this).parent().attr("id");
                $("#"+widgetSobre).after($("#"+self.currentWidgetDragging));
                $("#"+self.currentWidgetDragging).fadeIn('fast');

                console.log("[Bisor] over - drag_border_left from: " + widgetSobre)
            },
            out: function (event, ui) {
                $(".rze_ghost").fadeOut('fast');
            },
            drop: function (event, ui) {
                //alert("se2");
            }
        });

        /*-----------------------Creamos la configuración droppable básica*/
        $(obj).find(">.content").droppable({
            accept: '.rze_widget',
            greedy: true,
            start: function(event, ui) {
            },
            over: function (event, ui) {
                var widgetSobre = $(this).parent().attr("id");
                $("#"+self.currentWidgetDragging).hide();
                $("#" + widgetSobre + " >.childs").append($("#"+self.currentWidgetDragging));
                $("#"+self.currentWidgetDragging).fadeIn('fast');

                console.log("[Bisor] over - >.contene from: " + widgetSobre)
            },
            out: function (event, ui) {

            },
            drop: function (event, ui) {
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
            "data-draggable": "true",
            "style": "height:"+ widgetData["height"]+"px;"
        });

        //$('[data-toggle="tooltip"]').tooltip({
        //    'placement': 'top'
        //});

        // Resto de configuraciones en el widget
        self.setupWidget(divWidget, widgetData);
        self.loadDataInTemplateWidget(widgetData);

        //self.setClassByDataDepth();
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