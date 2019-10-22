# prj-b71-vr

## Overview

This is an interactive demo of a sprite landscape rendering technique used on [Bear71](https://bear71vr.nfb.ca/).

### Technique overview

To render an image map as an interactive field of sprites, we designed a point cloud tile system that turns each pixel of our map into a sprite. 

You can take a look at the map data in app/assets/images/map.png

For each pixel in our map, we use the red channel to depict height, and the green channel to depict the sprite index, the blue channel to depict size.

You can see the original colored map in app/assets/images/map-legend-aesthetic.png

The process of creating map.png is more art than science, so no specific tool will aid in this process. For our purposes, to create the green channel of map.png, we saved map-legend-aesthetic.png as a 32 color palette png and manually (painstakingly) created a new palette to replace the colors with the correct shades of gray that correlate with the correct index in spritesheet.png.

Our spritesheet has 32 slots in it, which we didn't fully use. The unused slots are represented as red waffles. You can experiment with the look by trying different versions of the spritesheet, like assets/images/spritesheet-3d.png.

Ripple is a postprocessing render on a off screen canvas, It's result used in PointCloud as a rippleTexel.PointCloud use rippleTexel like this:

    // displace sprites by rippleMap
    pos.x += rippleTexel.r * 0.1 - 0.05;
    pos.z += rippleTexel.g * 0.1 - 0.05;

rippleTexel is app/assets/images/ripple-normals.png: ![app/assets/images/ripple-normals.png](app/assets/images/ripple-normals.png).

Scene origin point at corner of the map. map size is 128.
    
    lane.scale.set(128, 128, 128);
    plane.position.set(64, 64, 6);

## Setup

For development;

- `npm@3.8.9`
- `Node@6.2.x`
- OSX/Linux preferred, but not essential
- install [git lfs](https://git-lfs.github.com/) before cloning

Clone & install:

```sh
git clone https://github.com/nfbinteractive/Bear71VR_OpenSource.git
cd Bear71VR_OpenSource
npm install
```

Now run the app:

```sh
npm start
```

And open `localhost:9966`.

###### :warning: Module Format

We use ES2015 features with Babel, but we are sticking with CommonJS `require()` and `module.exports` to avoid issues with module inter-op and source transforms like `glslify`.

## License

MIT, see [LICENSE.md](http://github.com/nfbinteractive/Bear71VR_OpenSource/blob/master/LICENSE.md) for details.
