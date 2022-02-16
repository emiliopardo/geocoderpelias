import Geocoderpelias from 'facade/geocoderpelias';

// definición raster layers capas bases

const ortofoto2016_color = new M.layer.WMS({
  url: 'http://www.ideandalucia.es/wms/ortofoto2016?',
  name: 'ortofotografia_2016_rgb',
  legend: 'Ortofotografía Color 0,5 metros/pixel (Año 2016)',
  transparent: false,
  tiled: true
}, {
  styles: 'default'
})

ortofoto2016_color.setLegendURL('http://www.ideandalucia.es/visor/leyendas/ortofoto2016_color.png')

const ortofoto2016_pancromatica = new M.layer.WMS({
  url: 'http://www.ideandalucia.es/wms/ortofoto2016?',
  name: 'ortofotografia_2016_pancromatico',
  legend: 'Ortofotografía Pancromática 0,5 metros/pixel (Año 2016)',
  transparent: false,
  tiled: true
}, {
  styles: 'default'
})

ortofoto2016_pancromatica.setLegendURL('http://www.ideandalucia.es/visor/leyendas/ortofoto2016_pancromatico.png');

const ortofoto2016_infrarrojo = new M.layer.WMS({
  url: 'http://www.ideandalucia.es/wms/ortofoto2016?',
  name: 'ortofotografia_2016_infrarrojo',
  legend: 'Ortofotografía Infrarrojo 0,5 metros/pixel (Año 2016)',
  transparent: false,
  tiled: true
}, {
  styles: 'default'
})

ortofoto2016_infrarrojo.setLegendURL('http://www.ideandalucia.es/visor/leyendas/ortofoto2016_infrarrojo.png');


const mdt_siose2013 = new M.layer.WMS({
  url: 'http://www.ideandalucia.es/wms/siose_2013?',
  name: 'sombreado_siose_2013',
  legend: 'Siose + MDT 2013',
  transparent: false,
  tiled: true
}, {
  styles: 'default'
})

mdt_siose2013.setLegendURL('http://www.ideandalucia.es/visor/leyendas/siose_2013.png');

const mdt_2016 = new M.layer.WMS({
  url: 'http://www.ideandalucia.es/wms/mdt_2016?',
  name: 'sombreado_orografico_2016,modelo_digital_terreno_2016_color',
  legend: 'MDT 2016',
  transparent: false,
  tiled: true
}, {
  styles: 'default'
})

mdt_2016.setLegendURL('http://www.ideandalucia.es/visor/leyendas/mdt_2016_tintas_hipsometricas.png');

const CDAU_Base = new M.layer.WMS({
  url: 'http://www.callejerodeandalucia.es/servicios/base/wms?',
  name: 'CDAU_base',
  legend: 'Base Cartográfica Callejero Digital de Andalucía',
  transparent: false,
  tiled: true
})

CDAU_Base.setLegendURL('http://www.ideandalucia.es/visor/leyendas/cdau_base.png');

const MapaAndalucia = new M.layer.WMS({
  url: 'http://www.ideandalucia.es/services/andalucia/wms?',
  name: '00_Mapa_Andalucia',
  legend: 'Mapa Topográfico de Andalucía',
  transparent: false,
  tiled: true
})

MapaAndalucia.setLegendURL('http://www.ideandalucia.es/visor/leyendas/leyenda_Cartografia_Mapa_Andalucia.png')

const IGNBaseTodo = new M.layer.WMS({
  url: 'http://www.ign.es/wms-inspire/ign-base?',
  name: 'IGNBaseTodo',
  legend: 'MapaBaseIGN',
  transparent: false,
  tiled: true
})

IGNBaseTodo.setLegendURL('http://www.idee.es/visualizador/static/media/mapa.98d45f00.png')

const map = M.map({
  container: 'mapjs',
  layers: [
    ortofoto2016_color,
    ortofoto2016_pancromatica,
    ortofoto2016_infrarrojo,
    mdt_siose2013,
    mdt_2016,
    CDAU_Base,
    MapaAndalucia,
    IGNBaseTodo,
  ],
  controls: ['Panzoombar', 'mouse', 'scale', 'scaleline'],
  projection: "EPSG:25830*m",
});

map.setMaxExtent([100401, 3987100, 621273, 4288700]);

const cdauViasPortales = new M.layer.WMS({
  url: 'http://www.callejerodeandalucia.es/servicios/cdau/wms?',
  name: 'CDAU_wms',
  legend: 'Vías y Portales CDAU)',
  transparent: true,
  tiled: true
});

cdauViasPortales.displayInLayerSwitcher = false;

map.addLayers([cdauViasPortales]);
const configSimpleBaseLayerSelector = { displayBaseLayersInLayerSwitcher: false }
const baseLayerSelector = new M.plugin.Simplebaselayerselector(configSimpleBaseLayerSelector);


const configPelias = {
  //url: 'http://geocoder-5-ign.larioja.org/v1/'
  url: 'http://localhost:4000/v1/'
}

const mp = new Geocoderpelias(configPelias);

map.addPlugin(mp);

map.addPlugin(baseLayerSelector);
