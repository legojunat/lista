const fs = require('fs');
const path = require('path');

const { processFile } = require('./process-file');

const BRICKLINK_ITEM_URL = 'https://bricklink.com/v2/catalog/catalogitem.page';
const BRICKLINK_SEARCH_URL = 'https://www.bricklink.com/catalogList.asp'
const BRICKLINK_IMAGE_URL = 'https://img.bricklink.com/ItemImage';
const IMAGE_SIZE = '40px';
const HEADER_FONT_SIZE = '8px';
const NORMAL_FONT_SIZE = '10px';

function euroCents(input) {
  if (!input) {
    return '';
  }

  const value = Number(input);
  const roundedValue = Math.round(value * 100) / 100;
  return `${roundedValue.toString().replace('.', ',')}&nbsp;&euro;`;
}

function formattedQuantity(input) {
  if (!input) {
    return '';
  }

  const value = Number(input);
  if (value >= 1000000) {
    return `>1000k`;
  }

  if (value >= 1000) {
    return `${Math.round(value / 1000)}k`;
  }

  if (value <= 100) {
    return '<100';
  }

  return input;
}

function removeColumns(_column, index) {
  return index !== 1 && index !== 2;
}

(async function() {
  const [colorsHeader, ...colorsRows] = (await processFile(path.resolve(__dirname, 'colors.csv')))
  const colors = colorsRows.map((colorsRow) => {
    return colorsHeader.reduce((prev, curr, index) => ({
      ...prev,
      [curr]: colorsRow[index],
    }), {});
  })

  const priceFile = path.resolve(__dirname, 'price.csv');
  if (!fs.existsSync(priceFile)) {
    console.error('price.csv not found, please generate it with "npm run price"');
    process.exit();
  }
  const [priceHeader, ...priceRows] = (await processFile(priceFile))
  const priceMap = priceRows.reduce((prev, [
    material,
    brickLinkPartId,
    brickLinkColorId,
    minPrice,
    avgPrice,
    maxPrice,
    qtyAvgPrice,
    unitQuantity,
    totalQuantity
  ]) => ({
    ...prev,
    [material]: [
      brickLinkPartId,
      brickLinkColorId,
      euroCents(minPrice),
      euroCents(maxPrice),
      euroCents(avgPrice),
      euroCents(qtyAvgPrice),
      formattedQuantity(unitQuantity),
      formattedQuantity(totalQuantity)
    ]
  }), {});
  const defaultPrice = [...new Array(priceHeader.length - 2)].map(() => '&nbsp;');

  // row[0] => on list 2024 = 1
  // row[1] => Main Group Top = TECHNIC
  // row[2] => Main Group Sub = CONNECTING BUSH W/ A
  // row[3] => Material = 6013938
  // row[4] => Description = 1 1/2 M CONNECTING BUSH
  // row[5] => Colour ID = BRICK-YEL
  // row[6] => Communication number = 32002
  // row[7] => Gross Weight (G) = 0.109
  // row[8] => Length (MM) = 12.100
  // row[9] => Width (MM) = 5.600
  // row[10] => Height (MM) = 5.900
  // row[11] => 2025 Prices (in EUR) = 1.23
  const [header, ...allRows] = (await processFile(path.resolve(__dirname, 'lista.csv')))

  const categories = Array.from(new Set(allRows.map((row) => row[1])))
    .map((category) => {
      const subRows = allRows.filter((row) => row[1] === category);
      const subCategories = Array.from(new Set(subRows.map((row) => row[2])));
      return {
        category,
        items: subCategories.sort().map((subCategory) => {
          const rows = subRows.filter((row) => row[2] === subCategory);
          return {
            subCategory,
            rows,
          };
        })
      }
    });

console.log(`<!doctype html>
<html>
  <head>
    <title>Lista</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <style type="text/css">
      body {
        font-family: Arial, Helvetica, sans-serif;
        -webkit-print-color-adjust:exact !important;
        print-color-adjust: exact !important;
        margin: 0;
        padding: 0;
      }

      img {
        max-width: 100%;
        max-height: ${IMAGE_SIZE};
        object-fit: contain;
        display: block;
        border: 4px solid white;
        background-color: white;
        padding: 0;
        margin: 0;
        transition: transform 0.3s ease;
        transform-origin: top left;
      }

      img:hover {
        transform: scale(4);
      }

      h1 {
        font-size: 24px;
        margin: 10px;
      }

      p {
        margin: 10px;
      }

      table {
        border-spacing: 0;
        border-collapse: collapse;
        width: 100%;
        min-width: 600px;
        display: none;
      }

      tr {
        padding: 0;
      }

      tr:nth-child(odd) {
        background-color: #eeeeee;
      }

      tr:nth-child(even) {
        background-color: #cccccc;
      }

      th {
        font-size: ${HEADER_FONT_SIZE};
        font-weight: bold;
        color: white;
        background-color: black;
        text-align: left;
        white-space: nowrap;
      }

      th.right-divider {
        border-right: 1px solid white;
      }

      td {
        font-size: ${NORMAL_FONT_SIZE};
        padding: 2px;
        vertical-align: middle;
        white-space: nowrap;
      }

      td.right-divider {
        border-right: 1px solid #aaaaaa;
      }

      .color {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 1px solid black;
        vertical-align: middle;
      }

      .center {
        text-align: center;
      }

      @media (max-width: 768px) {
        .table-container {
          overflow-x: auto;
        }
      }

      @print {
        body {
          font-size: 6px;
        }

        .table-container {
          overflow-x: initial;
        }

        tr {
          page-break-inside: avoid;
        }
      }
    </style>
    <script>
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            observer.unobserve(img);
          }
        });
      });

      const tableObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const table = entry.target;
            table.querySelector('table').style.display = 'table';
            observer.unobserve(table);
          }
        });
      });

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

      function loadAll() {
        const button = document.getElementById('loadAll');
        button.disabled = true;

        const images = document.querySelectorAll('img');
        images.forEach((img) => {
          if (!img.src) {
            img.src = img.dataset.src;
            imageObserver.unobserve(img);
          }
        });

        const tables = document.querySelectorAll('div.table-container');
        tables.forEach((table) => {
          table.querySelector('table').style.display = 'table';
          tableObserver.unobserve(table);
        });
      }

      function startObservingImages() {
        const images = document.querySelectorAll('img');

        images.forEach((image) => {
          imageObserver.observe(image);
        });
      }

      function startObservingTables() {
        const [firstTable, ...tables] = document.querySelectorAll('div.table-container');
        window.setTimeout(() => {
          firstTable.querySelector('table').style.display = 'table';

          window.setTimeout(() => {
            tables.forEach((table) => {
              tableObserver.observe(table);
            });
          }, 500);
        }, 500);
      }

      document.addEventListener("DOMContentLoaded", function() {
        startObservingImages();
        startObservingTables();
      });
    </script>
  </head>
  <body>

    <p><button id="loadAll" onclick="loadAll()">Lataa kaikki kuvat ja taulukot</button> --> varoitus tämä on hidas toiminto, normaalisti kuvat ja taulukot ladataan sitä mukaa kun ne tulevat ruudulle...</p>
${categories.map(({ category, items }) => `
${items.map(({ subCategory, rows }) => `
    <h1>${category}: ${subCategory}</h1>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th colspan="4" class="center right-divider">BrickLink</th>
            <th colspan="4" class="center right-divider">BrickLink Prices</th>
            <th colspan="2" class="center right-divider">BrickLink Qty</th>
            <th class="center right-divider">LB price</th>
${header.filter(removeColumns).map((column) => `            <th rowspan="2">${column}</th>`).join('\n')}
          </tr>
          <tr>
            <th>Image</th>
            <th>Color name</th>
            <th>Part</th>
            <th class="right-divider">Color</th>
            <th class="center">Min</th>
            <th class="center">Avg</th>
            <th class="center">Max</th>
            <th class="center right-divider">Qty Avg</th>
            <th class="center">Unit</th>
            <th class="center right-divider">Total</th>
            <th class="center right-divider">+ VAT + Post</th>
          </tr>
        </thead>
        <tbody>
${rows.map((row) => {
  const material = row[3];
  const legoColorId = row[5];
  const price = priceMap[material] || defaultPrice;
  const [brickLinkPartId, brickLinkColorId] = price;

  const color = (brickLinkColorId && colors.find((c) => c.bricklinkId === brickLinkColorId))
    ?? colors.find((c) => c.legoAbbreviation.toUpperCase() === legoColorId);

  const url = (brickLinkPartId && brickLinkColorId)
    ? `${BRICKLINK_ITEM_URL}?P=${brickLinkPartId}#T=C&C=${brickLinkColorId}`
    : `${BRICKLINK_SEARCH_URL}?q=${row[3]}`;

  const lugbulkPriceIncludingVatAndPostage = euroCents(Number(row[11]) * 1.255 * 1.07);
  const mainImage = (brickLinkPartId && brickLinkColorId) ? `${BRICKLINK_IMAGE_URL}/PN/${brickLinkColorId}/${brickLinkPartId}.png` : '';
  const fallbackImage = brickLinkPartId ? `${BRICKLINK_IMAGE_URL}/PL/${brickLinkPartId}.png` : '';

    return `          <tr>
            <td>${mainImage ? `<a target="_new" href="${url}"><img data-src="${mainImage}" onerror="imageFallback(this, '${fallbackImage}')" alt="" />` : '&nbsp;'}</td>
            <td>${color ? `<span style="background-color: #${color.hex}" class="color">&nbsp;</span> ${color.bricklinkName || '&nbsp;'}` : '&nbsp;'}</td>
${price.map((meta, index) => `            <td class="${index === 1 || index === 5 || index === 7 ? `center right-divider` : 'center'}">${meta}</td>`).join('\n')}
            <td class="center right-divider">${lugbulkPriceIncludingVatAndPostage}</td>
${row.filter(removeColumns).map((column) => `            <td>${column}</td>`).join('\n')}
          </tr>
`;
}).join('')}        </tbody>
      </table>
    </div>
`)}
`)}

  </body>
</html>
`);
})();

