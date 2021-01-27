
var yasqe = YASQE(document.getElementById("yasqe"), {
    sparql: {
	showQueryButton: true,
	endpoint: "https://licodemo.ilc.cnr.it/repositories/askMe",
	headers: {
	    "Access-Control-Allow-Origin":"*"
	}
    },
    lineWrapping: true,
    collapsePrefixesOnLoad: true,
    backdrop: true
});
yasqe.addPrefixes({"rdf":"http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "rabbi":"http://lexo-datasets.ilc.cnr.it:3030/rabbiOntology#",
    "dct":"http://purl.org/dc/terms/",
    "owl":"http://www.w3.org/2002/07/owl#",
    "skos":"http://www.w3.org/2004/02/skos/core#",
    "rdfs":"http://www.w3.org/2000/01/rdf-schema#",
    "foaf":"http://xmlns.com/foaf/0.1/",
    "xsd": "http://www.w3.org/2001/XMLSchema#",
    "lex": "http://lexica/mylexicon#",
    "ontolex": "http://www.w3.org/ns/lemon/ontolex#",
    "lexinfo": "https://www.lexinfo.net/ontology/3.0/lexinfo#",
    "luc": "http://www.ontotext.com/owlim/lucene#"
    });

yasqe.setSize("auto", "250px");
yasqe.collapsePrefixes("true");
yasqe.options.collapsePrefixesOnLoad = true;

YASR.plugins.table.defaults.datatable.scrollY        = 500;
YASR.plugins.table.defaults.datatable.scrollCollapse = false;
YASR.plugins.table.defaults.datatable.paging         = true;
YASR.plugins.table.defaults.datatable.lengthMenu     = [[10,50,100,1000,-1], [10,50,100,1000,"All"]];
YASR.plugins.table.defaults.datatable.pageLength     = 10;
YASR.plugins.table.defaults.datatable.searching      = true;
YASR.plugins.table.defaults.datatable.autoWidth      = true;
YASR.plugins.table.defaults.datatable.processing     = true;
YASR.plugins.table.defaults.datatable.deferRender    = true;
//overload della drawCallback per risolvere i problemi di visualizzazione causati dalla funzione empty()
YASR.plugins.table.defaults.datatable.drawCallback = null;

var yasr = YASR(document.getElementById("yasr"), {
    //this way, the URLs in the results are prettified using the defined prefixes in the query
    getUsedPrefixes: yasqe.getPrefixesFromQuery,
    drawOutputSelector: false,
    drawDownloadIcon: false
});
document.getElementsByClassName("yasr_header")[0].style.display = "none"; //https://github.com/OpenTriply/YASGUI.YASR/issues/119

//link both together
yasqe.options.sparql.callbacks.complete = yasr.setResponse;


var map = {};
// add a item

map["q1"] = "PREFIX ontolex: <http://www.w3.org/ns/lemon/ontolex#>\n" +
"SELECT DISTINCT ?IRI ?form ?PoS WHERE { \n" +
"   ?lf ontolex:writtenRep ?form .\n" +
"   ?IRI ontolex:canonicalForm ?lf ;\n" +
"       lexinfo:partOfSpeech ?PoS .\n" +
"   FILTER(REGEX(?form, '_VALUE_'))\n" +
"}\nLIMIT 1000";

map["q2"] = "PREFIX ontolex: <http://www.w3.org/ns/lemon/ontolex#>\n" +
"SELECT ?lf ?wr WHERE { \n" +
"   ?le lexinfo:partOfSpeech ?pos .\n" +
"   ?le ontolex:canonicalForm ?lf  .\n" +
"   ?lf ontolex:writtenRep ?wr .\n" +
"   FILTER(REGEX(str(?pos), '_POS_'))\n" +
"}\n"+
"LIMIT 1000";

map["q3"] = "PREFIX ontolex: <http://www.w3.org/ns/lemon/ontolex#>\n" +
"SELECT ?pos ?source ?def (GROUP_CONCAT(str(?target);SEPARATOR=\", \") AS ?targets) WHERE {\n" +
"   ?source lexinfo:_SEMREL_+ ?target .\n" +
"   ?le ontolex:sense ?source .\n" +
"   ?source skos:definition ?def .\n" +
"   ?le ontolex:canonicalForm ?lf .\n" +
"   ?le lexinfo:partOfSpeech ?pos .\n" +
"   ?lf ontolex:writtenRep \"_VALUE_\" .\n" +
"}\n" +
"GROUP BY ?pos ?source ?def";

