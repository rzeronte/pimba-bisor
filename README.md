pimba-bisor
===========

Allows the view of PIMBA's data through draggable widgets

Métodos útiles
==============

  fillSelectPerspectives ( perspectivesJSONData )
  -----------------------------------------------

  Rellena el selector de perspectivas con los datos recibidos en el parámetro
 'perspectivesJSONData'. Este parámetro debe respetar el siguiente formato:

  "perspectives" (Array): {
            "__v": integer,
            "_id": text,
            "title": text,
            "user": text,
            "childs": Array[
                "_id": text
            ]
   }

   setJSONDataWidgets ( dataWidgets )
   ----------------------------------

   Establece los datos de los widgets para el dashboard actual mediante los
   datos recibidos en el JSON 'dataWidgets'. Es el método estándar para
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

    NOTA: En el fondo estámos indicando a Bisor la tarjeta que adoptará la forma
    del dashboard, por ello no se echa en falta datos como su descripción o
    parent.

    addWidget( widgetData)
    ----------------------

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

    NOTA: Hay que destacar que cuando se ejecuta este método, es posible incluir
    hijos que se incluirán como tal.
