export default function (dataStore, ui, canvas, update) {

      let folderBaseMap = ui.DatGui.addFolder('Choropleth Map');

      folderBaseMap.add(
            canvas,
            'colorScheme',
            [
                  "YlGn", "YlGnBu", "GnBu", "BuGn", "PuBuGn",
                  "PuBu", "BuPu", "RdPu", "PuRd", "OrRd", "YlOrRd",
                  "YlOrBr", "Purples", "Blues", "Greens", "Oranges", "Reds"
            ]
      ).onChange(() => {
            update(dataStore, canvas);
      });

      folderBaseMap.open();
}



