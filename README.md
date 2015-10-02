# openglasgow.samples.api.publisher.node
Sample App to publish data to the Open Data Platform.

Run "node pub" in the bin folder.

The specific commands are as follows:
- node pub.js <module> <command> [options]

##Commands
This is a non-exhaustive list of commands and options. 

### Organisations
List all organisations for the logged on user.
- node pub.js organisations --cmd list

### Datasets
List all datasets associated with the specified organisation.
- node pub.js datasets --cmd list --org '39086d5d-e92c-4e9f-92cb-a8b15c80dbd6'

### Resources
List all files associated with the specified organisation and dataset.
- node pub.js resources --cmd list --org '39086d5d-e92c-4e9f-92cb-a8b15c80dbd6' --ds 'd8795050-bafb-40a0-8e8a-32e6ef860e27'

Update a resource with new metadata.
- node pub.js resources --cmd update --org '39086d5d-e92c-4e9f-92cb-a8b15c80dbd6' --ds 'd8795050-bafb-40a0-8e8a-32e6ef860e27' --res '923a4566-f58a-46c6-a752-510898baa392' --xjson '../test/testexternal.json'

openglasgow.samples.api.publisher.node

*This differs from openglasgow.samples.api.connector.node repository - that was how to send single files to the platform. This app will allow you to work with bulk data.*
