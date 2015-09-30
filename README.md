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
- node pub.js datasets --cmd list --org 'de0f1bfc-ed16-429a-b03c-6a63a178efb1'

### Resources
List all files associated with the specified organisation and dataset.
- node pub.js resources --cmd list --org 'de0f1bfc-ed16-429a-b03c-6a63a178efb1' --ds 'df590b18-c1f4-4d1f-ba0b-99266b91ea7c'

openglasgow.samples.api.publisher.node

*This differs from openglasgow.samples.api.connector.node repository - that was how to send single files to the platform. This app will allow you to work with bulk data.*
