all: data/us.json copy

clean:
	rm -rf -- build

copy:
	cp -rf data/us.json ../src/datasets/
	cp -rf data/superstore-preprocessed-coords-geoids.csv ../src/datasets/


build/gz_2010_us_050_00_20m.zip:
	mkdir -p $(dir $@)
	curl -o $@ http://www2.census.gov/geo/tiger/GENZ2010/$(notdir $@)

build/gz_2010_us_050_00_20m.shp: build/gz_2010_us_050_00_20m.zip
	unzip -od $(dir $@) $<
	touch $@

build/population.zip:
	mkdir -p $(dir $@)
	curl -o $@ http://api.censusreporter.org/1.0/data/download/latest?table_ids=B01003&geo_ids=050|01000US&format=csv

build/population: build/population.zip
	unzip -od $(dir $@) $<
	touch $@

preprocess-superstore:
	node superstore-aggregated.js

data/counties.json: build/gz_2010_us_050_00_20m.shp preprocess-superstore build/population
	./../node_modules/.bin/topojson \
		-o $@ \
		--id-property 'GEO_ID' \
		--external-properties ./data/superstore-aggregated.csv \
		--external-properties ./build/acs2014_5yr_B01003_05000US56015/acs2014_5yr_B01003_05000US56015.csv \
		--properties 'geoId=GEO_ID' \
		--properties 'stateId=STATE' \
		--properties 'countyId=COUNTY' \
		--properties 'county=NAME' \
		--properties 'orders=AMOUNT' \
		--properties 'avgQuantity=AVG_QUANTITY' \
		--properties 'avgSales=AVG_SALES' \
		--properties 'avgProfit=AVG_PROFIT' \
		--properties='population=+d.properties["B01003001"]' \
		-- counties=$<

data/states.json: data/counties.json
	./../node_modules/.bin/topojson-merge \
		-o $@ \
		--in-object=counties \
		--out-object=states \
		--key='d.id.substring(d.id.search("S")+1, d.id.search("S")+3)' \
		-- $<

data/us.json: data/states.json
	./../node_modules/.bin/topojson-merge \
		-o $@ \
		--in-object=states \
		--out-object=country \
		-- $<



