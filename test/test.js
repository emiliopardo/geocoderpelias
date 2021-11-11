import Geocoderpelias from 'facade/geocoderpelias';

const ortofoto2016_color = new M.layer.WMS({
  url: 'http://www.ideandalucia.es/wms/ortofoto2016?',
  name: 'ortofotografia_2016_rgb',
  legend: 'Ortofotografía Color 0,5 metros/pixel (Año 2016)',
  transparent: false,
  tiled: true
}, {
  styles: 'default'
})


// const cdauBase = new M.layer.WMS({
//   url: 'http://www.callejerodeandalucia.es/servicios/base/wms?',
//   name: 'CDAU_base',
//   legend: 'Base Cartográfica CDAU',
//   transparent: false,
//   tiled: true
// })


const cdauViasPortales = new M.layer.WMS({
  url: 'http://www.callejerodeandalucia.es/servicios/cdau/wms?',
  name: 'CDAU_wms',
  legend: 'Vías y Portales CDAU)',
  transparent: true,
  tiled: true
})


const map = M.map({
  container: 'mapjs',
  layers: [
    ortofoto2016_color,
    //cdauBase,
    cdauViasPortales
  ],
  controls: ['Panzoombar', 'layerswitcher', 'mouse', 'scale', 'scaleline'],
  projection: "EPSG:25830*m",
  //projection: "EPSG:4326*d",
});

const configPelias = {
  url: 'https://geocoder-5-ign.larioja.org/v1/'
}

const mp = new Geocoderpelias(configPelias);

map.addPlugin(mp);

map.addPlugin(new M.plugin.Searchstreet({}));
