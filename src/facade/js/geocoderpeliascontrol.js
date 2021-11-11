
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
      if (this.geoJSON) {
        this.map_.removeLayers(this.geoJSON);
      }
    })

    this.searchButon.addEventListener('click', () => {
      console.log('buscar')
    })

    this.resultPanel.addEventListener('click', (e) => {
      if (this.geoJSON) {
        this.map_.removeLayers(this.geoJSON);
      }
      let element = e.target;
      let featureId = element.dataset.feature;
      this.selectRecord(featureId)
    });
  }

  autoCompleteAction(value) {
    let completeUrl = this.url + this.autocompleteEndPoint;
    let query = 'text=' + value + '&layers=address,street,venue&sources=ieca';

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
        htmlParseElement += '<div class="result autocomplete" data-feature="' + element.properties.id + '"><i class="result-icon g-cartografia-pin5"></i>' + element.properties.label + '</div>';
      }
    }
    this.resultPanel.innerHTML = htmlParseElement
    this.resultPanel.innerHTML += '</div>'
    this.showSearchResult();
  }

  createFeature(data) {
    let feature = new M.Feature();
    feature.setId(data.properties.id)
    feature.setAttribute('accuracy', data.properties.accuracy);
    feature.setAttribute('country', data.properties.country);
    feature.setAttribute('country_a', data.properties.country_a);
    feature.setAttribute('gid', data.properties.gid);
    feature.setAttribute('housenumber', data.properties.housenumber);
    feature.setAttribute('label', data.properties.label);
    feature.setAttribute('layer', data.properties.layer);
    feature.setAttribute('localadmin', data.properties.localadmin);
    feature.setAttribute('locality', data.properties.locality);
    feature.setAttribute('macroregion', data.properties.macroregion);
    feature.setAttribute('name', data.properties.name);
    feature.setAttribute('region', data.properties.region);
    feature.setAttribute('source', data.properties.source);
    feature.setAttribute('source_id', data.properties.source_id);
    feature.setAttribute('street', data.properties.street);
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
          console.log(element.getGeoJSON())

          result = this.buildGeoJSON(this.selectedFeatures)
        }
      }
    } while (!find);
    return result;
  }

  buildGeoJSON(selectedFeatures) {
    this.geoJSON = new M.layer.GeoJSON({
      name: "result",
      crs: "EPSG:4326"
    });

    this.geoJSON.on(M.evt.LOAD, () => {
      this.geoJSON.addFeatures(selectedFeatures);
    });

    this.map_.addLayers(this.geoJSON);

    let coor_X = selectedFeatures[0].getGeometry().coordinates[0];
    let coor_Y = selectedFeatures[0].getGeometry().coordinates[1];

    this.map_.setCenter({
      x: coor_X,
      y: coor_Y,
      draw: false
    });

    this.map_.setZoom(9);
  }
}
