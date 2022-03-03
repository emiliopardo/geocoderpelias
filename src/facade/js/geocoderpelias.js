/**
 * @module M/plugin/Geocoderpelias
 */
import 'assets/css/geocoderpelias';
import GeocoderpeliasControl from './geocoderpeliascontrol';
import api from '../../api.json';

export default class Geocoderpelias extends M.Plugin {
  /**
   * @classdesc
   * Main facade plugin object. This class creates a plugin
   * object which has an implementation Object
   *
   * @constructor
   * @extends {M.Plugin}
   * @param {Object} impl implementation object
   * @api stable
   */
  constructor(parameters) {
    super();
    /**
     * Facade of the map
     * @private
     * @type {M.Map}
     */
    this.map_ = null;

    /**
     * Array of controls
     * @private
     * @type {Array<M.Control>}
     */
    this.controls_ = [];
    this.config_ = parameters.config
    this.options_ = parameters.options

    this.position_ = this.options_.position || 'TL';

    if (this.position_ === 'TL' || this.position_ === 'BL') {
      this.positionClass_ = 'left';
    } else {
      this.positionClass_ = 'right';
    }

    /**
     * Metadata from api.json
     * @private
     * @type {Object}
     */
    this.metadata_ = api.metadata;
  }

  /**
   * This function adds this plugin into the map
   *
   * @public
   * @function
   * @param {M.Map} map the map to add the plugin
   * @api stable
   */
  addTo(map) {
    this.control_ = new GeocoderpeliasControl(this.config_)
    this.controls_.push(this.control_);
    this.map_ = map;
    // panel para agregar control - no obligatorio
    this.panel_ = new M.ui.Panel('panelGeocoderpelias', {
      collapsible: true,
      className: `m-geocoderpelias ${this.positionClass_}`,
      position: M.ui.position[this.position_],
      collapsedButtonClass: 'g-cartografia-prismaticos',
    });
    this.panel_.addControls(this.controls_);
    map.addPanels(this.panel_);
  }

  /**
   * This function gets metadata plugin
   *
   * @public
   * @function
   * @api stable
   */
  getMetadata(){
    return this.metadata_;
  }

  get name(){
    return 'geocoderpelias'
  }
}
