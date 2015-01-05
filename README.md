#pimba-bisor

Allows the view of PIMBA's data through draggable widgets

##Requisitos externos
Bisor utiliza algunas librerías externas que puedes cargar desde un repositorio externo o incluirlas en tu propio proyecto.
	
JQuery by Google


```html
<script src="//ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js"></script>
<script src="//ajax.googleapis.com/ajax/libs/jqueryui/1.11.1/jquery-ui.min.js"></script>
<link rel="stylesheet" href="//ajax.googleapis.com/ajax/libs/jqueryui/1.11.1/themes/smoothness/jquery-ui.css" />
```

Bootstrap

```html
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap.min.css">
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/css/bootstrap-theme.min.css">
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.2.0/js/bootstrap.min.js"></script>
```

##Instalación e inicialización

Debes incluir previamente las librerías de Bisor:

```html
<script type="text/javascript" src="../pimba-bisor/js/pimba-bisor.js"></script>
<link rel="stylesheet" href="../pimba-bisor/css/pimba-bisor.css" type="text/css">
<link rel="stylesheet" href="../pimba-bisor/css/theme-default.css" type="text/css">
```

...y añadir al HTML de tu proyecto el contenedor del dashboard:


```html
<div class="pimba_bisor_dashboard">
   <div class="rze_container"></div>            
</div>
```

...y por último crear el objeto Bisor
	
```javascript
<script type='text/javascript'>
  var aOptions = new Array();
  var pimbaBisor = new PimbaBisor(aOptions);
</script>
```

Si en este punto puedes recargar la página sin conflictos o errores, **enhorabuena!**, ya has instalado BISOR en tu proyecto.

Puedes ver el código de la demo basic.html para ver un ejemplo.

##Personalización al inicializar
Bisor ofrece algunas posibilidades de personalización que permitirán ajustar
su funcionamiento en el momento de su inicialización. Esta personalización se
realizará mediante parámetros pasados al constructor:

###Parámetros disponibles

Parámetro | Valor | Descripción
--------- | ----- | -----------
showSelectorCards | true ó false | Muestra o no, el selector de cambio de perspectiva/tarjetas
depthTemplates | Array *  | Un array que permite especificar templates HTML para cada nivel de profundidad de anidamiento de un widget y su clase CSS

* El array para dephTemplates debe respetar el siguiente patrón

```javascript
0: { file: '../pimba-bisor/templates/default-card.html', id:'bisor-template-default'},
1: { file: '../pimba-bisor/templates/small-card.html',   id:'bisor-template-small'},
2: { file: '../pimba-bisor/templates/big-card.html',     id:'bisor-template-big'} |                     
```

```javascript
<script type='text/javascript'>
  aOptions = {
      showSelectorCards: true,
      depthTemplates: {
          0: { file: '../pimba-bisor/templates/default-card.html', id:'bisor-template-default'},
          1: { file: '../pimba-bisor/templates/small-card.html',   id:'bisor-template-small'},
          2: { file: '../pimba-bisor/templates/big-card.html',     id:'bisor-template-big'}
      }
  };
                
  pimbaBisor = new PimbaBisor(aOptions);
</script>
```

En el ejemplo anterior podemos ver un ejemplo de inicialización en el que se
especifican los dos parámetros simultánamente.

##Eventos disponibles

Bisor internamente dispone de una serie de eventos que son lanzados de forma asíncrona a medida que se van desencadenando
según su naturaleza.

Nombre de la función del evento | Situación de lanzamiento | Argumentos de vuelta
------------------------------- | ------------------------ | --------------------
cb_init | Inicialización del objeto Bisor. | self
cb_change_select | Se produce un cambio de perspectiva en el selector de las mismas. | self, id_perspective
cb_update_widget | Un widget es movido a un sitio distinto del que estaba. | self, dataWidget
cb_edit_widget | Al editar un widget | self, dataWidget
cb_create_widget | Al crear un widget | self, dataWidget
cb_delete_widget | Al borrar un widget | self, dataWidget

*NOTA: Conocerlos argumentos devueltos en cada callback es importante para un
mayor control.*

###Inicialización con callbacks definidos

Bisor permite indicar a su constructor que funciones serán lanzadas cuando un evento
de este tipo sea lanzado.

Aquí un ejemplo de inicialización con el callback *cb_init* definido

```javascript
<script type="text/javascript">
    var pimbaBisor;     // objeto PimbaBisor
    window.onload = simpleBisorDemo();

    function simpleBisorDemo() {
        aOptions = {
            showSelectorCards: true,
            'cb_init': function (objBisor) {
                alert("Este es el callback cb_init!");
            }
        };
        pimbaBisor = new PimbaBisor(aOptions);
     }
</script>
```

Puedes ver el código de la demo callbacks-events.html para ver un ejemplo.

*NOTA: Los callbacks pueden definirse 'inline' desde el propio array de opciones o
si resulta mas cómodo puede definirse como una función separada.*

##Métodos útiles
A continuación se describen algunos de los métodos mas útiles para integrar Bisor con terceras aplicaciones.

#####fillSelectPerspectives ( *perspectivesJSONData* )
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

#####setJSONDataWidgets ( *dataWidgets* )
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

#####addWidget( *widgetData*)
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
