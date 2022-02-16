
/* eslint-disable no-console */
/**
 * @module M/control/GeocoderpeliasControl
 */

import GeocoderpeliasImplControl from 'impl/geocoderpeliascontrol';
import template from 'templates/geocoderpelias';

export default class GeocoderpeliasControl extends M.Control {
  /**
   * @classdesc
   * Main constructor of the class. Creates a PluginControl
   * control
   *
   * @constructor
   * @extends {M.Control}
   * @api stable
   */
  constructor(config) {
    // 1. checks if the implementation can create PluginControl
    if (M.utils.isUndefined(GeocoderpeliasImplControl)) {
      M.exception('La implementación usada no puede crear controles GeocoderpeliasControl');
    }
    // 2. implementation of this control
    const impl = new GeocoderpeliasImplControl();
    super(impl, 'Geocoderpelias');

    this.config = config;
    this.url = this.config.url
    this.autocompleteEndPoint = 'autocomplete?'

    // Punto de tamaño 5 con relleno verde semitransparente y borde verde
    this.pointStyle = new M.style.Point({
      radius: 8,
      fill: {
        color: '#458736',
        opacity: 1
      },
      stroke: {
        color: '#FFFFFF',
        width: 2,
      }
    });

    this.geoJSON = null;
    this.arrayFeatures = null;
    this.selectedFeatures = null;
    this.layer = null;
    this.timer = null;
  }

  /**
   * This function creates the view
   *
   * @public
   * @function
   * @param {M.Map} map to add the control
   * @api stable
   */
  createView(map) {
    //let templateVars = { vars: { title: this.title, fields: this.fields } };  
    let templateVars = { vars: {} };
    return new Promise((success, fail) => {
      const html = M.template.compileSync(template, templateVars);
      // Añadir código dependiente del DOM
      this.element = html;
      this.addEvents(html)
      success(html);
    });
  }

  /**
   * This function is called on the control activation
   *
   * @public
   * @function
   * @api stable
   */
  activate() {
    // calls super to manage de/activation
    super.activate();
    this.getImpl().activateClick(this.map_);
  }
  /**
   * This function is called on the control deactivation
   *
   * @public
   * @function
   * @api stable
   */
  deactivate() {
    // calls super to manage de/activation
    super.deactivate();
    this.getImpl().deactivateClick(this.map_);
  }
  /**
   * This function gets activation button
   *
   * @public
   * @function
   * @param {HTML} html of control
   * @api stable
   */
  getActivationButton(html) {
    return html.querySelector('.m-geocoderpelias button');
  }

  /**
   * This function compares controls
   *
   * @public
   * @function
   * @param {M.Control} control to compare
   * @api stable
   */
  equals(control) {
    return control instanceof GeocoderpeliasControl;
  }

  // Add your own functions

  addEvents(html) {
    //query Selectors
    this.clearButon = html.querySelectorAll('button.m-clear-btn')[0]
    this.searchButon = html.querySelectorAll('button.m-search-btn')[0]
    this.inputTextSearch = html.querySelectorAll('input[type=text].m-geocoderpelias-input-text')[0];
    this.resultPanel = html.querySelectorAll('div.m-geocoderpelias-result-panel')[0];
    // Add Event Listener
    this.inputTextSearch.addEventListener('keypress', () => {
      this.delayQuery(this.autoCompleteAction(this.inputTextSearch.value), 5000);
    })

    this.clearButon.addEventListener('click', () => {
      this.inputTextSearch.value = null;
      this.resultPanel.style.display = 'none';
      if (this.geoJSON) {
        this.map_.removeLayers(this.geoJSON);
      }
    })

    this.searchButon.addEventListener('click', () => {
      console.log('buscar')
    })

    this.resultPanel.addEventListener('click', (e) => {
      let element = e.target;
      let featureId = element.dataset.feature;
      this.selectRecord(featureId)
    });
  }

