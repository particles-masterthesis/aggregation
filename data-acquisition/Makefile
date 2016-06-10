all: data/us.json clean copy

clean:
	rm -rf -- build

copy:
	cp -rf data/us.json ../src/datasets/
	cp -rf data/superstore-preprocessed-coords-geoids.csv ../src/datasets/
ff

build/gz_2010_us_050_00_20m.zip:
	mkdir -p $(dir $@)
	curl -o $@ http://www2.census.gov/geo/tiger/GENZ2010/$(notdir $@)

build/gz_2010_us_050_00_20m.shp: build/gz_2010_us_050_00_20m.zip
	unzip -od $(dir $@) $<
	touch $@

data/counties.json: build/gz_2010_us_050_00_20m.shp
	./../node_modules/.bin/topojson \
		-o $@ \
		--id-property 'GEO_ID' \
		--external-properties ./data/superstore-aggregated.csv \
		--properties 'geoId=GEO_ID' \
		--properties 'stateId=STATE' \
		--properties 'countyId=COUNTY' \
		--properties 'county=NAME' \
		--properties 'orders=AMOUNT' \
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


