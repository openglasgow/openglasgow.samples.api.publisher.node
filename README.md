# openglasgow.samples.api.publisher.node
Sample App to publish data to the Open Data Platform.

Run "node pub" in the bin folder.

The specific commands are as follows:
- node pub.js <module> <command> [options]

##Commands
This is a non-exhaustive list of commands and options. 

### Bulk
Provides an interface for bulk operations on the platform.

To make these calls you need to obtain an Authorisation Token for an account with the privilages to make the call. This kind of token is required because these calls run under the identity of a user account (the other accounts using a genetic service account).
The best place to get this token for the moment is via the [API management portal](https://developers.open.glasgow.gov.uk/docs/services/560c3c9c8b3a030ca00934d1/operations/560e97348b3a0316cc8ba53b/console) using a user@open.glasgow.gov.uk account.


#### Update all datasets on the platform matching the input key/value pair with a new specified value
    node pub.js bulk --cmd changeDatasetsKeyValue --key 'License' --val 'cc-by' --newval 'apache' --commit true
    
**Note that in the command above, if you do not specify the --commit true flag your changes will not be saved - useful for seeing what will be changed.**
    
#### Update all resources in the specified dataset matching the input key/value pair with a new specified value
    node pub.js bulk --cmd changeDatasetResourcesKeyValue --ds 'd8795050-bafb-40a0-8e8a-32e6ef860e27' --key 'License' --val 'cc-by' --newval 'apache'
    
#### Update all resources on the platform matching the input key/value pair with a new specified value
    node pub.js bulk --cmd changeResourcesKeyValue --key 'License' --val 'cc-by' --newval 'apache'    
    
### Organisations
An editor is part of an organisation, which contains datasets.

#### List all organisations for the logged on user:
    node pub.js organisations --cmd list

### Datasets
An organisation contains datasets, which contains resources (files).

#### List all datasets associated with the specified organisation:
    node pub.js datasets --cmd list --org '39086d5d-e92c-4e9f-92cb-a8b15c80dbd6'        

#### List all datasets with the specified key/value pair:
    node pub.js datasets --cmd query --key 'License' --val 'cc-by'

#### Get the metadata of a dataset:
    node pub.js datasets --cmd read --org '39086d5d-e92c-4e9f-92cb-a8b15c80dbd6' --ds 'd8795050-bafb-40a0-8e8a-32e6ef860e27'
    
#### Update the metadata for a dataset:
To make these calls you need to obtain an Authorisation Token for an account with the privilages to make the call. This kind of token is required because these calls run under the identity of a user account (the other accounts using a genetic service account).
The best place to get this token for the moment is via the [API management portal](https://developers.open.glasgow.gov.uk/docs/services/560c3c9c8b3a030ca00934d1/operations/560e97348b3a0316cc8ba53b/console) using a user@open.glasgow.gov.uk account.

Note that you cannot change a file from local to remote or vice versa with this update - you can only change informational metadata.
 
*Metadata stored in a file* 

    node pub.js datasets --cmd update --org '39086d5d-e92c-4e9f-92cb-a8b15c80dbd6' --ds 'd8795050-bafb-40a0-8e8a-32e6ef860e27' --xjson '../test/test_dataset.json'

*Metadata passed directly*

    node pub.js datasets --cmd update --org '39086d5d-e92c-4e9f-92cb-a8b15c80dbd6' --ds 'd8795050-bafb-40a0-8e8a-32e6ef860e27' --json '{ "Title": "Sed qui numquam ", "Description": "Laudantium ipsum quibusdam iure odit saepe est nesciunt.", "MaintainerName": "Johnathon Heller", "MaintainerContact": "hassan.mraz@oreilly.ca", "License": "http://muller.us/wintheiser/konopelskitremblay.html", "OpennessRating": 1, "Quality": 2, "Tags": "a odit laboriosam dolore explicabo", "PublishedOnBehalfOf": "Berniece Mosciski", "UsageGuidance": "Sint minus cum qui dolorem quo. Et temporibus possimus ", "Category": "impedit", "Theme": "ut", "StandardRating": 2, "StandardName": "Sit qui perspiciatis deserunt", "StandardVersion": "3.3.82", "NeedsApproval": true, "Metadata": { "key1": "value1", "key2": "value2" } }'

#### Update a specified key in the metadata with the specified value in a Dataset
To make these calls you need to obtain an Authorisation Token for an account with the privilages to make the call. This kind of token is required because these calls run under the identity of a user account (the other accounts using a genetic service account).
The best place to get this token for the moment is via the [API management portal](https://developers.open.glasgow.gov.uk/docs/services/560c3c9c8b3a030ca00934d1/operations/560e97348b3a0316cc8ba53b/console) using a user@open.glasgow.gov.uk account.

Note that you cannot change a file from local to remote or vice versa with this update - you can only change informational metadata.

    node pub.js datasets --cmd update --org '39086d5d-e92c-4e9f-92cb-a8b15c80dbd6' --ds 'd8795050-bafb-40a0-8e8a-32e6ef860e27' --key 'License' --val 'cc-by'
    
### Resources
An dataset contains resources (files) and there can be multiple versions of each resource. A resource can be a remote Url or a local file.

#### List all files associated with the specified organisation and dataset:
    node pub.js resources --cmd list --org '39086d5d-e92c-4e9f-92cb-a8b15c80dbd6' --ds 'd8795050-bafb-40a0-8e8a-32e6ef860e27'

#### Get the metadata of a resource (but do not download associated files):
    node pub.js resources --cmd read --org '39086d5d-e92c-4e9f-92cb-a8b15c80dbd6' --ds 'd8795050-bafb-40a0-8e8a-32e6ef860e27' --res '923a4566-f58a-46c6-a752-510898baa392'

#### Adds a new remote resource to a dataset (file is hosted remotely)

*Metadata stored in a file* 

    node pub.js resources --cmd create --org '39086d5d-e92c-4e9f-92cb-a8b15c80dbd6' --ds 'd8795050-bafb-40a0-8e8a-32e6ef860e27' --xjson '../test/testexternal.json'

*Metadata passed directly*

    node pub.js resources --cmd create --org '39086d5d-e92c-4e9f-92cb-a8b15c80dbd6' --ds 'd8795050-bafb-40a0-8e8a-32e6ef860e27' --json '{"CreationDate":"2015-06-19T06:24:22","Description":"Test Resource.","License":"cc-by","OpennessRating":2,"Quality":2,"StandardName":"","StandardRating":0,"StandardVersion":"","Title":"API Test Resource Version 2","Type":"Url","ExternalUrl":"http://data.glasgow.gov.uk","Metadata":{"key1":"value1-1009","key2":"value2-1009"}}'


#### Adds a new local resource to a dataset (file is hosted locally and must be POSTed)

*Metadata stored in a file* 

    node pub.js resources --cmd create --org '39086d5d-e92c-4e9f-92cb-a8b15c80dbd6' --ds 'd8795050-bafb-40a0-8e8a-32e6ef860e27' --xjson '../test/test.json' --upload '../test/test.csv'

*Metadata passed directly*

    node pub.js resources --cmd create --org '39086d5d-e92c-4e9f-92cb-a8b15c80dbd6' --ds 'd8795050-bafb-40a0-8e8a-32e6ef860e27' --json '{"CreationDate":"2015-06-24T06:24:22","Description":"A Test Resource.","License":"cc-by","OpennessRating":2,"Quality":2,"StandardName":"","StandardRating":0,"StandardVersion":"","Title":"API Test Resource Version 102","Type":"csv","Metadata":{"key1":"value1","key2":"value2"}}' --upload '../test/test.csv'

#### Updates with a new version of a remote resource to an existing resource in a dataset (file is hosted remotely):

*Metadata stored in a file* 

    node pub.js resources --cmd update --org '39086d5d-e92c-4e9f-92cb-a8b15c80dbd6' --ds 'd8795050-bafb-40a0-8e8a-32e6ef860e27' --res '923a4566-f58a-46c6-a752-510898baa392' --xjson '../test/testexternal.json'

*Metadata passed directly*

    node pub.js resources --cmd update --org '39086d5d-e92c-4e9f-92cb-a8b15c80dbd6' --ds 'd8795050-bafb-40a0-8e8a-32e6ef860e27' --res '923a4566-f58a-46c6-a752-510898baa392' --json '{"CreationDate":"2015-06-19T06:24:22","Description":"Test Resource.","License":"cc-by","OpennessRating":2,"Quality":2,"StandardName":"","StandardRating":0,"StandardVersion":"","Title":"API Test Resource Version 2","Type":"Url","ExternalUrl":"http://data.glasgow.gov.uk","Metadata":{"key1":"value1-1009","key2":"value2-1009"}}'

####  Updates with a new version of a local resource to an existing resource in a dataset (file is hosted locally and must be POSTed)

*Metadata stored in a file* 

    node pub.js resources --cmd update --org '39086d5d-e92c-4e9f-92cb-a8b15c80dbd6' --ds 'd8795050-bafb-40a0-8e8a-32e6ef860e27' --res '923a4566-f58a-46c6-a752-510898baa392' --xjson '../test/test.json' --upload '../test/test.csv'

*Metadata passed directly*

    node pub.js resources --cmd update --org '39086d5d-e92c-4e9f-92cb-a8b15c80dbd6' --ds 'd8795050-bafb-40a0-8e8a-32e6ef860e27' --res '923a4566-f58a-46c6-a752-510898baa392' --json '{"CreationDate":"2015-06-24T06:24:22","Description":"A Test Resource.","License":"cc-by","OpennessRating":2,"Quality":2,"StandardName":"","StandardRating":0,"StandardVersion":"","Title":"API Test Resource Version 102","Type":"csv","Metadata":{"key1":"value1","key2":"value2"}}' --upload '../test/test.csv'

#### Changes the metadata of an existing resource version (changes the current version metadata)
To make these calls you need to obtain an Authorisation Token for an account with the privilages to make the call. This kind of token is required because these calls run under the identity of a user account (the other accounts using a genetic service account).
The best place to get this token for the moment is via the [API management portal](https://developers.open.glasgow.gov.uk/docs/services/560c3c9c8b3a030ca00934d1/operations/560e97348b3a0316cc8ba53b/console) using a user@open.glasgow.gov.uk account.

Note that you cannot change a file from local to remote or vice versa with this update - you can only change informational metadata.
 
*Metadata stored in a file* 

    node pub.js resources --cmd update --org '39086d5d-e92c-4e9f-92cb-a8b15c80dbd6' --ds 'd8795050-bafb-40a0-8e8a-32e6ef860e27' --res '923a4566-f58a-46c6-a752-510898baa392' --ver 'ea3f7044-001b-44f8-82ac-fce465bb15d0' --xjson '../test/test.json'

*Metadata passed directly*

    node pub.js resources --cmd update --org '39086d5d-e92c-4e9f-92cb-a8b15c80dbd6' --ds 'd8795050-bafb-40a0-8e8a-32e6ef860e27' --res '923a4566-f58a-46c6-a752-510898baa392' --ver 'ea3f7044-001b-44f8-82ac-fce465bb15d0' --json '{"CreationDate":"2015-06-24T06:24:22","Description":"A Test Resource.","License":"cc-by","OpennessRating":2,"Quality":2,"StandardName":"","StandardRating":0,"StandardVersion":"","Title":"API Test Resource Version 222","Type":"csv","Metadata":{"key1":"value1","key2":"value2"}}'


#### Changes the metadata and resource of an existing resource version (changes the current version metadata and file)

*Metadata stored in a file* 

    node pub.js resources --cmd update --org '39086d5d-e92c-4e9f-92cb-a8b15c80dbd6' --ds 'd8795050-bafb-40a0-8e8a-32e6ef860e27' --res '923a4566-f58a-46c6-a752-510898baa392' --ver 'ea3f7044-001b-44f8-82ac-fce465bb15d0' --xjson '../test/test.json' --upload '../test/test.csv'

*Metadata passed directly*

    node pub.js resources --cmd update --org '39086d5d-e92c-4e9f-92cb-a8b15c80dbd6' --ds 'd8795050-bafb-40a0-8e8a-32e6ef860e27' --res '923a4566-f58a-46c6-a752-510898baa392' --ver 'ea3f7044-001b-44f8-82ac-fce465bb15d0' --json '{"CreationDate":"2015-06-24T06:24:22","Description":"A Test Resource.","License":"cc-by","OpennessRating":2,"Quality":2,"StandardName":"","StandardRating":0,"StandardVersion":"","Title":"API Test Resource Version 102","Type":"csv","Metadata":{"key1":"value1","key2":"value2"}}' --upload '../test/test.csv'

#### Changes a specified key in the metadata with the specified value of an existing resource version

    node pub.js resources --cmd update --org '39086d5d-e92c-4e9f-92cb-a8b15c80dbd6' --ds 'd8795050-bafb-40a0-8e8a-32e6ef860e27' --res '923a4566-f58a-46c6-a752-510898baa392' --ver 'ea3f7044-001b-44f8-82ac-fce465bb15d0' --key 'License' --val 'cc-by'

#### Update a specified key in the metadata with the specified value (creates a new version)

    node pub.js resources --cmd update --org '39086d5d-e92c-4e9f-92cb-a8b15c80dbd6' --ds 'd8795050-bafb-40a0-8e8a-32e6ef860e27' --res '923a4566-f58a-46c6-a752-510898baa392' --key 'License' --val 'cc-by'

openglasgow.samples.api.publisher.node

*This differs from openglasgow.samples.api.connector.node repository - that was how to send single files to the platform. This app will allow you to work with bulk data.*
