# lista

Tool to arrange Lego parts into HTML with BrickLink images.

## Usage

Commands need to be ran sequentally:

* `npm run bricklink` = generate *bricklink.csv* -file from *material* (e.g. Lego Material ID) from *lista.csv* using BrickLink API
* `npm run price` = generate *price.csv* -file from *brickLinkPartId* and *brickLinkColorId* information on *bricklink.csv* using BrickLink API
* `npm run html` = generate *lista.html* from *lista.csv*  and previously generated *price.csv*

Note! Running time of first two steps can take up to 5 hours with ~12000 parts.

## BrickLink API

You can copy `.env.example` to `.env` and fill your BrickLink API information from [BrickLink API guide](https://www.bricklink.com/v3/api.page).

For example:

```
OAUTH_CONSUMER_KEY=
OAUTH_CONSUMER_SECRET=
OAUTH_ACCESS_TOKEN=
OAUTH_ACCESS_TOKEN_SECRET=
```

## Example CSV

You can convert the mapping by editing [bricklink.js](./bricklink.js) and [lista.js](./lista.js) -files.

Current mapping is:

```
on list 2024,Main Group Top,Main Group Sub,Material,Description,Colour ID,Communication number,"Gross Weight (G)","Length (MM)","Width (MM)","Height (MM)",2025 Prices (in EUR)
1,TECHNIC,CONNECTING BUSH W/ A,6013938,1 1/2 M CONNECTING BUSH,BRICK-YEL,32002,0.109,12.100,5.600,5.900,9.99
```