import AppConfig from '../appConfig';

class AppDataStore {
  
  constructor(d2) {
    if (!d2) throw "D2 is required to create AppDataStore";
    this.d2 = d2;
  }


  addUpload(dataYear, type, filename, importLog) {
    return new Promise(function(resolve, reject) {
      var api = d2.Api.getApi();
      var upload = {
        dataYear: dataYear,
        fileType: type,
        filename: filename,
        uploaded_at: new Date().toISOString(),
        user: {
          id: d2.currentUser.id,
          name: d2.currentUser.name,
          username: d2.currentUser.username
        },
        logId: importLog.id
      }
      var uploadUrl = 'dataStore/' + AppConfig.dataStore.data + "/" + type;
      api.get(uploadUrl).then((data) => {
        if (!data.uploads) data.uploads = [];
        data.uploads.unshift(upload);
        api.update(uploadUrl, data).then(resolve);
      }).catch((err) => {
        var data = {uploads: [upload]};
        api.post(uploadUrl, data).then(resolve);
      })
    });
  }

  getUploadsForType(type) {
    return new Promise(function(resolve, reject) {
      var api = d2.Api.getApi();
      var uploadUrl = 'dataStore/' + AppConfig.dataStore.data + "/" + type;
      api.get(uploadUrl).then((data) => {
        resolve(data.uploads)  
      }).catch((err) => {
        resolve([]);
      });
    });
  }

}

export default AppDataStore;