  autoCompleteAction(value) {
    let completeUrl = this.url + this.autocompleteEndPoint;
    let query = 'text=' + value + '&layers=address,street,venue&lang=es';
    M.remote.get(encodeURI(completeUrl + query)).then((res) => {
      let response = JSON.parse(res.text);
      if (response) {
        this.parseAutoCompleteResponse(response)
      }
    })
  }

  showSearchResult() {
    if (this.resultPanel.style.display != 'block') {
      this.resultPanel.style.display = 'block';
    }
  }

  parseAutoCompleteResponse(response) {
    this.arrayFeatures = new Array();
    let htmlParseElement = '<div class="results" id="m-autcomplete">';
    if (response.type == 'FeatureCollection') {
      let features = response.features
      for (let index = 0; index < features.length; index++) {
        const element = features[index];
        this.arrayFeatures.push(this.createFeature(element))
        if (element.properties.layer == 'address') {
          htmlParseElement += '<div class="result autocomplete" data-feature="' + element.properties.id + '"><i class="result-icon geocoder-portal"></i>' + element.properties.label + '</div>';
        } else if (element.properties.layer == 'street') {
          htmlParseElement += '<div class="result autocomplete" data-feature="' + element.properties.id + '"><i class="result-icon geocoder-via"></i>' + element.properties.label + '</div>';
        } else if (element.properties.layer == 'venue' && element.properties.source == 'estructura_organica') {
          htmlParseElement += '<div class="result autocomplete" data-feature="' + element.properties.id + '"><i class="result-icon geocoder-sedes-ja"></i>' + element.properties.label + '</div>';
        } else if (element.properties.layer == 'venue' && element.properties.source == 'equipamientos') {
          if (element.properties.addendum.cdau.nivel1 == 'AGRICULTURA, GANADERÍA Y PESCA') {
            htmlParseElement += '<div class="result autocomplete" data-feature="' + element.properties.id + '"><i class="result-icon geocoder-agricultura-ganaderia-pesca"></i>' + element.properties.label + '</div>';
          } else if (element.properties.addendum.cdau.nivel1 == 'CULTURA') {
            htmlParseElement += '<div class="result autocomplete" data-feature="' + element.properties.id + '"><i class="result-icon geocoder-cultura"></i>' + element.properties.label + '</div>';
          } else if (element.properties.addendum.cdau.nivel1 == 'EMPLEO') {
            htmlParseElement += '<div class="result autocomplete" data-feature="' + element.properties.id + '"><i class="result-icon geocoder-empleo"></i>' + element.properties.label + '</div>';
          } else if (element.properties.addendum.cdau.nivel1 == 'EMPRESAS Y PROFESIONALES') {
            htmlParseElement += '<div class="result autocomplete" data-feature="' + element.properties.id + '"><i class="result-icon geocoder-empresas-profesionales"></i>' + element.properties.label + '</div>';
          } else if (element.properties.addendum.cdau.nivel1 == 'ESTUDIAR') {
            htmlParseElement += '<div class="result autocomplete" data-feature="' + element.properties.id + '"><i class="result-icon geocoder-estudiar"></i>' + element.properties.label + '</div>';
          } else if (element.properties.addendum.cdau.nivel1 == 'INDUSTRIA Y MINAS') {
            htmlParseElement += '<div class="result autocomplete" data-feature="' + element.properties.id + '"><i class="result-icon geocoder-geocoder-industria-minas"></i>' + element.properties.label + '</div>';
          } else if (element.properties.addendum.cdau.nivel1 == 'INVESTIGACIÓN E INNOVACIÓN') {
            htmlParseElement += '<div class="result autocomplete" data-feature="' + element.properties.id + '"><i class="result-icon geocoder-investigacion-innovacion"></i>' + element.properties.label + '</div>';
          } else if (element.properties.addendum.cdau.nivel1 == 'JUSTICIA, SEGURIDAD Y EMERGENCIAS') {
            htmlParseElement += '<div class="result autocomplete" data-feature="' + element.properties.id + '"><i class="result-icon geocoder-justicia-seguridad-emergencias"></i>' + element.properties.label + '</div>';
          } else if (element.properties.addendum.cdau.nivel1 == 'MEDIO AMBIENTE') {
            htmlParseElement += '<div class="result autocomplete" data-feature="' + element.properties.id + '"><i class="result-icon geocoder-medio-ambiente"></i>' + element.properties.label + '</div>';
          } else if (element.properties.addendum.cdau.nivel1 == 'NUEVAS TECNOLOGÍAS') {
            htmlParseElement += '<div class="result autocomplete" data-feature="' + element.properties.id + '"><i class="result-icon geocoder-nuevas-tecnologias"></i>' + element.properties.label + '</div>';
          } else if (element.properties.addendum.cdau.nivel1 == 'OTROS') {
            htmlParseElement += '<div class="result autocomplete" data-feature="' + element.properties.id + '"><i class="result-icon geocoder-otros"></i>' + element.properties.label + '</div>';
          } else if (element.properties.addendum.cdau.nivel1 == 'SALUD') {
            htmlParseElement += '<div class="result autocomplete" data-feature="' + element.properties.id + '"><i class="result-icon geocoder-salud"></i>' + element.properties.label + '</div>';
          } else if (element.properties.addendum.cdau.nivel1 == 'SERVICIOS SOCIALES') {
            htmlParseElement += '<div class="result autocomplete" data-feature="' + element.properties.id + '"><i class="result-icon geocoder-servicios-sociales"></i>' + element.properties.label + '</div>';
          } else if (element.properties.addendum.cdau.nivel1 == 'TRÁFICO Y TRANSPORTE') {
            htmlParseElement += '<div class="result autocomplete" data-feature="' + element.properties.id + '"><i class="result-icon geocoder-trafico-transportes"></i>' + element.properties.label + '</div>';
          } else if (element.properties.addendum.cdau.nivel1 == 'TURISMO Y OCIO') {
            htmlParseElement += '<div class="result autocomplete" data-feature="' + element.properties.id + '"><i class="result-icon geocoder-turismo-ocio"></i>' + element.properties.label + '</div>';
          } else {
            htmlParseElement += '<div class="result autocomplete" data-feature="' + element.properties.id + '"><i class="result-icon g-cartografia-pin"></i>' + element.properties.label + '</div>';
          }
        }else {
          htmlParseElement += '<div class="result autocomplete" data-feature="' + element.properties.id + '"><i class="result-icon g-cartografia-pin"></i>' + element.properties.label + '</div>';
        }
      }
      this.resultPanel.innerHTML = htmlParseElement
      this.resultPanel.innerHTML += '</div>'
      this.showSearchResult();
    }
  }

