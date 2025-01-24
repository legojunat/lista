# lista

Tool to arrange Lego parts into HTML with BrickLink images.

## Usage

TBD

## BrickLink API

You can copy `.env.example` to `.env` and fill your BrickLink API information from [BrickLink API guide](https://www.bricklink.com/v3/api.page).

For example:

```
OAUTH_CONSUMER_KEY=
OAUTH_CONSUMER_SECRET=
OAUTH_ACCESS_TOKEN=
OAUTH_ACCESS_TOKEN_SECRET=
```

## Example input CSV

Place original data into `data/lugbulk-original-data.csv`, and if the format is different than below - edit it in [bricklink-item.ts](./scripts/brick)

Current mapping is:

```
on list 2024,Main Group Top,Main Group Sub,Material,Description,Colour ID,Communication number,"Gross Weight (G)","Length (MM)","Width (MM)","Height (MM)",2025 Prices (in EUR)
1,TECHNIC,CONNECTING BUSH W/ A,6013938,1 1/2 M CONNECTING BUSH,BRICK-YEL,32002,0.109,12.100,5.600,5.900,9.99
```
