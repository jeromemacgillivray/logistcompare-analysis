const Repository = require('./repository.js')('warehousetype.model');

class ServiceRepository {
    static all(callback) {
        Repository.find({}, callback);
    }
    static find(query, callback) {
        Repository.find(query, callback);
    }

    static save(user, callback) {
        new Repository(user).save(callback);
    }
    static update(user, callback) {
        Repository.update({}, callback);
    }

}

module.exports = ServiceRepository;