  createFeature(data) {
    let feature = new M.Feature();
    feature.setId(data.properties.id)
    if (data.properties.layer == 'street') {
      feature.setAttribute('nombre', data.properties.name);
      // feature.setAttribute('etiqueta', data.properties.label);
      feature.setAttribute('municipio', data.properties.localadmin);
      // feature.setAttribute('código_municipio', data.properties.localadmin_a);
      // feature.setAttribute('county', data.properties.county),
      // feature.setAttribute('macrocounty', data.properties.macrocounty),
      feature.setAttribute('provincia', data.properties.region);
      // feature.setAttribute('comunidad_autonoma', data.properties.macroregion);
      // feature.setAttribute('pais', data.properties.country);
      // if (data.properties.addendum.cdau.acceso) {
      //   feature.setAttribute('acceso', data.properties.addendum.cdau.acceso);
      // }
      // if (data.properties.addendum.cdau.acceso) {
      //   feature.setAttribute('competencia', data.properties.addendum.cdau.competencia);
      // }
    } else if (data.properties.layer == 'address') {
      feature.setAttribute('tipo_portal', data.properties.addendum.cdau.tipo_portal_pk);
      feature.setAttribute('vía', data.properties.street);
      feature.setAttribute('portal', data.properties.housenumber);
      // feature.setAttribute('etiqueta', data.properties.label);
      // feature.setAttribute('nombre', data.properties.name);
      // if (data.properties.neighbourhood) {
      //   feature.setAttribute('barrio', data.properties.neighbourhood);
      // }
      // if (data.properties.borough) {
      //   feature.setAttribute('distrito', data.properties.borough);
      // }
      feature.setAttribute('código_postal', data.properties.postalcode);
      // if (data.properties.addendum.cdau.seccion_censal) {
      //   feature.setAttribute('seccion_censal', data.properties.addendum.cdau.seccion_censal);
      // }
      feature.setAttribute('núcleo', data.properties.locality);
      // feature.setAttribute('código_núcleo', data.properties.locality_a);
      feature.setAttribute('municipio', data.properties.localadmin);
      // feature.setAttribute('código_municipio', data.properties.localadmin_a);
      // feature.setAttribute('county', data.properties.county),
      // feature.setAttribute('macrocounty', data.properties.macrocounty),
      feature.setAttribute('provincia', data.properties.region);
      // feature.setAttribute('comunidad_autonoma', data.properties.macroregion);
      // feature.setAttribute('pais', data.properties.country);
      if (data.properties.addendum.cdau.refcatparc) {
        feature.setAttribute('referencia_catastral_parcela', '<a href="https://www1.sedecatastro.gob.es/CYCBienInmueble/OVCListaBienes.aspx?del&muni&rc1=' + data.properties.addendum.cdau.refcatparc.substring(0, 7) + '&rc2=' + data.properties.addendum.cdau.refcatparc.substring(7, 14) + '" target="_blank">' + data.properties.addendum.cdau.refcatparc + '</a>')
      }
      if (data.properties.addendum.cdau.nom_tipo_a) {
        feature.setAttribute('tipo_agrupación', data.properties.addendum.cdau.nom_tipo_a);
      }
      if (data.properties.addendum.cdau.nom_agrup) {
        feature.setAttribute('nombre_agrupación', data.properties.addendum.cdau.nom_agrup);
      }
      if (data.properties.addendum.cdau.txt_app) {
        feature.setAttribute('txt_app', data.properties.addendum.cdau.txt_app);
      }
    } else if (data.properties.layer == 'venue') {
      feature.setAttribute('nombre', data.properties.name);
      if (data.properties.addendum.cdau.categoria) {
        feature.setAttribute('categoria', data.properties.addendum.cdau.categoria);
      }
      if (data.properties.addendum.cdau.tipo) {
        feature.setAttribute('tipo', data.properties.addendum.cdau.tipo);
      }
      if (data.properties.addendum.cdau.tipo_ctr) {
        feature.setAttribute('tipo_centro', data.properties.addendum.cdau.tipo_ctr);
      }
      if (data.properties.addendum.cdau.consejeria) {
        feature.setAttribute('consejeria', data.properties.addendum.cdau.consejeria);
      }
      if (data.properties.addendum.cdau.nivel1) {
        feature.setAttribute('nivel1', data.properties.addendum.cdau.nivel1);
      }
      if (data.properties.addendum.cdau.nivel2) {
        feature.setAttribute('nivel2', data.properties.addendum.cdau.nivel2);
      }
      if (data.properties.addendum.cdau.dependencia) {
        feature.setAttribute('dependencia', data.properties.addendum.cdau.dependencia);
      }
      if (data.properties.addendum.cdau.titularidad) {
        feature.setAttribute('titularidad', data.properties.addendum.cdau.titularidad);
      }
      if (data.properties.addendum.cdau.tipo_portal_pk) {
        feature.setAttribute('tipo_portal', data.properties.addendum.cdau.tipo_portal_pk);
      }
      feature.setAttribute('vía', data.properties.street);
      feature.setAttribute('portal', data.properties.housenumber);
      // feature.setAttribute('etiqueta', data.properties.label);
      // if (data.properties.neighbourhood) {
      //   feature.setAttribute('barrio', data.properties.neighbourhood);
      // }
      // if (data.properties.borough) {
      //   feature.setAttribute('distrito', data.properties.borough);
      // }
      feature.setAttribute('código_postal', data.properties.postalcode);
      // if (data.properties.addendum.cdau.seccion_censal) {
      //   feature.setAttribute('seccion_censal', data.properties.addendum.cdau.seccion_censal);
      // }
      feature.setAttribute('núcleo', data.properties.locality);
      // feature.setAttribute('código_núcleo', data.properties.locality_a);
      feature.setAttribute('municipio', data.properties.localadmin);
      // feature.setAttribute('código_municipio', data.properties.localadmin_a);
      // feature.setAttribute('county', data.properties.county),
      // feature.setAttribute('macrocounty', data.properties.macrocounty),
      feature.setAttribute('provincia', data.properties.region);
      // feature.setAttribute('comunidad_autonoma', data.properties.macroregion);
      // feature.setAttribute('pais', data.properties.country);
      if (data.properties.addendum.cdau.refcatparc) {
        feature.setAttribute('referencia_catastral_parcela', '<a href="https://www1.sedecatastro.gob.es/CYCBienInmueble/OVCListaBienes.aspx?del&muni&rc1=' + data.properties.addendum.cdau.refcatparc.substring(0, 7) + '&rc2=' + data.properties.addendum.cdau.refcatparc.substring(7, 14) + '" target="_blank">' + data.properties.addendum.cdau.refcatparc + '</a>')
      }
      if (data.properties.addendum.cdau.nom_tipo_a) {
        feature.setAttribute('tipo_agrupación', data.properties.addendum.cdau.nom_tipo_a);
      }
      if (data.properties.addendum.cdau.nom_agrup) {
        feature.setAttribute('nombre_agrupación', data.properties.addendum.cdau.nom_agrup);
      }
      if (data.properties.addendum.cdau.txt_app) {
        feature.setAttribute('txt_app', data.properties.addendum.cdau.txt_app);
      }
    }
    feature.setGeometry(data.geometry)
    feature.setStyle(this.pointStyle)
    return feature
  }