map["q4"] = "PREFIX ontolex: <http://www.w3.org/ns/lemon/ontolex#>\n" +
"SELECT ?pos ?def ?sense WHERE {\n" +
"   ?le ontolex:sense ?sense .\n" +
"   ?sense skos:definition ?def .\n" +
"   ?le ontolex:canonicalForm ?lf .\n" +
"   ?le lexinfo:partOfSpeech ?pos .\n" +
"   ?lf ontolex:writtenRep \"_VALUE_\" .\n" +
"}\n";

//Highlight current element in vertical menu
// Get the container element
var itemContainer = document.getElementsByClassName("vertical-menu")[0];

// Get all buttons with class="btn" inside the container
var items = itemContainer.getElementsByClassName("item");

var query;

// Loop through the buttons and add the active class to the current/clicked button
for (var i = 0; i < items.length; i++) {
    items[i].addEventListener("click", clickFunction);
    //items[i].getElementById("semRel").addEventListener("keyPress", keyPressedFunction); 
}
    
function clickFunction() {
    query = map[this.id];
	var current = document.getElementsByClassName("active");
	if (current[0] != null) {
	    current[0].className = current[0].className.replace(" active", "");
	}
    this.className += " active";    
    switch (this.id) {
        case "q1":
            id = query.replace("_VALUE_", q1_update());
          break;
        case "q2":
            id = query.replace("_POS_", q2_update());
          break;
          case "q3":
            var params = q3_update();
            id = query.replace("_SEMREL_", params[0]).replace("_VALUE_", params[1]);
          break;
          case "q4":
            id = query.replace("_VALUE_", q4_update());
          break;
        default:
            id = map[this.id];
      }
    /* if (this.id == "q1") {
        id = query.replace("_VALUE_", searchPattern());
    } else {
        id = map[this.id];
    } */
	//yasqe.setValue("SELECT * WHERE { ?sub ?pred ?obj .} LIMIT 10");
	yasqe.setValue(id);
	//yasqe.options.value("SELECT * WHERE { ?sub ?pred ?obj .} LIMIT 1");
	yasqe.addPrefixes({"rdf":"http://www.w3.org/1999/02/22-rdf-syntax-ns#",
			   "rabbi":"http://lexo-datasets.ilc.cnr.it:3030/rabbiOntology#",
			   "dct":"http://purl.org/dc/terms/",
			   "owl":"http://www.w3.org/2002/07/owl#",
			   "skos":"http://www.w3.org/2004/02/skos/core#",
			   "rdfs":"http://www.w3.org/2000/01/rdf-schema#",
			   "foaf":"http://xmlns.com/foaf/0.1/",
			   "xsd": "http://www.w3.org/2001/XMLSchema#",
			   "lex": "http://lexica/mylexicon#",
			   "ontolex": "http://www.w3.org/ns/lemon/ontolex#",
			   "lexinfo": "https://www.lexinfo.net/ontology/3.0/lexinfo#",
			   "luc": "http://www.ontotext.com/owlim/lucene#"
			  });
    //yasqe.query(yasqe.options);
    yasqe.collapsePrefixes(true);
}

function q1_update() {
    var value = searchPattern();
    yasqe.setValue(query.replace("_VALUE_", value));
    yasqe.addPrefixes({"rdf":"http://www.w3.org/1999/02/22-rdf-syntax-ns#",
               "rabbi":"http://lexo-datasets.ilc.cnr.it:3030/rabbiOntology#",
               "dct":"http://purl.org/dc/terms/",
               "owl":"http://www.w3.org/2002/07/owl#",
               "skos":"http://www.w3.org/2004/02/skos/core#",
               "rdfs":"http://www.w3.org/2000/01/rdf-schema#",
               "foaf":"http://xmlns.com/foaf/0.1/",
               "xsd": "http://www.w3.org/2001/XMLSchema#",
               "lex": "http://lexica/mylexicon#",
               "ontolex": "http://www.w3.org/ns/lemon/ontolex#",
               "lexinfo": "https://www.lexinfo.net/ontology/3.0/lexinfo#",
               "luc": "http://www.ontotext.com/owlim/lucene#"
              });
    yasqe.collapsePrefixes(true);
    return value;
}

