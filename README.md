# openglasgow.samples.api.publisher.node
Sample App to publish data to the Open Data Platform.

Run "node pub" in the bin folder.

The specific commands are as follows:
- node pub.js <module> <command> [options]

##Commands
This is a non-exhaustive list of commands and options. 

### Organisations

#### List all organisations for the logged on user:
    node pub.js organisations --cmd list

### Datasets
#### List all datasets associated with the specified organisation:
    node pub.js datasets --cmd list --org '39086d5d-e92c-4e9f-92cb-a8b15c80dbd6'

#### Update the metadata for a dataset:

### Resources

#### List all files associated with the specified organisation and dataset:
    node pub.js resources --cmd list --org '39086d5d-e92c-4e9f-92cb-a8b15c80dbd6' --ds 'd8795050-bafb-40a0-8e8a-32e6ef860e27'

#### Get the metadata of a resource (but do not download associated files):
    node pub.js resources --cmd read --org '39086d5d-e92c-4e9f-92cb-a8b15c80dbd6' --ds 'd8795050-bafb-40a0-8e8a-32e6ef860e27' --res '923a4566-f58a-46c6-a752-510898baa392'

#### Adds a new remote resource to a dataset (file is hosted remotely)

*Metadata stored in a file* 

    node pub.js resources --cmd create --org '39086d5d-e92c-4e9f-92cb-a8b15c80dbd6' --ds 'd8795050-bafb-40a0-8e8a-32e6ef860e27' --xjson '../test/testexternal.json'

*Metadata passed directly*

    node pub.js resources --cmd create --org '39086d5d-e92c-4e9f-92cb-a8b15c80dbd6' --ds 'd8795050-bafb-40a0-8e8a-32e6ef860e27' --json '{"CreationDate":"2015-06-19T06:24:22","Description":"Test Resource.","License":"CREATIVE COMMONS ATTRIBUTION","OpennessRating":2,"Quality":2,"StandardName":"","StandardRating":0,"StandardVersion":"","Title":"API Test Resource Version 2","Type":"Url","ExternalUrl":"http://data.glasgow.gov.uk","Metadata":{"key1":"value1-1009","key2":"value2-1009"}}'


#### Adds a new local resource to a dataset (file is hosted locally and must be POSTed)

*Metadata stored in a file* 

    node pub.js resources --cmd create --org '39086d5d-e92c-4e9f-92cb-a8b15c80dbd6' --ds 'd8795050-bafb-40a0-8e8a-32e6ef860e27' --xjson '../test/test.json' --upload '../test/test.csv'

*Metadata passed directly*

    node pub.js resources --cmd create --org '39086d5d-e92c-4e9f-92cb-a8b15c80dbd6' --ds 'd8795050-bafb-40a0-8e8a-32e6ef860e27' --json '{"CreationDate":"2015-06-24T06:24:22","Description":"A Test Resource.","License":"CREATIVE COMMONS ATTRIBUTION","OpennessRating":2,"Quality":2,"StandardName":"","StandardRating":0,"StandardVersion":"","Title":"API Test Resource Version 102","Type":"csv","Metadata":{"key1":"value1","key2":"value2"}}' --upload '../test/test.csv'

#### Updates with a new version of a remote resource to an existing resource in a dataset (file is hosted remotely):

*Metadata stored in a file* 

    node pub.js resources --cmd update --org '39086d5d-e92c-4e9f-92cb-a8b15c80dbd6' --ds 'd8795050-bafb-40a0-8e8a-32e6ef860e27' --res '923a4566-f58a-46c6-a752-510898baa392' --xjson '../test/testexternal.json'

*Metadata passed directly*

    node pub.js resources --cmd update --org '39086d5d-e92c-4e9f-92cb-a8b15c80dbd6' --ds 'd8795050-bafb-40a0-8e8a-32e6ef860e27' --res '923a4566-f58a-46c6-a752-510898baa392' --json '{"CreationDate":"2015-06-19T06:24:22","Description":"Test Resource.","License":"CREATIVE COMMONS ATTRIBUTION","OpennessRating":2,"Quality":2,"StandardName":"","StandardRating":0,"StandardVersion":"","Title":"API Test Resource Version 2","Type":"Url","ExternalUrl":"http://data.glasgow.gov.uk","Metadata":{"key1":"value1-1009","key2":"value2-1009"}}'

####  Updates with a new version of a local resource to an existing resource in a dataset (file is hosted locally and must be POSTed)

*Metadata stored in a file* 

    node pub.js resources --cmd update --org '39086d5d-e92c-4e9f-92cb-a8b15c80dbd6' --ds 'd8795050-bafb-40a0-8e8a-32e6ef860e27' --res '98d0a26f-5b0f-473f-9635-11d8ce3e308e' --xjson '../test/test.json' --upload '../test/test.csv'

*Metadata passed directly*

    node pub.js resources --cmd update --org '39086d5d-e92c-4e9f-92cb-a8b15c80dbd6' --ds 'd8795050-bafb-40a0-8e8a-32e6ef860e27' --res '98d0a26f-5b0f-473f-9635-11d8ce3e308e' --json '{"CreationDate":"2015-06-24T06:24:22","Description":"A Test Resource.","License":"CREATIVE COMMONS ATTRIBUTION","OpennessRating":2,"Quality":2,"StandardName":"","StandardRating":0,"StandardVersion":"","Title":"API Test Resource Version 102","Type":"csv","Metadata":{"key1":"value1","key2":"value2"}}' --upload '../test/test.csv'

#### Updates the metadata of an existing resource version (changes the current version metadata)
.

#### Updates the metadata and resource of an existing resource version (changes the current version metadata and file)



#### Update a specified key in the metadata with the specified value
    node pub.js resources --cmd update --org '39086d5d-e92c-4e9f-92cb-a8b15c80dbd6' --ds 'd8795050-bafb-40a0-8e8a-32e6ef860e27' --res '923a4566-f58a-46c6-a752-510898baa392' --key 'License' --val 'CREATIVE COMMONS ATTRIBUTION'

openglasgow.samples.api.publisher.node

*This differs from openglasgow.samples.api.connector.node repository - that was how to send single files to the platform. This app will allow you to work with bulk data.*
