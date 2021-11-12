import M$plugin$Geocoderpelias from '/home/epardo/proyectos/geocoderpelias/src/facade/js/geocoderpelias';
import M$control$GeocoderpeliasControl from '/home/epardo/proyectos/geocoderpelias/src/facade/js/geocoderpeliascontrol';
import M$impl$control$GeocoderpeliasControl from '/home/epardo/proyectos/geocoderpelias/src/impl/ol/js/geocoderpeliascontrol';

if (!window.M.plugin) window.M.plugin = {};
if (!window.M.control) window.M.control = {};
if (!window.M.impl) window.M.impl = {};
if (!window.M.impl.control) window.M.impl.control = {};
window.M.plugin.Geocoderpelias = M$plugin$Geocoderpelias;
window.M.control.GeocoderpeliasControl = M$control$GeocoderpeliasControl;
window.M.impl.control.GeocoderpeliasControl = M$impl$control$GeocoderpeliasControl;
