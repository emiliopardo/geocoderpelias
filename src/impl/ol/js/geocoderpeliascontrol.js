/**
 * @module M/impl/control/GeocoderpeliasControl
 */
export default class GeocoderpeliasControl extends M.impl.Control {
  /**
   * This function adds the control to the specified map
   *
   * @public
   * @function
   * @param {M.Map} map to add the plugin
   * @param {HTMLElement} html of the plugin
   * @api stable
   */
  addTo(map, html) {
    // obtengo la interacción por defecto del dblclick para manejarla
   // const olMap = map.getMapImpl();
    // super addTo - don't delete
    super.addTo(map, html);
  }

  // Add your own functions
  activateClick(map) {
    // desactivo el zoom al dobleclick
  }

  deactivateClick(map) {

  }
}
