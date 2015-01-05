#pimba-bisor

Allows the view of PIMBA's data through draggable widgets

##Requisitos externos
Bisor utiliza algunas librerías externas que puedes cargar desde un repositorio externo o incluirlas en tu propio proyecto.
	
JQuery by Google


```
<script src="//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
<script src="//ajax.googleapis.com/ajax/libs/jqueryui/1.11.1/jquery-ui.min.js"></script>
<link rel="stylesheet" href="//ajax.googleapis.com/ajax/libs/jqueryui/1.11.1/themes/smoothness/jquery-ui.css" />
```

Bootstrap

```
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css">
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap-theme.min.css">
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/js/bootstrap.min.js"></script>
```

##Instalación e inicialización

Debes incluir previamente las librerías de Bisor:

```
<script src="./pimba-bisor/js/pimba-bisor.js" ></script>
<link rel="stylesheet" href="./pimba-bisor/css/pimba-bisor.css" type="text/css">
<link rel="stylesheet" href="./pimba-bisor/css/theme-default.css" type="text/css">
```

...y añadir al HTML de tu proyecto el contenedor del dashboard:


```html
<div class="pimba_bisor_dashboard">
   <div class="rze_container"></div>            
</div>
```

...y crear el objeto Bisor
	
```
aOptions = new Array();
pimbaBisor = new PimbaBisor(aOptions);
```

Si en este punto puedes recargar la página sin conflictor, *enhorabuena!*, ya has instalado BISOR en tu proyecto.

##Métodos útiles
A continuación se describen algunos de los métodos mas útiles para integrar Bisor con terceras aplicaciones.

####fillSelectPerspectives ( *perspectivesJSONData* )
--------------------------------------------------
Rellena el selector de perspectivas con los datos recibidos en el parámetro *perspectivesJSONData*.

Este parámetro debe respetar el siguiente formato:

	"perspectives" (Array): {
		"__v": integer,
		"_id": text,
		"title": text,
		"user": text,
		"childs": Array[
			"_id": text
		]
	}

####setJSONDataWidgets ( *dataWidgets* )
-------------------------------------
Establece los datos de los widgets para el dashboard actual mediante los
datos recibidos en el parámetro *dataWidgets*. Es el método estándar para
reiniciar el contenido de los widgets globalmente. El parámetro debe respetar
el siguiente formato:

	"dataWidgets" (Array): {
		"__v": integer,
		"_id": text,
		"childs": Array[
		{
			"__v": integer,
			"_id": text,
			"childs": Array[
	                    {
				"__v": integer,
				"_id": text,
				"description": text,
				"parent": boolean,
				"title": text,
				"user": text,
				"childs": Array[
				"_id": text
			]
		}
		],
		"description": text,
		"parent": text,
		"title": text,
		"user": text
		}
		],
		"title": text,
		"user": text
	}
    
Bisor utiliza este método internamente cada vez que cambiamos de perspectiva
mediante el método estándard (el selector).

*NOTA: En el fondo estámos indicando a Bisor la tarjeta que adoptará la forma
del dashboard, por ello no se echa en falta datos como su descripción o
parent.*

####addWidget( *widgetData*)
----------------------------

Añade un widget al dashboard actual. El parámetro que recibe es un JSON con
los datos del widget que desea crear. Este parámetro debe respetar el
siguiente formato:

	"dataWidget": {
		"__v": integer,
		"_id": text,
		"childs": Array[],
		"title": text,
		"description": text,
		"parent": boolean,
		"user": text
    	}

*NOTA: Hay que destacar que cuando se ejecuta este método, es posible incluir
hijos que se incluirán como tal.*
