import Geocoderpelias from 'facade/geocoderpelias';

const map = M.map({
  container: 'mapjs',
});

const mp = new Geocoderpelias();

map.addPlugin(mp);
