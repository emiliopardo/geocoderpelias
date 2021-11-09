
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
      radius: 5,
      fill: {
        color: '#00FF00',
        opacity: 0.5
      },
      stroke: {
        color: '#00FF00'
      }
    });

    this.geoJSON = new M.layer.GeoJSON({
      source: {
        'crs': { 'properties': { 'name': 'EPSG:25830' }, 'type': 'name' },
        // Se añade su notacion GeoJSON
        'features': [],
        'type': 'FeatureCollection'
      },
      name: 'prueba'
    });
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
      this.autoCompleteAction(this.inputTextSearch.value)
    })

    this.clearButon.addEventListener('click', () => {
      this.inputTextSearch.value = null;
      this.resultPanel.style.display = 'none';
      this.featuresArray = [];
      this.map_.removeLayers(this.geoJSON)
    })

    this.searchButon.addEventListener('click', () => {
      console.log('buscar')
    })

    this.resultPanel.addEventListener('click', (e) => {
      this.map_.removeLayers(this.geoJSON);
      let element = e.target;
      this.inputTextSearch.value = e.target.textContent;
      let coordinates = element.dataset.coordinates.split(',');

      let feature = new M.Feature('feature_1', {
        'type': 'Feature',
        'id': 'feature_1',
        'geometry': {
          'type': 'Point',
          'coordinates': [parseFloat(coordinates[0]), parseFloat(coordinates[1])],
        },
        'properties': {
          'via': decodeURIComponent(element.dataset.street),
          'numero': decodeURIComponent(element.dataset.housenumber),
          'municipio': decodeURIComponent(element.dataset.locality),
          'provincia': decodeURIComponent(element.dataset.region),
        }
      });


      feature.setStyle(this.pointStyle);
      this.geoJSON.addFeatures(feature);
      this.map_.addLayers(this.geoJSON);
      this.geoJSON.setStyle(this.pointStyle)
      console.log(this.geoJSON)
      this.map_.setCenter({
        x: this.geoJSON.getFeatures()[0].getGeometry().coordinates[0],
        y: this.geoJSON.getFeatures()[0].getGeometry().coordinates[1],
        draw: true
      });

      this.map_.setZoom(10);
    });



  }

  autoCompleteAction(value) {
    let completeUrl = this.url + this.autocompleteEndPoint;
    let query = 'text=' + value + '&layers=address,street,venue&sources=ieca';

    M.remote.get(encodeURI(completeUrl + query)).then((res) => {
      let response = JSON.parse(res.text);
      if (response) {
        // console.log(response)
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
    let htmlParseElement = '<div class="results" id="m-autcomplete">';
    if (response.type == 'FeatureCollection') {
      let features = response.features
      for (let index = 0; index < features.length; index++) {
        const element = features[index];
        htmlParseElement += '<div class="result autocomplete" data-locality=' + encodeURIComponent(element.properties.locality) + ' data-region=' + encodeURIComponent(element.properties.region) + ' data-street=' + encodeURIComponent(element.properties.street) + ' data-housenumber=' + encodeURIComponent(element.properties.housenumber) + ' data-coordinates=' + element.geometry.coordinates + '><i class="result-icon g-cartografia-pin5"></i>' + element.properties.label + '</div>';
      }
    }
    this.resultPanel.innerHTML = htmlParseElement
    this.resultPanel.innerHTML += '</div>'
    this.showSearchResult();
  }
}
