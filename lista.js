const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');

const BRICKLINK_ITEM_URL = 'https://bricklink.com/v2/catalog/catalogitem.page';
const BRICKLINK_IMAGE_URL = 'https://img.bricklink.com/ItemImage';
const AUTO_SORT = false;
const ONLY_LEGO_PARTS = true;
const IMAGE_SIZE = '50px';

const processFile = async (file) => {
  const records = [];
  const parser = fs
    .createReadStream(file)
    .pipe(parse({
      // CSV options if any
    }));
  for await (const record of parser) {
    // Work with each record
    records.push(record);
  }
  return records;
};

(async function() {
  const [colorsHeader, ...colorsRows] = (await processFile(path.resolve(__dirname, 'colors.csv')))
  const colors = colorsRows.map((colorsRow) => {
    return colorsHeader.reduce((prev, curr, index) => ({
      ...prev,
      [curr]: colorsRow[index],
    }), {});
  })

  const [_blMapHeader, ...blMapRows] = (await processFile(path.resolve(__dirname, 'lego_to_bricklink_map.csv')))
  const blMap = blMapRows.reduce((prev, curr) => ({
    ...prev,
    [curr[0]]: curr[1]
  }), {});

  const [_skipBlHeader, ...skipBlRows] = (await processFile(path.resolve(__dirname, 'skip_part.csv')))
  const skipBl = new Set(skipBlRows.flat());

  // Image,Main Group Top,Main Group Sub,,Colour ID,,Communication number
  // row[0] =
  // row[1] = DUPLO
  // row[2] = 1 ROW W/ STUD, WITH
  // row[3] = DUPLO BRICK 1X2X2
  // row[4] = BR.YEL
  // row[5] = 24
  // row[6] = 76371
  const [header, ...allRows] = (await processFile(path.resolve(__dirname, 'lista.csv')))
    // row[0] = DUPLO
    // row[1] = DUPLO BRICK 1X2X2
    // row[2] = BR.YEL
    // row[3] = 24
    // row[4] = 76371
    .map(([_image, brand, _group, name, colorName, colorId, partId]) => ([brand, name, colorName, colorId, partId]))

  // Take all rows by default
  let rows = allRows

  // Only show Lego parts
  if (ONLY_LEGO_PARTS) {
    rows = rows.filter((row) => row[0] === 'LEGO')
  }

  // Sorting options
  if (AUTO_SORT) {
    // Sort first by partId
    rows = rows.sort((x, y) => {
      if (x[4] < y[4]) return -1;
      if (x[4] > y[4]) return 1;
      return 0;
    })
    // Sort then by name
    .sort((x, y) => {
      if (x[1] < y[1]) return -1;
      if (x[1] > y[1]) return 1;
      return 0;
    })
  }

console.log(`
<html>
  <head>
    <style type="text/css">
      img { width: ${IMAGE_SIZE}; height: ${IMAGE_SIZE}; object-fit: contain; border: 4px solid white; background-color: white; }
      table { border-spacing: 0; border-collapse: collapse; width: 100%; page-break-inside: auto; }
      tr { padding: 0; }
      tr:nth-child(odd) { background-color: #eeeeee; }
      tr:nth-child(even) { background-color: #cccccc; }
      td { padding: 2px; vertical-align: middle; }
      .color { display: inline-block; width: 16px; height: 16px; border: 1px solid black; }
    </style>
    <script>
      function imageFallback(imgElement, fallbackImage) {
        if (imgElement.src === fallbackImage) {
          imgElement.onerror = null;
          imgElement.style.display = 'none';
        } else {
          imgElement.src = fallbackImage;
        }
      }

      function hideParents(imgElement) {
        const parent = imgElement.parentNode.parentNode.parentNode;
        parent.style.display = 'none';
      }
    </script>
  </head>
  <body>
    <table>
      <thead>
        <tr>
          <th>Image</th>
          <th>Colour</th>
${header.map((column) => `          <th>${column}</th>`).join('\n')}
          <th>BrickLink part</th>
        </tr>
      </thead>
      <tbody>
${rows.map((row) => {
  const legoColorId = row[3];
  const brickLinkPartId = blMap[row[4]] || row[4];
  const color = colors.find((c) => c.legoId === legoColorId);
  const url = `${BRICKLINK_ITEM_URL}?P=${brickLinkPartId}#T=C&C=${color.bricklinkId}`;
  const mainImage = `${BRICKLINK_IMAGE_URL}/PN/${color.bricklinkId}/${brickLinkPartId}.png`;
  const fallbackImage = `${BRICKLINK_IMAGE_URL}/PL/${brickLinkPartId}.png`;

  // onload="hideParents(this)" 
  if (color && !skipBl.has(row[4])) {
    return `        <tr>
          <td><a target="_new" href="${url}"><img src="${mainImage}" onerror="imageFallback(this, '${fallbackImage}')" alt="" /></td>
          <td><span style="background-color: #${color.hex}" class="color">&nbsp;</span> ${color.legoName || '&nbsp;'}</td>
${row.map((column) => `          <td>${column}</td>`).join('\n')}
          <td>${blMap[row[4]] || ''}</td>
        </tr>
`;
  } else if (!skipBl.has(row[4])) {
    return `        <tr>
          <td><a target="_new" href="${BRICKLINK_ITEM_URL}?P=${brickLinkPartId}><img src="${BRICKLINK_IMAGE_URL}/PL/${brickLinkPartId}.png" alt="" /></td>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
${row.map((column) => `          <td>${column}</td>`).join('\n')}
          <td>&nbsp;</td>
        </tr>
`;
  } else {
    return `        <tr>
          <td>&nbsp;</td>
          <td>&nbsp;</td>
${row.map((column) => `          <td>${column}</td>`).join('\n')}
          <td>&nbsp;</td>
        </tr>
`;
  }
}).join('')}      </tbody>
    </table>
  </body>
</html>
`);
})();

