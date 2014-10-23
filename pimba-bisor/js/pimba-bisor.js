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
    /* Callbacks para refresco de información*/
    this.cb_init                       = aOptions['cb_init'];
    this.cb_change_select              = aOptions['cb_change_select'];
    this.cb_update_widget              = aOptions['cb_update_widget'];
    this.cb_edit_widget                = aOptions['cb_edit_widget'];
    this.cb_create_widget              = aOptions['cb_create_widget'];
    this.cb_delete_widget              = aOptions['cb_delete_widget'];
    /*Template para el widget */
    this.templateWidget                = aOptions['templateWidget'];
    
    this.constructor = function(aOptions) {
        /*Dibujamos o no el intercambiador de perspectivas*/
        if (aOptions['showSelectorCards'] === true) {
            self.drawSelectorCards(); 
        }
        
        /* Ejecutamos callback de inicio */
        this.cb_init(self); 
        
        /****************************************************  Eventos JQuery*/
        /** Gestión de evento para cambio de perspectiva**/
        $("body").on('change', '#rze_perspectives', function() {
            var optionSelect = $("#rze_perspectives select").val();
            if ( parseInt(optionSelect) > 0) {
                self.clearDashboard();
                self.cb_change_select(self, $("#rze_perspectives select").val());
            } else if (parseInt(optionSelect) == 0) {
                self.clearDashboard();
            }

        });
        
        /** Gestión de evento para añadir widget**/
        $("body").on('click', '.add', function() {
            var parentId = $(this).parent().parent().attr("id");
            self.addWidgetDialog(parentId);
        });
        
        /** Gestión de evento para borrar widget**/
        $("body").on('click', '.delete', function() {
            var widgetId = $(this).parent().parent().attr("id");
            self.deleteWidget(widgetId);
        });               
        /** Gestión de evento para editar widget**/
        $("body").on('click', '.edit', function() {
            var idWidget = $(this).parent().parent().attr("id");
            self.editWidgetDialog(idWidget);
        });      
        
        /* Cargámos el template*/
        self.loadTemplateWidget(aOptions['templateWidget']);
        
        /* Creamos el dialog*/ 
        self.createDialog();
    }

    //***************************************************************** MÉTODOS
    /**
     * Inicia pimba-bisor
     **/        
    this.go = function() {

        /* Creamos físicamente cada widget desde el array de datos */
        self.createWidgets(self.dataWidgetOrigin);

        /* Redibujamos widgets*/
        self.widgetsRedraw();
    
        /* --------------------------------------- Coordenadas de mouse*/
        $("body").mousemove(function(e){
           var parentOffset = $(this).parent().offset(); 
           //or $(this).offset(); if you really just want the current element's offset
           var relX = e.pageX - parentOffset.left;
           var relY = e.pageY - parentOffset.top;

           self.mouseX = relX;
           self.mouseY = relY;
        });
    }

    /*
     * Carga el template para los widgets
     **/
    this.loadTemplateWidget = function(urlTemplate) {
        $.ajax({
            type: 'GET',
            url: urlTemplate,
            success: function(data) {
                $(".rze_container").after(data);
            },error: function(){
                console.log("Error loadTemplateWidget");
            }
        });     
    }
    
    /*
     * Dibuja el select de perspectivas
     **/
    this.drawSelectorCards = function() {
        var tagFormSelectPerspectives = $("<form>", {
            "id"    : "rze_perspectives"
        });
        
        /* Input para título */
        var select = document.createElement('select');
        
        $(select).appendTo(tagFormSelectPerspectives);
        $(".rze_container").before(tagFormSelectPerspectives);
    }
        
    /*
     * Establece los datos desde un array json
     **/
    this.setJSONDataWidgets = function(data) {
        self.dataWidgetOrigin = data;
        self.go(); // Reinicia el dashboard
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
        var divActions = $("<div>", {
            "class": 'actions'
        });
        $(obj).append(divActions);           

        var divContent = $("<div>", {
            "class": 'content'
        });
        $(obj).append(divContent);           

        if (!self._isWidgetFirstDepth(obj.attr("id"))) {
            /* Opción de eliminar */
            var div = $("<div>", {
                "class": 'delete glyphicon glyphicon-remove-circle',
                "title": 'Delete card'
            });
            $(divActions).prepend(div);           
        }

        /* Opción de editar */
        var div = $("<div>", {
            "class": 'edit glyphicon glyphicon-edit',
            "title": 'Edit card'
        });
        $(divActions).prepend(div);

        /* Opción de añadir */
        var div = $("<div>", {
            "class": 'add glyphicon glyphicon-credit-card',
            "title": 'Add card'
        });
        $(divActions).prepend(div);

        if (!self._isWidgetFirstDepth(obj.attr("id"))) {
            /* Añadimos Tooltip de arrastre (la banza izquierda) */
            var div = $("<div>", {
                "class": 'move glyphicon glyphicon-move',
                "title": 'Move card'
            });
            $(divActions).prepend(div);
        }
        
        $(obj).resizable();

        $(obj).draggable({
            snap       : ".containerDev",
            containment: ".rze_container",
            handle     : "div.move",
            zIndex     : 10,
            start: function(event, ui) {
                
                var idWidget = $(this).attr("id");
                $(this).addClass("current");
                
                self.currentWidgetDragging = idWidget;
                var divParent = $(this).parents(".rze_widget");
                if (divParent.length > 0) {
                    self.currentFatherOfWidgetDragging = divParent;
                }

                $(this).draggable( "option", "zIndex", 15 );
                $(this).addClass("rze_widget_dragging");


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
                $(this).removeClass("current");
            }
        });

        /*-----------------------Creamos la configuración droppable básica*/
        $(obj).droppable({
            accept: '.rze_widget',
            over: function (event, ui) {
                var idWidget = $(this).attr("id");
                self.currentWidgetOn = idWidget;

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
                }

                self.refreshCascadeSelectWidgets();
            },
            drop: function (event, ui) {
                /* HACK Jquery: Para evitar que se dispare el drop hacia atrás
                 * comprobamos adcionalmente que el drop que ejecuta esto, es el del
                 * widget*/
                if (self.currentWidgetOn == $(this).attr("id")) {
                    /* callback de actualización */
                    self.cb_update_widget(self, {
                        '_id'         :  self.currentWidgetDragging,
                        'parent'      : self.currentWidgetOn,
                        'title'       : $(self.currentWidgetDragging + " [name='title']").val(),
                        'description' : $(self.currentWidgetDragging + " [name='description']").val(),
                        'from'        : (self.currentFatherOfWidgetDragging != null) ? self.currentFatherOfWidgetDragging.attr("id"): null
                    });

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
            }
        });
    }

    /*
    * Añade opciones al select de perspectivas desde userData
    */
    this.fillSelectPerspectives = function(perspectives) {
        $("#rze_perspectives select").append(new Option('Select card master', 0, false, false));        
        for (var i=0; i<perspectives.length;i++) {
            $("#rze_perspectives select").append(new Option(perspectives[i]['title'], perspectives[i]['_id'], false, false));        
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
        if (widgetsChildren) {
            for (var j=0; j < widgetsChildren.length ; j++){
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
        
        var divWidget = $("<div>", {
            "id": idWidget,
            "class": 'rze_widget draggable droppable',
            "data-draggable": "true"
        })
        
        /* Si no se indica parent se crea en el dashboard */
        if (idWidgetParent == false) {
            divWidget.appendTo("div.rze_container");
        } else {
            divWidget.appendTo("#" + idWidgetParent)
        }

        // Resto de configuraciones en el widget
        self.setupWidget(divWidget);
        self.loadDataInTemplateWidget(widgetData);
      
        self.setClassByDataDepth();
        self.widgetsRedraw();
    }

    /*
     * Carga en un widget su template e inyecta sus datos en el
     **/
    this.loadDataInTemplateWidget = function(widgetData){
        var template = $("#pimba-bisor-template");
        var widget = $("#" + widgetData['_id']);
        
        widget.find(".bisor-theme-default").remove();
        widget.children(".content").html($(template).html());
        
        /* Rastreamos el array de widget para sustituir en el template */
        for (var i in widgetData){
            if (typeof(widgetData[i]) != 'object') {
               widget.find("[data-pimba-field='" + i + "']").text(widgetData[i]);
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
    
    /* Crea las capa para el jquery dialog */
    this.createDialog = function() {
        var divDialog = $("<div>", {
            "id": "rze_popup_add",
            "title": "Card information"
        });

        var tagForm = $("<form>", {
            "id"    : "rze_popup_add_form",
            "method": "post"
        });
        
        /* Input para id */
        var inputTitle = document.createElement('input');
        inputTitle.setAttribute('type', 'hidden');
        inputTitle.setAttribute('name', 'id');
        $(inputTitle).appendTo(tagForm);

        /* Input para título */
        var inputTitle = document.createElement('input');
        inputTitle.setAttribute('type', 'text');
        inputTitle.setAttribute('placeholder', 'Escribe el título');
        inputTitle.setAttribute('required', true);
        inputTitle.setAttribute('name', 'title');
        $(inputTitle).appendTo(tagForm);
        
        /* Input para descripción */
        var inputDescription = document.createElement('textarea');
        inputDescription.setAttribute('type', 'text');
        inputDescription.setAttribute('placeholder', 'Escribe la descripción');
        inputTitle.setAttribute('required', true);
        inputDescription.setAttribute('name', 'description');
        $(inputDescription).appendTo(tagForm);

        /* Input para parent */
        var inputParent = document.createElement('input');
        inputParent.setAttribute('type', 'hidden');
        inputParent.setAttribute('name', 'parent');
        $(inputParent).appendTo(tagForm);
        
        /* Input para submit */
        var inputSubmit = document.createElement('input');
        inputSubmit.setAttribute('type', 'submit');
        inputSubmit.setAttribute('value', 'Crear');
        inputSubmit.setAttribute('class', 'submit');
        $(inputSubmit).appendTo(tagForm);

        tagForm.appendTo(divDialog);
        divDialog.appendTo("body");
        
        /* Gestión de evento click sobre el boton crear/editar del formulario */
        $( "#rze_popup_add_form" ).submit(function( event ) {
            
            var id = $( "#rze_popup_add_form [name='id']").val();
            var title       = $( "#rze_popup_add_form [name='title']").val();
            var description = $( "#rze_popup_add_form [name='description']").val();
            var parentId    = $( "#rze_popup_add_form [name='parent']").val();
            
            /* Diferenciamos si es nuevo o editamos, para diferenciar callbacks */
            if (id != "") {
               /* callback de edición de información de widget*/
               var widgetData = {
                   _id         : id, 
                   title       : title,
                   description : description,
                   parent     : parentId           
               };
               
               self.cb_edit_widget(self, widgetData);
               self.loadDataInTemplateWidget(widgetData);
            } else {
                /* callback de creación de widget*/
                self.cb_create_widget(self, {
                    title       : title,
                    description : description,
                    parent     : parentId           
                });
            }
            
            $("#rze_popup_add").dialog("close");

            
            // Vaciamos formulario de datos
            this.reset();
            
            event.preventDefault();
        });
        
        $("#rze_popup_add").hide();
    }
    
    /* Activa y muestra el dialogo*/
    this.addWidgetDialog = function(parentId) {
        $("#rze_popup_add_form").get(0).reset();

        $( "#rze_popup_add" ).show();
        $( "#rze_popup_add" ).dialog();
        $( "#rze_popup_add" ).dialog({"title": "Add Card"});

        $( "#rze_popup_add_form [name='parent']").val(parentId);
        $("#rze_popup_add_form .submit").attr("value", "Create in #"+parentId);
    }
    
    this.editWidgetDialog = function(idWidget) {
        var widget = $("#"+idWidget );
        var content = $("#"+idWidget + " .content");

        $("#rze_popup_add_form").get(0).reset();
        
        var id          = widget.attr("id");
        var title       = content.find("[data-pimba-field='title']").html();
        var description = content.find("[data-pimba-field='description']").html();
        var parent      = widget.parent().attr("id");
        
        $("#rze_popup_add").show();
        $("#rze_popup_add").dialog();
        $("#rze_popup_add_form [name='id']").val(id);
        $("#rze_popup_add_form [name='title']").val(title);
        $("#rze_popup_add_form [name='description']").val(description);
        $("#rze_popup_add_form [name='parent']").val(parent);

        $("#rze_popup_add_form .submit").attr("value", "Edit");
    }
    
    /*
     * Elimina un widget
     **/
    this.deleteWidget = function(idWidget) {
        $("#"+idWidget).remove();
        /* callback de eliminación de widget*/
        self.cb_delete_widget(self, {
            _id : idWidget 
        });        
    }
    
    /* Inserta la información de un widget en el array donde corresponda */
    this.insertWidgetData = function(widgetData){
        var parentId = widgetData["parent"];
        
    }
       
    /* Lanzamos al final una vez definidos todos los métodos*/
    self.constructor(aOptions);
}