  selectRecord(value) {
    let find = false;
    let result = null;
    this.selectedFeatures = new Array();
    do {
      for (let index = 0; index < this.arrayFeatures.length; index++) {
        const element = this.arrayFeatures[index];
        if (element.getId() == value) {
          find = true
          this.selectedFeatures.push(element)
          result = this.buildGeoJSON(this.selectedFeatures)
        }
      }
    } while (!find);
    return result;
  }

  buildGeoJSON(selectedFeatures) {
    let featJSON = selectedFeatures[0].getGeoJSON();
    this.map_.removeLayers(this.geoJSON);
    if (this.geoJSON) {
      this.map_.removeLayers(this.geoJSON);
    }

    this.geoJSON = new M.layer.GeoJSON({
      name: "Resultado Búsqueda",
      source: {
        crs: {
          properties: {
            name: "EPSG:4326"
          },
          type: "name"
        },
        features: [featJSON],
        type: "FeatureCollection"
      }
    });

    this.geoJSON.setStyle(this.pointStyle);

    this.map_.addLayers(this.geoJSON);

    this.geoJSON.on(M.evt.LOAD, () => {
      this.map_.setBbox(this.geoJSON.getFeaturesExtent());
      this.map_.setZoom(9);
    });
  }

  delayQuery() {
    let timer = 0;
    return function (callback, ms) {
      clearTimeout(timer);
      timer = setTimeout(callback, ms);
    };
  }
}