function searchPattern() {
    var searchMode = document.getElementById("q1_searchMode").value;
    var textPattern = document.getElementById("q1_input").value;
    if (textPattern) {
        if (searchMode == "^") {
            return searchMode + textPattern;
        }
        return textPattern + searchMode;
    } else {
        return "";
    }
}

function q2_update() {
    var pos = document.getElementById("q2_pos").value;
    yasqe.setValue(query.replace("_POS_", pos));
    yasqe.addPrefixes({"rdf":"http://www.w3.org/1999/02/22-rdf-syntax-ns#",
               "rabbi":"http://lexo-datasets.ilc.cnr.it:3030/rabbiOntology#",
               "dct":"http://purl.org/dc/terms/",
               "owl":"http://www.w3.org/2002/07/owl#",
               "skos":"http://www.w3.org/2004/02/skos/core#",
               "rdfs":"http://www.w3.org/2000/01/rdf-schema#",
               "foaf":"http://xmlns.com/foaf/0.1/",
               "xsd": "http://www.w3.org/2001/XMLSchema#",
               "lex": "http://lexica/mylexicon#",
               "ontolex": "http://www.w3.org/ns/lemon/ontolex#",
               "lexinfo": "https://www.lexinfo.net/ontology/3.0/lexinfo#",
               "luc": "http://www.ontotext.com/owlim/lucene#"
              });
    yasqe.collapsePrefixes(true);
    return pos;
}

function q3_update() {
    var semrel = document.getElementById("q3_semrel").value;
    var word = document.getElementById("q3_input").value;
    yasqe.setValue(query.replace("_SEMREL_", semrel).replace("_VALUE_", word));
    yasqe.addPrefixes({"rdf":"http://www.w3.org/1999/02/22-rdf-syntax-ns#",
		       "rabbi":"http://lexo-datasets.ilc.cnr.it:3030/rabbiOntology#",
		       "dct":"http://purl.org/dc/terms/",
		       "owl":"http://www.w3.org/2002/07/owl#",
		       "skos":"http://www.w3.org/2004/02/skos/core#",
		       "rdfs":"http://www.w3.org/2000/01/rdf-schema#",
		       "foaf":"http://xmlns.com/foaf/0.1/",
		       "xsd": "http://www.w3.org/2001/XMLSchema#",
		       "lex": "http://lexica/mylexicon#",
		       "ontolex": "http://www.w3.org/ns/lemon/ontolex#",
		       "lexinfo": "https://www.lexinfo.net/ontology/3.0/lexinfo#",
		       "luc": "http://www.ontotext.com/owlim/lucene#"
		      });
    yasqe.collapsePrefixes(true);
    return [semrel, word];
}

function q4_update() {
    var word = document.getElementById("q4_input").value;
    yasqe.setValue(query.replace("_VALUE_", word));
    yasqe.addPrefixes({"rdf":"http://www.w3.org/1999/02/22-rdf-syntax-ns#",
               "rabbi":"http://lexo-datasets.ilc.cnr.it:3030/rabbiOntology#",
               "dct":"http://purl.org/dc/terms/",
               "owl":"http://www.w3.org/2002/07/owl#",
               "skos":"http://www.w3.org/2004/02/skos/core#",
               "rdfs":"http://www.w3.org/2000/01/rdf-schema#",
               "foaf":"http://xmlns.com/foaf/0.1/",
               "xsd": "http://www.w3.org/2001/XMLSchema#",
               "lex": "http://lexica/mylexicon#",
               "ontolex": "http://www.w3.org/ns/lemon/ontolex#",
               "lexinfo": "https://www.lexinfo.net/ontology/3.0/lexinfo#",
               "luc": "http://www.ontotext.com/owlim/lucene#"
              });
    yasqe.collapsePrefixes(true);
    return word;
}
