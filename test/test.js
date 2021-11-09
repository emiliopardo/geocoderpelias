import Geocoderpelias from 'facade/geocoderpelias';

const map = M.map({
  container: 'mapjs',
});

const configPelias = {
  url: 'https://geocoder-5-ign.larioja.org/v1/'
}

const mp = new Geocoderpelias(configPelias);

map.addPlugin(mp);
